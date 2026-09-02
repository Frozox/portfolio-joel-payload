'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Children } from 'react'

import FacebookIcon from '@/components/icons/facebook'
import InstagramIcon from '@/components/icons/instagram'
import { cn } from '@/lib/utils'
import { useArtCategory } from '@/providers/artCategoryProvider'
import { useSiteImages } from '@/providers/siteImagesProvider'

type TFooterProps = React.HtmlHTMLAttributes<HTMLElement>
interface FooterElementProps {
  title: string
  children: React.ReactNode
}

const FooterElement = (props: FooterElementProps) => {
  return (
    <li>
      <span className="text-sm font-bold uppercase sm:text-lg">{props.title}</span>
      <ul className="mt-4 grid grid-flow-col grid-rows-6 gap-x-4 text-xs sm:gap-x-6 sm:text-base lg:grid-rows-4">
        {Children.map(props.children, (children) => (
          <li className="pt-1">{children}</li>
        ))}
      </ul>
    </li>
  )
}

const Footer = (props: TFooterProps) => {
  const { artCategories } = useArtCategory()
  const { siteLogo } = useSiteImages()
  const currentPath = usePathname()

  const currentPageStyle = 'underline underline-offset-4 decoration-1'

  return (
    <div {...props}>
      <hr className="my-8 h-[2px] w-full border-t-0 bg-transparent bg-gradient-to-r from-transparent via-foreground to-transparent opacity-25" />
      <div className="flex flex-col space-y-3 text-foreground md:flex-row md:space-y-0">
        <div className="mb-6 flex self-center md:mb-0">
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
            <span className="self-center whitespace-nowrap text-2xl font-semibold">
              Joel Chapeau
            </span>
          </Link>
        </div>
        <div className="w-full justify-end md:flex lg:justify-center">
          <ul className="grid grid-cols-3 gap-8 lg:grid-cols-3">
            <FooterElement title="Navigation">
              <Link href={'/'}>
                <span className={cn(currentPath === '/' && currentPageStyle)}>Accueil</span>
              </Link>
              <Link href={'/expositions'}>
                <span className={cn(currentPath === '/expositions' && currentPageStyle)}>
                  Expositions
                </span>
              </Link>
              <Link href={'/contact'}>
                <span className={cn(currentPath === '/contact' && currentPageStyle)}>Contact</span>
              </Link>
            </FooterElement>
            <FooterElement title="Travaux">
              {...artCategories.map((artCategory) => (
                <Link key={artCategory.slug} href={`/${artCategory.slug}`}>
                  <span className={cn(currentPath === `/${artCategory.slug}` && currentPageStyle)}>
                    {artCategory.name}
                  </span>
                </Link>
              ))}
            </FooterElement>
            <FooterElement title="Réseaux">
              <Link
                rel="noopener noreferrer nofollw external"
                href={'https://www.instagram.com/joelchapeau/'}
                className="flex space-x-2"
                target="_blank"
              >
                <InstagramIcon />
                <span className="flex self-center">Instagram</span>
              </Link>
              <Link
                rel="noopener noreferrer nofollw external"
                href={'https://www.facebook.com/joel.chapeau.7'}
                className="flex space-x-2"
                target="_blank"
              >
                <FacebookIcon />
                <span className="flex self-center">Facebook</span>
              </Link>
            </FooterElement>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Footer
