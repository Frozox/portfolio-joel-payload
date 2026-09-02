import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { Product, WithContext } from 'schema-dts'

import { ArtFilter } from '@/components/artFilter/artFilter'
import JsonLdLoader from '@/components/seo/jsonLdLoader'
import { Title } from '@/components/ui/title'
import { resolveMedia } from '@/lib/media'
import { getArtCategoryBySlug, getArtsByCategory } from '@/lib/payload-data'
import type { ArtTagCategory } from '@/payload-types'
import { ArtFilterProvider } from '@/providers/artFilterProvider'

interface TLayoutProps {
  children: React.ReactNode
  params: Promise<{
    categorySlug: string
  }>
}

const getCurrentArtCategory = async (slug: string) => {
  const category = await getArtCategoryBySlug(slug)
  if (!category) notFound()
  return category
}

export const generateMetadata = async ({ params }: TLayoutProps): Promise<Metadata> => {
  const { categorySlug } = await params
  const currentArtCategory = await getCurrentArtCategory(categorySlug)

  return {
    title: currentArtCategory.meta?.title ?? currentArtCategory.name,
    description: currentArtCategory.meta?.description ?? undefined,
    keywords: currentArtCategory.meta?.keywords ?? undefined,
    alternates: {
      canonical: currentArtCategory.slug,
    },
  }
}

const CategoryLayout = async ({ children, params }: Readonly<TLayoutProps>) => {
  const { categorySlug } = await params
  const currentArtCategory = await getCurrentArtCategory(categorySlug)

  const tagCategories = (currentArtCategory.art_tag_categories ?? []).filter(
    (tagCategory): tagCategory is ArtTagCategory => typeof tagCategory !== 'number',
  )
  const arts = await getArtsByCategory(currentArtCategory.id)

  const image = resolveMedia(currentArtCategory.meta?.image ?? currentArtCategory.image)

  const artCategoryStructuredJsonLd: WithContext<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: currentArtCategory.name,
    image: image?.url,
    description: currentArtCategory.meta?.description ?? undefined,
  }

  return (
    <>
      <JsonLdLoader key={currentArtCategory.slug} jsonLd={artCategoryStructuredJsonLd} />
      <ArtFilterProvider arts={arts} tagCategories={tagCategories}>
        <div className="h-11">
          <ArtFilter className="sticky mx-auto h-11 max-w-[2500px] bg-background md:fixed" />
        </div>
        <div className="h-[calc(100%-2.75rem)] w-full">
          <Title
            h1={currentArtCategory.name}
            h2={currentArtCategory.title}
            className="mb-8 mt-14 lg:mb-0"
          />
          {children}
        </div>
      </ArtFilterProvider>
    </>
  )
}

export default CategoryLayout
