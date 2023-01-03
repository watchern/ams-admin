<template>
  <div class="tree-list-container"
       style="display:flex; justify-content:space-around">
    <!-- left_conter -->
    <div class="left_conter">
      <!-- <div class="tree"> -->
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
      <dataTree v-if="isTreeShow"
                ref="dataTree"
                :data-user-id="directyDataUserId"
                :scene-code="directySceneCode"
                @node-click="nodeclick"
                :folder-show="true"
                @create-folder="createFolder"
                @rename-resource="renameResource"
                @del-data="delData" />
    </div>
    <!-- </div> -->
    <div class="right_conter padding10">

      <!-- <BaseDirectoryList ref="listData"
                         :data-user-id="directyDataUserId"
                         :scene-code="directySceneCode"
                         @append-node="appendnode"
                         @remove="remove"
                         @refresh="refresh" /> -->

      <!-- 数据资源展示 -->
      <DataResourceDisplay @on_deails="on_deails_change"
                           :is_btn="is_btn"
                           v-if="show_details == false"></DataResourceDisplay>

      <!-- 基本信息详情 -->
      <Details ref="Details_ref"
               v-if="show_details == true"></Details>

    </div>

  </div>
</template>

<script>
import dataTree from '@/views/data/role-res/data-tree'
import BaseDirectoryList from '@/views/data/directory/directorylist'
import TreeCommon from "@/components/dataAssets/treeCommon.vue"
import DataResourceDisplay from "@/components/directory/dataResourceDisplay.vue"
import Details from "@/components/directory/details.vue"

export default {
  components: { dataTree, TreeCommon, DataResourceDisplay, Details },
  props: ['dataUserId', 'sceneCode'],
  data () {
    return {
      allScene: [],
      currentSceneUuid: this.$store.getters.scenecode,
      directyDataUserId: this.$store.state.user.datauserid,
      directySceneCode: 'auditor',
      isTreeShow: true,
      show_details: false,//显示基本信息详情
      is_btn: false,//是否显示按钮

    }
  },
  computed: {
    currentScene () {
      return this.allScene.filter(e => { return e.sceneCode === this.currentSceneUuid })[0]
    }
  },
  created () {
    this.initDirectory()
  },
  mounted () {
    //手动触发一次点击事件展示默认结构
    setTimeout(function () {
      $('.el-tree-node:eq(0)').click()
    }, 1000)

  },
  methods: {
    initDirectory () {
      if (typeof (this.dataUserId) !== 'undefined') {
        this.directyDataUserId = this.dataUserId
      }
      if (typeof (this.sceneCode) !== 'undefined') {
        this.directySceneCode = this.sceneCode
      }
    },
    reload () {
      this.isTreeShow = false
      this.isRouterAlive = false
      this.$nextTick(() => (this.isTreeShow = true))
    },
    nodeclick (data, node, tree) {
      this.$refs.listData.getList(data, node, tree)
    },
    //创建文件夹
    createFolder (node) {
      this.$refs.listData.createFolderByTree(node)
    },
    // 重命名文件夹
    renameResource (node) {
      this.$refs.listData.renameResourceByTree(node)
    },
    // 删除文件夹
    delData (node) {
      this.$refs.listData.delDataByTree(node)
    },
    appendnode (childData, parentNode) {
      this.$refs.dataTree.appendnode(childData, parentNode)
    },
    remove (data, parentNode) {
      this.$refs.dataTree.remove(data, parentNode)
    },
    refresh (query) {
      this.$refs.dataTree.refresh(query)
    },

    // 显示基本信息详情
    on_deails_change (data) {
      this.show_details = true

    }
  }
}
</script>

<style scoped>
@import url("./../../../assets/css/common.css");
.page-container {
  padding: 0 0 0 20px !important;
}
.left_conter {
  position: relative;
}

.left_conter >>> .el-tabs__item {
  width: 25%;
  text-align: center;
}
.left_conter >>> .el-tabs__nav {
  width: 100%;
}
.tree {
  /* width: 16%; */
  /* margin-left: 1%; */
  /* height: 100%; */
}
.tree >>> .filter-tree {
  margin-top: 0;
}
.tree .tree-option {
  margin-top: 0 !important;
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
