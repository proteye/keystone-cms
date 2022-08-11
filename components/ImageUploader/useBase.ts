import { ChangeEvent, useCallback, useState } from 'react'
import { useMutation, gql } from '@keystone-6/core/admin-ui/apollo'
import { useList } from '@keystone-6/core/admin-ui/context'
import { useToasts } from '@keystone-ui/toast'
import { IImageUploaderProps } from './types'

const useBase = ({
  listKey,
  defaultValue,
  imageAlt,
  onChange,
  onImageAltChange,
  onRelationChange,
}: IImageUploaderProps) => {
  const [altText, setAltText] = useState(imageAlt ?? '')
  const [imageSrc, setImageSrc] = useState(defaultValue?.image?.url ?? '')

  const list = useList(listKey)
  const toasts = useToasts()

  const UPLOAD_IMAGE = gql`
    mutation ${list.gqlNames.createMutationName}($file: Upload!) {
      ${list.gqlNames.createMutationName}(data: { image: { upload: $file } }) {
        id, name, type, image { id, extension, filesize, height, width, url }
      }
    }
  `

  const [uploadImage, { loading }] = useMutation(UPLOAD_IMAGE)

  const uploadFile = useCallback(
    async (file: File) => {
      try {
        return await uploadImage({
          variables: { file },
        })
      } catch (err: any) {
        toasts.addToast({
          title: `Failed to upload file: ${file.name}`,
          tone: 'negative',
          message: err.message,
        })
      }

      return null
    },
    [toasts, uploadImage],
  )

  const handleAltTextChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.currentTarget
      setAltText(value)
      onImageAltChange?.(value)
    },
    [onImageAltChange],
  )

  const handleUploadChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.currentTarget.files?.[0]
      const src = selectedFile ? URL.createObjectURL(selectedFile) : ''
      setImageSrc(src)

      if (selectedFile) {
        const result = await uploadFile(selectedFile)
        const uploadedImage = result?.data?.createImage
        onChange?.({ id: uploadedImage.id })
        if (onRelationChange) {
          setTimeout(
            () => onRelationChange({ id: uploadedImage.id, label: uploadedImage.name, data: uploadedImage }),
            0,
          )
        }
      }
    },
    [onChange, onRelationChange],
  )

  return {
    altText,
    imageSrc,
    loading,
    isShowLabel: !loading && !imageSrc,
    isShowImage: !loading && !!imageSrc,
    handleAltTextChange,
    handleUploadChange,
  }
}

export default useBase
