<template>
  <div class="word">
    <div class="word-search">
      <el-input
        v-model="searchOptions.val"
        prefix-icon="el-icon-search"
        placeholder="搜索"
        clearable
        @input="wordSearch"
      ></el-input>
    </div>
    <div class="word-head">
      <div class="word-tabs">
        <i class="el-icon-caret-left" :style="{ color: tabs.isLeft ? '#f5f5f5' : '#000' }" @click="tabsMoveLeft"></i>
        <div class="word-tabs-items" @scroll="tabsScroll" @mousemove="tabMouseMove" @mousedown="tabMouseDown">
          <div
            class="word-tabs-item"
            :class="{ 'word-tabs-item-active': i === tabs.currentTab }"
            v-for="(item, i) in groups"
            :key="i"
            @mouseup="tabMouseUp(item, i)"
          >
            {{ item.groupName }}
          </div>
        </div>
        <i class="el-icon-caret-right" :style="{ color: tabs.isRight ? '#f5f5f5' : '#000' }" @click="tabsMoveRight"></i>
      </div>
      <el-tooltip effect="dark" content="新增组" placement="top-start">
        <el-button class="word-head-right" @click="wordGroupAction" icon="el-icon-plus"></el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="删除组" placement="bottom-end">
        <el-button
          :disabled="[-1, 0].includes(currentGroup)"
          class="word-head-right"
          icon="el-icon-minus"
          @click="removeGroup"
        ></el-button>
      </el-tooltip>
    </div>
    <el-divider class="word-head-divider"></el-divider>

    <div class="word-body">
      <div class="word-body-head" v-if="![-1, 0].includes(currentGroup)">
        <el-button v-if="!removeWordMode" icon="el-icon-plus" @click="wordAction()">新增话术</el-button>
        <el-button v-if="!removeWordMode" icon="el-icon-minus" @click="removeWord">删除话术</el-button>
        <el-button v-if="removeWordMode" @click="removeWordSave">保存</el-button>
        <el-button v-if="removeWordMode" @click="removeWordCancel">取消</el-button>
      </div>
      <div class="word-body-body scroll">
        <div v-if="removeWordMode" style="fonts-size: 12px; color: #ff5b5b; margin-bottom: 5px">
          <i class="el-icon-warning-outline"></i>
          请选择要删除的话术，点击保存确认删除！
        </div>
        <div
          class="word-item"
          :class="{ 'word-item-active': currentRemoveItems.includes(item.msgId) }"
          v-for="(item, i) in wordsData"
          :key="i"
          @click="sendWord(item, i)"
        >
          <div class="word-item-head">
            <div class="word-item-head-left ellipsis">{{ item.groupName }}：{{ item.title }}</div>
            <div class="word-item-head-right" v-if="![-1, 0].includes(currentGroup)">
              <i class="el-icon-edit-outline" @click.stop="wordAction(item)"></i>
              <!-- <i class="el-icon-delete"></i> -->
            </div>
          </div>
          <div class="word-item-body">
            <div v-for="(unit, j) in item.contents" :key="j">
              <div style="margin-bottom: 2px; color: #333333" v-if="unit.msgType === 1">{{ unit.msg }}</div>
              <div v-if="unit.msgType === 2">
                <el-avatar :size="50" shape="square" :src="unit.msg"></el-avatar>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-pagination
      v-if="pagination.total"
      small
      background
      layout="total,sizes,pager"
      @size-change="sizeChange"
      @current-change="currentChange"
      :total="pagination.total"
      :pager-count="5"
    ></el-pagination>

    <el-dialog
      width="500px"
      class="word-modal"
      append-to-body
      :visible="wordModal.visible"
      :before-close="wordModalClose"
      title="话术"
      :show-close="false"
      destroy-on-close
    >
      <div class="word-modal-body">
        <div class="word-modal-item">
          <div class="word-modal-item-left">组名称：</div>
          <div class="word-modal-item-right">
            <el-select v-model="currentGroup" style="width: 100%" placeholder="请选择">
              <el-option
                v-for="item in groups.slice(2)"
                :key="item.groupId"
                :label="item.groupName"
                :value="item.groupId"
              ></el-option>
            </el-select>
          </div>
        </div>
        <div class="word-modal-item">
          <div class="word-modal-item-left">话术标题：</div>
          <div class="word-modal-item-right"><el-input v-model="wordModal.title" placeholder="请输入"></el-input></div>
        </div>
        <div class="word-modal-item">
          <div class="word-modal-item-left">话术内容：</div>
          <div class="word-modal-item-right">
            <el-input v-model="wordModal.content" type="textarea" :rows="4" placeholder="请输入"></el-input>
          </div>
        </div>
        <div class="word-modal-upload">
          <div class="word-modal-upload-head">上传图片或视频</div>
          <div class="word-modal-upload-body">
            <div v-for="(item, i) in wordModal.fileList" :key="i">
              <el-avatar :size="72" shape="square" :src="item.url"></el-avatar>
            </div>
            <el-upload
              :action="uploadUrl"
              list-type="picture-card"
              name="myfile"
              :show-file-list="false"
              :file-list="wordModal.fileList"
              :on-change="uploadChange"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
          </div>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="wordModalClose">取 消</el-button>
        <el-button @click="wordModalConfirm">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      width="500px"
      class="word-group-modal"
      append-to-body
      :visible="wordGroupModal.visible"
      :before-close="wordGroupModalClose"
      title="话术分组"
      :show-close="false"
      destroy-on-close
    >
      <div class="word-group-modal-body">
        <div class="word-group-modal-item">
          <div class="word-group-modal-item-left">组名称：</div>
          <div class="word-group-modal-item-right">
            <el-input placeholder="请输入" v-model="wordGroupModal.groupName"></el-input>
          </div>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="wordGroupModalClose">取 消</el-button>
        <el-button @click="wordGroupModalConfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  wordGroupGetApi,
  wordGetApi,
  wordSaveApi,
  wordGroupSaveApi,
  wordRemoveApi,
  wordGroupRemoveApi
} from '@/api/httpApi'
import { TalkToFriendTask } from '@/api/webSocketApi'

