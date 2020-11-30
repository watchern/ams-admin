<template>
  <div><data-tree
    :data-user-id="personCode"
    :scene-code="sceneCode"
    :tree-type="treeType"
    @node-click="handleClick"
  /></div>
</template>

<script>
import dataTree from '@/views/data/role-res/data-tree'

export default {
  components: { dataTree },
  data() {
    return {
      sceneCode: 'auditor',
      personCode: this.$store.state.user.code,
      treeType: 'save' // common:正常的权限树   save:用于保存数据的文件夹树
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
