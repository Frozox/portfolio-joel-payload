'use client'

import React, { createContext, useContext } from 'react'

import type { ArtCategory } from '@/payload-types'

interface TArtCategoryContext {
  artCategories: ArtCategory[]
}

const ArtCategoryContext = createContext<TArtCategoryContext>({
  artCategories: [],
})

export const useArtCategory = () => useContext(ArtCategoryContext)

interface TArtCategoryProviderProps {
  children: React.ReactNode
  artCategories: ArtCategory[]
}

/**
 * Unlike the old Strapi frontend (which fetched art categories client-side
 * via react-query), art categories are now fetched once server-side (in the
 * root layout, via Payload's Local API) and simply passed down as props -
 * this provider only exposes that already-fetched data through context, it
 * never fetches anything itself.
 */
export const ArtCategoryProvider = ({ children, artCategories }: TArtCategoryProviderProps) => {
  return (
    <ArtCategoryContext.Provider value={{ artCategories }}>{children}</ArtCategoryContext.Provider>
  )
}
