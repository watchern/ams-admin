<template>
  <div class="new-time flex a-center flex-row j-end h100">
    <div class="new-time-box flex a-center j-center flex-column">
      <div class="num text-white">{{ days }}</div>
      <div class="label text-white">DAYS</div>
    </div>
    <div class="new-time-box flex a-center j-center flex-column">
      <div class="num text-white">{{ hours }}</div>
      <div class="label text-white">HOURS</div>
    </div>
    <div class="new-time-box flex a-center j-center flex-column">
      <div class="num text-white">{{ min }}</div>
      <div class="label text-white">MIN</div>
    </div>
    <div class="new-time-box flex a-center j-center flex-column">
      <div class="num text-white">{{ sec }}</div>
      <div class="label text-white">SEC</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      days: '09',
      hours: '03',
      min: '12',
      sec: '25'
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
      this.days = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      this.hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
      this.min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
      this.sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
    }
  }
}
</script>

<style lang="scss" scoped>
.new-time {
  &-box {
    width: 77.8px;
    height: 77.8px;
    border-radius: 50%;
    background: rgba(0,0,0,0.3);
    box-shadow: 0 1px 39px 0 rgba(0, 0, 0, 0.16);
    font-size: 20px;
    color: white;
    position: relative;
    .label{
      font-size: 14px;
      margin-top: 4px;
    }
    &:not(:last-child){
      margin-right: 30px;
      &::before{
        content: "";
        display: inline-block;
        position: absolute;
        right: -15px;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: white;
        top: 50%;
        margin-top: -6px;
      }
      &::after{
        content: "";
        display: inline-block;
        position: absolute;
        right: -15px;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: white;
        top: 50%;
        margin-top: 6px;
      }
    }
  }
}
</style>