export default {
  data() {
    return {
      groups: [],
      pagination: {
        current: 1,
        size: 10,
        total: 0
      },
      searchOptions: {},
      words: [],
      tabs: {
        isClick: false,
        isLeft: false,
        isRight: false,
        x: 1165,
        currentTab: 0,
        currentTime: Date.now()
      },
      wordModal: { visible: false, title: undefined, content: undefined, options: [], fileList: [], word: {} },
      wordGroupModal: { visible: false },
      currentGroup: -1,
      uploadUrl: process.env.VUE_APP_UPLOAD_URL,
      //删除话术模式
      removeWordMode: false,
      currentRemoveItems: []
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'currentUser',
      currentWeChatId: 'conversation/currentWeChatId',
      currentFriendId: 'conversation/currentFriendId',
      currentFriend: 'conversation/currentFriend'
    }),
    wordsData() {
      return this.words
        .filter((item) => (this.searchOptions.val ? item.title.includes(this.searchOptions.val) : item))
        .slice(
          (this.pagination.current - 1) * this.pagination.size,
          (this.pagination.current - 1) * this.pagination.size + this.pagination.size
        )
    }
  },
  watch: {
    currentWeChatId: {
      handler() {
        this.currentGroup = -1
        this.currentWeChatId && this.getWordGroup()
        this.currentWeChatId && this.currentGroup && this.getWord()
      },
      immediate: true
    }
  },
  mounted() {
    this.currentGroup = -1
    document.documentElement.addEventListener('mouseup', () => {
      this.tabs.isClick = false
    })
  },
  methods: {
    getWordGroup() {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      wordGroupGetApi(this.currentWeChatId, loginInfo.name).then((res) => {
        if (res.code === 0) {
          this.groups = res.data
            ? [{ groupName: '全部', groupId: -1 }, { groupName: '系统话术', groupId: 0 }, ...res.data]
            : [
                { groupName: '全部', groupId: -1 },
                { groupName: '系统话术', groupId: 0 }
              ]
        } else {
          this.groups = [
            { groupName: '全部', groupId: -1 },
            { groupName: '系统话术', groupId: 0 }
          ]
        }
      })
    },
    getWord() {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      wordGetApi(this.currentWeChatId, this.currentGroup, loginInfo.name).then((res) => {
        if (res.code === 0) {
          this.words = res.data || []
          this.pagination.total = res.data ? res.data.length : 0
          this.pagination.current = 1
          this.pagination.size = 10
        }
      })
    },

    sendWord(word) {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      if (this.removeWordMode) {
        if (this.currentRemoveItems.includes(word.msgId)) {
          const index = this.currentRemoveItems.findIndex((item) => item === word.msgId)
          if (index !== -1) this.currentRemoveItems.splice(index, 1)
        } else {
          this.currentRemoveItems.push(word.msgId)
        }

        return
      }
      if (!this.currentWeChatId) {
        this.$message.warning('请先选中微信！')
        return
      }
      if (!this.currentFriendId) {
        this.$message.warning('请先选中好友！')
        return
      }

      const text = word.contents[0] && word.contents[0].msg,
        image = word.contents[1] && word.contents[1].msg,
        image_2 = word.contents[2] && word.contents[2].msg

      text &&
        TalkToFriendTask(
          this.currentWeChatId,
          this.currentFriendId,
          'Text',
          text,
          this.currentUser.NickName,
          loginInfo.name,
          this.currentFriend.PrivateMsgEnable ? this.currentFriend.PrivateMsgId : undefined
        )
      image &&
        TalkToFriendTask(
          this.currentWeChatId,
          this.currentFriendId,
          'Picture',
          image,
          this.currentUser.NickName,
          loginInfo.name,
          this.currentFriend.PrivateMsgEnable ? this.currentFriend.PrivateMsgId : undefined
        )

      image_2 &&
        TalkToFriendTask(
          this.currentWeChatId,
          this.currentFriendId,
          'Picture',
          image_2,
          this.currentUser.NickName,
          loginInfo.name,
          this.currentFriend.PrivateMsgEnable ? this.currentFriend.PrivateMsgId : undefined
        )
    },

    tabMouseDown(e) {
      this.tabs.x = e.x
      this.tabs.isClick = true
      this.tabs.currentTime = Date.now()
    },
    tabMouseMove(e) {
      if (this.tabs.isClick) {
        let x = e.x
        if (x !== this.tabs.x) {
          const dom = document.querySelector('.word-tabs-items')
          const scrollLeft = dom.scrollLeft
          const diff = this.tabs.x - x
          this.tabs.x = x
          dom.scroll(scrollLeft + diff, 0)
        }
      }
    },
    tabsScroll() {
      const dom = document.querySelector('.word-tabs-items')
      const scrollLeft = dom.scrollLeft
      const scrollWidth = dom.scrollWidth
      const clientWidth = dom.clientWidth
      if (scrollLeft === 0) {
        this.tabs.isLeft = true
        this.tabs.isRight = false
      } else if (scrollLeft === scrollWidth - clientWidth) {
        this.tabs.isRight = true
        this.tabs.isLeft = false
      } else {
        this.tabs.isLeft = false
        this.tabs.isRight = false
      }
    },
    tabsMoveLeft() {
      const dom = document.querySelector('.word-tabs-items')
      const scrollLeft = dom.scrollLeft
      dom.scroll({
        left: scrollLeft - 82 * 4,
        behavior: 'smooth'
      })
    },
    tabsMoveRight() {
      const dom = document.querySelector('.word-tabs-items')
      const scrollLeft = dom.scrollLeft
      dom.scroll({
        left: scrollLeft + 82 * 4,
        behavior: 'smooth'
      })
    },
    tabMouseUp(item, i) {
      const currentTime = Date.now()

      //处理滑动/点击事件冲突
      if (currentTime - this.tabs.currentTime < 300) {
        const dom = document.querySelector('.word-tabs-items')
        const scrollLeft = dom.scrollLeft
        dom.scroll({
          left: 82 * i,
          behavior: 'smooth'
        })

        this.tabs.currentTab = i
        this.currentGroup = item.groupId
        this.getWord()
      }
    },
    sizeChange(size) {
      this.pagination.size = size
    },
    currentChange(page) {
      this.pagination.current = page
    },
    wordModalClose() {
      this.wordModal.visible = false
    },
    wordAction(word) {
      this.wordModal.word = word || {}
      this.wordModal.title = this.wordModal.word.title
      if (this.wordModal.word.contents && this.wordModal.word.contents.length) {
        const text = this.wordModal.word.contents.find((item) => item.msgType === 1)
        const img = this.wordModal.word.contents.find((item) => item.msgType === 2)
        this.wordModal.content = text ? text.msg : undefined
        this.wordModal.fileList = img
          ? [
              {
                url: img.msg,
                name: img.msg
              }
            ]
          : []
      } else {
        this.wordModal.content = undefined
        this.wordModal.fileList = []
      }

      this.wordModal.visible = true
    },
    uploadChange(file, fileList) {
      if (file.status === 'success') {
        this.wordModal.fileList = fileList.map((item) => ({
          ...item,
          url: item.response.data.url || item.url
        }))
      }
    },
    wordGroupAction() {
      this.wordGroupModal.visible = true
    },
    wordGroupModalClose() {
      this.wordGroupModal.visible = false
    },
    async wordGroupModalConfirm() {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      const { code, data, msg } = await wordGroupSaveApi(
        loginInfo.name,
        this.currentWeChatId,
        this.wordGroupModal.groupName
      )

      if (code === 0) {
        this.wordGroupModal.visible = false
        this.$message.success('添加成功')
        this.getWordGroup()
        this.tabs.isRight = false
        this.wordGroupModal.groupName = undefined
      } else {
        this.$message.error(msg)
      }
    },
    async wordModalConfirm() {
      const group = this.groups.find((item) => item.groupId === this.currentGroup)
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      if (!this.wordModal.title) return this.$message.warning('请输入话术标题')
      if (!this.wordModal.content) return this.$message.warning('请输入话术内容')
      //if (!this.wordModal.fileList.length) return this.$message.warning('请上传图片或视频')
      const contents = [
        {
          msg: this.wordModal.content,
          msgType: 1,
          sort: 1
        }
      ]
      if (this.wordModal.fileList && this.wordModal.fileList.length) {
        this.wordModal.fileList.forEach((item, index) => {
          contents.push({
            msg: item && item.url,
            msgType: 2,
            sort: index + 2
          })
        })
      }

      const { code, data, msg } = await wordSaveApi({
        account: loginInfo.name,
        wxId: this.currentWeChatId,
        groupId: this.currentGroup,
        groupName: group && group.groupName,
        msgId: this.wordModal.word.msgId,
        title: this.wordModal.title,
        contents
      })
      if (code === 0) {
        this.wordModal.visible = false
        this.$message.success('保存成功')
        this.getWord()
      } else {
        this.$message.error(msg)
      }
    },

    //话术删除
    removeWord() {
      if (!this.words.length) return this.$message.warning('请添加话术')
      this.removeWordMode = true
    },
    async removeWordSave() {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      if (!this.currentRemoveItems.length) return this.$message.warning('请选择话术')
      const { code, data, msg } = await wordRemoveApi({
        account: loginInfo.name,
        wxId: this.currentWeChatId,
        ids: this.currentRemoveItems
      })
      if (code === 0) {
        this.$message.success('删除成功')
        this.removeWordMode = false
        this.currentRemoveItems = []
        this.getWord()
      } else {
        this.$message.error(msg)
      }
    },
    removeWordCancel() {
      this.removeWordMode = false
      this.currentRemoveItems = []
    },
    async removeGroup() {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      if (!this.currentGroup) return this.$message.warning('请选择分组')
      const { code, data, msg } = await wordGroupRemoveApi({
        account: loginInfo.name,
        wxId: this.currentWeChatId,
        ids: [this.currentGroup]
      })
      if (code === 0) {
        this.$message.success('删除成功')
        this.getWordGroup()
        this.currentGroup = undefined
        this.words = []
      } else {
        this.$message.error(msg)
      }
    },
    wordSearch() {
      console.log(this.searchOptions.val)
    }
  }
}
</script>

