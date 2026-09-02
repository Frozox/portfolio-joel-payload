'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'

import type { Art, ArtTag, ArtTagCategory } from '@/payload-types'

export const ART_PAGE_SIZE = 20

interface TArtFilterContext {
  /** Full, unfiltered list of arts for the current category. */
  arts: Art[]
  /** Tag categories (with their tags populated) usable as filter checkboxes. */
  tagCategories: ArtTagCategory[]
  /** Arts matching the current tag selection. */
  filteredArts: Art[]
  /** Current page slice of `filteredArts`. */
  paginatedArts: Art[]
  selectedTagIds: number[]
  toggleTag: (tagId: number) => void
  /** Replaces the whole selection with a single tag (used from the carousel). */
  selectOnlyTag: (tagId: number) => void
  clearFilters: () => void
  page: number
  pageSize: number
  pageCount: number
  setPage: (page: number) => void
}

const ArtFilterContext = createContext<TArtFilterContext>({
  arts: [],
  tagCategories: [],
  filteredArts: [],
  paginatedArts: [],
  selectedTagIds: [],
  toggleTag: () => {},
  selectOnlyTag: () => {},
  clearFilters: () => {},
  page: 1,
  pageSize: ART_PAGE_SIZE,
  pageCount: 1,
  setPage: () => {},
})

export const useArtFilter = () => useContext(ArtFilterContext)

const getTagIds = (art: Art) =>
  (art.art_tags ?? []).map((tag) => (typeof tag === 'number' ? tag : tag.id))

interface TArtFilterProviderProps {
  children: React.ReactNode
  arts: Art[]
  tagCategories: ArtTagCategory[]
}

/**
 * Everything here runs purely client-side, in-memory: the whole category's
 * arts + tag categories are fetched once, server-side, by the parent layout
 * and passed as props. Filtering/pagination never triggers a refetch.
 */
export const ArtFilterProvider = ({ children, arts, tagCategories }: TArtFilterProviderProps) => {
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [page, setPage] = useState(1)

  const tagIdToCategoryId = useMemo(() => {
    const map = new Map<number, number>()
    tagCategories.forEach((category) => {
      const tags = (category.art_tags?.docs ?? []) as (number | ArtTag)[]
      tags.forEach((tag) => {
        if (typeof tag !== 'number') map.set(tag.id, category.id)
      })
    })
    return map
  }, [tagCategories])

  const filteredArts = useMemo(() => {
    if (selectedTagIds.length === 0) return arts

    const selectedByCategory = new Map<number, number[]>()
    selectedTagIds.forEach((tagId) => {
      const categoryId = tagIdToCategoryId.get(tagId)
      if (categoryId === undefined) return
      selectedByCategory.set(categoryId, [...(selectedByCategory.get(categoryId) ?? []), tagId])
    })

    return arts.filter((art) => {
      const artTagIds = getTagIds(art)
      return Array.from(selectedByCategory.values()).every((tagIdsInCategory) =>
        tagIdsInCategory.some((tagId) => artTagIds.includes(tagId)),
      )
    })
  }, [arts, selectedTagIds, tagIdToCategoryId])

  const pageCount = Math.max(1, Math.ceil(filteredArts.length / ART_PAGE_SIZE))
  const paginatedArts = filteredArts.slice((page - 1) * ART_PAGE_SIZE, page * ART_PAGE_SIZE)

  const toggleTag = (tagId: number) => {
    setPage(1)
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    )
  }

  const selectOnlyTag = (tagId: number) => {
    setPage(1)
    setSelectedTagIds([tagId])
  }

  const clearFilters = () => {
    setPage(1)
    setSelectedTagIds([])
  }

  return (
    <ArtFilterContext.Provider
      value={{
        arts,
        tagCategories,
        filteredArts,
        paginatedArts,
        selectedTagIds,
        toggleTag,
        selectOnlyTag,
        clearFilters,
        page,
        pageSize: ART_PAGE_SIZE,
        pageCount,
        setPage,
      }}
    >
      {children}
    </ArtFilterContext.Provider>
  )
}
