<template>
  <div class="friend-info scroll">
    <!-- 微信号 -->
    <div class="friend-info-item">
      <div class="friend-item-title">微信号</div>
      <div class="friend-item-content">{{ currentFriend.FriendNo || currentFriend.FriendId || '--' }}</div>
    </div>
    <!-- 昵称 -->
    <div class="friend-info-item">
      <div class="friend-item-title">昵称</div>
      <div class="friend-item-content">
        {{ currentFriend.FriendNick || '' }}
      </div>
    </div>
    <!-- 备注 -->
    <div class="friend-info-item">
      <div class="friend-item-title">
        <span class="tip">备注</span>
        <div class="btns">
          <el-button type="primary" plain icon="el-icon-edit-outline" circle @click="modifyMemo"></el-button>
          <el-button type="danger" plain icon="el-icon-delete" circle @click="deleteMemo"></el-button>
        </div>
      </div>
      <div class="friend-item-content">{{ currentFriend.Memo || '' }}</div>
    </div>
    <!-- 标签 -->
    <div class="friend-info-item">
      <div class="friend-item-title">
        <span class="tip">标签</span>
        <div class="btns">
          <el-button type="primary" plain icon="el-icon-plus" circle @click="addNewLabel"></el-button>
          <el-button type="primary" plain icon="el-icon-price-tag" circle @click="showLabelDialog"></el-button>
        </div>
      </div>
      <div class="friend-item-content">
        <el-tag v-for="(label, index) in currentFriend.LabelIds" :key="index" closable type @close="removeLabel(label)">
          <span v-text="labelIdMap[label] || label"></span>
        </el-tag>
      </div>
    </div>
    <!-- 电话 -->
    <div class="friend-info-item">
      <div class="friend-item-title">
        <span class="tip">电话</span>
        <div class="btns">
          <el-button type="primary" plain icon="el-icon-plus" circle @click="addPhone"></el-button>
          <el-button
            type="danger"
            plain
            icon="el-icon-delete"
            circle
            title="清空号码"
            @click="deleteAllPhone"
          ></el-button>
        </div>
      </div>
      <div class="friend-item-content">
        <div v-for="(phone, index) in phones" :key="index" class="phone-item">
          <span v-text="phone"></span>
          <el-button
            class="delete-one-phone"
            type="primary"
            style="padding: 2px"
            plain
            icon="el-icon-close"
            circle
            @click="deleteOnePhone(index)"
          ></el-button>
        </div>
      </div>
    </div>
    <!-- 描述 -->
    <div class="friend-info-item">
      <div class="friend-item-title">
        <span class="tip">描述</span>
        <div class="btns">
          <el-button type="primary" plain icon="el-icon-edit-outline" circle @click="modifyDesc"></el-button>
          <el-button type="danger" plain icon="el-icon-delete" circle @click="deleteDesc"></el-button>
        </div>
      </div>
      <div class="friend-item-content">{{ currentFriend.Desc || '--' }}</div>
    </div>
    <!-- 来源 -->
    <div class="friend-info-item">
      <div class="friend-item-title">
        <span class="tip">来源</span>
      </div>
      <div class="friend-item-content">
        <div v-if="currentFriend.Source" v-text="$options.filters.getFriendSource(currentFriend.Source)"></div>
      </div>
    </div>
    <div class="friend-info-item">
      <div class="friend-item-title">
        <span class="tip">来源扩展信息</span>
      </div>
      <div class="friend-item-content">
        <div v-text="currentFriend.SourceExt || '--'"></div>
      </div>
    </div>

    <!-- 添加标签 -->
    <el-dialog
      title="添加标签"
      class="label-remark-add-label"
      append-to-body
      :visible.sync="labelDialogVisible"
      :before-close="handleClose"
    >
      <p class="p-class">手机标签</p>
      <ul>
        <li
          v-for="(label, index) in labels"
          :key="'label' + index"
          class="label-class"
          :class="{ chose: currentTag === label.LabelName }"
          @click="
            () => {
              ;(currentTag = label.LabelName), (tagKey = label.LabelId)
            }
          "
        >
          {{ label.LabelName }}
        </li>
      </ul>
      <p class="p-class">公共标签</p>
      <ul>
        <li
          v-for="(tag, index) in publicTags"
          :key="'tag' + index"
          class="label-class"
          :class="{ chose: currentTag === tag.name }"
          @click="currentTag = tag.name"
        >
          {{ tag.name }}
        </li>
      </ul>
      <span slot="footer">
        <el-button size="small" @click="labelDialogVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="modifyLabels">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getCommonTags } from '@/api/httpApi'