<style lang="scss" scoped>
.word {
  height: 100%;
  display: flex;
  flex-direction: column;
  :deep(.word-search) {
    padding: 12px 14px 0px;
    .el-input__inner {
      height: 34px;
      line-height: 34px;
    }
    .el-input__icon {
      line-height: 34px;
    }
  }
  .word-head {
    padding: 5px 14px;
    display: flex;
    align-items: center;
    .word-tabs {
      width: 84%;
      display: flex;
      align-items: center;
      user-select: none;
      .el-icon-caret-left,
      .el-icon-caret-right {
        cursor: pointer;
      }
      .word-tabs-items {
        width: 100%;
        display: flex;
        align-items: center;
        overflow-x: scroll;
        &::-webkit-scrollbar {
          display: none;
        }
        .word-tabs-item {
          flex-shrink: 0;
          background-color: #ebebeb;
          font-size: 12px;
          color: #666666;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 8px;
        }
        .word-tabs-item-active {
          background-color: #0cc160;
          color: #fff;
        }
      }
    }
    .word-head-right {
      width: 8%;
      height: 24px;
      font-size: 12px;
      background-color: #ebebeb;
      color: #666666;
      border-color: #ebebeb;
      padding: 0;
      margin-left: 0;
      &:active {
        filter: opacity(80%);
      }
      &:nth-last-child(1) {
        margin-left: 5px;
      }
    }
  }
  .word-head-divider {
    margin: 0px 0 0px;
    background-color: #efefef;
  }
  .word-body {
    overflow-y: scroll;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding: 10px 2px 50px 10px;
    &::-webkit-scrollbar {
      display: none;
    }
    .word-body-head {
      display: flex;
      margin-bottom: 10px;
      .el-button {
        flex: 1;
        height: 30px;
        line-height: 30px;
        padding: 0;
        margin-right: 6px;
        color: #666666;
        background-color: #fff;
        border: 1px dashed #979797;
        &:active {
          filter: opacity(80%);
        }
        &:nth-child(1) {
          // background-color: #0cc160;
          // border-color: #0cc160;
        }
        &:nth-child(2) {
          // background-color: #ff3042;
          // border-color: #ff3042;
        }
      }
    }
    .word-body-body {
      flex-grow: 1;
      overflow-y: scroll;
    }
    .word-item {
      background: #f9f9f9;
      border-radius: 4px;
      border: 1px solid #e6e6e6;
      margin-bottom: 10px;
      cursor: pointer;
      .word-item-head {
        display: flex;
        align-items: center;
        padding: 4px 10px;
        border-bottom: 1px solid #ececec;
        color: #333333;
        .word-item-head-left {
          width: 60%;
        }
        .word-item-head-right {
          flex-grow: 1;
          display: flex;
          justify-content: flex-end;
          .el-icon-edit-outline {
            cursor: pointer;
            //margin-right: 10px;
          }
          .el-icon-delete {
            cursor: pointer;
          }
        }
      }
      .word-item-body {
        height: 90px;
        padding: 8px 10px;
        color: #333333;
        overflow-y: scroll;
        &::-webkit-scrollbar {
          display: none;
        }
        .el-avatar {
          width: 32px !important;
          height: 45px !important;
          img {
            width: 100%;
          }
        }
      }
    }
    .word-item-active {
      border-color: #b8dbc8;
      background: #f8fffb;
      .word-item-head {
        border-color: #b8dbc8;
      }
    }
  }

  :deep(.el-pagination) {
    position: sticky;
    bottom: 0;
    display: flex;
    background-color: #f8f8f8;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    border-top: 1px solid #ededed;
    .el-pagination__total {
      margin-right: 5px;
      color: #999999;
    }
    .el-pagination__sizes {
      .el-input {
        width: 80px;
        .el-input__inner {
          height: 24px;
          line-height: 24px;
          font-size: 12px;
          border: 1px solid #d9d9d9;
        }
        .el-input__suffix {
          .el-input__icon {
            height: 24px;
            line-height: 24px;
            font-size: 12px;
          }
        }
      }
    }
    .btn-prev,
    .btn-next {
      background-color: #f8f8f8;
    }
    .el-pager {
      display: flex;
      .number,
      .btn-quickprev,
      .btn-quicknext {
        background-color: #f8f8f8;
      }

      li:not(.disabled).active {
        background-color: #0cc160;
      }
      li:not(.disabled):hover {
        color: #0cc160;
      }
      li.active:hover {
        color: #fff;
      }
    }
  }
}
</style>

