import { readFileSync } from 'fs'
import { BaseKeystoneTypeInfo, KeystoneContext } from '@keystone-6/core/types'
import { Scalars } from '.keystone/types'
import { IImageFieldInput } from '../types'
import { parseFilename } from './parseFilename'
import { removeHtmlTags } from './removeHtmlTags'
import { convertHtmlToDocument } from './convertHtmlToDocument'

const IMPORT_DIR = './import_data'

const DEFAULT_PASSWORD = 'qwer1234'
const DEFAULT_WIDTH = 800
const DEFAULT_HEIGHT = 600

type TDefaultResult = {
  id: string
  slug: string
}

type UserProps = {
  name: string
  email: string
  isAdmin?: boolean
}

type CategoryProps = {
  name: string
  slug: string
  description: string
  image?: { id: string }
  status?: 'draft' | 'published'
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
}

type TagProps = {
  name: string
  slug: string
  category?: { id: string }
}

type ImageProps = {
  name: string
  type: string
  filename: string
  altText: string
  image: IImageFieldInput
}

type PageProps = {
  title: string
  slug: string
  content: Scalars['JSON'] | null // [{"type":"paragraph","children":[{"text":""}]}]
  status: 'draft' | 'published'
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  viewsCount?: number
  image?: { id: string }
  author?: { id: string }
}

type PostProps = {
  title: string
  slug: string
  brief: string
  content: Scalars['JSON'] | null // [{"type":"paragraph","children":[{"text":""}]}]
  publishDate: string
  status: 'draft' | 'published'
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  viewsCount?: number
  image?: { id: string }
  author?: { id: string }
  category?: { id: string }
  tags?: { id: string }[]
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
      data: { ...tagData, category: tagData.category ? { connect: { id: tagData.category.id } } : undefined },
      query: 'id slug',
    })
  }

  return tag
}

const createImage = async (context: KeystoneContext<BaseKeystoneTypeInfo>, imageData: ImageProps) => {
  const image = await context.query.Image.findOne({
    where: { filename: imageData.filename },
    query: 'id filename',
  })

  if (!image) {
    const { image: imageProps } = imageData
    const data = {
      ...imageData,
      image: undefined,
      image_id: imageProps.id,
      image_extension: imageProps.extension,
      image_filesize: imageProps.filesize,
      image_width: imageProps.width ?? DEFAULT_WIDTH,
      image_height: imageProps.height ?? DEFAULT_HEIGHT,
    }
    return await context.prisma.image.create({ data })
  }

  return image
}

const createPage = async (context: KeystoneContext<BaseKeystoneTypeInfo>, pageData: PageProps) => {
  const page = await context.query.Page.findOne({
    where: { slug: pageData.slug },
    query: 'id slug',
  })

  if (!page) {
    return await context.query.Page.createOne({
      data: {
        ...pageData,
        image: pageData.image ? { connect: { id: pageData.image.id } } : undefined,
        author: pageData.author ? { connect: { id: pageData.author.id } } : undefined,
      },
      query: 'id slug',
    })
  }

  return page
}

