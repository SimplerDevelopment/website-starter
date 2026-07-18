import type { MetadataRoute } from 'next';
import { listPages, listPosts } from '@/lib/sd';
import { siteUrl } from '@/lib/site-url';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [pages, { data: posts }] = await Promise.all([listPages(), listPosts({ limit: 1000 })]);

  const pageEntries = pages
    // `home` is served at `/`, so emitting it again as `/home` would duplicate it.
    .filter((p) => p.slug !== 'home')
    .map((p) => ({
      url: `${base}/${p.slug}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : undefined,
    }));

  const postEntries = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : undefined,
  }));

  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/blog` },
    ...pageEntries,
    ...postEntries,
  ];
}
