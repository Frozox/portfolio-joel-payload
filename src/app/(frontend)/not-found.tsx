import { HouseIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Title } from '@/components/ui/title'

export const generateMetadata = (): Metadata => {
  return {
    title: '404',
  }
}

const NotFound = () => {
  return (
    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center text-center">
      <Title h1="404" h2="Oups... La page que vous recherchez n'existe pas." className="mb-10" />
      <Link href="/">
        <Button variant="outline" size="lg">
          <HouseIcon className="text-foreground" />
          <span className="pl-2">Retourner à la page d&apos;accueil</span>
        </Button>
      </Link>
    </div>
  )
}

export default NotFound
