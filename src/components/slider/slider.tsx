'use client'

import React from 'react'

import { KeenSlide, KeenSlider } from '@/components/ui/keenSlider'
import { useKeenSlider } from '@/providers/keenSliderProvider'

export type TSliderProps = React.HTMLAttributes<HTMLElement>

const Slider = ({ className, ...props }: TSliderProps) => {
  const { slides } = useKeenSlider()

  return (
    <KeenSlider className={className} {...props}>
      {slides.map(({ children, ...slideProps }, idx) => (
        <KeenSlide key={idx} {...slideProps}>
          {children}
        </KeenSlide>
      ))}
    </KeenSlider>
  )
}

export default Slider
