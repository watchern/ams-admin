<template>
  <div class="page-container">
    <DataTree ref="tree" />
    <el-button @click="getCurrentNode">点我</el-button>
  </div>
</template>

<script>
import DataTree from '@/views/data/role-res/data-tree.vue'

export default {
  components: { DataTree },
  data() {
    return {

    }
  },
  created() {
  },
  methods: {
    getCurrentNode() {
      console.log(this.$refs.tree.getTree().getCurrentNode())
    }

  }
}
</script>
