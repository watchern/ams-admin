<template>
  <div class="tree-list-container">
    <div class="tree">
      <dataTree ref="dataTree" :data-user-id="personcode" :scene-code="sceneCode" @node-click="nodeclick" />
    </div>
    <div class="divContent">
      <BaseDirectoryList ref="listData" @append-node="appendnode" @remove="remove" @refresh="refresh" />
    </div>
  </div>
</template>

<script>
import dataTree from '@/views/data/role-res/data-tree'
import BaseDirectoryList from '@/views/data/directory/directorylist'
import { mapState } from 'vuex'

export default {
  // eslint-disable-next-line vue/order-in-components
  components: { dataTree, BaseDirectoryList },
  // eslint-disable-next-line vue/order-in-components
  data() {
    return {
      sceneCode: 'auditor',
      personcode: this.$store.state.user.code
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
    remove(data, parentNode) {
      this.$refs.dataTree.remove(data, parentNode)
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
