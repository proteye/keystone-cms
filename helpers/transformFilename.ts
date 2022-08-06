import cuid from 'cuid'
import slugify from 'slugify'
import { parseFilename } from './parseFilename'

export const transformFilename = (fullFilename: string) => {
  const { filename } = parseFilename(fullFilename)
  const safeFilename = slugify(filename, { replacement: '-' })
  const id = cuid()

  return `${safeFilename}-${id}`
}
