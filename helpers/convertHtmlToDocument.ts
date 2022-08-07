import { parse } from 'node-html-parser'
import { deserialize } from './deserialize'

/**
 * Convert HTML markup to Keystone (Slate) Document format
 * https://docs.slatejs.org/
 */
export const convertHtmlToDocument = (htmlString: string) => {
  const htmlDom = parse('<body>' + htmlString.replaceAll('\r\n', '') + '</body>')

  return deserialize(htmlDom)
}
