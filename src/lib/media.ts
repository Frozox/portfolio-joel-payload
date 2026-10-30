import type { Media } from '@/payload-types'

/**
 * The old Strapi frontend used `getMediaFromFormat` to pick the `large`
 * generated image size rather than the full-resolution original. Payload's
 * `media` collection now generates the same kind of size variants via
 * `upload.imageSizes` (see `collections/Media.ts`), so we mirror that and
 * prefer the `large` variant here too, falling back to the original only
 * when a variant wasn't generated (e.g. very small source images).
 */
export const resolveMedia = (media: number | Media | null | undefined) => {
  if (!media || typeof media === 'number') return null

  const large = media.sizes?.large

  return {
    url: large?.url ?? media.url ?? '',
    width: large?.width ?? media.width ?? 0,
    height: large?.height ?? media.height ?? 0,
    alt: media.alt,
  }
}
