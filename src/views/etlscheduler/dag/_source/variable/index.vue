<template>
  <div class="assist-dag-model">
    <template v-if="isView && isActive">
      <m-variables-view />
    </template>
  </div>
</template>
<script>
import mVariablesView from './variablesView'
export default {
  name: 'AssistDagIndex',
  components: { mVariablesView },
  data() {
    return {
      isView: false,
      isActive: true
    }
  },
  watch: {
    '$route': {
      deep: true,
      handler() {
        this.isActive = false
        this.$nextTick(() => (this.isActive = true))
      }
    }
  },
  methods: {
    _toggleView() {
      this.isView = !this.isView
    }
  }
}
</script>
