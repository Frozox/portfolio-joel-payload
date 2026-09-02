'use client'

import { AlignJustifyIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { HTMLAttributes } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu'
import { cn } from '@/lib/utils'
import { useArtCategory } from '@/providers/artCategoryProvider'
import { useContact } from '@/providers/contactProvider'
import { useSiteImages } from '@/providers/siteImagesProvider'

interface MainNavProps extends HTMLAttributes<HTMLElement> {
  className: string
}

const MainNav = ({ className }: MainNavProps) => {
  const [dropdownOpened, setDropDownOpened] = useState<boolean>(false)
  const { artCategories } = useArtCategory()
  const { savedArts } = useContact()
  const { siteLogo } = useSiteImages()
  const currentPath = usePathname()

  const mobileDropDownButtonRef = useRef<HTMLButtonElement>(null)
  const mobileDropDownRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = useCallback(() => {
    setDropDownOpened(!dropdownOpened)
  }, [dropdownOpened])

  useEffect(() => {
    const handleOutSideClick = (e: MouseEvent) => {
      if (!dropdownOpened || mobileDropDownButtonRef.current == e.target) return
      if (!mobileDropDownRef.current?.contains(e.target as Node)) toggleDropdown()
    }

    window.addEventListener('mousedown', handleOutSideClick)

    return () => {
      window.removeEventListener('mousedown', handleOutSideClick)
    }
  }, [mobileDropDownRef, dropdownOpened, toggleDropdown])

  const currentPageStyle = 'underline underline-offset-4 decoration-2'

  return (
    <nav className={cn('fixed z-50', className)}>
      <div className="mx-auto flex flex-wrap items-center justify-between px-10 py-8">
        <Link href={'/'} className="flex items-center space-x-3 rtl:space-x-reverse">
          {siteLogo && (
            <Image
              src={siteLogo.url}
              alt="Joel Chapeau"
              width={100}
              height={179}
              className="h-8 w-auto dark:invert"
            />
          )}
          <span className="self-center whitespace-nowrap text-2xl font-semibold text-foreground">
            Joel Chapeau
          </span>
        </Link>
        <Button
          ref={mobileDropDownButtonRef}
          onClick={toggleDropdown}
          type="button"
          variant="ghost"
          className="relative inline-flex size-10 items-center justify-center rounded-lg p-1 text-sm text-black focus:outline-none focus:ring-2 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-200 md:hidden"
        >
          <span className="sr-only">Ouvrir le menu</span>
          <AlignJustifyIcon className="pointer-events-none size-full" />
          {savedArts.length > 0 && !dropdownOpened && (
            <span className="absolute -right-3 -top-3 flex size-5 items-center justify-center rounded-full bg-red-600 p-2 text-sm text-white">
              {savedArts.length}
            </span>
          )}
        </Button>
        <div
          ref={mobileDropDownRef}
          onClick={(e) => e.target instanceof HTMLAnchorElement && toggleDropdown()}
          className={cn(
            'mt-4 w-full rounded-b-lg border border-t-0 bg-background md:block md:w-auto md:border-none',
            !dropdownOpened && 'hidden',
          )}
        >
          <ul className="flex flex-col p-4 text-lg font-medium md:mt-0 md:flex-row md:space-x-8 md:p-0 rtl:space-x-reverse">
            <li>
              <Link
                href="/"
                className={cn(
                  'block rounded px-3 py-2 text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 md:border-0 md:p-0 md:hover:bg-transparent md:dark:hover:bg-transparent',
                  currentPath === '/' && currentPageStyle,
                )}
              >
                Accueil
              </Link>
            </li>
            <li className="hidden md:block">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={artCategories.length === 0}
                    className="block cursor-pointer rounded px-3 py-2 text-black hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50 dark:text-white dark:hover:bg-gray-700 md:border-0 md:p-0 md:hover:bg-transparent md:dark:hover:bg-transparent"
                  >
                    Travaux
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {artCategories.map((category) => (
                    <DropdownMenuItem key={category.id} asChild>
                      <Link
                        href={`/${category.slug}`}
                        className={cn(
                          'size-full text-lg',
                          `/${category.slug}` === currentPath && currentPageStyle,
                        )}
                      >
                        {category.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            <li className="px-3 py-2 md:hidden">
              <div className="text-foreground opacity-50">Travaux</div>
              <ul>
                {artCategories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/${category.slug}`}
                      className={cn(
                        'block rounded px-3 py-2 text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 md:border-0 md:p-0 md:hover:bg-transparent md:dark:hover:bg-transparent',
                        `/${category.slug}` === currentPath && currentPageStyle,
                      )}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <Link
                href="/expositions"
                className={cn(
                  'block rounded px-3 py-2 text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 md:border-0 md:p-0 md:hover:bg-transparent md:dark:hover:bg-transparent',
                  currentPath === '/expositions' && currentPageStyle,
                )}
              >
                Expositions
              </Link>
            </li>
            <li className="relative">
              <Link
                href="/contact"
                className={cn(
                  'block rounded px-3 py-2 text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 md:border-0 md:p-0 md:hover:bg-transparent md:dark:hover:bg-transparent',
                  currentPath === '/contact' && currentPageStyle,
                )}
              >
                Contact
              </Link>
              {savedArts.length > 0 && (
                <span className="absolute -top-1 left-20 flex size-5 items-center justify-center rounded-full bg-red-600 p-2 text-sm text-white md:-right-5 md:-top-2 md:left-auto">
                  {savedArts.length}
                </span>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default MainNav
