import 'dotenv/config'

export const mainConfig = {
  dbUrl: process.env.DATABASE_URL || 'file:./keystone.db',
  baseUrl: process.env.ASSET_BASE_URL || 'http://localhost:3000',
  localStorageName: 'local_images',
}
