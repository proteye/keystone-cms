import { statSync } from 'fs'

export const getFileSize = (fileUrl: string) => {
  const stats = statSync(fileUrl)
  return stats.size
}
