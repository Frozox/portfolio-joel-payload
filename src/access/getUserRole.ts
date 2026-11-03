import type { Payload, PayloadRequest } from 'payload'

export type RoleDoc = {
  id: number
  isAdmin?: boolean | null
  collections?:
    | {
        collection: string
        read?: boolean | null
        create?: boolean | null
        update?: boolean | null
        delete?: boolean | null
      }[]
    | null
  globals?:
    | {
        global: string
        read?: boolean | null
        update?: boolean | null
      }[]
    | null
  viewAnalytics?: boolean | null
  viewSentry?: boolean | null
}

/** Fetches a Role doc from a relationship value (id or populated doc). */
export const resolveRole = async (
  payload: Payload,
  roleRef: number | RoleDoc | null | undefined,
): Promise<RoleDoc | null> => {
  if (!roleRef) return null
  const roleId = typeof roleRef === 'object' ? roleRef.id : roleRef

  return payload
    .findByID({ collection: 'roles', id: roleId, depth: 0 })
    .then((doc) => doc as unknown as RoleDoc)
    .catch(() => null)
}

/**
 * Resolves (and caches on `req.context` for the request's lifetime) the Role
 * doc for the currently authenticated user - `user.role` is usually just an
 * id, not populated, under the default auth strategy depth.
 */
export const getUserRole = async (req: PayloadRequest): Promise<RoleDoc | null> => {
  const user = req.user
  if (!user) return null

  if (req.context && 'userRole' in req.context) {
    return req.context.userRole as RoleDoc | null
  }

  const role = await resolveRole(req.payload, (user as { role?: number | RoleDoc | null }).role)

  if (req.context) req.context.userRole = role

  return role
}
