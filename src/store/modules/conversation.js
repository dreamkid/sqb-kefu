import Vue from 'vue'
import base64 from '@/utils/base64'
import { uniqueArryList, uniqueArryListSecond, getContent } from '@/utils/util'
import { Message } from 'element-ui'
import Bus from '@/utils/bus'
import nedb from '@/db/nedb'
import { getCurrentInternalApi } from '@/api/httpApi'
// initial state
import Day from 'dayjs'
const state = {
  wechats: [], // 当前用户绑定的微信
  currentWechat: {}, // 会话页面选中的微信

  // ============== first part 用到的变量 =======
  conversations: [], // 每个微信的会话
  currentFriends: {}, // 会话页面每个微信选中的好友
  refreshButton: true, // 刷新按钮可用
  currentFriend: null, // 会话汇总模式下的好友

  // ============== second part 用到的变量 =======
  recordTotal: 0,
  recordLoading: false,
  currentChats: [], // 当前好友的聊天记录

  currentChatsStore: [],
  currentChatsCacheStore: [],

  content: '', // 当前要发送的内容， 默认为空
  remark: '', // 要@的群成员的id
  quoteMsg: '', // 引用消息的msgSvrId
  quoteDetail: {}, // 引用的详情
  contentType: 'Text', // 当前要发送的消息类型，默认为文本
  hbDetailVisible: false, // 显示红包详情
  hbDetail: {
    WeChatId: '', // 所属微信号
    Success: false,
    ErrMsg: '',
    HbUrl: '', //
    TotalNum: null, // 红包总个数
    TotalAmount: null, // 红包总金额
    RecNum: null, // 已收红包个数
    Records: [], // 已收红包个数
    RecAmount: null // 已收红包金额
  }, // 红包详情
  circleList: [], // 当前好友的朋友圈列表
  retTips: '', // 朋友圈提示
  circleTask: {}, // 指令信息
  bigImageMap: {}, // 大图信息
  // ============== third part 用到的变量 =======
  publicReply: [], // 公共话术
  publicTags: [], // 公共标签
  ghList: [], // 公众号列表
  ghMap: {}, // 公众号列表

  //会话锁
  conversationLockMap: new Map()
}

// getters
const getters = {
  // ============== AsidePage用到的变量 ==============
  // 当前账号绑定的微信列表 排序后的
  wechats: (state) => {
    const onlineWechats = [] // 在线的微信
    const offlineWechats = [] // 不在线的微信
    state.wechats.forEach((element) => {
      if (element.IsOnline) {
        onlineWechats.push(element)
      }
    })
    state.wechats.forEach((element) => {
      if (!element.IsOnline) {
        offlineWechats.push(element)
      }
    })
    return onlineWechats.concat(offlineWechats)
  },
  // 当前账号绑定的微信Map(id-info)
  wechatsMap: (state) => {
    const wm = {}
    state.wechats.forEach((e) => {
      wm[e.WeChatId] = e
    })
    return wm
  },
  // 当前账号绑定的微信昵称Map(id-nick)
  wechatsNameMap: (state) => {
    const wm = {}
    state.wechats.forEach((e) => {
      wm[e.WeChatId] = e.WeChatNick
    })
    return wm
  },
  // 当前账号绑定的微信号Map(id-no)
  wechatsNoMap: (state) => {
    const wm = {}
    state.wechats.forEach((e) => {
      wm[e.WeChatId] = e.WeChatNo
    })
    return wm
  },
  // 当前账号绑定的并且在线的微信列表
  wechatsOnline: (state) => {
    return state.wechats.filter((element) => {
      return element.IsOnline
    })
  },
  // 所有会话
  allConversations: (state) => {
    const conversList = [...state.conversations]
    return conversList.sort((a, b) => {
      return b.UpdateTime - a.UpdateTime
    })
  },
  // 当前微信的会话降序排列
  currentConvs: (state, getters) => {
    const convsList = state.conversations.filter((x) => {
      return x.WeChatId === getters.currentWeChatId
    })
    return convsList.sort((a, b) => {
      return b.UpdateTime - a.UpdateTime
    })
  },
  // 每个设备的未读消息数统计
  messagesNotRead(state) {
    const mnr = {}
    state.conversations.forEach((x) => {
      if (!x.IsSilent && x.UnreadCnt) {
        if (mnr[x.WeChatId]) {
          mnr[x.WeChatId] = mnr[x.WeChatId] + x.UnreadCnt
        } else {
          mnr[x.WeChatId] = x.UnreadCnt
        }
      }
    })
    return mnr
  },
  currentWechat: (state) => state.currentWechat, // 当前微信
  // 当前微信id
  currentWeChatId: (state) => {
    return state.currentWechat.WeChatId ? state.currentWechat.WeChatId : ''
  },
  // 当前微信选中的好友
  currentFriend: (state, getters) => {
    // 汇总模式
    if (state.currentFriend) {
      return state.currentFriend
    }

    // 独立模式
    if (state.currentFriends[getters.currentWeChatId]) {
      const cf = { ...state.currentFriends[getters.currentWeChatId] }
      if (cf.LabelIds && typeof cf.LabelIds === 'string') {
        cf.LabelIds = cf.LabelIds.split(',')
      }

      return cf
    } else {
      return {}
    }
  },
  // 当前微信选中的好友的id
  currentFriendId: (state, getters) => {
    return getters.currentFriend.FriendId || getters.currentFriend.UserName || ''
  },

  // ================================ 河蟹的分割线 ================================
  // ============== ConversationFriends用到的变量 ====
  currentChats: (state, getters) => {
    return state.currentChatsStore.filter(
      (item) => item.WeChatId === getters.currentWeChatId && item.FriendId === getters.currentFriendId
    )
  },
  refreshButton: (state) => state.refreshButton,
  content: (state) => state.content,
  remark: (state) => state.remark,
  contentType: (state) => state.contentType,
  hbDetailVisible: (state) => state.hbDetailVisible,
  hbDetail: (state) => state.hbDetail,
  circleList: (state) => state.circleList,
  bigImageMap: (state) => state.bigImageMap,
  retTips: (state) => state.retTips,
  circleTask: (state) => state.circleTask,
  publicReply: (state) => state.publicReply,
  publicTags: (state) => state.publicTags,
  ghMap: (state) => state.ghMap,
  ghList: (state) => state.ghList
}

