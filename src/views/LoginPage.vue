<template>
  <div class="login-page">
    <!-- electron menu -->
    <div v-if="currentMode === 'electron'" style="-webkit-app-region: drag" class="electron-menu">
      <i
        style="margin-right: 10px; -webkit-app-region: no-drag"
        class="fa fa-minus fa-lg"
        aria-hidden="true"
        @click="minimizeWindow"
      ></i>
      <i style="-webkit-app-region: no-drag" class="fa fa-times fa-lg" aria-hidden="true" @click="closeElectron"></i>
    </div>
    <img class="login-bg" src="../assets/images/bg.png" alt="" />
    <div class="login-page-form">
      <!-- logo -->
      <div class="login-logo">
        <img v-if="origin.includes('localhost')" src="../assets/images/icon.png" alt srcset />
        <img v-else-if="origin.includes('hzdaba.cn')" src="../assets/images/icon1.png" alt srcset />
        <img v-else src="../assets/images/icon.png" alt srcset />
        <!-- <span>eco</span> -->
      </div>
      <!-- 登录表单 -->
      <el-form ref="ruleForm" :model="loginForm" :rules="rules" :size="'medium'" status-icon>
        <!-- 用户名 -->
        <el-form-item prop="name">
          <el-input
            v-model.trim="loginForm.name"
            step="background:#f9fbff;"
            size="medium"
            maxlength="30"
            placeholder="请输入账号"
            prefix-icon="el-icon-user-solid"
          ></el-input>
          <!-- @input="changeName()" -->
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="pass">
          <el-input
            v-model.trim="loginForm.pass"
            type="password"
            size="medium"
            autocomplete="off"
            show-password
            placeholder="请输入密码"
            maxlength="30"
            prefix-icon="el-icon-unlock"
          ></el-input>
        </el-form-item>
      </el-form>
      <!-- 同意协议|忘记密码 -->
      <div class="forget-password">
        <el-checkbox v-model="agreement">
          <span style="color: #a2a2a2">我已阅读并同意</span>
          <span style="color: #e96500">用户协议</span>
        </el-checkbox>
        <!-- <el-button type="text" style="color: #e96500">忘记密码</el-button> -->
        <el-checkbox v-model="rememberPwd">记住密码</el-checkbox>
      </div>
      <!-- 登录 -->
      <div class="login_btn_box">
        <el-button
          type="primary"
          :loading="logined"
          :disabled="logined"
          class="login-btn"
          @click="submitForm('ruleForm')"
        >
          登 录
        </el-button>
      </div>
      <div class="forget-password">
        <!-- <div>
          还没有账号?
          <el-button type="text" style="color: #e96500">免费注册</el-button>
        </div> -->
        <!-- <div>
          <el-button
            style="color: #a2a2a2"
            type="text"
            size="medium"
            @click="SET_CLIENT_OR_SERVER(clientOrServer === 'client' ? 'server' : 'client')"
            v-text="clientOrServer === 'client' ? '客户端登陆' : '管理端登录'"
          ></el-button>
        </div> -->
      </div>

      <div style="text-align: right; width: 290px" @click="setModalAction">
        <el-button type="text">域名设置</el-button>
      </div>
    </div>
    <el-dialog
      width="500px"
      title="设置"
      :visible.sync="setModal.visible"
      append-to-body
      :close-on-click-modal="false"
      :before-close="setModalCancel"
    >
      <el-row type="flex" align="middle" style="margin-bottom: 20px">
        <el-col :span="6" style="text-align: right">域名地址：</el-col>
        <el-col :span="18"><el-input v-model="setModal.url"></el-input></el-col>
      </el-row>

      <span slot="footer">
        <el-button type="primary" @click="setConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import { login } from '../api/httpApiAdmin' // 管理端登录
import { DeviceAuthReq } from '../api/webSocketApi' // 管理端登录
import { createWebSocket, closeWebsocket } from '../websocket/websocket.js'

