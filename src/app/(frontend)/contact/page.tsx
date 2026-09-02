'use client'

import HCaptcha from '@hcaptcha/react-hcaptcha'
import { zodResolver } from '@hookform/resolvers/zod'
import { TooltipArrow, TooltipPortal } from '@radix-ui/react-tooltip'
import { CircleX, Info } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Toaster, toast } from 'react-hot-toast'
import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import LazyImage from '@/components/ui/lazyImage'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { aspectRatioCalculatorFromHeight } from '@/lib/aspectRatio'
import { ContactFormSchema } from '@/lib/schemas/contactForm'
import { cn } from '@/lib/utils'
import { useContact } from '@/providers/contactProvider'

const ContactPage = () => {
  const { savedArts, toggleSavedArt, clearSavedArts } = useContact()
  const hcaptchaRef = useRef<HCaptcha>(null)

  const form = useForm<z.infer<typeof ContactFormSchema>>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      fullname: '',
      email: '',
      message: '',
      arts: [],
    },
  })

  const [formSending, setFormSending] = useState(false)

  useEffect(() => {
    form.setValue(
      'arts',
      savedArts.map((art) => art.id),
    )
  }, [savedArts, form])

  const onSubmit = async (data: z.infer<typeof ContactFormSchema>) => {
    if (!hcaptchaRef.current) return

    try {
      await hcaptchaRef.current.execute({ async: true })
    } catch {
      console.error('failed to execute captcha')
    }

    data.h_captcha_response = hcaptchaRef.current.getResponse()
    setFormSending(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const body = (await res.json()) as { error?: { message: string } }

      if (!res.ok) throw new Error(body.error?.message ?? 'Une erreur est survenue.')

      form.reset()
      clearSavedArts()
      toast.success('Message envoyé !')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue.')
    } finally {
      setFormSending(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="container grid animate-content-load grid-cols-2 gap-4 lg:w-2/3"
      >
        <FormField
          control={form.control}
          name="fullname"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel>Nom/Prénom</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="jon.doe@me.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Message</FormLabel>
              <FormControl>
                <div className="relative">
                  <Textarea
                    className="max-h-80 min-h-28 pt-8 scrollbar-hide"
                    placeholder="Votre message"
                    {...field}
                  />
                  <span
                    className={cn(
                      'absolute inset-x-0 top-0 select-none rounded-md border-x border-t border-input bg-background px-6 py-1 text-end text-muted-foreground',
                      field.value.length > 1000 && 'text-destructive',
                    )}
                  >
                    {field.value.length}/1000
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="arts"
          render={({ field }) => {
            const arts = field.value.map((id) => {
              const currentArt = savedArts.find((art) => art.id === id)
              if (!currentArt) return null
              return (
                <div key={id} className="relative">
                  <div
                    className="overflow-hidden"
                    style={{
                      width: `${aspectRatioCalculatorFromHeight(currentArt.thumbnail.width, currentArt.thumbnail.height, 9).toFixed()}rem`,
                    }}
                  >
                    <LazyImage
                      src={currentArt.thumbnail.url}
                      width={200}
                      height={200}
                      alt={currentArt.name}
                      title={currentArt.name}
                      className="h-36 w-auto"
                    />
                    <p className="truncate">{currentArt.name}</p>
                  </div>
                  <CircleX
                    className="absolute -right-2 -top-2 cursor-pointer rounded-full border-2 border-transparent bg-background text-red-600 hover:scale-125"
                    onClick={() => {
                      toggleSavedArt(currentArt)
                    }}
                  />
                </div>
              )
            })
            return (
              <FormItem className="col-span-2">
                <FormLabel className="relative">
                  <span>œuvres enregistrées</span>
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild className="absolute -right-5 -top-1">
                        <button type="button">
                          <Info className="size-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent className="max-w-72" side="top" align="start">
                          <p>
                            Vous pouvez ajouter une ou plusieurs œuvres depuis l&apos;onglet travaux
                          </p>
                          <TooltipArrow width={10} height={5} className="rounded fill-foreground" />
                        </TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-4">
                    {!!arts.filter(Boolean).length && arts}
                    {!arts.filter(Boolean).length && (
                      <p className="mx-2 text-sm text-muted-foreground">Aucune œuvre enregistree</p>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <div className={cn('col-span-2 my-2 w-full lg:w-64', formSending && 'cursor-not-allowed')}>
          <Button type="submit" disabled={formSending} className="w-full">
            {formSending && (
              <>
                <span className="pr-2">Envoyer</span>
                <span className="animate-bounce text-xl font-bold">.</span>
                <span className="animate-bounce text-xl font-bold delay-75">.</span>
                <span className="animate-bounce text-xl font-bold delay-100">.</span>
              </>
            )}
            {!formSending && 'Envoyer'}
          </Button>
        </div>
        <div className="hidden">
          <HCaptcha
            ref={hcaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ?? ''}
            size="invisible"
          />
        </div>
        <Toaster
          toastOptions={{
            style: {
              backgroundColor: 'hsl(var(--foreground))',
              color: 'hsl(var(--background))',
            },
          }}
        />
      </form>
    </Form>
  )
}

export default ContactPage
