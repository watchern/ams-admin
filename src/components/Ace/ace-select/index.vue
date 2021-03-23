<template>
  <div class="ace-select flex a-center j-between flex-row" :class="[isFocus && 'ace-select-focus']" @click.stop.prevent="ace">
    <input
      type="text"
      :value="value"
      class="input flex1"
      :placeholder="placeholder"
      @input="input"
      @focus="focus"
    >
    <i class="el-icon-search" />
    <div v-if="isFocus" class="list absolute">
      <div v-for="(item,index) in list" :key="index" class="list-line" @click.stop.prevent="select(item)">{{ item.name }}</div>
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
    list: {
      type: Array,
      default: () => ([
        {
          name: '项目名称1'
        }, {
          name: '项目名称2'
        }, {
          name: '项目名称3'
        }, {
          name: '项目名称4'
        }
      ])
    }
  },
  data() {
    return {
      isFocus: false
    }
  },
  created() {
    document.addEventListener('click', (e) => {
      e.stopPropagation()
      e.preventDefault()
      this.blur()
    })
  },
  methods: {
    ace() {

    },
    input(e) {
      console.log(e.target.value)
      this.$emit('update:value', e.target.value)
    },
    focus() {
      this.isFocus = true
    },
    blur() {
      this.isFocus = false
    },
    select(item) {
      this.$emit('update:value', item.name)
      this.isFocus = false
    }
  }
}
</script>

<style lang="scss" scoped>
.ace-select {
  position: relative;
  border: 1px solid #70747a;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  border-radius: 19px;
  width: 287px;
  height: 32px;
  padding: 0 10px;
  .list {
    top: 32px;
    left: 0;
    right: 0;
    min-height: 30px;
    background: #ffffff;
    box-shadow: 0 9px 9px 0 rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    padding: 2px 0;
    max-height: 184px;
    overflow-y: auto;
    z-index: 99;
    &-line {
      font-family: PingFangSC-Regular;
      font-size: 14px;
      color: #343942;
      letter-spacing: 0;
      line-height: 36px;
      height: 36px;
      padding: 0 15px;
      cursor: pointer;
      &:hover{
        background: #F3F3F3;
      }
    }
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
    line-height: 12px;
  }
  >i{
    width: 30px;
    flex-shrink: 0;
    margin-left: 0px;
    text-align: right;
  }
}
</style>
