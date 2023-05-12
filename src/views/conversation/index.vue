<template>
  <div class="conversation-page">
    <FirstPart />

    <SecondPart />
    <ThirdPart />

    <!-- 快速发朋友圈 -->
    <!-- <div id="draggableWrap" draggable="true" @dragend="endMove($event)">
      <span
        v-if="chatList.length === 0"
        style="font-size: 30px; cursor: pointer"
        class="iconfont icon-friend-circle"
      ></span>
      <svg
        v-else-if="!chatListVisible"
        class="icon"
        style="font-size: 30px; cursor: pointer"
        aria-hidden="true"
        @click="showChatList($event)"
      >
        <use xlink:href="#icon-friend-circle"></use>
      </svg>

      <div v-if="chatListVisible && chatMsgData.length > 0" class="tip">
        <span style="font-size: 16px; font-weight: 600">待发朋友圈列表</span>
        <i class="el-icon-close" style="cursor: pointer; font-size: 20px" @click="hideChatList"></i>
        <div class="tip-right">
          <el-button type="primary" round style="padding: 6px; margin-right: 10px">一键发送</el-button>
        </div>
      </div>
      <el-table
        v-show="chatListVisible && chatMsgData.length > 0"
        :data="chatMsgData"
        style="width: 500px"
        max-height="400px"
        stripe
        border
      >
        <el-table-column type="index" label="序号" width="50"></el-table-column>
        <el-table-column prop="textContent" label="内容" width="180"></el-table-column>
        <el-table-column prop="media" label="媒体">
          <template slot-scope="scope">
            <img
              v-for="(imgUrl, index) in scope.row.media"
              :key="index"
              style="height: 100px; width: 100px; object-fit: cover"
              :src="imgUrl"
            />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="sendChatItem(scope.row)">发送</el-button>
            <el-button type="text" size="small" @click="deleteChatItem(scope.row)">删除</el-button>
            <el-button type="text" size="small" @click="insertLocalStorage(scope.row)">存草稿</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div> -->
  </div>
</template>

<script>
import FirstPart from './components/first/index.vue'
import SecondPart from './components/second/index.vue'
import ThirdPart from './components/third/index.vue'
import { GetWeChatsReq,getWeChatList, weChatStatusGetApi, weChatStatusSaveApi } from '@/api/httpApi'
import { uniqueArryList } from '@/utils/util'

import { mapGetters, mapState } from 'vuex'

