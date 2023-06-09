import base64 from '@/utils/base64'

/**
 * 数组去重，保留第一个数据
 * @param {Array} targartArry 原始数组
 * @param {String} keyWord 关键词
 * @returns {Array}
 */
export const uniqueArryList = (targartArry, keyWord) => {
  for (let i = 0; i < targartArry.length; i++) {
    for (let j = i + 1; j < targartArry.length; j++) {
      if (typeof targartArry[i] === 'object') {
        if (targartArry[i][keyWord] === targartArry[j][keyWord]) {
          // 第一个等同于第二个，splice方法删除第二个
          targartArry.splice(j, 1)
          j--
        }
      } else {
        if (targartArry[i] === targartArry[j]) {
          // 第一个等同于第二个，splice方法删除第二个
          targartArry.splice(j, 1)
          j--
        }
      }
    }
  }
  // console.log(targartArry)
  return targartArry
}

/**
 * 数组去重，保留第二个数据
 * @param {Array} targartArry 数组
 * @param {String} keyWord 关键词
 * @returns {Array}
 */
export const uniqueArryListSecond = (targartArry, keyWord) => {
  for (let i = 0; i < targartArry.length; i++) {
    for (let j = i + 1; j < targartArry.length; j++) {
      if (typeof targartArry[i] === 'object') {
        if (targartArry[i][keyWord] === targartArry[j][keyWord]) {
          // splice方法删除第一个
          targartArry.splice(i, 1)
          j--
        }
      } else {
        if (targartArry[i] === targartArry[j]) {
          // splice方法删除第一个
          targartArry.splice(i, 1)
          j--
        }
      }
    }
  }
  // console.log(targartArry)
  return targartArry
}

/**
 * 生成TaskId
 * @returns {number}
 */
export const generateTaskId = () => {
  return new Date().getTime() * 10000 + parseInt(Math.random() * 10000, 10)
}

/**
 * 获取消息的内容
 * @param {Object} talk 消息
 */
export function getContent(talk) {
  //console.log('获取消息的内容 getContent', talk)
  const { ContentType, Content } = talk
  if (!Content) {
    return ''
  }
  const digest = base64.decode(Content)
  if (ContentType === 'Text') {
    if (talk.FriendId.indexOf('chatroom') > 0) {
      return unescape(escape(digest.replace(/.*?:/, '')).replace('%0A', '%20')).replace(' ', '')
    }
    return digest
  }
  if (ContentType === 'System') {
    return digest
  }
  const contentMap = {
    Picture: '[图片]',
    2: '[图片]',
    Voice: '[语音]',
    3: '[语音]',
    Video: '[视频]',
    4: '[视频]',
    // System: '[系统消息]',
    // 5: '[系统消息]',
    Link: '[链接]',
    6: '[链接]',
    LinkExt: '[扩展的链接消息]',
    7: '[扩展的链接消息]',
    File: '[文件]',
    8: '[文件]',
    NameCard: '[名片]',
    9: '[名片]',
    Location: '[位置消息]',
    10: '[位置消息]',
    LuckyMoney: '[红包]',
    11: '[红包]',
    MoneyTrans: '[转账]',
    12: '[转账]',
    WeApp: '[小程序]',
    13: '[小程序]',
    Emoji: '[动画表情]',
    14: '[动画表情]',
    Sys_LuckyMoney: '[红包系统消息]',
    16: '[红包系统消息]',
    RoomSystem: '[群系统消息]',
    17: '[群系统消息]',
    NotifyMsg: '[系统通知]',
    21: '[系统通知]',
    ShiPinHao: '[视屏号]',
    24: '[视屏号]',
    PaiYiPai: '[拍一拍]',
    26: '[拍一拍]'
  }
  return contentMap[ContentType] || ContentType
}

// 图片的绝对路径地址转换成base64编码
export function getBase64Image(img) {
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, img.width, img.height)
  const ext = img.src.substring(img.src.lastIndexOf('.') + 1).toLowerCase()
  const dataURL = canvas.toDataURL('image/' + ext)
  return {
    dataURL: dataURL,
    type: 'image/' + ext
  }
}

