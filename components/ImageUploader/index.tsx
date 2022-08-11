/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core'
import { FC } from 'react'
import styles from './styles'
import useBase from './useBase'
import { IImageUploaderProps } from './types'

export const ImageUploader: FC<IImageUploaderProps> = (props) => {
  const { altText, imageSrc, loading, isShowLabel, isShowImage, handleAltTextChange, handleUploadChange } =
    useBase(props)
  const { mode } = props

  return (
    <div css={styles.container(mode)}>
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
        <img
          src={imageSrc}
          alt={altText}
          css={styles.imagePreview}
          style={{ display: isShowImage ? 'block' : 'none' }}
        />
      </label>
      {mode === 'preview' && (
        <div css={styles.inputWrapper}>
          <label>Image Alt:</label>
          <input type="text" placeholder="" css={styles.textInput} value={altText} onChange={handleAltTextChange} />
        </div>
      )}
    </div>
  )
}

ImageUploader.defaultProps = {
  defaultValue: null,
  imageAlt: '',
  mode: 'preview',
}
