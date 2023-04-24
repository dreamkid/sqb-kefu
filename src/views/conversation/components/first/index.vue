<template>
  <div class="frist-part" :class="{ 'all-convs': allConvs }">
    <!-- tab -->
    <ul v-if="!allConvs" class="tabs">
      <li class="tab can-not-select" :class="{ 'tab-chose': currentTab === 'convs' }" @click="setTab('convs')">会话</li>
      <li class="tab can-not-select" :class="{ 'tab-chose': currentTab === 'friends' }" @click="setTab('friends')">
        通讯录
      </li>
      <li class="tab can-not-select" :class="{ 'tab-chose': currentTab === 'rooms' }" @click="setTab('rooms')">群聊</li>
    </ul>

    <ConvsList v-if="currentTab === 'convs' && !allConvs" />
    <ConvsListAll v-else-if="currentTab === 'convs' && allConvs" />

    <keep-alive>
      <FriendsList ref="friendsListRef" v-if="currentTab === 'friends'" />
    </keep-alive>
    <RoomsList v-if="currentTab === 'rooms'" />

    <!-- 数据统计 -->
    <div v-if="!allConvs" class="operation-btns">
      <p>共{{ totalNum }}</p>
      <i class="el-icon-refresh" @click="refresh(currentTab)">刷新数据</i>
    </div>
  </div>
</template>

<script>
import bus from '@/utils/bus'
import { mapGetters, mapState } from 'vuex'
import {
  TriggerConversationPushTask,
  TriggerFriendPushTask,
  TriggerChatroomPushTask,
  TriggerMessageReadTask,
  RequestContactsInfoTask,
  RequestChatRoomInfoTask
} from '@/api/webSocketApi'
import { closeWebsocket } from '@/websocket/websocket'
import { handleInternalApi } from '@/api/httpApi'
const ConvsList = () => import(/* webpackChunkName: "conversation" */ './ConvsList.vue')
const ConvsListAll = () => import(/* webpackChunkName: "conversation" */ './ConvsListAll.vue')
const FriendsList = () => import(/* webpackChunkName: "conversation" */ './FriendsList.vue')
const RoomsList = () => import(/* webpackChunkName: "conversation" */ './RoomsList.vue')

