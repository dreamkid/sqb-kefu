<template>
  <div class="chat-rooms-manager scroll" @scroll="scroll">
    <div class="tabs">
      <div class="tab" :class="{ 'tab-active': currentInfoTab === 1 }" @click="infoTabChange(1)">群成员</div>
      <div class="tab" :class="{ 'tab-active': currentInfoTab === 2 }" @click="infoTabChange(2)">屏蔽列表</div>
    </div>
    <div class="room-search" :style="{ position: isMore ? 'sticky' : 'relative' }">
      <el-input v-model="searchOptions.val" prefix-icon="el-icon-search" placeholder="搜索群成员" clearable
        @input="search"></el-input>
    </div>

    <div class="room-members" v-if="currentInfoTab === 1">
      <div class="room-member" v-for="(item, i) in members" :key="i">
        <el-popover v-model="popoverVisible[item.UserName]" trigger="manual" placement="left" width="305">
          <el-avatar slot="reference" :size="45" shape="square" :src="item.FriendAvatar"
            @click.native.stop="showMemberDetail(item)"></el-avatar>

          <div class="avatar-popover">
            <div class="avatar-popover-top">
              <el-avatar style="flex-shrink: 0" shape="square" :size="58" :src="memberDetail.Avatar"></el-avatar>
              <div style="width: 230px">
                <div class="avatar-popover-top-head">
                  <div class="avatar-popover-top-head-left ellipsis">{{ memberDetail.FullName }}</div>
                  <img style="width: 12px" src="@/assets/images/man.png" />
                  <el-popover popper-class="more-popover" style="position: absolute; right: 0" placement="bottom-start"
                    trigger="hover">
                    <i slot="reference" class="el-icon-more" style="cursor: pointer"></i>
                    <div>
                      <el-menu style="border-right: none">
                        <el-menu-item index="1">
                          <span slot="title">转让群主</span>
                        </el-menu-item>

                        <el-menu-item index="2">
                          <span slot="title">升为群管理</span>
                        </el-menu-item>
                        <el-menu-item index="3">
                          <span slot="title">踢出群聊</span>
                        </el-menu-item>
                      </el-menu>
                    </div>
                  </el-popover>
                </div>
                <div class="avatar-popover-top-item ellipsis">群昵称： {{ memberDetail.FriendNick || '-' }}</div>
                <div class="avatar-popover-top-item ellipsis" :title="memberDetail.FriendId">
                  微信号：{{ memberDetail.FriendId }}
                </div>
                <div class="avatar-popover-top-item ellipsis">地区：{{ memberDetail.Province || '-' }}</div>
              </div>
            </div>
            <el-divider></el-divider>
            <div class="avatar-popover-middle">
              <div class="avatar-popover-middle-item">
                <span class="avatar-popover-middle-item-left">备注名</span>
                <span>{{ memberDetail.Memo || '-' }}</span>
              </div>
              <div class="avatar-popover-middle-item">
                <span class="avatar-popover-middle-item-left">来源</span>
                <span>-</span>
              </div>
              <div class="avatar-popover-middle-item">
                <span class="avatar-popover-middle-item-left">入群方式</span>
                <span class="avatar-popover-middle-item-text">-</span>
                <span>邀请入群</span>
              </div>
            </div>

            <el-divider></el-divider>
            <div class="avatar-popover-bottom">
              <el-button v-if="memberDetail.IsFriend">发消息</el-button>
              <el-button v-else @click="addFriend">添加通讯录</el-button>
              <el-button @click="atSomebody(item)">@Ta</el-button>
              <el-button>加入黑名单</el-button>
              <el-button>加入白名单</el-button>
            </div>
          </div>
        </el-popover>

        <div class="room-member-name ellipsis">{{ item.FriendNick }}</div>
        <div class="room-member-company ellipsis">{{ item.CorpName }}</div>
        <div class="room-member-tag ellipsis"></div>
      </div>
      <div class="room-member" @click="roomModalAction(2)">
        <div class="room-member-icon"><i class="el-icon-plus"></i></div>
        <div class="room-member-name ellipsis">添加</div>
      </div>
      <div v-if="isOwner" class="room-member" @click="roomModalAction(3)">
        <div class="room-member-icon"><i class="el-icon-minus"></i></div>
        <div class="room-member-name ellipsis">移除</div>
      </div>
    </div>
    <div class="shield-members" v-if="currentInfoTab === 2 && shieldData.length">
      <div class="shield-members-head">
        <el-dropdown @command="cancelShieldAction">
          <el-button size="mini" style="padding: 7px 5px">
            批量取消屏蔽
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="single">取消当前群</el-dropdown-item>
            <el-dropdown-item command="all">取消所有群</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <span>已选 ({{ shieldDataSelected.length }})</span>
      </div>
      <div class="shield-members-items">
        <div class="shield-members-items-head">
          <el-checkbox v-model="shieldAllChecked" @change="(checked) => shieldItemsSelect(checked)"></el-checkbox>
          <span class="shield-members-items-head-item">头像</span>
          <span class="shield-members-items-head-item">昵称</span>
        </div>
        <div class="shield-members-item" v-for="(item, i) in shieldData" :key="i">
          <el-checkbox v-model="item.checked" @change="(checked) => shieldItemSelect(checked, item)"></el-checkbox>
          <el-avatar slot="reference" :size="45" shape="square" :src="item.FriendAvatar"></el-avatar>
          <div>{{ item.FriendNick }}</div>
        </div>
      </div>
    </div>
    <div v-if="(currentInfoTab === 1 && membersData.length > 10) || (currentInfoTab === 2 && shieldDataSource.length > 4)"
      class="room-control" @click="roomControl">
      {{ isMore ? '收起' : '展开更多' }}
      <i v-if="isMore" class="el-icon-arrow-up"></i>
      <i v-else class="el-icon-arrow-down"></i>
    </div>
    <div v-if="isFixed" class="room-control-sticky" @click="roomControl">
      收起
      <i v-if="isMore" class="el-icon-arrow-up"></i>
    </div>
    <el-divider
      v-if="(currentInfoTab === 1 && members.length) || (currentInfoTab === 2 && shieldData.length)"></el-divider>
    <div class="room-action">
      <div class="room-til">群聊名称</div>
      <div class="room-des" style="margin-bottom: 10px">
        <el-input v-if="isOwner" v-model="user.NickName" @blur="updateInfo(0, 'NickName')"></el-input>
        <i v-if="isOwner" class="el-icon-edit-outline"></i>
        <div v-else>{{ user.NickName }}</div>
      </div>
      <div class="room-til">备注</div>
      <div class="room-des" style="margin-bottom: 10px">
        <el-input v-model="user.Remark" @blur="updateInfo(33, 'Remark')"></el-input>
        <i class="el-icon-edit-outline"></i>
      </div>
      <div class="room-til">群公告</div>
      <div class="room-des" style="margin-bottom: 10px; cursor: pointer" @click="noticeModalAction">
        <!-- <el-input v-if="isOwner" v-model="user.Notice" @blur="updateInfo(1, 'Notice')"></el-input>
        <i v-if="isOwner" class="el-icon-edit-outline"></i> -->
        <div class="room-des-info">{{ user.Notice }}</div>
        <i v-if="isOwner" class="el-icon-edit-outline"></i>
      </div>
      <div class="room-til">我在本群的昵称</div>
      <div class="room-des" style="cursor: pointer">
        <el-input v-model="user.ChatMeNick" @blur="updateInfo(4, 'ChatMeNick')"></el-input>
        <i class="el-icon-edit-outline"></i>
        <!-- <i class="el-icon-arrow-right" style="float: right"></i> -->
      </div>
      <el-divider></el-divider>
      <div class="room-item" @click="chatRecordModalAction">
        <div class="room-item-left">聊天记录</div>
        <div class="room-item-right"><i class="el-icon-arrow-right"></i></div>
      </div>
      <el-divider></el-divider>
      <div class="room-item">
        <div class="room-item-left">显示群员昵称</div>
        <div class="room-item-right">
          <el-switch v-model="user.ChatShowMemberNameEnable" active-color="#13ce66" inactive-color="#E5E5E5"
            @change="updateInfo(32, 'ChatShowMemberNameEnable')"></el-switch>
        </div>
      </div>
      <div class="room-item" style="margin: 10px 0">
        <div class="room-item-left">消息免打扰</div>
        <div class="room-item-right">
          <el-switch v-model="user.ChatMsgImmunityEnable" active-color="#13ce66" inactive-color="#E5E5E5"
            @change="updateInfo(30, 'ChatMsgImmunityEnable')"></el-switch>
        </div>
      </div>
      <div class="room-item">
        <div class="room-item-left">保存到通讯录</div>
        <div class="room-item-right">
          <el-switch v-model="user.ChatSaveMailEnable" active-color="#13ce66" inactive-color="#E5E5E5"
            @change="updateInfo(31, 'ChatSaveMailEnable')"></el-switch>
        </div>
      </div>

      <el-button class="room-collect-btn">采集非微信好友到库（{{ notFriends.length || 0 }}）</el-button>
    </div>

    <el-dialog width="540px" class="room-action-modal" append-to-body :visible="roomActionModal.visible"
      :before-close="roomModalClose" :show-close="false" destroy-on-close>
      <div class="room-action-modal-body">
        <div class="room-action-modal-body-left">
          <el-input v-if="roomActionModal.type === 2" v-model="roomActionModal.searchVal" prefix-icon="el-icon-search"
            placeholder="搜索" clearable></el-input>
          <el-input v-if="roomActionModal.type === 3" v-model="roomActionModal.memberSearchVal"
            prefix-icon="el-icon-search" placeholder="搜索" clearable></el-input>
          <div class="room-action-modal-body-left-items scroll">
            <div class="room-action-modal-body-left-item"
              v-for="(item, i) in roomActionModal.type === 2 ? friends : roomMembers" :key="i">
              <el-checkbox v-if="roomActionModal.type === 2"
                v-model="roomActionModal.selected[item.friendId]"></el-checkbox>
              <el-checkbox v-else v-model="roomActionModal.membersSelected[item.weChatId]"></el-checkbox>
              <el-avatar :size="30" shape="square" :src="item.avatar"></el-avatar>
              {{ item.nickname }}
            </div>
          </div>
        </div>
        <div class="room-action-modal-body-right">
          <div class="room-action-modal-body-right-head">
            <div class="room-action-modal-body-right-head-left">选择联系人</div>
            <div class="room-action-modal-body-right-head-right">
              已选择{{
                roomActionModal.type === 2 ? friendsSelected.length || 0 : roomMembersSelected.length || 0
              }}个联系人
            </div>
          </div>
          <div class="room-action-modal-body-right-body">
            <div class="room-action-modal-body-right-body-items scroll">
              <div class="room-action-modal-body-right-body-item"
                v-for="(item, i) in roomActionModal.type === 2 ? friendsSelected : roomMembersSelected" :key="i">
                <el-avatar :size="30" shape="square" :src="item.avatar"></el-avatar>
                <div class="room-action-modal-body-right-body-item-bottom ellipsis" :title="item.nickname">
                  {{ item.nickname }}
                </div>
              </div>
            </div>
            <div class="room-action-modal-body-right-body-bottom">
              <el-button @click="roomActionModal.visible = false">取消</el-button>
              <el-button @click="roomModalConfirm">完成</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog width="580px" class="chat-record-modal" append-to-body :visible="chatRecordModal.visible"
      :before-close="chatRecordModalClose" :show-close="false" destroy-on-close>
      <div class="chat-record-modal-title" slot="title">
        <div>
          {{ currentFriend.ShowName }}({{ currentFriend.ShowNameList ? currentFriend.ShowNameList.length : 0 }})
        </div>
        <i class="el-icon-circle-close" @click="chatRecordModalClose"></i>
      </div>
      <div class="chat-record-modal-body">
        <div class="chat-record-modal-search">
          <el-input v-model="chatRecordModal.searchVal" prefix-icon="el-icon-search" placeholder="搜索"
            clearable></el-input>
        </div>

        <el-divider></el-divider>

        <div class="chat-record-modal-tabs">
          <div class="chat-record-modal-tab" :class="{ 'chat-record-modal-tab-active': chatRecordModal.currentTab === 1 }"
            @click="chatRecordModalTabChange(1)">
            全部
          </div>
          <div class="chat-record-modal-tab" :class="{ 'chat-record-modal-tab-active': chatRecordModal.currentTab === 2 }"
            @click="chatRecordModalTabChange(2)">
            文件
          </div>
          <div class="chat-record-modal-tab" :class="{ 'chat-record-modal-tab-active': chatRecordModal.currentTab === 3 }"
            @click="chatRecordModalTabChange(3)">
            图片与视频
          </div>
          <div class="chat-record-modal-tab" :class="{ 'chat-record-modal-tab-active': chatRecordModal.currentTab === 4 }"
            @click="chatRecordModalTabChange(4)">
            链接
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog width="400px" class="add-friend-modal" append-to-body :visible="addFriendModal.visible"
      :before-close="addFriendModalClose" :show-close="false" destroy-on-close>
      <div class="add-friend-til">申请添加朋友</div>
      <div>
        <div class="add-friend-item-til">发送添加朋友申请</div>
        <div><el-input v-model="addFriendModal.Message" type="textarea" :rows="4" placeholder="请输入"></el-input></div>
      </div>
      <div>
        <div class="add-friend-item-til">设置备注</div>
        <div><el-input v-model="addFriendModal.Remark" type="textarea" :rows="2" placeholder="请输入"></el-input></div>
      </div>
      <div class="add-friend-bottom">
        <el-button @click="addFriendModalClose">取消</el-button>
        <el-button @click="addFriendModalConfirm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { RequestContactsInfoTask } from '@/api/webSocketApi'