export default {
  name: 'LoginPage',
  data() {
    // 用户名验证规则
    const checkName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('用户名不能为空'))
      } else {
        callback()
      }
    }
    // 密码验证规则
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        callback()
      }
    }
    return {
      agreement: true, // 同意协议
      loginForm: {
        name: '',
        pass: ''
      }, // 登录表单
      rules: {
        name: [{ validator: checkName, trigger: 'blur' }],
        pass: [{ validator: validatePass, trigger: 'blur' }]
      }, // 表单验证
      logined: false, // admin 登录中
      version: require('../../package.json').version, // 版本号
      rememberPwd: false, // 记住密码
      // modifyWebsockUrl: false, // 本地调试
      // newWebsockUrl: '192.168.0.116:13088' // 新的websocket地址

      origin: window.location.origin,
      setModal: { visible: localStorage.getItem('_chat_url_') ? false : true, url: localStorage.getItem('_chat_url_') }
    }
  },
  computed: {
    ...mapState({
      webSocketState: 'webSocketState', // websocket连接状态
      clientOrServer: 'clientOrServer', // 客户端还是管理端 client server
      currentMode: 'currentMode' // 是pc还是web
    }),
    // 本地保存的用户名
    localName() {
      if (localStorage.getItem('localNameOfJuboChat')) {
        return localStorage.getItem('localNameOfJuboChat')
      }
      return ''
    },
    // 本地保存的密码
    localPwd() {
      if (localStorage.getItem('localPwdOfJuboChat')) {
        return localStorage.getItem('localPwdOfJuboChat')
      }
      return ''
    }
  },
  watch: {
    // 监听记住密码
    rememberPwd(val) {
      if (val) {
        localStorage.setItem('remarkPwdOfJuboChat', 1)
      } else {
        localStorage.removeItem('remarkPwdOfJuboChat')
        localStorage.removeItem('localNameOfJuboChat')
        localStorage.removeItem('localPwdOfJuboChat')
      }
    }
    // 监听本地调试
    // modifyWebsockUrl(val) {
    //   if (val) {
    //     localStorage.setItem('ModifyWSOfJuboChat', 1)
    //   } else {
    //     localStorage.removeItem('ModifyWSOfJuboChat')
    //   }
    // }
  },
  created() {
    this.$store.commit('SET_IS_PRE_LOAD_HISTORY_RECORD', true)
  },
  mounted() {
    // 记住密码
    if (localStorage.getItem('remarkPwdOfJuboChat')) {
      this.rememberPwd = true
      if (this.localName && this.localPwd) {
        this.loginForm.name = this.localName
        this.loginForm.pass = this.localPwd
      }
    }
    // 修改ws
    // if (localStorage.getItem('ModifyWSOfJuboChat')) {
    //   this.modifyWebsockUrl = true
    //   if (localStorage.getItem('localWSOfJuboChat')) {
    //     this.newWebsockUrl = localStorage.getItem('localWSOfJuboChat')
    //   }
    // }
  },
  methods: {
    ...mapMutations({
      SET_ADMIN_INO: 'SET_ADMIN_INO', // 设置当前的管理员信息
      SET_LOGIN_INFO: 'SET_LOGIN_INFO', // 设置登录信息
      SET_WEBSOCKET_TOKEN: 'SET_WEBSOCKET_TOKEN', // 设置token
      SET_CLIENT_OR_SERVER: 'SET_CLIENT_OR_SERVER', // 设置当前是客户是管理
      SET_LOGIN_LOADING: 'websocket/SET_LOGIN_LOADING', // 设置通过websocket登录的状态
      SET_URL: 'SET_URL'
    }),
    // 登录
    submitForm(formName) {
      // 表单验证通过，可以登录
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 记住密码
          if (this.rememberPwd) {
            localStorage.setItem('localNameOfJuboChat', this.loginForm.name)
            localStorage.setItem('localPwdOfJuboChat', this.loginForm.pass)
          }
          localStorage.setItem(
            'LOGIN_INFO',
            JSON.stringify({
              name: this.loginForm.name,
              pass: this.loginForm.pass
            })
          )
          // 保存登录的信息
          this.SET_LOGIN_INFO({ name: this.loginForm.name, pass: this.loginForm.pass })
          // 客户端还是管理端
          if (this.clientOrServer === 'client') {
            switch (this.webSocketState) {
              case 0:
                this.$alert('websocket正在连接，请稍后再试！', '提示', { type: 'info' })
                break
              case 1:
                // 显示loading
                this.logined = true
                setTimeout(() => {
                  DeviceAuthReq(this.loginForm.name, this.loginForm.pass)
                }, 500)
                // 5秒后自动隐藏loading
                setTimeout(() => {
                  this.logined = false
                }, 5000)
                break
              default:
                this.$alert('websocket连接失败！', '提示', { type: 'warning' })
                break
            }
          } else {
            this.logined = true
            login(this.loginForm.name, this.loginForm.pass)
              .then((res) => {
                this.logined = false
                if (res.code === 0) {
                  // if (process.env.VUE_APP_CURRENTMODE === 'electron') {
                  //   const { ipcRenderer } = window.require('electron')
                  //   ipcRenderer.send('operations', 'login')
                  // }
                  // 设置用户信息
                  this.$store.commit('SET_ADMIN_INO', res.data)
                  // 设置token
                  this.$store.commit('SET_HTTP_TOKEN', res.data.token)
                  // 跳转到后台管理页面
                  this.$router.replace({ name: 'admin' })
                } else {
                  this.logined = false
                }
              })
              .catch(() => {
                this.logined = false
              })
          }
        } else {
          return false
        }
      })
    },
    // 重置表单
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    // 最小化
    minimizeWindow() {
      this.$ipcRenderer.send('operations', 'min')
    },
    // 退出electron
    closeElectron() {
      this.$ipcRenderer.send('operations', 'exit')
    },

    setModalAction() {
      this.setModal.url = localStorage.getItem('_chat_url_')
      this.setModal.visible = true
    },
    setModalCancel() {
      if (!this.setModal.url) return this.$message.warning('请先输入域名地址')
      this.setModal.visible = false
    },
    setConfirm() {
      if (!this.setModal.url) return this.$message.warning('请先输入域名地址')
      this.setModal.visible = false
      localStorage.setItem('_chat_url_', this.setModal.url)
      this.$store.commit('SET_URL', this.setModal.url)

      // 如过浏览器支持websocket 创建连接
      if ('WebSocket' in window) {
        createWebSocket(this.setModal.url && `ws://${this.setModal.url}:13088`)
      } else {
        //  如果浏览器不支持WebSocket
        this.$message({
          message: '您的浏览器不支持 WebSocket!，请更换浏览器！',
          type: 'error'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  width: 100%;
  height: 100%;
  background: no-repeat;
  background-image: linear-gradient(135deg, #33b4ff 0%, #177dff 100%);
  background-size: cover;
  display: flex;

  .login-page-form {
    box-sizing: border-box;
    width: 422px;
    height: 497px;
    margin-top: 117px;
    margin-left: 694px;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 10px;
    box-shadow: 0px 3px 6px #bfbfbf57;

    .login-logo {
      display: flex;
      align-items: center;
      margin-top: 66px;
      font-size: 45px;
      font-weight: 600;

      img {
        width: 80px;
      }
    }

    ::v-deep .el-form {
      width: 290px;
      align-self: center;
      margin-top: 32px;
      margin-bottom: 0px;

      .el-form-item {
        width: 290px;
        border-radius: 5px;
      }
    }

    .forget-password {
      width: 290px;
      font-size: 14px;
      background: #fff;
      color: #a2a2a2;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .login_btn_box {
      display: flex;
      justify-content: center;
      margin-top: 36px;
      .login-btn {
        width: 290px;
        height: 42px;
        border-radius: 21px;
        background-color: #177dff;
        border: #177dff;
        font-size: 16px;
      }
    }
  }

  .electron-menu {
    position: absolute;
    top: 0;
    width: 100%;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 10px;
    i {
      cursor: pointer;
    }
  }

  .version {
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 5px;
  }
  .login-bg {
    position: absolute;
    top: 20%;
    left: 10%;
    width: 600px;
  }
}

@media only screen and (max-width: 1205px) {
  .login-page {
    .login-page-form {
      margin-top: 30px;
    }
  }
}
</style>
