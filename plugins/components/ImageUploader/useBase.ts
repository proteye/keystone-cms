import { ChangeEvent, useCallback, useState, useRef } from 'react'
import {
  ApolloClient,
  useQuery,
  useMutation,
  useApolloClient,
  InMemoryCache,
  gql,
} from '@keystone-6/core/admin-ui/apollo'
import { useList } from '@keystone-6/core/admin-ui/context'
import { useToasts } from '@keystone-ui/toast'
import { IImageUploaderProps } from './types'

const useBase = ({ listKey, defaultValue, onChange }: IImageUploaderProps) => {
  const [altText, setAltText] = useState(defaultValue?.altText ?? '')
  const [imageSrc, setImageSrc] = useState(defaultValue?.image?.url ?? '')

  const list = useList(listKey)
  const toasts = useToasts()

  const UPLOAD_IMAGE = gql`
    mutation ${list.gqlNames.createMutationName}($altText: String, $type: String, $file: Upload!) {
      ${list.gqlNames.createMutationName}(data: { altText: $altText, type: $type, image: { upload: $file } }) {
        id, name, type, altText, image { id, extension, filesize, height, width, url }
      }
    }
  `

  const [uploadImage, { loading }] = useMutation(UPLOAD_IMAGE)

  const uploadFile = useCallback(
    async (file: File, alt: string) => {
      try {
        return await uploadImage({
          variables: { altText: alt, type: 'Document', file },
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

  const handleAltTextChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    setAltText(e.currentTarget.value)
  }, [])

  const handleUploadChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.currentTarget.files?.[0]
      const src = selectedFile ? URL.createObjectURL(selectedFile) : ''
      setImageSrc(src)

      if (selectedFile) {
        const result = await uploadFile(selectedFile, altText)
        const uploadedImage = result?.data?.createImage
        onChange?.(uploadedImage)
      }
    },
    [altText, onChange],
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
