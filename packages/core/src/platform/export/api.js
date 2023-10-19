import { del, reactive, set } from '../../observer/reactive'

import { injectMixins } from '../../core/injectMixins'
import { watch } from '../../observer/watch'

const APIs = {
  injectMixins,
  mixin: injectMixins,
  observable: reactive,
  watch,
  set,
  delete: del,
}

const InstanceAPIs = {
  $set: set,
  $delete: del,
}

export { APIs, InstanceAPIs }
