<template>
  <div class="page-container">
    <!-- left_conter -->
    <div class="left_conter">
      <el-tabs v-model="activeName"
               type="card"
               @tab-click="handleClick">
        <el-tab-pane label="系统"
                     name="0"></el-tab-pane>
        <el-tab-pane label="主题"
                     name="1"></el-tab-pane>
        <el-tab-pane label="分层"
                     name="2"></el-tab-pane>
        <el-tab-pane label="目录"
                     name="3"></el-tab-pane>
      </el-tabs>
      <div class="padding10">
        <el-input v-model="filterText2"
                  v-if="activeName!==3"
                  placeholder="输入关键字进行过滤" />

        <el-input v-model="filterText3"
                  v-else
                  placeholder="输入关键字进行过滤" />
            </div>
      <div class="padding10">
        <!-- 数据源 -->
        <el-form :inline="true"
                 :model="query"
                 label-position="bottom">
          <el-form-item label="数据源：">
            <el-select v-model="query.dataSource"
                       placeholder="请选择数据源">
              <el-option v-for="item in options"
                         @change="select"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value" />
            </el-select>
          </el-form-item>
        </el-form>

      </div>

      <div class="padding10">

        <!-- 系统 主题 分层 -->
        <div class="tree-containerall"
             v-if="activeName!==3">
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
              <i
                 v-if="data.type === 'folder' || data.type === 'system' || data.type === 'layered' || data.type === 'theme'">
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
                <el-button v-if="
                    data.id === 'ROOT' ||
                    (data.extMap && data.extMap.folder_type === 'maintained')
                  "
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
                    data.type === 'table'||
                    data.type === 'view'
                  "
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
        <div class="tree-containerall"
             v-else>
          <MyElTree ref="tree3"
                    :props="defaultProps"
                    :load="loadNode2"
                    lazy
                    :filter-node-method="filterNode"
                    :default-expanded-keys="['ROOT']"
                    class="filter-tree"
                    highlight-current="true"
            node-key="id"
                    @node-click="handleNodeClick">
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <i v-if="data.id === 'ROOT'"
                 :class="data.icon" />
              <i
                 v-if="data.type === 'folder' || data.type === 'system' || data.type === 'layered' || data.type === 'theme'">
                <span class="agreeicon0"></span>
              </i>
              <i v-if="data.type === 'table'">
                <span class="icon iconfont agreeicon1"></span>
              </i>
              <i v-if="data.type === 'view'">
                <span class="icon iconfont agreeicon4"></span>
              </i>

              <i v-if="data.type === 'column'"
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
                  class="tree-line-btn"
                  @click.stop="() => handleCreateFolder(node, data)"
                  ><svg-icon icon-class="icon-add-1" /></el-button>
                <!--修改： 手工维护的节点-->
                <el-button
                  v-if="data.extMap && data.extMap.folder_type === 'maintained'"
                  type="text"
                  size="mini"
                  class="tree-line-btn"
                  @click.stop="() => handleUpdateFolder(node, data)"
                >
                 <svg-icon icon-class="icon-edit-1" />
                </el-button>
                <!--删除： 手工维护的节点-->
                <el-button
                  v-if="
                    (data.extMap && data.extMap.folder_type === 'maintained') ||
                    data.type === 'table'||
                    data.type === 'view'
                  "
                  type="text"
                  size="mini"
                  class="tree-line-btn"
                  @click.stop="() => handleRemove(node, data)"
                >
                  <svg-icon icon-class="icon-delete-1" />
                </el-button>
              </span>
              <el-link v-if="data.id === 'ROOT'" class="select-link" type="primary" @click.stop="registTable">注册资源</el-link>
            </span>
          </MyElTree>
        </div>
      </div>
    </div>
    <!-- left_conter end-->

    <!-- right_conter -->
    <div class="right_conter padding10">

      <!-- 默认表单 -->
      <div v-if="divInfo == false">
        <div class="padding10">
          <el-row>
            <el-col align="right">
              <el-button type="primary"
                         class="oper-btn  btn-width-md"
                         @click="registTable()">注册资产</el-button>
            </el-col>
          </el-row>
        </div>
        <el-table v-loading="listLoading"
                  :data="list.data"
                  border
                  fit
                  highlight-current-row
                  style="width: 100%;height:calc(100% - 140px);overflow: auto;"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection"
                           width="55" />
          <!-- <el-table-column label="所属系统名称" width="300px" align="center" prop="folderName" /> -->
          <el-table-column label="资产名称"
                           prop="displayTbName" />
          <el-table-column label="资产编码"
                           prop="chnName" />
          <el-table-column label="创建时间"
                           prop="createTime"
                           align="center"
                           :formatter="formatCreateTime" />
          <el-table-column label="创建人"
                           align="center"
                           prop="createTime" />
          <el-table-column label="操作"
                           align="center"
                           min-width="100">
            <template slot-scope="scope">
              <el-button type="primary"
                         class="oper-btn edit"
                         title="修改"
                         size="mini"
                         @click="edit_table(scope.row.tableMetaUuid)" />
              <el-button type="primary"
                         class="oper-btn delete"
                         title="删除"
                         size="mini"
                         @click="delete_table(scope.row.tableMetaUuid)" />
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-show="list.total>0"
                       :total="list.total"
                       :current-page="form.currentPage"
                       background
                       @current-change="handleCurrentChange"
                       @size-change="handleSizeChange"
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>

      <!-- 点击树-->
      <div v-if="divInfo==true">
        <tabledatatabs ref="tabledatatabs"
          open-type="tableRegister"
          :table-id="tableId"
          :tab-show.sync="tabShow"
          :ifShowPlace="true"
        />
      </div>
    <!-- right_conter end-->

    <!-- 注册资产 -->
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

        <div class="tree-containerselect padding10">

          <!-- @check-change="handleCheckChange"
                    show-checkbox
                     -->
          <MyElTree ref="tree1"
          v-loading="treeLoading"
          :props="props"
          :data="tableData"
          class="filter-tree"
                    @node-click="nodeClick_table"
                    default-expand-all>
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
          <!-- <el-button type="primary"
                     @click="flagSelectTable">保存</el-button> -->

          <el-button type="primary"
                     :disabled="isDisable"
                     v-if="is_next == true"
                     @click="next()">下一步</el-button>
        </span>
      </el-dialog>

      <!-- 下一步 基本信息-->
      <el-dialog title="基本信息"
                 class="data_res"
                 :visible.sync="dialogVisible_information"
                 @close="handleClose('form')"
                 width="40%">
        <el-form :rules="rules"
                 ref="form"
                 label-width="100px"
                 :model="form"
                 :inline="false">
          <!-- 资产编码 && 资产类型：-->
          <div class="son">
            <el-form-item label="资产编码:"
                          prop="tableCode">
              <el-input type="text"
                        placeholder="请输入资产编码"
                        v-model="form.tableCode"
                        :rows="4">
              </el-input>
            </el-form-item>

            <el-form-item label="资产类型：:"
                          prop="tableType">
              <el-select v-model="form.tableType"
                         :rows="4"
                         placeholder="请选择资产类型">
                <el-option v-for="item in data_type"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value" />
              </el-select>
            </el-form-item>
          </div>

          <!-- 资产主题 && 所属系统-->
          <div class="son">
            <el-form-item label="资产主题:"
                          prop="tableThemeId">
              <el-select v-model="form.tableThemeId"
                         :rows="4"
                         placeholder="请选择资产主题">
                <el-option v-for="item in next_data.themeList"
                           :key="item.codeUuid"
                           :label="item.codeName"
                           :value="item.codeUuid" />
              </el-select>
            </el-form-item>

            <el-form-item label="所属系统:"
                          prop="businessSystemId">
              <el-select v-model="form.businessSystemId"
                         :rows="4"
                         placeholder="请选择所属系统">
                <el-option v-for="item in next_data.businessSystemList"
                           :key="item.businessSystemUuid"
                           :label="item.businessSystemName"
                           :value="item.businessSystemUuid" />
              </el-select>
            </el-form-item>
          </div>

          <!-- 资产分层 && 所属目录-->
          <div class="son">
            <el-form-item label="资产分层:"
                          prop="tableLayeredId">
              <el-select v-model="form.tableLayeredId"
                         :rows="4"
                         placeholder="请选择资产分层">
                <el-option v-for="item in next_data.layeredList"
                           :key="item.codeUuid"
                           :label="item.codeName"
                           :value="item.codeUuid" />
              </el-select>
            </el-form-item>

            <el-form-item label="所属目录:"
                          prop="folderUuid">
              <el-cascader v-model="form.folderUuid"
                           :options="next_contentsList"
                           placeholder="请选择所属目录"
                           clearable
                           :props="props2"
                           ref="cascaderArr"
                           @change="handleChange"></el-cascader>
            </el-form-item>
          </div>
          <!--  资产负责人-->
          <div class="son ">
            <div class="son_check">

              <el-form-item label="资产负责人:"
                            prop="personName">
                <el-input type="text"
                          disabled
                          v-model="form.personName">
                </el-input>

              </el-form-item>
              <el-button type="primary"
                         class="oper-btn"
                         @click="check_people()">选择</el-button>
            </div>

          </div>

          <!--  资产备注-->
          <div class="son">
            <el-form-item label="资产备注:"
                          prop="tableRemarks">
              <el-input type="textarea"
                        v-model="form.tableRemarks">
              </el-input>
            </el-form-item>

          </div>

        </el-form>

        <span slot="footer"
              class="dialog-footer">
          <el-button @click="step()">上一步</el-button>
          <el-button type="primary"
                     :disabled="isDisable"
                     @click="save('form')">保存</el-button>
          <el-button @click="dialogVisible_information = false">关闭</el-button>

      </span>
    </el-dialog>

      <!-- 选择责任人 -->
      <el-dialog title="选择责任人"
                 :visible.sync="resultShareDialogIsSee"
                 width="50%">
        <personTree ref="orgPeopleTree"></personTree>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="resultShareDialogIsSee = false">取 消</el-button>
          <el-button type="primary"
                     @click="modelResultShare()">确 定</el-button>
        </span>
      </el-dialog>

      <el-dialog :title="dialogTitle"
      :visible.sync="folderFormVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="folderForm" :model="folderForm" class="detail-form">
        <el-form-item label="文件夹名称">
          <el-input v-model="folderForm.folderName"  />
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
    <!-- right_conter end-->

  </div>

