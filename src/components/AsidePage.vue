<template>
  <el-aside
    v-if="!($route.name === 'conversation' && allConvs)"
    class="aside-page"
    :width="$route.name === 'tools' || $route.name === 'circleManager' ? '164px' : '120px'"
  >
    <!-- 微信状态 -->
    <div
      style="filter: opacity(60%)"
      v-if="$route.name !== 'tools' && $route.name !== 'circleManager'"
      class="wechats-state"
    >
      <i class="fa fa-weixin" aria-hidden="true"></i>
      <span>
        <span v-text="wechatsOnline.length"></span>
        /
        <span v-text="wechats.length"></span>
      </span>
    </div>

    <!-- 功能大全 -->
    <ul v-if="$route.name === 'tools'" class="navs-list scroll">
      <li
        v-for="(nav, index) in toolsNav"
        :key="index"
        class="aside-nav can-not-select"
        :class="{ 'nav-chose': currentNav === nav.navPath }"
        @click="setNav(nav)"
      >
        <img v-if="nav.imgUrl" :src="nav.imgUrl" style="margin-right: 10px" :alt="nav.path" />
        <i v-if="nav.navIcon" class="fa fa-lg" :class="nav.navIcon"></i>
        <p style="margin-left: 5px" v-text="nav.navName"></p>
      </li>
    </ul>

    <!-- 朋友圈管理 -->
    <ul v-else-if="$route.name === 'circleManager'" class="navs-list scroll">
      <li
        v-for="(nav, index) in circleNav"
        :key="index"
        class="aside-nav can-not-select"
        :class="{ 'nav-chose': currentCircleNav === nav.navPath }"
        @click="setCirlceNav(nav)"
      >
        <i class="fa" :class="nav.navIcon" aria-hidden="true"></i>
        <span style="margin-left: 10px" v-text="nav.navName"></span>
      </li>
    </ul>

    <!-- 会话 | 群发 | 发朋友圈 -->
    <ul v-else class="wechats-list scroll">
      <li
        v-for="(wechat, index) in wechats"
        :key="index"
        class="wechat-item"
        :index="wechat.WeChatId"
        :class="[{ 'wechat-chose': wechat.WeChatId === currentWeChatId }, { 'item-disabled': !wechat.IsOnline }]"
        :title="wechat.WeChatNick"
        @click="choseWechat($event, wechat)"
      >
        <!-- 微信头像 -->
        <div class="avatar-messages">
          <el-avatar :size="44" :src="wechat.Avatar" shape="square">
            <i class="fa fa-picture-o" aria-hidden="true" title="头像miss"></i>
          </el-avatar>
          <!-- 未读消息 -->
          <span
            v-if="messagesNotRead[wechat.WeChatId]"
            class="new-message-notice"
            v-text="messagesNotRead[wechat.WeChatId] < 99 ? messagesNotRead[wechat.WeChatId] : '99+'"
          ></span>

          <img v-if="wechat.tag === 0" class="wechat-item-img" src="@/assets/images/w.png" alt="" />
          <img v-if="wechat.tag === 1" class="wechat-item-img" src="@/assets/images/qw.png" alt="" />
          <!-- 离线标志 -->
          <span
            v-if="!wechat.IsOnline"
            class="iconfont icon-off-line"
            :class="{
              'item-disabled': !wechat.IsOnline
            }"
          ></span>
        </div>
        <!-- 微信昵称 -->
        <p class="wechat-nick ellipsis">
          {{ phiz.qqFaceImgMap(wechat.WeChatNick || wechat.WeChatNo) }}
        </p>
      </li>
    </ul>

    <div class="action">
      <div class="action-left" @click="setModalAction">
        <i class="el-icon-setting"></i>
        设置
      </div>
      <div class="action-right">
        <div class="internet">
          <div
            class="internet-item"
            :class="{ 'internet-item-bg-green': ping <= 150, 'internet-item-bg-red': ping > 150 }"
          ></div>
          <div
            class="internet-item"
            :class="{ 'internet-item-bg-green': ping <= 150, 'internet-item-bg-pink': ping > 150 }"
          ></div>
          <div
            class="internet-item"
            :class="{ 'internet-item-bg-green': ping < 50, 'internet-item-bg-pink': ping > 150 }"
          ></div>
          <div
            class="internet-item"
            :class="{ 'internet-item-bg-green': ping < 15, 'internet-item-bg-pink': ping > 150 }"
          ></div>
        </div>
        <div
          v-if="ping === 0 || ping"
          class="action-right-text"
          :style="{ color: ping <= 150 ? '#0CC160' : '#FF5656' }"
        >
          {{ ping }}ms
        </div>
      </div>
    </div>

    <el-dialog
      width="600px"
      class="system-set-modal"
      append-to-body
      :visible="setModal.visible"
      :before-close="setModalClose"
      title="系统设置"
      :show-close="false"
      destroy-on-close
    >
      <div class="system-set-modal-body">
        <div class="system-set-modal-body-item">
          <el-checkbox v-model="setModal.isConversationNum"></el-checkbox>

          <span class="system-set-modal-body-item-text">会话保留数</span>
          <el-input-number :controls="false" :min="10" v-model="setModal.conversationNum"></el-input-number>
          <span class="system-set-modal-body-item-des">（最少保留100条，当未消费的消息过多时只删去已消费的消息）</span>
        </div>

        <div class="system-set-modal-body-item">
          <el-checkbox v-model="setModal.isFilterConversation"></el-checkbox>

          <span class="system-set-modal-body-item-text">屏蔽公众号，订阅号和服务号的消息</span>
        </div>
        <!-- <div class="system-set-modal-body-item">
          <el-checkbox v-model="setModal.isNotReceive"></el-checkbox>

          <span class="system-set-modal-body-item-text">不接受次级设备消息，支援消息除外</span>
        </div>
        <div class="system-set-modal-body-item">
          <el-checkbox v-model="setModal.isNotClear"></el-checkbox>
          <span class="system-set-modal-body-item-text">此客服的主设备下面的其它客服账号点击消息不消除红点</span>
        </div> -->
        <div class="system-set-modal-body-tip">（客服离线，该功能自动关闭）</div>
      </div>
      <div slot="footer">
        <el-button @click="setModalClose">取 消</el-button>
        <el-button @click="setModalConfirm">确 定</el-button>
      </div>
    </el-dialog>
  </el-aside>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import {
  TriggerConversationPushTask,
  TriggerCircleMsgPushTask,
  DeviceAuthReq,
  TriggerFriendPushTask,
  TriggerChatroomPushTask
} from '@/api/webSocketApi'
import phiz from '@/utils/phiz.js'
import Bus from '@/utils/bus'
import Ping from 'web-pingjs'
// import { setSaveApi } from '@/api/httpApi'
import { setSaveSystemApi } from '@/api/httpApi'
export default {
  data() {
    return {
      phiz,
      toolsNav: [
        {
          navName: '微信好友请求',
          navIcon: 'fa-bell',
          // imgUrl: require('../assets/images/tools/friendsRequire.png'),
          navPath: 'newFriend'
        },
        {
          navName: '添加微信好友',
          navIcon: 'fa-user-plus',
          // imgUrl: require('../assets/images/tools/addFriend.png'),
          navPath: 'addFriend'
        },
        {
          navName: '批量加好友',
          navIcon: 'fa-users',
          // imgUrl: require('../assets/images/tools/addFriends.png'),
          navPath: 'addFriendAuto'
        },

        {
          navName: '加好友结果查询',
          navIcon: 'fa-rebel',
          // imgUrl: require('../assets/images/tools/friendsRequire.png'),
          navPath: 'searchPhones'
        },
        {
          navName: '自动功能开关',
          navIcon: 'fa-tasks',
          // imgUrl: require('../assets/images/tools/friendsRequire.png'),
          navPath: 'autoTask'
        },
        {
          navName: '关键词回复',
          navIcon: 'fa-reply-all',
          // imgUrl: require('../assets/images/tools/autoReply.png'),
          navPath: 'autoReply'
        },
        // {
        //   navName: '自动打招呼',
        //   navIcon: 'fa-header',
        //   // imgUrl: require('../assets/images/tools/autoHi.png'),
        //   navPath: 'autoHi'
        // },
        // {
        //   navName: 'SOP任务加好友',
        //   navIcon: 'fa-plus-square',
        //   // imgUrl: require('../assets/images/tools/addFriends.png'),
        //   navPath: 'sopAddFriend'
        // },
        {
          navName: '批量打标签',
          navIcon: 'fa-tags',
          // imgUrl: require('../assets/images/tools/takeLabels.png'),
          navPath: 'takeLabels'
        },
        {
          navName: '清理僵尸粉',
          navIcon: 'fa-trash',
          // imgUrl: require('../assets/images/tools/friendsRequire.png'),
          navPath: 'clearFans'
        },
        {
          navName: '导出二维码',
          navIcon: 'fa-qrcode',
          // imgUrl: require('../assets/images/tools/qrCode.png'),
          navPath: 'qrCode'
        },
        {
          navName: '手机管理',
          navIcon: 'fa-phone-square',
          // imgUrl: require('../assets/images/tools/phoneSetting.png'),
          navPath: 'phoneManagement'
        },
        {
          navName: '好友筛选',
          navIcon: 'fa-search',
          // imgUrl: require('../assets/images/tools/filterFriends.png'),
          navPath: 'friendsFilter'
        },
        {
          navName: '查看定时任务',
          navIcon: 'fa-clock-o',
          // imgUrl: require('../assets/images/tools/friendsRequire.png'),
          navPath: 'autoTaskList'
        },
        {
          navName: '素材资源库',
          navIcon: 'fa-folder',
          // imgUrl: require('../assets/images/tools/friendsRequire.png'),
          navPath: 'materialLibrary'
        },
        {
          navName: '收款统计',
          navIcon: 'fa-envelope',
          // imgUrl: require('../assets/images/tools/friendsRequire.png'),
          navPath: 'moneyStatistics'
        },
        {
          navName: '数据统计',
          navIcon: 'fa-bar-chart',
          navPath: 'wechatCount'
        }
      ],
      circleNav: [
        {
          navName: '所有朋友圈',
          navIcon: 'fa-chrome',
          navPath: 'allCircle'
        },
        {
          navName: '发朋友圈',
          navIcon: 'fa-paper-plane-o',
          navPath: 'sendCircle'
        },
        {
          navName: '新的评论',
          navIcon: 'fa-commenting-o',
          navPath: 'newComments'
        },
        {
          navName: '数据分析',
          navIcon: 'fa-line-chart',
          navPath: 'dataAnalysis'
        }
        // {
        //   navName: '定时管理',
        //   navIcon: 'el-icon-circle-plus-outline',
        //   imgUrl: require('../assets/images/tools/friendsRequire.png'),
        //   navPath: 'timingTask'
        // }
      ],
      clickTime: Date.now(),

      pingTimer: null,
      ping: undefined,

      setModal: { visible: false }
    }
  },
  computed: {
    ...mapState('tools', {
      currentNav: 'currentNav'
    }),
    ...mapState(['loginInfo', 'currentUser', 'set']),
    ...mapGetters({
      currentConvs: 'conversation/currentConvs', // 会话列表
      allConvs: 'allConvs', // 会话页面 公众号
      ghMap: 'conversation/ghMap', // 会话页面 公众号
      wechats: 'conversation/wechats', // 会话页面 当前用户绑定的微信
      wechatsOnline: 'conversation/wechatsOnline', // 会话页面 当前用户绑定的微信
      currentWeChatId: 'conversation/currentWeChatId', // 会话页面 选中的微信的id
      messagesNotRead: 'conversation/messagesNotRead', // 会话页面 新消息
      currentCircleNav: 'circleManager/currentCircleNav' // 会话页面 公众号
    })
  },
  watch: {
    wechatsOnline(newVal, oldVal) {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}

      if (newVal.length > 0 && oldVal.length === 0) {
        if (newVal.length > 0) {
          // 预取数据
          for (const wechat of this.wechatsOnline) {
            console.log('wechatsOnline', wechat, this.currentUser, loginInfo)

            // 会话数据
            TriggerConversationPushTask(wechat.WeChatId, this.currentUser.NickName, loginInfo.name)

            //通讯录
            TriggerFriendPushTask(wechat.WeChatId, this.currentUser.NickName, loginInfo.name)
            //群
            TriggerChatroomPushTask(wechat.WeChatId, this.currentUser.NickName, loginInfo.name)
          }
        }
      }
    }
  },
  methods: {
    // 设置当前的nav
    setNav(nav) {
      this.$store.commit('tools/SET_CURRENT_NAV', nav.navPath)
    },
    // 设置当前的nav
    setCirlceNav(nav) {
      this.$store.commit('circleManager/SET_CURRENT_CIRLCLE_NAV', nav.navPath)
    },
    // 设置会话页面的微信
    choseWechat(e, wechat) {
      //console.log('当前选择的微信', wechat)
      // if (!wechat.IsOnline) {
      //   this.$message.error('手机微信不在线，请检查手机！')
      //   return
      // }
      const wechatId = wechat.WeChatId
      if (wechatId === this.currentWeChatId) {
        const currentTime = Date.now()
        if (currentTime - this.clickTime < 300) {
          this.switchRead(wechat)
        }
        this.clickTime = currentTime
        return
      } else {
        Bus.$emit('weChatClick', wechat)
      }
      // 设置会话页面选择的微信
      this.$store.commit('conversation/SET_CURRENT_WECHAT', { ...wechat })
      // 设置当前通讯录
      this.$store.dispatch('nedb/SetFriends', wechatId)
      // 设置当前微信聊天列表
      this.$store.dispatch('nedb/SetChatRooms', wechatId)
      // 设置labels
      this.$store.dispatch('nedb/SetLabels', wechatId)
      // 设置strangers
      this.$store.dispatch('nedb/SetMembers', wechatId)
      // 获取公众号
      if (!this.ghMap[wechatId]) {
        this.$store.dispatch('websocket/TriggerBizContactPushTask')
      }
    },
    switchRead(wechat) {
      Bus.$emit('weChatDoubleClick', wechat)
    },

    getPing() {
      let _this = this
      if (!this.pingTimer) {
        this.pingTimer = setInterval(() => {
          Ping(process.env.VUE_APP_API_URL + '/ping')
            .then(function (delta) {
              _this.ping = delta
              // console.log('Ping time was ' + String(delta) + ' ms')
            })
            .catch(function (err) {
              console.error('Could not ping remote URL', err)
              this.ping = undefined
              if (this.pingTimer) {
                clearInterval(this.pingTimer)
                this.pingTimer = null
              }
            })
        }, 1000)
      }
    },
    setModalAction() {
      this.setModal.visible = true
    },
    setModalClose() {
      this.setModal.visible = false
    },
    async setModalConfirm() {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      this.$store.commit('SET_SET', {
        ...this.set,
        isConversationNum: this.setModal.isConversationNum,
        conversationSetNum: this.setModal.conversationNum,
        isFilterConversation: this.setModal.isFilterConversation
      })
      // const { code } = await setSaveApi({
      //   account: loginInfo.name,
      //   conversationNum: this.setModal.conversationNum,
      //   conversationNumEnable: this.setModal.isConversationNum,
      //   conversationGhEnable: this.setModal.isFilterConversation,
      //   notSubWxConversation: this.setModal.isNotReceive,
      //   subWxNotRedConversation: this.setModal.isNotClear
      // })
        const { code } = await setSaveSystemApi({
        account: loginInfo.name,
        conversationNum: this.setModal.conversationNum,
        conversationNumEnable: this.setModal.isConversationNum,
        conversationGhEnable: this.setModal.isFilterConversation,
        notSubWxConversation: this.setModal.isNotReceive,
        subWxNotRedConversation: this.setModal.isNotClear
      })
      
      if (code === 0) {
        this.$message.success('保存成功')
      }
      
      this.setModal.visible = false
    }
  },
  mounted() {
    Bus.$on('socketLoginSuccess', () => {
      this.$store.commit('SET_GLOBAL_LOADING', false)
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}

      if (!this.wechatsOnline.length) return
      for (const wechat of [...this.wechatsOnline]) {
        //TriggerCircleMsgPushTask(wechat.WeChatId, true)
        // 会话数据
        TriggerConversationPushTask(wechat.WeChatId, this.currentUser.NickName, loginInfo.name)

        //通讯录
        TriggerFriendPushTask(wechat.WeChatId, this.currentUser.NickName, loginInfo.name)
        //群
        TriggerChatroomPushTask(wechat.WeChatId, this.currentUser.NickName, loginInfo.name)
      }
    })

    window.addEventListener('offline', (e) => {
      console.log('offline')
      this.ping = undefined
      if (this.pingTimer) {
        clearInterval(this.pingTimer)
        this.pingTimer = null
      }
    })

    window.addEventListener('online', (e) => {
      console.log('online')
      this.getPing()
    })

    this.getPing()
  },
  destroyed() {
    this.ping = undefined
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }
}
</script>

