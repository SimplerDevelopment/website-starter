import { SimplerDevelopment, NotFoundError } from '@simplerdevelopment/sdk';
import type { SiteConfig, NavItem, Branding, CssVars } from '@simplerdevelopment/sdk';

const SITE_ID = Number(process.env.SITE_ID);
const CMS_API_URL = process.env.CMS_API_URL || 'https://simplerdevelopment.com';

/**
 * A freshly-cloned starter has no SITE_ID until provisioning runs. Rather than
 * crashing the build, every helper below degrades to empty content so the site
 * still renders. `sd` is null in exactly that case.
 */
export const sd = Number.isFinite(SITE_ID) && SITE_ID > 0
  ? new SimplerDevelopment({
      siteId: SITE_ID,
      baseUrl: CMS_API_URL,
      apiKey: process.env.SD_API_KEY,
      // ISR: content is re-fetched at most once a minute per route.
      defaults: { revalidate: 60 },
    })
  : null;

export const isConfigured = sd !== null;

/** Branding used before a site is provisioned, and if /config is unreachable. */
const FALLBACK_BRANDING: Branding = {
  primaryColor: '#111827',
  secondaryColor: '#374151',
  accentColor: '#2563eb',
  backgroundColor: '#ffffff',
  textColor: '#111827',
  logoUrl: null,
  logoSquareUrl: null,
  logoRectUrl: null,
  logoIconUrl: null,
  logoText: null,
  logoAlt: null,
  headingFont: 'Inter',
  bodyFont: 'Inter',
  navTemplate: 'classic',
  navPosition: 'top',
  navBackground: null,
  navTextColor: null,
  borderRadius: '8px',
  linkColor: null,
  linkHoverColor: null,
  buttonStyle: null,
  faviconUrl: null,
  ogImageUrl: null,
  darkMode: null,
  typography: null,
};

export type SiteShell = {
  name: string;
  description: string | null;
  branding: Branding;
  cssVars: CssVars;
  navigation: NavItem[];
};

const FALLBACK_SHELL: SiteShell = {
  name: 'My Website',
  description: null,
  branding: FALLBACK_BRANDING,
  cssVars: {},
  navigation: [],
};

/**
 * Site name, branding, CSS custom properties and nav tree in ONE request.
 * `/config` bundles all of it, so the layout never fans out to /branding +
 * /navigation separately.
 */
export async function getSiteShell(): Promise<SiteShell> {
  if (!sd) return FALLBACK_SHELL;
  try {
    const config: SiteConfig = await sd.config.get();
    return {
      name: config.name,
      description: config.description,
      branding: config.branding ?? FALLBACK_BRANDING,
      cssVars: config.cssVars ?? {},
      navigation: config.navigation ?? [],
    };
  } catch {
    // A broken CMS must not take the whole site down — render unbranded.
    return FALLBACK_SHELL;
  }
}

export async function getPage(slug: string) {
  if (!sd) return null;
  try {
    return await sd.pages.get(slug);
  } catch (err) {
    if (err instanceof NotFoundError) return null;
    throw err;
  }
}

export async function listPages(limit = 100) {
  if (!sd) return [];
  try {
    const { data } = await sd.pages.list({ limit });
    return data;
  } catch {
    return [];
  }
}

export async function getPost(slug: string) {
  if (!sd) return null;
  try {
    return await sd.posts.get(slug);
  } catch (err) {
    if (err instanceof NotFoundError) return null;
    throw err;
  }
}

export async function listPosts(opts?: { limit?: number; offset?: number; category?: string; tag?: string }) {
  if (!sd) return { data: [], total: 0 };
  try {
    const { data, pagination } = await sd.posts.list({ postType: 'blog', ...opts });
    return { data, total: pagination.total };
  } catch {
    return { data: [], total: 0 };
  }
}
