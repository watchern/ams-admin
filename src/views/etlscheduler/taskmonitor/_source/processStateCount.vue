<template>
  <!-- <div class="process-state-count-model"> -->
  <div v-show="!msg">
    <div v-spin="isSpin" class="data-area">
      <el-col :span="12">
        <div id="process-state-pie" style="height: 350px" />
      </el-col>
      <el-col :span="12">
        <div class="list-table">
          <div
            v-for="(item, $index) in processStateList"
            :key="$index"
            class="text item"
          >
            <div class="list-box">
              <span class="ellipsis" :title="item.key">{{ item.key }}</span>
              <span
                ><a href="javascript:" :class="searchParams.projectId ? 'links' : ''" @click="handleProcess(item.key)">({{ item.value }})</a></span>
              <div class="bottom clearfix">
                <span class="percentage">22%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- <div class="table-small-model">
              <ul v-for="(item, $index) in processStateList" :key="$index">
                <td><span>{{ $index+1 }}</span></td>
                <li>
                  <span class="el-icon-s-data"></span>
                  <span class="ellipsis" :title="item.key">{{ item.key }}</span>
                </li>
                <li>
                  <span class="percentage">22%</span>
                  <br />  
                  <span
                    ><a
                      href="javascript:"
                      :class="searchParams.projectId ? 'links' : ''"
                      @click="handleProcess(item.key)"
                      >{{ item.value }}</a
                    ></span
                  >
                </li>
              </ul>
          </div> -->
      </el-col>
    </div>
  </div>
  <!-- <div v-show="msg">
      <m-no-data v-if="msg" :msg="msg" :height="430" />
    </div> -->
  <!-- </div> -->
</template>
<script>
import _ from "lodash";
import { mapActions } from "vuex";
import { pie } from "./chartConfig";
import Chart from "@/components/etl/ana-charts";
import mNoData from "@/components/etl/noData/noData";
// stateType,
import { statusType } from "./common";
export default {
  name: "ProcessStateCount",
  props: {
    searchParams: Object,
  },
  data() {
    return {
      currentDate: new Date(),
      isSpin: true,
      msg: "",
      processStateList: [],
    };
  },
  methods: {
    ...mapActions("projects", ["getProcessStateCount"]),
    _goProcess(name) {
      this.$router.push({
        name: "projects-instance-list",
        query: {
          // stateType: _.find(stateType, ['label', name])['code'],
          stateType: _.find(statusType, ["label", name])["code"],

          // startDate: this.searchParams.startDate,
          // endDate: this.searchParams.endDate
          startTimeStart: this.searchParams.startTimeStart,
          startTimeEnd: this.searchParams.startTimeEnd,
        },
      });
    },
    // 带着状态和开始结束时间进行页面的跳转，跳转到流程实例页面
    handleProcess(name) {
      this.$router.push({
        path: "/etlscheduler/processinstance",
        name: "processinstance",
        params: {
          // status: JSON.stringify(_.find(stateType, ['label', name]).value),
          status: JSON.stringify(_.find(statusType, ["label", name]).value),
          startTimeStart: this.searchParams.startTimeStart,
          startTimeEnd: this.searchParams.startTimeEnd,
        },
      });
    },
    _handleProcessState(res) {
      const data = res.data.taskCountDtos;
      this.processStateList = _.map(data, (v) => {
        return {
          // key: _.find(stateType, ['code', v.taskStateType])['label'],
          key: _.find(statusType, ["code", v.taskStateType])["label"],

          value: v.count,
          itemStyle: {
            color: _.find(statusType, ["code", v.taskStateType])["color"],
          },
        };
      });
      const myChart = Chart.pie("#process-state-pie", this.processStateList, {
        title: "",
      });
      myChart.echart.setOption(pie);
      // 首页不允许跳转
      if (this.searchParams.projectId) {
        myChart.echart.on("click", (e) => {
          this._goProcess(e.data.name);
        });
      }
    },
  },
  computed: {},
  watch: {
    searchParams: {
      deep: true,
      immediate: true,
      handler(o) {
        this.isSpin = true;
        this.getProcessStateCount(o)
          .then((res) => {
            this.processStateList = [];
            this._handleProcessState(res);
            this.isSpin = false;
          })
          .catch((e) => {
            // this.msg = e.msg || 'error'
            this.isSpin = false;
          });
      },
    },
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  components: { mNoData },
};
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
  float: left;
  margin: 15px 0 0 15px;
}
.text .ellipsis {
  font-size: 16px;
  color: #333;
  padding: 0 0 0 0;
  font-weight: bold;
}
.text .percentage {
  font-size: 14px;
  color: #333;
  padding: 0 0 0 0;
}

.text a {
  color: #2d8cf0;
  font-size: 14px;
  padding: 14px 0 0 0;
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
  width: 60%;
  height: 300px;
  float: left;
}
.list-box{
  width: 100px;
  height: 50px;
}
</style>
