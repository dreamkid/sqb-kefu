<template>
  <div class="friend-circle">
    <!-- title -->
    <div class="friend-circle-title">
      <p>
        <span style="color: green" v-text="currentFriend.FriendNick"></span>
        的朋友圈
        <el-button type="text" size="mini" @click="refreshCircles">刷新</el-button>
        <el-button type="text" size="mini" @click="queryCircleListNext">下一页</el-button>
      </p>
      <i class="el-icon-close" @click="$parent.resetPage"></i>
    </div>

    <!-- 朋友圈列表 -->
    <ul class="circle-list scroll">
      <li v-for="(circleItem, index) in circleList" :key="index" class="circle-item">
        <template v-if="circleItem">
          <!-- 文本 -->
          <div v-if="circleItem.Content.Text" class="circle-div circle-text" v-text="circleItem.Content.Text"></div>
          <!-- 链接 -->
          <div
            v-if="circleItem.Content.Link"
            class="circle-div circle-link"
            title="点击打开链接"
            @click="openLink(circleItem)"
          >
            <img v-if="circleItem.Content.Images" :src="circleItem.Content.Images[0].ThumbImg" alt="这是link" />
            <span v-else class="circle-link-description" v-text="'无效链接'"></span>
            <span class="circle-link-description" v-text="circleItem.Content.Link.Description"></span>
          </div>
          <!-- 图片 -->
          <div v-else-if="circleItem.Content.Images" class="circle-div circle-img">
            <img
              v-for="(img, index1) in circleItem.Content.Images"
              :key="index1"
              class="friend-circle-img"
              :class="[
                {
                  'friend-circle-img-2': circleItem.Content.Images && circleItem.Content.Images.length === 2
                },
                {
                  'friend-circle-img-3': circleItem.Content.Images && circleItem.Content.Images.length >= 3
                }
              ]"
              :src="img.ThumbImg"
              :alt="img.ThumbImg ? '图片地址错误' : '点击刷新获取缩略图'"
            />
            <!-- </div> -->
          </div>
          <!-- 视频 -->
          <div v-else-if="circleItem.Content.Video" class="circle-div circle-video">
            <video class="video" controls>
              <source :src="circleItem.Content.Video.Url" type="video/mp4" />
            </video>
          </div>

          <!-- 点赞、评论、删除 -->
          <div class="circle-div time-operation">
            <!-- 时间 -->
            <span
              style="font-size: 12px; color: #b2b2b2"
              v-text="$options.filters.timeFilter(circleItem.PublishTime)"
            ></span>
            <!-- 操作 -->
            <div>
              <el-button
                type="text"
                size="mini"
                circle
                icon="el-icon-star-off"
                title="点赞"
                @click="likeCircle(circleItem)"
              ></el-button>
              <el-button
                type="text"
                size="mini"
                circle
                icon="el-icon-edit"
                title="评论"
                @click="circleCommentReplyTask(circleItem)"
              ></el-button>
              <el-button
                type="text"
                size="mini"
                circle
                icon="el-icon-refresh"
                title="刷新"
                @click="triggerCirclePushTask(circleItem)"
              ></el-button>
            </div>
          </div>

          <!-- 显示好友点赞 -->
          <div v-if="circleItem.Likes" class="circle-div likes-box">
            <i class="fa fa-heart-o" aria-hidden="true"></i>
            <div>
              <div v-for="(like, index2) in circleItem.Likes" :key="index2">
                <img
                  :src="
                    friendsMap[like.FriendId]
                      ? friendsMap[like.FriendId].Avatar
                      : require('assets/svg/conversation-image-error.svg')
                  "
                />
              </div>
            </div>
          </div>

          <!-- 显示好友评论 -->
          <div v-if="circleItem.Comments" class="circle-div comment-box">
            <div v-for="(comment, index3) in circleItem.Comments" :key="index3" class="every-comment">
              <img
                :src="
                  friendsMap[comment.FromWeChatId]
                    ? friendsMap[comment.FromWeChatId].Avatar
                    : require('assets/svg/conversation-image-error.svg')
                "
              />

              <div class="comment-info">
                <div class="name-time">
                  <span
                    class="ellipsis"
                    v-text="
                      friendsMap[comment.FromWeChatId]
                        ? friendsMap[comment.FromWeChatId].FriendNick
                        : comment.FromWeChatId
                    "
                  ></span>
                  <span v-text="$options.filters.timeFilter(comment.PublishTime)"></span>
                </div>

                <div class="reply-1">
                  <div class="reply-to-friend" :title="comment.Content">
                    <span v-if="comment.ToWeChatId">
                      回复
                      <span
                        class="reply-friend-name"
                        v-text="
                          friendsMap[comment.ToWeChatId]
                            ? friendsMap[comment.ToWeChatId].FriendNick
                            : comment.ToWeChatId
                        "
                      ></span>
                      :
                    </span>
                    <span class="comment-content" v-text="comment.Content"></span>
                  </div>

                  <i
                    v-if="comment.FromWeChatId === currentFriend.WeChatId"
                    class="fa fa-trash"
                    aria-hidden="true"
                    title="删除"
                    @click="circleCommentDeleteTask(circleItem, comment)"
                  ></i>
                  <i
                    v-else
                    class="fa fa-reply"
                    aria-hidden="true"
                    title="回复"
                    @click="circleCommentReplyTask(circleItem, comment)"
                  ></i>
                </div>
              </div>
            </div>
          </div>
        </template>
      </li>
      <li class="ret-tips" v-text="retTips"></li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  PullFriendCircleTask,
  CircleLikeTask,
  TriggerCirclePushTask,
  CircleCommentReplyTask,
  CircleCommentDeleteTask
} from '@/api/webSocketApi'

