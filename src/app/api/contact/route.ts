import configPromise from '@payload-config'
import { getPayload } from 'payload'

import {
  buildAdminNotificationEmail,
  buildContactConfirmationEmail,
} from '@/lib/email/contactEmailTemplates'
import { resolveMedia } from '@/lib/media'
import { ContactFormSchema } from '@/lib/schemas/contactForm'

const verifyHCaptcha = async (token: string | undefined) => {
  const secret = process.env.HCAPTCHA_SECRET

  // No secret configured (e.g. local dev without hCaptcha keys): skip verification.
  if (!secret) return true
  if (!token) return false

  const response = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  })

  const result = (await response.json()) as { success: boolean }
  return result.success
}

export const POST = async (request: Request) => {
  const body = await request.json()
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
