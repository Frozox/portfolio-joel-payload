'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

import { resolveMedia } from '@/lib/media'
import type { Art } from '@/payload-types'

const STORAGE_KEY = 'savedArts'

export interface TSavedArt {
  id: number
  name: string
  thumbnail: {
    url: string
    width: number
    height: number
  }
}

interface TContactContext {
  savedArts: TSavedArt[]
  toggleSavedArt: (art: TSavedArt) => void
  clearSavedArts: () => void
}

const ContactContext = createContext<TContactContext>({
  savedArts: [],
  toggleSavedArt: () => {},
  clearSavedArts: () => {},
})

export const useContact = () => useContext(ContactContext)

interface TContactProviderProps {
  children: React.ReactNode
}

/**
 * Saved arts are kept in localStorage (client-only, by definition), so on
 * mount we re-hydrate the full art details (name/thumbnail) for the saved
 * ids with a plain `fetch` against Payload's built-in REST API - this is the
 * one spot in the app that can't be a server-fetched prop, since the ids
 * live in the browser's localStorage.
 */
export const ContactProvider = ({ children }: TContactProviderProps) => {
  const [savedArts, setSavedArts] = useState<TSavedArt[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const rehydrate = async () => {
      let savedIds: number[] = []
      try {
        const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
        if (Array.isArray(raw) && raw.every((id) => typeof id === 'number')) {
          savedIds = raw
        }
      } catch {
        savedIds = []
      }

      if (savedIds.length === 0) {
        setHydrated(true)
        return
      }

      const params = new URLSearchParams({
        'where[id][in]': savedIds.join(','),
        'where[sold_out][equals]': 'false',
        depth: '1',
        limit: '0',
      })

      try {
        const res = await fetch(`/api/arts?${params.toString()}`)
        const { docs } = (await res.json()) as { docs: Art[] }

        setSavedArts(
          docs.map((art) => {
            const thumbnail = resolveMedia(art.thumbnail)
            return {
              id: art.id,
              name: art.name,
              thumbnail: {
                url: thumbnail?.url ?? '',
                width: thumbnail?.width ?? 0,
                height: thumbnail?.height ?? 0,
              },
            }
          }),
        )
      } finally {
        setHydrated(true)
      }
    }

    void rehydrate()
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedArts.map((art) => art.id)))
  }, [savedArts, hydrated])

  const toggleSavedArt = (art: TSavedArt) => {
    setSavedArts((prev) =>
      prev.find((savedArt) => savedArt.id === art.id)
        ? prev.filter((savedArt) => savedArt.id !== art.id)
        : [...prev, art],
    )
  }

  const clearSavedArts = () => {
    setSavedArts([])
  }

  return (
    <ContactContext.Provider value={{ savedArts, toggleSavedArt, clearSavedArts }}>
      {children}
    </ContactContext.Provider>
  )
}
