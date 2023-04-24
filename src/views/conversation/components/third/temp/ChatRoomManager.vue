<template>
  <div class="chat-rooms-manager scroll">
    <!-- 群名称 -->
    <div class="room-info-item">
      <div class="room-info-item-title">
        <span class="tip">群聊名称</span>
        <div class="btns">
          <el-button style="padding: 3px" plain icon="el-icon-edit-outline" circle @click="changeRoomName"></el-button>
        </div>
      </div>
      <div class="room-info-item-content">{{ currentFriend.NickName || '' }}</div>
    </div>
    <!-- 群公告 -->
    <div class="room-info-item">
      <div class="room-info-item-title">
        <span class="tip">群公告</span>
        <div class="btns">
          <el-button
            v-if="currentFriend.WeChatId === currentFriend.Owner"
            plain
            icon="el-icon-edit-outline"
            circle
            @click="changeNotice"
          ></el-button>
        </div>
      </div>
      <div class="room-info-item-content">{{ currentFriend.Notice || '' }}</div>
    </div>
    <!-- 群内昵称 -->
    <div class="room-info-item">
      <div class="room-info-item-title">
        <span class="tip">群内昵称</span>
        <div class="btns">
          <el-button plain icon="el-icon-edit-outline" circle @click="changeMyRoomName"></el-button>
        </div>
      </div>
      <div class="room-info-item-content">{{ currentFriend.SelfDisplayName || '' }}</div>
    </div>
    <!-- 群主 -->
    <div class="room-info-item">
      <div class="room-info-item-title">
        <span class="tip">群主</span>
        <div class="btns">
          <el-button
            v-if="currentFriend.WeChatId === currentFriend.Owner"
            plain
            icon="el-icon-s-promotion"
            circle
            @click="transferOwner"
          ></el-button>
        </div>
      </div>
      <div class="room-info-item-content owner">
        <!-- 群主头像 -->
        <el-avatar
          class="avatar"
          shape="square"
          :size="32"
          :src="
            friendsMap[currentFriend.Owner]
              ? friendsMap[currentFriend.Owner].Avatar
              : strangersMap[currentFriend.Owner]
                ? strangersMap[currentFriend.Owner].Avatar
                : ''
          "
          :title="currentFriend.Owner"
          @click.native="showMemberDetail(currentFriend.Owner)"
        >
          <i class="fa fa-picture-o" aria-hidden="true" title="头像miss"></i>
        </el-avatar>
        <!-- 群主昵称 -->
        <div class="owner-name">
          <span v-if="friendsMap[currentFriend.Owner]" v-text="friendsMap[currentFriend.Owner].FriendNick"></span>
          <span
            v-else-if="strangersMap[currentFriend.Owner]"
            v-text="strangersMap[currentFriend.Owner].Nickname"
          ></span>
          <span v-else v-text="currentFriend.Owner"></span>
        </div>
      </div>
    </div>
    <!-- 群成员 -->
    <div class="room-info-item">
      <div class="room-info-item-title">
        <span class="tip">
          群成员
          <span v-if="currentFriend.MemberList" v-text="currentFriend.MemberList.length + '个人'"></span>
        </span>
        <div class="btns">
          <el-button plain icon="el-icon-plus" circle @click="addMember"></el-button>
          <el-button type="danger" plain icon="el-icon-minus" circle @click="kickMember"></el-button>
          <el-button plain icon="el-icon-view" circle @click="viewAllMember"></el-button>
        </div>
      </div>
      <div class="room-info-item-content avatars">
        <el-avatar
          v-for="(member, index) in currentFriend.MemberList"
          v-show="index < maxNumber"
          :key="index"
          class="avatar"
          :class="{ 'not-friend': !friendsMap[member] }"
          shape="square"
          :size="32"
          :src="
            friendsMap[member] && friendsMap[member].Avatar
              ? friendsMap[member].Avatar
              : strangersMap[member] && strangersMap[member].Avatar
                ? strangersMap[member].Avatar
                : ''
          "
          :title="
            friendsMap[member] && friendsMap[member].FriendNick
              ? friendsMap[member].FriendNick
              : strangersMap[member] && strangersMap[member].Nickname
                ? strangersMap[member].Nickname
                : member
          "
          @click.native="showMemberDetail(member)"
        >
          <i class="fa fa-picture-o" aria-hidden="true" title="头像miss"></i>
        </el-avatar>
      </div>
      <div class="friend-item-footer">
        <el-button
          v-if="currentFriend.MemberList && currentFriend.MemberList.length > 32"
          style="background-color: #ff9f00; color: #ffffff; border: none"
          size="small"
          class="footer-btn"
          @click="showAllMember"
        >
          查看全部群成员
        </el-button>
      </div>
    </div>
    <!-- 删除并退出 -->
    <el-button type="danger" size="small" style="margin: 15px auto; width: 150px" @click="deleteAndLogout">
      删除并退出
    </el-button>

    <SlotFriends
      v-if="friendsDialogVisible"
      :dialogTilte="dialogTilte"
      :action="action"
      :currentFriend="currentFriend"
      :friends="dialogData"
      :friendsDialogVisible="friendsDialogVisible"
      @closeSlotFriends="friendsDialogVisible = false"
    />

    <!-- 群成员详情 -->
    <el-dialog class="member-detail" :modal="false" title="群成员详情" :visible.sync="memberDialog">
      <div class="member-detail-info">
        <el-avatar shape="square" :size="100" :src="memberDetail.Avatar">
          <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
        </el-avatar>
        <div class="member-detail-text">
          <p>
            微信：
            <span v-text="memberDetail.FriendId"></span>
          </p>
          <p>
            昵称：
            <span v-text="memberDetail.FriendNick || '- -'"></span>
          </p>
          <p>
            性别：
            <span v-text="memberDetail.Gender || '- -'"></span>
          </p>
          <p>
            地址：
            <span v-text="memberDetail.Province || '-'"></span>
            &nbsp;
            <span v-text="memberDetail.City || '-'"></span>
          </p>
        </div>
      </div>
      <div class="member-detail-btns">
        <el-button
          v-if="!friendsMap[memberDetail.FriendId]"
          style="background-color: #ff9f00; color: #ffffff; border: none"
          size="medium"
          @click="getMemberDetail"
        >
          获取详情
        </el-button>
        <el-button
          v-if="!friendsMap[memberDetail.FriendId]"
          style="background-color: #ff9f00; color: #ffffff; border: none"
          size="medium"
          @click="addToAddress"
        >
          添加到通讯录
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import { RequestContactsInfoTask } from '@/api/webSocketApi'
import SlotFriends from '@/components/slot/SlotFriends'

