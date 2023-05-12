<template>
  <div
    v-loading="globalLoading"
    :element-loading-text="globalLoadingText"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    id="app"
    :class="{ 'big-screen': bigScreen }"
    @contextmenu.prevent
  >
    <template v-if="webSocketToken">
      <!-- 页眉 -->
      <header-page></header-page>
      <!-- aside && main -->
      <el-container class="el-container">
        <!-- aside -->
        <aside-page></aside-page>
        <!-- main -->
        <router-view name="main"></router-view>
      </el-container>
    </template>
    <!-- 登录页面 -->
    <template v-else>
      <router-view name="login"></router-view>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import HeaderPage from '@/components/HeaderPage.vue'
import AsidePage from '@/components/AsidePage.vue'

import { createWebSocket, closeWebsocket } from './websocket/websocket.js'
import { HeartBeatReq, DeviceAuthReq } from './api/webSocketApi'
import nedb from '@/db/nedb'

export default {
  name: 'App',
  components: {
    HeaderPage,
    AsidePage
  },
  data() {
    return {
      heartTimer: null // 心跳检测
    }
  },
  methods: {
    removeChatRecord() {
      return new Promise((resolve, reject) => {
        nedb.chats.remove({}, { multi: true }, (err, number) => {
          if (err) return
          resolve()
        })
      })
    },
    async getNewToken(){
      let res=await getNewToken();
      
    }
  },
  computed: {
    ...mapState({
      bigScreen: 'bigScreen',
      webSocketState: 'webSocketState',
      webSocketToken: 'webSocketToken',
      httpToken: 'httpToken',
      currentMode: 'currentMode',
      clientOrServer: 'clientOrServer' // 客户端还是管理端 client server
    }),
    ...mapState(['globalLoading', 'globalLoadingText', 'currentUser'])
  },
  watch: {
    // 监听websocket的状态
    webSocketState(val) {

      switch (val) {
        case 0:
          console.log('正在建立连接，还没有完成 默认值')
          break
        case 1:
          console.log('websocket连接成功')
          const { name, pass } = localStorage.getItem('LOGIN_INFO')
            ? JSON.parse(localStorage.getItem('LOGIN_INFO'))
            : {}

          if (window.location.hash !== '#/login') {
            DeviceAuthReq(name, pass)
            console.log('刷新');
          }

          break
        case 2:
          console.log('连接正在进行关闭握手，即将关闭')
          break
        case 3:
          console.log('连接已经关闭或者根本没有建立')
          // clearInterval(this.heartTimer)
          // this.heartTimer = null
          if (this.webSocketToken) {
            this.$alert('连接已经关闭, 请重新登录！', '提示', {
              showClose: false,
              closeOnClickModal: false,
              confirmButtonText: '确定',
              type: 'warning'
            })
              .then(() => {
                // window.location.reload()
                // 清空websocketToken
                // store.commit('SET_WEBSOCKET_TOKEN', '')
                // localStorage.removeItem('WEBSOCKET_TOKEN')
                // localStorage.removeItem('CURRENT_USER')
                // localStorage.removeItem('LOGIN_INFO')
                Promise.all([
                this.$store.dispatch('nedb/RemoveAllRooms'),
                this.$store.dispatch('nedb/RemoveAllFriends'),
                this.removeChatRecord()
                ]).then(() => {
                // 清除token
                this.$store.commit('SET_WEBSOCKET_TOKEN', '')
                localStorage.removeItem('WEBSOCKET_TOKEN')
                localStorage.removeItem('CURRENT_USER')
                localStorage.removeItem('LOGIN_INFO')
        })
              })
              .catch(() => {})
          }
          break
        default:
          break
      }
    },
    // 监听token
    webSocketToken(newToken) {
      if (newToken === '') {
        clearInterval(this.heartTimer)
        this.heartTimer = null
      }
      if (newToken) {
        // 清除自动登录的定时器
        // clearInterval(this.loginTimer)
        // this.loginTimer = null
        // 发送心跳
        this.heartTimer = setInterval(() => {
          HeartBeatReq(newToken)
          console.log('发送心跳', new Date().toLocaleString())
        }, 30000)
        // 默认选中第一个
        // if (this.onLineDevices.length > 0) {
        //   this.$refs.userAside.choseDevice(this.onLineDevices[0])
        // }
        // this.loadingMsg = ''
      } else {
        // 转到登录页面
        this.$router.push({ name: 'login' }).then(() => {
          window.location.reload()
        })
      }
    },
    // 监听管理端token
    httpToken(newToken) {
      if (newToken) {
        console.log('httpToken', newToken)
      } else {
        // 转到登录页面
        this.$router.replace({ name: 'login' })
        // 如果是electron 调整窗口大小
        if (this.currentMode === 'electron') {
          // 退出登录的loading
          const loading = this.$loading({
            lock: true,
            text: '正在退出',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          setTimeout(() => {
            loading.close()
          }, 2000)
          // 调整窗口大小
          // this.$ipcRenderer.send('operations', 'logout')
        } else {
          // 重新加载页面
          // window.location.reload()
        }
      }
    }
  },
  async mounted() {
    const iconDom = document.querySelector('link[rel="icon"]')
    await Promise.all([
      this.$store.dispatch('nedb/RemoveAllRooms'),
      this.$store.dispatch('nedb/RemoveAllFriends'),
      this.removeChatRecord()
    ])
    // 如过浏览器支持websocket 创建连接
    if ('WebSocket' in window && window.top === window) {
      createWebSocket(this.$store.state.url && `ws://${this.$store.state.url}:13088`)
    } else if (!'WebSocket' in window) {
      //  如果浏览器不支持WebSocket
      this.$message({
        message: '您的浏览器不支持 WebSocket!，请更换浏览器！',
        type: 'error'
      })
    }

    if (iconDom) {
      if (window.location.origin.includes('localhost')) {
        iconDom.href = 'favicon.ico'
      } else if (window.location.origin.includes('hzdaba.cn')) {
        iconDom.href = 'icon1.ico'
      }
    }
  },
  created() {
    this.$store.commit('SET_IS_PRE_LOAD_HISTORY_RECORD', true)
  },
  destroyed() {
    // 离开页面摧毁定时器
    clearInterval(this.heartTimer)
    this.heartTimer = null
  }
}
</script>

<style lang="scss">
@import './styles/reset.scss';
@import './styles/normalize.scss';
@import './styles/common.scss';
@import './styles/my_element_ui.scss';
@import './styles/qqface.scss';
@import '~@/assets/iconfont/iconfont.css';
@import '~@/assets/font-awesome/css/font-awesome.css';

#app {
  font-size: $font-size-base;
  color: $color-common;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'SF UI Text', 'Helvetica Neue', STHeiti,
    'Microsoft Yahei', Tahoma, Simsun, sans-serif;
  overflow: hidden;
  width: 1205px;
  height: 717px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #fff;
  border: solid $border-color-base 1px;

  .el-container {
    flex: 1 1 auto;
    display: flex;
    overflow-y: hidden;
  }
  @media screen and (max-width: 1150px) {
    .el-container {
      overflow-x: scroll;
      &::-webkit-scrollbar {
        width: 8px;
        height: 6px;
        background-color: transparent;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 4px;
        background-color: #dedede;

        &:hover {
          background-color: rgba(0, 0, 0, 0.2);
        }
      }
    }
  }

  .icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
}
</style>
