<template>
  <div class="app-container" style="width:100%;height:100%;">
    <el-row width="100%" style="margin-bottom: 10px">
      <el-col style="width: calc(100% - 64px)">
        <el-input v-model="filterText1" placeholder="输入关键字进行过滤"/>
      </el-col>
      <!--<el-col style="width: 64px">
        <div class="controlTreeNode">
          <el-button
                  title="展开全部节点"
                  type="text"
                  size="mini"
                  class="expandTreeNode"
                  @click="expandAllNodes()"
          ><img class="expandIcon" src="../../../styles/icons/expandicon.png"/>
          </el-button>
          <el-button
                  title="收起全部节点"
                  type="text"
                  size="mini"
                  class="collapseTreeNode"
                  @click="collapseAllNodes()"
          ><img class="collapseIcon" src="../../../styles/icons/collapseicon.png"/>
          </el-button>
        </div>
      </el-col>-->
    </el-row>
    <div class="tree-option" style="height: calc(100% - 70px)"
         v-loading="treeLoading">
      <!-- :default-expand-all="true" 展开全部节点 -->
      <MyElTree
        ref="tree1"
        :props="props"
        class="filter-tree"
        :highlight-current="true"
        :data="treeData1"
        :filter-node-method="filterNode"
        node-key="id"
        @node-click="nodeClick"
        :load="loadNode"
        :expand-on-click-node="false"
        lazy
        :show-checkbox = "treeType == 'move' || treeType == 'save'"
        @check="handleCheck"
        :check-strictly="true"
        :check-on-click-node="true"
      >
        <span slot-scope="{ node, data }" class="custom-tree-node">
          <i
            v-if="data.id === 'root'"
            class="el-icon-s-home"
            style="color: #409eff"
          />
          <!-- class="el-icon-folder" style="color:#409EFF" / -->
          <i v-if="data.type === 'folder'">
            <img
              src="../../../assets/img/table_0.png"
              style="
                height: 16px;
                width: 16px;
                margin-right: 2px;
                vertical-align: top;
                *vertical-align: middle;
              "
            />
          </i>
          <!-- class="el-icon-tickets" style="color: #409eff" / -->
          <i v-else-if="data.type === 'table' && data.extMap.tblType === 'T'">
            <img
              src="../../../styles/icons/table_1.png"
              style="
                height: 16px;
                width: 16px;
                margin-right: 2px;
                vertical-align: top;
                *vertical-align: middle;
              "
            />
          </i>
          <!-- class="el-icon-search"  style="color: #409eff" / -->
          <i v-else-if="data.type === 'table' && data.extMap.tblType === 'V'">
            <img
              src="../../../styles/icons/view.png"
              style="
                height: 16px;
                width: 16px;
                margin-right: 2px;
                vertical-align: top;
                *vertical-align: middle;
              "
            />
          </i>
          <!-- style="color: #409eff" / -->
          <i
            v-else-if="data.type === 'column'"
            class="el-icon-c-scale-to-original"
          />
          <i v-else>
            <img
              src="../../../styles/icons/column.png"
              style="
                height: 16px;
                width: 16px;
                margin-right: 2px;
                vertical-align: top;
                *vertical-align: middle;
              "
            />
          </i>
          <span :title="data.title">{{ node.label }}</span>
          <span style="margin-left: 10px" v-if="folderShow && node.data.type=='folder' && isRead(node)">
            <!--添加： 根节点以及手工维护的节点-->
            <el-button type="text" size="mini"  @click="handleCreateFolder(node)" class="tree-line-btn">
              <svg-icon icon-class="icon-add-1" /></el-button>
            <!--修改： 手工维护的节点，个人空间根目录名称不可编辑 -->
            <el-button type="text" size="mini" @click="handleRenameResource(node)" class="tree-line-btn"
                       v-if="!(node.data.pid == 'ROOT' && node.data.label == personalTitle)">
              <svg-icon icon-class="icon-edit-1" />
            </el-button>
            <!--删除： 手工维护的节点，个人空间根目录名称不可删除-->
            <el-button  type="text" size="mini" @click="handleDelData(node)" class="tree-line-btn"
                        v-if="!(node.data.pid == 'ROOT' && node.data.label == personalTitle)">
              <svg-icon icon-class="icon-delete-1" />
            </el-button>
          </span>
        </span>
      </MyElTree>
    </div>
  </div>
</template>

<script>
import MyElTree from "@/components/public/tree/src/tree.vue";
import {
  getResELTree,
  getResByRole,
  getRoleCols,
  saveRoleTable,
  getTableCol,
} from "@/api/data/table-info";
import { commonNotify } from "@/utils";

