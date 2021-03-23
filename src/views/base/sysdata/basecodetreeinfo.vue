<template>
  <div>
    <div class="tree">
      <BaseCodeTree />
    </div>
    <div class="divContent">
      <BaseCodeTreeList ref="listData" />
    </div>
  </div>
</template>

<script>
import BaseCodeTree from '@/views/base/sysdata/basecodetree'
import BaseCodeTreeList from '@/views/base/sysdata/basecodetreelist'
export default {
  components: {
    BaseCodeTree,
    BaseCodeTreeList
  },
  mounted: function() {
    this.$refs.listData.query()
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
