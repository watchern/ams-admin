<template>
  <div class="left_tree_style">
    <el-tabs
      v-model="activeName"
      type="card"
      v-if="this.loadLeftTreeType != '4'"
      @tab-click="handleClick"
    >
      <el-tab-pane
        label="系统"
        :disabled="tabclick"
        v-if="isShowXTZTFC"
        name="0"
      >
        <span slot="label"
          ><el-tooltip class="item" effect="dark" content="系统" placement="top"
            ><i class="el-icon-setting"></i></el-tooltip></span
      ></el-tab-pane>
      <el-tab-pane
        label="主题"
        :disabled="tabclick"
        v-if="isShowXTZTFC"
        name="1"
        ><span slot="label"
          ><el-tooltip class="item" effect="dark" content="主题" placement="top"
            ><i class="el-icon-s-operation"></i></el-tooltip
        ></span>
      </el-tab-pane>
      <el-tab-pane
        label="分层"
        :disabled="tabclick"
        v-if="isShowXTZTFC"
        name="2"
        ><span slot="label"
          ><el-tooltip class="item" effect="dark" content="分层" placement="top"
            ><i class="el-icon-coin"></i></el-tooltip
        ></span>
      </el-tab-pane>

      <el-tab-pane
        label="个人空间"
        :disabled="tabclick"
        v-if="isShowPersonSpaceTab"
        name="3"
        ><span slot="label"
          ><el-tooltip
            class="item"
            effect="dark"
            content="个人空间"
            placement="top"
            ><i class="el-icon-user"></i></el-tooltip></span
      ></el-tab-pane>
    </el-tabs>
    <div class="padding10">
      <el-input
        v-model="filterText2"
        :disabled="tabclick"
        placeholder="输入关键字进行过滤"
      />
    </div>
    <!-- 数据源 -->
    <div
      class="padding10 dataSource"
      v-if="
        this.loadLeftTreeType != '4' &&
        this.loadLeftTreeType != '3' &&
        this.loadLeftTreeType != '1'
      "
    >
      <el-form :inline="true" :model="query" label-position="bottom">
        <el-form-item label="数据源：" label-width="90px">
          <el-select
            v-model="query.dataSource"
            :disabled="tabclick"
            @change="selectdata"
            placeholder="请选择数据源"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div v-if="loading == true" class="loadings">
      <div class="conter_loadings">
        <span><img src="@/assets/img/loading.gif" alt="" /></span>
      </div>
    </div>
    <div
      v-else
      class="conter_vh"
      :class="isSize == true ? 'conter_vh_size' : ''"
    >
      <!-- 系统 主题 分层  目录-->
      <div class="tree-containerall">
        <MyElTree
          ref="tree2"
          :props="props"
          :data="tree_list"
          :filter-node-method="filterNode"
          :default-expanded-keys="defaultExpandedKeys"
          class="filter-tree"
          highlight-current="true"
          node-key="id"
          :load="loadNode"
          :lazy="isLazyTree"
          @node-click="nodeClick"
          @node-contextmenu="nodeContextmenu"
          @node-drag-start="handleDragStart"
          @node-drag-enter="handleDragEnter"
          @node-drag-leave="handleDragLeave"
          @node-drag-over="handleDragOver"
          @node-drag-end="handleDragEnd"
          @node-drop="handleDrop"
          :draggable="draggable"
          :expand-on-click-node="expandOnClickNode"
          :show-checkbox="showCheckbox"
          :allow-drop="returnFalse"
          @check="setCheckedNodes"
        >
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <i v-if="data.id === 'ROOT'" :class="data.icon" />
            <i
              v-if="
                data.type === 'folder' ||
                data.type === 'system' ||
                data.type === 'layered' ||
                data.type === 'theme'
              "
            >
              <span class="agreeicon0"></span>
            </i>
            <i v-if="data.type === 'table'">
              <span class="icon iconfont agreeicon1"></span>
            </i>
            <i v-if="data.type === 'view'">
              <span class="icon iconfont agreeicon4"></span>
            </i>
            <i
              v-if="data.type === 'column'"
              class="el-icon-c-scale-to-original"
            />
            <span>{{ node.label }}</span>
            <span style="margin-left: 10px">
              <el-button
                v-if="
                  loadLeftTreeType === '3' &&
                  isPersonSpaceAdminRole &&
                  data.type === 'folder' &&
                  data.sceneInstUuid === 'allBankSpaceFolder'
                "
                title="添加文件夹"
                type="text"
                size="mini"
                class="tree-line-btn"
                @click.stop="() => handCreateAllSpaceFolder(node, data)"
              >
                <svg-icon icon-class="icon-add-1" />
              </el-button>
              <el-button
                v-if="
                  loadLeftTreeType === '3' &&
                  isPersonSpaceAdminRole &&
                  data.type === 'folder' &&
                  data.sceneInstUuid === 'allBankSpaceFolder' &&
                  data.id != 'allBankSpaceFolder'
                "
                title="修改文件夹"
                type="text"
                size="mini"
                class="tree-line-btn"
                @click.stop="() => handEditAllSpaceFolder(node, data)"
              >
                <svg-icon icon-class="icon-edit-1" />
              </el-button>
              <el-button
                v-if="
                  loadLeftTreeType === '3' &&
                  isPersonSpaceAdminRole &&
                  data.type === 'folder' &&
                  data.sceneInstUuid === 'allBankSpaceFolder' &&
                  data.id != 'allBankSpaceFolder'
                "
                title="删除文件夹"
                type="text"
                size="mini"
                class="tree-line-btn"
                @click.stop="() => handDeleteAllSpaceFolder(node, data)"
              >
                <svg-icon icon-class="icon-delete-1" />
              </el-button>

              <el-button
                v-if="
                  data.id === 'ROOT' ||
                  (data.extMap && data.extMap.folder_type === 'maintained')
                "
                type="text"
                size="mini"
                v-show="isShowLoadLeftTreeBtn"
                @click.stop="() => handleCreateFolder(node, data)"
              >
                <i class="el-icon-circle-plus" />
              </el-button>
              <el-button
                v-if="
                  (data.extMap && data.extMap.folder_type === 'maintained') ||
                  data.type === 'table' ||
                  data.type === 'view'
                "
                type="text"
                size="mini"
                v-show="isShowLoadLeftTreeBtn"
                @click.stop="() => handleUpdateFolder(node, data)"
              >
                <i class="el-icon-edit" />
              </el-button>
              <el-button
                v-if="
                  (data.extMap && data.extMap.folder_type === 'maintained') ||
                  data.type === 'table' ||
                  data.type === 'view'
                "
                type="text"
                size="mini"
                v-show="isShowLoadLeftTreeBtn"
                @click.stop="() => handleRemove(node, data)"
              >
                <i class="el-icon-delete" />
              </el-button>
            </span>
          </span>
        </MyElTree>
      </div>
      <!-- 目录 -->
    </div>
    <el-dialog
      v-if="allSpaceDialogFormVisible"
      title="请填写文件夹名称"
      :visible.sync="allSpaceDialogFormVisible"
      :append-to-body="true"
    >
      <el-form
        ref="allSpaceForm"
        :model="allSpaceForm"
        :rules="allSpaceFormRules"
      >
        <el-form-item label="文件夹名称" prop="folderName">
          <el-input v-model="allSpaceForm.folderName" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="allSpaceDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="choosePath()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { commonNotify } from "@/utils";
