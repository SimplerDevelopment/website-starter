import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BlockRenderer } from '@/components/blocks/render/BlockRenderer';
import { getPage, listPages, isConfigured } from '@/lib/sd';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string[] }> };

// Join the catch-all segments back into the portal slug. Portal pages are
// addressed by a single slug today, but nested URLs (e.g. /solutions/hoa) still
// resolve as long as the stored slug matches the full path.
function toSlug(segments: string[]): string {
  return segments.join('/');
}

export async function generateStaticParams() {
  if (!isConfigured) return [];
  const pages = await listPages();
  return pages.map((p) => ({ slug: p.slug.split('/') }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(toSlug(slug));
  if (!page) return {};
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.excerpt || undefined,
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.excerpt || undefined,
      images: page.ogImage ? [page.ogImage] : undefined,
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(toSlug(slug));

  if (!page) notFound();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <BlockRenderer content={page.content} />
    </main>
  );
}
