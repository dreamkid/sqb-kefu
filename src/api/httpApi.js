/* eslint-disable camelcase */
/**
 * http后端接口
 */

import fetch from '@/utils/fetch'
import { generateTaskId } from '@/utils/util'

/**
 * SOP加好友
 * @param {Number} cid admin id
 * @param {Number} accountid 账号id
 * @param {String} execute_time 执行时间
 * @param {Number} between_time 间隔时间
 * @param {Object} config 每个微信号加的数量
 * @param {Number} sayhellosize 打招呼次数
 * @param {String} message 描述 非必传
 * @param {String} remarks 备注
 */
export function autoFriendAddTask(cid, accountid, execute_time, between_time, config, sayhellosize, message, remarks) {
  return fetch.postJson('/pc/AutoFriendAddTask', {
    cid: cid,
    accountid: accountid,
    execute_time: execute_time,
    between_time: between_time,
    wechatConfig: config,
    sayhellosize: sayhellosize,
    message: message,
    remarks: remarks
  })
}

/**
 * 获取微信列表（弃用）
 * @param {Number} unionId 用户的unionId
 */
export function GetWeChatsReq(unionId) {
  return fetch.post('/pc/GetWeChatsReq', { id: unionId })
}
/**
 * 获取微信列表（新）
 * @param {Number} unionId 用户的unionId
 */
 export function getWeChatList(params) {
  return fetch.get('/optimuscore/wechat/getWeChatList', params)
}
/**
 * 获取公共标签
 * @param {Number} uionId 用户id
 */
export function getCommonTags(uionId) {
  return fetch.post('/pc/GetCommonTags', { id: uionId, name: 'pc' })
}

/**
 * 获取公共话术
 * @param {Number} uionId 用户id
 */
export function getCommonTerms(uionId) {
  return fetch.post('/pc/GetCommonTerms', { id: uionId, name: 'pc' })
}

/**
 * 定时任务
 * @param {Object} message 参数太多以{}的方式传参
 */
export function addTaskTimeInfo(message = {}) {
  const { ...content } = message
  // for (const key in message) {
  //   if (message.hasOwnProperty(key)) {
  //     content[key] = message[key]
  //   }
  // }
  content.TaskId = generateTaskId()
  return fetch.post('/pc/AddTaskTimeInfo', content)
}

/**
 * 查询定时任务的结果
 * @param {Number} cid 登录下发下来的supplierid
 * @param {Number} accountid 登录的时候已经下发unionid
 * @param {Number} page 当前第几页 从1开始
 * @param {Number} rows 每页多少条
 * @param {Number} tasktype 非必传 1PC群发消息 2PC发朋友圈 5群发群消息 6批量加好友
 * @param {Number} state 非必传 状态1开启中 0已完成
 */
export function getTaskInfoList(cid, accountid, page, rows, tasktype = '', state = '') {
  return fetch.post('/pc/GetTaskInfoList', {
    cid: cid,
    accountid: accountid,
    tasktype: tasktype,
    state: state,
    page: page,
    rows: rows
  })
}

/**
 * 定时任务详情统计
 * @param {Number} id 定时主任务id
 */
export function getTaskDetail(id) {
  return fetch.post('/pc/TaskDetail', {
    id: id
  })
}

/**
 * 定时任务状态更改接口
 * @param {Number} id 定时主任务id
 * @param {Number} state  状态   -1暂停     1开启中     0已完成       2取消
 */
export function updateTaskState(id, state) {
  return fetch.post('/pc/TaskStateUpdate', {
    id: id,
    state: state
  })
}

/**
 * 删除定时任务
 * @param {Number} id 定时任务id
 */
export function taskDelete(id) {
  return fetch.post('/pc/TaskDelete', {
    id: id
  })
}

/**
 * 查询号码
 * @param {String} wechatid 微信id
 * @param {String} phonenumber 电话号码
 * @param {String} begin_time 开始时间
 * @param {String} end_time 结束时间
 * @param {Number} pageNo 页码
 * @param {Number} pageSize 每页数据量
 */
