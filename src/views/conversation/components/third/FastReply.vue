<template>
  <div class="fast-reply scroll">
    <!-- 快捷语 -->
    <div v-for="(cps, index) in groups" :key="index" class="common-groups">
      <!-- 分组 -->
      <div class="common-groups-tname">
        <p style="width: 200px" class="ellipsis" v-text="index"></p>
        <div class="reply-btns">
          <i
            class="fa fa-chevron-circle-down"
            title="显示/收起"
            aria-hidden="true"
            @click="toggleCommonList(index)"
          ></i>
          <i class="fa fa-sun-o" title="发送" aria-hidden="true" @click.stop="sendReplys(cps)"></i>
        </div>
      </div>
      <!-- 组内消息 -->
      <div v-show="showGroups.indexOf(index) === -1">
        <div
          v-for="(cp, index2) in cps"
          :key="index2"
          class="every-reply"
          @click="sendMsg(cp)"
          @mouseenter="showCp($event, cp)"
          @mouseleave="hideCp"
        >
          <div class="cp-name">
            <span class="cpname ellipsis" v-text="cp.name"></span>
            <div class="show-cp">
              <i class="fa fa-paper-plane-o" title="发送" aria-hidden="true" @click.stop="sendReply(cp)"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览 -->
    <div v-show="currentReply" id="replyDetail">
      <p v-if="currentReply && currentReply.ctype === 1" v-text="currentReply.content"></p>
      <img v-else-if="currentReply && currentReply.ctype === 2" :src="currentReply.content" alt="图片" />
      <video v-else-if="currentReply && currentReply.ctype === 3" :src="currentReply.content" controls></video>
      <audio v-else-if="currentReply && currentReply.ctype === 4" :src="currentReply.content" controls></audio>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getCommonTerms, wordGroupGet, wordGet } from '@/api/httpApi'
import { TalkToFriendTask } from '@/api/webSocketApi'

export default {
  name: 'FastReply',
  data() {
    return {
      currentReply: null, // 显示某个reply
      showGroups: [] // 要显示的分组
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'currentUser',
      publicReply: 'conversation/publicReply',
      currentWeChatId: 'conversation/currentWeChatId',
      currentFriendId: 'conversation/currentFriendId'
    }),
    // reply分组
    groups() {
      const currentGroups = {}
      for (const cr of this.publicReply) {
        if (currentGroups[cr.tname]) {
          currentGroups[cr.tname].push(cr)
        } else {
          const crs = []
          crs.push(cr)
          currentGroups[cr.tname] = crs
        }
      }
      return currentGroups
    }
  },
  mounted() {
    // 如果vuex没有publicReply 就从服务器拉取
    if (this.publicReply.length === 0) {
      this.queryReply()
    }
  },
  methods: {
    // 查询公共术语
    queryReply() {
      getCommonTerms(this.currentUser.UnionId)
        .then((res) => {
          if (res.code === 0) {
            this.$store.commit('conversation/SET_PUBLIC_REPLY', res.data)
          }
        })
        .catch((err) => {
          this.$message.error(err.message)
        })
    },
    // 隐藏/显示分组
    toggleCommonList(index) {
      const id = this.showGroups.indexOf(index)
      if (id === -1) {
        this.showGroups.push(index)
      } else {
        this.showGroups.splice(id, 1)
      }
    },
    sendReply(item) {
      // console.log(Object.prototype.toString.call(item))
      const { content, ctype } = item
      if (this.currentWeChatId && this.currentFriendId) {
        TalkToFriendTask(this.currentWeChatId, this.currentFriendId, ctype, content)
      }
    },
    // 发送多个信息
    sendReplys(items) {
      for (const item of items) {
        this.sendReply(item)
      }
    },
    // 预览消息内容
    showCp(e, cp) {
      // console.log(e)
      if (cp.ctype === 5) return
      this.currentReply = cp
      document.getElementById('replyDetail').style.top = e.pageY - 64 - e.offsetY + 'px'
    },
    // 隐藏预览
    hideCp() {
      this.currentReply = null
    },
    // 发送常用消息
    sendMsg(msg) {
      let type = 'Text'
      switch (msg.ctype) {
        case 1:
          type = 'Text'
          break
        case 2:
          type = 'Picture'
          break
        case 3:
          type = 'Video'
          break
        case 4:
          type = 'Voice'
          break
        case 5:
          type = 'File'
          break
        default:
          type = 'Text'
          break
      }
      let content = msg.content
      if (type === 'File') {
        const fileName = msg.name + msg.content.replace(/.*\./, '.')
        content = JSON.stringify({ name: fileName, url: msg.content, size: '', Source: '公共术语' })
      }
      this.$store.commit('conversation/SET_CONTENT_TYPE', type)
      this.$store.commit('conversation/SET_CONTENT', content)
    },

    getWordGroup() {
      wordGroupGet().then((res) => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.fast-reply {
  flex: 1 1 auto;
  padding: 5px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .common-groups {
    margin-bottom: 5px;

    .common-groups-tname {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f5f5f5;
      padding: 10px 5px;
      color: black;
      font-size: 16px;
      font-weight: 600;

      .reply-btns {
        .fa + .fa {
          cursor: pointer;
          margin-left: 10px;
        }
      }
    }
    .every-reply {
      width: 90%;
      padding: 10px 0;
      cursor: pointer;

      .cp-name {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .cpname {
          margin-left: 5px;
          font-size: 14px;
          width: 70%;
          color: #333333;
        }
        .show-cp {
          font-size: 14px;
          cursor: pointer;
          width: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
      }
    }
  }
  #replyDetail {
    width: 200px;
    min-height: 40px;
    padding: 10px;
    color: #f5f5f5;
    background: #000000;
    position: absolute;
    top: 0;
    right: 295px;
    z-index: 11111 !important;
  }
}
</style>

