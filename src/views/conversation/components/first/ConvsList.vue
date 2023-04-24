<template>
  <div class="conversation-friends">
    <el-row class="action-btns" type="flex" justify="center">
      <!-- <el-button size="small" @click="autoRead">一键设为已读</el-button>
      <el-button size="small" :type="onlyUnRead ? 'warning' : 'plain'" @click="findUnReadMsg">仅展示未读</el-button> -->
      <el-button
        size="small"
        :class="{ 'el-button-active': currentSwitchConversation === 'all' }"
        @click="conversationSwitch('all')"
      >
        全部会话
      </el-button>

      <el-button
        size="small"
        :class="{ 'el-button-active': currentSwitchConversation === 'single' }"
        @click="conversationSwitch('single')"
      >
        私聊会话
      </el-button>
      <el-button
        size="small"
        :class="{ 'el-button-active': currentSwitchConversation === 'chatRoom' }"
        @click="conversationSwitch('chatRoom')"
      >
        群聊会话
      </el-button>
    </el-row>
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
      ></el-input>
    </div>
    <el-collapse v-model="currentTag" id="conversation_collapse" class="collapse scroll" accordion @change="tagChange">
      <el-collapse-item title="所有用户" :name="i" v-for="(item, i) in tags" :key="i">
        <template slot="title">
          <div class="collapse-title ellipsis">{{ item }}</div>
          <span class="collapse-num">
            <a-badge :count="conversationMessageCount(item)" :number-style="{ backgroundColor: '#FF5722' }" />
          </span>
        </template>

        <div v-if="currentTag === i" id="friends-list" class="friends-content">
          <div
            v-for="(message, index) in searchInfo ? searchResult : [...conversations]"
            :key="index"
            class="friend-info"
            :class="{
              selected: currentFriendId === message.UserName,
              top: message.IsTop,
              'top-selected': message.IsTop && currentFriendId === message.UserName
            }"
            @click="$parent.choseFriend(message)"
            @mouseenter="conversationMouseEnter(message)"
            @mouseleave="conversationMouseLeave(message)"
          >
            <a-dropdown :trigger="['contextmenu']">
              <div
                :style="{
                  display: 'flex'
                }"
              >
                <!-- 头像和提示 -->
                <div class="avatar-tip">
                  <!-- 头像 -->
                  <el-avatar :key="message.Avatar" shape="square" :size="45" :src="message.Avatar">
                    <i class="fa fa-picture-o" aria-hidden="true" title="头像miss"></i>
                  </el-avatar>
                  <!-- 未读消息数 -->
                  <div
                    v-if="
                      !message.IsSilent &&
                      message.UnreadCnt &&
                      message.Digest &&
                      !message.Digest.startsWith('你已添加了') &&
                      !message.Digest.startsWith('以上是打招呼的内容')
                    "
                    class="tip"
                    :title="message.UnreadCnt"
                    v-text="message.UnreadCnt < 99 ? message.UnreadCnt : '99+'"
                  ></div>
                  <span v-if="message.PrivateMsgEnable" class="tag-interval">内部聊天</span>
                </div>
                <!-- 昵称和消息内容 -->
                <div class="nick-content">
                  <!-- 昵称 -->
                  <div class="friend-nick" v-if="message.ShowName">
                    <span style="display: inline-block; max-width: 80%" class="ellipsis">
                      {{ message.ShowName.length > 7 ? message.ShowName.slice(0, 9) + '...' : message.ShowName }}
                    </span>

                    <img
                      v-if="message.ChatRoomType === 2"
                      style="margin-left: 2px; width: 16px; height: 16px; flex-shrink: 0"
                      src="@/assets/images/qw_.png"
                      alt=""
                    />
                    <img
                      v-if="message.IsSpecialAttention"
                      style="margin-left: 2px; width: 16px; height: 16px; flex-shrink: 0"
                      src="@/assets/images/star.png"
                      alt=""
                    />
                  </div>
                  <!-- 消息内容 -->
                  <div v-if="message.Digest" class="chat-content ellipsis">
                    <!-- <span v-if="message.hasOwnProperty('AtCount') " style="color:red;">[有人@你]</span> -->
                    <span v-if="message.AtCount" style="color: red">[有人@你]</span>
                    <span v-text="message.Digest.replace('%s:', '')"></span>
                  </div>
                  <div v-else class="chat-content ellipsis" v-text="''"></div>
                </div>
                <!-- 时间 | 刷新 | 置顶 | 免打扰 -->
                <div class="time-disturb">
                  <div style="font-size: 12px" v-text="$options.filters.transformTime(message.UpdateTime)"></div>
                  <div class="opration-btns">
                    <template>
                      <!-- 置顶 -->
                      <i
                        v-if="currentHoverConversation.UserName === message.UserName"
                        class="el-icon-upload2"
                        :class="{ 'top-convs': message.IsTop }"
                        aria-hidden="true"
                        title="置顶"
                        @click.stop="setTop(message)"
                      ></i>
                      <!-- 刷新 -->
                      <!-- <i
                class="fa fa-retweet sigle-fresh"
                aria-hidden="true"
                @click.stop="$parent.getFriendDetail(message)"
              ></i> -->
                      <!-- 免打扰 -->
                      <i v-if="message.IsSilent" class="el-icon-close-notification" title="免打扰"></i>
                      <!-- 设为未读 -->
                      <!-- <i
                v-if="!message.UnreadCnt"
                class="el-icon-warning-outline"
                aria-hidden="true"
                @click.stop="setUnread(message)"
              ></i> -->
                    </template>
                  </div>
                </div>
              </div>
              <a-menu slot="overlay">
                <a-menu-item key="1" @click="setTop(message)">{{ message.IsTop ? '取消置顶' : '置顶' }}</a-menu-item>
                <a-menu-item key="2" @click="follow(message)">
                  {{ message.IsSpecialAttention ? '取消特别关注' : '特别关注' }}
                </a-menu-item>
                <a-menu-item key="3" @click="updateInfo(30, message)">
                  {{ message.IsSilent ? '取消免打扰' : '消息免打扰' }}
                </a-menu-item>
                <a-menu-item key="4" v-if="message.UserName.indexOf('chatroom') > 0">修改群聊名称</a-menu-item>
                <a-menu-item key="5" v-if="message.UserName.indexOf('chatroom') > 0">设置备注</a-menu-item>
                <a-menu-item key="6" v-if="message.UserName.indexOf('chatroom') === -1">查看详细资料</a-menu-item>
              </a-menu>
            </a-dropdown>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { TriggerConversationPushTask, TriggerUnReadTask } from '@/api/webSocketApi'
