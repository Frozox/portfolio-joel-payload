import { postgresAdapter } from '@payloadcms/db-postgres'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { sentryPlugin } from '@payloadcms/plugin-sentry'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import * as Sentry from '@sentry/nextjs'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Arts } from './collections/Arts'
import { ArtCategories } from './collections/ArtCategories'
import { ArtTags } from './collections/ArtTags'
import { ArtTagCategories } from './collections/ArtTagCategories'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { News } from './globals/News'
import { SiteImages } from './globals/SiteImages'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const frontendHost = process.env.NEXT_PUBLIC_FRONTEND_HOST || 'http://localhost:3000'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Arts, ArtCategories, ArtTags, ArtTagCategories, ContactSubmissions],
  globals: [News, SiteImages],
  localization: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    fallback: true,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    seoPlugin({
      collections: ['art-categories'],
      globals: ['news'],
      uploadsCollection: 'media',
      fields: ({ defaultFields }) => [
        ...defaultFields.map((field) =>
          'name' in field && (field.name === 'title' || field.name === 'description')
            ? { ...field, localized: true }
            : field,
        ),
        {
          name: 'keywords',
          type: 'text',
          label: 'Mots-clés',
          localized: true,
        },
      ],
      generateTitle: ({ doc }) => {
        const name = typeof doc?.name === 'string' ? doc.name : undefined
        return name ? `${name} • Joel Chapeau` : 'Joel Chapeau'
      },
      generateDescription: ({ doc }) => (typeof doc?.title === 'string' ? doc.title : ''),
      generateURL: ({ doc, collectionSlug }) =>
        collectionSlug === 'art-categories' && typeof doc?.slug === 'string'
          ? `${frontendHost}/${doc.slug}`
          : `${frontendHost}/expositions`,
    }),
    sentryPlugin({ Sentry, enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN) }),
  ],
})
