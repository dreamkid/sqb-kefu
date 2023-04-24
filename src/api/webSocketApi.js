import base64 from '@/utils/base64.js'
import { sendSock } from '@/websocket/websocket'
import { generateTaskId } from '@/utils/util'
import store from '@/store'

/**
 * 备(手机客户端、客服客户端)获取通信token请求
 * 回调 DeviceAuthRsp
 * @param {String} userName 用户名
 * @param {String} password 密码
 */
export function DeviceAuthReq(userName, password) {
  const msg = {
    Id: 1010, // 非必须
    AccessToken: '', // 非必须
    MsgType: 'DeviceAuthReq',
    Content: {
      AuthType: 2,
      Credential: base64.encode(userName + ':' + password)
    }
  }
  sendSock(msg)
}

/**
 * 向服务端发心跳
 * @param {String} token token
 */
export function HeartBeatReq(token) {
  const msg = {
    Id: 1001,
    MsgType: 'HeartBeatReq',
    AccessToken: token,
    Content: {
      token: token
    }
  }
  sendSock(msg)
}

/**
 * 推送指定微信的会话列表
 * @param {String} wechatId 微信id
 * @param {Number} startTime 启始时间
 * @param {Number} endTime 结束时间
 * @param {Boolean} withName 推送头像和昵称
 * @param {Number} taskId 任务id
 * @returns ConversationPushNotice
 */
export function TriggerConversationPushTask(
  wechatId,
  name,
  account,
  startTime,
  endTime = 0,
  withName = true,
  taskId = ''
) {
  if (!startTime && startTime !== 0) {
    // 默认获取最近一个月的会话列表
    // startTime = 0
    startTime = new Date().getTime() - 3 * 24 * 3600 * 1000
  }
  const msg = {
    MsgType: 'TriggerConversationPushTask',
    Content: {
      WeChatId: wechatId,
      StartTime: startTime,
      EndTime: endTime,
      WithName: withName,
      FfNick: name,
      FfAccount: account,
      TaskId: taskId || generateTaskId()
    }
  }
  sendSock(msg)
  // 保存任务到本地
  store.commit('SET_TRIGGER_TASK', msg.Content)
}

/**
 * 触发手机推送好友列表任务
 * @param {String} wechatId 商家所属微信号
 * @param {Number} taskId 任务id
 * @returns FriendPushNotice
 * @returns ContactLabelInfoNotice
 */
export function TriggerFriendPushTask(wechatId, name, account, taskId = '') {
  const msg = {
    MsgType: 'TriggerFriendPushTask',
    Content: {
      WeChatId: wechatId,
      FfNick: name,
      FfAccount: account,
      TaskId: taskId || generateTaskId()
    }
  }
  sendSock(msg)
  // 保存任务到本地
  store.commit('SET_TRIGGER_TASK', msg.Content)
}

/**
 * 触发手机推送群聊列表
 * @param {String} wechatId 商家所属微信号
 * @param {Boolean} flag 是否推送成员信息
 * @param {Number} taskId 任务id
 * @returns ChatroomPushNotice
 * @returns ChatRoomMembersNotice
 */
export function TriggerChatroomPushTask(wechatId, name, account, flag = 1, taskId = '') {
  const msg = {
    MsgType: 'TriggerChatroomPushTask',
    Content: {
      WeChatId: wechatId,
      Flag: flag,
      FfNick: name,
      FfAccount: account,
      TaskId: taskId || generateTaskId()
    }
  }
  sendSock(msg)
  // 保存任务到本地
  store.commit('SET_TRIGGER_TASK', msg.Content)
}

/**
 * 查询手机状态
 * @param {String} wechatId 商家个人微信内部全局唯一识别码
 */
export function PhoneStateTask(wechatId) {
  const msg = {
    MsgType: 'PhoneStateTask',
    Content: { WeChatId: wechatId }
  }
  sendSock(msg)
}

