<template>
  <div><data-tree @node-click="handleClick" /></div>
</template>

<script>
import dataTree from '@/views/data/role-res/data-tree'

export default {
  components: { dataTree },
  data() {
    return {

    }
  },
  created() {
  },
  methods: {
    handleClick(data, node, tree) {
      console.log(data, node, tree)
    }
  }
}
</script>
