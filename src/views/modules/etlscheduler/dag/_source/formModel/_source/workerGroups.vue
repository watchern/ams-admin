<template>
  <x-select
    v-model="value"
    :disabled="isDetails"
    style="width: 180px"
    @on-change="_onChange"
  >
    <x-option
      v-for="item in workerGroupsList"
      :key="item.id"
      :value="item.id"
      :label="item.name"
    />
  </x-select>
</template>
<script>
import disabledState from '@/components/Dolphin/mixin/disabledState'
export default {
  name: 'FormWorkerGroup',
  mixins: [disabledState],
  model: {
    prop: 'value',
    event: 'workerGroupsEvent'
  },
  props: {
    value: {
      type: String,
      default: 'default'
    }
  },
  data() {
    return {
      workerGroupsList: []
    }
  },
  watch: {
  },
  created() {
    const stateWorkerGroupsList = this.store.state.security.workerGroupsListAll || []
    if (stateWorkerGroupsList.length) {
      this.workerGroupsList = stateWorkerGroupsList
    } else {
      this.store.dispatch('security/getWorkerGroupsAll').then(res => {
        this.$nextTick(() => {
          this.workerGroupsList = res
        })
      })
    }
  },
  methods: {
    _onChange(o) {
      this.value = o.value
      this.$emit('workerGroupsEvent', o.value)
    }
  }
}
</script>
