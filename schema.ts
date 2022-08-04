import { list } from '@keystone-6/core'
import { text, relationship, password, timestamp, select, checkbox } from '@keystone-6/core/fields'
import {
  Lists,
  PostCreateInput,
  PostUpdateInput,
  PageCreateInput,
  PageUpdateInput,
  CategoryCreateInput,
  CategoryUpdateInput,
  TagCreateInput,
  TagUpdateInput,
} from '.keystone/types'
import { isAdmin, isAdminOrPerson, isPerson, isUser } from './validation'
import {
  contentField,
  imageAltField,
  imageField,
  orderField,
  seoFields,
  slugField,
  statusField,
  timestampFields,
  viewsCountField,
} from './fields'
import { slugResolveInput } from './hooks'

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
        },
      }),
      password: password({
        validation: { isRequired: true },
        access: {
          read: isAdminOrPerson,
          update: isPerson,
        },
      }),
      avatar: imageField,
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
        initialColumns: ['name', 'isAdmin', 'posts'],
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
      imageAlt: imageAltField,
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
      author: relationship({
        ref: 'User.posts',
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineEdit: { fields: ['name'] },
          linkToItem: true,
          inlineConnect: true,
        },
      }),
      category: relationship({
        ref: 'Category.posts',
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'slug'],
          inlineEdit: { fields: ['name', 'slug'] },
          linkToItem: true,
          inlineConnect: true,
        },
      }),
      tags: relationship({
        ref: 'Tag.posts',
        ui: {
          displayMode: 'cards',
          cardFields: ['name'],
          inlineEdit: { fields: ['name'] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ['name'] },
        },
        many: true,
      }),
    },
    hooks: {
      resolveInput: slugResolveInput<PostCreateInput | PostUpdateInput, Lists.Post.Item>,
    },
  }),
  /** Page */
  Page: list({
    fields: {
      title: text({ isFilterable: true, validation: { isRequired: true } }),
      slug: slugField,
      content: contentField,
      image: imageField,
      imageAlt: imageAltField,
      status: statusField,
      order: orderField,
      ...seoFields,
      ...timestampFields,
      viewsCount: viewsCountField,
      author: relationship({
        ref: 'User.pages',
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineEdit: { fields: ['name'] },
          linkToItem: true,
          inlineConnect: true,
        },
      }),
    },
    hooks: {
      resolveInput: slugResolveInput<PageCreateInput | PageUpdateInput, Lists.Page.Item>,
    },
  }),
  /** Category */
  Category: list({
    fields: {
      name: text({ validation: { isRequired: true } }),
      slug: slugField,
      description: text({ ui: { displayMode: 'textarea' } }),
      image: imageField,
      imageAlt: imageAltField,
      status: statusField,
      order: orderField,
      ...seoFields,
      ...timestampFields,
      posts: relationship({ ref: 'Post.category', many: true }),
      tags: relationship({ ref: 'Tag.category', many: true }),
    },
    hooks: {
      resolveInput: slugResolveInput<CategoryCreateInput | CategoryUpdateInput, Lists.Category.Item>,
    },
  }),
  /** Tag */
  Tag: list({
    fields: {
      name: text(),
      slug: slugField,
      ...timestampFields,
      category: relationship({ ref: 'Category.tags' }),
      posts: relationship({ ref: 'Post.tags', many: true }),
    },
    hooks: {
      resolveInput: slugResolveInput<TagCreateInput | TagUpdateInput, Lists.Tag.Item>,
    },
  }),
}
