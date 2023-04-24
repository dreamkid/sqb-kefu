import store from '@/store'
import nedb from '@/db/nedb'
import { Message } from 'element-ui'
import { TriggerCirclePushTask } from '@/api/webSocketApi'

function taskResultMap(message) {
  const { Success, TaskType } = message
  // Message({
  //   type: Success ? 'success' : 'warning',
  //   message: Success ? '成功！' : '失败！',
  //   duration: 1000
  // })

  switch (TaskType) {
    // 添加好友结果 ok
    case 'AddFriendsTask':
      addFriendsTaskHandle(message)
      break
    // 停止清理僵尸粉 ok
    case 'PostStopFriendDetectTask':
      break
    // 删除朋友圈结果 ok
    case 'DeleteSNSNewsTask':
      // store.dispatch('nedb/UpdateCircleTask', message)
      break
    // 朋友圈点赞结果通知
    case 'CircleLikeTask':
      {
        const tasks = store.getters['conversation/circleTask']
        if (tasks[message.TaskId]) {
          const { CircleId, WeChatId } = tasks[message.TaskId]
          if (CircleId && WeChatId) {
            TriggerCirclePushTask(WeChatId, [CircleId])
          }
        }
      }
      break
    // 群发好友结果通知 ok
    case 'WeChatGroupSendTask':
      store.dispatch('nedb/UpdateGroupSendTask', message)
      break
    // 修改备注 ok
    case 'ModifyFriendMemoTask':
      console.log(message)
      store.dispatch('nedb/UpdateMemoTask', message)
      break
    // 标签的操作 ok
    case 'ContactLabelTask':
      store.dispatch('nedb/UpdateMemoTask', message)
      break
    // 群管理结果通知 ok
    case 'ChatRoomActionTask':
      chatRoomActionTaskHandle(message)
      break
    // 群加好友结果通知
    case 'AddFriendInChatRoomTask':
      store.dispatch('nedb/UpdateChatRoomTask', message)
      break

    // 获取图片/视频/文件url
    case 'RequestTalkDetailTask':
      if (message.ErrMsg) {
        Message({
          type: 'error',
          message: '获取资源失败' + message.ErrMsg,
          duration: 2000
        })
      }
      break
    // 发红包结果通知
    case 'SendLuckyMoneyTask':
      sendLuckyMoneyTaskHandle(message)
      break
    // 转账结果通知
    case 'RemittanceTask':
      remittanceTaskHandle(message)
      break

    // 好友删除任务结果通知
    case 'DeleteFriendTask':
      deleteFriendTaskHandle(message)
      break
    // 同意进群任务结果
    case 'AgreeJoinChatRoomTask':
      agreeJoinChatRoomTaskHandle(message)
      break
    // 消息撤回通知
    case 'RevokeMessageTask':
      if (message.Success) {
        const currentMessage = store.state.conversation.currentChatsStore.find(
          (item) => item.msgSvrId === message.TaskId
        )
        if (currentMessage)
          store.commit('conversation/UPDATE_CURRENT_CHAT', {
            ...currentMessage,
            IsRevoke: 1
          })
        //store.dispatch('conversation/RemoveChat', message)
      }
      break
    // 手机操作
    case 'PhoneActionTask':
      break
    // 消息转发
    case 'ForwardMessageTask':
      forwardMessageTaskHandle(message)
      break
    case 'PostFriendDetectTask':
      store.dispatch('nedb/AddOrUpdateZombies', {
        SkipCount: 0,
        TaskId: message.TaskId,
        WeChatId: message.WeChatId,
        Zombies: []
      })
      break
    default:
      console.log('TaskResultNotice', message)
      break
  }
}

// 添加好友通知 ok
function addFriendsTaskHandle(message) {
  const result = message.Success ? '已申请' : message.ErrMsg
  message.result = result
  message.TaskId = Number(message.TaskId)
  store.dispatch('nedb/AddOrUpdateAddFriends', message)
}

// 转发消息 ok
function forwardMessageTaskHandle(message) {
  if (message.Success) {
    Message({
      type: 'success',
      message: '转发成功！',
      duration: 1000
    })
  } else {
    Message({
      type: 'warning',
      message: '转发失败！',
      duration: 2000
    })
  }
  // 如果输出更详细的信息 需要把任务存数据库
}

