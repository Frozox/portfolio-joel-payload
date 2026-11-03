import type { Access } from 'payload'

import { getUserRole } from './getUserRole'

/**
 * Anonymous visitors (public frontend) always read. Logged-in users need the
 * role's read permission - returning `false` is what hides the collection
 * from the admin nav and dashboard.
 */
export const publicOrCollectionRead = (collectionSlug: string): Access => {
  return async ({ req }) => {
    if (!req.user) return true
    const role = await getUserRole(req)
    const permission = role?.collections?.find((entry) => entry.collection === collectionSlug)
    return Boolean(role?.isAdmin || permission?.read)
  }
}

export const publicOrGlobalRead = (globalSlug: string): Access => {
  return async ({ req }) => {
    if (!req.user) return true
    const role = await getUserRole(req)
    const permission = role?.globals?.find((entry) => entry.global === globalSlug)
    return Boolean(role?.isAdmin || permission?.read)
  }
}
