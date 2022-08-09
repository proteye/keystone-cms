export type TImageFieldData = {
  id?: string
  name?: string
  type?: string
  altText?: string
  image?: {
    extension: string
    filesize: number
    height: number
    width: number
    url: string
  }
}

export type TImageFieldValue = TImageFieldData | null

export type TImageFieldOptions = {
  listKey: string
  defaultValue?: TImageFieldValue
}
