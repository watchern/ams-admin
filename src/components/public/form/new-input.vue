<template>
  <div class="new-input flex a-center j-between flex-row" :style="styleClass">
    <template v-if="iconAround==='suffix'">
      <input type="text" class="input h100" placeholder="placeholder" :value="value" v-bind="$attrs" @keydown.enter="keydown" @input="input">
      <i class="el-icon-search icon flex-shrink suffix-icon" />
    </template>
    <template v-if="iconAround==='prefix'">
      <i class="el-icon-search icon flex-shrink prefix-icon" />
      <input type="text" class="input h100" placeholder="placeholder" :value="value" v-bind="$attrs" @keydown.enter="keydown" @input="input">
    </template>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: [String],
    width: {
      type: String,
      default: '180px'
    },
    size: {
      type: String,
      default: 'default'
    },
    iconAround: {
      type: String,
      default: 'suffix'
    },
    iconColor: {
      type: String,
      default: '#343942'
    },
    inputColor: {
      type: String,
      default: '#343942'
    },
    placeholder: {
      type: String,
      default: '查找...'
    }
  },
  computed: {
    styleClass() {
      let height = '32px'
      let fontSize = '12px'
      if (this.size === 'default') {
        height = '32px'
        fontSize = '12px'
      } else if (this.size === 'big') {
        height = '38px'
        fontSize = '14px'
      }
      return {
        width: `${this.width}`,
        height: `${height}`,
        fontSize: `${fontSize}`,
        color: `${this.inputColor}`,
        borderColor: `${this.inputColor}`
      }
    }
  },
  methods: {
    input(e) {
      this.$emit('input', e.target.vlaue)
    },
    keydown() {
      this.$emit('keydown')
    }
  }
}
</script>
<style lang="scss" scoped>
.new-input {
  display: inline-block;
  font-size: 12px;
  border: 1px solid #343942;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  border-radius: 19px;
  padding: 0 15px;
  color: #343942;
  .input {
    border: none;
    outline: none;
    opacity: 0.55;
    font-family: PingFangSC-Regular;
    letter-spacing: 0.09px;
    line-height: 12px;
    width: calc(100% - 18px);
    color: #929498;
  }
  .suffix-icon{
    right: 0px;
  }
  .prefix-icon{
    left: -6px;
  }
  .icon{
    width: 18px;
    font-size: 18px;
    position: relative;
    top: 2px;
  }
}
</style>
