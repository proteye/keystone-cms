export type TImageFieldData = {
  id: string
  image?: {
    url: string
  }
}

export type TImageFieldValue = TImageFieldData | null

export type TImageFieldOptions = {
  listKey: string
}
