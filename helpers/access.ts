import { Session, UserData } from '../types'

// Validate there is a user with a valid session
export const isUser = ({ session }: { session: Session }) => !!session?.data.id

// Validate the current user is an Admin
export const isAdmin = ({ session }: { session: Session }) => session?.data.isAdmin

// Validate the current user is updating themselves
export const isPerson = ({ session, item }: { session: Session; item: UserData }) => session?.data.id === item.id

// Validate the current user is an Admin, or updating themselves
export const isAdminOrPerson = ({ session, item }: { session: Session; item: UserData }) =>
  isAdmin({ session }) || isPerson({ session, item })
