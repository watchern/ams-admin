<template>

  <div class="app-container"
       style="width:100%;">

    <el-tabs v-model="activeName"
             type="card"
             @tab-click="handleClick">
      <el-tab-pane label="系统"
                   :disabled="tabclick"
                   name="0"></el-tab-pane>
      <el-tab-pane label="主题"
                   :disabled="tabclick"
                   name="1"></el-tab-pane>
      <el-tab-pane label="分层"
                   :disabled="tabclick"
                   name="2"></el-tab-pane>
      <el-tab-pane label="目录"
                   :disabled="tabclick"
                   name="3"></el-tab-pane>
    </el-tabs>
    <div class="padding10">
      <el-input v-model="filterText1"
                placeholder="输入关键字进行过滤" />
    </div>
    <!-- 数据源 -->
    <div class="padding10_l">
      <el-form :inline="true"
               :model="query"
               label-position="bottom">
        <el-form-item label="数据源："
                      label-width="70px">
          <el-select v-model="query.dataSource"
                     @change="selectdata"
                     placeholder="请选择数据源">
            <el-option v-for="item in options"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>

    </div>

    <!-- <el-row width="100%" style="margin-bottom: 10px">
      <el-col style="width: calc(100% - 64px)">
        <el-input v-model="filterText1" placeholder="输入关键字进行过滤"/>
      </el-col>
    </el-row> -->

    <div v-show="loading== true"
         class="loading">
      <div class="conter_loading">
        <span><img src="../../../assets/img/loading.gif"
               alt=""></span>
      </div>
    </div>

    <!-- 系统 主题 分层  目录-->
    <div class="tree-containerall padding10"
         v-show="loading== false">
      <!-- <div class="tree-option "
           v-loading="treeLoading"> -->
      <!-- :default-expand-all="true" 展开全部节点 -->
      <MyElTree ref="tree1"
                :props="props"
                class="filter-tree"
                :highlight-current="true"
                :data="treeData1"
                :filter-node-method="filterNode"
                node-key="id"
                @node-click="nodeClick"
                :expand-on-click-node="false"
                :show-checkbox="treeType == 'move' || treeType == 'save'"
                @check="handleCheck"
                :check-strictly="true"
                :check-on-click-node="true">
        <span slot-scope="{ node, data }"
              class="custom-tree-node">
          <i v-if="data.id === 'root'"
             class="el-icon-s-home"
             style="color: #409eff" />
          <!-- class="el-icon-folder" style="color:#409EFF" / -->
          <i v-if="data.type === 'folder'">
            <img src="../../../assets/img/table_0.png"
                 style="
                height: 16px;
                width: 16px;
                margin-right: 2px;
                vertical-align: top;
                *vertical-align: middle;
              " />
          </i>
          <!-- class="el-icon-tickets" style="color: #409eff" / -->
          <i v-else-if="data.type === 'table' && data.extMap.tblType === 'T'">
            <img src="../../../styles/icons/table_1.png"
                 style="
                height: 16px;
                width: 16px;
                margin-right: 2px;
                vertical-align: top;
                *vertical-align: middle;
              " />
          </i>
          <!-- class="el-icon-search"  style="color: #409eff" / -->
          <i v-else-if="data.type === 'table' && data.extMap.tblType === 'V'">
            <img src="../../../styles/icons/view.png"
                 style="
                height: 16px;
                width: 16px;
                margin-right: 2px;
                vertical-align: top;
                *vertical-align: middle;
              " />
          </i>
          <!-- style="color: #409eff" / -->
          <i v-else-if="data.type === 'column'"
             class="el-icon-c-scale-to-original" />
          <i v-else>
            <img src="../../../styles/icons/column.png"
                 style="
                height: 16px;
                width: 16px;
                margin-right: 2px;
                vertical-align: top;
                *vertical-align: middle;
              " />
          </i>
          <span :title="data.title">{{ node.label }}</span>
          <span style="margin-left: 10px"
                v-if="folderShow && node.data.type=='folder' && isRead(node)">
            <!--添加： 根节点以及手工维护的节点-->
            <el-button type="text"
                       size="mini"
                       @click="handleCreateFolder(node)"
                       class="tree-line-btn">
              <svg-icon icon-class="icon-add-1" />
            </el-button>
            <!--修改： 手工维护的节点，个人空间根目录名称不可编辑 -->
            <el-button type="text"
                       size="mini"
                       @click="handleRenameResource(node)"
                       class="tree-line-btn"
                       v-if="!(node.data.pid == 'ROOT' && node.data.label == personalTitle)">
              <svg-icon icon-class="icon-edit-1" />
            </el-button>
            <!--删除： 手工维护的节点，个人空间根目录名称不可删除-->
            <el-button type="text"
                       size="mini"
                       @click="handleDelData(node)"
                       class="tree-line-btn"
                       v-if="!(node.data.pid == 'ROOT' && node.data.label == personalTitle)">
              <svg-icon icon-class="icon-delete-1" />
            </el-button>
          </span>
        </span>
      </MyElTree>
      <!-- </div> -->
    </div>

  </div>
