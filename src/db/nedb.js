import Nedb from 'nedb'
import path from 'path'

let baseUrl = '/'

if (process.env.VUE_APP_CURRENTMODE === 'electron') {
  const { remote } = window.require('electron')
  baseUrl = remote.app.getPath('userData')
}

/**
 * 微信的通讯录
 * @param {string} Avatar 好友头像
 * @param {string} City 城市
 * @param {string} Gender 性别
 * @param {string} Phone 电话
 * @param {string} Province 省市
 * @param {int} Type 联系人类型，判断是否为好友
 * @param {string} FriendNick 好友昵称
 * @param {string} FriendNo 微信别名 非必须
 * @param {string} Memo  机主的备注 非必须
 * @param {string} Remark 备注信息，一般内部使用比如，购物账号名称等等 非必须
 * @param {string} LabelIds 标签Id 非必须
 * @param {string} Phone 手机号 非必须
 * @param {string} Desc 描述 非必须
 * @param {string} FriendId 好友微信id
 * @param {string} WeChatId 绑定的微信id
 * @param {string} Page 页
 * @param {int} userId 用户 SupplierId +  UnionId
 */
const friends = new Nedb({
  autoload: true,
  filename: path.join(baseUrl, '/friends.db')
})

/**
 * 标签
 * @param {Array} Labels 标签
 * @param {string} WeChatId 绑定的微信id
 * @param {int} userId 用户 SupplierId +  UnionId
 */
const labels = new Nedb({
  autoload: true,
  filename: path.join(baseUrl, '/labels.db')
})

// ==========================群聊相关==================================

/**
 * 群聊列表
 * @param {string} Avatar 群头像
 * @param {Array} MemberList 群成员
 * @param {Array} ShowNameList 群昵称
 * @param {boolean} MsgSilent 免打扰
 * @param {string} NickName 群名
 * @param {string} Owner 群主
 * @param {string} Page 页
 * @param {string} UserName 群id
 * @param {string} WeChatId 绑定的微信id
 * @param {int} userId 用户 SupplierId +  UnionId
 */
const chatRooms = new Nedb({
  autoload: true,
  filename: path.join(baseUrl, '/chatRooms.db')
})

/**
 * 群聊成员
 * @param {string} Avatar 头像url
 * @param {string} Nickname 昵称
 * @param {int} Type 类型
 * @param {string} Wxid 陌生人ID
 * @param {string} WeChatId 所属微信
 * @param {int} userId 用户 SupplierId +  UnionId
 */
// const chatRoomMembers = new Nedb({
//     autoload: true,
//     filename: path.join(baseUrl, '/chatRoomMembers.db')
// })

/**
 * @param {Array} Members
 * @param {String} WeChatId
 * @param {String} userId
 */
const chatRoomMembers = new Nedb({
  autoload: true,
  filename: path.join(baseUrl, '/chatRoomMembers.db')
})

/**
 * 群行为任务表
 * @param {string} Content 具体内容
 * @param {int} Action 行为指令
 * @param {int} taskId 任务id
 * @param {string} WeChatId 绑定的微信id
 * @param {int} result 绑定的微信id 0默认 1成功 2失败
 * @param {int} userId 用户 SupplierId +  UnionId
 */
const chatRoomTask = new Nedb({
  autoload: true,
  filename: path.join(baseUrl, '/chatRoomTask.db')
})

/**
 * 群聊设置
 * @param {int} DoNotTouch 免打扰 1关闭 0开启
 * @param {int} SaveToAddress 保存到通讯录 0关闭 1开启
 * @param {int} SetInvitationConfirm 设置邀请进群确认 0关闭 1开启
 * @param {string} ChatRoomId 群id
 * @param {int} WeChatId 微信id
 * @param {int} userId 用户 SupplierId +  UnionId
 */
const chatRoomConfig = new Nedb({
  autoload: true,
  filename: path.join(baseUrl, '/chatRoomConfig.db')
})

// ==========================聊天相关==================================

/**
 * 聊天记录
 * @param {Any} Content 聊天内容
 * @param {string} ContentType 消息类型
 * @param {int} IsSend 是发送的 1:true 0:false
 * @param {string} FriendId 来自那个好友
 * @param {string} MsgId 消息id
 * @param {string} msgSvrId 消息的唯一id
 * @param {string} WeChatId 属于那个微信
 * @param {string} createTime 消息创建时间
 * @param {boolean} revoked 撤销
 * @param {boolean} TaskId 撤销id
 * @param {string} sendState 0 发送中 1 发送成功 2 发送失败
 * @param {int} userId 用户 SupplierId +  UnionId
 */
const chats = new Nedb({
  autoload: true,
  filename: path.join(baseUrl, '/chats.db')
})

// ============================================================================
// ============================================================================

/**
 * 添加好友记录
 * @param {string} WeChatId 微信的id
 * @param {string} IMEI 该值与WeChatId二选一, IMEI优先
 * @param {Array} Phones 要添加的手机号码，批量
 * @param {string} Remark 备注名
 * @param {string} message 发送的验证消息
 * @param {int} TaskId 任务Id
 * @param {int} userId 用户 SupplierId +  UnionId
 */
const addFriendTask = new Nedb({
  autoload: true,
  filename: path.join(baseUrl, '/addFriendTask.db')
})

