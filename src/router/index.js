import Vue from 'vue'
import Router from 'vue-router'
import routes from './routers'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie

Vue.use(Router)

NProgress.configure({ showSpinner: false })

const router = new Router({
  routes
})

router.beforeEach((to, from, next) => {
  // 开启进度条
  NProgress.start()
  // 获取网站标题
  document.title = to.meta.title
  // 登录成功之后，会把用户信息保存会话
  // 存在时间为会话生命周期，页面关闭则失效
  let token = getToken()


  if (to.path === '/login') {
    // 如果访问登录页，并且会话信息存在，代表已登录，跳转到主页
    if (token) {
      NProgress.done()
      next({ name: 'Index' })
    } else {
      next()
    }
  } else {
    if (!token) {
      NProgress.done()
      next({ name: 'Login' })
    }
    NProgress.done()
    next()
  }
})

router.afterEach(() => {
  // 完成进度条
  NProgress.done()
})

export default router
