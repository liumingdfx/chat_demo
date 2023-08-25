<template>
  <el-container>
    <div id="chat">


      <el-button type="primary" style="float: right" @click="logout">退出</el-button>
      <el-badge :value="loginNum" :max="99" class="item">
        <el-button size="small">当前在线</el-button>
      </el-badge>
      <el-card>
        <div v-for="item in loginList">
          <div>
            <el-avatar shape="square"  size="small" :src="item.avatar"></el-avatar>
            <span>
            {{item.nickname}}
          </span>
          </div>
        </div>
      </el-card>



      <div class="chatBox">

        <div class="chatBox-top">
          <div class="chatBox-top-imgBox">
            <el-avatar  size="small" src="https://img01.yzcdn.cn/vant/cat.jpeg"></el-avatar>
          </div>
          <div class="chatBox-top-text"><span>{{ currentUser }}</span></div>
        </div>

        <div class="chatBox-middle" ref="main">
          <div class="chatInfo" id="chatInfo" ref="content">
            <div class="chatUser-box"  v-for="(item,index) in chat_log"  :key="index" :class="[current==item.uid?'chatUser-box1':'chatUser-box']">
              <div class="chatUser-box-img">
                <el-avatar round size="small"
                           :src="item.avatar" />
              </div>
              <div class="chatUser-info">
                <div class="chatUser-info-name" :class="[current==item.id?'chatUser-info-name1':'chatUser-info-name']"><span>{{item.nickname}}</span><span class="nowDate">{{item.time}}</span>
                </div>
                <div class="chatUser-info-text" :class="[current==item.id?'chatUser-info-text1':'chatUser-info-text']">
                  <span>{{item.content}}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
        <div class="chatBox-infoDesk">
          <div class="chatBox-textarea">
            <el-input v-model="msg" rows="4" type="textarea" placeholder="请输入内容" />
          </div>
          <div class="chatBox-sendOut">
            <el-button class="sendOut" type="primary" @click="sendMsg">发送</el-button>
          </div>
        </div>
      </div>
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
      chat_log: [],
      dialogTableVisible: true,
      msg: '',
      current: 1,
      nowDate: '',
      currentUser:'未知',
      loginNum:0,
      loginList:[]
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
      const url = `ws://lmdfx.asia:7272?token=${token}`
      // 判断当前浏览器是否支持WebSocket
      if (typeof WebSocket === 'undefined') {
        this.$message.warning({
          message: '系统提示',
          description: '您的浏览器不支持socket',
          duration: 4
        })
        return
      }

      let _this = this
      this.socket = new WebSocket(url)
      this.socket.onmessage = (evt) => {
        let data = JSON.parse(evt.data)
        console.log(data)
        if(data.type === 'login_success') {
          console.log('登录成功...')
          _this.room_list = data.data.room_list
          _this.currentUser = data.data.room_list[0].name

        }else
        if(data.type === 'join') {
          _this.$set(_this,'loginNum', data.data.online_num)

          _this.$set(_this,'loginList', data.data.online_list)

          _this.$set(_this,'chat_log', data.data.chat_logs)


          _this.$message.success(data.msg)
        }else
        if(data.type === 'send') {

          _this.$set(_this,'chat_log', data.data.chat_logs)

          _this.$message.success('收到信息啦')
        }
        else if(data.type === 'login_fail') {

          removeToken()
          console.log('登录失败...')
          _this.$router.push('login')
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
        if (_this.socket.readyState === 1) { // 连接状态
          _this.socket.send('ping')
        } else {
          _this.connectCount += 1
          if (_this.connectCount <= 5) {
            _this.initWss() // 断点重连5次
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
        console.log('加入房间成功...')
      }
    },
    sendMsg() {

      console.log('socket状态',this.socket.readyState)
      console.log('开始发送消息')
      const token = getToken()
      //参数
      const param = {
        "type":"send",
        "data":{"room_id":1,"token":`${token}`,"content":`${this.msg}`}
      }
      console.log('参数', param)

      this.socket.send(JSON.stringify(param))

      this.msg = ''
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
html,
body {
  background-color: #E8E8E8;
}

#chat .chatBox {
  width: 60rem;
  height: auto;
  margin: 2.5rem auto 0;
  background-color: #fff;
  overflow: hidden;
  border-radius: 0.625rem;
}

#chat .chatBox-top {
  width: 100%;
  height: 3.75rem;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  background-color: #2B3D63;
}

#chat .chatBox-top-imgBox {
  margin-left: 1.25rem;
}

#chat .chatBox-top-text {
  margin-left: 1.25rem;
  font-size: 1rem;
  color: #fff;
}

#chat .chatBox-middle {
  width: 100%;
  height: 15.25rem;
  background-color: #fff;
  border-bottom: 0.0625rem solid #2B3D63;
}

#chat .chatBox-middle {
  width: 100%;
  height: 15.25rem;
  background-color: #fff;
}

#chat .chatBox-infoDesk {
  width: 100%;
  height: 10rem;
}

#chat .chatBox-textarea {
  width: 100%;
  height: 6.25rem;
}

#chat .chatBox-sendOut {
  margin-top: 0.625rem;
  width: 100%;
  height: 3.125rem;
  text-align: right;
}

#chat .sendOut {
  padding: 0 1.25rem;
  height: 2.1875rem;
  margin: 0.3125rem 1.25rem 0 0;
}

#chat .chatInfo {
  width: 94%;
  height: 94%;
  margin: 1.25rem auto;
  overflow: auto;
}

#chat .chatUser-box {
  width: 100%;
  margin-bottom: 6px;
  display: flex;
  flex-direction: row;
}


#chat .chatUser-box-img {
  display: flex;
}

#chat .chatUser-info {
  margin: 0 1.25rem;
}

#chat .chatUser-info-name {
  font-size: 0.875rem;
  color: #888;
  display: flex;
  flex-direction: row;
}

#chat .nowDate {
  margin: 0 0.625rem;
}

#chat .chatUser-info-text {
  margin-top: 0.3125rem;
  max-width: 20rem;
  padding: 0.5rem;
  background-color: #E8E8E8;
  border-radius: 0.5rem;
  float: left;
  table-layout:fixed;
  word-break: break-all;
  overflow:hidden;
}

#chat .chatUser-info-text span{
  font-size: 0.9375rem;
  line-height: 1.5625rem;
}
#chat .chatUser-box1 {
  flex-direction: row-reverse;
}
#chat .chatUser-info-name1 {
  flex-direction: row-reverse;
}
#chat .chatUser-info-text1 {
  float: right;
}
</style>
