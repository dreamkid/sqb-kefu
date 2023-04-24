import store from '@/store'
import Bus from '@/utils/bus'
import { Message } from 'element-ui'
import { TriggerConversationPushTask } from '@/api/webSocketApi'

let i = 0

// 好友列表 ok
function friendPushNoticeHandle(message) {
  const count = message.Count || 0 // 好友数量
  const page = message.Page || 0
  const over = (page + 1) * 100 >= count
  // 如果有好友
  const userId = store.getters.userId
  const wechatId = message.WeChatId
  const friends = []
  for (const friend of message.Friends) {
    friend.Page = page
    friend.WeChatId = wechatId
    friend.userId = userId
    friends.push(friend)
  }
  console.log('friendPushNoticeHandle', friends)
  store.dispatch('nedb/AddFriends', friends)
  // 有好友并且推送完成
  if (over) {
    store.commit('conversation/SET_REFRESH_BUTTON', true)
  }
}

// 微信个人号新增好友通知 ok
function friendAddNoticeHandle(message) {
  if (!message.Friend) return
  // 更新好友信息
  const newFriend = { ...message.Friend }
  newFriend.WeChatId = message.WeChatId
  newFriend.userId = store.getters.userId
  // 更新friends
  store.dispatch('nedb/UpdateFriendsByOne', newFriend)
}

// 好友信息变更通知 ok
function friendChangeNoticeHandle(message) {
  //console.log('friendChangeNoticeHandle', message)
  if (!message.Friend) return
  // 更新好友信息
  const newFriend = { ...message.Friend }
  newFriend.BindStatus = message.BindStatus
  newFriend.BindInfo = message.BindInfo
  newFriend.BindParams = message.BindParams
  newFriend.WeChatId = message.WeChatId
  newFriend.userId = store.getters.userId

  Bus.$emit('memberDetailChange', newFriend)
  // 更新friends
  store.dispatch('nedb/UpdateFriendsByOne', newFriend)
  // 更新当前好友信息
  const cf = store.getters['conversation/currentFriend']
  //console.log(cf)
  if (message.WeChatId === cf.WeChatId && newFriend.FriendId === cf.FriendId) {
    store.commit('conversation/SET_CURRENT_FRIENDS', newFriend)
  }
}

// 标签新增|修改通知 ok
function contactLabelAddNoticeHandle(message) {
  if (message.Label) {
    store.dispatch('nedb/AddLabel', message)
  }
}

// 标签删除通知 ok
function contactLabelDelNoticeHandle(message) {
  store.dispatch('nedb/DeleteLabel', message)
}

// ===============================群聊相关===============================
//  群聊列表 ok
function chatroomPushNoticeHandle(message) {
  const count = message.Count || 0 // 好友数量
  const page = message.Page || 0
  const over = (page + 1) * 2 >= count
  // 有群聊并且推送完成
  if (over) {
    console.log('有群聊并且推送完成')
    store.commit('conversation/SET_REFRESH_BUTTON', true)
  }
  store.dispatch('nedb/AddChatRooms', message)
}

// 群成员信息 ok
function chatRoomMembersNoticeHandle(message) {
  i++
  setTimeout(() => {
    store.dispatch('nedb/AddOrUpdateChatRoomMembers', message)
    i--
  }, i * 500)
}

// 群聊新增通知 ok
// RequestChatRoomInfoTask的返回
function chatRoomAddNoticeHandle(message) {
  //console.log('chatRoomAddNoticeHandle', message)
  if (!message.ChatRoom) return
  store.dispatch('nedb/AddOrUpdateChatRoom', message)
}

// 群聊删除通知 ok
function chatRoomDelNoticeHandle(msg) {
  const message = JSON.parse(msg.message)
  // 删除本地的群聊数据
  store.dispatch('nedb/RemoveChatRoom', message)
  // 删除会话数据
  store.commit('conversation/DELETE_CONV', message)
}

// 群二维码 ok
function pullChatRoomQrCodeTaskResultNoticeHandle(msg) {
  const qrcode = JSON.parse(msg.message)
  if (qrcode.Success) {
    Message({
      type: 'success',
      message: '获取群二维码成功！',
      duration: 1000
    })
    store.dispatch('nedb/UpdateQrCode', qrcode)
  } else {
    Message({
      type: 'error',
      message: '获取群二维码失败！',
      duration: 2000
    })
  }
}

