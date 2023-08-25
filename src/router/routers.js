import Login from '@/components/Login'
import Index from '@/components/Index1'

const router =  [
  {
    path: '/',
    name: 'Index',
    component: Index,
    meta:{
      title: '在线聊天'
    },

  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta:{
      title: '登录'
    }
  }
]

export default router
