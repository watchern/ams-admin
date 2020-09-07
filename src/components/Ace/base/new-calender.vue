<template>
  <div class="new-calender">
    <div class="calender-title flex a-center j-between flex-row">
      <i class="el-icon-arrow-left" @click="actionHandle('prevMonth')"></i>
      <span class="time">{{nowYear}}年 {{nowZhMonth}}月</span>
      <i class="el-icon-arrow-right" @click="actionHandle('nextMonth')"></i>
    </div>
    <div class="calender-content">
      <div class="t-header flex a-center flex-row j-between">
        <div class="tb t-box" v-for="(item,index) in weekList" :key="index*0.1+0.11">{{item}}</div>
      </div>
      <div class="t-body flex a-center flex-row j-start">
        <div
          class="th th-color1 t-box"
          v-for="i in weekDay"
          :key="i*0.2+0.22"
        >{{preMonthSize - weekDay + i}}</div>
        <div
          class="th th-color2 t-box"
          v-for="item in  monthList[nowMonth - 1]"
          :key="item*0.3+0.33"
          :class="[getSelectData(item) && 'th-select']"
          @click="selectDate(item)"
        >
          <span
            :class="[todayYear===nowYear && todayMonth===nowMonth && todayDay==item && 'today-text']"
          >{{item}}</span>
        </div>
        <div class="th th-color1 t-box" v-for="j in lastWeekDay" :key="j*0.4+0.44">{{j}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      weekList: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
      monthList: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      timestamp: null,
      nowYear: 1991,
      nowMonth: 2,
      nowDay: 1,
      todayYear: 1991,
      todayMonth: 2,
      todayDay: 1,
      weekDay: 1,
      lastWeekDay: 1,
      clickActiveIndex: 1,
      nowZhMonth: "",
      zhMonth: [
        {
          num: 1,
          zh: "一"
        },
        {
          num: 2,
          zh: "二"
        },
        {
          num: 3,
          zh: "三"
        },
        {
          num: 4,
          zh: "四"
        },
        {
          num: 5,
          zh: "五"
        },
        {
          num: 6,
          zh: "六"
        },
        {
          num: 7,
          zh: "七"
        },
        {
          num: 8,
          zh: "八"
        },
        {
          num: 9,
          zh: "九"
        },
        {
          num: 10,
          zh: "十"
        },
        {
          num: 11,
          zh: "十一"
        },
        {
          num: 12,
          zh: "十二"
        }
      ]
    };
  },
  props: {
    currentDate: {
      type: String,
      default: ""
    }
  },
  created() {
    this.init();
  },
  computed: {
    preMonthSize() {
      //上一个月有多少天
      return this.nowMonth - 1 === 0 ? 31 : this.monthList[this.nowMonth - 2];
    }
  },
  watch: {
    nowMonth: {
      handler: function(n, o) {
        this.nowMonthChange();
      },
      immediate: true
    }
  },
  methods: {
    selectDate(item) {
      let nowMonth = this.nowMonth < 10 ? "0" + this.nowMonth : this.nowMonth;
      let nowDay = item < 10 ? "0" + item : item;
      let result = `${this.nowYear}/${nowMonth}/${nowDay}`;
      this.$emit("selectDate", result);
      console.log(result);
    },
    getSelectData(item) {
      let nowMonth = this.nowMonth < 10 ? "0" + this.nowMonth : this.nowMonth;
      let nowDay = item < 10 ? "0" + item : item;
      let result = `${this.nowYear}/${nowMonth}/${nowDay}`;
      if (this.currentDate === result) {
        return true;
      } else {
        return false;
      }
    },
    actionHandle(type) {
      switch (type) {
        case "prevMonth":
          if (this.nowMonth > 1) {
            this.nowMonth -= 1;
          } else {
            this.nowMonth = 12;
            this.nowYear -= 1;
          }
          break;
        case "nextMonth":
          if (this.nowMonth < 12) {
            this.nowMonth += 1;
          } else {
            this.nowMonth = 1;
            this.nowYear += 1;
          }
          break;
        default:
          break;
      }
      this.initDate();
    },
    nowMonthChange() {
      this.zhMonth.forEach(item => {
        if (item.num == this.nowMonth) {
          this.nowZhMonth = item.zh;
        }
      });
    },
    init() {
      this.timestamp = new Date();
      this.todayYear = this.nowYear = this.timestamp.getFullYear();
      this.todayMonth = this.nowMonth = this.timestamp.getMonth() + 1;
      this.todayDay = this.nowDay = this.timestamp.getDate();
      this.clickActiveIndex = this.nowDay;
      this.initDate();
    },
    initDate() {
      if (
        (this.nowYear % 4 === 0 && this.nowYear % 100 !== 0) ||
        this.nowYear % 400 === 0
      ) {
        this.monthList[1] = 29;
      } else {
        this.monthList[1] = 28;
      }
      const firstDay = this.getWeekDay(this.nowYear, this.nowMonth, 1); // 获得指定年月的1号是星期几
      this.weekDay = firstDay === 7 ? 0 : firstDay;
      const remineDay = this.getWeekDay(
        this.nowYear,
        this.nowMonth,
        this.monthList[this.nowMonth - 1]
      ); // 获得最后一天是星期几，往后填充多少个
      this.lastWeekDay = remineDay === 7 ? 6 : 6 - remineDay;
    },
    getWeekDay(year, month, day) {
      // 根据年月日获得为星期几
      return new Date(`${year}/${month}/${day}`).getDay();
    }
  }
};
</script>
<style lang="scss" scoped>
.new-calender {
  width: 100%;
  padding: 24px 0;
  border-bottom-left-radius: 13.5px;
  border-bottom-right-radius: 13.5px;
  .calender-title {
    color: white;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    line-height: 20px;
    padding: 0 24px;
    margin-bottom: 4px;
    .time {
      color: #c8ff8c;
    }
  }
  .calender-content {
    padding: 0 10px;
    .t-box {
      width: 14.2857%;
      height: 30px;
      line-height: 30px;
      text-align: center;
    }
    .t-header {
      font-family: Helvetica;
      font-size: 11px;
      color: #6b778c;
    }
    .t-body {
      flex-wrap: wrap;
      .th-select {
        background: #c8ff8c;
        border-radius: 3px;

        span {
          color: #353a43;
        }
      }
      .th-color1 {
        color: #6b778c;
      }
      .th-color2 {
        color: #ffffff;
      }
      .today-text {
        color: #c8ff8c;
        display: inline-block;
        border-bottom: 1px solid #c8ff8c;
        line-height: 1.1;
      }
    }
  }
}
</style>