// actions
const actions = {
  // 更新当前好友的聊天记录
  UpdateCurrentChats: async ({ getters, commit, state }, chat) => {
    console.log('更新当前好友的聊天记录 UpdateCurrentChats', Day().format('YYYY-MM-DD HH:mm:ss'), chat)
    const { WeChatId, FriendId, msgSvrId, Content } = chat
    chat['MsgSvrId'] = msgSvrId
    if (Content) {
      chat['Content'] = base64.decode(Content)
    }

    //图片加载
    function imgLoadHandle(chats) {
      let imgNum = 0,
        imgLoadNum = 0

      return new Promise((resolve, reject) => {
        chats.forEach((message) => {
          if (['Emoji', 'Picture', 'Video'].includes(message.ContentType)) {
            imgNum++
            const imgDom = document.createElement('img')
            let content = {}
            if (message.FriendId.endsWith('chatroom')) {
              if (message.Content.startsWith('{')) {
                content = JSON.parse(message.Content)
              } else if (message.Content.startsWith('http://')) {
                content = { Thumb: content }
              } else {
                content = JSON.parse(message.Content.replace(/\S+?:/, '').replace(/^\n+|\n+$/g, ''))
              }
            } else {
              content = JSON.parse(message.Content)
            }
            imgDom.src = content.Thumb

            imgDom.onload = () => {
              console.log('SET_CURRENT_CHATS img load')
              imgLoadNum++
              message['__img'] = imgDom

              if (imgLoadNum === imgNum) {
                resolve(chats)
              }
            }
            imgDom.onerror = () => {
              console.log('SET_CURRENT_CHATS img error')
              imgLoadNum++
              message['__img'] = imgDom

              if (imgLoadNum === imgNum) {
                resolve(chats)
              }
            }
          }
        })
        if (imgNum === 0) resolve(chats)
      })
    }

    if (WeChatId === getters.currentWeChatId && FriendId === getters.currentFriendId) {
      await imgLoadHandle([chat])
      commit('UPDATE_CURRENT_CHATS', { ...chat, LocalSend: false })
    }

    if (chat.LocalSend) return

    //聊天记录缓存更新

    const chats = state.currentChatsCacheStore.filter(
      (item) => item.WeChatId === WeChatId && item.FriendId === FriendId
    )
    const count = chats.filter((item) => !item.PrivateMsgId || item.ContentType === 'SystemPrivateMsg').length
    if (count < 10) {
      commit('SET_CURRENT_CHATS_CACHE_STORE', [...state.currentChatsCacheStore, chat])
    } else {
      chats.shift()
      chats.push(chat)
      chats.sort((a, b) => {
        return a.CreateTime - b.CreateTime
      })

      const chatsCacheStoreFilter = state.currentChatsCacheStore.filter(
        (item) => item.WeChatId !== WeChatId || item.FriendId !== FriendId
      )

      commit('SET_CURRENT_CHATS_CACHE_STORE', [...chatsCacheStoreFilter, ...chats])
    }
  },
  // 删除自己插入的数据
  // RemoveLocalChat: ({ getters, commit }, chat) => {
  //   const { WeChatId, FriendId, MsgId } = chat
  //   if (WeChatId === getters.currentWeChatId && FriendId === getters.currentFriendId) {
  //     commit('REMOVE_LOACL_CHAT', MsgId)
  //   }
  // },
  // 设置当前好友的聊天记录
  SetCurrentChats: async ({ getters, commit, state }, chats) => {
    console.log('获取聊天记录SetCurrentChats', chats.Messages && chats.Messages[0] && chats.Messages[0].FriendId, chats)

    const { Messages, WeChatId, MsgCount } = chats
    const friendId = Messages[0] ? Messages[0].FriendId : '-1'

    if (!chats.Messages.length) {
      commit('SET_CURRENT_CHATS', [])
      commit('SET_RECORD_TOTAL', 0)
      commit('SET_RECORD_LOADING', false)
      return
    }

    Messages.map((x) => {
      x.WeChatId = WeChatId
      if (x.Content) {
        x.Content = base64.decode(x.Content)
      }
    })

    Messages.sort((a, b) => {
      return a.CreateTime - b.CreateTime
    })

    //图片加载
    function imgLoadHandle(chats) {
      let imgNum = 0,
        imgLoadNum = 0

      return new Promise((resolve, reject) => {
        chats.forEach((message) => {
          if (['Emoji', 'Picture', 'Video'].includes(message.ContentType)) {
            imgNum++
            const imgDom = document.createElement('img')
            let content = {}
            if (message.FriendId.endsWith('chatroom')) {
              if (message.Content.startsWith('{')) {
                content = JSON.parse(message.Content)
              } else if (message.Content.startsWith('http://')) {
                content = { Thumb: content }
              } else {
                content = JSON.parse(message.Content.replace(/\S+?:/, '').replace(/^\n+|\n+$/g, ''))
              }
            } else {
              content = JSON.parse(message.Content)
            }

            imgDom.src = content.Thumb

            imgDom.onload = () => {
              console.log('SET_CURRENT_CHATS img load')
              imgLoadNum++
              message['__img'] = imgDom

              if (imgLoadNum === imgNum) {
                resolve(chats)
              }
            }
            imgDom.onerror = () => {
              console.log('SET_CURRENT_CHATS img error')
              imgLoadNum++
              message['__img'] = imgDom

              if (imgLoadNum === imgNum) {
                resolve(chats)
              }
            }
          }
        })
        if (imgNum === 0) resolve(chats)
      })
    }

    //当前设备 当前会话
    if (WeChatId === getters.currentWeChatId && friendId === getters.currentFriendId) {
      //初次加载
      if (getters.currentChats.length === 0) {
        //console.log('SET_CURRENT_CHATS getCurrentInternalApi', data)

        //聊天记录存储

        //过滤
        const chatsCacheStoreFilter = state.currentChatsCacheStore.filter(
          (cache) => !Messages.find((message) => message.MsgId === cache.MsgId && message.MsgSvrId === cache.MsgSvrId)
        )

        commit('SET_CURRENT_CHATS_CACHE_STORE', [...chatsCacheStoreFilter, ...Messages])
      }

      const allData = await imgLoadHandle(Messages)

      if (
        getters.currentWeChatId === getters.currentFriendId ||
        getters.currentFriendId === getters.currentFriend.UserName ||
        getters.currentFriendId === getters.currentFriend.FriendId
      ) {
        commit('SET_CURRENT_CHATS', allData)
        commit('SET_RECORD_TOTAL', MsgCount)
        commit('SET_RECORD_LOADING', false)

        commit('SET_CONVERSATION_LOCK_MAP', {
          key: getters.currentWeChatId + getters.currentFriendId + '',
          value: false
        })
      }
    } else {
      //console.log('WeChatId', WeChatId, 'friendId', friendId)

      const chatsCacheStoreFilter = state.currentChatsCacheStore.filter(
        (item) => item.WechatId !== WeChatId || item.FriendId !== friendId
      )

      commit('SET_CURRENT_CHATS_CACHE_STORE', [...chatsCacheStoreFilter, ...Messages])

      commit('SET_CONVERSATION_LOCK_MAP', {
        key: WeChatId + friendId + '',
        value: false
      })
    }
  },
  // 删除撤回的消息
  // RemoveChat: ({ getters, commit }, msgNotice) => {
  //   const { TaskId, WeChatId } = msgNotice
  //   if (WeChatId === getters.currentWeChatId) {
  //     commit('REMOVE_CHAT', TaskId)
  //   }
  // },
  // ==================================================================
  // 更新currentFriends
  UpdateCurrentFriends({ commit, getters }, friend) {
    // 当前的微信
    const currentWeChatId = getters.currentWeChatId
    // 当前的好友
    const cf = getters.currentFriend

    if (friend.WeChatId === currentWeChatId && cf && friend.FriendId === cf.FriendId) {
      commit('SET_CURRENT_FRIENDS', friend)
    }
  },
  // 更新currentFriends
  UpdateCurrentFriendsByRoom({ commit, getters }, room) {
    // 当前的微信
    const currentWeChatId = getters.currentWeChatId
    // 当前的好友
    const cf = getters.currentFriend
    if (room.WeChatId === currentWeChatId && cf && room.UserName === cf.UserName) {
      commit('SET_CURRENT_FRIENDS', { ...cf, ...room })
    }
  },
  // 设置朋友圈
  SetCircleList({ rootState, getters, commit }, circlesMessage) {
    const { WeChatId, Circles, RetTips, RetCode } = circlesMessage
    // 朋友圈其他情况的提示
    if (RetTips) {
      commit('SET_RETTIPS', RetTips)
    }
    // 朋友圈已经到底
    if (RetCode === 207) {
      commit('SET_RETTIPS', '朋友圈已经到底！')
    }

    // 如果获取不到朋友圈就返回
    if (!Circles || Circles.length === 0) return

    const currentRoutePath = rootState.route.path
    const belongId = Circles[0] ? Circles[0].WeChatId : null
    if (currentRoutePath === '/conversation' || currentRoutePath === '/') {
      // 好友的朋友圈列表
      const belongId2 = getters.currentFriendId
      if (getters.currentWeChatId === WeChatId && belongId && belongId === belongId2) {
        commit('SET_CIRCLE_LIST', Circles)
      }
    } else if (currentRoutePath === '/friend-circle') {
      if (getters.currentWeChatId === WeChatId) {
        commit('SET_CIRCLE_LIST', Circles)
      }
    }
  },
  // 移除朋友圈
  RemoveCircle({ getters, commit }, circleData) {
    const { WeChatId, CircleId } = circleData
    if (WeChatId && WeChatId === getters.currentWeChatId) {
      commit('REMOVE_CIRCLE', CircleId)
    }
  },
  // 添加朋友圈
  AddCircleByNotice({ rootState, getters, commit }, circleData) {
    const { WeChatId, Circle } = circleData
    const currentRoutePath = rootState.route.path
    if (currentRoutePath === '/conversation' || currentRoutePath === '/') {
      // 好友的朋友圈列表
      if (WeChatId === getters.currentWeChatId && getters.currentFriendId === Circle.WeChatId) {
        commit('ADD_CIRCLE', Circle)
      }
    } else if (currentRoutePath === '/friend-circle') {
      if (WeChatId === getters.currentWeChatId) {
        commit('ADD_CIRCLE', Circle)
      }
    }
  },

  //----------------------------------------

  resetCurrentChats({ getters, commit, state }, { currentWeChatId, currentFriendId }) {
    console.log('resetCurrentChats', currentWeChatId, currentFriendId)
    const weChatId = getters.currentWeChatId
    const friendId = getters.currentFriendId

    if (!weChatId || !friendId) return
    let data = state.currentChatsStore.filter((item) => item.WeChatId !== weChatId || item.FriendId !== friendId)

    commit('RESET_CURRENT_CHATS', data)
  },
  resetCurrentChatsCache({ getters, commit, state }, { currentWeChatId, currentFriendId }) {
    console.log('resetCurrentChats', currentWeChatId, currentFriendId)
    const weChatId = getters.currentWeChatId
    const friendId = getters.currentFriendId

    if (!weChatId || !friendId) return
    let data = state.currentChatsCacheStore.filter((item) => item.WeChatId !== weChatId || item.FriendId !== friendId)

    commit('RESET_CURRENT_CHATS_CACHE', data)
  }
}

