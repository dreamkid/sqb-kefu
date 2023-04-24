/**
 * 营销手机接口
 */

import fetch from '@/utils/fetch'

/**
 * 登录
 * @param {string} account 账号
 * @param {string} password 密码
 */
export function login(account, password) {
  return fetch.post('/user/login', { account: account, password: password })
}

/**
 * 修改密码
 * @param {string} newpwd 新密码
 * @param {string} oldpwd 老密码
 * @param {number} userid 用户id
 */
export function editPassword(userid, oldpwd, newpwd) {
  return fetch.post('/user/pwdedit', { userid: userid, oldpwd: oldpwd, newpwd: newpwd })
}

// =============================================================

/**
 * 按cid查询所有客服账号
 * @param {number} cid 管理员的cid
 */
export function queryAccountsByCid(cid) {
  return fetch.post('/user/account/queryByCid', { cid: cid })
}

/**
 * 分页搜索查询账户
 * @param {number} cid 管理员的cid
 * @param {string} account 账号名称
 * @param {number} page 页码
 * @param {number} rows 每页数据量
 */
export function queryAccounts(cid, account, page, rows) {
  return fetch.post('/user/account/pageList', { cid: cid, account: account, page: page, rows: rows })
}

/**
 * 查询账户数据
 * @param {number} id 账号的id
 */
export function queryAccountsById(id) {
  return fetch.post('/user/account/queryById', { id: id })
}

/**
 * 添加账户
 * @param {string} account 账号名称
 * @param {string} password 密码
 * @param {string} nickname 昵称
 * @param {number} cid SupplierId （商户id）
 * @param {number} state 账号状态1正常2禁用
 * @param {number} level 账号等级
 */
export function addAccount(account, password, nickname, cid, state, level) {
  return fetch.post('/user/account/add', {
    account: account,
    password: password,
    nickname: nickname,
    cid: cid,
    state: state,
    level: level
  })
}

/**
 * 编辑账号
 * @param {number} id 账号id
 * @param {string} account 账号名称
 * @param {string} password 密码
 * @param {string} nickname 昵称
 * @param {number} cid SupplierId （商户id）
 * @param {number} state 账号状态1正常2禁用
 * @param {number} level 账号等级
 */
export function updateAccount(id, account, password, nickname, cid, state, level) {
  return fetch.post('/user/account/update', {
    id: id,
    account: account,
    password: password,
    nickname: nickname,
    cid: cid,
    state: state,
    level: level
  })
}

/**
 * 删除账户
 * @param {*} ids 要删除的ids '11,12'
 */
export function deleteAccounts(ids) {
  return fetch.post('/user/account/deletes', { ids: ids })
}

// =============================================================

/**
 * 分页搜索查询标签
 * @param {number} cid 必传
 * @param {string} name
 * @param {number} page 必传
 * @param {number} rows 必传
 */
export function queryCommonTags(cid, name, page, rows) {
  return fetch.post('/user/commontag/pageList', { cid: cid, name: name, page: page, rows: rows })
}

/**
 * 删除公共标签
 * @param {string} ids 要删除的标签id
 */
export function deleteCommonTags(ids) {
  return fetch.post('/user/commontag/deletes', { ids: ids })
}

/**
 * 添加标签
 * @param {number} cid
 * @param {string} name 标签名
 */
export function addCommonTag(cid, name) {
  return fetch.post('/user/commontag/add', { cid: cid, name: name })
}

/**
 * 修改标签
 * @param {number} id 标签id
 * @param {number} cid 管理员的cid
 * @param {string} name 标签名
 */
export function updateCommonTag(id, cid, name) {
  return fetch.post('/user/commontag/update', { id: id, cid: cid, name: name })
}

// =============================================================

/**
 * 分页查询版本
 * @param {number} cid 管理员的cid
 * @param {string} version 版本名称
 * @param {number} vernumber 版本号
 * @param {string} packagename 包名
 * @param {number} flag 是否可用
 * @param {number} page 页码
 * @param {number} rows 数据量
 */
