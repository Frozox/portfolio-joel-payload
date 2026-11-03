import type { Access, Where } from 'payload'

import { getUserRole } from './getUserRole'

/**
 * Admins can manage any user; everyone else can only read/update their own doc.
 */
export const isSelfOrAdmin: Access = async ({ req }) => {
  if (!req.user) return false
  const role = await getUserRole(req)
  if (role?.isAdmin) return true
  return { id: { equals: req.user.id } }
}

/**
 * Same as `isSelfOrAdmin`, but also grants access to anyone whose role has
 * the given permission on the `users` collection (customizable via Roles).
 */
export const isSelfOrUsersPermission = (operation: 'read' | 'update'): Access => {
  return async ({ req }): Promise<boolean | Where> => {
    if (!req.user) return false
    const role = await getUserRole(req)
    if (role?.isAdmin) return true
    const permission = role?.collections?.find((entry) => entry.collection === 'users')
    if (permission?.[operation]) {
      // Delegated editors must not touch admin accounts (email/password takeover).
      if (operation === 'update') {
        const query: Where = {
          or: [{ id: { equals: req.user.id } }, { 'role.isAdmin': { not_equals: true } }],
        }
        return query
      }
      return true
    }
    return { id: { equals: req.user.id } }
  }
}
