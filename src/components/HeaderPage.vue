<template>
  <el-header :height="'64px'" class="header-page" style="-webkit-app-region: drag">
    <!-- 标志 -->
    <div class="logo-box">
      <img v-if="origin.includes('localhost')" class="logo-img" src="../assets/images/icon.png" alt />
      <img v-else-if="origin.includes('hzdaba.cn')" class="logo-img" src="../assets/images/icon1.png" alt />
      <img v-else class="logo-img" src="../assets/images/icon.png" alt />
      <el-tooltip effect="dark" placement="bottom-start">
        <template #content>
          <div>系统版本：{{ version.systemVersion || '-' }}</div>
          <div style="margin: 2px 0">
            是否最新版本：{{ currentVersion === version.systemVersion ? '是' : '否' || '-' }}
          </div>
          <div style="margin: 0 0 2px">
            发布时间：{{ version.releaseTime ? Day(version.releaseTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
          </div>
          <div>刷新：{{ isMac ? 'Command+Shift+Backspace' : 'Ctrl+F5' }}</div>
        </template>
        <span style="font-weight: 600; font-size: 16px; margin-left: 8px; cursor: pointer">
          {{ currentVersion }}
        </span>
      </el-tooltip>
    </div>

    <!-- 导航 -->
    <ul class="nav-ul">
      <li
        v-for="(nav, index) in navs"
        :key="index"
        class="nav-li"
        style="-webkit-app-region: no-drag"
        :class="{ 'active-nav': $route.path === nav.navPath }"
        @click="showPath(nav)"
      >
        <!-- <i :class="nav.navIcon" aria-hidden="true"></i> -->
        <div class="nav-imgage">
          <img :class="nav.navClass" :src="$route.path === nav.navPath ? nav.navSrc2 : nav.navSrc1" alt="" />
        </div>
        <span class="nav-name can-not-select" v-text="nav.navName"></span>
      </li>
    </ul>

    <div class="menu-box">
      <!-- 朋友圈评论通知 -->
      <!-- <div style="-webkit-app-region: no-drag; cursor: pointer" @click="showCircleMsgDialog">
        <i
          style="font-size: 22px; margin-right: 20px"
          class="el-icon-message-solid"
          :class="{ 'has-msg': circleMsg.length > 0 }"
        ></i>
        <p v-if="circleMsg.length > 0">{{ circleMsg.length }}</p>
      </div> -->

      <!-- 下拉菜单 -->
      <el-dropdown class="my-el-dropdown" style="-webkit-app-region: no-drag" @command="handleCommand">
        <div class="el-dropdown-link">
          <img class="user-avatar" src="../assets/images/header/userDefaultAvatar.png" alt="" />
          <span class="nick-name can-not-select" v-text="currentUser.NickName"></span>
        </div>
        <el-dropdown-menu slot="dropdown">
          <!-- <el-dropdown-item command="allConvs">
            <i class="el-icon-ship"></i>
            会话汇总
          </el-dropdown-item> -->
          <!-- <el-dropdown-item v-if="currentMode === 'web'" command="toggleBig">
            <i class="el-icon-full-screen"></i>
            切换大小
          </el-dropdown-item> -->
          <!-- <el-dropdown-item command="modifyPwd">
            <i class="el-icon-edit"></i>
            修改密码
          </el-dropdown-item> -->
          <el-dropdown-item command="logout">
            <i class="fa fa-sign-out" aria-hidden="true"></i>
            退出系统
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <!--electron 最大|最小|关闭 -->
      <div v-if="currentMode === 'electron'" style="-webkit-app-region: no-drag" class="electron-menu">
        <i
          style="margin-right: 10px; -webkit-app-region: no-drag"
          class="fa fa-minus fa-lg"
          aria-hidden="true"
          title="最小化"
          @click="minimizeWindow()"
        ></i>
        <!-- <div class="icon-bigger" @click="maximizeWindow()">
        <div class="bigger"></div>
      </div> -->
        <i
          style="-webkit-app-region: no-drag"
          class="fa fa-times fa-lg"
          aria-hidden="true"
          title="关闭"
          @click="hiddenWindow"
        ></i>
      </div>
    </div>

    <!-- 修改密码 -->
    <el-dialog title="修改密码" append-to-body :visible.sync="modifyPwdDialog">
      <el-form ref="ruleForm" :model="form" :rules="rules">
        <el-form-item label="老密码" :label-width="formLabelWidth" prop="oldPwd" required>
          <el-input
            v-model="form.oldPwd"
            type="password"
            autocomplete="off"
            clearable
            show-password
            placeholder="请输入老的密码"
            minlength="6"
            maxlength="30"
          ></el-input>
        </el-form-item>
        <el-form-item label="新密码" :label-width="formLabelWidth" prop="newPwd" required>
          <el-input
            v-model="form.newPwd"
            type="password"
            autocomplete="off"
            clearable
            placeholder="请输入新的密码"
            show-password
            minlength="6"
            maxlength="16"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="modifyPwdDialog = false">取 消</el-button>
        <el-button type="primary" @click="modifyPwd">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 朋友圈 -->
    <!-- <el-dialog
      title="朋友圈评论通知"
      append-to-body
      class="friend-circle-dialog"
      destroy-on-close
      :visible.sync="friendCircleDialog"
    >
      <template v-if="circleMsg.length > 0">
        <div v-for="(noticeItem, index2) in circleMsg" :key="index2" class="circle-item">
          <div>
            <span v-text="noticeItem.FromName"></span>
            :
            <span v-text="noticeItem.Content"></span>
          </div>

          <div>
            <span
              style="font-size: 12px; color: #b2b2b2"
              v-text="$options.filters.timeFilter(noticeItem.PublishTime)"
            ></span>
            <el-button style="margin-left: 10px" type="text" @click="deleteCircleMsg(noticeItem, index2)">
              删除
            </el-button>
            <el-button type="text" @click="queryCircleMsg(noticeItem)">查看朋友圈</el-button>
            <el-button
              v-if="noticeItem.FromWeChatId && noticeItem.FromWeChatId !== noticeItem.WeChatId"
              type="text"
              @click="beginChat(noticeItem)"
            >
              发起聊天
            </el-button>
          </div>
        </div>
      </template>

      <el-dialog
        width="50%"
        :title="friendCircleTitle + '朋友圈'"
        :visible.sync="innerVisible"
        append-to-body
        :destroy-on-close="true"
      >
        <div class="circle-item">
          <template v-if="circleItem.Content">
            <div v-if="circleItem.Content.Text" class="circle-text" v-text="circleItem.Content.Text"></div>
            <div v-if="circleItem.Content.Link" class="circle-link">
              <img v-if="circleItem.Content.Images" :src="circleItem.Content.Images[0].ThumbImg" alt="这是link" />
              <span v-else class="circle-link-description" v-text="'无效链接'"></span>
              <span class="circle-link-description" v-text="circleItem.Content.Link.Description"></span>
            </div>
            <div v-else-if="circleItem.Content.Images" style="display: flex; flex-wrap: wrap">
              <img
                v-for="(img, index3) in circleItem.Content.Images"
                :key="index3"
                style="width: 150px; height: auto; object-fit: cover; margin: 5px; border: #f3f3f3 solid 2px"
                :src="img.ThumbImg"
                :alt="img.ThumbImg ? '图片地址错误' : '点击刷新按钮获取缩略图'"
              />
            </div>
            <div v-else-if="circleItem.Content.Video" class="circle-video">
              <video class="video" controls>
                <source :src="circleItem.Content.Video.Url" type="video/mp4" />
              </video>
            </div>
          </template>

          <div class="time-operation">
            <span
              v-if="circleItem.PublishTime"
              style="font-size: 12px; color: #b2b2b2"
              v-text="$options.filters.timeFilter(circleItem.PublishTime)"
            ></span>
            <div class="operation-btns">
              <el-button
                type="text"
                size="small"
                circle
                icon="el-icon-mobile-phone"
                title="刷新手机"
                @click="refreshPhoneCircle(circleItem)"
              ></el-button>

              <el-button
                type="text"
                size="small"
                circle
                icon="el-icon-refresh"
                title="刷新"
                @click="triggerCirclePushTask(circleItem)"
              ></el-button>
            </div>
          </div>

          <div v-if="circleItem.Comments" class="comment-box">
            <div v-for="(comment, index4) in circleItem.Comments" :key="index4" class="every-comment">
              <div class="comment-info">
                <div class="name-time">
                  <span class="ellipsis" v-text="comment.FromName"></span>
                  <span v-text="$options.filters.timeFilter(comment.PublishTime)"></span>
                </div>

                <div class="reply-1">
                  <div class="reply-to-friend" :title="comment.Content">
                    <span v-if="comment.ToWeChatId">
                      回复
                      <span
                        v-if="allFriendsMap[comment.ToWeChatId]"
                        class="reply-friend-name"
                        v-text="allFriendsMap[comment.ToWeChatId].FriendNick"
                      ></span>
                      <span v-else class="reply-friend-name" v-text="comment.ToWeChatId"></span>
                      :
                    </span>
                    <span class="comment-content" v-text="comment.Content"></span>
                  </div>

                  <i
                    v-if="comment.FromWeChatId === circleItem.WeChatId"
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
        </div>
      </el-dialog>

      <div slot="footer">
        <el-button size="small" @click="freshCircleMsg">刷新</el-button>
        <el-button size="small" type="warning" @click="clearCirlceMsg">删除全部</el-button>
        <el-button size="small" type="primary" @click="friendCircleDialog = false">确定</el-button>
      </div>
    </el-dialog> -->
  </el-header>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { editPassword } from '@/api/httpApiAdmin'
import { getVersionApi, versionGetApi } from '@/api/httpApi'
import {
  // TriggerCircleMsgPushTask,
  TriggerCirclePushTask,
  CircleCommentReplyTask,
  CircleCommentDeleteTask,
  PullFriendCircleTask,
  // CircleMsgReadTask,
  TriggerCircleMsgPushTask,
  CircleMsgClearTask
} from '@/api/webSocketApi'
import nedb from '@/db/nedb'
import Day from 'dayjs'
export default {
  name: 'HeaderPage',
  data() {
    const validateOldPwd = (rule, value, callback) => {
      const reg = /^[0-9a-z]{6,16}$/gi
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error('密码长度6-16位,必须是数字或字母!'))
      }
    }
    const validateNewPwd = (rule, value, callback) => {
      const reg = /^[0-9a-z]{6,16}$/gi
      if (reg.test(value)) {
        if (value === this.form.oldPwd) {
          callback(new Error('新密码不能和老密码一样!'))
        }
        callback()
      } else {
        callback(new Error('请输入新密码'))
      }
    }
    return {
      modifyPwdDialog: false, // 展示修改密码
      navs: [],
      formLabelWidth: '80px', // 展示修改密码
      form: {
        oldPwd: '',
        newPwd: ''
      }, // 密码表单
      rules: {
        oldPwd: [{ validator: validateOldPwd, trigger: 'blur' }],
        newPwd: [{ validator: validateNewPwd, trigger: 'blur' }]
      }, // 密码校验
      friendCircleDialog: false,
      innerVisible: false,
      friendCircleTitle: '',
      version: {},
      currentVersion: '1.1.0',
      versionCurrent: '1.1.0',
      origin: window.location.origin,
      isMac: /macintosh|mac os x/i.test(navigator.userAgent)
    }
  },
  computed: {
    ...mapState({
      currentUser: 'currentUser',
      currentMode: 'currentMode'
    }),
    ...mapGetters({
      allConvs: 'allConvs',
      circleMsg: 'circles/getCircleMsg',
      circleItem: 'circles/getCircleItem',
      allFriendsMap: 'circles/getAllFriendsMap',
      wechatsMap: 'conversation/wechatsMap',
      wechatsOnline: 'conversation/wechatsOnline',
      wechatsNameMap: 'conversation/wechatsNameMap',
      currentWeChatId: 'conversation/currentWeChatId' // 当前选择的微信
    })
  },
  methods: {
    Day,
    // async getVersion() {
    //   const { data, code } = await getVersionApi()
    //   this.version = data || {}
    // },
    async getVersionCurrent() {
      const { data, code } = await versionGetApi()
      this.versionCurrent = data
    },
    // 路由跳转
    showPath(nav) {
      if (this.$route.path === nav.navPath) return
      // 新的页面展示
      this.$router.push({ path: nav.navPath })
    },

    // 查看朋友圈消息
    showCircleMsgDialog() {
      if (this.circleMsg.length > 0) {
        this.friendCircleDialog = true
      }
    },
    // 查下circle msg对应的朋友圈
    queryCircleMsg(msgItem) {
      this.friendCircleTitle = ''
      if (this.wechatsNameMap[msgItem.WeChatId]) {
        this.friendCircleTitle = this.wechatsNameMap[msgItem.WeChatId] + '的'
      }

      // if (msgItem.CircleId && msgItem.CircleId !== this.circleItem.CircleId) {
      if (msgItem.CircleId) {
        this.$store.dispatch('circles/SetAllFriends', msgItem.WeChatId)
        this.$store.commit('circles/SET_CIRCLE_ITEM', {
          CircleId: msgItem.CircleId,
          Content: {
            Text: '正在获取朋友圈，如果长时间无反应，请点击下方的刷新手机按钮！'
          },
          PublishTime: msgItem.PublishTime,
          WeChatId: msgItem.WeChatId
        })
        TriggerCirclePushTask(msgItem.WeChatId, [msgItem.CircleId])
        // // 将该朋友圈下的评论都设为已读
        // CircleMsgReadTask(msgItem.WeChatId, msgItem.CircleId)
      }
      this.innerVisible = true
    },
    // 刷新
    freshCircleMsg() {
      this.$store.commit('circles/RESET_CIRCLE_MSG')
      for (const wechat of this.wechatsOnline) {
        TriggerCircleMsgPushTask(wechat.WeChatId, true)
      }
    },
    // 清空circle msg
    clearCirlceMsg() {
      this.$store.commit('circles/RESET_CIRCLE_MSG')
      this.innerVisible = false
      this.friendCircleDialog = false
      for (const wechat of this.wechatsOnline) {
        CircleMsgClearTask(wechat.WeChatId, 0)
      }
    },
    // 删除circle msg
    deleteCircleMsg(msgItem, deleteIndex) {
      const { WeChatId, CircleId, CommentId } = msgItem
      CircleMsgClearTask(WeChatId, CircleId, CommentId)
      this.$store.commit('circles/REMOVE_CIRCLE_MSG', deleteIndex)
    },

    // 刷新指定朋友圈
    triggerCirclePushTask(circle) {
      this.$message.info('任务已经下发!')
      TriggerCirclePushTask(circle.WeChatId, [circle.CircleId])
    },
    // 让手机刷朋友圈
    refreshPhoneCircle(circle) {
      this.$message.info('正在刷新手机上的数据，请稍后！!')
      // eslint-disable-next-line no-undef
      PullFriendCircleTask(circle.WeChatId, circle.WeChatId, String(String(BigInt(circle.CircleId) + 1n)))
    },
    // 删除评论
    circleCommentDeleteTask(circle, comment) {
      this.$confirm('确认删除该评论 ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$message.info('已提交任务')
          CircleCommentDeleteTask(circle.WeChatId, circle.CircleId, comment.CommentId)
        })
        .catch(() => {})
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
          CircleCommentReplyTask(circle.WeChatId, circle.CircleId, value, toWeChatId, replyCommentId)
        })
        .catch(() => {})
    },
    // 跳转到聊天
    beginChat(commentNotice) {
      const { WeChatId, FromWeChatId, FromName } = commentNotice
      const friendInfo = {
        FriendId: FromWeChatId,
        WeChatId: WeChatId,
        ShowName: FromName
      }

      let wechatInfo = {
        WeChatId: WeChatId
      }
      if (this.wechatsMap[WeChatId]) {
        wechatInfo = this.wechatsMap[WeChatId]
      }

      this.friendCircleDialog = false

      if (this.allConvs) {
        this.$store.commit('conversation/SET_CURRENT_FRIEND', friendInfo)
      } else {
        this.$store.commit('conversation/SET_CURRENT_FRIENDS', friendInfo)
      }

      if (this.$route.name !== 'conversation') {
        this.$router.replace({ name: 'conversation' })
      }

      this.$store.commit('conversation/SET_CURRENT_WECHAT', wechatInfo)
      // 设置当前通讯录
      this.$store.dispatch('nedb/SetFriends', WeChatId)
      // 设置当前微信聊天列表
      this.$store.dispatch('nedb/SetChatRooms', WeChatId)
      // 设置labels
      this.$store.dispatch('nedb/SetLabels', WeChatId)
      // 设置strangers
      this.$store.dispatch('nedb/SetMembers', WeChatId)
    },
    removeChatRecord() {
      return new Promise((resolve, reject) => {
        nedb.chats.remove({}, { multi: true }, (err, number) => {
          if (err) return
          resolve()
        })
      })
    },
    // 处理下拉菜单
    handleCommand(command) {
      switch (command) {
        case 'logout':
          // 退出之前需要二次确认
          this.$confirm('你将退出登录 ?', '提示', {
            closeOnClickModal: false,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              //删除本地通讯录数据
              Promise.all([
                this.$store.dispatch('nedb/RemoveAllRooms'),
                this.$store.dispatch('nedb/RemoveAllFriends'),
                this.removeChatRecord()
              ]).then(() => {
                // 清除token
                this.$store.commit('SET_WEBSOCKET_TOKEN', '')

                localStorage.removeItem('WEBSOCKET_TOKEN')
                localStorage.removeItem('CURRENT_USER')
                localStorage.removeItem('LOGIN_INFO')
              })
            })
            .catch(() => {})
          break
        case 'modifyPwd':
          this.modifyPwdDialog = true
          break
        case 'toggleBig':
          this.$store.commit('SET_BIG_SCREEN')
          break
        case 'allConvs':
          this.$store.commit('SET_ALL_CONVS')
          break
        default:
          this.$message('click on item ' + command)
          break
      }
    },
    // 修改密码
    modifyPwd() {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          const id = this.currentUser.id
          editPassword(id, this.form.oldPwd, this.form.newPwd).then((res) => {
            if (res.code === 0) {
              this.modifyPwdDialog = false
              this.$message({
                type: 'success',
                message: '修改密码成功!',
                duration: 1000
              })
            }
          })
        } else {
          return false
        }
      })
    },
    // 最小化
    minimizeWindow() {
      this.$ipcRenderer.send('operations', 'min')
    },
    // 最大化
    maximizeWindow() {
      this.$ipcRenderer.send('operations', 'max')
    },
    // 缩小到托盘
    hiddenWindow() {
      this.$ipcRenderer.send('operations', 'hidden')
    }
  },
  mounted() {
    // this.getVersion()
    this.getVersionCurrent()
  }
}
</script>

