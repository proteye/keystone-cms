import { list } from '@keystone-6/core'
import { text, relationship, password, timestamp, select, checkbox } from '@keystone-6/core/fields'
import { Lists, ImageUpdateInput } from '.keystone/types'
import { isAdmin, isAdminOrPerson, isPerson, isUser } from './validation'
import {
  authorField,
  contentField,
  imageAltField,
  imageField,
  imageStorageField,
  orderField,
  seoFields,
  slugField,
  statusField,
  timestampFields,
  viewsCountField,
} from './fields'
import { IImageFieldInput } from './types'

/**
 * Lists
 */
export const lists: Lists = {
  /** User */
  User: list({
    access: {
      operation: {
        create: isAdmin,
        delete: isAdmin,
      },
      item: {
        update: isAdminOrPerson,
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({
        validation: { isRequired: true },
        isIndexed: 'unique',
        isFilterable: true,
        access: {
          read: isAdminOrPerson,
          update: isAdminOrPerson,
        },
      }),
      password: password({
        validation: { isRequired: true },
        access: {
          read: isAdminOrPerson,
          update: isPerson,
        },
      }),
      avatar: imageStorageField,
      isAdmin: checkbox({
        defaultValue: false,
        access: {
          read: isUser,
          update: isAdmin,
        },
      }),
      status: select({
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Blocked', value: 'blocked' },
        ],
        defaultValue: 'active',
        ui: {
          displayMode: 'segmented-control',
        },
      }),
      ...timestampFields,
      posts: relationship({ ref: 'Post.author', many: true }),
      pages: relationship({ ref: 'Page.author', many: true }),
    },
    ui: {
      listView: {
        initialColumns: ['name', 'email', 'isAdmin', 'status'],
      },
    },
  }),
  /** Post */
  Post: list({
    fields: {
      title: text({ isFilterable: true, validation: { isRequired: true } }),
      slug: slugField,
      brief: text({ ui: { displayMode: 'textarea' } }),
      content: contentField,
      image: imageField,
      status: statusField,
      commentStatus: select({
        options: [
          { label: 'Open', value: 'open' },
          { label: 'Closed', value: 'closed' },
        ],
        defaultValue: 'closed',
      }),
      order: orderField,
      ...seoFields,
      ...timestampFields,
      publishDate: timestamp({ defaultValue: { kind: 'now' } }),
      viewsCount: viewsCountField,
      commentCount: viewsCountField,
      author: authorField('User.posts'),
      category: relationship({
        ref: 'Category.posts',
        ui: {
          displayMode: 'select',
          labelField: 'name',
          hideCreate: false,
        },
      }),
      tags: relationship({
        ref: 'Tag.posts',
        ui: {
          displayMode: 'cards',
          cardFields: ['name'],
          inlineEdit: { fields: ['name', 'category'] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ['name', 'category'] },
        },
        many: true,
      }),
    },
    ui: {
      listView: {
        initialColumns: ['title', 'slug', 'category', 'tags', 'author', 'viewsCount', 'status'],
      },
    },
  }),
  /** Page */
  Page: list({
    fields: {
      title: text({ isFilterable: true, validation: { isRequired: true } }),
      slug: slugField,
      content: contentField,
      image: imageField,
      status: statusField,
      order: orderField,
      ...seoFields,
      ...timestampFields,
      viewsCount: viewsCountField,
      author: authorField('User.pages'),
    },
    ui: {
      listView: {
        initialColumns: ['title', 'slug', 'author', 'viewsCount', 'status'],
      },
    },
  }),
  /** Category */
  Category: list({
    fields: {
      name: text({ validation: { isRequired: true } }),
      slug: slugField,
      description: text({ ui: { displayMode: 'textarea' } }),
      image: imageField,
      status: statusField,
      order: orderField,
      ...seoFields,
      ...timestampFields,
      posts: relationship({ ref: 'Post.category', many: true }),
      tags: relationship({ ref: 'Tag.category', many: true }),
    },
    ui: {
      listView: {
        initialColumns: ['name', 'slug', 'description', 'status'],
      },
    },
  }),
  /** Tag */
  Tag: list({
    fields: {
      name: text(),
      slug: slugField,
      ...timestampFields,
      category: relationship({
        ref: 'Category.tags',
        ui: {
          displayMode: 'select',
          labelField: 'name',
          hideCreate: true,
        },
      }),
      posts: relationship({ ref: 'Post.tags', many: true }),
    },
    ui: {
      listView: {
        initialColumns: ['name', 'slug', 'category'],
      },
    },
  }),
  /** Image */
  Image: list({
    fields: {
      name: text({ defaultValue: '' }),
      type: text({ defaultValue: '' }),
      altText: imageAltField,
      image: imageStorageField,
    },
    hooks: {
      resolveInput: async ({ resolvedData, item }) => {
        const { name, image } = resolvedData
        const imageId = (image as IImageFieldInput).id ?? item?.image_id
        const origFilename = imageId ? imageId.split('-').slice(0, -1).join('-') : ''

        if (name === '') {
          return { ...resolvedData, name: origFilename || item?.name }
        }

        return resolvedData
      },
    },
    ui: {
      listView: {
        initialColumns: ['name', 'type', 'altText', 'image'],
      },
    },
  }),
}
