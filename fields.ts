import { integer, text, timestamp, select, image } from '@keystone-6/core/fields'
import { document } from '@keystone-6/fields-document'
import slugify from 'slugify'
import { mainConfig } from './config'

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

export const imageField = image({ storage: mainConfig.storage.localImages })

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
