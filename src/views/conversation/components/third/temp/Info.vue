<template>
  <div class="info">
    <div class="info-details">
      <div class="info-details-avatar">
        <el-avatar :src="userInfo.avatar" :size="32" shape="square" fit="cover"></el-avatar>
        <div>{{ userInfo.customerName }}</div>
      </div>
      <div class="info-details-body">
        <div>性别：{{ userInfo.gender }}</div>
        <div>手机号：{{ userInfo.filledMobile }}</div>
        <div>添加方式：{{ userInfo.followUserAddWay }}</div>
        <div>添加时间：{{ Day(userInfo.userCreateTime).format('YYYY-MM-DD HH:mm') }}</div>
      </div>
    </div>
    <el-divider></el-divider>
    <div class="info-tags">
      <div class="info-tags-name">
        已添加标签
        <span @click="tagAction"><el-icon class="el-icon-circle-plus-outline"></el-icon></span>
      </div>
      <div class="info-tags-body">
        <el-tag v-for="(tag, i) in userInfo.labelList" :key="i" type="info" hit size="mini">{{ tag.labelName }}</el-tag>
      </div>
    </div>
    <el-divider></el-divider>
    <div class="info-tags">
      <div class="info-tags-name">已添加IOP标签</div>
      <div class="info-tags-body">
        <el-tag v-for="(tag, i) in userInfo.iopLabelList" :key="i" type="info" hit size="mini">
          {{ tag.labelName }}
        </el-tag>
      </div>
    </div>
    <el-divider></el-divider>

    <el-dialog
      append-to-body
      class="set-modal"
      title="设置标签"
      :visible="tagModal.setVisible"
      @close="setModalClose"
      width="500px"
    >
      <div class="set-modal-body">
        <div style="margin-bottom: 15px">
          设置方式：
          <el-radio-group v-model="tagModal.type">
            <el-radio :label="0">覆盖</el-radio>
            <el-radio :label="1">添加</el-radio>
          </el-radio-group>
        </div>
        <div style="margin-bottom: 15px">
          选择平台标签：
          <el-button type="primary" size="mini" @click="tagSelect">选择标签</el-button>
        </div>
        <div style="margin-left: 100px">
          <div class="set-modal-body-tags">
            <div style="margin-bottom: 10px">已选标签：</div>
            <div v-if="tagModal.tags.length">
              <el-tag
                v-for="(tag, i) in tagModal.tags"
                :key="i"
                type="info"
                size="mini"
                closable
                @close="deleteTag(tag, i)"
              >
                {{ tag.name }}
              </el-tag>
            </div>
            <span v-else style="margin-bottom: 10px">暂无</span>
          </div>
        </div>
      </div>
      <span slot="footer">
        <el-button type="primary" @click="setModalConfirm">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      append-to-body
      class="tag-modal"
      title="选择标签"
      :visible="tagModal.tagVisible"
      @close="tagModalClose"
      width="720px"
    >
      <div class="tag-modal-body">
        <div class="tag-modal-body-left">
          <el-tree
            :data="tagModal.treeData"
            :props="{
              label: 'name',
              children: 'tagGrou'
            }"
            highlight-current
            @node-click="treeClick"
          ></el-tree>
        </div>

        <div class="tag-modal-body-right">
          <el-input placeholder="搜索标签" prefix-icon="el-icon-search" v-model="tagModal.name">
            <el-button slot="append" icon="el-icon-search" @click="tagSearch"></el-button>
          </el-input>
          <div class="tag-modal-body-items">
            <div v-for="(item, i) in tagModal.allTags" :key="i">
              <div>
                <el-checkbox @change="tagChange($event, item)" v-model="item.checked">{{ item.name }}</el-checkbox>
              </div>
              <el-divider></el-divider>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer">
        <el-button type="primary" @click="tagModalConfirm">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { userInfoGet, tagGroupGet, tagContentGet, tagAdd } from '@/api/httpApi'
