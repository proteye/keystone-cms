import React from 'react'
import { NotEditable, component, fields } from '@keystone-6/fields-document/component-blocks'
import { ImageUploader } from './components/ImageUploader'
import { image } from './document-fields'

export const componentBlocks = {
  /** Image */
  image: component({
    preview: ({ fields }) => (
      <NotEditable>
        <ImageUploader
          listKey={fields.image.options.listKey}
          defaultValue={fields.imageRel.value?.data}
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
      imageRel: fields.relationship({
        listKey: 'Image',
        label: 'Image Relation',
        selection: 'id, image { url }',
      }),
      image: image({
        listKey: 'Image',
      }),
    },
    chromeless: true,
  }),
  /** YouTube Video */
  youtube: component({
    preview: ({ fields }) => (
      <NotEditable>
        <div>
          {fields.url.value ? (
            <iframe
              style={{
                maxWidth: '100%',
                width: fields.width.value
                  ? `${fields.width.value}${fields.width.value.includes('%') ? '' : 'px'}`
                  : 'auto',
                height: fields.height.value ? `${fields.height.value}px` : '100%',
              }}
              src={fields.url.value}
              title="YouTube video player"
              frameBorder="0"
              scrolling="no"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              allowFullScreen
            />
          ) : (
            <span>Please, edit video URL...</span>
          )}
        </div>
      </NotEditable>
    ),
    label: 'Youtube',
    schema: {
      url: fields.url({
        label: 'Youtube embed URL',
        defaultValue: '',
      }),
      width: fields.text({
        label: 'Video player width',
        defaultValue: '',
      }),
      height: fields.text({
        label: 'Video player height',
        defaultValue: '',
      }),
    },
    chromeless: false,
  }),
}
