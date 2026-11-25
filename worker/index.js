/**
 * Dateen self-hosted CMS worker (no GitHub for content).
 *
 *  - Serves the static site (ASSETS) with editable bits filled from KV on the fly.
 *  - /admin  : custom CMS, login with Lark SSO + email allow-list.
 *  - Content : Cloudflare KV (binding CONTENT). Images: KV too, served at /media/*.
 *
 * Secrets / vars to set in Cloudflare -> this Worker -> Settings -> Variables and Secrets:
 *   LARK_APP_ID          Lark app App ID
 *   LARK_APP_SECRET      Lark app App Secret            (Secret)
 *   CMS_ALLOWED_EMAILS   comma-separated allow-list of Lark emails
 *   SESSION_SECRET       any long random string         (Secret)
 * KV namespace binding:  CONTENT
 * Lark app console:  redirect URL https://dateen.my/callback ; permission contact:user.email:readonly
 */

import { DEFAULT_CONTENT, tokenMap } from "./default-content.js";
import { ADMIN_HTML } from "./admin-html.js";

const LARK_AUTHORIZE = "https://accounts.larksuite.com/open-apis/authen/v1/authorize";
const LARK_TOKEN = "https://open.larksuite.com/open-apis/authen/v2/oauth/token";
const LARK_USERINFO = "https://open.larksuite.com/open-apis/authen/v1/user_info";
const LARK_SCOPE = "contact:user.email:readonly";

const SESSION_COOKIE = "dcms_session";
const SESSION_TTL = 60 * 60 * 12; // 12 hours
const htmlHeaders = { "content-type": "text/html;charset=utf-8" };

// ---------- small helpers ----------
const te = new TextEncoder();
function b64url(bytes) {
  let s = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlToStr(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return atob(s);
}
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function cookie(req, name) {
  const m = (req.headers.get("Cookie") || "").match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return m ? m[1] : null;
}

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey("raw", te.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, te.encode(msg)));
}
async function makeSession(env, email) {
  const payload = `${email}|${Math.floor(Date.now() / 1000) + SESSION_TTL}`;
  const sig = b64url(await hmac(env.SESSION_SECRET || "", payload));
  return `${b64url(te.encode(payload))}.${sig}`;
}
async function verifySession(env, token) {
  if (!token || !token.includes(".")) return null;
  const [p, sig] = token.split(".");
  let payload;
  try { payload = b64urlToStr(p); } catch { return null; }
  const expect = b64url(await hmac(env.SESSION_SECRET || "", payload));
  if (expect !== sig) return null;
  const [email, exp] = payload.split("|");
  if (!exp || Number(exp) < Math.floor(Date.now() / 1000)) return null;
  return email;
}

// ---------- content ----------
async function getContent(env) {
  try {
    const c = await env.CONTENT.get("content", "json");
    if (c) return { ...DEFAULT_CONTENT, ...c };
  } catch (e) {}
  return DEFAULT_CONTENT;
}

