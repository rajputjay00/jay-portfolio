import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jay-portfolio-tau.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/og-card'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