export default {
  name: 'FriendInfo',
  data() {
    return {
      publicTags: [], // 服务端的公共标签
      labelDialogVisible: false, // 添加标签dialog
      currentTag: '', // 标签名
      tagKey: 0 // 标签id
    }
  },
  computed: {
    ...mapState('nedb', {
      labels: 'labels' // 当前微信的所有标签
    }),
    ...mapGetters({
      currentUser: 'currentUser', // 当前用户
      labelIdMap: 'nedb/labelIdMap', // 标签map
      labelNameMap: 'nedb/labelNameMap', // 标签map
      currentFriend: 'conversation/currentFriend' // 当前用户的公共标签
    }),
    phones() {
      if (this.currentFriend.Phone) {
        const phonesArry = this.currentFriend.Phone.replace(/，$/, '')
        return phonesArry.split('，')
      }
      return []
    }
  },
  mounted() {
    console.log(currentFriend)
    // 拉取公共标签
    // getCommonTags(this.currentUser.UnionId)
    //   .then((res) => {
    //     if (res.code === 0) {
    //       this.publicTags = res.data || []
    //     }
    //   })
    //   .catch((err) => {
    //     this.$message.error(err.message)
    //   })
  },
  methods: {
    // 修改备注
    modifyMemo() {
      if (!this.currentFriend.FriendId) {
        this.$message.warning('请先选择一个好友！')
        return
      }
      if (this.currentFriend.isGh) {
        this.$message.warning('不能修改公众号的备注！')
        return
      }
      this.$prompt(`修改<b style="color:green;"> ${this.currentFriend.FriendNick} </b>的备注`, '修改备注', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: this.currentFriend.Memo,
        inputValue: this.currentFriend.Memo,
        dangerouslyUseHTMLString: true,
        inputPattern: /\S{1,50}/,
        inputErrorMessage: '备注长度1-50，不能含有特殊字符！'
      })
        .then(({ value }) => {
          const message = {
            WeChatId: this.currentFriend.WeChatId,
            FriendId: this.currentFriend.FriendId,
            Memo: value
          }
          this.$store.dispatch('websocket/ModifyFriendMemoTask', message)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消输入'
          })
        })
    },
    // 删除备注
    deleteMemo() {
      if (!this.currentFriend.FriendId) {
        this.$message.warning('请先选择一个好友！')
        return
      }
      if (!this.currentFriend.Memo) {
        this.$message.warning('该好友没有备注，无需删除！')
        return
      }
      this.$confirm('删除备注?', '删除备注', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const message = {
            WeChatId: this.currentFriend.WeChatId,
            FriendId: this.currentFriend.FriendId,
            DelFlag: 1
          }
          this.$store.dispatch('websocket/ModifyFriendMemoTask', message)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 修改描述
    modifyDesc() {
      if (!this.currentFriend.FriendId) {
        this.$message.warning('请先选择一个好友！')
        return
      }
      if (this.currentFriend.isGh) {
        this.$message.warning('不能修改公众号的描述！')
        return
      }
      this.$prompt(`修改<b style="color:green;"> ${this.currentFriend.FriendNick} </b>的描述`, '修改描述', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: this.currentFriend.Desc,
        inputValue: this.currentFriend.Desc,
        dangerouslyUseHTMLString: true,
        inputPattern: /\S{1,200}/,
        inputErrorMessage: '备注长度1-200，不能含有特殊字符！'
      })
        .then(({ value }) => {
          const message = {
            WeChatId: this.currentFriend.WeChatId,
            FriendId: this.currentFriend.FriendId,
            Desc: value
          }
          this.$store.dispatch('websocket/ModifyFriendMemoTask', message)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消输入'
          })
        })
    },
    // 删除描述
    deleteDesc() {
      if (!this.currentFriend.FriendId) {
        this.$message.warning('请先选择一个好友！')
        return
      }
      if (!this.currentFriend.Desc) {
        this.$message.warning('该好友没有描述，无需删除！')
        return
      }
      this.$confirm('删除描述?', '删除描述', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const message = {
            WeChatId: this.currentFriend.WeChatId,
            FriendId: this.currentFriend.FriendId,
            DelFlag: 2
          }
          this.$store.dispatch('websocket/ModifyFriendMemoTask', message)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 添加电话
    addPhone() {
      if (!this.currentFriend.FriendId) {
        this.$message.warning('请先选择一个好友！')
        return
      }
      if (this.currentFriend.isGh) {
        this.$message.warning('不能修改公众号的电话！')
        return
      }
      //   this.$prompt('固话或者手机号码', '添加电话', {
      this.$prompt(`修改<b style="color:green;"> ${this.currentFriend.FriendNick} </b>的电话号码`, '修改电话号码', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '两个号码之间用逗号隔开',
        inputValue: this.currentFriend.Phone,
        dangerouslyUseHTMLString: true
        // inputPattern: /0\d{2,3}-[1-9]\d{6,7}|1[3-9]\d{9}/,
        // inputErrorMessage: '电话号码格式或长度不对！'
      })
        .then(({ value }) => {
          const preg = new RegExp(/0\d{2,3}-[1-9]\d{6,7}|1[3-9]\d{9}/)
          const phoneArry = value.replace(/,/g, '，').split('，')
          const phoneAccept = phoneArry.filter((p) => {
            return preg.test(p)
          })
          if (phoneAccept.length === 0) {
            this.$message.warning('电话号码的格式有问题，请重新输入！')
          } else {
            // if (this.currentFriend.Phone) {
            //   phone = this.currentFriend.Phone + value
            // }
            const message = {
              WeChatId: this.currentFriend.WeChatId,
              FriendId: this.currentFriend.FriendId,
              Phone: phoneAccept.join(',').replace(/,/g, '，')
            }
            this.$store.dispatch('websocket/ModifyFriendMemoTask', message)
          }
        })
        .catch((err) => {
          this.$message({
            type: 'warning',
            message: err
          })
        })
    },
    // 清空所有电话
    deleteAllPhone() {
      if (!this.currentFriend.FriendId) {
        this.$message.warning('请先选择一个好友！')
        return
      }
      if (!this.currentFriend.Phone) {
        this.$message.warning('该好友没有电话，无需清空！')
        return
      }
      this.$confirm('清空电话?', '清空电话', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const message = {
            WeChatId: this.currentFriend.WeChatId,
            FriendId: this.currentFriend.FriendId,
            DelFlag: 4
          }
          this.$store.dispatch('websocket/ModifyFriendMemoTask', message)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 删除选择的电话
    deleteOnePhone(index) {
      if (!this.currentFriend.FriendId) {
        this.$message.warning('请先选择一个好友！')
        return
      }
      if (!this.currentFriend.Phone) {
        this.$message.warning('该好友没有电话，无需清空！')
        return
      }
      this.$confirm('删除该电话?', '删除该电话', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let phoneStr = ''
          for (const phone of this.phones) {
            if (phone !== this.phones[index]) {
              // phoneStr = phone + ','
              phoneStr = phone + '，'
            }
          }
          phoneStr = phoneStr.replace(/，$/, '')
          const message = {
            WeChatId: this.currentFriend.WeChatId,
            FriendId: this.currentFriend.FriendId,
            Phone: phoneStr
          }
          if (phoneStr !== '') {
            this.$store.dispatch('websocket/ModifyFriendMemoTask', message)
          } else {
            const delMessage = {
              WeChatId: this.currentFriend.WeChatId,
              FriendId: this.currentFriend.FriendId,
              DelFlag: 4
            }
            this.$store.dispatch('websocket/ModifyFriendMemoTask', delMessage)
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 新建一个标签并给好友打上
    addNewLabel() {
      // if (!this.currentFriend.FriendId) {
      //   this.$message.warning('请先选择一个好友！')
      //   return
      // }
      if (this.currentFriend.isGh) {
        this.$message.warning('不能给公众号打标签！')
        return
      }
      this.$prompt('标签名不能与现有的重复！', '新建标签', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S{1,200}/,
        inputErrorMessage: '标签长度不对'
      })
        .then(({ value }) => {
          const message = {
            WeChatId: this.currentFriend.WeChatId, // string 商家所属微信号
            LabelName: value, // string 标签名 id!=0 会设置为该标签名
            LabelId: 0, // int32 标签id，0则新建标签（如存在同名标签则会失败）
            AddList: this.currentFriend.FriendId // string 新增的wxid，用,分隔
            // DelList: message.DelList || '', //string 删除的wxid，用,分隔
          }
          this.$store.dispatch('websocket/ContactLabelTask', message)
        })
        .catch(() => {
          // this.$message.info('取消输入')
        })
    },
    // 添加标签
    modifyLabels() {
      // 判断标签是否存在
      if (this.tagKey === 0) {
        this.tagKey = this.labelNameMap[this.currentTag] || 0
      }
      // 如果是已经打过的标签 就返回
      if (this.currentTag) {
        if (this.currentFriend.LabelIds) {
          if (this.currentFriend.LabelIds.indexOf(String(this.tagKey)) >= 0) {
            this.$alert('该标签已经打过，不能重复打！', '提示', { type: 'warning' })
            return
          }
        }
      } else {
        this.$message.warning('请选择一个标签！')
        return
      }
      // 可以打标签
      const message = {
        WeChatId: this.currentFriend.WeChatId, // string 商家所属微信号
        AddList: this.currentFriend.FriendId, // string 新增的wxid，用,分隔
        LabelName: this.currentTag, // string 标签名 id!=0 会设置为该标签名
        LabelId: this.tagKey // int32 标签id，0则新建标签（如存在同名标签则会失败）
      }
      this.$store.dispatch('websocket/ContactLabelTask', message)
      // 隐藏dialog
      this.labelDialogVisible = false
      // 数据重置
      this.currentTag = ''
      this.tagKey = 0
    },
    // 移除好友的标签
    removeLabel(labelId) {
      if (!this.currentFriend.FriendId) {
        this.$message.warning('请先选择一个好友！')
        return
      }
      this.$confirm('移除该标签?', '移除标签', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const message = {
            WeChatId: this.currentFriend.WeChatId, // string 商家所属微信号
            // LabelName: value, //string 标签名 id!=0 会设置为该标签名
            LabelId: labelId, // int32 标签id，0则新建标签（如存在同名标签则会失败）
            // AddList: this.currentFriend.FriendId, //string 新增的wxid，用,分隔
            DelList: this.currentFriend.FriendId // string 删除的wxid，用,分隔
          }
          this.$store.dispatch('websocket/ContactLabelTask', message)
        })
        .catch(() => {
          // this.$message.info('已取消删除');
        })
    },
    // 显示dialog
    showLabelDialog() {
      if (!this.currentFriend.FriendId) {
        this.$message.warning('请先选择一个好友！')
        return
      }
      if (this.currentFriend.isGh) {
        this.$message.warning('不能给公众号打标签！')
        return
      }
      this.labelDialogVisible = true
    },
    // 处理关闭
    handleClose(done) {
      this.currentTag = ''
      this.tagKey = 0
      done()
    }
  }
}
</script>

<style lang="scss" scoped>
.friend-info {
  flex: 1 1 auto;
  padding: 5px;
  overflow: auto;
  display: flex;
  flex-direction: column;

  .friend-info-item {
    width: 100%;
    margin-bottom: 5px;

    .friend-item-title {
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

    .friend-item-content {
      min-height: 30px;
      padding: 5px;
      .phone-item {
        padding: 5px 0;
        .delete-one-phone {
          margin-left: 20px;
        }
      }
      .el-tag {
        margin: 2px;
      }
    }
  }
}
</style>

