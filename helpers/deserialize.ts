import { jsx } from 'slate-hyperscript'
import { TAny } from '../types'

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

type TTagName = 'body' | 'br' | 'a' | 'img' | keyof typeof BLOCK_TAGS | keyof typeof MARK_TAGS
type TBlockTagName = keyof typeof BLOCK_TAGS
type TMarkTagName = keyof typeof MARK_TAGS

/**
 * Deserialize DOM elements
 */
export const deserialize = (el: TAny, markAttributes = {}) => {
  if (el.nodeType === Node.TEXT_NODE) {
    return jsx('text', markAttributes, el.textContent)
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
    .map((node) => deserialize(node, nodeAttributes))
    .flat()

  if (children.length === 0) {
    children.push(jsx('text', nodeAttributes, ''))
  }

  if (/^h[1-6]$/.test(tagName)) {
    const level = parseInt(tagName.replace('h', ''))
    return jsx('element', { type: BLOCK_TAGS[tagName as TBlockTagName], level }, children)
  }

  if (BLOCK_TAGS[tagName as TBlockTagName]) {
    return jsx('element', { type: BLOCK_TAGS[tagName as TBlockTagName] }, children)
  }

  switch (tagName) {
    case 'body':
      return jsx('fragment', {}, children)
    case 'br':
      return '\n'
    case 'a':
      return jsx('element', { type: 'link', href: el.getAttribute('href') }, children)
    default:
      return children
  }
}