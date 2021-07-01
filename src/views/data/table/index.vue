<template>
  <div class="page-container">
    <div style="display:flex;">
      <div>
        <el-input v-model="filterText2" placeholder="输入关键字进行过滤" />
        <el-link class="select-link" type="primary" @click="registTable"
          >注册资源</el-link
        >
        <div class="tree-containerall">
          <MyElTree
            ref="tree2"
            :props="props"
            :load="loadNode2"
            lazy
            :filter-node-method="filterNode"
            :default-expanded-keys="['ROOT']"
            class="filter-tree"
            highlight-current="true"
            node-key="id"
            @node-click="nodeClick"
          >
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <i v-if="data.id === 'ROOT'" class="el-icon-s-home" />
              <i v-if="data.type === 'FOLDER'" >
                <span class="agreeicon0"></span>
              </i>
              <i v-if="data.type === 'TABLE'">
                <!-- style="padding-right: 3px; vertical-align: bottom" -->
                <!-- &#xecee; -->
                <span class="icon iconfont agreeicon1"></span>
              </i>
               <i v-if="data.type === 'VIEW'">
                <!-- style="padding-right: 3px; vertical-align: bottom" -->
                    <!-- &#xecee; -->
                <span class="icon iconfont agreeicon4"></span>
              </i>

              <i
                v-if="data.type === 'COLUMN'"
                class="el-icon-c-scale-to-original"
              />
              <span>{{ node.label }}</span>
              <span style="margin-left: 10px">
                <!--添加： 根节点以及手工维护的节点-->
                <el-button
                  v-if="
                    data.id === 'ROOT' ||
                    (data.extMap && data.extMap.folder_type === 'maintained')
                  "
                  type="text"
                  size="mini"
                  @click.stop="() => handleCreateFolder(node, data)"
                  ><i class="el-icon-circle-plus"
                /></el-button>
                <!--修改： 手工维护的节点-->
                <el-button
                  v-if="data.extMap && data.extMap.folder_type === 'maintained'"
                  type="text"
                  size="mini"
                  @click.stop="() => handleUpdateFolder(node, data)"
                >
                  <i class="el-icon-edit" />
                </el-button>
                <!--删除： 手工维护的节点-->
                <el-button
                  v-if="
                    (data.extMap && data.extMap.folder_type === 'maintained') ||
                    data.type === 'TABLE'
                  "
                  type="text"
                  size="mini"
                  @click.stop="() => handleRemove(node, data)"
                >
                  <i class="el-icon-delete" />
                </el-button>
              </span>
            </span>
          </MyElTree>
        </div>
      </div>
      <div style="margin-left: 50px; max-width:80%; min-width:50%; width:auto;">
        <tabledatatabs
          v-if="divInfo"
          ref="tabledatatabs"
          open-type="tableRegister"
          :table-id="tableId"
          :tab-show.sync="tabShow"
        />
      </div>
    </div>
    <el-dialog
      :close-on-click-modal="false"
      :default-expand-all="true"
      :title="'选择注册表'"
      :visible.sync="registTableFlag"
      width="600px"
    >
      <el-input
        style="width: 70%"
        v-model="filterText1"
        placeholder="输入想要查询的表名称（模糊搜索）"
      />
      <el-button @click="getTables"> 搜索 </el-button>
      <!--<el-select defaultFirstOption="true" @change="handleSelectChange" :value="selectValue">
          <el-option label="显示所有" value="all"></el-option>
          <el-option label="只显示未注册" value="noPart"></el-option>
          <el-option label="只显示已注册" value="yesPart"></el-option>
        </el-select>-->
      <div class="tree-containerselect">
        <MyElTree
          ref="tree1"
          v-loading="treeLoading"
          :props="props"
          :data="tableData"
          class="filter-tree"
          show-checkbox
        >
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <!-- class="el-icon-menu"  style="color: #409eff" -->
            <i  v-if="data.type === 'USER'">
            <img src="../../../assets/img/table_0.png" style="height: 16px;width: 16px;margin-right: 2px;vertical-align: top;*vertical-align: middle;">
            </i>
            <!-- class="el-icon-tickets"  style="color: #409eff" -->
            <i  v-if="data.type === 'TABLE'">
            <img src="../../../assets/img/table_1.png" style="height: 16px;width: 16px;margin-right: 2px;vertical-align: top;*vertical-align: middle;">
            </i>
            <!-- class="el-icon-s-ticket"  style="color: #409eff" -->
            <i  v-if="data.type === 'COLUMN'">
            <img src="../../../assets/img/table_2.png" style="height: 16px;width: 16px;margin-right: 2px;vertical-align: top;*vertical-align: middle;">
            </i>
            <span>{{ node.label }}</span>
          </span>
        </MyElTree>
      </div>
      <span slot="footer">
        <el-button @click="registTableFlag = false">取消</el-button>
        <el-button type="primary" @click="flagSelectTable">保存</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="folderFormVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="folderForm" :model="folderForm" label-width="80px">
        <el-form-item label="文件夹名称" label-width="120px">
          <el-input v-model="folderForm.folderName" style="width: 300px" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="folderFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createFolder() : updateFolder()"
          >保存</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import tabledatatabs from "@/views/data/table/tabledatatabs";
import MyElTree from "@/components/public/tree/src/tree.vue";
import {
  listUnCached,
  getDataTreeNode,
  delTable, batchSaveTable,
} from "@/api/data/table-info";
import { saveFolder, updateFolder, delFolder } from "@/api/data/folder";
import { commonNotify } from "@/utils";

