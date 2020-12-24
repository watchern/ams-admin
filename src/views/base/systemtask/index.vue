<template>
  <div class="page-container">
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="任务名称" align="center" prop="taskName" />
      <el-table-column label="所属模块" prop="taskType" />
      <el-table-column label="任务状态" prop="taskStatus">
        <template slot-scope="scope">
          <div v-html="scope.row.taskStatus" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="taskCreateTime" :formatter="formatCreateTime" />
      <el-table-column label="进度" prop="taskPercent" width="200px">
        <template slot-scope="scope">
          <el-progress :text-inside="true" :percentage="scope.row.taskPercent" :stroke-width="18" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { querySystemTask } from '@/api/base/systemtask'
export default {
  data() {
    return {
      tableKey: 'taskUuid',
      list: null,
      total: 0,
      listLoading: false,
      temp: {
        bizAttrUuid: undefined,
        attrName: '',
        attrCode: '',
        describe: ''
      }
    }
  },
  created() {
    this.init()
    this.initWebSocket()
  },
  methods: {
    init() {
      querySystemTask().then(resp => {
      })
    },
    initWebSocket() {
      this.webSocket = this.getWebSocket()
    },
    // formatTaskPercent(row, column) {
    //   // 拼接日期规格为YYYY-MM-DD hh:mm:ss
    //   var createTime = new Date(row.taskCreateTime).valueOf()
    //   var taskEstimatedTime = new Date(row.taskEstimatedTime).valueOf()
    //   if (createTime !== undefined && taskEstimatedTime !== undefined) {
    //     var timestamp = Date.parse(new Date())
    //     var percent = (timestamp - createTime) / (taskEstimatedTime - createTime)
    //     if (row.taskStatus === '2') {
    //       return '100%'
    //     } else {
    //       if (percent < 1) {
    //         return (percent * 100).toFixed(2) + '%'
    //       } else {
    //         return '99.99%'
    //       }
    //     }
    //   }
    //   // var prent = (timestamp - createTime.getTime) / taskEstimatedTime
    //   return 0
    // },
    formatCreateTime(row, column) {
      // 拼接日期规格为YYYY-MM-DD hh:mm:ss
      var createTime = new Date(row.taskCreateTime)
      var createTimeRow = createTime.getFullYear() + '-' + (createTime.getMonth() + 1) + '-' + createTime.getDate() + ' ' + createTime.getHours() + ':' + createTime.getMinutes() + ':' + createTime.getSeconds()
      return createTimeRow
    },
    /**
     *
     * 使用说明：
     * 1、WebSocket客户端通过回调函数来接收服务端消息。例如：webSocket.onmessage
     * 2、WebSocket客户端通过send方法来发送消息给服务端。例如：webSocket.send();
     */
    getWebSocket() {
      var userId = this.$store.getters.personuuid
      const wsuri = process.env.VUE_APP_BASE_WEB_SOCKET + userId // 连接地址，可加参数
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
        this.list = JSON.parse(val.data)
        this.list.forEach(r => {
          var createTime = new Date(r.taskCreateTime).valueOf()
          var taskEstimatedTime = new Date(r.taskEstimatedTime).valueOf()
          if (createTime !== undefined && taskEstimatedTime !== undefined) {
            var timestamp = Date.parse(new Date())
            var percent = (timestamp - createTime) / (taskEstimatedTime - createTime)
            if (r.taskStatus === '2' || r.taskStatus === '3') {
              percent = 100
            } else {
              if (percent < 1) {
                percent = Number((percent * 100).toFixed(2))
              } else {
                percent = 99.99
              }
            }
            r.taskPercent = percent
          }
          var html = ''
          if (r.taskStatus === '2' || r.taskStatus === '3') {
            html = "<span  class='el-icon-success' />"
          }
          if (r.taskStatus === '1') {
            html = '<span  class="el-icon-loading" />'
          }
          if (r.taskStatus === '0') {
            html = '<span  class="el-icon-error" />'
          }
          r.taskStatus = html
        })
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

<style scoped>
ul{
  height: 250px;
  overflow: hidden;
  overflow: scroll;
  overflow-x: hidden;
  z-index: 1;
  width: 100%;
}
</style>
