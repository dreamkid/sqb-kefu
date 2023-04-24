/**
 * 数据分析相关接口
 */

import fetch from '@/utils/fetch'

/**
 * 朋友圈数据
 * @param {Number} cid 客户id
 */
export function circleData(cid) {
  return fetch.post('/user/data/circleTongji', {
    cid: cid
  })
}

/**
 * 新增好友数据
 * @param {Number} cid 客户id 必传
 * @param {Number} type 1按天 2按时间 必传
 * @param {String} start 开始时间    必传   格式yyyy-MM-dd HH:mm:ss
 * @param {String} end 结束时间     必传   格式yyyy-MM-dd HH:mm:ss
 * @param {String} wechatid
 * @param {Number} groupid
 */
export function friendData(cid, type = 1, start, end, wechatid = '', groupid = '') {
  return fetch.post('/user/data/friendAddTongji', {
    cid: cid,
    type: type,
    wechatid: wechatid,
    groupid: groupid,
    start: start,
    end: end
  })
}

/**
 * 好友变更数据统计
 * @param {Number} cid 客户id
 * @param {Number} accountid 用户id 必传
 * @param {Number} type 功能 1增加好友 2删除好友
 * @param {String} start 开始时间 必传 格式yyyy-MM-dd
 * @param {String} end 结束时间 必传 格式yyyy-MM-dd
 */
export function friendChangeTongji(cid, accountid, type, start, end) {
  return fetch.post('/user/data/friendChangeTongji', {
    cid: cid,
    accountid: accountid,
    type: type,
    start: start,
    end: end
  })
}

/**
 * 实时好友数据统计
 * @param {Number} cid admin id
 * @param {Number} accountid 客服id 必传
 * @param {String} wechatid
 */
export function friendTotalTongji(cid, accountid, wechatid) {
  return fetch.post('/user/data/friendTotalTongji', {
    cid: cid,
    accountid: accountid,
    wechatid: wechatid
  })
}
