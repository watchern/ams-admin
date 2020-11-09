<template>
  <div><data-tree @node-click="handleClick"
            :dataUserId="dataUserId"  :sceneCode="sceneCode"
  /></div>
</template>

<script>
import dataTree from '@/views/data/role-res/data-tree'

export default {
  components: { dataTree },
  data() {
    return {
      dataUserId: this.$store.getters.personcode,
      sceneCode: 'auditor'
    }
  },
  created() {
  },
  methods: {
    handleClick(data, node, tree) {
      console.log(this.$store.getters.personcode)
      console.log(data, node, tree)
    }
  }
}
</script>
