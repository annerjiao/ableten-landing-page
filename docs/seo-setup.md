# SEO & HTTPS setup — ableten.xyz

Canonical URL: **https://ableten.xyz/** (no `www`, always HTTPS)

## Current status (verified)

| URL | Expected | Issue |
|-----|----------|-------|
| `https://ableten.xyz/` | 200 | OK — indexed version |
| `http://ableten.xyz/` | 301 → HTTPS | **Was 200** — duplicate non-secure page |
| `https://www.ableten.xyz/` | 301 → HTTPS apex | OK |
| `http://www.ableten.xyz/` | 301 → HTTPS apex | Was 301 → HTTP apex first |

Hosting: **GitHub Pages** (`annerjiao.github.io` + `CNAME` → `ableten.xyz`)

## What’s already in the repo

- `link rel="canonical"` on every HTML page (HTTPS, apex domain)
- `sitemap.xml` — HTTPS-only URLs
- `robots.txt` — points to HTTPS sitemap
- `js/https-redirect.js` — client-side fallback if HTTP loads

## Required fix (GitHub — do this once)

The proper fix is a **server 301**, not HTML/JS alone. On GitHub Pages:

1. Open **https://github.com/annerjiao/ableten-landing-page/settings/pages**
2. Under **Custom domain**, confirm `ableten.xyz` is set (matches `CNAME` file)
3. Check **Enforce HTTPS**
4. Save

If **Enforce HTTPS** is greyed out:

- Wait up to 24h for the TLS certificate after adding/changing the custom domain
- Remove custom domain, save, re-add `ableten.xyz`, save, wait, then enable Enforce HTTPS

After enabling, verify:

```bash
curl -sI http://ableten.xyz/ | head -5
# Expect: HTTP/1.1 301 ... Location: https://ableten.xyz/
```

## After deploy

1. Re-test all four URL variants in a browser (or with `curl -sIL`)
2. In [Google Search Console](https://search.google.com/search-console), inspect **only** `https://ableten.xyz/`
3. Request indexing for the HTTPS homepage once 301 is confirmed
4. Ignore pending validation on `http://ableten.xyz/` — it should clear after Google recrawls the redirect

## DNS (reference)

Apex `ableten.xyz` → GitHub Pages A records:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

`www` → CNAME `annerjiao.github.io`

## Optional: Cloudflare (stronger control)

If you front the site with Cloudflare:

- **SSL/TLS** → **Full** or **Full (strict)**
- **Edge Certificates** → **Always Use HTTPS** = ON
- Redirect rule: `http://*` and `https://www.ableten.xyz/*` → `https://ableten.xyz/$1` (301)

## Canonical URLs per page

| Page | Canonical |
|------|-----------|
| Home | `https://ableten.xyz/` |
| Support | `https://ableten.xyz/support.html` |
| Privacy | `https://ableten.xyz/privacy-policy.html` |
| Demo (video) | `https://ableten.xyz/demo.html` |

Do not add `http://` or `www` URLs to the sitemap.

## Video indexing

Product demo video lives on a dedicated **watch page** (`demo.html`), not the homepage. Google requires the video to be the primary content of the page for video search indexing.

After deploy, in Search Console inspect **`https://ableten.xyz/demo.html`** and request indexing.
