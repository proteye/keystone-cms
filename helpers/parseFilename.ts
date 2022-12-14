export const parseFilename = (filename: string) => {
  if (!filename) {
    return { name: '', extension: '', filename: '' }
  }

  const splittedFilename = filename.split('.')
  const name = splittedFilename.slice(0, -1).join('.')
  const extension = splittedFilename.reverse()[0].toLowerCase()

  return { name, extension, filename: `${name}.${extension}` }
}
