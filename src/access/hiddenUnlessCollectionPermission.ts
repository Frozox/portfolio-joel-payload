import type { RoleDoc } from './getUserRole'

/**
 * Sync nav visibility for `admin.hidden`: relies on `auth.depth >= 1` so that
 * `user.role` arrives populated. Visibility only - real checks stay in `access`.
 */
export const hiddenUnlessCollectionPermission =
  (collectionSlug: string) =>
  ({ user }: { user?: unknown }): boolean => {
    const role = (user as { role?: unknown } | undefined)?.role
    if (!role || typeof role !== 'object') return false

    const { isAdmin, collections } = role as RoleDoc
    if (isAdmin) return false

    const permission = collections?.find((entry) => entry.collection === collectionSlug)
    return !(permission?.read || permission?.create || permission?.update || permission?.delete)
  }
