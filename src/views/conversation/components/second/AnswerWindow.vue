<template>
  <div class="anwser-window">
    <!-- 文本域 -->
    <div class="scroll show-content">
      <div
        v-if="contentType === 'Text'"
        id="textarea"
        ref="answerText"
        class="scroll show-content-textarea"
        maxlength="1000"
        autofocus
        contenteditable
        :value="content"
        @input="setContent"
        @keydown.13.exact="enterSend"
        @keyup.ctrl.enter.exact="lineFeed"
        data-tribute="true"
      ></div>
      <img v-else-if="contentType === 'Picture'" class="show-content-img" :src="content" alt="图片丢失" />
      <video v-else-if="contentType === 'Video'" class="show-content-video" :src="content" controls></video>
      <audio
        v-if="contentType === 'Voice' && /.mp3$/.test(content)"
        class="show-content-voice"
        :src="content"
        type="audio/mp3"
        controls
      ></audio>
      <span v-if="contentType === 'Voice' && !/.mp3$/.test(content)" class="show-content-file" v-text="content"></span>
      <span
        v-else-if="contentType === 'File'"
        class="show-content-file"
        v-text="$options.filters.getFileName(content)"
      ></span>
    </div>
    <!-- 发送 -->
    <div class="opration-btn">
      <!-- 提示 -->
      <div class="operate-tip" v-if="!quoteMsg">按ctrl + enter 换行</div>
      <!-- 引用消息 -->
      <div v-else class="quote-msg">
        <div class="quote-content">
          <span v-text="quoteDetail.displayName"></span>
          <span>:</span>
          <span style="width: 200px" class="ellipsis" v-text="quoteDetail.content"></span>
        </div>
        <span class="close-btn" @click="cancelQuote">x</span>
      </div>

      <div class="right-btns">
        <el-button
          style="background-color: #fff; border: solid #fff 1px; color: black"
          size="small"
          @click="clearContent"
        >
          清空
        </el-button>
        <el-button
          style="background-color: #0cc160; border: solid #0cc160 1px"
          type="primary"
          size="small"
          @click="talkToFriendTask"
        >
          发送(Enter)
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { TalkToFriendTask } from '@/api/webSocketApi'
import Bus from '@/utils/bus'
import Tribute from 'tributejs'
export default {
  components: {},
  data() {
    return {
      tribute: null
    }
  },
  computed: {
    ...mapState('conversation', {
      quoteMsg: 'quoteMsg',
      quoteDetail: 'quoteDetail'
    }),
    ...mapState({
      currentUser: 'currentUser'
    }),
    ...mapGetters({
      remark: 'conversation/remark',
      atContent: 'conversation/content',
      content: 'conversation/content',
      contentType: 'conversation/contentType',
      currentWechat: 'conversation/currentWechat',
      currentFriend: 'conversation/currentFriend',
      currentWeChatId: 'conversation/currentWeChatId',
      currentFriendId: 'conversation/currentFriendId'
    })
  },
  watch: {
    'currentFriend.ShowNameList'(data) {
      if (data && data.length) {
        this.initTribute(data)
      } else {
        if (this.tribute) this.tribute.detach(document.getElementById('textarea'))
      }
    },
    currentFriendId(id) {}
  },

  created() {
    // 节流 几秒只执行一次
    this.talkToFriendTask = this._.throttle(this.talkToFriendTask, 500)
  },
  mounted() {
    this.textareaInit()
  },
  methods: {
    textareaInit() {},
    initTribute(data) {
      const _this = this
      const dom = document.getElementById('textarea')
      const br = document.createElement('br')
      if (this.tribute) this.tribute.detach(dom)
      this.tribute = new Tribute({
        values: data.map((item) => ({
          ...item,
          key: item.FriendNick,
          value: item.FriendNick
        })),
        requireLeadingSpace: false,
        replaceTextSuffix: '',
        noMatchTemplate: function () {
          return '<span style:"visibility: hidden;"></span>'
        },
        menuItemTemplate: function (item) {
          return '<img src="' + item.original.FriendAvatar + '">' + item.string
        },
        selectTemplate: function (item) {
          const textarea = document.querySelector('#textarea')
          const atContainer = document.createElement('span')
          const at = document.createElement('span')
          const spanLeft = document.createElement('span')
          const spanRight = document.createElement('span')

          spanLeft.className = 'text-left'
          spanRight.className = 'text-right'

          at.className = 'at'
          at.innerHTML = '@' + item.original.FriendNick + '&nbsp'
          atContainer.className = 'at-container'
          at.setAttribute('contenteditable', 'false')

          atContainer.appendChild(at)

          atContainer.setAttribute('contenteditable', 'false')
          at.onmouseenter = () => {
            at.className += ' at-active'
          }
          at.onmouseleave = (e) => {
            at.className = 'at'
          }

          at.onclick = (e) => {
            const node = e.target.parentNode.nextSibling
            //console.log('at', node)
            let selection = window.getSelection()
            let range = selection.getRangeAt(0)
            range.selectNode(node)
            selection.collapseToStart()
          }

          _this.$nextTick(() => {
            let selection = window.getSelection()
            let range = selection.getRangeAt(0)
            console.log('at', selection, range)
            range.insertNode(spanRight)
            range.insertNode(atContainer)
            range.insertNode(spanLeft)
            selection.collapse(spanRight)
          })

          if (_this.remark) {
            if (!_this.remark.includes(item.original.UserName)) {
              _this.$store.commit('conversation/SET_REMARK', _this.remark + ',' + item.original.UserName)
            }
          } else {
            _this.$store.commit('conversation/SET_REMARK', item.original.UserName)
          }

          return ''
        }
      })

      this.tribute.attach(dom)
    },
    // 发送消息
    talkToFriendTask() {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      //console.log(this.currentUser)
      // 未选择微信不能发送
      if (!this.currentWeChatId) {
        this.$message.warning('请先选中微信！')
        return
      }
      // // 如果手机下线或者未登录 不能发消息
      // if (!this.currentWechat.IsOnline) {
      //   this.$message.warning(`${this.currentWechat.WeChatNick} 不在线或者未登录，不能给其发消息！`)
      //   return
      // }
      // 未选择好友不能发送
      if (JSON.stringify(this.currentFriend) === '{}') {
        this.$message.warning('请先选择一个好友！')
        return
      }
      // 不能发送空的信息
      const cc = this.content.replace(/\s/gi, '')
      if (!cc) {
        this.$message.warning('请设置发送内容！')
        return
      }
      // 如果是发送到群里 并且被踢出群了 则不能发消息
      if (this.currentFriendId.indexOf('@chatroom') > 0 || this.currentFriendId.indexOf('@im.chatroom') > 0) {
        if (this.currentFriend.MemberList && this.currentFriend.MemberList.indexOf(this.currentWeChatId) < 0) {
          this.$message({
            type: 'warning',
            message: '你已被踢出群聊,不能在该群发送消息!',
            duration: 1000
          })
          return
        }
      }

      // 引用消息的优先级大于@消息
      if (this.quoteMsg) {
        // 只能发送文字
        if (this.contentType === 'Text') {
          TalkToFriendTask(
            this.currentWeChatId,
            this.currentFriendId,
            'QuoteMsg',
            this.content,
            this.currentUser.NickName,
            loginInfo.name,
            this.currentFriend.PrivateMsgEnable ? this.currentFriend.PrivateMsgId : undefined,
            this.quoteMsg
          )
          // 重置数据
          this.clearContent()
          this.cancelQuote()
        } else {
          this.$alert('引用消息只能是文本消息', '提示', { type: 'warning' })
        }
      } else {
        console.log('TalkToFriendTask', this.currentFriend)
        TalkToFriendTask(
          this.currentWeChatId,
          this.currentFriendId,
          this.contentType,
          this.content,
          this.currentUser.NickName,
          loginInfo.name,
          this.currentFriend.PrivateMsgEnable ? this.currentFriend.PrivateMsgId : undefined,
          this.remark
        )
        this.clearContent()
      }

      Bus.$emit('messageSendSuccess')
    },
    // ctrl + enter换行
    lineFeed(e) {
      //console.log('lineFeed', e)
      const textarea = document.querySelector('#textarea')
      const newContent = this.content + '\r\n'
      const br = document.createElement('br')

      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      const innerHTML = textarea.innerHTML
      if (!innerHTML.endsWith('<br>')) {
        const br = document.createElement('br')
        textarea.appendChild(br)
      }

      //console.log('lineFeed', selection, range)
      range.insertNode(br)
      selection.collapseToEnd()
    },
    // enter发送消息
    enterSend(e) {
      e.preventDefault()
      this.talkToFriendTask()
    },
    //输入框清除操作
    textareaClearAction(content) {
      const ids = this.remark ? this.remark.split(',') : []
      const friends = this.currentFriend.ShowNameList || []
      if (!ids.length) return
      //console.log(ids, content)
      ids.forEach((id, idIndex) => {
        const friend = friends.find((friend) => friend.UserName === id)
        if (friend && !content.includes(`@${friend.FriendNick}`)) {
          ids.splice(idIndex, 1)
        }
      })

      this.$store.commit('conversation/SET_REMARK', ids.join(','))
    },
    setContent(e) {
      //console.log('setContent',e);
      const textarea = document.querySelector('#textarea')

      this.$nextTick(() => {
        //const newText = this.$refs.answerText.value
        const newText = textarea.innerText

        this.$store.commit('conversation/SET_CONTENT', newText)
        this.textareaClearAction(newText)
      })
    },
    at(item) {},
    // 清空message
    clearContent() {
      const container = document.querySelector('.show-content')
      const textarea = document.querySelector('#textarea')
      if (textarea) {
        textarea.innerHTML = ''
      }

      this.$store.commit('conversation/SET_CONTENT', '')
      this.$store.commit('conversation/SET_CONTENT_TYPE', 'Text')
      this.$store.commit('conversation/SET_REMARK', '')
    },
    // 取消引用消息
    cancelQuote() {
      this.$store.commit('conversation/SET_QUOTE_MSG', '')
      this.$store.commit('conversation/SET_QUOTE_DETAIL', {})
    }
  }
}
</script>

