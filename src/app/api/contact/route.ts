import configPromise from '@payload-config'
import { getPayload } from 'payload'

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

  try {
    await payload.create({
      collection: 'contact-submissions',
      data: {
        fullname: parsed.data.fullname,
        email: parsed.data.email,
        message: parsed.data.message,
        arts: parsed.data.arts,
      },
    })
  } catch {
    return Response.json(
      { error: { message: "Erreur lors de l'envoi du message." } },
      { status: 500 },
    )
  }

  return Response.json({ message: 'Message envoyé !' })
}
