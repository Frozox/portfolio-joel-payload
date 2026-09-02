import { getPayload } from 'payload'

import config from '@/payload.config'

const getClient = () => getPayload({ config })

/**
 * All queries here are for public-facing frontend pages, so `overrideAccess`
 * is explicitly disabled: Payload's Local API bypasses access control by
 * default, and we want the same "published only" behaviour a public REST
 * consumer would get (see `publishedOrAuthenticated`).
 */

export const getArtCategories = async () => {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'art-categories',
    locale: 'fr',
    depth: 1,
    limit: 0,
    overrideAccess: false,
  })
  return docs
}

export const getArtCategoryBySlug = async (slug: string) => {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'art-categories',
    locale: 'fr',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    overrideAccess: false,
  })
  return docs[0] ?? null
}

export const getArtsByCategory = async (categoryId: number) => {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'arts',
    locale: 'fr',
    where: { art_category: { equals: categoryId } },
    depth: 1,
    limit: 0,
    overrideAccess: false,
  })
  return docs
}

export const getNews = async () => {
  const payload = await getClient()
  return payload.findGlobal({
    slug: 'news',
    locale: 'fr',
    depth: 1,
    overrideAccess: false,
  })
}

export const getSiteImages = async () => {
  const payload = await getClient()
  return payload.findGlobal({
    slug: 'site-images',
    depth: 1,
    overrideAccess: false,
  })
}
