import { APIs, InstanceAPIs } from './platform/export/api'
import { diffAndCloneA, error, hasOwn, makeMap } from '@effectlzx/utils'

export * from './platform/export/index'

export * from '@effectlzx/store'

export { implement } from './core/implement'

export { nextTick } from './observer/scheduler'

export {
  BEFORECREATE,
  CREATED,
  BEFOREMOUNT,
  MOUNTED,
  BEFOREUPDATE,
  UPDATED,
  BEFOREUNMOUNT,
  UNMOUNTED,
  ONLOAD,
  ONSHOW,
  ONHIDE,
  ONRESIZE,
} from './core/innerLifecycle'

export {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onLoad,
  onShow,
  onHide,
  onResize,
  onPullDownRefresh,
  onReachBottom,
  onShareAppMessage,
  onShareTimeline,
  onAddToFavorites,
  onPageScroll,
  onTabItemTap,
  onSaveExitState,
} from './core/proxy'

export function toPureObject(obj) {
  return diffAndCloneA(obj).clone
}

function extendProps(target, proxyObj, rawProps, option) {
  const keys = Object.getOwnPropertyNames(proxyObj)
  const rawPropsMap = makeMap(rawProps)

  for (const key of keys) {
    if (APIs[key] || rawPropsMap[key]) {
      continue
    } else if (option && (option.prefix || option.postfix)) {
      const transformKey = option.prefix
        ? option.prefix + '_' + key
        : key + '_' + option.postfix
      target[transformKey] = proxyObj[key]
    } else if (!hasOwn(target, key)) {
      target[key] = proxyObj[key]
    } else {
      error(
        `Mpx property [${key}] from installing plugin conflicts with already exists，please pass prefix/postfix options to avoid property conflict, for example: "use('plugin', {prefix: 'mm'})"`
      )
    }
  }
}

// 安装插件进行扩展API
const installedPlugins = []

function use(plugin, options = {}) {
  if (installedPlugins.indexOf(plugin) > -1) {
    return this
  }

  const args = [options]
  const proxyMpx = factory()
  const rawProps = Object.getOwnPropertyNames(proxyMpx)
  const rawPrototypeProps = Object.getOwnPropertyNames(proxyMpx.prototype)
  args.unshift(proxyMpx)
  // 传入真正的mpx对象供插件访问
  args.push(Mpx)
  if (typeof plugin.install === 'function') {
    plugin.install.apply(plugin, args)
  } else if (typeof plugin === 'function') {
    plugin.apply(null, args)
  }
  extendProps(Mpx, proxyMpx, rawProps, options)
  extendProps(Mpx.prototype, proxyMpx.prototype, rawPrototypeProps, options)
  installedPlugins.push(plugin)
  return this
}

APIs.use = use

function factory() {
  // 作为原型挂载属性的中间层
  function Mpx() {}

  Object.assign(Mpx, APIs)
  Object.assign(Mpx.prototype, InstanceAPIs)
  return Mpx
}

const Mpx = factory()

Mpx.config = {
  useStrictDiff: false,
  ignoreWarning: false,
  ignoreProxyWhiteList: ['id', 'dataset', 'data'],
  observeClassInstance: false,
  errorHandler: null,
  proxyEventHandler: null,
  setDataHandler: null,
  forceFlushSync: false,
  webRouteConfig: {},
}

global.__mpx = Mpx

export default Mpx