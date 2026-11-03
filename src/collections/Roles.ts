import type { CollectionConfig } from 'payload'

import { isSuperAdmin, isSuperAdminField } from '../access/isSuperAdmin'

const MANAGED_COLLECTIONS = [
  { label: 'Utilisateurs', value: 'users' },
  { label: 'Œuvres (Arts)', value: 'arts' },
  { label: 'Catégories d\u2019œuvres', value: 'art-categories' },
  { label: 'Tags', value: 'art-tags' },
  { label: 'Catégories de tags', value: 'art-tag-categories' },
  { label: 'Médias', value: 'media' },
]

const MANAGED_GLOBALS = [
  { label: 'Expositions', value: 'news' },
  { label: 'Images statiques', value: 'site-images' },
]

// Customizable roles: dashboard permissions per collection/global, plus custom views (Sentry, GA).
export const Roles: CollectionConfig = {
  slug: 'roles',
  labels: {
    singular: 'Rôle',
    plural: 'Rôles',
  },
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: isSuperAdmin,
    create: isSuperAdmin,
    update: isSuperAdmin,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'isAdmin',
      label: 'Administrateur (accès complet)',
      type: 'checkbox',
      defaultValue: false,
      access: {
        update: isSuperAdminField,
      },
    },
    {
      name: 'collections',
      label: 'Permissions par collection',
      type: 'array',
      fields: [
        {
          name: 'collection',
          type: 'select',
          required: true,
          options: MANAGED_COLLECTIONS,
        },
        { name: 'read', type: 'checkbox', defaultValue: false },
        { name: 'create', type: 'checkbox', defaultValue: false },
        { name: 'update', type: 'checkbox', defaultValue: false },
        { name: 'delete', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'globals',
      label: 'Permissions par global',
      type: 'array',
      fields: [
        {
          name: 'global',
          type: 'select',
          required: true,
          options: MANAGED_GLOBALS,
        },
        { name: 'read', type: 'checkbox', defaultValue: false },
        { name: 'update', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'viewAnalytics',
      label: 'Voir le widget Google Analytics',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'viewSentry',
      label: 'Voir le widget Sentry',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