export function getPhoneNumberList(wechatid, phonenumber, begin_time, end_time, pageNo, pageSize) {
  return fetch.post('/pc/GetPhoneNumberList', {
    wechatid: wechatid,
    phonenumber: phonenumber,
    begin_time: begin_time,
    end_time: end_time,
    pageNo: pageNo,
    pageSize: pageSize
  })
}

/**
 * 获取自动任务的配置文件
 * @param {String} cid 登录下发下来的supplierid
 * @param {String} wechatId 微信id
 */
export function autoTaskDetailList(cid, wechatId) {
  return fetch.post('/pc/AutoTaskDetailList', { cid: cid, wechatId: wechatId })
}

/**
 * 更新自动任务的配置文件
 * @param {Number} cid 登录下发下来的supplierid
 * @param {String} wechatId 微信id
 * @param {Number} auto_type  1001:自动抢红包 1002:自动通过好友请求 1003:自动通过群邀请链接请求
 * @param {Number} state  0是开启, 其他表示关闭
 * @param {String} remarks 自动回复的内容
 */
export function autoTaskUpdate(cid, wechatId, auto_type, state, remarks) {
  return fetch.post('/pc/AutoTaskUpdate', {
    cid: cid,
    wechatId: wechatId,
    auto_type: auto_type,
    state: state,
    remarks: remarks
  })
}

/**
 * 获取加好友任务列表
 * @param {Number} cid 登录下发下来的supplierid
 * @param {Number} accountid 用户的UnionId
 * @param {Number} state
 * @param {Number} page
 * @param {Number} rows
 */
export function getAutoFriendAddTaskList(cid, accountid, state, page, rows) {
  return fetch.post('/pc/GetAutoFriendAddTaskList', {
    cid: cid,
    accountid: accountid,
    state: state,
    page: page,
    rows: rows
  })
}

/**
 * 删除sop任务
 * @param {Number} id 任务id
 */
export function friendAddTaskDelete(id) {
  return fetch.post('/pc/FriendAddTaskDelete', { id: id })
}

/**
 * 更新sop任务
 * @param {Number} id 任务id
 * @param {Number} 任务状态  -1暂停 1开启中 0已完成 2取消
 */
export function friendAddTaskStateUpdate(id, state) {
  return fetch.post('/pc/FriendAddTaskStateUpdate', { id: id, state: state })
}

/**
 * 查询关键词自动回复
 * @param {Number} cid 登录下发下来的supplierid
 * @param {String} wechatid 微信id
 * @param {String} keyWord 关键词
 * @param {Number} keyType 0精准完全匹配  1模糊包含匹配
 * @param {Number} resourceType 消息类型 1文字 2图片 3语音 4视频
 * @param {Number} page 必传
 * @param {Number} rows 必传
 */
export function getAutoReplyList(cid, wechatid, keyWord, keyType, resourceType, page, rows) {
  return fetch.post('/user/keyWords/pageList', {
    cid: cid,
    wechatid: wechatid,
    keyWord: keyWord,
    keyType: keyType,
    resourceType: resourceType,
    page: page,
    rows: rows
  })
}

/**
 * 添加关键词回复
 * @param {Number} cid 登录下发下来的supplierid
 * @param {String} wechatid 微信id
 * @param {String} keyWord 关键词
 * @param {Number} keyType 关键词类型 0精准完全匹配  1模糊包含匹配
 * @param {Number} resourceType 消息类型 1文字 2图片 3语音 4视频
 * @param {String} returnString 回复内容
 */
export function addReply(cid, wechatid, keyWord, keyType, resourceType, returnString) {
  return fetch.post('/user/keyWords/add', {
    cid: cid,
    wechatid: wechatid,
    keyWord: keyWord,
    keyType: keyType,
    resourceType: resourceType,
    returnString: returnString
  })
}

/**
 * 修改关键词回复
 * @param {Number} id 回复的id
 * @param {Number} cid 登录下发下来的supplierid
 * @param {String} wechatid 微信id
 * @param {String} keyWord 关键词
 * @param {Number} keyType 关键词类型 0精准完全匹配  1模糊包含匹配
 * @param {Number} resourceType 消息类型 1文字 2图片 3语音 4视频
 * @param {String} returnString 回复内容
 */
