# Dateen website — deploy + self-edit guide

This folder is the **CMS version** of the Dateen site: built with Eleventy (11ty) and
editable through **Sveltia CMS** (a free visual editor) hosted on GitHub + Cloudflare Pages.

- Edit content yourself at **https://dateen.my/admin** (photos, banners, prices, clients, phone, gallery)
- Save in the editor → GitHub → Cloudflare rebuilds → **live in ~1 minute**
- 100% free (GitHub + Cloudflare Pages + Sveltia CMS)

The folder structure:

```
dateen-cms/
  src/                 your site
    _data/             the editable content (JSON) the CMS writes to
      site.json        phone, email, address, hours, banners, stats
      prices.json      all headline prices
      clients.json     trusted-by + client wall
      gallery.json     catering gallery photos
    _includes/         (shared partials, if any)
    *.njk              the 6 pages (templates)
    photos/ brand/ Gesta/ *.mp4 *.pdf   assets
    admin/             the CMS  (index.html + config.yml)
  .eleventy.js  package.json             build config
```

---

## STEP 1 — Put this folder on GitHub

Open a terminal **inside this `dateen-cms` folder** and run:

```bash
git init
git add .
git commit -m "Dateen website + CMS"
git branch -M main
```

Create an empty repo on GitHub named **dateen-website** (github.com → New repository, keep it
empty — no README). Then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/dateen-website.git
git push -u origin main
```

---

## STEP 2 — Move dateen.my DNS to Cloudflare

1. Cloudflare dashboard → **Add a site** → type `dateen.my` → Free plan.
2. Cloudflare shows you **2 nameservers**. Copy them.
3. Go to wherever you bought dateen.my → change its **nameservers** to those two.
4. Wait for Cloudflare to say **Active** (can take minutes to a few hours).

---

## STEP 3 — Connect the repo to Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Pick the `dateen-website` repo.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** `_site`
4. **Save and Deploy.** You get a `*.pages.dev` URL — check the site works there.
5. **Custom domains** tab → add `dateen.my` (and `www.dateen.my`) → one click since DNS is on Cloudflare.

Every time content is saved (by you via /admin, or by a `git push`), Cloudflare rebuilds automatically.

---

## STEP 4 — Turn on the editor login (/admin)

The editor needs to log in with GitHub. This needs a tiny free auth helper (a Cloudflare Worker).

**4a. Create a GitHub OAuth App**
- GitHub → Settings → Developer settings → **OAuth Apps** → **New OAuth App**
- Application name: `Dateen CMS`
- Homepage URL: `https://dateen.my`
- Authorization callback URL: `https://dateen-cms-auth.YOUR-SUBDOMAIN.workers.dev/callback`
  (you'll get the exact worker URL in 4b — come back and paste it here)
- Register → copy the **Client ID**, then **Generate a client secret** and copy it.

**4b. Deploy the auth Worker**
- Easiest: open **https://github.com/sveltia/sveltia-cms-auth** and click its
  **"Deploy to Cloudflare"** button → it creates a Worker in your Cloudflare account.
- In the new Worker → **Settings → Variables**, add:
  - `GITHUB_CLIENT_ID` = (from 4a)
  - `GITHUB_CLIENT_SECRET` = (from 4a)
  - `ALLOWED_DOMAINS` = `dateen.my`
- Copy the Worker's URL (e.g. `https://dateen-cms-auth.xxxx.workers.dev`).
- Go back to the GitHub OAuth App (4a) and make sure the callback URL uses that exact Worker URL + `/callback`.

**4c. Point the CMS at the Worker**
- Edit `src/admin/config.yml` (in the repo):
  - `repo:` → `YOUR-USERNAME/dateen-website`
  - `base_url:` → your Worker URL (e.g. `https://dateen-cms-auth.xxxx.workers.dev`)
- Commit/push. After redeploy, open **https://dateen.my/admin** → **Login with GitHub**.

> Simpler alternative (no Worker): use **https://pagescms.org** — authorize its GitHub app,
> point it at the repo, and edit there instead. Skip Step 4 entirely if you use Pages CMS.

---

## What you can edit in /admin

| Section | What |
|---|---|
| **Site Settings → Contact & Banners** | phone / WhatsApp / email / address / hours / Instagram / **all 5 page banners** / homepage stats |
| **Prices** | bento, value meal, vegetarian, cold brew, bungkus reseller, all catering packages |
| **Client List** | trusted-by strip + the full client wall |
| **Catering Gallery** | the 8 gallery photos (image + caption + tag) |

To change a banner: Site Settings → Contact & Banners → click the banner image → upload a new one → **Save**.

---

## Editing locally (optional, for a developer)

```bash
npm install
npm run dev        # preview at http://localhost:8080
npm run build      # outputs the static site to _site/
```

---

## Not yet in the CMS (edit in code, or ask to add later)

- The long per-dish menu lists (individual dish names + small prices on the Bento page)
- The homepage hero **video**, the two "In Motion" reel videos, the PDF menu
- Section body text / headings

These can be added as editable fields in a later pass — the pattern is the same
(extract to a `_data` file + add a field in `admin/config.yml`).
