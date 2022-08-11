import { HydratedRelationshipData } from '@keystone-6/fields-document/dist/declarations/src/DocumentEditor/component-blocks/api'
import { TImageListData } from '../../types'

export type TImageValue = TImageListData | null

export interface IImageUploaderProps {
  listKey: string
  defaultValue?: TImageValue
  imageAlt?: string
  mode?: 'edit' | 'preview'
  onChange?(value: TImageValue): void
  onImageAltChange?(value: string): void
  onRelationChange?(value: HydratedRelationshipData): void
}
