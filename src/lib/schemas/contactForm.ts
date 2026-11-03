import { z } from 'zod'

export const ContactFormSchema = z.object({
  fullname: z
    .string({ required_error: 'Champ requis.' })
    .min(1, { message: 'Champ requis.' })
    .max(100, { message: 'Le nom est trop long.' }),
  email: z
    .string({ required_error: 'Champ requis.' })
    .min(1, { message: 'Champ requis.' })
    .max(254, { message: 'Email invalide.' })
    .email({ message: 'Email invalide.' }),
  message: z
    .string({ message: 'Champ requis.' })
    .min(1, { message: 'Champ requis.' })
    .max(1000, { message: 'Le message est trop long.' }),
  arts: z.number().int().positive().array().max(20),
  h_captcha_response: z.string().max(4096).optional(),
})

export type ContactFormValues = z.infer<typeof ContactFormSchema>
