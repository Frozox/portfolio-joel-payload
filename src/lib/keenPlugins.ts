import type { KeenSliderInstance } from 'keen-slider/react'

export const autoSlider = (slider: KeenSliderInstance) => {
  let timeout: ReturnType<typeof setTimeout>
  let mouseOver = false
  function clearNextTimeout() {
    clearTimeout(timeout)
  }
  function nextTimeout() {
    clearTimeout(timeout)
    if (mouseOver) return
    timeout = setTimeout(() => {
      if (!slider.slides.length) return
      slider.next()
    }, 6000)
  }
  slider.on('created', () => {
    slider.container.addEventListener('mouseover', () => {
      mouseOver = true
      clearNextTimeout()
    })
    slider.container.addEventListener('mouseout', () => {
      mouseOver = false
      nextTimeout()
    })
    nextTimeout()
  })
  slider.on('dragStarted', clearNextTimeout)
  slider.on('animationEnded', nextTimeout)
  slider.on('updated', nextTimeout)
}

export const moveToSelectedSlide = (slider: KeenSliderInstance) => {
  const events: number[] = []
  slider.on('optionsChanged', () => {
    if (slider.slides.length === 0) return
    slider.slides
      .filter((_, id) => !events.includes(id))
      .forEach((slide, idx) => {
        events.push(idx)
        slide.addEventListener('click', () => {
          if (slider.track.details.rel === idx) return
          slider.moveToIdx(idx)
        })
      })
  })
}
