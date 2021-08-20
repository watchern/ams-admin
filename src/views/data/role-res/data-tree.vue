<template>
  <div class="app-container" style="width:100%;height:100%;">
    <el-input v-model="filterText1" placeholder="输入关键字进行过滤" />
    <div style="height: calc(100% - 46px);margin-top: 10px;">
      <!-- :default-expand-all="true" 展开全部节点 -->
      <MyElTree
        ref="tree1"
        v-loading="treeLoading"
        :props="props"
        class="filter-tree"
        :highlight-current="true"
        :data="treeData1"
        :filter-node-method="filterNode"
        node-key="id"
        @node-click="nodeClick"
        @node-expand="nodeExpand"
        lazy
        :load="loadNode"
        :default-expanded-keys="openlist"
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
  },
  data() {
    return {
      filterText1: null,
      props: {
        label: "label",
        isLeaf: "leaf",
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
      clickId:''
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
    nodeExpand() {},
    appendnode(childData, parentNode) {
      this.$refs.tree1.append(childData, parentNode);
      parentNode.loaded = false;
      parentNode.expand();
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
</style>
