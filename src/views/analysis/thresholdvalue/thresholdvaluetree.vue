<template>
  <div class="app-container">
    <!--阈值分类树-->
    <el-input
      v-model="filterText"
      placeholder="输入关键字进行过滤"
      class="tree-search"
      @click.stop.native
    />
    <MyElTree
      ref="tree"
      :show-count="true"
      :data="data"
      :props="defaultProps"
      :filter-node-method="filterNode"
      default-expand-all
      :expand-on-click-node="false"
      node-key="id"
      check-strictly
      @node-click="handleNodeClick"
      @check-change="handleNodeClick1">
      <span slot-scope="{ node, data }" class="custom-tree-node">
        <span> <i :class="data.icon" />{{ node.label }} </span>
          <span v-if="isShowEdit == true && data.type=='folder'">
            <el-button
              title="添加阈值分类"
              type="text"
              size="mini"
              class="tree-line-btn"
              @click.stop="() => setSelectTreeNode(node, data, 1)"
            ><svg-icon icon-class="icon-add-1"
            /></el-button>
            <el-button
              title="修改阈值分类"
              type="text"
              size="mini"
              class="tree-line-btn"
              @click.stop="() => setSelectTreeNode(node, data, 2)"
            ><svg-icon icon-class="icon-edit-1"
            /></el-button>
            <el-button
              title="删除阈值分类"
              type="text"
              size="mini"
              class="tree-line-btn"
              @click.stop="() => deleteFolder(node, data)"
            ><svg-icon icon-class="icon-delete-1"/></el-button>
          </span>
      </span>
    </MyElTree>
    <el-dialog
      v-if="dialogFormVisible"
      title="请填写分类信息"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false">
      <el-form :model="form" class="detail-form">
        <el-form-item label="分类名称">
          <el-input v-model="form.thresholdValueFolderName" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="() => enterBtn()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import MyElTree from "@/components/public/tree/src/tree.vue";
