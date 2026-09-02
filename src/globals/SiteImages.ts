import type { GlobalConfig } from 'payload'

export const SiteImages: GlobalConfig = {
  slug: 'site-images',
  label: 'Images statiques',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'home_joel',
      label: 'Portrait de Joël (page d\u2019accueil)',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'site_logo',
      label: 'Logo du site',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
}
