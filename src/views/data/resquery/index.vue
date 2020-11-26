<template>
  <div><data-tree @node-click="handleClick" v-if="personcode!==''"
            :dataUserId="personcode"  :sceneCode="sceneCode"
  /></div>
</template>

<script>
import dataTree from '@/views/data/role-res/data-tree'
import { mapState } from 'vuex'
import Cookies from 'js-cookie'

export default {
  computed:{
    //因为时序问题，store中没有personcode时组件可能被加载 导致dataUserId==''  所以要加personcode!=='' 控制
    ...mapState({
      personcode: state => state.user.code
    })

  },
  components: { dataTree },
  data() {
    return {
      sceneCode: 'auditor'
    }
  },
  created() {
    console.log(Cookies.get("personcode"));
  },
  methods: {
    handleClick(data, node, tree) {
      console.log(data, node, tree)
    }
  }
}
</script>
