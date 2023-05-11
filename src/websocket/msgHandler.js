import store from '../store'
// import { PullFriendAddReqListTask } from '@/api/webSocketApi'
import { addResources } from '@/api/httpApi'
import { TriggerCirclePushTask, TriggerFriendPushTask, TriggerHistoryMsgPushTask } from '@/api/webSocketApi'

import toolsHandle from './msgHandler/toolsHandler'
import previewHandle from './msgHandler/previewHandler'
import taskResultNotice from './msgHandler/taskResultNoticeHandler'
import conversationHandle from './msgHandler/conversationHandler'

import { MessageBox, Message } from 'element-ui'

import Bus from '@/utils/bus'
import Day from 'dayjs'
export default function handler(e) {
  console.log('hander');
  const msg = JSON.parse(e.data)
  const msgType = msg.msgType
  const message = msg.message ? JSON.parse(msg.message) : null
  // if (msgType !== 'MsgReceivedAck' && msgType !== 'TaskResultNotice') {
  //   console.log(msgType, msg)
  // }
  const currentWeChatId = store.getters['conversation/currentWeChatId']
  const currentFriend = store.getters['conversation/currentFriend']
  switch (msgType) {
    // server 登陆结果 ok
    case 'DeviceAuthRsp':
      previewHandle.deviceAuthRspHandle(message)
      break
    // server 微信登陆结果通知 弃用
    case 'WeChatLoginNoticeResp':
      console.log('WeChatLoginNoticeResp', message)
      break
    // 账号强制下线通知
    case 'AccountForceOfflineNotice':
      console.log('AccountForceOfflineNotice', message)
      break
    // 微信登陆通知
    case 'WeChatLoginNotice':
      console.log('WeChatLoginNotice', message)
      break
    // 微信下线通知 ok
    case 'WeChatOfflineNotice':
      previewHandle.weChatOfflineNoticeHandle(message)
      break
    // 微信上线通知 ok
    case 'WeChatOnlineNotice':
      previewHandle.weChatOnlineNoticeHandle(message)
      break

    // ============================================================
    // 以下是wxtools页面 用到的回调
    // ============================================================
    // sdk 二维码 ok
    case 'PullWeChatQrCodeTaskResultNotice':
      toolsHandle.pullWeChatQrCodeTaskResultNoticeHandle(message)
      break
    // 加好友请求列表
    case 'FriendAddReqListNotice':
      if (message.Requests) {
        store.commit('tools/SET_NEW_FRIENDS_LIST', message)
      }
      break
    // 手机端回传检测清粉好友数
    case 'PostFriendDetectCountNotice':
      store.dispatch('nedb/AddOrUpdateZombies', message)
      break
    // 最后一次清粉的结果
    case 'FriendDetectResultNotice':
      store.commit('tools/SET_CLEAR_RESULT', message)
      break
    // 有好友请求添加好友的通知
    case 'FriendAddReqeustNotice':
      console.log('FriendAddReqeustNotice')
      // Avatar: "http://wx.qlogo.cn/mmhead/ver_1/sugIPzxibxcp7Xo9JTFpKNHuBHxgtClJR0Csu5W0nY9k5UB6ickMUP6hofnFxnvYF6ydqGcOWagywAprduVrtJUs5f6uicrmV1r7tC04P1uvss/96"
      // FriendId: "wxid_h306o3dknh3822"
      // FriendNick: "Liao"
      // FriendNo: "lmyaoyao11"
      // Gender: "Female"
      // Province: "冰岛"
      // Reason: "我是日语老师"
      // Source: 30
      // WeChatId: "wxid_wzx1tp69014e
      break
    // sdk 查询联系人结果
    case 'FindContactTaskResult':
      toolsHandle.findContactTaskResultHandle(message)
      break
    // sdk 查询手机状态返回结果
    case 'PhoneStateTaskResultNotice':
      store.commit('tools/SET_PHONE_STATE', message)
      break
    // 获取动画表情信息详情结果返回
    case 'PullEmojiInfoTaskResultNotice':
      if (message.TaskId && message.Emojis) {
        const taskList = store.getters['triggerTask']
        if (taskList[message.TaskId]) {
          const sourceInfo = {
            restype: 14,
            content: message.Emojis[0] // 内容
          }
          addResources(store.getters['currentUser'].SupplierId, JSON.stringify(sourceInfo), 5, '')
            .then((res) => {
              if (res.code === 0) {
                Message.success('添加到素材库成功！')
              }
            })
            .catch((err) => {
              Message.error(err.message)
            })
        }
      }
      break
    // 查询历史通话记录结果
    case 'PullCallLogTaskResultNotice':
      console.log('PullCallLogTaskResultNotice', message)
      break
    // ============================================================
    // 以下是cirlces页面 用到的回调
    // ============================================================
    // 手机回传朋友圈数据
    case 'CirclePushNotice':
      // 设置朋友圈列表
      store.dispatch('conversation/SetCircleList', message)
      if (message.Circles && message.Circles.length === 1) {
        // 设置评论对应的朋友圈
        store.commit('circles/UPDATE_CIRCLE_ITEM', message.Circles[0])
      }
      break
    // 删除朋友圈推送 ok
    case 'CircleDelNotice':
      store.dispatch('conversation/RemoveCircle', message)
      break
    // 新朋友圈推送 ok
    case 'CircleNewPublishNotice':
      store.dispatch('conversation/AddCircleByNotice', message)
      break
    // 手机检测到有人点赞/取消点赞通知
    case 'CircleLikeNotice':
      console.log('CircleLikeNotice')
      break
    // 朋友圈消息列表推送
    case 'CircleMsgPushNotice':
      if (message.Comments) {
        message.Comments.map((x) => {
          x.WeChatId = message.WeChatId
        })
        store.commit('circles/UPDATE_CIRCLE_MSG', message.Comments)
      }
      break
    // 手机检测到有人评论/删除朋友圈通知
    case 'CircleCommentNotice':
      if (!message.IsDelete && message.Comment) {
        if (store.getters.currentMode === 'electron') {
          const { shell } = window.require('electron')
          shell.beep()
        }
        store.commit('circles/UPDATE_CIRCLE_MSG', [{ ...message.Comment, WeChatId: message.WeChatId }])
      }
      break
    // 发朋友圈的结果通知 ok
    case 'PostSNSNewsTaskResultNotice':
      console.log('PostSNSNewsTaskResultNotice')
      break
    // 朋友圈大图 ok
    case 'CircleDetailNotice':
      Message.success('获取朋友圈大图成功')
      if (message.Circle) {
        store.commit('conversation/UPDATE_CIRCLE_LIST', message)
      }
      break
    // 朋友圈评论结果通知 ok
    case 'CircleCommentReplyTaskResultNotice':
      if (message.Success) {
        const tasks = store.getters['conversation/circleTask']
        if (tasks[message.TaskId]) {
          const { CircleId, WeChatId } = tasks[message.TaskId]
          if (CircleId && WeChatId) {
            TriggerCirclePushTask(WeChatId, [CircleId])
          }
        }
      }
      break
    // 朋友圈删除评论结果通知 ok
    case 'CircleCommentDeleteTaskResultNotice':
      if (message.Success) {
        const tasks = store.getters['conversation/circleTask']
        if (tasks[message.TaskId]) {
          const { CircleId, WeChatId } = tasks[message.TaskId]
          if (CircleId && WeChatId) {
            TriggerCirclePushTask(WeChatId, [CircleId])
          }
        }
      }
      break
    // ============================================================
    // 以下是conversation页面 用到的回调
    // ============================================================
    // 会话列表
    case 'ConversationPushNotice':
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      if (message.TaskId) {
        const taskList = store.getters['triggerTask']
        if (taskList[message.TaskId]) {
          store.commit('conversation/SET_CONVERSATIONS', message)
        }
      } else {
        store.commit('conversation/SET_CONVERSATIONS', message)
      }

      store.commit(
        'conversation/SET_WECHATS',
        store.state.conversation.wechats.map((item) => ({
          ...item,
          _isClicked: true
        }))
      )

      //聊天记录预加载
      if (store.state.isPreLoadHistoryRecord) {
        if (!message.Convers.length) {
          store.commit('SET_PRE_LOAD_NUM', { id: message.WeChatId, num: 0 })
          store.commit('SET_GLOBAL_LOADING', false)
          store.commit('SET_IS_PRE_LOAD_HISTORY_RECORD', false)
          return
        }
        const conversations = [...message.Convers]
        const weChatId = message.WeChatId
        conversations.sort((a, b) => b.UpdateTime - a.UpdateTime)
        const num = conversations.length > 10 ? 10 : conversations.length

        store.commit('SET_PULL_NUM', { id: weChatId, num })
        store.commit('SET_GLOBAL_LOADING', true)
        store.commit('SET_GLOBAL_LOADING_TEXT', '数据加载中...')
        conversations.slice(0, num).forEach((item) => {
          TriggerHistoryMsgPushTask(
            item.WeChatId,
            item.UserName,
            store.state.currentUser.NickName,
            loginInfo.name,
            0,
            0,
            10
          )
        })
      }

      // console.log(
      //   'ConversationPushNotice',
      //   message.Convers.map((item) => item.UserName),
      //   message,
      //   store.state,
      //   store.state.currentUser.NickName
      // )

      break
    // sdk 好友列表 ok
    case 'FriendPushNotice':
      store.commit('SET_LOADING', false)

      if (message.TaskId) {
        const taskList = store.getters['triggerTask']
        if (taskList[message.TaskId]) {
          conversationHandle.friendPushNoticeHandle(message)
        }
      } else {
        conversationHandle.friendPushNoticeHandle(message)
      }

      break

    // sdk 微信收消息通知 ok
    case 'FriendTalkNotice':
      console.log('FriendTalkNotice', Day().format('YYYY-MM-DD HH:mm:ss'), message)
      // electron 新消息闪烁
      if (store.getters.currentMode === 'electron') {
        const { ipcRenderer, shell } = window.require('electron')
        ipcRenderer.send('operations', 'newMsg')
        // 发出声音
        shell.beep()
      }
      // 更新会话表
      store.commit('conversation/UPDATE_CONVERSATION', message)
      // 更新当前好友的聊天消息
      store.dispatch('conversation/UpdateCurrentChats', message)

      if (message.FriendId === currentFriend.FriendId || message.FriendId === currentFriend.UserName) {
        Bus.$emit('chatRecordUpdate', message)

        //内部消息关闭
        if (message.ContentType === 'SystemPrivateMsg' && !message.PrivateMsgEnable) {
          store.commit('conversation/SET_CURRENT_FRIENDS', {
            ...currentFriend,
            PrivateMsgEnable: false
          })
        }
      }

      break
    // sdk 微信发信息通知 ok
    case 'WeChatTalkToFriendNotice':
      //console.log('WeChatTalkToFriendNotice', message)
      // 更新会话表
      store.commit('conversation/UPDATE_CONVERSATION', { ...message, IsSend: true })
      // 更新当前好友的聊天消息
      store.dispatch('conversation/UpdateCurrentChats', { ...message, IsSend: true })

      if (message.FriendId === currentFriend.FriendId || message.FriendId === currentFriend.UserName)
        Bus.$emit('chatRecordUpdate')
      break

    //内部聊天记录
    case 'PrivateHistoryMsgPushNotice':
      //store.commit('conversation/UPDATE_INTERVAL_CHATS', message.Messages)

      //Bus.$emit('intervalChatRecordUpdate')
      break

    //请求支援
    case 'SupportCustomerPushNotice':
      //console.log(message)
      store.commit('conversation/UPDATE_SINGLE_CONVERSATION', {
        WeChatId: message.WeChatId,
        FriendId: message.FriendId,
        UserName: message.FriendId,
        KfNick: message.KfNick,

        _isSupport: true
      })
      break
    // 微信个人号新增好友通知
    case 'FriendAddNotice':
      conversationHandle.friendAddNoticeHandle(message)
      // if (store.state.route === 'tools' && message.WeChatId === store.getters['tools/currentWeChatId']) {
      //   PullFriendAddReqListTask(message.WeChatId)
      // }
      break
    // sdk 好友信息变更通知 ok
    case 'FriendChangeNotice':
      conversationHandle.friendChangeNoticeHandle(message)
      break
    // sdk 发消息任务结果 ok
    case 'TalkToFriendTaskResultNotice':
      //store.dispatch('conversation/RemoveLocalChat', message)
      //store.commit('conversation/UPDATE_CHAT', { ...message, LocalSend: false })
      break
    // sdk 好友删除通知 ok
    case 'FriendDelNotice':
      conversationHandle.friendDelNoticeHandle(message)
      break
    // sdk 标签列表 ok
    case 'ContactLabelInfoNotice':
      previewHandle.contactLabelInfoNoticeHandle(message)
      break
    // sdk 标签新增|修改通知 ok
    case 'ContactLabelAddNotice':
      conversationHandle.contactLabelAddNoticeHandle(message)
      break
    // sdk 标签删除通知 ok
    case 'ContactLabelDelNotice':
      conversationHandle.contactLabelDelNoticeHandle(message)
      break
    // 图片或视频消息的详细内容结果
    case 'RequestTalkDetailTaskResultNotice':
      store.commit('conversation/SET_IMGAGE_URL', message)
      // 更新快速发送朋友圈中的大图信息
      store.commit('circleManager/UPDATE_CHAT_LIST', message)
      break
    // 打开红包或转账 ok
    case 'TakeMoneyTaskResultNotice':
      console.log('TakeMoneyTaskResultNotice', message)
      if (message.Success) {
        Message({
          type: 'success',
          message: '打开红包成功！',
          duration: 1000
        })
      } else {
        Message({
          type: 'error',
          message: '打开红包失败！',
          duration: 2000
        })
        message.Amount = '打开红包失败！'
      }
      store.dispatch('nedb/UpdateLuckMoney', message)
      break
    // 查询红包结果 ok
    case 'QueryHbDetailTaskResultNotice':
      store.commit('conversation/SET_HB_DETAIL_VISIBLE', true)
      store.commit('conversation/SET_HB_DETAIL', message)
      break
    // 推送历史消息
    case 'HistoryMsgPushNotice':
      const weChatId = message.WeChatId
      if ((store.state.preLoadNum[weChatId] || 0) + 1 === (store.state.pullNum[weChatId] || 0)) {
        store.commit('SET_PRE_LOAD_NUM', { id: weChatId, num: 0 })
        store.commit('SET_GLOBAL_LOADING', false)
        store.commit('SET_IS_PRE_LOAD_HISTORY_RECORD', false)
      } else {
        store.commit('SET_PRE_LOAD_NUM', { id: weChatId, num: (store.state.preLoadNum[weChatId] || 0) + 1 })
      }
      //console.log(message, store.state.preLoadNum[weChatId] || 0, store.state.pullNum[weChatId] || 0)
      store.dispatch('conversation/SetCurrentChats', message)
      break
    // 消息标记为已读
    case 'PostMessageReadNotice':
      // 不用处理
      break
    // 自动上传大图通知 ok
    case 'ChatMsgFilePushNotice':
      // 不用处理
      // store.dispatch('nedb/UpdateChatImgUrlByNotice', msg)
      break
    // ============================================================
    // 以下是conversation群聊 用到的回调
    // ============================================================
    // 推送群聊列表 ok
    case 'ChatroomPushNotice':
      if (message.TaskId) {
        const taskList = store.getters['triggerTask']
        if (taskList[message.TaskId]) {
          conversationHandle.chatroomPushNoticeHandle(message)
        }
      } else {
        conversationHandle.chatroomPushNoticeHandle(message)
      }
      break
    // 群成员信息 ok
    case 'ChatRoomMembersNotice':
      conversationHandle.chatRoomMembersNoticeHandle(message)
      break
    // 群聊新增通知 ok
    case 'ChatRoomAddNotice':
      conversationHandle.chatRoomAddNoticeHandle(message)
      break
    // 群聊删除通知 ok
    case 'ChatRoomDelNotice':
      conversationHandle.chatRoomDelNoticeHandle(msg)
      break
    // 群聊信息变更通知 ok
    case 'ChatRoomChangedNotice':
      conversationHandle.chatRoomChangedNoticeHandle(msg)
      break
    // 群二维码 ok
    case 'PullChatRoomQrCodeTaskResultNotice':
      conversationHandle.pullChatRoomQrCodeTaskResultNoticeHandle(msg)
      break

    // ============================================================
    // 以下是任务处理结果的回调
    // ============================================================
    case 'TaskResultNotice':
      taskResultNotice.taskResultMap(message)
      break
    // ============================================================
    // 以下是服务端的回调
    // ============================================================
    // server 返回
    case 'MsgReceivedAck':
      switch (msg.refMsgId) {
        case 1001:
          console.log('心跳返回', new Date().toLocaleString())
          break
        default:
          // console.log(`服务端已经收到并下发任务`)
          break
      }
      break
    // ============================================================
    // 以下是 错误用到的回调
    // ============================================================
    case 'Error':
      if (
        message.ErrorCode === 'NoRight' &&
        (message.ErrorMsg === '账号已在别处登录' || message.ErrorMsg === 'token过期')
      ) {
        MessageBox.alert(message.ErrorMsg + '，请重新登录 !', '系统提示', {
          type: 'error',
          showClose: false,
          confirmButtonText: '确定并退出',
          callback: () => {
            // 重置websocket token
            store.commit('SET_WEBSOCKET_TOKEN', '')
            localStorage.removeItem('WEBSOCKET_TOKEN')
            localStorage.removeItem('CURRENT_USER')
            localStorage.removeItem('LOGIN_INFO')
          }
        })
      } else {
        Message({
          type: 'error',
          message: message.ErrorMsg,
          duration: 3000
        })
      }
      break
    // =========================================================================
    // ============================服务端的任务==================================
    // =========================================================================
    // server 退出登陆 ok
    case 'DeviceExitNotice':
      console.log('退出登陆', msg)
      break
    // server 公众号列表推送 ok
    case 'BizContactPushNotice':
      store.commit('conversation/SET_GH_MAP', JSON.parse(msg.message))
      break
    // 敏感词过滤
    case 'warning':
      {
        const warningMsg = JSON.parse(msg.message)
        Message({
          type: 'warning',
          message: warningMsg.msg,
          duration: 2000
        })
        // 删除本地的数据
        store.dispatch('nedb/RemoveChatsByMsgId', warningMsg)
      }
      break
    default:
      break
  }
}
