<template>
  <div class="page-container">
    <div>
      <el-button
        type="primary"
        @click="handleProcess()"
      >查看流程实例监控</el-button>
      <el-button
        type="primary"
        @click="handleSchedule()"
      >查看任务监控</el-button>
    </div>
    <m-list-construction>
      <template slot="content">
        <div class="perject-home-content">
          <div class="time-model">
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
          <div class="row">
            <div class="col-md-6">
              <div class="chart-title">
                <span>任务状态统计</span>
              </div>
              <div class="row">
                <m-task-ctatus-count :search-params="searchParams" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="chart-title">
                <span>流程状态统计</span>
              </div>
              <div class="row">
                <m-process-state-count :search-params="searchParams" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </m-list-construction>
  </div>
</template>
<script>
import dayjs from 'dayjs'
import mTaskCtatusCount from './_source/taskCtatusCount'
import mProcessStateCount from './_source/processStateCount'
import mListConstruction from './_source/listConstruction'

export default {
  name: 'ProjectsIndexIndex',
  components: {
    mListConstruction,
    mTaskCtatusCount,
    mProcessStateCount
  },
  props: {
  },
  data() {
    return {
      searchParams: {
        startTimeStart: '',
        startTimeEnd: ''
      }
    }
  },
  created() {
    this.searchParams.startTimeStart = dayjs().format('YYYY-MM-DD')
    this.searchParams.startTimeEnd = dayjs().format('YYYY-MM-DD')
    console.log('开始' + this.searchParams.startTimeStart + typeof (this.searchParams.startTimeStart))
    console.log('结束' + this.searchParams.startTimeEnd + typeof (this.searchParams.startTimeEnd))
  },
  methods: {
    handleProcess() {
      this.$router.push('/etlscheduler/processinstance')
    },
    handleSchedule() {
      this.$router.push('/etlscheduler/taskinstance')
    },
    _datepicker(val) {
      this.searchParams.startTimeStart = val[0]
      this.searchParams.startTimeEnd = val[1]
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss">
  .perject-home-content {
    padding: 10px 20px;
    position: relative;
    .time-model {
      position: absolute;
      right: 8px;
      top: -40px;
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
</style>
