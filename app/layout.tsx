import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { NavItem } from '@simplerdevelopment/sdk';
import { EditorModeProvider } from '@/components/visual-editor/EditorModeProvider';
import { getSiteShell } from '@/lib/sd';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const { name, description, branding } = await getSiteShell();
  const icon = branding.faviconUrl || branding.logoSquareUrl || branding.logoIconUrl;

  return {
    title: { default: name, template: `%s | ${name}` },
    description: description ?? undefined,
    icons: icon ? { icon } : undefined,
    openGraph: {
      siteName: name,
      description: description ?? undefined,
      images: branding.ogImageUrl ? [branding.ogImageUrl] : undefined,
    },
  };
}

/**
 * Google Fonts stylesheet for the portal-configured fonts. Font names arrive
 * from the CMS at request time, so `next/font` — which needs static literals at
 * build time — can't be used here.
 */
function googleFontsHref(fonts: (string | null)[]): string | null {
  const families = Array.from(
    new Set(fonts.filter((f): f is string => Boolean(f && f.trim()))),
  );
  if (families.length === 0) return null;

  const params = families
    // css2 expects `+` for spaces, and the `:` / `;` separators must stay
    // literal — which rules out encodeURIComponent over the whole value.
    .map((f) => `family=${f.trim().replace(/\s+/g, '+')}:wght@400;500;600;700`)
    .join('&');

  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

function NavLinks({ items }: { items: NavItem[] }) {
  return (
    <>
      {items.map((item) => {
        const className = item.isButton
          ? 'rounded-[var(--brand-border-radius,8px)] bg-[var(--brand-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90'
          : 'text-sm transition hover:text-[var(--brand-accent)]';

        if (item.children?.length) {
          return (
            <div key={item.id} className="group relative">
              <Link
                href={item.href}
                className={className}
                target={item.openInNewTab ? '_blank' : undefined}
              >
                {item.label}
              </Link>
              {/* CSS-only disclosure, so the layout stays a server component. */}
              <div className="invisible absolute left-0 top-full z-20 min-w-48 rounded-[var(--brand-border-radius,8px)] border border-black/5 bg-white p-2 opacity-0 shadow-lg transition focus-within:visible focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                {item.children.map((child) => (
                  <Link
                    key={child.id}
                    href={child.href}
                    target={child.openInNewTab ? '_blank' : undefined}
                    className="block rounded px-3 py-2 text-sm hover:bg-black/5"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.id}
            href={item.href}
            className={className}
            target={item.openInNewTab ? '_blank' : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { name, branding, cssVars, navigation } = await getSiteShell();
  const fontsHref = googleFontsHref([branding.headingFont, branding.bodyFont]);
  const wordmark = branding.logoRectUrl || branding.logoUrl;

  return (
    // cssVars is a Record of CSS custom properties, which React writes straight
    // through the style prop — no stylesheet string to inject or sanitize.
    <html lang="en" style={cssVars as CSSProperties}>
      <head>{fontsHref && <link rel="stylesheet" href={fontsHref} />}</head>
      <body className="bg-[var(--brand-bg,#fff)] text-[var(--brand-text,#111827)] antialiased">
        <EditorModeProvider>
          <header className="border-b border-black/5 bg-[var(--brand-nav-bg,transparent)]">
            <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                {wordmark ? (
                  <img src={wordmark} alt={branding.logoAlt || name} className="h-8 w-auto" />
                ) : (
                  <span className="text-lg">{branding.logoText || name}</span>
                )}
              </Link>
              <div className="flex items-center gap-6">
                {navigation.length > 0 ? (
                  <NavLinks items={navigation} />
                ) : (
                  <>
                    <Link href="/" className="text-sm hover:text-[var(--brand-accent)]">
                      Home
                    </Link>
                    <Link href="/blog" className="text-sm hover:text-[var(--brand-accent)]">
                      Blog
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </header>
          {children}
        </EditorModeProvider>
      </body>
    </html>
  );
}
