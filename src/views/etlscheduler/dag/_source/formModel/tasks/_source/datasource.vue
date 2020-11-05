<template>
  <div class="datasource-model">
    <div class="select-listpp">
      <!-- <x-select
        v-model="type"
        style="width: 160px;"
        :disabled="isDetails"
        @on-change="_handleTypeChanged"
      >
        <x-option
          v-for="city in typeList"
          :key="city.code"
          :value="city.code"
          :label="city.code"
        />
      </x-select> -->
      <x-select
        v-model="datasource"
        placeholder="请选择数据源"
        style="width: 500px;"
        :disabled="isDetails"
      >
        <x-option
          v-for="city in datasourceList"
          :key="city.id"
          :value="city.id"
          :label="city.code"
        />
      </x-select>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import disabledState from '@/components/etl/mixin/disabledState'

export default {
  name: 'Datasource',
  components: {},
  mixins: [disabledState],
  props: {
    data: Object,
    supportType: Array
  },
  data() {
    return {
      // Data source type
      type: '',
      // Data source type(List)
      typeList: [],
      // data source
      datasource: '',
      // data source(List)
      datasourceList: []
    }
  },
  computed: {
    cacheParams() {
      return {
        // type: this.type,
        type: this.datasource.dbType,
        datasource: this.datasource
      }
    }
  },
  // Watch the cacheParams
  watch: {
    datasource(val) {
      this.$emit('on-dsData', {
        // type: this.type,
        type: val.dbType,
        datasource: val
      })
    }
  },
  created() {
    const supportType = this.supportType || []
    this.typeList = _.cloneDeep(this.store.state.dag.dsTypeListS)
    // Have a specified data source
    if (supportType.length) {
      const is = (type) => {
        return !!_.filter(supportType, v => v === type).length
      }
      this.typeList = _.filter(this.typeList, v => is(v.code))
    }
    // this.type = _.cloneDeep(this.data.type) || this.typeList[0].code
    this.type = _.cloneDeep(this.data.dbType) || this.typeList[0].code

    // init data
    this._getDatasourceData().then(res => {
      if (_.isEmpty(this.data)) {
        this.$nextTick(() => {
          this.datasource = this.datasourceList[0].id
          this.type = this.datasourceList[0].dbType
          //  this.type = this.datasourceList[0].type
        })
      } else {
        this.$nextTick(() => {
          this.datasource = this.data.datasource
        })
      }
      this.$emit('on-dsData', {
        // type: this.type,
        type: this.datasource.dbType,
        datasource: this.datasource
      })
    })
  },
  mounted() {

  },
  methods: {
    /**
       * Verify data source
       */
    _verifDatasource() {
      if (!this.datasource) {
        this.$message.warning(`请选择数据源`)
        return false
      }
      this.$emit('on-dsData', {
        type: this.datasource.dbType,
        // type: this.type,
        datasource: this.datasource
      })
      return true
    },
    /**
       * Get the corresponding datasource data according to type
       */
    _getDatasourceData() {
      return new Promise((resolve, reject) => {
        this.store.dispatch('dag/getDatasourceList', null).then(res => {
          this.datasourceList = _.map(res.data, v => {
            return {
              id: v.datasourceUuid,
              type: v.dbType,
              code: v.name,
              disabled: false
            }
          })
          resolve()
        })
      })
    },
    /**
       * Brush type
       */
    _handleTypeChanged({ value }) {
      this.type = value
      this._getDatasourceData().then(res => {
        this.datasource = this.datasourceList.length && this.datasourceList[0].id || ''
        this.$emit('on-dsData', {
          // type: this.type,
          type: this.datasource.dbType,
          datasource: this.datasource
        })
      })
    }
  }
}
</script>
