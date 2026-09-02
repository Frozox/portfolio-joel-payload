import type { Media } from '@/payload-types'

/**
 * The old Strapi frontend used `getMediaFromFormat` to pick a specific
 * generated image size (small/medium/large/thumbnail) and a `thumbhash`
 * blur placeholder. Payload's `media` collection here only stores the
 * original upload (`upload: true`, no `imageSizes`) and has no `thumbhash`
 * field, so both concepts no longer exist on this backend. Next.js'
 * `<Image>` component already handles responsive resizing on its own, so
 * we just need the raw url/width/height/alt from the Payload media doc.
 */
export const resolveMedia = (media: number | Media | null | undefined) => {
  if (!media || typeof media === 'number') return null

  return {
    url: media.url ?? '',
    width: media.width ?? 0,
    height: media.height ?? 0,
    alt: media.alt,
  }
}
