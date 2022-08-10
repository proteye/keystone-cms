import { parse } from 'node-html-parser'
import { deserialize, TImageMap } from './deserialize'

/**
 * Convert HTML markup to Keystone (Slate) Document format
 * https://docs.slatejs.org/
 */
export const convertHtmlToDocument = (htmlString: string, imagesMap?: TImageMap) => {
  const htmlDom = parse('<body>' + htmlString.replaceAll('\t', '').replaceAll('\r\n', ' ') + '</body>')

  return deserialize(htmlDom, {}, imagesMap)
}
