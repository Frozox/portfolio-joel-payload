import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { publishedOrAuthenticated } from '../access/publishedOrAuthenticated'

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
