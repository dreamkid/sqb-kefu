<template>
  <div>
    <el-dialog
      append-to-body
      class="circle-modal"
      :visible="circleModal.visible"
      @close="circleModalClose"
      width="570px"
    >
      <div class="circle-modal-body">
        <div class="circle-modal-body-bg"></div>
        <div class="circle-modal-body-user">
          <div class="circle-modal-body-user-top">
            <div class="circle-modal-body-user-top-left">{{ currentFriend.FriendNick }}</div>
            <el-avatar shape="square" :size="72" :src="currentFriend.Avatar"></el-avatar>
          </div>
          <div class="circle-modal-body-user-bottom">远在远方的风比远方更远</div>
        </div>
        <div class="circle-modal-body-items" ref="circleModalItemsRef">
          <div class="circle-modal-body-item" v-for="(item, i) in items" :key="i">
            <div class="circle-modal-body-item-left">
              <span style="font-size: 24px">{{ item[0] ? Day(item[0].createTime).date() : '-' }}</span>
              <span style="font-size: 12px">{{ item[0] ? Day(item[0].createTime).month() : '-' }}月</span>
            </div>

            <div class="circle-modal-body-item-right">
              <div
                class="circle-modal-body-item-right-item"
                v-for="(unit, j) in item"
                :key="j"
                @click="showDetails(item, unit)"
              >
                <div class="circle-modal-body-item-right-left">
                  <div class="circle-modal-body-item-right-left-one" v-if="unit.imgs && unit.imgs.length === 1">
                    <el-avatar
                      v-for="(img, k) in unit.imgs.slice(0, 1)"
                      :key="k"
                      shape="square"
                      :size="160"
                      :src="img"
                    ></el-avatar>
                  </div>
                  <div class="circle-modal-body-item-right-left-two" v-if="unit.imgs && unit.imgs.length === 2">
                    <el-avatar
                      v-for="(img, k) in unit.imgs.slice(0, 2)"
                      :key="k"
                      shape="square"
                      :size="78"
                      :src="img"
                    ></el-avatar>
                  </div>
                  <div class="circle-modal-body-item-right-left-three" v-if="unit.imgs && unit.imgs.length === 3">
                    <el-avatar
                      class="circle-modal-body-item-right-left-three-left"
                      v-for="(img, k) in unit.imgs.slice(0, 1)"
                      :key="k"
                      shape="square"
                      :size="78"
                      :src="img"
                    ></el-avatar>
                    <div class="circle-modal-body-item-right-left-three-right">
                      <el-avatar
                        v-for="(img, k) in unit.imgs.slice(1, 3)"
                        :key="k"
                        shape="square"
                        :size="78"
                        :src="img"
                      ></el-avatar>
                    </div>
                  </div>
                  <div class="circle-modal-body-item-right-left-four" v-if="unit.imgs && unit.imgs.length >= 4">
                    <el-avatar
                      v-for="(img, k) in unit.imgs.slice(0, 4)"
                      :key="k"
                      shape="square"
                      :size="78"
                      :src="img"
                    ></el-avatar>
                  </div>
                </div>
                <div class="circle-modal-body-item-right-content">
                  <div
                    class="circle-modal-body-item-right-text"
                    :class="{
                      'circle-modal-body-item-right-text-one': !unit.imgs || (unit.imgs && unit.imgs.length === 0)
                    }"
                  >
                    {{ unit.text }}
                  </div>
                  <span v-if="unit.imgs && unit.imgs.length > 4" class="circle-modal-body-item-right-num">
                    共{{ unit.imgs.length }}张
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
    <Details ref="detailsRef" :dataSource="details" />
  </div>
</template>
<script>
import { mapGetters, mapState } from 'vuex'
import Day from 'dayjs'
import Details from './CircleDetails.vue'
import { friendDetailsApi } from '@/api/httpApi'
import bus from '@/utils/bus'
export default {
  components: { Details },
  data() {
    return {
      circleModal: {
        visible: false
      },
      items: [],
      total: 0,
      current: 1,
      details: {}
    }
  },
  computed: {
    ...mapState(['currentUser']),
    ...mapGetters({
      currentFriendId: 'conversation/currentFriendId',
      currentWeChatId: 'conversation/currentWeChatId',
      currentFriend: 'conversation/currentFriend'
    })
  },
  watch: {
    'circleModal.visible': {
      handler(visible) {
        if (visible) {
          this.$nextTick(() => {
            this.current = 1
            this.total = 0
            this.items = []
            this.getDetailsData({
              size: 10,
              current: 1
            })
            const itemsDom = this.$refs.circleModalItemsRef
            itemsDom.onscroll = (e) => {
              if (itemsDom.scrollHeight === itemsDom.scrollTop + itemsDom.clientHeight) {
                if (this.items.length < this.total) {
                  this.getDetailsData({
                    size: 10,
                    current: ++this.current
                  })
                }
              }
            }
          })
        }
      }
    }
  },
  methods: {
    Day,
    circleModalClose() {
      this.circleModal.visible = false
    },
    circleModalConfirm() {},
    showDetails(item, unit) {
      this.$refs.detailsRef.circleDetailsModal.visible = true
      this.$refs.detailsRef.details = unit
    },
    async getDetailsData(pagination) {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      const { code, data } = await friendDetailsApi({
        entity: {
          wxId: this.currentWeChatId,
          friendId: this.currentFriendId
        },
        ...pagination
      })
      if (code === 0) {
        if (data.records && data.records.length) {
          this.items = [
            ...this.items,
            ...data.records.map((item) => [
              {
                ...item,
                imgs: item.urls && item.urls.split(','),
                text: item.textContent
              }
            ])
          ]
        }

        this.total = data.total || 0
      }
    }
  },
  mounted() {
    console.log('circle mounted')
    bus.$on('likeSuccess', () => {})
    bus.$on('commentSuccess', () => {})
  },
  updated() {
    console.log('circle updated')
  }
}
</script>
 <style lang="less" scoped>
</style>