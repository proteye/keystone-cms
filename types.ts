import { Scalars } from '.keystone/types'

export type TAny = any

export interface Session {
  data: {
    id: string
    name: string
    isAdmin: boolean
  }
}

export interface UserData {
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