<style lang="scss" scoped>
.header-page {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 66px;
  border-bottom: solid #ededed 1px;

  .logo-box {
    display: flex;
    align-items: center;
    .logo-img {
      width: 50px;
    }
  }

  .nav-ul {
    display: flex;

    .nav-li {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 84px;
      height: 62px;
      position: relative;

      .nav-imgage {
        height: 26px;
        display: flex;
        align-items: center;
      }

      .nav-name {
        font-size: 12px;
        margin-top: 5px;
      }

      .comments-notice {
        position: absolute;
        top: 5px;
        right: 15px;
        background: red;
        height: 14px;
        width: 14px;
        border-radius: 50%;
        border: solid red 1px;
      }
      &:hover {
        cursor: pointer;
      }
    }
    .active-nav {
      color: #ff9f00;
      background-color: #fff7e8;
    }
  }

  .my-el-dropdown {
    .el-dropdown-link {
      display: flex;
      align-items: center;
      color: #333333;
      text-align: center;
      .user-avatar {
        width: 27px;
        height: 27px;
      }
      .nick-name {
        font-size: 16px;
        margin: 0 5px;
      }
    }
  }

  .menu-box {
    display: flex;
    align-items: center;

    .has-msg {
      color: #e6a23c;
      cursor: pointer;
    }

    .electron-menu {
      width: 50px;
      height: 20px;
      display: flex;
      align-items: center;
      margin-left: 20px;
      justify-content: space-between;
      i {
        cursor: pointer;
      }
      .icon-bigger {
        width: 20px;
        height: 20px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        cursor: pointer;
        .bigger {
          width: 10px;
          height: 10px;
          border: solid white 1px;
        }
        .smaller {
          width: 10px;
          border: solid white 1px;
        }
        &:hover {
          background: #c3c3c3;
        }
      }
    }
  }
}
</style>
