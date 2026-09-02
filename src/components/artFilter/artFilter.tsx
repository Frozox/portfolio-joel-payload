'use client'

import useEventListener from '@use-it/event-listener'
import * as KeyCode from 'keycode-js'
import { FilterIcon, Trash2Icon } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigationMenu'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/lib/utils'
import { useArtFilter } from '@/providers/artFilterProvider'

interface TFilterCategory {
  id: string | number
  name: string
}

interface TFilterItem {
  tagId: string | number
  categoryId: string | number
  value: string
  checked: boolean
}

export const ArtFilterCheckboxList = ({
  name,
  children,
}: TFilterCategory & { children: React.ReactNode }) => {
  return (
    <div>
      <div>{name}</div>
      <ul>{children}</ul>
    </div>
  )
}

export const ArtFilterCheckboxItem = ({
  tagId,
  categoryId,
  value,
  checked,
  ...props
}: TFilterItem & React.HTMLAttributes<HTMLElement>) => {
  return (
    <li>
      <Checkbox
        checked={checked}
        className="mr-2"
        id={`filter-${categoryId.toString()}-${tagId.toString()}`}
        {...props}
      />
      <label
        className="cursor-pointer select-none"
        htmlFor={`filter-${categoryId.toString()}-${tagId.toString()}`}
      >
        {value}
      </label>
    </li>
  )
}

export const ArtFilterPagination = ({ className }: { className: string }) => {
  const { page, pageCount, setPage } = useArtFilter()

  const [extraPagesToDisplay, setExtraPagesToDisplay] = useState(0)

  // Switch pages with arrows
  useEventListener('keydown', (e: KeyboardEvent) => {
    if (KeyCode.CODE_LEFT === e.code && page > 1) setPage(page - 1)
    else if (KeyCode.CODE_RIGHT === e.code && page < pageCount) setPage(page + 1)
  })

  useEffect(() => {
    let extraPagesCount = 0
    if (page > 2) extraPagesCount++
    if (page < pageCount - 1) extraPagesCount++
    if (pageCount === 3 && page === 2) extraPagesCount++
    if (pageCount > 3) extraPagesCount++
    setExtraPagesToDisplay(extraPagesCount)
  }, [page, pageCount])

  return (
    <div className={cn('select-none', className)}>
      <hr className="mb-2 h-px w-full border-t-0 bg-transparent bg-gradient-to-r from-transparent via-foreground to-transparent opacity-25" />
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <button
              type="button"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className={cn(page <= 1 && 'opacity-50')}
            >
              <PaginationPrevious />
            </button>
          </PaginationItem>
          {Array.from({ length: 3 }).map((_, i) => (
            <React.Fragment key={i}>
              {(i === 0 && (
                <>
                  <PaginationItem>
                    <PaginationLink isActive={page <= 1}>
                      <button
                        type="button"
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        className="size-full"
                      >
                        1
                      </button>
                    </PaginationLink>
                  </PaginationItem>
                  {page > 3 && pageCount !== 4 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </>
              )) ||
                (i === 2 && pageCount > 1 && (
                  <>
                    {page < pageCount - 2 && pageCount !== 4 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink isActive={page >= pageCount}>
                        <button
                          type="button"
                          onClick={() => setPage(pageCount)}
                          disabled={page === pageCount}
                          className="size-full"
                        >
                          {pageCount}
                        </button>
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )) || (
                  <>
                    {Array.from({ length: extraPagesToDisplay }).map((_, j) => {
                      const targetPage =
                        page <= 2 ? j + 2 : page >= pageCount ? j + page - 2 : j + page - 1

                      return (
                        <React.Fragment key={j}>
                          <PaginationItem>
                            <PaginationLink isActive={page === targetPage}>
                              <button
                                type="button"
                                onClick={() => setPage(targetPage)}
                                disabled={page === targetPage}
                                className="size-full"
                              >
                                {targetPage}
                              </button>
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      )
                    })}
                  </>
                )}
            </React.Fragment>
          ))}
          <PaginationItem>
            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={page >= pageCount}
              className={cn(page >= pageCount && 'opacity-50')}
            >
              <PaginationNext />
            </button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <hr className="mt-2 h-px w-full border-t-0 bg-transparent bg-gradient-to-r from-transparent via-foreground to-transparent opacity-25" />
    </div>
  )
}

export const ArtFilter = ({ className }: { className?: string }) => {
  const { tagCategories, selectedTagIds, toggleTag, clearFilters } = useArtFilter()

  return (
    <div className={cn('fixed z-40 w-full sm:px-5', className)}>
      <hr className="h-px w-full border-t-0 bg-transparent bg-gradient-to-r from-transparent via-foreground to-transparent opacity-25" />
      <NavigationMenu className="max-w-full space-x-2 sm:justify-start sm:space-x-0">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger disabled={tagCategories.length === 0}>
              <div className="inline-flex">
                <FilterIcon />
                <span className="ml-1 hidden items-center justify-center sm:flex">Filtres</span>
                <span className="mx-1 rounded-lg bg-foreground p-1 text-xs text-background sm:ml-2">
                  {selectedTagIds.length}
                </span>
              </div>
            </NavigationMenuTrigger>
            <NavigationMenuContent className="grid w-[calc(100vw-1rem)] grid-cols-2 gap-4 p-4 md:w-[600px] md:grid-cols-4">
              {tagCategories.map((category) => (
                <ArtFilterCheckboxList
                  key={category.id}
                  id={category.id}
                  name={category.display_name}
                >
                  {(category.art_tags?.docs ?? [])
                    .filter((tag) => typeof tag !== 'number')
                    .map((tag) => (
                      <ArtFilterCheckboxItem
                        key={tag.id}
                        tagId={tag.id}
                        categoryId={category.id}
                        value={tag.tag}
                        checked={selectedTagIds.includes(tag.id)}
                        onClick={() => toggleTag(tag.id)}
                      />
                    ))}
                </ArtFilterCheckboxList>
              ))}
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuList>
          <NavigationMenuItem>
            <button
              disabled={selectedTagIds.length === 0}
              type="button"
              onClick={clearFilters}
              className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
            >
              <div className="inline-flex">
                <Trash2Icon />
                <span className="ml-1 hidden items-center justify-center sm:flex">Vider</span>
              </div>
            </button>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <hr className="h-px w-full border-t-0 bg-transparent bg-gradient-to-r from-transparent via-foreground to-transparent opacity-25" />
    </div>
  )
}
