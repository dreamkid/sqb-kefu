/**
 * axios封装
 * 请求拦截、响应拦截、错误统一处理
 */

// 引入axios
const axios = require('axios')

// 配置方法的优先级是 axios请求配置 > axios实例配置 > axios全局配置
// axios全局配置
// axios.defaults.后边跟的就是axios的那些配置
// 一般修改的全局配置，也就下边这两个
// axios.defaults.timeout = 1000
// axios.defaults.baseURL = 'http://localhost:8080'
// 设置post请求头
// axios.defaults.headers.post['Content-Type'] =
//   'application/x-www-form-urlencoded; charset=UTF-8'

// 创建axios实例
// 如果需要访问多个服务地址，而这些服务请求和响应的结构也可能都完全不同
// 那么你可以通过axios.create创建不同的实例来处理。
const httpService = axios.create({
  timeout: 10000 // 请求的超时时长，单位毫秒
  // method: 'post', // 请求方法
  // withCredentials: true, // 跨域
  // params: {}, // 请求参数拼接在URL上
  // data: {} // 请求参数放在请求体里
})
// // 设置post请求头
httpService.defaults.headers.post['Content-Type'] =
  'application/x-www-form-urlencoded; charset=UTF-8'

/**
 * 请求拦截器
 * 每次请求前，如果存在token则在请求头中携带token
 */
httpService.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    // if (process.env.NODE_ENV === "development") {
    //   config.url = `http://${location.host}` + config.url // 自定义反向代理
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器，后端验证token失败后跳转到登录界面
httpService.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 文件上传
 * @param {Object} params json
 */
export function fileUpload(params = {}) {
  params.append('packageName', 'com.jubo.pc')
  return new Promise((resolve, reject) => {
    httpService({
      url: process.env.VUE_APP_UPLOAD_URL,
      method: 'post',
      data: params
      // headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
  })
}
