import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { cs } from '@payloadcms/translations/languages/cs'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Media } from './collections/Media'
import { News } from './collections/News'
import { Pages } from './collections/Pages'
import { Products } from './collections/Products'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const storefront = process.env.STOREFRONT_URL?.replace(/\/+$/, '')

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · By Judith obsah' },
    livePreview: {
      breakpoints: [
        { label: 'Mobil', name: 'mobile', width: 390, height: 844 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  i18n: { supportedLanguages: { cs, en }, fallbackLanguage: 'cs' },
  collections: [Pages, News, Products, Media, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  // The storefront reads over REST from its server; the admin is same-origin.
  cors: storefront ? [storefront] : [],
  csrf: storefront ? [storefront] : [],
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL || '' } }),
  sharp,
})
