import { integer, text, timestamp, select, image } from '@keystone-6/core/fields'
import { mainConfig } from './config'

export const slugField = text({ isIndexed: 'unique', validation: { isRequired: true } })

export const imageField = image({ storage: mainConfig.storage.localImages })

export const imageAltField = text({ defaultValue: '', validation: { length: { max: 255 } } })

export const orderField = integer({ defaultValue: -1, isIndexed: true })

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
  ui: { itemView: { fieldMode: 'read' } },
})

export const seoFields = {
  seoTitle: text({ defaultValue: '', validation: { length: { max: 255 } } }),
  seoDescription: text({ defaultValue: '', validation: { length: { max: 255 } } }),
  seoKeywords: text({ defaultValue: '', validation: { length: { max: 255 } } }),
}

export const timestampFields = {
  createdAt: timestamp({ defaultValue: { kind: 'now' } }),
  updatedAt: timestamp({ defaultValue: { kind: 'now' }, db: { updatedAt: true } }),
}
