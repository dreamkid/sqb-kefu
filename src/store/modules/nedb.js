/* eslint-disable no-unused-vars */
import Vue from 'vue'
import nedb from '@/db/nedb'
import Store from '../index'
import { TalkToFriendTask } from '@/api/webSocketApi'

// state
const state = {
  // =========== 功能大全用到的变量 =============
  qrCode: {}, // 微信二维码
  addFriends: [], // 添加好友的列表
  zombies: [], // 僵尸粉结果
  autoAddFriendLog: [], // 自动加好友日志
  searchResults: [], // 好友全局搜索的结果
  findContactTaskResult: [], // 好友全局搜索的结果
  toolsLabels: [], // 批量打标签页面的labels
  toolsFriends: [], // 批量打标签页面的好友列表
  toolsRooms: [], // 批量打标签页面的群列表

  // =========== 群发用到的变量 =================
  groupSendLog: [], // 群发助手页面所选微信的群发日志

  // =========== 会话页面用到的变量 =============
  friends: [], // 会话页面所选微信的通讯录
  chatRooms: [], // 会话页面所选微信的群聊列表
  labels: [], // 会话页面所选微信的标签列表
  strangers: [], // 陌生人列表
  topConvs: [], // 置顶的会话

  conversationQrCode: {}, // 会话页面用到的微信的二维码
  chatRoomQrCode: {}, // 会话页面用到的群聊的二维码
  luckMoneyMap: {} // 红包账单
}

// getters
const getters = {
  // ===================== 功能大全用到的变量===================
  qrCode: (state) => state.qrCode,
  findContactTaskResult: (state) => state.findContactTaskResult,
  addFriends: (state) => state.addFriends,
  zombies: (state) => state.zombies,
  autoAddFriendLog: (state) => state.autoAddFriendLog,
  searchResults: (state) => state.searchResults,
  toolsFriends: (state) => {
    const tf = JSON.parse(JSON.stringify(state.toolsFriends))
    return tf.map((x) => {
      if (x.LabelIds) {
        x.LabelIds = x.LabelIds.split(',')
      }
      return x
    })
  }, // 将标签变成数组
  toolsLabels: (state) => state.toolsLabels,
  toolsLabelIdMap: (state) => {
    const bim = {}
    state.toolsLabels.forEach((l) => {
      bim[l.LabelId] = l.LabelName
    })
    return bim
  }, // 标签id-name
  toolsLabelNameMap: (state) => {
    const lnm = {}
    state.toolsLabels.forEach((l) => {
      lnm[l.LabelName] = l.LabelId
    })
    return lnm
  }, // 标签 name-id
  // ===================== 群发用到的变量  =====================
  groupSendLog: (state) => state.groupSendLog,
  // ===================== 会话页面用到的变量===================
  friendsPages: (state) => {
    const nfl = []
    // 分页 每页50
    for (let i = 0; i < state.friends.length; i += 50) {
      nfl.push(state.friends.slice(i, i + 50))
    }
    return nfl
  }, // 好友数据分页
  chatRoomsPages: (state) => {
    const crpl = []
    // 分页 每页50
    for (let i = 0; i < state.chatRooms.length; i += 50) {
      crpl.push(state.chatRooms.slice(i, i + 50))
    }
    return crpl
  }, // 群聊数据分页
  labelIdMap: (state) => {
    const bim = {}
    state.labels.forEach((l) => {
      bim[l.LabelId] = l.LabelName
    })
    return bim
  }, // 会话|群聊|朋友圈页面的 标签id-name
  labelNameMap: (state) => {
    const lnm = {}
    state.labels.forEach((l) => {
      lnm[l.LabelName] = l.LabelId
    })
    return lnm
  }, // 会话|群聊|朋友圈页面的 标签name-id
  friendsMap: (state) => {
    const fm = {}
    for (const friend of state.friends) {
      fm[friend.FriendId] = friend
    }
    return fm
  }, // 好友id-好友info map
  strangersMap: (state) => {
    const sm = {}
    for (const stranger of state.strangers) {
      sm[stranger.Wxid] = stranger
    }
    return sm
  }, // 陌生人id-陌生人信息 map
  luckMoneyMap: (state) => state.luckMoneyMap,
  conversationQrCode: (state) => state.conversationQrCode
}

