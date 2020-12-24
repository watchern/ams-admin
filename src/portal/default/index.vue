<template>
  <div class="home flex a-start flex-row j-start h100">
    <div class="home-left flex-shrink h100">
      <LeftMenu />
    </div>
    <div class="home-right flex1 h100 flex a-start j-start flex-column">
      <div class="home-right-content flex1 w100">
        <router-view />
      </div>
      <div v-if="isShowRightFooter" class="home-right-footer flex-shrink w100">
        <RightFooter />
      </div>
    </div>
  </div>
</template>

<script>
import LeftMenu from './views/left-menu'
import RightFooter from './views/right-footer'
import { querySystemTask } from '@/api/base/systemtask'
export default {
  components: {
    LeftMenu,
    RightFooter
  },
  computed: {
    isShowRightFooter() {
      // const result = this.$route.meta && this.$route.meta.isShowRightFooter
      // return result || false
      if (this.$store.state.aceState.rightFooterTags.length > 0) {
        return true
      } else {
        return false
      }
    }
  },
  created() {
    // 页面刚进入时开启长连接
    this.init()
    this.initWebSocket()
    if (sessionStorage.getItem('store')) {
      this.$store.replaceState(Object.assign({}, this.$store.state, JSON.parse(sessionStorage.getItem('store'))))
    }
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('store', JSON.stringify(this.$store.state))
    })
  },
  methods: {
    init() {
      querySystemTask().then(resp => {
      })
    },
    initWebSocket() {
      this.webSocket = this.getWebSocket()
    },
    /**
     *
     * 使用说明：
     * 1、WebSocket客户端通过回调函数来接收服务端消息。例如：webSocket.onmessage
     * 2、WebSocket客户端通过send方法来发送消息给服务端。例如：webSocket.send();
     */
    getWebSocket() {
      var userId = this.$store.getters.personuuid
      const wsuri = process.env.VUE_APP_BASE_WEB_SOCKET + userId + 'systemTask'// 连接地址，可加参数
      // WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
      this.webSocket = new WebSocket(wsuri) // 建立与服务端的连接
      // 当服务端打开连接
      this.webSocket.onopen = function(event) {
      }
      // 发送消息
      this.webSocket.onmessage = function(event) {
        func1(event)
      }
      const func2 = function func3(val) {
        var dataObj = JSON.parse(val.data)
        if (dataObj.taskStatus === '2' || dataObj.taskStatus === 2) {
          let html = ''
          debugger
          if (dataObj.taskUrl !== undefined && dataObj.taskUrl !== '') {
            html = '<a style="font-style: normal;color: #17e1e1;text-decoration: underline;cursor: pointer;" href="/#' + dataObj.taskUrl + '" id="messageTrack">' + dataObj.taskName + '</a>'
          } else {
            html = '<span style="font-style: normal;color: #17e1e1;text-decoration: underline;cursor: pointer;" id="messageTrack">' + dataObj.taskName + '</span>'
          }
          this.$notify({
            dangerouslyUseHTMLString: true,
            title: '已完成',
            message: html,
            type: 'success',
            duration: 15000,
            position: 'bottom-right'
          })
        } else {
          this.list = JSON.parse(val.data)
        }
      }
      const func1 = func2.bind(this)
      this.webSocket.onclose = function(event) {
      }
      // 通信失败
      this.webSocket.onerror = function(event) {
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.home{
  height: 100vh;
  &-left{
    height: 100vh;
  }
  &-right{
    height: 100vh;
    &-content{
      height: calc(100% - 30px);
    }
    &-footer{
      height: 30px;
    }
  }
}
.home-left{
  z-index:20201111;
}
.home-right{
  background: #eaeaea url('style/images/bg.png') no-repeat left center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
}
.home-right-content{
  overflow: hidden;
  width: calc(100% - 24px);
  height: calc(100% - 32px);
  border-radius: 30px;
  -webkit-box-shadow: 3px 0 17px 0 rgba(0,0,0,.1);
  box-shadow: 3px 0 17px 0 rgba(0,0,0,.1);
  margin: 16px 10px;
  background: #ffffff;
}
</style>
