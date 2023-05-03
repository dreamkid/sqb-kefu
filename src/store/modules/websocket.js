import base64 from '@/utils/base64.js'
import { sendSock } from '@/websocket/websocket'
import { generateTaskId } from '@/utils/util'

// state
const state = {}

// getters
const getters = {}

// actions
const actions = {
  // 告诉server退出登录
  // 返回  DeviceExitNotice
  AccountLogoutNotice({ rootGetters, commit }) {
    const msg = {
      Id: 3054,
      MsgType: 'AccountLogoutNotice',
      Content: {
        UnionId: Number(rootGetters.currentUser.UnionId),
        AccountType: 2
      },
      AccessToken: rootGetters.token
    }
    commit('SEND_SOCK', msg)
  },
  // server 选择微信登录 弃用
  // 返回  WeChatLoginNoticeResp
  WeChatLoginNotice({ rootGetters, commit }, wechats) {
    const msg = {
      Id: 3055,
      MsgType: 'WeChatLoginNotice',
      Content: {
        SupplierId: rootGetters.currentUser.SupplierId,
        UnionId: rootGetters.currentUser.UnionId,
        AccountType: rootGetters.currentUser.AccountType,
        WeChats: wechats
      }
    }
    commit('SEND_SOCK', msg)
  },
  // =============================================================================
  // 以下是 wxtools页面相关的sdk
  // =============================================================================
  // sdk 获取微信的二维码
  // 返回  PullWeChatQrCodeTaskResultNotice
  PullWeChatQrCodeTask({ commit }, wechatId) {
    const msg = {
      Id: 1079,
      MsgType: 'PullWeChatQrCodeTask',
      Content: {
        WeChatId: wechatId
      }
    }
    commit('SEND_SOCK', msg)
  },
  // sdk 手机重启|上传日志|清除微信视频缓存 返回 TaskResultNotice
  PhoneActionTask({ commit }, command) {
    const msg = {
      Id: 1223,
      MsgType: 'PhoneActionTask',
      Content: {
        WeChatId: command.wechatId,
        // Imei: 2, // 备用，用wxid或imei来定位手机
        Action: command.action, // 指令
        // StrParam: 4, // 字符串参数，后续扩展用
        // IntParam: 5, // 整型参数，后续扩展用
        TaskId: generateTaskId().toString()
      }
    }
    commit('SEND_SOCK', msg)
  },
  // sdk 添加好友 返回  TaskResultNotice
  AddFriendsTask({ rootGetters, dispatch, commit }, addFriendForm) {
    const content = {
      // IMEI: '', // 该值与WeChatId二选一, IMEI优先
      WeChatId: addFriendForm.WeChatId, // 商家所属微信号
      Phones: addFriendForm.Phones, // 要添加的手机号码，批量
      message: addFriendForm.message, // 发送的验证消息
      Remark: addFriendForm.Remark, // 备注名
      TaskId: addFriendForm.TaskId // 任务Id
    }
    const msg = {
      Id: 1072,
      MsgType: 'AddFriendsTask',
      Content: content
    }
    commit('SEND_SOCK', msg)
    // 任务保存到nedb
    // 如果用不到本地的加好友数据 可以注释下面的diamagnetic
    const doc = {
      userId: rootGetters.userId,
      result: '指令已发出',
      ...content
    }
    dispatch('nedb/AddOrUpdateAddFriends', doc, { root: true })
  },

  // sdk 查询联系人 返回  FindContactTaskResult
  FindContactTask({ dispatch, commit }, message) {
    const content = {
      WeChatId: message.WeChatId, // 商家所属微信号
      Content: message.Content // 查找的手机号，微信号，QQ号
    }
    const msg = {
      Id: 1227,
      MsgType: 'FindContactTask',
      Content: content
    }
    commit('SEND_SOCK', msg)
    // 查询记录保存到本地数据库
    const doc = {}
    for (const key in content) {
      if (content.hasOwnProperty(key)) {
        doc[key] = content[key]
      }
    }
    doc.time = new Date().getTime()
    doc.result = 0
    dispatch('nedb/AddFindContactTask', doc, { root: true })
  },

  // =============================================================================
  // 以下是 群发 页面相关的sdk
  // =============================================================================

  // sdk 群发助手 返回 TaskResultNotice
  WeChatGroupSendTask({ dispatch, commit }, message) {
    const content = {
      TaskId: generateTaskId().toString(), // 任务id
      FriendIds: message.FriendIds, // 目标人群id列表
      ContentType: message.ContentType, // 内容类型
      Content: message.Content, // 文字内容 或 图片列表
      WeChatId: message.WeChatId // 微信号id
    }
    const msg = {
      Id: 1076,
      MsgType: 'WeChatGroupSendTask',
      Content: content
    }
    commit('SEND_SOCK', msg)
    // 任务保存到nedb数据库
    const doc = {}
    for (const key in content) {
      if (content.hasOwnProperty(key)) {
        doc[key] = content[key]
      }
    }
    doc.MsgType = 'WeChatGroupSendTask'
    dispatch('nedb/AddGroupSendTask2Nedb', doc, { root: true })
  },

  // =============================================================================
  // 以下是 conversation页面相关的sdk
  // =============================================================================

  // 转发消息
  ForwardMessageTask({ commit }, message) {
    const content = {
      MsgSrvId: message.MsgSrvId, // 消息Id
      WeChatId: message.WeChatId, //
      FriendIds: message.FriendIds, // 目标人群id列表，用逗号,分隔
      ExtMsg: message.ExtMsg, // 附带消息
      Talker: message.Talker, // 转发消息的会话
      TaskId: generateTaskId().toString() // 任务id
    }
    const msg = {
      Id: 1088,
      MsgType: 'ForwardMessageTask',
      Content: content
    }
    // 发送消息
    commit('SEND_SOCK', msg)
  },
  // sdk 修改备注信息 返回 TaskResultNotice
  ModifyFriendMemoTask({ commit, dispatch }, content) {
    content.TaskId = generateTaskId().toString()
    const msg = {
      Id: 1101,
      MsgType: 'ModifyFriendMemoTask',
      Content: content
    }
    // 发送消息
    commit('SEND_SOCK', msg)
    // 操作保存本地nedb memoTask
    dispatch('nedb/AddMemoTask', content, { root: true })
  },
  // sdk 添加或删除标签
  // 新建标签返回  ContactLabelAddNotice
  // 删除标签返回  ContactLabelDelNotice
  // 打标签结果 TaskResultNotice
  ContactLabelTask({ commit, dispatch }, message) {
    const content = {
      WeChatId: message.WeChatId, // string 商家所属微信号
      LabelId: message.LabelId || 0, // int32 标签id，0则新建标签（如存在同名标签则会失败）
      taskId: generateTaskId().toString() // int64
      // LabelName: message.LabelName || '', //string 标签名 id!=0 会设置为该标签名
      // AddList: message.AddList || '', //string 新增的wxid，用,分隔
      // DelList: message.DelList || '', //string 删除的wxid，用,分隔
    }
    if (message.LabelName) {
      content.LabelName = message.LabelName
    }
    if (message.AddList) {
      content.AddList = message.AddList
    }
    if (message.DelList) {
      content.DelList = message.DelList
    }
    const msg = {
      Id: 1224,
      MsgType: 'ContactLabelTask',
      Content: content
    }
    // 发送消息
    commit('SEND_SOCK', msg)
    const doc = {}
    for (const key in content) {
      if (content.hasOwnProperty(key)) {
        doc[key] = content[key]
      }
    }
    doc.TaskId = content.taskId
    // 操作保存本地nedb memoTask
    dispatch('nedb/AddMemoTask', doc, { root: true })
  },
  // sdk 群管理 返回 TaskResultNotice
  ChatRoomActionTask({ commit, dispatch }, message) {
    const content = {
      WeChatId: message.WeChatId, // string 商家所属微信号
      // ChatRoomId: message.ChatRoomId, //string 群聊id
      Action: message.Action, // EnumChatRoomAction 指令
      // Content: 4, //string 指令内容
      // IntValue: 5, //int32
      taskId: generateTaskId().toString() // int64
    }
    if (message.ChatRoomId) {
      content.ChatRoomId = message.ChatRoomId
    }
    if (typeof message.IntValue === 'number') {
      content.IntValue = message.IntValue
    }
    content.Content = message.Content

    const msg = {
      Id: 1213,
      MsgType: 'ChatRoomActionTask',
      Content: content
    }
    // 发送消息 

    // 发送消息
    commit('SEND_SOCK', msg)

    const doc = {}
    for (const key in content) {
      if (content.hasOwnProperty(key)) {
        doc[key] = content[key]
      }
    }
    // console.log('doc:', doc)
    doc.TaskId = content.taskId
    // 操作保存本地nedb chatRoomTask  业务逻辑 有用  db:  database;
    console.log('-------------------------获取发送完之后的消息');
    console.log(doc);
    console.log(doc.Content);
    // 操作保存本地nedb chatRoomTask
    dispatch('nedb/AddChatRoomTask', doc, { root: true })
  },
  // sdk 获取群二维码 返回 PullChatRoomQrCodeTaskResultNotice
  PullChatRoomQrCodeTask({ commit }, message) {
    const msg = {
      Id: 1090,
      MsgType: 'PullChatRoomQrCodeTask',
      Content: {
        WeChatId: message.WeChatId, // 商家所属微信号
        ChatRoomId: message.UserName, // 群聊id
        taskId: generateTaskId().toString()
      }
    }
    commit('SEND_SOCK', msg)
  },
  // sdk 添加群成员到通讯录 返回 TaskResultNotice
  AddFriendInChatRoomTask({ commit, dispatch }, message) {
    const msg = {
      Id: 1214,
      MsgType: 'AddFriendInChatRoomTask',
      Content: {
        WeChatId: message.WeChatId, // 商家个人微信内部全局唯一识别码
        ChatroomId: message.ChatroomId, // 所在的群聊id
        FriendId: message.FriendId, // 请求加好友微信内部全局唯一识别码
        Message: message.Message, // 招呼语
        Remark: message.Remark, // 备注信息
        TaskId: generateTaskId().toString() // 任务Id
      }
    }
    commit('SEND_SOCK', msg)
    const doc = msg.Content
    // 操作保存本地nedb chatRoomTask
    dispatch('nedb/AddChatRoomTask', doc, { root: true })
  },
  // sdk 发红包 返回 TaskResultNotice
  SendLuckyMoneyTask({ commit }, message) {
    const sendTime = new Date().getTime()
    const taskId = sendTime * 10000 + Math.random() * 10000
    const content = {
      WeChatId: message.WeChatId, // 微信唯一Id
      FriendId: message.FriendId, // 聊天好友微信唯一id
      Money: message.Money, // 钱数，单位：分，最多20000
      Number: message.Number, // 红包个数，缺省1个
      Passwd: message.Passwd, // 密码，6位，纯数字
      Wish: message.Wish, // 祝福语
      TaskId: taskId // 任务id
    }
    const msg = {
      Id: 1217,
      MsgType: 'SendLuckyMoneyTask',
      Content: content
    }
    // 发送消息
    commit('SEND_SOCK', msg)
    // 消息保存本地nedb chats
    const doc = {}
    // 按收到的红包格式创建一个本地消息
    const redContent = {
      Title: message.Wish,
      Key: '',
      InvalidTime: ''
    }
    // 发红包的自定义的字段
    redContent.Money = message.Money
    doc.Content = base64.encode(JSON.stringify(redContent))
    doc.ContentType = 'LuckyMoney'
    doc.FriendId = message.FriendId
    doc.WeChatId = message.WeChatId
    doc.MsgId = taskId.toString()
    // doc.msgSvrId = friendId
    doc.CreateTime = sendTime.toString()
    doc.IsSend = true
    // dispatch('nedb/AddChats', doc, { root: true })

    // 插入luncMoney, 好友领红包的时候用到
    // doc.opened = 0
    // doc.InvalidTime = ''
    // doc.Key = ''
    // doc.Title = content.Wish
    // doc.SendId = ''
    //     this.$nedb.luckMoney.insert(
    //         doc,
    //         (err, newDoc) => { // Callback is optional
    //             if (err) return
    //         })
  },
  // sdk 转账 返回 TaskResultNotice
  RemittanceTask({ commit }, message) {
    const sendTime = new Date().getTime()
    const content = {
      WeChatId: message.WeChatId, // 微信唯一Id
      FriendId: message.FriendId, // 聊天好友微信唯一id
      Money: message.Money, // 钱数，单位：分
      Passwd: message.Passwd, // 密码，6位，纯数字
      Memo: message.Memo, // 留言
      TaskId: generateTaskId().toString() // 任务id
    }
    const msg = {
      Id: 1260,
      MsgType: 'RemittanceTask',
      Content: content
    }
    // 发送消息
    commit('SEND_SOCK', msg)

    // 消息保存本地nedb chats
    const doc = {}
    // 按收到的红包格式创建一个本地消息
    const redContent = {
      Title: message.Memo,
      Feedesc: '￥' + message.Money / 100,
      Key: '',
      PaySubType: 1,
      InvalidTime: ''
    }
    // 转账的自定义的字段
    doc.Content = base64.encode(JSON.stringify(redContent))
    doc.ContentType = 'MoneyTrans'
    doc.FriendId = message.FriendId
    doc.WeChatId = message.WeChatId
    doc.MsgId = content.TaskId
    // doc.msgSvrId = friendId
    doc.CreateTime = sendTime.toString()
    doc.IsSend = true
    // dispatch('nedb/AddChats', doc, { root: true })
  },

  // sdk 删除好友 返回 FriendDelNotice
  DeleteFriendTask({ commit }, message) {
    const content = {
      WeChatId: message.WeChatId, // 商家所属微信号
      FriendId: message.FriendId, // 要删除的微信号
      TaskId: generateTaskId().toString() // 任务Id
    }
    const msg = {
      Id: 1216,
      MsgType: 'DeleteFriendTask',
      Content: content
    }
    // 发送消息
    commit('SEND_SOCK', msg)
  },
  // sdk 同意加入群聊 返回 TaskResultNotice
  AgreeJoinChatRoomTask({ commit }, message) {
    const msg = {
      Id: 1229,
      MsgType: 'AgreeJoinChatRoomTask',
      Content: {
        WeChatId: message.WeChatId, // 商家个人微信内部全局唯一识别码
        Talker: message.Talker, // 邀请者
        MsgSvrId: message.MsgSvrId, // 邀请消息的msgSvrId
        MsgContent: message.MsgContent, // 回传邀请信息的内容（json）
        taskId: generateTaskId().toString()
      }
    }
    // 发送消息
    commit('SEND_SOCK', msg)
  },
  // sdk 推送公共号列表 返回 BizContactPushNotice
  TriggerBizContactPushTask({ commit, rootGetters }) {
    const msg = {
      Id: 1235,
      MsgType: 'TriggerBizContactPushTask',
      Content: {
        WeChatId: rootGetters['conversation/currentWeChatId'] // 微信唯一Id
      }
    }
    commit('SEND_SOCK', msg)
  }
}

// mutations
const mutations = {
  // 发送消息
  SEND_SOCK(state, agentData) {
    sendSock(agentData)
  }

}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
