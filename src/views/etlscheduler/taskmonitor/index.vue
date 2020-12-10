<template>
  <div class="page-container">
    <!-- 选择日期 -->
    <el-row style="height: 50px; line-height: 50px; background-color: #f5f7fa;" align="middle">
      <el-col :span="6" :offset="18">
        <div class="block">
          <el-date-picker
            v-model="value1"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="_datepicker"
          >
          </el-date-picker>
        </div>
      </el-col>
    </el-row>

    <!-- 监控总览/饼图 -->
    <el-row :gutter="10" style="height: 320px; max-height: 400px;">
      <el-col :xs="4" :sm="6" :md="12" :lg="12" :xl="12" >
        <el-card class="box-card" shadow="always" style="height: 320px">
          <div slot="header" class="clearfix" style="padding: 5px">
            <!-- <span>卡片名称</span> -->
            <el-button style="float: right; padding: 3px 0" type="text">
              <time class="time">{{ time | formatDate}}</time>
              <span class="el-icon-refresh-left refresh1" @click="refresh()"></span>
            </el-button>
          </div>
          <!-- <span class="el-icon-refresh-left refresh" style="float: right" /> -->

          <el-row>
            <el-col  style="margin: 0 0 50px 0">
              <!-- <el-tag effect="dark" style="width:119%;height: 80px;"> -->
              <label class="title-middle"> 调度任务总数</label>
              <div class="bottom clearfix">
                <time class="title-large">
                  <span class="el-icon-upload"></span>
                  <span>{{ count }}</span>
                </time>
              </div>
              <!-- </el-tag> -->
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="8">
              <span class="title-middle"> 调度任务总耗时</span>
              <div class="bottom clearfix">
                <time class="title-large">
                  <span class="el-icon-time el-icon-time1"></span>
                  {{ timeConsuming | timeFilter }}
                </time>
              </div>
            </el-col>
            <el-col :span="16">
              <span class="title-middle">调度任务历时</span>
              <div style="font-size: 15px; padding-left: 10px">
                <div class="bottom clearfix">
                  <time class="title-large1">
                    <span class="el-icon-time el-icon-time2"></span>
                    <!-- {{ processtime | timeFilter }} -->
                    <span>{{ startTime | formatDate }}</span> -
                    <span>{{ endTime | formatDate }}</span>
                  </time>
                </div>
              </div>
            </el-col>
          </el-row>

          <!-- <el-button type="primary" class="start-btn">开始调度</el-button>
          <el-button type="success" class="over-btn">结束调度</el-button> -->
        </el-card>
      </el-col>
      <el-col :xs="4" :sm="6" :md="12" :lg="12" :xl="12" >
        <el-card class="box-card" shadow="always" style="height: 320px">
          <div slot="header" class="clearfix" style="padding: 5px">
            <!-- <span>卡片名称</span> -->
            <el-button style="float: right; padding: 3px 0;" type="text">
              <time class="time">{{ time | formatDate }}</time>
              <span class="el-icon-refresh-left refresh1" @click="refresh()"></span>
            </el-button>
          </div>
          <div class="row">
            <m-process-state-count :search-params="searchParams" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="height: 50%;">
      <el-col :span="24" style="padding: 0px">
        <div style="margin-top: 10px">
          <el-tabs type="border-card">
            <el-tab-pane label="调度流程实例"><etl-processin-stance /></el-tab-pane>
            <el-tab-pane label="调度环节实例"><etl-taskin-stance /></el-tab-pane>
            <el-tab-pane label="上游推送文件情况"><etl-data-file /></el-tab-pane>
          </el-tabs>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import dayjs from "dayjs"
import { statusList } from "./_source/common.js"
import mTaskCtatusCount from "./_source/taskCtatusCount"
import mProcessStateCount from "./_source/processStateCount"
import mListConstruction from "./_source/listConstruction"
import etlProcessinStance from "@/views/etlscheduler/processinstance"
import etlTaskinStance from "@/views/etlscheduler/taskinstance"
import etlDataFile from "@/views/etlscheduler/datafile"
import {
  getDataFileList,
  takeTime,
  taskMonitor
} from "@/api/etlscheduler/taskmonitor"
import format from 'element-ui/src/locale/format'

