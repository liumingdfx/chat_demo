<template>
  <el-container>
    <el-row :gutter="20">
      <el-col :span="6"><div class="grid-content bg-purple"></div></el-col>
      <el-col :span="6"><div class="grid-content bg-purple"></div></el-col>
      <el-col :span="6"><div class="grid-content bg-purple"></div></el-col>
      <el-col :span="6"><div class="grid-content bg-purple">
        <el-button type="primary" @click="logout"  plain class="logout" >退出</el-button>
      </div></el-col>
    </el-row>
    <el-header>哈哈哈哈</el-header>
    <el-main>茌茌瞅瞅错</el-main>
    <el-footer>啛啛喳喳测试</el-footer>
  </el-container>
</template>

<script>

import {
  getToken,
  removeToken
} from '../utils/auth'
export default {
  name: 'Index',
  data () {
    return {
      socket: null,
      connectCount: 0, // 连接次数
      heartInterval: null,
      room_list :[],
      chat_log: []
    }
  },
  methods:{
    logout(){
      removeToken()
      this.$router.replace('/login')
    },
    initWss(){
      const { protocol } = location

      const token = getToken()
      const url = `${protocol === 'https' ? 'wss' : 'ws'}://127.0.0.1:7272?token=${token}`
      // 判断当前浏览器是否支持WebSocket
      if (typeof WebSocket === 'undefined') {
        this.$message.warning({
          message: '系统提示',
          description: '您的浏览器不支持socket',
          duration: 4
        })
        return
      }

      this.socket = new WebSocket(url)
      this.socket.onmessage = (evt) => {
        let data = JSON.parse(evt.data)

        if(data.type === 'login_success') {
          this.$message.success('登录成功啦')
          this.room_list = data.room_list
        } else {
          window.reload()
        }
      }
      // 监听窗口事件，当窗口关闭时，主动断开websocket连接
      window.onbeforeunload = () => {
        this.closeSocket()
      }
    },
    heartCheck () {
      const _this = this
      this.heartInterval && clearTimeout(this.heartInterval)
      this.heartInterval = setInterval(() => {
        if (this.socket.readyState === 1) { // 连接状态
          this.socket.send('ping')
        } else {
          _this.connectCount += 1
          if (_this.connectCount <= 5) {
            this.initWss() // 断点重连5次
          }
        }
      }, 59 * 1000)
    },
    closeSocket() {
      this.socket.close()
      this.heartInterval && clearTimeout(this.heartInterval)
    },
    joinRoom(id){
      let _this = this
      this.socket.onopen = function () {
        const token = getToken()
          //参数
        const param = {'type': 'join', 'data': {'room_id': `${id}`, 'token': `${token}`}}
        _this.socket.send(JSON.stringify(param));
      }

      this.socket.onmessage = function (evt) {
        let data = JSON.parse(evt.data)
        console.log(data)
        _this.chat_log = data.chat_logs
      }
      // 断开 web socket 连接成功触发事件
      this.socket.onclose = function () {
        console.log('连接已关闭...')
      };
    },
    sendMsg(msg,id) {
      let _this = this
      this.socket.onopen = function () {
        const token = getToken()
        //参数
        const param = {'type': 'send', 'data': {'room_id': `${id}`, 'token': `${token}`,'content':`${msg}`}}
        _this.socket.send(JSON.stringify(param));
      }

      this.socket.onmessage = function (evt) {
        let data = JSON.parse(evt.data)
        console.log(data)
        _this.chat_log = data.chat_logs
      }
      // 断开 web socket 连接成功触发事件
      this.socket.onclose = function () {
        console.log('连接已关闭...')
      };
    }
  },
  created () {
    //建立连接
    this.initWss()
    //加入房间
    this.joinRoom(1)

  },
  closeSocket() {
    this.socket.close()
    this.heartInterval && clearTimeout(this.heartInterval)
  }
}
</script>
<style scoped>
.logout{
  width: 90px;
}
</style>
