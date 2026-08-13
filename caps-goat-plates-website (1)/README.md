# CAPS GOAT PLATES LTD — website

Static site. No build step, no framework, no dependencies to install.
Upload and it works.

---

## Deploy to Cloudflare Pages (2 minutes)

1. Go to **Cloudflare dashboard → Workers & Pages → Create → Pages → Upload assets**
2. Drag in this ZIP (or the unzipped folder)
3. Project name: `caps-goat-plates`
4. **Deploy**

Leave the build command and output directory **empty** — this is pre-built.

Then in **Custom domains**, add `capsgoatplates.co.uk` and `www.capsgoatplates.co.uk`.

### One thing to change before going live

Open `build.py`-generated pages or just find-and-replace across all `.html` files:

```
https://capsgoatplates.co.uk   →   your real domain
```

This appears in `<link rel="canonical">`, the Open Graph tags, `sitemap.xml` and
`robots.txt`. Wrong canonicals will hurt your search ranking, so do this first.

Same for `hello@capsgoatplates.co.uk` if your email differs.

---

## What's in here

| File | Purpose |
|---|---|
| `index.html` | Home |
| `builder.html` | The Plate Lab (live builder) |
| `finishes.html` | Standard / 3D gel / 4D laser / 4D gel compared |
| `sizes.html` | Sizes and fitment guide |
| `show-plates.html` | Show plates and gel tints |
| `legal-requirements.html` | UK plate law + required documents |
| `about.html` | About + GOAT Guarantee |
| `faq.html` | FAQ (with FAQ schema for Google) |
| `contact.html` | Contact form |
| `404.html` | Not-found page (Cloudflare serves this automatically) |
| `assets/css/main.css` | One stylesheet, all pages |
| `assets/js/site.js` | Nav, cart, plate renderer — every page |
| `assets/js/builder.js` | Builder only |
| `sitemap.xml`, `robots.txt` | Search engines |
| `_headers` | Security headers + 1-year asset caching |
| `_redirects` | `/build`, `/plate-lab`, `/legal` shortcuts |

---

## Performance

First page load is roughly **43 KB gzipped** including the logo. Every page after
that is about **5 KB**, because the CSS, JS and images are cached for a year by
`_headers`.

There are no images of plates anywhere — every plate you see is rendered with CSS
from live data. That's why the site is this small and why the builder can preview
any registration instantly.

---

## Still to connect

**Payments.** The "Press My Order" button opens a confirmation modal instead of
checking out. Wire it up in `assets/js/site.js` — search for `checkoutBtn`.
The full cart sits in `localStorage` under the key `cgp_garage_v1` and each item
already carries its finish, size, badge, border, tint, extras and price.

**Contact form.** `contact.html` has a `<form action="#">`. Point it at Formspree,
Web3Forms, or a Cloudflare Pages Function. No other change needed.

**Document upload.** Required by law before you press a road-legal plate.
Ask for it after payment, or by email — both are compliant.

---

## Editing prices

All prices live in one place: the `CG` object at the top of `assets/js/site.js`.

```js
STYLES: { std:{p:15.99}, gel:{p:24.99}, l4d:{p:29.99}, g4d:{p:36.99} }
PRICE:  { badge:4.99, border:2.99, tint:9.99, gloss:3.99, kit:2.99 }
FREE_SHIP: 30,  SHIP: 3.95
```

Change a number there and it updates the builder, the cart and the totals
everywhere. The prices shown on `finishes.html` and inside the builder's finish
buttons are written in the HTML too, so update those to match.

---

## The number plate font

The site currently uses **Oswald** (Google Fonts) as a stand-in. Real UK plates
use **Charles Wright**, which is licensed.

For production, buy a licence, drop the `.woff2` into `assets/fonts/`, and in
`main.css` change:

```css
--plate:'Oswald','Arial Narrow',system-ui,sans-serif;
```

to your `@font-face` family. Nothing else needs touching — every plate on the
site reads that one variable.
