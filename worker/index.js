/**
 * Dateen worker: serves the static site (ASSETS binding) AND provides
 * "Log in with Lark" + an email allow-list for the /admin CMS.
 *
 * Editors sign in with their own Lark account. Only emails on the allow-list
 * get in. On success the worker hands Sveltia/Decap CMS a shared GitHub token
 * (a "service" token) that it uses to commit. Editors never touch GitHub.
 *
 * Secrets to set in Cloudflare -> this Worker -> Settings -> Variables and Secrets:
 *   LARK_APP_ID          Lark app's App ID        (from the Lark developer console)
 *   LARK_APP_SECRET      Lark app's App Secret    (Secret)
 *   CMS_ALLOWED_EMAILS   comma-separated allow-list, e.g. "ben@x.com, cs@x.com"
 *   CMS_GIT_TOKEN        GitHub PAT (fine-grained, Contents: Read&Write on the repo) (Secret)
 *
 * The Lark app also needs, in its console:
 *   - Security settings -> Redirect URL:  https://dateen.my/callback
 *   - API permissions:  contact:user.email:readonly
 */

const PROVIDER = "github"; // Sveltia's backend stays "github"; we hand it a GitHub token

// Lark (international / larksuite.com) OAuth 2.0 endpoints
const LARK_AUTHORIZE = "https://accounts.larksuite.com/open-apis/authen/v1/authorize";
const LARK_TOKEN = "https://open.larksuite.com/open-apis/authen/v2/oauth/token";
const LARK_USERINFO = "https://open.larksuite.com/open-apis/authen/v1/user_info";
const LARK_SCOPE = "contact:user.email:readonly";

const htmlHeaders = { "content-type": "text/html;charset=utf-8" };

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function shell(inner) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Dateen CMS</title>
<style>
  body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#1b1b1b;color:#eee;display:grid;place-items:center;min-height:100vh;text-align:center}
  .box{width:320px;max-width:88vw}
  .box h1{color:#e40420;font-size:24px;margin:0 0 6px}
  .box p{color:#aaa;font-size:14px;line-height:1.5;margin:0 0 8px}
  .err{color:#ff7a7a}
</style></head><body><div class="box">${inner}</div></body></html>`;
}

// Success: hand the GitHub token to the CMS window (Decap/Sveltia protocol)
function successPopup(token) {
  const message = `authorization:${PROVIDER}:success:${JSON.stringify({ provider: PROVIDER, token })}`;
  const safe = JSON.stringify(message);
  return `<!doctype html><html><head><meta charset="utf-8"></head><body><script>
(function(){
  function receive(e){ if(window.opener){ window.opener.postMessage(${safe}, e.origin); } window.removeEventListener("message", receive, false); }
  window.addEventListener("message", receive, false);
  if(window.opener){ window.opener.postMessage("authorizing:${PROVIDER}", "*"); }
})();
</script><p style="font-family:system-ui;text-align:center;margin-top:48px;color:#555">Signing in…</p></body></html>`;
}

// Error: show the reason AND tell the CMS window to stop waiting
function errorPopup(msg) {
  const message = `authorization:${PROVIDER}:error:${JSON.stringify({ provider: PROVIDER, error: String(msg) })}`;
  const safe = JSON.stringify(message);
  return shell(`<h1>Dateen CMS</h1><p class="err">${esc(msg)}</p><p>You can close this window and try again.</p>
<script>try{ if(window.opener){ window.opener.postMessage(${safe}, "*"); } }catch(e){}</script>`);
}

async function handleAuth(url, env) {
  if (!env.LARK_APP_ID) {
    return new Response(errorPopup("Server not set up yet (missing LARK_APP_ID)."), { headers: htmlHeaders });
  }
  const state = crypto.randomUUID().replace(/-/g, "");
  const a = new URL(LARK_AUTHORIZE);
  a.searchParams.set("client_id", env.LARK_APP_ID);
  a.searchParams.set("redirect_uri", `${url.origin}/callback`);
  a.searchParams.set("scope", LARK_SCOPE);
  a.searchParams.set("state", state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: a.toString(),
      "Set-Cookie": `lstate=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
    },
  });
}

async function handleCallback(request, url, env) {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = request.headers.get("Cookie") || "";
  const saved = (cookie.match(/(?:^|;\s*)lstate=([^;]+)/) || [])[1];
  if (!code || !state || !saved || saved !== state) {
    return new Response(errorPopup("Login session expired. Please try again."), { headers: htmlHeaders });
  }

  // 1. exchange the code for a Lark user_access_token
  let tok;
  try {
    const r = await fetch(LARK_TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: env.LARK_APP_ID,
        client_secret: env.LARK_APP_SECRET,
        code,
        redirect_uri: `${url.origin}/callback`,
      }),
    });
    tok = await r.json();
  } catch (e) {
    return new Response(errorPopup("Could not reach Lark (token)."), { headers: htmlHeaders });
  }
  const accessToken = tok && tok.access_token;
  if (!accessToken) {
    return new Response(errorPopup("Lark login failed: " + ((tok && (tok.error_description || tok.error)) || "no token")), { headers: htmlHeaders });
  }

  // 2. read the user's email
  let info;
  try {
    const r = await fetch(LARK_USERINFO, { headers: { Authorization: "Bearer " + accessToken } });
    info = await r.json();
  } catch (e) {
    return new Response(errorPopup("Could not read your Lark profile."), { headers: htmlHeaders });
  }
  const data = (info && info.data) || {};
  const email = String(data.email || data.enterprise_email || "").trim().toLowerCase();
  if (!email) {
    return new Response(errorPopup("No email found on your Lark account. Ask the admin to enable the email permission on the app."), { headers: htmlHeaders });
  }

  // 3. check the allow-list (fail closed if not configured)
  const allowed = String(env.CMS_ALLOWED_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!allowed.length) {
    return new Response(errorPopup("Allow-list not set up yet (CMS_ALLOWED_EMAILS)."), { headers: htmlHeaders });
  }
  if (!allowed.includes(email)) {
    return new Response(errorPopup("Access denied for " + email + ". You are not on the allow-list."), { headers: htmlHeaders });
  }
  if (!env.CMS_GIT_TOKEN) {
    return new Response(errorPopup("Server not set up yet (missing CMS_GIT_TOKEN)."), { headers: htmlHeaders });
  }

  // 4. success -> hand the CMS the shared GitHub service token
  return new Response(successPopup(env.CMS_GIT_TOKEN), {
    headers: { ...htmlHeaders, "Set-Cookie": "lstate=; Path=/; Max-Age=0" },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/auth") return handleAuth(url, env);
    if (url.pathname === "/callback") return handleCallback(request, url, env);
    // everything else = the static website
    return env.ASSETS.fetch(request);
  },
};
