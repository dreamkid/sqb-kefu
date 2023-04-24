<template>
  <div class="friends">
    <div class="friend" v-for="(item, i) in friendsData" :key="i">
      <div class="friend-left">
        <el-avatar shape="square" :size="65" :src="item.avatar"></el-avatar>
        <div class="friend-info">
          <div class="friend-info-name ellipsis">{{ item.friendName || item.FriendNick }}</div>
          <div class="friend-info-des ellipsis">{{ item.requestContent }}</div>
        </div>
      </div>
      <div class="friend-right">
        <div v-if="item.addFriendType === 2">
          <span v-if="item.addStatus">已添加</span>
          <el-button v-else @click="pass(item)">接受</el-button>
        </div>
        <div v-if="item.addFriendType === 1">
          <span v-if="item.addStatus">已添加</span>
          <span v-else>等待验证</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { checkPass, getNewFriendApi, getNewAddFriendApi } from '@/api/httpApi'
import { TriggerFriendPushTask } from '@/api/webSocketApi'
import bus from '@/utils/bus'
export default {
  props: ['tab'],
  data() {
    return {
      friendsData: []
    }
  },
  computed: {
    ...mapState(['currentUser']),
    ...mapGetters({
      currentFriendId: 'conversation/currentFriendId', // 当前页面回显
      currentWeChatId: 'conversation/currentWeChatId' // 当前选择的微信
    })
  },
  watch: {
    tab: {
      handler(tab) {
        if (tab === 1) {
          this.getNewFriend()
        }
        if (tab === 2) {
          this.getNewAddFriend()
        }
      },
      immediate: true
    },
    currentWeChatId() {
      if (this.tab === 1) {
        this.getNewFriend()
      }
      if (this.tab === 2) {
        this.getNewAddFriend()
      }
    }
  },
  mounted() {
    bus.$on('tagChange', (tab) => {
      if (tab === 'friends') {
        if (this.tab === 1) {
          this.getNewFriend()
        }
        if (this.tab === 2) {
          this.getNewAddFriend()
        }
      }
    })
  },
  methods: {
    async getNewFriend() {
      const { code, data } = await getNewFriendApi(this.currentWeChatId)
      if (code === 0) {
        this.friendsData = data
      }
    },
    async getNewAddFriend(item) {
      const { code, data } = await getNewAddFriendApi(this.currentWeChatId)
      if (code === 0) {
        this.friendsData = data
      }
    },
    async pass(item) {
      const { code, data } = await checkPass({
        ...item,
        wxId: item.wechatId
      })
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      if (code === 0) {
        if (this.tab === 1) {
          this.getNewFriend()
        }
        if (this.tab === 2) {
          this.getNewAddFriend()
        }
      }
      this.$store.commit('SET_LOADING', true)
      // 删除本地数据
      this.$store.dispatch('nedb/RemoveAllFriensByWechatId', this.currentWeChatId)
      // 从手机获取数据
      TriggerFriendPushTask(this.currentWeChatId, this.currentUser.NickName, loginInfo.name)
    }
  }
}
</script>

<style scoped lang="less">
.friends {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  .friend {
    min-width: 450px;
    width: 50%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 15px;
    padding-right: 15px;
    border-bottom: 1px solid #dedede;
    &:nth-last-child(1) {
      border-bottom: none;
    }
    .friend-left {
      width: 80%;
      display: flex;
      align-items: center;
      .el-avatar {
        flex-shrink: 0;
        margin-right: 18px;
      }
      .friend-info {
        width: 75%;
        .friend-info-name {
          width: 100%;
          font-size: 20px;
        }
        .friend-info-des {
          width: 100% !important;
          width: 100px;
        }
      }
    }
    .friend-right {
      color: #999999;

      .el-button {
        width: 72px;
        height: 32px;
        line-height: 32px;
        padding: 0;
        background-color: #0cc160;
        border-color: #0cc160;
        color: #fff;
      }
    }
  }
}
</style>