### 响应式基础 API 基本实现原理 & 实现一个 pina 状态库
##### ref()​
接受一个内部值，返回一个响应式的、可更改的 `ref` 对象，此对象只有一个指向其内部值的属性 `.value`。
##### reactive()​
返回一个对象的响应式代理。
##### markRaw
标记一个对象，使其永远不会被抓换为响应性对象，并返回对象本身
##### shallowReactive
`reactive()` 的浅层作用形式，只跟踪自身 `property` 的响应性，但不执行嵌套对象的深层响应式转换(返回原始值)
### Compouted 和 Watch 实现
`computed`
接受一个 `getter` 函数，并根据 `getter` 的返回值返回一个不可变的响应式 `ref` 对象。
`watchEffect`
立即执行传入的函数，同时对其依赖进行响应式追踪，并在其依赖变更时重新运行该函数。
`watchSyncEffect`
`watchEffect` 的别名，带有 `flush: 'sync'` 选项。
源码参考自[https://github.com/didi/mpx]