export function updateReply(id, cid, wechatid, keyWord, keyType, resourceType, returnString) {
  return fetch.post('/user/keyWords/update', {
    id: id,
    cid: cid,
    wechatid: wechatid,
    keyWord: keyWord,
    keyType: keyType,
    resourceType: resourceType,
    returnString: returnString
  })
}

/**
 * 删除关键词回复
 * @param {String} ids 单条传id,如“12”；多条传id字符串，如“12,34”
 */
export function deleteReply(ids) {
  return fetch.post('/user/keyWords/deletes', {
    ids: ids
  })
}

/**
 * 素材库列表查询
 * @param {Number} cid 用户的supplierid
 * @param {Number} pageNo 页
 * @param {Number} pageSize size
 * @param {Number} type 消息类型 null:所有，1：群发，2：朋友圈
 * @param {String} content 内容
 */
export function resourcesList(type, groupId) {
  return fetch.post('/material/getAllMaterialListByType', {
    type,
    groupId
  })
}

/**
 * 删除素材
 * @param {String} ids 单条传id,如“12”；多条传id字符串，如“12,34”
 */
export function deleteResources(ids) {
  return fetch.post('/user/resources/deletes', {
    ids: ids
  })
}

/**
 * 添加素材
 * @param {String} cid 用户的supplierid
 * @param {String} content 素材的内容
 * @param {Number} type 1:群发 2:朋友圈 3:链接 4:小程序 5:emoji
 * @param {String} remarks 备注
 */
export function addResources(cid, content, type, remarks = '') {
  return fetch.post('/user/resources/add', {
    cid: cid,
    content: content,
    type: type,
    remarks: remarks
  })
}

/**
 * 更新素材
 * @param {Number} id 素材id
 * @param {Number} cid 用户的supplierid
 * @param {Number} type 1:群发 2 朋友圈
 * @param {String} content 素材的内容
 * @param {String} remarks 备注
 */
export function updateResources(id, cid, type, content, remarks = '') {
  return fetch.post('/user/resources/update', {
    id: id,
    cid: cid,
    type: type,
    content: content,
    remarks: remarks
  })
}

/**
 * 收款红包统计数据
 * @param {Number} cid 客户id 必传
 * @param {Number} type 0红包  1转账 选填
 * @param {String} start 开始时间 必传   格式yyyy-MM-dd
 * @param {String} end 结束时间 必传   格式yyyy-MM-dd
 */
export function quertLouckyMoneyData(cid, type = '', start, end) {
  return fetch.post('/user/data/luckyMoneyTongji', {
    cid: cid,
    type: type,
    start: start,
    end: end
  })
}

/**
 * 收款详情数据
 * @param {Number} cid 客户id 必传
 * @param {Number} type 0红包  1转账 选填
 * @param {String} wechatid wechatid 必传
 * @param {String} start 开始时间 必传 格式yyyy-MM-dd
 * @param {String} end 结束时间 必传 格式yyyy-MM-dd
 */
export function quertLouckyMoneyDetail(cid, type = '', wechatid, start, end) {
  return fetch.post('/user/data/luckyMoneyDetail', {
    cid: cid,
    type: type,
    wechatid: wechatid,
    start: start,
    end: end
  })
}

//------------------------------------------------------------素材---------------------
export function materialGroupGet(type) {
  return fetch.post('/material/getMaterialGroupListByType', {
    type
  })
}
export function allMaterialGet(params) {
  return fetch.postJson('/api/resource/listByType', params)
}
export function webAppAdd(groupId, webApp) {
  return fetch.post('/material/addMiniprogramMaterial', {
    groupId,
    ...webApp
  })
}

export function userInfoGet(memberWxId, deviceWxId) {
  return fetch.post('/work/customer/searchQwWorkCustomerByMemberWxId', {
    memberWxId,
    deviceWxId
  })
}
export function tagGroupGet() {
  return fetch.get('/scrm/LabelSet/labelCascade')
}
export function tagContentGet(id, name) {
  return fetch.get('/scrm/LabelSet/querylabel', { id, name })
}
export function tagAdd(insetType, labelIds, id) {
  return fetch.post('/work/customer/insertLabelCustomer', { insetType, labelIds, id })
}
export function gridDataGet(userId) {
  return fetch.post('/work/customer/getGridCode', { userId })
}
export function gridInfoGet(userId) {
  return fetch.post('/work/user/searchGridCode', { userId })
}
export function gridInfoSet(userId, gridCode, gridName) {
  return fetch.post('/work/user/insertGridCode', { userId, gridCode, gridName })
}

