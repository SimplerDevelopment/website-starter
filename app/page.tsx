import Link from 'next/link';
import type { Metadata } from 'next';
import { BlockRenderer } from '@/components/blocks/render/BlockRenderer';
import { getPage, listPosts } from '@/lib/sd';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('home');
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

export default async function Home() {
  const page = await getPage('home');

  if (page) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <BlockRenderer content={page.content} />
      </main>
    );
  }

  const { data: recentPosts } = await listPosts({ limit: 3 });

  return (
    <main className="min-h-screen px-6">
      <section className="mx-auto flex max-w-4xl flex-col items-center justify-center py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to your website
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-md">
          This site is powered by Next.js and managed through the Simpler Development portal.
        </p>
      </section>

      {recentPosts.length > 0 && (
        <section className="mx-auto max-w-4xl pb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Latest Posts</h2>
            <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-700">
              View all &rarr;
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block rounded-lg border border-gray-200 p-5 transition hover:border-gray-400 hover:shadow-sm"
              >
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="mb-3 aspect-video w-full rounded object-cover"
                  />
                )}
                <h3 className="font-semibold group-hover:underline">{post.title}</h3>
                {post.excerpt && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
