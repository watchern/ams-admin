<template>
  <div class="app-container" ref="appContainerDiv" :style="appContainerDivStyle">
    <!--模型分类树-->
    <el-row width="100%" style="margin-bottom: 10px">
      <el-col :span="18">
        <el-input
                v-model="filterText"
                placeholder="输入关键字进行过滤"
        />
        <!--        【模型左侧树搜索框】该class为圆角黑色加粗边框，修改为和数据资源目录和数据表注册一致的形式（直角细边框，鼠标悬浮变色）-->
        <!--        class="tree-search"-->
      </el-col>
      <el-col :span="6">
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
      </el-col>
    </el-row>
    <MyElTree
      ref="tree"
      :data="data"
      :props="defaultProps"
      :filter-node-method="filterNode"
      :expand-on-click-node="false"
      node-key="id"
      check-strictly
      @check-change="handleNodeClickCheck"
      @node-click="handleNodeClick"
      :show-checkbox="
        this.publicModel === 'editorModel' ||
        this.publicModel === 'relationModel' ||
        this.publicModel === 'publicModel' ? true : false
      "
    >
      <span slot-scope="{ node, data }" class="custom-tree-node">
        <span> <i :class="data.icon" />{{ node.label }} </span>
        <span v-if="data.type == 'folder' && power != 'warning' && !isBussinessType && data.path.indexOf('gongxiang') == -1&& data.id != 'xiaxian'">
          <el-button
            title="添加模型分类"
            type="text"
            size="mini"
            class="tree-line-btn"
            @click.stop="() => setSelectTreeNode(node, data, 1)"
            >
            <svg-icon icon-class="icon-add-1" />
          </el-button>
          <el-button
            title="修改模型分类"
            type="text"
            size="mini"
            class="tree-line-btn"
            @click.stop="() => setSelectTreeNode(node, data, 2)"
            v-if="data.pid != '0'"
            >
            <svg-icon icon-class="icon-edit-1" />
          </el-button>
          <el-button
            title="删除模型分类"
            type="text"
            size="mini"
            class="tree-line-btn"
            @click.stop="() => deleteFolder(node, data)"
            v-if="data.pid != '0'"
            >
            <svg-icon icon-class="icon-delete-1" />
          </el-button>
        </span>
      </span>
    </MyElTree>
    <el-dialog
      v-if="dialogFormVisible"
      title="请填写分类信息"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-form :model="form" class="detail-form">
        <el-form-item label="分类名称">
          <el-input v-model="form.modelFolderName" autocomplete="off" />
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
  findModelFolderTree,
  findAuditWarningModelFolderTree,
  deleteModelFolder,
  addModelFolder,
  updateModelFolder,
} from "@/api/analysis/auditmodel";
import { getInfo, isAdmin } from '@/api/user'
export default {
  name: "ModelFolderTree",
  components: { MyElTree },
  props: ["publicModel", "power", "spaceFolderName", "spaceFolderId", "filterId", "selectFolder"],
  data() {
    return {
      ifExpandAll: false, // 是否展开所有树节点
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
        modelFolderUuid: "",
        modelFolderName: "",
        parentUuid: "",
        folderSort: "",
        folderPath: "",
        pbScope: "",
      },
      checkedId: "",
      appContainerDivStyle:"",
      isBussinessType:false,  //是否是业务分类
      isShowModel:true,
        ifmanger: 0,
    };
  },
  watch: {
    filterText(val) {
      // 搜索树
      this.$refs.tree.filter(val);
    },
      selectFolder(){
          this.getModelFolder();
      }
  },
  created() {
    if(this.publicModel === 'relationModel'){
      this.appContainerDivStyle = "height: 500px;overflow-y: scroll"
    }
    this.getModelFolder();
      // 校验用户权限（没有使用接口内容，无效操作）
      // isAdmin().then((res) => {
      //     // 如果是管理员为1
      //     alert('此处调用')
      //     if (res.data) {
      //         this.ifmanger = 1;
      //     }else{
      //         this.ifmanger = 0;
      //     }
      // });
  },
  methods: {
      expandAllNodes(){
          this.ifExpandAll = true;
          this.changeTreeNodeStatus(this.$refs.tree.store.root)
      },
      collapseAllNodes(){
          this.ifExpandAll = false;
          this.changeTreeNodeStatus(this.$refs.tree.store.root)
      },
      changeTreeNodeStatus (node) {
          node.ifExpandAll = this.ifExpandAll
          for (let i = 0; i < node.childNodes.length; i++) {
              // 改变节点的自身expanded状态
              node.childNodes[i].expanded = this.ifExpandAll
              // 遍历子节点
              if (node.childNodes[i].childNodes.length > 0) {
                  this.changeTreeNodeStatus(node.childNodes[i])
              }
          }
      },
    handleNodeClickCheck(data, checked, node) {
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
     *获取模型分类
     */
    getModelFolder() {
      const GONGGONG = "gonggong";
      var spaceFolderName = this.CommonUtil.isBlank(this.spaceFolderName) ? '个人模型' : this.spaceFolderName
      var spaceFolderId = this.CommonUtil.isBlank(this.spaceFolderId) ? this.$store.getters.datauserid : this.spaceFolderId

      //如果是预警只显示文件夹
      this.isShowModel = this.power === 'warning' ? false: this.isShowModel;

      if (this.CommonUtil.isNotBlank(this.publicModel)) {
        this.isShowModel = false;
        findModelFolderTree(this.isShowModel, spaceFolderName, spaceFolderId).then((result) => {
          let newData = [];
          switch (this.publicModel) {
            case "publicModel":
              // 处理数据  只保留公共分类的文件夹数据
              for (let i = 0; i < result.data.length; i++) {
                if (result.data[i].id == GONGGONG) {
                  newData.push(result.data[i]);
                }
              }
              this.data = newData;
              break;
            case "editorModel":
              // todo 揉入权限信息
              for (let i = 0; i < result.data.length; i++) {
                if (
                    result.data[i].id == GONGGONG ||
                    result.data[i].id == this.$store.getters.datauserid
                ) {
                  result.data[i].disabled = true;
                  newData.push(result.data[i]);
                }
              }
              this.isBussinessType = true
              if (this.filterId) {
                newData = newData.filter(data => data.id === this.filterId)
              }
              this.data = newData;
              break;
            case "relationModel":
              findModelFolderTree(true, spaceFolderName, spaceFolderId).then((result) => {
                this.data = result.data;
              });
                break;
              case "copyModel":
                  this.isBussinessType = true
                  findModelFolderTree(false, spaceFolderName, spaceFolderId).then((result) => {
                    var folderPath = this.selectFolder;
                    var dataUserId = this.$store.getters.datauserid
                    var orgcode = "";
                    getInfo().then((resp) => {
                        orgcode = resp.data.orgcode;
                    switch(folderPath){
                        // 如果选中的是公共模型，就能复制到个人和公共模型
                        case "gonggong":
                      for (let i = 0; i < result.data.length; i++) {
                                if (result.data[i].id !== "gongxiang" && result.data[i].id !== "xiaxian") {
                              newData.push(result.data[i]);
                          }
                      }
                            break;
                        // 如果选中的是个人模型，只可以复制到个人模型
                        case this.$store.getters.datauserid :
                            for (let i = 0; i < result.data.length; i++) {
                                if (result.data[i].id == dataUserId) {
                                    newData.push(result.data[i]);
                                }
                            }
                            break;
                    }
                    });
                      this.data = newData;
                  });
              break;
            default:
              newData = result.data;
              this.data = newData;
              break;
          }
        });
      } else {
        if (this.power === 'warning'){
          findAuditWarningModelFolderTree(true, spaceFolderName, spaceFolderId).then((result) => {
            this.data = result.data;
          });
        }else {
          findModelFolderTree(true, spaceFolderName, spaceFolderId).then((result) => {
            this.data = result.data;
          });
        }
      }
    },
    deleteModelData(newData) {
      for (let i = 0; i < newData.children.length; i++) {
        if (newData.children[i].type == "model") {
          newData.children[i].isShow = false;
        } else {
          this.deleteModelData(newData.children[i]);
        }
      }
    },
    /**
     * 树的点击事件
     * @param data 树的对象数据 包括子节点
     */
    handleNodeClick(data) {
      this.selectTreeNode = data;
        this.$emit("refreshModelList", data);
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
        this.form.modelFolderName = this.selectTreeNode.label;
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
        this.addModelFolder();
      } else {
        this.updateFolder();
      }
    },
    /**
     * 添加模型分类
     */
    addModelFolder() {
      this.form.modelFolderUuid = this.getGuuid();
      this.form.parentUuid = this.selectTreeNode.id;
      this.form.folderSort = 0;
      const nodePath = this.$refs.tree.getNodePath(this.selectTreeNode);
      const fullPath = [];
      nodePath.forEach((path) => {
        fullPath.push(path.id);
      });
      this.form.folderPath =
        fullPath.join("/") + "/" + this.form.modelFolderUuid;
      this.form.pbScope = this.selectTreeNode.extMap.pbScope;
      addModelFolder(this.form).then((result) => {
        if (result != null && result.code === 0) {
          const newChild = {
            id: this.form.modelFolderUuid,
            label: this.form.modelFolderName,
            children: [],
            pid: this.selectTreeNode.id,
            icon: "el-icon-folder",
            extMap: { pbScope: this.selectTreeNode.extMap.pbScope },
            type: "folder",
            path:  this.form.folderPath,
          };
          if (!this.selectTreeNode.children) {
            this.$set(this.selectTreeNode, "children", []);
          }
          this.selectTreeNode.children.push(newChild);
          this.form.modelFolderName = null
        } else {
          this.$notify({
            title: "提示",
            message: "请选择模型",
            type: "info",
            duration: 2000,
            position: "bottom-right",
          });
        }
      });
      // this.clearForm();
      this.dialogFormVisible = false;
    },
    /**
     * 修改模型分类
     */
    updateFolder() {
      this.form.modelFolderUuid = this.selectTreeNode.id;
      this.form.parentUuid = null;
      this.form.folderSort = null;
      this.form.folderPath = null;
      this.form.pbScope = null;
      updateModelFolder(this.form).then((result) => {
        if (result.code === 0) {
          this.getModelFolder();
        }
      });
      this.dialogFormVisible = false;
    },
    /**
     * 删除模型分类
     * @param node 节点对象
     * @param data 节点数据
     */
    deleteFolder(node, data) {
      if (data.pid === 0) {
        this.$message({ success: "info", message: "根目录不允许删除" });
        return;
      }
      if (
        (data.children !== undefined && data.children.length === 0) ||
        data.children === undefined
      ) {
        var obj = { modelFolderUuid: data.id };
        this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            deleteModelFolder(obj).then((result) => {
              if (result.code === 0) {
                this.getModelFolder();
                this.$message({
                  type: "success",
                  message: "删除成功!",
                });
              }
            });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除",
            });
          });
      } else {
        this.$message({
          success: "error",
          message: "该分类下有分类或模型，不允许删除",
        });
      }
    },
    getSelectNode() {
      return this.$refs.tree.getCheckedNodes()[0];
    },
    getRootFolderUuid(id, data, inner) {
      if(!inner) {
        for (const d of this.data) {
          if(this.getRootFolderUuid(id, d, true)) {
            return d.id;
          }
        }
      }
      if(id && data) {
        if(data.id === id) {
          return true;
        } else if(data.children && data.children.length){
          const d = data.children.find(d => d.id === id);
          if(d) {
            return true;
          } else {
            for (const child of data.children) {
              if(this.getRootFolderUuid(id, child, true)) {
                return true;
              }
            }
          }
        }
      }
      return false;
    }
  },
};
</script>
<style lang="scss" scoped>
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
