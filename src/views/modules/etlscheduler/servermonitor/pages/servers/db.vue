<template>
  <div>
    <div v-show="mysqlList.length" class="servers-wrapper mysql-model content-wrap">
      <div v-for="(item,$index) in mysqlList" :key="$index" class="row">
        <div class="col-md-12">
          <div class="db-title">
            <span>{{ item.dbType+ '管理' }}</span>
          </div>
        </div>
        <div class="col-md-3">
          <div class="text-num-model text">
            <div class="title">
              <span>健康状态</span>
            </div>
            <div class="value-p">
              <span class="state">
                <em v-if="item.state" class="ans-icon-success-solid success" />
                <em v-else class="ans-icon-fail-solid error" />
              </span>
            </div>
            <div class="text-1">健康状态</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="text-num-model text">
            <div class="title">
              <span>最大连接数 - {{ item.date | formatDate }}</span>
            </div>
            <div class="value-p">
              <strong :style="{color:color[0]}">{{ item.maxConnections }}</strong>
            </div>
            <div class="text-1">最大连接数</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="text-num-model text">
            <div class="title">
              <span>当前连接数</span>
            </div>
            <div class="value-p">
              <strong :style="{color:color[8]}">{{ item.threadsConnections }}</strong>
            </div>
            <div class="text-1">当前连接数</div>
          </div>
        </div>
        <!-- <div class="col-md-2">
            <div class="text-num-model text">
              <div class="title">
                <span>{{$t('Max used connections')}}</span>
              </div>
              <div class="value-p">
                <strong :style="{color:color[2]}">{{item.maxUsedConnections}}</strong>
              </div>
              <div class="text-1">
                {{$t('Max used connections')}}
              </div>
            </div>
        </div>-->
        <div class="col-md-3">
          <div class="text-num-model text">
            <div class="title">
              <span>数据库当前活跃连接数</span>
            </div>
            <div class="value-p">
              <strong :style="{color:color[4]}">{{ item.threadsRunningConnections }}</strong>
            </div>
            <div class="text-1">数据库当前活跃连接数</div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!mysqlList.length">
      <m-no-data />
    </div>
    <m-spin :is-spin="isLoading" />
  </div>
</template>
<script>
import { mapActions } from 'vuex'
import mSpin from '@/components/Dolphin/spin/spin'
import mNoData from '@/components/Dolphin/noData/noData'
import themeData from '@/components/Dolphin/echarts/themeData.json'
import dayjs from 'dayjs'

export default {
  name: 'ServersMysql',
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
      mysqlList: [],
      color: themeData.color
    }
  },
  methods: {
    ...mapActions('monitor', ['getDatabaseData'])
  },
  watch: {},
  created() {
    this.isLoading = true
    this.getDatabaseData()
      .then(res => {
        this.mysqlList = res
        this.isLoading = false
      })
      .catch(() => {
        this.isLoading = false
      })
  },
  mounted() {},
  components: { mSpin, mNoData }
}
</script>
<style lang="scss" rel="stylesheet/scss">
@import "./servers";
.content-wrap {
  background: #fff;
  min-height: calc(100vh - 100px);
  margin: 20px;
}
.db-title {
  height: 48px;
  background: #f8fbfe;
  border-radius: 3px 3px 0 0;
  margin: -16px -16px 10px -16px;
  span {
    font-size: 22px;
    padding-left: 18px;
    padding-top: 10px;
    display: inline-block;
    color: #2a455b;
  }
}
</style>
