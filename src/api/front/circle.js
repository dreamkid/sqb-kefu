/**
 * 朋友圈管理相关接口
 */

import fetch from '@/utils/fetch'

/**
 * 添加发朋友圈任务
 * @param {Number} cid 必传
 * @param {Number} accountid
 * @param {String} execute_time
 * @param {Number} restype
 * @param {String} content
 * @param {String} wechats 要发朋友圈的微信id，多个用英文逗号隔开
 * @param {String} comment 评论
 * @param {Number} attachtype 附件类型
 * @param {String} attachtcontent 附件内容
 * @param {Number} between_time 间隔时间，单位分钟
 * @param {String} remarks 完整的朋友圈内容
 */
export function addCircle(
  cid,
  accountid,
  execute_time,
  restype,
  content,
  wechats,
  comment,
  attachtype,
  attachtcontent,
  between_time,
  remarks
) {
  return fetch.post('/user/circle/add', {
    cid: cid,
    accountid: accountid,
    execute_time: execute_time,
    restype: restype,
    content: content,
    wechats: wechats,
    comment: comment,
    attachtype: attachtype,
    attachtcontent: attachtcontent,
    between_time: between_time,
    remarks: remarks
  })
}

/**
 * 查询朋友圈任务列表
 * @param {Number} cid 必传
 * @param {Number} page 必传
 * @param {Number} rows 必传
 * @param {Number} state 状态1开启中0已完成
 * @param {String} startTime 启始时间
 * @param {String} endTime 结束时间
 * @param {Number} restype 附件类型
 * @param {String} content
 * @param {Boolean} deleted 是否删除
 */
export function queryCircleTask(cid, page, rows, state, content, startTime, endTime, restype, deleted = '') {
  return fetch.post('/user/circle/pageList', {
    cid: cid,
    page: page,
    rows: rows,
    state: state,
    content: content,
    startTime: startTime,
    endTime: endTime,
    restype: restype,
    deleted: deleted
  })
}

/**
 * 删除朋友圈任务
 * @param {String} ids 单条传id,如“12”；多条传id字符串，如“12,34”
 */
export function deleteCircleTask(ids) {
  return fetch.post('/user/circle/deletes', { ids: ids })
}

/**
 * 评论列表
 * @param {Number} cid 必传
 * @param {Number} page 必传
 * @param {Number} rows 必传
 * @param {String} wechatid 微信id
 * @param {String} comment 评论内容
 * @param {String} startTime 评论的起使时间
 * @param {String} endTime 评论的结束时间
 */
export function getCircleComments(cid, page, rows, wechatid, comment, startTime, endTime) {
  return fetch.post('/user/circleComment/pageList', {
    cid: cid,
    page: page,
    rows: rows,
    wechatid: wechatid,
    comment: comment,
    startTime: startTime,
    endTime: endTime
  })
}

/**
 * 评论删除
 * @param {String} ids 单条传id,如“12”；多条传id字符串，如“12,34”
 */
export function deleteCircleComment(ids) {
  return fetch.post('/user/circleComment/deletes', {
    ids: ids
  })
}

/**
 * 跟评
 * @param {String} wechatid 微信id
 * @param {String} circleid 朋友圈id
 * @param {String} comment 跟评的内容
 * @param {String} id 任务id
 */
export function followCircleComments(wechatid, circleid, comment, id) {
  return fetch.post('/user/circleComment/followComment', {
    wechatid: wechatid,
    circleid: circleid,
    comment: comment,
    id: id
  })
}

/**
 * 根据朋友圈内容id查询评论列表
 * @param {Number} id 朋友圈数据id，非circleid
 * @param {Number} page 必传
 * @param {Number} rows 必传
 */
export function queryCommentsById(id, page, rows) {
  return fetch.post('/user/circleComment/pageList1', {
    id: id,
    page: page,
    rows: rows
  })
}

/**
 * 多个评论提交
 * @param {Number} id 朋友圈数据id，非circleid
 * @param {Array} comments 评论列表
 * @param {Array} wechats 要评论的微信
 * @param {Array} ids 要修改状态的评论
 */
export function followMoreComment(id, comments, wechats, ids) {
  return fetch.post('/user/circleComment/followMoreComment', {
    id: id,
    comments: comments,
    wechats: wechats,
    ids: ids
  })
}

// 根据朋友圈内容id查询微信账号信息
export function queryWechatsById(id) {
  return fetch.post('/user/circle/queryWechats', {
    id: id
  })
}

/**
 * 根据朋友圈内容id查询点赞信息
 * @param {Number} id 朋友圈数据id，非circleid
 */
export function queryCircleLike(id) {
  return fetch.post('/user/circleLike/queryLikesById', {
    id: id
  })
}

/**
 * 所有朋友圈-单个朋友圈任务执行详情
 * @param {Number} id 朋友圈数据id
 */
export function queryCircleTaskInfo(id) {
  return fetch.post('/user/circle/queryCircleTaskInfo', {
    id: id
  })
}

/**
 * 所有朋友圈-单个朋友圈任务重发
 * @param {Number} id 朋友圈数据id
 */
export function resendCircle(id) {
  return fetch.post('/user/circle/resendCircle', {
    id: id
  })
}
