<template>
  <!-- 好友dialog -->
  <el-dialog
    append-to-body
    :title="dialogTilte"
    class="slot-friends"
    :visible="friendsDialogVisible"
    :before-close="beforeCloseSlotFriendsDialog"
  >
    <div class="slot-friends-content">
      <div class="operation-box">
        <!-- 搜索 -->
        <el-input
          v-model.lazy="searchContent"
          class="search-input"
          size="small"
          suffix-icon="el-icon-search"
          type="text"
          placeholder="输入昵称搜索"
        ></el-input>
        <!-- 标签 -->
        <!-- <el-button disabled>ddd</el-button> -->
        <ul v-show="!searchContent" class="label-list scroll">
          <li
            class="label-item"
            :class="{ 'current-label': currentLabel === 'allFriends' }"
            @click="showFriends('allFriends')"
          >
            <input
              type="checkbox"
              style="margin-left: 5px"
              :checked="friendsChecked.length === friends.length"
              @click="choseFriendsByLabel($event, 'allFriends')"
            />
            <p>全部好友</p>
          </li>
          <li
            v-for="(label, index) in labels"
            :key="index"
            class="label-item"
            :class="[
              { 'current-label': currentLabel === label.LabelId },
              { 'label-disabled': friendsOfEveryLabel[label.LabelId].length === 0 }
            ]"
            @click="friendsOfEveryLabel[label.LabelId].length === 0 ? '' : showFriends(label.LabelId)"
          >
            <input
              type="checkbox"
              style="margin-left: 5px"
              :checked="
                friendsOfEveryLabel[label.LabelId].length !== 0 &&
                  friendsOfEveryLabel[label.LabelId].length === friendsCheckedByLabel[label.LabelId].length
              "
              @click="choseFriendsByLabel($event, label.LabelId)"
            />
            <p>{{ label.LabelName }}({{ friendsOfEveryLabel[label.LabelId].length }})</p>
          </li>
        </ul>
      </div>

      <!-- 好友列表 -->
      <div class="friends-list">
        <el-table :data="tableData" stripe>
          <el-table-column type="index" :index="indexMethod" label="序号" width="60px"></el-table-column>
          <el-table-column label="昵称" prop="FriendNick"></el-table-column>
          <el-table-column label="头像" width="60px" style="border: solid red 1px">
            <template slot-scope="scope">
              <el-image style="width: 30px; height: 30px" :src="scope.row.Avatar">
                <div slot="error" class="image-slot">
                  <i style="font-size: 30px" class="el-icon-picture-outline"></i>
                </div>
              </el-image>
            </template>
          </el-table-column>
          <el-table-column label="备注名" prop="Memo"></el-table-column>
          <!-- <el-table-column label="标签">
            <template slot-scope="scope">
              <el-tag
                v-for="(labelId, index) in formatLabelId(scope.row.LabelIds)"
                :key="index"
                class="label"
                v-text="$options.filters.labelFilter(labelId, labels)"
              ></el-tag>
            </template>
          </el-table-column> -->
          <el-table-column width="100px">
            <template slot="header">
              <!-- <div class="all-check">
                <input
                  id="table-all-checked"
                  style="border-color: #409eff; margin: auto 5px"
                  type="checkbox"
                  disabled
                  :checked="tableAllChecked"
                  @click="choseAllData($event)"
                />
                <label for="table-all-checked">全 选</label>
              </div> -->
            </template>
            <template slot-scope="scope">
              <input
                v-if="currentLabel === 'allFriends'"
                type="checkbox"
                style="margin-left: 5px"
                :checked="friendsChecked.indexOf(scope.row.FriendId) >= 0"
                @click="choseFriend($event, scope.row)"
              />
              <input
                v-else
                type="checkbox"
                style="margin-left: 5px"
                :checked="friendsCheckedByLabel[currentLabel].indexOf(scope.row.FriendId) >= 0"
                @click="choseFriend($event, scope.row)"
              />
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <!-- <el-pagination
          style="margin: 0 auto"
          :current-page="currentPage"
          :page-sizes="[20, 40, 60, 80]"
          :page-size="pageSize"
          :pager-count="7"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination> -->
      </div>
    </div>

    <div class="tip">
      <p>*点击左侧好友标签一键选中当前页面该标签好友</p>
      <p>共{{ friends.length }}人,已选{{ finalFriends.length }}人</p>
    </div>

    <span slot="footer">
      <el-button size="small" @click="beforeCloseSlotFriendsDialog">取 消</el-button>
      <el-button type="primary" size="small" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import { uniqueArryList } from '@/utils/util.js'
import { TalkToFriendTask } from '@/api/webSocketApi'

