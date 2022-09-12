import { BaseKeystoneTypeInfo, KeystoneContext } from '@keystone-6/core/types'
import { ISize } from 'image-size/dist/types/interface'
import { getFileSize } from '../getFileSize'
import { getImageSize } from '../getImageSize'
import { DEFAULT_HEIGHT, DEFAULT_PASSWORD, DEFAULT_SIZE, DEFAULT_WIDTH } from './constants'
import { TCategoryProps, TImageProps, TPageProps, TPostProps, TTagProps, TUpdatePostProps, TUserProps } from './types'

export const createUser = async (context: KeystoneContext<BaseKeystoneTypeInfo>, userData: TUserProps) => {
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

export const createCategory = async (context: KeystoneContext<BaseKeystoneTypeInfo>, categoryData: TCategoryProps) => {
  const category = await context.query.Category.findOne({
    where: { slug: categoryData.slug },
    query: 'id slug',
  })

  if (!category) {
    return await context.query.Category.createOne({
      data: categoryData,
      query: 'id slug',
    })
  }

  return category
}

export const createTag = async (context: KeystoneContext<BaseKeystoneTypeInfo>, tagData: TTagProps) => {
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

export const createImage = async (context: KeystoneContext<BaseKeystoneTypeInfo>, imageData: TImageProps) => {
  const image = await context.query.Image.findOne({
    where: { filename: imageData.filename },
    query: 'id filename',
  })

  if (!image) {
    const { image: imageProps, filename } = imageData
    const imageUrl = `public/images/${filename}`
    let imageFilesize = DEFAULT_SIZE
    let imageSize: ISize = { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT }

    try {
      const fileSizeRes = getFileSize(imageUrl)
      imageFilesize = fileSizeRes

      const imageSizeRes = getImageSize(imageUrl)
      imageSize = imageSizeRes
    } catch {}

    const data = {
      ...imageData,
      filename,
      image: undefined,
      image_id: imageProps.id,
      image_extension: imageProps.extension,
      image_filesize: imageFilesize,
      image_width: imageSize.width,
      image_height: imageSize.height,
    }
    return await context.prisma.image.create({ data })
  }

  return image
}

export const createPage = async (context: KeystoneContext<BaseKeystoneTypeInfo>, pageData: TPageProps) => {
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

export const createPost = async (context: KeystoneContext<BaseKeystoneTypeInfo>, postData: TPostProps) => {
  const post = await context.query.Post.findOne({
    where: { slug: postData.slug },
    query: 'id',
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
      query: 'id slug content { document }',
    })
  }

  return null
}

export const updatePost = async (context: KeystoneContext<BaseKeystoneTypeInfo>, { id, content }: TUpdatePostProps) => {
  return await context.query.Post.updateOne({
    where: { id },
    data: { content },
    query: 'id',
  })
}