/**
 * 通知手机推送聊天记录
 * @param {String} wechatId 所属微信号
 * @param {String} friendId 好友id, 置空表示全部好友
 * @param {Number} startTime 开始同步的消息时间，0表示全部,UTC毫秒
 * @param {Number} endTime 结束同步的消息时间，0表示到当前时间为止
 * @param {Number} count 单个会话获取的最多消息数
 * @param {Number} flag 获取全部时，0：只有好友， 1：只有群聊， 2：所有（好友和群聊）
 * @returns HistoryMsgPushNotice
 */
export function TriggerHistoryMsgPushTask(wechatId, friendId, name, account, startTime, endTime, count, flag) {
  const content = {
    WeChatId: wechatId,
    FriendId: friendId,
    FfNick: name,
    FfAccount: account
  }
  if (startTime) {
    content.StartTime = startTime
  }
  if (endTime) {
    content.EndTime = endTime
  }
  if (flag) {
    content.Flag = flag
  }
  if (count) {
    content.Count = count
  }
  const msg = {
    MsgType: 'TriggerHistoryMsgPushTask',
    Content: content
  }
  sendSock(msg)

  if (
    store.getters['conversation/currentWeChatId'] === wechatId &&
    store.getters['conversation/currentFriendId'] === friendId
  ) {
    store.commit('conversation/SET_RECORD_LOADING', true)
  }
}

/**
 * 请求图片或视频消息的详细内容
 * @param {String} wechatId 微信唯一Id
 * @param {String} friendId 聊天好友微信唯一id
 * @param {Number} msgId 全局消息id
 * @param {Number} msgSvrId 微信设备上消息唯一id(FriendTalkNotice中上传)
 * @param {String} md5 图片或视频md5(FriendTalkNotice中上传)
 * @param {Boolean} getOriginal  获取原图（获取接收到的图片消息的原图时置true，其他false）
 * @returns 成功 RequestTalkDetailTaskResultNotice
 * @returns 失败 TaskResultNotice
 */
export function RequestTalkDetailTask(
  wechatId,
  friendId,
  msgId,
  account,
  msgSvrId = '',
  md5 = '',
  getOriginal = false
) {
  const content = {
    WeChatId: wechatId,
    FriendId: friendId,
    MsgId: msgId,
    MsgSvrId: msgSvrId,
    Md5: md5,
    GetOriginal: getOriginal,
    FfAccount: account
  }
  const msg = {
    MsgType: 'RequestTalkDetailTask',
    Content: content
  }
  sendSock(msg)
}

/**
 * 给好友发消息任务
 * @param {String} wechatId 所属微信号
 * @param {String} friendId 发送给那个好友
 * @param {String} contentType 发送消息类型 Text Picture Voice Video Link File NameCard WeApp
 * @param {String} content 发送消息内容 文本，文件url，链接json，名片wxid
 * @param {String} remark 其他备注信息，群聊@别人；Quote（引用消息）：引用消息的msgSvrId字符串
 * @param {Number} msgId 发送给手机端的时候需要赋值，用于TalkToFriendTaskResultNotice中
 * @returns TalkToFriendTaskResultNotice
 */
export function TalkToFriendTask(
  wechatId,
  friendId,
  contentType,
  content,
  name,
  account,
  internalId,
  remark = '',
  msgId
) {
  const msgContent = {
    WeChatId: wechatId,
    FriendId: friendId,
    ContentType: contentType,
    Content: base64.encode(content),
    Remark: remark,
    MsgId: msgId || generateTaskId(),
    PrivateMsgId: internalId,
    FfNick: name,
    FfAccount: account
  }

  const msg = {
    MsgType: 'TalkToFriendTask',
    Content: msgContent
  }
  sendSock(msg)

  // 更新本地数据
  const doc = { ...msgContent }
  doc.CreateTime = new Date().getTime()
  doc.IsSend = true
  doc.LocalSend = true
  store.commit('conversation/ADD_CHAT', { ...doc, Content: content })
}

/**
 * 消息撤回
 * @param {String} weChatId 微信唯一Id
 * @param {String} friendId 聊天好友微信唯一id
 * @param {Number} msgSvrId 消息的msgSvrId
 * @param {Number} taskId 任务id
 * @returns TaskResultNotice
 */
