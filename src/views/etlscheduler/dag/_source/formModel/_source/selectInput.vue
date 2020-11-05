<template>
  <x-select
    v-model="value"
    style="width: 157px;"
    :disabled="isDetails"
    @on-change="_onChange"
  >
    <x-input
      v-if="isInput"
      ref="input"
      slot="trigger"
      slot-scope="{ selectedModel }"
      :disabled="isDetails"
      :maxlength="4"
      placeholder="请选择"
      :value="selectedModel === null ? '0' : selectedModel.value"
      style="width: 100%;"
      @on-blur="_onBlur"
      @on-click-icon.stop="_ckIcon"
    >
      <em
        v-show="!isIconState"
        slot="suffix"
        class="ans-icon-fail-solid"
        style="font-size: 15px;cursor: pointer;"
      />
      <em
        v-show="isIconState"
        slot="suffix"
        class="ans-icon-arrow-down"
        style="font-size: 12px;"
      />
    </x-input>
    <x-option
      v-for="city in list"
      :key="city"
      :value="city"
      :label="city"
    />
  </x-select>
</template>
<script>
import _ from 'lodash'
import disabledState from '@/components/etl/mixin/disabledState'
import $ from 'jquery'

export default {
  name: 'FormSelectInput',
  components: {},
  mixins: [disabledState],
  model: {
    prop: 'value',
    event: 'valueEvent'
  },
  props: {
    value: String,
    list: Array
  },
  data() {
    return {
      isIconState: false,
      isInput: true
    }
  },
  watch: {
  },
  created() {
    this._setIconState(this.value)
  },
  mounted() {
  },
  methods: {
    _onChange(o) {
      this.$emit('valueEvent', +o.value)
      this._setIconState(+o.value)
    },
    _setIconState(value) {
      // Whether there is a list
      this.isIconState = _.includes(this.list, parseInt(value))
    },
    _ckIcon() {
      if (this.isDetails) {
        return
      }
      this.isInput = false
      this.$emit('valueEvent', +this.list[0])
      this.isIconState = true
      // Refresh instance
      setTimeout(() => {
        this.isInput = true
      }, 1)
    },
    _onBlur() {
      const val = $(this.$refs['input'].$el).find('input')[0].value
      if (this._validation(val)) {
        this.$emit('valueEvent', val)
        this._setIconState(val)
      }
    },
    _validation(val) {
      if (val === '0') return true

      if (!(/(^[0-9]*[1-9][0-9]*$)/.test(val))) {
        this.$message.warning(`请输入正整数`)
        // init
        this._ckIcon()
        return false
      }
      return true
    }
  }
}
</script>
