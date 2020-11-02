<template>
  <div class="home-main index-model">
    <m-dag v-if="!isLoading" />
    <m-spin :is-spin="isLoading" />
  </div>
</template>
<script>
import mDag from './_source/dag.vue'
import { mapActions, mapMutations } from 'vuex'
import mSpin from '@/components/etl/spin/spin'
import Affirm from './_source/jumpAffirm'
import disabledState from '@/components/etl/mixin/disabledState'

export default {
  name: 'CreateIndex',
  // mixins
  mixins: [disabledState],
  props: {},
  data() {
    return {
      // loading
      isLoading: true
    }
  },
  methods: {
    ...mapMutations('dag', ['resetParams']),
    ...mapActions('dag', ['getProcessList', 'getClassList', 'getProjectList', 'getResourcesList', 'getResourcesListJar', 'getResourcesListJar']),
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
        // get process definition
        // this.getProcessList(),
        // get project
        this.getProjectList(),
        // get jar
        this.getResourcesListJar(),
        // get resource
        this.getResourcesList(),
        // get jar
        this.getResourcesListJar(),
        // get worker group list
        this.getWorkerGroupsAll(),
        this.getTenantList(),
        this.getClassList()
      ]).then((data) => {
        this.isLoading = false
        // Whether to pop up the box?
        Affirm.init(this.$root)
      }).catch(() => {
        this.isLoading = false
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
  components: { mDag, mSpin }
}
</script>
