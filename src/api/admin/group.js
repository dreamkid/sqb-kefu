/**
 * 营销手机接口
 * xuyangyang
 * 2021-12
 */

import fetch from '@/utils/fetch'

/**
 * 分页搜索查询设备分组信息
 * @param {Number} cid 必传
 * @param {String} name
 * @param {Number} page 必传
 * @param {Number} rows 必传
 */
export function getDeviceGroup(cid, name, page, rows) {
  return fetch.post('/user/devicegroup/pageList', {
    cid: cid,
    name: name,
    page: page,
    rows: rows
  })
}

/**
 * 查询所有分组
 * @param {Number} cid 必传
 */
export function getAllDeviceGroup(cid) {
  return fetch.post('/user/devicegroup/queryByCid', {
    cid: cid
  })
}

/**
 * 添加分组
 * @param {Number} cid 用户id
 * @param {String} name 分组名称
 */
export function addDeviceGroup(cid, name) {
  return fetch.post('/user/devicegroup/add', {
    cid: cid,
    name: name
  })
}

/**
 * 修改分组
 * @param {Number} id 分组id
 * @param {Number} cid 用户id
 * @param {String} name 分组名称
 */
export function updateDeviceGroup(id, cid, name) {
  return fetch.post('/user/devicegroup/update', {
    id: id,
    cid: cid,
    name: name
  })
}

/**
 * 删除分组
 * @param {String} ids   单条传id,如“12”；多条传id字符串，如“12,34”
 */
export function deleteDeviceGroup(ids) {
  return fetch.post('/user/devicegroup/deletes', {
    ids: ids
  })
}
