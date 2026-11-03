import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { collectionPermission } from '../access/collectionPermission'
import { publishedOrCollectionRead } from '../access/publishedOrCollectionRead'
import { generatePreviewPath } from '../lib/generatePreviewPath'

export const ArtCategories: CollectionConfig = {
  slug: 'art-categories',
  labels: {
    singular: 'Art Category',
    plural: 'Art Categories',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'title'],
    preview: () => generatePreviewPath({ path: '/' }),
    livePreview: {
      url: () => generatePreviewPath({ path: '/' }),
    },
  },
  access: {
    read: publishedOrCollectionRead('art-categories'),
    create: collectionPermission('art-categories', 'create'),
    update: collectionPermission('art-categories', 'update'),
    delete: collectionPermission('art-categories', 'delete'),
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
      unique: true,
      localized: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    slugField({
      name: 'slug',
      useAsSlug: 'name',
      localized: true,
      required: true,
    }),
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: {
        mimeType: { contains: 'image' },
      },
    },
    {
      name: 'art_tag_categories',
      label: 'Art Tag Categories',
      type: 'relationship',
      relationTo: 'art-tag-categories',
      hasMany: true,
    },
    {
      name: 'arts',
      label: 'Arts',
      type: 'join',
      collection: 'arts',
      on: 'art_category',
    },
  ],
}
