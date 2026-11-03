import type { Access } from 'payload'

import { getUserRole } from './getUserRole'

type GlobalOperation = 'read' | 'update'

export const globalPermission = (globalSlug: string, operation: GlobalOperation): Access => {
  return async ({ req }) => {
    if (!req.user) return false
    const role = await getUserRole(req)
    if (role?.isAdmin) return true
    const permission = role?.globals?.find((entry) => entry.global === globalSlug)
    return Boolean(permission?.[operation])
  }
}
