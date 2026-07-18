# Website Starter

Next.js starter for client websites managed through the Simpler Development portal. Content, navigation, and branding all come from the portal at request time via the official [`@simplerdevelopment/sdk`](https://github.com/SimplerDevelopment/SimplerDevelopment/tree/main/packages/sdk) — there is nothing to hardcode per client.

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in SITE_ID and SD_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Without `SITE_ID` the site still builds and renders a neutral placeholder, so a fresh clone works before provisioning.

## Environment

| Variable | Required | Description |
|---|---|---|
| `SITE_ID` | Yes | Numeric site ID from the portal. Set automatically during provisioning. |
| `SD_API_KEY` | Yes | `sd_live_…` key from the portal, Settings → API Keys. **Every** v1 endpoint requires it, including branding and navigation. |
| `CMS_API_URL` | No | Defaults to `https://simplerdevelopment.com`. |
| `SITE_URL` | No | Absolute origin for `sitemap.xml` / `robots.txt`. Falls back to the Vercel deployment URL, then localhost. |

## How it works

`lib/sd.ts` owns the single SDK client and every CMS read. It sets a 60s ISR default and degrades to empty content on failure, so a CMS outage renders an unbranded site rather than a 500.

### Routing

| Route | Source |
|---|---|
| `/` | The portal page with slug `home`, falling back to a built-in hero if none exists |
| `/[...slug]` | Any published portal page, rendered through the block renderer |
| `/blog`, `/blog/[slug]` | Posts of type `blog` |
| `/sitemap.xml`, `/robots.txt` | Generated from the portal's pages and posts |

### Branding

Applied in `app/layout.tsx` from a single `config.get()` call, which returns branding, CSS variables, and the nav tree together. The portal's `cssVars` (a map of CSS custom properties) is spread onto `<html style>`, so `--brand-primary`, `--brand-accent`, fonts, and radius are available to every component and to `app/globals.css`. Heading and body fonts load from Google Fonts using the portal's configured names.

### Navigation

Renders from the portal nav tree, including nested items and `isButton` CTAs, and falls back to Home/Blog links when no nav is configured.

## Custom blocks

Register site-specific block types in `lib/custom-blocks.ts`; they appear in the portal's visual editor alongside the built-ins. See that file's header comment for the manifest shape.

## Stack

- [Next.js 16](https://nextjs.org/) — React framework, App Router + server components
- [`@simplerdevelopment/sdk`](https://www.npmjs.com/package/@simplerdevelopment/sdk) — typed CMS client
- [Tailwind CSS 4](https://tailwindcss.com/) — Utility-first CSS
- [TypeScript](https://www.typescriptlang.org/) — Type safety