export function RevokeMessageTask(weChatId, friendId, msgSvrId, taskId) {
  const msg = {
    Id: 1087,
    MsgType: 'RevokeMessageTask',
    Content: {
      WeChatId: weChatId,
      MsgId: msgSvrId, // 这里传MsgSvrId，传long类型，js中传字符串
      FriendId: friendId,
      TaskId: taskId || msgSvrId
    }
  }
  sendSock(msg)
}

/**
 * 获取加好友请求列表
 * @param {String} WeChatId 所属微信
 * @param {Number} StartTime 毫秒，0 则全部
 * @param {Boolean} OnlyNew 只获取未读的请求
 * @param {Boolean} GetAll 获取所有的加好友请求信息，包括已经添加的
 * @returns FriendAddReqListNotice
 */
export function PullFriendAddReqListTask(WeChatId, StartTime = 0, OnlyNew = false, GetAll = false) {
  const msg = {
    MsgType: 'PullFriendAddReqListTask',
    Content: {
      WeChatId: WeChatId,
      StartTime: StartTime,
      OnlyNew: OnlyNew,
      GetAll: GetAll
    }
  }
  sendSock(msg)
}

/**
 * 客户端或者服务端接受好友请求通知
 * @param {String} WeChatId 商家个人微信内部全局唯一识别码
 * @param {String} FriendId 请求的好友微信内部全局唯一识别码
 * @param {Number} Operation 处理结果 0忽略 1接受 2拒绝
 * @param {String} Remark 其他备注信息
 * @returns FriendAddNotice
 */
export function AcceptFriendAddRequestTask(WeChatId, FriendId, Operation = 1, Remark = '') {
  const msg = {
    MsgType: 'AcceptFriendAddRequestTask',
    Content: {
      WeChatId: WeChatId,
      FriendId: FriendId,
      Operation: Operation,
      Remark: Remark
    }
  }
  sendSock(msg)
}

/**
 * 获取指定好友朋友圈
 * @param {String} weChatId 所属微信
 * @param {String} friendId 获取好友的朋友圈,传空则返回所有人
 * @param {String} refSnsId 首次传0，获取下一页传上一页最后一条的snsid
 * @returns CirclePushNotice
 */
export function PullFriendCircleTask(weChatId, friendId, refSnsId) {
  const msg = {
    MsgType: 'PullFriendCircleTask',
    Content: {
      WeChatId: weChatId,
      FriendId: friendId,
      RefSnsId: refSnsId
    }
  }
  sendSock(msg)
}

/**
 * 触发手机推送朋友圈列表任务
 * @param {String} weChatId 所属微信
 * @param {Array} circleIds 朋友圈ids
 * @returns CirclePushNotice
 */
export function TriggerCirclePushTask(weChatId, circleIds) {
  const msg = {
    MsgType: 'TriggerCirclePushTask',
    Content: {
      WeChatId: weChatId,
      CircleIds: circleIds
    }
  }
  sendSock(msg)
}

/**
 * 单条朋友圈点赞任务
 * @param {String} weChatId 所属微信
 * @param {Number} circleId 所属朋友圈
 * @param {Boolean} isCancel 是否取消点赞
 * @param {Number} taskId 任务id
 * @returns TaskResultNotice
 */
export function CircleLikeTask(weChatId, circleId, isCancel, taskId) {
  const msg = {
    MsgType: 'CircleLikeTask',
    Content: {
      WeChatId: weChatId,
      CircleId: circleId,
      IsCancel: isCancel,
      TaskId: taskId || generateTaskId()
    }
  }
  sendSock(msg)
  store.commit('conversation/SET_CIRCLE_TASK', msg.Content)
}

/**
 * 朋友圈评论回复任务
 * @param {String} wechatId 所属微信
 * @param {Number} circleId 所属朋友圈
 * @param {String} commentContent 回复的内容
 * @param {String} toWeChatId 回复的好友
 * @param {Number} replyCommentId 回复的评论id
 * @returns CircleCommentReplyTaskResultNotice
 */
