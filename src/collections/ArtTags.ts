import type { CollectionConfig } from 'payload'

import { collectionPermission } from '../access/collectionPermission'
import { publishedOrCollectionRead } from '../access/publishedOrCollectionRead'

export const ArtTags: CollectionConfig = {
  slug: 'art-tags',
  labels: {
    singular: 'Art Tag',
    plural: 'Art Tags',
  },
  admin: {
    useAsTitle: 'tag',
    defaultColumns: ['tag', 'art_tag_category'],
  },
  access: {
    read: publishedOrCollectionRead('art-tags'),
    create: collectionPermission('art-tags', 'create'),
    update: collectionPermission('art-tags', 'update'),
    delete: collectionPermission('art-tags', 'delete'),
  },
  versions: {
    drafts: true,
  },
  orderable: true,
  fields: [
    {
      name: 'tag',
      type: 'text',
      required: true,
      unique: true,
      localized: true,
    },
    {
      name: 'art_tag_category',
      label: 'Art Tag Category',
      type: 'relationship',
      relationTo: 'art-tag-categories',
    },
    {
      name: 'arts',
      type: 'join',
      collection: 'arts',
      on: 'art_tags',
    },
  ],
}