export default {
  name: 'ChatRoomManager',
  components: {
    SlotFriends
  },
  data() {
    return {
      maxNumber: 30,
      memberDialog: false, // 显示群成员详情
      memberDetail: {}, // 群成员详情
      action: 0,
      dialogTilte: '添加群成员',
      dialogData: [],
      friendsDialogVisible: false,
      doNotTouch: 0, // 免打扰
      saveToAddress: 0, // 保存到通讯录
      setInvitationConfirm: 0 // 邀请确认
    }
  },
  computed: {
    ...mapState('nedb', {
      friends: 'friends'
    }),
    ...mapGetters({
      currentFriend: 'conversation/currentFriend',
      friendsMap: 'nedb/friendsMap',
      strangersMap: 'nedb/strangersMap'
    })
  },
  created() {
    this.viewAllMember = this._.throttle(this.viewAllMember, 5000)
  },
  methods: {
    // 改群名
    changeRoomName() {
      if (!this.currentFriend.UserName) {
        this.$message.warning('请先选择一个群！')
        return
      }
      this.$prompt('修改群聊名称', '修改群聊名称', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S{1,50}/,
        inputValue: this.currentFriend.NickName,
        inputPlaceholder: this.currentFriend.NickName,
        inputErrorMessage: '备注长度1-50，不能含有特殊字符！'
      })
        .then(({ value }) => {
          if (value.trim() === this.currentFriend.NickName) {
            this.$message.warning('群内名称没有改变')
            return
          }
          const content = {
            WeChatId: this.currentFriend.WeChatId, // 商家所属微信号
            ChatRoomId: this.currentFriend.UserName, // 群聊id
            Action: 0, // 指令
            Content: value
          }
          this.$store.dispatch('websocket/ChatRoomActionTask', content)
        })
        .catch(() => {})
    },
    // 改我的群昵称
    changeMyRoomName() {
      if (!this.currentFriend.UserName) {
        this.$message.warning('请先选择一个群！')
        return
      }
      this.$prompt('修改我的群昵称', '修改我的群昵称', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S{1,50}/,
        inputValue: this.currentFriend.SelfDisplayName,
        inputPlaceholder: this.currentFriend.SelfDisplayName,
        inputErrorMessage: '备注长度1-50，不能含有特殊字符！'
      })
        .then(({ value }) => {
          if (value.trim() === this.currentFriend.SelfDisplayName) {
            this.$message.warning('群内昵称没有改变')
            return
          }
          const content = {
            WeChatId: this.currentFriend.WeChatId, // 商家所属微信号
            ChatRoomId: this.currentFriend.UserName, // 群聊id
            Action: 4, // 指令
            Content: value
          }
          this.$store.dispatch('websocket/ChatRoomActionTask', content)
        })
        .catch(() => {})
    },
    // 修改群公告
    changeNotice() {
      if (!this.currentFriend.UserName) {
        this.$message.warning('请先选择一个群！')
        return
      }
      this.$prompt('修改群公告', '修改群公告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S{1,500}/,
        inputErrorMessage: '备注长度1-500，不能含有特殊字符！'
      })
        .then(({ value }) => {
          const content = {
            WeChatId: this.currentFriend.WeChatId, // 商家所属微信号
            ChatRoomId: this.currentFriend.UserName, // 群聊id
            Action: 1, // 指令
            Content: value
          }
          this.$store.dispatch('websocket/ChatRoomActionTask', content)
        })
        .catch(() => {})
    },
    // 删除并退出群
    deleteAndLogout() {
      if (!this.currentFriend.UserName) {
        this.$message.warning('请先选择一个群！')
        return
      }
      this.$confirm('删除并退出群?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const content = {
            WeChatId: this.currentFriend.WeChatId, // 商家所属微信号
            ChatRoomId: this.currentFriend.UserName, // 群聊id
            Action: 7 // 指令
          }
          this.$store.dispatch('websocket/ChatRoomActionTask', content)
          this.$message.success('指令已经下发！')
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    },
    // 拉人进群
    addMember() {
      this.dialogTilte = '拉人进群'
      this.action = 2
      this.friendsDialogVisible = true
      // 过滤掉已经在群里的好友
      this.dialogData = this.friends.filter((x) => {
        return this.currentFriend.MemberList.indexOf(x.FriendId) < 0
      })
    },
    // 踢出群 只有群主才能踢人
    kickMember() {
      if (this.currentFriend.WeChatId === this.currentFriend.Owner) {
        const membersList = []
        for (const mid of this.currentFriend.MemberList) {
          // 过滤群主自己
          if (mid !== this.currentFriend.Owner) {
            let avatar = ''
            if (this.friendsMap[mid] && this.friendsMap[mid].Avatar) {
              avatar = this.friendsMap[mid].Avatar
            } else if (this.strangersMap[mid] && this.strangersMap[mid].Avatar) {
              avatar = this.strangersMap[mid].Avatar
            }
            let friendNick = ''
            if (this.friendsMap[mid] && this.friendsMap[mid].FriendNick) {
              friendNick = this.friendsMap[mid].FriendNick
            } else if (this.strangersMap[mid] && this.strangersMap[mid].Nickname) {
              friendNick = this.strangersMap[mid].Nickname
            }
            const friend = {
              WeChatId: this.currentFriend.WeChatId,
              FriendId: mid,
              Avatar: avatar,
              FriendNick: friendNick,
              LabelIds: this.friendsMap[mid] && this.friendsMap[mid].LabelIds ? this.friendsMap[mid].LabelIds : ''
            }
            membersList.push(friend)
          }
        }
        this.dialogData = membersList
        this.dialogTilte = '踢人出群'
        this.action = 3
        this.friendsDialogVisible = true
      } else {
        this.$message.warning('你不是群主！')
      }
    },
    // 转让群主
    transferOwner() {
      if (this.currentFriend.WeChatId === this.currentFriend.Owner) {
        const membersList = []
        for (const mid of this.currentFriend.MemberList) {
          let avatar = ''
          if (this.friendsMap[mid] && this.friendsMap[mid].Avatar) {
            avatar = this.friendsMap[mid].Avatar
          } else if (this.strangersMap[mid] && this.strangersMap[mid].Avatar) {
            avatar = this.strangersMap[mid].Avatar
          }
          let friendNick = ''
          if (this.friendsMap[mid] && this.friendsMap[mid].FriendNick) {
            friendNick = this.friendsMap[mid].FriendNick
          } else if (this.strangersMap[mid] && this.strangersMap[mid].Nickname) {
            friendNick = this.strangersMap[mid].Nickname
          }
          const friend = {
            WeChatId: this.currentFriend.WeChatId,
            FriendId: mid,
            Avatar: avatar,
            FriendNick: friendNick,
            LabelIds: this.friendsMap[mid] && this.friendsMap[mid].LabelIds ? this.friendsMap[mid].LabelIds : ''
          }
          membersList.push(friend)
        }
        this.dialogData = membersList
        this.dialogTilte = '群主转让'
        this.action = 10
        this.friendsDialogVisible = true
      } else {
        this.$message.warning('你不是群主！')
      }
    },
    // 显示或隐藏群成员
    showAllMember() {
      this.maxNumber === 30 ? (this.maxNumber = 500) : (this.maxNumber = 30)
    },
    // 查看群成员
    viewAllMember() {
      const content = {
        WeChatId: this.currentFriend.WeChatId, // 商家所属微信号
        ChatRoomId: this.currentFriend.UserName, // 群聊id
        Action: 9 // 指令
      }
      this.$store.dispatch('websocket/ChatRoomActionTask', content)
      this.$message.info('指令已经下发！')
    },
    // 成员详情
    showMemberDetail(member) {
      if (this.friendsMap[member]) {
        this.memberDetail = this.friendsMap[member]
      } else if (this.strangersMap[member]) {
        this.memberDetail = {
          WeChatId: this.currentFriend.WeChatId,
          FriendId: member,
          Avatar: this.strangersMap[member].Avatar ? this.strangersMap[member].Avatar : '',
          FriendNick: this.strangersMap[member].Nickname ? this.strangersMap[member].Nickname : '',
          LabelIds: ''
        }
      } else {
        this.memberDetail = {
          WeChatId: this.currentFriend.WeChatId,
          FriendId: member,
          Avatar: '',
          FriendNick: '',
          LabelIds: ''
        }
      }
      this.memberDialog = true
    },
    // 添加到通讯录
    addToAddress() {
      const content = {
        WeChatId: this.memberDetail.WeChatId, // 商家个人微信内部全局唯一识别码
        ChatroomId: this.currentFriend.UserName, // 所在的群聊id
        FriendId: this.memberDetail.FriendId, // 请求加好友微信内部全局唯一识别码
        Message: '', // 招呼语
        Remark: '' // 备注信息
      }
      this.$store.dispatch('websocket/AddFriendInChatRoomTask', content)

      this.memberDialog = false
      this.$message.info('指令已经下发！')
    },
    // 获取详情
    getMemberDetail() {
      RequestContactsInfoTask(this.memberDetail.WeChatId, this.memberDetail.FriendId)
      this.memberDialog = false
      this.$message.info('指令已经下发！')
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-rooms-manager {
  flex: 1 1 auto;
  padding: 5px;
  overflow: auto;
  display: flex;
  flex-direction: column;

  .room-info-item {
    width: 100%;
    margin-bottom: 5px;

    .room-info-item-title {
      background: #f5f5f5;
      padding: 0 5px;
      height: 36px;
      line-height: 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .btns {
        .el-button {
          padding: 2px;
        }
      }
    }

    .room-info-item-content {
      min-height: 30px;
      padding: 5px;
    }

    .owner {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .owner-name {
        margin-left: 5px;
        @include ellipsis(3);
      }
    }

    .avatars {
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      .avatar {
        margin: 2px;
      }
      .not-friend {
        border: solid orange 1px;
        // filter: grayscale(0.9);
      }
    }

    .friend-item-footer {
      display: flex;
      justify-content: center;
      .footer-btn {
        width: 150px;
      }
    }
  }

  .member-detail {
    display: flex;
    flex-direction: column;

    ::v-deep .el-dialog {
      width: 500px;
      .el-dialog__body {
        padding: 20px;
      }
    }
    .member-detail-info {
      display: flex;
      .member-detail-text {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin-left: 20px;
        overflow: hidden;
      }
    }
    .member-detail-btns {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
    }
  }
}
</style>

