<template>
  <div>
    <el-tabs v-model="activeName"
             type="card"
             @tab-click="handleClick">
      <el-tab-pane label="系统"
                   name="0">系统</el-tab-pane>
      <el-tab-pane label="主题"
                   name="1">主题</el-tab-pane>
      <el-tab-pane label="分层"
                   name="2">分层</el-tab-pane>
      <el-tab-pane label="目录"
                   name="3">目录</el-tab-pane>
    </el-tabs>
    <div class="search">
      <el-input v-model="filterText2"
                placeholder="输入关键字进行过滤" />
    </div>
    <!-- :load="loadNode2" -->
    <!-- lazy -->
    <MyElTree ref="tree2"
              :props="props"
              :data="treeData1"
              :filter-node-method="filterNode"
              :default-expanded-keys="['ROOT']"
              class="filter-tree"
              highlight-current="true"
              node-key="id"
              @node-click="nodeClick">
      <span slot-scope="{ node, data }"
            class="custom-tree-node">
        <i v-if="data.id === 'ROOT'"
           class="el-icon-s-home" />
        <i v-if="data.type === 'FOLDER'">
          <span class="agreeicon0"></span>
        </i>
        <i v-if="data.type === 'TABLE'">
          <span class="icon iconfont agreeicon1"></span>
        </i>
        <i v-if="data.type === 'VIEW'">
          <span class="icon iconfont agreeicon4"></span>
        </i>

        <i v-if="data.type === 'COLUMN'"
           class="el-icon-c-scale-to-original" />
        <span>{{ node.label }}</span>
        <span style="margin-left: 10px">
          <!--添加： 根节点以及手工维护的节点-->
          <el-button v-if="
                    data.id === 'ROOT' ||
                    (data.extMap && data.extMap.folder_type === 'maintained')
                  "
                     type="text"
                     size="mini"
                     @click.stop="() => handleCreateFolder(node, data)">
            <i class="el-icon-circle-plus" />
            <!--                <span class="newicon"></span>-->
          </el-button>
          <!--修改： 手工维护的节点-->
          <el-button v-if="data.extMap && data.extMap.folder_type === 'maintained'"
                     type="text"
                     size="mini"
                     @click.stop="() => handleUpdateFolder(node, data)">
            <i class="el-icon-edit" />
            <!--                  <span class="altericon"></span>-->
          </el-button>
          <!--删除： 手工维护的节点-->
          <el-button v-if="
                    (data.extMap && data.extMap.folder_type === 'maintained') ||
                    data.type === 'TABLE'||
                    data.type === 'VIEW'
                  "
                     type="text"
                     size="mini"
                     @click.stop="() => handleRemove(node, data)">
            <i class="el-icon-delete" />
            <!--                  <span class="deleteicon"></span>-->
          </el-button>
        </span>
      </span>
    </MyElTree>
  </div>
</template>

<script>
import {
  listUnCached,
  getDataTreeNode,
  delTable, batchSaveTable,
} from "@/api/data/table-info";
import MyElTree from "@/components/public/tree/src/tree.vue";

