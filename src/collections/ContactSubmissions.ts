import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  admin: {
    useAsTitle: 'fullname',
    defaultColumns: ['fullname', 'email', 'createdAt'],
  },
  access: {
    // Anyone can submit the public contact form.
    create: () => true,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'fullname',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'arts',
      type: 'relationship',
      relationTo: 'arts',
      hasMany: true,
    },
  ],
}
