import {
  BEFORECREATE,
  BEFOREMOUNT,
  BEFOREUNMOUNT,
  BEFOREUPDATE,
  CREATED,
  MOUNTED,
  ONHIDE,
  ONLOAD,
  ONRESIZE,
  ONSHOW,
  UNMOUNTED,
  UPDATED,
} from './innerLifecycle'
import {
  ReactiveEffect,
  pauseTracking,
  resetTracking,
} from '../observer/effect'
import {
  aIsSubPathOfB,
  callWithErrorHandling,
  diffAndCloneA,
  doGetByPath,
  error,
  getByPath,
  getFirstKey,
  hasOwn,
  isEmptyObject,
  isFunction,
  isObject,
  isPlainObject,
  isString,
  makeMap,
  mergeData,
  noop,
  processUndefined,
  proxy,
  setByPath,
  type,
  warn,
} from '@effectlzx/utils'
import { flushPreFlushCbs, nextTick, queueJob } from '../observer/scheduler'

import { computed } from '../observer/computed'
import { effectScope } from '../platform/export/index'
import { reactive } from '../observer/reactive'
import { watch } from '../observer/watch'

let uid = 0

class RenderTask {
  resolved = false

  constructor(instance) {
    instance.currentRenderTask = this
    this.promise = new Promise((resolve) => {
      this.resolve = resolve
    }).then(() => {
      this.resolved = true
    })
  }
}

/**
 * process renderData, remove sub node if visit parent node already
 * @param {Object} renderData
 * @return {Object} processedRenderData
 */
function preProcessRenderData(renderData) {
  // method for get key path array
  const processKeyPathMap = (keyPathMap) => {
    const keyPath = Object.keys(keyPathMap)
    return keyPath.filter((keyA) => {
      return keyPath.every((keyB) => {
        if (keyA.startsWith(keyB) && keyA !== keyB) {
          const nextChar = keyA[keyB.length]
          if (nextChar === '.' || nextChar === '[') {
            return false
          }
        }
        return true
      })
    })
  }

  const processedRenderData = {}
  const renderDataFinalKey = processKeyPathMap(renderData)
  Object.keys(renderData).forEach((item) => {
    if (renderDataFinalKey.indexOf(item) > -1) {
      processedRenderData[item] = renderData[item]
    }
  })
  return processedRenderData
}

export let currentInstance = null

export const getCurrentInstance = () => currentInstance?.target

export const setCurrentInstance = (instance) => {
  currentInstance = instance
  instance?.scope?.on()
}

export const unsetCurrentInstance = () => {
  currentInstance?.scope?.off()
  currentInstance = null
}

export const injectHook = (hookName, hook, instance = currentInstance) => {
  if (instance) {
    const wrappedHook = (...args) => {
      if (instance.isUnmounted()) return
      setCurrentInstance(instance)
      const res = callWithErrorHandling(
        hook,
        instance,
        `${hookName} hook`,
        args
      )
      unsetCurrentInstance()
      return res
    }
    if (isFunction(hook))
      (instance.hooks[hookName] || (instance.hooks[hookName] = [])).push(
        wrappedHook
      )
  }
}

export const createHook = (hookName) => (hook, instance) =>
  injectHook(hookName, hook, instance)
// 在代码中调用以下生命周期钩子时, 将生命周期钩子注入到mpxProxy实例上
export const onBeforeMount = createHook(BEFOREMOUNT)
export const onMounted = createHook(MOUNTED)
export const onBeforeUpdate = createHook(BEFOREUPDATE)
export const onUpdated = createHook(UPDATED)
export const onBeforeUnmount = createHook(BEFOREUNMOUNT)
export const onUnmounted = createHook(UNMOUNTED)
export const onLoad = createHook(ONLOAD)
export const onShow = createHook(ONSHOW)
export const onHide = createHook(ONHIDE)
export const onResize = createHook(ONRESIZE)
export const onPullDownRefresh = createHook('__onPullDownRefresh__')
export const onReachBottom = createHook('__onReachBottom__')
export const onShareAppMessage = createHook('__onShareAppMessage__')
export const onShareTimeline = createHook('__onShareTimeline__')
export const onAddToFavorites = createHook('__onAddToFavorites__')
export const onPageScroll = createHook('__onPageScroll__')
export const onTabItemTap = createHook('__onTabItemTap__')
export const onSaveExitState = createHook('__onSaveExitState__')