// 实现点击下载功能
export function download(blobUrl) {
  const a = document.createElement('a')
  a.style.display = 'none'
  a.download = '元元'
  a.href = blobUrl
  a.click()
}

// ============================================================

/**
 * 存储localStorage
 */
export const setStore = (name, content) => {
  if (!name) return
  if (typeof content !== 'string') {
    content = JSON.stringify(content)
  }
  window.localStorage.setItem(name, content)
}

/**
 * 获取localStorage
 */
export const getStore = (name) => {
  if (!name) return
  return window.localStorage.getItem(name)
}

/**
 * 删除localStorage
 */
export const removeStore = (name) => {
  if (!name) return
  window.localStorage.removeItem(name)
}

/**
 * 生成随机字符串(可指定长度)
 * @param len
 * @returns {string}
 */
export const randomString = (len) => {
  len = len || 8
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  /** **默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  const maxPos = $chars.length
  let pwd = ''
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return pwd
}

/**
 * randomWord 产生任意长度随机字母数字组合
 * @param randomFlag 是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
 * @param min
 * @param max
 * @returns {string}
 * 调用方法:
 * 生成 3 - 32 位随即字符串
 * randomWord(true,3,32);    例如：olyOXUF5oDsuMmXl3Mi48
 * 生成 32 位随机字符串
 * randomWord(false,32);     例如：fjpnWj29Bb8boiXbLeDF0nxkR4aYcLRl
 */
export const randomWord = (randomFlag, min, max) => {
  let str = ''
  let range = min
  const arr = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z'
  ]
  // 随机产生
  if (randomFlag) {
    range = Math.round(Math.random() * (max - min)) + min
  }
  for (let i = 0; i < range; i++) {
    const pos = Math.round(Math.random() * (arr.length - 1))
    str += arr[pos]
  }
  return str
}

/**
 * 获取url后参数
 */
export const GetRequest = () => {
  const url = location.search // 获取url中"?"符后的字串
  // const theRequest = new Object()
  const theRequest = {}
  if (url.indexOf('?') !== -1) {
    const str = url.substr(1)
    const strs = str.split('&')
    for (let i = 0; i < strs.length; i++) {
      theRequest[strs[i].split('=')[0]] = strs[i].split('=')[1]
    }
  }
  return theRequest
}

/**
 * 生成随机颜色值
 */
export const getRandomColor = () => {
  const rgb = []
  for (let i = 0; i < 3; ++i) {
    let color = Math.floor(Math.random() * 256).toString(16)
    color = color.length === 1 ? '0' + color : color
    rgb.push(color)
  }
  return '#' + rgb.join('')
}

/**
 * 验证身份证号
 * @param el 号码输入input
 * @returns {boolean}
 */
export const checkCardNo = (el) => {
  const txtval = el.value
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return reg.test(txtval)
}

/**
 * 获取字符串字节长度
 * @param {String}
 * @returns {Boolean}
 */
export const checkLength = (v) => {
  let realLength = 0
  const len = v.length
  for (let i = 0; i < len; i++) {
    const charCode = v.charCodeAt(i)
    if (charCode >= 0 && charCode <= 128) realLength += 1
    else realLength += 2
  }
  return realLength
}

/**
 * 判断微信浏览器
 * @returns {Boolean}
 */
export const isWeiXin = () => {
  const ua = window.navigator.userAgent.toLowerCase()
  if (ua.match(/MicroMessenger/i) === 'micromessenger') {
    return true
  } else {
    return false
  }
}

/**
 * 写cookies
 */
// export const setCookie = (name, value, time) => {
//     // let strsec = getsec(time)
//     let exp = new Date()
//     exp.setTime(exp.getTime() + strsec * 1)
//     document.cookie =
//         name + '=' + escape(value) + ';expires=' + exp.toGMTString()
// }

/**
 * 读取cookies
 */
export const getCookie = (name) => {
  let arr
  const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  if ((arr = document.cookie.match(reg))) return arr[2]
  else return null
}

/**
 * 删除cookies
 */
export const delCookie = (name) => {
  const exp = new Date()
  exp.setTime(exp.getTime() - 1)
  const cval = getCookie(name)
  if (cval != null) {
    document.cookie = name + '=' + cval + ';expires=' + exp.toGMTString()
  }
}

