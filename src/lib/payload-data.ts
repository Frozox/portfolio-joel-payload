import { getPayload } from 'payload'

import config from '@/payload.config'

const getClient = () => getPayload({ config })

/**
 * All queries here are for public-facing frontend pages, so `overrideAccess`
 * defaults to `false`: Payload's Local API bypasses access control by
 * default, and we want the same "published only" behaviour a public REST
 * consumer would get (see `publishedOrAuthenticated`).
 *
 * Pass `draft: true` (from Next.js `draftMode()`) to preview unpublished
 * changes - in that case `overrideAccess` is enabled too, since draft/preview
 * requests are already gated by the `/next/preview` route's own auth check.
 */

export const getArtCategories = async (draft = false) => {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'art-categories',
    locale: 'fr',
    depth: 1,
    limit: 0,
    draft,
    overrideAccess: draft,
  })
  return docs
}

export const getArtCategoryBySlug = async (slug: string, draft = false) => {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'art-categories',
    locale: 'fr',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    draft,
    overrideAccess: draft,
  })
  return docs[0] ?? null
}

export const getArtsByCategory = async (categoryId: number, draft = false) => {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'arts',
    locale: 'fr',
    where: { art_category: { equals: categoryId } },
    depth: 1,
    limit: 0,
    draft,
    overrideAccess: draft,
  })
  return docs
}

export const getNews = async (draft = false) => {
  const payload = await getClient()
  return payload.findGlobal({
    slug: 'news',
    locale: 'fr',
    depth: 1,
    draft,
    overrideAccess: draft,
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
