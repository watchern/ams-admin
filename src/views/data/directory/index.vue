<template>
  <div class="tree-list-container">
    <div class="tree">
      <el-row>
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
      </el-row>
      <el-row style="margin-top:20px">
        <el-col>
          <dataTree v-if="isTreeShow" ref="dataTree" :data-user-id="personcode" :scene-code="sceneCode" @node-click="nodeclick" />
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
import { getAllScene } from '@/api/data/scene'

export default {
  // eslint-disable-next-line vue/order-in-components
  components: { dataTree, BaseDirectoryList },
  // eslint-disable-next-line vue/order-in-components
  data() {
    return {
      sceneCode: 'auditor',
      allScene: [],
      currentSceneUuid: '',
      isTreeShow: true,
      personcode: this.$store.state.user.code
    }
  },
  computed: {
    currentScene() {
      return this.allScene.filter(e => { return e.sceneCode === this.currentSceneUuid })[0]
    }
  },
  watch: {
    currentSceneUuid: {
      // 深度监听，可监听到对象、数组的变化
      handler(val, oldVal) {
        console.log(val)
        this.sceneCode = val
        this.reload()
      }
    },
    deep: true
  },
  created() {
    getAllScene().then(resp => {
      this.allScene = resp.data
    })
  },
  methods: {
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
