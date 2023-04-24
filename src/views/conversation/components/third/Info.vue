<template>
  <div v-if="currentFriendId" class="info scroll">
    <div class="info-til">对话来源</div>
    <div class="info-item">
      <span class="info-item-left">设备：</span>
      <span class="info-item-right">{{ currentWechat.WeChatNick }}</span>
    </div>
    <div class="info-til" style="margin-top: 20px">客户信息</div>
    <div class="info-item">
      <span class="info-item-left">客户昵称：</span>
      <span class="info-item-right">{{ currentFriend.FriendNick || currentFriend.ShowName }}</span>
    </div>
    <div class="info-item" v-if="currentFriend.FriendType === 4">
      <span class="info-item-left">姓名：</span>
      <span class="info-item-right">
        <el-input v-model="userInfo.FullName" @blur="updateInfo('FullName')"></el-input>
        <i class="el-icon-edit-outline"></i>
      </span>
    </div>
    <div class="info-item" v-if="currentFriend.FriendType === 3">
      <span class="info-item-left">实名：</span>
      <span class="info-item-right">{{ currentFriend.ShowName }}</span>
    </div>
    <div class="info-item">
      <span class="info-item-left">备注名：</span>
      <span class="info-item-right">
        <el-input v-model="userInfo.Memo" @blur="updateInfo('Memo')"></el-input>
        <i class="el-icon-edit-outline"></i>
      </span>
    </div>
    <div class="info-item" v-if="currentFriend.FriendType === 4">
      <span class="info-item-left">微信：</span>
      <span class="info-item-right">{{ currentFriend.FriendId }}</span>
    </div>
    <div class="info-item" v-if="currentFriend.FriendType === 4">
      <span class="info-item-left">电话：</span>
      <span class="info-item-right">
        <el-input v-model="userInfo.Phones" @blur="updateInfo('Phones')"></el-input>
        <i class="el-icon-edit-outline"></i>
      </span>
    </div>
    <div class="info-item">
      <span class="info-item-left">性别：</span>
      <span class="info-item-right">{{ currentFriend.Gender ? '男' : '女' }}</span>
    </div>
    <div class="info-item" v-if="currentFriend.FriendType === 4">
      <span class="info-item-left">地区：</span>
      <span class="info-item-right">{{ currentFriend.Province }}</span>
    </div>
    <div class="info-item" v-if="currentFriend.FriendType === 3">
      <span class="info-item-left">企业：</span>
      <span class="info-item-right">{{ currentFriend.CorpName }}</span>
    </div>
    <div class="info-item" v-if="currentFriend.FriendType === 4">
      <span class="info-item-left">公司：</span>
      <span class="info-item-right">
        <el-input v-model="userInfo.CorpName" @blur="updateInfo('CorpName')"></el-input>
        <i class="el-icon-edit-outline"></i>
      </span>
    </div>
    <div class="info-item" v-if="currentFriend.FriendType === 3">
      <span class="info-item-left">工作时间：</span>
      <span class="info-item-right">{{ currentFriend.JobTime }}</span>
    </div>
    <div class="info-item">
      <span class="info-item-left">添加时间：</span>
      <span class="info-item-right">{{ Day(currentFriend.UpdateTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
    </div>
    <div class="info-til" v-if="userInfo.BindStatus">客户资料</div>
    <div v-if="userInfo.BindStatus === 2">
      <div class="info-item" v-for="(item, i) in BindParams" :key="i">
        <span class="info-item-left">{{ item.bindName }}：</span>
        <span class="info-item-right">
          <el-input v-model="item.value"></el-input>
          <i class="el-icon-edit-outline"></i>
        </span>
      </div>

      <div class="info-item">
        <span class="info-item-left"></span>
        <el-button @click="bind">绑定</el-button>
      </div>
    </div>
    <div class="info-item" v-if="userInfo.BindStatus === 1">
      <div class="info-item-body">
        <div class="info-item-body-item" v-for="(item, i) in BindInfo" :key="i">
          <div class="info-item-body-left">{{ item.label }}：</div>
          <div class="info-item-body-right">
            {{ item.value }}
          </div>
        </div>
      </div>
    </div>
    <div class="info-foot" v-if="userInfo.BindStatus === 1"><el-button @click="unbind">解除绑定</el-button></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { userInfoBindApi } from '@/api/httpApi'
import Day from 'dayjs'
import chineseCities from '@/utils/city'
export default {
  data() {
    return {
      userInfo: {},
      BindParams: [],
      BindInfo: []
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'currentUser',
      currentWeChatId: 'conversation/currentWeChatId',
      currentFriendId: 'conversation/currentFriendId',
      currentFriend: 'conversation/currentFriend',
      currentWechat: 'conversation/currentWechat'
    })
  },
  watch: {
    currentFriend: {
      handler(currentFriend) {
        console.log('watch currentFriend', currentFriend)
        this.userInfo = { ...currentFriend }
        this.BindParams = currentFriend.BindParams || []

        if (currentFriend.BindInfo && currentFriend.BindInfo.code === 0) {
          this.BindInfo =
            currentFriend.BindInfo.data && currentFriend.BindInfo.data.param_info
              ? currentFriend.BindInfo.data.param_info
              : []
        }
      },
      immediate: true
    }
  },
  mounted() {
    //console.log(this.currentFriend)
  },
  methods: {
    Day,
    updateInfo(field) {
      const message = {
        WeChatId: this.currentFriend.WeChatId,
        FriendId: this.currentFriend.FriendId,
        [field]: this.userInfo[field]
      }

      this.$store.dispatch('websocket/ModifyFriendMemoTask', message)
    },
    async bind() {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      const { data, code } = await userInfoBindApi({
        account: loginInfo.name,
        wechatId: this.currentFriend.WeChatId,
        wxId: this.currentFriend.FriendId,
        bind: 1,
        params: this.BindParams.map((item) => ({
          bindParam: item.bindParam,
          bindValue: item.value
        }))
      })
      if (code === 0) {
        this.$message.success('处理成功')
        this.userInfo.BindStatus = data.BindStatus
        this.BindInfo = data.BindInfo.data && data.BindInfo.data.param_info ? data.BindInfo.data.param_info : []
      }
    },
    async unbind() {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      const { data, code } = await userInfoBindApi({
        account: loginInfo.name,
        wechatId: this.currentFriend.WeChatId,
        wxId: this.currentFriend.FriendId,
        bind: 0
      })
      if (code === 0) {
        this.$message.success('处理成功')
        this.userInfo.BindStatus = data.BindStatus
        this.BindParams = data.BindParams || []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.info {
  height: 100%;
  padding: 15px 5px 20px 15px;
  overflow-y: scroll;
  .info-til {
    font-size: 14px;
    color: #333333;
    margin-bottom: 8px;
  }
  .info-item {
    display: flex;
    align-items: center;
    font-size: 12px;
    margin-bottom: 10px;
    .info-item-left {
      width: 85px;
      color: #666666;
    }
    .info-item-right {
      position: relative;
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #999999;
      background: #f8f8f8;
      border-radius: 4px;
      border: 1px solid #e6e6e6;
      height: 30px;
      line-height: 30px;
      font-size: 12px;
      color: #333333;
      .el-icon-edit-outline {
        position: absolute;
        right: 8px;
      }
      :deep(.el-input) {
        .el-input__inner {
          border: none;
          padding: 0;
          height: auto;
          line-height: normal;
          background-color: transparent;
          text-align: center;
          font-size: 12px;
          color: #333333;
        }
      }

      &:hover {
        border-color: #0cc160;
      }
    }

    .info-item-body {
      width: 100%;
      background: #f8f8f8;
      border-radius: 4px;
      border: 1px solid #efefef;
      padding: 10px;
      .info-item-body-item {
        display: flex;
        align-items: center;
        font-size: 12px;
        margin-bottom: 10px;
        .info-item-body-left {
          width: 40%;
          color: #666666;
        }
        .info-item-body-right {
          color: #333333;
        }
        &:nth-last-child(1) {
          margin-bottom: 0;
        }
      }
    }
    .el-button {
      width: 90px;
      height: 30px;
      padding: 0;
      font-size: 12px;
      text-align: center;
      background-color: #e9e9e9;
      color: #07c160;
      border: none;
      &:active {
        opacity: 0.8;
      }
    }
  }
  .info-foot {
    display: flex;
    justify-content: flex-end;
    .el-button {
      width: 90px;
      height: 30px;
      padding: 0;
      font-size: 12px;
      text-align: center;
      background-color: #e9e9e9;
      color: #07c160;
      border: none;
      &:active {
        opacity: 0.8;
      }
    }
  }
}
</style>

