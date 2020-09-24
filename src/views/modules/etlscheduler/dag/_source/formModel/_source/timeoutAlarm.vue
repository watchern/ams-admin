<template>
  <div class="timeout-alarm-model">
    <div class="clearfix list">
      <div class="text-box">
        <span>任务超时告警</span>
      </div>
      <div class="cont-box">
        <label class="label-box">
          <div style="padding-top: 5px;">
            <x-switch
              v-model="enable"
              :disabled="isDetails"
              @on-click="_onSwitch"
            />
          </div>
        </label>
      </div>
    </div>
    <div
      v-if="enable"
      class="clearfix list"
    >
      <div class="text-box">
        <span>超时策略</span>
      </div>
      <div class="cont-box">
        <label class="label-box">
          <div style="padding-top: 6px;">
            <x-checkbox-group v-model="strategy">
              <x-checkbox
                label="WARN"
                :disabled="isDetails"
              >超时告警</x-checkbox>
              <x-checkbox
                label="FAILED"
                :disabled="isDetails"
              >超时失败</x-checkbox>
            </x-checkbox-group>
          </div>
        </label>
      </div>
    </div>
    <div
      v-if="enable"
      class="clearfix list"
    >
      <div class="text-box">
        <span>超时时长</span>
      </div>
      <div class="cont-box">
        <label class="label-box">
          <x-input
            v-model="interval"
            style="width: 200px;"
            :disabled="isDetails"
            maxlength="9"
          >
            <span slot="append">分</span>
          </x-input>
        </label>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import disabledState from '@/components/Dolphin/mixin/disabledState'

export default {
  name: 'FormTimeoutAlarm',
  components: {},
  mixins: [disabledState],
  props: {
    backfillItem: Object
  },
  data() {
    return {
      // Timeout display hiding
      enable: false,
      // Timeout strategy
      strategy: [],
      // Timeout period
      interval: null
    }
  },
  watch: {
  },
  created() {
    const o = this.backfillItem
    // Non-null objects represent backfill
    if (!_.isEmpty(o) && o.timeout) {
      this.enable = o.timeout.enable || false
      this.strategy = _.split(o.timeout.strategy, ',') || ['WARN']
      this.interval = o.timeout.interval || null
    }
  },
  mounted() {
  },
  methods: {
    _onSwitch(is) {
      // Timeout strategy
      this.strategy = is ? ['WARN'] : []
      // Timeout period
      this.interval = is ? 30 : null
    },
    _verification() {
      // Verification timeout policy
      if (this.enable && !this.strategy.length) {
        this.$message.warning(`超时策略必须选一个`)
        return false
      }
      // Verify timeout duration Non 0 positive integer
      if (this.enable && !parseInt(this.interval) && !_.isInteger(this.interval)) {
        this.$message.warning(`超时时长必须为正整数`)
        return false
      }
      this.$emit('on-timeout', {
        strategy: (() => {
          // Handling checkout sequence
          const strategy = this.strategy
          if (strategy.length === 2 && strategy[0] === 'FAILED') {
            return [strategy[1], strategy[0]].join(',')
          } else {
            return strategy.join(',')
          }
        })(),
        interval: parseInt(this.interval),
        enable: this.enable
      })
      return true
    }
  }
}
</script>
