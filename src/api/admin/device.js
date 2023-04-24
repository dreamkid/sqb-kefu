/**
 * 设备管理接口
 * author sunfellow2009@163.com
 * created time 2022/1/13
 */

import fetch from '@/utils/fetch'

/**
 * 分页搜索查询全部设备列表
 * @param {number} page 必传
 * @param {number} rows 必传
 * @param {number} isonline 0上线 1下线
 * @param {string} wechatid 微信id
 * @param {string} deviceid 设备号
 */
export function queryDevicesAll(page, rows, isonline, wechatid, deviceid) {
  return fetch.post('/admin/device/pageList', {
    page: page,
    rows: rows,
    isonline: isonline,
    wechatid: wechatid,
    deviceid: deviceid
  })
}

/**
 * 分页查询设备
 * @param {number} cid 管理员的cid
 * @param {number} page 页码
 * @param {number} rows 每页数据量
 * @param {String} deviceid 设备号
 * @param {String} wechatid 微信id
 * @param {number} isonline 微信在线状态 0在线 1下线
 * @param {number} groupid 分组id
 * @param {number} accountid 账号id
 */
export function queryDevices(cid, page, rows, deviceid, wechatid, isonline, groupId, accountid) {
  const data = {
    cid: cid,
    page: page,
    rows: rows,
    deviceid: deviceid,
    wechatid: wechatid,
    isonline: isonline,
    groupid: groupId,
    accountid: accountid
  }
  return fetch.post('/user/device/pageList', data)
}

/**
 * 删除设备
 * @param {string} ids
 */
export function deleteDevices(ids) {
  return fetch.post('/user/device/deletes', { ids: ids })
}

/**
 * 添加设备
 * @param {number} cid 管理员的cid
 * @param {string} deviceid 设备id（一般为imei）
 * @param {number} accountid 所属操作员账号id，为空则未分配
 * @param {number} groupid 分组id
 * @param {string} devnickname 设备名称
 * @param {string} brand 手机品牌
 * @param {string} module 手机型号
 * @param {number} snumber 序号用来排序
 */
export function addDevice(cid, deviceid, accountid, groupid, devnickname, brand, module, snumber) {
  return fetch.post('/user/device/add', {
    cid: cid,
    deviceid: deviceid,
    accountid: accountid,
    groupid: groupid,
    devnickname: devnickname,
    brand: brand,
    module: module,
    snumber: snumber
  })
}

/**
 * 修改设备
 * @param {number} id 设备id
 * @param {number} cid 管理员的cid
 * @param {string} deviceid 设备id（一般为imei）
 * @param {number} accountid 所属操作员账号id，为空则未分配
 * @param {number} groupid 分组id
 * @param {string} devnickname 设备名称
 * @param {string} brand 手机品牌
 * @param {string} module 手机型号
 * @param {number} snumber 序号用来排序
 */
export function updateDevice(id, cid, deviceid, accountid, groupid, devnickname, brand, module, snumber) {
  return fetch.post('/user/device/update', {
    id: id,
    cid: cid,
    deviceid: deviceid,
    accountid: accountid,
    groupid: groupid,
    devnickname: devnickname,
    brand: brand,
    module: module,
    snumber: snumber
  })
}

/**
 * 设备批量分组
 * @param {String} deviceids 单条传id,如“12”；多条传id字符串，如“12,34”
 * @param {Number} groupid 分组ID
 */
export function groupDevices(deviceids, groupid) {
  return fetch.post('/user/device/group', {
    deviceids: deviceids,
    groupid: groupid
  })
}

/**
 * 根据分组id查个人号信息
 * @param {String} groupids 单条传id,如“12”；多条传id字符串，如“12,34”
 */
export function queryDevicesByGroupId(groupids) {
  return fetch.post('/user/device/queryBygroupids', { groupids: groupids })
}

/**
 * 根据cid查所有设备
 * @param {Number} cid 管理员的cid
 * @param {Number} accountid 管理员的unionid
 */
export function getAllDevices(cid, accountid) {
  return fetch.post('/user/device/list', { cid: cid, accountid: accountid })
}
