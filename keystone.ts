import { config } from '@keystone-6/core'
import { lists } from './schema'
import { withAuth, session } from './auth'
import { mainConfig } from './config'

export default withAuth(
  config({
    db: {
      provider: 'sqlite',
      url: mainConfig.dbUrl,
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
