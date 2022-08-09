import { TImageFieldValue } from '../../types'

export interface IImageUploaderProps {
  listKey: string
  defaultValue?: TImageFieldValue
  onChange?(value: TImageFieldValue): void
}
