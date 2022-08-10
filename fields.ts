import { integer, text, timestamp, select, image, relationship } from '@keystone-6/core/fields'
import { document } from '@keystone-6/fields-document'
import slugify from 'slugify'
import { mainConfig } from './config'
import { componentBlocks } from './plugins/component-blocks'

export const slugField = text({
  defaultValue: '',
  isIndexed: 'unique',
  db: { isNullable: false },
  hooks: {
    resolveInput: ({ resolvedData, fieldKey, item }) => {
      const { slug } = resolvedData
      const title = resolvedData.title ?? item?.title ?? resolvedData.name ?? item?.name ?? ''

      if (slug === '') {
        return slugify(title, { lower: true })
      }

      return resolvedData[fieldKey]
    },
  },
})

export const authorField = (ref: string) =>
  relationship({
    ref,
    ui: {
      displayMode: 'select',
      labelField: 'name',
      hideCreate: true,
      createView: {
        fieldMode: ({
          session: {
            data: { isAdmin },
          },
        }) => (isAdmin ? 'edit' : 'hidden'),
      },
      itemView: {
        fieldMode: ({
          session: {
            data: { isAdmin },
          },
        }) => (isAdmin ? 'edit' : 'read'),
      },
    },
    hooks: {
      resolveInput: ({ resolvedData, fieldKey, operation, context }) => {
        if (!context.session) {
          return resolvedData[fieldKey]
        }

        const { id, isAdmin } = context.session.data

        if (
          !isAdmin ||
          (operation === 'update' && resolvedData[fieldKey]?.disconnect) ||
          (operation === 'create' && !resolvedData[fieldKey]?.connect)
        ) {
          return { connect: { id } }
        }

        return resolvedData[fieldKey]
      },
    },
  })

export const imageField = relationship({
  ref: 'Image',
  hooks: {
    beforeOperation: async ({ resolvedData, listKey, context }) => {
      const imageId = resolvedData?.image?.connect?.id

      if (imageId) {
        context.query.Image.updateOne({
          where: { id: imageId },
          data: {
            type: listKey,
          },
        })
      }
    },
  },
  ui: {
    displayMode: 'cards',
    cardFields: ['image'],
    inlineEdit: { fields: ['image'] },
    linkToItem: true,
    inlineConnect: false,
    inlineCreate: { fields: ['image'] },
  },
})

export const imageStorageField = image({ storage: mainConfig.storage.localImages })

export const imageAltField = text({ defaultValue: '', validation: { length: { max: 255 } } })

export const orderField = integer({ defaultValue: -1, isIndexed: true })

export const contentField = document({
  formatting: true,
  layouts: [
    [1, 1],
    [1, 1, 1],
    [2, 1],
    [1, 2],
    [1, 2, 1],
  ],
  links: true,
  dividers: true,
  ui: {
    views: require.resolve('./plugins/component-blocks'),
  },
  componentBlocks,
})

export const statusField = select({
  options: [
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
  ],
  defaultValue: 'draft',
  ui: {
    displayMode: 'segmented-control',
  },
})

export const viewsCountField = integer({
  defaultValue: 0,
  ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'read' } },
})

export const seoFields = {
  seoTitle: text({ defaultValue: '', validation: { length: { max: 255 } } }),
  seoDescription: text({ defaultValue: '', validation: { length: { max: 255 } } }),
  seoKeywords: text({ defaultValue: '', validation: { length: { max: 255 } } }),
}

export const timestampFields = {
  createdAt: timestamp({
    defaultValue: { kind: 'now' },
    ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } },
  }),
  updatedAt: timestamp({
    defaultValue: { kind: 'now' },
    db: { updatedAt: true },
    ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } },
  }),
}
