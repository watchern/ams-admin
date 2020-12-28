<template>
  <div class="http-model">
    <m-list-box>
      <div slot="text">{{ $t('Http Url') }}</div>
      <div slot="content">
        <x-input
          v-model="url"
          :autosize="{minRows:2}"
          :disabled="isDetails"
          type="textarea"
          :placeholder="$t('Please Enter Http Url')"
          autocomplete="off"
        />
      </div>
    </m-list-box>
    <m-list-box>
      <div slot="text">{{ $t('Http Method') }}</div>
      <div slot="content">
        <x-select
          v-model="httpMethod"
          style="width: 150px;"
          :disabled="isDetails"
        >
          <x-option
            v-for="city in httpMethodList"
            :key="city.code"
            :value="city.code"
            :label="city.code"
          />
        </x-select>
      </div>
    </m-list-box>
    <m-list-box>
      <div slot="text">{{ $t('Http Parameters') }}</div>
      <div slot="content">
        <m-http-params
          ref="refHttpParams"
          :udp-list="httpParams"
          :hide="false"
          @on-http-params="_onHttpParams"
        />
      </div>
    </m-list-box>
    <m-list-box>
      <div slot="text">{{ $t('Http Check Condition') }}</div>
      <div slot="content">
        <x-select
          v-model="httpCheckCondition"
          style="width: 230px;"
          :disabled="isDetails"
        >
          <x-option
            v-for="city in httpCheckConditionList"
            :key="city.code"
            :value="city.code"
            :label="city.value"
          />
        </x-select>
      </div>
    </m-list-box>
    <m-list-box>
      <div slot="text">{{ $t('Http Condition') }}</div>
      <div slot="content">
        <x-input
          v-model="condition"
          :autosize="{minRows:2}"
          :disabled="isDetails"
          type="textarea"
          :placeholder="$t('Please Enter Http Condition')"
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
          :hide="false"
          @on-local-params="_onLocalParams"
        />
      </div>
    </m-list-box>
  </div>
</template>
<script>
import _ from 'lodash'
import i18n from '@/module/i18n'
import cookies from 'js-cookie'
import mLocalParams from './_source/localParams'
import mHttpParams from './_source/httpParams'
import mListBox from './_source/listBox'
import disabledState from '@/module/mixin/disabledState'
export default {
  name: 'Http',
  components: { mLocalParams, mHttpParams, mListBox },
  mixins: [disabledState],
  props: {
    backfillItem: Object
  },
  data() {
    return {
      url: '',
      condition: '',
      localParams: [],
      httpParams: [],
      httpMethod: 'GET',
      httpMethodList: [{ code: 'GET' }, { code: 'POST' }, { code: 'HEAD' }, { code: 'PUT' }, { code: 'DELETE' }],
      httpCheckCondition: 'STATUS_CODE_DEFAULT',
      httpCheckConditionList: cookies.get('language') === 'en_US' ? [{ code: 'STATUS_CODE_DEFAULT', value: 'Default response code 200' }, { code: 'STATUS_CODE_CUSTOM', value: 'Custom response code' }, { code: 'BODY_CONTAINS', value: 'Content includes' }, { code: 'BODY_NOT_CONTAINS', value: 'Content does not contain' }] : [{ code: 'STATUS_CODE_DEFAULT', value: '默认响应码200' }, { code: 'STATUS_CODE_CUSTOM', value: '自定义响应码' }, { code: 'BODY_CONTAINS', value: '内容包含' }, { code: 'BODY_NOT_CONTAINS', value: '内容不包含' }]
    }
  },
  computed: {
    cacheParams() {
      return {
        localParams: this.localParams,
        httpParams: this.httpParams,
        url: this.url,
        httpMethod: this.httpMethod,
        httpCheckCondition: this.httpCheckCondition,
        condition: this.condition
      }
    }
  },
  watch: {
    /**
       * Watch the cacheParams
       * @param val
       */
    cacheParams(val) {
      this.$emit('on-cache-params', val)
    }
  },
  created() {
    const o = this.backfillItem
    // Non-null objects represent backfill
    if (!_.isEmpty(o)) {
      this.url = o.params.url || ''
      this.httpMethod = o.params.httpMethod || 'GET'
      this.httpCheckCondition = o.params.httpCheckCondition || 'DEFAULT'
      this.condition = o.params.condition || ''
      // backfill localParams
      const localParams = o.params.localParams || []
      if (localParams.length) {
        this.localParams = localParams
      }
      const httpParams = o.params.httpParams || []
      if (httpParams.length) {
        this.httpParams = httpParams
      }
    }
  },
  mounted() {
  },
  methods: {
    /**
       * return localParams
       */
    _onLocalParams(a) {
      this.localParams = a
    },
    _onHttpParams(a) {
      this.httpParams = a
    },
    /**
       * verification
       */
    _verification() {
      if (!this.url) {
        this.$message.warning(`${i18n.$t('Please Enter Http Url')}`)
        return false
      }
      // localParams Subcomponent verification
      if (!this.$refs.refLocalParams._verifProp()) {
        return false
      }
      if (!this.$refs.refHttpParams._verifProp()) {
        return false
      }
      if (!this.$refs.refHttpParams._verifValue()) {
        return false
      }
      // storage
      this.$emit('on-params', {
        localParams: this.localParams,
        httpParams: this.httpParams,
        url: this.url,
        httpMethod: this.httpMethod,
        httpCheckCondition: this.httpCheckCondition,
        condition: this.condition
      })
      return true
    }
  }
}
</script>
