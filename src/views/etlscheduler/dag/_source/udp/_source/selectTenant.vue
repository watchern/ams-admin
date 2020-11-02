<template>
  <x-select
    v-model="value"
    :disabled="isDetails"
    style="width: 180px"
    @on-change="_onChange"
  >
    <x-option
      v-for="item in itemList"
      :key="item.id"
      :value="item.id"
      :label="item.tenantName"
    />
  </x-select>
</template>
<script>
import disabledState from '@/components/etl/mixin/disabledState'
export default {
  name: 'FormTenant',
  mixins: [disabledState],
  model: {
    prop: 'value',
    event: 'tenantSelectEvent'
  },
  props: {
    value: {
      type: String,
      default: 'default'
    }
  },
  data() {
    return {
      itemList: []
    }
  },
  watch: {
  },
  mounted() {
    const result = this.itemList.some(item => {
      if (item.id === this.value) {
        return true
      }
    })
    if (!result) {
      this.value = 'default'
    }
  },
  created() {
    const stateTenantAllList = this.store.state.security.tenantAllList || []
    if (stateTenantAllList.length) {
      this.itemList = stateTenantAllList
    } else {
      this.store.dispatch('security/getTenantList').then(res => {
        this.$nextTick(() => {
          this.itemList = res
        })
      })
    }
  },
  methods: {
    _onChange(o) {
      this.value = o.value
      this.$emit('tenantSelectEvent', o.value)
    }
  }
}
</script>
