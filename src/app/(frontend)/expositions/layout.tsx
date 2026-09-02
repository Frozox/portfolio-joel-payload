import type { Metadata } from 'next'

import { Title } from '@/components/ui/title'
import { getNews } from '@/lib/payload-data'

interface TLayoutProps {
  children: React.ReactNode
}

export const generateMetadata = async (): Promise<Metadata> => {
  const news = await getNews()

  return {
    title: news.meta?.title ?? 'Expositions',
    description:
      news.meta?.description ??
      'Découvrez les expositions de Joël Chapeau, artiste peintre à Grenade : aquarelles, acryliques et techniques mixtes présentées en galeries et espaces culturels.',
    keywords: news.meta?.keywords ?? [
      'joel chapeau exposition',
      'joel exposition',
      'exposition grenade',
    ],
    alternates: {
      canonical: 'expositions',
    },
  }
}

const NewsLayout = ({ children }: Readonly<TLayoutProps>) => {
  return (
    <>
      <Title h1="expositions" h2="Expositions & Actualités" className="mb-10 mt-8" />
      {children}
    </>
  )
}

export default NewsLayout
