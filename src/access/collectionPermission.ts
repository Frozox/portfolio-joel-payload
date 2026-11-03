import type { Access, FieldAccess } from 'payload'

import { getUserRole } from './getUserRole'

type CollectionOperation = 'create' | 'delete' | 'read' | 'update'

/**
 * Collection-level CRUD gate driven by the user's role doc (see Roles
 * collection). Admins (role.isAdmin) always pass.
 */
export const collectionPermission = (
  collectionSlug: string,
  operation: CollectionOperation,
): Access => {
  return async ({ req }) => {
    if (!req.user) return false
    const role = await getUserRole(req)
    if (role?.isAdmin) return true
    const permission = role?.collections?.find((entry) => entry.collection === collectionSlug)
    return Boolean(permission?.[operation])
  }
}

/** Same gate as `collectionPermission`, usable as a field-level access function. */
export const collectionPermissionField = (
  collectionSlug: string,
  operation: CollectionOperation,
): FieldAccess => {
  return async ({ req }) => {
    if (!req.user) return false
    const role = await getUserRole(req)
    if (role?.isAdmin) return true
    const permission = role?.collections?.find((entry) => entry.collection === collectionSlug)
    return Boolean(permission?.[operation])
  }
}
