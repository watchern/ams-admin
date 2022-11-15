<template>
  <div class="page-container">
    <!-- left_conter -->
    <div class="  ">
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
      <div class="padding10">
        <el-input v-model="filterText2"
                  placeholder="输入关键字进行过滤" />
            </div>
      <div class="padding10">

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

        <div class="tree-containerall">
          <MyElTree
            ref="tree2"
            :props="props"
            :load="loadNode2"
            lazy
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            :default-expanded-keys="['ROOT']"
            class="filter-tree"
            :highlight-current="true"
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
                    data.type === 'TABLE'||
                    data.type === 'VIEW'
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
                  :data="list"
                  border
                  fit
                  highlight-current-row
                  style="width: 100%;height:calc(100% - 140px);overflow: auto;"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection"
                           width="55" />
          <!-- <el-table-column label="所属系统名称" width="300px" align="center" prop="folderName" /> -->
          <el-table-column label="系统名称"
                           prop="displayTbName" />
          <el-table-column label="系统代码"
                           prop="chnName" />
          <el-table-column label="创建时间"
                           align="center"
                           :formatter="formatCreateTime"
                           prop="createTime" />
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
        <el-pagination v-show="form.total>0"
                       :total="form.total"
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
                    @node-click="nodeClick1"
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
                 label-width="140px"
                 :model="form"
                 :inline="false">
          <!-- 资产编码 && 资产类型：-->
          <div class="son">
            <el-form-item label="资产编码:"
                          prop="tableCode">
              <el-input type="text"
                        v-model="form.tableCode"
                        :rows="4">
              </el-input>
            </el-form-item>

            <el-form-item label="资产类型：:"
                          prop="tableType">
              <el-select v-model="form.tableType"
                         :rows="4"
                         placeholder="请选择资产类型">
                <el-option v-for="item in options"
                           @change="select"
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
                           :props="props"
                           ref="cascaderArr"
                           @change="handleChange($event)"></el-cascader>
            </el-form-item>
          </div>
          <!--  资产负责人-->
          <div class="son ">
            <div class="son_check">

              <el-form-item label="资产负责人:"
                            prop="personUuid">
                <el-input type="text"
                          v-model="form.personUuid">
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
                     @click="modelResultShare">确 定</el-button>
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

