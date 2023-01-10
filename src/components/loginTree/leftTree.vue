<template>
  <div class="left_tree_style">
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
    </el-tabs>
    <div class="padding10">
      <el-input v-model="filterText2"
                :disabled="tabclick"
                placeholder="输入关键字进行过滤" />
    </div>
    <!-- 数据源 -->
    <div class="padding10 dataSource">
      <el-form :inline="true"
               :model="query"
               label-position="bottom">
        <el-form-item label="数据源："
                      label-width="90px">
          <el-select v-model="query.dataSource"
                     :disabled="tabclick"
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
    <div v-if="loading == true" class="loadings">
      <div class="conter_loadings">
        <span><img src="@/assets/img/loading.gif" alt="" /></span>
      </div>
    </div>
    <div v-else class="conter_vh">
      <!-- 系统 主题 分层  目录-->
      <div class="tree-containerall">
        <MyElTree ref="tree2"
                  :props="props"
                  :data="tree_list"
                  :filter-node-method="filterNode"
                  :default-expanded-keys="['ROOT']"
                  class="filter-tree"
                  highlight-current="true"
                  node-key="id"
                  @node-click="nodeClick">
          <span slot-scope="{ node, data }"
                class="custom-tree-node">
            <i v-if="data.id === 'ROOT'"
               :class="data.icon" />
            <i v-if="
                    data.type === 'folder' ||
                    data.type === 'system' ||
                    data.type === 'layered' ||
                    data.type === 'theme'
                  ">
              <span class="agreeicon0"></span>
            </i>
            <i v-if="data.type === 'table'">
              <span class="icon iconfont agreeicon1"></span>
            </i>
            <i v-if="data.type === 'view'">
              <span class="icon iconfont agreeicon4"></span>
            </i>
            <i v-if="data.type === 'column'"
               class="el-icon-c-scale-to-original" />
            <span>{{ node.label }}</span>
            <span style="margin-left: 10px">
              <el-button v-if="data.id === 'ROOT' || (data.extMap && data.extMap.folder_type === 'maintained')"
                         type="text"
                         size="mini"
                         @click.stop="() => handleCreateFolder(node, data)">
                <i class="el-icon-circle-plus" />
              </el-button>
              <el-button v-if="data.extMap && data.extMap.folder_type === 'maintained'"
                         type="text"
                         size="mini"
                         @click.stop="() => handleUpdateFolder(node, data)">
                <i class="el-icon-edit" />
              </el-button>
              <el-button v-if="
                        (data.extMap && data.extMap.folder_type === 'maintained') ||
                        data.type === 'table' || data.type === 'view'"
                        type="text"
                        size="mini"
                        @click.stop="() => handleRemove(node, data)">
                <i class="el-icon-delete" />
              </el-button>
            </span>
          </span>
        </MyElTree>
      </div>
      <!-- 目录 -->
    </div>
  </div>
</template>

