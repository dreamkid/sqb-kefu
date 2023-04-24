<template>
  <div>
    <el-dialog
      append-to-body
      class="circle-details-modal"
      :visible="circleDetailsModal.visible"
      @close="circleDetailsModalClose"
      width="570px"
    >
      <div class="circle-details-modal-body">
        <div class="circle-details-modal-body-left">
          <el-avatar shape="square" :size="48" :src="details.avatar"></el-avatar>
        </div>
        <div class="circle-details-modal-body-right">
          <div class="circle-details-modal-body-right-name">{{ details.nickName || '-' }}</div>
          <div class="circle-details-modal-body-right-text">{{ details.textContent }}</div>
          <div class="circle-details-modal-body-right-imgs">
            <el-avatar v-for="(img, i) in details.imgs" :key="i" shape="square" :size="150" :src="img"></el-avatar>
          </div>
          <div class="circle-details-modal-body-right-time">
            {{ Day(details.createTime).format('YYYY年MM月DD HH:mm:ss') }}
          </div>
          <div class="circle-details-modal-body-right-action">
            <el-tooltip effect="dark" placement="left">
              <div slot="content">
                <span style="cursor: pointer; margin-right: 10px" @click="like">
                  <i class="el-icon-thumb"></i>
                  点赞
                </span>
                <span style="cursor: pointer">
                  <i class="el-icon-chat-line-round"></i>
                  评论
                </span>
              </div>
              <i class="el-icon-more"></i>
            </el-tooltip>
          </div>
          <div class="circle-details-modal-body-right-info" v-if="action.visible">
            <div v-if="details.likeLists"><i class="el-icon-thumb"></i></div>
            <div class="circle-details-modal-body-right-info-action">
              <div class="circle-details-modal-body-right-info-action-items" v-if="details.likeLists">
                <el-avatar
                  v-for="(item, i) in details.likeLists"
                  :key="i"
                  shape="square"
                  :size="26"
                  :src="item.avatar"
                ></el-avatar>
              </div>
              <div class="circle-details-modal-body-right-info-action-comment">
                <div
                  class="circle-details-modal-body-right-info-action-comment-item"
                  v-for="(item, i) in details.commentLists"
                  :key="i"
                >
                  <el-avatar shape="square" :size="26" :src="item.avatar"></el-avatar>
                  <div class="circle-details-modal-body-right-info-action-comment-item-right">
                    <div class="circle-details-modal-body-right-info-action-comment-item-right-head">
                      <div style="color: #43619a">{{ item.nickName || '-' }}</div>
                      <div style="color: #999999">{{ Day(item.createTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
                    </div>
                    <div style="color: #666666">{{ item.content || '-' }}</div>
                  </div>
                </div>
              </div>
              <div class="circle-details-modal-body-right-info-action-area">
                <el-input type="textarea" v-model="action.content" :rows="3"></el-input>
                <div class="circle-details-modal-body-right-info-action-area-bottom">
                  <el-button @click="comment">发送</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template><script>
import { mapGetters, mapState } from 'vuex'
import Day from 'dayjs'
import { friendLikeApi, friendCommentApi } from '@/api/httpApi'
import bus from '@/utils/bus'
export default {
  data() {
    return {
      circleDetailsModal: { visible: false },
      details: {},
      action: {
        visible: true,
        content: undefined
      }
    }
  },
  computed: {
    ...mapState(['currentUser']),
    ...mapGetters({
      currentFriendId: 'conversation/currentFriendId',
      currentWeChatId: 'conversation/currentWeChatId'
    })
  },
  methods: {
    Day,
    circleDetailsModalClose() {
      this.circleDetailsModal.visible = false
    },
    async like() {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      const { code, data } = await friendLikeApi({
        wxId: this.currentWeChatId,
        friendId: this.currentFriendId,
        friendCircleId: this.details.friendCircleId
      })
      if (code === 0) {
        this.$message.success('处理成功')
        bus.$emit('likeSuccess')
      }
    },
    async comment() {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      const { code, data } = await friendCommentApi({
        wxId: this.currentWeChatId,
        friendId: this.currentFriendId,
        comment: this.action.content,
        friendCircleId: this.details.friendCircleId
      })
      if (code === 0) {
        this.$message.success('处理成功')
        bus.$emit('commentSuccess')
      }
    }
  }
}
</script>
 <style lang="less" scoped>
</style>