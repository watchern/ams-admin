<template>
  <div class="tree-list-container">
    <div class="tree">
      <!-- <el-row>
        <el-col>
          <el-select v-model="currentSceneUuid" placeholder="请选择">
            <el-option
              v-for="scene in allScene"
              :key="scene.sceneCode"
              :label="scene.sceneName"
              :value="scene.sceneCode"
            />
          </el-select>
        </el-col>
      </el-row> -->
      <el-row style="margin-top:20px">
        <el-col>
          <dataTree v-if="isTreeShow" ref="dataTree" :data-user-id="directyDataUserId" :scene-code="directySceneCode" @node-click="nodeclick" />
        </el-col>
      </el-row>
    </div>
    <div class="divContent">
      <BaseDirectoryList ref="listData" @append-node="appendnode" @remove="remove" @refresh="refresh" />
    </div>
  </div>
</template>

<script>
import dataTree from '@/views/data/role-res/data-tree'
import BaseDirectoryList from '@/views/data/directory/directorylist'

export default {
  // eslint-disable-next-line vue/order-in-components
  components: { dataTree, BaseDirectoryList },
  // eslint-disable-next-line vue/require-prop-types
  props: ['dataUserId', 'sceneCode'],
  data() {
    return {
      allScene: [],
      currentSceneUuid: this.$store.getters.scenecode,
      directyDataUserId: this.$store.state.user.code,
      directySceneCode: 'auditor',
      isTreeShow: true
    }
  },
  computed: {
    currentScene() {
      return this.allScene.filter(e => { return e.sceneCode === this.currentSceneUuid })[0]
    }
  },
  created() {
    this.initDirectory()
  },
  methods: {
    initDirectory() {
      debugger
      console.log(this.dataUserId)
      if (typeof (this.dataUserId) !== 'undefined') {
        this.directyDataUserId = this.dataUserId
      }
      if (typeof (this.sceneCode) !== 'undefined') {
        this.directySceneCode = this.sceneCode
      }
    },
    reload() {
      this.isTreeShow = false
      this.isRouterAlive = false
      this.$nextTick(() => (this.isTreeShow = true))
    },
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