// 群聊信息变更通知 ok
function chatRoomChangedNoticeHandle(msg) {
  const message = JSON.parse(msg.message)
  if (message.Content !== false && !message.Content) return
  let sqlStr = {}
  const cf = store.getters['conversation/currentFriend']
  const cfid = store.getters['conversation/currentFriendId']
  const chatRoom = {
    WeChatId: message.WeChatId,
    UserName: message.UserName
  }
  if (message.UserName === cfid) {
    for (const key in cf) {
      if (cf.hasOwnProperty(key)) {
        chatRoom[key] = cf[key]
      }
    }
  }

  switch (message.What) {
    // 群聊名称 ok
    case 'Change_NickName':
      sqlStr = { NickName: message.Content }
      chatRoom.NickName = message.Content
      break
    // 公告 ok 群聊里 remark 用来存公告
    case 'Change_PublicNotice':
      sqlStr = { Notice: message.Content }
      chatRoom.Notice = message.Content
      break
    // 群显示名 ok
    case 'Change_ShowName':
      {
        const reg = /[a-zA-z0-9_]{6,20}=/g
        const wechatIds = message.Content.match(reg)
        const wechatIds2 = wechatIds.map(function (id) {
          return id.replace(/=/, '')
        })

        const names = message.Content.replace(/{|}/gi, '').split(/[a-zA-z0-9_]{6,20}=/)
        const names2 = names.filter(function (s) {
          return s && s.trim()
        })
        const nc = []
        for (let index = 0; index < names2.length; index++) {
          nc.push({ UserName: wechatIds2[index], ShowName: names2[index] })
        }
        sqlStr = { ShowNameList: nc }
        chatRoom.ShowNameList = nc
      }
      break
    // 自己的群显示名 ok
    case 'Change_MyShowName':
      sqlStr = { SelfDisplayName: message.Content }
      chatRoom.SelfDisplayName = message.Content
      break
    // 改变群主 ok
    case 'Change_Owner':
      sqlStr = { Owner: message.Content }
      chatRoom.Owner = message.Content
      break
    // 改变群头像 ok
    case 'Change_Avatar':
      sqlStr = { Avatar: message.Content }
      chatRoom.Avatar = message.Content
      break

    // 免打扰
    case 'Change_ChatMsgImmunityEnable':
      if (message.Content) {
        sqlStr = { ChatMsgImmunityEnable: true }
        chatRoom.ChatMsgImmunityEnable = true
      } else if (!message.Content) {
        sqlStr = { ChatMsgImmunityEnable: false }
        chatRoom.ChatMsgImmunityEnable = false
      } else {
        sqlStr = { ChatMsgImmunityEnable: false }
        chatRoom.ChatMsgImmunityEnable = false
      }

      // store.commit('conversation/UPDATE_SINGLE_CONVERSATION', {
      //   ...store.getters['conversation/currentFriend'],
      //   IsSilent: chatRoom.ChatMsgImmunityEnable
      // })

      break
    // 保存通讯录
    case 'Change_ChatSaveMailEnable':
      if (message.Content === 'true') {
        sqlStr = { ChatSaveMailEnable: true }
        chatRoom.ChatSaveMailEnable = true
      } else if (message.Content === 'false') {
        sqlStr = { ChatSaveMailEnable: false }
        chatRoom.ChatSaveMailEnable = false
      } else {
        sqlStr = { ChatSaveMailEnable: false }
        chatRoom.ChatSaveMailEnable = false
      }

      break
    // 显示群成员昵称
    case 'Change_ChatShowMemberNameEnable':
      if (message.Content === 'true') {
        sqlStr = { ChatShowMemberNameEnable: true }
        chatRoom.ChatShowMemberNameEnable = true
      } else if (message.Content === 'false') {
        sqlStr = { ChatShowMemberNameEnable: false }
        chatRoom.ChatShowMemberNameEnable = false
      } else {
        sqlStr = { ChatShowMemberNameEnable: false }
        chatRoom.ChatShowMemberNameEnable = false
      }

      break
    // 备注
    case 'Change_ChatMeRemarks':
      sqlStr = { Remark: message.Content }
      chatRoom.Remark = message.Content
      break
    // 群内昵称
    case 'Change_ChatRoomMemberRemark':
      sqlStr = { ChatMeNick: message.Content }
      chatRoom.ChatMeNick = message.Content
      break
    // 群成员修改 ok
    default:
      {
        sqlStr = { Avatar: message.Content }
        const membersList = message.Content.split(';')
        sqlStr = { MemberList: membersList }
        chatRoom.MemberList = membersList
      }
      break
  }
  message.sqlStr = sqlStr
  // 更新群聊
  store.dispatch('nedb/UpdateChatRoom', message)
  // 更新currentFriends
  if (message.UserName === cfid) {
    store.commit('conversation/SET_CURRENT_FRIENDS', chatRoom)
  }
}

// 删除好友通知 ok
function friendDelNoticeHandle(message) {
  // 删除本地保存的数据
  store.dispatch('nedb/RemoveFriend', message)
  // 删除本地数据
  store.commit('conversation/DELETE_CONVERSATIONS_BY_NOTICE', message)

  // 从手机获取会话数据
  TriggerConversationPushTask(message.WeChatId)
}

export default {
  friendPushNoticeHandle,
  chatroomPushNoticeHandle,
  friendAddNoticeHandle,
  friendChangeNoticeHandle,
  contactLabelAddNoticeHandle,
  contactLabelDelNoticeHandle,
  friendDelNoticeHandle,
  chatRoomDelNoticeHandle,
  chatRoomAddNoticeHandle,
  chatRoomChangedNoticeHandle,
  chatRoomMembersNoticeHandle,
  pullChatRoomQrCodeTaskResultNoticeHandle
}
