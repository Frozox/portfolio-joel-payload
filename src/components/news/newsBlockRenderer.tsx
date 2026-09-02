import { RichText } from '@payloadcms/richtext-lexical/react'

import LazyImage from '@/components/ui/lazyImage'
import { resolveMedia } from '@/lib/media'
import { cn } from '@/lib/utils'
import type { MediaBlock, SpacerBlock, TextBlock, TextMediaBlock } from '@/payload-types'

export const NewsTextBlock = ({ title, content }: TextBlock) => {
  return (
    <div>
      {title && <h3 className="mb-4 text-center text-2xl font-bold lg:text-left">{title}</h3>}
      <div className="text-justify">
        <RichText data={content} />
      </div>
    </div>
  )
}

export const NewsMediaBlock = ({ media, mediaPosition }: MediaBlock) => {
  const image = resolveMedia(media)

  return (
    <div
      className={cn(
        'flex',
        mediaPosition === 'left' && 'justify-start',
        mediaPosition === 'center' && 'justify-center',
        mediaPosition === 'right' && 'justify-end',
      )}
    >
      {image && (
        <LazyImage
          src={image.url}
          alt={image.alt}
          title={image.alt}
          width={image.width}
          height={image.height}
        />
      )}
    </div>
  )
}

export const NewsTextMediaBlock = ({
  title,
  content,
  media,
  mediaPosition,
  mediaMobilePosition,
}: TextMediaBlock) => {
  const image = resolveMedia(media)

  return (
    <div
      className={cn(
        'flex',
        mediaPosition === 'left' ? 'lg:flex-row' : 'lg:flex-row-reverse',
        mediaMobilePosition === 'top' ? 'flex-col' : 'flex-col-reverse',
      )}
    >
      <div
        className={cn(
          'flex shrink basis-2/5 flex-col justify-center',
          mediaPosition === 'left' ? 'lg:pr-6' : 'lg:pl-6',
          mediaMobilePosition === 'top' ? 'mb-6 lg:mb-0' : 'mt-6 lg:mt-0',
        )}
      >
        {image && (
          <LazyImage
            src={image.url}
            alt={image.alt}
            title={image.alt}
            width={image.width}
            height={image.height}
          />
        )}
      </div>
      <div className="basis-3/5">
        {title && <h3 className="mb-4 text-center text-2xl font-bold lg:text-left">{title}</h3>}
        {content && (
          <div className="text-justify">
            <RichText data={content} />
          </div>
        )}
      </div>
    </div>
  )
}

export const NewsSpacerBlock = (_: SpacerBlock) => {
  return (
    <hr className="my-8 h-[2px] w-full border-t-0 bg-transparent bg-gradient-to-r from-transparent via-foreground to-transparent opacity-25" />
  )
}

export const FailedLoadBlock = ({ blockType }: { blockType: string }) => (
  <div className="font-bold text-destructive">Failed loading {blockType}</div>
)

type NewsBlock = TextBlock | MediaBlock | TextMediaBlock | SpacerBlock

export const NewsBlockRenderer = ({ block }: { block: NewsBlock }) => {
  switch (block.blockType) {
    case 'textBlock':
      return <NewsTextBlock {...block} />
    case 'mediaBlock':
      return <NewsMediaBlock {...block} />
    case 'textMediaBlock':
      return <NewsTextMediaBlock {...block} />
    case 'spacerBlock':
      return <NewsSpacerBlock {...block} />
    default:
      return <FailedLoadBlock blockType={(block as NewsBlock).blockType} />
  }
}
