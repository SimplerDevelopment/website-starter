/**
 * Absolute origin for this site, used by sitemap.xml and robots.txt (both of
 * which require fully-qualified URLs).
 *
 * Prefers an explicit SITE_URL, then Vercel's per-deployment host so preview
 * builds self-reference correctly rather than pointing at production.
 */
export function siteUrl(): string {
  const explicit = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return 'http://localhost:3000';
}
