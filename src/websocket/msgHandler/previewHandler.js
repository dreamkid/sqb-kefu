import store from '@/store'
import { Message } from 'element-ui'
import Bus from '@/utils/bus'
// 登录成功 ok
function deviceAuthRspHandle(message) {
  console.log('登录登录登录');
  console.log(message);
  const currentUser = message.Extra
  // 设置用户信息
  store.commit('SET_CURRENT_USER', currentUser)
  // 设置token信息
  store.commit('SET_WEBSOCKET_TOKEN', message.AccessToken)
  // store.commit('WEBSOCKET_TOKEN', message.AccessToken)
  localStorage.setItem('CURRENT_USER', JSON.stringify(currentUser))
  localStorage.setItem('WEBSOCKET_TOKEN', message.AccessToken)

  // 如果是electron
  // if (process.env.VUE_APP_CURRENTMODE === 'electron') {
  // const { ipcRenderer } = window.require('electron')
  // ipcRenderer.send('operations', 'login')
  // }

  // // 设置wechatid和好友的对应关系
  // store.dispatch('nedb/SetFriendsMap')
  // // 设置群聊id和群聊的对应关系
  // store.dispatch('nedb/SetChatRoomsMap')
  // 设置自动回复配置文件 改成线上了
  // store.dispatch('nedb/SetAutoReply')
  // 设置红包账单
  store.dispatch('nedb/SetLuckMoneyMap')

  // 获取微信列表
  // store.dispatch('websocket/GetWeChatsReq')

  if (store.state.route.path === '/login') {
    // 如果是第一次登录，跳转到会话页面，后台重新登录
    store.commit('route/ROUTE_CHANGED', { to: { path: '/' } })
  } else {
    // 后台自动登录
  }

  Bus.$emit('socketLoginSuccess')
}

// 标签列表 ok
function contactLabelInfoNoticeHandle(message) {
  if (message.Labels && message.Labels.length > 0) {
    store.dispatch('nedb/UpdateOrAddLabels', message)
  }
}

// 微信下线通知处理 ok
// 本地更新信息
// 该接口不会立马通知 当发消息的时候会触发
function weChatOfflineNoticeHandle(message) {
  for (const wechat of store.getters['conversation/wechats']) {
    if (wechat.WeChatId === message.WeChatId) {
      // 弹框提示微信已经下线
      Message({
        message: `${wechat.WeChatNick} 下线了！`,
        type: 'error',
        duration: 2000
      })
      break
    }
  }
  // 修改本地不在线微信的信息
  store.commit('conversation/WECHAT_OFF_LINE', message.WeChatId)
}

// 微信上线 上线后自动登陆
function weChatOnlineNoticeHandle(message) {
  message.IsOnline = true
  // 提示某某已经上线
  Message({
    message: `${message.WeChatNick} 上线了！`,
    type: 'success',
    duration: 2000
  })
  store.commit('conversation/WECHAT_ON_LINE', message)
}

export default {
  deviceAuthRspHandle,
  contactLabelInfoNoticeHandle,
  weChatOfflineNoticeHandle,
  weChatOnlineNoticeHandle
}
