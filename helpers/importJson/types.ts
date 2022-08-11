import { Scalars } from '.keystone/types'
import { IImageFieldInput } from '../../types'

export type TDefaultResult = {
  id: string
  slug: string
}

export type TUserProps = {
  name: string
  email: string
  isAdmin?: boolean
}

export type TCategoryProps = {
  name: string
  slug: string
  description: string
  status: 'draft' | 'published'
  image?: { id: string }
  imageAlt?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
}

export type TTagProps = {
  name: string
  slug: string
  category?: { id: string }
}

export type TImageProps = {
  name: string
  type: string
  filename: string
  image: IImageFieldInput
}

export type TPageProps = {
  title: string
  slug: string
  content: Scalars['JSON'] | null
  status: 'draft' | 'published'
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  viewsCount?: number
  image?: { id: string }
  imageAlt?: string
  author?: { id: string }
}

export type TPostProps = {
  title: string
  slug: string
  brief: string
  content: Scalars['JSON'] | null
  publishDate: string
  status: 'draft' | 'published'
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  viewsCount?: number
  image?: { id: string }
  imageAlt?: string
  author?: { id: string }
  category?: { id: string }
  tags?: { id: string }[]
}

export type TUpdatePostProps = {
  id: string
  content: Scalars['JSON'] | null
}
