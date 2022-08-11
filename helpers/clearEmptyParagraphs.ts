import { Scalars } from '.keystone/types'
import { TAny } from '../types'

export type TContentProps = { type: string; children: TAny }[] | null

export const clearEmptyParagraphs = (content: TContentProps) =>
  content?.filter(
    ({ type, children }) =>
      !(
        type === 'paragraph' &&
        children.length === 1 &&
        !children[0].type &&
        (children[0].text === '' || children[0].text === '\n')
      ),
  ) as Scalars['JSON'] | null
