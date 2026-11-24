/**
 * Dateen worker: serves the static site (via the ASSETS binding) AND handles
 * the GitHub OAuth handshake for the /admin CMS (Sveltia/Decap compatible).
 *
 * Secrets required (set in Cloudflare → this Worker → Settings → Variables):
 *   GITHUB_CLIENT_ID      (from your GitHub OAuth App)
 *   GITHUB_CLIENT_SECRET  (from your GitHub OAuth App)
 *   ALLOWED_DOMAINS       e.g. "dateen.my,www.dateen.my,dateen.bjm-ng.workers.dev"
 */

const PROVIDER = "github";

const htmlHeaders = { "content-type": "text/html;charset=utf-8" };

function domainAllowed(domain, env) {
  const list = (env.ALLOWED_DOMAINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!list.length) return true;
  return list.some((p) => {
    const re = new RegExp(
      "^" + p.replace(/[.]/g, "\\.").replace(/\*/g, "[^.]+") + "$"
    );
    return re.test(domain);
  });
}

// Popup HTML that posts the result back to the CMS window (Decap/Sveltia protocol)
function postMessageHTML(status, payload) {
  const message = `authorization:${PROVIDER}:${status}:${JSON.stringify(payload)}`;
  const safe = JSON.stringify(message); // safe string literal for the script
  return `<!doctype html><html><head><meta charset="utf-8"></head><body>
<script>
(function () {
  function receive(e) {
    window.opener && window.opener.postMessage(${safe}, e.origin);
    window.removeEventListener("message", receive, false);
  }
  window.addEventListener("message", receive, false);
  window.opener && window.opener.postMessage("authorizing:${PROVIDER}", "*");
})();
</script>
</body></html>`;
}

async function handleAuth(url, env) {
  const clientId = env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return new Response(
      postMessageHTML("error", { provider: PROVIDER, error: "Server not configured (missing GITHUB_CLIENT_ID)" }),
      { headers: htmlHeaders }
    );
  }
  const domain = url.searchParams.get("site_id") || "";
  if (!domainAllowed(domain, env)) {
    return new Response(
      postMessageHTML("error", { provider: PROVIDER, error: "Domain not allowed: " + domain }),
      { headers: htmlHeaders }
    );
  }
  const csrf = crypto.randomUUID().replace(/-/g, "");
  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", `${url.origin}/callback`);
  authUrl.searchParams.set("scope", url.searchParams.get("scope") || "repo,user");
  authUrl.searchParams.set("state", csrf);
  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl.toString(),
      "Set-Cookie": `csrf=${csrf}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
    },
  });
}

async function handleCallback(request, url, env) {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = request.headers.get("Cookie") || "";
  const saved = (cookie.match(/(?:^|;\s*)csrf=([^;]+)/) || [])[1];
  if (!code || !state || !saved || saved !== state) {
    return new Response(
      postMessageHTML("error", { provider: PROVIDER, error: "CSRF validation failed" }),
      { headers: htmlHeaders }
    );
  }
  let data;
  try {
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": "dateen-cms-auth" },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    data = await res.json();
  } catch (e) {
    data = { error: "Token request failed" };
  }
  if (!data || data.error || !data.access_token) {
    return new Response(
      postMessageHTML("error", { provider: PROVIDER, error: (data && data.error) || "No access token" }),
      { headers: htmlHeaders }
    );
  }
  return new Response(
    postMessageHTML("success", { provider: PROVIDER, token: data.access_token }),
    { headers: { ...htmlHeaders, "Set-Cookie": "csrf=; Path=/; Max-Age=0" } }
  );
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
