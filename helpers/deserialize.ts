import { jsx } from 'slate-hyperscript'
import { TAny } from '../types'
import { getFilenameFromPath } from './getFilenameFromPath'

const Node = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
}

const BLOCK_TAGS = {
  p: 'paragraph',
  li: 'list-item',
  ul: 'unordered-list',
  ol: 'ordered-list',
  blockquote: 'blockquote',
  pre: 'code',
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  h5: 'heading',
  h6: 'heading',
  figure: 'figure',
  figcaption: 'figcaption',
  hr: 'divider',
  table: 'table',
  th: 'table-head',
  tr: 'table-row',
  td: 'table-cell',
  center: 'center',
}

const MARK_TAGS = {
  strong: 'bold',
  b: 'bold',
  em: 'italic',
  i: 'italic',
  u: 'underline',
  s: 'strikethrough',
  code: 'code',
}

export type TImageMap = Map<string, string> // { filename: image_id }
type TTagName = 'body' | 'br' | 'a' | 'img' | keyof typeof BLOCK_TAGS | keyof typeof MARK_TAGS
type TBlockTagName = keyof typeof BLOCK_TAGS
type TMarkTagName = keyof typeof MARK_TAGS

/**
 * Deserialize DOM elements
 */
export const deserialize = (el: TAny, markAttributes = {}, imagesMap: TImageMap = new Map()) => {
  const parentTagName = el.parentNode?.rawTagName?.toLowerCase()

  if (el.nodeType === Node.TEXT_NODE && parentTagName !== 'body') {
    return !el.textContent.trim() ? null : jsx('text', markAttributes, el.textContent.trimStart())
  } else if (el.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const tagName: TTagName = el.rawTagName?.toLowerCase()
  const nodeAttributes: TAny = { ...markAttributes }

  // define attributes for text nodes
  if (MARK_TAGS[tagName as TMarkTagName]) {
    nodeAttributes[MARK_TAGS[tagName as TMarkTagName]] = true
  }

  const children: TAny = Array.from(el.childNodes)
    .map((node) => deserialize(node, nodeAttributes, imagesMap))
    .flat()

  if (children.length === 0) {
    children.push(jsx('text', nodeAttributes, ''))
  }

  if (/^h[1-6]$/.test(tagName)) {
    const level = parseInt(tagName.replace('h', ''))
    const preparedChildren = children.filter((item: TAny) => item !== '\n' && item !== null)
    if (preparedChildren?.[0]?.text) {
      preparedChildren[0].text = preparedChildren[0].text.replaceAll('\n', '').trim()
    }
    return jsx('element', { type: BLOCK_TAGS[tagName as TBlockTagName], level }, preparedChildren)
  }

  if (tagName === 'p') {
    if (tagName === 'p' && children?.length === 1 && children[0]?.text) {
      children[0].text = children[0].text.trim()
    }
    return jsx('element', { type: BLOCK_TAGS[tagName] }, children)
  }

  if (BLOCK_TAGS[tagName as TBlockTagName]) {
    return jsx('element', { type: BLOCK_TAGS[tagName as TBlockTagName] }, children)
  }

  switch (tagName) {
    case 'body':
      return jsx('fragment', {}, children)
    case 'br':
      return parentTagName !== 'body' ? '\n' : null
    case 'a':
      const href = el.getAttribute('href')
      return href ? jsx('element', { type: 'link', href }, children) : null
    case 'img':
      const src = el.getAttribute('src')
      const imageAlt = el.getAttribute('alt') ?? ''

      if (!src) {
        return null
      }

      const filename = getFilenameFromPath(src)
      const imageId = imagesMap.get(filename)

      if (!imageId) {
        return null
      }

      return jsx(
        'element',
        {
          type: 'component-block',
          component: 'image',
          props: {
            imageAlt,
            image: { id: imageId },
            imageRel: { id: imageId },
          },
          children: [{ type: 'component-inline-prop', children: [{ text: '' }] }],
        },
        children,
      )
    default:
      return children
  }
}
