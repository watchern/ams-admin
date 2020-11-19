<template>
  <!-- childTabCon.vue是子页签中内容的通用组件 -->
  <div class="itxst">
    <el-dialog title="查询条件设置" :visible.sync="dialogVisible" width="30%">
      <myQueryBuilder
        v-if="dialogVisible"
        ref="myquerybuilder"
        :columns="queryData"
        :data="queryJson"
        @queryconditionchangetable="queryConditionChangeTable"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="queryCondition">查 询</el-button>
      </span>
    </el-dialog>
    <el-row v-if="myFlag">
       <div align="right">
      <el-button
        :disabled="modelRunResultBtnIson.exportBtn"
        type="primary"
        @click="exportExcel"
        class="oper-btn export-2"
      ></el-button>
      <el-button
        style="display: none"
        :disabled="modelRunResultBtnIson.chartDisplayBtn"
        type="primary"
        >图表展示</el-button
      >
      <el-button
        style="display: none"
        :disabled="modelRunResultBtnIson.associatedBtn"
        type="primary"
        @click="getValues"
        class="oper-btn refresh"
      ></el-button>
      <el-button
        style="display: none"
        :disabled="modelRunResultBtnIson.disassociateBtn"
        type="primary"
        @click="removeRelated('dc99c210a2d643cbb57022622b5c1752')"
        >移除关联</el-button
      >
      <el-button :disabled="false" type="primary" @click="queryConditionSetting" class="oper-btn search"
        ></el-button
      >
      <!-- <el-button type="primary" @click="addDetailRel('qwer', '项目10')"
        >重置</el-button -->
      <el-button :disabled="false" type="primary" @click="reSet" class="oper-btn again-2"
        ></el-button
      >
      <el-button
        class="oper-btn link"
        :disabled="modelRunResultBtnIson.modelDetailAssBtn"
        v-if="modelDetailButtonIsShow"
        type="primary"
        @click="openModelDetail"
        ></el-button
      >
       </div>
    </el-row>
    <el-row v-if="modelResultButtonIsShow" style="display: flex">
      <!-- 2.1前台导出，双向绑定数据 -->
      <downloadExcel :data="tableData" :fields="json_fields" :name="excelName">
        <el-button
          type="primary"
          @click="modelResultExport"
          class="oper-btn export-2"
        ></el-button>
      </downloadExcel>
      <el-button type="primary" title="图表展示">图表展示</el-button>
    </el-row>
    <!-- 使用ag-grid-vue组件 其中columnDefs为列，rowData为表格数据 -->
    <ag-grid-vue
      v-if="isSee"
      v-loading="isLoading"
      style="height: 200px"
      class="table ag-theme-balham"
      :column-defs="columnDefs"
      :row-data="rowData"
      :enable-col-resize="true"
      row-selection="multiple"
      :get-row-style="this.renderTable"
      @cellClicked="onCellClicked"
      @gridReady="onGridReady"
      @rowSelected="rowChange"
    />
    <el-card v-if="!isSee" class="box-card" style="height: 100px">
      <div>{{ errorMessage }}</div>
    </el-card>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="pageQuery.pageNo"
      :limit.sync="pageQuery.pageSize"
      @pagination="initData(nowSql)"
    />
    <el-pagination
      v-if="modelResultPageIsSee"
      :current-page="page"
      :page-sizes="[10, 20, 30, 50]"
      :page-size="limit"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total1"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <el-dialog
      title="模型详细关联"
      :visible.sync="modelDetailDialogIsShow"
      width="30%"
    >
      <div align="center">
        <el-select v-model="value" placeholder="请选择">
          <el-option
            v-for="(item, key) in options"
            :key="key"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modelDetailDialogIsShow = false">取 消</el-button>
        <el-button type="primary" @click="modelDetailCetermine"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <el-dialog
      v-if="modelDetailModelResultDialogIsShow"
      title="模型详细结果"
      :visible.sync="modelDetailModelResultDialogIsShow"
      width="80%"
    >
      <childtabscopy
        ref="childTabsRef"
        :pre-value="currentExecuteSQL"
        use-type="sqlEditor"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="modelDetailModelResultDialogIsShow = false"
          >取 消</el-button
        >
        <el-button
          type="primary"
          @click="modelDetailModelResultDialogIsShow = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 引入样式文件
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
// 引入ag-grid-vue
import { AgGridVue } from "ag-grid-vue";
import Pagination from "@/components/Pagination/index";
import JsonExcel from "vue-json-excel";
import childtabscopy from "@/views/analysis/auditmodelresult/childtabscopy";
import {
  selectTable,
  selectByRunResultTableUUid,
  batchSaveResultDetailProjectRel,
  selectPrimaryKeyByTableName,
  removeResultDetailProjectRel,
  selectConditionShow,
  selectModel,
  findParamModelRelByModelUuid,
  replaceParam,
} from "@/api/analysis/auditmodelresult";
import axios from "axios";
import VueAxios from "vue-axios";
import AV from "leancloud-storage";
import myQueryBuilder from "@/views/analysis/auditmodelresult/myquerybuilder";
import { string } from "jszip/lib/support";
import { startExecuteSql } from "@/api/analysis/sqleditor/sqleditor";
import { getTransMap } from "@/api/data/transCode.js";

