'use client'

import Link from 'next/link'
import { useEffect, useMemo } from 'react'

import Slider from '@/components/slider/slider'
import { Button } from '@/components/ui/button'
import { DirectionAwareHover } from '@/components/ui/directionAwareHover'
import type { TKeenSlideProps } from '@/components/ui/keenSlider'
import { ContentLoader } from '@/components/ui/loading'
import { resolveMedia } from '@/lib/media'
import { useArtCategory } from '@/providers/artCategoryProvider'
import { useKeenSlider } from '@/providers/keenSliderProvider'

const HomeSlider = () => {
  const { artCategories } = useArtCategory()
  const { setSlides, slides: keenSlides } = useKeenSlider()

  const slides = useMemo<TKeenSlideProps[]>(() => {
    if (artCategories.length === 0) return []

    return artCategories.map((item) => {
      const image = resolveMedia(item.image)

      return {
        children: (
          <DirectionAwareHover imageUrl={image?.url ?? ''}>
            <div className="m-4">
              <p className="pb-10 text-5xl md:text-6xl">{item.name}</p>
              <Link href={`/${item.slug}`}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-fit border-white bg-transparent p-6 text-xl hover:bg-background md:min-w-60 md:text-2xl"
                >
                  Voir les travaux
                </Button>
              </Link>
            </div>
          </DirectionAwareHover>
        ),
      }
    })
  }, [artCategories])

  useEffect(() => {
    setSlides(slides)
  }, [slides, setSlides])

  return (
    <ContentLoader
      isLoading={!keenSlides.length && !!slides.length}
      isError={false}
      className="h-[30vh] w-full lg:h-[50vh] xl:h-[70vh] 2xl:h-[80vh]"
    >
      <Slider className="lg:h-[50vh] xl:h-[70vh] 2xl:h-[80vh]" />
    </ContentLoader>
  )
}

export default HomeSlider
