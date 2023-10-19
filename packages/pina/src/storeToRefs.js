import { isFunction, makeMap } from '@effectlzx/utils'

import { storeRefsBlackList } from './const'
import { toRef } from '@effectlzx/core'

const storeRefsBlackListMap = makeMap(storeRefsBlackList)

export function storeToRefs(store) {
  const refs = {}
  for (const key in store) {
    if (!storeRefsBlackListMap[key] && !isFunction(store[key])) {
      refs[key] = toRef(store, key)
    }
  }
  return refs
}
