import type { Access, FieldAccess } from 'payload'

import { getUserRole } from './getUserRole'

export const isSuperAdmin: Access = async ({ req }) => {
  if (!req.user) return false
  const role = await getUserRole(req)
  return Boolean(role?.isAdmin)
}

export const isSuperAdminField: FieldAccess = async ({ req }) => {
  if (!req.user) return false
  const role = await getUserRole(req)
  return Boolean(role?.isAdmin)
}
