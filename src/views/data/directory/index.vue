<template>
  <div class="tree-list-container" style="display:flex; justify-content:space-around">
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
      <el-row style="margin-top:20px;height: 100%;">
        <el-col style="height:100%">
          <dataTree v-if="isTreeShow" ref="dataTree" :data-user-id="directyDataUserId" :scene-code="directySceneCode" @node-click="nodeclick" />
        </el-col>
      </el-row>
    </div>
    <div class="divContent">
      <BaseDirectoryList ref="listData" :data-user-id="directyDataUserId" :scene-code="directySceneCode" @append-node="appendnode" @remove="remove" @refresh="refresh" />
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
  mounted(){
    //手动触发一次点击事件展示默认结构
    setTimeout(function(){
      $('.el-tree-node:eq(0)').click()
    },1000)

  },
  methods: {
    initDirectory() {
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
  min-width: 16%;
  margin-left: 1%;
  height: 100%;
}
.divContent {
  min-width: 75%;
}
.agreeicon0 {
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../../assets/img/table_0.png");
  vertical-align: top;
  *vertical-align: middle;
}
.agreeicon1 {
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../../assets/img/table_1.png");
  vertical-align: top;
  *vertical-align: middle;
}
.agreeicon2 {
  display: inline-block;
  height: 14px;
  width: 14px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../../assets/img/table_2.png");
  vertical-align: top;
  *vertical-align: middle;
}
</style>