<style lang="scss" scoped>
.item {
  color: $font-color-2;
  cursor: pointer;
}
.item-chose {
  background: #f5f5f5;
  color: #0cc160;
}

.aside-page {
  width: 115px !important;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  //box-shadow: 6px 0 10px -5px #999;
  z-index: 999;
  border-right: 1px solid #ededed;

  .navs-list {
    height: 100%;
    width: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    .aside-nav {
      font-size: 14px;
      color: #333333;
      height: 38px;
      line-height: 38px;
      padding-left: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    .nav-chose {
      background: #eeeeee;
      &:hover {
        background: #eeeeee;
      }
    }
  }

  .wechats-list {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    margin-bottom: 0;
    .wechat-item {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 5px;
      @extend .item;
      .avatar-messages {
        position: relative;
        padding: 5px 5px 0 5px;
        .new-message-notice {
          color: #fff;
          position: absolute;
          top: 0px;
          right: 0px;
          height: 20px;
          min-width: 20px;
          padding: 0 5px;
          line-height: 20px;
          text-align: center;
          background: red;
          border-radius: 10px;
        }
        .icon-off-line {
          position: absolute;
          top: 0;
          left: 0;
        }
      }
      .wechat-nick {
        height: 24px;
        line-height: 24px;
        width: 100px;
        text-align: center;
        font-size: 12px;
      }
      .wechat-item-img {
        width: 15px;
        position: absolute;
        bottom: 2px;
        right: 5px;
      }
    }
    .wechat-chose {
      @extend .item-chose;
    }
    .item-disabled {
      cursor: not-allowed;
      filter: grayscale(1);
      .icon-off-line {
        color: red;
      }
    }
  }

  .wechats-state {
    height: 40px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    background: #f3f3f3;
  }

  .action {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid #ededed;
    .action-left {
      color: #999999;
      cursor: pointer;
      font-size: 12px;
    }
    .action-right {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 50px;
      margin-left: 5px;
      .action-right-text {
        font-size: 12px;
        color: #999999;
      }
    }
  }

  .internet {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    .internet-item {
      width: 2px;
      margin-right: 2px;
      background-color: #cdcdcd;
      &:nth-child(1) {
        height: 3px;
      }
      &:nth-child(2) {
        height: 6px;
      }
      &:nth-child(3) {
        height: 9px;
      }
      &:nth-child(4) {
        height: 12px;
      }
    }
    .internet-item-bg-green {
      background-color: #11c263;
    }
    .internet-item-bg-red {
      background-color: #ff5656;
    }
    .internet-item-bg-pink {
      background-color: #ffd0d0;
    }
  }
}
// @media only screen and (max-width: 1200px) {
//   .aside-page {
//     width: 150px !important;
//     .wechat-nick-hide {
//       display: none;
//     }
//     .new-message-notice {
//       margin-left: 10px;
//     }
//   }
// }
</style>
