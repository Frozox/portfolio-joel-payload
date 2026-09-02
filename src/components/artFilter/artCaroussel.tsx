'use client'

import { motion } from 'framer-motion'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import Slider from '@/components/slider/slider'
import { Button } from '@/components/ui/button'
import type { TKeenSlideProps } from '@/components/ui/keenSlider'
import LazyImage from '@/components/ui/lazyImage'
import { ContentLoader } from '@/components/ui/loading'
import { resolveMedia } from '@/lib/media'
import { cn } from '@/lib/utils'
import type { Art } from '@/payload-types'
import { useArtFilter } from '@/providers/artFilterProvider'
import { useContact } from '@/providers/contactProvider'
import { useKeenSlider } from '@/providers/keenSliderProvider'

type TArtCarousselSlider = React.HTMLAttributes<HTMLElement> & {
  name: string
  slides: TArtCarousselImage[]
}

interface TArtCarousselImage {
  url: string
  width: number
  height: number
}

interface TArtCarousselItem {
  id: number
  name: string
  height: number
  width: number
  depth?: number | null
  description?: string | null
  date?: string | null
  sold_out?: boolean
  thumbnail: TArtCarousselImage
  images: TArtCarousselImage[]
  art_tags?: TArtCarousselItemTag[]
}

interface TArtCarousselItemTag {
  id: number
  tag: string
}

export const ArtCarousselSlider = ({ ...props }: TArtCarousselSlider) => {
  const [activeSlide, setActiveSlide] = useState(0)

  return (
    <div className="relative size-full">
      {props.slides.map((image, index) => (
        <div
          key={index}
          className={cn(
            'size-full transition-opacity duration-300 ease-in-out',
            index !== activeSlide && 'size-0 opacity-0',
          )}
        >
          <canvas height={image.height} width={image.width} className="max-h-full max-w-full" />
          <div className="absolute bottom-0">
            <LazyImage
              src={image.url}
              alt={props.name}
              title={props.name}
              width={image.width}
              height={image.height}
            />
          </div>
        </div>
      ))}
      <div className="absolute inset-x-0 bottom-2 flex justify-center gap-3">
        {props.slides.length > 1 &&
          props.slides.map((image, index) => (
            <div
              key={index}
              className={cn(
                'size-4 cursor-pointer rounded-full border border-black bg-white transition-all duration-300 ease-in-out',
                index === activeSlide && 'w-8',
              )}
              onClick={() => {
                setActiveSlide(index)
              }}
            />
          ))}
      </div>
    </div>
  )
}

