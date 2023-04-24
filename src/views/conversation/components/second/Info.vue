<template>
  <div class="friend-info">
    <div class="friend-info-head">
      <div class="friend-info-head-left">
        <div class="friend-info-head-title">{{ currentFriend.FriendNick }}</div>
        <div class="friend-info-head-signature">--</div>
      </div>
      <div class="friend-info-head-right">
        <el-avatar shape="square" :size="98" :src="currentFriend.Avatar"></el-avatar>
      </div>
    </div>
    <div class="friend-info-item">
      <span class="friend-info-item-left">备注名</span>
      <span class="friend-info-item-right">--</span>
    </div>
    <div class="friend-info-item">
      <span class="friend-info-item-left">地区</span>
      <span class="friend-info-item-right">{{ currentFriend.Province }}</span>
    </div>
    <div class="friend-info-item">
      <span class="friend-info-item-left">微信号</span>
      <span class="friend-info-item-right">{{ currentFriend.FriendId }}</span>
    </div>
    <div class="friend-info-item">
      <span class="friend-info-item-left">来源</span>
      <span class="friend-info-item-right">--</span>
    </div>
    <div class="friend-info-item">
      <span class="friend-info-item-left">朋友权限</span>
      <span class="friend-info-item-right"></span>
    </div>
    <div class="friend-info-item" style="margin-top: 60px" v-if="[3, 4].includes(currentFriend.FriendType)">
      <span class="friend-info-item-left">打招呼</span>
      <span class="friend-info-item-right">{{ currentFriend.RequestContent }}</span>
    </div>
    <div class="friend-info-item" style="margin-top: 60px" v-if="[3, 4].includes(currentFriend.FriendType)">
      <span class="friend-info-item-left">朋友圈</span>
      <span class="friend-info-item-right">
        <el-avatar
          style="margin-right: 4px"
          v-for="(item, i) in circle.images"
          :key="i"
          shape="square"
          :size="45"
          :src="item"
        ></el-avatar>
      </span>
    </div>
    <div class="friend-info-action">
      <el-button class="friend-info-action-success" v-if="currentFriend.FriendType === 1" @click="pass(currentFriend)">
        通过验证
      </el-button>
      <el-button
        class="friend-info-action-success"
        v-if="[3, 4].includes(currentFriend.FriendType)"
        @click="sendMessage"
      >
        发送消息
      </el-button>
      <el-button class="friend-info-action-default" v-if="currentFriend.FriendType === 2">等待对方验证</el-button>
    </div>
  </div>
</template>
<script>
import bus from '@/utils/bus'
import { checkPass } from '@/api/httpApi'
export default {
  props: ['currentFriend'],
  data() {
    return {
      circle: {
        images: []
      }
    }
  },
  methods: {
    sendMessage() {
      this.$emit('canChat')
    },
    async pass(currentFriend) {
      const { status, data } = await checkPass(currentFriend.Id)
      this.$emit('canChat')
    }
  },
  mounted() {
    console.log(this.currentFriend)
  }
}
</script>
 <style lang="less" scoped>
.friend-info {
  padding: 72px 110px;
  .friend-info-head {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
    .friend-info-head-left {
      margin-right: 45px;
      .friend-info-head-title {
        font-size: 24px;
        color: #333333;
        margin-bottom: 8px;
      }
      .friend-info-head-signature {
        width: 196px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
    }
  }
  .friend-info-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    font-size: 16px;
    .friend-info-item-left {
      display: inline-block;
      width: 80px;
      color: #333333;
    }
    .friend-info-item-right {
      width: 360px;
      color: #666666;
    }
  }
  .friend-info-action {
    margin-top: 40px;
    .el-button {
      width: 92px;
      height: 30px;
      line-height: 28px;
      padding: 0;
      font-size: 12px;
    }
    .friend-info-action-success {
      background: #0cc160;
      border-color: #0cc160;
      color: #fff;
    }
    .friend-info-action-default {
      background-color: #dedede;
      color: #fff;
      border-color: #fff;
    }
  }
}
</style>