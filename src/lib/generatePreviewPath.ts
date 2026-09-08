const frontendHost = process.env.NEXT_PUBLIC_FRONTEND_HOST || 'http://localhost:3000'

export type PreviewSearchParams = {
  path: string
  previewSecret: string
}

interface GeneratePreviewPathProps {
  /** Relative path of the frontend page to preview, e.g. `/expositions`. */
  path: string
}

/**
 * Builds an absolute URL pointing to the `/next/preview` route, which enables
 * Next.js draft mode (after verifying the requesting admin user and the
 * `PREVIEW_SECRET`) and redirects to `path`. Used for both the static
 * "preview" button and the Live Preview iframe URL on collections/globals.
 */
export const generatePreviewPath = ({ path }: GeneratePreviewPathProps) => {
  const encodedParams = new URLSearchParams({
    path,
    previewSecret: process.env.PREVIEW_SECRET || '',
  } satisfies PreviewSearchParams)

  return `${frontendHost}/next/preview?${encodedParams.toString()}`
}
