<template>
  <div class="app-container">
    <div class="tree">
      <dataTree v-if="personcode!==''" ref="dataTree" :data-user-id="personcode" :scene-code="sceneCode" @node-click="nodeclick" />
    </div>
    <div class="divContent">
      <BaseDirectoryList ref="listData" @append-node="appendnode" @refresh="refresh" />
    </div>
  </div>
</template>

<script>
import dataTree from '@/views/data/role-res/data-tree'
import BaseDirectoryList from '@/views/data/directory/directorylist'
import { mapState } from 'vuex'

export default {
  computed: {
    // 因为时序问题，store中没有personcode时组件可能被加载 导致dataUserId==''  所以要加personcode!=='' 控制
    // eslint-disable-next-line no-undef
    ...mapState({
      personcode: state => state.user.code
    })
  },
  // eslint-disable-next-line vue/order-in-components
  components: { dataTree, BaseDirectoryList },
  // eslint-disable-next-line vue/order-in-components
  data() {
    return {
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
