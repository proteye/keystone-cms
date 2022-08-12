import { ISession, IUserData } from './types'

// Validate there is a user with a valid session
export const isUser = ({ session }: { session: ISession }) => !!session?.data.id

// Validate the current user is an Admin
export const isAdmin = ({ session }: { session: ISession }) => session?.data.isAdmin

// Validate the current user is updating themselves
export const isPerson = ({ session, item }: { session: ISession; item: IUserData }) => session?.data.id === item.id

// Validate the current user is an Admin, or updating themselves
export const isAdminOrPerson = ({ session, item }: { session: ISession; item: IUserData }) =>
  isAdmin({ session }) || isPerson({ session, item })
