'use client'

import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

const frontendHost = process.env.NEXT_PUBLIC_FRONTEND_HOST ?? 'http://localhost:3000'

/**
 * Renders nothing visible - listens for Payload's Live Preview `postMessage`
 * events (sent from the admin panel iframe on every document change) and
 * refreshes the current route so Server Components re-fetch fresh data.
 */
const LivePreviewListener = () => {
  const router = useRouter()

  return <PayloadLivePreview refresh={router.refresh} serverURL={frontendHost} />
}

export default LivePreviewListener
