import React from 'react'
import { NotEditable, component, fields, FormField } from '@keystone-6/fields-document/component-blocks'
import { TAny } from '../types'
import { TImageFieldOptions, TImageFieldValue } from './types'
import { ImageUploader } from './components/ImageUploader'

const customFields = {
  image({ listKey, defaultValue = null }: TImageFieldOptions): FormField<TImageFieldValue, TImageFieldOptions> {
    return {
      kind: 'form',
      Input({ value, onChange, autoFocus }) {
        return <ImageUploader listKey={listKey} defaultValue={value} onChange={onChange} />
        // return (
        //   <FieldContainer>
        //     <Gallery listKey={listKey} value={value} onChange={(items) => onChange(items)} />
        //   </FieldContainer>
        // )
      },
      options: { listKey },
      defaultValue,
      validate(value) {
        return typeof value === 'object'
      },
    }
  },
}

export const componentBlocks: TAny = {
  image: component({
    preview: (props) => {
      const imageSrc = props.fields.image.value?.image?.url
      const altText = props.fields.image.value?.altText

      return (
        <NotEditable>
          <div style={{ width: '100%' }}>
            <img src={imageSrc} alt={altText} title={altText} />
          </div>
        </NotEditable>
      )
    },
    label: 'Image',
    schema: {
      image: customFields.image({
        listKey: 'Image',
      }),
      // capture: fields.child({
      //   kind: 'block',
      //   placeholder: 'Capture...',
      //   formatting: { inlineMarks: 'inherit', softBreaks: 'inherit' },
      //   links: 'inherit',
      // }),
    },
    // schema: {
    //   content: fields.child({
    //     kind: 'block',
    //     placeholder: 'Quote...',
    //     formatting: { inlineMarks: 'inherit', softBreaks: 'inherit' },
    //     links: 'inherit',
    //   }),
    //   attribution: fields.child({ kind: 'inline', placeholder: 'Attribution...' }),
    // },
    chromeless: false,
  }),
}