// 群管理结果通知 ing
function chatRoomActionTaskHandle(message) {
  // 更新本地群聊任务表
  store.dispatch('nedb/UpdateChatRoomTask', message)
  nedb.chatRoomTask.findOne({ taskId: message.TaskId }, (err, doc) => {
    if (err) return
    if (doc) {
      const action = doc.Action
      // const actionMap = {
      //   0: '修改群名称',
      //   1: '修改群公告',
      //   2: '拉人进群',
      //   3: '踢人',
      //   4: '修改群内显示名',
      //   5: '设置保存到通讯',
      //   6: '设置消息免打扰',
      //   7: '删除并退出群',
      //   8: '建群',
      //   9: '查看所有群成员',
      //   10: '群主转让',
      //   11: '设置群邀请确认',
      //   16: '置顶'
      // }

      switch (action) {
        case 5:
          //   let msg5 = ''
          //   if (doc.IntValue === 0) {
          //     msg5 = '关闭保存到通讯成功'
          //   } else {
          //     msg5 = '打开保存到通讯成功'
          //   }
          break
        case 6:
          // 更新会话
          store.commit('conversation/UPDATE_IS_SILENT', doc)
          if (doc.ChatRoomId.indexOf('@chatroom')) {
            store.dispatch('nedb/UpdateChatRoomByAction', doc)
          }
          break
        case 11:
          //   let msg11 = ''
          //   if (doc.IntValue === 0) {
          //     msg11 = '关闭群邀请确认'
          //   } else {
          //     msg11 = '打开群邀请确认'
          //   }
          break
        case 16:
          // 更新会话
          store.commit('conversation/UPDATE_IS_TOP', doc)
          break
        default:
          console.log('chatRoomActionTaskHandle', message)
          console.log('chatRoomActionTaskHandle', doc)

          break
      }
    }
  })
}

// 发红包结果通知 ok
function sendLuckyMoneyTaskHandle(message) {
  if (message.Success) {
    // 发红包没有返回MsgSvrId 而是返回了SendId
    message.MsgSvrId = message.ErrMsg
    // 发红包没有返回MsgId 而是返回了TaskId
    message.MsgId = message.TaskId
    Message({
      type: 'success',
      message: '红包发送成功！',
      duration: 1000
    })
    nedb.chats.findOne({ MsgId: message.MsgId }, (err, doc) => {
      if (doc) {
        message.FriendId = doc.FriendId
        store.dispatch('nedb/UpdateChats', message)
      }
    })
  } else {
    Message({
      type: 'warning',
      message: `红包发送失败`,
      duration: 2000
    })
  }
}

// 转账结果 ok
function remittanceTaskHandle(message) {
  if (message.Success) {
    // 发红包没有返回MsgSvrId 而是返回了SendId
    message.MsgSvrId = message.ErrMsg
    // 发红包没有返回MsgId 而是返回了TaskId
    message.MsgId = message.TaskId
    Message({
      type: 'success',
      message: '转账成功！',
      duration: 1000
    })
    nedb.chats.findOne({ MsgId: message.MsgId }, (err, doc) => {
      if (doc) {
        message.FriendId = doc.FriendId
        store.dispatch('nedb/UpdateChats', message)
      }
    })
  } else {
    Message({
      type: 'warning',
      message: `转账失败`,
      duration: 2000
    })
  }
}

// 删除好友结果处理 ok
function deleteFriendTaskHandle(message) {
  if (message.Success) {
    Message({
      type: 'success',
      message: '删除好友成功！',
      duration: 1000
    })
    // 删除成功之后的逻辑
    // 这里删除成功之后会触发FriendDelNotice，逻辑在哪里处理
  } else {
    Message({
      type: 'warning',
      message: '删除好友失败！',
      duration: 2000
    })
  }
}

// 同意进群 ok
function agreeJoinChatRoomTaskHandle(message) {
  if (message.Success) {
    Message({
      type: 'success',
      message: '加入群聊成功！',
      duration: 1000
    })
  } else {
    Message({
      type: 'warning',
      message: '加入群聊失败！',
      duration: 2000
    })
  }
}

export default {
  taskResultMap
}
