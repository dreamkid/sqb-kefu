import store from '@/store'
import { Message } from 'element-ui'

/**
 * 微信号二维码 ok
 */
function pullWeChatQrCodeTaskResultNoticeHandle(message) {
  Message({
    type: 'success',
    message: '获取微信二维码成功！',
    duration: 1000
  })
  const qrcode = {
    ChatRoomId: -1,
    ...message
  }
  store.dispatch('nedb/UpdateQrCode', qrcode)
}

/**
 * 通过号码查询联系人结果
 */
function findContactTaskResultHandle(message) {
  console.log('通过号码查询联系人结果', message)
  if (message.Success) {
    Message({
      type: 'success',
      message: '根据号码查询联系人成功！',
      duration: 1000
    })
  } else {
    Message({
      type: 'warning',
      message: '根据号码查询联系人失败！',
      duration: 1000
    })
  }
  // 更新本地数据库任务
  // 如果用不到这些数据 可以注释
  const doc = {
    result: 1,
    Success: message.Success ? message.Success : false
  }
  for (const key in message) {
    if (message.hasOwnProperty(key)) {
      doc[key] = message[key]
    }
  }
  store.dispatch('nedb/UpdateFindContactTask', doc)

  // 设置当前要展示的查询结果
  store.commit('tools/SET_SEARCH_RESULT', message)
}

export default {
  pullWeChatQrCodeTaskResultNoticeHandle,
  findContactTaskResultHandle
}
