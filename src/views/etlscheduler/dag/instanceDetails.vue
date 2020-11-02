<template>
  <div class="home-main index-model">
    <m-variable />
    <m-starting-param />
    <m-dag
      v-if="!isLoading"
      :type="'instance'"
    />
    <m-spin :is-spin="isLoading" />
  </div>
</template>
<script>
import mDag from './_source/dag.vue'
import { mapActions, mapMutations } from 'vuex'
import mSpin from '@/components/etl/spin/spin'
import mVariable from './_source/variable'
import mStartingParam from './_source/startingParam'
import Affirm from './_source/jumpAffirm'
import disabledState from '@/components/etl/mixin/disabledState'

export default {
  name: 'InstanceDetails',
  mixins: [disabledState],
  props: {},
  data() {
    return {
      // loading
      isLoading: true
    }
  },
  methods: {
    ...mapMutations('dag', ['setIsDetails', 'resetParams']),
    ...mapActions('dag', ['getProcessList', 'getProjectList', 'getResourcesList', 'getInstancedetail', 'getResourcesListJar']),
    ...mapActions('security', ['getTenantList', 'getWorkerGroupsAll']),
    /**
     * init
     */
    init() {
      this.isLoading = true
      // Initialization parameters
      this.resetParams()
      // Promise Get node needs data
      Promise.all([
        // Process instance details
        this.getInstancedetail(this.$route.params.id),
        // get process definition
        // this.getProcessList(),
        // get project
        this.getProjectList(),
        // get resources
        this.getResourcesList(),
        // get jar
        this.getResourcesListJar(),
        // get worker group list
        this.getWorkerGroupsAll(),
        this.getTenantList()
      ]).then((data) => {
        const item = data[0]
        let flag = false
        if (item.state !== 'WAITTING_THREAD' && item.state !== 'SUCCESS' && item.state !== 'PAUSE' && item.state !== 'FAILURE' && item.state !== 'STOP') {
          flag = true
        } else {
          flag = false
        }
        this.setIsDetails(flag)
        this.isLoading = false

        // Whether to pop up the box?
        Affirm.init(this.$root)
      }).catch(() => {
        this.isLoading = false
      })
    },
    /**
     * Redraw (refresh operation)
     */
    _reset() {
      this.getInstancedetail(this.$route.params.id).then(res => {
        const item = res
        let flag = false
        if (item.state !== 'WAITTING_THREAD' && item.state !== 'SUCCESS' && item.state !== 'PAUSE' && item.state !== 'FAILURE' && item.state !== 'STOP') {
          flag = true
        } else {
          flag = false
        }
        this.setIsDetails(flag)
      })
    }
  },
  watch: {
    '$route': {
      deep: true,
      handler() {
        this.init()
      }
    }
  },
  created() {
    this.init()
  },
  mounted() {
  },
  components: { mDag, mSpin, mVariable, mStartingParam }
}
</script>
