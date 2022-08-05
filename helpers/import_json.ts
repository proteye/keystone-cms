import { readFileSync } from 'fs'
import { BaseKeystoneTypeInfo, KeystoneContext } from '@keystone-6/core/types'

const IMPORT_DIR = './import_data'

const DEFAULT_PASSWORD = 'qwerty12345'

type UserProps = {
  name: string
  email: string
  isAdmin?: boolean
}

type CategoryProps = {
  name: string
  slug: string
  description: string
  seoTitle: string
  seoDescription: string
  seoKeywords?: string
}

type TagProps = {
  name: string
  slug: string
  category: { id: string }
}

type PostProps = {
  title: string
  status: 'draft' | 'published'
  publishDate: string
  author: string
  content: string
}

const createUser = async (context: KeystoneContext<BaseKeystoneTypeInfo>, userData: UserProps) => {
  const user = await context.query.User.findOne({
    where: { email: userData.email },
    query: 'id email',
  })

  if (!user) {
    return await context.query.User.createOne({
      data: { ...userData, password: DEFAULT_PASSWORD },
      query: 'id email',
    })
  }

  return user
}

const createCategory = async (context: KeystoneContext<BaseKeystoneTypeInfo>, categoryData: CategoryProps) => {
  const category = await context.query.Category.findOne({
    where: { slug: categoryData.slug },
    query: 'id slug',
  })

  if (!category) {
    return await context.query.Category.createOne({
      data: { ...categoryData, status: 'published' },
      query: 'id slug',
    })
  }

  return category
}

const createTag = async (context: KeystoneContext<BaseKeystoneTypeInfo>, tagData: TagProps) => {
  const tag = await context.query.Tag.findOne({
    where: { slug: tagData.slug },
    query: 'id slug',
  })

  if (!tag) {
    return await context.query.Tag.createOne({
      data: { ...tagData, category: { connect: { id: tagData.category.id } } },
      query: 'id slug',
    })
  }

  return tag
}

export const importMongoJson = async (context: KeystoneContext<BaseKeystoneTypeInfo>) => {
  console.log(`🌱 Importing MongoDB JSON-data`)
  const importDir = `${IMPORT_DIR}/mongo`

  console.log(`👩 Adding users...`)
  let data = readFileSync(`${importDir}/user.json`, 'utf8')
  const users = JSON.parse(data)
  const addedUsers = []

  for (const user of users) {
    const preparedUser = {
      name: `${user.name.last} ${user.name.first}`,
      email: user.email,
      isAdmin: user.isAdmin,
    }
    const result = await createUser(context, preparedUser)
    addedUsers.push(result)
  }

  console.log(`📂 Adding categories...`)
  data = readFileSync(`${importDir}/category.json`, 'utf8')
  const categories = JSON.parse(data)
  const addedCategories = []

  for (const category of categories) {
    const preparedCategory = {
      name: category.name,
      slug: category.slug,
      description: category.description,
      seoTitle: category.seo.title,
      seoDescription: category.seo.description,
    }
    const result = await createCategory(context, preparedCategory)
    addedCategories.push(result)
  }

  console.log(`📂 Adding tags...`)
  data = readFileSync(`${importDir}/tag.json`, 'utf8')
  const tags = JSON.parse(data)
  const addedTags = []

  for (const tag of tags) {
    const oldCategory = categories.find((item: { _id: { $oid: string } }) => tag.category.$oid === item._id.$oid)
    const category = addedCategories.find(({ slug }) => oldCategory.slug === slug)
    const preparedTag = {
      name: tag.name,
      slug: tag.slug,
      category: { id: category?.id },
    }
    const result = await createTag(context, preparedTag)
    addedTags.push(result)
  }

  //   console.log(`📝 Adding posts...`)
  //   for (const post of posts) {
  //     await createPost(post)
  //   }

  console.log(`✅ JSON-data inserted`)
  console.log(`👋 Please start the process with \`yarn dev\` or \`npm run dev\``)
  process.exit()
}

export const importMysqlJson = async (context: KeystoneContext<BaseKeystoneTypeInfo>) => {
  console.log(`🌱 Importing MysqlDB JSON-data`)
  const importDir = `${IMPORT_DIR}/mysql`
  const data = readFileSync(`${importDir}/category.json`, 'utf8')
  const jsonData = JSON.parse(data)
  console.log('jsonData', jsonData)
  console.log(`✅ JSON-data inserted`)
  console.log(`👋 Please start the process with \`yarn dev\` or \`npm run dev\``)
  process.exit()
}