</template>

<script>
import {
  listUnCached,
  getDataTreeNode,//目录
  getBusinessSystemTree,//系统
  getThemeTree,//主题
  getLayeredTree,//分层
  delTable,
  listByTreePage,//列表
} from "@/api/data/table-info";

import MyElTree from "@/components/public/tree/src/tree.vue";
import {
  getResELTree,
  getResByRole,
  getRoleCols,
  saveRoleTable,
  getTableCol,
} from "@/api/data/table-info";
import { commonNotify } from "@/utils";
import { truncate } from "fs";

export default {
  components: { MyElTree },
  props: {
    dataUserId: String,
    sceneCode: String,
    treeHeight: {
      type: Number,
      default: 55
    },
    treeType: {
      type: String,
      default: "common", // common:正常的权限树   save:用于保存数据的文件夹树
    },
    folderShow: {
      type: Boolean,
      default: false // 左侧树操作按钮是否显示
    },
  },
  data () {
    return {
      ifExpandAll: false, // 是否展开所有树节点
      filterText1: null,
      props: {
        label: "label",
        isLeaf: "leaf",
        disabled: "disable"
      },
      tableIconPath: "../../images/ico/table_1.png",
      accessForm: {
        folderUuid: null,
        folderName: null,
        parentFolderUuid: null,
        orderNum: 0,
        fullPath: null,
      },
      treeData1: [],
      treeLoading: false,
      //需要打开的节点
      openlist: ["ROOT"],
      //暂存的节点的id
      clickId: '',
      personalTitle: '审计人员场景',
      activeName: '0',//tab切换
      tabclick: false,

      // 资料树筛选 数据源
      query: {
        dataSource: 'Postgre',//筛选条件
      },
      loading: false,
      options: [{
        value: 'Postgre',
        label: 'ADS'
      }, {
        value: 'Hive',
        label: 'MRS-DWS'
      }],
    };
  },
  computed: {},
  watch: {
    filterText1 (val) {
      this.$refs.tree1.filter(val);
    },
  },
  created () {
    this.post_getBusinessSystemTree();//系统
  },
  methods: {
    // 系统
    post_getBusinessSystemTree () {
      this.loading = true
      getBusinessSystemTree(true, this.query.dataSource, false).then((resp) => {
        this.treeData1 = resp.data
        this.loading = false
        this.tabclick = false
      });
    },
    // 主题
    post_getThemeTree () {
      this.loading = true
      getThemeTree(true, this.query.dataSource, false).then((resp) => {
        this.treeData1 = resp.data
        this.loading = false
        this.tabclick = false
      });
    },
    // 分层
    post_getLayeredTree () {
      this.loading = true
      getLayeredTree(true, this.query.dataSource, false).then((resp) => {
        this.treeData1 = resp.data
        this.loading = false
        this.tabclick = false
      });
    },
    // 目录
    post_getDataTreeNode () {
      this.loading = true
      getResELTree({
        dataUserId: this.dataUserId,
        sceneCode: this.sceneCode,
        type: this.treeType,
      }).then((resp) => {
        // this.treeLoading = false;
        this.treeData1 = resp.data;
        this.loading = false
        this.tabclick = false
        //默认展开所有文件夹
        // this.openlist = ["ROOT"];
      });
    },

    // tab切换
    handleClick (tab, event) {
      if (tab.index == '0') {
        this.tabclick = true
        // setTimeout(() => {
        //   this.tabclick = false
        // }, 3000)
        this.post_getBusinessSystemTree();//系统
      } else if (tab.index == '1') {
        this.tabclick = true

        this.post_getThemeTree();//主题
      } else if (tab.index == '2') {
        this.tabclick = true
        this.post_getLayeredTree();//分层
      } else {
        this.tabclick = truncate
        this.post_getDataTreeNode();//目录
      }
    },
    // 选择数据源
    selectdata (val) {
      this.query.dataSource = val
      if (this.activeName == '0') {
        // 系统
        this.post_getBusinessSystemTree();//系统
      } else if (this.activeName == '1') {
        // 主题
        this.post_getThemeTree();//主题
      } else if (this.activeName == '2') {
        // 分层
        this.post_getLayeredTree();//分层
      } else {
        // 目录 
        this.post_getDataTreeNode();//目录

      }

    },


    filterNode (value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // getTree() {
    //   return this.$refs.tree1;
    // },
    nodeClick (data, node, tree) {
      this.$emit("node-click", data, node, tree);
    },
    handleCheck (data, checkIds) {
      if (checkIds.checkedKeys.length > 0) {
        this.$refs.tree1.setCheckedKeys([data.id]);
      }
      this.$emit("handle-check", data, checkIds.checkedKeys.length > 0);
    },
    // nodeExpand() {},
    appendnode (childData, parentNode) {
      this.$refs.tree1.append(childData, parentNode);
      parentNode.loaded = false;
      // parentNode.expand();
    },
    remove (data, parentNode) {
      data.forEach((r, i) => {
        this.$refs.tree1.remove(r);
      });
      parentNode.loaded = false;
      parentNode.expand();
    },
    loadNode (node, resolve) {
      if (node.data.children && node.data.type !== "table") {
        resolve(node.data.children);
      } else if (node.data.type === "table" && node.data.children.length > 0) {
        resolve(node.data.children);
      } else if (
        node.data.type === "table" &&
        node.data.children.length === 0
      ) {
        getTableCol(node.data.id).then((resp) => {
          var nodes = [];
          resp.data.forEach((e) => {
            nodes.push({
              id: e.colMetaUuid,
              label: e.colName,
              type: "col",
              dataType: e.dataType,
              dataLength: e.dataLength,
              leaf: true,
              title: e.chnName,
            });
          });
          resolve(nodes);
        });
      } else {
        // debugger;
      }
    },
    // 是否可读
    isRead (node) {
      if (node.data.extMap.accessType.indexOf(
        this.CommonUtil.DataPrivAccessType.SAVE_TO_FOLDER.value,
      ) > -1) {
        if (node.data.id == 'modelFolder' || node.data.id == 'graphFolder' || node.data.id == 'shareFolder' || node.data.id == 'ocrFolder') return false
        return true
      }
      return false
    },
    // 新增文件夹
    handleCreateFolder (node) {
      this.$emit("create-folder", node);
    },
    // 重命名文件夹
    handleRenameResource (node) {
      this.$emit("rename-resource", node);
    },
    // 删除文件夹
    handleDelData (node) {
      this.$emit("del-data", node);
    },
    // refresh (query) {
    //   this.treeLoading = true;
    //   //为防止数据更新的延迟导致的bug在此添加缓冲
    //   getResELTree({
    //     dataUserId: this.dataUserId,
    //     sceneCode: this.sceneCode,
    //     type: this.treeType,
    //   }).then((resp) => {
    //     this.treeLoading = false;
    //     this.treeData1 = resp.data;
    //     //默认展开所有文件夹
    //     this.openlist = ["ROOT"];
    //     this.inputopenlist(this.treeData1);
    //     if (query) {
    //       this.clickId = query
    //       for (let i = 0; i < resp.data.length; i++) {
    //         this.findchild(resp.data[i])
    //       }
    //     } else {
    //       return
    //     }
    //   });
    // },
    findchild (list) {
      if (list.id == this.clickId) {
        this.$emit("node-click", list, 'pro', '');
        return
      } else {
        if (list.children.length != 0) {
          for (let i = 0; i < list.children.length; i++) {
            this.findchild(list.children[i])
          }
        } else {
          return
        }
      }
    },
    // rep () {
    //   getResELTree({
    //     dataUserId: this.dataUserId,
    //     sceneCode: this.sceneCode,
    //     type: this.treeType,
    //   }).then((resp) => {
    //     this.treeLoading = false;
    //     this.treeData1 = resp.data;
    //     //默认展开所有文件夹
    //     this.openlist = ["ROOT"];
    //     this.inputopenlist(this.treeData1);
    //   });
    // },
    inputopenlist (dat) {
      for (let i = 0; i < dat.length; i++) {
        if (dat[i] && dat[i].type == "folder") {
          this.openlist.push(dat[i].id);
          if (dat[i].children) {
            this.inputopenlist(dat[i].children);
          }
        }
      }
    },
  }, // 注册
};
</script>
<style scoped>
.tree-containerall {
  /* height: 75vh; */
  height: calc(100% - 140px);
  overflow: auto;
}
.app-container >>> .el-form-item {
  display: flex;
  width: 100%;
}

.app-container >>> .el-tabs__header {
  margin: 0;
}
.tree-containerall >>> .flow-tree {
  height: 100%;
}
</style>

<style lang="scss" scoped>
.dialog-bottom-btns {
}
.transfer-center-item {
  width: 40px;
  margin: 2px;
}
.page-container .left-tree {
  // height: 80vh;
  overflow: scroll;
}
.bottom-btn {
  float: right;
  padding-right: 100px;
}
.controlTreeNode {
  width: 100%;
  height: 36px;
  text-align: center;
}
.expandTreeNode {
  position: relative;
  border: 1px #656565;
  top: 6px;
  left: 10px;
  height: 25px;
  width: 25px;
  display: inline-block;
  background: #559ed4;
  &:active {
    background: #5ac3eb !important;
  }
  &:hover {
    background: #5ac3eb !important;
  }
  &:focus {
    background: #5ac3eb !important;
  }
}
.collapseTreeNode {
  position: relative;
  border: 1px #656565;
  top: 6px;
  left: 5px;
  height: 25px;
  width: 25px;
  display: inline-block;
  background: #559ed4;
  &:active {
    background: #5ac3eb !important;
  }
  &:hover {
    background: #5ac3eb !important;
  }
  &:focus {
    background: #5ac3eb !important;
  }
}
.expandIcon {
  height: 12px;
  z-index: 100;
  position: relative;
}
.collapseIcon {
  height: 12px;
  z-index: 100;
  position: relative;
}
.tree-line-btn {
  background: rgba(255, 255, 255, 0) !important;
}
</style>