export function queryVersion(cid, version, vernumber, packagename, flag, page, rows) {
  return fetch.post('/user/version/pageList', {
    cid: cid,
    version: version,
    vernumber: vernumber,
    packagename: packagename,
    flag: flag,
    page: page,
    rows: rows
  })
}

/**
 * 删除版本
 * @param {string} ids
 */
export function deleteVersion(ids) {
  return fetch.post('/user/version/deletes', { ids: ids })
}

/**
 * 添加版本
 * @param {number} cid 必传
 * @param {string} version 版本名称
 * @param {number} vernumber 版本号
 * @param {string} packagename 包名
 * @param {string} packageurl 安装包url
 */
export function addVersion(cid, version, vernumber, packagename, packageurl) {
  return fetch.post('/user/version/add', {
    cid: cid,
    version: version,
    vernumber: vernumber,
    packagename: packagename,
    packageurl: packageurl
  })
}

/**
 * 修改版本信息
 * @param {*} id 版本id
 * @param {*} cid 管理员的cid
 * @param {*} version 版本名称
 * @param {*} vernumber 版本号
 * @param {*} packagename 包名
 * @param {*} packageurl 安装包url
 */
export function updateVersion(id, cid, version, vernumber, packagename, packageurl) {
  return fetch.post('/user/version/update', {
    id: id,
    cid: cid,
    version: version,
    vernumber: vernumber,
    packagename: packagename,
    packageurl: packageurl
  })
}

/**
 * 推送更新
 * @param {*} id 版本id
 */
export function pushVersion(id) {
  return fetch.post('/user/version/push', { id: id })
}

// =============================================================

/**
 * 分页搜索查询术语
 * @param {number} cid 必传
 * @param {string} name 术语标题
 * @param {number} tid 术语分组id
 * @param {number} ctype 1文本类型 2图片类型 3视频类型 4语音类型 5其他文件类型
 * @param {number} page 必传
 * @param {number} rows 必传
 */
export function queryReplies(cid, name, tid, ctype, page, rows) {
  return fetch.post('/user/commonterm/pageList', {
    cid: cid,
    name: name,
    tid: tid,
    ctype: ctype,
    page: page,
    rows: rows
  })
}

/**
 * 删除术语
 * @param {string} ids
 */
export function deleteReplies(ids) {
  return fetch.post('/user/commonterm/deletes', { ids: ids })
}

/**
 * 添加术语
 * @param {number} cid
 * @param {number} tid 所属分组
 * @param {string} name 标题
 * @param {number} ctype 1文本类型 2图片类型 3视频类型 4语音类型 5其他文件类型
 * @param {string} content 内容
 */
export function addReply(cid, tid, name, ctype, content) {
  return fetch.post('/user/commonterm/add', {
    cid: cid,
    tid: tid,
    name: name,
    ctype: ctype,
    content: content
  })
}

/**
 * 更新术语
 * @param {number} id
 * @param {number} cid
 * @param {number} tid 所属分组
 * @param {string} name 标题
 * @param {number} ctype 1文本类型 2图片类型 3视频类型 4语音类型 5其他文件类型
 * @param {string} content 内容
 */
export function updateReply(id, cid, tid, name, ctype, content) {
  return fetch.post('/user/commonterm/update', {
    id: id,
    cid: cid,
    tid: tid,
    name: name,
    ctype: ctype,
    content: content
  })
}

/**
 * 分页搜索查询术语分组
 * @param {number} cid 必传
 * @param {string} name
 * @param {number} page 必传
 * @param {number} rows 必传
 */
export function queryReplyTypes(cid, name, page, rows) {
  return fetch.post('/user/commontermtype/pageList', { cid: cid, name: name, page: page, rows: rows })
}

/**
 * 查询所有术语分组
 * @param {*} cid
 */
export function queryReplyTypesByCid(cid) {
  return fetch.post('/user/commontermtype/queryByCid', { cid: cid })
}

/**
 * 删除术语分组
 * @param {string} ids
 */
export function deleteReplyGroup(ids) {
  return fetch.post('/user/commontermtype/deletes', { ids: ids })
}

/**
 * 添加术语分组
 * @param {number} cid 管理员的cid
 * @param {string} name 名称
 */
