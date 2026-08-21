/**
 * One-off migration script: copies content + media from the old Strapi site
 * into this Payload project, via Strapi's REST API + Payload's Local API.
 *
 * IMPORTANT:
 * - Run this against an EMPTY Payload database. This script is NOT
 *   idempotent — running it twice will create duplicate documents.
 * - Only migrates published entries (Strapi `status=published`).
 * - Does not migrate the `email` contact-form feature (it's just a
 *   controller, no content — recreate as a Payload custom endpoint if needed).
 *
 * USAGE:
 *   STRAPI_URL=https://your-strapi-host STRAPI_API_TOKEN=xxxx pnpm migrate:strapi
 */
import 'dotenv/config'
import {
  convertHTMLToLexical,
  defaultEditorConfig,
  sanitizeServerEditorConfig,
} from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { getPayload } from 'payload'

import config from '../src/payload.config'
import type { News } from '@/payload-types'

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337'
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

const LOCALES = ['fr', 'en'] as const
type StrapiLocale = (typeof LOCALES)[number]

// Strapi requires deep, per-field `populate` — the wildcard `populate=*` only
// populates one level and does not reach into dynamic zone components.
// Note: `media`-type attributes (thumbnail/images/image, and `media` inside
// dynamic zone components) reject a nested `[populate]=folder` (Strapi
// returns a 400) — they must be populated shallowly (`=true`).
type PopulateEntries = [string, string][]

const NO_POPULATE: PopulateEntries = []

const ART_TAG_POPULATE: PopulateEntries = [['populate[art_tag_category]', 'true']]

const ART_CATEGORY_POPULATE: PopulateEntries = [
  ['populate[image]', 'true'],
  ['populate[art_tag_categories]', 'true'],
]

const ART_POPULATE: PopulateEntries = [
  ['populate[thumbnail]', 'true'],
  ['populate[images]', 'true'],
  ['populate[art_category]', 'true'],
  ['populate[art_tags]', 'true'],
]

// Component UIDs used in the News dynamic zone that hold a `media` relation.
const NEWS_MEDIA_COMPONENT_UIDS = [
  'visual-components.media-component',
  'visual-components.text-media-component',
]

async function strapiFetch(path: string) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : undefined,
  })
  if (!res.ok) {
    throw new Error(`Strapi request failed (${res.status}): ${path}`)
  }
  return res.json()
}

async function fetchAllStrapiDocs(
  apiId: string,
  locale: StrapiLocale,
  populateEntries: PopulateEntries,
) {
  const pageSize = 100
  let page = 1
  const docs: any[] = []

  for (;;) {
    const params = new URLSearchParams({
      locale,
      status: 'published',
      'pagination[page]': String(page),
      'pagination[pageSize]': String(pageSize),
    })
    for (const [key, value] of populateEntries) {
      params.append(key, value)
    }
    const json = await strapiFetch(`/api/${apiId}?${params.toString()}`)
    docs.push(...json.data)
    if (!json.meta?.pagination || page >= json.meta.pagination.pageCount) break
    page += 1
  }

  return docs
}

async function fetchDocsByLocale(apiId: string, populateEntries: PopulateEntries) {
  const byLocale = {} as Record<StrapiLocale, any[]>
  for (const locale of LOCALES) {
    byLocale[locale] = await fetchAllStrapiDocs(apiId, locale, populateEntries)
  }
  return byLocale
}

function findTranslation(docs: any[], documentId: string) {
  return docs.find((doc) => doc.documentId === documentId)
}

// `art-category` and `art` have a Strapi `sortOrder` integer field used for
// manual ordering. Payload's `orderable: true` collections instead derive
// order from insertion order (each new doc is appended to the end), so we
// must create the documents in `sortOrder` order to preserve it. Docs
// without a `sortOrder` (shouldn't normally happen) are sorted last.
function sortByStrapiOrder<T extends { sortOrder?: number | null }>(docs: T[]): T[] {
  return [...docs].sort(
    (a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER),
  )
}

