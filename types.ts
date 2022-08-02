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
