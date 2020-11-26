<template>
  <div><data-tree @node-click="handleClick" v-if="personcode!==''"
            :dataUserId="personCode"  :sceneCode="sceneCode"
  /></div>
</template>

<script>
import dataTree from '@/views/data/role-res/data-tree'
import Cookies from 'js-cookie'

export default {
  computed:{
  },
  components: { dataTree },
  data() {
    return {
      sceneCode: 'auditor',
      personCode: Cookies.get("personcode")
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