async function run() {
  const payload = await getPayload({ config })

  const editorConfig = await sanitizeServerEditorConfig(defaultEditorConfig, payload.config)

  // Some CKEditor content converts to an empty Lexical root (e.g. embedded
  // images our editor doesn't understand, or genuinely empty content), which
  // Payload rejects as invalid. Fall back to `undefined` (field left empty)
  // instead of crashing the whole migration.
  function htmlToLexical(html?: string | null) {
    if (!html?.trim()) return undefined
    try {
      const state = convertHTMLToLexical({ editorConfig, html, JSDOM })
      const hasContent = ((state?.root?.children?.length as number) ?? 0) > 0
      return hasContent ? state : undefined
    } catch (err) {
      console.warn('Failed to convert HTML to Lexical, leaving content empty:', err)
      return undefined
    }
  }

  // Strapi's Media Library folders are not migrated — media is imported flat,
  // matching Strapi's default "API Uploads" storage.
  const mediaIdMap = new Map<number, number>()

  async function migrateMedia(strapiMedia: any): Promise<number | undefined> {
    if (!strapiMedia) return undefined
    if (mediaIdMap.has(strapiMedia.id)) return mediaIdMap.get(strapiMedia.id)

    const fileUrl = strapiMedia.url.startsWith('http')
      ? strapiMedia.url
      : `${STRAPI_URL}${strapiMedia.url}`
    const fileRes = await fetch(fileUrl)
    if (!fileRes.ok) {
      throw new Error(`Failed to download media ${fileUrl} (${fileRes.status})`)
    }
    const buffer = Buffer.from(await fileRes.arrayBuffer())

    const created = await payload.create({
      collection: 'media',
      data: {
        alt: strapiMedia.alternativeText || strapiMedia.name || 'media',
      },
      file: {
        data: buffer,
        mimetype: strapiMedia.mime,
        name: strapiMedia.name,
        size: buffer.length,
      },
    })

    mediaIdMap.set(strapiMedia.id, created.id)
    return created.id
  }

  // 1. Art Tag Categories
  console.log('Migrating art-tag-categories...')
  const artTagCategoryDocs = await fetchDocsByLocale('art-tag-categories', NO_POPULATE)
  const artTagCategoryIdMap = new Map<string, number>()

  for (const frDoc of artTagCategoryDocs.fr) {
    const created = await payload.create({
      collection: 'art-tag-categories',
      locale: 'fr',
      data: {
        name: frDoc.name,
        display_name: frDoc.display_name,
      },
    })
    artTagCategoryIdMap.set(frDoc.documentId, created.id)

    const enDoc = findTranslation(artTagCategoryDocs.en, frDoc.documentId)
    if (enDoc) {
      await payload.update({
        collection: 'art-tag-categories',
        id: created.id,
        locale: 'en',
        data: {
          name: enDoc.name,
          display_name: enDoc.display_name,
        },
      })
    }
  }

  // 2. Art Tags
  console.log('Migrating art-tags...')
  const artTagDocs = await fetchDocsByLocale('art-tags', ART_TAG_POPULATE)
  const artTagIdMap = new Map<string, number>()

  for (const frDoc of artTagDocs.fr) {
    const created = await payload.create({
      collection: 'art-tags',
      locale: 'fr',
      data: {
        tag: frDoc.tag,
        art_tag_category: frDoc.art_tag_category
          ? artTagCategoryIdMap.get(frDoc.art_tag_category.documentId)
          : undefined,
      },
    })
    artTagIdMap.set(frDoc.documentId, created.id)

    const enDoc = findTranslation(artTagDocs.en, frDoc.documentId)
    if (enDoc) {
      await payload.update({
        collection: 'art-tags',
        id: created.id,
        locale: 'en',
        data: {
          tag: enDoc.tag,
        },
      })
    }
  }

  // 3. Art Categories
  console.log('Migrating art-categories...')
  const artCategoryDocs = await fetchDocsByLocale('art-categories', ART_CATEGORY_POPULATE)
  const artCategoryIdMap = new Map<string, number>()

  for (const frDoc of sortByStrapiOrder(artCategoryDocs.fr)) {
    const imageId = await migrateMedia(frDoc.image)
    if (!imageId) throw new Error(`Missing image for art-category "${frDoc.name}"`)

    const created = await payload.create({
      collection: 'art-categories',
      locale: 'fr',
      data: {
        name: frDoc.name,
        title: frDoc.title,
        // Preserve the exact original slug instead of letting Payload regenerate it from `name`.
        generateSlug: false,
        slug: frDoc.slug,
        image: imageId,
        metaDescription: frDoc.metaDescription,
        metaKeywords: frDoc.metaKeywords,
        art_tag_categories: (frDoc.art_tag_categories || [])
          .map((c: any) => artTagCategoryIdMap.get(c.documentId))
          .filter(Boolean),
      },
    })
    artCategoryIdMap.set(frDoc.documentId, created.id)

    const enDoc = findTranslation(artCategoryDocs.en, frDoc.documentId)
    if (enDoc) {
      await payload.update({
        collection: 'art-categories',
        id: created.id,
        locale: 'en',
        data: {
          name: enDoc.name,
          title: enDoc.title,
          generateSlug: false,
          slug: enDoc.slug,
          metaDescription: enDoc.metaDescription,
          metaKeywords: enDoc.metaKeywords,
        },
      })
    }
  }

  // 4. Arts
  console.log('Migrating arts...')
  const artDocs = await fetchDocsByLocale('arts', ART_POPULATE)

  for (const frDoc of sortByStrapiOrder(artDocs.fr)) {
    const thumbnailId = await migrateMedia(frDoc.thumbnail)
    if (!thumbnailId) throw new Error(`Missing thumbnail for art "${frDoc.name}"`)
    const imageIds = (
      await Promise.all((frDoc.images || []).map((image: any) => migrateMedia(image)))
    ).filter((id): id is number => Boolean(id))

    const created = await payload.create({
      collection: 'arts',
      locale: 'fr',
      data: {
        name: frDoc.name,
        description: frDoc.description,
        date: frDoc.date,
        thumbnail: thumbnailId,
        images: imageIds,
        height: frDoc.height,
        width: frDoc.width,
        depth: frDoc.depth,
        art_category: frDoc.art_category
          ? artCategoryIdMap.get(frDoc.art_category.documentId)
          : undefined,
        art_tags: (frDoc.art_tags || [])
          .map((t: any) => artTagIdMap.get(t.documentId))
          .filter(Boolean),
        sold_out: frDoc.sold_out,
      },
    })

    const enDoc = findTranslation(artDocs.en, frDoc.documentId)
    if (enDoc) {
      await payload.update({
        collection: 'arts',
        id: created.id,
        locale: 'en',
        data: {
          name: enDoc.name,
          description: enDoc.description,
          date: enDoc.date,
        },
      })
    }
  }

  // 5. News (Strapi singleType -> Payload global, dynamiczone -> blocks)
  // console.log('Migrating news...')

  async function mapNewsBlocks(components: any[] = []): Promise<News['content']> {
    // Typed loosely (`any[]`) since this is a one-off migration script; the
    // resulting shape is validated by Payload itself when the global is saved.
    const blocks: any[] = []
    for (const component of components) {
      switch (component.__component) {
        case 'visual-components.text-component':
          blocks.push({
            blockType: 'textBlock',
            title: component.title,
            content: htmlToLexical(component.content),
          })
          break
        case 'visual-components.media-component':
          blocks.push({
            blockType: 'mediaBlock',
            media: await migrateMedia(component.media),
            mediaPosition: component.media_position,
          })
          break
        case 'visual-components.text-media-component':
          blocks.push({
            blockType: 'textMediaBlock',
            title: component.title,
            content: htmlToLexical(component.content),
            media: await migrateMedia(component.media),
            mediaPosition: component.media_position,
            mediaMobilePosition: component.media_mobile_position,
          })
          break
        case 'visual-components.spacer-component':
          blocks.push({ blockType: 'spacerBlock' })
          break
        default:
          console.warn(`Unknown news component: ${component.__component}`)
      }
    }
    return blocks
  }

  // for (const locale of LOCALES) {
  //   const newsParams = new URLSearchParams({ locale, status: 'published' })
  //   for (const uid of NEWS_MEDIA_COMPONENT_UIDS) {
  //     newsParams.append(`populate[content][on][${uid}][populate][media]`, 'true')
  //   }
  //   const json = await strapiFetch(`/api/new?${newsParams.toString()}`)
  //   const newsDoc = json.data
  //   if (!newsDoc) continue

  //   await payload.updateGlobal({
  //     slug: 'news',
  //     locale,
  //     data: {
  //       content: await mapNewsBlocks(newsDoc.content),
  //     },
  //   })
  // }

  console.log('Migration done.')
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
