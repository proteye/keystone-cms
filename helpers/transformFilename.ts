import cuid from 'cuid'
import slugify from 'slugify'
import { parseFilename } from './parseFilename'

export const transformFilename = (filename: string) => {
  const { name } = parseFilename(filename)
  const safeFilename = slugify(name, { replacement: '-' })
  const id = cuid()

  return `${safeFilename}-${id}`
}
