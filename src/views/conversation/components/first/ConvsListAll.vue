<template>
  <div class="convers-list-all">
    <div class="all-convs-tabs">
      <el-select v-model="filterWeChatId" size="small" clearable placeholder="所有微信">
        <el-option
          v-for="(wechat, index) in wechatsOnline"
          :key="index"
          :label="wechat.WeChatNick"
          :value="wechat.WeChatId"
          :disabled="!wechat.IsOnline"
        ></el-option>
      </el-select>

      <el-select v-model="unreadFlag" size="small" style="margin-left: 10px" clearable placeholder="全部会话">
        <el-option
          v-for="(urs, index2) in unreadStates"
          :key="index2"
          :label="urs.label"
          :value="urs.value"
        ></el-option>
      </el-select>
    </div>

    <!-- 搜索 -->
    <div class="search-box">
      <el-input
        v-model="searchInfo"
        prefix-icon="el-icon-search"
        type="text"
        placeholder="搜索"
        maxlength="20"
        size="small"
        show-word-limit
        clearable
        @keyup.enter.native="searchChange"
      ></el-input>
    </div>

    <!-- 会话列表 -->
    <div id="friends-list" class="friends-content scroll" @scroll="handlerScroll">
      <div
        v-for="(message, index) in searchInfo ? searchResult : conversations"
        :key="index"
        class="friend-info"
        :class="{
          selected: currentFriendId === message.UserName && currentWeChatId === message.WeChatId
        }"
        @click="$parent.choseFriend(message, true)"
      >
        <!-- 头像和提示 -->
        <div class="avatar-tip">
          <!-- 头像 -->
          <el-avatar :key="message.Avatar" shape="square" :size="45" :src="message.Avatar">
            <i class="fa fa-picture-o" aria-hidden="true" title="头像miss"></i>
          </el-avatar>
          <!-- 未读消息数 -->
          <div
            v-if="message.UnreadCnt && message.UnreadCnt > 0"
            class="tip"
            :title="message.UnreadCnt"
            v-text="message.UnreadCnt < 99 ? message.UnreadCnt : '...'"
          ></div>
        </div>
        <!-- 昵称和消息内容 -->
        <div class="nick-content">
          <!-- 昵称 -->
          <div class="friend-nick ellipsis" v-text="message.ShowName"></div>
          <!-- 消息内容 -->
          <div v-if="message.Digest" class="chat-content ellipsis" v-text="message.Digest.replace('%s:', '')"></div>
          <div v-else class="chat-content ellipsis" v-text="''"></div>
        </div>
        <!-- 时间 | 刷新 | 置顶 | 免打扰 -->
        <div class="time-disturb">
          <div style="font-size: 12px" v-text="$options.filters.transformTime(message.UpdateTime)"></div>
          <div class="opration-btns">
            <template v-if="message.UserName !== 'notifymessage'">
              <!-- 置顶 -->
              <i
                class="el-icon-upload2"
                :class="{ 'top-convs': message.IsTop }"
                aria-hidden="true"
                title="置顶"
                @click.stop="setTop(message)"
              ></i>
              <!-- 刷新 -->
              <i
                class="fa fa-retweet sigle-fresh"
                aria-hidden="true"
                @click.stop="$parent.getFriendDetail(message)"
              ></i>
              <!-- 免打扰 -->
              <i
                class="el-icon-close-notification"
                aria-hidden="true"
                :class="{
                  'msg-silent': message.IsSilent
                }"
                @click="msgSilent(message)"
              ></i>
            </template>
          </div>
        </div>
      </div>
      <!-- <div v-if="maxNumber >= allConversations.length" class="current-info-null">
        <el-button size="small" @click="queryMoreConv">加载更多</el-button>
        <el-button size="small" @click="queryMoreConv('all')">加载全部</el-button>
      </div> -->
    </div>

    <div class="operation-btns">
      <p>共{{ totalConvers }}</p>
      <el-select v-model="startTime" size="small" clearable placeholder="最近三天">
        <el-option v-for="(tss, index3) in timeStates" :key="index3" :label="tss.label" :value="tss.value"></el-option>
      </el-select>
      <i class="el-icon-refresh" @click="freshAllConv">刷新数据</i>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { TriggerConversationPushTask } from '@/api/webSocketApi'

// const notifyImg = require('assets/svg/conversation-notify-message.svg')

