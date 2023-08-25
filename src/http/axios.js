import axios from 'axios'
import config from './config'
import router from '@/router'
import qs from 'qs'

import {
  getToken,
  removeToken,
  removeUserName,
  setToken
} from '../utils/auth'

var ui = require('element-ui')

export default function $axios (options) {
  return new Promise((resolve, reject) => {
    const instance = axios.create({
      baseURL: config.baseURL
    })

    // request 拦截器
    instance.interceptors.request.use(
      config => {
        let token = getToken('token')
        if (token) {
          config.headers.Authorization = 'Bearer ' + token
        } else {
          // 重定向到登录页面
          router.push({ name: 'Login' })
        }

        // 3. 根据请求方法，序列化传来的参数，根据后端需求是否序列化
        if (config.method === 'post' || config.method === 'put' || config.method === 'delete') {
          let qsHandle = true
          if (config.headers.hasOwnProperty('Content-Type') && config.headers['Content-Type'] === 'application/json') {
            qsHandle = false
          }

          // eslint-disable-next-line no-proto
          if ((config.data.__proto__ !== FormData.prototype ||
            config.url.endsWith('path') ||
            config.url.endsWith('mark') ||
            config.url.endsWith('patchs')
          ) && qsHandle) {
            config.data = qs.stringify(config.data)
          }
        } else if (config.method === 'get' && config.data) {
          var index = config.url.indexOf('?')
          if (index === -1) {
            config.url = config.url + '?' + qs.stringify(config.data)
          } else {
            config.url = config.url + qs.stringify(config.data)
          }
        }
        return config
      },

      error => {
        // 请求错误时
        // 1. 判断请求超时
        if (error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1) {
          // return service.request(originalRequest);// 再重复请求一次
        }
        // 2. 需要重定向到错误页面
        const errorInfo = error.response
        if (errorInfo) {
          error = errorInfo.data // 页面那边catch的时候就能拿到详细的错误信息,看最下边的Promise.reject
          const errorStatus = errorInfo.status // 404 403 500 ...
          router.push({
            path: `/error/${errorStatus}`
          })
        }
        return Promise.reject(error) // 在调用的那边可以拿到(catch)你想返回的错误信息
      }
    )

    // response 拦截器
    instance.interceptors.response.use(
      response => {
        // 如果后端重设Authorization 会在header头带有该字段。jwt过期
        if (response.headers.hasOwnProperty('authorization') && response.headers.authorization.length > 0) {
          let temp = response.headers.authorization.split(' ')
          if (temp.length === 2) {
            setToken(temp[1])
          }
        }

        return response
      },
      err => {
        if (err && err.response) {
          switch (err.response.status) {
            case 400:
              err.message = '请求错误'
              break
            case 401:
              err.message = '未授权，请登录'
              break
            case 403:
              err.message = '拒绝访问'
              break
            case 404:
              err.message = `请求地址出错: ${err.response.config.url}`
              break
            case 408:
              err.message = '请求超时'
              break
            case 500:
              err.message = '服务器内部错误'
              break
            case 501:
              err.message = '服务未实现'
              break
            case 502:
              err.message = '网关错误'
              break
            case 503:
              err.message = '服务不可用'
              break
            case 504:
              err.message = '网关超时'
              break
            case 505:
              err.message = 'HTTP版本不受支持'
              break
            default:
          }
        }

        if (err.response.status === 401) {
          removeToken()
          router.push({ name: 'Login' })
          err.message = '长时间未操作，退出登录'
        }

        return Promise.reject(err) // 返回接口返回的错误信息
      }
    )

    // 请求处理
    instance(options).then(res => {
      resolve(res)
      return false
    }).catch(error => {
      reject(error)
    })
  })
}
