import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
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
import { Roles } from './collections/Roles'
import { AnalyticsCache } from './globals/AnalyticsCache'
import { News } from './globals/News'
import { SiteImages } from './globals/SiteImages'
import { analyticsOverviewEndpoint } from './endpoints/analyticsOverview'
import { sentryIssuesEndpoint } from './endpoints/sentryIssues'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const frontendHost = process.env.NEXT_PUBLIC_FRONTEND_HOST || 'http://localhost:3000'

export default buildConfig({
  csrf: [frontendHost],
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: ['/components/admin/DashboardWidgets#DashboardWidgets'],
    },
  },
  collections: [Users, Media, Arts, ArtCategories, ArtTags, ArtTagCategories, Roles],
  globals: [News, SiteImages, AnalyticsCache],
  endpoints: [analyticsOverviewEndpoint, sentryIssuesEndpoint],
  // First boot only: seeds a full-access admin role and assigns it to any user
  // created before the role system existed, so nobody gets locked out.
  onInit: async (payload) => {
    const { totalDocs } = await payload.count({ collection: 'roles' })
    if (totalDocs > 0) return

    const adminRole = await payload.create({
      collection: 'roles',
      data: {
        name: 'Administrateur',
        isAdmin: true,
        viewAnalytics: true,
        viewSentry: true,
      },
    })

    const { docs: usersWithoutRole } = await payload.find({
      collection: 'users',
      where: { role: { exists: false } },
      limit: 0,
    })

    await Promise.all(
      usersWithoutRole.map((user) =>
        payload.update({
          collection: 'users',
          id: user.id,
          data: { role: adminRole.id },
        }),
      ),
    )
  },
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
  email: nodemailerAdapter({
    defaultFromAddress: process.env.EMAIL_FROM || 'no-reply@joel-chapeau.fr',
    defaultFromName: 'Joël Chapeau',
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
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
