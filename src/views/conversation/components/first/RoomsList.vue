<template>
  <div class="conversation-friends">
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
        @keyup.enter.native="searchChange"
        clearable
      ></el-input>
    </div>

    <!-- 会话列表 | 好友列表 | 群聊列表 -->
    <div id="friends-list" class="friends-content scroll" @scroll="handlerScroll">
      <!-- 会话|通讯录|群聊|搜索结果 -->
      <div
        v-for="(message, index) in searchInfo ? searchResult : resetRooms"
        :key="index"
        class="friend-info"
        :class="{
          selected: currentFriendId === message.UserName
        }"
        @click="$parent.choseFriend(message)"
      >
        <!-- 头像和提示 -->
        <div class="avatar-tip">
          <!-- 头像 -->
          <el-avatar :key="message.Avatar" shape="square" :size="45" :src="message.Avatar">
            <i class="fa fa-picture-o" aria-hidden="true" title="头像miss"></i>
          </el-avatar>
        </div>
        <!-- 昵称和消息内容 -->
        <div class="nick-content">
          <!-- 昵称 -->
          <div class="friend-nick ellipsis" v-text="message.NickName"></div>
        </div>
        <!-- 时间 | 刷新 | 置顶 | 免打扰 -->
        <div class="time-disturb">
          <div class="opration-btns">
            <!-- 刷新 -->
            <!-- <i class="fa fa-retweet sigle-fresh" aria-hidden="true" @click.stop="$parent.getFriendDetail(message)"></i>
            <i
              class="el-icon-close-notification"
              aria-hidden="true"
              :class="{
                'msg-silent': !message.MsgSilent
              }"
              @click="msgSilent(message.UserName, !message.MsgSilent)"
            ></i> -->
          </div>
        </div>
      </div>
      <div v-if="currentWeChatId && maxNumber >= roomsList.length" class="current-info-null">数据已经到底了！</div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  data() {
    return {
      maxNumber: 20, // 默认显示20条数据
      searchInfo: '', // 搜索内容
      searchResult: [], // 搜索结果
      chatToDel: {} // 右键选择的message
    }
  },
  computed: {
    ...mapState('nedb', {
      roomsList: 'chatRooms' // 当前的群聊列表
    }),
    ...mapGetters({
      currentFriendId: 'conversation/currentFriendId', // 当前页面回显
      currentWeChatId: 'conversation/currentWeChatId' // 当前选择的微信
    }),

    // 按条件重新排序群聊列表
    resetRooms() {
      return this.roomsList.slice(0, this.maxNumber)
    }
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    searchInfo(val) {
      this.debounceInput()
    },
    // 切换微信 重置最大显示条数
    currentWeChatId() {
      this.maxNumber = 20
    }
  },
  created() {
    // 防抖
    this.debounceInput = this._.debounce(this.debounceInput, 500)
  },
  methods: {
    // 滚动加载
    handlerScroll() {
      const st = document.getElementById('friends-list').scrollTop
      const ch = document.getElementById('friends-list').clientHeight
      const sh = document.getElementById('friends-list').scrollHeight
      if (st + ch + 2 >= sh) {
        if (this.maxNumber < this.roomsList.length) {
          this.maxNumber = this.maxNumber + 2
        }
      }
    },
    // 搜索框防抖
    debounceInput() {
      if (this.searchInfo) {
        const result = this.roomsList.filter((x) => {
          if (x.NickName && x.NickName.indexOf(this.searchInfo) >= 0) {
            return x
          } else if (x.Memo && x.Memo.indexOf(this.searchInfo) >= 0) {
            return x
          }
        })
        this.searchResult = result
      } else {
        this.searchResult = []
      }
    },
    // 消息免打扰
    msgSilent(chatRoomID, flag) {
      const content = {
        WeChatId: this.currentWeChatId, // 商家所属微信号
        ChatRoomId: chatRoomID, // 群聊id
        Action: 6, // 指令
        IntValue: flag ? 1 : 0 // IntValue=0 开启免打扰，IntValue=1 关闭免打扰
      }
      this.$store.dispatch('websocket/ChatRoomActionTask', content)
      // 退出登录的loading
      const loading = this.$loading({
        lock: true,
        text: '正在执行操作',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      setTimeout(() => {
        loading.close()
      }, 2000)
    }
  }
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
  padding: 5px;

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
          border: solid red 1px;
          min-width: 20px;
          height: 20px;
          position: absolute;
          top: 0px;
          right: 0px;
          padding: 0 5px;
          background: red;
          border-radius: 10px;
          color: white;
          text-align: center;
        }
      }

      .nick-content {
        width: 120px;
        min-width: 120px;
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
}
</style>
