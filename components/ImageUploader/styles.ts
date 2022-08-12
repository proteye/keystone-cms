import { css } from '@keystone-ui/core'

const container = (mode = 'preview') => css`
  display: block;

  ${mode === 'preview' &&
  css`
    padding: 16px;
    border: 1px dotted #e2e8f0;
    border-radius: 8px;
  `}
`

const inputWrapper = css`
  display: flex;
  align-items: center;
  margin-top: 16px;

  label {
    font-weight: 500;
    margin-right: 8px;
  }
`

const textInput = css`
  width: 100%;
  max-width: 450px;
  padding: 6px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #334155;
  transition: border-color 0.1s ease-in;

  &:hover {
    border-color: #93c5fd;
  }

  &:focus {
    border-color: #3b82f6;
  }
`

const imageUploader = (isUploaded: boolean) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 80px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.1s ease-in;

  ${isUploaded &&
  css`
    justify-content: flex-start;
    height: auto;
    border: 0;
  `}

  &:hover {
    color: #3b82f6;
    border-color: #93c5fd;
  }

  &:focus {
    border-color: #3b82f6;
  }
`

const imagePreview = css`
  width: auto;
  height: auto;
  max-width: 100%;
  cursor: pointer;
`

export default {
  container,
  inputWrapper,
  textInput,
  imageUploader,
  imagePreview,
}
