'use strict'

import { app, protocol, ipcMain, BrowserWindow, screen, globalShortcut, Menu, Tray } from 'electron'
/* installVueDevtools */
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null
let size = null
let appTray = null
let count = 0
let timer = null
const iconUrl = process.env.NODE_ENV === 'development' ? 'public/app.ico' : `${__dirname}/app.ico`
const emptyUrl = process.env.NODE_ENV === 'development' ? 'public/empty.ico' : `${__dirname}/empty.ico`
const { execFile } = require('child_process')

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true }}])

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    // width: 700, // 宽
    // height: 415, // 高
    width: 1205, // 宽
    height: 717, // 高
    icon: iconUrl,
    frame: false, // 设置为 false 时可以创建一个无边框窗口
    transparent: true,
    resizable: false, // 窗口是否可以改变尺寸
    maximizable: false, // 禁止最大化
    // autoHideMenuBar:true,// 是否隐藏菜单栏
    // titleBarStyle:'hidden',// 窗口标题栏的样式
    // backgroundColor:'#fff',// 窗口的背景颜色为十六进制值
    enableRemoteModule: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  // development 和 production 加载不同的地址
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })

  // 监听renderer发来的信息
  ipcMain.on('operations', function (event, arg) {
    // 登录后的窗口大小
    const width = size.width * 0.65 > 1150 ? size.width * 0.65 : 1150
    const height = size.height * 0.7 > 735 ? size.height * 0.7 : 735
    // 屏幕的大小
    const bw = size.width
    const bh = size.height
    switch (arg) {
      case 'newMsg':
        // 菜单栏闪烁
        win.flashFrame(true)
        // 任务栏 闪烁
        if (!win.isVisible() && !timer) {
          timer = setInterval(function () {
            count++
            if (count % 2 === 0) {
              // appTray.setImage(path.join(trayIcon, 'empty.ico'))
              appTray.setImage(emptyUrl)
            } else {
              appTray.setImage(iconUrl)
            }
          }, 500)
        }
        break
      case 'exit':
        app.quit()
        break
      case 'login':
        // win.setSize(width, height)
        win.center()
        break
      case 'logout':
        {
          const x = parseInt((bw - 700) / 2, 10)
          const y = parseInt((bh - 415) / 2, 10)
          win.setBounds({ x: x, y: y, width: 700, height: 415 })
          // app.relaunch()
          // app.quit()
        }
        // app.exit()
        break
      case 'min':
        // 最小化
        win.minimize()
        break
      case 'max':
        {
          // 最大化或者还原
          // 当前窗口的大小
          const currentWindow = win.getContentBounds()
          const cw = currentWindow.width
          // let ch = currentWindow.height
          // 中心坐标
          const x = parseInt((bw - width) / 2, 10)
          const y = parseInt((bh - height) / 2, 10)
          if (cw >= bw) {
            // 还原
            win.setBounds({ x: x, y: y, width: width, height: height })
          } else {
            // 最大化
            win.setSize(bw, bh)
            win.center()
          }
        }
        break
      case 'hidden':
        // 隐藏窗口
        win.hide()
        break
      case 'screencap':
        {
          const cmdPath =
            process.env.NODE_ENV === 'development' ? 'public/screen/PrintScr.exe' : `${__dirname}/screen/PrintScr.exe`
          // 和渲染进程通讯
          // win.webContents.send('screencap', cmdPath)
          // 截屏
          const screen_window = execFile(cmdPath)
          screen_window.on('exit', function (code) {
            // 执行成功返回 1，返回 0 没有截图
            if (code) {
              win.webContents.paste()
            }
          })
        }
        break
      default:
        break
    }
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // if (isDevelopment && !process.env.IS_TEST) {
  // Install Vue Devtools
  // Devtools extensions are broken in Electron 6.0.0 and greater
  // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
  // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
  // If you are not using Windows 10 dark mode, you may uncomment these lines
  // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
  // try {
  //   await installVueDevtools()
  // } catch (e) {
  //   console.error('Vue Devtools failed to install:', e.toString())
  // }

  // }
  size = screen.getPrimaryDisplay().workAreaSize
  createWindow()
  if (process.platform === 'win32') {
    // 系统托盘图标
    appTray = new Tray(iconUrl)
    // 设置此托盘图标的悬停提示内容
    appTray.setToolTip('客服系统')

    // 设置托盘图标和菜单
    const trayMenuTemplate = [
      // {
      //     label: '打开',
      //     click: () => {
      //         win.show();
      //     }
      // },
      {
        label: '退出',
        click: () => {
          app.quit()
          app.quit() // 因为程序设定关闭为最小化，所以调用两次关闭，防止最大化时一次不能关闭的情况
          // win.webContents.send('operations', 'exit')
        }
      }
    ]
    // 图标的上下文菜单
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate)
    // 设置此图标的上下文菜单
    appTray.setContextMenu(contextMenu)

    // 单击右下角小图标显示应用左键
    appTray.on('click', () => {
      win.isVisible() ? win.hide() : win.show()
      // 不闪烁
      if (timer) {
        clearInterval(timer)
        timer = null
        count = 0
        appTray.setImage(iconUrl)
      }
    })

    // 右键
    appTray.on('right-click', () => {
      appTray.popUpContextMenu(trayMenuTemplate)
    })
  }
  // 注册快捷键 ctrl + shift + l 打开调试窗口
  globalShortcut.register('CommandOrControl+Shift+L', () => {
    const focusWin = BrowserWindow.getFocusedWindow()
    focusWin && focusWin.toggleDevTools()
  })
  // 禁止f5刷新
  globalShortcut.register('F5', () => {
    return false
  })
})

// 恢复f5刷新
app.on('will-quit', () => {
  globalShortcut.unregister('F5')
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
