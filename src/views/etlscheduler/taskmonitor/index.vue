<template>
  <div class="page-container all">
    <!-- <div >
      <el-button
        type="primary"
        @click="handleProcess()"
      >查看流程实例监控</el-button>
      <el-button
        type="primary"
        @click="handleSchedule()"
      >查看任务监控</el-button>
    </div> -->
    <m-list-construction>
      <template slot="content">
        <div class="perject-home-content" style="height:90vh;overflow-y:scroll;">
          <div class="content-top">

            <div class="row">
              <div class="time-model col-md-3">
                <x-datepicker
                  :panel-num="2"
                  placement="bottom-end"
                  :value="[searchParams.startTimeStart,searchParams.startTimeEnd]"
                  type="daterange"
                  placeholder="选择日期区间"
                  format="YYYY-MM-DD"
                  @on-change="_datepicker"
                />
              </div>

              <div class="col-md-4 content-left">
                <!-- <el-tag effect="dark" style="width:119%;height: 80px;"> -->
                  <div class="el-icon-document-copy icon-all"></div>
                  <div style="font-size: 30px;padding:10px; font-weight:bolder">调度任务总数</div>
                  <div style="font-size: 20px;padding-left:10px;">999999999</div>
                <!-- </el-tag> -->
              </div>
              <div class="col-md-4 content-left1">
                <!-- <el-tag effect="dark" type="success" style="width:55%;height: 80px;"> -->
                  <div class="el-icon-time icon-time1"></div>
                  <div style="font-size: 20px;padding:10px; font-weight:bolder">调度任务总耗时</div>
                  <div style="font-size: 15px;padding-left:10px;">{{ taketime | timeFilter }}</div>
                <!-- </el-tag> -->
              </div>
              <div class="col-md-4 content-left2">
                <!-- <el-tag effect="dark" type="warning" style="width:55%;height: 80px;"> -->
                  <div class="el-icon-time icon-time2"></div>
                  <div style="font-size: 20px;padding:10px; font-weight:bolder">调度任务历时</div>
                  <div style="font-size: 15px;padding-left:10px;">{{ processtime | timeFilter }}</div>
                <!-- </el-tag> -->
              </div>

            </div>

            <div class="row">
              <div class="col-md-6 content-right">
                <div class="chart-title">
                  <span>调度流程状态统计
                    <el-button
                      style="margin-left:10px;margin-top:-10px;"
                      type="primary"
                      title="查看详情"
                      class="oper-btn more"
                      @click="handleprocess()"
                    /></span>
                </div>
                <div class="row">
                  <m-process-state-count :search-params="searchParams" />
                </div>
              </div>
              <!-- <div class="col-md-6">
                <div class="chart-title">
                  <span>调度环节状态统计<el-button
                    style="margin-left:10px;margin-top:-10px;"
                    type="primary"
                    title="查看详情"
                    class="oper-btn more"
                    @click="handletask()"
                  /></span>
                </div>
                <div class="row">
                  <m-task-ctatus-count :search-params="searchParams" />
                </div>
              </div> -->
            </div>
          </div>

<!-- 
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
                <table>
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
                      <a target="_blank" class="buttonText" :title="statusObj[item.status].name"> -->
                        <!-- 遍历statusList，更改不同状态的任务实例的图标和颜色 -->
                        <!-- <i
                          :class="statusObj[item.status].unicode"
                          :style="{color: statusObj[item.status].color}"
                        />
                      </a></td>
                  </tr>
                </table>
              </div>
            </div>
          </div> -->

        </div>
      </template>
    </m-list-construction>
  </div>
</template>
<script>
import dayjs from 'dayjs'
import { statusList } from './_source/common.js'
import mTaskCtatusCount from './_source/taskCtatusCount'
import mProcessStateCount from './_source/processStateCount'
import mListConstruction from './_source/listConstruction'
import mIndexTab from './_source/indexTab'
import { getDataFileList, takeTime, processTakeTime } from '@/api/etlscheduler/taskmonitor'