const createPost = async (context: KeystoneContext<BaseKeystoneTypeInfo>, postData: PostProps) => {
  const post = await context.query.Post.findOne({
    where: { slug: postData.slug },
    query: 'id slug',
  })

  if (!post) {
    return await context.query.Post.createOne({
      data: {
        ...postData,
        image: postData.image ? { connect: { id: postData.image.id } } : undefined,
        author: postData.author ? { connect: { id: postData.author.id } } : undefined,
        category: postData.category ? { connect: { id: postData.category.id } } : undefined,
        tags: postData.tags ? { connect: postData.tags } : undefined,
      },
      query: 'id slug',
    })
  }

  return post
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
    const preparedCategory = {
      name: category.name,
      slug: category.slug,
      description: removeHtmlTags(category.description),
      seoTitle: category.seo.title,
      seoDescription: category.seo.description,
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
      const { filename: id, extension } = parseFilename(imageOld.filename)
      const preparedImage = {
        name: id,
        type: 'Page',
        filename: imageOld.filename,
        altText: page.imageAlt ?? '',
        image: { id, extension, filesize: imageOld.size },
      }
      addedImage = await createImage(context, preparedImage)
    }
    const preparedPage: PageProps = {
      title: page.title,
      slug: page.slug,
      content: [{ type: 'paragraph', children: [{ text: removeHtmlTags(page.content.extended) }] }],
      status: 'published',
      seoTitle: page.seo.title,
      seoDescription: page.seo.description,
      seoKeywords: page.seo.keywords,
      viewsCount: page.viewsCount,
      image: addedImage ? { id: addedImage.id } : undefined,
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
      const { filename: id, extension } = parseFilename(imageOld.filename)
      const preparedImage = {
        name: id,
        type: 'Post',
        filename: imageOld.filename,
        altText: post.imageAlt ?? '',
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

    const preparedPost: PostProps = {
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

export const importMysqlJson = async (context: KeystoneContext<BaseKeystoneTypeInfo>) => {
  console.log(`🌱 Importing MysqlDB JSON-data`)
  const importDir = `${IMPORT_DIR}/mysql`

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

  // console.log(`📂 Adding categories...`)
  // data = readFileSync(`${importDir}/category.json`, 'utf8')
  // const categories = JSON.parse(data)
  // const addedCategories = []

  // for (const category of categories) {
  //   const preparedCategory = {
  //     name: category.name,
  //     slug: category.slug,
  //     description: removeHtmlTags(category.description),
  //     seoTitle: category.seo.title,
  //     seoDescription: category.seo.description,
  //   }
  //   const result = await createCategory(context, preparedCategory)
  //   addedCategories.push(result)
  // }

  // console.log(`📂 Adding tags...`)
  // data = readFileSync(`${importDir}/tag.json`, 'utf8')
  // const tags = JSON.parse(data)
  // const addedTags: { id: string; slug: string }[] = []

  // for (const tag of tags) {
  //   const categoryOld = categories.find((item: { _id: { $oid: string } }) => tag.category.$oid === item._id.$oid)
  //   const category = addedCategories.find(({ slug }) => categoryOld.slug === slug)
  //   const preparedTag = {
  //     name: tag.name,
  //     slug: tag.slug,
  //     category: category ? { id: category.id } : undefined,
  //   }
  //   const result = (await createTag(context, preparedTag)) as TDefaultResult
  //   addedTags.push(result)
  // }

  // console.log(`📄 Adding pages...`)
  // data = readFileSync(`${importDir}/page.json`, 'utf8')
  // const pages = JSON.parse(data)

  // for (const page of pages) {
  //   const imageOld = page.image
  //   let addedImage = undefined
  //   if (imageOld) {
  //     const { filename: id, extension } = parseFilename(imageOld.filename)
  //     const preparedImage = {
  //       name: id,
  //       type: 'Page',
  //       filename: imageOld.filename,
  //       altText: page.imageAlt ?? '',
  //       image: { id, extension, filesize: imageOld.size },
  //     }
  //     addedImage = await createImage(context, preparedImage)
  //   }
  //   const preparedPage: PageProps = {
  //     title: page.title,
  //     slug: page.slug,
  //     content: [{ type: 'paragraph', children: [{ text: removeHtmlTags(page.content.extended) }] }],
  //     status: 'published',
  //     seoTitle: page.seo.title,
  //     seoDescription: page.seo.description,
  //     seoKeywords: page.seo.keywords,
  //     viewsCount: page.viewsCount,
  //     image: addedImage ? { id: addedImage.id } : undefined,
  //     author: { id: addedUsers[0].id },
  //   }
  //   await createPage(context, preparedPage)
  // }

  // console.log(`📝 Adding posts...`)
  // data = readFileSync(`${importDir}/post.json`, 'utf8')
  // const posts = JSON.parse(data)

  // for (const post of posts) {
  //   const imageOld = post.image
  //   let addedImage = undefined
  //   if (imageOld) {
  //     const { filename: id, extension } = parseFilename(imageOld.filename)
  //     const preparedImage = {
  //       name: id,
  //       type: 'Post',
  //       filename: imageOld.filename,
  //       altText: post.imageAlt ?? '',
  //       image: { id, extension, filesize: imageOld.size },
  //     }
  //     addedImage = await createImage(context, preparedImage)
  //   }
  //   const authorOld = users.find((item: { _id: { $oid: string } }) => post.author.$oid === item._id.$oid)
  //   const author = addedUsers.find(({ email }) => authorOld.email === email)
  //   const categoryOld = categories.find((item: { _id: { $oid: string } }) => post.category.$oid === item._id.$oid)
  //   const category = addedCategories.find(({ slug }) => categoryOld.slug === slug)
  //   const tagsOld: { slug: string }[] = post.tags.map(({ $oid }: { $oid: string }) =>
  //     tags.find((item: { _id: { $oid: string } }) => $oid === item._id.$oid),
  //   )
  //   const preparedTags = tagsOld.map(({ slug: slugOld }) => {
  //     const tag = addedTags.find(({ slug }) => slugOld === slug)
  //     return { id: tag?.id ?? '' }
  //   })

  //   const preparedPost: PostProps = {
  //     title: post.title,
  //     slug: post.slug,
  //     brief: removeHtmlTags(post.content.brief),
  //     content: convertHtmlToDocument(post.content.extended),
  //     publishDate: new Date(post.publishedDate.$date).toISOString(),
  //     status: 'published',
  //     seoTitle: post.seo.title,
  //     seoDescription: post.seo.description,
  //     seoKeywords: post.seo.keywords,
  //     viewsCount: post.viewsCount,
  //     image: addedImage ? { id: addedImage.id } : undefined,
  //     author: author ? { id: author.id } : undefined,
  //     category: category ? { id: category.id } : undefined,
  //     tags: preparedTags,
  //   }
  //   await createPost(context, preparedPost)
  // }

  console.log(`✅ JSON-data inserted`)
  console.log(`👋 Please start the process with \`yarn dev\` or \`npm run dev\``)
  process.exit()
}
