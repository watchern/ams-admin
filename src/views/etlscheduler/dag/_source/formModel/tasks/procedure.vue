<template>
  <div class="procedure-model">
    <m-list-box>
      <div slot="text">{{ $t('Datasource') }}</div>
      <div slot="content">
        <m-datasource
          ref="refDs"
          :support-type="['MYSQL','POSTGRESQL','CLICKHOUSE', 'ORACLE', 'SQLSERVER']"
          :data="{ type:type,datasource:datasource }"
          @on-dsData="_onDsData"
        />
      </div>
    </m-list-box>
    <m-list-box>
      <div slot="text">{{ $t('methods') }}</div>
      <div slot="content">
        <x-input
          v-model="method"
          type="input"
          :disabled="isDetails"
          :placeholder="$t('Please enter method(optional)')"
          autocomplete="off"
        />
      </div>
    </m-list-box>
    <m-list-box>
      <div slot="text">{{ $t('Custom Parameters') }}</div>
      <div slot="content">
        <m-local-params
          ref="refLocalParams"
          :udp-list="localParams"
          @on-local-params="_onLocalParams"
        />
      </div>
    </m-list-box>
  </div>
</template>
<script>
import _ from 'lodash'
import i18n from '@/module/i18n'
import mListBox from './_source/listBox'
import mDatasource from './_source/datasource'
import mLocalParams from './_source/localParams'
import disabledState from '@/module/mixin/disabledState'

export default {
  name: 'Procedure',
  components: { mListBox, mDatasource, mLocalParams },
  mixins: [disabledState],
  props: {
    backfillItem: Object
  },
  data() {
    return {
      // method
      method: '',
      // Custom parameter
      localParams: [],
      // Data source type
      type: '',
      // data source
      datasource: '',
      // Return to the selected data source
      rtDatasource: ''
    }
  },
  computed: {
    cacheParams() {
      return {
        type: this.type,
        datasource: this.rtDatasource,
        method: this.method,
        localParams: this.localParams
      }
    }
  },
  watch: {
    // Watch the cacheParams
    cacheParams(val) {
      this.$emit('on-cache-params', val)
    }
  },
  created() {
    const o = this.backfillItem

    // Non-null objects represent backfill
    if (!_.isEmpty(o)) {
      this.name = o.name
      this.desc = o.desc

      // backfill
      this.type = o.params.type || ''
      this.datasource = o.params.datasource || ''
      this.method = o.params.method || ''

      // backfill localParams
      const localParams = o.params.localParams || []
      if (localParams.length) {
        this.localParams = localParams
      }
    }
  },
  mounted() {
  },
  methods: {
    /**
       * return type or datasource
       */
    _onDsData(o) {
      this.type = o.type
      this.rtDatasource = o.datasource
    },
    /**
       * return udp
       */
    _onLocalParams(a) {
    },
    /**
       * verification
       */
    _verification() {
      // datasource Subcomponent verification
      if (!this.$refs.refDs._verifDatasource()) {
        return false
      }

      // Verification function
      if (!this.method) {
        this.$message.warning(`${i18n.$t('Please enter method')}`)
        return false
      }

      // localParams Subcomponent verification
      if (!this.$refs.refLocalParams._verifProp()) {
        return false
      }
      // storage
      this.$emit('on-params', {
        type: this.type,
        datasource: this.rtDatasource,
        method: this.method,
        localParams: this.localParams
      })
      return true
    }
  }
}
</script>

