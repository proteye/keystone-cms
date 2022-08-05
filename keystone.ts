import { config } from '@keystone-6/core'
import { lists } from './schema'
import { withAuth, session } from './auth'
import { mainConfig } from './config'
import { importMongoJson, importMysqlJson } from './helpers/import_json'

export default withAuth(
  config({
    db: {
      provider: 'sqlite',
      url: mainConfig.dbUrl,
      async onConnect(context) {
        if (process.argv.includes('--import-mongo-json')) {
          await importMongoJson(context)
        }
        if (process.argv.includes('--import-mysql-json')) {
          await importMysqlJson(context)
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
      },
    },
    lists,
    session,
  }),
)
