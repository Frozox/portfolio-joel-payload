'use client'

import React, { createContext, useContext } from 'react'

interface TResolvedImage {
  url: string
  width: number
  height: number
  alt: string
}

interface TSiteImagesContext {
  homeJoel: TResolvedImage | null
  siteLogo: TResolvedImage | null
}

const SiteImagesContext = createContext<TSiteImagesContext>({
  homeJoel: null,
  siteLogo: null,
})

export const useSiteImages = () => useContext(SiteImagesContext)

interface TSiteImagesProviderProps extends TSiteImagesContext {
  children: React.ReactNode
}

/**
 * Static site images (home portrait, logo) are managed through the
 * `site-images` Payload global instead of being hardcoded `public/` assets.
 * Fetched once server-side (root layout) via Payload's Local API and
 * exposed through context, mirroring `ArtCategoryProvider`.
 */
export const SiteImagesProvider = ({ children, homeJoel, siteLogo }: TSiteImagesProviderProps) => {
  return (
    <SiteImagesContext.Provider value={{ homeJoel, siteLogo }}>
      {children}
    </SiteImagesContext.Provider>
  )
}
