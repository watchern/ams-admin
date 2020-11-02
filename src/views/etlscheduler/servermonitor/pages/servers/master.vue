<template>
  <m-list-construction :title="'Master 管理'">
    <template slot="content">
      <div v-show="masterList.length" class="servers-wrapper">
        <div v-for="(item,$index) in masterList" :key="$index" class="row-box">
          <div class="row-title">
            <div class="left">
              <span class="sp">IP: {{ item.host }}</span>
              <span class="sp">进程Pid: {{ item.id }}</span>
              <span class="sp">zk注册目录: {{ item.zkDirectory }}</span>
            </div>
            <div class="right">
              <span class="sp">创建时间: {{ item.createTime | formatDate }}</span>
              <span class="sp">最后心跳时间: {{ item.lastHeartbeatTime | formatDate }}</span>
            </div>
          </div>
          <div class="row-cont">
            <div class="col-md-4">
              <m-gauge
                :id="'gauge-cpu-' + item.id"
                :value="(item.resInfo.cpuUsage * 100).toFixed(2)"
                :name="'cpu使用率'"
              />
            </div>
            <div class="col-md-4">
              <m-gauge
                :id="'gauge-memory-' + item.id"
                :value="(item.resInfo.memoryUsage * 100).toFixed(2)"
                :name="'内存使用率'"
              />
            </div>
            <div class="col-md-4">
              <div class="text-num-model">
                <div class="value-p">
                  <strong :style="{color:color[$index]}">{{ item.resInfo.loadAverage > 0? item.resInfo.loadAverage.toFixed(2):0 }}</strong>
                </div>
                <div class="text-1">
                  负载
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!masterList.length">
        <m-no-data />
      </div>
      <m-spin :is-spin="isLoading" />
    </template>
  </m-list-construction>
</template>
<script>
import _ from 'lodash'
import { mapActions } from 'vuex'
import mGauge from './_source/gauge'
import mSpin from '@/components/Dolphin/spin/spin'
import mNoData from '@/components/Dolphin/noData/noData'
import themeData from '@/components/Dolphin/echarts/themeData.json'
import mListConstruction from '@/components/Dolphin/listConstruction/listConstruction'
import dayjs from 'dayjs'

export default {
  name: 'ServersMaster',
  filters: {
    formatDate(value, fmt) {
      fmt = fmt || 'YYYY-MM-DD HH:mm:ss'
      return dayjs(value).format(fmt)
    }
  },
  props: {},
  data() {
    return {
      isLoading: false,
      masterList: [],
      color: themeData.color
    }
  },
  methods: {
    ...mapActions('monitor', ['getMasterData'])
  },
  watch: {},
  created() {
  },
  mounted() {
    this.isLoading = false
    this.getMasterData().then(res => {
      this.masterList = _.map(res, (v, i) => {
        return _.assign(v, {
          resInfo: JSON.parse(v.resInfo)
        })
      })
      this.isLoading = false
    }).catch(() => {
      this.isLoading = false
    })
  },
  components: { mListConstruction, mSpin, mNoData, mGauge }
}
</script>
<style lang="scss" rel="stylesheet/scss">
  @import "./servers";
</style>
