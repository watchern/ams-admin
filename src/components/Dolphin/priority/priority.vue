<template>
  <div class="priority-model">
    <x-select
      v-model="value"
      style="width: 130px;"
      :disabled="isDetails"
      @on-change="_onChange"
    >
      <div
        slot="trigger"
        slot-scope="{ selectedModel }"
        class="ans-input"
      >
        <div
          class="input-element"
          :class="isDetails?'disabled' : ''"
        >
          <span v-html="_rtUnicode(selectedModel ? selectedModel.label : 'MEDIUM')" />
          <span class="label-p">{{ selectedModel ? selectedModel.label : 'MEDIUM' }}</span>
          <em class="ans-icon-arrow-down" />
        </div>
      </div>
      <x-option
        v-for="item in priorityList"
        :key="item.code"
        :value="item.code"
        :label="item.code"
      >
        <li class="ans-option ans-option-listp">
          <span class="default-option-class">
            <em
              :class="item.unicode"
              :style="{color:item.color}"
            />
            {{ item.code }}
          </span>
        </li>
      </x-option>
    </x-select>
  </div>
</template>
<script>
import _ from 'lodash'
import disabledState from '@/components/Dolphin/mixin/disabledState'

export default {
  name: 'Priority',
  components: {},
  mixins: [disabledState],
  model: {
    prop: 'value',
    event: 'priorityEvent'
  },
  props: {
    value: {
      type: String,
      default: 'MEDIUM'
    }
  },
  data() {
    return {
      priorityList: [
        {
          code: 'HIGHEST',
          unicode: 'ans-icon-line-arrow-up',
          color: '#ff0000'
        },
        {
          code: 'HIGH',
          unicode: 'ans-icon-line-arrow-up',
          color: '#ff0000'
        },
        {
          code: 'MEDIUM',
          unicode: 'ans-icon-line-arrow-up',
          color: '#EA7D24'
        },
        {
          code: 'LOW',
          unicode: 'ans-icon-line-arrow-down',
          color: '#2A8734'
        },
        {
          code: 'LOWEST',
          unicode: 'ans-icon-line-arrow-down',
          color: '#2A8734'
        }
      ]
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    _rtUnicode(value) {
      const o = _.find(this.priorityList, ['code', value])
      return `<em class="${o.unicode}" style="color:${o.color}"></em>`
    },
    _onChange(o) {
      this.value = o.value
      this.$emit('priorityEvent', o.value)
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
.priority-model {
  display: inline-block;
  .ans-option-listp {
    > span {
      font-weight: normal;
      > .iconfont {
        padding-right: 2px;
      }
    }
  }
  .ans-input {
    .input-element {
      cursor: pointer;
      height: 32px;
      line-height: 30px;
      position: relative;
      font-weight: normal;
      .ans-icon-arrow-down {
        position: absolute;
        right: 8px;
        top: 0;
        font-size: 12px;
        color: #888;
        cursor: pointer;
      }
      span {
        vertical-align: middle;
        &.label-p {
          margin-top: -4px;
          display: inline-block;
        }
      }
    }
  }
}
</style>
