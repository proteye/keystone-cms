import React from 'react'
import { FormField } from '@keystone-6/fields-document/component-blocks'
import { ImageUploader } from './components/ImageUploader'
import { TImageValue } from './components/ImageUploader/types'

type TImageOptions = {
  listKey: string
}

export const image = ({ listKey }: TImageOptions): FormField<TImageValue, TImageOptions> => {
  return {
    kind: 'form',
    Input({ value, onChange }) {
      return <ImageUploader listKey={listKey} defaultValue={value} mode="edit" onChange={onChange} />
    },
    options: { listKey },
    defaultValue: null,
    validate(value) {
      return typeof value === 'object'
    },
  }
}