export default {
  components: {
    ConvsList,
    ConvsListAll,
    FriendsList,
    RoomsList
  },
  data() {
    return {
      currentTab: 'convs'
    }
  },
  computed: {
    ...mapState('nedb', {
      friends: 'friends', // 当前的通讯录列表
      chatRooms: 'chatRooms' // 当前的群聊列表
    }),
    ...mapState(['currentUser', 'set']),
    ...mapGetters({
      allConvs: 'allConvs', // 会话汇总
      wechats: 'conversation/wechats', // 会话汇总
      refreshButton: 'conversation/refreshButton', // 不能刷新
      currentConvs: 'conversation/currentConvs', // 会话列表
      currentFriendId: 'conversation/currentFriendId', // 好友id
      strangersMap: 'nedb/strangersMap', // 陌生人
      currentWeChatId: 'conversation/currentWeChatId' // 当前选择的微信
    }),
    conversMap() {
      const cmp = {}
      this.friends.forEach((x) => {
        cmp[x.FriendId] = x
      })
      this.chatRooms.forEach((x) => {
        cmp[x.UserName] = x
      })
      return cmp
    },
    totalNum() {
      if (this.currentTab === 'convs') {
        return this.currentConvs
          .slice(0, this.set.conversationSetNum)
          .filter((x) => !x.IsTop && (this.set.isFilterConversation ? !x.UserName.startsWith('gh_') : true)).length
      } else if (this.currentTab === 'friends') {
        return this.friends.length
      } else if (this.currentTab === 'rooms') {
        return this.chatRooms.length
      }
      return 0
    }
  },
  watch: {
    // 切换微信 重置最大显示条数
    currentWeChatId(current, pre) {
      this.maxNumber = 20
      if (current && pre) this.freshData(this.currentTab)
    },
    currentFriendId() {}
  },

  created() {
    bus.$on('sendMessage', (message) => {
      this.choseFriend(message)
    })
  },
  methods: {
    // 切换tab
    setTab(tab) {
      // 如果已经是这个tag 不做处理
      if (tab === this.currentTab) return
      this.currentTab = tab
      // this.$store.commit('conversation/SET_CURRENT_TAB', tab)
      this.freshData(this.currentTab)
      bus.$emit('tagChange', tab)
      this.$store.commit('conversation/SET_CURRENT_FRIENDS', { WeChatId: this.currentWeChatId })
    },
    // 刷新
    freshData() {
      if (this.currentWeChatId) {
        const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
        // 如果正在获取数据 则返回
        // if (!this.refreshButton) {
        //   this.$alert('正在获取数据，请稍后再试！', '提示', { type: 'info' })
        //   return
        // }
        this.$store.commit('conversation/SET_REFRESH_BUTTON', false)

        switch (this.currentTab) {
          case 'convs':
            // 删除本地数据
            //this.$store.commit('conversation/DELETE_CONVERSATIONS_BY_ID', this.currentWeChatId)
            // 从手机获取数据
            TriggerConversationPushTask(this.currentWeChatId, this.currentUser.NickName, loginInfo.name)
            break
          case 'friends':
            if (!this.friends.length) this.$store.commit('SET_LOADING', true)
            // 删除本地数据
            //this.$store.dispatch('nedb/RemoveAllFriensByWechatId', this.currentWeChatId)
            // 从手机获取数据
            console.log(this.loginInfo)
            TriggerFriendPushTask(this.currentWeChatId, this.currentUser.NickName, loginInfo.name)

            break
          default:
            // 删除本地数据
            //this.$store.dispatch('nedb/RemoveAllRoomByWechatId', this.currentWeChatId)
            // 从手机获取数据
            TriggerChatroomPushTask(this.currentWeChatId, this.currentUser.NickName, loginInfo.name)
            break
        }
        // 获取数据超时
        setTimeout(() => {
          this.$store.commit('conversation/SET_REFRESH_BUTTON', true)
        }, 3000)
      } else {
        this.$message({
          message: '请先选中微信',
          type: 'warning'
        })
      }
    },
    refresh() {
      if (this.currentWeChatId) {
        const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}

        this.$store.commit('conversation/SET_REFRESH_BUTTON', false)
        switch (this.currentTab) {
          case 'convs':
            // 删除本地数据
            this.$store.commit('conversation/DELETE_CONVERSATIONS_BY_ID', this.currentWeChatId)
            // 从手机获取数据
            TriggerConversationPushTask(this.currentWeChatId, this.currentUser.NickName, loginInfo.name)
            break
          case 'friends':
            if (!this.friends.length) this.$store.commit('SET_LOADING', true)
            // 删除本地数据
            this.$store.dispatch('nedb/RemoveAllFriensByWechatId', this.currentWeChatId)
            // 从手机获取数据
            console.log(this.loginInfo)
            TriggerFriendPushTask(this.currentWeChatId, this.currentUser.NickName, loginInfo.name)

            break
          default:
            // 删除本地数据
            this.$store.dispatch('nedb/RemoveAllRoomByWechatId', this.currentWeChatId)
            // 从手机获取数据
            TriggerChatroomPushTask(this.currentWeChatId, this.currentUser.NickName, loginInfo.name)
            break
        }
        // 获取数据超时
        setTimeout(() => {
          this.$store.commit('conversation/SET_REFRESH_BUTTON', true)
        }, 3000)
      } else {
        this.$message({
          message: '请先选中微信',
          type: 'warning'
        })
      }
    },
    // 获取指定好友的详情
    getFriendDetail(message) {
      //console.log('获取指定好友的详情 getFriendDetail', message)
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      const friendId = message.UserName || message.FriendId
      if (friendId.indexOf('chatroom') > 0) {
        RequestChatRoomInfoTask(message.WeChatId, friendId, loginInfo.name)
      } else {
        RequestContactsInfoTask(message.WeChatId, friendId, loginInfo.name)
      }
    },
    // 本地和手机上 设置消息为已读
    setMessageRead(message) {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      if (!message.WeChatId) return
      // 本地设为已读
      this.$store.commit('conversation/SET_CONV_READED', message)
      // 手机上设置消息已读
      TriggerMessageReadTask(message.WeChatId, message.UserName, loginInfo.name)
    },
    // 选择好友或会话
    async choseFriend(message, allMode) {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}

      // 如果有未读消息，设置消息已读
      if (message.UnreadCnt && message.UnreadCnt > 0) {
        this.setMessageRead(message)
      }
      if (this.currentTab === 'convs' || allMode) {
        // 如果没有头像 获取头像
        if (!message.ShowName) {
          TriggerConversationPushTask(
            message.WeChatId,
            this.currentUser.NickName,
            loginInfo.name,
            message.UpdateTime,
            0
          )
        }
        if (allMode) {
          for (const wechat of this.wechats) {
            if (wechat.WeChatId === message.WeChatId) {
              this.$store.commit('conversation/SET_CURRENT_WECHAT', wechat)
              break
            }
          }
          this.$store.commit('conversation/SET_CURRENT_FRIEND', message)
        } else {
          // 从本地查询信息
          let friend = this.conversMap[message.UserName]
          let stranger = this.strangersMap[message.UserName]

          if (friend) {
            friend = { ...friend, ...message }
            this.$store.commit('conversation/SET_CURRENT_FRIENDS', friend)
            console.log('选择好友或会话 choseFriend conversation/SET_CURRENT_FRIENDS', friend)
          } else if (stranger) {
            stranger = { ...stranger, ...message }
            this.$store.commit('conversation/SET_CURRENT_FRIENDS', stranger)
          } else {
            this.$store.commit('conversation/SET_CURRENT_FRIENDS', message)
          }
        }
      } else {
        this.$store.commit('conversation/SET_CURRENT_FRIENDS', message)
      }

      this.$store.commit('conversation/SET_RECORD_TOTAL', 0)
      bus.$emit('friendsClick', undefined)

      this.getFriendDetail(message)
    }
  }
}
</script>

<style lang="scss" scoped>
.frist-part {
  width: 290px;
  min-width: 290px;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .tabs {
    display: flex;
    background-color: #fff;
    border: 1px solid #ededed;
    border-top: none;
    margin-bottom: 0;
    .tab {
      width: 33%;
      height: 40px;
      line-height: 40px;
      font-size: 15px;
      font-weight: 600;
      color: #999999;
      text-align: center;
      cursor: pointer;
    }
    .tab-chose {
      color: #0cc160;
      border-bottom: #0cc160 solid 2px;
    }
  }

  .operation-btns {
    background-color: #f8f8f8;
    height: 50px;
    min-height: 50px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    border-top: 1px solid #ededed;
    border-right: 1px solid #ededed;
    color: #999;
    i {
      cursor: pointer;
    }
    p {
      margin-bottom: 0;
    }
  }
}
.all-convs {
  width: 370px;
  min-width: 370px;
}
</style>