</template>

<script>
import tabledatatabs from "@/views/data/table/tabledatatabs";
import MyElTree from "@/components/public/tree/src/tree.vue";
import {
  listUnCached,
  getDataTreeNode,//目录
  getBusinessSystemTree,//系统
  getThemeTree,//主题
  getLayeredTree,//分层
  delTable,
  listByTreePage,//列表
} from "@/api/data/table-info";
import { saveFolder, updateFolder, delFolder } from "@/api/data/folder";
import { commonNotify } from "@/utils";
import QueryField from '@/components/public/query-field/index'
import personTree from "@/components/publicpersontree/index";
import {
  insertRunResultShare,//责任人
} from "@/api/analysis/auditmodelresult";

import {
  // page_list_data,//列表
  // getById,//详情
  // save_data,//新增保存
  // update_data,//编辑保存
  // delete_data,//删除
  batchSaveTable_save,//下一步 保存
  getListTree,//注册资产下一步
} from "@/api/lhg/register.js";



export default {
  components: {
    MyElTree, tabledatatabs, QueryField,
    personTree: () => import('@/components/publicpersontree/index')
  },
  data() {
    return {
      activeName: 0,//tab切换
      ifExpandAll: false, // 是否展开所有树节点
      tabShow: "basicinfo",
      tableId: "",
      registTableFlag: false,
      divInfo: false,
      filterText1: null,
      filterText2: null,
      filterText3: null,
      fromData: [],
      props: {
        label: "label",
        isLeaf: "leaf",
        children: "children",
      },
      // 目录
      defaultProps: {
        label: "label",
        isLeaf: "leaf",
        children: "children",
      },

      tree_list: [],//左侧资料树数据结构
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
      // selectValue: 1,
      treeLoading: false,
      tableData: [],
      chooseTables:[],

      // 列表
      listLoading: false,
      list: [],//table 列表
      // 新建的数据
      // form: {
      //   name: '',
      //   time: '',
      //   code: '',
      //   beforSemantics: '',
      //   pageNo: 1,
      //   total: 0,
      //   pageSize: 5,
      // },

      // 资料树筛选 数据源
      query: {
        dataSource: 'Postgre',//筛选条件
      },

      options: [{
        value: 'Postgre',
        label: 'MRS-DWS'
      }, {
        value: 'Hive',
        label: 'ADS'
      }],
      dialogVisible_information: false,//下一步 基本信息

      rules: {
        tableCode: [
          { required: true, message: '请输入资产编码', trigger: 'blur' },
        ],
        tableType: [
          { required: true, message: '请选择资产类型', trigger: 'change' },
        ],

        tableThemeId: [
          { required: true, message: '请选择所属主题', trigger: 'change' },
        ],
        businessSystemId: [
          { required: true, message: '请选择所属系统', trigger: 'change' },
        ],

        tableLayeredId: [
          { required: true, message: '请选择资产分层', trigger: 'change' },
        ],

        folderUuid: [
          { required: true, message: '请选择所属目录', trigger: 'change' },
        ],
        personUuid: [
          { required: true, message: '请选择资产责任人', trigger: 'change' },
        ],

        // tableRemarks: [
        //   { required: true, message: '请输入资产备注', trigger: 'blur' },
        // ],
      },
      // 新增的数据
      form: {
        tableCode: '',// 资产编码
        tableType: '',// 资产类型
        tableThemeId: '',// 资产主题
        businessSystemId: '',//所属系统
        tableLayeredId: '',//资产分层
        folderUuid: '',//所属目录

        tableRemarks: '',//资产备注
        personName: '',
        personUuid: '',//资产责任人
        personLiables: [],

      },
      personName: [],
      isDisable: false, //防止重复提交
      resultShareDialogIsSee: false,//选择责任人
      selectValue: [], // 存储表格中选中的数据
      next_data: [],// 点击下一步的数据
      props2: {
        label: 'label',
        children: 'children',
        value: 'id'
      },
      next_contentsList: [],//目录
      // check_next_contentsList: {},//选择的目录
      is_next: false,//是否显示下一步
      ischeck_data: {},//第一步选择的数据库

      data_type: [
        {
          value: 1,
          label: '表'
        }
      ],

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
    },
    filterText3 (val) {
      this.$refs.tree3.filter(val)
    }
  },
  created () {
    this.post_getBusinessSystemTree();//系统
    // this.post_getThemeTree();//主题
    // this.post_getLayeredTree();//分层
    // this.post_getDataTreeNode();//目录


  },
  methods: {
    // tab切换
    handleClick (tab, event) {
      if (tab.index == '0') {
        this.post_getBusinessSystemTree();//系统
      } else if (tab.index == '1') {
        this.post_getThemeTree();//主题
      } else if (tab.index == '2') {
        this.post_getLayeredTree();//分层
      } else {
        this.post_getDataTreeNode('ROOT', this.query.dataSource);//目录

        // this.loadNode2("ROOT", this.query.dataSource);
          }
      },

    // expandAllNodes () {
    //   this.ifExpandAll = true;
    //   this.changeTreeNodeStatus(this.$refs.tree2.store.root)
    // },
    // collapseAllNodes () {
    //   this.ifExpandAll = false;
    //   this.changeTreeNodeStatus(this.$refs.tree2.store.root)
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

    // 系统
    post_getBusinessSystemTree () {
      getBusinessSystemTree(true, this.query.dataSource, true).then((resp) => {
        this.tree_list = resp.data
      });
    },
    // 主题
    post_getThemeTree () {
      getThemeTree(true, this.query.dataSource, true).then((resp) => {
        this.tree_list = resp.data
      });
    },
    // 分层
    post_getLayeredTree () {
      getLayeredTree(true, this.query.dataSource, true).then((resp) => {
        this.tree_list = resp.data
      });
    },
    // 目录
    post_getDataTreeNode (pid, dataSource) {
      getDataTreeNode(pid, dataSource).then((resp) => {
        this.tree_list = resp.data
        console.log(this.tree_list);

        });
    },




    // loadNode2 (node, resolve) {
    //   console.log(node);
    //   console.log(resolve);
    //   if (!node.data) {
    //     resolve([{ id: "ROOT", label: "数据集", leaf: false }]);
    //   } else {
    //     getDataTreeNode(node.data.id = pid, dataSource).then((resp) => {
    //       resolve(resp.data);
    //     });
    //   }
    // },
    async loadNode2 (node, resolve) {
      if (node.level !== 0) {
        // 子级
        this.getTreeData(node.data.id, resolve);
      } else {
        // 父级
        this.getTreeData("", resolve);
      }
    },
    async getTreeData (id, resolve) {
      if (id) {
        // 子级
        this.post_getDataTreeNode(id, this.query.dataSource);//目录
      } else {
        //父级
        this.post_getDataTreeNode('ROOT', this.query.dataSource);//目录
      }
    },

    // 点击注册资源的 数据库列表
    getTables() {
      this.treeLoading = true;
      listUnCached(
        "table",
        "",
        this.filterText1 == null ? "" : this.filterText1,
        this.query.dataSource,
      ).then((resp) => {
        this.treeLoading = false;
        this.tableData = resp.data;
      });
    },

    // 刷根据节点ID刷新节点
    refreshNodeBy(id){
      let node = this.$refs.tree2.getNode(id); // 通过节点id找到对应树节点对象
      node.loaded = false;
      node.expand(); // 主动调用展开节点方法，重新查询该节点下的所有子节点
    },
    // 点击切换表单
    nodeClick(data, node, tree) {
      this.divInfo = false;
      console.log(node.data);
      if (node.data.type === "table") {
        this.$nextTick(() => {
          this.divInfo = true;
          this.tableId = node.data.id;
        });
      } else {

        if (node.data.type === "folder") {
          this.post_getDataTreeNode(node.data.id, this.query.dataSource);//目录
        }
        this.page_list(node.data);//list
      }
    },

    // 右侧列表
    page_list (data) {
      console.log(data);
      if (data.type == "system") {
        let params = {
          businessSystemId: data.id,//所属系统主键
          tableThemeId: '',
          tableLayeredId: '',
          folderUuid: '',
          dataSource: this.query.dataSource,//数据源
        }
        this.query_lisy(params)
      } else if (data.type == "theme") {
        let params = {
          businessSystemId: '',
          tableThemeId: data.id,//资产主题主键
          tableLayeredId: '',
          folderUuid: '',
          dataSource: this.query.dataSource,//数据源
        }
        this.query_lisy(params)

      } else if (data.type == "layered") {
        let params = {
          businessSystemId: '',
          tableThemeId: '',
          tableLayeredId: data.id,//资产分层主键
          folderUuid: '',//目录ID
          dataSource: this.query.dataSource,//数据源
        }
        this.query_lisy(params)

      } else {
        let params = {
          businessSystemId: '',
          tableThemeId: '',
          tableLayeredId: '',
          folderUuid: data.id,//目录ID
          dataSource: this.query.dataSource,//数据源
        }
        this.query_lisy(params)
      }
    },

    query_lisy (params) {
      console.log(params);
      listByTreePage(params).then((resp) => {
        this.list = resp
        console.log(this.list);
      });
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
      // 修改为使用后台拼接，原因path.label取得是修改之前的label
      // let fullPath = [];
      // 拼接全路径（从ROOT节点开始一直到自己）
      // this.$refs.tree2.getNodePath(data).forEach((path) => {
      //   fullPath.push(path.label);
      // });
      // this.folderForm.fullPath = fullPath.join("/");
      this.folderFormVisible = true;
    },
    handleRemove(node, data) {
      this.$confirm("是否删除？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          if (data.type === "TABLE" || data.type === "VIEW" ) {
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
      if(this.folderForm.folderName == null || this.folderForm.folderName.trim().length == 0){
        this.$message({type:'info',message:"文件夹名不可为空，请重新输入文件夹名！"})
        return
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
      if(this.folderForm.folderName == null || this.folderForm.folderName.trim().length == 0){
        this.$message({type:'info',message:"文件夹名不可为空，请重新输入文件夹名！"})
        return
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

    // ································

    // 时间格式化
    formatCreateTime (row, column) {
      // 拼接日期规格为YYYY-MM-DD hh:mm:ss
      var createTime = new Date(row.createTime)
      var createTimeRow = createTime.getFullYear() + '-' + (createTime.getMonth() + 1) + '-' + createTime.getDate() + ' ' + createTime.getHours() + ':' + createTime.getMinutes() + ':' + createTime.getSeconds()
      return createTimeRow
    },
    // 选择数据源
    select (val) {
      this.query.dataSource = val

    },
    // 注册资产
    registTable () {
      // var ckFolder = this.$refs.tree2.getCurrentNode();
      // //  return;
      // if (!ckFolder || ckFolder.type !== "FOLDER") {
      //   this.$notify(
      //     commonNotify({ type: "warning", message: "请选中文件夹" })
      //   );
      //   return false;
      // }
      this.registTableFlag = true
      this.getTables()
    },
    // 上一步
    step () {
      // this.registTableFlag = true;//关闭上一步
      this.dialogVisible_information = false;//关闭基本信息

      this.clear()
    },
    // 清除注册资产第二步的数据
    clear () {
      // 清空
      this.form.tableCode = ''
      this.form.tableType = ''
      this.form.tableThemeId = ''
      this.form.businessSystemId = ''
      this.form.tableLayeredId = ''
      this.form.folderUuid = ''
      this.form.personUuid = ''
      this.form.tableRemarks = ''
      this.personUuid = [];
      this.personName = [];
    },
    // 第一步选择的数据库
    nodeClick_table (data, node, tree) {
      if (data) {
        // 显示保存按钮
        this.is_next = true;
      console.log(data);
        this.ischeck_data = data
      } else {
        this.is_next = false
      }
      // console.log(tree);
    },


    // 注册资产 下一步
    next () {
      this.registTableFlag = false;//关闭上一步
      this.dialogVisible_information = true//显示下一步 基本信息
      getListTree().then((res) => {
        this.next_data = res.data
        this.next_contentsList = res.data.contentsList.children
        this.next_contentsList.forEach(item => {
          // console.log(item.children);
          // debugger;

          // 所属目录三级联动判断
          if (item.children.length == 0) {
            item.children = undefined
          } else {
            this.formatCascaderData(item.children)
          }
        })
        // businessSystemList//系统
        // contentsList//目录
        // layeredList//分层
        // themeList//主题

      })
    },
    // 点击 所属目录层级联动
    handleChange (val) {
      // const checkedNode = this.$refs["cascaderArr"].getCheckedNodes();
      // console.log(checkedNode[0].data.label);  //获取当前点击节点的label值
      // console.log(checkedNode[0]);  //获取由label组成的数组
      // return false
      // this.check_next_contentsList = checkedNode[0]
      // this.form.folderUuid = checkedNode[0].id
      let folderUuid = val.toString();
      console.log(folderUuid);

      this.form.folderUuid = folderUuid

      //
    },

    // 格式化数据，递归将空的children置为undefined
    formatCascaderData (data) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].children.length < 1) {
          // children若为空数组，则将children设为undefined
          data[i].children = undefined;
        } else {
          // children若不为空数组，则继续 递归调用 本方法
          this.formatCascaderData(data[i].children)
        }
      }
      return data
    },
    // 关闭弹窗
    handleClose (form) {
      this.$refs[form].resetFields() //清空添加的值
      this.clear()
    },

    // 下一步的保存
    save (form) {
      this.isDisable = true
      setTimeout(() => {
        this.isDisable = false
      }, 2000)
      this.$refs[form].validate((valid) => {
        if (valid) {

          // var ckFolder = this.$refs.tree2.getCurrentNode();
          // ckTbs.filter((tb) => { return tb.type === "TABLE"; }).forEach((node) => {
            const tableForm = {
            tableMetaUuid: this.ischeck_data.id,
            displayTbName: this.ischeck_data.label,
            dbName: this.ischeck_data.pid,
            tbName: this.ischeck_data.label,
            folderUuid: this.form.folderUuid,//目录id
            // 资产责任人
            // personLiables: [
            //   {
            //     personName: this.form.personName,// 资产认权人姓名
            //     personUuid: this.form.personUuid, //资产认权人主键
            //     // tableMetaUuid: this.ischeck_data.id,// 资产主键
            //   }
            // ],
            personLiables: this.form.personLiables,
              tableRelationQuery: {
              tableDataSource: this.query.dataSource, //数据源
                businessSystemId: this.form.tableLayeredId, //所属系统主键
                tableCode: this.form.tableCode, //资产编码
                tableLayeredId: this.form.tableLayeredId, //资产分层主键
              tableMetaUuid: this.ischeck_data.id, //资产主键

                tableRemarks: this.form.tableRemarks, //资产备注
                tableThemeId: this.form.tableThemeId, //资产主题主键
                tableType: this.form.tableType, //资产类型
              },
            };
          // console.log(tableForm);
            // 将选中的表信息封装入节点对象集合
            this.chooseTables.push(tableForm);
          // return false
          // console.log(this.chooseTables);
          batchSaveTable_save(this.chooseTables).then((resp) => {
            if (resp.code == 0) {
              this.$message({
                type: "success",
                message: "新增成功!",
              });
            } else {
              this.$message({
                type: "error",
                message: res.msg,
              });
            }
            this.dialogVisible_information = false;
            this.registTableFlag = false;//关闭上一步
          })
        } else {
          this.$message({
            message: '请填写信息',
            type: 'info',
            showClose: true,
          })
          return false
        }
      })
    },
    // 选择责任人
    check_people () {
      this.resultShareDialogIsSee = true;
      this.$refs.orgPeopleTree.$refs.multipleTable.clearSelection();//清空选择的责任人
    },
    modelResultShare () {
      // this.listLoading = true;
      var runTaskRelUuids = [];
      var personUuids = [];
      var personNames = [];

      var arr = []
      var selectedNode = this.$refs.orgPeopleTree.getSelectValue();
      for (var i = 0; i < selectedNode.length; i++) {
        personUuids.push(selectedNode[i].personuuid);
        personNames.push(selectedNode[i].cnname);



        this.form.personUuid = personUuids
        this.form.personName = personNames

        // this.form.personName = personNames.toString();
        // console.log(this.form.personName);

        let obj = {
          personuuid: selectedNode[i].personuuid, personName: selectedNode[i].cnname
      }
        arr.push(obj)
      }
      this.form.personLiables = arr
      console.log(this.form.personLiables);
      this.resultShareDialogIsSee = false;
    },



    // 右侧表单
    // 多选
    handleSelectionChange (val) {
      this.Selectval = val;
    },
    // 刷新列表
    getList () {

    },
    /**
  * 当多选框改变时触发
  */
    handleSelectionChange (val) {
      this.selectValue = val
    },

    // 分页
    handleCurrentChange (val) {
      // this.queryInfo.currentPage = val

      // this.findSonNodeTreeList(
      //   this.addForm.superLabel,
      //   this.queryInfo.currentPage,
      //   this.queryInfo.pageSize,
      // )
    },
    // 每页多少条
    handleSizeChange (val) {
      // this.queryInfo.pageSize = val
      // this.findSonNodeTreeList(
      //   this.defaultExpandKeys[0],
      //   this.queryInfo.currentPage,
      //   this.queryInfo.pageSize,
      // )
    },
  },



};
</script>
<style scoped>
@import url("./../../../assets/css/common.css");
.left_conter >>> .el-tabs__item {
  width: 25%;
  text-align: center;
}
.left_conter >>> .el-tabs__nav {
  width: 100%;
}
.page-container {
  display: flex;
}
.data_res >>> .el-form {
  padding: 20px 20px 0;
  box-sizing: border-box;
}

.son {
  display: flex;
  margin-bottom: 20px;
}
.son >>> .el-form-item,
.son >>> .el-select,
.son >>> .el-cascader {
  width: 100%;
  display: flex;
  margin-bottom: 0 !important;
}
.data_res >>> .el-form-item__content {
  flex: 1;
  margin-left: 0 !important;
  float: left;
}
.data_res >>> .el-textarea .el-textarea__inner {
  resize: none;
}

.data_res >>> .el-form-item--medium .el-form-item__label {
  float: left !important;
  text-align: right;
}
.son_check {
  display: flex;
  align-items: center;
  width: 100%;
}
.son_check >>> .el-button {
  margin-left: 10px;
}
</style>
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
  // margin-top: 10px;
  cursor: pointer;
  margin-left: 10px;
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
