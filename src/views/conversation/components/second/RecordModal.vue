<template>
  <el-dialog
    class="record-modal"
    title="聊天记录"
    width="600px"
    :visible="visible"
    :before-close="modalClose"
    append-to-body
    :show-close="false"
  >
    <div class="record-modal-body-item" v-for="(item, i) in list" :key="i">
      <!-- <el-avatar shape="square" :size="40" :src="item.thumburl"></el-avatar> -->
      <div class="record-modal-body-item-body">
        <div class="record-modal-body-item-body-top">
          <div class="record-modal-body-item-body-top-left">{{ item.sourcename }}</div>
          <div class="record-modal-body-item-body-top-right">
            {{ item.sourcetime }}
          </div>
        </div>
        <div class="record-modal-body-item-body-middle">
          <div v-if="item.datatype === '1'">{{ item.datadesc }}</div>
          <div v-else-if="item.datatype === '2'">
            {{ item.datadesc }}
          </div>
          <div v-if="item.datatype === '3'">[语音]</div>
          <div v-if="item.datatype === '4'">[视频]</div>
          <div v-else-if="item.datatype === '5'">
            <a :href="item.streamweburl" target="_blank">[链接]</a>
            {{ item.datatitle }}
          </div>
          <div v-else-if="item.datatype === '7'">
            <a :href="item.streamweburl" target="_blank">[音乐]</a>
            {{ item.datadesc }} - {{ item.datatitle }}
          </div>
          <div v-else-if="item.datatype === '17'">[群聊的聊天记录]{{ item.datadesc }}</div>
          <div v-else-if="item.datatype === '19'">[小程序]{{ item.datatitle }}</div>
        </div>
      </div>
      <div></div>
    </div>
  </el-dialog>
</template>

<script>
import dayjs from 'dayjs'
export default {
  data() {
    return {
      visible: false,
      list: []
    }
  },
  methods: {
    dayjs,
    getData(data) {
      console.log(data)
      this.list = data
    },
    modalAction() {
      this.visible = true
    },
    modalClose() {
      this.visible = false
    },
    getUrl(item) {
      let content = {}
      if (item.sendContent.startsWith('{')) {
        content = JSON.parse(item.sendContent)
      } else if (item.sendContent.startsWith('http://')) {
        content = { Thumb: item.sendContent }
      } else {
        content = JSON.parse(item.sendContent.replace(/\S+?:/, '').replace(/^\n+|\n+$/g, ''))
      }

      return content.Thumb
    }
  }
}
</script>

<style scoped lang="less">
</style>