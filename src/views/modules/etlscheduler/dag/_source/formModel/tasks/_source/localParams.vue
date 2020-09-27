<template>
  <div class="user-def-params-model">
    <div
      v-for="(item,$index) in localParamsList"
      :key="item.id"
      class="select-listpp"
      @click="_getIndex($index)"
    >
      <x-input
        v-model="localParamsList[$index].prop"
        :disabled="isDetails"
        type="text"
        placeholder="prop(必填)"
        :maxlength="256"
        :style="inputStyle"
        @on-blur="_verifProp()"
      />
      <template v-if="hide">
        <x-select
          v-model="localParamsList[$index].direct"
          style="width: 80px;"
          :disabled="isDetails"
          @change="_handleDirectChanged"
        >
          <x-option
            v-for="city in directList"
            :key="city.code"
            :value="city.code"
            :label="city.code"
          />
        </x-select>
        <x-select
          v-model="localParamsList[$index].type"
          style="width: 118px;"
          :disabled="isDetails"
          @change="_handleTypeChanged"
        >
          <x-option
            v-for="city in typeList"
            :key="city.code"
            :value="city.code"
            :label="city.code"
          />
        </x-select>
      </template>
      <x-input
        v-model="localParamsList[$index].value"
        :disabled="isDetails"
        type="text"
        placeholder="value(选填)"
        :maxlength="256"
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
            class="ans-icon-trash"
            :class="_isDetails"
            data-toggle="tooltip"
            title="删除"
          />
        </a>
      </span>
      <span
        v-if="$index === (localParamsList.length - 1)"
        class="add"
      >
        <a
          href="javascript:"
          @click="!isDetails && _addUdp()"
        >
          <em
            class="iconfont ans-icon-increase"
            :class="_isDetails"
            data-toggle="tooltip"
            title="添加"
          />
        </a>
      </span>
    </div>
    <span
      v-if="!localParamsList.length"
      class="add-dp"
    >
      <a
        href="javascript:"
        @click="!isDetails && _addUdp()"
      >
        <em
          class="iconfont ans-icon-increase"
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
import { directList, typeList } from './commcon'
import disabledState from '@/components/Dolphin/mixin/disabledState'
export default {
  name: 'UserDefParams',
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
      // Direct data Custom parameter type support IN
      directList: directList,
      // Type data Custom parameter type support OUT
      typeList: typeList,
      // Increased data
      localParamsList: [],
      // Current execution index
      localParamsIndex: null
    }
  },
  computed: {
    inputStyle() {
      return `width:${this.hide ? 160 : 262}px`
    }
  },
  watch: {
    // Monitor data changes
    udpList() {
      this.localParamsList = this.udpList
    }
  },
  created() {
    this.localParamsList = this.udpList
  },
  mounted() {
  },
  methods: {
    /**
     * Current index
     */
    _getIndex(index) {
      this.localParamsIndex = index
    },
    /**
     * handle direct
     */
    _handleDirectChanged() {
      this._verifProp('value')
    },
    /**
     * handle type
     */
    _handleTypeChanged() {
      this._verifProp('value')
    },
    /**
     * delete item
     */
    _removeUdp(index) {
      this.localParamsList.splice(index, 1)
      this._verifProp('value')
    },
    /**
     * add
     */
    _addUdp() {
      this.localParamsList.push({
        prop: '',
        direct: 'IN',
        type: 'VARCHAR',
        value: ''
      })
    },
    /**
     * blur verification
     */
    _handleValue() {
      this._verifProp('value')
    },
    /**
     * Verify that the value exists or is empty
     */
    _verifProp(type) {
      const arr = []
      let flag = true
      _.map(this.localParamsList, v => {
        arr.push(v.prop)
        if (!v.prop) {
          flag = false
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
      this.$emit('on-local-params', _.cloneDeep(this.localParamsList))
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
