import 'dotenv/config'

export const mainConfig = {
  baseUrl: process.env.ASSET_BASE_URL || 'http://localhost:3000',
  dbUrl: process.env.DATABASE_URL || 'file:./keystone.db',
  port: process.env.PORT ? +process.env.PORT : 3000,
  maxFileSize: process.env.MAX_FILE_SIZE ? +process.env.MAX_FILE_SIZE : 200 * 1024 * 1024,
  storage: {
    localImages: 'local_images',
  },
  sessionMaxAge: process.env.ASSET_BASE_URL || 60 * 60 * 24 * 30, // or 30 days
}
