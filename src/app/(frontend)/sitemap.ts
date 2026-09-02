import type { MetadataRoute } from 'next'

import { getArtCategories } from '@/lib/payload-data'

const frontendHost = process.env.NEXT_PUBLIC_FRONTEND_HOST ?? 'http://localhost:3000'

const generateDynamicSiteMap = async (): Promise<MetadataRoute.Sitemap> => {
  const artCategories = await getArtCategories()
  return artCategories.map((artCategory) => ({
    url: `${frontendHost}/${artCategory.slug}`,
    lastModified: new Date(),
    priority: 0.7,
  }))
}

const generateSiteMap = async (): Promise<MetadataRoute.Sitemap> => {
  const sitemap: MetadataRoute.Sitemap = [
    {
      url: frontendHost,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${frontendHost}/expositions`,
      lastModified: new Date(),
      priority: 0.5,
    },
    {
      url: `${frontendHost}/contact`,
      lastModified: new Date(),
      priority: 0.8,
    },
  ]

  try {
    const dynamicSitemap = await generateDynamicSiteMap()
    sitemap.push(...dynamicSitemap)
  } catch {
    // ignore: sitemap falls back to static routes only
  }
  return sitemap
}

// Revalidate sitemap every hour
export const revalidate = 3600

export default generateSiteMap
