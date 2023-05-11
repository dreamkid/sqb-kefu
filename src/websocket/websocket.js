import store from '../store'
import msgHandler from './msgHandler.js'

let WebSocketObj = null // 实例websocket

/**
 * 创建websocket
 * @param {String} url websocket地址
 */
 function createWebSocket(url) {
  if (!url) {
    url = 'ws://'
  }
  console.log('webSocketUrl', url)
  if (!WebSocketObj) {
    WebSocketObj = new WebSocket(url)
  } else {
    console.log('WebSocketObj已经存在', WebSocketObj.readyState)
  }
  // linkTimes++
  // websocket 关闭
  WebSocketObj.onclose = () => {
    console.log('websocket关闭')
    store.commit('SET_WEB_SOCKET_STATE', 3)
    // reconnect()
  }
  // websocket 出错
  WebSocketObj.onerror = (e) => {
    console.log('websocket异常', e)
  }
  // websocket 打开
  WebSocketObj.onopen = () => {
    // websocket打开
    console.log('websocket打开')
    store.commit('SET_WEB_SOCKET_STATE', 1)
  }

  WebSocketObj.onmessage =(event) => {
    // 拿到任何消息都说明当前连接是正常的
    // linkTimes = 1
    // heartCheck.start()
    try {
      console.log('关联');
      console.log(event);
      msgHandler(event)
    } catch (error) {
      console.log('收到无法解析的数据', event, error)
    }
  }
}

/**
 * 发送指令
 * @param {*} agentData
 */
function sendSock(agentData) {
  console.log('-----------agentData------------');
  console.log(agentData);
  // 若是ws开启状态
  if (WebSocketObj && WebSocketObj.readyState === WebSocketObj.OPEN) {
    // 发送指令
     WebSocketObj.send(JSON.stringify(agentData))
  } else {
    console.log('websocket未创建！', WebSocketObj)
  }
}

// 关闭websocket
function closeWebsocket() {
  WebSocketObj.close()
  WebSocketObj = null
}

export { sendSock, createWebSocket, closeWebsocket }