<!--  </div>-->

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
      fromData: [],
      // props: {
      //   label: "label",
      //   isLeaf: "leaf",
      //   children: "children",
      // },
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

        tableRemarks: [
          { required: true, message: '请输入资产备注', trigger: 'blur' },
        ],
      },
      // 新增的数据
      form: {
        tableCode: '',// 资产编码
        tableType: '',// 资产类型
        tableThemeId: '',// 资产主题
        businessSystemId: '',//所属系统
        tableLayeredId: '',//资产分层
        folderUuid: '',//所属目录

        personUuid: '',//资产责任人
        tableRemarks: '',//资产备注

      },
      isDisable: false, //防止重复提交
      resultShareDialogIsSee: false,//选择责任人
      selectValue: [], // 存储表格中选中的数据
      next_data: [],// 点击下一步的数据
      props: {
        label: 'label',
        children: 'children',
        value: 'id'
      },
      next_contentsList: [],//目录
      check_next_contentsList: {},//选择的目录


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
    // tab切换
    handleClick (tab, event) {
      // this.query.dataSource = ''
      //
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
    loadNode2 (node, resolve) {
      if (!node.data) {
        resolve([{ id: "ROOT", label: "数据集", leaf: false }]);
      } else {
        getDataTreeNode(node.data.id).then((resp) => {
          resolve(resp.data);
        });
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


    // 旧版本保存
    flagSelectTable() {
      var ckFolder = this.$refs.tree2.getCurrentNode();
      // if (!ckFolder || ckFolder.type !== "FOLDER") {
      //   this.$notify(
      //     commonNotify({ type: "warning", message: "请选中文件夹" })
      //   );
      //   return false;
      // } else {
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
        batchSaveTable(this.chooseTables).then((res) => {
          if (res.code!= 0) {
            this.$message({type:'error', message:res.msg})
            return
          }
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
      // }
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
    },

    // 第一步选择的数据库
    nodeClick1 (data, node, tree) {
      console.log(data);
      console.log(node);
      // console.log(tree);
    },


    // 注册资产 下一步
    next () {

      if (data) {
        alert(1)
        this.isDisable = false
      } else {
        this.isDisable = true
        alert(2)
      }


      // this.registTableFlag = false;//关闭上一步
      this.dialogVisible_information = true//显示下一步 基本信息
      getListTree().then((res) => {
        this.next_data = res.data
        this.next_contentsList = res.data.contentsList.children
        this.next_contentsList.forEach(item => {

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
    // 所属目录层级联动
    handleChange (row) {
      const checkedNode = this.$refs["cascaderArr"].getCheckedNodes();
      console.log(checkedNode[0].data.label);  //获取当前点击节点的label值
      console.log(checkedNode[0]);  //获取由label组成的数组
      //
      // return false
      this.check_next_contentsList = checkedNode[0]
      this.form.folderUuid = checkedNode[0].id
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
    },

    // 下一步的保存
    save (form) {
      this.isDisable = true
      setTimeout(() => {
        this.isDisable = false
      }, 2000)
      this.$refs[form].validate((valid) => {
        if (valid) {

          var ckFolder = this.$refs.tree2.getCurrentNode();
          ckTbs.filter((tb) => { return tb.type === "TABLE"; }).forEach((node) => {
            const tableForm = {
              tableMetaUuid: node.id,
              displayTbName: node.label,
              dbName: node.pid,
              tbName: node.label,
              folderUuid: ckFolder.id,

              personLiables: [
                {
                  personName: "string",// 资产认权人姓名
                  personUuid: "string", //资产认权人主键
                  tableMetaUuid: "string",// 资产主键
                }
              ],
              tableRelationQuery: {
                businessSystemId: this.form.tableLayeredId, //所属系统主键
                tableCode: this.form.tableCode, //资产编码
                tableDataSource: this.query.dataSource, //数据源
                tableLayeredId: this.form.tableLayeredId, //资产分层主键
                tableMetaUuid: "string", //资产主键

                tableRemarks: this.form.tableRemarks, //资产备注
                tableThemeId: this.form.tableThemeId, //资产主题主键
                tableType: this.form.tableType, //资产类型
              },
            };
            // 将选中的表信息封装入节点对象集合
            this.chooseTables.push(tableForm);


          });
          console.log(this.chooseTables);

          // let params = {
          //   tableMetaUuid: this.check_next_contentsList.id,
          //   displayTbName: this.check_next_contentsList.label,
          //   dbName: this.check_next_contentsList.pid,
          //   tbName: this.check_next_contentsList.label,

          //   folderUuid: this.form.folderUuid,//所属目录id

          // };
          console.log(params);

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
          })
          // this.resultShareDialogIsSee = false;
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
    },
    modelResultShare () {
      // this.listLoading = true;
      var runTaskRelUuids = [];
      var personUuids = [];
      var personNames = []
      var selectedNode = this.$refs.orgPeopleTree.getSelectValue();
      for (var i = 0; i < selectedNode.length; i++) {
        personUuids.push(selectedNode[i].personuuid);
        personNames.push(selectedNode[i].cnname);
      }
      //id
      //name
      //
      return false
      for (var i = 0; i < this.selected1.length; i++) {
        runTaskRelUuids.push(this.selected1[i].runTaskRelUuid);
      }
      if (personUuids.length > 0) {
        // insertRunResultShare(runTaskRelUuids, personUuids, personNames).then((resp) => {
        //   // this.listLoading = false;
        //
        //   if (resp.data == true) {
        //     this.$message({
        //       type: "success",
        //       message: "结果共享成功!",
        //     });
        //   } else {
        //     this.$message({
        //       type: "error",
        //       message: "结果共享失败!",
        //     });
        //   }
        //   this.resultShareDialogIsSee = false;
        // });
      } else {
        this.listLoading = false;
        this.$message({
          message: "请选择责任人",
        });
      }
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
.son >>> .el-form-item {
  width: 100%;
  display: flex;
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
