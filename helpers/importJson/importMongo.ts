import { readFileSync } from 'fs'
import { BaseKeystoneTypeInfo, KeystoneContext } from '@keystone-6/core/types'
import { parseFilename } from '../parseFilename'
import { removeHtmlTags } from '../removeHtmlTags'
import { convertHtmlToDocument } from '../convertHtmlToDocument'
import { IMPORT_DIR } from './constants'
import { createCategory, createImage, createPage, createPost, createTag, createUser } from './functions'
import { TCategoryProps, TDefaultResult, TPageProps, TPostProps } from './types'

const IMPORT_SUBDIR = 'mongo'

const importMongo = async (context: KeystoneContext<BaseKeystoneTypeInfo>) => {
  console.log(`🌱 Importing Mongo JSON-data`)
  const importDir = `${IMPORT_DIR}/${IMPORT_SUBDIR}`

  console.log(`👩 Adding users...`)
  let data = readFileSync(`${importDir}/user.json`, 'utf8')
  const users = JSON.parse(data)
  const addedUsers = []

  for (const user of users) {
    const preparedUser = {
      name: `${user.name.first} ${user.name.last}`,
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
    const preparedCategory: TCategoryProps = {
      name: category.name,
      slug: category.slug,
      description: removeHtmlTags(category.description),
      status: 'published',
      seoTitle: category.seo.title,
      seoDescription: category.seo.description,
      parent: undefined,
    }
    const result = await createCategory(context, preparedCategory)
    addedCategories.push(result)
  }

  console.log(`📂 Adding tags...`)
  data = readFileSync(`${importDir}/tag.json`, 'utf8')
  const tags = JSON.parse(data)
  const addedTags: { id: string; slug: string }[] = []

  for (const tag of tags) {
    const categoryOld = categories.find((item: { _id: { $oid: string } }) => tag.category.$oid === item._id.$oid)
    const category = addedCategories.find(({ slug }) => categoryOld.slug === slug)
    const preparedTag = {
      name: tag.name,
      slug: tag.slug,
      category: category ? { id: category.id } : undefined,
    }
    const result = (await createTag(context, preparedTag)) as TDefaultResult
    addedTags.push(result)
  }

  console.log(`📄 Adding pages...`)
  data = readFileSync(`${importDir}/page.json`, 'utf8')
  const pages = JSON.parse(data)

  for (const page of pages) {
    const imageOld = page.image
    let addedImage = undefined
    if (imageOld) {
      const { name: id, extension } = parseFilename(imageOld.filename)
      const preparedImage = {
        name: id,
        type: 'Page',
        filename: imageOld.filename,
        image: { id, extension, filesize: imageOld.size },
      }
      addedImage = await createImage(context, preparedImage)
    }
    const preparedPage: TPageProps = {
      title: page.title,
      slug: page.slug,
      content: [{ type: 'paragraph', children: [{ text: removeHtmlTags(page.content.extended) }] }],
      status: 'published',
      seoTitle: page.seo.title,
      seoDescription: page.seo.description,
      seoKeywords: page.seo.keywords,
      viewsCount: page.viewsCount,
      image: addedImage ? { id: addedImage.id } : undefined,
      imageAlt: page.imageAlt ?? '',
      author: { id: addedUsers[0].id },
    }
    await createPage(context, preparedPage)
  }

  console.log(`📝 Adding posts...`)
  data = readFileSync(`${importDir}/post.json`, 'utf8')
  const posts = JSON.parse(data)

  for (const post of posts) {
    const imageOld = post.image
    let addedImage = undefined
    if (imageOld) {
      const { name: id, extension } = parseFilename(imageOld.filename)
      const preparedImage = {
        name: id,
        type: 'Post',
        filename: imageOld.filename,
        image: { id, extension, filesize: imageOld.size },
      }
      addedImage = await createImage(context, preparedImage)
    }
    const authorOld = users.find((item: { _id: { $oid: string } }) => post.author.$oid === item._id.$oid)
    const author = addedUsers.find(({ email }) => authorOld.email === email)
    const categoryOld = categories.find((item: { _id: { $oid: string } }) => post.category.$oid === item._id.$oid)
    const category = addedCategories.find(({ slug }) => categoryOld.slug === slug)
    const tagsOld: { slug: string }[] = post.tags.map(({ $oid }: { $oid: string }) =>
      tags.find((item: { _id: { $oid: string } }) => $oid === item._id.$oid),
    )
    const preparedTags = tagsOld.map(({ slug: slugOld }) => {
      const tag = addedTags.find(({ slug }) => slugOld === slug)
      return { id: tag?.id ?? '' }
    })

    const preparedPost: TPostProps = {
      title: post.title,
      slug: post.slug,
      brief: removeHtmlTags(post.content.brief),
      content: convertHtmlToDocument(post.content.extended),
      publishDate: new Date(post.publishedDate.$date).toISOString(),
      status: 'published',
      seoTitle: post.seo.title,
      seoDescription: post.seo.description,
      seoKeywords: post.seo.keywords,
      viewsCount: post.viewsCount,
      image: addedImage ? { id: addedImage.id } : undefined,
      imageAlt: post.imageAlt ?? '',
      author: author ? { id: author.id } : undefined,
      category: category ? { id: category.id } : undefined,
      tags: preparedTags,
    }
    await createPost(context, preparedPost)
  }

  console.log(`✅ JSON-data inserted`)
  console.log(`👋 Please start the process with \`yarn dev\` or \`npm run dev\``)
  process.exit()
}

export default importMongo
