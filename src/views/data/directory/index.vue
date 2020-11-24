<template>
  <div class="app-container">
    <div class="tree">
      <dataTree ref="dataTree" :data-user-id="dataUserId" :scene-code="sceneCode" @node-click="nodeclick" />
    </div>
    <div class="divContent">
      <BaseDirectoryList ref="listData" @append-node="appendnode" @refresh="refresh" />
    </div>
  </div>
</template>

<script>
import dataTree from '@/views/data/role-res/data-tree'
import BaseDirectoryList from '@/views/data/directory/directorylist'

export default {
  components: { dataTree, BaseDirectoryList },
  data() {
    return {
      dataUserId: this.$store.getters.personcode,
      sceneCode: 'auditor'
    }
  },
  created() {
  },
  methods: {
    nodeclick(data, node, tree) {
      this.$refs.listData.getList(data, node, tree)
    },
    appendnode(childData, parentNode) {
      this.$refs.dataTree.appendnode(childData, parentNode)
    },
    refresh() {
      this.$refs.dataTree.refresh()
    }
  }
}
</script>

<style scoped>
.tree {
  width: 20%;
  float: left;
  margin-left: 1%;
  height: 95%;
}
.divContent {
  width: 78%;
  float: right;
}
</style>