<style lang="scss" scoped>
.anwser-window {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  //background: #f3f3f3;

  :deep(.show-content) {
    position: relative;
    flex: 1 1 auto;
    overflow-x: hidden;
    overflow-y: scroll;
    display: flex;
    border-radius: 5px;
    background-color: #f9f9f9;
    .show-content-textarea {
      flex: auto;
      resize: none;
      line-height: 20px;
      font-size: 16px;
      padding: 5px;
      border: none;
      margin: 2px;
      background-color: #f9f9f9;
      word-break: break-all;
      overflow-y: scroll;
      &:focus {
        outline: none !important;
      }
    }
    .show-content-video {
      max-height: 100%;
      margin: 2px auto 0px;
    }
    .show-content-img {
      object-fit: scale-down;
      margin: 0 auto;
      margin-top: 2px;
    }
    .show-content-voice {
      margin: auto;
    }
    .show-content-file {
      padding: 0 10px;
      width: 100%;
      max-width: 100%;
      line-height: 20px;
      text-align: center;
      align-self: center;
      word-break: break-all;
      //   white-space: pre-wrap;
    }
    .at-container {
      display: inline-block;
      //user-select: none;

      .at {
        border: 1px solid transparent;
        cursor: pointer;
      }

      .at-active {
        border: 1px solid;
      }
    }
  }

  .opration-btn {
    height: 50px;
    min-height: 50px;
    align-self: flex-end;
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
    padding: 0 5px;
    color: #999;
    background-color: #f8f8f8;
    border-top: 1px solid #ededed;
    .quote-msg {
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      margin-left: 2px;
      margin-right: 20px;
      overflow: hidden;

      .quote-content {
        background: #f2f2f2;
        display: flex;
        padding: 5px;
        overflow: hidden;
      }
      .close-btn {
        cursor: pointer;
        display: inline-block;
        margin-left: 10px;
        height: 20px;
        width: 20px;
        min-width: 20px;
        border-radius: 10px;
        text-align: center;
        line-height: 16px;
        font-size: 16px;
        background: #cfcfcf;
        color: #fff;
      }
    }
    .right-btns {
      display: flex;
      .el-button {
        width: 100px;
        margin: 5px;
        &:nth-child(1) {
          &:hover {
            filter: opacity(50%);
          }
        }
        &:nth-child(2) {
          &:hover {
            filter: opacity(50%);
          }
        }
      }
    }
  }

  @media screen and (max-width: 1200px) {
    .operate-tip {
      opacity: 0;
    }
  }
}
</style>

