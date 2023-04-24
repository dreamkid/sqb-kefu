import dayjs from 'dayjs'

// 当前零点
const currentDay = () => {
  let time = new Date().getTime()
  const date = new Date(time)
  const hour = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  const mills = date.getMilliseconds()
  time = time - hour * 60 * 60 * 1000 - minutes * 60 * 1000 - seconds * 1000 - mills
  return time
}

/**
 * 格式化时间戳（秒|毫秒）
 * @param {timestamp} value
 */
const timeFilter = (value) => {
  if (value) {
    value = value.toString()
    if (value.length === 17) {
      value = value.substr(0, 13)
    }
    if (value.length === 13) {
      return formatTime(value, dayjs().diff(dayjs(Number(value)), 'hour'))
    }
    return dayjs.unix(Number(value)).format('YYYY-MM-DD HH:mm:ss')
  } else {
    return '-'
  }
}
const week = {
  0: '星期日',
  1: '星期一',
  2: '星期二',
  3: '星期三',
  4: '星期四',
  5: '星期五',
  6: '星期六'
}
const formatTime = (time, diff) => {
  const isAgo = dayjs().isAfter(dayjs(Number(time)), 'day')
  if (isAgo) {
    if (diff <= 24) {
      return `昨天 ${dayjs(Number(time)).format('HH:mm')}`
    }
    if (diff >= 1 * 24 && diff < 8 * 24) {
      return `${week[dayjs(Number(time)).day()]} ${dayjs(Number(time)).format('HH:mm')}`
    }
    if (diff > 1 * 24 && diff < 365 * 24) {
      return dayjs(Number(time)).format('MM-DD HH:mm')
    }
  } else {
    if (dayjs(Number(time)).hour() < 12) {
      return `上午 ${dayjs(Number(time)).format('HH:mm')}`
    }
    if (dayjs(Number(time)).hour() === 12) {
      return `中午 ${dayjs(Number(time)).format('HH:mm')}`
    }
    if (dayjs(Number(time)).hour() > 12) {
      return `下午 ${dayjs(Number(time)).format('HH:mm')}`
    }
  }

  return dayjs(Number(time)).format('YYYY-MM-DD HH:mm:ss')
}
/**
 * 当前会话列表的 聊天的时间显示
 * @param {*} time
 */
const transformTime = (time) => {
  const nt = Number(time)
  const date = new Date(nt)
  const h = date.getHours()
  const m = date.getMinutes()

  if (time > currentDay()) {
    if (m < 10) {
      return h + ':0' + m
    } else {
      return h + ':' + m
    }
  } else if (time > currentDay() - 24 * 60 * 60 * 1000) {
    return '昨天'
  } else {
    const year = date.getFullYear() + ''
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year.slice(-2)}/${month}/${day}`
  }
}

/**
 * 返回时间 精确到分
 * @param {*} YYYY-MM-DD HH:mm
 */
const transformTime2Minute = (time) => {
  const date = new Date(time)
  const Y = date.getFullYear() + '-'
  const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
  const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '
  const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
  const m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  // let s = date.getSeconds()
  const nt = Y + M + D + h + m
  return nt
}

// 从红包key中获取发送者
const hbUrlFilter = (hbUrl) => {
  if (hbUrl) {
    const reg = /&sendusername=.+?&/
    const result = hbUrl.match(reg)[0]
    return result.replace('&sendusername=', '').replace('&', '')
  }
}

// 根据labelId获取labelName
const labelFilter = (labelId, labels) => {
  for (const label of labels) {
    if (label.LabelId === Number(labelId)) {
      return label.LabelName
    }
  }
  return labelId
}

/**
 * 获取文件名
 * @param {string} file
 */
const getFileName = (file) => {
  let name = file
  try {
    name = JSON.parse(file).name
    return name
  } catch (error) {
    return name.replace(/.*\//, '')
  }
}

/**
 * 返回好友来源
 * @param {*} sourceId
 */
const getFriendSource = (sourceId) => {
  const sourceMap = {
    1: '通过搜索QQ号添加',
    1000001: '对方通过搜索QQ号添加',
    3: '通过搜索微信号添加',
    1000003: '对方通过搜索微信号添加',
    4: '来自QQ好友',
    8: '通过群聊添加',
    1000008: '对方通过群聊添加',
    1000014: '对方通过群聊添加',
    10: '通过手机通讯录添加',
    1000010: '对方通过手机通讯录添加',
    1000013: '对方通过手机通讯录添加',
    15: '通过搜索手机号添加',
    1000015: '对方通过搜索手机号添加',
    17: '通过名片分享添加',
    1000017: '对方通过名片分享添加',
    18: '通过附近的人添加',
    1000018: '对方通过附近的人添加',
    22: '通过摇一摇添加',
    1000022: '对方通过摇一摇添加',
    25: '通过漂流瓶添加',
    1000025: '对方通过漂流瓶添加',
    30: '通过扫一扫添加',
    1000030: '对方通过扫一扫添加',
    34: '公众号',
    48: '雷达',
    58: '通过Google联系人添加',
    76: '通过LinkedIn添加'
  }
  if (sourceId && sourceMap[sourceId]) {
    return sourceMap[sourceId]
  }
  return '未知'
}

export default {
  timeFilter,
  transformTime,
  transformTime2Minute,
  hbUrlFilter,
  labelFilter,
  getFileName,
  getFriendSource
}
