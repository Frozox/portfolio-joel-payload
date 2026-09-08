import type { CollectionConfig, PayloadRequest } from 'payload'

import { authenticated } from '../access/authenticated'
import { publishedOrAuthenticated } from '../access/publishedOrAuthenticated'
import { generatePreviewPath } from '../lib/generatePreviewPath'

/**
 * Arts don't have their own page - they're displayed within their category's
 * `/[categorySlug]` page. To preview an Art, resolve its category's slug
 * (the `art_category` relationship value is just an id/populated doc
 * depending on context) and build the preview URL from it.
 */
const resolveArtPreviewPath = async (
  artCategory: unknown,
  req: PayloadRequest,
): Promise<string | null> => {
  const categoryId =
    typeof artCategory === 'object' && artCategory !== null
      ? (artCategory as { id?: number }).id
      : (artCategory as number | undefined)

  if (!categoryId) return null

  const category = await req.payload.findByID({
    collection: 'art-categories',
    id: categoryId,
    depth: 0,
    overrideAccess: true,
  })

  return category?.slug ? generatePreviewPath({ path: `/${category.slug}` }) : null
}

export const Arts: CollectionConfig = {
  slug: 'arts',
  labels: {
    singular: 'Art',
    plural: 'Arts',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'art_category', 'sold_out'],
    preview: (doc, { req }) => resolveArtPreviewPath(doc.art_category, req),
    livePreview: {
      url: ({ data, req }) => resolveArtPreviewPath(data?.art_category, req),
    },
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: {
    drafts: true,
  },
  orderable: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'date',
      type: 'date',
      localized: true,
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: {
        mimeType: { contains: 'image' },
      },
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      filterOptions: {
        mimeType: { contains: 'image' },
      },
    },
    {
      name: 'height',
      type: 'number',
      required: true,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'width',
      type: 'number',
      required: true,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'depth',
      type: 'number',
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'art_category',
      label: 'Art Category',
      type: 'relationship',
      relationTo: 'art-categories',
    },
    {
      name: 'art_tags',
      label: 'Art Tags',
      type: 'relationship',
      relationTo: 'art-tags',
      hasMany: true,
    },
    {
      name: 'sold_out',
      type: 'checkbox',
      required: true,
      defaultValue: false,
    },
  ],
}
