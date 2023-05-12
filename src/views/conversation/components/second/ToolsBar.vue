<template>
  <div class="tool-bar can-not-select">
    <div class="tool-start">
      <!-- qq表情 -->
      <el-popover placement="top-start" width="400" trigger="hover">
        <div class="scroll" style="height: 210px; overflow-y: scroll">
          <img class="qq-face" src="expression/qqface.png" usemap="#qqMap" />
          <map name="qqMap">
            <area
              v-for="(expression, index) in 105"
              :key="index"
              shape="rect"
              :coords="
                (index % 15) * 25 +
                ', ' +
                parseInt(index / 15) * 25 +
                ', ' +
                ((index % 15) + 1) * 25 +
                ', ' +
                (parseInt(index / 15) + 1) * 25
              "
              :title="qqFaceMap[index] || index"
              @click="selectExpression(index)"
            />
          </map>
          <img src="expression/emoji.png" usemap="#emojiMap" />
          <map name="emojiMap">
            <area
              v-for="(emoji, index) in 177"
              :key="index"
              shape="rect"
              :coords="
                (index % 15) * 25 +
                ', ' +
                parseInt(index / 15) * 25 +
                ', ' +
                ((index % 15) + 1) * 25 +
                ', ' +
                (parseInt(index / 15) + 1) * 25
              "
              :title="qqFaceMap[105 + index]"
              @click="selectExpression(105 + index)"
            />
          </map>
        </div>
        <div slot="reference" class="tool-icon" title="表情">
          <img style="filter: opacity(60%)" src="../../../../assets/images/answer/sendEmoji.png" alt="表情" />
        </div>
      </el-popover>
      <!-- 发图片|视频|文件 -->
      <div class="tool-icon" title="发送文件">
        <el-popover placement="top-start" trigger="hover">
          <label class="label" for="sendFiles" style="cursor: pointer">本地选择素材</label>
          <div style="margin-top: 10px; cursor: pointer" @click="selectMaterial(2)">从素材库中选择</div>
          <label class="label" slot="reference">
            <img style="filter: opacity(60%)" src="../../../../assets/images/answer/sendPicture.png" alt="发文件" />
          </label>
        </el-popover>

        <input
          v-show="false"
          id="sendFiles"
          ref="toolsFile"
          type="file"
          accept=".txt, .doc, .xls, .ppt, .docx, .xlsx, .pptx, .rar, .zip, .exe, .text, .apk, .mp3, .jpg, .png, .gif, .jpeg, .mp4"
          @change="choseMedia('File')"
        />
      </div>
      <!-- 剪切 -->
      <!-- <div class="tool-icon" title="截图" @click="shearScreen">
        <img style="filter: opacity(60%)" src="../../../../assets/images/answer/shear.png" alt="文件" />
      </div> -->
      <!-- 发语音 -->
      <div class="tool-icon" title="发语音">
        <el-popover placement="top-start" trigger="hover">
          <label class="label" for="sendVoiceId" style="cursor: pointer">本地选择语音</label>
          <div style="margin-top: 10px; cursor: pointer" @click="selectMaterial(4)">从素材库中选择</div>
          <label class="label" slot="reference">
            <img style="filter: opacity(60%)" src="../../../../assets/images/answer/voice.png" alt="语音" />
          </label>
        </el-popover>

        <input
          v-show="false"
          id="sendVoiceId"
          ref="toolsVoice"
          type="file"
          accept=".amr, .mp3"
          @change="choseMedia('Voice')"
        />
      </div>
      <!-- 二维码 -->
      <!-- <div class="tool-icon" title="二维码" @click="showQrCode">
        <img src="../../../../assets/images/answer/qrCode.png" alt="二维码" />
      </div> -->
      <!-- 公众号 -->
      <!-- <div v-if="currentWeChatId" title="获取公众号" class="tool-icon" @click="showGH">
        <img src="../../../../assets/images/answer/gh.png" alt="公众号" />
      </div> -->

      <!-- 以下的icon 只有选中了好友才展示 -->
      <!-- 发名片 -->
      <!-- <div class="tool-icon" title="发名片" @click="showSendNameCard">
        <img src="../../../../assets/images/answer/nameCard.png" alt="名片" />
      </div> -->
      <!-- 发红包 -->
      <!-- <div class="tool-icon" title="发红包" @click="redEnvelopeDialog = true">
        <img src="../../../../assets/images/answer/redBag.png" alt="红包" />
      </div> -->
      <!-- 转账 -->
      <!-- <div v-if="currentFriendId" class="tool-icon" title="转账" @click="showTransferMoneyDialog">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-transfer-money"></use>
          </svg>
        </div> -->
      <!-- 发小程序 -->
      <!-- <div class="tool-icon" title="发小程序" @click="selectMaterial(7)">
        <img src="../../../../assets/images/answer/miniProcess.png" alt="小程序" />
      </div> -->
      <!-- 发链接 -->
      <!-- <div class="tool-icon" title="发链接" @click="selectMaterial(5)">
        <img src="../../../../assets/images/answer/h5.png" alt="链接" />
      </div> -->
      <!-- 群二维码 -->
      <!-- <div
        v-if="currentFriendId.indexOf('chatroom') > 0"
        title="群二维码"
        class="tool-icon"
        @click="showChatRoomQrCode"
      >
        <img src="../../../../assets/images/answer/qrCode.png" alt="群二维码" />
      </div> -->
      <!-- emoji -->
      <!-- <div class="tool-icon" title="发Emoji" @click="showEmoji">
        <i class="fa fa-gitlab" title="emoji"></i>
      </div> -->

      <!-- 朋友圈 -->
      <div v-if="!currentFriend.Owner" class="tool-icon" title="朋友圈" @click="changeAsideRightPage('FriendCircle')">
        <img src="../../../../assets/images/answer/friendCircle.png" alt="朋友圈" />
        <FriendCircle ref="circleRef" />
      </div>
    </div>

    <div class="tool-end">
      <!-- 历史消息 -->
      <!-- <div class="tool" title="历史消息" @click="showMsgHistory()">
        <img class="icon" src="../../../assets/svg/tool-bar-history.svg" alt />
      </div> -->
      <!-- 创建群聊 -->
      <!-- <div class="tool-icon" title="创建群" @click="createChatRoom()">
        <img src="../../../../assets/images/answer/createRoom.png" alt="建群" />
      </div> -->
      <!-- 好友|群 管理 -->
      <!-- <div
        class="tool-icon"
        :title="currentFriendId.indexOf('chatroom') > 0 ? '群管理' : '好友管理'"
        @click="changeAsideRightPage(currentFriendId.indexOf('chatroom') > 0 ? 'ChatRoomManager' : 'LabelRemark')"
      >
        <img src="../../../../assets/images/answer/showSetting.png" alt="管理" />
      </div> -->
      <!-- 朋友圈 -->
      <!-- <div v-if="!currentFriend.Owner" class="tool-icon" title="朋友圈" @click="changeAsideRightPage('FriendCircle')">
        <img src="../../../../assets/images/answer/friendCircle.png" alt="朋友圈" />
        <FriendCircle ref="circleRef" />
      </div> -->
      <!-- <el-checkbox v-model="internalChecked" @change="internalChange($event)">内部消息</el-checkbox>
      <el-divider direction="vertical"></el-divider>
      <el-popover popper-class="help-popover" placement="bottom-start" trigger="hover">
        <div slot="reference" style="cursor: pointer">
          <i class="el-icon-position"></i>
          支援
        </div>

        <div>
          <el-menu style="border-right: none" v-if="supportList.length">
            <el-menu-item v-for="(item, i) in supportList" :key="i" @click="support(item)">
              <div slot="title">
                {{ item.accountNick }}
                <el-tag style="margin-left: 5px" size="mini" :color="`${item.onLine ? '#0CC160' : '#C9C9C9'}`">
                  {{ item.onLine ? '在线' : '离线' }}
                </el-tag>
              </div>
            </el-menu-item>
          </el-menu>
        </div>
      </el-popover> -->
    </div>

    <!-- 创建群聊弹框 -->
    <SlotFriends
      v-if="friendsDialogVisible"
      :dialogTilte="dialogTilte"
      :action="action"
      :dialogData="dialogData"
      :currentFriend="currentFriend"
      :friends="dialogData"
      :friendsDialogVisible="friendsDialogVisible"
      @closeSlotFriends="friendsDialogVisible = false"
    />

    <!-- 二维码弹框 -->
    <el-dialog
      append-to-body
      class="qr-code-dialog"
      :title="currentWechat.WeChatNick + '的二维码'"
      :show-close="true"
      :visible.sync="qrCodeDialog"
    >
      <el-image class="qr-code-img" :src="conversationQrCode['QrCodeUrl']" fit="scale-down">
        <div slot="error" class="image-slot">
          <i style="font-size: 100px" class="el-icon-picture-outline"></i>
        </div>
      </el-image>
      <div>
        <span
          v-if="conversationQrCode.ModifyTime"
          v-text="$options.filters.timeFilter(conversationQrCode['ModifyTime'])"
        ></span>
        <i
          class="el-icon-refresh"
          style="margin-left: 5px; cursor: pointer; color: blue"
          :title="'刷新'"
          @click="pullWeChatQrCodeTask"
        ></i>
      </div>
      <el-button
        type="primary"
        style="width: 100px; padding: 5px; margin: 10px 10px 20px 10px"
        size="small"
        @click="sendQrCode"
      >
        发送
      </el-button>
    </el-dialog>

    <!-- 群聊二维码弹框 -->
    <el-dialog
      append-to-body
      class="qr-code-dialog-room"
      :title="currentFriend.NickName + '的二维码'"
      :show-close="true"
      :visible.sync="chatRoomQrCodeDialog"
    >
      <el-image class="qr-code-img" :src="chatRoomQrCode['QrCodeUrl']" fit="scale-down">
        <div slot="error" class="image-slot">
          <i style="font-size: 100px" class="el-icon-picture-outline"></i>
        </div>
      </el-image>
      <div>
        <span
          v-if="chatRoomQrCode.ModifyTime"
          v-text="$options.filters.timeFilter(chatRoomQrCode['ModifyTime'])"
        ></span>
        <i
          class="el-icon-refresh"
          style="margin-left: 5px; cursor: pointer; color: blue"
          :title="'刷新'"
          @click="pullChatRoomQrCodeTask"
        ></i>
      </div>
      <el-button
        type="primary"
        style="width: 100px; padding: 5px; margin: 10px 10px 20px 10px"
        size="small"
        @click="sendQrCodeRoom"
      >
        发送
      </el-button>
    </el-dialog>

    <!-- 发红包弹框 -->
    <el-dialog
      class="red-envelope"
      append-to-body
      title="发红包"
      :visible.sync="redEnvelopeDialog"
      :before-close="resetRedForm"
    >
      <el-form ref="redEnvelope" :model="redForm" :rules="redRules" label-width="64px">
        <el-form-item label="金额" prop="money">
          <el-input
            v-model="redForm.money"
            style="width: 145px"
            size="small"
            clearable
            placeholder="输入金额"
          ></el-input>
          分
        </el-form-item>
        <!-- <el-form-item v-if="currentFriendId" label="红包个数" prop="number">
          <el-input v-model="redForm.number" clearable></el-input>
        </el-form-item> -->
        <el-form-item label="留言" prop="blessings">
          <el-input
            v-model="redForm.blessings"
            style="width: 166px"
            type="textarea"
            size="small"
            :autosize="{ minRows: 3, maxRows: 3 }"
            maxlength="24"
            placeholder="输入留言（24字内）"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="redForm.password"
            style="width: 166px"
            size="small"
            type="password"
            autocomplete="off"
            show-password
            placeholder="输入支付密码"
          ></el-input>
        </el-form-item>
        <!-- <el-form-item>
          <span class="show-money">￥{{ redForm.money }}分</span>
        </el-form-item> -->
      </el-form>
      <div
        style="
          background-color: #e96037;
          width: 92px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 3px;
          cursor: pointer;
          margin: 0 auto;
        "
        @click="sendLuckyMoneyTask"
      >
        <img src="../../../../assets/images/tools/hongbaoicom.png" alt="红包" />
        <p style="color: #fff; font-size: 14px; margin-left: 5px">发红包</p>
      </div>
    </el-dialog>

    <!-- 发小程序弹框 -->
    <el-dialog append-to-body class="we-app" title="发送小程序" :visible.sync="wechatAppDialog">
      <div
        v-for="(weApp, index) in weAppList"
        :key="index"
        class="we-app-item"
        :class="{ 'we-app-item-checked': weApp2Send.id === weApp.id }"
        @click="choseWeApp(weApp)"
      >
        <img class="we-app-img" :src="weApp.Icon" alt="" />
        <p class="we-app-name ellipsis" v-text="weApp.Source"></p>
        <!-- <i class="el-icon-delete" @click="deleteWeApp(weApp.id)"></i> -->
      </div>

      <span slot="footer">
        <el-button
          style="background-color: #fff; border: solid #eeeeee 1px; color: #999999"
          size="medium"
          @click="resetWeApp"
        >
          取 消
        </el-button>
        <el-button
          style="background-color: #ff9f00; border: solid #ff9f00 1px"
          size="medium"
          type="primary"
          @click="sendWeApp(weApp2Send)"
        >
          发 送
        </el-button>
      </span>
    </el-dialog>

    <!-- 发链接弹框 -->
    <el-dialog append-to-body class="we-app" title="发链接" :visible.sync="linkDialog">
      <div
        v-for="(link, index) in linkList"
        :key="index"
        class="we-app-item"
        :class="{ 'we-app-item-checked': link2Send.Url === link.Url }"
        :title="link.Title"
        @click="link2Send = link"
      >
        <img class="we-app-img" :src="link.Thumb" alt="" />
        <p class="we-app-name ellipsis" v-text="link.Title"></p>
        <i class="el-icon-delete" @click="deleteLink(link.id)"></i>
      </div>

      <span slot="footer">
        <el-button
          style="background-color: #fff; border: solid #eeeeee 1px; color: #999999"
          size="medium"
          @click="resetLink"
        >
          取 消
        </el-button>
        <el-button
          style="background-color: #ff9f00; border: solid #ff9f00 1px"
          size="medium"
          type="primary"
          @click="sendLink(link2Send)"
        >
          发 送
        </el-button>
      </span>
    </el-dialog>

    <!-- 发emoji弹框 -->
    <el-dialog append-to-body class="we-app" title="发Emoji" :visible.sync="emojiDialog">
      <div
        v-for="(emoji, index) in emojiList"
        :key="index"
        class="we-app-item"
        :class="{ 'we-app-item-checked': emoji2Send.cdnUrl === emoji.cdnUrl }"
        @click="emoji2Send = emoji"
      >
        <img class="we-app-img-emoji" :src="emoji.cdnUrl" alt="" />
        <!-- <p class="ellipsis" v-text="emoji.Title"></p> -->
        <i class="el-icon-delete" @click="deleteEmoji(emoji.id)"></i>
      </div>

      <span slot="footer">
        <el-button
          style="background-color: #fff; border: solid #eeeeee 1px; color: #999999"
          size="medium"
          @click="resetEmoji"
        >
          取 消
        </el-button>
        <el-button
          style="background-color: #ff9f00; border: solid #ff9f00 1px"
          size="medium"
          type="primary"
          @click="sendEmoji(emoji2Send)"
        >
          发 送
        </el-button>
      </span>
    </el-dialog>

    <!-- 转账弹框 -->
    <!-- <el-dialog
      class="transfer-money"
      :title="dialogTilte"
      :visible.sync="transferMoneyDialog"
      :before-close="resetRemittanceForm"
    >
      <el-form ref="transferMoney" :model="remittanceForm" :rules="rules" label-width="80px">
        <el-form-item label="转账金额" prop="money">
          <el-input v-model="remittanceForm.money" clearable></el-input>
        </el-form-item>
        <el-form-item label="转账说明" prop="memo">
          <el-input
            v-model="remittanceForm.memo"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 4 }"
            maxlength="50"
            placeholder="请输入内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="remittanceForm.password" type="password" autocomplete="off" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <span class="show-money">￥{{ remittanceForm.money }}分</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="remittanceTask()">转账</el-button>
        </el-form-item>
      </el-form>
    </el-dialog> -->

    <!-- 公众号弹框 -->
    <!-- <el-dialog class="gh-dialog" :title="dialogTilte" :visible.sync="ghDialog">
      <el-table :data="ghList" height="100%">
        <el-table-column label="Icon" width="100" align="center">
          <template slot-scope="scope">
            <el-avatar shape="square" :size="80" fit="cover" :src="scope.row.Icon"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="Alias" label="Alias" width="120" align="center"></el-table-column>
        <el-table-column prop="Nickname" label="Nickname"></el-table-column>
        <el-table-column prop="Username" label="Username"></el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="medium" icon="el-icon-position" @click.native.prevent="seeGH(scope.row)">
              查看消息
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog> -->

    <el-dialog
      append-to-body
      class="material-modal"
      title="选择素材"
      :visible="materialModal.visible"
      @close="materialModalClose"
      width="650px"
    >
      <div class="material-modal-body">
        <div class="material-modal-left">
          <el-radio-group v-model="materialModal.group" @change="materialGroupChange">
            <el-radio-button
              :label="item.groupId"
              v-for="(item, i) in materialModal.groups"
              :key="i"
              :title="item.groupTitle"
            >
              {{ item.groupTitle }}
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="material-modal-right">
          <el-radio-group v-model="materialModal.currentMaterial">
            <div class="material-modal-items">
              <div class="material-modal-item" v-for="(item, i) in materialModal.materials" :key="i">
                <div class="material-modal-item-top">
                  <div class="material-modal-item-text" v-if="materialModal.group === 1">
                    {{ item.content }}
                  </div>
                  <el-avatar
                    v-if="materialModal.group === 2"
                    :src="item.url"
                    shape="square"
                    :size="100"
                    fit="cover"
                  ></el-avatar>
                  <el-avatar
                    v-if="materialModal.group === 6"
                    :src="item.coverUrl"
                    shape="square"
                    :size="100"
                    fit="cover"
                    :title="item.content"
                  ></el-avatar>
                  <div class="material-modal-item-unit" v-if="[3, 4].includes(materialModal.group)">
                    <i v-if="materialModal.group === 3" class="el-icon-microphone"></i>
                    <i v-if="materialModal.group === 4" class="el-icon-video-play"></i>
                  </div>
                  <el-radio :label="item.id">&nbsp;</el-radio>
                </div>
                <div class="material-modal-item-bottom" :title="item.title">{{ item.title }}</div>
              </div>
            </div>
          </el-radio-group>
        </div>
      </div>

      <span slot="footer">
        <el-button type="primary" @click="materialModalConfirm">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import bus from '@/utils/bus'