export function CircleCommentReplyTask(wechatId, circleId, commentContent, toWeChatId, replyCommentId) {
  const content = {
    WeChatId: wechatId,
    CircleId: circleId,
    Content: commentContent,
    TaskId: generateTaskId(), // 本地的评论表数据id （重发需要传递）
    IsResend: false // 是否是重发 （手机端忽略）
  }
  // 回复好友的评论
  if (toWeChatId && replyCommentId) {
    content.ToWeChatId = toWeChatId
    content.ReplyCommentId = replyCommentId
  }
  const msg = { MsgType: 'CircleCommentReplyTask', Content: content }
  sendSock(msg)
  store.commit('conversation/SET_CIRCLE_TASK', content)
}

/**
 * 朋友圈评论删除任务
 * @param {String} weChatId 所属微信
 * @param {Number} circleId 所属朋友圈
 * @param {Number} commentId 评论id
 * @returns CircleCommentDeleteTaskResultNotice
 */
export function CircleCommentDeleteTask(weChatId, circleId, commentId) {
  const msg = {
    MsgType: 'CircleCommentDeleteTask',
    Content: {
      WeChatId: weChatId,
      CircleId: circleId,
      CommentId: commentId,
      TaskId: generateTaskId()
    }
  }
  sendSock(msg)
  store.commit('conversation/SET_CIRCLE_TASK', msg.Content)
}

/**
 * 删除朋友圈
 * @param {String} weChatId 所属微信
 * @param {Number} circleId 朋友圈Id
 * @param {Number} taskId 任务Id
 * @return TaskResultNotice
 * @return CircleDelNotice
 */
export function DeleteSNSNewsTask(weChatId, circleId, taskId) {
  const content = {
    WeChatId: weChatId,
    CircleId: circleId,
    TaskId: taskId || generateTaskId().toString()
  }
  const msg = { MsgType: 'DeleteSNSNewsTask', Content: content }
  sendSock(msg)
}

/**
 * 获取朋友圈图片
 * @param {String} weChatId 所属微信
 * @param {Number} circleId 朋友圈Id
 * @param {Boolean} getBigMap 获取大图
 * @returns CircleDetailNotice
 */
export function PullCircleDetailTask(weChatId, circleId, getBigMap = false) {
  const msg = {
    MsgType: 'PullCircleDetailTask',
    Content: {
      WeChatId: weChatId,
      CircleId: circleId,
      GetBigMap: getBigMap
    }
  }
  sendSock(msg)
}

/**
 * 发送朋友圈任务
 * @param {String} WeChatId 商家所属微信号
 * @param {String} Content 发布的文案
 * @param {Object} Attachment 携带的图片、视频、链接等资源
 * @param {String} Comment 评论
 * @param {Array} ExtComment 多条评论
 * @param {Object} Visible 可见范围
 * @param {Object} Poi 位置信息
 * @param {Boolean} SendSlow 慢速发送，根据文案字数，最多耗时40秒
 * @param {Number} taskId 任务id 在TaskResult中回传
 * @returns PostSNSNewsTaskResultNotice
 * @returns CircleNewPublishNotice
 */
export function PostSNSNewsTask(
  WeChatId,
  Content,
  Attachment,
  Comment,
  ExtComment,
  Visible,
  Poi,
  SendSlow = false,
  taskId
) {
  const content = {
    WeChatId: WeChatId,
    Content: Content,
    Comment: Comment,
    ExtComment: ExtComment,
    Visible: Visible,
    SendSlow: SendSlow,
    TaskId: taskId || generateTaskId().toString()
  }
  if (Attachment) {
    content.Attachment = Attachment
  }
  if (Poi) {
    content.Poi = Poi
  }
  const msg = {
    MsgType: 'PostSNSNewsTask',
    Content: content
  }
  sendSock(msg)
}

/**
 * 触发朋友圈消息列表推送
 * @param {String} weChatId 商家所属微信号
 * @param {Boolean} onlyComment 缺省获取全部
 * @param {Boolean} getAll 缺省只获取未读消息
 * @returns CircleMsgPushNotice
 */