export default {
  name: "ProjectsIndexIndex",
  components: {
    mTaskCtatusCount,
    mProcessStateCount,
    etlProcessinStance,
    etlTaskinStance,
    etlDataFile,
  },
  filters: {
    timeFilter(value) {
      const time = value;
      if (time === null || time === "" || time === 0) {
        return 0 + "秒";
      } else {
        if (time / 1000 >= 0 && time / 1000 < 60) {
          return (time / 1000).toFixed(1) + "秒";
        } else if (time / 1000 >= 60 && time / 1000 < 3600) {
          return (time / 60000).toFixed(1) + "分";
        } else if (time / 1000 > 3600) {
          return (time / 3600000).toFixed(1) + "时";
        }
      }
    },
    formatDate(value) {
      if(value === null){
        return '------'
      }
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      let d = date.getDate();
      d = d < 10 ? "0" + d : d;
      let h = date.getHours();
      h = h < 10 ? "0" + h : h;
      let m = date.getMinutes();
      m = m < 10 ? "0" + m : m;
      let s = date.getSeconds();
      s = s < 10 ? "0" + s : s;
      return y + "-" + MM + "-" + d + " " + h + ":" + m + ":" + s;
    },
  },
  props: {},
  // watch: {
  //   value1() {
  //     this.time = Date.parse(new Date())
  //   }
  // },
  // refresh(){
  //   watch: {
  //     this.time = Date.parse(new Date())
  // }
  // },
  data() {
    return {
      // info: {
      //   stockDate:this.getNowTime(),  //日期
      // },
      time: Date.parse(new Date()),
      searchParams: {
        startTimeStart: "",
        startTimeEnd: "",
      },
      taketime: 0,
      processtime: 0,
      count: 0,
      timeConsuming: 0,
      startTime: null,
      endTime: null,
      dataResourceStatistics: null,
      statusObj: {},

      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      value1: null,
    };
  },
  created() {
    statusList.forEach((r, i) => {
      this.statusObj[r["value"]] = r;
    });
    this.searchParams.startTimeStart = dayjs().format("YYYY-MM-DD");
    this.searchParams.startTimeEnd = dayjs().format("YYYY-MM-DD");
    this.value1 = [dayjs().format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")];
    // console.log('开始' + this.searchParams.startTimeStart + typeof (this.searchParams.startTimeStart))
    // console.log('结束' + this.searchParams.startTimeEnd + typeof (this.searchParams.startTimeEnd))
    // 获取任务的总耗时
    // takeTime().then((resp) => {
    //   this.taketime = resp.data;
    // });
    // 获取任务的历时
    taskMonitor({
      startTimeStart: dayjs().format("YYYY-MM-DD"),
      startTimeEnd: dayjs().format("YYYY-MM-DD"),
    }).then((resp) => {
      this.count = resp.data.count;
      this.timeConsuming = resp.data.timeConsuming;
      this.startTime = resp.data.startTime;
      this.endTime = resp.data.endTime;
    });
    // 获取文件资源的列表
    getDataFileList().then((resp) => {
      this.dataResourceStatistics = resp.data;
    });
  },
  methods: {
    refresh(){
      this._datepicker()
      // getProcessStateCount()
    },
    // 带着开始和结束时间跳转到任务实例页面
    handletask() {
      this.$router.push({
        path: "/etlscheduler/taskinstance",
        name: "taskinstance",
        params: {
          startTimeStart: this.searchParams.startTimeStart,
          startTimeEnd: this.searchParams.startTimeEnd,
        },
      });
    },
    // 带着开始和结束时间跳转到流程实例页面
    handleprocess() {
      this.$router.push({
        path: "/etlscheduler/processinstance",
        name: "processinstance",
        params: {
          startTimeStart: this.searchParams.startTimeStart,
          startTimeEnd: this.searchParams.startTimeEnd,
        },
      });
    },
    handleFile() {
      this.$router.push({ path: "/etlscheduler/resourcemonitor" });
    },
    // 根据时间范围获取任务历时
    _datepicker() {
      this.searchParams.startTimeStart = this.value1[0];
      this.searchParams.startTimeEnd = this.value1[1];
      taskMonitor({
        startTimeStart: this.searchParams.startTimeStart,
        startTimeEnd: this.searchParams.startTimeEnd,
      }).then((resp) => {
        this.count = resp.data.count;
        this.timeConsuming = resp.data.timeConsuming;
        this.startTime = resp.data.startTime;
        this.endTime = resp.data.endTime;
        this.time = Date.parse(new Date())
      });
    },
  },
};
</script>
<style scope>
.all {
  padding: 0;
  font-family: "Microsoft Yahei", "微软雅黑", "Arial", sans-serif;
}
.el-card__body {
  padding: 10px 10px 10px 10px;
}
.el-card__header {
  padding: 0px 0px 0 0;
}
.el-icon-upload {
  font-size: 30px;
  color: #fbc224;
  padding: 10px;
  font-weight: bolder;
}
.el-icon-time1 {
  font-size: 30px;
  color: #9fe4ed;
  padding: 10px;
  font-weight: bolder;
}
.el-icon-time2 {
  font-size: 30px;
  color: #716bc9;
  padding: 10px;
  font-weight: bolder;
}
.title-large {
  font-size: 30px;
  padding: 10px;
  font-weight: bolder;
  font-family: "Microsoft Yahei", "微软雅黑", "Arial", sans-serif;
}
.title-large1 {
  font-size: 20px;
  padding: 10px;
  font-weight: bolder;
}
.title-middle {
  font-size: 18px;
  padding: 10px;
  font-weight: 400;
}

.refresh1 {
  font-size: 20px;
  cursor: pointer;
  margin: 0 10px 0 0;
}
.bottom {
  font-size: 20px;
  margin: 0 0 0 0;
}
.time {
  margin: 0 20px 0 0;
}
/* .query-field{
  padding: 10px 0 0 0;
}
/*.filter-container,.page-container{
  padding: 0;
}
.el-table{
  height: 180px;
} */
</style>