/**
 * 浏览器判断
 * 用法示例——多套页面判断是否显示移动端：
 *   let ua = parseUA();
 *   if (!ua.mobile) {
 *       location.href = './pc.html';
 *   }
 */
export const parseUA = () => {
  const u = navigator.userAgent
  const u2 = navigator.userAgent.toLowerCase()
  return {
    // 移动终端浏览器版本信息
    trident: u.indexOf('Trident') > -1,
    // IE内核
    presto: u.indexOf('Presto') > -1,
    // opera内核
    webKit: u.indexOf('AppleWebKit') > -1,
    // 苹果、谷歌内核
    gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') === -1,
    // 火狐内核
    mobile: !!u.match(/AppleWebKit.*Mobile.*/),
    // 是否为移动终端
    ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
    // ios终端
    android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
    // android终端或uc浏览器
    iPhone: u.indexOf('iPhone') > -1,
    // 是否为iPhone或者QQHD浏览器
    iPad: u.indexOf('iPad') > -1,
    // 是否iPad
    webApp: u.indexOf('Safari') === -1,
    // 是否web应该程序，没有头部与底部
    iosv: u.substr(u.indexOf('iPhone OS') + 9, 3),
    weixin: u2.match(/MicroMessenger/i) === 'micromessenger',
    ali: u.indexOf('AliApp') > -1
  }
}

/**
 * 生成UUID
 * @returns {string}
 */
export const generateUUID = () => {
  let d = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x7) | 0x8).toString(16)
  })
  return uuid
}

/**
 * 删除左右两端的空格
 * @param str
 * @returns {string | * | void}
 */
// function trim(str) {
//     return str.replace(/(^\s*)|(\s*$)/g, '')
// }

/**
 * 删除左边的空格
 * @param str
 * @returns {string | * | void}
 */
// function ltrim(str) {
//     return str.replace(/(^\s*)/g, '')
// }

/**
 * 删除右边的空格
 * @param str
 * @returns {string | * | void}
 */
// function rtrim(str) {
//     return str.replace(/(\s*$)/g, '')
// }

/**
 * 对象数组转二维数组
 * @param objArr
 */
// function obj2Arr(objArr) {
//     objArr.length > 0 &&
//         objArr.map(item => {
//             return Object.values(item)
//         })
// }

/**
 * 找出对象数组中某属性的最大值
 * @param array
 * @param item
 * @returns val
 */
// function maxItemInObjArr(array, item) {
//     let max = Math.max.apply(
//         Math,
//         array.map(function(obj) {
//             return obj[item]
//         })
//     )
//     return max
// }

/**
 * 判断当前网络环境
 */
export const isWifi = () => {
  try {
    let wifi = true
    const ua = window.navigator.userAgent
    const con = window.navigator.connection
    // 如果是微信
    if (/MicroMessenger/.test(ua)) {
      if (ua.indexOf('WIFI') >= 0) {
        return true
      } else {
        wifi = false
      }
      // 如果支持navigator.connection
    } else if (con) {
      const network = con.type
      if (network !== 'wifi' && network !== '2' && network !== 'unknown') {
        wifi = false
      }
    }
    return wifi
  } catch (e) {
    return false
  }
}

/**
 * 首字母大写
 * @param str
 * @returns {string}
 */
export const fistLetterUpper = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 过滤非法字符串
 */
// export const illegalFilter = str => {
//     let regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im
//     let regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im

//     if (regEn.test(str) || regCn.test(str)) return false
//     return true
// }

/**
 * 获取当前的时间
 */
export const getNowTime = function(){
  var date = new Date();
  let Y = date.getFullYear() + '-';
  let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  let D = (date.getDate() < 10 ? ('0' + date.getDate()): date.getDate() )+ ' ';
  let h = (date.getHours() < 10 ? ('0' + date.getHours()): date.getHours()) + ':';
  let m = (date.getMinutes() < 10 ? ('0' + date.getMinutes()): date.getMinutes()) + ':';
  let s = date.getSeconds() < 10 ? ('0' + date.getSeconds()): date.getSeconds();
  return Y + M + D + h + m + s
}
