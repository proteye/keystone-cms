/*
Welcome to the schema! The schema is the heart of Keystone.

Here we define our 'lists', which will then be used both for the GraphQL
API definition, our database tables, and our Admin UI layout.

Some quick definitions to help out:
A list: A definition of a collection of fields with a name. For the starter
  we have `User`, `Post`, and `Tag` lists.
A field: The individual bits of data on your list, each with its own type.
  you can see some of the lists in what we use below.

*/

// Like the `config` function we use in keystone.ts, we use functions
// for putting in our config so we get useful errors. With typescript,
// we get these even before code runs.
import { list } from '@keystone-6/core'

// We're using some common fields in the starter. Check out https://keystonejs.com/docs/apis/fields#fields-api
// for the full list of fields.
import { integer, text, relationship, password, timestamp, select, checkbox, image } from '@keystone-6/core/fields'
// The document field is a more complicated field, so it's in its own package
// Keystone aims to have all the base field types, but you can make your own
// custom ones.
import { document } from '@keystone-6/fields-document'

// We are using Typescript, and we want our types experience to be as strict as it can be.
// By providing the Keystone generated `Lists` type to our lists object, we refine
// our types to a stricter subset that is type-aware of other lists in our schema
// that Typescript cannot easily infer.
import { Lists } from '.keystone/types'
import { isAdmin, isAdminOrPerson, isPerson, isUser } from './helpers/access'
import { mainConfig } from './config'

const timestampFields = {
  createdAt: timestamp({ defaultValue: { kind: 'now' } }),
  updatedAt: timestamp({ defaultValue: { kind: 'now' }, db: { updatedAt: true } }),
}

const seoFields = {
  seoTitle: text({ defaultValue: '', validation: { length: { max: 255 } } }),
  seoDescription: text({ defaultValue: '', validation: { length: { max: 255 } } }),
  seoKeywords: text({ defaultValue: '', validation: { length: { max: 255 } } }),
}

const slugField = text({ isIndexed: 'unique', validation: { isRequired: true } })

const imageField = image({ storage: mainConfig.storage.localImages })
const imageAltField = text({ defaultValue: '', validation: { length: { max: 255 } } })

const statusField = select({
  options: [
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
  ],
  // We want to make sure new posts start off as a draft when they are created
  defaultValue: 'draft',
  // fields also have the ability to configure their appearance in the Admin UI
  ui: {
    displayMode: 'segmented-control',
  },
})

const orderField = integer({ defaultValue: -1, isIndexed: true })

const viewsCountField = integer({
  defaultValue: 0,
  ui: { itemView: { fieldMode: 'read' } },
})

// We have a users list, a blogs list, and tags for blog posts, so they can be filtered.
// Each property on the exported object will become the name of a list (a.k.a. the `listKey`),
// with the value being the definition of the list, including the fields.
export const lists: Lists = {
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
    // Here are the fields that `User` will have. We want an email and password so they can log in
    // a name so we can refer to them, and a way to connect users to posts.
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
      // The password field takes care of hiding details and hashing values
      password: password({
        validation: { isRequired: true },
        access: {
          // Note: password fields never reveal their value, only whether a value exists
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
      // Relationships allow us to reference other lists. In this case,
      // we want a user to have many posts, and we are saying that the user
      // should be referencable by the 'author' field of posts.
      // Make sure you read the docs to understand how they work: https://keystonejs.com/docs/guides/relationships#understanding-relationships
      posts: relationship({ ref: 'Post.author', many: true }),
      pages: relationship({ ref: 'Page.author', many: true }),
    },
    // Here we can configure the Admin UI. We want to show a user's name and posts in the Admin UI
    ui: {
      listView: {
        initialColumns: ['name', 'isAdmin', 'posts'],
      },
    },
  }),
  Post: list({
    fields: {
      title: text({ isFilterable: true, validation: { isRequired: true } }),
      slug: slugField,
      brief: text({ ui: { displayMode: 'textarea' } }),
      // The document field can be used for making highly editable content. Check out our
      // guide on the document field https://keystonejs.com/docs/guides/document-fields#how-to-use-document-fields
      // for more information
      content: document({
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
      }),
      image: imageField,
      imageAlt: imageAltField,
      // Having the status here will make it easy for us to choose whether to display
      // posts on a live site.
      status: statusField,
      commnetStatus: select({
        options: [
          { label: 'Open', value: 'open' },
          { label: 'Closed', value: 'closed' },
        ],
        defaultValue: 'closed',
      }),
      order: orderField,
      ...seoFields,
      ...timestampFields,
      publishDate: timestamp(),
      viewsCount: viewsCountField,
      commentCount: viewsCountField,
      // Here is the link from post => author.
      // We've configured its UI display quite a lot to make the experience of editing posts better.
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
      // We also link posts to tags. This is a many <=> many linking.
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
  }),
  Page: list({
    fields: {
      title: text({ isFilterable: true, validation: { isRequired: true } }),
      slug: slugField,
      content: document({
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
      }),
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
  }),
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
  }),
  Tag: list({
    ui: {
      isHidden: true,
    },
    fields: {
      name: text(),
      slug: slugField,
      ...timestampFields,
      category: relationship({ ref: 'Category.tags' }),
      posts: relationship({ ref: 'Post.tags', many: true }),
    },
  }),
}
