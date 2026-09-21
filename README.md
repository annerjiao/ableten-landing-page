# ableten-landing-page

Static landing site for [ableten.xyz](https://ableten.xyz/) — deployed via **GitHub Pages**.

## Deploy

Push to `main`. GitHub Pages serves the repo root (custom domain in `CNAME`).

## Figma sync (Option A)

Edit marketing copy and OG image in Figma → sync locally → preview → push when ready.

**Setup (one time):** [figma/SETUP.md](./figma/SETUP.md)  
**Edit homepage (repeat):** [figma/HOMEPAGE-EDIT.md](./figma/HOMEPAGE-EDIT.md)  
**Import site design into Figma:** [figma/DESIGN-PAGE.md](./figma/DESIGN-PAGE.md)

## Preview locally

Site files are in **`landing-page/`** (this folder). GitHub Pages deploys this folder as the site root.

From **either** directory:

```bash
# From repo root (ableten-landing-page/)
npm run dev

# Or from landing-page/
cd landing-page
npm run dev
```

Open **http://localhost:8080/trip-planner/** (hard-refresh with Cmd+Shift+R if you were redirected before).

Alternate port if 8080 is busy: `npm run preview:3456` → http://localhost:3456/

```bash
npm install
cp .env.example .env          # add FIGMA_PAT
npm run figma:bootstrap       # generate plugin from HTML
# Run plugin in Figma — see figma/PLUGIN.md
npm run figma:discover          # after creating Figma file
npm run figma:sync              # pull into index.html + og-image.png
npm run preview                 # http://localhost:8080
git diff && git push origin main
```

## SEO / HTTPS

Canonical origin: **https://ableten.xyz/**

See **[docs/seo-setup.md](./docs/seo-setup.md)**.

## Pages

| File | URL | Bucket |
|------|-----|--------|
| `index.html` | `/` | Product (overview) |
| `product/index.html` | `/product/` | Product hub |
| `demo.html` | `/demo.html` | Product |
| `use-cases/index.html` | `/use-cases/` | Use cases hub |
| `trip-planner/index.html` | `/trip-planner/` | Use cases |
| `learn/index.html` | `/learn/` | Learn hub |
| `source-library/index.html` | `/source-library/` | Learn |
| `company/index.html` | `/company/` | Company hub |
| `support.html` | `/support.html` | Company |
| `privacy-policy.html` | `/privacy-policy.html` | Company |