export default {
  components: { MyElTree, tabledatatabs },
  data() {
    return {
      tabShow: "basicinfo",
      tableId: "",
      registTableFlag: false,
      divInfo: false,
      filterText1: null,
      filterText2: null,
      fromData: [],
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
      dialogStatus: "",
      parentNode: {},
      tempData: {}, // 点击编辑时临时存放data
      textMap: {
        update: "编辑文件夹",
        create: "添加文件夹",
      },
      selectValue: 1,
      treeLoading: false,
      tableData: [],
      chooseTables:[],
    };
  },
  computed: {
    dialogTitle() {
      return (
        (this.parentNode.label == null
          ? ""
          : "在<" + this.parentNode.label + ">下") +
        this.textMap[this.dialogStatus]
      );
    },
    fromDisabled() {
      return false;
    },
    toDisabled() {
      return false;
    },
  },
  watch: {
    filterText1(val) {
      this.$refs.tree1.filter(val);
      // eslint-disable-next-line indent
    },
    filterText2(val) {
      this.$refs.tree2.filter(val)
    }
  },
  created() {},
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    /*loadNode1(node, resolve) {
      debugger;
      if (node.level <= 3) {
        var schemaName = ''
        var tableName = ''
        if (node.level === 1) {
          //schemaName = node.data.id
          resolve(this.tableData)
        } else if (node.level === 2) {
          var nodePath = this.$refs.tree2.getNodePath(node)
          schemaName = nodePath[1].id
          tableName = node.data.label
        }
        console.log(schemaName + ' ' + tableName)
        if(node.level !== 1){
          this.treeLoading = true
          listUnCached(node.level, schemaName, tableName).then(resp => {
            if(node.level === 0){
              this.currentUser = resp.data[0].id;  //获取用户
            }
            this.treeLoading = false
            resolve(resp.data)
          })
        }

      } else {
        resolve([])
      }
    },*/
    getTables() {
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
    loadNode2(node, resolve) {
      if (!node.data) {
        resolve([{ id: "ROOT", label: "数据集", leaf: false }]);
      } else {
        getDataTreeNode(node.data.id).then((resp) => {
          resolve(resp.data);
        });
      }
    },
    registTable() {
      var ckFolder = this.$refs.tree2.getCurrentNode();
      // console.log(ckFolder); return;
      if (!ckFolder || ckFolder.type !== "FOLDER") {
        this.$notify(
          commonNotify({ type: "warning", message: "请选中文件夹" })
        );
        return false;
      }
      this.registTableFlag = true
      this.getTables()
    },
    flagSelectTable() {
      var ckFolder = this.$refs.tree2.getCurrentNode();
      if (!ckFolder || ckFolder.type !== "FOLDER") {
        this.$notify(
          commonNotify({ type: "warning", message: "请选中文件夹" })
        );
        return false;
      } else {
        var ckTbs = this.$refs.tree1.getCheckedNodes();
        // var nodes = this.$refs.tree1.filter(this.filterText1);
        if (this.filterText1 != null) {
          ckTbs = ckTbs.filter((tb) => {
            return tb.label.indexOf(this.filterText1) !== -1;
          });
        }
        ckTbs
          .filter((tb) => {
            return tb.type === "TABLE";
          })
          .forEach((node) => {
            const tableForm = {
              tableMetaUuid: node.id,
              displayTbName: node.label,
              dbName: node.pid,
              tbName: node.label,
              folderUuid: ckFolder.id,
            };
            // 将选中的表信息封装入节点对象集合
            this.chooseTables.push(tableForm);
          });
        // 批量保存
        batchSaveTable(this.chooseTables).then(() => {
          // 刷新ROOT节点
          this.refreshNodeBy("ROOT");
          this.$notify(
              commonNotify({
                type: "success",
                message: `同步成功！`,
              })
          );
        });
        this.registTableFlag = false;
      }
    },
    // 刷根据节点ID刷新节点
    refreshNodeBy(id){
      let node = this.$refs.tree2.getNode(id); // 通过节点id找到对应树节点对象
      node.loaded = false;
      node.expand(); // 主动调用展开节点方法，重新查询该节点下的所有子节点
    },
    nodeClick(data, node, tree) {
      console.log('走这里')
      this.divInfo = false;
      if (node.data.type === "TABLE") {
        this.$nextTick(() => {
          this.divInfo = true;
          this.tableId = node.data.id;
        });
      }
    },
    resetFolderForm() {
      Object.keys(this.folderForm).forEach((key) => {
        this.$set(this.folderForm, key, null);
      });
    },
    handleCreateFolder(node, data) {
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
    handleUpdateFolder(node, data) {
      this.resetFolderForm();
      this.tempData = data;
      this.dialogStatus = "update";
      this.folderForm.folderUuid = data.id;
      this.folderForm.folderName = data.label;
      let fullPath = [];
      // 拼接全路径（从ROOT节点开始一直到自己）
      this.$refs.tree2.getNodePath(data).forEach((path) => {
        fullPath.push(path.label);
      });
      this.folderForm.fullPath = fullPath.join("/");
      this.folderFormVisible = true;
    },
    handleRemove(node, data) {
      this.$confirm("是否删除？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          if (data.type === "TABLE") {
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
        .catch(() => {});
    },
    createFolder() {
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
    updateFolder() {
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
    handleSelectChange(val) {},
    removeTable() {
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
  }, // 注册
};
</script>

<style lang="scss" scoped>
.trees {
  width: 45%;
  float: left;
  margin-top: 1%;
  height: 95%;
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
.agreeicon4 {
    display: inline-block;
    height: 16px;
    width: 16px;
    margin-right: 2px;
    margin-top: 0;
    background-size: 100%;
    background-image: url("../../../styles/icons/view.png");
    vertical-align: top;
    *vertical-align: middle;
}
</style>
