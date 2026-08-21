import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { publishedOrAuthenticated } from '../access/publishedOrAuthenticated'

export const Arts: CollectionConfig = {
  slug: 'arts',
  labels: {
    singular: 'Art',
    plural: 'Arts',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'art_category', 'sold_out'],
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