export default {
  components: { MyElTree },
  props: {
    dataUserId: String,
    sceneCode: String,
    treeHeight:{
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
  data() {
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
      clickId:'',
      personalTitle: '审计人员场景'
    };
  },
  computed: {},
  watch: {
    filterText1(val) {
      this.$refs.tree1.filter(val);
    },
  },
  created() {
    this.refresh();
  },
  methods: {
    // expandAllNodes(){
    //   this.ifExpandAll = true;
    //   this.changeTreeNodeStatus(this.$refs.tree1.store.root)
    // },
    // collapseAllNodes(){
    //   this.ifExpandAll = false;
    //   this.changeTreeNodeStatus(this.$refs.tree1.store.root)
    // },
    // changeTreeNodeStatus (node) {
    //   node.ifExpandAll = this.ifExpandAll
    //   for (let i = 0; i < node.childNodes.length; i++) {
    //     // 改变节点的自身expanded状态
    //     node.childNodes[i].expanded = this.ifExpandAll
    //     // 遍历子节点
    //     if (node.childNodes[i].childNodes.length > 0) {
    //       this.changeTreeNodeStatus(node.childNodes[i])
    //     }
    //   }
    // },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    getTree() {
      return this.$refs.tree1;
    },
    nodeClick(data, node, tree) {
      this.$emit("node-click", data, node, tree);
    },
    handleCheck(data,checkIds) {
      if (checkIds.checkedKeys.length > 0) {
        this.$refs.tree1.setCheckedKeys([data.id]);
      }
      this.$emit("handle-check", data ,checkIds.checkedKeys.length > 0);
    },
    // nodeExpand() {},
    appendnode(childData, parentNode) {
      this.$refs.tree1.append(childData, parentNode);
      parentNode.loaded = false;
      // parentNode.expand();
    },
    remove(data, parentNode) {
      data.forEach((r, i) => {
        this.$refs.tree1.remove(r);
      });
      parentNode.loaded = false;
      parentNode.expand();
    },
    loadNode(node, resolve) {
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
    isRead(node) {
      if(node.data.extMap.accessType.indexOf(
              this.CommonUtil.DataPrivAccessType.SAVE_TO_FOLDER.value,
      ) >-1) {
        if (node.data.id == 'modelFolder' || node.data.id == 'graphFolder' || node.data.id == 'shareFolder' || node.data.id == 'ocrFolder')  return false
        return true
      }
      return false
    },
    // 新增文件夹
    handleCreateFolder(node) {
      this.$emit("create-folder", node);
    },
    // 重命名文件夹
    handleRenameResource(node) {
      this.$emit("rename-resource", node);
    },
    // 删除文件夹
    handleDelData(node) {
      this.$emit("del-data", node);
    },
    refresh(query) {
      this.treeLoading = true;
      //为防止数据更新的延迟导致的bug在此添加缓冲
      getResELTree({
        dataUserId: this.dataUserId,
        sceneCode: this.sceneCode,
        type: this.treeType,
      }).then((resp) => {
        this.treeLoading = false;
        this.treeData1 = resp.data;
        //默认展开所有文件夹
        this.openlist = ["ROOT"];
        this.inputopenlist(this.treeData1);
        if(query){
          this.clickId = query
          for(let i = 0;i<resp.data.length;i++){
            this.findchild(resp.data[i])
          }
        }else{
          return
        }
      });
    },
    findchild(list){
      if(list.id==this.clickId){
        this.$emit("node-click", list, 'pro', '');
        return
      }else{
        if(list.children.length!=0){
          for(let i =0;i<list.children.length;i++){
            this.findchild(list.children[i])
          }
        }else{
          return
        }
      }
    },
    rep() {
      getResELTree({
        dataUserId: this.dataUserId,
        sceneCode: this.sceneCode,
        type: this.treeType,
      }).then((resp) => {
        this.treeLoading = false;
        this.treeData1 = resp.data;
        //默认展开所有文件夹
        this.openlist = ["ROOT"];
        this.inputopenlist(this.treeData1);
      });
    },
    inputopenlist(dat) {
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

<style lang="scss" scoped>
.filter-tree {
  margin-top: 20px;
}
.dialog-bottom-btns {
}
.transfer-center-item {
  width: 40px;
  margin: 2px;
}
.page-container .left-tree {
  height: 80vh;
  overflow: scroll;
}
.bottom-btn {
  float: right;
  padding-right: 100px;
}
.controlTreeNode{
  width: 100%;
  height: 36px;
  text-align: center;
}
.expandTreeNode{
  position: relative;
  border: 1px #656565;
  top: 6px;
  left: 10px;
  height: 25px;
  width: 25px;
  display: inline-block;
  background: #559ED4;
  &:active{
    background: #5ac3eb !important;
  }
  &:hover{
    background: #5ac3eb !important;
  }
  &:focus{
    background: #5ac3eb !important;
  }
}
.collapseTreeNode{
  position: relative;
  border: 1px #656565;
  top: 6px;
  left: 5px;
  height: 25px;
  width: 25px;
  display: inline-block;
  background: #559ED4;
  &:active{
    background: #5ac3eb !important;
  }
  &:hover{
    background: #5ac3eb !important;
  }
  &:focus{
    background: #5ac3eb !important;
  }
}
.expandIcon{
  height: 12px;
  z-index: 100;
  position: relative;
}
.collapseIcon{
  height: 12px;
  z-index: 100;
  position: relative;
}
.tree-line-btn{
  background: rgba(255,255,255,0) !important;
}
</style>
