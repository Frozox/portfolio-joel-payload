'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { HTMLAttributes } from 'react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

export type LazyImageProps = HTMLAttributes<HTMLImageElement> & {
  src: string
  width: number
  height: number
  fullSize?: boolean
  /** Marks this image as the LCP candidate: skips lazy-loading and preloads it. */
  priority?: boolean
  alt: string
}

/**
 * The old Strapi frontend used a `thumbhash` blur placeholder here. Payload's
 * `media` collection has no `thumbhash` field (that concept doesn't exist on
 * this backend), so the placeholder logic has been removed and we just fade
 * the real image in once it's loaded.
 */
const LazyImage = ({
  src,
  className,
  alt,
  width,
  height,
  fullSize,
  priority,
  ...props
}: LazyImageProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  const onLoaded = () => {
    setIsImageLoaded(true)
  }

  return (
    <div className={cn(fullSize && 'size-full')}>
      <div className="relative size-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isImageLoaded ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="size-full"
        >
          <Image
            src={src}
            height={height}
            width={width}
            alt={alt}
            priority={priority}
            onLoad={onLoaded}
            className={cn(className, 'pointer-events-auto')}
            {...props}
          />
        </motion.div>
      </div>
    </div>
  )
}

export default LazyImage
