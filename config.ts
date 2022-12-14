import 'dotenv/config'

const port = process.env.PORT ? +process.env.PORT : 3000

export const mainConfig = {
  port,
  baseUrl: process.env.ASSET_BASE_URL || `http://localhost:${port}`,
  dbUrl: process.env.DATABASE_URL || 'file:./keystone.db',
  cors: { origin: ['http://localhost:3000', process.env.CORS_HOST], credentials: true },
  maxFileSize: process.env.MAX_FILE_SIZE ? +process.env.MAX_FILE_SIZE : 200 * 1024 * 1024, // or 200 Mb
  storage: {
    localImages: 'local_images',
  },
  sessionMaxAge: process.env.SESSION_MAX_AGE ? +process.env.SESSION_MAX_AGE : 60 * 60 * 24 * 30, // or 30 days
}
