import type { CollectionConfig } from 'payload'

import { collectionPermission } from '../access/collectionPermission'
import { hiddenUnlessCollectionPermission } from '../access/hiddenUnlessCollectionPermission'
import { isSelfOrUsersPermission } from '../access/isSelfOrAdmin'
import { isSuperAdminField } from '../access/isSuperAdmin'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    hidden: hiddenUnlessCollectionPermission('users'),
  },
  // Populates `req.user.role` so `admin.hidden` can read permissions synchronously.
  auth: { depth: 1 },
  access: {
    read: isSelfOrUsersPermission('read'),
    create: collectionPermission('users', 'create'),
    update: isSelfOrUsersPermission('update'),
    delete: collectionPermission('users', 'delete'),
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation !== 'create' || data?.role) return data

        // Only for the very first user (the "create your first user" admin
        // screen, where the role field is hidden) - admin-created users must
        // pick a role explicitly.
        const { totalDocs } = await req.payload.count({ collection: 'users' })
        if (totalDocs > 0) return data

        const { docs } = await req.payload.find({
          collection: 'roles',
          where: { isAdmin: { equals: true } },
          limit: 1,
        })

        if (docs[0] && data) data.role = docs[0].id
        return data
      },
    ],
  },
  fields: [
    // Email added by default
    {
      name: 'role',
      type: 'relationship',
      relationTo: 'roles',
      required: true,
      hasMany: false,
      admin: {
        // Hidden on the "create your first user" screen (no logged-in user
        // yet) - that one gets auto-assigned the admin role, see hooks above.
        condition: (_data, _siblingData, { user }) => Boolean(user),
      },
      // Without this, req.user (from the JWT) never carries the role, so
      // every access-control check resolving it via getUserRole() sees null.
      saveToJWT: true,
      access: {
        create: isSuperAdminField,
        update: isSuperAdminField,
      },
    },
  ],
}
