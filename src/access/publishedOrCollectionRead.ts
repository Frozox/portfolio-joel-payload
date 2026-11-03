import type { Access } from 'payload'

import { getUserRole } from './getUserRole'

/**
 * Public visitors only see published docs (unchanged frontend behaviour).
 * Authenticated dashboard users need the role's read permission on this
 * collection to see everything (drafts included) - admins always pass.
 */
export const publishedOrCollectionRead = (collectionSlug: string): Access => {
  return async ({ req }) => {
    if (req.user) {
      const role = await getUserRole(req)
      const permission = role?.collections?.find((entry) => entry.collection === collectionSlug)
      if (role?.isAdmin || permission?.read) return true
    }

    return { _status: { equals: 'published' } }
  }
}
