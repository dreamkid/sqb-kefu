<template>
  <div id="show-chat" class="show-chats scroll" @wheel="wheel">
    <div v-if="currentChats.length >= recordTotal && recordTotal > 10" class="no-more">没有更多了</div>
    <div class="more-message" :class="{ 'more-message-text': !recordLoading }"
      v-if="currentChats.length < recordTotal && recordTotal > 10 && currentChats.length" @click="newPage">
      <i class="el-icon-loading" v-if="recordLoading"></i>
      <span v-else>查看更多消息</span>
    </div>

    <!-- 有消息 -->
    <div v-for="(chat, index) in chatsFilter" :key="index" class="chat-item">
      <!-- 时间 -->
      <div class="chat-time" v-if="showTime(chat.CreateTime, chatsFilter[index - 1] && chatsFilter[index - 1].CreateTime)"
        v-text="$options.filters.timeFilter(chat.CreateTime)"></div>

      <!-- 内容 -->
      <div class="chat-content" :class="{ 'chat-content-send': chat.IsSend ? true : false }" :style="{
          'padding-top': !['RoomSystem', 'System', 'SystemPrivateMsg'].includes(chat.ContentType) ? '30px' : 0
        }">
        <!-- 头像 -->
        <el-popover v-model="popoverVisible[chat.MsgSvrId]" trigger="manual" placement="right" width="305">
          <el-avatar slot="reference" v-if="notShow.indexOf(chat.ContentType) === -1" shape="square" :size="40"
            :src="getAvatar(chat)" title="头像" @click.native.stop="showMemberDetail($event, chat)">
            <i class="fa fa-picture-o" aria-hidden="true" title="头像miss"></i>
          </el-avatar>

          <div class="avatar-popover">
            <div class="avatar-popover-top">
              <el-avatar style="flex-shrink: 0" shape="square" :size="58" :src="memberDetail.Avatar"></el-avatar>
              <div style="width: 215px">
                <div class="avatar-popover-top-head">
                  <div class="avatar-popover-top-head-left ellipsis">{{ memberDetail.FullName }}</div>
                  <el-popover popper-class="more-popover" style="position: absolute; right: 0" placement="bottom-start"
                    trigger="hover">
                    <i slot="reference" class="el-icon-more" style="cursor: pointer"></i>
                    <div>
                      <el-menu style="border-right: none">
                        <el-menu-item index="1">
                          <span slot="title">转让群主</span>
                        </el-menu-item>

                        <el-menu-item index="2">
                          <span slot="title">升为群管理</span>
                        </el-menu-item>
                        <el-menu-item index="3">
                          <span slot="title">踢出群聊</span>
                        </el-menu-item>
                      </el-menu>
                    </div>
                  </el-popover>
                </div>
                <div class="avatar-popover-top-item ellipsis">群昵称： {{ memberDetail.FriendNick || '-' }} <img class="ml-10"
                    style="width: 12px" src="@/assets/images/man.png" /></div>
                <div class="avatar-popover-top-item ellipsis" :title="memberDetail.FriendId">
                  微信号：{{ memberDetail.FriendId }}
                </div>
                <div class="avatar-popover-top-item ellipsis">地区：{{ memberDetail.Province || '-' }}</div>
              </div>
            </div>
            <el-divider></el-divider>
            <div class="avatar-popover-middle">
              <div class="avatar-popover-middle-item">
                <span class="avatar-popover-middle-item-left">备注名</span>
                <span>{{ memberDetail.Memo || '-' }}</span>
              </div>
              <div class="avatar-popover-middle-item">
                <span class="avatar-popover-middle-item-left">来源</span>
                <span>-</span>
              </div>
              <div class="avatar-popover-middle-item">
                <span class="avatar-popover-middle-item-left">入群方式</span>
                <span class="avatar-popover-middle-item-text">-</span>
                <span>邀请入群</span>
              </div>
            </div>

            <el-divider></el-divider>
            <div class="avatar-popover-bottom">
              <el-button v-if="memberDetail.IsFriend" @click="sendMessage(chat)">发消息</el-button>
              <el-button v-else @click="addFriend">添加通讯录</el-button>
              <el-button @click="atSomebody(chat)">@Ta</el-button>
              <!-- <el-button>加入黑名单</el-button>
              <el-button>加入白名单</el-button> -->
              <el-button :style="{
                  backgroundColor: memberDetail.FriendShieldGroupEnable ? '#0CC160' : '#FF5722',
                  borderColor: memberDetail.FriendShieldGroupEnable ? '#0CC160' : '#FF5722'
                }" @click="shieldAction(chat, memberDetail.FriendShieldGroupEnable, chat.FriendId)">
                {{ memberDetail.FriendShieldGroupEnable ? '解除屏蔽ta该群消息' : '屏蔽ta该群消息' }}
              </el-button>
              <el-button :style="{
                backgroundColor: memberDetail.FriendShieldAllGroupEnable ? '#0CC160' : '#FF5722',
                borderColor: memberDetail.FriendShieldAllGroupEnable ? '#0CC160' : '#FF5722'
              }" @click="shieldAction(chat, memberDetail.FriendShieldAllGroupEnable)">
                {{ memberDetail.FriendShieldAllGroupEnable ? '解除屏蔽ta所有群消息' : '屏蔽ta所有群消息' }}
              </el-button>
            </div>
          </div>
        </el-popover>
        <div v-if="chat.IsSend && !['RoomSystem', 'System', 'SystemPrivateMsg'].includes(chat.ContentType)"
          class="chat-nick-send ellipsis">
          {{ chat.SendBy === 1 ? '客服系统' : '其它' }} - {{ chat.FfNick }}
        </div>
        <!-- 群成员id -->
        <!-- <div
          v-if="currentFriendId.indexOf('chatroom') > 0 && !chat.IsSend && notShow.indexOf(chat.ContentType) === -1"
          class="member-info"
        >
          <span v-text="getMemberName(chat.Content)"></span>
          <el-button
            style="margin-left: 10px; color: #909399; padding: 5px"
            type="plant"
            size="mini"
            @click="atSomebody(chat)"
          >
            @Ta
          </el-button>
          <el-button
            v-if="currentFriend.Owner && currentFriend.Owner === currentWeChatId"
            style="margin-left: 10px; color: #909399; padding: 5px"
            type="plant"
            size="mini"
            :disabled="knicking"
            :loading="knicking"
            @click="knickSomeBody(chat)"
          >
            踢人
          </el-button>
        </div> -->

        <!-- content -->
        <div class="content-container" :class="{
          'content-message-container': ['RoomSystem', 'SystemPrivateMsg', 'System'].includes(chat.ContentType),
          'content-content-container': !['RoomSystem', 'SystemPrivateMsg', 'System'].includes(chat.ContentType)
        }" @mouseenter="contentMouseEnter($event, chat)" @mouseleave="contentMouseLeave($event, chat)">
          <div :style="{
              marginTop:
                currentFriendId.indexOf('chatroom') > 0 &&
                  !chat.IsSend &&
                  !['RoomSystem', 'SystemPrivateMsg', 'System'].includes(chat.ContentType)
                  ? '20px'
                  : 0
            }"
            class="content-content"
            :class="[
              {
                'triangle-send':
                  chat.IsSend && notShow.indexOf(chat.ContentType) === -1 && chat.FfNick !== currentUser.NickName
              },
              {
                'triangle-send-own':
                  chat.IsSend && notShow.indexOf(chat.ContentType) === -1 && chat.FfNick === currentUser.NickName
              },
              {
                triangle: notShow.indexOf(chat.ContentType) === -1 && !chat.IsSend
              },
              {
                'chat-room':
                  currentFriendId.indexOf('chatroom') > 0 && !chat.IsSend && notShow.indexOf(chat.ContentType) === -1
              },
              { 'system-info': notShow.indexOf(chat.ContentType) > -1 },
              { 'not-style': chat.ContentType === 'Picture' },
              {
                'content-interval':
                  chat.ContentType === 'SystemPrivateMsg' && JSON.parse(chat.Content).PrivateMsgEnable === 'false'
              }
            ]"
          >
            <div
              v-if="
                currentFriendId.indexOf('chatroom') > 0 &&
                !chat.IsSend &&
                !['RoomSystem', 'System', 'SystemPrivateMsg'].includes(chat.ContentType) &&
                currentFriend.ChatShowMemberNameEnable
              "
              class="chat-nick"
            >
              {{ chat.FriendNick }}
            </div>

            <!-- @contextmenu.prevent="rightEvent($event, chat)" -->
            <div class="chat-text" :class="[
              {
                'chat-picture': chat.ContentType === 'Picture' || chat.ContentType === 2
              },
              {
                'chat-voice': chat.ContentType === 'Voice' || chat.ContentType === 3
              },
              {
                'chat-video': chat.ContentType === 'Video' || chat.ContentType === 4
              },
              {
                'chat-link': chat.ContentType === 'Link' || chat.ContentType === 6
              },
              {
                'chat-file': chat.ContentType === 'File' || chat.ContentType === 8
              },
              {
                'chat-namecard':
                  chat.ContentType === 'MpNameCard' || chat.ContentType === 'NameCard' || chat.ContentType === 9
              },
              {
                'chat-luckmoney': chat.ContentType === 'LuckyMoney' || chat.ContentType === 11
              },
              {
                'chat-moneytran': chat.ContentType === 'MoneyTrans' || chat.ContentType === 12
              },
              {
                'chat-app': chat.ContentType === 'WeApp' || chat.ContentType === 13
              },
              { 'chat-system': notShow.indexOf(chat.ContentType) > -1 }
            ]" @click="whatToDo(chat)">
              <!-- <div
              class="chat-interval-see"
              v-if="chat.ContentType === 'SystemPrivateMsg' && JSON.parse(chat.Content).PrivateMsgEnable === 'false'"
            >
              <el-button @click.stop="showInterval(chat)">查看内部消息</el-button>
              <div class="chat-interval-see-message">
                <div class="chat-interval-see-message-info">查看内部消息</div>

                <el-avatar shape="square" :size="40" :src="currentWechat.Avatar"></el-avatar>
              </div>
            </div> -->
              <div v-if="!['Voice', 'LuckyMoney', 'NameCard', 'MpNameCard', 'File'].includes(chat.ContentType)"
                v-html="decodeChat(chat, index)"></div>
              <div v-if="chat.ContentType === 'Voice'">
                <div class="chat-audio">
                  <audio :id="`audio${chat.CreateTime}`" :src="getVoiceUrl(chat)"></audio>
                  <img v-if="chat.__audioState" class="chat-audio-icon" src="@/assets/images/voice_pause.png" alt=""
                    @click="audioPause(chat)" />
                  <img v-else class="chat-audio-icon" src="@/assets/images/voice_play.png" alt=""
                    @click="audioPlay(chat)" />
                  <div class="chat-audio-progress">
                    <div class="chat-audio-progress-item" v-for="(item, i) in audioProgress" :key="i"
                      @click="audioProgressChange(chat, item, i)">
                      <div class="chat-audio-progress-item-unit" :style="{
                          height: item.size * 6 + 'px',
                          'background-color': chat.IsSend
                            ? chat.__currentProgress >= i + 1
                              ? '#0CC160'
                              : '#fff'
                            : chat.__currentProgress >= i + 1
                              ? '#0CC160'
                              : '#D8D8D8'
                        }"></div>
                    </div>
                  </div>
                  <span class="chat-audio-time">
                    <span v-if="chat.__progress">
                      <span v-if="chat.__audioState">{{ chat.__progress }}</span>
                      <span v-else>{{ chat.__progress }}</span>
                    </span>
                    <i v-else class="el-icon-loading"></i>
                  </span>
                </div>
              </div>
              <div v-if="chat.ContentType === 'LuckyMoney'">
                <div class="chat-red-packet">
                  <div class="chat-red-packet-body">
                    <div>
                      <img src="@/assets/images/wallet.png" alt="" />
                    </div>
                    <div>请在手机上查看</div>
                  </div>
                  <div class="chat-red-packet-foot">微信红包</div>
                </div>
              </div>
              <div v-if="chat.ContentType === 'NameCard'">
                <div class="chat-name-card">
                  <div class="chat-name-card-body">
                    <div>
                      <img :src="getCurrentChatContent(chat).HeadImg" alt="" />
                    </div>
                    <div>{{ getCurrentChatContent(chat).Nickname }}</div>
                  </div>
                  <div class="chat-name-card-foot">
                    <span>个人名片</span>
                    <span class="chat-name-card-foot-des">[请在手机上查看]</span>
                  </div>
                </div>
              </div>
              <div v-if="chat.ContentType === 'MpNameCard'">
                <div class="chat-mp-name-card">
                  <div class="chat-mp-name-card-body">
                    <div>
                      <img :src="getCurrentChatContent(chat).HeadImg" alt="" />
                    </div>
                    <div>{{ getCurrentChatContent(chat).Nickname }}</div>
                  </div>
                  <div class="chat-mp-name-card-foot">
                    <span>公众号名片</span>
                    <span class="chat-mp-name-card-foot-des">[请在手机上查看]</span>
                  </div>
                </div>
              </div>

              <div v-if="chat.ContentType === 'File'">
                <div class="chat-file-item">
                  <div class="chat-file-item-left">
                    <div class="chat-file-item-left-top">
                      <span v-if="chat.Content.includes('.text')">
                        {{ chat.Content.slice(chat.Content.indexOf('name') + 7, chat.Content.indexOf('.text') + 5) }}
                      </span>
                      <span v-if="chat.Content.includes('.txt')">
                        {{ chat.Content.slice(chat.Content.indexOf('name') + 7, chat.Content.indexOf('.txt') + 4) }}
                      </span>

                      <span v-if="chat.Content.includes('.xlsx')">
                        {{ chat.Content.slice(chat.Content.indexOf('name') + 7, chat.Content.indexOf('.xlsx') + 5) }}
                      </span>
                      <span v-if="chat.Content.includes('.doc')">
                        {{ chat.Content.slice(chat.Content.indexOf('name') + 7, chat.Content.indexOf('.doc') + 4) }}
                      </span>
                      <span v-if="chat.Content.includes('.exe')">
                        {{ chat.Content.slice(chat.Content.indexOf('name') + 7, chat.Content.indexOf('.exe') + 4) }}
                      </span>
                    </div>
                    <div class="chat-file-item-left-bottom">[请在手机上查看]</div>
                  </div>
                  <div class="chat-file-item-right">
                    <img v-if="chat.Content.includes('.txt')" src="@/assets/images/txt.png" alt="" />
                    <img v-else-if="chat.Content.includes('.xlsx')" src="@/assets/images/xlsx.png" alt="" />
                    <img v-else-if="chat.Content.includes('.doc')" src="@/assets/images/doc.png" alt="" />
                    <i v-else class="el-icon-document"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="!['RoomSystem', 'System', 'SystemPrivateMsg'].includes(chat.ContentType) &&
            currentContentItem.MsgId === chat.MsgId
            ">
            <el-button style="margin-left: 10px; color: #909399; padding: 5px" v-if="chat.IsRevoke !== 1 &&
              chat.IsSend &&
              chat.MsgSvrId &&
              revokeMap.indexOf(chat.ContentType) >= 0 &&
              dayjs().diff(dayjs(Number(chat.CreateTime)), 'second') < 118
              " size="mini" @click="revokeMessageTask(chat)">
              撤回
            </el-button>
          </div>
        </div>

        <!-- 功能按钮 -->
        <div class="send-state" :class="{
            'chat-room':
              currentFriendId.indexOf('chatroom') > 0 && !chat.IsSend && notShow.indexOf(chat.ContentType) === -1
          }">
          <!-- 发送中 -->
          <el-button v-if="chat.IsSend && notShow.indexOf(chat.ContentType) === -1 && chat.LocalSend" type="text"
            class="el-icon-loading"></el-button>

          <!-- <el-button
            v-if="chat.ContentType === 'LuckyMoney'"
            style="margin-left: 10px"
            size="mini"
            @click="takeLuckMoney(chat)"
          >
            打开
          </el-button> -->
          <!-- <el-button v-if="chat.ContentType === 'LuckyMoney'" size="mini" @click="queryHbDetailTask(chat)">
            查看
          </el-button> -->
          <div v-if="chat.IsRevoke === 1" class="message-action-revoke">消息已撤回</div>
          <div v-if="chat.PrivateMsgId && !['SystemPrivateMsg'].includes(chat.ContentType)" class="message-tag-interval">
            内部消息
          </div>

          <!-- 消息撤回 -->
          <!-- <div
            style="display: flex; align-items: center"
            v-if="
              chat.IsSend &&
              chat.MsgSvrId &&
              revokeMap.indexOf(chat.ContentType) >= 0 &&
              dayjs().diff(dayjs(Number(chat.CreateTime)), 'second') < 118
            "
          >
            <a-statistic-countdown
              :valueStyle="{ color: '#999', fontSize: '12px' }"
              format="mm:ss"
              :value="dayjs(Number(chat.CreateTime)).add(118, 'second').valueOf()"
              @finish="countDownFinish(chat)"
            />
            <el-button
              style="margin-left: 10px; color: #909399; padding: 5px"
              size="mini"
              @click="revokeMessageTask(chat)"
            >
              撤回
            </el-button>
          </div> -->
          <!-- <div
            v-if="!['RoomSystem', 'System', 'SystemPrivateMsg'].includes(chat.ContentType)"
            style="display: flex; align-items: center"
            :style="{
              'margin-left': chat.IsSend ? '0px' : '5px',
              'margin-top': chat.IsSend || currentFriendId.indexOf('chatroom') === -1 ? '0px' : '15px'
            }"
          >
            <el-popover popper-class="help-popover" :placement="chat.IsSend ? 'left' : 'right'" trigger="hover">
              <div slot="reference" style="cursor: pointer">
                <i class="el-icon-more"></i>
              </div>

              <div>
                <el-menu style="border-right: none">
                  <el-menu-item
                    v-if="
                      chat.IsRevoke !== 1 &&
                      chat.IsSend &&
                      chat.MsgSvrId &&
                      revokeMap.indexOf(chat.ContentType) >= 0 &&
                      dayjs().diff(dayjs(Number(chat.CreateTime)), 'second') < 118
                    "
                    @click="revokeMessageTask(chat)"
                  >
                    撤回
                  </el-menu-item>
                  <el-menu-item @click="quoteMsg(chat)">引用</el-menu-item>
                </el-menu>
              </div>
            </el-popover>
          </div> -->
          <!-- 转发 -->
          <!-- <el-button
            v-if="chat.MsgSvrId && transportType.indexOf(chat.ContentType) >= 0"
            style="margin-left: 10px; color: #909399; padding: 5px"
            type="plant"
            size="mini"
            class="el-icon-s-promotion"
            @click="canTransform(chat)"
          >
            转发
          </el-button> -->

          <!-- 引用 -->
          <!-- <el-button
            v-if="chat.MsgSvrId && quoteType.indexOf(chat.ContentType) >= 0"
            style="margin-left: 10px; color: #909399; padding: 5px"
            type="plant"
            size="mini"
            class="el-icon-s-promotion"
            @click="quoteMsg(chat)"
          >
            引用
          </el-button> -->

          <!-- 收藏 -->
          <!-- <el-button
            v-if="
              chat.MsgSvrId && collectionType.indexOf(chat.ContentType) >= 0 && ['WeApp'].includes(chat.ContentType)
            "
            style="margin-left: 10px; color: #909399; padding: 5px"
            type="plant"
            size="mini"
            class="el-icon-s-promotion"
            title="收藏之后可以发送好友"
            @click="collectWebApp(chat)"
          >
            收藏
          </el-button> -->

          <!-- 快速发朋友圈 -->
          <!-- <el-checkbox
            v-if="chat.MsgSvrId && (chat.ContentType === 'Picture' || chat.ContentType === 'Text')"
            :checked="chatListMap.indexOf(chat.MsgSvrId) >= 0"
            style="margin-left: 10px; color: #909399; padding: 5px"
            @change="setCircleContent(chat)"
          >
            选为待发素材
          </el-checkbox> -->
        </div>
      </div>
    </div>

    <!-- 大图 -->
    <!-- <div id="bigImage" class="demo-image__preview big-img-box"> -->
    <div class="demo-image__preview big-img-box">
      <el-image id="bigImageBox" style="width: 100px; height: 100px" :src="bigImageUrl"
        :preview-src-list="[bigImageUrl]"></el-image>
    </div>
    <!--新消息-->
    <div class="new-message" v-if="!isScrollBottom && unread && isShowNewMessage && currentChats.length > 10">
      <span @click="scrollBottom">
        <img src="@/assets/images/down.png" alt="" />
        <span class="new-message-text">{{ unread }}条最新消息</span>
      </span>
      <el-divider direction="vertical"></el-divider>
      <i class="el-icon-close" @click="isShowNewMessage = false"></i>
    </div>

    <el-dialog width="580px" class="interval-modal" append-to-body :visible="intervalModal.visible"
      :before-close="intervalModalClose" title="内部聊天记录" destroy-on-close>
      <div class="interval-modal-body">
        <div class="interval-modal-body-item" v-for="(item, i) in intervalModal.records" :key="i">
          <el-avatar shape="square" :size="40" :src="getAvatar(item)"></el-avatar>
          <div class="interval-modal-body-item-body">
            <div class="interval-modal-body-item-body-top">
              <div class="interval-modal-body-item-body-top-left">{{ item.sendNick }}</div>
              <div class="interval-modal-body-item-body-top-right">
                {{ dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') }}
              </div>
            </div>
            <div class="interval-modal-body-item-body-middle">
              <div v-if="item.sendContentType === 'Text'">{{ item.sendContent }}</div>
              <div v-if="item.sendContentType === 'Picture'">
                <el-avatar shape="square" :size="150" :src="getUrl(item)"></el-avatar>
              </div>
            </div>
          </div>
          <div></div>
        </div>
      </div>
    </el-dialog>

    <el-dialog width="400px" class="add-friend-modal" append-to-body :visible="addFriendModal.visible"
      :before-close="addFriendModalClose" :show-close="false" destroy-on-close>
      <div class="add-friend-til">申请添加朋友</div>
      <div>
        <div class="add-friend-item-til">发送添加朋友申请</div>
        <div><el-input v-model="addFriendModal.Message" type="textarea" :rows="4" placeholder="请输入"></el-input></div>
      </div>
      <div>
        <div class="add-friend-item-til">设置备注</div>
        <div><el-input v-model="addFriendModal.Remark" type="textarea" :rows="2" placeholder="请输入"></el-input></div>
      </div>
      <div class="add-friend-bottom">
        <el-button @click="addFriendModalClose">取消</el-button>
        <el-button @click="addFriendModalConfirm">确定</el-button>
      </div>
    </el-dialog>

    <RecordModal ref="recordModalRef" />
  </div>
</template>
<script>
import { mapGetters, mapState } from 'vuex'

import phiz from '@/utils/phiz.js'
import {
  addResources,
  webAppAdd,
  materialGroupGet,
  getInternalApi,
  getChatRecordTotalApi,
  shieldApi,
  cancelShieldApi
} from '@/api/httpApi'
import {
  TriggerHistoryMsgPushTask,
  RequestTalkDetailTask,
  RevokeMessageTask,
  PullEmojiInfoTask,
  RequestContactsInfoTask,
  QueryHbDetailTask,
  TakeLuckyMoneyTask,
  TriggerMessageReadTask
} from '@/api/webSocketApi'
import dayjs from 'dayjs'
const imgError = require('assets/svg/conversation-image-error.svg')
const transferMoney = require('assets/svg/conversation-transfer-money.svg')
import Bus from '@/utils/bus'

import filters from '@/filters'
const { timeFilter } = filters

import RecordModal from './RecordModal.vue'

export default {
  components: { RecordModal },
  data() {
    return {
      size: 10,
      notShow: ['System', 'Sys_LuckyMoney', 'RoomSystem', 'PaiYiPai', 'SystemPrivateMsg', 5, 16, 17, 26, 33], // 符合条件的将不显示头像
      revokeMap: ['Text', 'NameCard', 'Picture', 'Voice', 'Video', 'File', 'Link', 'WeApp'], // 符合的才显示撤回按钮
      detailDialogVisible: false, // 显示大图
      knicking: false, // 正在踢人
      memberDialog: false, // 正在撤回消息
      memberDetail: {}, // 群成员详情
      hb2detail: {}, // 群成员详情
      bigImageUrl: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png', // 大图的地址

      transportMessageVisible: false, // 显示转发
      activeName: 'friends', // 转发的默认tab
      currentPage: 1, // 当前页
      pageSize: 50, // 每页消息数
      pageNo: 1, // 当前页
      chatRoomPageSize: 50, // 每页消息数
      chat2Transport: {}, // 要转发的消息
      multipleSelection: [], // 要发送的对象
      transportType: [1, 2, 4, 6, 8, 13, 'Text', 'Picture', 'Video', 'Link', 'WeApp', 'File'], // 能转发的消息类型
      quoteType: [1, 2, 4, 'Text', 'Picture', 'Video'], // 能引用的消息类型
      collectionType: [6, 13, 14, 'Link', 'WeApp', 'Emoji'], // 能收藏的消息类型
      // showRight: false, // 显示右键菜单
      chatChose: {}, // 右键选择的聊天
      lastSt: -1,
      lastFetchTime: 0,
      groupModal: { visible: false, groups: [] },

      isScrollBottom: false,

      isShowNewMessage: true,

      currentFriendInfo: {},

      currentTab: undefined,

      intervalModal: { visible: false, records: [] },
      addFriendModal: { visible: false, Message: undefined, Remark: undefined },

      //语音进度条
      audioProgress: [
        { size: 4 },
        { size: 3 },
        { size: 2 },
        { size: 4 },
        { size: 3 },
        { size: 2 },
        { size: 4 },
        { size: 3 },
        { size: 3 },
        { size: 1 },
        { size: 2 },
        { size: 4 },
        { size: 4 },
        { size: 3 },
        { size: 3 },
        { size: 4 },
        { size: 1 },
        { size: 3 },
        { size: 1 },
        { size: 4 },
        { size: 3 },
        { size: 2 },
        { size: 4 },
        { size: 1 },
        { size: 4 },
        { size: 1 },
        { size: 2 },
        { size: 4 },
        { size: 3 },
        { size: 3 }
      ],

      currentContentItem: {}
    }
  },
  computed: {

    ...mapState('nedb', {
      friends: 'friends', // 通讯录列表
      chatRooms: 'chatRooms', // 当前的群聊列表
      strangers: 'strangers', // 陌生人列表
      currentMode: 'currentMode' // web还是pc
    }),
    ...mapState('conversation', {
      recordTotal: 'recordTotal',
      recordLoading: 'recordLoading',
      conversations: 'conversations',
      conversationLockMap: 'conversationLockMap',
      currentChatsStore: 'currentChatsStore',
      currentChatsCacheStore: 'currentChatsCacheStore',
      popoverVisible:'popoverVisible'
    }),
    ...mapState(['currentUser']),
    ...mapGetters({
      currentUser: 'currentUser',
      currentConvs: 'conversation/currentConvs', // 会话列表
      friendsPages: 'nedb/friendsPages', // 通讯录数据 分页
      luckMoneyMap: 'nedb/luckMoneyMap',
      chatRoomsPages: 'nedb/chatRoomsPages', // 当前的群聊列表 分页
      friendsMap: 'nedb/friendsMap',
      strangersMap: 'nedb/strangersMap',

      hbDetail: 'conversation/hbDetail',
      atContent: 'conversation/content',
      currentChats: 'conversation/currentChats', // 当前好友的聊天记录

      currentWechat: 'conversation/currentWechat',
      currentFriend: 'conversation/currentFriend',
      currentFriendId: 'conversation/currentFriendId',
      currentWeChatId: 'conversation/currentWeChatId',
      bigImageMap: 'conversation/bigImageMap',

      chatListMap: 'circleManager/chatListMap'
    }),
    // 总的好友数
    totalFriendNum() {
      return this.friends.length
    },
    // 总的群聊数
    totalChatRoomNum() {
      return this.chatRooms.length
    },
    chatslength() {
      return this.currentChats.length
    },
    currentConversation() {
      return (
        this.currentConvs.find(
          (item) => item.UserName === (this.currentFriend.FriendId || this.currentFriend.UserName)
        ) || {}
      )
    },
    unread() {
      const conversation = this.currentConvs.find(
        (item) => item.UserName === (this.currentFriend.FriendId || this.currentFriend.UserName)
      )

      return conversation ? conversation.UnreadCnt : 0
    },

    chatsFilter() {
      let data = [...this.currentChats.map((item) => ({ ...item }))]
      return data
    },

    // 显示红包详情
    hbDetailVisible: {
      get() {
        return this.$store.getters['conversation/hbDetailVisible']
      },
      set(v) {
        this.$store.commit('conversation/SET_HB_DETAIL_VISIBLE', v)
        if (!v) {
          this.$store.commit('conversation/SET_HB_DETAIL', {
            WeChatId: '', // 所属微信号
            Success: false,
            ErrMsg: '',
            HbUrl: '', //
            TotalNum: null, // 红包总个数
            TotalAmount: null, // 红包总金额
            RecNum: null, // 已收红包个数
            Records: [], // 已收红包个数
            RecAmount: null // 已收红包金额
          })
          this.hb2detail = {}
        }
      }
    }
  },
  watch: {
    // 微信id
    currentWeChatId(val) {
      this.$store.commit('SET_IS_PRE_LOAD_HISTORY_RECORD', !this.currentWechat._isClicked)

      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      // 重置数据
      this.$store
        .dispatch('conversation/resetCurrentChats', { currentWeChatId: val, currentFriendId: this.currentFriendId })
        .then(() => {
          this.lastSt = -1
          this.lastFetchTime = 0
          if (val && this.currentFriendId) {
            //TriggerHistoryMsgPushTask(val, this.currentFriendId, this.currentUser.NickName, loginInfo.name, 0, 0, 10)
            this.historyRecordHandle(val, this.currentFriendId, this.currentUser.NickName, loginInfo.name, 0, 0, 10)
          }
        })
    },
    // 好友id
    currentFriendId(val) {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      // 重置数据
      this.$store
        .dispatch('conversation/resetCurrentChats', { currentWeChatId: this.currentWeChatId, currentFriendId: val })
        .then(() => {
          this.lastSt = -1
          this.lastFetchTime = 0
          if (val && this.currentWeChatId && this.currentTab !== 'friends') {
            //TriggerHistoryMsgPushTask(this.currentWeChatId, val, this.currentUser.NickName, loginInfo.name, 0, 0, 10)
            this.historyRecordHandle(this.currentWeChatId, val, this.currentUser.NickName, loginInfo.name, 0, 0, 10)
          }
        })
    },
    // 聊天长度变化
    chatslength(n) {
      //console.log('聊天记录长度：', n)
      const dom = document.getElementById('show-chat')
      if (dom) {
        const sh = dom.scrollHeight
        const ch = dom.clientHeight
        const st = dom.scrollTop
        //是否滚动底部
        if (st > sh - ch - 250) {
          this.scrollBottom()
        } else {
          //新消息展示
          this.isShowNewMessage = this.unread > 0
          this.isScrollBottom = false
        }
      }

      // console.log(
      //   n,
      //   'recordTotal',
      //   this.recordTotal,
      //   this.lastSt,
      //   'isScrollBottom',
      //   this.isScrollBottom,
      //   'unread',
      //   this.unread,
      //   'isShowNewMessage',
      //   this.isShowNewMessage
      // )
      if (n > 10 && n <= this.recordTotal && this.lastSt >= 0) {
        this.$nextTick(() => {
          const scrollDom = document.getElementById('show-chat')
          const childNodes = scrollDom.childNodes
          let height = 0
          childNodes.forEach((node, nodeIndex) => {
            if (nodeIndex > 0 && nodeIndex < 10) {
              height += node.clientHeight
            }
          })

          scrollDom.scrollTo(0, height)
        })
      }
    }
  },
  methods: {
    dayjs,

    audioProgressChange(chat, item, i) {
      //audio.currentTime/audio.duration=currentProgress/audioProgress.length
      const audio = document.querySelector(`#audio${chat.CreateTime}`)
      console.log('audioProgressChange', item, i + 1, audio.duration, this.audioProgress.length)
      audio.currentTime = (audio.duration * (i + 1)) / this.audioProgress.length
      audio.play()
    },
    getVoiceUrl(chat) {
      //console.log('getVoiceUrl', chat)
      this.$nextTick(() => {
        const audio = document.querySelector(`#audio${chat.CreateTime}`)
        audio.onloadeddata = () => {
          console.log('audio loadeddata')
          let time = audio.duration > 10 ? parseInt(audio.duration) : `0${parseInt(audio.duration)}`
          this.$store.commit('conversation/UPDATE_CURRENT_CHAT', {
            ...chat,
            __duration: `00:${time}`,
            __progress: `00:${time}`
          })
        }
        audio.onpause = () => {
          console.log('audio pause')
          this.$store.commit('conversation/UPDATE_CURRENT_CHAT', { ...chat, __audioState: false })
        }
        audio.onplay = () => {
          console.log('audio play')
          this.$store.commit('conversation/UPDATE_CURRENT_CHAT', { ...chat, __audioState: true })
        }
        audio.onended = () => {
          console.log('audio ended')
          this.$store.commit('conversation/UPDATE_CURRENT_CHAT', {
            ...chat,
            __currentProgress: 0
          })
        }

        audio.ontimeupdate = (e) => {
          //audio.currentTime/audio.duration=currentProgress/audioProgress.length
          console.log(
            'audio ontimeupdate',
            audio.currentTime,
            parseInt((audio.currentTime * this.audioProgress.length) / audio.duration)
          )
          let time = audio.currentTime > 10 ? parseInt(audio.currentTime) : `0${parseInt(audio.currentTime)}`
          this.$store.commit('conversation/UPDATE_CURRENT_CHAT', {
            ...chat,
            __progress: `00:${time}`,
            __currentProgress: parseInt((audio.currentTime * this.audioProgress.length) / audio.duration)
          })
        }
      })

      let startIndex = 0,
        endIndex = 0
      if (chat.Content.includes('http')) {
        startIndex = chat.Content.indexOf('http')
      }
      if (chat.Content.includes('https')) {
        startIndex = chat.Content.indexOf('https')
      }
      if (chat.Content.includes('.mp3')) {
        endIndex = chat.Content.lastIndexOf('.mp3') + 4
      }
      if (chat.Content.includes('.amr')) {
        endIndex = chat.Content.lastIndexOf('.amr') + 4
      }
      return chat.Content.slice(startIndex, endIndex)
    },
    audioPlay(chat) {
      const audio = document.querySelector(`#audio${chat.CreateTime}`)
      audio.play()
    },
    audioPause(chat) {
      const audio = document.querySelector(`#audio${chat.CreateTime}`)
      audio.pause()
    },
    //图片加载
    imgLoadHandle(chats) {
      let imgNum = 0,
        imgLoadNum = 0

      return new Promise((resolve, reject) => {
        chats.forEach((message) => {
          if (['Emoji', 'Picture', 'Video'].includes(message.ContentType)) {
            imgNum++

            let content = {}
            if (message.FriendId.endsWith('chatroom')) {
              if (message.Content.startsWith('{')) {
                content = JSON.parse(message.Content)
              } else if (message.Content.startsWith('http://')) {
                content = { Thumb: content }
              } else {
                content = message.Content.replace(/\S+?:/, '').replace(/^\n+|\n+$/g, '')
              }
            } else {
              content = JSON.parse(message.Content)
            }
            if (typeof content === 'string' && new RegExp(/^{.+}$/).test(content)) {
              content = JSON.parse(content)
            }
            const imgDom = document.createElement('img')
            imgDom.src = content.Thumb
            imgDom.onload = () => {
              console.log('SET_CURRENT_CHATS img load')
              imgLoadNum++
              message['__img'] = imgDom

              if (imgLoadNum === imgNum) {
                resolve(chats)
              }
            }
            imgDom.onerror = () => {
              console.log('SET_CURRENT_CHATS img error')
              imgLoadNum++
              message['__img'] = imgDom

              if (imgLoadNum === imgNum) {
                resolve(chats)
              }
            }
          }
        })
        if (imgNum === 0) resolve(chats)
      })
    },
    async historyRecordHandle(...params) {
      const [currentWeChatId, currentFriendId] = params

      const lock = this.conversationLockMap.get(currentWeChatId + currentFriendId + '')
      if (lock) return
      this.$store.commit('conversation/SET_CONVERSATION_LOCK_MAP', {
        key: currentWeChatId + currentFriendId + '',
        value: true
      })

      // const { data: total } = await getChatRecordTotalApi({
      //   wxId: currentWeChatId,
      //   friendId: currentFriendId
      // })
      const chats = this.currentChatsCacheStore.filter(
        (item) => item.WeChatId === currentWeChatId && item.FriendId === currentFriendId
      )
      const count = chats.length

      if (count === 0 || (count < 10 && total >= 10)) {
        console.log('historyRecordHandle 历史推送')
        TriggerHistoryMsgPushTask(...params)
      } else {
        console.log('historyRecordHandle 缓存加载')

        chats.sort((a, b) => {
          return a.CreateTime - b.CreateTime
        })
        const dataCache = await this.imgLoadHandle(chats)
        this.$store.commit('conversation/SET_CURRENT_CHATS', dataCache)

        this.$store.commit('conversation/SET_RECORD_TOTAL', total || 0)

        this.$store.commit('conversation/SET_CONVERSATION_LOCK_MAP', {
          key: currentWeChatId + currentFriendId + '',
          value: false
        })
        this.$nextTick(() => {
          this.setBottom()
        })
      }
    },

    wheel(e) {
      this.$nextTick(() => {
        const scrollDom = document.querySelector('#show-chat')
        const isUp = e.deltaY < 0

        //处理历史记录加载与新消息时滚动条的scrollTop
        if (!this.recordLoading) {
          this.lastSt = -1
        }

        if (isUp && scrollDom.scrollTop === 0 && !this.recordLoading) {
          if (this.chatslength >= this.recordTotal) return
          this.newPage()
        }

        //未读处理
        this.isScrollBottom = scrollDom.scrollTop >= scrollDom.scrollHeight - scrollDom.clientHeight - 250

        if (this.isScrollBottom && this.currentConversation.UnreadCnt > 0) {
          this.setMessageRead(this.currentConversation)
        }
        //名片弹窗
        Object.keys(this.popoverVisible).forEach((key) => {
          this.popoverVisible[key] = false
        })
      })
    },
    showTime(time, previousTime) {
      if (previousTime) {
        return dayjs(Number(time)).diff(dayjs(Number(previousTime)), 'minute') > 3
      }
      return true
    },
    // 本地和手机上 设置消息为已读
    setMessageRead(message) {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      if (!message.WeChatId) return
      // 本地设为已读
      this.$store.commit('conversation/SET_CONV_READED', message)
      // 手机上设置消息已读
      TriggerMessageReadTask(message.WeChatId, message.UserName, loginInfo.name)
    },
    scrollBottom() {
      this.$nextTick(() => {
        this.setBottom()
      })

      this.setMessageRead(this.currentConversation)
    },
    countDownFinish(chat) {
      this.$forceUpdate()
    },
    // scroll消息置底
    setBottom() {
      const docSC = document.getElementById('show-chat')
      if (docSC) {
        const sh = document.getElementById('show-chat').scrollHeight
        const ch = document.getElementById('show-chat').clientHeight
        document.getElementById('show-chat').scrollTop = sh - ch
      }
    },
    intervalScrollBottom() {
      const dom = document.getElementById('show-chat')

      if (dom && this.currentChats.filter((item) => !item.PrivateMsgId).length <= 10) {
        const sh = document.getElementById('show-chat').scrollHeight
        const ch = document.getElementById('show-chat').clientHeight
        document.getElementById('show-chat').scrollTop = sh - ch
      }
    },
    // 到顶分页加载chats
    newPage() {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      const st = document.getElementById('show-chat').scrollTop
      const sh = document.getElementById('show-chat').scrollHeight
      const ch = document.getElementById('show-chat').clientHeight
      this.lastSt = st
      if (st === 0 && sh > ch) {
        const endTime = this.currentChats[0] ? this.currentChats[0].CreateTime : 0
        if (endTime === this.lastFetchTime) this.lastFetchTime = endTime
        TriggerHistoryMsgPushTask(
          this.currentWeChatId,
          this.currentFriendId,
          this.currentUser.NickName,
          loginInfo.name,
          0,
          endTime,
          10
        )
      }
    },
    // 获取聊天的头像
    getAvatar(chat) {
      // 自己发的消息
      if (chat.IsSend) {
        return this.currentWechat.Avatar || ''
      } else if (chat.FriendId && chat.FriendId.indexOf('chatroom') > 0) {
        //   群消息
        const memberId = chat.Content.split(':')[0]
        if (this.friendsMap[memberId]) {
          return this.friendsMap[memberId].Avatar
        } else if (this.strangersMap[memberId]) {
          return this.strangersMap[memberId].Avatar
        } else {
          return chat.FriendAvatar
        }
      } else {
        // 好友的消息
        return this.currentFriend.Avatar
      }
    },
    // 抢红包的昵称
    userNameFormatter(row) {
      const wxid = row.UserName
      if (this.friendsMap[wxid]) {
        return this.friendsMap[wxid].FriendNick
      } else if (this.strangersMap[wxid]) {
        return this.strangersMap[wxid].FriendNick
      } else {
        return '本地数据库没有该好友的信息'
      }
    },
    // 获取群聊发言人的昵称
    getMemberName(id) {
      const memberId = id
      let name = memberId
      //console.log(this.friendsMap, this.strangersMap, memberId)
      if (this.friendsMap[memberId]) {
        name = this.friendsMap[memberId].FriendNick
      } else if (this.strangersMap[memberId]) {
        name = this.strangersMap[memberId].Nickname
      }
      //console.log(name)
      return name
    },
    // 获取群成员详情
    showMemberDetail(e, chat) {
      //名片
      if (!chat.IsSend && chat.FriendId && chat.FriendId.endsWith('@chatroom')) {
        this.popoverVisible[chat.MsgSvrId] = true
        Object.keys(this.popoverVisible).forEach((key) => {
          if (key !== chat.MsgSvrId) this.popoverVisible[key] = false
        })

        this.currentFriendInfo = chat
        this.memberDetail = this.currentFriend.ShowNameList.find((item) => item.UserName === chat.ThisFriendId) || {}
        if (this.currentFriendId) {
          const member = chat.Content.split(':')[0]
          if (this.friendsMap[member]) {
            //console.log(1)
            this.memberDetail = { ...this.memberDetail, ...this.friendsMap[member] }
            //this.memberDialog = true
          } else if (this.strangersMap[member]) {
            //console.log(2)
            this.memberDetail = {
              ...this.memberDetail,
              WeChatId: this.currentWeChatId,
              FriendId: member,
              Avatar: this.strangersMap[member].Avatar ? this.strangersMap[member].Avatar : '',
              FriendNick: this.strangersMap[member].Nickname ? this.strangersMap[member].Nickname : '',
              LabelIds: ''
            }
            //this.memberDialog = true
          } else {
            //console.log(3)
            this.memberDetail = {
              ...this.memberDetail,
              WeChatId: this.currentWeChatId,
              FriendId: member,
              Avatar: '',
              FriendNick: '',
              LabelIds: ''
            }
            this.getMemberDetail()
          }
          //console.log('memberDetail', this.memberDetail)
        }
      }
    },
    // 添加到通讯录
    addToAddress() {
      const content = {
        WeChatId: this.memberDetail.WeChatId, // 商家个人微信内部全局唯一识别码
        ChatroomId: this.currentFriendId, // 所在的群聊id
        FriendId: this.memberDetail.FriendId, // 请求加好友微信内部全局唯一识别码
        Message: '', // 招呼语
        Remark: '' // 备注信息
      }
      this.$store.dispatch('websocket/AddFriendInChatRoomTask', content)
      this.memberDialog = false
      //this.$message.info('指令已经下发！')
    },
    // 获取详情
    getMemberDetail() {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      RequestContactsInfoTask(
        this.memberDetail.WeChatId,
        this.memberDetail.FriendId,
        loginInfo.name,
        this.currentFriendId
      )
      //this.memberDialog = false
      //this.$message.info('指令已经下发！')
    },
    // base64解码 & 不同类型的消息解读
    decodeChat(chat) {
      // console.log('decodeChat', chat)
      try {
        let content = chat.Content
        const regJson = new RegExp(/^{.+}$/)
        const httpRole= /(\b(https?|http?|ftp|ftps):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
        // const httpRole=/((https?:\/\/|www\.)[\w.]*[a-zA-Z])/gi
        let jContent = {}
        let thumb = ''
        let str = ''
        let nickName = ''
        if (chat.FriendId && chat.FriendId.indexOf('chatroom') > 0 && !regJson.test(content)) {
          if (!content.startsWith('http')) {
            content = content.replace(/\S+?:/, '').replace(/^\n+|\n+$/g, '')
          }
        }
        if (typeof content === 'string' && regJson.test(content)) {
          jContent = JSON.parse(content)
        }

        switch (chat.ContentType) {
          // 文本 1
          case 'Text':
            case 1:
            // content=content.replace(/^\n+|\n+$/g, '').replace(httpRole,`<a href=$1>$1</a>`)
            content=content.replace(/^\n+|\n+$/g, '').replace(httpRole, (match) => {
              let matchHttp =match;
              if (match.startsWith('www.')) {
              matchHttp = 'http://' + match;
              }
                return `<a href="${matchHttp}">${match}</a>`;
              });
            return phiz.qqFaceImgMap(content)
          // 图片 2
          case 'Picture':
          case 2:
            //console.log(chat)
            const index = jContent.MsgSvrId ? jContent.MsgSvrId.indexOf('&&') : -1
            const is =
              index !== -1 ? this.bigImageMap[jContent.MsgSvrId.slice(index + 2)] : this.bigImageMap[jContent.MsgSvrId]

            if (jContent.Thumb && jContent.Thumb.startsWith('http')) {
              if (chat.FriendId && chat.FriendId.endsWith('@im.chatroom')) {
                return `<img class="chat-img" src="${jContent.Thumb}" title="点击看大图" alt="图片"/>${is ? '' : '<i class="el-icon-download chat-img-icon"></i>'
                  }`
              } else {
                return `<img class="chat-img" src="${jContent.Thumb}" title="点击看大图" alt="图片"/>`
              }
            } else if (chat.Url) {
              return `<img class="chat-img" src="${chat.Url}" title="点击看大图" alt="图片"/>`
            } else if (jContent.Thumb || jContent.Thumb === '') {
              return `<img class="chat-img" src="${imgError}" title="点击看大图" alt="图片"/>`
            } else {
              return `<img class="chat-img" src="${content}" title="点击看大图" alt="图片"/>`
            }
          // 语音 3
          case 'Voice':
          case 3:
            //-------------------------------------

            let url =
              chat.Url ||
              this.bigImageMap[chat.MsgId] ||
              (content.endsWith('.amr') && content.replace(/.amr$/, '.mp3')) ||
              content.replace(/.mp3:[0-9]+/, '.mp3')

            const audio = new Audio(url)
            //addEventListener 容易绑定多次事件
            audio.addEventListener('loadeddata', () => {
              if (!chat.duration)
                this.$store.commit('conversation/UPDATE_CURRENT_CHAT', { ...chat, duration: parseInt(audio.duration) })
            })
            window.handleAudio = () => {
              audio.paused ? audio.play() : audio.pause()
            }
            //-------------------------------------
            if (chat.Url || this.bigImageMap[chat.MsgId]) {
              // return `<audio src="${chat.Url || this.bigImageMap[chat.MsgId]}" alt="语音" controls></audio>`
              return chat.IsSend
                ? `${chat.duration || 0}" <img style="width:16px" src="https://kuaizhan.ecostudio.cn/play.png"/>`
                : `<img style="width:16px" src="https://kuaizhan.ecostudio.cn/play_.png"/> ${chat.duration || 0}"`
            } else if (content.endsWith('.amr')) {
              thumb = content.replace(/.amr$/, '.mp3')
            } else {
              thumb = content.replace(/.mp3:[0-9]+/, '.mp3')
            }
            if (thumb.startsWith('http://') || thumb.startsWith('https://')) {
              // return `<audio src="${thumb}" alt="语音" controls></audio>`

              return chat.IsSend
                ? `${chat.duration || 0
                }" <img style="width:16px;cursor:pointer"  onclick="handleAudio()" src="https://kuaizhan.ecostudio.cn/play.png"/>`
                : `<img style="width:16px;cursor:pointer" onclick="handleAudio()" src="https://kuaizhan.ecostudio.cn/play_.png"/> ${chat.duration || 0
                }"`
            } else {
              // return ` <p>[语音]文件地址错误，点击重新获取</p>`
              return chat
            }
          // 视频 4
          case 'Video':
          case 4:
            if (chat.Url || this.bigImageMap[chat.MsgId]) {
              str = `<video class="video-box" src="${chat.Url || this.bigImageMap[chat.MsgId]
                }" type="video/mp4" alt="视频" controls></video>`
            } else if (jContent.Thumb && jContent.Thumb.startsWith('http')) {
              str = `<video class="video-box" src="${jContent.Thumb}" type="video/mp4" alt="视频" controls></video>`
            } else if (jContent.Thumb || jContent.Thumb === '') {
              str = `<img class="video-box-no" src="${imgError}"  alt="视频" />
                 <i class="fa fa-play-circle-o fa-2x play-video" aria-hidden="true" title="点击播放"></i>`
            } else {
              str = `<video  class="video-box" src="${content}" type="video/mp4" alt="视频" controls></video>`
            }
            return str
          // 系统消息 5 ok
          case 'System':
          case 5:
            return content
          // 链接消息 6
          case 'Link':
          case 6:
            if (typeof content === 'string' && regJson.test(content)) {
              jContent = JSON.parse(content)
              switch (jContent.TypeStr) {
                case '[聊天记录]':
                  this.$nextTick(() => {
                    const dom = document.querySelector(`#chat_record_${chat.CreateTime}`)
                    dom.onclick = () => {
                      this.$refs.recordModalRef.getData(jContent.MsgList)
                      this.$refs.recordModalRef.modalAction()
                    }
                  })

                  str = `
                        <div id="chat_record_${chat.CreateTime}" >
                        <span class="link-title">${jContent.Title}</span>
                        <div class="link-content">
                         <span class="link-des">${jContent.Des}...</span>
                        </div>
                        <div class="link-type">${jContent.TypeStr}</div>
                        </div>
                        `
                  break
                default:
                  // 其他类型 笔记 音乐 视频 小视频 表情分享 游戏录频
                  str = `
                        <span class="link-title">${jContent.Title || '-'}</span>
                        <div class="link-content">
                         <span class="link-des">${jContent.Des}</span>
                          <img class="link-img" src="${jContent.Thumb}" alt="链接图片" />
                        </div>
                        <div class="link-type">${jContent.TypeStr}</div>
                        `
                  break
              }
              return str
            } else {
              return content
            }
          // 扩展的链接消息（小程序分享等），内容为xml格式，暂未使用 7
          case 'LinkExt':
          case 7:
            return `LinkExt消息：${content}`
          // 文件 8
          case 'File':
          case 8:
            return content
          // if (JSON.stringify(jContent) !== '{}') {
          //   let size = 0
          //   let type = ''
          //   if (jContent.size) {
          //     if (jContent.size < 1024) {
          //       size = jContent.size + 'B'
          //     } else if (jContent.size < 1024 * 1024) {
          //       size = parseInt(jContent.size / 1024, 10) + 'KB'
          //     } else {
          //       size = parseInt(jContent.size / (1024 * 1024), 10) + 'MB'
          //     }
          //   }
          //   if (jContent.Des) {
          //     size = jContent.Des.replace(/,.*/, '')
          //     type = jContent.Des.replace(/.*,/, '').trim()
          //   }
          //   const fileSize = size || ''
          //   const fileTitle = jContent.Title || jContent.name || ''
          //   const fileType = type || jContent.name || ''
          //   const fileSource = jContent.Source || '手机'
          //   let fileIcon = 'fa-question-circle-o'

          //   switch (fileType) {
          //     case 'doc':
          //     case 'docx':
          //       fileIcon = 'fa-file-word-o'
          //       break
          //     case 'xls':
          //     case 'xlsx':
          //       fileIcon = 'fa-file-excel-o'
          //       break
          //     case 'ppt':
          //     case 'pptx':
          //       fileIcon = 'fa-file-powerpoint-o'
          //       break
          //     case 'zip':
          //     case 'rar':
          //       fileIcon = 'fa-file-archive-o'
          //       break
          //     case 'text':
          //     case 'txt':
          //       fileIcon = 'fa-file-text-o'
          //       break
          //     case 'mp3':
          //       fileIcon = 'fa-file-sound-o'
          //       break
          //     default:
          //       fileIcon = 'fa-question-circle-o'
          //       break
          //   }
          //   str = `
          //       <span class="file-title">${fileTitle}</span>
          //       <div class="file-content">
          //         <span class="file-des">${fileSize}</span>
          //         <i class="fa ${fileIcon} file-icon" aria-hidden="true"></i>
          //       </div>
          //       <div class="file-type">${fileSource}</div>
          //     `
          //   return str
          // } else {
          //   return content
          // }
          // 名片 9
          case 'NameCard':
          case 9:
            if (jContent.Nickname) {
              thumb = jContent.HeadImg ? jContent.HeadImg : ''
              nickName = jContent.Nickname
            } else {
              thumb = this.friendsMap[content] ? this.friendsMap[content].Avatar : ''
              nickName = this.friendsMap[content] ? this.friendsMap[content].FriendNick : ''
            }
            str = `
                    <div class="namecard-info">
                      <img class="namecard-img" src="${thumb}" alt="好友头像" />
                      <span class="namecard-nickname ellipsis2">${nickName}</span>
                    </div>
                    <div class="namecard-tip">个人名片</div>
                  `
            return str
          // 位置信息 10
          case 'Location':
          case 10:
            return `位置消息：${content}`
          // 红包 11
          case 'LuckyMoney':
          case 11:
            if (jContent.Key) {
              return `
                  <div class="luck-info">
                    <span class="luck-img" > &nbsp;&nbsp;🧧 </span>
                    <span class="luck-wish ellipsis2" >${jContent.Title || '恭喜发财，大吉大利'}</span>
                    <span class="luck-flag ellipsis2" ></span>
                  </div>
                  <div class="luckmoney-tip">微信红包</div>
                  `
            } else {
              return jContent
            }
          // 转账 12
          case 'MoneyTrans':
          case 12: {
            let moneyTransFlag = ''

            switch (jContent.PaySubType) {
              case 1:
                if (chat.IsSend) {
                  moneyTransFlag = `转账给${this.currentFriend.FriendNick}`
                } else {
                  moneyTransFlag = '转账给你'
                }
                break
              case 3:
                moneyTransFlag = '已收钱'
                break
              default:
                break
            }
            if (jContent.PaySubType === 3) {
              str = `
                        <div class="moneytran-info">
                            <img class="moneytran-img" src="${transferMoney}" alt />
                            <span class="moneytran-feed" >${jContent.Feedesc || 0}</span>
                            <span class="moneytran-flag">${moneyTransFlag}</span>
                            <span class="moneytran-flag"></span>
                        </div>
                        <div class="moneytran-tip">微信转账</div>
                    `
            } else {
              const flag = this.luckMoneyMap[chat.MsgSvrId] ? '已被领取' : ''
              str = `
                        <div class="moneytran-info">
                            <img class="moneytran-img" src="${transferMoney}" alt />
                            <span class="moneytran-feed" >${jContent.Feedesc || 0}</span>
                            <span class="moneytran-flag">${moneyTransFlag}</span>
                            <span class="moneytran-flag">${flag}</span>
                        </div>
                        <div class="moneytran-tip">微信转账</div>
                  `
            }
            return str
          }
          // 小程序 13
          case 'WeApp':
          case 13: {
            let appIcon = imgError
            let appSource = '无效小程序'
            let appTitle = '无效小程序'
            let appThumb = ''
            let appTypeStr = '小程序'
            if (typeof content === 'string' && regJson.test(content)) {
              jContent = JSON.parse(content)
              //appIcon = 'https://pic.rmb.bdstatic.com/bjh/01319193fda0d74960a6c34b36d54ade.png'
              //appIcon = jContent.Icon && typeof jContent.Icon !== 'undefined' ? jContent.Icon : imgError
              appIcon =
                jContent.Icon ||
                jContent.picImage ||
                'https://pic.rmb.bdstatic.com/bjh/01319193fda0d74960a6c34b36d54ade.png'
              appSource = jContent.Source || jContent.Title
              appTitle = jContent.Title || jContent.Des
              //appThumb = 'https://pic.rmb.bdstatic.com/bjh/01319193fda0d74960a6c34b36d54ade.png'
              appThumb =
                jContent.Thumb ||
                jContent.picImage ||
                'https://pic.rmb.bdstatic.com/bjh/01319193fda0d74960a6c34b36d54ade.png'
              appTypeStr = jContent.TypeStr ? jContent.TypeStr : '小程序'
            }

            str = `
                  <div class="app-des">
                  <img class="app-icon" src="${appIcon}" alt="icon" />
                  <span class="app-source ellipsis">${appSource}</span>
                  </div>
                  <div class="app-title ellipsis">${appTitle}</div>
                  <img class="app-img" src="${appThumb}" />
                  <div class="app-typestr">${appTypeStr}</div>
                   `
            return str
          }
          // Emoji 14
          case 'Emoji':
          case 14: {
            const eMap = {
              'jsb_j.png': 'http://emoji.qpic.cn/wx_emoji/abG5b87mcOW7YxBZFZPZOBXUjE99n48g6Znn6zaUiaVRtxMBYaEEKoA/',
              'jsb_s.png': 'http://emoji.qpic.cn/wx_emoji/ARQOAfC52Cu6iczyCvLhibUNQxCialTeaeObDoEMsL7uJjyV5dqzCNCFQ/',
              'jsb_b.png': 'http://emoji.qpic.cn/wx_emoji/Ty7jp6YeVib7MibicS8eb9buorVCg7mYTFXxuEpVDyQMaqK6PUoOcGxbQ/',
              'dice_1.png': 'http://emoji.qpic.cn/wx_emoji/QsDXJwBwXEXGFwLHJCm6haBlFls30vzPQcZTib9dyhLiazKxoPX6kp0A/',
              'dice_2.png':
                'http://emoji.qpic.cn/wx_emoji/YbCHM38dRYCIWbKmiaBrdnPrfuuwicLD2iacSWaPoAiaFrUySG87ELibOXQ/',
              'dice_3.png': 'http://emoji.qpic.cn/wx_emoji/lgVbvPFtzP8ytMiaKZMUoV3BXNPRfUaP69vozHfNarmX3MlTrgOhrkA/',
              'dice_4.png': 'http://emoji.qpic.cn/wx_emoji/zaBCJf5hVDn8NlibdrxV4NoPc12d28S7s67UCJqwynRmB0spdttIbeQ/',
              'dice_5.png': 'http://emoji.qpic.cn/wx_emoji/72IJJTdBzuibcxvnpFVicUAzCWRJC3cKhtkpMHTFejC2cyOeEGSHibTKw/',
              'dice_6.png': 'http://emoji.qpic.cn/wx_emoji/Jowow1icuI3XqtkFeQgIuzjIEYHdtJZictGFJjTsAFwW1g6cx1uTaQfw/'
            }
            thumb = jContent.Thumb || jContent.cdnUrl
            if (thumb) {
              if (eMap[thumb]) {
                return `<img class="chat-img" src="${eMap[thumb]}" title="点击看大图" alt="图片"/>`
              }
              return `<img class="chat-img" src="${thumb}" title="点击看大图" alt="图片"/>`
            }
            return content
          }
          // 群管理消息 15
          case 'RoomManage':
          case 15:
            //   return content
            return 'RoomManage'
          // 红包系统消息 16
          case 'Sys_LuckyMoney':
          case 16:
            return JSON.parse(chat.Content).Title
          // 群系统消息 17 ok
          case 'RoomSystem':
          case 17:
            if (jContent.title) {
              return jContent.title
            }
            return content
          case 'NotifyMsg':
          case 21:
            if (jContent.title) {
              return `
                      <span class="link-title">${jContent.source}</span>
                      <div class="link-content">
                       <span class="link-des">${jContent.title}...</span>
                      </div>
                      <div class="link-type">${jContent.des}</div>
                      `
            }
            return content
          case 'BizLink':
            return content
          // 引用消息
          case 22:
          case 'QuoteMsg':
            if (jContent.title) {
              if (jContent.displayName) {
                str =
                  phiz.qqFaceImgMap(jContent.title) +
                  `<div class="quote-content"><span class="link-des">${jContent.displayName}:${jContent.content}</span></div>`
                return str
              } else {
                return jContent
              }
            }
            return '引用消息' + content
          // 视屏号
          case 24:
          case 'ShiPinHao':
            if (jContent.title) {
              return `
                    <div>
                      <p>${jContent.title}</p>
                      <img style="width:200px;" src="${jContent.thumb}" alt="好友头像" />
                    </div>
                    <div style="display:flex;align-items:center;">
                      <img style="width:30px;border-radius:15px;" class="namecard-img" src="${jContent.avatar}" alt="好友头像" />
                      <span style="margin-left:10px;">${jContent.nickname}</span>
                    </div>
                  `
            }
            return content
          // 拍一拍
          case 26:
          case 'PaiYiPai':
          case 'JieLongMsg':
            return content
          // 系统消息 33 ok
          case 'SystemPrivateMsg':
          case 33:
            let message = JSON.parse(content)
            //console.log(message.Time ? message.Time : dayjs().valueOf())
            return `<div class="chat-internal">${message.Time ? timeFilter(parseInt(message.Time)) : '-'} ${message.Title
              }</div>`
          // 不支持的消息
          default:
            return `不支持的消息类型 ${chat.ContentType}`
        }
      } catch (error) {
        console.log(error, chat)
        return chat
      }
    },

    getCurrentChatContent(chat) {
      try {
        let content = chat.Content
        const regJson = new RegExp(/^{.+}$/)
        let jContent = {}

        if (chat.FriendId && chat.FriendId.indexOf('chatroom') > 0 && !regJson.test(content)) {
          if (!content.startsWith('http')) {
            content = content.replace(/\S+?:/, '').replace(/^\n+|\n+$/g, '')
          }
        }
        if (typeof content === 'string' && regJson.test(content)) {
          jContent = JSON.parse(content)
        }
        return jContent
      } catch (error) {
        console.log(error, chat)
        return {}
      }
    },
    // 点击事件
    whatToDo(chat) {
      switch (chat.ContentType) {
        //case 'Voice':
        case 'Picture':
        case 'Video':
          this.getChatDetail(chat)
          break
        case 'Link':
        case 6:
          this.openLink(chat)
          break
        case 'MoneyTrans':
          this.taskTransMoney(chat)
          break
        case 'File':
          this.fileOpen(chat)
          break
        default:
          console.log(chat)
          break
      }
    },
    fileOpen(chat) {
      console.log('fileOpen', chat)
      let content = chat.Content
      const regJson = new RegExp(/^{.+}$/)
      if (chat.FriendId.indexOf('@chatroom') > 0 || chat.FriendId.indexOf('@im.chatroom') > 0) {
        content = content.replace(/\S+?:/, '').replace(/^\n+|\n+$/g, '')
      }
      if (typeof content === 'string' && regJson.test(content)) {
        const jContent = JSON.parse(content)

        if (jContent.Down || chat.IsSend) {
          if (jContent.url) {
            window.open(jContent.url, '_blank')
          } else {
            this.$message.warning('文件加载中...')
          }
        } else if (chat.Url) {
          window.open(chat.Url, '_blank')
        } else {
          this.$message.warning('文件加载中...')
        }
      }
    },
    // 获取聊天中各种资源的地址
    getChatDetail(chat) {
      let content = chat.Content
      const regJson = new RegExp(/^{.+}$/)
      let jContent = {}
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      const { WeChatId, FriendId, MsgId, MsgSvrId, ContentType, Url } = chat
      if (chat.FriendId && chat.FriendId.indexOf('chatroom') > 0 && !regJson.test(content)) {
        if (!content.startsWith('http')) {
          content = content.replace(/\S+?:/, '').replace(/^\n+|\n+$/g, '')
        }
      }
      if (typeof content === 'string' && regJson.test(content)) {
        jContent = JSON.parse(content)
      }

      //console.log('getChatDetail', jContent)
      // 先看content中有没有url
      const detailUrl = Url || this.bigImageMap[MsgId] || (jContent.Down && jContent.Thumb) || ''
      if (detailUrl) {
        if (ContentType === 'Picture') {
          // 展示大图
          this.bigImageUrl = detailUrl
          const imgDom = document.getElementById('bigImageBox')
          if (imgDom) {
            imgDom.click()
          }
        } else if (ContentType === 'File') {
          this.$confirm('下载该文件?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              // 下载文件 方法1
              // window.location.href = url
              // 下载文件 方法2
              const a = document.createElement('a')
              a.setAttribute('href', detailUrl)
              a.setAttribute('target', '_blank')
              a.setAttribute('id', 'file_a')
              // 防止反复添加
              if (document.getElementById('file_a')) {
                document.body.removeChild(document.getElementById('file_a'))
              }
              document.body.appendChild(a)
              a.click()
            })
            .catch(() => { })
        } else if (ContentType === 'Video') {
          return
        } else if (ContentType === 'Voice') {
          return
        }
      } else {
        if (MsgSvrId) {
          RequestTalkDetailTask(WeChatId, FriendId, MsgId, loginInfo.name, MsgSvrId, '', false)
          this.$message({
            type: 'info',
            message: ['Picture'].includes(ContentType) ? '资源加载中...' : '资源加载中...',
            duration: 1000
          })
        } else {
          this.$message({
            type: 'warning',
            message: '获取资源失败',
            duration: 2000
          })
        }
      }
    },
    // 打开链接
    openLink(chat) {
      let content = chat.Content
      const regJson = new RegExp(/^{.+}$/)
      if (chat.FriendId.indexOf('@chatroom') > 0 || chat.FriendId.indexOf('@im.chatroom') > 0) {
        content = content.replace(/\S+?:/, '').replace(/^\n+|\n+$/g, '')
      }
      if (typeof content === 'string' && regJson.test(content)) {
        const jContent = JSON.parse(content)
        switch (jContent.TypeStr) {
          case '[链接]':
            if (jContent.Title === '邀请你加入群聊' || jContent.Title === '邀请您加入群聊') {
              const contentMsg = {
                WeChatId: chat.WeChatId, // 商家个人微信内部全局唯一识别码
                Talker: chat.FriendId, // 邀请者
                MsgSvrId: chat.MsgSvrId, // 邀请消息的msgSvrId
                MsgContent: JSON.stringify(jContent) // 回传邀请信息的内容（json）
              }
              // 同意加入群聊
              this.$store.dispatch('websocket/AgreeJoinChatRoomTask', contentMsg)
            } else {
              const url = jContent.Url
              if (this.currentMode === 'electron') {
                const { shell } = window.require('electron')
                shell.openExternal(url)
              } else {
                const a = document.createElement('a')
                a.setAttribute('href', url)
                a.setAttribute('target', '_blank')
                a.setAttribute('id', 'js_a')
                // 防止反复添加
                if (document.getElementById('js_a')) {
                  document.body.removeChild(document.getElementById('js_a'))
                }
                document.body.appendChild(a)
                a.click()
              }
            }
            break
          case '[聊天记录]':
            break
          default:
            break
        }
      }
    },
    // 收转账
    taskTransMoney(chat) {
      let content = chat.Content
      const regJson = new RegExp(/^{.+}$/)
      if (chat.FriendId.indexOf('@chatroom') > 0 || chat.FriendId.indexOf('@im.chatroom') > 0) {
        content = content.replace(/\S+?:/, '').replace(/^\n+|\n+$/g, '')
      }
      if (typeof content === 'string' && regJson.test(content)) {
        const jContent = JSON.parse(content)
        if (chat.IsSend) return
        if (jContent.PaySubType && jContent.PaySubType === 3) {
          this.$message({
            type: 'info',
            message: '该转账已经接收！',
            duration: 1000
          })
          return
        }
        // 超时不能打开
        const limiTime = parseInt(new Date().getTime() / 1000, 10)
        if (limiTime - jContent.InvalidTime >= 24 * 60 * 60) {
          this.$message({
            type: 'info',
            message: '该转账已经过期！',
            duration: 1000
          })
          return
        }
        TakeLuckyMoneyTask(chat.WeChatId, chat.FriendId, chat.MsgSvrId, jContent.Key)
      }
    },
    // 查看红包详情
    queryHbDetailTask(chat) {
      let content = chat.Content
      const regJson = new RegExp(/^{.+}$/)
      if (chat.FriendId.indexOf('@chatroom') > 0 || chat.FriendId.indexOf('@im.chatroom') > 0) {
        content = content.replace(/\S+?:/, '').replace(/^\n+|\n+$/g, '')
      }
      if (typeof content === 'string' && regJson.test(content)) {
        content = JSON.parse(content)
      }
      if (!content.Key || !chat.WeChatId) return
      QueryHbDetailTask(chat.WeChatId, content.Key)
      this.$message({
        type: 'info',
        message: '正在获取红包详情！',
        duration: 1000
      })
    },
    // 收红包
    takeLuckMoney(chat) {
      // if (chat.Status && chat.Status === 3) {
      //   this.$message.warning('该红包已经打开，不要重复打开！')
      //   return
      // }

      let content = chat.Content
      const regJson = new RegExp(/^{.+}$/)

      if (chat.FriendId.endsWith('chatroom')) {
        content = content.replace(/\S+?:/, '').replace(/^\n+|\n+$/g, '')
        this.$alert('不能打开自己的红包！', '提示')
      } else if (chat.FriendId.endsWith('openim')) {
        this.$alert('企业微信的红包暂不支持！', '提示')
        return
      } else {
        if (chat.IsSend) {
          this.$alert('不能打开自己的红包！', '提示')
        }
      }

      if (typeof content === 'string' && regJson.test(content)) {
        const jContent = JSON.parse(content)
        const time = parseInt(new Date().getTime() / 1000, 10)
        if (time - jContent.InvalidTime >= 24 * 60 * 60) {
          this.$message.warning('已过期')
          return
        }

        TakeLuckyMoneyTask(chat.WeChatId, chat.FriendId, chat.MsgSvrId, jContent.Key)
      }
    },
    // 能转发
    canTransform(chat) {
      if (this.transportType.indexOf(chat.ContentType) >= 0) {
        // 能转发
        this.chat2Transport = chat
        this.transportMessageVisible = true
      } else {
        this.$message.info('该消息类型不能转发！')
      }
    },
    // 收藏
    collectionMsg(chat) {
      if (chat.ContentType === 'Emoji') {
        if (chat.IsSend) {
          this.$message.warning('不能收藏自己发的emoji!')
          return
        }
        const { WeChatId, Content } = chat
        if (WeChatId && Content) {
          const { Md5 } = JSON.parse(Content.replace(/\w{6,20}:{?/, '{'))
          if (!Md5) return
          PullEmojiInfoTask(WeChatId, Md5)
        }
      } else {
        const message = {
          restype: chat.ContentType === 'WeApp' ? 13 : 6,
          content: chat.Content.replace(/\w{6,20}:{?/, '{') // 内容
        }
        addResources(
          this.currentUser.SupplierId,
          JSON.stringify(message),
          chat.ContentType === 'WeApp' ? 4 : 3,
          chat.MsgSvrId
        )
          .then((res) => {
            if (res.code === 0) {
              this.$message.success('添加到素材库成功！')
            }
          })
          .catch((err) => {
            this.$message.error(err.message)
          })
      }
    },
    // 选为待发素材
    setCircleContent(chat) {
      const chatId = this.chatListMap.findIndex((x) => {
        return x === chat.MsgSvrId
      })
      if (chatId >= 0) {
        this.$store.commit('circleManager/REMOVE_CHAT_LIST', chatId)
      } else {
        this.$store.commit('circleManager/SET_CHAT_LIST', chat)
        if (chat.ContentType === 'Picture') {
          // 判断是否有大图
          if (chat.Url) {
            return
          } else if (this.bigImageMap[chat.MsgId]) {
            // 本地有大图
            chat.Url = this.bigImageMap[chat.MsgId]
          } else {
            // 图片需要获取大图
            this.getChatDetail(chat)
          }
        }
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    beforeCloseHandle(done) {
      this.multipleSelection = []
      this.$refs.multipleTable.clearSelection() // 删除后清空之前选择的数据
      this.$refs.multipleTable2.clearSelection() // 删除后清空之前选择的数据
      done()
    },
    // 转发
    forwardMessage() {
      if (this.multipleSelection.length === 0) {
        this.$alert('至少选择一个转发对象！', '提示', {
          type: 'warning',
          confirmButtonText: '确定'
        })
        return
      } else if (this.multipleSelection.length > 9) {
        this.$alert('最多只能选择9个转发对象！', '提示', {
          type: 'warning',
          confirmButtonText: '确定'
        })
        return
      } else {
        const friendIds = []
        this.multipleSelection.forEach((x) => {
          if (x.FriendId) {
            friendIds.push(x.FriendId)
          } else {
            friendIds.push(x.UserName)
          }
        })
        const parameter = {
          MsgSrvId: this.chat2Transport.MsgSvrId, // 消息Id
          WeChatId: this.chat2Transport.WeChatId, //
          FriendIds: friendIds.join(','), // 目标人群id列表，用逗号,分隔
          ExtMsg: '', // 附带消息
          Talker: this.chat2Transport.FriendId // 转发消息的会话
        }
        this.$store.dispatch('websocket/ForwardMessageTask', parameter)
        this.transportMessageVisible = false
        this.multipleSelection = []
        this.$refs.multipleTable.clearSelection() // 删除后清空之前选择的数据
        this.$refs.multipleTable2.clearSelection() // 删除后清空之前选择的数据
      }
    },
    // 修改pageSize
    handleSizeChange(val) {
      this.pageSize = val
    },
    // 修改pageSize
    handleChatRoomSizeChange(val) {
      this.chatRoomPageSize = val
    },
    // 修改当前页
    handleCurrentChange(val) {
      this.currentPage = val
    },
    handleChatRoomCurrentChange(val) {
      this.pageNo = val
    },
    // 消息撤回
    revokeMessageTask(chat) {
      if (new Date().getTime() - chat.CreateTime >= 1000 * 60 * 2) {
        this.$message.warning('消息发出超过2分钟，不能撤回！')
        return
      }
      RevokeMessageTask(this.currentWeChatId, this.currentFriendId, chat.MsgSvrId, '')
    },
    // @群成员 该方法只支持@一个人 如果要同时@多人请修改逻辑
    atSomebody(chat) {
      //console.log(this.currentFriend)
      const memberId = chat.Content.split(':')[0]
      const memberName = this.getMemberName(memberId)
      const textarea = document.querySelector('#textarea')
      // 如果要@的人已经不在群聊
      if (this.currentFriend.MemberList && this.currentFriend.MemberList.indexOf(memberId) < 0) {
        this.$message.warning('该成员已经不在群里！')
        return
      }
      const atContainer = document.createElement('span')
      const at = document.createElement('span')
      const spanLeft = document.createElement('span')
      const spanRight = document.createElement('span')

      spanLeft.className = 'text-left'
      spanRight.className = 'text-right'

      at.className = 'at'
      at.innerHTML = '@' + memberName + '&nbsp'
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
        let selection = window.getSelection()
        let range = selection.getRangeAt(0)
        range.selectNode(node)
        selection.collapseToStart()
      }
      textarea.appendChild(spanLeft)
      textarea.appendChild(atContainer)
      textarea.appendChild(spanRight)
      this.$nextTick(() => {
        const newText = textarea.innerText
        this.$store.commit('conversation/SET_CONTENT', newText)
      })
      if (this.remark) {
        if (!this.remark.includes(memberId)) {
          this.$store.commit('conversation/SET_REMARK', this.remark + ',' + memberId)
        }
      } else {
        this.$store.commit('conversation/SET_REMARK', memberId)
      }
    },
    // 引用消息
    quoteMsg(chat) {
      const qc = {
        quoteSvrId: chat.MsgSvrId || chat.MsgSvrId,
        quoteType: chat.ContentType
      }
      //console.log(this.currentWechat, this.currentFriend, chat)
      // 群聊
      if (chat.FriendId.indexOf('@chatroom') > 0 || chat.FriendId.indexOf('@im.chatroom') > 0) {
        if (chat.IsSend) {
          // 引用自己的消息
          qc.displayName = this.currentWechat.WeChatNick
          qc.quoteUser = this.currentWechat.WeChatId
          qc.content = chat.Content
        } else {
          // 引用群成员的消息
          const chatContent = chat.Content
          const memberId = chatContent.split(':')[0]
          qc.quoteUser = memberId
          qc.content = chatContent.replace(/\S+?:/, '').replace(/^\n+|\n+$/g, '')
          qc.displayName = chat.FriendNick
        }
      } else {
        if (chat.IsSend) {
          // 引用自己的消息
          qc.displayName = this.currentWechat.WeChatNick
          qc.quoteUser = this.currentWechat.WeChatId
          qc.content = chat.Content
        } else {
          // 引用好友的消息
          qc.displayName = this.currentFriend.FriendNick
          qc.quoteUser = this.currentFriend.FriendId
          qc.content = chat.Content
        }
      }
      //console.log(qc)
      this.$store.commit('conversation/SET_QUOTE_MSG', qc)
      this.$store.commit('conversation/SET_QUOTE_DETAIL', qc)
    },
    // 踢人
    knickSomeBody(chat) {
      // 先判断该好友是否还在群里
      const memberId = chat.Content.split(':')[0]
      const memberName = this.getMemberName(memberId)
      // 如果要踢的人已经不在群聊
      if (this.currentFriend.MemberList.indexOf(memberId) < 0) {
        this.$message.warning('该成员已经不在群里！')
        return
      }
      this.$confirm(`是否确认删除成员 ${memberName} ?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.knicking = true
          const message = {
            WeChatId: this.currentWeChatId, // string 商家所属微信号
            ChatRoomId: this.currentFriendId, // string 群聊id
            Action: 3, // EnumChatRoomAction 指令
            Content: memberId // string 指令内容
          }
          this.$store.dispatch('websocket/ChatRoomActionTask', message)
          setTimeout(() => {
            this.knicking = false
          }, 2000)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // // 鼠标右键
    // rightEvent(event, chat) {
    //   this.showRight = false
    //   this.chatChose = chat
    //   const top = event.pageY
    //   const left = event.pageX
    //   const re = document.getElementById('chatRightEvents')
    //   re.style.top = top + 'px'
    //   re.style.left = left + 'px'
    //   this.showRight = true
    // },
    // // 隐藏右键菜单 废弃
    // hideRight() {
    //   this.showRight = false
    // }
    groupModalClose() {
      this.groupModal.visible = false
    },
    collectWebApp(webApp) {
      const regJson = new RegExp(/^{.+}$/)
      let wepAppContent = webApp.Content
      if (webApp.FriendId && webApp.FriendId.indexOf('chatroom') > 0 && !regJson.test(wepAppContent)) {
        if (!wepAppContent.startsWith('http')) {
          wepAppContent = wepAppContent.replace(/\S+?:/, '').replace(/^\n+|\n+$/g, '')
        }
      }

      this.groupModal.webApp = webApp
      this.groupModal.visible = true
      const content = JSON.parse(wepAppContent)
      const type = content.Type === '33' ? 7 : 5
      materialGroupGet(type)
        .then((res) => {
          if (res.code === 200) {
            const groups = res.result.groupList || []
            this.groupModal.groups = groups
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    groupModalConfirm() {
      const content = JSON.parse(this.groupModal.webApp.Content)
      webAppAdd(this.groupModal.group, {
        picUrl: content.picUrl,
        picImage: content.picImage,
        clickUrl: content.PagePath,
        title: content.Title,
        desc: content.Des,
        appId: content.SourceName,
        picAesKey: content.picAesKey,
        thumbMd5: content.thumbMd5,
        appNickName: content.Source,
        head: content.Source
      }).then((res) => {
        if (res.code === 200) {
          this.groupModal.visible = false
          this.$message.success('收藏成功')
        }
      })
    },

    // async showInterval(chat) {
    //   console.log(chat)
    //   let content = JSON.parse(chat.Content)
    //   this.intervalModal.records = []
    //   const { code, data } = await getInternalApi({
    //     wxId: this.currentWeChatId,
    //     friendId: this.currentFriendId,
    //     privateMsgId: content.PrivateMsgId
    //   })
    //   if (code === 0) {
    //     this.intervalModal.records = data
    //     this.intervalModal.visible = true
    //     console.log(data)
    //   }
    // },
    intervalModalClose() {
      this.intervalModal.visible = false
    },

    isFriend(item) {
      //console.log('isFriend', item)
      return this.friends.find((friend) => friend.FriendId === item.ThisFriendId)
    },
    addFriend() {
      this.addFriendModal.visible = true
    },
    addFriendModalClose() {
      this.addFriendModal.visible = false
    },
    addFriendModalConfirm() {
      const content = {
        WeChatId: this.memberDetail.WeChatId,
        ChatroomId: this.currentFriendId, // 所在的群聊id
        FriendId: this.memberDetail.FriendId, // 请求加好友微信内部全局唯一识别码
        Message: this.addFriendModal.Message, // 招呼语
        Remark: this.addFriendModal.Remark // 备注信息
      }
      this.$store.dispatch('websocket/AddFriendInChatRoomTask', content)
      this.addFriendModal.visible = false
      this.$message.success('发送成功')
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
    },
    sendMessage(chat) {
      console.log('sendMessage', chat, this.currentConvs)
      const message = {
        WeChatId: chat.WeChatId,
        UpdateTime: dayjs().valueOf(),
        UserName: chat.ThisFriendId,
        Avatar: chat.FriendAvatar,
        ShowName: chat.FriendNick
      }

      this.$store.commit('conversation/Add_CONV', message)
    },

    contentMouseEnter(e, chat) {
      this.currentContentItem = chat
    },
    contentMouseLeave(e, chat) {
      this.currentContentItem = {}
    },

    async shieldAction(chat, enable, chatRoomId) {
      console.log(chat)
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}
      const { code, data } = await (enable ? cancelShieldApi : shieldApi)({
        account: loginInfo.name,
        wechatId: this.currentWeChatId,
        wxIds: enable ? [chat.ThisFriendId] : undefined,
        friendId: enable ? undefined : chat.ThisFriendId,
        chatRoomId: chat.FriendId,
        chatAllEnable: !chatRoomId
      })
      if (code === 0) {
        this.$message.success('操作成功')
        const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}

        Promise.all([
          this.$store.dispatch('conversation/resetCurrentChats', {
            currentWeChatId: this.currentWeChatId,
            currentFriendId: this.currentFriendId
          }),
          this.$store.dispatch('conversation/resetCurrentChatsCache', {
            currentWeChatId: this.currentWeChatId,
            currentFriendId: this.currentFriendId
          })
        ]).then(() => {
          this.historyRecordHandle(
            this.currentWeChatId,
            this.currentFriendId,
            this.currentUser.NickName,
            loginInfo.name,
            0,
            0,
            10
          )
        })
      }
    }
  },
  mounted() { },
  created() {
    Bus.$on('shieldCancel', () => {
      const loginInfo = localStorage.getItem('LOGIN_INFO') ? JSON.parse(localStorage.getItem('LOGIN_INFO')) : {}

      Promise.all([
        this.$store.dispatch('conversation/resetCurrentChats', {
          currentWeChatId: this.currentWeChatId,
          currentFriendId: this.currentFriendId
        }),
        this.$store.dispatch('conversation/resetCurrentChatsCache', {
          currentWeChatId: this.currentWeChatId,
          currentFriendId: this.currentFriendId
        })
      ]).then(() => {
        this.historyRecordHandle(
          this.currentWeChatId,
          this.currentFriendId,
          this.currentUser.NickName,
          loginInfo.name,
          0,
          0,
          10
        )
      })
    })
    Bus.$on('showImage', (chat) => {
      console.log('showImage', chat)
    })
    Bus.$on('tagChange', (tab) => {
      this.currentTab = tab
    })
    //消息发送成功
    Bus.$on('messageSendSuccess', () => {
      this.scrollBottom()
    })
    //聊天记录更新
    Bus.$on('chatRecordUpdate', (message) => {
      //console.log(message)
      if (!message) return
    })

    Bus.$on('intervalChatRecordUpdate', () => {
      this.$nextTick(() => {
        this.intervalScrollBottom()
      })
    })
    Bus.$on('memberDetailChange', (friend) => {
      this.memberDetail = {
        ...this.memberDetail,
        ...friend
      }
    })

    window.addEventListener('click', () => {
      Object.keys(this.popoverVisible).forEach((key) => {
        this.popoverVisible[key] = false
      })
    })
  },

}
</script>

<style lang="scss" scoped>
.avatar-popover-top-item {
  display: flex;
  align-items: center;

  .ml-10 {
    margin-left: 10px;
  }
}

.big-img-box {
  position: absolute;
  top: 0;
  right: -200px;
}

.show-chats {
  position: relative;
  height: 65%;
  overflow-x: hidden;
  overflow-y: scroll;
  background-color: #f9f9f9;
  opacity: 1;

  .no-more {
    text-align: center;
    margin: 5px 0;
    font-size: 12px;
  }

  &:hover {
    &::-webkit-scrollbar-thumb {
      background-color: #dedede;

      &:hover {
        background-color: rgba(0, 0, 0, 0.2);
      }
    }
  }

  &::-webkit-scrollbar-thumb {
    background-color: transparent;
  }

  .more-message {
    width: 140px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    margin-left: 50%;
    transform: translateX(-50%);
  }

  .more-message-text {
    background-color: #eeeeee;
    color: #666666;
    border-radius: 0px 0px 4px 4px;
    cursor: pointer;
  }

  ::v-deep .quote-content {
    padding: 2px 5px;
    background-color: #f0f0f0;
    border-radius: 4px;
  }

  // #chatRightEvents {
  //   position: absolute;
  //   display: flex;
  //   flex-direction: column;
  //   justify-content: center;
  //   align-items: center;
  //   padding: 10px;
  //   width: 150px;
  //   background: #fff;
  //   border: solid #dcdfe6 1px;
  //   .close-btn {
  //     position: absolute;
  //     top: 0;
  //     right: 5px;
  //     font-size: 16px;
  //     cursor: pointer;
  //     &:hover {
  //       color: #41c0fc;
  //     }
  //   }
  // }

  .chat-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 5px;
    padding: 0 5px;

    .chat-time {
      font-size: 12px;
      padding: 5px 10px;
      border-radius: 5px;
      color: white;
      margin: 5px auto;
      background: #dadada;
    }

    .chat-content {
      display: flex;
      position: relative;
      font-size: 12px;
      color: $font-color-base;

      .content-container {
        display: flex;
      }

      .content-message-container {
        width: 100%;
      }

      .content-content-container {
        display: flex;
        flex-direction: row-reverse;
        align-items: center;
        max-width: 60%;
      }

      .el-avatar {
        border-radius: 0;
      }

      .member-info {
        max-width: 60%;
        position: absolute;
        color: $font-color-2;
        top: 0;
        left: 48px;
      }

      .content-content {
        min-height: 40px;
        line-height: 25px;
        padding: 8px 12px;
        margin-left: 7px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        position: relative;
        background: white;
        word-break: break-all;
        border: 1px solid #e7e7e7;

        ::v-deep .chat-img {
          width: 100px;
          height: auto;
        }

        ::v-deep .chat-img-icon {
          font-size: 40px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translateX(-50%) translateY(-50%);
          cursor: pointer;
        }

        .chat-text {
          font-size: 14px;
        }

        .chat-picture {
          width: 100px;
          display: flex;
          align-items: center;
        }

        .chat-voice {
          //width: 300px;
          max-width: 100%;
          display: flex;
          align-items: center;
        }

        ::v-deep .chat-video {
          display: flex;
          align-items: center;
          position: relative;

          .play-video {
            color: #98e165;
            position: absolute;
            font-size: 50px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            cursor: pointer;
          }

          .video-box {
            width: 200px;
            height: 120px;
            object-fit: cover;
          }

          .video-box-no {
            width: 100px;
            height: auto;
          }
        }

        ::v-deep .chat-system {
          color: gray;

          a {
            color: #41c0fc;
          }
        }

        ::v-deep .chat-link {
          flex-direction: column;
          width: 300px;
          max-width: 100%;
          cursor: pointer;

          .link-title {
            font-size: 14px;
            font-weight: 600;
          }

          .link-content {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .link-des {
              flex: auto;
              color: #aaaaaa;
              font-size: 10px;
              margin-right: 5px;
              overflow: hidden;
              text-overflow: ellipsis;
              word-break: break-all;
              word-wrap: break-word;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 3;
            }

            .link-img {
              max-width: 50px;
              max-height: 50px;
              min-height: 50px;
              min-width: 50px;
              border-radius: 5px;
            }
          }

          .link-type {
            color: #aaaaaa;
            margin-top: 5px;
            text-align: start;
            border-top: solid #e8eaec 1px;
          }
        }

        ::v-deep .chat-file {
          flex-direction: column;
          width: 300px;
          max-width: 100%;
          cursor: pointer;

          .file-title {
            font-size: 14px;
            font-weight: 600;
          }

          .file-content {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .file-des {
              flex: auto;
              color: #aaaaaa;
              font-size: 12px;
              margin-right: 5px;
              overflow: hidden;
              text-overflow: ellipsis;
              word-break: break-all;
              word-wrap: break-word;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 3;
            }

            .file-icon {
              font-size: 30px;
              margin-right: 20px;
            }
          }

          .file-type {
            color: #aaaaaa;
            margin-top: 5px;
            text-align: start;
            border-top: solid #e8eaec 1px;
          }
        }

        ::v-deep .chat-app {
          width: 300px;
          max-width: 100%;
          cursor: pointer;
          display: flex;
          flex-direction: column;

          .app-des {
            display: flex;

            .app-icon {
              width: 20px;
              height: 20px;
            }

            .app-source {
              width: 100%;
              font-size: 12px;
              margin-left: 5px;
              color: gray;
            }
          }

          .app-title {
            width: 100%;
            height: 30px;
            font-size: 12px;
            font-weight: 600;
            line-height: 30px;
          }

          .app-img {
            align-self: center;
            max-width: 200px;
          }

          .app-typestr {
            height: 25px;
            margin-top: 5px;
            line-height: 25px;
            color: gray;
            text-align: start;
            border-top: solid #aaaaaa 1px;
          }
        }

        ::v-deep .chat-namecard {
          width: 300px;
          max-width: 100%;
          cursor: pointer;

          .namecard-info {
            display: flex;
            align-items: center;

            .namecard-img {
              height: 50px;
              width: 50px;
              min-width: 50px;
              border-radius: 5px;
            }

            .namecard-nickname {
              width: 250px;
              font-size: 14px;
              margin-left: 5px;
            }
          }

          .namecard-tip {
            color: gray;
            margin-top: 5px;
            border-top: #aaaaaa solid 1px;
          }
        }

        ::v-deep .chat-luckmoney {
          width: 300px;
          max-width: 100%;
          background: #fa9d3b;
          cursor: pointer;

          .luck-info {
            display: flex;
            align-items: center;
            height: 60px;
            width: 100%;

            .luck-img {
              max-width: 50px;
            }

            .wish-open {
              display: flex;
              flex-direction: column;
            }

            .luck-wish {
              width: 200px;
              font-size: 14px;
              margin-left: 10px;
              color: white;
            }

            .luck-flag {
              width: 60px;
              font-size: 14px;
              margin-left: 10px;
              color: white;
            }

            .money-opened {
              margin-left: 10px;
              color: white;
            }
          }

          .luckmoney-tip {
            color: gray;
            background: white;
            margin-top: 5px;
          }

          &:hover {
            background: rgba($color: #fa9d3b, $alpha: 0.9);
          }
        }

        ::v-deep .chat-moneytran {
          width: 300px;
          max-width: 100%;
          background: #fa9d3b;
          cursor: pointer;

          .moneytran-info {
            display: flex;
            align-items: center;
            height: 60px;
            width: 100%;

            .moneytran-img {
              max-width: 30px;
              margin-left: 10px;
            }

            .moneytran-feed,
            .moneytran-flag {
              font-size: 14px;
              margin-left: 10px;
              color: white;
            }
          }

          .moneytran-tip {
            color: gray;
            background: white;
            margin-top: 5px;
          }

          &:hover {
            background: rgba($color: #fa9d3b, $alpha: 0.9);
          }
        }

        :deep(.chat-internal) {
          font-size: 12px;
          color: #999999;
          background-color: #f2f2f2;
          border-radius: 4px;
          padding: 2px 8px;
        }

        .chat-audio {
          display: flex;
          align-items: center;

          .chat-audio-icon {
            width: 24px;
            cursor: pointer;
          }

          .chat-audio-time {
            font-size: 12px;
            color: #333333;
            margin-left: 6px;
          }

          .chat-audio-time-active {
            color: #0cc160;
          }

          .chat-audio-progress {
            display: flex;
            align-items: center;
            position: relative;
            margin: 0 5px;

            .chat-audio-progress-item {
              cursor: pointer;

              .chat-audio-progress-item-unit {
                width: 2px;
                background-color: #fff;
                margin-right: 2px;
              }
            }
          }
        }

        .chat-red-packet {
          background-color: #fff;
          margin: -8px -12px;
          border-radius: 5px;

          .chat-red-packet-body {
            display: flex;
            align-items: center;
            height: 90px;
            background-color: #fa9c3e;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
            color: rgba(256, 256, 256, 0.9);
            padding-left: 5px;

            img {
              width: 48px;
              margin-right: 5px;
            }
          }

          .chat-red-packet-foot {
            color: #999999;
            font-size: 12px;
            padding: 5px 15px;
          }
        }

        .chat-mp-name-card {
          margin: -8px -12px;

          .chat-mp-name-card-body {
            display: flex;
            align-items: center;
            height: 60px;
            color: #000;
            padding-left: 5px;

            img {
              width: 48px;
              margin-right: 5px;
            }
          }

          .chat-mp-name-card-foot {
            color: #999999;
            font-size: 12px;
            padding: 5px 5px;
            border-top: 1px #efefef solid;
            margin: 0 10px;

            .chat-mp-name-card-foot-des {
              margin-left: 5px;
              color: #333;
            }
          }
        }

        .chat-name-card {
          margin: -8px -12px;

          .chat-name-card-body {
            display: flex;
            align-items: center;
            height: 60px;
            color: #000;
            padding-left: 5px;

            img {
              width: 48px;
              margin-right: 5px;
            }
          }

          .chat-name-card-foot {
            color: #999999;
            font-size: 12px;
            padding: 5px 5px;
            border-top: 1px #efefef solid;
            margin: 0 10px;

            .chat-name-card-foot-des {
              margin-left: 5px;
              color: #333;
            }
          }
        }

        .chat-file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .chat-file-item-left {
            .chat-file-item-left-top {
              font-size: 14px;
              margin-bottom: 10px;
            }

            .chat-file-item-left-bottom {
              color: #999999;
            }
          }

          .chat-file-item-right {
            flex-shrink: 0;

            .el-icon-document {
              font-size: 46px;
            }

            img {
              width: 46px;
              height: 46px;
            }
          }
        }
      }

      .content-interval {
        width: 100%;
        max-width: 100% !important;
        justify-content: center;
        padding: 0;

        .chat-interval-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;

          .chat-interval-see {
            position: relative;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 15px;
            background-color: #f1f1f1;
            padding: 25px 0;

            .el-button {
              height: 30px;
              line-height: 30px;
              padding: 0 5px;
              font-size: 12px;
              color: #333333;
            }

            .chat-interval-see-message {
              position: absolute;
              right: 10px;
              display: flex;
              align-items: center;
              user-select: none;
              filter: blur(4px);

              .chat-interval-see-message-info {
                background-color: #96ea69;
                color: #000000;
                padding: 8px;
                border-radius: 4px;
                margin-right: 10px;
              }
            }
          }
        }
      }

      .not-style {
        background-color: transparent;
        padding: 0;
        border: none;

        &::before {
          display: none;
        }

        &::after {
          display: none;
        }
      }

      .send-state {
        display: flex;
        align-items: center;
        justify-content: center;
        max-width: 30%;
        flex-wrap: wrap;
      }

      .chat-room {
        margin-top: 20px;
      }

      .triangle {
        &::before {
          content: '';
          border: 6px solid transparent;
          border-right: 6px solid #e7e7e7;
          position: absolute;
          top: 10px;
          left: -13px;
        }

        &::after {
          content: '';
          border: 6px solid transparent;
          border-right: 6px solid white;
          position: absolute;
          top: 10px;
          left: -12px;
        }

        &:hover {
          background-color: #f6f6f6;

          &::after {
            content: '';
            border: 6px solid transparent;
            border-right: 6px solid #f6f6f6;
            position: absolute;
            top: 10px;
            left: -12px;
          }
        }
      }

      .triangle-send-own {
        margin-right: 7px;
        background: #9eea6a;

        &::before {
          content: '';
          border: 6px solid transparent;
          border-left: 6px solid #e7e7e7;
          position: absolute;
          top: 10px;
          right: -13px;
        }

        &::after {
          content: '';
          border: 6px solid transparent;
          border-left: 6px solid #9eea6a;
          position: absolute;
          top: 10px;
          right: -12px;
        }

        &:hover {
          background-color: #98e165;

          &::after {
            border-left: 6px solid #98e165;
          }
        }
      }

      .triangle-send {
        margin-right: 7px;
        background: #d9eaff;

        &::before {
          content: '';
          border: 6px solid transparent;
          border-left: 6px solid #e7e7e7;
          position: absolute;
          top: 10px;
          right: -13px;
        }

        &::after {
          content: '';
          border: 6px solid transparent;
          border-left: 6px solid #d9eaff;
          position: absolute;
          top: 10px;
          right: -12px;
        }

        &:hover {
          background-color: #bad8ff;

          &::after {
            border-left: 6px solid #bad8ff;
          }
        }
      }

      .system-info {
        border: none;
        max-width: 80%;
        margin: 0 auto;
        background: inherit;
      }

      .chat-nick {
        width: 200px;
        position: absolute;
        top: -30px;
        left: 0px;
      }

      .chat-nick-send {
        width: 200px;
        text-align: right;
        position: absolute;
        top: 5px;
        right: 0px;
      }
    }

    .chat-content-send {
      flex-direction: row-reverse;
    }

    .message-action-revoke {
      background-color: #f2f2f2;
      border-radius: 4px;
      padding: 4px 15px;
      color: #999999;
      font-size: 12px;
      margin-left: 6px;
    }

    .message-tag-interval {
      background-color: #f2f2f2;
      border-radius: 4px;
      padding: 4px 15px;
      color: #999999;
      font-size: 12px;
      margin-left: 6px;
    }
  }

  .chat-item-interval {
    margin: 0;
    padding-bottom: 12px;
    background-color: #f0f0f0;

    .chat-content {
      padding-top: 25px;
    }
  }

  ::v-deep .detail-dialog {
    overflow: hidden;

    .el-dialog {
      overflow: hidden;
      height: 500px;
      min-width: 500px;
      display: flex;
      flex-direction: column;

      .el-dialog__body {
        overflow: hidden;
        margin: auto;
        flex: 1 1 auto;
        display: flex;
        align-items: center;
        justify-content: center;

        .detail-dialog-img {
          @include scroll;
          max-height: 100%;
          max-width: 100%;
          overflow: auto;
        }

        .detail-dialog-video {
          max-height: 100%;
          width: auto;
        }
      }
    }
  }

  .member-detail {
    display: flex;
    flex-direction: column;

    ::v-deep .el-dialog {
      width: 500px;

      .el-dialog__body {
        padding: 20px;
      }
    }

    .member-detail-info {
      display: flex;

      .member-detail-text {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin-left: 20px;
        overflow: hidden;
      }
    }

    .member-detail-btns {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
    }
  }

  ::v-deep .transport-message {
    .el-dialog {
      .el-dialog__body {
        padding: 0;

        .el-tabs {
          padding: 0 10px;

          .friends-list {
            height: 400px;
            overflow: auto;
            display: flex;
            flex-direction: column;
            align-items: center;

            .el-pagination {
              margin: 5px 0;
            }
          }
        }
      }
    }
  }

  .new-message {
    float: right;
    position: sticky;
    bottom: 10px;
    right: 10px;
    width: 150px;
    padding: 5px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #ffffff;
    box-shadow: 0px 1px 5px 0px rgba(142, 142, 142, 0.5);
    border-radius: 4px;
    color: #0cc160;
    cursor: pointer;

    img {
      width: 16px;
      margin-right: 5px;
    }
  }
}

.hide-scroll {
  &::-webkit-scrollbar-thumb {
    background-color: transparent !important;
  }
}</style>