export default {
  name: 'FriendCircle',
  data() {
    return {
      loading: false,
      pullFriendCircle: false
    }
  },
  computed: {
    ...mapGetters({
      friendsMap: 'nedb/friendsMap',
      currentFriend: 'conversation/currentFriend',
      currentFriendId: 'conversation/currentFriendId', // 好友的朋友圈提示
      currentWeChatId: 'conversation/currentWeChatId', // 好友的朋友圈提示
      circleList: 'conversation/circleList', // 好友的朋友圈列表
      retTips: 'conversation/retTips' // 好友的朋友圈提示
      // friendsListMap: 'conversation/friendsListMap' // 好友的对照表
    })
  },
  watch: {
    currentFriendId() {
      // 先清空
      this.clearCircles()
      //   再查下
      this.queryCircleList()
    }
  },
  created() {
    // 查询朋友圈
    this.queryCircleList()
  },
  beforeDestroy() {
    this.clearCircles()
  },
  methods: {
    // 获取更多的朋友圈
    queryCircleList() {
      if (!this.currentFriendId || !this.currentWeChatId) return
      PullFriendCircleTask(this.currentWeChatId, this.currentFriendId, 0)
    },
    // 下一页
    queryCircleListNext() {
      if (!this.currentFriendId) {
        this.$alert('请先指定一个好友！', '提示', { type: 'warning' })
        return
      }
      let refId = 0
      const cl = this.circleList.length - 1
      if (cl <= 0) return
      if (this.circleList[cl]) {
        refId = this.circleList[cl].CircleId
      }
      if (refId !== 0) {
        PullFriendCircleTask(this.currentWeChatId, this.currentFriendId, refId)
      }
    },
    // 刷新数据
    refreshCircles() {
      this.clearCircles()
      this.queryCircleList()
    },
    // 清空好友的朋友圈数据
    clearCircles() {
      this.$store.commit('conversation/SET_RETTIPS', '')
      this.$store.commit('conversation/RESET_CIRCLE_LIST')
    },
    // 点赞
    likeCircle(circle) {
      let cancelFlag = false
      if (circle.Likes) {
        for (const like of circle.Likes) {
          if (like.FriendId === this.currentWeChatId) {
            cancelFlag = true
            break
          }
        }
      }
      const { CircleId } = circle
      CircleLikeTask(this.currentWeChatId, CircleId, cancelFlag, '')
    },
    // 刷新指定朋友圈
    triggerCirclePushTask(circle) {
      TriggerCirclePushTask(this.currentWeChatId, [circle.CircleId])
    },
    // 评论
    circleCommentReplyTask(circle, comment) {
      this.$prompt('请输入评论内容', '评论', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S{1,500}/,
        inputErrorMessage: '评论字数1-500'
      })
        .then(({ value }) => {
          this.$message.info('任务已经下发！')
          let toWeChatId = ''
          let replyCommentId = ''
          if (comment) {
            toWeChatId = comment.FromWeChatId
            replyCommentId = comment.CommentId
          }
          CircleCommentReplyTask(this.currentWeChatId, circle.CircleId, value, toWeChatId, replyCommentId)
        })
        .catch(() => {})
    },
    // 删除评论
    circleCommentDeleteTask(circle, comment) {
      if (!comment.CommentId) return

      this.$confirm('确认删除该评论 ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$message.info('已提交任务')
          CircleCommentDeleteTask(this.currentWeChatId, circle.CircleId, comment.CommentId)
        })
        .catch(() => {})
    },
    // 朋友圈连接
    openLink(circle) {
      const url = circle.Content.Link.Url
      const a = document.createElement('a')
      a.setAttribute('href', url)
      a.setAttribute('target', '_blank')
      a.setAttribute('id', 'js_a')
      // 防止反复添加
      if (document.getElementById('js_a')) {
        document.body.removeChild(document.getElementById('js_a'))
      }
      document.body.appendChild(a)
      a.click()
    }
  }
}
</script>

<style lang="scss" scoped>
.friend-circle {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .friend-circle-title {
    width: 100%;
    height: 40px;
    min-height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    padding: 0 10px;
  }

  .circle-list {
    flex: 1 1 auto;
    overflow: auto;
    display: flex;
    flex-direction: column;
    padding: 0 5px;
  }

  .ret-tips {
    padding: 5px;
  }
}
</style>