export function TriggerCircleMsgPushTask(weChatId, onlyComment = false, getAll = true) {
  const msg = {
    MsgType: 'TriggerCircleMsgPushTask',
    Content: {
      WeChatId: weChatId,
      OnlyComment: onlyComment,
      GetAll: getAll
    }
  }
  sendSock(msg)
}

/**
 * 清除已读的朋友圈消息
 * @param {String} WeChatId 所属微信
 * @param {Number} CircleId 所属朋友圈,传0为全部已读
 * @param {Number} CommentId 评论id
 */
export function CircleMsgClearTask(WeChatId, CircleId, CommentId) {
  const msg = {
    MsgType: 'CircleMsgClearTask',
    Content: {
      WeChatId: WeChatId,
      CircleId: CircleId,
      CommentId: CommentId
    }
  }
  sendSock(msg)
}

/**
 * 朋友圈消息已读
 * @param {String} WeChatId 所属微信
 * @param {Number} CircleId 所属朋友圈,传0为全部已读
 * @param {Number} CommentId 评论id
 */
export function CircleMsgReadTask(WeChatId, CircleId, CommentId) {
  const msg = {
    MsgType: 'CircleMsgReadTask',
    Content: {
      WeChatId: WeChatId,
      CircleId: CircleId,
      CommentId: CommentId
    }
  }
  sendSock(msg)
}

/**
 * 获取动画表情信息详情
 * @param {String} WeChatId 商家所属微信号
 * @param {String} Md5 获取某个emoji，传空获取全部
 * @param {Number} TaskId 任务id
 * @returns PullEmojiInfoTaskResultNotice
 */
export function PullEmojiInfoTask(WeChatId, Md5, TaskId = '') {
  const msg = {
    MsgType: 'PullEmojiInfoTask',
    Content: {
      WeChatId: WeChatId,
      Md5: Md5,
      TaskId: TaskId || generateTaskId()
    }
  }
  sendSock(msg)
  store.commit('SET_TRIGGER_TASK', msg.Content)
}

/**
 * 通知手机将某个聊天窗口置为已读
 * @param {String} WeChatId 所属微信号
 * @param {String} FriendId 好友id
 */
export function TriggerMessageReadTask(WeChatId, FriendId, account) {
  const msg = {
    MsgType: 'TriggerMessageReadTask',
    Content: {
      WeChatId: WeChatId,
      FriendId: FriendId,
      FfAccount: account
    }
  }
  sendSock(msg)
}

/**
 * 获取联系人详细信息（不一定是好友，如群聊成员）
 * @param {String} WeChatId 微信唯一Id
 * @param {String} Contact 联系人username
 * @param {Boolean} Contact 只返回本地信息，不打开详情页
 * @returns FriendAddNotice 获取指定好友的详情
 * @returns ChatRoomMembersNotice 获取群成员的详情
 */
export function RequestContactsInfoTask(WeChatId, Contact, account, ChatRoomId, Local = false) {
  const msg = {
    MsgType: 'RequestContactsInfoTask',
    Content: {
      WeChatId: WeChatId,
      Contact: Contact,
      ChatRoomId,
      FfAccount: account,
      Local: Local
    }
  }
  sendSock(msg)
}

/**
 * 请求具体群聊的详细信息
 * @param {String} WeChatId 商家所属微信号
 * @param {String} ChatRoomId 群聊id
 * @param {Boolean} Flag Flag=1:推送成员信息（ChatRoomMembersNotice)
 * @returns ChatRoomAddNotice 群的信息
 * @returns ChatRoomMembersNotice 群成员信息
 */
export function RequestChatRoomInfoTask(WeChatId, ChatRoomId, account, Flag = 1) {
  const msg = {
    MsgType: 'RequestChatRoomInfoTask',
    Content: {
      WeChatId: WeChatId,
      ChatRoomId: ChatRoomId,
      Flag: Flag,
      FfAccount: account
    }
  }
  sendSock(msg)
}