export function checkPass(params) {
  return fetch.postJson('/pc/friendAddPass', params)
}

export function getNewFriendApi(wxId) {
  return fetch.postJson('/pc/listAddFriend2Log', { wxId })
}
export function getNewAddFriendApi(wxId) {
  return fetch.postJson('/pc/listAddFriend1Log', { wxId })
}

export function weChatStatusGetApi(wechat, loginType) {
  return fetch.get('/wechat/v1/wecatstatus', { wechat, loginType })
}

export function weChatStatusSaveApi(wechatId, isOnline) {
  return fetch.post('/pc/account-status-change', { wechatId, isOnline })
}
export function getVersionApi() {
  return fetch.postJson('/pc/getLastVersion')
}

//--------------------------------------------------------------------
export function wordGroupGetApi(wxId, account) {
  return fetch.get('/pc/talk-group', {
    wxId,
    account
  })
}
export function wordGetApi(wxId, groupId, account) {
  return fetch.get('/pc/talk-info', {
    wxId,
    groupId,
    account
  })
}

export function wordGroupSaveApi(account, wxId, groupName, groupId) {
  return fetch.postJson('/pc/save-talk-group', {
    wxId,
    groupName,
    groupId,
    account
  })
}
export function wordSaveApi(word) {
  return fetch.postJson('/pc/save-talk-info', word)
}

export function wordRemoveApi(params) {
  return fetch.postJson('/pc/deleteTalkWords', params)
}
export function wordGroupRemoveApi(params) {
  return fetch.postJson('/pc/deleteTalkGroup', params)
}

export function handleInternalApi(params) {
  return fetch.postJson('/pc/privateMsgEnable', params)
}
export function getInternalApi(params) {
  return fetch.get('/pc/queryPrivateMsgLog', params)
}

export function getSupportListApi(params) {
  return fetch.get('/pc/supportCustomerList', params)
}
export function supportApi(params) {
  return fetch.postJson('/pc/noticeSupportCustomer', params)
}
export function supportPostApi(params) {
  return fetch.postJson('/api/customer-support/request', params)
}
export function getCurrentInternalApi(params) {
  return fetch.get('/pc/queryPrivateHistoryMsgPushNotice', params)
}

export function getChatRecordTotalApi(params) {
  return fetch.get('/pc/countByWeChatId', params)
}
export function membersGetApi(params) {
  return fetch.postJson('/pc/listByChatRoomId', params)
}

export function setSaveApi(params) {
  return fetch.postJson('/pc/saveSystemConfig', params)
}

export function setSaveSystemApi(params){
    return fetch.put('/optimuscore/customer/updateCustomerConfig',params)
}

export function versionGetApi(params) {
  return fetch.get('/api/project-version/getCustomerLastVersion', params)
}

export function shieldApi(params) {
  return fetch.postJson('/api/shield-user/shieldFriendMsg', params)
}
export function cancelShieldApi(params) {
  return fetch.postJson('/api/shield-user/batchCancelShield', params)
}
//屏蔽群成员
export function shieldUserApi(params) {
  return fetch.postJson('optimuscore/customer/addCustomerShield', params)
}
//获取群屏蔽列表
export function getGroupShieldList(params) {
  return fetch.get('optimuscore/customer/getCustomerShieldList', params)
}
//取消屏蔽
export function deleteShieldUserApi(params) {
  return fetch.delete('optimuscore/customer/deleteCustomerShield', params)
}
export function friendDetailsApi(params) {
  return fetch.postJson('/api/wx-friend-circle/refuseSns', params)
}
export function friendLikeApi(params) {
  return fetch.postJson('/api/wx-friend-circle/zanSns', params)
}
export function friendCommentApi(params) {
  return fetch.postJson('/api/wx-friend-circle/commentSns', params)
}

export function userInfoBindApi(params) {
  return fetch.postJson('/community-docking-config/bindCustomer', params)
}
