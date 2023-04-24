import Vue from 'vue'
import Vuex from 'vuex'
import modules from './modules'
// state
const state = {
  currentMode: 'web', // 当前的开发环境
  webSocketState: 0, // websocket状态
  webSocketToken: localStorage.getItem('WEBSOCKET_TOKEN'), // wensocket token
  currentUser: localStorage.getItem('CURRENT_USER') ? JSON.parse(localStorage.getItem('CURRENT_USER')) : {}, // 当前登录的用户的信息
  loginInfo: {}, // 登录信息，自动登录用到
  clientOrServer: 'client', // client客户端 server管理端
  adminInfo: {}, // 管理员信息
  httpToken: '', // 管理端返回的token
  bigScreen: true, // 大页面模式
  allConvs: false, // 会话汇总
  triggerTask: {}, // 记录主动下发的任务
  loading: false,

  globalLoading: false,
  globalLoadingText: '拼命加载中',
  preLoadNum: {},
  isPreLoadHistoryRecord: false,
  //拉取聊天记录的会话数量
  pullNum: {},

  //设置
  set: {
    isConversationNum: false,
    //会话保留条数
    conversationSetNum: undefined, //是否屏蔽公众号/订阅号/服务号消息
    isFilterConversation: false
  },

  url: localStorage.getItem('_chat_url_') || ''
}

const actions = {}

// getters
const getters = {
  actionUrl: () => process.env.VUE_APP_UPLOAD_URL, // element-ui 上传的action地址
  currentUser: (state) => state.currentUser,
  currentMode: (state) => state.currentMode,
  userId: (state) => state.currentUser.SupplierId * 10000 + state.currentUser.UnionId || '',
  loginInfo: (state) => state.loginInfo,
  superAdmin: (state) => {
    return state.adminInfo.type && state.adminInfo.type === -1
  },
  triggerTask: (state) => state.triggerTask,
  allConvs: (state) => state.allConvs
}

// mutations
const mutations = {
  // 切换页面大小
  SET_BIG_SCREEN: (state) => {
    state.bigScreen = !state.bigScreen
  },
  // 切换会话模式
  SET_ALL_CONVS: (state) => {
    state.allConvs = !state.allConvs
  },
  // pc还是web
  SET_CURRENT_MODE: (state, mode) => {
    state.currentMode = mode
  },
  // 设置websocketState
  SET_WEB_SOCKET_STATE(state, wsState) {
    state.webSocketState = wsState
  },
  // 设置ws token
  SET_WEBSOCKET_TOKEN: (state, wsToken) => {
    state.webSocketToken = wsToken
  },
  // 设置http token
  SET_HTTP_TOKEN: (state, hToken) => {
    state.httpToken = hToken
  },
  // 设置登录的信息
  SET_LOGIN_INFO: (state, loginInfo) => {
    state.loginInfo = loginInfo
  },
  // 设置客户端还是管理端
  SET_CLIENT_OR_SERVER: (state, flagStr) => {
    state.clientOrServer = flagStr
  },
  // 设置管理员信息
  SET_ADMIN_INO: (state, adminInfo) => {
    state.adminInfo = adminInfo
  },
  // 设置用户信息
  SET_CURRENT_USER: (state, userInfo) => {
    state.currentUser = userInfo
  },
  // 记录自己主动下发的任务
  SET_TRIGGER_TASK: (state, taskInfo) => {
    Vue.set(state.triggerTask, taskInfo.TaskId, taskInfo)
  },

  SET_LOADING: (state, loading) => {
    state.loading = loading
  },
  SET_GLOBAL_LOADING: (state, loading) => {
    state.globalLoading = loading
  },
  SET_GLOBAL_LOADING_TEXT: (state, text) => {
    state.globalLoadingText = text
  },

  SET_PRE_LOAD_NUM: (state, { id, num }) => {
    state.preLoadNum[id] = num
  },
  SET_PULL_NUM: (state, { id, num }) => {
    state.pullNum[id] = num
  },
  SET_IS_PRE_LOAD_HISTORY_RECORD: (state, load) => {
    state.isPreLoadHistoryRecord = load
  },

  SET_SET: (state, set) => {
    state.set = set
  },
  SET_URL: (state, url) => {
    state.url = url
  }
}

Vue.use(Vuex)

export default new Vuex.Store({
  modules,
  state,
  getters,
  mutations,
  actions,
  strict: process.env.NODE_ENV !== 'production'
})
