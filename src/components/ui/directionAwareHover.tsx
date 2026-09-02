'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState } from 'react'

import LazyImage from '@/components/ui/lazyImage'
import { cn } from '@/lib/utils'

export const DirectionAwareHover = ({
  imageUrl,
  children,
  childrenClassName,
  imageClassName,
  className,
}: {
  imageUrl: string
  children: React.ReactNode | string
  childrenClassName?: string
  imageClassName?: string
  className?: string
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const [direction, setDirection] = useState<'top' | 'bottom' | 'left' | 'right' | string>('left')

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const direction = getDirection(event, ref.current)
    switch (direction) {
      case 0:
        setDirection('top')
        break
      case 1:
        setDirection('right')
        break
      case 2:
        setDirection('bottom')
        break
      case 3:
        setDirection('left')
        break
      default:
        setDirection('left')
        break
    }
  }

  const getDirection = (ev: React.MouseEvent<HTMLDivElement>, obj: HTMLElement) => {
    const { width: w, height: h, left, top } = obj.getBoundingClientRect()
    const x = ev.clientX - left - (w / 2) * (w > h ? h / w : 1)
    const y = ev.clientY - top - (h / 2) * (h > w ? w / h : 1)
    const d = Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4
    return d
  }

  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      ref={ref}
      className={cn('group/card relative size-full overflow-hidden bg-transparent', className)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          className="relative size-full"
          initial="initial"
          whileHover={direction}
          exit="exit"
        >
          <motion.div className="absolute inset-0 z-10 hidden size-full bg-black/40 transition duration-500 group-hover/card:block" />
          <motion.div
            variants={variants}
            className="relative size-full bg-gray-50 dark:bg-black"
            transition={{
              duration: 0.2,
              ease: 'easeOut',
            }}
          >
            <LazyImage
              alt="image"
              className={cn('size-full scale-[1.15] object-cover', imageClassName)}
              width={1000}
              height={1000}
              src={imageUrl}
              fullSize
            />
          </motion.div>
          <motion.div
            variants={textVariants}
            transition={{
              duration: 0.5,
              ease: 'easeOut',
            }}
            className={cn('absolute bottom-4 left-4 z-40 text-white', childrenClassName)}
          >
            {children}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

const variants = {
  initial: {
    x: 0,
  },

  exit: {
    x: 0,
    y: 0,
  },
  top: {
    y: 20,
  },
  bottom: {
    y: -20,
  },
  left: {
    x: 20,
  },
  right: {
    x: -20,
  },
}

const textVariants = {
  initial: {
    y: 0,
    x: 0,
    opacity: 1,
  },
  exit: {
    y: 0,
    x: 0,
    opacity: 1,
  },
  top: {
    y: -20,
    opacity: 1,
  },
  bottom: {
    y: 2,
    opacity: 1,
  },
  left: {
    x: -2,
    opacity: 1,
  },
  right: {
    x: 20,
    opacity: 1,
  },
}
