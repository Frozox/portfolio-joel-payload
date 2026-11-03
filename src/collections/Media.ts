import type { CollectionConfig } from 'payload'

import { collectionPermission } from '../access/collectionPermission'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: collectionPermission('media', 'create'),
    update: collectionPermission('media', 'update'),
    delete: collectionPermission('media', 'delete'),
  },
  folders: true,
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // Mirrors the old Strapi media formats so the frontend never has to serve the full-size original.
    imageSizes: [
      { name: 'thumbnail', width: 156, height: 156, fit: 'inside', withoutEnlargement: true },
      { name: 'small', width: 500, height: 500, fit: 'inside', withoutEnlargement: true },
      { name: 'medium', width: 750, height: 750, fit: 'inside', withoutEnlargement: true },
      { name: 'large', width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true },
    ],
  },
}
