'use client'

import { QuoteIcon } from 'lucide-react'
import Image from 'next/image'

import HomeSlider from '@/components/slider/homeSlider'
import { Title } from '@/components/ui/title'
import { easeInOutBack } from '@/lib/easing'
import { autoSlider, moveToSelectedSlide } from '@/lib/keenPlugins'
import { KeenSliderProvider } from '@/providers/keenSliderProvider'
import { useSiteImages } from '@/providers/siteImagesProvider'

const HomePage = () => {
  const { homeJoel } = useSiteImages()

  return (
    <>
      <Title h1="joel chapeau" h2="Bienvenue dans mon univers artistique" className="mb-10 mt-5" />
      <div className="size-full">
        <div className="h-full animate-content-load">
          <div className="items-center lg:flex lg:h-full">
            <KeenSliderProvider
              options={{
                mode: 'snap',
                slides: {
                  perView: 2,
                  spacing: 20,
                  origin: 'center',
                },
                defaultAnimation: {
                  duration: 1800,
                  easing: easeInOutBack,
                },
                breakpoints: {
                  '(max-width: 1024px)': {
                    slides: {
                      perView: 1,
                      spacing: 20,
                      origin: 'center',
                    },
                  },
                },
              }}
              plugins={[autoSlider, moveToSelectedSlide]}
            >
              <HomeSlider />
            </KeenSliderProvider>
          </div>
          <div className="container mt-12 flex flex-col items-center justify-center pb-10 text-center text-base md:text-lg">
            {homeJoel && (
              <Image
                src={homeJoel.url}
                className="rounded-full"
                height={200}
                width={200}
                alt="joel"
              />
            )}
            <div className="relative mt-6">
              <QuoteIcon size={40} className="absolute" />
              <p className="pb-6 text-2xl">Bienvenue</p>
              <p>
                Je m&apos;appelle Joël Chapeau, artiste peintre installé à Grenade, en région
                Occitanie.
              </p>
              <p>
                Depuis plus de 25 ans, la peinture est pour moi une passion, un terrain
                d&apos;exploration et un espace de liberté.
              </p>
              <p>
                Autodidacte, je me suis formé au sein de l&apos;atelier de peinture du CE de Airbus,
                où j&apos;ai appris à expérimenter différents médiums; aquarelle, acrylique,
                techniques mixtes.
              </p>
              <p>
                Je travaille aussi bien l&apos;abstrait que le figuratif, inspiré par la nature, le
                corps, ma famille et mes racines provençales.
              </p>
              <p>
                Sur ce site, je vous invite à découvrir mon travail, mes recherches et mes
                expositions.
              </p>
              <p>Bonne visite !</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default HomePage