export const ArtCaroussel = () => {
  const { paginatedArts, selectOnlyTag } = useArtFilter()
  const { sliderInstance, setSlides, slides: keenSlides } = useKeenSlider()
  const { savedArts, toggleSavedArt } = useContact()

  const selectedArtItemRef = useRef<HTMLDivElement>(null)

  const artItems = useMemo<TArtCarousselItem[]>(
    () =>
      paginatedArts.map((art: Art): TArtCarousselItem => {
        const thumbnail = resolveMedia(art.thumbnail)

        return {
          id: art.id,
          name: art.name,
          thumbnail: {
            url: thumbnail?.url ?? '',
            width: thumbnail?.width ?? 0,
            height: thumbnail?.height ?? 0,
          },
          images: (art.images ?? [])
            .map((image) => resolveMedia(image))
            .filter((image): image is NonNullable<typeof image> => image !== null)
            .map((image) => ({ url: image.url, width: image.width, height: image.height })),
          art_tags: (art.art_tags ?? [])
            .filter((tag): tag is Exclude<typeof tag, number> => typeof tag !== 'number')
            .map((tag) => ({ id: tag.id, tag: tag.tag })),
          height: art.height,
          width: art.width,
          depth: art.depth,
          description: art.description,
          date: art.date,
          sold_out: art.sold_out,
        }
      }),
    [paginatedArts],
  )

  const slides = useMemo<TKeenSlideProps[]>(() => {
    return artItems.map((item): TKeenSlideProps => ({
      children: (
        <div
          className="flex size-full flex-col justify-center px-2 lg:flex-row lg:px-4"
          key={item.id}
        >
          <div className="self-center lg:self-auto">
            <ArtCarousselSlider name={item.name} slides={[item.thumbnail, ...item.images]} />
          </div>
          <div className="mt-6 flex lg:relative lg:mx-10 lg:mt-0 lg:w-64 lg:justify-start lg:self-end">
            <div>
              <h2 className="mb-4 text-xl font-medium md:text-2xl">{item.name}</h2>
              <div>
                {item.description && (
                  <p className="mb-4 text-justify text-foreground">{item.description}</p>
                )}
                {!!item.art_tags?.length && (
                  <div className="mb-4">
                    {item.art_tags.map((tag) => (
                      <span
                        className="mr-2 inline-block cursor-pointer truncate text-foreground underline decoration-2 underline-offset-4 hover:underline-offset-2"
                        key={tag.id}
                        onClick={() => {
                          selectOnlyTag(tag.id)
                        }}
                      >
                        {tag.tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:space-y-0">
                  <p>
                    {!!item.depth &&
                      `${item.height.toFixed()} x ${item.width.toFixed()} x ${item.depth.toFixed()} cm`}
                    {!item.depth && `${item.height.toFixed()} x ${item.width.toFixed()} cm`}
                  </p>
                  {item.date && <p>{item.date}</p>}
                </div>
                <div className={cn(item.sold_out ? 'cursor-not-allowed' : 'cursor-pointer')}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      toggleSavedArt({
                        id: item.id,
                        name: item.name,
                        thumbnail: item.thumbnail,
                      })
                    }}
                    disabled={item.sold_out ?? false}
                    className="mt-4 w-fit border-foreground bg-transparent p-6 text-xl text-foreground hover:bg-foreground hover:text-background md:min-w-60 md:text-2xl"
                  >
                    {item.sold_out
                      ? 'Indisponible'
                      : savedArts.find((savedArt) => savedArt.id === item.id)
                        ? 'Enregistré 💾'
                        : 'Enregistrer'}
                  </Button>
                </div>
                <p className="mt-4 text-sm text-foreground">
                  les œuvres enregistrés se retrouvent dans la page de contact
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artItems, savedArts, toggleSavedArt, selectOnlyTag])

  useEffect(() => {
    setSlides(slides)
  }, [slides, setSlides])

  const selectArtItem = (e: React.MouseEvent<HTMLElement>, artItem: TArtCarousselItem) => {
    if (window.scrollY === 0) {
      sliderInstance.current?.moveToIdx(artItems.indexOf(artItem))
      return
    }

    const scrollController = new AbortController()

    setTimeout(() => {
      window.scrollTo({ top: 0 })
    }, 200)

    window.addEventListener(
      'scroll',
      () => {
        if (window.scrollY > 0) return
        sliderInstance.current?.moveToIdx(artItems.indexOf(artItem))
        scrollController.abort()
      },
      { signal: scrollController.signal },
    )
  }

  return (
    <div>
      <ContentLoader
        isLoading={!keenSlides.length && !!slides.length}
        isError={false}
        className="flex h-[30vh] py-2 lg:h-[calc(100vh-15rem)]"
      >
        <motion.div className="flex py-2 lg:h-[calc(100vh-15rem)]" ref={selectedArtItemRef}>
          <Slider className="relative" />
        </motion.div>
      </ContentLoader>
      <div className="md:container">
        <div className="columns-2 justify-center gap-4 space-y-4 p-2 lg:columns-3 lg:p-8">
          {artItems.map((artItem) => (
            <motion.div
              key={artItem.id}
              className="h-min w-full"
              whileHover={{ scale: 0.98 }}
              onClick={(e) => {
                selectArtItem(e, artItem)
              }}
            >
              <LazyImage
                src={artItem.thumbnail.url}
                alt={artItem.name}
                title={artItem.name}
                width={artItem.thumbnail.width}
                height={artItem.thumbnail.height}
                className="cursor-pointer object-contain"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
