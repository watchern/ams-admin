<template>
  <div class="sql-type-model">
    <x-select
      v-model="sqlTypeId"
      :disabled="isDetails"
      style="width: 120px;"
      @on-change="_handleSqlTypeChanged"
    >
      <x-option
        v-for="city in sqlTypeList"
        :key="city.id"
        :value="city.id"
        :label="city.code"
      />
    </x-select>
  </div>
</template>
<script>
// import _ from 'lodash'
import { sqlTypeList } from './commcon'
import disabledState from '@/components/etl/mixin/disabledState'
export default {
  name: 'SqlType',
  mixins: [disabledState],
  props: {
    sqlType: String
  },
  data() {
    return {
      // sql(List)
      sqlTypeList: sqlTypeList,
      // sql
      sqlTypeId: '0'
    }
  },
  watch: {
  },
  created() {
    this.$nextTick(() => {
      if (this.sqlType !== 0) {
        this.sqlTypeId = this.sqlType
      } else {
        this.sqlTypeId = this.sqlTypeList[0].id
      }
    })
  },
  mounted() {
  },
  methods: {
    /**
     * return sqlType
     */
    _handleSqlTypeChanged(val) {
      this.$emit('on-sqlType', val.value)
    }
  }
}
</script>
