<template>
  <div class="task-ctatus-count-model">
    <div v-show="!msg">
      <div v-spin="isSpin" class="data-area">
        <div class="col-md-7">
          <div id="task-status-pie" style="height:260px;margin-top: 20px;" />
        </div>
        <div class="col-md-5">
          <div class="table-small-model">
            <table>
              <tr>
                <th width="40">编号</th>
                <th width="40">数量</th>
                <th width="40">状态</th>
              </tr>
              <tr v-for="(item,$index) in taskCtatusList" :key="$index">
                <td><span>{{ $index+1 }}</span></td>
                <td>
                  <span>
                    <a href="javascript:" :class="searchParams.projectId ?'links':''" @click="handleSchedule(item.key)">{{ item.value }}</a>
                  </span>
                </td>
                <td><span class="ellipsis" style="width: 98%;" :title="item.key">{{ item.key }}</span></td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div v-show="msg">
      <m-no-data v-if="msg" :msg="msg" :height="430" />
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import { mapActions } from 'vuex'
import { pie } from './chartConfig'
import Chart from '@/components/etl/ana-charts'
import mNoData from '@/components/etl/noData/noData'
// stateType,
import { statusType } from './common'

export default {
  name: 'TaskCtatusCount',
  props: {
    searchParams: Object
  },
  data() {
    return {
      isSpin: true,
      msg: '',
      taskCtatusList: []
    }
  },
  methods: {
    ...mapActions('projects', ['getTaskCtatusCount']),
    _goTask(name) {
      this.$router.push({
        name: 'task-instance',
        query: {
          // stateType: _.find(stateType, ['label', name])['code'],
          stateType: _.find(statusType, ['label', name])['code'],
          startTimeStart: this.searchParams.startTimeStart,
          startTimeEnd: this.searchParams.startTimeEnd
        }
      })
    },
    // 带着状态和开始结束时间进行页面的跳转，跳转到任务实例页面
    handleSchedule(name) {
      this.$router.push({ path: '/etlscheduler/taskinstance', name: 'taskinstance', params: {
        // status: JSON.stringify(_.find(stateType, ['label', name]).value),
        status: JSON.stringify(_.find(statusType, ['label', name]).value),
        startTimeStart: this.searchParams.startTimeStart,
        startTimeEnd: this.searchParams.startTimeEnd
      }})
    },
    _handleTaskCtatus(res) {
      const data = res.data.taskCountDtos
      this.taskCtatusList = _.map(data, v => {
        return {
          // key: _.find(stateType, ['code', v.taskStateType])['label'],
          key: _.find(statusType, ['code', v.taskStateType])['label'],
          value: v.count,
          type: 'type',
          itemStyle: { color: _.find(statusType, ['code', v.taskStateType])['color'] }
        }
      })
      const myChart = Chart.pie('#task-status-pie', this.taskCtatusList, { title: '' })
      myChart.echart.setOption(pie)

      // 首页不允许跳转
      if (this.searchParams.projectId) {
        myChart.echart.on('click', e => {
          this._goTask(e.data.name)
        })
      }
    }
  },
  computed: {},
  watch: {
    'searchParams': {
      deep: true,
      immediate: true,
      handler(o) {
        this.isSpin = true
        this.getTaskCtatusCount(o).then(res => {
          this.taskCtatusList = []
          this._handleTaskCtatus(res)
          this.isSpin = false
        }).catch(e => {
          // this.msg = e.msg || 'error'
          this.isSpin = false
        })
      }
    }
  },
  beforeCreate() {
  },
  created() {
  },
  beforeMount() {
  },
  mounted() {
  },
  beforeUpdate() {
  },
  updated() {
  },
  beforeDestroy() {
  },
  destroyed() {
  },
  components: { mNoData }
}
</script>

<style lang="scss" rel="stylesheet/scss">
  .task-ctatus-count-model {

  }
</style>