export default {
  name: 'ConversationPage',
  components: {
    FirstPart,
    SecondPart,
    ThirdPart
  },
  data() {
    return {
      routerViewName: 'conversation',
      chatListVisible: false
    }
  },
  computed: {
    ...mapGetters({
      chatList: 'circleManager/chatList'
    }),
    ...mapState(['currentUser']),
    // 重组数据
    chatMsgData() {
      const td = []
      const tdMap = {}
      for (const cl of this.chatList) {
        const tid = cl.WeChatId + cl.FriendId
        if (tdMap[tid]) {
          for (const ti of td) {
            if (ti.id === tid) {
              if (cl.ContentType === 'Text') {
                ti.textContent = ti.textContent ? ti.textContent + ' ' + cl.Content : cl.Content
              } else if (cl.ContentType === 'Picture') {
                if (cl.Url) {
                  if (ti.media) {
                    ti.media.push(cl.Url)
                  } else {
                    ti.media = [cl.Url]
                  }
                } else {
                  const thumbImg = JSON.parse(cl.Content).Thumb
                  if (ti.media) {
                    ti.media.push(thumbImg)
                  } else {
                    ti.media = [thumbImg]
                  }
                }
              }
              break
            }
          }
        } else {
          tdMap[tid] = true
          const circleObj = {}
          circleObj.id = cl.WeChatId + cl.FriendId
          if (cl.ContentType === 'Text') {
            circleObj.textContent = cl.Content
          } else if (cl.ContentType === 'Picture') {
            if (cl.Url) {
              circleObj.media = [cl.Url]
            } else {
              circleObj.media = [JSON.parse(cl.Content).Thumb]
            }
          }
          td.push(circleObj)
        }
      }
      return td
    }
  },
  mounted() {
    getWeChatList(this.currentUser.UnionId).then((res) => {
      if (res.code === "1000" && res.data.getWeChatListModelList) {
        const wechatsList = [];
        console.log(res.data.getWeChatListModelList);
        for (const wechatObj of res.data.getWeChatListModelList) {
          const nwo = {}
          
          const newRes={};
          newRes.wechatid = wechatObj.robotId;
          newRes.robotAccount = wechatObj.robotId;
          newRes.wechatnick = wechatObj.nickName;
          newRes.isonline = wechatObj.onlineStatus=='ONLINE'?0:1;
          newRes.deviceid = wechatObj.weChatId;
          Object.assign(wechatObj,newRes)
          for (const key in wechatObj) {
            if (Object.hasOwnProperty.call(wechatObj, key)) {
              // const element = object[key];
              if (key === 'avatar') {
                nwo['Avatar'] = wechatObj.avatar
              } else if (key === 'isonline') {
                nwo['IsOnline'] = wechatObj.isonline === 0
              } else if (key === 'wechatno') {
                nwo['WeChatNo'] = wechatObj.wechatno
              } else if (key === 'wechatnick') {
                nwo['WeChatNick'] = wechatObj.wechatnick
              } else if (key === 'wechatid') {
                nwo['WeChatId'] = wechatObj.wechatid
              } else {
                nwo[key] = wechatObj[key]
              }
            }
          }
          wechatsList.push(nwo)
        }

        this.$store.commit('conversation/SET_WECHATS', wechatsList)
        const onlineWeChats = wechatsList.filter((item) => item.IsOnline)
        const wechat = wechatsList.filter((item) => item.IsOnline)[0] || {}
        const wechatId = wechat.WeChatId
        if (onlineWeChats.length === 0) {
          this.$store.commit('SET_GLOBAL_LOADING', false)
        }
        // 设置会话页面选择的微信
        this.$store.commit('conversation/SET_CURRENT_WECHAT', wechat)
      }
    });
    // GetWeChatsReq(this.currentUser.UnionId).then((res) => {
    //   if (res.code === 0 && res.data) {
    //     const wechatsList = []
    //     for (const wechatObj of res.data) {
    //       const nwo = {}
    //       for (const key in wechatObj) {
    //         if (Object.hasOwnProperty.call(wechatObj, key)) {
    //           // const element = object[key];
    //           if (key === 'avatar') {
    //             nwo['Avatar'] = wechatObj.avatar
    //           } else if (key === 'isonline') {
    //             nwo['IsOnline'] = wechatObj.isonline === 0
    //           } else if (key === 'wechatno') {
    //             nwo['WeChatNo'] = wechatObj.wechatno
    //           } else if (key === 'wechatnick') {
    //             nwo['WeChatNick'] = wechatObj.wechatnick
    //           } else if (key === 'wechatid') {
    //             nwo['WeChatId'] = wechatObj.wechatid
    //           } else {
    //             nwo[key] = wechatObj[key]
    //           }
    //         }
    //       }
    //       wechatsList.push(nwo)
    //     }

    //     this.$store.commit('conversation/SET_WECHATS', wechatsList)
    //     const onlineWeChats = wechatsList.filter((item) => item.IsOnline)
    //     const wechat = wechatsList.filter((item) => item.IsOnline)[0] || {}
    //     const wechatId = wechat.WeChatId
    //     if (onlineWeChats.length === 0) {
    //       this.$store.commit('SET_GLOBAL_LOADING', false)
    //     }
    //     // 设置会话页面选择的微信
    //     this.$store.commit('conversation/SET_CURRENT_WECHAT', wechat)
    //   }
    // })
  },
  created() {
    this.$store.commit('SET_GLOBAL_LOADING', true)
    this.$store.commit('SET_GLOBAL_LOADING_TEXT', '正在连接...')
  },

  methods: {
    // 修改朋友圈列表的位置
    endMove(e) {
      const dwDom = document.getElementById('draggableWrap')
      if (dwDom) {
        dwDom.style.left = e.clientX - 120 + 'px'
        dwDom.style.top = e.clientY - 64 + 'px'
      }
    },
    // 展示列表
    showChatList(e) {
      const dwDom = document.getElementById('draggableWrap')
      if (dwDom) {
        dwDom.style.left = (e.clientX - 120) / 2 + 'px'
        dwDom.style.top = (e.clientY - 60) / 2 + 'px'
      }
      this.chatListVisible = !this.chatListVisible
    },
    // 隐藏列表
    hideChatList() {
      const dwDom = document.getElementById('draggableWrap')
      if (dwDom) {
        console.log(window.innerWidth)
        console.log(window.innerHeight)
        dwDom.style.left = window.innerWidth - 200 + 'px'
        dwDom.style.top = window.innerHeight - 200 + 'px'
      }
      this.chatListVisible = false
    },
    // 删除待发朋友圈
    deleteChatItem(chat) {
      this.$store.commit('circleManager/DELETE_CHAT_LIST_BY_ID', chat.id)
      // 删除本地保存的数据
      const cll = localStorage.getItem('chatListLocal')
      if (cll) {
        const jcll = JSON.parse(cll)
        const njcll = jcll.filter((x) => {
          return chat.id !== x.WeChatId + x.FriendId
        })
        localStorage.setItem('chatListLocal', JSON.stringify(njcll))
      }
    },
    // 跳转到发朋友圈页面
    sendChatItem(chat) {
      this.$store.commit('circleManager/SET_CIRCLE_2_SEND', chat)
      this.$router.push({ path: '/circleManager' })
      this.$store.commit('circleManager/SET_CURRENT_CIRLCLE_NAV', 'sendCircle')
    },
    // 存为草稿
    insertLocalStorage(row) {
      const msg2save = this.chatList.filter((x) => {
        x.circleId = x.WeChatId + x.FriendId
        return x.WeChatId + x.FriendId === row.id
      })
      const cll = localStorage.getItem('chatListLocal')
      if (cll) {
        const jcll = JSON.parse(cll)
        const njcll = uniqueArryList(jcll.concat(msg2save), 'MsgSvrId')
        localStorage.setItem('chatListLocal', JSON.stringify(njcll))
      } else {
        localStorage.setItem('chatListLocal', JSON.stringify(msg2save))
      }
      this.$message.success('存为草稿成功')
    },

    //获取微信状态
    getStatus(list) {
      list.forEach((weChat, weChatIndex) => {
        setInterval(async () => {
          const { status, data } = await weChatStatusGetApi(weChat.WeChatId, 1)
          if (status === 200) {
            if (!weChat.IsOnline && data.status === 1) {
              weChat.IsOnline = true
            } else if (weChat.IsOnline && data.status !== 1) {
              weChat.IsOnline = false
            }
            this.$store.commit('conversation/SET_WECHATS', list)
            weChatStatusSaveApi(weChat.WeChatId, weChat.IsOnline ? 0 : 1)
          }
        }, 1000)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.conversation-page {
  flex: 1 1 auto;
  display: flex;
  justify-content: space-between;
  position: relative;

  #draggableWrap {
    position: absolute;
    top: calc(100vh - 200px);
    left: calc(100vw - 200px);
    z-index: 1001;
    max-width: 500px;

    .tip {
      background: #fff;
      width: 100%;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
    }
  }
}
</style>
