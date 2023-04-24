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
    <div class="friend-item" @click="tabChange(1)">
      <div class="friend-item-head">新的朋友</div>
      <div class="friend-item-body" :class="{ 'friend-item-body-active': currentTab === 1 }">
        <div class="friend-item-body-left" style="background-color: #fa9d3b"><i class="el-icon-s-custom"></i></div>
        新的朋友
      </div>
    </div>
    <div class="friend-item" @click="tabChange(2)">
      <div class="friend-item-head">新添加的朋友</div>
      <div class="friend-item-body" :class="{ 'friend-item-body-active': currentTab === 2 }">
        <div class="friend-item-body-left" style="background-color: #0cc160"><i class="el-icon-s-custom"></i></div>
        新添加的朋友
      </div>
    </div>
    <el-collapse class="collapse" accordion>
      <!-- <el-collapse-item name="1">
        <template slot="title">
          新的朋友
          <span class="collapse-num">
            {{ friendsList.filter((item) => item.FriendType === 1).length }}
          </span>
        </template>
        <div
          id="friends-list"
          class="friends-content scroll"
          :style="{
            height: friendsList.filter((item) => item.FriendType === 1).length > 5 ? `${this.height}px` : 'auto'
          }"
        >
          <div
            v-for="(message, index) in friendsList.filter((item) => item.FriendType === 1)"
            :key="index"
            class="friend-info"
            :class="{
              selected: currentFriendId === message.FriendId
            }"
            @click="$parent.choseFriend(message)"
          >
            <div class="avatar-tip">
              <el-avatar :key="message.Avatar" shape="square" :size="45" :src="message.Avatar">
                <i class="fa fa-picture-o" aria-hidden="true" title="头像miss"></i>
              </el-avatar>
            </div>

            <div class="nick-content">
              <div class="friend-nick ellipsis" v-text="message.Memo || message.FriendNick"></div>
            </div>

            <div class="time-disturb">
              <div>
                <span v-if="message.AddStatus === 0">已添加</span>
                <span v-if="message.AddStatus !== 0">等待验证</span>
              </div>
              <div class="opration-btns"></div>
            </div>
          </div>
        </div>
      </el-collapse-item> -->
      <!-- <el-collapse-item name="2">
        <template slot="title">
          新添加的朋友
          <span class="collapse-num">
            {{ friendsList.filter((item) => item.FriendType === 2).length }}
          </span>
        </template>
        <div
          id="friends-list"
          class="friends-content scroll"
          :style="{
            height: friendsList.filter((item) => item.FriendType === 2).length > 5 ? `${this.height}px` : 'auto'
          }"
        >
          <div
            v-for="(message, index) in friendsList.filter((item) => item.FriendType === 2)"
            :key="index"
            class="friend-info"
            :class="{
              selected: currentFriendId === message.FriendId
            }"
            @click="$parent.choseFriend(message)"
          >
            <div class="avatar-tip">
              <el-avatar :key="message.Avatar" shape="square" :size="45" :src="message.Avatar">
                <i class="fa fa-picture-o" aria-hidden="true" title="头像miss"></i>
              </el-avatar>
            </div>

            <div class="nick-content">
              <div class="friend-nick ellipsis" v-text="message.Memo || message.FriendNick"></div>
            </div>

            <div class="time-disturb">
              <div>
                <span v-if="message.AddStatus === 0">已添加</span>
                <span v-if="message.AddStatus !== 0">等待验证</span>
              </div>
              <div class="opration-btns"></div>
            </div>
          </div>
        </div>
      </el-collapse-item> -->
      <el-collapse-item name="3">
        <template slot="title">
          企业微信联系人
          <span class="collapse-num">
            {{ friendsList.filter((item) => item.FriendType === 3).length }}
          </span>
        </template>
        <div
          id="friends-list"
          class="friends-content scroll"
          :style="{
            height: friendsList.filter((item) => item.FriendType === 3).length >= 5 ? `${this.height}px` : 'auto'
          }"
        >
          <div
            v-for="(message, index) in friendsList.filter((item) => item.FriendType === 3)"
            :key="index"
            class="friend-info"
            :class="{
              selected: currentFriendId === message.FriendId
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
              <div class="friend-nick ellipsis" v-text="message.Memo || message.FriendNick"></div>
            </div>
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item name="4">
        <template slot="title">
          联系人
          <span class="collapse-num">
            {{
              searchInfo
                ? searchResult.filter((item) => item.FriendType === 4).length
                : friendsList.filter((item) => item.FriendType === 4).length
            }}
          </span>
        </template>
        <div
          id="friends-list"
          class="friends-content scroll"
          :style="{
            height: searchInfo
              ? searchResult.filter((item) => item.FriendType === 4).length >= 5
                ? `${this.height}px`
                : 'auto'
              : resetFriends.filter((item) => item.FriendType === 4).length >= 5
              ? `${this.height}px`
              : 'auto'
          }"
          @scroll="handlerScroll"
        >
          <div
            v-for="(message, index) in searchInfo
              ? searchResult.filter((item) => item.FriendType === 4)
              : resetFriends.filter((item) => item.FriendType === 4)"
            :key="index"
            class="friend-info"
            :class="{
              selected: currentFriendId === message.FriendId
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
              <div class="friend-nick ellipsis" v-text="message.Memo || message.FriendNick"></div>
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

    <div style="display: flex; justify-content: center; margin-top: 5px" v-if="loading">
      <el-button style="width: 140px; height: 30px; line-height: 30px; padding: 0" :loading="loading">
        数据更新中
      </el-button>
    </div>
  </div>
