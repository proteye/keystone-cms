import { readFileSync } from 'fs'
import { BaseKeystoneTypeInfo, KeystoneContext } from '@keystone-6/core/types'
import { EImageType } from '../../types'
import { parseFilename } from '../parseFilename'
import { removeHtmlTags } from '../removeHtmlTags'
import { convertHtmlToDocument } from '../convertHtmlToDocument'
import { clearEmptyElements, TContentProps } from '../clearEmptyElements'
import { IMPORT_DIR } from './constants'
import { createCategory, createImage, createPage, createPost, createTag, createUser, updatePost } from './functions'
import { TCategoryProps, TDefaultResult, TPageProps, TPostProps, TUpdatePostProps } from './types'

const IMPORT_SUBDIR = 'mysql'

const importMysql = async (context: KeystoneContext<BaseKeystoneTypeInfo>) => {
  console.log(`🌱 Importing Mysql JSON-data`)
  const importDir = `${IMPORT_DIR}/${IMPORT_SUBDIR}`

  console.log(`👩 Adding users...`)
  let data = readFileSync(`${importDir}/user.json`, 'utf8')
  const users = JSON.parse(data)
  data = readFileSync(`${importDir}/user_profile.json`, 'utf8')
  const userProfiles = JSON.parse(data)
  const addedUsers = []

  for (const user of users) {
    const profile = userProfiles.find(({ user_id: userId }: { user_id: number }) => user.id === userId)
    const preparedUser = {
      name: profile.nick_nm,
      email: user.email,
      isAdmin: user.id === 1,
    }
    const result = await createUser(context, preparedUser)
    addedUsers.push(result)
  }

  console.log(`📂 Adding categories...`)
  data = readFileSync(`${importDir}/category.json`, 'utf8')
  const categories = JSON.parse(data)
  const addedCategories = []

  for (const category of categories) {
    const categoryOld = category.parent_id
      ? categories.find(({ id }: { id: number }) => category.parent_id === id)
      : null
    const parentCategory = categoryOld ? addedCategories.find(({ slug }) => categoryOld.slug === slug) : null
    const preparedCategory: TCategoryProps = {
      name: category.name,
      slug: category.slug,
      description: removeHtmlTags(category.description),
      status: category.status === 1 ? 'published' : 'draft',
      seoTitle: category.meta_title,
      seoDescription: category.meta_description,
      seoKeywords: category.meta_keywords,
      parent: parentCategory ? { connect: { id: parentCategory.id } } : undefined,
    }
    const result = await createCategory(context, preparedCategory)
    addedCategories.push(result)
  }

  console.log(`📂 Adding tags...`)
  data = readFileSync(`${importDir}/tag.json`, 'utf8')
  const tags = JSON.parse(data)
  const addedTags: { id: string; slug: string }[] = []

  for (const tag of tags) {
    const preparedTag = {
      name: tag.title,
      slug: tag.slug,
      category: undefined,
    }
    const result = (await createTag(context, preparedTag)) as TDefaultResult
    addedTags.push(result)
  }

  console.log(`🖼 Adding images...`)
  data = readFileSync(`${importDir}/image.json`, 'utf8')
  const images = JSON.parse(data)
  const addedImages: { id: string; filename: string }[] = []

  for (const image of images) {
    const { name: id, extension, filename } = parseFilename(image.file)
    const preparedImage = {
      name: id,
      type: EImageType.DOCUMENT,
      filename,
      image: { id, extension },
    }
    const result = await createImage(context, preparedImage)
    addedImages.push(result)
  }

  const addedImagesMap = new Map(addedImages.map(({ id, filename }) => [filename, id] as [string, string]))

  console.log(`📄 Adding pages...`)
  data = readFileSync(`${importDir}/page.json`, 'utf8')
  const pages = JSON.parse(data)

  for (const page of pages) {
    const preparedPage: TPageProps = {
      title: page.title,
      slug: page.slug,
      content: convertHtmlToDocument(page.content, addedImagesMap),
      status: 'published',
      seoTitle: page.meta_title,
      seoDescription: page.meta_description,
      seoKeywords: page.meta_keywords,
      viewsCount: page.viewsCount ?? 0,
      author: { id: addedUsers[0].id },
    }
    await createPage(context, preparedPage)
  }

  console.log(`📝 Adding posts...`)
  data = readFileSync(`${importDir}/post.json`, 'utf8')
  const posts = JSON.parse(data)

  data = readFileSync(`${importDir}/post_tag.json`, 'utf8')
  const postTags: { post_id: number; tag_id: number }[] = JSON.parse(data)

  for (const post of posts) {
    const imageOld = post.image
    let addedImage = undefined
    if (imageOld) {
      const { name: id, extension, filename } = parseFilename(imageOld)
      const preparedImage = {
        name: id,
        type: 'Post',
        filename,
        image: { id, extension },
      }
      addedImage = await createImage(context, preparedImage)
    }
    const authorOld = users.find(({ id }: { id: number }) => post.created_by === id)
    const author = addedUsers.find(({ email }) => authorOld.email === email)
    const categoryOld = categories.find(({ id }: { id: number }) => post.category_id === id)
    const category = addedCategories.find(({ slug }) => categoryOld.slug === slug)
    const tagsOld: { slug: string }[] = postTags
      .filter(({ post_id }) => post.id === post_id)
      .map(({ tag_id }) => tags.find(({ id }: { id: number }) => tag_id === id))
    const preparedTags = tagsOld.map(({ slug: slugOld }) => {
      const tag = addedTags.find(({ slug }) => slugOld === slug)
      return { id: tag?.id ?? '' }
    })

    const preparedPost: TPostProps = {
      title: post.title,
      slug: post.slug,
      brief: removeHtmlTags(post.quote),
      content: convertHtmlToDocument(post.content, addedImagesMap),
      publishDate: new Date(post.published_at * 1000).toISOString(),
      status: post.status === 1 ? 'published' : 'draft',
      seoTitle: post.meta_title,
      seoDescription: post.meta_description,
      seoKeywords: post.meta_keywords,
      viewsCount: post.view_count,
      image: addedImage ? { id: addedImage.id } : undefined,
      imageAlt: post.image_alt ?? '',
      author: author ? { id: author.id } : undefined,
      category: category ? { id: category.id } : undefined,
      tags: preparedTags,
    }
    const createdPost = await createPost(context, preparedPost)
    // clear content and update post
    if (createdPost) {
      createdPost.content = clearEmptyElements(createdPost.content.document as TContentProps)
      await updatePost(context, createdPost as TUpdatePostProps)
    }
  }

  console.log(`✅ JSON-data inserted`)
  console.log(`👋 Please start the process with \`yarn dev\` or \`npm run dev\``)
  process.exit()
}

export default importMysql