export default {
  name: 'ProjectsIndexIndex',
  components: {
    mListConstruction,
    mTaskCtatusCount,
    mProcessStateCount,
    mIndexTab
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
    }
  },
  props: {
  },
  data() {
    return {
      searchParams: {
        startTimeStart: '',
        startTimeEnd: ''
      },
      taketime: 0,
      processtime: 0,
      dataResourceStatistics: null,
      statusObj: {}
    }
  },
  created() {
    statusList.forEach((r, i) => {
      this.statusObj[r['value']] = r
    })
    this.searchParams.startTimeStart = dayjs().format('YYYY-MM-DD')
    this.searchParams.startTimeEnd = dayjs().format('YYYY-MM-DD')
    // console.log('开始' + this.searchParams.startTimeStart + typeof (this.searchParams.startTimeStart))
    // console.log('结束' + this.searchParams.startTimeEnd + typeof (this.searchParams.startTimeEnd))
    // 获取任务的总耗时
    takeTime().then(resp => {
      this.taketime = resp.data
    })
    // 获取任务的历时
    processTakeTime({
      startTimeStart: dayjs().format('YYYY-MM-DD'),
      startTimeEnd: dayjs().format('YYYY-MM-DD')
    }).then(resp => {
      this.processtime = resp.data
    })
    // 获取文件资源的列表
    getDataFileList().then(resp => {
      this.dataResourceStatistics = resp.data
    })
  },
  methods: {
    // 带着开始和结束时间跳转到任务实例页面
    handletask() {
      this.$router.push({ path: '/etlscheduler/taskinstance', name: 'taskinstance', params: {
        startTimeStart: this.searchParams.startTimeStart,
        startTimeEnd: this.searchParams.startTimeEnd
      }})
    },
    // 带着开始和结束时间跳转到流程实例页面
    handleprocess() {
      this.$router.push({ path: '/etlscheduler/processinstance', name: 'processinstance', params: {
        startTimeStart: this.searchParams.startTimeStart,
        startTimeEnd: this.searchParams.startTimeEnd
      }})
    },
    handleFile() {
      this.$router.push({ path: '/etlscheduler/resourcemonitor' })
    },
    // 根据时间范围获取任务历时
    _datepicker(val) {
      this.searchParams.startTimeStart = val[0]
      this.searchParams.startTimeEnd = val[1]
      processTakeTime({
        startTimeStart: this.searchParams.startTimeStart,
        startTimeEnd: this.searchParams.startTimeEnd
      }).then(resp => {
        this.processtime = resp.data
      })
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss">
  .perject-home-content {
    padding: 10px 20px;
    position: relative;
    .time-model {
      // position: absolute;
      left: 860px;
      top: 47px;
      // float: right;
      // top: -40px;
      .ans-input {
        >input {
          width: 250px;
        }
      }
    }
    .chart-title {
      text-align: center;
      height: 60px;
      line-height: 60px;
      span {
        font-size: 22px;
        color: #333;
        font-weight: bold;
      }
    }
  }
  .table-small-model {
    .ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space:  nowrap;
      display: block;
    }
  }
  tr td{
    text-align: center;
  }
  tr th{
    text-align: center;
  }
  td i{
    font-size: 20px;
  }
  .content-top{
    width: 95%;
    border: 0px solid red;
    position: absolute;
    top: 0;
    left: 50px;
    box-shadow: 3px 17px 17px 3px rgba(0,0,0,.1);
    border-radius: 20px;
  }
  .content-right{
    float: right;
    box-shadow: 3px 0px 17px 17px rgba(0,0,0,.1);
    border-radius: 20px;
  }

  .content-left{
    position: absolute;
    top: 20px;
    left: 105px;
  }
  .content-left1{
    position: absolute;
    top: 180px;
    left: 105px;
  }
  .content-left2{
    position: absolute;
    top: 180px;
    right: 700px;
  }
  .el-icon-time{
    font-size: 30px;
  }
  .icon-all{
    position: absolute;
    top: 14px;
    left:-27px;
    font-size: 33px;
  }
  .icon-time1{
    position: absolute;
    top: 8px;
    left:-22px;
  }
   .icon-time2{
    position: absolute;
    top: 8px;
    left:-22px;
  }
  // .all{
  //   background-color: #F2F8FF;
  // }
</style>