<script>
import MyElTree from "@/components/public/tree/src/tree.vue";
import {
  listUnCached,
  getBusinessSystemTree, //系统
  getThemeTree, //主题
  getLayeredTree, //分层
  delTable,
} from "@/api/data/table-info";
export default {
  components: { MyElTree },
  data () {
    return {
      props: {
        label: "label",
        isLeaf: "leaf",
        children: "children",
      },
      activeName: "0", //tab切换
      filterText2: null,
      tableMetaUuid: '',
      options: [
        {
          value: "Postgre",
          label: "DWS",
        },
        {
          value: "Hive",
          label: "MRS",
        },
      ],
      loading: true,
      tree_list: [], //左侧资料树数据结构
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
      // tabclick: false,
      treeLoading: false,
      tableData: [],
      chooseTables: [],
    };
  },
  computed: {},
  watch: {
    filterText2 (val) {
      this.$refs.tree2.filter(val);
    },
  },
  mounted () {},
  created () {
    this.post_getBusinessSystemTree(); //系统
  },
  methods: {
    // 选择数据源
    selectdata (val) {
      this.query.dataSource = val;
      if (this.activeName == "0") {
        // 系统
        this.post_getBusinessSystemTree(); //系统
      } else if (this.activeName == "1") {
        // 主题
        this.post_getThemeTree(); //主题
      } else if (this.activeName == "2") {
        // 分层
        this.post_getLayeredTree(); //分层
      } else {
        // 目录
        this.post_getDataTreeNode(); //目录
      }
    },
    // 系统
    post_getBusinessSystemTree () {
      this.loading = true;
      this.tabclick = true;
      getBusinessSystemTree(true, this.query.dataSource, true).then((resp) => {
        this.tree_list = resp.data;
        this.loading = false;
        this.tabclick = false;
      });
    },
    // 主题
    post_getThemeTree () {
      this.loading = true;
      this.tabclick = true;
      getThemeTree(true, this.query.dataSource, true).then((resp) => {
        this.tree_list = resp.data;
        this.loading = false;
        this.tabclick = false;
      });
    },
    // 分层
    post_getLayeredTree () {
      this.loading = true;
      this.tabclick = true;
      getLayeredTree(true, this.query.dataSource, true).then((resp) => {
        this.tree_list = resp.data;
        this.loading = false;
        this.tabclick = false;
      });
    },
    // 点击注册资源的 数据库列表
    getTables () {
      this.treeLoading = true;
      listUnCached(
        "table",
        "",
        this.filterText1 == null ? "" : this.filterText1,
        this.query.dataSource
      ).then((resp) => {
        this.treeLoading = false;
        this.tableData = resp.data;
      });
    },
    // 切换tab
    handleClick (tab, event) {
      if (tab.index == "0") {
        // this.tabclick = true
        // setTimeout(() => {
        //   this.tabclick = false
        // }, 3000)
        this.post_getBusinessSystemTree(); //系统
      } else if (tab.index == "1") {
        this.post_getThemeTree(); //主题
      } else if (tab.index == "2") {
        this.post_getLayeredTree(); //分层
      }
      // else {
      //   this.post_getDataTreeNode(this.query.dataSource);//目录
      // }
    },
    filterNode (value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    nodeClick (data, node, tree) {
      console.log("节点", node);
      this.tableMetaUuid = '';
      // 显示列表
      if (node.level == 1 && data.type != "table") {
        this.show_details = false; //显示列表
        if (data.type == "system") {
          this.query.businessSystemId = node.data.id;
          this.query.tableThemeId = "";
          this.query.tableLayeredId = "";
          this.query.folderUuid = "";
          this.$emit("queryList", this.query, this.show_details);
        } else if (data.type == "theme") {
          this.query.businessSystemId = "";
          this.query.tableThemeId = node.data.id;
          this.query.tableLayeredId = "";
          this.query.folderUuid = "";
          this.$emit("queryList", this.query, this.show_details);
        } else if (data.type == "layered") {
          this.query.businessSystemId = "";
          this.query.tableThemeId = "";
          this.query.tableLayeredId = node.data.id;
          this.query.folderUuid = "";
          this.$emit("queryList", this.query, this.show_details);
        }
      } else {
        // 进入详情
        this.tableMetaUuid = node.data.id;
        this.show_details = true;
        this.isDisable_input = true;
        this.$emit("details", this.tableMetaUuid, this.show_details, this.isDisable_input);
      }
    },
    // 第一步选择的数据库
    nodeClick_table (data, node, tree) {
      //获取所有选中的节点 start
      let res = this.$refs.tree1.getCheckedNodes();
      var check_list = [];
      for (var i = 0; i < res.length; i++) {
        let obj = {
          label: res[i].label,
          fileName: "",
          pid: res[i].pid,
          id: res[i].id,
        };
        check_list.push(obj);
      }
      this.form.check_list = check_list;
      if (this.form.check_list.length !== 0) {
        // 显示保存按钮
        this.is_next = true;
        this.ischeck_data = data;
      } else {
        this.is_next = false;
      }
    },
    handleCreateFolder (node, data) {
      this.resetFolderForm();
      this.parentNode = node;
      this.dialogStatus = "create";
      this.folderForm.parentFolderUuid = data.id;
      var nodePath = this.$refs.tree2.getNodePath(data);
      var fullPath = [];
      // 将各级目录名拼接到全路径中
      nodePath.forEach((path) => {
        fullPath.push(path.label);
      });
      this.folderForm.fullPath = fullPath.join("/");
      this.folderFormVisible = true;
    },
    handleUpdateFolder (node, data) {
      this.resetFolderForm();
      this.tempData = data;
      this.dialogStatus = "update";
      this.folderForm.folderUuid = data.id;
      this.folderForm.folderName = data.label;
      // 修改为使用后台拼接，原因path.label取得是修改之前的label
      // let fullPath = [];
      // 拼接全路径（从ROOT节点开始一直到自己）
      // this.$refs.tree2.getNodePath(data).forEach((path) => {
      //   fullPath.push(path.label);
      // });
      // this.folderForm.fullPath = fullPath.join("/");
      this.folderFormVisible = true;
    },
    handleRemove (node, data) {
      this.$confirm("是否删除？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          if (data.type === "table" || data.type === "view") {
            delTable(data.id).then((resp) => {
              this.$notify(
                commonNotify({ type: "success", message: "删除成功！" })
              );
              this.$refs.tree2.remove(data);
            });
          } else {
            delFolder(data.id).then((resp) => {
              this.$notify(
                commonNotify({ type: "success", message: "删除成功！" })
              );
              this.$refs.tree2.remove(data);
            });
          }
        })
        .catch(() => { });
    },
    createFolder () {
      if (
        this.folderForm.folderName == null ||
        this.folderForm.folderName.trim().length == 0
      ) {
        this.$message({
          type: "info",
          message: "文件夹名不可为空，请重新输入文件夹名！",
        });
        return;
      }
      saveFolder(this.folderForm).then((resp) => {
        var childData = {
          id: resp.data,
          label: this.folderForm.folderName,
          pid: this.folderForm.parentFolderUuid,
          type: "FOLDER",
          extMap: {
            folder_type: "maintained",
          },
        };
        this.$refs.tree2.append(childData, this.parentNode);
        this.$notify(commonNotify({ type: "success", message: "创建成功！" }));
        this.folderFormVisible = false;
      });
    },
    updateFolder () {
      if (
        this.folderForm.folderName == null ||
        this.folderForm.folderName.trim().length == 0
      ) {
        this.$message({
          type: "info",
          message: "文件夹名不可为空，请重新输入文件夹名！",
        });
        return;
      }
      updateFolder(this.folderForm).then((resp) => {
        this.tempData.label = this.folderForm.folderName;
        this.$refs.tree2.updateKeyChildren(
          this.folderForm.folderUuid,
          this.tempData
        );
        this.folderFormVisible = false;
        // 更新树
        this.refreshNodeBy("ROOT");
      });
    },
    handleSelectChange (val) {},
    removeTable () {
      var ids = this.$refs.tree2.getCheckedKeys();
      delTable(ids.join(",")).then((resp) => {
        this.$notify(
          commonNotify({
            type: "success",
            message: `成功移除${ids.length}张表`,
          })
        );
        ids.forEach((id) => {
          this.$refs.tree2.remove({ id: id });
        });
      });
    },
  }
};
</script>

