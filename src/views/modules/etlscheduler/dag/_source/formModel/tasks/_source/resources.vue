<template>
  <div class="resource-list-model">
    <x-select
      v-model="value"
      multiple
      filterable
      :disabled="isDetails"
      placeholder="请选择资源"
      style="width: 100%;"
    >
      <x-option
        v-for="city in resList"
        :key="city.code"
        :value="city.code"
        :label="city.code"
      />
    </x-select>
  </div>
</template>
<script>
import _ from 'lodash'
import disabledState from '@/components/Dolphin/mixin/disabledState'

export default {
  name: 'ResourceList',
  components: {},
  mixins: [disabledState],
  props: {
    resourceList: Array
  },
  data() {
    return {
      // Resource(List)
      resList: [],
      // Resource
      value: []
    }
  },
  watch: {
    // Listening data source
    resourceList(a) {
      this.value = _.map(_.cloneDeep(a), v => v.res)
    },
    value(val) {
      this.$emit('on-cache-resourcesData', _.map(val, v => {
        return {
          res: v
        }
      }))
    }
  },
  created() {
    this.resList = _.map(_.cloneDeep(this.store.state.dag.resourcesListS), v => {
      return {
        code: v.alias
      }
    })

    if (this.resourceList.length) {
      this.value = _.map(_.cloneDeep(this.resourceList), v => v.res)
    }
  },
  mounted() {

  },
  methods: {
    /**
     * Verify data source
     */
    _verifResources() {
      this.$emit('on-resourcesData', _.map(this.value, v => {
        return {
          res: v
        }
      }))
      return true
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
.resource-list-model {
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
  > .add {
    a {
      .iconfont {
        font-size: 18px;
        vertical-align: middle;
        display: inline-block;
        margin-top: 1px;
      }
    }
  }
}
</style>
