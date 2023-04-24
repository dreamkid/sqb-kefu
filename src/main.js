import Vue from 'vue'
import App from './App.vue'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

// 引入整个 Element
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 基于断点的隐藏类
// import 'element-ui/lib/theme-chalk/display.css';
import 'default-passive-events'
import _ from 'lodash'
// 导入icon-font
import './assets/iconfont/iconfont.js'

import axios from 'axios'
// import i18n from './locale'
import { sync } from 'vuex-router-sync'
import store from './store'
import router from './router'
sync(store, router)

import filters from './filters'
import { createWebSocket, closeWebsocket } from './websocket/websocket.js'
// import nedb from './db/nedb'

// import * as $websocket from './api/websocket'
// import Toast from './components/toast/index'

// 向所有 Sass/Less 样式传入共享的全局变量
// 或者vue.config.js配置 css loaderOptions
// import './styles/_var.scss';
// import './styles/mixin.scss';
import './styles/dialog.scss'
import { DeviceAuthReq } from './api/webSocketApi'
if (process.env.VUE_APP_CURRENTMODE === 'electron') {
  // const {
  //     ipcRenderer,
  //     remote,
  //     shell,
  //     clipboard
  // } = require('electron')
  const { ipcRenderer, remote, shell } = window.require('electron')
  store.commit('SET_CURRENT_MODE', 'electron')
  Vue.prototype.$ipcRenderer = ipcRenderer
  Vue.prototype.$remote = remote
  Vue.prototype.$shell = shell
}

Vue.use(Antd)

// Vue.use(Toast)
Vue.use(ElementUI)
// 在引入 Element 时，可以传入一个全局配置对象。该对象目前支持 size 与 zIndex 字段。
// size 用于改变组件的默认尺寸，zIndex 设置弹框的初始 z-index（默认值：2000）
// Vue.use(Element, { size: 'small', zIndex: 3000 });
Vue.prototype.$axios = axios
// Vue.prototype.$websocket = $websocket
// Vue.prototype.$toast = Toast
// Vue.prototype.$nedb = nedb // 都通过vuex引用 这里不再导入
Vue.prototype._ = _

// 全局过滤器
Object.keys(filters).forEach((filterName) => {
  Vue.filter(filterName, filters[filterName])
})

Vue.config.productionTip = false

window.addEventListener('message', (e) => {
  if ([process.env.VUE_APP_IFRAME_URL].includes(e.origin)) {
    if (e.data) {
      const { name, token } = e.data
      localStorage.setItem(
        'LOGIN_INFO',
        JSON.stringify({
          name,
          pass: 123456
        })
      )

      localStorage.setItem('LOGIN_TOKEN', token)
      createWebSocket(process.env.VUE_APP_WEBSOCKET_URL)
    }
  }
})

const A = new Vue({
  router,
  store,
  // i18n,
  render: (h) => h(App)
})
A.$mount('#app')

//console.log(A, App)