export function addReplyGroup(cid, name) {
  return fetch.post('/user/commontermtype/add', { cid: cid, name: name })
}

/**
 * 更新术语分组
 * @param {number} id 术语分组id
 * @param {number} cid 管理员的cid
 * @param {string} name 名称
 */
export function updateReplyGroup(id, cid, name) {
  return fetch.post('/user/commontermtype/update', { id: id, cid: cid, name: name })
}

// =============================================================

/**
 * 查询消息记录
 * @param {number} cid 管理员的cid
 * @param {string} wechatid 微信id
 * @param {string} friendid 好友的微信id
 * @param {string} issend true发送的消息 false收到的消息
 * @param {string} contenttype 消息类型，具体对应proto文件
 * @param {number} type 0聊天消息  1群消息
 * @param {number} page 必传
 * @param {number} rows 必传
 * @param {String} start 开始时间
 * @param {String} end 结束时间
 */
export function queryMessages(cid, wechatid, friendid, issend, contenttype, type, page, rows, start, end) {
  const queryData = {
    cid: cid,
    wechatid: wechatid,
    friendid: friendid,
    issend: issend,
    contenttype: contenttype,
    type: type,
    page: page,
    rows: rows,
    start: start,
    end: end
  }
  return fetch.post('/user/messages/pageList', queryData)
}

/**
 * 删除消息记录
 * @param {string} ids
 */
export function deleteMessages(ids) {
  return fetch.post('/user/messages/deletes', { ids: ids })
}

/**
 * 通话记录分页搜索查询
 * @param {number} cid 必传
 * @param {string} number 电话号码
 * @param {number} type
 * @param {string} content
 * @param {string} record
 * @param {string} imei 设备号
 * @param {number} page 必传
 * @param {number} rows 必传
 */
export function queryCallLog(cid, number, type, content, record, imei, page, rows) {
  const queryData = {
    cid: cid, // 必传
    number: number,
    type: type,
    content: content,
    record: record,
    imei: imei,
    page: page, // 必传
    rows: rows // 必传
  }
  return fetch.post('/user/call/pageList', queryData)
}

/**
 * 短信记录分页搜索查询
 * @param {number} cid
 * @param {string} number 电话号码
 * @param {number} type 发送状态
 * @param {string} content 短信内容
 * @param {string} read 阅读状态 true已读 false未读
 * @param {number} page
 * @param {number} rows
 */
export function queryShortMessage(cid, number, type, content, read, page, rows) {
  const queryData = {
    cid: cid, // 必传
    number: number,
    type: type,
    content: content,
    readz: read,
    page: page, // 必传
    rows: rows // 必传
  }
  return fetch.post('/user/sms/pageList', queryData)
}

// =============================================================

/**
 * 分页搜索查询客户信息
 * @param {string} suppliername 客户名称
 * @param {string} admin 管理员账号
 * @param {number} page 必传
 * @param {number} rows 必传
 */
export function queryCustomers(suppliername, admin, page, rows) {
  return fetch.post('/admin/customer/pageList', { suppliername: suppliername, admin: admin, page: page, rows: rows })
}

/**
 * 添加客户
 * @param {string} suppliername 客户名称
 * @param {number} account_num 最大账号数量
 * @param {number} device_num 最大设备数量
 * @param {string} validity 服务期限
 * @param {number} state 客户状态 1正常 2禁用
 * @param {string} admin 管理员账号
 * @param {string} contact 联系人姓名
 * @param {string} phone 联系人电话
 * @param {string} description 备注信息
 */
export function addCustomer(
  suppliername,
  account_num,
  device_num,
  validity,
  state,
  admin,
  contact,
  phone,
  description
) {
  const addParameter = {
    suppliername: suppliername,
    account_num: account_num,
    device_num: device_num,
    validity: validity,
    state: state,
    admin: admin,
    contact: contact,
    phone: phone,
    description: description
  }
  return fetch.post('/admin/customer/add', addParameter)
}

