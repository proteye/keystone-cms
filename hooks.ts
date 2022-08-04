import slugify from 'slugify'
import { IHookResolvedData, IHookItemData } from './types'

/** Slugify "title" or "name" field */
export const slugResolveInput = <R extends IHookResolvedData, I extends IHookItemData>({
  resolvedData,
  item,
}: {
  resolvedData: R
  item?: I
}) => {
  const { slug } = resolvedData
  const title = resolvedData.title ?? item?.title ?? resolvedData.name ?? item?.name ?? ''

  if (slug === '') {
    return {
      ...resolvedData,
      slug: slugify(title, { lower: true }),
    }
  }

  return resolvedData
}
