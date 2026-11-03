import type { CollectionConfig } from 'payload'

import { collectionPermission } from '../access/collectionPermission'
import { publishedOrCollectionRead } from '../access/publishedOrCollectionRead'

export const ArtTagCategories: CollectionConfig = {
  slug: 'art-tag-categories',
  labels: {
    singular: 'Art Tag Category',
    plural: 'Art Tag Categories',
  },
  admin: {
    useAsTitle: 'display_name',
    defaultColumns: ['display_name', 'name'],
  },
  access: {
    read: publishedOrCollectionRead('art-tag-categories'),
    create: collectionPermission('art-tag-categories', 'create'),
    update: collectionPermission('art-tag-categories', 'update'),
    delete: collectionPermission('art-tag-categories', 'delete'),
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
      name: 'display_name',
      label: 'Display Name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'art_tags',
      label: 'Art Tags',
      type: 'join',
      collection: 'art-tags',
      on: 'art_tag_category',
    },
    {
      name: 'art_categories',
      label: 'Art Categories',
      type: 'join',
      collection: 'art-categories',
      on: 'art_tag_categories',
    },
  ],
}
