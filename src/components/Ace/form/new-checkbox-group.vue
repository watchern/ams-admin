<template>
  <div class="new-checkbox-group">
    <div class="line-radio flex a-center j-start flex-row" v-for="(item,index) in radioList" :key="index" >
      <span class="radio inline-block" :class="[value===item.value && 'radio-active']" @click="select(item)">
        <i class="el-icon-check icon" v-if="value===item.value"></i>
      </span>
      <span class="label inline-block" @click="select(item)">{{item.label}}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: [String, Number],
    radioList: {
      type: Array,
      default: () => [
        {
          label: "一周内",
          value: "1"
        },
        {
          label: "一月内",
          value: "2"
        },
        {
          label: "一年内",
          value: "3"
        }
      ]
    }
  },
  methods:{
    select(item){
      this.$emit('input',item.value)
    }
  }
};
</script>
<style lang="scss" scoped>
.new-checkbox-group {
  .line-radio {
    margin-top: 12.5px;
    height: 24px;
    .radio {
      border: 1px solid #454c58;
      width: 16px;
      height: 16px;
      margin-right: 9px;
      cursor: pointer;
      position: relative;
      border-radius: 3px;
      &-active {
        background: #c8ff8c;
      }
      .icon{
        color: #2A2E37;
        // color: red;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-left: -6px;
        margin-top: -6px;
        font-size: 8px;
        font-weight: 600;
      }
    }
    .label {
      font-family: PingFangSC-Regular;
      font-size: 14px;
      color: #ffffff;
      letter-spacing: 0.1px;
      line-height: 24px;
      cursor: pointer;
    }
  }
}
</style>