import {
  findThresholdValueFolderTree,addThresholdValueFolder,updateThresholdValueFolder,deleteThresholdValueData
} from "@/api/analysis/thresholdvalue";
export default {
  name: "Thresholdvaluetree",
  components: { MyElTree },
  props:['isShowEdit','isShowValueTree'],
  data() {
    return {
      filterText: null,
      data: [],
      defaultProps: {
        children: "children",
        label: "label",
      },
      selectTreeNode: {},
      operationType: 0, // 操作类型 1、添加；2、修改
      dialogFormVisible: false,
      form: {
        thresholdValueFolderUuid: "",
        thresholdValueFolderName: "",
        parentUuid: "",
        folderPath: "",
        scope: "",
      },
      checkedId: "",
    };
  },
  watch: {
    filterText(val) {
      // 搜索树
      this.$refs.tree.filter(val);
    },
  },
  created() {
    this.getThresholdValueFolder();
  },
  methods: {
    handleNodeClick1(data, checked, node) {
      if (checked === true) {
        this.checkedId = data.id;
        this.$refs.tree.setCheckedKeys([data.id]);
      } else {
        if (this.checkedId == data.id) {
          this.$refs.tree.setCheckedKeys([data.id]);
        }
      }
    },
    /**
     *获取阈值分类
     */
    getThresholdValueFolder() {
      findThresholdValueFolderTree(this.isShowValueTree).then(result => {
        this.data = result.data;
      }).catch(reason => {
        this.$message({ type: 'error', message: '阈值分类树加载失败!'})
      })
    },
    deleteThresholdValueData(newData) {
      for (let i = 0; i < newData.children.length; i++) {
        if (newData.children[i].type == "model") {
          newData.children[i].isShow = false
        } else {
          deleteModelData(newData.children[i])
        }
      }
    },
    /**
     * 树的点击事件
     * @param data 树的对象数据 包括子节点
     */
    handleNodeClick(data) {
      this.selectTreeNode = data
      if (data.type === "thresholdValue") {
        this.$emit("refreshThresholdvalue", data);
        this.$emit("thresholdValueClick",data)
      } else {
        this.$emit("refreshThresholdvalueList", data)
        this.$emit("thresholdValueClick",data)
      }
    },
    /**
     * 树过滤
     * @param value 过滤值
     * @param data 数据
     * @returns {boolean}
     */
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    /**
     * 设置选中的节点
     * @param node 整个节点数据
     * @param data 数据 要设置的节点数据
     * @param operationType 1、添加；2、修改
     */
    setSelectTreeNode(node, data, operationType) {
      this.operationType = operationType;
      this.selectTreeNode = data;
      if (operationType === 2) {
        this.form.thresholdValueFolderName = this.selectTreeNode.label;
      }
      this.dialogFormVisible = true;
    },
    /**
     * 清空表单信息
     */
    clearForm() {
      this.form = {
        modelFolderUuid: "",
        modelFolderName: "",
        parentUuid: "",
        folderSort: "",
        folderPath: "",
        pbScope: "",
      };
    },
    /**
     * 生成UUID
     * @returns {string} 返回生成的UUID
     */
    getGuuid() {
      var s = [];
      var hexDigits = "0123456789abcdef";
      for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = "-";
      var uuid = s.join("");
      return uuid;
    },
    /**
     * 表单确定按钮
     */
    enterBtn() {
      if (this.operationType === 1) {
        this.addThresholdValueFolder();
      } else {
        this.updateFolder();
      }
    },
    /**
     * 添加模型分类
     */
    addThresholdValueFolder() {
      this.form.thresholdValueFolderUuid = this.getGuuid();
      this.form.parentUuid = this.selectTreeNode.id;
      const nodePath = this.$refs.tree.getNodePath(this.selectTreeNode);
      const fullPath = [];
      nodePath.forEach((path) => {
        fullPath.push(path.id);
      });
      this.form.folderPath = fullPath.join("/") + "/" + this.form.thresholdValueFolderUuid;
      this.form.scope = this.selectTreeNode.extMap.scope;
      addThresholdValueFolder(this.form).then((result) => {
        if (result != null && result.code === 0) {
          const newChild = {
            id: this.form.thresholdValueFolderUuid,
            label: this.form.thresholdValueFolderName,
            children: [],
            pid: this.selectTreeNode.id,
            icon: "el-icon-folder",
            extMap: { scope: this.selectTreeNode.extMap.pbScope },
            type: "folder",
          };
          if (!this.selectTreeNode.children) {
            this.$set(this.selectTreeNode, "children", []);
          }
          this.selectTreeNode.children.push(newChild);
          this.clearData()
        } else {
          this.$message({ type: 'error', message: '添加失败!' })
        }
      });
      // this.clearForm();
      this.dialogFormVisible = false;
    },
    /**
     * 修改阈值分类
     */
    updateFolder() {
      this.form.thresholdValueFolderUuid = this.selectTreeNode.id;
      this.form.parentUuid = null;
      this.form.folderPath = null;
      this.form.scope = null;
      updateThresholdValueFolder(this.form).then((result) => {
        if (result.code === 0) {
          this.getThresholdValueFolder();
        }
      });
      this.dialogFormVisible = false;
    },
    /**
     * 删除阈值或文件夹
     * @param node 节点对象
     * @param data 节点数据
     */
    deleteFolder(node, data) {
      if (data.pid === "0") {
        this.$message({ success: "info", message: "根目录不允许删除" });
        return;
      }
      if ((data.children !== undefined && data.children.length === 0) || data.children === undefined) {
        this.$confirm("此操作将永久删除该阈值, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          deleteThresholdValueData(data.id).then((result) => {
              if (result.code === 0) {
                this.getThresholdValueFolder();
                this.$message({
                  type: "success",
                  message: "删除成功!",
                });
              }
            });
          })
      } else {
        this.$message({
          success: "error",
          message: "该分类下有分类或阈值，不允许删除",
        });
      }
    },
    getSelectNode() {
      return this.selectTreeNode
    },
    clearData(){
      this.form =  {
        thresholdValueFolderUuid: "",
          thresholdValueFolderName: "",
          parentUuid: "",
          folderPath: "",
          scope: "",
      }
    }
  },
};
</script>