// actions
const actions = {
  // ===================== 功能大全用到的变量===================

  // 从nedb获取addFreinds数据
  SetAddFriends({ rootGetters, commit }, wechatId) {
    nedb.addFriendTask
      .find({ userId: rootGetters.userId, WeChatId: wechatId }) // 全部
      // .sort({ TaskId: -1 }) // 降序
      // .limit(20) // 20条
      .exec((err, docs) => {
        if (!err && docs) {
          commit('SET_ADD_FRIENDS', docs)
        }
      })
  },
  // 更新或添加nedb中的addFreinds数据
  AddOrUpdateAddFriends({ dispatch }, message) {
    // 查数据库有没有记录
    nedb.addFriendTask.findOne({ TaskId: message.TaskId }, (err, doc) => {
      if (err) return
      if (doc) {
        nedb.addFriendTask.update(
          { TaskId: message.TaskId },
          { $set: { result: message.result } },
          {},
          (err, numReplaced) => {
            if (err) return
            dispatch('SetAddFriends', message.WeChatId)
          }
        )
      } else {
        nedb.addFriendTask.insert(message, (err, newDoc) => {
          if (err) return
          dispatch('SetAddFriends', message.WeChatId)
        })
      }
    })
  },
  // 添加nedb中的findContactTask数据
  AddFindContactTask({ dispatch }, doc) {
    nedb.findContactTask.insert(doc, (err, newDoc) => {
      if (err) return
      dispatch('SetFindContactTask')
    })
  },
  // 更新nedb中的findContactTask数据
  UpdateFindContactTask({ dispatch }, message) {
    // 查数据库有没有记录
    nedb.findContactTask
      .find({ Content: message.SearchText })
      .sort({ time: -1 })
      .limit(1)
      .exec((err, docs) => {
        nedb.findContactTask.update(
          { _id: docs[0]._id },
          {
            $set: message
          },
          { upsert: false },
          (err, newDoc) => {
            if (err) return
            dispatch('SetFindContactTask')
          }
        )
      })
  },
  // 查询FindContactTask
  SetFindContactTask({ commit }) {
    nedb.findContactTask
      .find({})
      .sort({ time: -1 }) // 降序
      // .limit(20) // 20条
      .exec((err, docs) => {
        if (!err && docs) {
          commit('SET_FIND_CONTACT_TASK', docs)
        }
      })
  },
  // 从nedb获取zombies数据
  SetZombies({ rootGetters, commit }, wechatId) {
    nedb.zombies
      .find({ userId: rootGetters.userId, WeChatId: wechatId }) // 全部
      .sort({ TaskId: -1 }) // 降序
      // .limit(20) // 20条
      .exec((err, docs) => {
        if (!err && docs) {
          commit('SET_ZOMBIES', docs)
        }
      })
  },
  // 更新或添加nedb中的zombies数据
  AddOrUpdateZombies({ rootGetters, dispatch }, message) {
    const newDoc = { ...message, userId: rootGetters.userId }
    nedb.zombies.findOne({ TaskId: message.TaskId }, (err, doc) => {
      if (err) return
      if (doc) {
        newDoc.ReqTime = doc.ReqTime
        newDoc.RspTime = new Date().toLocaleString()
        if (doc.Zombies && newDoc.Zombies && newDoc.Zombies.length > 0) {
          newDoc.Zombies = doc.Zombies.concat(newDoc.Zombies)
        } else {
          newDoc.Zombies = doc.Zombies
        }
      } else {
        newDoc.ReqTime = new Date().toLocaleString()
      }
      nedb.zombies.update({ TaskId: message.TaskId }, newDoc, { upsert: true }, (err, newDoc) => {
        if (err) return
        dispatch('SetZombies', message.WeChatId)
      })
    })
  },
  // 删除nedb中的zombies数据
  ClearZombiesData({ dispatch }, wechatId) {
    nedb.zombies.remove({ WeChatId: wechatId }, { multi: true }, (err, number) => {
      if (err) return
      dispatch('SetZombies', wechatId)
    })
  },
  // 从nedb获取qrCode数据
  SetQrCode({ commit }, wechatId) {
    nedb.qrcode.findOne({ WeChatId: wechatId, ChatRoomId: -1 }, (err, doc) => {
      if (err) return
      commit('SET_QR_CODE', doc || { WeChatId: '', ChatRoomId: -1, QrCodeUrl: '', ModifyTime: 0 })
    })
  },
  // 更新或添加nedb中的qrCode数据
  UpdateQrCode({ rootGetters, dispatch }, qrcode) {
    qrcode.ModifyTime = new Date().getTime()
    nedb.qrcode.update(
      {
        WeChatId: qrcode.WeChatId,
        ChatRoomId: qrcode.ChatRoomId
      },
      {
        $set: {
          WeChatId: qrcode.WeChatId,
          QrCodeUrl: qrcode.QrCodeUrl,
          ChatRoomId: qrcode.ChatRoomId,
          ModifyTime: qrcode.ModifyTime
        }
      },
      { upsert: true },
      (err, numReplaced) => {
        if (err) return
        const cwci = rootGetters['conversation/currentWeChatId']
        const cfid = rootGetters['conversation/currentFriendId']
        // 更新群聊的二维码
        if (cfid === qrcode.ChatRoomId) {
          dispatch('SetChatRoomQrCode', { WeChatId: cwci, UserName: qrcode.ChatRoomId })
        }
        // 更新工具页面的qrcode
        if (qrcode.ChatRoomId === -1) {
          const toolsWechatId = rootGetters['tools/currentWeChatId']
          if (qrcode.WeChatId === toolsWechatId) {
            dispatch('SetQrCode', toolsWechatId)
          }
          // 更新会话页面的二维码
          if (cwci === qrcode.WeChatId) {
            dispatch('SetConversationQrCode', qrcode.WeChatId)
          }
        }
      }
    )
  },
  // 全局搜索
  FindFriendsByConditions({ rootGetters, commit }, conditions) {
    const ff = {
      userId: rootGetters.userId
    }
    if (conditions.WeChatId) {
      ff.WeChatId = conditions.WeChatId
    }
    if (conditions.Memo) {
      ff.Memo = { $regex: new RegExp('.*' + conditions.Memo + '.*') }
    }
    if (conditions.FriendNo) {
      ff.FriendNo = { $regex: new RegExp('.*' + conditions.FriendNo + '.*') }
    }
    if (conditions.FriendNick) {
      ff.FriendNick = { $regex: new RegExp('.*' + conditions.FriendNick + '.*') }
    }
    nedb.friends.find(ff, (err, docs) => {
      if (err) return
      commit('SET_SEARCH_CONDITIONS', docs || [])
    })
  },
  // 从nedb获取标签数据
  SetToolsLabels({ commit }, wechatId) {
    nedb.labels.findOne({ WeChatId: wechatId }, (err, doc) => {
      if (err) return
      commit('SET_TOOLS_LABELS', doc && doc.Labels ? doc.Labels : [])
    })
  },
  // 批量打标签页面当前所选微信的好友列表
  SetToolsFriends({ commit }, wechatId) {
    nedb.friends.find({ WeChatId: wechatId }, (err, docs) => {
      if (err) return
      commit('SET_TOOLS_FRIENDS', docs || [])
    })
  },
  // 设置批量打标签页面 当前微信的群聊列表
  SetToolsRooms({ commit }, wechatId) {
    nedb.chatRooms.find({ WeChatId: wechatId }, (err, docs) => {
      if (err) return
      commit('SET_TOOLS_ROOMS', docs || [])
    })
  },
  // ===================== 群发用到的变量 =======================
  // 将群发的任务保存到数据库
  AddGroupSendTask2Nedb({ rootGetters, dispatch }, doc) {
    doc.userId = rootGetters.userId
    doc.result = 0
    const groupLogWeChatId = rootGetters['currentWechats']['groupLog']
    nedb.groupSendTask.insert(doc, (err, newDoc) => {
      if (err) return
      if (doc.WeChatId === groupLogWeChatId) {
        dispatch('SetGroupSendLog', doc.WeChatId)
      }
    })
  },
  // 更新群发日志
  UpdateGroupSendTask({ rootGetters, dispatch, commit }, mj) {
    const taskId = mj.TaskId
    const flag = mj.Success ? 1 : 2
    const wechatId = mj.WeChatId
    const groupLogWeChatId = rootGetters['currentWechats']['groupLog']
    nedb.groupSendTask.update({ TaskId: taskId }, { $set: { result: flag } }, {}, (err, numReplaced) => {
      if (err) return
      if (wechatId === groupLogWeChatId) {
        dispatch('SetGroupSendLog', wechatId)
      }
    })
  },
  // 查询群发的日志
  SetGroupSendLog({ commit, rootGetters }, wechatId) {
    nedb.groupSendTask.find({ userId: rootGetters.userId, WeChatId: wechatId }, (err, docs) => {
      if (err) return
      commit('SET_GROUP_SEND_LOG', docs)
    })
  },
  // ===================== 会话页面用到的变量 ===================
  // ===================== 会话页面用到的变量 ===================
  // ===================== 会话页面用到的变量 ===================
  // 添加新的标签
  AddLabel({ dispatch }, message) {
    const label = message.Label
    const wechatId = message.WeChatId
    const newLable = {
      LabelId: label.LabelId,
      LabelName: label.LabelName
    }
    nedb.labels.findOne({ WeChatId: wechatId }, (err, doc) => {
      if (err) return
      const newDoc = {
        Labels: [newLable],
        WeChatId: wechatId
      }
      if (doc) {
        const ll = doc.Labels
        let flag = true
        for (const label of ll) {
          if (label.LabelId === newLable.LabelId) {
            label.LabelName = newLable.LabelName
            flag = false
            break
          }
        }
        if (flag) {
          ll.push(newLable)
        }
        newDoc.Labels = ll
      }
      dispatch('UpdateOrAddLabels', newDoc)
    })
  },
  // 删除标签
  DeleteLabel({ dispatch }, message) {
    const wechatId = message.WeChatId
    nedb.labels.findOne({ WeChatId: wechatId }, (err, doc) => {
      if (err) return
      if (doc) {
        const newLables = []
        for (const label of doc.Labels) {
          if (label.LabelId !== message.LabelId) {
            newLables.push(label)
          }
        }
        const newDoc = {
          Labels: newLables,
          WeChatId: wechatId
        }
        dispatch('UpdateOrAddLabels', newDoc)
      }
    })
  },
  // 从nedb获取标签数据
  SetLabels({ commit }, wechatId) {
    nedb.labels.findOne({ WeChatId: wechatId }, (err, doc) => {
      if (err) return
      commit('SET_LABELS', doc && doc.Labels ? doc.Labels : [])
    })
  },
  // 更新或插入nedb的labels
  UpdateOrAddLabels({ rootGetters, dispatch }, message) {
    const wechatId = message.WeChatId
    nedb.labels.update({ WeChatId: message.WeChatId }, message, { upsert: true }, (err, numReplaced) => {
      if (err) return
      if (wechatId === rootGetters['conversation/currentWeChatId']) {
        dispatch('SetLabels', wechatId)
      }
      if (wechatId === rootGetters['tools/currentWeChatId']) {
        dispatch('SetToolsLabels', wechatId)
      }
    })
  },
  // 从nedb获取通讯录数据
  SetFriends({ commit, dispatch }, wechatId) {
    nedb.friends.find({ WeChatId: wechatId }, (err, docs) => {
      if (err) return
      commit('SET_FRIENDS', docs || [])
    })
  },
  // 批量添加好友到数据库
  AddFriends({ rootGetters, dispatch }, friendsInfo) {
    //console.log('AddFriends', friendsInfo)
    const wechatId = friendsInfo[0] ? friendsInfo[0].WeChatId : ''
    nedb.friends.count({ WeChatId: wechatId }, (countErr, count) => {
      if (countErr) return
      if (count === 0) {
        // console.log('AddFriends', count)
        nedb.friends.insert(
          friendsInfo.map((item) => ({ ...item, _id: item.OrderId })),
          (err, newDocs) => {
            if (err) return
            //console.log('insert', newDocs)
            if (wechatId === rootGetters['conversation/currentWeChatId']) {
              dispatch('SetFriends', wechatId, newDocs)
            }
          }
        )
      } else {
        nedb.friends.find({ WeChatId: wechatId }, (findErr, friends) => {
          if (findErr) return
          if (wechatId === rootGetters['conversation/currentWeChatId']) {
            dispatch('SetFriends', wechatId)
          }
        })
      }
    })
  },
  // 更新nedb的friends表
  UpdateFriends({ rootGetters, dispatch }, friend) {
    nedb.friends.update({ _id: friend._id }, friend, { upsert: false }, (err, numReplaced) => {
      if (err) return
      // 更新全局map
      // dispatch('SetFriendsMap')
      // 如果改变的是当前的微信 自动刷新当前微信的好友列表的数据
      if (friend.WeChatId === rootGetters['conversation/currentWeChatId']) {
        dispatch('SetFriends', friend.WeChatId)
      }
    })
  },
  // 添加或更新好友的信息by FriendAddNotice
  UpdateFriendsByOne({ rootGetters, dispatch }, friend) {
    nedb.friends.update(
      {
        userId: rootGetters.userId,
        FriendId: friend.FriendId,
        WeChatId: friend.WeChatId
      },
      friend,
      { upsert: true },
      (err, numReplaced) => {
        if (err) return
        if (friend.WeChatId === rootGetters['conversation/currentWeChatId']) {
          dispatch('SetFriends', friend.WeChatId)
        }
        if (friend.WeChatId === rootGetters['tools/currentWeChatId']) {
          dispatch('SetToolsFriends', friend.WeChatId)
        }
      }
    )
  },
  RemoveAllFriends({ dispatch, commit }) {
    return new Promise((resolve, reject) => {
      nedb.friends.remove({}, { multi: true }, (err, removedDocs) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  },
  // 删除nedb中的指定微信的friends
  RemoveAllFriensByWechatId({ dispatch }, wechatId) {
    nedb.friends.remove({ WeChatId: wechatId }, { multi: true }, (err, removedDocs) => {
      if (err) return

      dispatch('SetFriends', wechatId)
    })
  },

  // 删除nedb中的指定微信id的friend
  RemoveFriend({ rootGetters, dispatch }, message) {
    // FriendId: "wxid_9mikoz4cy2zn22"
    // WeChatId: "wxid_kg9a5uxz94nl22"
    nedb.friends.remove(
      { userId: rootGetters.userId, WeChatId: message.WeChatId, FriendId: message.FriendId },
      {},
      (err, numRemoved) => {
        if (err) return
        dispatch('SetFriends', message.WeChatId)
      }
    )
  },
  // 从nedb获取群聊数据
  SetChatRooms({ commit }, wechatId) {
    nedb.chatRooms.find({ WeChatId: wechatId }, (err, docs) => {
      if (err) return
      commit('SET_CHAT_ROOMS', docs || [])
    })
  },
  // 添加或更新群信息
  AddOrUpdateChatRoom({ rootGetters, dispatch }, room) {
    if (!room.ChatRoom) return
    nedb.chatRooms.findOne(
      {
        userId: rootGetters.userId,
        UserName: room.ChatRoom.UserName,
        WeChatId: room.WeChatId
      },
      (err, doc) => {
        if (err) return
        if (doc) {
          const chatroom = room.ChatRoom
          chatroom['userId'] = rootGetters.userId
          chatroom['WeChatId'] = room.WeChatId
          chatroom['_id'] = doc._id
          dispatch('UpdateChatRoomById', chatroom)
        } else {
          dispatch('AddChatRooms', room)
        }
      }
    )
  },
  // 添加nedb的chatRooms
  AddChatRooms({ rootGetters, dispatch }, message) {
    //console.log('AddChatRooms', message)
    // 如果有好友
    const userId = rootGetters.userId
    const wechatId = message.WeChatId
    const crl = []
    // chatroomPushNotice
    if (message.ChatRooms) {
      for (const chatRoom of message.ChatRooms) {
        chatRoom.WeChatId = wechatId
        chatRoom.userId = userId
        crl.push(chatRoom)
      }
    }
    // chatRoomAddNotice
    if (message.ChatRoom) {
      const chatRoom = message.ChatRoom
      chatRoom.WeChatId = wechatId
      chatRoom.userId = userId
      crl.push(chatRoom)

      // 更新currentFriends
      dispatch('conversation/UpdateCurrentFriendsByRoom', chatRoom, { root: true })
    }
    if (crl.length === 0) return

    nedb.chatRooms.count({ WeChatId: wechatId }, (countErr, count) => {
      if (countErr) return
      if (count === 0) {
        nedb.chatRooms.insert(crl, (err, newDocs) => {
          if (err) return
          if (wechatId === rootGetters['conversation/currentWeChatId']) {
            dispatch('SetChatRooms', wechatId)
          }
        })
      } else {
        if (wechatId === rootGetters['conversation/currentWeChatId']) {
          dispatch('SetChatRooms', wechatId)
        }
      }
    })
  },
  // 更新nedb的chatRooms
  UpdateChatRoom({ rootGetters, dispatch }, message) {
    //console.log('UpdateChatRoom', message)
    nedb.chatRooms.update(
      { userId: rootGetters.userId, WeChatId: message.WeChatId, UserName: message.UserName },
      { $set: message.sqlStr },
      { multi: false },
      (err, numReplaced) => {
        if (err) return
        // 更新群聊列表
        if (message.WeChatId === rootGetters['conversation/currentWeChatId']) {
          dispatch('SetChatRooms', message.WeChatId)
        }
      }
    )
  },
  // 免打扰状态改变 更新nedb的chatRooms
  UpdateChatRoomByAction({ rootGetters, dispatch }, doc) {
    if (doc.Action === 6) {
      nedb.chatRooms.update(
        { userId: rootGetters.userId, WeChatId: doc.WeChatId, UserName: doc.ChatRoomId },
        { $set: { MsgSilent: !!doc.IntValue } },
        { multi: false },
        (err, numReplaced) => {
          if (err) return
          // 更新群聊列表
          if (doc.WeChatId === rootGetters['conversation/currentWeChatId']) {
            dispatch('SetChatRooms', doc.WeChatId)
          }
        }
      )
    } else if (doc.Action === 16) {
      // 置顶 缺乏关键信息 暂不处理
      // nedb.chatRooms.update(
      //   { userId: rootGetters.userId, WeChatId: doc.WeChatId, UserName: doc.ChatRoomId },
      //   { $set: { Type: doc.IntValue === 1 ? 2050 : 2 }},
      //   { multi: false },
      //   (err, numReplaced) => {
      //     if (err) return
      //     // 更新群聊列表
      //     if (doc.WeChatId === rootGetters['conversation/currentWeChatId']) {
      //       dispatch('SetChatRooms', doc.WeChatId)
      //     }
      //   }
      // )
    }
  },
  // 更新nedb的chatRooms
  UpdateChatRoomById({ rootGetters, dispatch }, chatroom) {
    //console.log('UpdateChatRoomById')
    nedb.chatRooms.update({ _id: chatroom._id }, chatroom, { multi: false }, (err, numReplaced) => {
      if (err) return
      // 更新群聊列表
      if (chatroom.WeChatId === rootGetters['conversation/currentWeChatId']) {
        dispatch('SetChatRooms', chatroom.WeChatId)
        // dispatch('SetChatRoomsMap')
      }

      // 更新currentFriends
      dispatch('conversation/UpdateCurrentFriendsByRoom', chatroom, { root: true })
    })
  },
  // 从数据库删除某个chatRooom
  RemoveChatRoom({ rootGetters, dispatch, commit }, message) {
    const wechatId = message.WeChatId
    nedb.chatRooms.remove(
      {
        userId: rootGetters.userId,
        WeChatId: wechatId,
        UserName: message.RoomId
      },
      { multi: false },
      (err, numRemoved) => {
        if (err) return
        if (wechatId === rootGetters['conversation/currentWeChatId']) {
          dispatch('SetChatRooms', wechatId)
        }

        // 如果群管理页面是该群
        // 更新当前的好友数据
        // 当前的微信
        const cwci = rootGetters['conversation/currentWeChatId']
        // 当前的好友
        const currentFriend = rootGetters['conversation/currentFriend']
        if (wechatId === cwci && message.RoomId === currentFriend.UserName) {
          commit('conversation/SET_CURRENT_FRIENDS', { WeChatId: message.WeChatId }, { root: true })
        }
      }
    )
  },
  RemoveAllRooms({ dispatch, commit }) {
    return new Promise((resolve, reject) => {
      nedb.chatRooms.remove({}, { multi: true }, (err, removedDocs) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  },
  // 删除nedb中的指定微信的群聊
  RemoveAllRoomByWechatId({ dispatch, commit }, wechatId) {
    nedb.chatRooms.remove({ WeChatId: wechatId }, { multi: true }, (err, removedDocs) => {
      if (err) return
      dispatch('SetChatRooms', wechatId)
      commit('conversation/SET_CURRENT_FRIENDS', { WeChatId: wechatId }, { root: true })
    })
  },
  // 设置备注和标签操作 保存到数据库
  AddMemoTask({ rootGetters }, doc) {
    doc.userId = rootGetters.userId
    doc.result = 0 // 0表示初始状态 1表示成功 2表示失败
    nedb.memoTask.insert(doc, (err, newDoc) => {
      if (err) return
    })
  },
  // 更新memoTask
  UpdateMemoTask({ rootGetters, dispatch }, mj) {
    const flag = mj.Success ? 1 : 2
    nedb.memoTask.update({ TaskId: mj.TaskId }, { $set: { result: flag } }, {}, (err, numReplaced) => {})
  },
  // 从nedb获取陌生人数据
  SetMembers({ commit, rootGetters }, wechatId) {
    nedb.chatRoomMembers.findOne({ userId: rootGetters.userId, WeChatId: wechatId }, (err, doc) => {
      if (err) return
      commit('SET_MEMBERS', doc && doc.Members ? doc.Members : [])
    })
  },
  // 清除指定微信的陌生人数据
  RemoveMembersByWechatId({ dispatch, rootGetters }, wechatId) {
    nedb.chatRoomMembers.remove({ userId: rootGetters.userId, WeChatId: wechatId }, { multi: true }, (err, docs) => {
      if (err) return
      // 如果是会话页面当前的微信 更新members
      if (wechatId === rootGetters['conversation/currentWeChatId']) {
        dispatch('SetMembers', wechatId)
      }
    })
  },
  // 陌生人数据插入nedb
  AddOrUpdateChatRoomMembers({ dispatch, rootGetters }, message) {
    nedb.chatRoomMembers.findOne({ userId: rootGetters.userId, WeChatId: message.WeChatId }, (err, doc) => {
      if (err) return
      if (doc) {
        // 老的数据
        const oldMembers = doc.Members
        // 新的数据
        const newMembers = message.Members
        // 合并后的数据
        const totalMembers = newMembers.concat(oldMembers)
        // 去重
        const temp = {} // 用于name判断重复
        const result = [] // 最后的新数组
        totalMembers.map(function (item, index) {
          if (!temp[item.Wxid]) {
            result.push(item)
            temp[item.Wxid] = true
          }
        })
        nedb.chatRoomMembers.update(
          { _id: doc._id },
          { $set: { Members: result } },
          { upsert: false },
          (err, numReplaced) => {
            if (err) return
            // 如果是会话页面当前的微信 更新members
            if (numReplaced) {
              if (message.WeChatId === rootGetters['conversation/currentWeChatId']) {
                dispatch('SetMembers', message.WeChatId)
              }
            }
          }
        )
      } else {
        message.userId = rootGetters.userId
        nedb.chatRoomMembers.insert(message, (err, newDoc) => {
          if (err) return
          // 如果是会话页面当前的微信 更新members
          if (message.WeChatId === rootGetters['conversation/currentWeChatId']) {
            dispatch('SetMembers', message.WeChatId)
          }
        })
      }
    })
  },
  // 从nedb获取qrCode数据
  SetConversationQrCode({ commit }, wechatId) {
    nedb.qrcode.findOne({ WeChatId: wechatId, ChatRoomId: -1 }, (err, doc) => {
      if (err) return
      commit('SET_CONVERSATION_QR_CODE', doc || { WeChatId: '', ChatRoomId: -1, QrCodeUrl: '', ModifyTime: 0 })
    })
  },
  // 从nedb获取群聊的qrCode数据
  SetChatRoomQrCode({ commit }, chatRoom) {
    nedb.qrcode.findOne(
      {
        WeChatId: chatRoom.WeChatId,
        ChatRoomId: chatRoom.UserName
      },
      (err, doc) => {
        if (err) return
        commit('SET_CHAT_ROOM_QR_CODE', doc || { WeChatId: '', ChatRoomId: -1, QrCodeUrl: '', ModifyTime: 0 })
      }
    )
  },
  // 群管理任务保存到数据库
  AddChatRoomTask({ rootGetters }, doc) {
    doc.userId = rootGetters.userId
    doc.result = 0 // 0表示初始状态 1表示成功 2表示失败
    nedb.chatRoomTask.insert(doc, (err, newDoc) => {
      console.log('-------------------群管理任务保存到数据库  doc---------------');
      console.log(doc);
      if (err) return
    })
  },
  // 更新群管理任务
  UpdateChatRoomTask({ dispatch }, mj) {
    const flag = mj.Success ? 1 : 2
    nedb.chatRoomTask.update({ TaskId: mj.TaskId }, { $set: { result: flag } }, {}, (err, numReplaced) => {})
  },
  // 设置红包账单
  SetLuckMoneyMap({ rootGetters, commit }) {
    nedb.luckMoney.find({ userId: rootGetters.userId }, (err, docs) => {
      if (err) return
      commit('SET_LUCK_MONEY_MAP', docs)
    })
  },
  // 添加红包账单
  InsertLuckMoney({ rootGetters, dispatch }, doc) {
    doc.userId = rootGetters.userId
    doc.opened = false
    nedb.luckMoney.insert(doc, (err, newDoc) => {
      if (err) return
      dispatch('SetLuckMoneyMap')
    })
  },
  // 更新红包账单
  UpdateLuckMoney({ rootGetters, dispatch }, message) {
    nedb.luckMoney.update(
      {
        userId: rootGetters.userId,
        MsgKey: message.MsgKey,
        WeChatId: message.WeChatId
      },
      { $set: { opened: true, Amount: message.Amount } },
      {},
      (err, numReplaced) => {
        if (err) return
        dispatch('SetLuckMoneyMap')
      }
    )
  }
}

// mutations
const mutations = {
  // ===================== 功能大全用到的变量===================
  // 设置addFriends
  SET_ADD_FRIENDS(state, docs) {
    state.addFriends = docs
  },
  // 设置僵尸粉
  SET_ZOMBIES(state, docs) {
    state.zombies = docs
  },
  // 设置工具大全的qrCodes
  SET_QR_CODE(state, doc) {
    for (const key in doc) {
      Vue.set(state.qrCode, key, doc[key])
    }
  },
  // 设置全局搜索结果
  SET_SEARCH_CONDITIONS(state, docs) {
    state.searchResults = docs
  },
  // 批量加好友的日志
  SET_AUTO_ADD_FRIEND_LOG(state, logs) {
    // docs.sort((a, b) => {
    //     return b.TaskId - a.TaskId
    // })
    state.autoAddFriendLog = logs
  },
  // 搜索联系人日志
  SET_FIND_CONTACT_TASK(state, docs) {
    state.findContactTaskResult = docs
  },
  // 批量打标签页面所选微信的标签列表
  SET_TOOLS_LABELS(state, labelDocs) {
    state.toolsLabels = labelDocs
  },
  // 批量打标签页面所选微信的通讯录
  SET_TOOLS_FRIENDS(state, toolFriends) {
    state.toolsFriends = toolFriends
  },
  // 批量打标签页面所选微信的群聊
  SET_TOOLS_ROOMS(state, rooms) {
    state.toolsRooms = rooms
  },

  // ===================== 群发助手用到的变量 ====================
  // 群发助手页面所选微信的群发日志
  SET_GROUP_SEND_LOG(state, docs) {
    // docs.sort((a, b) => {
    //     return b.TaskId - a.TaskId
    // })
    state.groupSendLog = docs
  },
  // ===================== 会话页面用到的变量 ===================
  // 设置当前微信的通讯录
  SET_FRIENDS(state, friendsDoc) {
    // 按时间降序
    // friendsDoc.sort((a, b) => {
    //   return b.FriendId - a.FriendId
    // })
    // LabelsId转为数组
    const tf = friendsDoc.map((x) => {
      if (x.LabelIds) {
        x.LabelIds = x.LabelIds.split(',')
      }
      return x
    })
    state.friends = tf
  },
  // 设置当前微信的群聊列表
  SET_CHAT_ROOMS(state, docs) {
    state.chatRooms = docs
  },
  // 会话页面所选微信的标签列表
  SET_LABELS(state, labelsList) {
    state.labels = labelsList
  },
  // 设置当前微信的陌生人列表
  SET_MEMBERS(state, strangerDocs) {
    state.strangers = strangerDocs
  },
  // 设置会话页面的qrCodes
  SET_CONVERSATION_QR_CODE(state, doc) {
    for (const key in doc) {
      Vue.set(state.conversationQrCode, key, doc[key])
    }
  },
  // 设置会话页面的群聊qrCodes
  SET_CHAT_ROOM_QR_CODE(state, doc) {
    for (const key in doc) {
      Vue.set(state.chatRoomQrCode, key, doc[key])
    }
  },
  // 设置luckMoneyMap
  SET_LUCK_MONEY_MAP(state, docs) {
    for (const key in docs) {
      Vue.set(state.luckMoneyMap, docs[key].MsgSvrId, docs[key])
    }
  }
  // // 设置luckMoneyMap
  // SET_TOP_CONVS(state, convsDocs) {
  //   state.topConvs = convsDocs.map((x) => {
  //     return x.userName
  //   })
  // }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
