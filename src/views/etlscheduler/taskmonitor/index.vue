<template>
  <div class="page-container all" style="height:calc(100vh - 90px);width:calc(100vw - 90px);overflow-y:scroll;">
    <!-- 选择日期 -->
    <el-row style="height: 50px;">
      <el-col :span="6" :offset="17" align="right">
        <div class="block">
          <el-date-picker
            v-model="value1"
            type="daterange"
            :clearable="false"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="_datepicker"
          />
        </div>
      </el-col>
    </el-row>

    <!-- 监控总览/饼图 -->
    <el-row style="height: 320px;" :gutter="15">
      <el-col :span="12">
        <el-card class="boxcard" shadow="always">
          <div slot="header" class="clearfix" style="text-align:right;">
            <time class="time">更新时间：{{ time | formatDate }}</time>
            <!-- <span>卡片名称</span> -->
            <span class="el-icon-refresh-left refreshspan" @click="refresh()" />
          </div>
          <!-- <span class="el-icon-refresh-left refresh" style="float: right" /> -->
          <el-row style="margin: 40px 0">
            <el-col :span="6">
              <!-- <el-tag effect="dark" style="width:119%;height: 80px;"> -->
              <label class="title-middle"> 调度任务总数</label>
              <div class="bottom clearfix">
                <time class="title-large">
                  <span class="el-icon-upload iconstyle" />
                  <span>{{ count }}</span>
                </time>
              </div>
              <!-- </el-tag> -->
            </el-col>
            <el-col :span="8">
              <!-- <el-tag effect="dark" style="width:119%;height: 80px;"> -->
              <label class="title-middle"> 文件接收情况</label>
              <div class="bottom clearfix">
                <time class="title-large">
                  <span class="el-icon-folder-checked iconstyle" style="color:#40dcff" />
                  <span>{{ fileRecieveCount + '/' + fileCount }}</span>
                </time>
              </div>
              <!-- </el-tag> -->
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="6">
              <span class="title-middle"> 调度任务总耗时</span>
              <div class="bottom clearfix">
                <time class="title-large">
                  <span class="el-icon-time iconstyle" style="color:#9fe4ed" />
                  {{ timeConsuming | timeFilter }}
                </time>
              </div>
            </el-col>
            <el-col :span="18">
              <span class="title-middle">调度任务历时</span>
              <div>
                <div class="bottom clearfix">
                  <time class="title-large1">
                    <span class="el-icon-time iconstyle" style="color:#716bc9" />
                    <!-- {{ processtime | timeFilter }} -->
                    <span v-if="startTime">{{ startTime | formatDate }} - {{ endTime | formatDate }}</span>
                    <span v-if="!startTime">暂无</span>
                  </time>
                </div>
              </div>
            </el-col>
          </el-row>
          <!-- <el-button type="primary" class="start-btn">开始调度</el-button>
          <el-button type="success" class="over-btn">结束调度</el-button> -->
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="boxcard" shadow="always">
          <div slot="header" class="clearfix" style="text-align: right;">
            <!-- <span>卡片名称</span> -->
            <time class="time">更新时间：{{ time | formatDate }}</time>
            <span class="el-icon-refresh-left refreshspan" @click="refresh()" />
          </div>
          <m-process-state-count :search-params="searchParams" @refresh="_datepicker()" />
        </el-card>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24">
        <div style="margin-top: 10px;">
          <el-tabs v-model="tabname" type="border-card">
            <el-tab-pane label="调度流程实例" name="processinstance"><etl-processin-stance :search-params="searchParams" style="padding-top:0px" /></el-tab-pane>
            <el-tab-pane label="调度环节实例" name="taskinstance"><etl-taskin-stance :search-params="searchParams" style="padding-top:0px" /></el-tab-pane>
            <el-tab-pane label="上游推送文件情况" name="statistics"><etl-data-file :search-params="searchParams" style="padding-top:0px" /></el-tab-pane>
            <!-- <el-tab-pane label="上游推送文件统计" name="statisticsCount">
              <div class="row">
                <div class="col-md-12">
                  <div class="chart-title">
                    <span>上游推送文件情况
                      <el-button
                        style="margin-left:10px;margin-top:-10px;"
                        type="primary"
                        title="查看详情"
                        class="oper-btn more"
                        @click="handleFile()"
                      />
                    </span>
                  </div>
                  <div class="table-small-model">
                    <table style="width: 100vw">
                      <tr>
                        <th width="40">编号</th>
                        <th width="80">上游系统</th>
                        <th width="50">文件执行情况</th>
                        <th width="60">状态</th>
                      </tr>
                      <tr v-for="(item,$index) in dataResourceStatistics" :key="$index" style="height:50px">
                        <td><span>{{ $index+1 }}</span></td>
                        <td><span>{{ item.dataResourceName }}</span></td>
                        <td><span>{{ item.executions+'/'+item.pushes }}</span></td>
                        <td>
                          <a target="_blank" class="buttonText" :title="statusObj[item.status].name">
                             遍历statusList，更改不同状态的任务实例的图标和颜色
                            <i
                              :class="statusObj[item.status].unicode"
                              :style="{color: statusObj[item.status].color}"
                            />
                          </a></td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>
            </el-tab-pane> -->
          </el-tabs>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import store from '@/store'
