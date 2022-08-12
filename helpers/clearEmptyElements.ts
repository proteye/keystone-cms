import { Scalars } from '.keystone/types'
import { TAny } from '../types'

export type TContentProps = { type: string; children: TAny }[] | null

export const clearEmptyElements = (content: TContentProps) =>
  content?.filter(
    ({ type, children }) =>
      !(
        ['heading', 'paragraph'].includes(type) &&
        children.length === 1 &&
        !children[0].type &&
        (children[0].text === '' || children[0].text === '\n')
      ),
  ) as Scalars['JSON'] | null