/**
 * 自动接受好友请求配置文件
 * @param {boolean} open 是否开启
 * @param {Array} wechats 自动通过的微信的微信id
 * @param {string} remark 备注名
 * @param {Array} tags 标签
 * @param {boolean} seeCircle 是否看朋友圈
 * @param {int} userId 用户 SupplierId +  UnionId
 */
const autoAcceptConfig = new Nedb({
  autoload: true,
  filename: path.join(baseUrl, '/autoAcceptConfig.db')
})

/**
 * 僵尸粉
 * @param {int} Count 已检测的好友人数
 * @param {int} DelCount 已删除的好友人数
 * @param {int} SkipCount 跳过检测人数：设置时间内检测过，聊天过，朋友圈互动过
 * @param {boolean} IsFinished 是否清粉完毕
 * @param {Array} Zombies 僵尸粉id，未区分非好友和拉黑
 * @param {int} TaskId 所执行的任务ID
 * @param {string} WeChatId 商家个人微信内部全局唯一识别码
 * @param {int} userId 用户 SupplierId +  UnionId
 */
const zombies = new Nedb({
  autoload: true,
  filename: path.join(baseUrl, '/zombies.db')
})

// ============================================================================
// ============================================================================

/**
 * 群发日志
 * @param {sring} Content 群发的内容
 * @param {string} ContentType 群发的类型：文本或图片
 * @param {string} MsgType 接口
 * @param {Array} FriendIds 群发的好友的id
 * @param {string} WeChatId 发起群发的微信
 * @param {int} TaskId 人去id
 * @param {int} result 任务结果
 * @param {int} userId 用户 SupplierId +  UnionId
 */
const groupSendTask = new Nedb({
  autoload: true,
  filename: path.join(baseUrl, '/groupSendTask.db')
})

// ============================================================================
// ============================================================================

/**
 * 保存微信二维码
 * @param {string} WeChatId 微信的id
 * @param {string} QrCodeUrl 二维码地址
 * @param {int} ModifyTime 二维码生成的时间
 * @param {int} userId 用户 SupplierId +  UnionId
 */
const qrcode = new Nedb({
  autoload: true,
  filename: path.join(baseUrl, '/qrcode.db')
})

/**
 * 保存微信群二维码
 * @param {string} WeChatId 微信的id
 * @param {string} ChatRoomId 群聊的id
 * @param {string} QrCodeUrl 二维码地址
 * @param {int} ModifyTime 二维码生成的时间
 * @param {int} userId 用户 SupplierId +  UnionId
 */
// const chatRoomQrCode = new Nedb({
//     autoload: true,
//     filename: path.join(baseUrl, '/chatRoomQrCode.db')
// })

/**
 * 聊天详情表 大图 视频
 * @param {string} md5
 * @param {string} msgSvrId
 * @param {string} url
 * @param {string} userId
 */
const chatDetail = new Nedb({
  autoload: true,
  filename: path.join(baseUrl, '/chatDetail.db')
})

/**
 * 获取详情任务表
 * @param {string} MsgId taskId
 * @param {string} MsgSvrId 微信内部消息id
 * @param {string} Md5 md5
 * @param {boolean} GetOriginal 是否获取
 * @param {string} FriendId 好友id
 * @param {string} WeChatId 微信id
 * @param {string} contentType 消息类型： 2||3||8
 * @param {string} userId 当前用户
 */
const chatDetailTask = new Nedb({
  autoload: true,
  filename: path.join(baseUrl, '/chatDetailTask.db')
})

/**
 * 修改备注任务日志
 * @param {string} DelFlag 删除标志  1 删除备注 2 删除描述 4 删除号码；可组合
 * @param {string} Desc 描述
 * @param {string} Phone 电话号码
 * @param {string} Memo 备注
 * @param {string} FriendId 好友id
 * @param {string} WeChatId 微信id
 * @param {int} TaskId int 任务ID
 * @param {string} flag 任务类型 修改备注1 修改号码10 修改描述100 修改所有111 修改备注和号码11 修改备注和描述101 ...
 * @param {string} result 任务结果
 * @param {string} userId 当前用户
 */
const memoTask = new Nedb({
  autoload: true,
  filename: path.join(baseUrl, '/memoTask.db')
})

/**
 * 红包统计
 * @param {string} InvalidTime 失效时间
 * @param {string} Key 红包key
 * @param {string} Title 说句话
 * @param {string} ContentType 消息类型
 * @param {string} FriendId 好友id
 * @param {boolean} IsSend 是微信发给好友 1是 0false
 * @param {string} MsgId 手机维护的消息id
 * @param {string} taskId PC维护的消息id
 * @param {string} WeChatId 微信id
 * @param {string} createTime 消息创建事件
 * @param {int} Amount 金额
 * @param {string} msgSvrId 微信内部消息唯一id
 * @param {int} opened 获取红包结果 0失败 1成功
 * @param {string} userId 当前用户
 */
const luckMoney = new Nedb({
  autoload: true,
  filename: path.join(baseUrl, '/luckMoney.db')
})

const findContactTask = new Nedb({
  autoload: true,
  filename: path.join(baseUrl, '/findContactTask.db')
})

export default {
  friends,
  labels,
  chatRooms,
  chatRoomTask,
  chatRoomConfig,
  chatRoomMembers,
  chats,
  chatDetail,
  chatDetailTask,
  memoTask,
  luckMoney,
  qrcode,
  addFriendTask,
  zombies,
  autoAcceptConfig,
  groupSendTask,
  findContactTask
}
