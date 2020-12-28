<template>
  <div>
    <div v-show="mysqlList.length" class="servers-wrapper mysql-model content-wrap">
      <div v-for="(item,$index) in mysqlList" :key="$index" class="row">
        <div class="col-md-12">
          <div class="db-title">
            <span>{{ item.dbType+ '管理' }}</span>
          </div>
        </div>
        <el-row :gutter="40">
          <el-col :span="8">
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
          </el-col>
          <el-col :span="8">
            <div class="text-num-model text">
              <div class="title">
                <span>最大连接数 - {{ item.date | formatDate }}</span>
              </div>
              <div class="value-p">
                <strong :style="{color:color[0]}">{{ item.maxConnections }}</strong>
              </div>
              <div class="text-1">最大连接数</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="text-num-model text">
              <div class="title">
                <span>当前连接数</span>
              </div>
              <div class="value-p">
                <strong :style="{color:color[8]}">{{ item.threadsConnections }}</strong>
              </div>
              <div class="text-1">当前连接数</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="text-num-model text">
              <div class="title">
                <span>数据库当前活跃连接数</span>
              </div>
              <div class="value-p">
                <strong :style="{color:color[4]}">{{ item.threadsRunningConnections }}</strong>
              </div>
              <div class="text-1">数据库当前活跃连接数</div>
            </div>
          </el-col>
        </el-row>
        <div class="col-md-12" style="margin-top:20px;">
          <div class="db-title">
            <span>PGA内存状态</span>
          </div>
        </div>
        <el-row :gutter="40">
          <el-col :span="8">
            <div class="text-num-model text">
              <div class="title">
                <span>PGA内存使用率</span>
              </div>
              <div class="value-p">
                <strong :style="{color:color[5]}" style="font-size:70px">{{ (item.sumPgaUsedMem/item.sumPgaAllocMem*100).toFixed(1) + '%' }}</strong>
              </div>
              <div class="text-1">PGA内存使用率</div>
              <div style="text-align:center;margin-bottom:10px;">
                <div><label>分配内存：</label>{{ item.sumPgaAllocMem | changeBite }} <label>已使用：</label>{{ item.sumPgaUsedMem | changeBite }} </div>
              </div>
            </div>
          </el-col>
        </el-row>
        <div class="col-md-12" style="margin-top:20px;">
          <div class="db-title">
            <span>会话状态</span>
          </div>
        </div>
        <el-row>
          <div class="text-num-model text">
            <el-row class="rowtable">
              <el-col :span="6" align="center">编号</el-col>
              <el-col :span="10" align="center">用户名</el-col>
              <el-col :span="8" align="center">会话连接数</el-col>
            </el-row>
            <el-row v-for="(user,$in) in item.userConn" :key="$in" style="min-height: 30px;">
              <el-col :span="6" align="center">{{ $in+1 }}</el-col>
              <el-col :span="10" align="center">{{ user.username }}</el-col>
              <el-col :span="8" align="center">{{ user.sessionCount }}</el-col>
            </el-row>
          </div>
        </el-row>
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
import mSpin from '@/components/etl/spin/spin'
import mNoData from '@/components/etl/noData/noData'
import themeData from '@/components/etl/echarts/themeData.json'
import dayjs from 'dayjs'

export default {
  name: 'ServersMysql',
  filters: {
    formatDate(value, fmt) {
      fmt = fmt || 'YYYY-MM-DD HH:mm:ss'
      return dayjs(value).format(fmt)
    },
    changeBite(limit) {
      var size = ''
      if (limit < 1 * 1024) { // 小于1KB，则转化成B
        size = limit.toFixed(2) + 'B'
      } else if (limit < 1 * 1024 * 1024) { // 小于1MB，则转化成KB
        size = (limit / 1024).toFixed(2) + 'KB'
      } else if (limit < 1 * 1024 * 1024 * 1024) { // 小于1GB，则转化成MB
        size = (limit / (1024 * 1024)).toFixed(2) + 'MB'
      } else { // 其他转化成GB
        size = (limit / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
      }
      var sizeStr = size + '' // 转成字符串
      var index = sizeStr.indexOf('.') // 获取小数点处的索引
      var dou = sizeStr.substr(index + 1, 2) // 获取小数点后两位的值
      if (dou === '00') { // 判断后两位是否为00，如果是则删除00
        return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
      }
      return size
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
.rowtable{
  min-height: 40px;
  line-height:40px;
  .el-col{
    color: #102033;font-weight: bold;
  }
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
