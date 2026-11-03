import type { Access } from 'payload'

import { getUserRole } from './getUserRole'

/**
 * Anonymous visitors only see published docs (unchanged frontend behaviour).
 * Authenticated dashboard users need the role's read permission on this
 * collection - admins always pass. Returning `false` (not a query) for them
 * is what hides the collection from the admin nav and dashboard.
 */
export const publishedOrCollectionRead = (collectionSlug: string): Access => {
  return async ({ req }) => {
    if (!req.user) return { _status: { equals: 'published' } }

    const role = await getUserRole(req)
    const permission = role?.collections?.find((entry) => entry.collection === collectionSlug)
    return Boolean(role?.isAdmin || permission?.read)
  }
}
