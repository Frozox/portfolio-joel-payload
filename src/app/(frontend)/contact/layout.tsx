import type { Metadata } from 'next'

import { Title } from '@/components/ui/title'

interface TLayoutProps {
  children: React.ReactNode
}

export const generateMetadata = (): Metadata => {
  return {
    title: 'Contact',
    description:
      "Contactez Joël Chapeau pour toute demande d'information, d'exposition ou d'achat d'œuvre. Réponse rapide par mail ou via le formulaire de contact.",
    keywords: ['joel chapeau contact', 'joel contact'],
    alternates: {
      canonical: 'contact',
    },
  }
}

const ContactLayout = ({ children }: Readonly<TLayoutProps>) => {
  return (
    <>
      <Title
        h1="contact"
        h2="Contacter Joel Chapeau"
        h3="Vous êtes intéressé par mon travail ? Parlons-en !"
        className="mb-10 mt-8"
      />
      {children}
    </>
  )
}

export default ContactLayout
