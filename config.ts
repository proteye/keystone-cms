import 'dotenv/config'

export const mainConfig = {
  dbUrl: process.env.DATABASE_URL || 'file:./keystone.db',
  baseUrl: process.env.ASSET_BASE_URL || 'http://localhost:3000',
  storage: {
    localImages: 'local_images',
  },
  sessionMaxAge: process.env.ASSET_BASE_URL || 60 * 60 * 24 * 30, // or 30 days
}
