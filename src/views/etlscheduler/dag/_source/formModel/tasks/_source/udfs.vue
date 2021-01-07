<template>
  <div class="udfs-model">
    <x-select
      v-model="udfsStr"
      multiple
      :disabled="isDetails"
      style="width: 100%;"
    >
      <x-option
        v-for="city in udfsList"
        :key="city.id"
        :value="city.id"
        :label="city.code"
      />
    </x-select>
  </div>
</template>
<script>
import _ from 'lodash'
import disabledState from '@/components/etl/mixin/disabledState'

export default {
  name: 'Udfs',
  mixins: [disabledState],
  props: {
    udfs: String,
    type: String
  },
  data() {
    return {
      // UDFS Function
      udfsStr: [],
      // UDFS Function(List)
      udfsList: []
    }
  },
  watch: {
    udfsStr(val) {
      this._verifUdfs()
    },
    type(a) {
      // The props parameter needs to be changed due to the scene.
      this.udfs = ''
      if (a === 'HIVE') {
        this._getUdfList()
      } else {
        this.udfsList = []
      }
    }
  },
  created() {
    this._getUdfList()
  },
  mounted() {
  },
  methods: {
    /**
     * verification
     */
    _verifUdfs() {
      this.$emit('on-udfsData', this.udfsStr.join(','))
      return true
    },
    /**
     * Get UDFS function data
     */
    _getUdfList() {
      this.udfsList = []
      this.store.dispatch('dag/getUdfList', { type: this.type }).then(res => {
        this.udfsList = _.map(res.data, v => {
          return {
            id: v.id,
            code: v.funcName
          }
        })
        const udfs = _.cloneDeep(this.udfs.split(','))
        if (udfs.length) {
          const arr = []
          _.map(udfs, v => {
            _.map(this.udfsList, v1 => {
              if (parseInt(v) === v1.id) {
                arr.push(parseInt(v))
              }
            })
          })
          this.$nextTick(() => {
            _.map(_.cloneDeep(this.udfsList), v => v.res)
            this.udfsStr = arr
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
.udfs-model {
  .add-udfs {
    color: #0097e0;
  }
  .t-list {
    margin-bottom: 14px;
    .v-btn {
      width: 208px;
    }
    &:hover {
    }
    .delect-btn {
      display: inline-block;
      width: 54px !important;
      vertical-align: middle;
      background: #ff0000;
      border-color: #ff0000;
      span {
        vertical-align: middle !important;
      }
    }
  }
}
</style>