import Bus from '@/utils/bus'
import { membersGetApi, cancelShieldApi } from '@/api/httpApi'
export default {
  name: 'ChatRoomManager',
  components: {},
  data() {
    return {
      members: [],
      isMore: false,
      isFixed: false,
      searchOptions: {
        val: undefined
      },
      user: {},
      roomActionModal: { visible: false, selected: {}, membersSelected: {}, searchVal: '' },
      chatRecordModal: { visible: false, currentTab: 1 },
      popoverVisible: {},
      memberDetail: {}, // 群成员详情
      addFriendModal: { visible: false, Message: undefined, Remark: undefined },

      membersNotFriend: [],
      currentInfoTab: 1,
      shieldDataOrigin: [],
      shieldDataSource: [],
      shieldData: [],
      shieldDataSelected: [],
      shieldAllChecked: false,
    }
  },
  computed: {
    ...mapState('nedb', {
      friendsList: 'friends' // 当前的通讯录列表
    }),
    ...mapGetters({
      currentFriend: 'conversation/currentFriend',
      currentWechat: 'conversation/currentWechat',
      currentFriendId: 'conversation/currentFriendId',
      currentWeChatId: 'conversation/currentWeChatId',
      friendsMap: 'nedb/friendsMap',
      strangersMap: 'nedb/strangersMap',
      currentWeChatId: 'conversation/currentWeChatId',
      atContent: 'conversation/content'
    }),
    friends: {
      get: function () {
        let data = []
        if (this.roomActionModal.searchVal)
        data = this.membersNotFriend.filter((item) => {
            return item.nickname.includes(this.roomActionModal.searchVal)
          })
        else data = this.membersNotFriend || []

        return data
      }
    },
    friendsSelected() {
      return this.membersNotFriend.filter((item) => this.roomActionModal.selected[item.friendId])
    },
    roomMembers: {
      get: function () {
        let data = []

        if (this.roomActionModal.memberSearchVal)
          data = this.currentFriend.ShowNameList.filter((item) => {
            return item.FriendNick.includes(this.roomActionModal.memberSearchVal)
          })
        else data = this.currentFriend.ShowNameList || []

        return data
      }
    },
    roomMembersSelected() {
      return this.currentFriend.ShowNameList
        ? this.currentFriend.ShowNameList.filter((item) => this.roomActionModal.membersSelected[item.UserName])
        : []
    },
    membersData: {
      get: function () {
        let data = []
        this.isFixed = false
        this.isMore = false

        if (this.searchOptions.val)
          data = this.currentFriend.ShowNameList.filter((item) => {
            return item.FriendNick.includes(this.searchOptions.val)
          })
        else data = this.currentFriend.ShowNameList || []

        this.members = data.slice(0, 10)
        return data
      },
      set: function (val) {
        this.isFixed = false
        this.isMore = false
        this.members = val.slice(0, 10)
        return val
      }
    },

    notFriends() {
      return this.membersNotFriend
    },
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
  watch: {
    currentFriend: {
      handler(currentFriend) {
        // console.log('currentFriend', currentFriend)
        this.user = {
          ...currentFriend,
          NickName: currentFriend.NickName || '--',
          Remark: currentFriend.Remark || '--',
          Notice: currentFriend.Notice || '--',
          ChatMeNick: currentFriend.ChatMeNick || '--'
        }
        this.shieldDataSource = this.shieldDataOrigin =
          currentFriend && currentFriend.ShowNameList
            ? currentFriend.ShowNameList.filter(
              (item) => item.FriendShieldGroupEnable || item.FriendShieldAllGroupEnable
            ).map((item) => ({ ...item }))
            : []
        this.shieldData = this.shieldDataSource.slice(0, 4)
      },
      immediate: true
    }
  },
  created() {
    Bus.$on('memberDetailChange', (friend) => {
      this.memberDetail = {
        ...this.memberDetail,
        ...friend
      }
    })
    window.addEventListener('click', () => {
      Object.keys(this.popoverVisible).forEach((key) => {
        this.popoverVisible[key] = false
      })
    })
  },
  mounted() { },
  methods: {
    infoTabChange(tab) {
      this.currentInfoTab = tab
    },
    shieldItemSelect(checked, item) {
      this.shieldDataSelected = this.shieldData.filter((unit) => unit.checked)
      this.shieldAllChecked = this.shieldDataSelected.length === this.shieldDataSource.length
    },
    shieldItemsSelect(checked) {
      this.shieldAllChecked = checked
      this.shieldDataSource = this.shieldDataSource.map((item) => ({
        ...item,
        checked
      }))
      this.shieldData = this.shieldData.map((item) => ({
        ...item,
        checked
      }))
      this.shieldDataSelected = checked ? this.shieldDataSource : []
    },
    async cancelShieldAction(command) {
      console.log(command)
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      const { code, data } = await cancelShieldApi({
        account: loginInfo.name,
        wechatId: this.currentWeChatId,
        wxIds: this.shieldDataSelected.map((item) => item.UserName),
        chatRoomId: this.currentFriendId,
        chatAllEnable: command === 'all'
      })
      if (code === 0) {
        this.$message.success('操作成功')
        this.shieldAllChecked = this.shieldDataSelected.length === this.shieldDataSource.length
        Bus.$emit('shieldCancel')
      }
    },
    roomControl() {
      this.isMore = !this.isMore
      if (this.currentInfoTab === 1) {
        this.members = this.isMore ? this.membersData : this.membersData.slice(0, 10)
      } else if (this.currentInfoTab === 2) {
        this.shieldData = this.isMore ? this.shieldDataSource : this.shieldDataSource.slice(0, 4)
      }

      this.$nextTick(() => {
        const scrollDom = document.querySelector('.chat-rooms-manager')
        const controlDom = document.querySelector('.room-control')

        const scrollDomClientHeight = scrollDom.clientHeight
        const controlDomOffsetTop = controlDom.offsetTop
        this.isFixed = controlDomOffsetTop - scrollDomClientHeight > 0
      })
    },
    scroll() {
      const scrollDom = document.querySelector('.chat-rooms-manager')
      const controlDom = document.querySelector('.room-control')

      const scrollDomClientHeight = scrollDom.clientHeight
      const scrollDomScrollTop = scrollDom.scrollTop

      if (controlDom) {
        const controlDomOffsetTop = controlDom.offsetTop
        if (controlDomOffsetTop - scrollDomClientHeight > 0) {
          this.isFixed = scrollDomScrollTop < controlDomOffsetTop - scrollDomClientHeight
        }
      }
    },
    search() {
      if (this.currentInfoTab === 1) {
        if (this.searchOptions.val)
          this.membersData = this.currentFriend.ShowNameList.filter((item) => {
            return item.FriendNick && item.FriendNick.includes(this.searchOptions.val)
          })
        else {
          this.membersData = this.currentFriend.ShowNameList || []
          this.isFixed = false
          this.isMore = false
        }
      } else if (this.currentInfoTab === 2) {
        if (this.searchOptions.val) {
          this.shieldDataSource = this.shieldDataOrigin.filter((item) => {
            return item.FriendNick && item.FriendNick.includes(this.searchOptions.val)
          })
          this.shieldData = this.shieldDataSource.slice(0, 4)
        } else {
          this.isFixed = false
          this.isMore = false
          this.shieldDataSource = this.shieldDataOrigin || []
          this.shieldData = this.shieldDataSource.slice(0, 4)
        }
      }
    },
    updateInfo(type, field) {
      const content = {
        WeChatId: this.currentFriend.WeChatId, // 商家所属微信号
        ChatRoomId: this.currentFriend.UserName, // 群聊id
        Action: type, // 指令
        Content: this.user[field]
      }
      this.$store.dispatch('websocket/ChatRoomActionTask', content)
    },
    roomModalAction(type) {
      this.roomActionModal.type = type
      this.roomActionModal.visible = true
      if (type === 2) {
        this.getMemberData()
      }
    },
    roomModalClose() {
      this.roomActionModal.visible = false
    },
    roomModalConfirm() {
      const content = {
        WeChatId: this.currentFriend.WeChatId, // 商家所属微信号
        ChatRoomId: this.currentFriend.UserName, // 群聊id
        Action: this.roomActionModal.type, // 指令
        Content:
          this.roomActionModal.type === 2
            ? this.friendsSelected.map((item) => item.FriendId).join(',')
            : this.roomMembersSelected.map((item) => item.UserName).join(',')
      }
      this.$store.dispatch('websocket/ChatRoomActionTask', content)
    },
    chatRecordModalAction() {
      this.chatRecordModal.visible = true
    },
    chatRecordModalClose() {
      this.chatRecordModal.visible = false
    },
    chatRecordModalTabChange(tab) {
      this.chatRecordModal.currentTab = tab
    },
    noticeModalAction() {
      Bus.$emit('roomNotice')
    },

    // 获取群成员详情
    showMemberDetail(item) {
      //console.log(item)
      //名片

      this.popoverVisible[item.UserName] = true
      Object.keys(this.popoverVisible).forEach((key) => {
        if (key !== item.UserName) this.popoverVisible[key] = false
      })

      if (this.currentFriendId) {
        const member = item.UserName
        if (this.friendsMap[member]) {
          //console.log(1)
          this.memberDetail = this.friendsMap[member]
          //this.memberDialog = true
        } else if (this.strangersMap[member]) {
          this.memberDetail = {
            WeChatId: this.currentWeChatId,
            FriendId: member,
            Avatar: this.strangersMap[member].Avatar ? this.strangersMap[member].Avatar : '',
            FriendNick: this.strangersMap[member].Nickname ? this.strangersMap[member].Nickname : '',
            LabelIds: ''
          }
        } else {
          this.memberDetail = {
            WeChatId: this.currentWeChatId,
            FriendId: member,
            Avatar: '',
            FriendNick: '',
            LabelIds: ''
          }
          this.getMemberDetail()
        }
      }
    },
    // 获取详情
    getMemberDetail() {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      RequestContactsInfoTask(
        this.memberDetail.WeChatId,
        this.memberDetail.FriendId,
        loginInfo.name,
        this.currentFriendId
      )
    },

    atSomebody(item) {
      this.$store.commit('conversation/SET_REMARK', item.UserName)
      // 这里的不是空格是\u2005
      this.$store.commit('conversation/SET_CONTENT', `${this.atContent}@${item.FriendNick}\u2005`)
    },

    addFriend() {
      this.addFriendModal.visible = true
    },
    addFriendModalClose() {
      this.addFriendModal.visible = false
    },
    addFriendModalConfirm() {
      const content = {
        WeChatId: this.memberDetail.WeChatId,
        ChatroomId: this.currentFriendId, // 所在的群聊id
        FriendId: this.memberDetail.FriendId, // 请求加好友微信内部全局唯一识别码
        Message: this.addFriendModal.Message, // 招呼语
        Remark: this.addFriendModal.Remark // 备注信息
      }
      this.$store.dispatch('websocket/AddFriendInChatRoomTask', content)
      this.addFriendModal.visible = false
      this.$message.success('发送成功')
    },

    getMemberData() {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      membersGetApi({
        weChatId: this.currentWeChatId,
        chatRoomId: this.currentFriendId,
        account: loginInfo.name,
        memberList: this.currentFriend.ShowNameList.map((item) => item.UserName)
      }).then((res) => {
        if (res.code === 0) {
          this.membersNotFriend = res.data || []
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-rooms-manager {
  position: relative;
  flex: 1 1 auto;
  padding: 0px 6px;
  overflow-y: scroll;

  :deep(.room-search) {
    position: sticky;
    top: 0px;
    padding: 12px 8px;
    background-color: #fff;
    z-index: 999;

    .el-input__inner {
      height: 34px;
      line-height: 34px;
    }

    .el-input__icon {
      line-height: 34px;
    }
  }

  .room-members {
    display: flex;
    flex-wrap: wrap;
    margin-top: 12px;
    padding: 0 5px;

    .room-member {
      width: 25%;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 8px;
      font-size: 12px;

      .el-avatar {
        margin-bottom: 5px;
      }

      .room-member-name {
        width: 85%;
        color: #000000;
        text-align: center;
      }

      .room-member-company {
        width: 85%;
        color: #ff931f;
      }

      .room-member-icon {
        width: 45px;
        height: 45px;
        line-height: 45px;
        text-align: center;
        border-radius: 6px;
        border: 1px dashed #979797;
        margin-bottom: 5px;
        cursor: pointer;

        .el-icon-plus,
        .el-icon-minus {
          color: #979797;
        }
      }
    }
  }

  .room-control {
    font-size: 12px;
    color: #666666;
    text-align: center;
    margin-top: 15px;
    cursor: pointer;
  }

  .room-control-sticky {
    position: sticky;
    bottom: 0px;
    background-color: #f5f5f5;
    margin: 0 -6px;
    padding: 10px 0;
    text-align: center;
    font-size: 12px;
    color: #666666;
    cursor: pointer;
    z-index: 1001;
  }

  .el-divider {
    margin: 12px 0;
  }

  .room-action {
    padding: 0 5px 12px;

    .room-til {
      margin-bottom: 5px;
    }

    .room-des {
      display: flex;
      align-items: center;
      color: #999999;

      .room-des-info {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      :deep(.el-input) {
        .el-input__inner {
          border: none;
          padding: 0;
          line-height: normal;
        }
      }
    }

    .room-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;

      .room-item-left {}

      .room-item-right {}
    }

    :deep(.room-collect-btn) {
      width: 100%;
      margin-top: 24px;
      height: 30px;
      line-height: 30px;
      padding: 0;
      font-size: 12px;
    }
  }

  .shield-members {
    .shield-members-head {
      padding: 0px 8px;

      .el-button {
        margin-right: 8px;
      }
    }

    .shield-members-items {
      padding: 8px 0 0;

      .shield-members-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        padding: 0px 8px;

        .el-checkbox {
          margin-right: 8px;
        }

        .el-avatar {
          margin-right: 6px;
        }
      }

      .shield-members-items-head {
        display: flex;
        align-items: center;
        background-color: #f9f9f9;
        padding: 8px;
        border: 1px solid #ededed;
        margin-bottom: 8px;
        color: #666666;

        .el-checkbox {
          margin-right: 8px;
        }

        .shield-members-items-head-item {
          display: inline-block;
          width: 45px;
          margin-right: 6px;

          &:nth-child(2) {
            text-align: center;
          }
        }
      }
    }
  }
}

.tabs {
  display: flex;
  justify-content: center;
  padding: 0 10px;

  .tab {
    flex: 1;
    text-align: center;
    padding: 6px 0px 0px;
    color: #666666;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
  }

  .tab-active {
    position: relative;
    color: #0cc160;

    &::after {
      position: absolute;
      content: '';
      display: inline-block;
      width: 40%;
      height: 2px;
      background-color: #0cc160;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
    }
  }
}
</style>

