<template>
  <div class="conversation-chats">
    <!-- 好友信息 -->
    <div class="chats-title" v-if="!friendTab">
      <div class="chats-title-container">
        <!-- 昵称 -->
        <span
          class="nick-name ellipsis"
          v-text="currentFriend.Memo || currentFriend.ShowName || currentFriend.NickName || currentFriend.FriendNick"
        ></span>
        <div
          v-if="currentFriend.MemberList"
          class="members-number"
          v-text="'(' + currentFriend.MemberList.length + ')'"
        ></div>

        <div style="color: #ff931f; margin-left: 6px" v-if="currentFriend.ChatRoomType === 2">
          <img style="margin-right: 5px; width: 24px" src="@/assets/images/qw_.png" alt="" />
          {{ currentFriend.companyName }}
        </div>
        <!-- 性别 -->
        <!-- <div v-if="currentFriend.Gender" class="gender" v-text="['女', '男'][currentFriend.Gender]"></div> -->
        <!-- 地址 -->
        <!-- <div v-if="currentFriend.Province" class="address" v-text="currentFriend.Province"></div>
      <div v-if="currentFriend.City" class="address" v-text="currentFriend.City"></div> -->
      </div>
    </div>
    <div v-else class="chat-friends">
      <span v-if="friendTab === 1">新的朋友</span>
      <span v-if="friendTab === 2">新添加的朋友</span>
    </div>
    <!-- 输入/输出 -->
    <div class="chats-content scroll">
      <div class="notice" v-if="currentFriendId.endsWith('@chatroom') && currentFriend.Notice">
        <div class="notice-body" @click="noticeModalAction">
          <img src="@/assets/images/notice.png" alt="" />
          <div class="notice-body-content ellipsis">{{ currentFriend.Notice }}</div>
          <i class="el-icon-arrow-right"></i>
        </div>
      </div>

      <ShowChats class="show-chats" v-show="currentFriend._isChat || (tab !== 'friends' && currentFriend.WeChatId)" />

      <div class="input-window" v-show="currentFriend._isChat || (tab !== 'friends' && currentFriend.WeChatId)">
        <ToolsBar />
        <AnswerWindow />
      </div>

      <Info
        v-if="tab === 'friends' && !currentFriend._isChat && currentFriend.FriendId && !friendTab"
        :currentFriend="currentFriend"
        @canChat="canChat"
      />

      <Friends v-if="friendTab" :tab="friendTab" />
    </div>

    <el-dialog
      width="570px"
      class="notice-modal"
      append-to-body
      :visible="noticeModal.visible"
      :before-close="noticeModalClose"
      :show-close="false"
      destroy-on-close
    >
      <div class="notice-modal-title" slot="title">
        <div>“{{ currentFriend.NickName }}”的群公告</div>
        <i class="el-icon-circle-close" @click="noticeModalClose"></i>
      </div>
      <div class="notice-modal-body">
        <div class="notice-modal-body-head">
          <el-avatar shape="square" :size="32" :src="currentFriend.FromAvatar"></el-avatar>
          <div>
            <div>{{ currentFriend.FromNickName }}</div>
            <div></div>
          </div>
        </div>
        <el-input
          :disabled="!isOwner"
          v-model="currentFriend.Notice"
          type="textarea"
          :rows="4"
          placeholder="请输入"
        ></el-input>
      </div>

      <span slot="footer">
        <el-button @click="noticeModalClose">{{ isOwner || isManager ? '取 消' : '非群主，群管理无法操作' }}</el-button>
        <el-button v-if="isOwner || isManager" type="primary" @click="noticeModalConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import bus from '@/utils/bus'
import { mapGetters, mapState } from 'vuex'
import ToolsBar from './ToolsBar'
import AnswerWindow from './AnswerWindow'
import ShowChats from './ShowChats'
import Info from './Info'
import Friends from './Friends.vue'
import { TriggerHistoryMsgPushTask } from '@/api/webSocketApi'

export default {
  components: {
    ToolsBar,
    AnswerWindow,
    ShowChats,
    Info,
    Friends
  },
  data() {
    return {
      tab: undefined,
      friendTab: undefined,
      noticeModal: { visible: false }
    }
  },
  computed: {
    ...mapState(['currentUser']),
    ...mapGetters({
      currentFriend: 'conversation/currentFriend',
      currentFriendId: 'conversation/currentFriendId',
      currentWeChatId: 'conversation/currentWeChatId',
      currentWechat: 'conversation/currentWechat'
    }),
    isOwner() {
      if (this.currentFriend.ShowNameList) {
        return this.currentFriend.ShowNameList.find(
          (item) => item.UserName === this.currentFriendId && item.Identity.includes(2)
        )
      }
      return false
    },
    isManager() {
      if (this.currentFriend.ShowNameList) {
        return this.currentFriend.ShowNameList.find(
          (item) => item.UserName === this.currentFriendId && item.Identity.includes(3)
        )
      }
      return false
    }
  },
  methods: {
    canChat() {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      this.$store.commit('conversation/SET_CURRENT_FRIENDS', {
        ...this.currentFriend,
        _isChat: true
      })

      TriggerHistoryMsgPushTask(
        this.currentWeChatId,
        this.currentFriendId,
        this.currentUser.NickName,
        loginInfo.name,
        0,
        0,
        10
      )
    },

    noticeModalAction() {
      this.noticeModal.visible = true
    },

    noticeModalClose() {
      this.noticeModal.visible = false
    },
    noticeModalConfirm() {
      this.noticeModal.visible = false
      this.updateInfo(1, 'Notice')
    }
  },
  mounted() {
    bus.$on('tagChange', (tab) => {
      this.tab = tab
      console.log(this.friendTab)
    })
    bus.$on('friendsClick', (tab) => {
      this.friendTab = tab
    })

    bus.$on('roomNotice', () => {
      this.noticeModalAction()
    })
  }
}
</script>

<style lang="scss" scoped>
.conversation-chats {
  min-width: 350px;
  height: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #fff;
  border-right: solid #fff 1px;

  .chats-title {
    height: 60px;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    color: #333333;
    justify-content: flex-start;
    padding: 0 15px 0 5px;
    border-bottom: solid #f5f5f5 1px;
    background-color: #f3f3f3;
    .nick-name,
    .gender,
    .address,
    .members-number {
      font-size: 20px;
      margin-left: 10px;
    }
    .nick-name {
    }
    .chats-title-container {
      width: 20vw;
      flex-grow: 1;
      display: flex;
      align-items: center;
    }
  }
  .chat-friends {
    height: 60px;
    line-height: 60px;
    font-size: 20px;
    padding-left: 20px;
    border-bottom: solid #f5f5f5 1px;
    background-color: #f3f3f3;
    color: #333333;
    font-size: 20px;
  }

  .chats-content {
    position: relative;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    border-right: 1px solid rgba(#000000, 0.06);
    .input-window {
      height: 35%;
      background: white;
      width: 100%;
      display: flex;
      flex-direction: column;
    }
  }
}
.notice {
  position: sticky;
  cursor: pointer;
  background-color: #f9f9f9;
  .notice-body {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
    margin: 0 5px;
    background-color: #fff;
    box-shadow: 0px 10px 2px rgba(#000000, 0.06);
    img {
      width: 16px;
    }
    .notice-body-content {
      width: 30vw;
      flex-grow: 1;
      margin: 0 10px;
    }
    .el-icon-arrow-right {
      float: right;
    }
  }
}
</style>