export default {
  name: "childTabCon",
  // 注册draggable组件
  components: {
    AgGridVue,
    Pagination,
    myQueryBuilder,
    childtabscopy,
    downloadExcel: JsonExcel,
  },
  watch: {
    modelDetailModelResultDialogIsShow(value) {
      this.$nextTick(function () {
        if (value) {
          this.initWebSocket();
        }
      });
    },
  },
  /**
   * 模型运行结果使用变量：nowtable：表示模型结果表对象   modelUuid：根据modelUUid进行表格渲染，只有主表用渲染  useType=modelRunResult 表示是模型运行结果所用
   * sql编辑器模型结果使用变量：useType=sqlEditor 表示是sql编辑器模型结果所用  prePersonalVal：每一个prePersonalVal对应一个childtabcon组件，后续会触发父组件chidltabs中的loadTableData方法来根据prePersonalVal进行aggrid数据的展现
   */
  props: ["nowtable", "modelUuid", "useType", "prePersonalVal"],
  data() {
    return {
      dialogVisible: false,
      // 定义ag-grid列
      columnDefs: [],
      // aggrid需要显示的数据
      rowData: [],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
      },
      total: 0,
      myFlag: false, // 用来判断主表界面有按钮，辅表界面没有按钮，为true是主表，为false是辅表
      selectRows: [], //用于存放多选框选中的数据
      detailTable: [], //存放关联详细表
      primaryKey: "", // 保存每个表中的主键，因为每个表的主键都不一样，所以得根据表明查出来
      dataArray: [], // 保存当前表格中的数据
      queryData: [], // 保存列信息，用来传给子组件(queryBuilder组件)
      queryJson: {}, // 用来储存由子组件传过来的 queryBuilder 的 Json数据
      conditionShowData: [], // 存放模型运行结果需要渲染的数据
      primaryKey: "", // 存放模型运行结果主键
      isLoading: true, //给agrrid加遮罩
      nextValue: [], // 存放模型结果后传进来的值
      modelResultData: [], // 用来存放模型结果数据
      modelResultColumnNames: [], // 用来存放模型结果的列名
      limit: 10, // //模型结果前台分页的初始一页有多少条数据属性
      total1: null, // 模型结果前台分页的total属性
      page: 1, // 模型结果前台分页的当前页属性
      isSee: true, // 当输入sql错误和结果集为0的时候不显示aggrid表格
      errorMessage: "", // 存放模型结果错误消息
      modelResultPageIsSee: false, // 模型结果分页是否可见
      modelResultButtonIsShow: false, // 模型结果按钮是否可见
      modelDetailRelation: [], // 存放模型详细关联表
      modelOutputColumn: [], // 存放模型结果输出列
      modelDetailButtonIsShow: false, // 模型详细关联按钮是否可见
      modelDetailDialogIsShow: false, // 点击模型详细关联按钮后弹出的Dialog是否可见
      options: [], //存放模型详细关联dialog中下拉框的值
      value: "", //模型详细关联dialog中下拉框选中的值
      tableData: [], // 存放导出的数据（sql编辑器模型结果界面）
      excelName: "", // 导出后excle的名称（sql编辑器模型结果界面）
      json_fields: {}, // 导出表的列名（sql编辑器模型结果界面）
      modelDetailModelResultDialogIsShow: false, //点击模型详细dialog确定按钮后执行显示模型详细结果弹窗是否可见
      currentExecuteSQL: [], //模型详细关联dialog中点击确定按钮后根据sql返回的预先加载值，用于判断有几个页签
      webSocket: null, //websocket对象
      dataCoding: {}, //存储返回的数据转码对象
      nowSql: "undefined", //存储当前querybuilder中的sql
      modelRunResultBtnIson: {
        exportBtn: false,
        chartDisplayBtn: false,
        associatedBtn: true,
        disassociateBtn: false,
        modelDetailAssBtn: true,
      },
      dynamicSelect: [], //实时存储多选框勾选中的数据
    };
  },
  mounted() {
    this.getRenderTableData();
  },
  methods: {
    rowChange() {
      var selectData = this.gridApi.getSelectedRows();
      if (selectData.length == 0) {
        this.modelRunResultBtnIson.exportBtn = false;
        this.modelRunResultBtnIson.chartDisplayBtn = false;
        this.modelRunResultBtnIson.associatedBtn = true;
        this.modelRunResultBtnIson.disassociateBtn = false;
        this.modelRunResultBtnIson.modelDetailAssBtn = true;
      } else if (selectData.length == 1) {
        this.modelRunResultBtnIson.exportBtn = false;
        this.modelRunResultBtnIson.chartDisplayBtn = false;
        this.modelRunResultBtnIson.associatedBtn = false;
        this.modelRunResultBtnIson.disassociateBtn = false;
        this.modelRunResultBtnIson.modelDetailAssBtn = false;
      } else if (selectData.length > 1) {
        this.modelRunResultBtnIson.exportBtn = false;
        this.modelRunResultBtnIson.chartDisplayBtn = false;
        this.modelRunResultBtnIson.associatedBtn = false;
        this.modelRunResultBtnIson.disassociateBtn = false;
        this.modelRunResultBtnIson.modelDetailAssBtn = false;
      }
    },
    /**
     * 导出方法
     */
    exportExcel() {
      axios({
        method: "post",
        url: "/analysis/RunResultTableController/exportRunResultMainTable",
        data: this.dataArray,
        responseType: "blob",
      }).then((res) => {
        const link = document.createElement("a");
        const blob = new Blob([res.data], { type: "application/vnd.ms-excel" });
        link.style.display = "none";
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "模型运行结果表.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    },
    /**
     * 移除关联犯法
     * resultDetailProjectRelId:  resultDetailProjectRel表的主键
     */
    removeRelated(resultDetailProjectRelId) {
      removeResultDetailProjectRel(resultDetailProjectRelId).then((resp) => {
        if (resp.data == true) {
          this.$message({
            type: "success",
            message: "移除关联项目成功!",
          });
        } else {
          this.$message({
            type: "error",
            message: "移除关联项目失败!",
          });
        }
      });
    },
    /**
     * 关联项目
     */
    addDetailRel(projectId, projctName) {
      selectByRunResultTableUUid(this.nowtable.runResultTableUuid).then(
        (resp) => {
          this.detailTable = resp.data;
          var resultDetailProjectRels = [];
          if (resp.data.length == 0) {
            // 根据当前运行结果表查看运行结果详细与项目关联表里有没有值，如果没有值则直接关联
            selectPrimaryKeyByTableName(this.nowtable.resultTableName).then(
              (resp) => {
                this.primaryKey = resp.data;
                for (var i = 0; i < this.selectRows.length; i++) {
                  var resultDetailProjectRel = {
                    resultDetailProjectRelId: "",
                    runResultTableUuid: this.nowtable.runResultTableUuid,
                    runTaskRelUuid: this.nowtable.runTaskRelUuid,
                    projectId: projectId,
                    resultDetailId: this.selectRows[i][this.primaryKey],
                    projectName: projctName,
                  };
                  resultDetailProjectRels.push(resultDetailProjectRel);
                }
                batchSaveResultDetailProjectRel(resultDetailProjectRels).then(
                  (resp) => {
                    if (resp.data == true) {
                      this.$message({
                        type: "success",
                        message: "关联项目成功!",
                      });
                    } else {
                      this.$message({
                        type: "error",
                        message: "关联项目失败!",
                      });
                    }
                  }
                );
              }
            );
          } else {
            // 根据当前运行结果表查看运行结果详细与项目关联表里有没有值，如果有值则要判断是否关联过该主键，如果添加过就不能重复关联
            var resultDetailProjectRels = [];
            var related = [];
            selectPrimaryKeyByTableName(this.nowtable.resultTableName).then(
              (resp) => {
                this.primaryKey = resp.data;
                for (var i = 0; i < this.selectRows.length; i++) {
                  for (var j = 0; j < this.detailTable.length; j++) {
                    if (
                      this.selectRows[i][this.primaryKey] ==
                      this.detailTable[j].resultDetailId
                    ) {
                      related.push(this.selectRows[i][this.primaryKey]);
                    }
                  }
                }
                if (related.length == 0) {
                  for (var i = 0; i < this.selectRows.length; i++) {
                    var resultDetailProjectRel = {
                      resultDetailProjectRelId: "",
                      runResultTableUuid: this.nowtable.runResultTableUuid,
                      runTaskRelUuid: this.nowtable.runTaskRelUuid,
                      projectId: projectId,
                      resultDetailId: this.selectRows[i][this.primaryKey],
                      projectName: projctName,
                    };
                    resultDetailProjectRels.push(resultDetailProjectRel);
                  }
                  batchSaveResultDetailProjectRel(resultDetailProjectRels).then(
                    (resp) => {
                      if (resp.data == true) {
                        this.$message({
                          type: "success",
                          message: "关联项目成功!",
                        });
                      } else {
                        this.$message({
                          type: "error",
                          message: "关联项目失败!",
                        });
                      }
                    }
                  );
                } else {
                  var str = "";
                  for (var i = 0; i < related.length; i++) {
                    if (i != related.length - 1) {
                      str += related[i] + ",";
                    } else {
                      str += related[i];
                    }
                  }
                  this.$message({
                    type: "info",
                    message: "关联失败，因为其中" + str + "已经关联",
                  });
                }
              }
            );
          }
        }
      );
    },
    // 获取选中的数据数组
    getValues() {
      // 获取选中的数据
      var selRows = this.gridApi.getSelectedRows();
      if (selRows.length == 0) {
        this.$message({ type: "info", message: "请选择后再进行关联!" });
      }
      this.selectRows = selRows;
    },
    // ag-grid创建完成后执行的事件
    onGridReady(params) {
      // 获取gridApi
      this.gridApi = params.api;
      this.columnApi = params.columnApi;
      // 这时就可以通过gridApi调用ag-grid的传统方法了
      this.gridApi.sizeColumnsToFit();
    },
    // 单元格点击事件
    onCellClicked(cell) {},
    initData(sql, nextValue) {
      if (this.useType == "modelRunResult") {
        this.isLoading = true;
        // 当当前表是主表的时候myFlag赋值为true
        if (this.nowtable.tableType == 1) {
          this.myFlag = true;
        }
        var colNames = [];
        var col = [];
        var da = [];
        this.pageQuery.condition = this.nowtable;
        if (typeof sql !== "string") {
          sql = "undefined";
        }
        selectTable(this.pageQuery, sql).then((resp) => {
          if (resp.data.records[0].result.length == 0) {
            this.isLoading = false;
          }
          this.total = resp.data.total;
          this.dataArray = resp.data.records[0].result;
          this.queryData = resp.data.records[0].columnInfo;
          // 将返回对象的所有属性，按顺序提取出来，用于后续生成ag-grid列信息
          for (const key in resp.data.records[0].result[0]) {
            colNames.push(key);
          }
          // 生成ag-grid列信息
          if (this.modelUuid != undefined) {
            for (var i = 0; i < colNames.length; i++) {
              loop: for (var j = 0; j < this.modelOutputColumn.length; j++) {
                if (
                  this.modelOutputColumn[j].outputColumnName.toLowerCase() ==
                  colNames[i]
                ) {
                  if (this.modelOutputColumn[j].isShow == 1) {
                    if (i == 0) {
                      var rowColom = {
                        headerName: this.modelOutputColumn[j].columnAlias,
                        field: colNames[i],
                        checkboxSelection: true,
                      };
                    } else {
                      var rowColom = {
                        headerName: this.modelOutputColumn[j].columnAlias,
                        field: colNames[i],
                      };
                    }
                    col.push(rowColom);
                  } else {
                    if (i == 0) {
                      var rowColom = {
                        headerName: colNames[i],
                        field: colNames[i],
                        checkboxSelection: true,
                      };
                    } else {
                      var rowColom = {
                        headerName: colNames[i],
                        field: colNames[i],
                      };
                    }
                    col.push(rowColom);
                  }
                  break loop;
                }
              }
            }
          } else {
            for (var i = 0; i < colNames.length; i++) {
              if (i == 0) {
                var rowColom = {
                  headerName: colNames[i],
                  field: colNames[i],
                  checkboxSelection: true,
                };
              } else {
                var rowColom = {
                  headerName: colNames[i],
                  field: colNames[i],
                };
              }
              col.push(rowColom);
            }
          }
          if (this.modelUuid != undefined) {
            // 生成ag-frid表格数据
            for (var i = 0; i < resp.data.records[0].result.length; i++) {
              da.push(resp.data.records[0].result[i]);
            }
            for (var i = 0; i < da.length; i++) {
              for (var j = 0; j < colNames.length; j++) {
                for (var k = 0; k < this.modelOutputColumn.length; k++) {
                  if (
                    this.modelOutputColumn[k].outputColumnName.toLowerCase() ==
                    colNames[j]
                  ) {
                    if (this.modelOutputColumn[k].dataCoding != undefined) {
                      var a = da[i][colNames[j]];
                      da[i][colNames[j]] = this.dataCoding[
                        this.modelOutputColumn[k].dataCoding
                      ][a];
                    }
                  }
                }
              }
            }
          } else {
            // 生成ag-frid表格数据
            for (var i = 0; i < resp.data.records[0].result.length; i++) {
              da.push(resp.data.records[0].result[i]);
            }
          }
        });
        this.columnDefs = col;
        this.rowData = da;
      } else if (this.useType == "sqlEditor") {
        this.loading = true;
        this.nextValue = nextValue;
        var col = [];
        var rowData = [];
        if (this.prePersonalVal.id == this.nextValue.executeSQL.id) {
          if (this.nextValue.executeSQL.state == "2") {
            //todo 增加sql类型判断
            if (true) {
              this.modelResultButtonIsShow = true;
              this.modelResultPageIsSee = true;
              this.modelResultData = this.nextValue.result;
              this.modelResultColumnNames = this.nextValue.columnNames;
              for (var j = 0; j <= this.nextValue.columnNames.length; j++) {
                var rowColom = {
                  headerName: this.nextValue.columnNames[j],
                  field: this.nextValue.columnNames[j],
                  width: "180",
                };
                var key = this.nextValue.columnNames[j];
                var value = this.nextValue.result[j];
                col.push(rowColom);
              }
              for (var k = 0; k < this.nextValue.result.length; k++) {
                rowData.push(this.nextValue.result[k]);
              }
              this.columnDefs = col;
              this.getList();
            }
          } else if (this.nextValue.executeSQL.state == "3") {
            this.isSee = false;
            this.modelResultPageIsSee = false;
            this.modelResultButtonIsShow = false;
            this.errorMessage = this.nextValue.executeSQL.msg;
          }
          this.isLoading = false;
        }
      }
    },
    // 点击查询按钮触发事件
    queryCondition() {
      this.$refs.myquerybuilder.selectSql();
      this.dialogVisible = false;
    },
    // 查询完以后，子组件触发父组件的事件
    queryConditionChangeTable(sql, queryJson) {
      this.pageQuery.pageNo = 1;
      this.queryJson = queryJson;
      if (sql == "") {
        sql = "undefined";
      }
      this.nowSql = sql;
      this.initData(sql);
    },
    /**
     * 点击查询条件设置按钮触发
     */
    queryConditionSetting() {
      this.dialogVisible = true;
    },
    /**
     * 重置按钮，将数据还原为最初
     */
    reSet() {
      this.nowSql = "undefined";
      this.initData("undefined");
    },
    /**
     * 渲染表格，将颜色渲染上去
     */
    renderTable(params) {
      if (this.nowtable.tableType != 1) {
        this.isLoading = false;
      } else {
        if (this.modelUuid != undefined) {
          if (this.conditionShowData[0].length == 0) {
            this.isLoading = false;
          }
          for (var i = 0; i < this.conditionShowData[0].length; i++) {
            for (var j = 0; j < this.conditionShowData[0][i].length; j++) {
              if (
                params.data[this.primaryKey] == this.conditionShowData[0][i][j]
              ) {
                this.isLoading = false;
                return {
                  "background-color": JSON.parse(this.conditionShowData[1][i])
                    .backGroundColor,
                  color: JSON.parse(this.conditionShowData[1][i]).fontColor,
                };
              }
            }
          }
          this.isLoading = false;
        }
      }
    },
    /**
     * 在渲染表格之前拿到渲染表格时需要的数据
     */
    getRenderTableData() {
      if (this.useType == "modelRunResult") {
        if (this.modelUuid != undefined) {
          selectConditionShow(
            this.modelUuid,
            this.nowtable.resultTableName
          ).then((resp) => {
            this.conditionShowData = resp.data;
            selectPrimaryKeyByTableName(this.nowtable.resultTableName).then(
              (resp) => {
                this.primaryKey = resp.data;
                selectModel(this.modelUuid).then((resp) => {
                  this.modelDetailRelation = resp.data.modelDetailRelation;
                  this.modelOutputColumn = resp.data.modelOutputColumn;
                  var datacodes = [];
                  for (var i = 0; i < this.modelOutputColumn.length; i++) {
                    if (this.modelOutputColumn[i].dataCoding != undefined) {
                      datacodes.push(this.modelOutputColumn[i].dataCoding);
                    }
                  }
                  if (datacodes.length > 0) {
                    getTransMap(datacodes.join(",")).then((resp) => {
                      this.dataCoding = resp.data;
                    });
                  }
                  //调用方法
                  this.initData();
                  if (this.modelDetailRelation.length > 0) {
                    this.modelDetailButtonIsShow = true;
                  }
                });
              }
            );
          });
        } else {
          this.initData();
        }
      }
    },
    // 处理数据
    getList() {
      // es6过滤得到满足搜索条件的展示数据list
      this.rowData = this.modelResultData.filter(
        (item, index) =>
          index < this.page * this.limit &&
          index >= this.limit * (this.page - 1)
      );
      this.total1 = this.modelResultData.length;
    },
    // 当每页数量改变
    handleSizeChange(val) {
      this.limit = val;
      this.getList();
    },
    // 当当前页改变
    handleCurrentChange(val) {
      this.page = val;
      this.getList();
    },
    /**
     * 点击详细打开dialog效果
     */
    openModelDetail() {
      var selRows = this.gridApi.getSelectedRows();
      if (selRows.length < 1) {
        this.$message({ type: "info", message: "请选择后再进行关联!" });
      } else if (selRows.length == 1) {
        this.options = [];
        for (var i = 0; i < this.modelDetailRelation.length; i++) {
          var eachOption = {
            value: this.modelDetailRelation[i].relationObjectUuid,
            label: this.modelDetailRelation[i].modelDetailName,
          };
          this.options.push(eachOption);
        }
        this.modelDetailDialogIsShow = true;
      } else {
        this.$message({ type: "info", message: "不能选中多条!" });
      }
    },
    /**
     * 点击详细dialog的确定按钮后触发
     */
    modelDetailCetermine() {
      var selectRowData = this.gridApi.getSelectedRows();
      var relationType = null;
      var objectName = "";
      var detailConfig = null;
      for (var i = 0; i < this.modelDetailRelation.length; i++) {
        if ((this.value = this.modelDetailRelation[i].relationObjectUuid)) {
          relationType = this.modelDetailRelation[i].relationType;
          objectName = this.modelDetailRelation[i].relationObjectName;
          detailConfig = this.modelDetailRelation[i].modelDetailConfig;
          break;
        }
      }
      if (relationType == 1) {
        debugger
        var detailValue = [];
        for (var i = 0; i < this.modelDetailRelation.length; i++) {
          if (this.modelDetailRelation[i].relationObjectUuid == this.value) {
            for (
              var j = 0;
              j < this.modelDetailRelation[i].modelDetailConfig.length;
              j++
            ) {
              var key = this.modelDetailRelation[i].modelDetailConfig[j]
                .resultColumn;
              var obj = { moduleParamId: "", paramValue: "" };
              obj.moduleParamId = this.modelDetailRelation[i].modelDetailConfig[
                j
              ].ammParamUuid;
              obj.paramValue = selectRowData[0][key.toLowerCase()];
              detailValue.push(obj);
            }
          }
        }
        findParamModelRelByModelUuid(this.value).then((resp) => {
          var arr = [];
          for (var i = 0; i < resp.data.length; i++) {
            arr.push(JSON.parse(resp.data[i]));
          }
          selectModel(this.value).then((resp) => {
            var sql = replaceParam(detailValue, arr, resp.data.sqlValue);
            const obj = { sqls: sql };
            startExecuteSql(obj).then((resp) => {
              if (!resp.data.isError) {
                this.currentExecuteSQL = resp.data.executeSQLList;
              } else {
                this.$message({ type: "info", message: "执行失败" });
              }
            });
          });
        });
      } else if (relationType == 2) {
        //modelOutputColumn
        var sql = "SELECT * FROM " + objectName + " WHERE ";
        var filterSql = "";
        for (var i = 0; i < detailConfig.length; i++) {
          var eachFilter = detailConfig[i].relFilterValue;
          loop: for (var j = 0; j < this.modelOutputColumn.length; j++) {
            if (eachFilter.indexOf(this.modelOutputColumn[j]) > -1) {
              eachFilter = eachFilter.replace(
                eachFilter,
                selectRowData[0][this.modelOutputColumn[j].toLowerCase()]
              );
              break loop;
            }
          }
          if (i == detailConfig.length - 1) {
            filterSql += eachFilter;
          } else {
            filterSql += eachFilter + " or ";
          }
        }
        sql = sql + filterSql;
        const obj = { sqls: sql };
        startExecuteSql(obj).then((resp) => {
          if (!resp.data.isError) {
            this.currentExecuteSQL = resp.data.executeSQLList;
          } else {
            this.$message({ type: "info", message: "执行失败" });
          }
        });
      }
      this.modelDetailDialogIsShow = false;
      this.modelDetailModelResultDialogIsShow = true;
    },
    /**
     * sql编辑器模型结果点击导出后出发的方法
     */
    modelResultExport() {
      this.tableData = this.nextValue.result;
      this.json_fields = {};
      for (var i = 0; i < this.nextValue.columnNames.length; i++) {
        this.json_fields[
          this.nextValue.columnNames[i]
        ] = this.nextValue.columnNames[i];
      }
      this.excelName = "模型结果导出表";
    },
    reSet1() {
      this.isLoading = true;
    },
    /**
     *初始化webSocket
     */
    initWebSocket() {
      this.webSocket = this.getWebSocket();
    },
    /**
     *
     * 使用说明：
     * 1、WebSocket客户端通过回调函数来接收服务端消息。例如：webSocket.onmessage
     * 2、WebSocket客户端通过send方法来发送消息给服务端。例如：webSocket.send();
     */
    getWebSocket() {
      const webSocketPath =
        "ws://localhost:8086/analysis/websocket?" +
        this.$store.getters.personuuid;
      // WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
      this.webSocket = new WebSocket(webSocketPath); // 建立与服务端的连接
      // 当服务端打开连接
      this.webSocket.onopen = function (event) {};
      // 发送消息
      this.webSocket.onmessage = function (event) {
        const dataObj = JSON.parse(event.data);
        func1(dataObj);
      };
      const func2 = function func3(val) {
        this.$refs.childTabsRef.loadTableData(val);
      };
      const func1 = func2.bind(this);
      this.webSocket.onclose = function (event) {};

      // 通信失败
      this.webSocket.onerror = function (event) {};
    },
  },
};
</script>
<style scoped>
.itxst {
  margin: 10px;
  text-align: left;
}
</style>