export default {
  props: {
    currentFriend: {
      type: Object,
      required: true,
      default: function () {
        return {}
      }
    }, // 当前选中的好友
    friendsDialogVisible: {
      type: Boolean,
      required: true,
      default: false
    }, // 展示dialog
    dialogTilte: {
      type: String,
      required: true,
      default: '好友列表'
    }, // dialog的title
    action: {
      type: [String, Number],
      required: false,
      default: 0
    }, // dialog的作用 发名片|建群|...
    friends: {
      type: Array,
      default: function () {
        return []
      }
    } // 表的原始数据
  },
  data() {
    return {
      tableData: this.friends, // 表数据 默认展示全部的好友
      searchContent: '', // 搜索框的内容
      currentLabel: 'allFriends', // 要展示的好友标签
      friendsChecked: [], // 已选择的好友的id
      friendsCheckedByLabel: {}, // 每个label选中的好友
      labelsCheckedId: [], // 选中的标签id
      finalFriends: [] // 计算最终选中的好友
      // tableAllChecked: false // 表格中的全选按钮
      // currentPage: 1, // 当前页
      // pageSize: 20, // 每页消息数
    }
  },
  computed: {
    ...mapState('nedb', {
      labels: 'labels'
    }),
    ...mapGetters({
      currentWeChatId: 'conversation/currentWeChatId',
      currentFriendId: 'conversation/currentFriendId',
      labelNameMap: 'nedb/labelNameMap',
      labelIdMap: 'nedb/labelIdMap'
    }),
    // 每个label下的好友
    friendsOfEveryLabel() {
      const felm = {}
      for (const label of this.labels) {
        felm[label.LabelId] = this.friends.filter((x) => {
          return x.LabelIds && x.LabelIds.indexOf(String(label.LabelId)) >= 0
        })
      }
      return uniqueArryList(felm, 'FriendId')
    },
    // // 表数据分页展示
    // tableDataPage() {
    //   // 分页 每页50
    //   const size = this.pageSize
    //   const newData = []
    //   for (let i = 0; i < this.tableData.length; i += size) {
    //     newData.push(this.tableData.slice(i, i + size))
    //   }
    //   return newData
    // },
    // 群成员
    allReadyMember() {
      let am = []
      if (this.action === 2) {
        if (this.currentFriend.MemberList) {
          am = [].concat(this.currentFriend.MemberList)
        }
        if (this.currentFriend.WeChatId === this.currentFriend.Owner) {
          am.push(this.currentFriend.WeChatId)
        }
      }
      return am
    }
  },
  watch: {
    // 监听搜索栏
    searchContent(sc) {
      if (sc) {
        this.tableData = this.friends.filter((x) => {
          // 昵称
          if (x.FriendNick) {
            return x.FriendNick.indexOf(this.searchContent) >= 0
          }
          // 备注
          if (x.Memo) {
            return x.Memo.indexOf(this.searchContent) >= 0
          }
          // 群名
          if (x.NickName) {
            return x.NickName.indexOf(this.searchContent) >= 0
          }
          // 陌生人
          if (x.Nickname) {
            return x.Nickname.indexOf(this.searchContent) >= 0
          }
        })
      } else {
        this.tableData = this.friends
      }
    }
  },
  created() {
    for (const label of this.labels) {
      this.friendsCheckedByLabel[label.LabelId] = []
    }
  },
  methods: {
    // 计算序号
    indexMethod(index) {
      return index + 1
    },
    // 关闭dialog
    beforeCloseSlotFriendsDialog() {
      this.$emit('closeSlotFriends', true)
    },
    // 提交按钮
    submit() {
      // 至少选择一个群成员|好友
      const friendsNumber = this.finalFriends.length
      const membersNumber = this.currentFriend.MemberList ? this.currentFriend.MemberList.length : 0

      if (friendsNumber === 0) {
        this.$alert('请选中好友！', '提示', { type: 'warning' })
        return
      }

      const msg = {
        WeChatId: this.currentWeChatId
      }
      switch (this.action) {
        case 2:
          // 拉人进群，群人数不能超过500
          if (membersNumber + friendsNumber >= 500) {
            this.$message.warning('群人数不能超过500人！')
            return
          }
          msg.ChatRoomId = this.currentFriend.UserName
          msg.Action = this.action
          msg.Content = this.finalFriends.join(',')
          this.$store.dispatch('websocket/ChatRoomActionTask', msg)
          break
        case 3:
          // 踢人出群
          msg.ChatRoomId = this.currentFriend.UserName
          msg.Action = this.action
          msg.Content = this.finalFriends.join(',')
          this.$store.dispatch('websocket/ChatRoomActionTask', msg)
          break
        case 8:
          // 创建群聊 人数并不能大于500
          if (friendsNumber > 500) {
            this.$alert('群聊人数不能大于500！', '提示', { type: 'warning' })
            return
          }
          msg.ChatRoomId = this.currentFriend.UserName
          msg.Action = this.action
          msg.Content = this.finalFriends.join(',')
          this.$store.dispatch('websocket/ChatRoomActionTask', msg)
          break
        case 10:
          // 转让群主
          if (friendsNumber !== 1) {
            this.$alert('转让群主，只能选择一个群成员！', '提示', { type: 'warning' })
            return
          }
          msg.ChatRoomId = this.currentFriend.UserName
          msg.Action = this.action
          msg.Content = this.finalFriends.join(',')
          this.$store.dispatch('websocket/ChatRoomActionTask', msg)
          break
        case 'NameCard':
          // 发送名片 只能选择一个好友
          if (friendsNumber > 1) {
            this.$message.warning('发名片，只能选择一个好友员！')
            return
          }
          TalkToFriendTask(this.currentWeChatId, this.currentFriendId, this.action, this.finalFriends.join(','))

          break
        case 'SendFriendCircle':
          this.$emit('handlerCheckedFriends', this.finalFriends)
          break
        default:
          break
      }
      if (this.action !== 'SendFriendCircle') {
        this.$message.info('任务已经下发!')
      }
      // 提交任务后关闭dialog
      this.beforeCloseSlotFriendsDialog()
    },
    // 展示数据
    showFriends(labelId) {
      if (labelId === 'allFriends') {
        this.tableData = this.friends
      } else {
        this.tableData = this.friends.filter((x) => {
          return x.LabelIds && x.LabelIds.indexOf(String(labelId)) >= 0
        })
      }
      this.currentLabel = labelId
    },
    // 计算选中的好友
    computedFriends() {
      let cfs = [].concat(this.friendsChecked)
      for (const key in this.friendsCheckedByLabel) {
        if (Object.hasOwnProperty.call(this.friendsCheckedByLabel, key)) {
          cfs = cfs.concat(this.friendsCheckedByLabel[key])
        }
      }
      this.finalFriends = uniqueArryList(cfs, 'FriendId')
    },
    // 选中标签
    choseFriendsByLabel(e, labelId) {
      if (labelId === 'allFriends') {
        if (this.friendsChecked.length === this.friends.length) {
          // 全不选
          this.friendsChecked = []
          // 重置每个label的选中的微信
          for (const key in this.friendsCheckedByLabel) {
            if (Object.hasOwnProperty.call(this.friendsCheckedByLabel, key)) {
              this.friendsCheckedByLabel[key] = []
            }
          }
        } else {
          // 全选
          this.friends.forEach((x) => {
            if (this.friendsChecked.indexOf(x.FriendId) < 0) {
              this.friendsChecked.push(x.FriendId)
            }
          })
          // 全选每个label的好友
          for (const key in this.friendsOfEveryLabel) {
            if (Object.hasOwnProperty.call(this.friendsOfEveryLabel, key)) {
              const element = this.friendsOfEveryLabel[key]
              this.friendsCheckedByLabel[key] = element.map((x) => {
                return x.FriendId
              })
            }
          }
        }
      } else {
        if (this.friendsOfEveryLabel[labelId].length === 0) {
          e.preventDefault()
          return
        }
        const currentFriends = this.friendsOfEveryLabel[labelId]
        const currentChoseFriends = this.friendsCheckedByLabel[labelId]
        if (currentFriends.length === currentChoseFriends.length) {
          this.friendsCheckedByLabel[labelId] = []
        } else {
          currentFriends.forEach((x) => {
            if (currentChoseFriends.indexOf(x.FriendId) < 0) {
              currentChoseFriends.push(x.FriendId)
            }
          })
        }
      }
      this.computedFriends()
    },
    // table中的单选
    choseFriend(e, friend) {
      const friendId = friend.FriendId
      const labelId = this.currentLabel
      if (this.currentLabel === 'allFriends') {
        const fid = this.friendsChecked.indexOf(friendId)
        if (fid >= 0) {
          // 移除
          this.friendsChecked.splice(fid, 1)
        } else {
          // 添加
          this.friendsChecked.push(friendId)
        }
      } else {
        const fid = this.friendsCheckedByLabel[labelId].indexOf(friendId)
        if (fid >= 0) {
          // 移除
          this.friendsCheckedByLabel[labelId].splice(fid, 1)
        } else {
          // 添加
          this.friendsCheckedByLabel[labelId].push(friendId)
        }
        // 重新渲染组件
        this.$forceUpdate()
      }
      this.computedFriends()
    }
  }
}
</script>

<style lang="scss" scoped>
</style>

