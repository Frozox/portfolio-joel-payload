import type { Metadata } from 'next'
import { Lato as FontSans } from 'next/font/google'
import type { Organization, WithContext } from 'schema-dts'

import Footer from '@/components/nav/footer'
import MainNav from '@/components/nav/mainNav'
import JsonLdLoader from '@/components/seo/jsonLdLoader'
import { ThemeToggle } from '@/components/theme/themeToggle'
import { resolveMedia } from '@/lib/media'
import { getArtCategories, getSiteImages } from '@/lib/payload-data'
import { cn } from '@/lib/utils'
import { ArtCategoryProvider } from '@/providers/artCategoryProvider'
import { ContactProvider } from '@/providers/contactProvider'
import { SiteImagesProvider } from '@/providers/siteImagesProvider'
import { ThemeProvider } from '@/providers/themeProvider'

import './styles.css'

const frontendHost = process.env.NEXT_PUBLIC_FRONTEND_HOST ?? 'http://localhost:3000'

interface TLayoutProps {
  children: React.ReactNode
}

export const fontSans = FontSans({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-sans',
})

export const generateMetadata = (): Metadata => {
  return {
    title: {
      template: '%s • Joel Chapeau',
      default: 'Joel Chapeau',
    },
    description:
      'Joël Chapeau est un artiste plasticien contemporain français dont les œuvres explorent la mémoire, la matière et l’abstraction à travers des techniques mixtes.',
    applicationName: 'Portfolio de Joel Chapeau',
    openGraph: {
      images: new URL(`${frontendHost}/og-image.jpg`),
      description:
        'Joël Chapeau est un artiste plasticien français dont le travail mêle abstraction, mémoire et matière. À travers la peinture, l’assemblage et l’expérimentation, il explore la trace, le geste et le temps, proposant une œuvre profondément sensorielle et introspective.',
      title: 'Joël Chapeau',
      url: new URL(frontendHost),
    },
    authors: [{ name: 'Joël Chapeau' }, { name: 'Tom Cuillandre' }],
    generator: 'Next.js',
    keywords: [
      'joel chapeau',
      'joel artiste',
      'joel peinture',
      'joel sculpture',
      'artiste plasticien',
      'artiste grenade',
    ],
    referrer: 'origin-when-cross-origin',
    creator: 'Joël Chapeau',
    publisher: 'Joël Chapeau',
    metadataBase: new URL(frontendHost),
    alternates: {
      canonical: '/',
    },
  }
}

const RootLayout = async ({ children }: Readonly<TLayoutProps>) => {
  const artCategories = await getArtCategories()
  const siteImages = await getSiteImages()
  const homeJoel = resolveMedia(siteImages.home_joel)
  const siteLogo = resolveMedia(siteImages.site_logo)

  const organizationStructuredJsonLd: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    url: frontendHost,
    logo: homeJoel ? `${frontendHost}${homeJoel.url}` : undefined,
    name: 'Joël Chapeau',
    description:
      'Joël Chapeau est un artiste plasticien contemporain français dont les œuvres explorent la mémoire, la matière et l’abstraction à travers des techniques mixtes.',
  }

  return (
    <html
      lang="fr"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(fontSans.variable, 'scroll-smooth scrollbar-hide')}
    >
      <body className="mx-auto h-screen max-w-[2500px] self-center bg-background align-middle font-sans antialiased">
        <JsonLdLoader key="organization" jsonLd={organizationStructuredJsonLd} />
        <ArtCategoryProvider artCategories={artCategories}>
          <SiteImagesProvider homeJoel={homeJoel} siteLogo={siteLogo}>
            <ContactProvider>
              <header className="h-28">
                <MainNav className="sticky mx-auto h-28 w-full max-w-[2500px] md:fixed md:bg-background" />
              </header>
              <main className="min-h-[calc(100vh-7rem)] w-full">{children}</main>
              <footer className="w-full max-w-[2500px] px-10 pb-8">
                <Footer />
              </footer>
              <div className="fixed bottom-4 right-4">
                <ThemeProvider
                  attribute="class"
                  defaultTheme="white"
                  enableSystem
                  disableTransitionOnChange
                >
                  <ThemeToggle />
                </ThemeProvider>
              </div>
            </ContactProvider>
          </SiteImagesProvider>
        </ArtCategoryProvider>
      </body>
    </html>
  )
}

export default RootLayout
