<template>
  <div class="home-main index-model">
    <m-dag
      v-if="!isLoading"
      :type="'definition'"
      :release-state="releaseState"
    />
    <m-spin :is-spin="isLoading" />
  </div>
</template>
<script>
import mDag from './_source/dag.vue'
import mSpin from '@/components/etl/spin/spin'
import Affirm from './_source/jumpAffirm'
import disabledState from '@/components/etl/mixin/disabledState'
import { mapActions, mapMutations } from 'vuex'

export default {
  name: 'DefinitionDetails',
  mixins: [disabledState],
  props: {},
  data() {
    return {
      // loading
      isLoading: true,
      // state
      releaseState: '',
      // 状态为编辑还是查看
      isDetails: false
    }
  },
  methods: {
    ...mapMutations('dag', ['resetParams', 'setIsDetails']),
    ...mapActions('dag', ['getProcessList', 'getProcessDetails', 'getClassList', 'getResourcesList']),
    // ...mapActions('dag', ['getProcessList', 'getProcessDetails', 'getClassList']),
    // ...mapActions('dag', ['getProcessList', 'getProjectList', 'getResourcesList', 'getProcessDetails', 'getResourcesListJar']),
    // ...mapActions('security', ['getTenantList', 'getWorkerGroupsAll']),
    /**
     * init
     */
    init() {
      this.isLoading = true
      // Initialization parameters
      this.resetParams()
      if (this.$route.params.status === '1' || this.$route.params.status === 1) {
        this.isDetails = true
      }
      // Promise Get node needs data
      Promise.all([
        // Node details
        this.getProcessDetails(this.$route.params.id),
        // get process definition
        // this.getProcessList(),
        this.getClassList(),
        // get project
        // this.getProjectList(),
        // get resource
        this.getResourcesList()
        // get jar
        // this.getResourcesListJar()
        // ,
        // get worker group list
        // this.getWorkerGroupsAll(),
        // this.getTenantList()
      ]).then((data) => {
        const item = data[0]
        // this.setIsDetails(item.status === 1)
        this.setIsDetails(this.isDetails)
        this.status = item.status
        this.releaseState = item.status
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
      this.getProcessDetails(this.$route.params.id).then(res => {
        const item = res
        this.setIsDetails(item.status === 1)
        this.status = item.status
        this.releaseState = item.status
        // this.setIsDetails(item.releaseState === 'ONLINE')
        // this.releaseState = item.releaseState
      })
    }
  },
  watch: {
    // Listening for routing changes
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
  components: { mDag, mSpin }
}
</script>