</template>

<script>
import { login } from '@/api/httpApiAdmin'
import { mapGetters, mapState } from 'vuex'
import Bus from '@/utils/bus'
export default {
  data() {
    return {
      maxNumber: 20, // 默认显示20条数据
      searchInfo: '', // 搜索内容
      searchResult: [], // 搜索结果
      chatToDel: {}, // 右键选择的message
      contactPersons: [],
      contactPerson: {
        page: 0
      },
      height: 0,
      currentTab: undefined
    }
  },
  computed: {
    ...mapState('nedb', {
      friendsList: 'friends' // 当前的通讯录列表
    }),
    ...mapState({
      loading: 'loading'
    }),
    ...mapGetters({
      currentFriendId: 'conversation/currentFriendId', // 当前页面回显
      currentWeChatId: 'conversation/currentWeChatId' // 当前选择的微信
    }),
    // 按条件重新排序好友列表
    resetFriends() {
      return this.friendsList.slice(0, this.maxNumber)
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
    window.onresize = () => {
      const dom = document.querySelector('.conversation-friends')
      const height = dom.getBoundingClientRect().height
      this.height = height - 42 - 10 - 36 * 2 - 89 * 2
    }
  },
  mounted() {
    const dom = document.querySelector('.conversation-friends')
    const height = dom.getBoundingClientRect().height
    this.height = height - 42 - 10 - 36 * 2 - 89 * 2

    Bus.$on('tagChange', (tab) => {
      if (tab !== 'friends') {
        Bus.$emit('friendsClick', undefined)
      }
    })
  },
  activated() {
    Bus.$emit('friendsClick', this.currentTab)
  },
  methods: {
    // 滚动加载
    handlerScroll() {
      const st = document.getElementById('friends-list').scrollTop
      const ch = document.getElementById('friends-list').clientHeight
      const sh = document.getElementById('friends-list').scrollHeight
      if (st + ch + 2 >= sh) {
        if (this.maxNumber <= this.resetFriends.length) {
          this.maxNumber = this.maxNumber + 5
        }
      }
    },
    // 搜索框防抖
    debounceInput() {
      if (this.searchInfo) {
        const result = this.friendsList.filter((x) => {
          if (x.FriendNick && x.FriendNick.indexOf(this.searchInfo) >= 0) {
            return x
          } else if (x.Memo && x.Memo.indexOf(this.searchInfo) >= 0) {
            return x
          } else if (x.FriendNo && x.FriendNo.indexOf(this.searchInfo) >= 0) {
            return x
          } else if (x.FriendId && x.FriendId.indexOf(this.searchInfo) >= 0) {
            return x
          }
        })
        this.searchResult = result
      } else {
        this.searchResult = []
      }
    },
    // 删除好友
    deleteFriend(chatToDel) {
      this.$confirm('此操作将删除该好友, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$store.dispatch('websocket/DeleteFriendTask', chatToDel)
          this.$message({
            type: 'info',
            message: '正在删除!'
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    tabChange(tab) {
      this.currentTab = tab
      Bus.$emit('friendsClick', tab)
      this.$store.commit('conversation/SET_CURRENT_FRIENDS', { WeChatId: this.currentWeChatId })
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
  .friend-item {
    cursor: pointer;
    margin: 2px -5px 0;
    .friend-item-head {
      color: #999999;
      padding-left: 8px;
      margin: 4px 0;
    }
    .friend-item-body {
      color: #333333;
      font-size: 16px;
      height: 58px;
      display: flex;
      align-items: center;
      padding-left: 8px;
      .friend-item-body-left {
        width: 45px;
        height: 45px;
        line-height: 45px;
        text-align: center;
        border-radius: 2px;
        margin-right: 10px;
        .el-icon-s-custom {
          font-size: 24px;
          color: #fff;
        }
      }
    }
    .friend-item-body-active {
      background-color: #efefef;
    }
  }

  .friends-content {
    position: relative;
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
          border: solid red 1px;
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
        width: 155px;
        min-width: 155px;
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

  :deep(.collapse) {
    .collapse-num {
      position: absolute;
      right: 25px;
      color: #999999;
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
}
</style>
