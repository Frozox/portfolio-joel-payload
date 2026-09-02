'use client'

import type { KeenSliderInstance, KeenSliderOptions, KeenSliderPlugin } from 'keen-slider/react'
import { useKeenSlider as useDefaultKeenSlider } from 'keen-slider/react'
import type { MutableRefObject } from 'react'
import React, { createContext, useState } from 'react'

import type { TKeenSlideProps } from '@/components/ui/keenSlider'

interface TKeenSliderContext {
  sliderRef: (node: HTMLElement | null) => void
  sliderInstance: MutableRefObject<KeenSliderInstance | null>
  slides: TKeenSlideProps[]
  options: KeenSliderOptions
  plugins: KeenSliderPlugin[]
  setSlides: React.Dispatch<React.SetStateAction<TKeenSlideProps[]>>
}

const KeenSliderContext = createContext<TKeenSliderContext>({
  sliderRef: () => {},
  sliderInstance: { current: null },
  slides: [],
  options: {},
  plugins: [],
  setSlides: () => {},
})

export const useKeenSlider = () => React.use(KeenSliderContext)

interface TKeenSliderProviderProps {
  children: React.ReactNode
  options: KeenSliderOptions
  plugins?: KeenSliderPlugin[]
}

export const KeenSliderProvider = ({ children, options, plugins }: TKeenSliderProviderProps) => {
  const [sliderRef, sliderInstance] = useDefaultKeenSlider(options, plugins)
  const [slides, setSlides] = useState<TKeenSlideProps[]>([])

  return (
    <KeenSliderContext.Provider
      value={{
        sliderRef,
        sliderInstance,
        slides,
        options,
        plugins: plugins ?? [],
        setSlides,
      }}
    >
      {children}
    </KeenSliderContext.Provider>
  )
}
