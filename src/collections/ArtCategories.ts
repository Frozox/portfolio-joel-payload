import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { authenticated } from '../access/authenticated'
import { publishedOrAuthenticated } from '../access/publishedOrAuthenticated'

export const ArtCategories: CollectionConfig = {
  slug: 'art-categories',
  labels: {
    singular: 'Art Category',
    plural: 'Art Categories',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'title'],
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
      name: 'metaDescription',
      type: 'textarea',
      localized: true,
      maxLength: 160,
    },
    {
      name: 'metaKeywords',
      type: 'text',
      localized: true,
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
