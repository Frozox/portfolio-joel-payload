import type { GlobalConfig } from 'payload'

import { globalPermission } from '../access/globalPermission'
import { publicOrGlobalRead } from '../access/publicOrPermissionRead'

export const SiteImages: GlobalConfig = {
  slug: 'site-images',
  label: 'Images statiques',
  access: {
    read: publicOrGlobalRead('site-images'),
    update: globalPermission('site-images', 'update'),
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
