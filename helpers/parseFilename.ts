export const parseFilename = (fullFilename: string) => {
  if (!fullFilename) {
    return { filename: '', extension: '' }
  }

  const splittedFilename = fullFilename.split('.')
  const filename = splittedFilename.slice(0, -1).join('.')
  const extension = splittedFilename.reverse()[0]

  return { filename, extension }
}