// mutations
const mutations = {
  // 群聊信息设置
  SET_GROUP_CHAT_INFO: (state, data) => {
    Object.keys(state.currentFriends).forEach(content => {
      state.currentFriends[content].Remark = data;
    })
  },

  SET_CURRENT_CHATS_CACHE_STORE: (state, data) => {
    state.currentChatsCacheStore = data
  },
  SET_CONVERSATION_LOCK_MAP: (state, { key, value }) => {
    state.conversationLockMap.set(key, value)
    //console.log('SET_CONVERSATION_LOCK_MAP', { key, value }, state.conversationLockMap)
  },
  // 重置当前会话
  RESET_CURRENT_CHATS: (state, data) => {
    state.currentChatsStore = data
  },
  // 重置当前聊天记录缓存
  RESET_CURRENT_CHATS_CACHE: (state, data) => {
    state.currentChatsCacheStore = data
  },
  CLEAR_CHATS: (state) => {
    state.currentChatsStore = []
    state.currentChatsCacheStore = []
    //console.log('CLEAR_CHATS', state)
  },
  UPDATE_CHAT(state, message) {},
  // 设置当前好友的聊天记录
  SET_CURRENT_CHATS: (state, chatsMsg) => {
    //console.log('SET_CURRENT_CHATS', chatsMsg)
    const message = (chatsMsg && chatsMsg[0]) || {}
    const { WeChatId, FriendId } = message
    if (!WeChatId || !FriendId) return

    const chats = state.currentChatsStore.filter((item) => item.WeChatId === WeChatId || item.FriendId === FriendId)

    const newChats = chatsMsg.sort((a, b) => {
      return a.CreateTime - b.CreateTime
    })

    state.currentChatsStore = [...newChats, ...state.currentChatsStore]
  },
  SET_RECORD_TOTAL: (state, count) => {
    state.recordTotal = count
  },
  SET_RECORD_LOADING: (state, loading) => {
    state.recordLoading = loading
  },
  ADD_CHAT(state, message) {
    state.currentChatsStore.push(message)
  },
  // 更新当前好友的聊天记录
  UPDATE_CURRENT_CHATS: (state, chatsMsg) => {
    // console.log('UPDATE_CURRENT_CHATS 更新当前好友的聊天记录', chatsMsg)

    if (chatsMsg.IsSend) {
      let index = state.currentChatsStore.findIndex((item) => item.MsgId && item.MsgId.toString() === chatsMsg.MsgId)
      //console.log('更新当前好友的聊天记录 UPDATE_CURRENT_CHATS', index)
      if (index > -1) {
        state.currentChatsStore.splice(index, 1, {
          ...state.currentChatsStore[index],
          ...chatsMsg
        })
      } else {
        state.currentChatsStore.push(chatsMsg)
      }
    } else {
      state.currentChatsStore.push(chatsMsg)
    }
  },
  UPDATE_CURRENT_CHAT: (state, chatsMsg) => {
    const { WeChatId, FriendId, MsgId, MsgSvrId } = chatsMsg
    console.log('UPDATE_CURRENT_CHAT', chatsMsg)
    const index = state.currentChatsStore.findIndex((item) => item.MsgId === chatsMsg.MsgId)
    if (index !== -1) {
      console.log(index, state.currentChatsCacheStore)
      Vue.set(state.currentChatsStore, index, chatsMsg)
      const cacheIndex = state.currentChatsCacheStore.findIndex((item) => item.MsgId === chatsMsg.MsgId)

      Vue.set(state.currentChatsCacheStore, cacheIndex, chatsMsg)
    }
  },
  UPDATE_INTERVAL_CHATS(state, messages) {
    console.log('UPDATE_INTERVAL_CHATS', messages)
    if (messages.length) {
      let firstStart = -1,
        firstEnd = -1
      const { WeChatId, FriendId } = messages[0]
      const chats = state.currentChatsStore.filter((item) => item.WechatId === WeChatId && item.FriendId === FriendId)
      for (let i = chats.length - 1; i >= 0; i--) {
        let item = chats[i]
        item['__index'] = i
        if (item.ContentType === 'SystemPrivateMsg') {
          const content = JSON.parse(item.Content)
          if (content.PrivateMsgEnable === 'true' && firstStart === -1) {
            firstStart = i
          }
          if (content.PrivateMsgEnable === 'false' && firstEnd === -1) {
            firstEnd = i
          }
        }
      }
      if (firstStart > firstEnd) {
        chats.splice(
          firstStart + 1,
          messages.length,
          ...messages.map((item) => ({
            ...item,
            Content: base64.decode(item.Content)
          }))
        )
        const chatsStoreFilter = state.currentChatsStore.filter(
          (item) => item.WechatId !== WeChatId || item.FriendId !== FriendId
        )
        state.currentChatsStore = [...chatsStoreFilter, chats]
      }
    }
  },
  // 删除自己发的消息
  // REMOVE_LOACL_CHAT: (state, msgId) => {
  //   // 如果要优化 可以先判断是不是当前会话
  //   // const { MsgId } = chatsMsg
  //   state.currentChats = state.currentChats.filter((x) => {
  //     return x.MsgId !== Number(msgId)
  //   })
  // },
  // 删除撤回的消息
  // REMOVE_CHAT: (state, msgSvrId) => {
  //   state.currentChats = state.currentChats.filter((x) => {
  //     return !x.MsgSvrId.includes(msgSvrId)
  //   })
  // },
  // 设置大图/视频 的url
  SET_IMGAGE_URL: (state, imgDetail) => {
    const { Content, MsgId } = imgDetail
    if (!MsgId) return
    const detailUrl = base64.decode(Content)
    // 大图进行缓存
    Vue.set(state.bigImageMap, MsgId, detailUrl)
    // 更新本地数据
    const detailIndex = state.currentChatsStore.findIndex((x) => {
      return MsgId === x.MsgId
    })
    const cacheIndex = state.currentChatsCacheStore.findIndex((x) => {
      return MsgId === x.MsgId
    })
    if (cacheIndex !== -1) {
      state.currentChatsCacheStore.splice(cacheIndex, 1, {
        ...state.currentChatsCacheStore[cacheIndex],
        Url: detailUrl
      })
    }
    if (detailIndex >= 0) {
      state.currentChatsStore.splice(detailIndex, 1, { ...state.currentChatsStore[detailIndex], Url: detailUrl })
    }

    // Message({
    //   type: 'success',
    //   message: '获取资源成功!',
    //   duration: 1000,
    //   showClose: true
    // })
  },
  // 重置数据
  RESET_DATA(state) {
    state.wechats = [] // 当前用户绑定的微信
    state.currentWechat = {} // 会话页面选中的微信
    state.currentFriends = {} // 会话页面每个微信选中的好友
    state.refreshButton = false // 刷新按钮不可用
    state.content = '' // 当前要发送的内容， 默认为空
    state.remark = '' // 要@的群成员的id
    state.quoteMsg = '' // 引用消息的msgSvrId
    state.quoteDetail = {} // 引用的详情
    state.contentType = 'Text' // 当前要发送的消息类型，默认为文本
    state.hbDetailVisible = false // 显示红包详情
    state.publicReply = [] // 公共话术
    state.publicTags = [] // 公共标签
    state.ghList = [] // 公众号列表
    state.ghMap = {} // 公众号列表
    state.hbDetail = {
      WeChatId: '', // 所属微信号
      Success: false,
      ErrMsg: '',
      HbUrl: '', //
      TotalNum: null, // 红包总个数
      TotalAmount: null, // 红包总金额
      RecNum: null, // 已收红包个数
      Records: [], // 已收红包个数
      RecAmount: null // 已收红包金额
    } // 红包详情
  },
  // ============== AsidePage用到的变量 ==============
  SET_WECHATS: (state, wechats) => {
    state.wechats = wechats
  },
  SET_WECHAT: (state, wechat) => {
    const index = state.wechats.findIndex((item) => item.WeChatId === wechat.WeChatId)
    if (index > -1) state.wechats.splice(index, 1, wechat)
  },
  // 设置当前选中的微信
  SET_CURRENT_WECHAT: (state, wechat) => {
    state.currentWechat = wechat
  },

  // 设置每个微信的会话
  SET_CONVERSATIONS: (state, convsData) => {
    //console.log(convsData)
    const { WeChatId, Convers } = convsData
    if (!Convers) return
    Convers.map((x) => {
      x.WeChatId = WeChatId
    })
    const oldData = state.conversations.filter((x) => {
      return x.WeChatId === WeChatId
    })
    if (oldData.length > 0) {
      const newData = uniqueArryList(Convers.concat(oldData), 'UserName')
      state.conversations = state.conversations
        .filter((x) => {
          return x.WeChatId !== WeChatId
        })
        .concat(newData)
    } else {
      state.conversations = state.conversations.concat(Convers)
    }
  },
  // 重置会话列表
  RESET_CONVERSATIONS: (state) => {
    state.conversations = []
  },
  // 删除指定微信的conversations
  DELETE_CONVERSATIONS_BY_ID: (state, wechatId) => {
    state.conversations = state.conversations.filter((x) => {
      return x.WeChatId !== wechatId
    })
  },
  // 根据通知删除指定的消息
  DELETE_CONVERSATIONS_BY_NOTICE: (state, message) => {
    const { WeChatId, FriendId } = message
    state.conversations = state.conversations.filter((x) => {
      return x.WeChatId !== WeChatId || (x.WeChatId === WeChatId && x.UserName !== FriendId)
    })
  },
  // 设置会话已读
  SET_CONV_READED: (state, currentConv) => {
    const { UserName, WeChatId } = currentConv
    for (const conv of state.conversations) {
      if (conv.UserName === UserName && conv.WeChatId === WeChatId) {
        if (conv.UnreadCnt) {
          conv.UnreadCnt = 0
        }
        // @我的数量
        if (conv.AtCount) {
          conv.AtCount = 0
        }
        break
      }
    }
  },
  // 设置会话未读
  SET_CONV_UNREAD: (state, currentConv) => {
    const { UserName, WeChatId } = currentConv
    const fid = state.conversations.findIndex((x) => {
      return x.UserName === UserName && x.WeChatId === WeChatId
    })
    if (fid >= 0) {
      const newData = { ...state.conversations[fid] }
      newData.UnreadCnt = 1
      state.conversations.splice(fid, 1, newData)
    }
  },
  // 更新单个消息
  UPDATE_CONVERSATION: (state, talk) => {
    //console.log('更新单个消息', talk)
    const { WeChatId, CreateTime, FriendId, IsSend } = talk

    const convIndex = state.conversations.findIndex((x) => {
      return x.WeChatId === WeChatId && x.UserName === FriendId
    })

    let newData = {}
    // 如果本地有消息
    if (convIndex > -1) {
      newData = JSON.parse(JSON.stringify(state.conversations[convIndex]))
      newData.Digest = getContent(talk)
      newData.MsgCnt = newData.MsgCnt + 1
      if (newData.UnreadCnt || newData.UnreadCnt === 0) {
        newData.UnreadCnt = newData.UnreadCnt + 1
      } else {
        newData.UnreadCnt = 1
      }
      // 处理群里@我的消息
      if (FriendId.endsWith('chatroom')) {
        let wechatName = ''
        for (const wechat of state.wechats) {
          if (wechat.WeChatId === WeChatId) {
            wechatName = wechat.WeChatNick
            break
          }
        }
        if (newData.Digest.indexOf(`@${wechatName}`) >= 0) {
          newData.AtCount = newData.AtCount ? newData.AtCount + 1 : 1
        }
      }

      newData.UpdateTime = CreateTime
      if (IsSend) {
        newData.UnreadCnt = 0
      }
      state.conversations.splice(convIndex, 1, newData)
    } else {
      // 如果本地没有消息
      newData = {
        Digest: getContent(talk),
        MsgCnt: 1,
        UnreadCnt: IsSend ? 0 : 1,
        UpdateTime: CreateTime,
        UserName: FriendId,
        WeChatId: WeChatId
      }
      state.conversations.push(newData)
    }
  },
  UPDATE_SINGLE_CONVERSATION: (state, friend) => {
    //console.log('UPDATE_SINGLE_CONVERSATION', friend)
    const { WeChatId, UserName } = friend

    const index = state.conversations.findIndex((item) => {
      return item.WeChatId === WeChatId && item.UserName === UserName
    })
    if (index > -1) {
      state.conversations.splice(index, 1, { ...state.conversations[index], ...friend })
    }
    //console.log('UPDATE_SINGLE_CONVERSATION', state.conversations)
  },
  // 微信下线
  WECHAT_OFF_LINE: (state, wechatId) => {
    for (const wechat of state.wechats) {
      if (wechat.WeChatId === wechatId) {
        wechat.IsOnline = false
        // 更新当前微信信息
        if (wechatId === state.currentWechat.WeChatId) {
          state.currentWechat = wechat
        }
        break
      }
    }
  },
  // 微信上线
  WECHAT_ON_LINE: (state, wechatInfo) => {
    let i = 0
    let flag = false
    for (const wechat of state.wechats) {
      if (wechat.WeChatId === wechatInfo.WeChatId) {
        flag = true
        break
      }
      i++
    }
    if (flag) {
      state.wechats.splice(i, 1, wechatInfo)
    } else {
      state.wechats.push(wechatInfo)
    }
    // 更新当前微信信息
    if (wechatInfo.WeChatId === state.currentWechat.WeChatId) {
      state.currentWechat = wechatInfo
    }
  },
  // ============== ConversationFriends用到的变量 ====
  SET_REFRESH_BUTTON: (state, flag) => {
    state.refreshButton = flag
  },

  // 设置当前微信 所选的好友
  SET_CURRENT_FRIENDS: (state, msg) => {
    console.log('// 设置当前微信 所选的好友 SET_CURRENT_FRIENDS', msg)
    if (msg.FriendId || msg.UserName) {
      Vue.set(state.currentFriends, msg.WeChatId, msg)
    } else {
      Vue.set(state.currentFriends, msg.WeChatId, {})
    }
  },

  // 会话汇总模式下所选的好友
  SET_CURRENT_FRIEND: (state, friendInfo) => {
    state.currentFriend = friendInfo
  },

  // ============== ConversationChats用到的变量 =======
  // 设置消息内容
  SET_CONTENT: (state, content) => {
    state.content = content
  },
  SET_REMARK: (state, remark) => {
    state.remark = remark
  },
  SET_QUOTE_MSG: (state, qm) => {
    state.quoteMsg = qm
  },
  SET_QUOTE_DETAIL: (state, quoteDetailInfo) => {
    state.quoteDetail = quoteDetailInfo
  },
  // 设置消息类型
  SET_CONTENT_TYPE: (state, type) => {
    state.contentType = type
  },
  // 设置显示红包详情
  SET_HB_DETAIL_VISIBLE: (state, visible) => {
    state.hbDetailVisible = visible
  },
  // 设置显示红包详情
  SET_HB_DETAIL: (state, hbdetail) => {
    for (const key in hbdetail) {
      if (hbdetail.hasOwnProperty(key)) {
        Vue.set(state.hbDetail, key, hbdetail[key])
      }
    }
  },
  // 设置朋友圈列表
  SET_CIRCLE_LIST: (state, circles) => {
    const newCircles = state.circleList.concat(circles)
    newCircles.sort((a, b) => {
      return b.PublishTime - a.PublishTime
    })
    state.circleList = uniqueArryListSecond(newCircles, 'CircleId')
  },
  // 更新大图
  UPDATE_CIRCLE_LIST: (state, circleDetail) => {
    const { Circle } = circleDetail
    if (Circle) {
      const { Content } = Circle
      if (Content && Content.Images) {
        for (const image of Content.Images) {
          Vue.set(state.bigImageMap, image.mediaId, image.Url)
        }
      }
    }
  },
  // 移除单个朋友圈
  REMOVE_CIRCLE: (state, circleId) => {
    state.circleList = state.circleList.filter((x) => {
      return x.CircleId !== circleId
    })
  },
  // 添加单个朋友圈
  ADD_CIRCLE: (state, circleItem) => {
    state.circleList.unshift(circleItem)
  },
  // 重置朋友圈数据
  RESET_CIRCLE_LIST: (state) => {
    state.circleList = []
  },
  // 设置朋友圈提示
  SET_RETTIPS: (state, tip) => {
    state.retTips = tip
  },
  // 保存点赞任务的信息
  SET_CIRCLE_TASK: (state, task) => {
    Vue.set(state.circleTask, task.TaskId, task)
  },
  // ============== ConversationTools用到的变量 ====
  // 设置公共话术
  SET_PUBLIC_REPLY: (state, publicReply) => {
    state.publicReply = publicReply
  },
  SET_GH_MAP: (state, ghMap) => {
    Vue.set(state.ghMap, ghMap.WeChatId, ghMap.Contacts)
  },
  // 更新会话的置顶数据
  UPDATE_IS_TOP(state, message) {
    const convIndex = state.conversations.findIndex((x) => {
      return x.WeChatId === message.WeChatId && x.UserName === message.ChatRoomId
    })
    if (convIndex >= 0) {
      state.conversations.splice(convIndex, 1, { ...state.conversations[convIndex], IsTop: message.IntValue === 1 })
    }
  },
  // 更新会话的免打扰数据
  UPDATE_IS_SILENT(state, message) {
    const convIndex = state.conversations.findIndex((x) => {
      return x.WeChatId === message.WeChatId && x.UserName === message.ChatRoomId
    })
    if (convIndex >= 0) {
      state.conversations.splice(convIndex, 1, { ...state.conversations[convIndex], IsSilent: message.IntValue === 0 })
    }
  },
  // 删除已经退出群聊的群聊会话
  DELETE_CONV(state, message) {
    const wechatId = message.WeChatId
    const oldConvs = state.conversations[wechatId]
    // 如果当前有数据
    if (oldConvs) {
      for (let index = 0; index < oldConvs.length; index++) {
        const element = oldConvs[index]
        if (element.UserName === message.RoomId) {
          oldConvs.splice(index, 1)
          break
        }
      }
      Vue.set(state.conversations, message.WeChatId, oldConvs)
    }
  },

  Add_CONV(state, message) {
    const wechatId = message.WeChatId
    const { UserName } = message
    const conversations = state.conversations
    const conversationIndex = conversations.findIndex(
      (item) => item.UserName === UserName && wechatId === item.WeChatId
    )

    if (conversationIndex === -1) {
      state.conversations = [message, ...conversations]
    }
    Bus.$emit('sendMessage', message)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
