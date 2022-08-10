import React from 'react'
import { NotEditable, component, fields, FormField } from '@keystone-6/fields-document/component-blocks'
import { TAny } from '../types'
import { TImageFieldData, TImageFieldOptions, TImageFieldValue } from './types'
import { ImageUploader } from './components/ImageUploader'

const customFields = {
  image({ listKey }: TImageFieldOptions): FormField<TImageFieldValue, TImageFieldOptions> {
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
  },
}

export const componentBlocks: TAny = {
  image: component({
    preview: ({ fields }) => (
      <NotEditable>
        <ImageUploader
          listKey={fields.image.options.listKey}
          defaultValue={fields.imageRel.value?.data as TImageFieldData}
          imageAlt={fields.imageAlt.value}
          onChange={fields.image.onChange}
          onImageAltChange={fields.imageAlt.onChange}
          onRelationChange={fields.imageRel.onChange}
        />
      </NotEditable>
    ),
    label: 'Image',
    schema: {
      imageAlt: fields.text({
        label: 'Image Alt',
        defaultValue: '',
      }),
      image: customFields.image({
        listKey: 'Image',
      }),
      imageRel: fields.relationship({
        listKey: 'Image',
        label: 'Image Relation',
        selection: 'id, image { url }',
      }),
    },
    chromeless: true,
  }),
}
