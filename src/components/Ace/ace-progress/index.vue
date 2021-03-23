<template>
  <div class="percentloop flex a-center flex-row j-end h100">
    <div class="percent-list">
      <div class="wrap">
        <div :class="daysDeg > 180 ? 'clip-auto circle' : 'circle'">
          <div class="percent left" :style="`-webkit-transform:rotate(${daysDeg}deg);`" />
          <div :class="daysDeg > 180 ? 'percent right' : 'percent right wth0'" />
        </div>
        <div class="inside-round flex a-center j-center flex-column">
          <div class="num text-white">{{ days }}</div>
          <div class="label text-white">DAYS</div>
        </div>
      </div>
    </div>
    <div class="percent-list">
      <div class="wrap">
        <div :class="hoursDeg > 180 ? 'clip-auto circle' : 'circle'">
          <div class="percent left" :style="`-webkit-transform:rotate(${hoursDeg}deg);`" />
          <div :class="hoursDeg > 180 ? 'percent right' : 'percent right wth0'" />
        </div>
        <div class="inside-round flex a-center j-center flex-column">
          <div class="num text-white">{{ hours }}</div>
          <div class="label text-white">HOURS</div>
        </div>
      </div>
    </div>
    <div class="percent-list">
      <div class="wrap">
        <div :class="minDeg > 180 ? 'clip-auto circle' : 'circle'">
          <div class="percent left" :style="`-webkit-transform:rotate(${minDeg}deg);`" />
          <div :class="minDeg > 180 ? 'percent right' : 'percent right wth0'" />
        </div>
        <div class="inside-round flex a-center j-center flex-column">
          <div class="num text-white">{{ min }}</div>
          <div class="label text-white">MIN</div>
        </div>
      </div>
    </div>
    <div class="percent-list">
      <div class="wrap">
        <div :class="secDeg > 180 ? 'clip-auto circle' : 'circle'">
          <div class="percent left" :style="`-webkit-transform:rotate(${secDeg}deg);`" />
          <div :class="secDeg > 180 ? 'percent right' : 'percent right wth0'" />
        </div>
        <div class="inside-round flex a-center j-center flex-column">
          <div class="num text-white">{{ sec }}</div>
          <div class="label text-white">SEC</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      days: '09',
      hours: '03',
      years: '1991',
      months: '1',
      min: '12',
      sec: '25',
      item: {
        number: '123213',
        deg: 90
      }
    }
  },
  computed: {
    daysDeg() {
      const result = new Date(
        parseInt(this.years),
        parseInt(this.months),
        0
      ).getDate()
      return (parseInt(this.days) / result) * 360
    },
    hoursDeg() {
      return (parseInt(this.hours) / 24) * 360
    },
    minDeg() {
      return (parseInt(this.min) / 60) * 360
    },
    secDeg() {
      return (parseInt(this.sec) / 60) * 360
    }
  },
  created() {
    this.init()
    setInterval(() => {
      this.init()
    }, 1000)
  },
  methods: {
    init() {
      const date = new Date()
      this.years = date.getFullYear()
      this.months = date.getMonth()
      this.days = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      this.hours =
        date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
      this.min =
        date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
      this.sec =
        date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
    },
    rangeHandle(type) {
      switch (type) {
        case 'days':
          return 30
          break
      }
    }
  }
}
</script>

<style scoped lang="scss">
/* 大圆 */
.percent-list {
  margin-left: 30px;
  font-size: 20px;
  color: white;
  position: relative;
  &:not(:last-child) {
    &::before {
      content: "";
      display: inline-block;
      position: absolute;
      right: -15px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      top: 50%;
      background: white;
      margin-top: -6px;
    }
    &::after {
      content: "";
      display: inline-block;
      position: absolute;
      right: -15px;
      width: 4px;
      height: 4px;
      background: white;
      border-radius: 50%;
      top: 50%;
      margin-top: 6px;
    }
  }
}
.wrap {
  background-color: transparent;
  position: relative;
  width: 78px;
  height: 78px;
  border-radius: 50%;
  .label {
    font-size: 12px;
    margin-top: 4px;
  }
  /* 绘制圆环*/
  .circle {
    box-sizing: border-box;
    border: 1px solid transparent;
    clip: rect(0, 78px, 78px, 39px); //默认不显示左侧的圆弧  小于180deg的时候
    position: absolute;
    width: 78px;
    height: 78px;
    border-radius: 50%;
    .percent {
      box-sizing: border-box;
      top: -1px;
      left: -1px;
      position: absolute;
      width: 78px;
      height: 78px;
      border-radius: 50%;
    }

    .left {
      border: 2px solid white;
      clip: rect(0, 39px, 78px, 0);
    }
    .right {
      border: 2px solid white;
      clip: rect(0, 78px, 78px, 39px);
    }
    //该样式控制左侧的圆弧是否显示
    .wth0 {
      width: 0;
    }
  }
  //该样式控制左侧的圆弧是否显示
  .clip-auto {
    clip: rect(auto, auto, auto, auto);
  }

  /* 内圈的小圆*/
  .inside-round {
    position: absolute;
    width: 76px;
    height: 76px;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 50%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    text-align: center;
  }
}
</style>