/**
 * 更新客户信息
 * @param {number} id 客户id
 * @param {string} suppliername 客户名称
 * @param {number} account_num 最大账号数量
 * @param {number} device_num 最大设备数量
 * @param {string} validity 服务期限
 * @param {number} state 客户状态
 * @param {string} admin 管理员账号
 * @param {string} contact 联系人姓名
 * @param {string} phone 联系人电话
 * @param {string} description 备注信息
 */
export function updateCustomer(
  id,
  suppliername,
  account_num,
  device_num,
  validity,
  state,
  admin,
  contact,
  phone,
  description
) {
  const updateParameter = {
    id: id,
    suppliername: suppliername,
    account_num: account_num,
    device_num: device_num,
    validity: validity,
    state: state,
    admin: admin,
    contact: contact,
    phone: phone,
    description: description
  }
  return fetch.post('/admin/customer/update', updateParameter)
}

/**
 * 删除客户
 * @param {string} ids 客户的id
 */
export function deleteCustomers(ids) {
  return fetch.post('/admin/customer/deletes', { ids: ids })
}

// =============================================================
/**
 * 数据统计
 * @param {number} cid
 */
export function queryDataTongJi(cid) {
  return fetch.post('/user/data/tongji', { cid: cid })
}

/**
 * 数据统计报表
 * @param {number} cid 必传
 * @param {Date} start 开始日期时间戳，必传
 * @param {Date} end 结束日期时间戳，必传
 */
export function queryDataBaoBiao(cid, start, end) {
  return fetch.post('/user/data/baobiao', { cid: cid, start: start, end: end })
}

// 号码库管理接口

/**
 * 号码库列表查询
 * @param {Number} cid 必传
 * @param {Number} state 0已使用 1为使用
 * @param {String} phonenumber 号码
 * @param {Number} page 必传
 * @param {Number} rows 必传
 */
export function queryPhoneNumber(cid, state, phonenumber, page, rows) {
  return fetch.post('/user/phoneNumber/pageList', {
    cid: cid,
    state: state,
    phonenumber: phonenumber,
    page: page,
    rows: rows
  })
}

/**
 * 批量导入电话号码
 * @param {Number} cid 必传
 * @param {Array} list 电话号码集合
 */
export function addPhoneNumber(cid, list) {
  return fetch.post('/user/phoneNumber/addPhoneList', {
    cid: cid,
    list: list
  })
}

/**
 * 删除电话号码
 * @param {String} ids 单条传id,如“12”；多条传id字符串，如“12,34”
 */
export function deletePhoneNumber(ids) {
  return fetch.post('/user/phoneNumber/deletes', {
    ids: ids
  })
}

/**
 * 修改电话号码
 * @param {Number} id 必传
 * @param {Starting} phonenumber 号码
 * @param {Number} state 0已使用 1为使用
 */
export function modifyPhoneNumber(id, phonenumber, state) {
  return fetch.post('/user/phoneNumber/update', {
    id: id,
    phonenumber: phonenumber,
    state: state
  })
}

/**
 * 消息删除记录
 * @param {Number} cid 必传
 * @param {Number} page 必传
 * @param {Number} rows 必传
 * @param {String} wechatid 微信id
 * @param {String} friendid 好友id
 * @param {Number} contenttype 消息类型
 * @param {String} content 消息内容
 * @param {String} issend 自己发的
 */
export function fetchMsgDelLog(cid, page, rows, wechatid, friendid, contenttype, content, issend) {
  return fetch.post('/user/msgDelLog/pageList', {
    cid: cid,
    page: page,
    rows: rows,
    wechatid: wechatid,
    friendid: friendid,
    contenttype: contenttype,
    content: content,
    issend: issend
  })
}

/**
 * 会话删除记录
 * @param {Number} cid 必传
 * @param {Number} page 必传
 * @param {Number} rows 必传
 * @param {String} wechatid 微信id
 * @param {String} convid 会话id
 * @param {String} convname 会话名称
 */
export function fetchCovDelLog(cid, page, rows, wechatid, convid, convname) {
  return fetch.post('/user/convDelLog/pageList', {
    cid: cid,
    page: page,
    rows: rows,
    wechatid: wechatid,
    convid: convid,
    convname: convname
  })
}