import Bus from '@/utils/bus'
// const notifyImg = require('assets/svg/conversation-notify-message.svg')
export default {
  components: {},
  data() {
    return {
      maxNumber: 20, // 默认显示20条数据
      searchInfo: '', // 搜索内容
      searchResult: [], // 搜索结果
      onlyUnRead: false, // 只展示未读
      conversUnread: [],
      currentReadIndex: 0,
      scrollBar: {
        isClick: false
      },

      currentHoverConversation: {},

      currentSwitchConversation: 'all',
      tags: ['所有客户'],
      currentTag: 0,
      currentConversations: []
    }
  },
  computed: {
    ...mapState(['currentUser', 'set']),
    ...mapState('conversation', {
      conversationsData: 'conversations'
    }),
    ...mapGetters({
      currentConvs: 'conversation/currentConvs', // 会话列表
      currentFriendId: 'conversation/currentFriendId', // 当前页面回显
      currentWeChatId: 'conversation/currentWeChatId', // 当前选择的微信
      currentFriend: 'conversation/currentFriend',
      currentWechat: 'conversation/currentWechat'
    }),
    // 按条件重新排序会话列表
    conversations: {
      get() {
        if (this.onlyUnRead) {
          const cl = this.currentConvs
            .slice(0, this.set.conversationSetNum)
            .filter(
              (x) =>
                !!x.UnreadCnt ||
                (this.conversUnread.indexOf(x.WeChatId + x.UserName) >= 0 &&
                  (this.set.isFilterConversation ? !x.UserName.startsWith('gh_') : true) &&
                  this.switchConversationTab(x))
            )
          return cl
        } else {
          // 置顶的消息
          const tc = this.currentConvs
            .slice(0, this.set.conversationSetNum)
            .filter(
              (x) =>
                x.IsTop &&
                (this.set.isFilterConversation ? !x.UserName.startsWith('gh_') : true) &&
                this.switchConversationTab(x)
            )
          // 其他的消息
          const nc = this.currentConvs
            .slice(0, this.set.conversationSetNum)
            .filter(
              (x) =>
                !x.IsTop &&
                (this.set.isFilterConversation ? !x.UserName.startsWith('gh_') : true) &&
                this.switchConversationTab(x)
            )
          //const cif = tc.concat(nc).slice(0, this.maxNumber)
          const cif = tc.concat(nc)
          return cif
        }
      }
    }
  },
  watch: {
    searchInfo() {
      this.scrollToTop()
      this.debounceInput()
    },
    // 切换微信 重置最大显示条数
    currentWeChatId() {
      this.onlyUnRead = false
      this.conversUnread = []

      this.$nextTick(() => {
        //回到顶部
        this.scrollToTop()
      })
    },
    'set.conversationSetNum'(val) {
      this.scrollToTop()
    },
    'set.isFilterConversation'(val) {
      this.scrollToTop()
    },
    currentSwitchConversation() {
      if (this.searchInfo) {
        const result = this.currentConvs.filter((x) => {
          return x.ShowName && x.ShowName.indexOf(this.searchInfo) >= 0 && this.switchConversationTab(x)
        })
        this.searchResult = result
      } else {
        this.searchResult = []
      }
    }
  },
  created() {
    // 防抖
    this.debounceInput = this._.debounce(this.debounceInput, 500)
    Bus.$on('weChatDoubleClick', (weChat) => {
      const dom = document.querySelector('#conversation_collapse')
      const scrollTop = dom.scrollTop
      const scrollHeight = dom.scrollHeight
      const clientHeight = dom.clientHeight
      this.currentReadIndex = Math.floor((scrollTop - 36 * (this.currentTag + 1)) / 59)
      this.currentReadIndex = this.currentConversations.findIndex(
        (item, index) => item.UnreadCnt > 0 && index > this.currentReadIndex
      )
      //console.log(scrollHeight, scrollTop, this.currentReadIndex)
      if (this.currentReadIndex !== -1) {
        dom.scrollTo(0, 59 * this.currentReadIndex + 36 * (this.currentTag + 1))
        if (scrollTop === scrollHeight - clientHeight) {
          dom.scrollTo(0, 0)
        }
      } else {
        this.currentReadIndex = 0
        dom.scrollTo(0, 0)
      }
      //console.log(this.currentReadIndex)
    })

    Bus.$on('weChatClick', (weChat) => {
      const dom = document.querySelector('#conversation_collapse')
      dom.scrollTo(0, 0)
    })
  },
  destroyed() {
    Bus.$off('weChatDoubleClick')
    Bus.$off('weChatClick')
  },
  methods: {
    switchConversationTab(message) {
      let switchConversationTab = true
      if (this.currentSwitchConversation === 'single') {
        switchConversationTab = message.UserName.indexOf('chatroom') === -1
      }
      if (this.currentSwitchConversation === 'chatRoom') {
        switchConversationTab = message.UserName.indexOf('chatroom') > 0
      }
      return switchConversationTab
    },
    // 一键设为已读
    autoRead() {
      this.currentConvs.forEach((x) => {
        if (x.UnreadCnt > 0) {
          this.$parent.setMessageRead(x)
        }
      })
    },
    // 快速定位未消息 默认定位到第一个未读消息
    findUnReadMsg() {
      this.onlyUnRead = !this.onlyUnRead
      if (this.onlyUnRead) {
        const unreadedConvs = []
        this.currentConvs.forEach((x) => {
          if (x.UnreadCnt) {
            unreadedConvs.push(x.WeChatId + x.UserName)
          }
        })
        this.conversUnread = unreadedConvs
      } else {
        this.conversUnread = []
      }
      // let findIndex = -1
      // for (let index = 0; index < this.currentConvs.length; index++) {
      //   const element = this.currentConvs[index]
      //   if (!element.IsSilent && element.UnreadCnt > 0) {
      //     findIndex = index
      //     break
      //   }
      // }
      // if (findIndex >= this.maxNumber) {
      //   this.maxNumber = 20 + 5 * Math.ceil((findIndex + 1 - this.maxNumber) / 5)
      // }
      // setTimeout(() => {
      //   // 修改scroll
      //   const showDiv = document.getElementById('friends-list')
      //   if (findIndex !== -1 && showDiv.scrollHeight > showDiv.clientHeight) {
      //     showDiv.scrollTop = findIndex * 59
      //   }
      // }, ~~(findIndex / 20) * 100)
    },

    // 搜索框防抖
    debounceInput() {
      if (this.searchInfo) {
        const result = this.currentConvs.filter((x) => {
          return x.ShowName && x.ShowName.indexOf(this.searchInfo) >= 0 && this.switchConversationTab(x)
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
      //this.$message.success('任务已经下发！')
    },
    // 设为未读
    setUnread(message) {
      TriggerUnReadTask(message.WeChatId, message.UserName)
      // 本地设为未读
      this.$store.commit('conversation/SET_CONV_UNREAD', message)
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
      //this.$message.success('任务已经下发！')
    },
    follow(message) {
      const content = {
        WeChatId: message.WeChatId,
        ChatRoomId: message.UserName,
        Action: 34,
        IntValue: message.IsSpecialAttention ? 0 : 1
      }
      this.$store.dispatch('websocket/ChatRoomActionTask', content)
    },
    // 获取更多会话
    queryMoreConv(flag) {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      const ccl = this.currentConvs.length
      if (flag === 'all' || ccl === 0) {
        TriggerConversationPushTask(this.currentWeChatId, this.currentUser.NickName, loginInfo.name, 0)
        return
      }
      if (ccl > 0) {
        const et = this.currentConvs[ccl - 1].UpdateTime
        const st = et - 3 * 24 * 60 * 60 * 1000
        TriggerConversationPushTask(this.currentWeChatId, this.currentUser.NickName, loginInfo.name, st, et)
      }
    },

    conversationMouseEnter(message) {
      this.currentHoverConversation = message
    },
    conversationMouseLeave() {
      this.currentHoverConversation = {}
    },

    scrollToTop() {
      this.$nextTick(() => {
        const dom = document.getElementById('conversation_collapse')
        dom.scrollTo(0, 0)
      })
    },

    updateInfo(type, message) {
      const content = {
        WeChatId: message.WeChatId,
        ChatRoomId: message.UserName, // 群聊id
        Action: type, // 指令
        Content: !message.IsSilent
      }
      this.$store.dispatch('websocket/ChatRoomActionTask', content)
    },

    conversationSwitch(tab) {
      this.currentSwitchConversation = tab
    },
    tagChange() {
      const data = this.searchInfo ? this.searchResult : this.conversations
      this.currentConversations = [...this.conversations]
    },
    conversationMessageCount(item) {
      let count = 0
      if (this.searchInfo) {
        this.searchResult.forEach((conversation) => (count += conversation.UnreadCnt))
      } else {
        this.conversations.forEach((conversation) => (count += conversation.UnreadCnt))
      }

      return count
    }
  },
  mounted() {}
}
</script>

<style lang="scss" scoped>
.conversation-friends {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f8f8f8;
  border-right: solid #ededed 1px;
  padding-top: 5px;
  user-select: none;
  .search-box {
    padding: 5px;
  }

  .friends-content {
    position: relative;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    &::-webkit-scrollbar {
      display: none;
    }
    #scroll-bar {
      position: absolute;
      top: 0;
      right: 0;
      width: 8px;
      height: 0px;
      border-radius: 4px;
      background-color: #dedede;
      &:hover {
        background-color: rgba(0, 0, 0, 0.2);
      }
    }

    .friend-info {
      height: 59px;
      min-height: 59px;
      // width: 210px;
      //overflow: hidden;
      display: flex;
      cursor: pointer;
      //border-bottom: 1px solid #f5f5f5;
      &:nth-last-child(2) {
        border-bottom: none;
      }
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
          min-width: 20px;
          height: 20px;
          line-height: 20px;
          padding: 0 5px;
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
        width: 160px;
        min-width: 160px;
        padding-left: 9px;
        display: flex;
        flex-direction: column;
        align-self: center;

        :deep(.friend-nick),
        .chat-content {
          width: 160px;
          height: 20px;
          line-height: 20px;
          .el-badge__content {
            height: auto;
            top: 0px;
            right: 0;
          }
        }
        .friend-nick {
          display: flex;
          align-items: center;
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
        justify-content: space-between;
        flex-direction: column;
        padding: 8px 0;
        .sigle-fresh:hover {
          color: #41c0fc;
        }
        .opration-btns {
          display: flex;
          justify-content: center;
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
        background-color: #e8e6e6;
      }

      .tag-interval {
        position: absolute;
        bottom: 5px;
        right: 3px;
        width: 100%;
        color: rgba(256, 256, 256, 0.85);
        background-color: #1b7fff;
        padding: 0 4px;
        font-size: 12px;
        text-align: center;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        transform: scale(0.83);
      }
    }
    .friend-info-support {
      background-color: rgba(0, 0, 0, 0.05);
    }
    .current-info-null {
      text-align: center;
      margin-top: 10px;
    }
    .selected {
      background-color: #c9c7c6;
      &:hover {
        background-color: #c9c7c6;
      }
    }
    .top {
      background-color: #dddede;
      &:hover {
        background-color: #dfdbdb;
      }
    }
    .top-selected {
      background-color: #c9c7c6;
      &:hover {
        background-color: #c9c7c6;
      }
    }
  }
}

:deep(.collapse) {
  flex-grow: 1;
  overflow-y: auto;
  border: none;
  .collapse-title {
    width: 60%;
  }
  .collapse-num {
    position: absolute;
    right: 25px;
    color: #999999;
  }
  &::-webkit-scrollbar {
    display: none;
  }
  .el-collapse-item:last-child {
    margin-bottom: 0;
    .el-collapse-item__header {
      border: none;
    }
  }
  .el-collapse-item__header {
    position: relative;
    height: 36px;
    line-height: 36px;
    padding-left: 10px;
    background-color: #f8f8f8;
    font-size: 14px;
    color: #333;
  }
  .el-collapse-item__wrap {
    border-bottom: none;
    background-color: #f8f8f8;
    .el-collapse-item__content {
      padding-bottom: 0;
    }
  }
}
.action-btns {
  margin: 5px;
  .el-button {
    width: 48%;

    &:hover {
      background-color: #0cc160;
      color: #fff;
      border-color: #0cc160;
    }
  }
  .el-button-active {
    background-color: #0cc160;
    color: #fff;
    border-color: #0cc160;

    &:active {
      filter: opacity(80%);
    }
  }
}
</style>