<style scoped >
.left_tree_style {
  height: 100%;
  /* overflow: auto; */
  /* height: calc(100% - 280px); */
}

.conter_vh {
  height: calc(100% - 170px);
}
.tree-containerall {
  height: 100%;
  /* overflow-x: auto; */
  /* border: 1px solid blue; */
}
.tree-containerall >>> .el-tree {
  height: 100%;
}
.loadings {
  /* position: absolute;
  left: 0;
  bottom: 0; */
  height: calc(100% - 160px);
  width: 100%;
  z-index: 9;
  background: rgba(106, 106, 106, 0.0862745098);
  border-radius: 15.5px;
}
.conter_loadings {
  width: 100%;
  height: 100%;
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.7);

  display: flex;
  align-items: center;
  justify-content: center;
}
.loadings span {
  width: 60px;
}
.loadings span img {
  width: 100%;
}

.left_tree_style >>> .el-tabs__header {
  margin: 0;
}
.left_tree_style >>> .el-tabs__item {
  width: 25%;
  text-align: center;
}
.left_tree_style
  >>> .el-tabs--card
  > .el-tabs__header
  .el-tabs__item.is-active {
  border-bottom-color: transparent;
}
.left_tree_style >>> .el-tabs__nav {
  width: 100%;
}
.dataSource >>> .el-form-item {
  display: flex;
  width: 100%;
}
</style>
