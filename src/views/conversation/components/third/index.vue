<template>
  <div class="conversation-tools">
    <ul class="reply-nav">
      <li
        class="reply-nav-item"
        :class="{ 'reply-nav-item-checked': currentPage === 'FastReply' }"
        @click="setCurrentPage('FastReply')"
      >
        话术中心
      </li>
      <li
        class="reply-nav-item"
        :class="{ 'reply-nav-item-checked': currentPage === 'Cut' }"
        @click="setCurrentPage('Cut')"
      >
        剪切板
      </li>
      <li
        class="reply-nav-item"
        :class="{ 'reply-nav-item-checked': currentPage === 'FriendInfo' || currentPage === 'ChatRoomManager' }"
        @click="setCurrentPage('InfoManager')"
      >
        信息管理
      </li>
    </ul>
    <keep-alive>
      <component
        :is="currentPage"
        v-if="['FriendInfo', 'FastReply', 'ChatRoomManager', 'Cut'].includes(currentPage)"
      ></component>
    </keep-alive>
  </div>
</template>

<script>
import bus from '@/utils/bus'
import { mapGetters } from 'vuex'
import { getCommonTerms, gridDataGet, gridInfoGet, gridInfoSet, userInfoGet } from '@/api/httpApi'

import FastReply from './Word.vue'
const FriendCircle = () => import(/* webpackChunkName: "conversation" */ './FriendCircle.vue')
const FriendInfo = () => import(/* webpackChunkName: "conversation" */ './Info.vue')
const ChatRoomManager = () => import(/* webpackChunkName: "conversation" */ './ChatRoomManager.vue')
const Cut = () => import(/* webpackChunkName: "conversation" */ './Cut.vue')
export default {
  components: {
    FastReply,
    FriendInfo,
    FriendCircle,
    ChatRoomManager,
    Cut
  },
  data() {
    return {
      currentPage: 'FastReply'
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'currentUser',
      currentWeChatId: 'conversation/currentWeChatId',
      currentFriendId: 'conversation/currentFriendId',
      currentWechat: 'conversation/currentWechat'
    })
  },
  watch: {
    currentWeChatId() {
      this.resetPage()
    },
    currentFriendId(val) {
      if (['FriendInfo', 'ChatRoomManager'].includes(this.currentPage)) {
        this.currentPage = val.endsWith('chatroom') ? 'ChatRoomManager' : 'FriendInfo'
      }
    }
  },
  mounted() {
    bus.$on('toggleAsideRightPage', (page) => {
      if (this.currentPage === page) {
        this.resetPage()
      } else {
        this.currentPage = page
      }
    })
  },
  methods: {
    setCurrentPage(pageName) {
      if (pageName === 'InfoManager') {
        this.currentPage = this.currentFriendId.endsWith('chatroom') ? 'ChatRoomManager' : 'FriendInfo'
      } else {
        this.currentPage = pageName
      }
    },
    // 返回快捷回复页面
    resetPage() {
      this.currentPage = 'FastReply'
    },
    queryReply() {
      console.log('queryReply')
    }
  }
}
</script>

<style lang="scss" scoped>
.conversation-tools {
  width: 380px;
  min-width: 380px;
  height: 100%;
  background-color: #ffffff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .action {
    background-color: rgba(0, 0, 0, 0.06);
    margin: 5px 5px 0;
    padding: 5px 10px 5px 30px;
    border-radius: 10px;
    .el-icon-sort {
      float: right;
      color: green;
      font-size: 16px;
      transform: rotateZ(90deg);
    }
  }
  .reply-nav {
    width: 100%;
    display: flex;
    align-items: center;
    margin-bottom: 0;
    .reply-nav-item {
      color: #333333;
      font-size: 15px;
      font-weight: 600;
      width: 50%;
      text-align: center;
      cursor: pointer;
      padding: 8px 0;
      border-bottom: solid #eeeeee 2px;
      color: #666666;
    }
    .reply-nav-item-checked {
      color: #0cc160;
      border-bottom: solid #0cc160 2px;
    }
  }
}
</style>
