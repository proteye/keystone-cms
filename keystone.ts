import { config } from '@keystone-6/core'
import { lists } from './schema'
import { withAuth, session } from './auth'
import { mainConfig } from './config'
import { importMongo, importMysql } from './helpers/importJson'
import { transformFilename } from './helpers/transformFilename'

export default withAuth(
  config({
    server: {
      cors: { origin: ['http://localhost:7777'], credentials: true },
      port: mainConfig.port,
      maxFileSize: mainConfig.maxFileSize,
    },
    db: {
      provider: 'sqlite',
      url: mainConfig.dbUrl,
      async onConnect(context) {
        if (process.argv.includes('--import-mongo-json')) {
          await importMongo(context)
        }
        if (process.argv.includes('--import-mysql-json')) {
          await importMysql(context)
        }
      },
    },
    ui: {
      isAccessAllowed: (context) => !!context.session?.data,
    },
    storage: {
      [mainConfig.storage.localImages]: {
        kind: 'local',
        type: 'image',
        generateUrl: (path) => `${mainConfig.baseUrl}/images${path}`,
        serverRoute: {
          path: '/images',
        },
        storagePath: 'public/images',
        transformName: transformFilename,
      },
    },
    lists,
    session,
  }),
)