import { fileUpload } from '@/utils/upload'
import { expressionMap, emojiMap } from '@/utils/qqFaceMap'
import {
  resourcesList,
  deleteResources,
  materialGroupGet,
  allMaterialGet,
  handleInternalApi,
  getSupportListApi,
  supportApi,
  supportPostApi
} from '@/api/httpApi'
import { TalkToFriendTask } from '@/api/webSocketApi'

import SlotFriends from '@/components/slot/SlotFriends'

import FriendCircle from './Circle.vue'

export default {
  components: {
    SlotFriends,
    FriendCircle
  },
  data() {
    const checkMoney = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('金额不能为空'))
      }
      value = Number(value)
      if (!Number.isInteger(value)) {
        callback(new Error('请输入数字值'))
      } else {
        if (value < 0) {
          callback(new Error('必须大于0'))
        } else if (value > 20000) {
          callback(new Error('必须小于20000'))
        } else if (parseInt(value / this.redForm.number, 10) < 1) {
          // 单个红包金额不可低于0.01
          callback(new Error('单个红包金额不可低于0.01元！'))
        } else {
          callback()
        }
      }
    }
    const checkNumber = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('数量不能为空'))
      }
      value = Number(value)
      if (!Number.isInteger(value)) {
        callback(new Error('请输入数字值'))
      } else {
        if (value < 0) {
          callback(new Error('必须大于0'))
        } else if (value > 20000) {
          callback(new Error('必须小于100'))
        } else if (parseInt(this.redForm.money / value, 10) < 1) {
          // 单个红包金额不可低于0.01
          callback(new Error('单个红包金额不可低于0.01元！'))
        } else {
          callback()
        }
      }
    }
    return {
      redEnvelopeDialog: false, // 显示发红包dialog
      redForm: {
        money: 1, // 红包金额
        number: 1, // 红包数量
        blessings: '', // 红包祝福语
        password: '' // 红包密码
      }, // 红包表单
      redRules: {
        money: [
          { required: true, message: '请输入红包金额1-20000分', trigger: 'blur' },
          { validator: checkMoney, trigger: 'blur' }
        ],
        number: [
          { required: true, message: '请输入红包个数', trigger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ],
        blessings: [{ required: true, message: '请输入祝福语', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 6, message: '密码长度不对', trigger: 'blur' }
        ]
      }, // 发红包校验规则
      wechatAppDialog: false, // 展示发小程序弹框
      weAppList: [], // 小程序demo
      weApp2Send: {}, // 要发送的app
      linkDialog: false, // 展示发链接的dialog
      linkList: [], // 链接demo
      link2Send: {}, // 要发的link
      emojiDialog: false, // 展示emoji的dialog
      emojiList: [], // emoji列表
      emoji2Send: {}, // 要发的emoji
      qrCodeDialog: false, // 显示微信二维码窗口
      chatRoomQrCodeDialog: false, // 显示微信二维码窗口

      ghDialog: false, // 展示公众号dialog
      transferMoneyDialog: false, // 展示转账dialog

      action: 0,
      dialogTilte: '添加群成员',
      dialogData: [],
      friendsDialogVisible: false,

      // 转账
      remittanceForm: {
        money: 1, // 转账金额
        password: '', // 转账密码
        memo: '' // 转账说明
      },
      materialModal: {
        visible: false,
        group: undefined,
        groups: [
          {
            groupTitle: '文本',
            groupId: 1,
            contentTypeEnum: 1
          },
          {
            groupTitle: '图片',
            groupId: 2,
            contentTypeEnum: 2
          },
          {
            groupTitle: '音频',
            groupId: 3,
            contentTypeEnum: 3
          },
          {
            groupTitle: '视频',
            groupId: 4,
            contentTypeEnum: 4
          },
          {
            groupTitle: '卡片',
            groupId: 6,
            contentTypeEnum: 6
          }
        ],
        materials: [],
        currentMaterial: undefined
      },

      internalChecked: false,

      supportList: []
    }
  },
  computed: {
    ...mapState({
      currentMode: 'currentMode' // web还是pc
    }),
    ...mapState('nedb', {
      friends: 'friends', // 好友列表
      conversationQrCode: 'conversationQrCode', // 微信的二维码
      chatRoomQrCode: 'chatRoomQrCode' // 群的二维码
    }),
    ...mapGetters({
      currentUser: 'currentUser', // 当前账号信息
      // ghMap: 'conversation/ghMap', // 公众号
      content: 'conversation/content', // 消息内容
      contentType: 'conversation/contentType', // 消息类型
      currentWechat: 'conversation/currentWechat', // 当前微信
      currentWeChatId: 'conversation/currentWeChatId', // 当前wx的id
      currentFriend: 'conversation/currentFriend', // 当前好友
      currentFriendId: 'conversation/currentFriendId' // 当前好友
    }),
    // qq表情
    qqFaceMap() {
      return expressionMap || {}
    },
    // 个人二维码
    currentQrCode() {
      return this.qrcodes[this.currentWechats.WeChatId] ? this.qrcodes[this.currentWechats.WeChatId] : false
    },
    // 群二维码
    currentChatRoomQrCode() {
      return this.chatRoomQrCodes[this.currentFriendId] ? this.chatRoomQrCodes[this.currentFriendId] : false
    }
    // 当前微信的公众号列表
    // ghList() {
    //   return this.ghMap[this.currentWeChatId] ? this.ghMap[this.currentWeChatId] : []
    // }
  },
  watch: {
    currentWeChatId(newVal, val) {
      this.internalChecked = this.currentFriend.PrivateMsgEnable
      // this.getSupportList()
    },
    currentFriendId(newVal, val) {
      this.internalChecked = this.currentFriend.PrivateMsgEnable
    }
  },
  created() {},
  mounted() {
    const that = this
    document.body.onpaste = function (event) {
      const data = event.clipboardData || window.clipboardData
      const items = data.items
      //   let fileList = []; //存储文件数据
      if (items && items.length) {
        // 检索剪切板items
        // for (let i = 0; i < items.length; i++) {
        //   fileList.push(items[i].getAsFile());
        // }
        const blob = items[0].getAsFile()
        if (blob) {
          // 上传到后台
          const fd = new FormData()
          fd.append('myfile', blob, 'image.png')
          //   fd.append("myfile", blob);
          //   that.$store.dispatch('UploadFile', fd)
          fileUpload(fd)
            .then((res) => {
              that.$store.commit('conversation/SET_CONTENT', res.data.url)
              that.$store.commit('conversation/SET_CONTENT_TYPE', 'Picture')
            })
            .catch(() => {})
        }
      }
    }
  },
  methods: {
    // 选择表情
    selectExpression(val) {
      if (this.contentType !== 'Text') {
        this.$store.commit('conversation/SET_CONTENT', '')
      }
      let rm = expressionMap[val]
      const qqList = [113, 114, 115, 116, 117, 118, 124, 125]

      // qq表情
      if (rm) {
        if (val < 105 || qqList.indexOf(val) >= 0) {
          rm = '[' + expressionMap[val] + ']'
        } else {
          rm = '<' + rm + '>'
          rm = emojiMap[rm]
          // let en = '😁'
          // let encode = en.codePointAt(0)
          const rmencode = parseInt(rm, 16)
          rm = String.fromCodePoint(rmencode)
        }

        const newContent = this.content + rm
        const textarea = document.querySelector('#textarea')
        const textNode = document.createTextNode(rm)
        //console.log('选择表情 selectExpression', newContent)

        this.$store.commit('conversation/SET_CONTENT_TYPE', 'Text')
        this.$store.commit('conversation/SET_CONTENT', newContent)
        textarea.appendChild(textNode)
      }
      //   else {
      //     this.$message.warning('无效选择')
      //   }
    },
    // 选择图片|视频|语音|文件
    choseMedia(type) {
      const formdata = new FormData() // 上传
      let fileObj = '' // 文件对象
      let computedType = '' // 文件的type
      if (type === 'Voice') {
        // 发送语音
        fileObj = this.$refs.toolsVoice.files
      } else {
        // 发送图片|视频|文件
        fileObj = this.$refs.toolsFile.files
      }
      // 如果有选中文件
      if (fileObj[0]) {
        // 文件大小
        const fileSize = fileObj[0].size
        const fileName = fileObj[0].name
        // 文件后缀
        const fileType = fileObj[0].name.replace(/.+\./, '').toLowerCase()
        // 文件大于100M不能发送
        if (fileSize > 104857600 || fileSize <= 0) {
          this.$message.warning('文件不能大于100M，文件不能是空文件')
          return
        }
        // 计算要发送的消息类型
        if (type === 'Voice') {
          computedType = 'Voice'
          // 验证文件类型
          if (['amr', 'mp3'].indexOf(fileType) < 0) {
            this.$message.warning('发送语音只能选择MP3或AMR文件')
            return
          }
        } else {
          if (fileType === 'mp4') {
            computedType = 'Video'
          } else if (['jpg', 'png', 'gif', 'jpeg'].indexOf(fileType) >= 0) {
            computedType = 'Picture'
          } else {
            computedType = 'File'
          }
        }
        // 验证通过
        formdata.append('myfile', fileObj[0])
        const loading = this.$loading({
          lock: true,
          text: '文件上传中',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        // 如果是发送语音
        if (type === 'Voice') {
          // 如果选择的是mp3文件，文件上传到服务器，转为amr，返回amr的地址
          // 如果选择的是amr文件，直接上传到服务器，返回amr的地址
          if (fileType === 'mp3') {
            formdata.append('isMp3ToAmr', true)
          } else if (fileType === 'amr') {
            formdata.append('isAmrToMp3', false)
          }
          // 上传mp3 或者amr转为MP3
          const formDataMp3 = new FormData()
          formDataMp3.append('myfile', fileObj[0])
          if (fileType === 'mp3') {
            formDataMp3.append('isMp3ToAmr', false)
          } else if (fileType === 'amr') {
            formDataMp3.append('isAmrToMp3', true)
          }
          fileUpload(formDataMp3)
        }
        fileUpload(formdata)
          .then((res) => {
            let content = res.data.url
            if (computedType === 'File') {
              content = JSON.stringify({ name: fileName, url: res.data.url, size: fileSize, Source: 'pc' })
            }
            // 计算时长
            //   if (type === 'Voice') {
            //     let audioElement = new Audio(url)
            //     audioElement.addEventListener('loadedmetadata', function (_event) {
            //       duration = audioElement.duration
            //     })
            //   }
            this.$store.commit('conversation/SET_CONTENT', content)
            this.$store.commit('conversation/SET_CONTENT_TYPE', computedType)
            loading.close()
            type === 'Voice' ? (this.$refs.toolsVoice.value = '') : (this.$refs.toolsFile.value = '')
          })
          .catch(() => {
            this.$message({
              message: '文件上传失败!',
              type: 'error',
              duration: 1000
            })
            loading.close()
          })
      }
    },
    // 发红包
    sendLuckyMoneyTask() {
      if (!this.currentWeChatId) {
        this.$message.warning('请先选中微信！')
        return
      }
      this.$refs['redEnvelope'].validate((valid) => {
        if (valid) {
          this.$confirm('即将发送红包?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              const content = {
                WeChatId: this.currentWeChatId, // 微信唯一Id
                FriendId: this.currentFriendId, // 聊天好友微信唯一id
                Money: this.redForm.money, // 钱数，单位：分，最多20000
                Number: 1, // 红包个数，缺省1个
                Passwd: this.redForm.password, // 密码，6位，纯数字
                Wish: this.redForm.blessings // 祝福语
              }
              this.$store.dispatch('websocket/SendLuckyMoneyTask', content)
              this.$message.success('任务已经下发！')
              this.redEnvelopeDialog = false
              this.$refs['redEnvelope'].resetFields()
            })
            .catch(() => {})
        } else {
          return false
        }
      })
    },
    // 关闭时清空redForm
    resetRedForm(done) {
      this.$refs['redEnvelope'].resetFields()
      done()
    },
    // 展示小程序
    showWeApp() {
      this.wechatAppDialog = true
      resourcesList(this.currentUser.SupplierId, 1, 100, 4).then((res) => {
        if (res.code === 0 && res.data.rows) {
          const jc = []
          res.data.rows.forEach((x) => {
            const nl = JSON.parse(x.content)
            const nc = JSON.parse(nl.content)
            nc.id = x.id
            nc.restype = nl.restype
            jc.push(nc)
          })
          this.weAppList = jc
        } else {
          this.weAppList = []
        }
      })
    },
    // 选择小程序
    choseWeApp(weApp) {
      // console.log(weApp)
      this.weApp2Send = weApp
    },
    // 发小程序
    sendWeApp(app2Send) {
      if (!this.weApp2Send.AppId) {
        this.$alert('请先选中一个小程序！', '提示', { type: 'warning' })
      } else {
        TalkToFriendTask(this.currentWeChatId, this.currentFriendId, 'WeApp', JSON.stringify(app2Send))
        this.$message.success('任务已经下发！')
        this.resetWeApp()
      }
    },
    // 重置小程序
    resetWeApp() {
      this.weApp2Send = {}
      this.wechatAppDialog = false
    },
    // 删除收藏的app
    deleteWeApp(weAppId) {
      if (weAppId) {
        deleteResources(weAppId).then((res) => {
          if (res.code === 0) {
            this.weAppList = this.weAppList.filter((x) => {
              return x.id !== weAppId
            })
          }
        })
      }
    },
    // 删除收藏的链接
    deleteLink(linkId) {
      if (linkId) {
        deleteResources(linkId).then((res) => {
          if (res.code === 0) {
            this.linkList = this.linkList.filter((x) => {
              return x.id !== linkId
            })
          }
        })
      }
    },
    // 删除收藏的app
    deleteEmoji(emojiId) {
      if (emojiId) {
        deleteResources(emojiId).then((res) => {
          if (res.code === 0) {
            this.emojiList = this.emojiList.filter((x) => {
              return x.id !== emojiId
            })
          }
        })
      }
    },
    // 展示link
    showLink() {
      this.linkDialog = true
      resourcesList(this.currentUser.SupplierId, 1, 100, 3).then((res) => {
        if (res.code === 0 && res.data.rows) {
          const jc = []
          res.data.rows.forEach((x) => {
            const nl = JSON.parse(x.content)
            const nc = JSON.parse(nl.content)
            nc.id = x.id
            nc.restype = nl.restype
            jc.push(nc)
          })
          this.linkList = jc
        } else {
          this.linkList = []
        }
      })
    },
    // 重置链接
    resetLink() {
      this.link2Send = {}
      this.linkDialog = false
    },
    // 发链接
    sendLink(link) {
      if (!this.link2Send.Url) {
        this.$alert('请先选中一个链接页面！', '提示', { type: 'warning' })
      } else {
        TalkToFriendTask(this.currentWeChatId, this.currentFriendId, 'Link', JSON.stringify(link))
        this.$message.success('任务已经下发！')
        this.resetLink()
      }
    },
    // 展示emoji
    showEmoji() {
      this.emojiDialog = true
      resourcesList(this.currentUser.SupplierId, 1, 100, 5).then((res) => {
        if (res.code === 0 && res.data.rows) {
          const jc = []
          res.data.rows.forEach((x) => {
            const nl = JSON.parse(x.content)
            const nc = nl.content
            nc.id = x.id
            nc.restype = nl.restype
            jc.push(nc)
          })
          this.emojiList = jc
        } else {
          this.emojiList = []
        }
      })
    },
    // 重置emoji
    resetEmoji() {
      this.emoji2Send = {}
      this.emojiDialog = false
    },
    // 发emoji
    sendEmoji(emoji) {
      TalkToFriendTask(this.currentWeChatId, this.currentFriendId, 'Emoji', JSON.stringify(emoji))
      this.$message.success('任务已经下发！')
      this.resetEmoji()
    },
    // 显示微信的二维码
    showQrCode() {
      if (!this.currentWeChatId) {
        this.$message.warning('请先选中微信！')
        return
      }
      // 从数据库查询qrcode
      if (this.conversationQrCode.WeChatId !== this.currentWeChatId) {
        this.$store.dispatch('nedb/SetConversationQrCode', this.currentWeChatId)
      }
      this.dialogTilte = '微信二维码'
      this.qrCodeDialog = true
    },
    // 获取个人号二维码
    pullWeChatQrCodeTask() {
      this.$store.dispatch('websocket/PullWeChatQrCodeTask', this.currentWeChatId)
      this.$message.info('正在获取，请稍等')
    },
    // 发送二维码
    sendQrCode() {
      this.$store.commit('conversation/SET_CONTENT_TYPE', 'Picture')
      this.$store.commit('conversation/SET_CONTENT', this.conversationQrCode.QrCodeUrl)
    },
    // 发送群聊二维码
    sendQrCodeRoom() {
      this.$store.commit('conversation/SET_CONTENT_TYPE', 'Picture')
      this.$store.commit('conversation/SET_CONTENT', this.chatRoomQrCode.QrCodeUrl)
    },
    // 显示群聊的二维码
    showChatRoomQrCode() {
      if (!this.currentWeChatId) {
        this.$message.warning('请先选中微信！')
        return
      }
      if (!this.chatRoomQrCode.ChatRoomId || this.chatRoomQrCode.ChatRoomId !== this.currentFriendId) {
        // 从数据库查询chatRoomQrCode'
        this.$store.dispatch('nedb/SetChatRoomQrCode', this.currentFriend)
      }
      this.dialogTilte = '群聊二维码'
      setTimeout(() => {
        this.chatRoomQrCodeDialog = true
      }, 100)
    },
    // 获取群聊二维码
    pullChatRoomQrCodeTask() {
      this.$store.dispatch('websocket/PullChatRoomQrCodeTask', this.currentFriend)
      this.$message.info('正在获取，请稍等')
    },
    // 切换右边栏页面
    changeAsideRightPage(page) {
      if (!this.currentFriendId) {
        this.$alert('请先选中一个好友!', '提示', { type: 'warning' })
        return
      }
      if (page === 'FriendCircle') {
        if (this.currentFriendId.indexOf('chatroom') > 0) {
          this.$alert('群没有朋友圈!', '提示', { type: 'warning' })
        } else {
          this.$refs.circleRef.circleModal.visible = true
        }
      }
    },
    // 显示发名片窗口
    showSendNameCard() {
      if (!this.currentWeChatId) {
        this.$message.warning('请先选中微信！')
        return
      }
      this.dialogTilte = '发送名片'
      this.action = 'NameCard'
      this.dialogData = this.friends
      this.friendsDialogVisible = true
    },
    // 创建群聊
    createChatRoom() {
      if (!this.currentWeChatId) {
        this.$message.warning('请先选中微信！')
        return
      }
      this.dialogTilte = '创建群聊'
      this.action = 8
      this.dialogData = this.friends
      this.friendsDialogVisible = true
    },
    // 截图
    shearScreen() {
      // web不支持截图
      if (this.currentMode === 'web') {
        this.$alert('网页版不支持截图功能！', '提示', { type: 'warning' })
        return
      }
      if (this.currentMode === 'electron') {
        // 和主进程通讯
        this.$ipcRenderer.send('operations', 'screencap')
        // 监听主进程
        this.$ipcRenderer.on('screencap', (event, arg) => {
          if (arg) {
            document.execCommand('paste')
          }
        })
      }
    },
    // =========================================================================
    // // 历史消息
    // showMsgHistory() {
    //   this.$message.info('待完成，敬请期待！')
    //   if (!this.currentWeChatId) {
    //     this.$message.warning('请先选择一个微信！')
    //     return
    //   }
    //   this.dialogTilte = '创建群聊'
    //   this.action = 8
    //   this.dialogData = this.friends
    //   this.friendsDialogVisible = true
    // },
    // // 显示转账的dialog
    // showTransferMoneyDialog() {
    //   this.transferMoneyDialog = true
    //   this.dialogTilte = '转账'
    // },
    // // 关闭时清空remittanceForm
    // resetRemittanceForm(done) {
    //   this.$refs['transferMoney'].resetFields()
    //   done()
    // },
    // // 转账
    // remittanceTask() {
    //   if (!this.currentWeChatId) {
    //     this.$message.warning('请选选中微信！')
    //     return
    //   }
    //   this.$refs['transferMoney'].validate((valid) => {
    //     if (valid) {
    //       this.$confirm('确认转账?', '提示', {
    //         confirmButtonText: '确定',
    //         cancelButtonText: '取消',
    //         type: 'warning'
    //       })
    //         .then(() => {
    //           const content = {
    //             WeChatId: this.currentWeChatId, // 微信唯一Id
    //             FriendId: this.currentFriendId, // 聊天好友微信唯一id
    //             Money: this.remittanceForm.money, // 钱数，单位：分
    //             Passwd: this.remittanceForm.password, // 密码，6位，纯数字
    //             Memo: this.remittanceForm.memo // 留言
    //           }
    //           this.$store.dispatch('websocket/RemittanceTask', content)
    //           this.$message.success('任务已经下发！')
    //           this.transferMoneyDialog = false
    //           this.$refs['transferMoney'].resetFields()
    //         })
    //         .catch(() => {})
    //     } else {
    //       return false
    //     }
    //   })
    // }
    // // 显示并获取公众号
    // showGH() {
    //   this.$store.dispatch('websocket/TriggerBizContactPushTask')
    //   this.ghDialog = true
    //   this.dialogTilte = '公众号列表'
    // },
    // // 查看公众号
    // seeGH(row) {
    //   const friend = {}
    //   for (const key in row) {
    //     if (row.hasOwnProperty(key)) {
    //       friend[key] = row[key]
    //     }
    //   }
    //   if (!row.Avatar) {
    //     friend.Avatar = row.Icon
    //   }
    //   friend.WeChatId = this.currentWeChatId
    //   friend.NickName = row.Nickname
    //   friend.FriendId = row.Username
    //   friend.isGh = true
    //   const currentFriend = {
    //     wechatId: this.currentWeChatId,
    //     friend: friend
    //   }
    //   this.$store.commit('conversation/SET_CURRENT_FRIENDS', currentFriend)
    //   this.ghDialog = false
    // },
    //选择素材
    selectMaterial(type) {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      this.materialModal.type = type
      this.materialModal.visible = true
      this.materialModal.group = this.materialModal.groups.length ? this.materialModal.groups[0].groupId : undefined
      this.getAllMaterial({
        entity: { kfAccount: loginInfo.name, contentTypeEnum: this.materialModal.group },
        current: 1,
        size: 10
      })
    },
    getAllMaterial(params) {
      allMaterialGet(params)
        .then((res) => {
          if (res.code === 0) {
            this.materialModal.materials = res.data.records || []
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    materialModalClose() {
      this.materialModal.visible = false
    },
    materialGroupChange() {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      this.materialModal.currentMaterial = undefined
      this.materialModal.materials = []
      this.getAllMaterial({
        entity: { kfAccount: loginInfo.name, contentTypeEnum: this.materialModal.group },
        current: 1,
        size: 10
      })
    },
    materialModalConfirm() {
      const textarea = document.querySelector('#textarea')
      const material = this.materialModal.materials.find((item) => item.id === this.materialModal.currentMaterial)
      this.materialModal.visible = false
      console.log(material)
      if ([1, 2, 3, 4].includes(this.materialModal.group)) {
        this.$store.commit(
          'conversation/SET_CONTENT',
          [2, 3, 4].includes(this.materialModal.group) ? material.url : material.content
        )
        this.$store.commit(
          'conversation/SET_CONTENT_TYPE',
          { 1: 'Text', 2: 'Picture', 4: 'Video', 3: 'Voice' }[this.materialModal.group]
        )
        textarea.innerText = [2, 3, 4].includes(this.materialModal.group) ? material.url : material.content
      } else if (this.materialModal.group === 6) {
        TalkToFriendTask(
          this.currentWeChatId,
          this.currentFriendId,
          'Link',
          JSON.stringify({
            Title: material.title,
            Des: material.content,
            Thumb: material.coverUrl,
            Url: material.clickUrl,
            TypeStr: '[链接]'
          })
        )
      }
    },

    //内部
    async internalChange(checked, currentWeChatId = this.currentWeChatId, currentFriendId = this.currentFriendId) {
      //console.log(this.currentFriend)
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      // const { code, data, msg } = await handleInternalApi({
      //   account: loginInfo.name,
      //   wxId: currentWeChatId,
      //   chatRoomId: currentFriendId.endsWith('@chatroom') ? currentFriendId : undefined,
      //   friendId: currentFriendId.endsWith('@chatroom') ? undefined : currentFriendId,
      //   open: checked,
      //   privateMsgId: this.currentFriend.PrivateMsgId
      // })
      // if (code === 0) {
      //   this.$store.commit('conversation/UPDATE_SINGLE_CONVERSATION', {
      //     ...this.currentFriend,
      //     PrivateMsgEnable: checked,
      //     PrivateMsgId: checked ? data : data.PrivateMsgId
      //   })

      //   this.$store.commit('conversation/SET_CURRENT_FRIENDS', {
      //     ...this.currentFriend,
      //     PrivateMsgEnable: checked,
      //     PrivateMsgId: checked ? data : data.PrivateMsgId
      //   })
      // } else {
      //   this.$message.error(msg)
      // }
    },
    // async getSupportList() {
    //   const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
    //   const { code, data } = await getSupportListApi({
    //     account: loginInfo.name,
    //     wxId: this.currentWeChatId,
    //     supportId: this.currentFriendId
    //   })
    //   if (code === 0) {
    //     this.supportList = data || []
    //   }
    // },
    async support(item) {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      const { code, data } = await supportPostApi({
        wechatId: this.currentWeChatId,
        supportAccount: item.account,
        account: loginInfo.name,
        chatRoomId: this.currentFriendId.endsWith('@chatroom') ? this.currentFriendId : undefined,
        friendId: this.currentFriendId.endsWith('@chatroom') ? undefined : this.currentFriendId
      })
      if (code === 0) {
        this.$message.success('发送成功')
      } else {
        this.$message.error('发送失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tool-bar {
  height: 40px;
  min-height: 40px;
  width: 100%;
  position: relative;
  display: flex;
  justify-content: space-between;
  border-top: solid #ededed 1px;
  //background-color: #f3f3f3;
  background-color: #f9f9f9;
  .tool-start {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    .tool-icon {
      cursor: pointer;
      font-size: 24px;
      margin-left: 10px;
      // justify-self: start;
      display: flex;
      align-items: center;
      justify-content: center;
      .label {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  :deep(.tool-end) {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-right: 5px;
    .el-divider--vertical {
      margin-top: 2px;
    }
    .el-checkbox__input.is-checked .el-checkbox__inner,
    .el-checkbox__input.is-indeterminate .el-checkbox__inner {
      background-color: #0cc160;
      border-color: #0cc160;
    }
    .el-checkbox__input.is-focus .el-checkbox__inner {
      border-color: #0cc160;
    }
    .el-checkbox__inner {
      &:hover {
        border-color: #0cc160;
      }
    }
    .el-checkbox__input.is-checked + .el-checkbox__label {
      color: rgba(0, 0, 0, 0.65);
    }
    .tool-icon {
      cursor: pointer;
      font-size: 24px;
      margin-right: 10px;
      align-items: center;
      justify-content: center;
    }
  }

  ::v-deep .gh-dialog {
    height: 100%;
    overflow: hidden;
    .el-dialog {
      height: 70%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      .el-dialog__body {
        flex: 1 1 auto;
        padding: 0;
        overflow: hidden;
        height: 100%;
      }
    }
  }
}
</style>
