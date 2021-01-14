<template>
  <div class="user-def-params-model">
    <div
      v-for="(item,$index) in paramList"
      :key="item.id"
      class="select-listpp"
      @click="_getIndex($index)"
    >
      <x-input
        v-model="paramList[$index].prop"
        :disabled="true"
        type="text"
        placeholder="prop"
        :maxlength="180"
        style="width: 120px;display: none;"
      />
      <x-input
        v-model="paramList[$index].propName"
        :disabled="true"
        type="text"
        placeholder="propName"
        :maxlength="180"
        :style="inputStyle"
        :title="paramList[$index].propName"
        @on-blur="_verifProp()"
      />
      <template v-if="hide">
        <x-input
          v-model="paramList[$index].propType"
          :style="inputStyle"
          :disabled="true"
          @change="_handleTypeChanged"
        />
      </template>
      <!-- <x-input
        v-model="paramList[$index].value"
        :disabled="isDetails"
        type="text"
        placeholder="value(选填)"
        :maxlength="256"
        :style="inputStyle"
        @on-blur="_handleValue()"
      /> -->
      <x-select
        v-model="paramList[$index].paramUuid"
        :disabled="isDetails"
        filterable
        :add-title="true"
        placeholder="关联参数"
        :maxlength="256"
        :style="inputStyle"
        @on-change="_paramChange($index,$event)"
      >
        <x-option
          v-for="model in paramListS"
          :key="model.paramUuid"
          :value="model.paramUuid"
          :label="model.paramName"
          :title="model.paramName"
        />
      </x-select>
      <x-input
        v-if="routerType === 'instance'"
        v-model="paramList[$index].value"
        :disabled="isDetails"
        type="text"
        placeholder="参数值"
        :maxlength="256"
        :style="inputStyle"
        :title="paramList[$index].value"
        @on-blur="_verifProp()"
      />
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import { directList, typeList } from './commcon'
import disabledState from '@/components/etl/mixin/disabledState'
import { listByPage, getById } from '@/api/etlscheduler/paramfield'
import store from '@/store'

export default {
  name: 'JavaParams',
  components: {},
  mixins: [disabledState],
  props: {
    udpList: Array,
    // hide direct/type
    routerType: String,
    hide: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      store,
      // Direct data Custom parameter type support IN
      directList: directList,
      // Type data Custom parameter type support OUT
      typeList: typeList,
      // Increased data
      localParamsList: [],
      // Current execution index
      localParamsIndex: null,
      paramListS: [],
      paramList: [],
      paramListIndex: null,
      paramInstanceList: [],
      paramMap: {}
    }
  },
  computed: {
    inputStyle() {
      return `width: ${this.routerType === 'instance' ? 125 : 167}px`
      // return `width:${this.hide ? 160 : 256}px`
    }
  },
  watch: {
    // Monitor data changes
    udpList() {
      this.paramList = this.udpList
    }
  },
  created() {
    const query = { 'pageNo': 1,
      'pageSize': 1000 }
    listByPage(query).then(resp => {
      this.paramListS = resp.data.records
    })
    if (this.routerType === 'instance') {
      this.paramInstanceList = this.store.state.dag.processInstanceDetail.distinctParamList
      this.paramInstanceList.forEach((r, i) => {
        this.paramMap[r.param.paramUuid] = r
      })
      this.udpList.forEach((r, i) => {
        this.paramInstanceList.forEach((j, k) => {
          if (r.paramUuid === j.param.paramUuid) {
            r.value = j.value
          }
        })
      })
    }
    this.paramList = this.udpList
  },
  mounted() {
  },
  methods: {
    /**
     * Current index
     */
    _getIndex(index) {
      this.paramListIndex = index
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
      this.paramList.splice(index, 1)
      this._verifProp('value')
    },
    /**
     * add
     */
    _addUdp() {
      this.paramList.push({
        prop: '',
        name: '',
        type: 'String',
        value: '',
        paramUuid: '',
        param: {}
      })
    },
    /**
     * blur verification
     */
    _handleValue() {
      this._verifProp('value')
    },
    _paramChange(a, b) {
      getById(b.value).then(resp => {
        this.paramList[a].param = resp.data
      })
    },
    /**
     * Verify that the value exists or is empty
     */
    _verifProp(type) {
      // const arr = []
      // let flag = true
      let paramFlag = true
      _.map(this.paramList, v => {
        // arr.push(v.prop)
        // if (!v.prop) {
        //   flag = false
        // }
        if (v.paramUuid === '' || v.paramUuid === null) {
          paramFlag = false
        }
      })
      if (!paramFlag) {
        this.$message.warning(`关联参数不能为空`)
        return false
      }
      // if (!flag) {
      //   if (!type) {
      //     this.$message.warning(`prop不能为空`)
      //   }
      //   return false
      // }
      // const newArr = _.cloneDeep(_.uniqWith(arr, _.isEqual))
      // if (newArr.length !== arr.length) {
      //   if (!type) {
      //     this.$message.warning(`prop中有重复`)
      //   }
      //   return false
      // }
      this.$emit('on-local-params', _.cloneDeep(this.paramList))
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