import Day from 'dayjs'
export default {
  name: 'FastReply',
  data() {
    return {
      userInfo: {},
      tagModal: {
        type: 0,
        setVisible: false,
        tagVisible: false,
        tags: [],
        tagGroups: [],
        allTags: [],
        treeData: [],
        currentNode: {},
        currentNodeKey: undefined
      }
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'currentUser',
      currentWeChatId: 'conversation/currentWeChatId',
      currentFriendId: 'conversation/currentFriendId'
    })
  },
  mounted() {
    this.getUserInfo()
  },
  methods: {
    Day,
    getUserInfo() {
      if (!this.currentWeChatId) {
        this.$message.warning('请先选中微信！')
        return
      }
      if (!this.currentFriendId) {
        this.$message.warning('请先选中好友！')
        return
      }
      userInfoGet(this.currentFriendId, this.currentWeChatId).then((res) => {
        if (res.code === 200) {
          this.userInfo = res.result || {}
        }
      })
    },
    setModalClose() {
      this.tagModal.setVisible = false
    },
    tagModalClose() {
      this.tagModal.tagVisible = false
    },
    tagAction() {
      this.tagModal.setVisible = true
    },
    tagSelect() {
      this.tagModal.tagVisible = true
      tagGroupGet().then((res) => {
        if (res.code === 200) {
          this.tagModal.tagGroups = res.result
          this.tagModal.treeData = res.result
        }
      })
    },
    setModalConfirm() {
      tagAdd(this.tagModal.type, this.tagModal.tags.map((item) => item.tayId).join(','), this.userInfo.id).then(
        (res) => {
          this.tagModal.setVisible = false
          if (res.code === 200) {
            this.$message.success('设置成功')
            this.getUserInfo()
          }
        }
      )
    },
    treeClick(option, node, self) {
      //叶子节点
      if (node.isLeaf) {
        this.tagModal.currentNode = option
        tagContentGet(option.id, this.tagModal.name).then((res) => {
          if (res.code === 200) {
            this.tagModal.allTags = res.result || []
            this.tagModal.allTags.forEach((item) => {
              const res = this.tagModal.tags.find((tag) => tag.tayId === item.tayId)
              item.checked = !!res
            })
          }
        })
      }
    },
    tagModalConfirm() {
      this.tagModal.tagVisible = false
    },
    tagChange(checked, item) {
      if (checked) {
        if (!this.tagModal.tags.find((tag) => item.tayId === tag.tayId)) {
          this.tagModal.tags.push(item)
        }
      } else {
        const index = this.tagModal.tags.findIndex((tag) => item.tayId === tag.tayId)
        if (index !== -1) {
          this.tagModal.tags.splice(index, 1)
        }
      }
    },
    deleteTag(tag, i) {
      this.tagModal.tags.splice(i, 1)
      const tagItem = this.tagModal.allTags.find((item) => item.tayId === tag.tayId)
      if (tagItem) tagItem.checked = false
    },
    tagSearch() {
      tagContentGet(this.tagModal.currentNode.id, this.tagModal.name).then((res) => {
        if (res.code === 200) {
          this.tagModal.allTags = res.result || []
          this.tagModal.allTags.forEach((item) => {
            const res = this.tagModal.tags.find((tag) => tag.tayId === item.tayId)
            item.checked = !!res
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.info {
  .info-details {
    padding: 10px;
    .info-details-avatar {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      .el-avatar {
        margin-bottom: 6px;
      }
    }
    .info-details-body {
      line-height: 20px;
    }
  }
  .el-divider {
    margin: 5px 0;
  }
  .info-tags {
    padding: 5px 15px;
    .info-tags-name {
      text-align: center;
      font-weight: 600;
      margin-bottom: 10px;
      .el-icon-circle-plus-outline {
        cursor: pointer;
      }
    }
    .info-tags-body {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      .el-tag {
        margin: 0 5px 8px 0;
        border-color: rgba(0, 0, 0, 0.12);
      }
    }
  }
}
</style>

