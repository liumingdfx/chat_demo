module.exports = {
  devServer: {
    open: true,
    host: 'localhost',
    port: 8080,
    https: false,
    //以上的ip和端口是我们本机的;下面为需要跨域的
    proxy: { //配置跨域
      '/api': {
        target: 'http://127.0.0.1:8787/api/', //这里后台的地址模拟的;应该填写你们真实的后台接口
        ws: true,
        changOrigin: true, //允许跨域
        pathRewrite: {
          '^/api': '' //请求的时候使用这个api就可以
        }
      },
      '/socket': { // 设置websocket代理
        target: 'http://127.0.0.1:7272',
        ws: true, // 开启websocket代理  注意
        changeOrigin: true,
        pathRewrite: {
          '^/socket': ''
        }
      }
    }
  }
}