/**
 * 清粉任务
 * @param {String} WeChatId 微信id
 * @param {String} Message 消息内容（内容为空时发空名片，对方无感知；不为空则发送文本消息，对方能收到）
 * @param {Boolean} OnlyCheck false 检测到立即删除，true 不删除，通知到服务端
 * @param {Number} SkipHour 跳过多少小时内有互动的好友（聊天，朋友圈互动,上次已检测等），缺省72小时
 * @param {Number} Mode &01 不检测朋友圈 (废弃，改进后朋友圈检测效率提高）
 * @param {Number} Max 检测最大人数（不包括跳过检测的，配合SkipHour可以将整个清粉动作分成几天完成）
 * @param {BigInt} TaskId 清粉任务ID
 * @returns PostFriendDetectCountNotice
 */
export function PostFriendDetectTask(WeChatId, Message = '', OnlyCheck = false, SkipHour = 72, Mode, Max, TaskId = 0) {
  const msg = {
    Id: 1095,
    MsgType: 'PostFriendDetectTask',
    Content: {
      WeChatId: WeChatId,
      Message: Message,
      OnlyCheck: OnlyCheck,
      SkipHour: SkipHour,
      Mode: Mode,
      Max: Max,
      TaskId: TaskId || generateTaskId()
    }
  }
  sendSock(msg)
}

/**
 * 终止清粉任务
 * @param {String} WeChatId 微信id
 * @param {Number} TaskId 清粉任务ID
 * @returns TaskResultNotice
 */
export function PostStopFriendDetectTask(WeChatId, TaskId = 0) {
  const msg = {
    Id: 1096,
    MsgType: 'PostStopFriendDetectTask',
    Content: {
      WeChatId: WeChatId,
      TaskId: TaskId || generateTaskId()
    }
  }
  sendSock(msg)
}

/**
 * 获取最后一次清粉的结果
 * @param {String} WeChatId 微信id
 * @returns FriendDetectResultNotice
 */
export function GetFriendDetectResult(WeChatId) {
  const msg = {
    Id: 1279,
    MsgType: 'GetFriendDetectResult',
    Content: {
      WeChatId: WeChatId
    }
  }
  sendSock(msg)
}

/**
 * 查询红包
 * @param {String} WeChatId 所属微信号
 * @param {String} HbUrl 红包key
 * @returns QueryHbDetailTaskResultNotice
 */
export function QueryHbDetailTask(WeChatId, HbUrl) {
  const msg = {
    Id: 1265,
    MsgType: 'QueryHbDetailTask',
    Content: {
      WeChatId: WeChatId,
      HbUrl: HbUrl
    }
  }
  sendSock(msg)
}

/**
 * 打开红包或转账
 * @param {String} WeChatId 微信唯一Id
 * @param {String} FriendId 聊天好友微信唯一id
 * @param {String} MsgSvrId 全局消息id
 * @param {String} MsgKey 消息内容中的Key
 * @param {String} TaskId 任务id
 * @returns TakeMoneyTaskResultNotice
 */
export function TakeLuckyMoneyTask(WeChatId, FriendId, MsgSvrId, MsgKey, TaskId) {
  const msg = {
    Id: 1200,
    MsgType: 'TakeLuckyMoneyTask',
    Content: {
      WeChatId: WeChatId,
      FriendId: FriendId,
      MsgSvrId: MsgSvrId,
      MsgKey: MsgKey,
      TaskId: TaskId || generateTaskId()
    }
  }
  sendSock(msg)
}

/**
 * 消息设为未读
 * @param {String} WeChatId 微信唯一Id
 * @param {String} FriendId 聊天好友微信唯一id
 * @param {Number} TaskId 任务id
 * @returns TaskResultNotice
 */
export function TriggerUnReadTask(WeChatId, FriendId, TaskId) {
  const msg = {
    Id: 1281,
    MsgType: 'TriggerUnReadTask',
    Content: {
      WeChatId: WeChatId,
      FriendId: FriendId,
      TaskId: TaskId || generateTaskId()
    }
  }
  sendSock(msg)
}
