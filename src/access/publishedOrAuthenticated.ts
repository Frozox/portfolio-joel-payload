import type { Access } from 'payload'

/**
 * Public users only see published documents.
 * Authenticated users (admin, editors) see everything, including drafts.
 */
export const publishedOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) return true

  return {
    _status: {
      equals: 'published',
    },
  }
}
