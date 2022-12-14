import { Scalars } from '.keystone/types'

export type TAny = any

export interface ISession {
  data: {
    id: string
    name: string
    isAdmin: boolean
  }
}

export interface IUserData {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

export interface IHookResolvedData {
  title?: Scalars['String'] | null
  name?: Scalars['String'] | null
  slug?: Scalars['String'] | null
}

export interface IHookItemData {
  title?: string
  name?: string
  slug: string
}

export interface IImageFieldInput {
  id?: string
  extension?: string
  filesize?: number
  height?: number
  width?: number
}

export enum EImageType {
  CATEGORY = 'Category',
  PAGE = 'Page',
  POST = 'Post',
  DOCUMENT = 'Document', // from document editor
}
