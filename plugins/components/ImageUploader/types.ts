import { HydratedRelationshipData } from '@keystone-6/fields-document/dist/declarations/src/DocumentEditor/component-blocks/api'
import { TImageFieldValue } from '../../types'

export interface IImageUploaderProps {
  listKey: string
  defaultValue?: TImageFieldValue
  imageAlt?: string
  mode?: 'edit' | 'preview'
  onChange?(value: TImageFieldValue): void
  onImageAltChange?(value: string): void
  onRelationChange?(value: HydratedRelationshipData): void
}
