/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core'
import { FC } from 'react'
import styles from './styles'
import { IImageUploaderProps } from './types'
import useBase from './useBase'

export const ImageUploader: FC<IImageUploaderProps> = (props) => {
  const { altText, imageSrc, loading, isShowLabel, isShowImage, handleAltTextChange, handleUploadChange } =
    useBase(props)

  return (
    <div>
      <input
        type="text"
        placeholder="Image Alt text..."
        css={styles.textInput}
        value={altText}
        onChange={handleAltTextChange}
      />
      <label id="file" css={styles.imageUploader(isShowImage)}>
        {isShowLabel && <span>🖱 Click to select a file...</span>}
        {loading && <span>Loading...</span>}
        <input
          autoComplete="off"
          type="file"
          accept={'image/*'}
          style={{ display: 'none' }}
          onChange={handleUploadChange}
        />
        <img src={imageSrc} css={styles.imagePreview} style={{ display: isShowImage ? 'block' : 'none' }} />
      </label>
    </div>
  )
}

ImageUploader.defaultProps = {
  defaultValue: null,
}