export default {
  components: { MyElTree },
  data () {
    return {
      filterText1: null,
      filterText2: null,//筛选
      activeName: 0,//tab切换
      ifExpandAll: false, // 是否展开所有树节点

      props: {
        label: "label",
        isLeaf: "leaf",
        children: "children",
      },
      folderForm: {
        folderUuid: null,
        folderName: null,
        parentFolderUuid: null,
        orderNum: 0,
        fullPath: null,
      },
      folderFormVisible: false,
      treeLoading: false,
      tableData: [],

    };
  },
  computed: {},
  watch: {
    filterText2 (val) {
      this.$refs.tree2.filter(val)
    }
  },
  mounted () { },
  created () {
    // this.getTables()
    // this.tree_data();
  },
  methods: {
    // tab切换
    handleClick (tab, event) {
      console.log(tab.index);
      if (tab.index == '0') {
        alert(1)
      } else if (tab.index == '1') {
        alert(2)
      } else if (tab.index == '2') {
        alert(3)
      } else {
        alert(4)
      }
    },
    // 过滤筛选
    filterNode (value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },

    getTables () {
      this.treeLoading = true;
      listUnCached(
        "table",
        "",
        this.filterText1 == null ? "" : this.filterText1
      ).then((resp) => {
        this.treeLoading = false;
        this.tableData = resp.data;
      });
    },

    // tree_data () {
    //  if (!node.data) {
    //     resolve([{ id: "ROOT", label: "数据集", leaf: false }]);
    //   } else {
    //     getDataTreeNode(node.data.id).then((resp) => {
    //       resolve(resp.data);
    //       this.treeData1 = resp.data
    //     });
    //   }
    // },

    loadNode2 (node, resolve) {
      console.log(node);
      console.log(resolve);
      if (!node.data) {
        resolve([{ id: "ROOT", label: "数据集", leaf: false }]);
      } else {
        getDataTreeNode(node.data.id).then((resp) => {
          resolve(resp.data);
          // this.treeData1 = resp.data
        });
      }
    },
    nodeClick (data, node, tree) {
      this.divInfo = false;
      if (node.data.type === "TABLE") {
        this.$nextTick(() => {
          this.divInfo = true;
          this.tableId = node.data.id;
        });
      }
    },
    resetFolderForm () {
      Object.keys(this.folderForm).forEach((key) => {
        this.$set(this.folderForm, key, null);
      });
    },
    // 添加
    handleCreateFolder (node, data) {
      var nodePath = this.$refs.tree2.getNodePath(data);
      var fullPath = [];
      // 将各级目录名拼接到全路径中
      nodePath.forEach((path) => {
        fullPath.push(path.label);
      });
      this.$emit("handleCreateFolder", node, data, fullPath);
    },
    // 修改编辑
    handleUpdateFolder (node, data) {
      console.log(node);
      this.resetFolderForm();
      this.$emit("handleUpdateFolder", node, data);
    },
    // 删除
    handleRemove (node, data) {
      this.$emit("handleRemove", node, data);
    },

  }
};
</script>

<style  scoped>
.trees {
  width: 45%;
  float: left;
  margin-top: 1%;
  height: 95%;
}

.search {
  padding: 10px;
}
.divContent {
  position: absolute;
  width: 56%;
  left: 45%;
  height: 95%;
}
.select-link {
  margin-top: 10px;
  cursor: pointer;
}
.page-container .tree-containerselect {
  height: 55vh;
  overflow: auto;
}
.page-container .tree-containerselect .filter-tree {
  margin-top: 20px;
}
.page-container .tree-containerall {
  height: 75vh;
  overflow: auto;
}
.page-container .tree-containerall .filter-tree {
  margin-top: 20px;
}
.transfer-center-item {
  width: 40px;
  margin: 2px;
  height: 40vh;
}
.agreeicon0 {
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  /* background-image: url("../../../assets/img/table_0.png"); */
  background-image: url("../../assets/img/table_0.png");
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
  background-image: url("../../assets/img/table_1.png");
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
  background-image: url("../../assets/img/table_2.png");
  vertical-align: top;
  *vertical-align: middle;
}
.agreeicon4 {
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../styles/icons/view.png");
  vertical-align: top;
  *vertical-align: middle;
}
.foldericon {
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../styles/icons/foldericon.png");
  vertical-align: top;
  *vertical-align: middle;
}
.newicon,
.altericon,
.deleteicon {
  display: inline-block;
  height: 13px;
  width: 13px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  vertical-align: top;
  *vertical-align: middle;
}
.newicon {
  background-image: url("../../styles/icons/newicon.png");
}
.altericon {
  background-image: url("../../styles/icons/altericon.png");
}
.deleteicon {
  background-image: url("../../styles/icons/deleteicon.png");
}
.controlTreeNode {
  display: flex;
  position: relative;
  flex-direction: row-reverse;
  background: #f8f8f8;
  top: 24px;
  left: 0px;
}
.expandTreeNode {
  padding: 2px;
  position: relative;
  height: 20px;
  width: 20px;
  margin-right: 10px;
}
.collapseTreeNode {
  padding: 2px;
  position: relative;
  border: 2px #ffffff;
  height: 20px;
  width: 20px;
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
.filter-tree {
  margin-top: 0px !important;
}
</style>