export default {
  data() {
    return {
      maxNumber: 20, // 默认显示20条数据
      searchInfo: '', // 搜索内容
      filterWeChatId: '',
      unreadFlag: '',
      conversUnread: [],
      unreadStates: [
        {
          label: '私聊',
          value: 'friend'
        },
        {
          label: '群聊',
          value: 'room'
        },
        {
          label: '未读',
          value: 'notRead'
        },
        {
          label: '已读',
          value: 'readed'
        }
      ],
      startTime: '',
      timeStates: [
        {
          label: '最近一周',
          value: 'week'
        },
        {
          label: '最近一月',
          value: 'month'
        },
        {
          label: '全部',
          value: 'all'
        }
      ],
      searchResult: [] // 搜索结果
    }
  },
  computed: {
    ...mapState(['currentUser']),
    ...mapGetters({
      wechatsOnline: 'conversation/wechatsOnline', // 会话列表
      allConversations: 'conversation/allConversations', // 会话列表
      currentWeChatId: 'conversation/currentWeChatId', // 当前页面回显
      currentFriendId: 'conversation/currentFriendId' // 当前页面回显
    }),
    // 按条件重新排序会话列表
    conversations() {
      let [...conversList] = this.allConversations
      if (this.filterWeChatId) {
        conversList = this.allConversations.filter((x) => {
          return x.WeChatId === this.filterWeChatId
        })
      }
      if (this.unreadFlag === 'friend') {
        conversList = conversList.filter((x) => {
          return x.UserName.indexOf('chatroom') < 0
        })
      } else if (this.unreadFlag === 'room') {
        conversList = conversList.filter((x) => {
          return x.UserName.indexOf('chatroom') > 0
        })
      } else if (this.unreadFlag === 'readed') {
        conversList = conversList.filter((x) => {
          return !x.UnreadCnt || x.UnreadCnt === 0
        })
      } else if (this.unreadFlag === 'notRead') {
        conversList = conversList.filter((x) => {
          return (x.UnreadCnt && x.UnreadCnt > 0) || this.conversUnread.indexOf(x.WeChatId + x.UserName) >= 0
        })
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.conversUnread = []
        conversList.forEach((x) => {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.conversUnread.push(x.WeChatId + x.UserName)
        })
      }
      if (this.unreadFlag !== 'notRead') {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.conversUnread = []
      }
      // 置顶的消息
      const tc = conversList.filter((x) => {
        return x.IsTop
      })
      // 其他的消息
      const nc = conversList.filter((x) => {
        return !x.IsTop
      })
      return tc.concat(nc).slice(0, this.maxNumber)
    },
    // 会话总数
    totalConvers() {
      let [...conversList] = this.allConversations
      if (this.filterWeChatId) {
        conversList = this.allConversations.filter((x) => {
          return x.WeChatId === this.filterWeChatId
        })
      }
      if (this.unreadFlag === 'friend') {
        conversList = conversList.filter((x) => {
          return x.UserName.indexOf('chatroom') < 0
        })
      } else if (this.unreadFlag === 'room') {
        conversList = conversList.filter((x) => {
          return x.UserName.indexOf('chatroom') > 0
        })
      } else if (this.unreadFlag === 'readed') {
        conversList = conversList.filter((x) => {
          return !x.UnreadCnt || x.UnreadCnt === 0
        })
      } else if (this.unreadFlag === 'notRead') {
        conversList = conversList.filter((x) => {
          return x.UnreadCnt && x.UnreadCnt > 0
        })
      }
      return conversList.length
    }
  },
  watch: {
    searchInfo() {
      this.debounceInput()
    }
  },
  created() {
    // 防抖
    this.debounceInput = this._.debounce(this.debounceInput, 500)
  },
  destroyed() {
    this.$store.commit('conversation/SET_CURRENT_FRIEND', null)
  },
  methods: {
    // 刷新
    freshAllConv() {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      let st = new Date().getTime() - 3 * 24 * 3600 * 1000
      if (this.startTime === 'week') {
        st = new Date().getTime() - 7 * 24 * 3600 * 1000
      } else if (this.startTime === 'month') {
        st = new Date().getTime() - 31 * 24 * 3600 * 1000
      } else if (this.startTime === 'all') {
        st = 0
      }
      if (this.filterWeChatId) {
        this.$store.commit('conversation/DELETE_CONVERSATIONS_BY_ID', this.filterWeChatId)
        TriggerConversationPushTask(this.filterWeChatId, this.currentUser.NickName, loginInfo.name, st)
      } else {
        this.$store.commit('conversation/RESET_CONVERSATIONS')
        for (const wechatItem of this.wechatsOnline) {
          TriggerConversationPushTask(wechatItem.WeChatId, this.currentUser.NickName, loginInfo.name, st)
        }
      }
    },
    // 滚动加载
    handlerScroll() {
      const st = document.getElementById('friends-list').scrollTop
      const ch = document.getElementById('friends-list').clientHeight
      const sh = document.getElementById('friends-list').scrollHeight
      if (st + ch + 2 >= sh) {
        if (this.maxNumber <= this.allConversations.length) {
          this.maxNumber = this.maxNumber + 5
        }
      }
    },
    // 搜索框防抖
    debounceInput() {
      if (this.searchInfo) {
        const result = this.allConversations.filter((x) => {
          return x.ShowName && x.ShowName.indexOf(this.searchInfo) >= 0
        })
        this.searchResult = result
      } else {
        this.searchResult = []
      }
    },
    // 消息免打扰
    msgSilent(message) {
      const content = {
        WeChatId: message.WeChatId, // 商家所属微信号
        ChatRoomId: message.UserName, // 群聊id
        Action: 6, // 指令
        IntValue: message.IsSilent ? 1 : 0 // IntValue=0 开启免打扰，IntValue=1 关闭免打扰
      }
      this.$store.dispatch('websocket/ChatRoomActionTask', content)
      this.$message.success('任务已经下发！')
    },
    // 消息置顶/取消置顶
    setTop(message) {
      const content = {
        WeChatId: message.WeChatId, // 商家所属微信号
        ChatRoomId: message.UserName, // 群聊id
        Action: 16, // 指令
        IntValue: message.IsTop ? 0 : 1 // IntValue=0 取消置顶，IntValue=1 置顶
      }
      this.$store.dispatch('websocket/ChatRoomActionTask', content)
      this.$message.success('任务已经下发！')
    }
  }
}
</script>