async function getAccess(env) {
  try {
    const a = await env.CONTENT.get("access", "json");
    if (a && Array.isArray(a.allowedEmails)) return a;
  } catch (e) {}
  return { allowedEmails: [] };
}
async function allowedEmailSet(env) {
  const bootstrap = String(env.CMS_ALLOWED_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const kv = (await getAccess(env)).allowedEmails.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
  return new Set([...bootstrap, ...kv]);
}

function renderHTML(html, c) {
  const map = tokenMap(c);
  for (const k in map) html = html.split(k).join(map[k] == null ? "" : String(map[k]));
  const trusted = (c.clientsTrusted || []).map((x) => `<span>${esc(x)}</span>`).join("\n      ");
  const wall = (c.clientsWall || []).map((x) => `<div class="wall-cell">${esc(x)}</div>`).join("\n        ");
  const gallery = (c.gallery || []).map((g) =>
    `<div class="gal-cell" style="background-image:url('${esc(g.image)}');"><span class="cap">${esc(g.caption)} <i>${esc(g.tag)}</i></span></div>`
  ).join("\n        ");
  return html.split("@@clients_trusted@@").join(trusted)
             .split("@@clients_wall@@").join(wall)
             .split("@@gallery@@").join(gallery);
}

// ---------- Lark login ----------
function page(inner) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dateen CMS</title>
<style>body{margin:0;font-family:system-ui,sans-serif;background:#1b1b1b;color:#eee;display:grid;place-items:center;min-height:100vh;text-align:center}.box{width:320px;max-width:88vw}h1{color:#e40420;font-size:24px;margin:0 0 8px}p{color:#aaa;font-size:14px;line-height:1.5}.err{color:#ff7a7a}a.btn{display:inline-block;margin-top:14px;padding:11px 20px;background:#e40420;color:#fff;text-decoration:none;border-radius:8px;font-weight:600}</style>
</head><body><div class="box">${inner}</div></body></html>`;
}
async function handleAuth(url, env) {
  if (!env.LARK_APP_ID) return new Response(page(`<h1>Dateen CMS</h1><p class="err">Not set up yet (missing LARK_APP_ID).</p>`), { headers: htmlHeaders });
  const state = crypto.randomUUID().replace(/-/g, "");
  const a = new URL(LARK_AUTHORIZE);
  a.searchParams.set("client_id", env.LARK_APP_ID);
  a.searchParams.set("redirect_uri", `${url.origin}/callback`);
  a.searchParams.set("scope", LARK_SCOPE);
  a.searchParams.set("state", state);
  return new Response(null, { status: 302, headers: { Location: a.toString(), "Set-Cookie": `lstate=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600` } });
}
async function handleCallback(request, url, env) {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state || cookie(request, "lstate") !== state)
    return new Response(page(`<h1>Dateen CMS</h1><p class="err">Login session expired.</p><a class="btn" href="/admin">Try again</a>`), { headers: htmlHeaders });
  let tok;
  try {
    const r = await fetch(LARK_TOKEN, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ grant_type: "authorization_code", client_id: env.LARK_APP_ID, client_secret: env.LARK_APP_SECRET, code, redirect_uri: `${url.origin}/callback` }) });
    tok = await r.json();
  } catch (e) { tok = {}; }
  if (!tok.access_token)
    return new Response(page(`<h1>Dateen CMS</h1><p class="err">Lark login failed: ${esc(tok.error_description || tok.error || "no token")}</p><a class="btn" href="/admin">Try again</a>`), { headers: htmlHeaders });
  let info;
  try { info = await (await fetch(LARK_USERINFO, { headers: { Authorization: "Bearer " + tok.access_token } })).json(); } catch (e) { info = {}; }
  const email = String((info.data && (info.data.email || info.data.enterprise_email)) || "").trim().toLowerCase();
  if (!email) return new Response(page(`<h1>Dateen CMS</h1><p class="err">No email on your Lark account.</p>`), { headers: htmlHeaders });
  const allowed = await allowedEmailSet(env);
  if (!allowed.size || !allowed.has(email))
    return new Response(page(`<h1>Dateen CMS</h1><p class="err">Access denied for ${esc(email)}.<br>You are not on the allow-list.</p>`), { headers: htmlHeaders });
  const session = await makeSession(env, email);
  return new Response(null, { status: 302, headers: { Location: "/admin", "Set-Cookie": `${SESSION_COOKIE}=${session}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL}` } });
}

// ---------- admin API ----------
function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json;charset=utf-8", ...extra } });
}
async function handleApi(request, url, env, email) {
  const path = url.pathname;
  if (path === "/api/content" && request.method === "GET") {
    return json({ ok: true, email, content: await getContent(env) });
  }
  if (path === "/api/content" && request.method === "PUT") {
    let body;
    try { body = await request.json(); } catch { return json({ ok: false, error: "bad json" }, 400); }
    if (!body || typeof body !== "object") return json({ ok: false, error: "bad content" }, 400);
    await env.CONTENT.put("content", JSON.stringify(body));
    return json({ ok: true });
  }
  if (path === "/api/access" && request.method === "GET") {
    return json({ ok: true, access: await getAccess(env), bootstrap: String(env.CMS_ALLOWED_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean) });
  }
  if (path === "/api/access" && request.method === "PUT") {
    let body;
    try { body = await request.json(); } catch { return json({ ok: false, error: "bad json" }, 400); }
    const list = (Array.isArray(body.allowedEmails) ? body.allowedEmails : []).map((s) => String(s).trim()).filter(Boolean);
    await env.CONTENT.put("access", JSON.stringify({ allowedEmails: list }));
    return json({ ok: true });
  }
  if (path === "/api/media" && request.method === "POST") {
    const ct = request.headers.get("content-type") || "application/octet-stream";
    const name = (url.searchParams.get("name") || "upload").toLowerCase().replace(/[^a-z0-9._-]/g, "-").slice(-60);
    const key = `media:${Date.now().toString(36)}-${name}`;
    const buf = await request.arrayBuffer();
    if (buf.byteLength > 8 * 1024 * 1024) return json({ ok: false, error: "File too large (max 8MB). Please upload a smaller/optimized image." }, 413);
    await env.CONTENT.put(key, buf, { metadata: { ct } });
    return json({ ok: true, url: `/media/${key.slice("media:".length)}` });
  }
  return json({ ok: false, error: "not found" }, 404);
}
async function serveMedia(name, env) {
  const key = "media:" + name;
  const { value, metadata } = await env.CONTENT.getWithMetadata(key, "arrayBuffer");
  if (!value) return new Response("Not found", { status: 404 });
  return new Response(value, { headers: { "content-type": (metadata && metadata.ct) || "application/octet-stream", "Cache-Control": "public, max-age=86400" } });
}

// ---------- main ----------
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;

    if (p === "/auth") return handleAuth(url, env);
    if (p === "/callback") return handleCallback(request, url, env);

    if (p.startsWith("/media/")) return serveMedia(p.slice("/media/".length), env);

    // admin + api need a valid session
    if (p === "/admin" || p === "/admin/" || p.startsWith("/api/")) {
      const email = await verifySession(env, cookie(request, SESSION_COOKIE));
      if (!email) {
        if (p.startsWith("/api/")) return json({ ok: false, error: "unauthorized" }, 401);
        return Response.redirect(`${url.origin}/auth`, 302);
      }
      if (p.startsWith("/api/")) return handleApi(request, url, env, email);
      return new Response(ADMIN_HTML, { headers: { ...htmlHeaders, "Cache-Control": "no-store" } });
    }

    // everything else = the static site, with editable bits filled from KV
    const res = await env.ASSETS.fetch(request);
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("text/html")) {
      const html = renderHTML(await res.text(), await getContent(env));
      return new Response(html, { status: res.status, headers: { "content-type": "text/html;charset=utf-8", "Cache-Control": "public, max-age=60" } });
    }
    return res;
  },
};
