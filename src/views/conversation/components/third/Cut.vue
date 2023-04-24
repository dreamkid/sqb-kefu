<template>
  <div class="cut">
    <div class="cut-body">
      <div class="cut-body-head">
        <el-button>逐条发送</el-button>
        <el-button>合并发送</el-button>
        <el-button>清空剪切板</el-button>
      </div>
      <div class="cut-body-body scroll">
        <div style="fonts-size: 12px; color: #ff5b5b; margin-bottom: 5px">
          <i class="el-icon-warning-outline"></i>
          合并发送需要合并的消息来自同一会话！
        </div>
        <div style="margin-bottom: 5px">
          <el-checkbox v-model="isAll" @change="allChange"></el-checkbox>
          <span style="margin-left: 8px">全选</span>
        </div>
        <div class="cut-item" v-for="(item, i) in cutData" :key="i">
          <el-checkbox v-model="item.checked"></el-checkbox>
          <div class="cut-item-body">
            <div class="cut-item-body-top">
              <div class="cut-item-body-top-left">
                <el-avatar
                  shape="square"
                  :size="45"
                  src="https://fuss10.elemecdn.com/2/11/6535bcfb26e4c79b48ddde44f4b6fjpeg.jpeg"
                ></el-avatar>
              </div>
              <div class="cut-item-body-top-right">
                <div class="cut-item-body-top-right-top">
                  <div>客户1</div>
                  <i class="el-icon-delete"></i>
                </div>
                <div class="cut-item-body-top-right-bottom">
                  <div v-if="item.type === 1" class="cut-item-body-top-right-bottom-text">
                    我通过了你的朋友验证请求，现在 我们可以开始聊天了 你好啊 我通过了你的朋友验证请求，现在
                    我们可以开始聊天了 你好啊 我通过了你的朋友验证请求，现在 我们可以开始聊天了 你好啊
                  </div>
                  <div v-if="item.type === 2" class="cut-item-body-top-right-bottom-img">
                    <el-avatar
                      shape="square"
                      :size="45"
                      src="https://fuss10.elemecdn.com/2/11/6535bcfb26e4c79b48ddde44f4b6fjpeg.jpeg"
                    ></el-avatar>
                  </div>
                </div>
              </div>
            </div>
            <div class="cut-item-body-bottom">
              <div class="cut-item-body-bottom-left">会话来源：客户1</div>
              <div class="cut-item-body-bottom-right">发起时间：{{ Day().format('YYYY-MM-DD HH:mm:ss') }}</div>
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {} from '@/api/httpApi'
import { TalkToFriendTask } from '@/api/webSocketApi'
import Day from 'dayjs'
export default {
  data() {
    return {
      pagination: {
        current: 1,
        size: 10,
        total: 30
      },

      words: [
        { type: 1 },
        { type: 2 },
        { type: 1 },
        { type: 2 },
        { type: 2 },
        { type: 1 },
        { type: 2 },
        { type: 2 },
        { type: 2 }
      ],
      isAll: false
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'currentUser',
      currentWeChatId: 'conversation/currentWeChatId',
      currentFriendId: 'conversation/currentFriendId',
      currentFriend: 'conversation/currentFriend'
    }),
    cutData() {
      return this.words.slice(
        (this.pagination.current - 1) * this.pagination.size,
        (this.pagination.current - 1) * this.pagination.size + this.pagination.size
      )
    }
  },
  watch: {
    currentWeChatId: {
      handler() {},
      immediate: true
    }
  },
  mounted() {},
  methods: {
    Day,
    sizeChange(size) {
      this.pagination.size = size
    },
    currentChange(page) {
      this.pagination.current = page
    },
    allChange(checked) {
      this.words = this.words.map((item) => ({
        ...item,
        checked
      }))
    }
  }
}
</script>

<style lang="scss" scoped>
.cut {
  height: 100%;
  display: flex;
  flex-direction: column;

  .cut-body {
    overflow-y: scroll;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding: 10px 2px 50px 10px;
    &::-webkit-scrollbar {
      display: none;
    }
    .cut-body-head {
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
      }
    }
    :deep(.cut-body-body) {
      flex-grow: 1;
      overflow-y: scroll;
      .el-checkbox__input.is-checked .el-checkbox__inner,
      .el-checkbox__input.is-indeterminate .el-checkbox__inner {
        background-color: #0cc160;
        border-color: #0cc160;
      }
      .el-checkbox__input.is-focus .el-checkbox__inner {
        border-color: #0cc160;
      }
    }
    .cut-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;

      .cut-item-body {
        flex-grow: 1;
        padding: 10px;
        background-color: #f6f6f6;
        border: 1px solid #ededed;
        margin-left: 10px;
        .cut-item-body-top {
          display: flex;
          justify-content: space-between;
          .cut-item-body-top-right {
            flex-grow: 1;
            margin-left: 10px;
            .cut-item-body-top-right-top {
              display: flex;
              justify-content: space-between;
              .el-icon-delete {
                cursor: pointer;
              }
            }
            .cut-item-body-top-right-bottom {
              margin-top: 5px;
              .cut-item-body-top-right-bottom-text {
                background-color: #fff;
                padding: 10px 15px;
                border-radius: 5px;
              }
            }
          }
        }
        .cut-item-body-bottom {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666666;
          margin-top: 5px;
        }
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

