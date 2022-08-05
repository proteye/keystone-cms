import cuid from 'cuid'
import slugify from 'slugify'

export const transformFilename = (fullFilename: string) => {
  const filename = fullFilename.split('.').slice(0, -1).join('.')
  const safeFilename = slugify(filename, { replacement: '-' })
  const id = cuid()

  return `${safeFilename}-${id}`
}
