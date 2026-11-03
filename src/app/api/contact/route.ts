import configPromise from '@payload-config'
import { getPayload } from 'payload'

import {
  buildAdminNotificationEmail,
  buildContactConfirmationEmail,
} from '@/lib/email/contactEmailTemplates'
import { resolveMedia } from '@/lib/media'
import { isRateLimited } from '@/lib/rateLimit'
import { ContactFormSchema } from '@/lib/schemas/contactForm'

const RATE_LIMIT = 5
const RATE_WINDOW_MS = 10 * 60 * 1000

const verifyHCaptcha = async (token: string | undefined) => {
  const secret = process.env.HCAPTCHA_SECRET

  if (!secret) {
    console.error('HCAPTCHA_SECRET is not configured: rejecting contact form submission.')
    return false
  }
  if (!token) return false

  try {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    })

    const result = (await response.json()) as { success: boolean }
    return result.success === true
  } catch (error) {
    console.error(error)
    return false
  }
}

export const POST = async (request: Request) => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(`contact:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return Response.json(
      { error: { message: 'Trop de tentatives, réessayez plus tard.' } },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: { message: 'Données invalides.' } }, { status: 400 })
  }

  const parsed = ContactFormSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: { message: 'Données invalides.' } }, { status: 400 })
  }

  const isHuman = await verifyHCaptcha(parsed.data.h_captcha_response)
  if (!isHuman) {
    return Response.json({ error: { message: 'Vérification hCaptcha échouée.' } }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  const frontendHost = process.env.NEXT_PUBLIC_FRONTEND_HOST || ''

  try {
    const { docs: arts } = parsed.data.arts.length
      ? await payload.find({
          collection: 'arts',
          locale: 'fr',
          where: {
            id: { in: parsed.data.arts },
            sold_out: { equals: false },
          },
          depth: 1,
          limit: 0,
        })
      : { docs: [] }

    const emailData = {
      fullname: parsed.data.fullname,
      email: parsed.data.email,
      message: parsed.data.message,
      arts: arts.map((art) => {
        const thumbnail = resolveMedia(art.thumbnail)
        return {
          name: art.name,
          thumbnailUrl: thumbnail ? `${frontendHost}${thumbnail.url}` : null,
        }
      }),
    }

    const admin = buildAdminNotificationEmail(emailData)
    const confirmation = buildContactConfirmationEmail(emailData)

    await Promise.all([
      payload.sendEmail({
        to: process.env.EMAIL_FROM,
        subject: admin.subject,
        html: admin.html,
      }),
      payload.sendEmail({
        to: parsed.data.email,
        subject: confirmation.subject,
        html: confirmation.html,
      }),
    ])
  } catch (error) {
    console.error(error)
    return Response.json(
      { error: { message: "Erreur lors de l'envoi du message." } },
      { status: 500 },
    )
  }

  return Response.json({ message: 'Message envoyé !' })
}
