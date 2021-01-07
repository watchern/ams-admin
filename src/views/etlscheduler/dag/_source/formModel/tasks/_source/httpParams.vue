<template>
  <div class="user-def-params-model">
    <div
      v-for="(item,$index) in httpParamsList"
      :key="item.id"
      class="select-listpp"
      @click="_getIndex($index)"
    >
      <x-input
        v-model="httpParamsList[$index].prop"
        :disabled="isDetails"
        type="text"
        placeholder="prop(必填)"
        :style="inputStyle"
        @on-blur="_verifProp()"
      />
      <x-select
        v-model="httpParamsList[$index].httpParametersType"
        placeholder="参数位置"
        :disabled="isDetails"
        :style="inputStyle"
        @change="_handlePositionChanged"
      >
        <x-option
          v-for="position in positionList"
          :key="position.code"
          :value="position.id"
          :label="position.code"
        />
      </x-select>
      <x-input
        v-model="httpParamsList[$index].value"
        :disabled="isDetails"
        type="text"
        placeholder="value(必填)"
        :style="inputStyle"
        @on-blur="_handleValue()"
      />
      <span class="lt-add">
        <a
          href="javascript:"
          style="color:red;"
          @click="!isDetails && _removeUdp($index)"
        >
          <em
            class="oper-btn delete"
            :class="_isDetails"
            data-toggle="tooltip"
            title="删除"
          />
        </a>
      </span>
      <span
        v-if="$index === (httpParamsList.length - 1)"
        class="add"
      >
        <a
          href="javascript:"
          @click="!isDetails && _addUdp()"
        >
          <em
            class="ans-icon-increase"
            :class="_isDetails"
            data-toggle="tooltip"
            title="添加"
          />
        </a>
      </span>
    </div>
    <span
      v-if="!httpParamsList.length"
      class="add-dp"
    >
      <a
        href="javascript:"
        @click="!isDetails && _addUdp()"
      >
        <em
          class="oper-btn add"
          :class="_isDetails"
          data-toggle="tooltip"
          title="添加"
        />
      </a>
    </span>
  </div>
</template>
<script>
import _ from 'lodash'
import { positionList } from './commcon'
import disabledState from '@/components/etl/mixin/disabledState'
export default {
  name: 'HttpParams',
  components: {},
  mixins: [disabledState],
  props: {
    udpList: Array,
    // hide direct/type
    hide: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      // Increased data
      httpParamsList: [],
      // Current execution index
      httpParamsIndex: null,
      // 参数位置的下拉框
      positionList: positionList
    }
  },
  computed: {
    inputStyle() {
      return 'width:30%'
    }
  },
  watch: {
    // Monitor data changes
    udpList() {
      this.httpParamsList = this.udpList
    }
  },
  created() {
    this.httpParamsList = this.udpList
  },
  mounted() {
  },
  methods: {
    /**
       * Current index
       */
    _getIndex(index) {
      this.httpParamsIndex = index
    },
    /**
       * 获取参数位置
       */
    _handlePositionChanged() {
      this._verifProp('value')
    },
    /**
       * delete item
       */
    _removeUdp(index) {
      this.httpParamsList.splice(index, 1)
      this._verifProp('value')
    },
    /**
       * add
       */
    _addUdp() {
      this.httpParamsList.push({
        prop: '',
        httpParametersType: 'PARAMETER',
        value: ''
      })
    },
    /**
       * blur verification
       */
    _handleValue() {
      this._verifValue('value')
    },
    /**
       * Verify that the value exists or is empty
       */
    _verifProp(type) {
      const arr = []
      let flag = true
      _.map(this.httpParamsList, v => {
        arr.push(v.prop)
        if (!v.prop) {
          flag = false
        }
        if (v.value === '') {
          this.$message.warning(`value不能为空`)
          return false
        }
      })
      if (!flag) {
        if (!type) {
          this.$message.warning(`prop不能为空`)
        }
        return false
      }
      const newArr = _.cloneDeep(_.uniqWith(arr, _.isEqual))
      if (newArr.length !== arr.length) {
        if (!type) {
          this.$message.warning(`prop中有重复`)
        }
        return false
      }
      this.$emit('on-http-params', _.cloneDeep(this.httpParamsList))
      return true
    },
    _verifValue(type) {
      const arr = []
      let flag = true
      _.map(this.httpParamsList, v => {
        arr.push(v.value)
        if (!v.value) {
          flag = false
        }
      })
      if (!flag) {
        this.$message.warning(`value不能为空`)
        return false
      }
      this.$emit('on-http-params', _.cloneDeep(this.httpParamsList))
      return true
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
.user-def-params-model {
  .select-listpp {
    margin-bottom: 6px;
    .lt-add {
      margin: 2px;
      padding-left: 4px;
      a {
        .iconfont {
          font-size: 18px;
          vertical-align: middle;
          margin-bottom: -2px;
          display: inline-block;
        }
      }
    }
  }
  .add {
    a {
      color: #000;
      .iconfont {
        font-size: 16px;
        vertical-align: middle;
        display: inline-block;
        margin-top: -5px;
      }
    }
  }
  .add-dp {
    a {
      color: #0097e0;
      .iconfont {
        font-size: 18px;
        vertical-align: middle;
        display: inline-block;
        margin-top: 2px;
      }
    }
  }
}
</style>

