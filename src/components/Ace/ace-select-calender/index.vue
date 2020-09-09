<template>
  <div
    class="ace-select-calender flex a-center j-between flex-row"
    :class="[isFocus && 'ace-select-calender-focus']"
    @click.stop.prevent="ace"
  >
    <div class="input flex1 h100" @click="isFocus=!isFocus">{{ value?value:placeholder }}</div>
    <i class="el-icon-date" />
    <div v-if="isFocus" class="list absolute">
      <new-calender type="light" :current-date="currentDate" @selectDate="selectDate" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '查找...'
    },
    currentDate: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isFocus: false
    }
  },
  created() {
    document.addEventListener('click', e => {
      e.stopPropagation()
      e.preventDefault()
      this.blur()
    })
  },
  methods: {
    ace() {},
    selectDate(date) {
      this.isFocus = false
      this.$emit('update:value', date)
    },
    blur() {
      this.isFocus = false
    }
  }
}
</script>

<style lang="scss" scoped>
.ace-select-calender {
  position: relative;
  border: 1px solid #70747a;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  border-radius: 19px;
  width: 287px;
  height: 32px;
  padding: 0 10px;
  .list {
    left: 0;
    right: 0;
    top: 32px;
    background: #ffffff;
    box-shadow: 0 9px 9px 0 rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    border-radius: 8px;
    z-index: 100;
  }
  &-focus {
    border: 1px solid #343942;
  }
  .input {
    border: none;
    outline: none;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #343942;
    letter-spacing: 0.1px;
    line-height: 30px;
    user-select: none;
  }
  > i {
    width: 30px;
    flex-shrink: 0;
    margin-left: 0px;
    text-align: right;
  }
}
</style>
