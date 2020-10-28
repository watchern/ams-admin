<template>
  <div>
    <div class="app-container" />
    <div class="tree">
      <DataTree @node-click="handleFilter" />
    </div>
    <div class="divContent">
      <BaseDirectoryList ref="listData" />
    </div>
  </div>
</template>

<script>
import DataTree from '@/views/data/role-res/data-tree'
import BaseDirectoryList from '@/views/data/directory/directoryList'

export default {
  components: { DataTree, BaseDirectoryList },
  mounted: {
    handleFilter(data, node, tree) {
      console.log(data, node, tree)
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