import MyElTree from "@/components/public/tree/src/tree.vue";
import {
  getBusinessSystemTree, //系统
  getThemeTree, //主题
  getLayeredTree, //分层
  delTable,
  delByTableMetaUuid,
  moveFolder4Authority,
} from "@/api/data/table-info";
import {
  getPersonSpaceTree, //个人空间
  showRMenu, //节点右键事件
  getTableField, //加载表字段
  addDragEvent, //树节点拖拽方法
  initSQLEditorTips, // 初始化SQL编辑器智能提示问题
  getLoginUserAdminRole, //获取当前登陆人是否有个人空间管理员角色
  saveAllSpaceFolder, //保存文件夹
  deleteAllSpaceFolder, //删除文件夹
  editAllSpaceFolder, //修改文件夹
} from "@/api/analysis/sqleditor/sqleditor";
import { init } from "leancloud-storage";
export default {
  components: { MyElTree },
  props: {
    form: {
      type: Object,
      default: () => ({}),
    },
    isSize: Boolean,
  },
  data() {
    return {
      props: {
        label: "label",
        isLeaf: "leaf",
        children: "children",
      },
      activeName: "0", //tab切换
      filterText2: null,
      tableMetaUuid: "",
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
        dataSource: "Postgre", //筛选条件//数据源
        pageNo: 1,
        pageSize: 10,
        businessSystemId: "", //id主键
        tableThemeId: "", //主题
        tableLayeredId: "", //分层
        folderUuid: "", //目录ID
        tbName: "", // 批量注册后 点击左侧树 一个会显示全部的问题
      },
      tabclick: false,
      treeLoading: false,
      tableData: [],
      chooseTables: [],
      //1-SQL编辑器 2-数据授权管理-资源绑定-左侧树 3-个人空间 4-数据装载与下线 5-数据资源目录
      loadLeftTreeType: "", //因为很多模块需要用到这棵树，用此类型来区分不同模块;
      isShowLoadLeftTreeBtn: true, //是否展示树节点操作按钮
      isShowPersonSpaceTab: false, //是否展示个人空间页签
      isShowXTZTFC: true, //是否展示系统、主题、分层页签
      draggable: false, //是否开启树节点拖拽
      showCheckbox: false, //是否开启树多选框
      elTabsName: "", //选中的页签名称
      treeNodeSelectedObj: [], //树节点勾选对象
      defaultExpandedKeys: ["ROOT"], //默认展开节点的数组
      isPersonSpaceAdminRole: false, //是否个人空间管理员
      allSpaceFormRules: {
        folderName: [
          {
            type: "string",
            required: true,
            message: "请输入文件夹名称",
            trigger: "blur",
          },
        ],
      },
      allSpaceForm: {
        folderUuid: "",
        folderName: "",
        fullPath: "",
        parentFolderUuid: "",
        sceneInstUuid: "allBankSpaceFolder", //个人空间全行数据
      },
      allSpaceFormType: "", //判断修改还是新增
      allSpaceDialogFormVisible: false,
      isLazyTree: true, //树是否懒加载
      expandOnClickNode: false,
    };
  },
  computed: {},
  watch: {
    filterText2(val) {
      this.$refs.tree2.filter(val);
    },
  },
  mounted() {},
  created() {
    this.query.businessSystemId = "";
    // this.show_details = false; //显示列表
    this.$nextTick(() => {
      this.post_getBusinessSystemTree(); //系统
    });
    this.$emit("queryList", this.query, (this.show_details = false));
    this.post_getLoginUserAdminRole();
  },
  methods: {
    switchTabAccreditLeft(index) {
      this.activeName = index;
      if (index == "0") {
        this.post_getBusinessSystemTree(); //系统
      } else if (index == "1") {
        this.post_getThemeTree(); //主题
      } else if (index == "2") {
        this.post_getLayeredTree(); //分层
      }
    },
    switchDataSourceAccreditLeft(val) {
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
      }
    },
    getCheckedNodes() {
      var leftTreeCheckedNodes = this.$refs.tree2.getCheckedNodes(false, true);
      return leftTreeCheckedNodes;
    },
    post_getLoginUserAdminRole() {
      this.loading = true;
      getLoginUserAdminRole().then((resp) => {
        this.isPersonSpaceAdminRole = resp.data;
        this.loading = false;
      });
    },
    //树节点选择
    setCheckedNodes(node, isChecked) {
      var _this = this;
      var strLevel = this.query.dataSource;
      var isRepeat = true;
      var obj = {};
      obj.strLevel = strLevel;
      // 目前半选中的节点的 key 所组成的数组
      const allcheckedNodes = this.$refs.tree2.getHalfCheckedKeys();
      if (allcheckedNodes.length > 0) {
        allcheckedNodes.forEach(function (item, k) {
          var fileObj = {};
          fileObj.type = "noNeedCheck";
          fileObj.pid = 0;
          fileObj.children = [];
          for (var i = 0; i < _this.tree_list.length; i++) {
            if (item === _this.tree_list[i].id) {
              fileObj.label = _this.tree_list[i].label;
              fileObj.id = _this.tree_list[i].id;
              break;
            }
          }
          isChecked.checkedNodes.push(fileObj);
        });
      }
      obj.data = isChecked.checkedNodes;

      if (this.treeNodeSelectedObj.length > 0) {
        for (var i = 0; i < this.treeNodeSelectedObj.length; i++) {
          if (this.treeNodeSelectedObj[i].strLevel === strLevel) {
            //将字段与where条件重新插入
            for (var k = 0; k < this.treeNodeSelectedObj[i].data.length; k++) {
              for (var m = 0; m < isChecked.checkedNodes.length; m++) {
                if (
                  this.treeNodeSelectedObj[i].data[k].id ===
                  isChecked.checkedNodes[m].id
                ) {
                  isChecked.checkedNodes[m].cols =
                    this.treeNodeSelectedObj[i].data[k].cols;
                  isChecked.checkedNodes[m].whereStr =
                    this.treeNodeSelectedObj[i].data[k].whereStr;
                  break;
                }
              }
            }

            this.treeNodeSelectedObj[i].data = isChecked.checkedNodes;
            isRepeat = false;
            break;
          }
        }
        if (isRepeat) {
          this.treeNodeSelectedObj.push(obj);
        }
      } else {
        this.treeNodeSelectedObj.push(obj);
      }
      console.log(this.treeNodeSelectedObj);
    },

    // 树内不可拖拽
    returnFalse() {
      return false;
    },
    //节点开始拖拽时触发的事件
    handleDragStart(node, ev) {
      //
    },
    //拖拽进入其他节点时触发的事件
    handleDragEnter(draggingNode, dropNode, ev) {
      //
    },
    //拖拽离开某个节点时触发的事件
    handleDragLeave(draggingNode, dropNode, ev) {
      //
    },
    //在拖拽节点时触发的事件（类似浏览器的 mouseover 事件）
    handleDragOver(draggingNode, dropNode, ev) {
      //
    },
    //拖拽结束时（可能未成功）触发的事件
    handleDragEnd(draggingNode, dropNode, dropType, ev) {
      // 只有表和字段能拖拽
      if (
        draggingNode.data.type === "table" ||
        draggingNode.data.type === "column"
      ) {
        var dragNodeName = draggingNode.data.label;
        addDragEvent(dragNodeName);
      }
    },
    // 拖拽成功完成时
    handleDrop(draggingNode, dropNode, dropType, ev) {
      //
    },
    // 懒加载表字段
    async loadNode(node, resolve) {
      if (node.level === 0) {
        return resolve(node.data);
      } else if (node.level >= 1) {
        //SQL编辑器、数据注册的表才需要展示字段
        if (
          node.data.type === "table" &&
          (this.loadLeftTreeType === "1" || this.loadLeftTreeType === "")
        ) {
          //个人空间下的表查询字段不需要权限
          var strLevel = this.activeName;
          var nodeList = getTableField(
            node,
            this.query.dataSource,
            this.loadLeftTreeType,
            strLevel
          );
          Promise.all([nodeList]).then((res) => {
            resolve(res[0]);
          });
        } else if (
          node.data.type === "table" &&
          (this.loadLeftTreeType != "1" || this.loadLeftTreeType != "")
        ) {
          //去掉表加载字段
          resolve([]);
        } else {
          return resolve(node.data.children);
        }
      } /* else if (node.level == 2) {
        if (this.loadLeftTreeType != "1") {
          //去掉表加载字段
          resolve([]);
        } else {
          var strLevel = this.activeName + this.query.dataSource;
          var nodeList = getTableField(node.data.id, this.query.dataSource, this.loadLeftTreeType, strLevel);
          Promise.all([nodeList]).then((res) => {
            resolve(res[0]);
          });
        }
      } */
    },
    // 区分不同模块
    loadLeftTreeTypeFun(data) {
      if (data) {
        this.loadLeftTreeType = data;
        //SQL编辑器
        if (this.loadLeftTreeType == "1") {
          this.isShowLoadLeftTreeBtn = false;
          this.isShowPersonSpaceTab = true;
          this.draggable = true;
          this.expandOnClickNode = true;
        }
        //数据授权管理-资源绑定 左侧树
        if (this.loadLeftTreeType == "2") {
          this.isShowLoadLeftTreeBtn = false;
          this.draggable = false;
          this.showCheckbox = true;
          this.isLazyTree = false;
        }
        //个人空间
        if (this.loadLeftTreeType == "3") {
          this.isShowLoadLeftTreeBtn = false;
          this.isShowPersonSpaceTab = true;
          this.isShowXTZTFC = false;
          this.activeName = "3";
          this.post_getPersonSpaceTree(); //个人空间
        }
        //数据装载与下线
        if (this.loadLeftTreeType == "4") {
          this.isShowLoadLeftTreeBtn = false;
          this.isShowPersonSpaceTab = true;
          this.isShowXTZTFC = false;
          this.showCheckbox = true;
          this.activeName = "3";
          this.post_getPersonSpaceTree(); //个人空间
        }
        //数据资源目录
        if (this.loadLeftTreeType == "5") {
          this.isShowLoadLeftTreeBtn = false;
          this.isShowPersonSpaceTab = true;
        }
      }
    },
    // 选择数据源
    selectdata(val) {
      this.query.dataSource = val;
      this.query.businessSystemId = "";
      this.query.tableThemeId = "";
      this.query.tableLayeredId = "";
      if (this.activeName == "0") {
        // 系统
        this.post_getBusinessSystemTree(); //系统
        this.$emit("queryList", this.query, (this.show_details = false));
      } else if (this.activeName == "1") {
        // 主题
        this.post_getThemeTree(); //主题
        this.$emit("queryList", this.query, (this.show_details = false));
      } else if (this.activeName == "2") {
        // 分层
        this.post_getLayeredTree(); //分层
        this.$emit("queryList", this.query, (this.show_details = false));
      } else if (this.activeName == "3") {
        // 个人空间
        this.post_getPersonSpaceTree(); //个人空间
      }
      // else {
      //   // 目录
      //   this.post_getDataTreeNode(); //目录
      // }
      //数据授权-资源绑定-切换数据源
      this.$emit("switchDataSourceAccredit", val);
    },
    // 系统
    post_getBusinessSystemTree() {
      this.loading = true;
      this.tabclick = true;
      this.elTabsName = "系统";
      getBusinessSystemTree(
        true,
        this.query.dataSource,
        true,
        this.loadLeftTreeType
      ).then((resp) => {
        if (this.activeName === "0") {
          this.tree_list = resp.data;
          if (this.loadLeftTreeType === "1") {
            //如果SQL编辑器需要加载智能提示
            initSQLEditorTips(this.tree_list);
          }
          this.tree_list.forEach((item) => {
            //SQL编辑器中，如果是表 需要展示字段不能去掉
            if (item.type != "table" && item.children.length == 0) {
              item.leaf = true;
            }
          });
        }
        this.loading = false;
        this.tabclick = false;
        //加载勾选数据
        this.$nextTick(() => {
          this.inverse();
          //数据授权-资源绑定-联动效果
          this.$emit("addRoleCheck");
          this.$refs.tree2.filter(this.filterText2);
        });
      });
    },
    // 主题
    post_getThemeTree() {
      this.loading = true;
      this.tabclick = true;
      getThemeTree(
        true,
        this.query.dataSource,
        true,
        this.loadLeftTreeType
      ).then((resp) => {
        this.tree_list = resp.data;
        if (this.loadLeftTreeType === "1") {
          //如果SQL编辑器需要加载智能提示
          initSQLEditorTips(this.tree_list);
        }
        this.tree_list.forEach((item) => {
          //SQL编辑器中，如果是表 需要展示字段不能去掉
          if (item.type != "table" && item.children.length == 0) {
            item.leaf = true;
          }
        });
        this.loading = false;
        this.tabclick = false;
        //加载勾选数据
        this.$nextTick(() => {
          this.inverse();
          //数据授权-资源绑定-联动效果
          this.$emit("addRoleCheck");
          this.$refs.tree2.filter(this.filterText2);
        });
      });
    },
    // 分层
    post_getLayeredTree() {
      this.loading = true;
      this.tabclick = true;
      getLayeredTree(
        true,
        this.query.dataSource,
        true,
        this.loadLeftTreeType
      ).then((resp) => {
        this.tree_list = resp.data;
        if (this.loadLeftTreeType === "1") {
          //如果SQL编辑器需要加载智能提示
          initSQLEditorTips(this.tree_list);
        }
        this.tree_list.forEach((item) => {
          //SQL编辑器中，如果是表 需要展示字段不能去掉
          if (item.type != "table" && item.children.length == 0) {
            item.leaf = true;
          }
        });
        this.loading = false;
        this.tabclick = false;
        //加载勾选数据
        this.$nextTick(() => {
          this.inverse();
          //数据授权-资源绑定-联动效果
          this.$emit("addRoleCheck");
          this.$refs.tree2.filter(this.filterText2);
        });
      });
    },
    //个人空间
    post_getPersonSpaceTree() {
      this.loading = true;
      this.tabclick = true;
      getPersonSpaceTree(
        "",
        "",
        this.query.dataSource,
        this.loadLeftTreeType
      ).then((resp) => {
        if (this.activeName === "3") {
          this.tree_list = resp.data;
          if (this.loadLeftTreeType === "1") {
            //如果SQL编辑器需要加载智能提示
            initSQLEditorTips(this.tree_list);
          }
          this.tree_list.forEach((item) => {
            //SQL编辑器中，如果是表 需要展示字段不能去掉
            if (item.type != "table" && item.children.length == 0) {
              item.leaf = true;
            }
          });
        }
        this.loading = false;
        this.tabclick = false;
        this.$refs.tree2.filter(this.filterText2);
      });
    },
    // 点击注册资源的 数据库列表
    // getTables () {
    //   this.treeLoading = true;
    //   listUnCached(
    //     "table",
    //     "",
    //     this.filterText1 == null ? "" : this.filterText1,
    //     this.query.dataSource
    //   ).then((resp) => {
    //     this.treeLoading = false;
    //     this.tableData = resp.data;
    //   });
    // },
    //删除表之后刷新树
    refreshTreeList(dropTableNameList, type) {
      var activeName = this.activeName;
      if (type === "1") {
        if (activeName === "0") {
          this.post_getBusinessSystemTree();
        }
        if (activeName === "1") {
          this.post_getThemeTree();
        }
        if (activeName === "2") {
          this.post_getLayeredTree();
        }
        if (activeName === "3") {
          this.post_getPersonSpaceTree();
        }
      }
      if (type === "2") {
        var tree_list2 = [];
        var _this = this;
        this.tree_list.forEach(function (item, index) {
          if (item.type != "table" && item.children.length > 0) {
            _this.screenChildrenTree(item.children, dropTableNameList);
            tree_list2.push(item);
          } else {
            var isEqual = true;
            for (var k = 0; k < dropTableNameList.length; k++) {
              if (item.label === dropTableNameList[k]) {
                isEqual = false;
                break;
              }
            }
            if (isEqual) {
              tree_list2.push(item);
            }
          }
        });
        this.tree_list = [];
        this.tree_list = tree_list2;
      }
    },
    //递归筛选children数据
    screenChildrenTree(datas, dropTableNameList) {
      var _this = this;
      datas.forEach(function (item, index) {
        if (item.type != "table" && item.children.length > 0) {
          _this.screenChildrenTree(item.children, dropTableNameList);
        } else {
          for (var k = 0; k < dropTableNameList.length; k++) {
            if (item.label === dropTableNameList[k]) {
              datas.splice(index, 1);
              break;
            }
          }
        }
      });
    },
    // 反选
    inverse() {
      var strLevel = this.query.dataSource;
      if (this.treeNodeSelectedObj.length > 0) {
        for (var i = 0; i < this.treeNodeSelectedObj.length; i++) {
          if (this.treeNodeSelectedObj[i].strLevel === strLevel) {
            this.batchSelect(this.treeNodeSelectedObj[i].data);
            break;
          }
        }
      }
    },
    // 反选时处理方法
    batchSelect(seletedDatas) {
      if (typeof seletedDatas != "undefined") {
        var checkedKeys = [];
        this.defaultExpandedKeys = ["ROOT"];
        seletedDatas.forEach((node) => {
          if (node.type === "table" || node.type === "view") {
            //设置默认展开的节点 如果不展开节点 默认选中不生效
            if (this.activeName === "0") {
              this.defaultExpandedKeys.push(node.businessSystemId);
            }
            if (this.activeName === "1") {
              this.defaultExpandedKeys.push(node.themeId);
            }
            if (this.activeName === "2") {
              this.defaultExpandedKeys.push(node.layeredId);
            }
          }
          if (
            node.id != null &&
            node.type != "noNeedCheck" &&
            node.type === "table"
          ) {
            // this.$refs.tree2.setChecked(node.id, true);
            checkedKeys.push(node.id);
          }
        });
        this.$refs.tree2.setCheckedKeys(checkedKeys);
      }
    },
    //反勾选树节点
    uncheckTreeNode(data) {
      this.treeNodeSelectedObj = data;
    },
    //取消树节点勾选状态
    unLeftTreeSelected(data) {
      this.$refs.tree2.setChecked(data.id, false, false);
      this.treeNodeSelectedObj.forEach(function (item, k) {
        if (data.strLevel === item.strLevel) {
          item.data.forEach(function (t, k) {
            if (data.id === t.id) {
              item.data.splice(k, 1);
            }
          });
        }
      });
    },
    handleClick(tab, event) {
      this.elTabsName = tab.label;
      if (tab.name == "0") {
        // this.tabclick = true
        // setTimeout(() => {
        //   this.tabclick = false
        // }, 3000)
        this.post_getBusinessSystemTree(); //系统
      } else if (tab.name == "1") {
        this.post_getThemeTree(); //主题
      } else if (tab.name == "2") {
        this.post_getLayeredTree(); //分层
      } else if (tab.name == "3") {
        this.post_getPersonSpaceTree(); //个人空间
      }
      // else {
      //   this.post_getDataTreeNode(this.query.dataSource);//目录
      // }
      this.query.businessSystemId = "";
      this.query.tableThemeId = "";
      this.query.tableLayeredId = "";
      this.$emit("queryList", this.query, (this.show_details = false)); //查询全部注册表
      //数据授权-资源绑定-联动效果
      this.$emit("switchTabAccredit", tab.name);
      this.$emit("addRoleCheck");
      this.$refs.tree2.filter(this.filterText2);
    },
    // filterNode(value, data, node) {
    //   // if (!value) return true;
    //   // return data.label.indexOf(value) !== -1;
    //
    //   // 过滤后显示子级
    //   if (!value) {
    //     return true;
    //   }
    //   let level = node.level;
    //   let _array = []; //这里使用数组存储 只是为了存储值。
    //   this.getReturnNode(node, _array, value);
    //   let result = false;
    //   _array.forEach((item) => {
    //     result = result || item;
    //   });
    //   return result;
    // },

    //筛选节点
    filterNode(value, data,node) {
      if (!value) return true
      let parentNode = node.parent, labels = [node.label], level = 1
      while (level < node.level) {
        labels = [...labels, parentNode.label]
        parentNode = parentNode.parent
        level++
      }
      return labels.some(label => label.indexOf(value) !== -1)
    },


    // 处理过滤后显示二级++
    getReturnNode(node, _array, value) {
      let isPass =
        node.data && node.data.label && node.data.label.indexOf(value) !== -1;
      isPass ? _array.push(isPass) : "";
      this.index++;

      if (!isPass && node.level != 1 && node.parent) {
        this.getReturnNode(node.parent, _array, value);
      }
    },
    nodeClick(data, node, tree) {
      this.tableMetaUuid = "";
      this.show_details = false; //显示列表
      // 个人空间模块
      if (this.loadLeftTreeType == "3") {
        this.$emit("personalSpacePageQueryByTreeNode", data, node);
      }
      // 显示列表
      if (node.level == 1) {
        if (data.type == "system") {
          this.query.businessSystemId = node.data.id;
          this.query.tableThemeId = "";
          this.query.tableLayeredId = "";
          this.query.folderUuid = "";
          this.query.tbName = "";
          this.$emit("queryList", this.query, this.show_details);
        } else if (data.type == "theme") {
          this.query.businessSystemId = "";
          this.query.tableThemeId = node.data.id;
          this.query.tableLayeredId = "";
          this.query.folderUuid = "";
          this.query.tbName = "";
          this.$emit("queryList", this.query, this.show_details);
        } else if (data.type == "layered") {
          this.query.businessSystemId = "";
          this.query.tableThemeId = "";
          this.query.tableLayeredId = node.data.id;
          this.query.folderUuid = "";
          this.query.tbName = "";
          this.$emit("queryList", this.query, this.show_details);
        } else if (data.type == "table") {
          // this.query.businessSystemId = "0";
          // this.query.tableThemeId = "0";
          // this.query.tableLayeredId = "0";
          // this.query.folderUuid = ""; //目录id
          // this.query.tbName = node.data.label;
          // this.$emit("queryList", this.query, this.show_details);
          this.tableMetaUuid = node.data.id;
          this.show_details = true;
          this.isDisable_input = true;
          this.$emit(
            "details",
            this.tableMetaUuid,
            this.show_details,
            this.isDisable_input
          );
        }
      } else {
        if (data.type === "column") {
          return false;
        }
        //数据资源目录
        if (data.type === "folder") {
          this.query.businessSystemId = "";
          this.query.tableThemeId = "";
          this.query.tableLayeredId = "";
          this.query.folderUuid = node.data.id;
          this.query.tbName = "";
          this.$emit("queryList", this.query, this.show_details);
          return false;
        }
        // 进入详情
        this.tableMetaUuid = node.data.id;
        this.show_details = true;
        this.isDisable_input = true;
        this.$emit(
          "details",
          this.tableMetaUuid,
          this.show_details,
          this.isDisable_input
        );
      }
    },
    //鼠标右键事件
    nodeContextmenu(event, data, node, e) {
      var menuId = "";
      var numm = $(document).height() - event.clientY;
      if (
        data.type === "table" ||
        data.type === "view" ||
        data.type === "datasource"
      ) {
        menuId = "tableMenu";
        // history.scrollRestoration = 'manual'  不知道干什么
        // 判断是不是导入数据节点、和分享节点，右键可便捷表结构
        if (data.pid === "importDataTable") {
          menuId = "importTableMenu";
        }
      } else {
        // 外部导入数据节点加导入功能
        if (data.id === "importDataTable") {
          menuId = "importDataMenu";
        }

        if (
          data.id === "bussDataRoot" ||
          data.id === "bussRootNode" ||
          data.id === "my_space" ||
          data.id === "bussRootNode_dev" ||
          data.id === "my_space_dev" ||
          data.id === "other_space_dev"
        ) {
          menuId = "rootMenu";
        }
      }
      if (menuId !== "") {
        showRMenu(
          "sqlEditorLeftTree",
          "dataTree",
          menuId,
          event.clientX,
          event.clientY,
          data
        );
        this.$emit("nodeContextmenuSQLEditor", data);
      } else {
        return false;
      }
    },
    // 第一步选择的数据库
    nodeClick_table(data, node, tree) {
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
      let check_list = [];
      check_list.push({
        tableMetaUuid: data.id,
      });
      this.$emit("edit_list", check_list);
    },
    handleRemove(node, data) {
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
              this.query.businessSystemId = "";
              this.$emit("delete_list");
              if (this.activeName == "0") {
                // 系统
                this.post_getBusinessSystemTree(); //系统
              } else if (this.activeName == "1") {
                // 主题
                this.post_getThemeTree(); //主题
              } else if (this.activeName == "2") {
                // 分层
                this.post_getLayeredTree(); //分层
              }
              // 同步删除数据收授权下的资源
              delByTableMetaUuid(data.id, this.query.dataSource);
            });
          } else {
            delFolder(data.id).then((resp) => {
              this.$notify(
                commonNotify({ type: "success", message: "删除成功！" })
              );
              this.$refs.tree2.remove(data);
              this.query.businessSystemId = "";
              this.$emit("delete_list");
              if (this.activeName == "0") {
                // 系统
                this.post_getBusinessSystemTree(); //系统
              } else if (this.activeName == "1") {
                // 主题
                this.post_getThemeTree(); //主题
              } else if (this.activeName == "2") {
                // 分层
                this.post_getLayeredTree(); //分层
              }
            });
          }
        })
        .catch(() => {});
    },
    createFolder() {
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
    updateFolder() {
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
    //个人空间模块-全行空间文件夹下创建文件夹
    handCreateAllSpaceFolder(node, data) {
      this.allSpaceForm.parentFolderUuid = data.id;
      this.allSpaceForm.fullPath = data.label;
      this.allSpaceDialogFormVisible = true;
      this.allSpaceFormType = "add";
    },
    //个人空间模块-全行空间文件夹下修改文件夹
    handEditAllSpaceFolder(node, data) {
      this.allSpaceDialogFormVisible = true;

      this.allSpaceForm.folderUuid = data.id;
      this.allSpaceForm.folderName = data.label;
      this.allSpaceForm.fullPath = data.path;
      this.allSpaceForm.parentFolderUuid = data.pid;
      this.allSpaceFormType = "edit";
    },
    //个人空间模块-全行空间文件夹下删除文件夹
    handDeleteAllSpaceFolder(node, data) {
      if (data.children.length > 0) {
        this.$notify(
          commonNotify({
            type: "info",
            message: `当前文件夹下存在子集，不能删除`,
          })
        );
        return false;
      }
      this.loading = true;
      deleteAllSpaceFolder(data.id).then((resp) => {
        this.loading = false;
        this.$notify(
          commonNotify({
            type: "success",
            message: `删除成功`,
          })
        );
        this.post_getPersonSpaceTree();
      });
    },
    choosePath() {
      if (this.allSpaceForm.folderName.trim() === "") {
        return false;
      }
      this.allSpaceDialogFormVisible = false;
      this.loading = true;
      if (this.allSpaceFormType === "add") {
        saveAllSpaceFolder(this.allSpaceForm).then((resp) => {
          this.loading = false;
          this.allSpaceForm.folderName = "";

          this.$notify(
            commonNotify({
              type: "success",
              message: `保存成功`,
            })
          );
          this.post_getPersonSpaceTree();
        });
      } else {
        editAllSpaceFolder(this.allSpaceForm).then((resp) => {
          this.loading = false;
          this.allSpaceForm.folderName = "";

          this.$notify(
            commonNotify({
              type: "success",
              message: `保存成功`,
            })
          );
          this.post_getPersonSpaceTree();
        });
      }
    },
  },
};
</script>

<style scoped>
.left_tree_style {
  height: 100%;
  /* overflow: auto; */
  /* height: calc(100% - 280px); */
}

.conter_vh {
  height: calc(100% - 160px);
  overflow: auto;
}
.conter_vh_size {
  height: calc(100% - 100px);
}
/* 个人空间管理页面 需要二次更改高度 */

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
  /* height: calc(100% - 150px); */
  height: 100%;
  width: 100%;
  z-index: 9;
  background: rgba(106, 106, 106, 0.0862745098);
  border-radius: 15px;
}

.conter_loadings {
  width: 100%;
  height: 100%;
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: blur(10px);
  background: #f4f6f9
    linear-gradient(134deg, #f6f1ff 0%, #f3f0ff 33%, #ebf5fd 70%, #d0ddf7 100%);
  border-radius: 15px;
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
  /* width: 25%; */
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
.agreeicon0 {
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
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
.dataSource .el-form-item {
  margin-bottom: 0 !important;
}
</style>
