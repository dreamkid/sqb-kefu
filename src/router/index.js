import Vue from 'vue'
import VueRouter from 'vue-router'

import store from '../store'

Vue.use(VueRouter)

// 解决to.path 与 from.path一样报错的问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err)
}

// 正常加载
// import Home from '../views/Home.vue'
// 按需（懒）加载（vue实现）
// const Home = () => import( /* webpackChunkName: "home" */ '../views/Home.vue')
// 按需（懒）加载（webpack动态导入）
// require.ensure() 是 webpack 特有的，已经被 import() 取代。
// 大家理解其作用即可，参考issues —— https://github.com/wangyupo/vue-vuex-router/issues/1
// const Home = r => require.ensure([], () => r(require('../views/home')), 'home')

/**
 * meta 可配置参数
 * @param {boolean} icon 页面icon
 * @param {boolean} keepAlive 是否缓存页面
 * @param {string} title 页面标题
 */
const routes = [
  {
    path: '/',
    redirect: {
      path: '/conversation'
    }
  },
  // 登录页面
  {
    path: '/login',
    name: 'login',
    components: {
      login: () => import(/* webpackChunkName: "login" */ '@/views/LoginPage.vue')
    }
  },
  // 会话的路由
  {
    path: '/conversation',
    name: 'conversation',
    components: {
      main: () => import(/* webpackChunkName: "conversation" */ '@/views/conversation/index.vue')
    },
    meta: {
      requireAuth: true
    }
  }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  mode: 'hash',
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return {
        x: 0,
        y: 0
      }
    }
  }
})

// 登录页面路由 name
// const LOGIN_PAGE_NAME = 'login'

// 全局前置守卫
router.beforeEach((to, from, next) => {
  let token = store.state.webSocketToken
  if (store.state.clientOrServer === 'server') {
    token = store.state.httpToken
  }

  // 如果要去的路由 需要验证
  if (to.matched.some((res) => res.meta.requireAuth)) {
    // if (localStorage.getItem("validateToken")) {
    if (token) {
      next()
    } else {
      console.log('没有token，返回登录页面！')
      next({
        path: '/login'
        // query: { redirect: to.fullPath }
      })
    }
  } else {
    if (to.name === 'login') {
      // store.commit('SET_WEBSOCKET_TOKEN', '')
      // localStorage.removeItem('WEBSOCKET_TOKEN')
      // localStorage.removeItem('CURRENT_USER')
      // localStorage.removeItem('LOGIN_INFO')
    }
    next()
  }
})

// 全局解析守卫
router.beforeResolve((to, from, next) => {
  next()
})

// 全局后置钩子
// router.afterEach((to, from) => {
// })

router.onError((e) => {
  console.log('路由报错', e)
})

export default router
