import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })

  it('does not let a delegated editor promote themselves or edit admins', async () => {
    const adminRole = await payload.create({
      collection: 'roles',
      data: { name: `test-admin-${Date.now()}`, isAdmin: true },
    })
    const editorRole = await payload.create({
      collection: 'roles',
      data: {
        name: `test-editor-${Date.now()}`,
        collections: [{ collection: 'users', read: true, update: true }],
      },
    })
    const editor = await payload.create({
      collection: 'users',
      data: { email: `editor-${Date.now()}@test.local`, password: 'test', role: editorRole.id },
    })
    const admin = await payload.create({
      collection: 'users',
      data: { email: `admin-${Date.now()}@test.local`, password: 'test', role: adminRole.id },
    })

    try {
      await payload.update({
        collection: 'users',
        id: editor.id,
        data: { role: adminRole.id },
        user: editor,
        overrideAccess: false,
      })
      const reloaded = await payload.findByID({ collection: 'users', id: editor.id, depth: 0 })
      expect(reloaded.role).toBe(editorRole.id)

      await expect(
        payload.update({
          collection: 'users',
          id: admin.id,
          data: { email: `hijack-${Date.now()}@test.local` },
          user: editor,
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    } finally {
      await payload.delete({ collection: 'users', id: editor.id })
      await payload.delete({ collection: 'users', id: admin.id })
      await payload.delete({ collection: 'roles', id: editorRole.id })
      await payload.delete({ collection: 'roles', id: adminRole.id })
    }
  })
})