import { statusList } from './_source/common.js'
// import mTaskCtatusCount from './_source/taskCtatusCount'
import mProcessStateCount from './_source/processStateCount'
// import mListConstruction from './_source/listConstruction'
import etlProcessinStance from '@/views/etlscheduler/processinstance'
import etlTaskinStance from '@/views/etlscheduler/taskinstance'
import etlDataFile from '@/views/etlscheduler/datafile'
import {
  getDataFileList,
  // takeTime,
  taskMonitor
} from '@/api/etlscheduler/taskmonitor'
// import format from 'element-ui/src/locale/format'
import { mapMutations } from 'vuex'

export default {
  name: 'ProjectsIndexIndex',
  components: {
    // mTaskCtatusCount,
    mProcessStateCount,
    etlProcessinStance,
    etlTaskinStance,
    etlDataFile
  },
  filters: {
    timeFilter(value) {
      const time = value
      if (time === null || time === '' || time === 0) {
        return 0 + '秒'
      } else {
        if (time / 1000 >= 0 && time / 1000 < 60) {
          return (time / 1000).toFixed(1) + '秒'
        } else if (time / 1000 >= 60 && time / 1000 < 3600) {
          return (time / 60000).toFixed(1) + '分'
        } else if (time / 1000 > 3600) {
          return (time / 3600000).toFixed(1) + '时'
        }
      }
    },
    formatDate(value) {
      if (value === null) {
        return ''
      }
      const date = new Date(value)
      return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
      // const y = date.getFullYear()
      // let MM = date.getMonth() + 1
      // MM = MM < 10 ? '0' + MM : MM
      // let d = date.getDate()
      // d = d < 10 ? '0' + d : d
      // let h = date.getHours()
      // h = h < 10 ? '0' + h : h
      // let m = date.getMinutes()
      // m = m < 10 ? '0' + m : m
      // let s = date.getSeconds()
      // s = s < 10 ? '0' + s : s
      // return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s
    }
  },
  props: {},
  data() {
    return {
      store,
      tabname: 'processinstance',
      // info: {
      //   stockDate:this.getNowTime(),  //日期
      // },
      time: Date.parse(new Date()),
      searchParams: {
        startTimeStart: '',
        startTimeEnd: '',
        statusType: null
      },
      taketime: 0,
      processtime: 0,
      count: 0,
      fileCount: 0,
      fileRecieveCount: 0,
      timeConsuming: 0,
      startTime: null,
      endTime: null,
      dataResourceStatistics: null,
      statusObj: {},
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      value1: null
    }
  },
  // refresh(){
  //   watch: {
  //     this.time = Date.parse(new Date())
  // }
  // },
  created() {
    statusList.forEach((r, i) => {
      this.statusObj[r['value']] = r
    })
    this.searchParams.startTimeStart = dayjs().format('YYYY-MM-DD')
    this.searchParams.startTimeEnd = dayjs().format('YYYY-MM-DD')
    this.value1 = [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
    this.setProcessGroupExecutionStatusType('')
    this.setProcessStartTime(this.searchParams.startTimeStart)
    this.setProcessEndTime(this.searchParams.startTimeEnd)
    // 获取任务的总耗时
    // takeTime().then((resp) => {
    //   this.taketime = resp.data;
    // });
    // 获取任务的历时
    taskMonitor({
      startTimeStart: dayjs().format('YYYY-MM-DD'),
      startTimeEnd: dayjs().format('YYYY-MM-DD')
    }).then((resp) => {
      this.count = resp.data.count
      this.timeConsuming = resp.data.timeConsuming
      this.startTime = resp.data.startTime
      this.endTime = resp.data.endTime
      this.fileCount = resp.data.fileCount
      this.fileRecieveCount = resp.data.fileRecieveCount
    })
    // 获取文件资源的列表
    getDataFileList().then((resp) => {
      this.dataResourceStatistics = resp.data
    })
  },
  methods: {
    ...mapMutations('monitor', ['setProcessStatus', 'setProcessStartTime', 'setProcessEndTime', 'setProcessGroupExecutionStatusType']),
    refresh() {
      this._datepicker()
      // getProcessStateCount()
    },
    // 带着开始和结束时间跳转到任务实例页面
    handletask() {
      this.$router.push({
        path: '/etlscheduler/taskinstance',
        name: 'taskinstance',
        params: {
          startTimeStart: this.searchParams.startTimeStart,
          startTimeEnd: this.searchParams.startTimeEnd
        }
      })
    },
    // 带着开始和结束时间跳转到流程实例页面
    handleprocess() {
      this.$router.push({
        path: '/etlscheduler/processinstance',
        name: 'processinstance',
        params: {
          startTimeStart: this.searchParams.startTimeStart,
          startTimeEnd: this.searchParams.startTimeEnd
        }
      })
    },
    handleFile() {
      this.$router.push({ path: '/etlscheduler/resourcemonitor' })
    },
    // 根据时间范围获取任务历时
    _datepicker() {
      this.searchParams.startTimeStart = this.value1[0]
      this.searchParams.startTimeEnd = this.value1[1]
      this.searchParams.statusType = this.store.state.monitor.processGroupExecutionStatusType
      this.searchParams.statusType = null
      this.setProcessStartTime(this.searchParams.startTimeStart)
      this.setProcessEndTime(this.searchParams.startTimeEnd)
      this.tabname = 'processinstance'
      taskMonitor({
        startTimeStart: this.searchParams.startTimeStart,
        startTimeEnd: this.searchParams.startTimeEnd
      }).then((resp) => {
        this.count = resp.data.count
        this.timeConsuming = resp.data.timeConsuming
        this.startTime = resp.data.startTime
        this.endTime = resp.data.endTime
        this.time = Date.parse(new Date())
        this.fileCount = resp.data.fileCount
        this.fileRecieveCount = resp.data.fileRecieveCount
      })
    }
  }
}
</script>
<style scoped lang="scss">
>>>.all {
  padding: 10px 0px;
}
>>>.el-card__body {
  padding: 10px;
}
>>>.el-card__header {
  padding: 0;
}
.iconstyle{
  font-size: 25px;
  color: #fbc224;
  padding: 5px;
  font-weight: bolder;
}
.title-large {
  font-size: 25px;
  padding: 10px;
  font-weight: bolder;
  font-family: "Microsoft Yahei", "微软雅黑", "Arial", sans-serif;
}
.title-large1 {
  font-size: 20px;
  padding: 10px;
  font-weight: bolder;
	letter-spacing: -1px;
}
.title-middle {
  font-size: 18px;
  padding: 10px;
  font-weight: 400;
}
.refreshspan {
  font-size: 20px;
  cursor: pointer;
  margin: 0 10px 0 0;
  height:40px;
  line-height:40px;
}
.bottom {
  font-size: 20px;
  margin: 0 0 0 0;
}
.time {
  margin: 0 20px 0 0;
}
.boxcard{
  height: 320px;
}
tr{
  td{
    text-align: center;
    i{
      font-size: 20px;
    }
  }
  th{
    text-align: center;
  }
}
</style>
