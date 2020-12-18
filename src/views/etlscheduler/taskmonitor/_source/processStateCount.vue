<template>
  <!-- <div class="process-state-count-model"> -->
  <div v-show="!msg">
    <div v-spin="isSpin" class="data-area">
      <el-row>
        <el-col :span="14">
          <div id="process-state-pie" style="height: 240px;margin-top:20px" />
        </el-col>
        <el-col :offset="2" :span="8">
          <div
            v-for="(item, $index) in processStateList"
            :key="$index"
            class="text item"
          >
            <el-row>
              <el-col :span="14">
                <span class="ellipsis" :title="item.key">
                  {{ item.key }}</span>
                <span><a
                  href="javascript:"
                  @click="handleProcess(item.key)"
                >（{{ item.value }}）</a></span>
              </el-col>
              <el-col :span="10">
                <span class="percentage">{{ item.percent }}</span>
              </el-col>

            </el-row>

          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import { mapActions, mapMutations } from 'vuex'
import { pie } from './chartConfig'
import Chart from '@/components/etl/ana-charts'
// import mNoData from '@/components/etl/noData/noData'
// stateType,
import { statusType } from './common'
import store from '@/store'
export default {
  name: 'ProcessStateCount',
  props: {
    searchParams: Object
    // ,
    // refresh: {
    //   type: Function,
    //   default: null
    // }
  },
  data() {
    return {
      store,
      currentDate: new Date(),
      isSpin: true,
      msg: '',
      processStateList: []
    }
  },
  methods: {
    ...mapActions('projects', ['getProcessStateCount']),
    ...mapMutations('monitor', ['setProcessStatus', 'setProcessStartTime', 'setProcessEndTime', 'setProcessGroupExecutionStatusType']),
    _goProcess(name) {
      this.$router.push({
        name: 'projects-instance-list',
        query: {
          // stateType: _.find(stateType, ['label', name])['code'],
          stateType: _.find(statusType, ['label', name])['code'],

          // startDate: this.searchParams.startDate,
          // endDate: this.searchParams.endDate
          startTimeStart: this.searchParams.startTimeStart,
          startTimeEnd: this.searchParams.startTimeEnd
        }
      })
    },
    // 带着状态和开始结束时间进行页面的跳转，跳转到流程实例页面
    handleProcess(name) {
      this.setProcessGroupExecutionStatusType(_.find(statusType, ['label', name]).value)
      this.setProcessStartTime(this.searchParams.startTimeStart)
      this.setProcessEndTime(this.searchParams.startTimeEnd)
      // this.refresh()
      this.$emit('refresh')
      // this.$router.push({
      //   path: '/etlscheduler/processinstance',
      //   name: 'processinstance',
      //   params: {
      //     // status: JSON.stringify(_.find(stateType, ['label', name]).value),
      //     // groupExecutionStatus: _.find(statusType, ['label', name]).value,
      //     // startTimeStart: this.searchParams.startTimeStart,
      //     // startTimeEnd: this.searchParams.startTimeEnd
      //     groupExecutionStatus: this.store.state.monitor.processGroupExecutionStatusType,
      //     startTimeStart: this.store.state.monitor.processStartTime,
      //     startTimeEnd: this.store.state.monitor.processEndTime
      //   }
      // })
    },
    _handleProcessState(res) {
      const data = res.data.taskCountDtos
      // const successStatus = null
      this.processStateList = _.map(data, (v) => {
        return {
          // key: _.find(stateType, ['code', v.taskStateType])['label'],
          code: _.find(statusType, ['code', v.taskStateType])['code'],
          key: _.find(statusType, ['code', v.taskStateType])['label'],
          percent: v.percentDesc,
          value: v.count,
          itemStyle: {
            color: _.find(statusType, ['code', v.taskStateType])['color']
          }
        }
      })
      const myChart = Chart.pie('#process-state-pie', this.processStateList, {
        title: ''
      })
      myChart.echart.setOption(pie)
      myChart.echart.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        name: '执行完成'
      })
      myChart.echart.on('mouseover', (v) => {
        if (v.name !== '执行完成') {
          myChart.echart.dispatchAction({
            type: 'hideTip',
            seriesIndex: 0,
            name: '执行完成'
          })
          myChart.echart.dispatchAction({
            type: 'downplay',
            seriesIndex: 0,
            name: '执行完成'
          })
        }
      })
      myChart.echart.on('mouseout', (v) => {
        myChart.echart.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          name: '执行完成'
        })
        myChart.echart.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          name: '执行完成'
        })
      })
      // 首页不允许跳转
      if (this.searchParams.projectId) {
        myChart.echart.on('click', (e) => {
          this._goProcess(e.data.name)
        })
      }
    }
  },
  computed: {},
  watch: {
    searchParams: {
      deep: true,
      immediate: true,
      handler(o) {
        this.isSpin = true
        this.getProcessStateCount(o)
          .then((res) => {
            this.processStateList = []
            this._handleProcessState(res)
            this.isSpin = false
          })
          .catch((e) => {
            // this.msg = e.msg || 'error'
            this.isSpin = false
          })
      }
    }
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {}
  // , components: { mNoData }
}
</script>

<style scoped>
.table-small-model {
  padding: 0 10px;
  /* width: 100%; */
  position: absolute;
  /* top: 12px; */
  /* left: 220px; */
  /* height: 100%; */
  border: 0px solid #000;
}
.text {
  /* float: left;*/
  margin: 10px 15px;
}
.text .ellipsis {
  /* font-size: 16px; */
  color: #333;
  /* padding: 0 0 0 0; */
  font-weight: bold;
}
.text .percentage {
  font-size: 14px;
  color: #333;
  /* padding: 0 0 0 0; */
}
.text a {
  color: #409eff;
  font-size: 14px;
  /* padding: 14px 0 0 0; */
}
.refresh {
  /* position: absolute;
  top: 0;
  left: 720px; */
  font-size: 22px;
  cursor: pointer;
}
.bottom {
  margin: 0 0 0 0;
}
.list-table {
  /* width: 60%; */
  height: 300px;
  float: left;
  margin: 0 0 0 70px;
}
</style>
