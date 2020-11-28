<template>
  <div class="process-state-count-model">
    <div v-show="!msg">
      <div v-spin="isSpin" class="data-area" style="height: 430px;">
        <div class="col-md-7">
          <div id="process-state-pie" style="height:260px;margin-top: 20px;" />
        </div>
        <div class="col-md-5">
          <div class="table-small-model">
            <table>
              <tr>
                <th width="40">编号</th>
                <th width="40">数量</th>
                <th width="40">状态</th>
              </tr>
              <tr v-for="(item,$index) in processStateList" :key="$index">
                <td><span>{{ $index+1 }}</span></td>
                <td><span><a href="javascript:" :class="searchParams.projectId ?'links':''" @click="handleProcess(item.key)">{{ item.value }}</a></span></td>
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
  name: 'ProcessStateCount',
  props: {
    searchParams: Object
  },
  data() {
    return {
      isSpin: true,
      msg: '',
      processStateList: []
    }
  },
  methods: {
    ...mapActions('projects', ['getProcessStateCount']),
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
      this.$router.push({ path: '/etlscheduler/processinstance', name: 'processinstance', params: {
        // status: JSON.stringify(_.find(stateType, ['label', name]).value),
        status: JSON.stringify(_.find(statusType, ['label', name]).value),
        startTimeStart: this.searchParams.startTimeStart,
        startTimeEnd: this.searchParams.startTimeEnd
      }})
    },
    _handleProcessState(res) {
      const data = res.data.taskCountDtos
      this.processStateList = _.map(data, v => {
        return {
          // key: _.find(stateType, ['code', v.taskStateType])['label'],
          key: _.find(statusType, ['code', v.taskStateType])['label'],

          value: v.count
        }
      })
      const myChart = Chart.pie('#process-state-pie', this.processStateList, { title: '' })
      myChart.echart.setOption(pie)
      // 首页不允许跳转
      if (this.searchParams.projectId) {
        myChart.echart.on('click', e => {
          this._goProcess(e.data.name)
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
        this.getProcessStateCount(o).then(res => {
          this.processStateList = []
          this._handleProcessState(res)
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
  .process-state-count-model {

  }
  .table-small-model {
  padding: 0 10px;
  table {
    width: 100%;
    tr{
      // background: #edf1f5;
      th,td {
        padding-left: 8px;
      }
      th {
        height: 36px;
        line-height: 38px;
        font-size: 12px;
        font-weight: bold;
        color: #333;
        border-bottom: 2px solid #ECEDEC;
      }
      td {
        height: 32px;
        line-height: 32px;
        border-bottom: 1px solid #ECEDEC;
        span {
          font-size: 12px;
          color: #333;
        }
        .links {
          color:#2d8cf0;
        }
      }
      &:hover {
        td {
          background: #ddecff;
        }
      }
    }
  }
  a{
     color:#2d8cf0;
  }
}

</style>
