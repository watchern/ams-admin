<template>
  <div class="page-container">
    <!-- left_conter -->
    <div class="left_conter">
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
    <div class="right_conter padding10">

      <!-- <BaseDirectoryList ref="listData"
                         :data-user-id="directyDataUserId"
                         :scene-code="directySceneCode"
                         @append-node="appendnode"
                         @remove="remove"
                         @refresh="refresh" /> -->

      <!-- 数据资源展示 -->
      <!-- <DataResourceDisplay @on_deails="on_deails_change"
                           :is_btn="is_btn"
                           v-if="show_details == false"></DataResourceDisplay> -->

      <DataResourceDisplay @on_deails="onDeailsChange"
                           :isBtn="isBtn"
                           @handleCurrentChange="handleCurrent"
                           @handleSizeChange="handleSize"
                           :list="list"
                           :list_data="list_data"
                           :list_loading="list_loading"
                           @edit_list="Edit_list"
                           v-if="show_details == false"></DataResourceDisplay>

      <!-- 基本信息详情 -->
      <Details ref="Details_ref"
               :tableMetaUuid="tableMetaUuid"
               :isDisable_input="isDisable_input"
               @update_list="UpdateList"
               :is_Edit_list="is_Edit_list"
               v-if="show_details == true"></Details>

    </div>
  </div>
</template>

<script>

import dataTree from '@/views/data/role-res/data-tree'
import BaseDirectoryList from '@/views/data/directory/directorylist'
import TreeCommon from "@/components/datasAssets/treeCommon.vue"
import DataResourceDisplay from "@/components/directory/dataResourceDisplay.vue"
import Details from "@/components/directory/details.vue"
import {
  listUnCached,
  getDataTreeNode, //目录
  getBusinessSystemTree, //系统
  getThemeTree, //主题
  getLayeredTree, //分层
  delTable,
  listByTreePage, //列表
  getColsInfoByTableName, //获取列信息
  synDataStructure, //同步数据
} from "@/api/data/table-info";

export default {
  components: { BaseDirectoryList, dataTree, TreeCommon, DataResourceDisplay, Details },
  props: ['dataUserId', 'sceneCode'],
  data () {
    return {
      allScene: [],
      currentSceneUuid: this.$store.getters.scenecode,
      directyDataUserId: this.$store.state.user.datauserid,
      directySceneCode: 'auditor',
      isTreeShow: true,

      show_details: false, //显示基本信息详情
      isBtn: false, //是否显示按钮
      list_loading: false, //列表loading
      list: [],
      list_data: {}, //分页信息
      // list_details: {},// 点击列表进入详情
      tableMetaUuid: "", //详情id
      // tableRelationQueryUuid: '',//id
      is_Edit_list: 0, //是否编辑
      isDisable_input: true, //详情禁止输入修改
      // 资料树筛选 数据源
      query: {
        dataSource: "Postgre", //筛选条件
        pageNo: 1,
        pageSize: 5,
        businessSystemId: "", //id主键
        tableThemeId: "", //主题
        tableLayeredId: "", //分层
        folderUuid: "", //目录ID
      },
    }
  },
  computed: {
    currentScene () {
      return this.allScene.filter(e => { return e.sceneCode === this.currentSceneUuid })[0]
    },

  },
  created () {
    // this.initDirectory()
    this.query.businessSystemId = "";
    this.query_list();
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
    // on_deails_change (data) {
    //   this.show_details = true

    // },
    //   nodeclick (data, node, tree) {
    //   this.$refs.listData.getList(data, node, tree)
    // },

    // 点击切换树 切换 表单
    nodeclick (data, node, tree) {

      // 点击数据表进入详情
      if (node.level !== 3) {
        if (node.data.children.length == 0 && node.data.type === "table") {
          this.tableMetaUuid = node.data.id;
          this.show_details = true;
          this.isDisable_input = true;
        } else {
          this.divInfo = false;
          this.show_details = false; //显示列表
        }

        if (node.data.type === "table") {
          this.$nextTick(() => {
            this.divInfo = true;
            this.tableId = node.data.id;
          });
        } else {
          if (data.type == "system") {
            this.query.businessSystemId = node.data.id;
            this.query.tableThemeId = "";
            this.query.tableLayeredId = "";
            this.query.folderUuid = "";
            this.query_list();
          } else if (data.type == "theme") {
            this.query.businessSystemId = "";
            this.query.tableThemeId = node.data.id;
            this.query.tableLayeredId = "";
            this.query.folderUuid = "";
            this.query_list();
          } else if (data.type == "layered") {
            this.query.businessSystemId = "";
            this.query.tableThemeId = "";
            this.query.tableLayeredId = node.data.id;
            this.query.folderUuid = "";
            this.query_list();
          }
          // else if (node.data.type === "folder") {
          // 目录
          // let _node = this.$refs.tree.getNode(node);
          // //  设置未进行懒加载状态
          // _node.loaded = false;
          // // 重新展开节点就会间接重新触发load达到刷新效果
          //   // _node.expand();
          //   this.post_getDataTreeNode();//目录
          //   // this.getTagList('ROOT', this.query.dataSource)
          //   // this.getTagList(node.data.id, this.query.dataSource);//目录
          //   this.query.businessSystemId = ''
          //   this.query.tableThemeId = '';
          //   this.query.tableLayeredId = '';
          //   this.query.folderUuid = node.data.id;
          //   this.query_list();

          // }
          // 分页
        }
      }

    },

    // 列表 接口
    query_list () {
      // this.listLoading = true;
      this.list_loading = true; //子组件loading
      let params = {
        businessSystemId: this.query.businessSystemId, //id主键
        tableThemeId: this.query.tableThemeId, //主题
        tableLayeredId: this.query.tableLayeredId, //分层
        folderUuid: this.query.folderUuid, //目录
        dataSource: this.query.dataSource, //数据源
        pageNo: this.query.pageNo,
        pageSize: this.query.pageSize,
      };
      listByTreePage(params).then((resp) => {
        this.list_loading = false; //子组件loading

        this.list_data = resp.data;
        this.list = resp.data.records;

        // this.listLoading = false
        //
      });
    },
    // 修改
    Edit_list (data) {
      this.is_Edit_list = 1;
      for (var i = 0; i < data.length; i++) {
        // this.tableRelationQueryUuid = data[i].tableRelationQuery.tableRelationQueryUuid
        this.tableMetaUuid = data[i].tableMetaUuid;
      }
      this.show_details = true
      this.isDisable_input = false

    },
    // 修改后 刷新列表
    UpdateList () {
      this.show_details = false;
      this.query_list();
    },

    // 显示基本信息详情
    onDeailsChange (data) {
      this.tableMetaUuid = data.tableMetaUuid;
      this.show_details = true;
      this.isDisable_input = true;
    },

    // 分页
    handleCurrent (val) {
      this.query.pageNo = val;
      this.query_list();
    },
    // 每页多少条
    handleSize (val) {
      this.query.pageNo = 1;
      this.query.pageSize = val;
      this.query_list();
    },
  }
}
</script>

<style scoped>
@import url("./../../../assets/css/common.css");
.page-container {
  display: flex;
  padding: 0 !important;
}
.left_conter {
  position: relative;
  height: calc(100vh - 120px);
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
