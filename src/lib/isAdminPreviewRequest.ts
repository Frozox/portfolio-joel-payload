import { headers } from 'next/headers'

/**
 * True only when request loaded inside an iframe - i.e. Payload admin's Live
 * Preview panel. `draftMode()` cookie alone isn't enough: once set, it stays
 * on the visitor's browser and would leak draft content on direct/prod
 * navigation too (e.g. admin browsing the live site in a normal tab).
 * `sec-fetch-dest` is a browser-set Fetch Metadata header, not spoofable via
 * plain navigation/links.
 */
export const isAdminPreviewRequest = async () => {
  const headersList = await headers()
  return ['iframe', 'empty'].includes(headersList.get('sec-fetch-dest') ?? '')
}