<style lang="scss" scoped>
.convers-list-all {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f8f8f8;
  border-right: solid #ededed 1px;
  padding: 0 5px;
  padding-right: 0;
  .all-convs-tabs {
    height: 40px;
    min-height: 40px;
    display: flex;
    align-items: center;
  }

  .search-box {
    padding: 5px 0 5px;
  }

  .friends-content {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;

    .friend-info {
      height: 59px;
      min-height: 59px;
      // width: 210px;
      overflow: hidden;
      display: flex;
      cursor: pointer;

      .avatar-tip {
        height: 59px;
        width: 59px;
        position: relative;
        display: flex;
        align-items: center;
        padding-left: 5px;
        .el-avatar {
          border-radius: 0;
        }
        .tip {
          width: 20px;
          height: 20px;
          line-height: 20px;
          position: absolute;
          top: 0px;
          right: 0px;
          background: red;
          border-radius: 10px;
          color: white;
          text-align: center;
        }
      }

      .nick-content {
        width: 220px;
        min-width: 220px;
        padding-left: 9px;
        display: flex;
        flex-direction: column;
        align-self: center;

        .friend-nick,
        .chat-content {
          height: 20px;
          line-height: 20px;
        }
        .friend-nick {
          color: #333333;
          font-size: 14px;
        }
        .chat-content {
          color: #999999;
          font-size: 12px;
        }
      }

      .time-disturb {
        width: 70px;
        min-width: 70px;
        color: #999999;
        display: flex;
        align-items: center;
        justify-content: space-around;
        flex-direction: column;
        .sigle-fresh:hover {
          color: #41c0fc;
        }
        .opration-btns {
          display: flex;
          justify-content: space-between;
          width: 50px;

          .top-convs {
            color: #ff9f00;
          }
          .msg-silent {
            color: #ff9f00;
          }
        }
      }

      &:hover {
        background-color: #efefef;
      }
    }
    .current-info-null {
      text-align: center;
      margin-top: 10px;
    }
    .selected {
      background-color: #efefef;
      &:hover {
        background-color: #efefef;
      }
    }
  }

  .operation-btns {
    background-color: #f3f3f3;
    height: 50px;
    min-height: 50px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    i {
      cursor: pointer;
    }
    p {
      margin-bottom: 0;
    }
  }
}
</style>
