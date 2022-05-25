<template>
  <!-- childTabCon.vue是子页签中内容的通用组件 -->
  <div class="itxst">
    <el-dialog title="查询条件设置" :visible.sync="dialogVisible" width="50%">
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
    <el-row>
      <div align="right">
        <el-button
          :disabled="modelRunResultBtnIson.exportBtn"
          type="primary"
          @click="exportExcel"
          class="oper-btn export"
        ></el-button>
        <el-button
          :disabled="modelRunResultBtnIson.chartDisplayBtn"
          type="primary"
          class="oper-btn chart btn-width-md"
          @click="chartShowIsSee = true"
        ></el-button>
        <el-button
          :disabled="false"
          type="primary"
          size="small"
          @click="handleResult"
          class="oper-btn processing"
        ></el-button>
        <!-- @查询关联@ -->
        <el-button
          class="oper-btn linkdetail btn-width-md"
          :disabled="modelRunResultBtnIson.modelDetailAssBtn"
          type="primary"
          @click="openModelDetail"
        />
      </div>
    </el-row>
    <ag-grid-vue
      ref="agGridVue"
      v-if="isSee"
      v-loading="isLoading"
      :style="
        useType == 'modelRunResult' || useType == 'modelPreview'
          ? 'height:490px'
          : 'height:300px'
      "
      class="table ag-theme-balham"
      :column-defs="columnDefs"
      :row-data="rowData"
      :enable-col-resize="true"
      row-selection="multiple"
      :get-row-style="this.renderTable"
      @cellClicked="onCellClicked"
      @gridReady="onGridReady"
      @rowSelected="rowChange"
      @cellEditingStopped="agGridUpdateEvent"
      :localeText="localeText"
      @firstDataRendered="autoSizeAll(false)"
    />
    <el-card v-if="!isSee" class="box-card" style="height: 100px">
      <div>{{ errorMessage }}</div>
    </el-card>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="pageQuery.pageNo"
      :limit.sync="pageQuery.pageSize"
      :pageSizes="[200, 400, 800, 1000]"
      @pagination="initData(nowSql)"
    />
    <el-row>
      <el-col :span="22">
        <div v-if="modelResultPageIsSee">
          共<span class="paging-z">{{ rowData.length }}</span
          >条
        </div>
      </el-col>
      <el-col :span="2">
        <el-row v-if="modelResultButtonIsShow" style="display: flex">
          <!-- 2.1前台导出，双向绑定数据 -->
          <downloadExcel
            :data="tableData"
            :fields="json_fields"
            :name="excelName"
            class="thechard-z"
          >
            <el-button
              type="primary"
              @click="modelResultExport"
              class="oper-btn export"
            ></el-button>
          </downloadExcel>
          <el-button
            type="primary"
            class="oper-btn chart btn-width-md"
            @click="chartShowIsSee = true"
          ></el-button>
        </el-row>
      </el-col>
    </el-row>
    <!-- modelResultPageIsSee -->
    <el-dialog
      title="模型详细关联"
      :visible.sync="modelDetailDialogIsShow"
      width="30%"
    >
      <div align="center">
        <el-select v-model="value">
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
    <el-dialog
      title="提示"
      :visible.sync="chartShowIsSee"
      width="90%"
      :fullscreen="true"
      :append-to-body="true"
    >
      <mtEditor :data="result" v-if="chartShowIsSee"></mtEditor>
      <span slot="footer" class="dialog-footer">
        <el-button @click="chartShowIsSee = false">取 消</el-button>
        <el-button type="primary" @click="chartShowIsSee = false"
          >确 定</el-button
        ></span
      >
    </el-dialog>
    <el-dialog
      title="请处理"
      :visible.sync="handleIdeaDialog"
      width="30%"
      :append-to-body="true"
    >
      <div ref="basicInfo">
        <el-form ref="basicInfoForm">
          <el-row>
            <el-col :span="24">
              <el-form-item label="处理状态">
                <el-select
                  style="margin: 5px"
                  v-model="modelResultHandle.handleState"
                >
                  <el-option value="待处理">待处理</el-option>
                  <el-option value="未处理">未处理</el-option>
                  <el-option value="已落实">已落实</el-option>
                  <el-option value="不处理">不处理</el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="处理意见">
                <el-input
                  v-model="modelResultHandle.handleIdea"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入内容"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleIdeaDialog = false">取 消</el-button>
        <el-button type="primary" @click="updateHandleResult()"
          >确 定</el-button
        ></span
      >
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
  batchCoverAddResultDetailProjectRel,
} from "@/api/analysis/auditmodelresult";
import {
  selectTableHandle,
  addOrUpdate,
} from "@/api/analysis/modelresulthandle";
import axios from "axios";
import VueAxios from "vue-axios";
import AV from "leancloud-storage";
import myQueryBuilder from "@/views/analysis/auditmodelresult/myquerybuilder";
import { string } from "jszip/lib/support";
import {
  startExecuteSql,
  getExecuteTask,
} from "@/api/analysis/sqleditor/sqleditor";
import { getTransMap } from "@/api/data/transCode.js";
import mtEditor from "ams-datamax";
// import 'iview/dist/styles/iview.css'

//引入时间格式化方法
import dayjs from "dayjs";

export default {
  name: "childTabCon",
  // 注册draggable组件
  components: {
    AgGridVue,
    Pagination,
    myQueryBuilder,
    childtabscopy,
    downloadExcel: JsonExcel,
    mtEditor,
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
  props: [
    "modelTitle",
    "nowtable",
    "modelUuid",
    "useType",
    "prePersonalVal",
    "resultSpiltObjects",
    "projectUuid",
    "modelType"
  ],
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
      //aggrid搜索
      key: "",
      total: 0,
      // 用来判断主表界面有按钮，辅表界面没有按钮，为true是主表，为false是辅表
      myFlag: false,
      //用于存放多选框选中的数据
      selectRows: [],
      //存放关联详细表
      detailTable: [],
      //agrid汉化
      localeText: {
        // for filter panel
        page: "页",
        more: "更多",
        to: "到",
        /* of: 'daOf', */
        next: "下一页",
        last: "最后",
        first: "第一",
        previous: "以前的",
        loadingOoo: "加载中...",
        // Row:"行",
        rowGroups: "行分组",
        // for set filter
        selectAll: "全部选择",
        searchOoo: "搜索...",
        blanks: "空",
        Column: "列",
        labels: "标签",
        // for number filter and text filter
        filterOoo: "过滤",
        applyFilter: "过滤中...",
        equals: "等于",
        notEqual: "不等于",
        // for number filter
        lessThan: "少于",
        greaterThan: "多于",
        lessThanOrEqual: "小于等于",
        greaterThanOrEqual: "大于等于",
        inRange: "在范围内",
        // for text filter
        contains: "包含",
        notContains: "不包含",
        startsWith: "开始",
        endsWith: "结束",
        // filter conditions
        andCondition: "并且",
        orCondition: "或者",
        // the header of the default group column
        // group: '分组',
        // tool panel
        columns: "列",
        filters: "过滤器",
        rowGroupColumns: "行分组",
        rowGroupColumnsEmptyMessage: "拖拽设置行分组",
        valueColumns: "列值",
        pivotMode: "透视模式",
        groups: "行列组",
        values: "值",
        pivots: "列标签",
        valueColumnsEmptyMessage: "拖拽进行聚合",
        pivotColumnsEmptyMessage: "拖拽设置列标签",
        toolPanelButton: "工具按钮",
        // other
        noRowsToShow: "暂时没有要展示的数据",
        // enterprise menu
        pinColumn: "列位置调整",
        valueAggregation: "聚合值",
        autosizeThiscolumn: "自动调整此列大小",
        autosizeAllColumns: "自动调整所有列的大小",
        groupBy: "分组",
        ungroupBy: "取消分组",
        resetColumns: "重置列",
        expandAll: "展开所有",
        collapseAll: "关闭所有",
        toolPanel: "工具",
        export: "导出",
        csvExport: "CSV 导出",
        excelExport: "Excel 导出(.xlsx)",
        excelXmlExport: "Excel 导出(.xml)",
        // enterprise menu pinning
        PinColumn: "固定",
        pinLeft: "居左",
        pinRight: "居右",
        noPin: "默认",
        // enterprise menu aggregation and status bar
        sum: "合计",
        min: "最小值",
        max: "最大值",
        /* none: 'laNone', */
        count: "计数",
        average: "平均值",
        avg: "平均值",
        // standard menu
        copy: "复制",
        copyWithHeaders: "携表头复制",
        ctrlC: "ctrl-C",
        paste: "粘贴",
        ctrlV: "ctrl-V",
      },
      //模型结果处理对象
      modelResultHandle: {
        handleState: "",
        handleIdea: "",
      },
      // 保存每个表中的主键，因为每个表的主键都不一样，所以得根据表明查出来
      primaryKey: "",
      // 保存当前表格中的数据
      dataArray: [],
      // 保存列信息，用来传给子组件(queryBuilder组件)
      queryData: [],
      // 用来储存由子组件传过来的 queryBuilder 的 Json数据
      queryJson: {},
      // 存放模型运行结果需要渲染的数据
      conditionShowData: [],
      //给agrrid加遮罩
      isLoading: true,
      //处理意见dialog
      handleIdeaDialog: false,
      // 存放模型结果后传进来的值
      nextValue: [],
      // 用来存放模型结果数据
      modelResultData: [],
      // 用来存放模型结果的列名
      modelResultColumnNames: [],
      // 模型结果前台分页的total属性
      total1: null,
      // 当输入sql错误和结果集为0的时候不显示aggrid表格
      isSee: true,
      // 存放模型结果错误消息
      errorMessage: "",
      // 模型结果分页是否可见
      modelResultPageIsSee: false,
      // 模型结果按钮是否可见
      modelResultButtonIsShow: false,
      // 存放模型详细关联表
      modelDetailRelation: [],
      // 存放模型结果输出列
      modelOutputColumn: [],
      // 模型详细关联按钮是否可见
      modelDetailButtonIsShow: false,
      // 点击模型详细关联按钮后弹出的Dialog是否可见
      modelDetailDialogIsShow: false,
      //存放模型详细关联dialog中下拉框的值
      options: [],
      //模型详细关联dialog中下拉框选中的值
      value: "",
      // 存放导出的数据（sql编辑器模型结果界面）
      tableData: [],
      // 导出后excle的名称（sql编辑器模型结果界面）
      excelName: "",
      // 导出表的列名（sql编辑器模型结果界面）
      json_fields: {},
      //点击模型详细dialog确定按钮后执行显示模型详细结果弹窗是否可见
      modelDetailModelResultDialogIsShow: false,
      //模型详细关联dialog中点击确定按钮后根据sql返回的预先加载值，用于判断有几个页签
      currentExecuteSQL: [],
      //websocket对象
      webSocket: null,
      //存储返回的数据转码对象
      dataCoding: {},
      //存储当前querybuilder中的sql
      nowSql: "undefined",
      modelRunResultBtnIson: {
        exportBtn: false,
        chartDisplayBtn: false,
        associatedBtn: true,
        disassociateBtn: false,
        modelDetailAssBtn: true,
      },
      dynamicSelect: [], //实时存储多选框勾选中的数据
      chartShowIsSee: false,
      result: {},
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
        this.modelRunResultBtnIson.modelDetailAssBtn = true;
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
        //模型运行结果表日期使用当前日期
        link.setAttribute(
          "download",
          this.modelTitle +
            "(" +
            dayjs(new Date()).format("YYYY年MM月DD日hhmmss") +
            ")" +
            ".xls"
        );
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
      // this.gridApi.sizeColumnsToFit();
    },
    //自动宽度
    autoSizeAll(skipHeader) {
      // var allColumnIds = [];
      // this.columnApi.getAllColumns().forEach(function (column) {
      //   allColumnIds.push(column.colId);
      // });
      // this.columnApi.autoSizeColumns(allColumnIds, skipHeader);
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
        selectTableHandle(this.pageQuery, sql, this.projectUuid).then(
          (resp) => {
            var column = resp.data.records[0].columns;
            this.result.column = column;
            var chartData = [];
            for (var i = 0; i < resp.data.records[0].result.length; i++) {
              var eachChartData = [];
              for (var j = 0; j < column.length; j++) {
                eachChartData.push(resp.data.records[0].result[i][column[j]]);
              }
              chartData.push(eachChartData);
            }
            this.result.data = chartData;
            var columnInfo = resp.data.records[0].columnInfo.columnList;
            var columnType = [];
            for (var i = 0; i < columnInfo.length; i++) {
              //number,varchar,time,float
              var type = "";
              if (
                columnInfo[i].columnType.toUpperCase().indexOf("VARCHAR") != -1
              ) {
                type = "varchar";
              } else if (
                columnInfo[i].columnType.toUpperCase().indexOf("NUMBER") != -1
              ) {
                type = "number";
              } else if (
                columnInfo[i].columnType.toUpperCase().indexOf("TIMESTAMP") !=
                -1
              ) {
                type = "time";
              } else if (
                columnInfo[i].columnType.toUpperCase().indexOf("FLOAT") != -1
              ) {
                type = "float";
              } else {
                type = "varchar";
              }
              columnType.push(type);
            }
            this.result.columnType = columnType;
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
              col.push({
                headerName: "",
                field: "",
                checkboxSelection: true,
                width: 40,
              });
              col.push({
                headerName: "详细主键",
                field: "onlyuuid",
                hide: true,
              });
              col.push({
                headerName: "处理时间",
                field: "handle_time",
                valueFormatter: this.formatDate,
                filter: true,
              });
              col.push({
                headerName: "处理人编号",
                field: "handle_person_uuid",
                hide: true,
              });
              col.push({
                headerName: "处理人名称",
                field: "handle_person_name",
                filter: true,
              });
              col.push({
                headerName: "处理状态",
                editable: true,
                field: "handle_state",
                cellEditor: "agSelectCellEditor", //编辑时 显示下拉列表**************
                cellEditorParams: {
                  values: ["待处理", "未处理", "已落实", "不处理"],
                },
                filter: true,
              });
              col.push({
                headerName: "模型结果处理主键",
                field: "model_result_handle_uuid",
                hide: true,
              });
              col.push({
                headerName: "运行任务关联主键",
                field: "run_task_rel_uuid",
                hide: true,
              });
              col.push({
                headerName: "模型结果表名",
                field: "model_result_table_name",
                hide: true,
              });
              col.push({
                headerName: "处理意见",
                field: "handle_idea",
                cellEditor: "agLargeTextCellEditor", //编辑时 显示长文本框**************
                editable: true,
                cellEditorParams: {
                  maxLength: "300",
                  cols: "50",
                  rows: "6",
                },
                filter: true,
              });
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
                        };
                      } else {
                        var rowColom = {
                          headerName: this.modelOutputColumn[j].columnAlias,
                          field: colNames[i],
                          filter: true,
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
                          filter: true,
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
                    filter: true,
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
                      this.modelOutputColumn[
                        k
                      ].outputColumnName.replaceAll('\"','').toLowerCase() == colNames[j].replaceAll('\"','')
                    ) {
                      if (this.modelOutputColumn[k].dataCoding != undefined) {
                        var a = da[i][colNames[j]];
                        da[i][colNames[j]] =
                          this.dataCoding[this.modelOutputColumn[k].dataCoding][
                            a
                          ];
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
          }
        );
        this.columnDefs = col;
        this.rowData = da;
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
                params.data[this.primaryKey.toLowerCase()] ==
                this.conditionShowData[0][i][j]
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
            selectPrimaryKeyByTableName().then((resp) => {
              this.primaryKey = resp.data;
              selectModel(this.modelUuid).then((resp) => {
                this.modelDetailRelation = resp.data.modelDetailRelation;
                //大亚湾不启用modelOutputColumn
                // this.modelOutputColumn = resp.data.modelOutputColumn;
                this.modelOutputColumn = []
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
            });
          });
        } else {
          this.initData();
        }
      }
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
      let replist = [];
      $(".el-tabs__item").each(function (e) {
        let repstr = $(this).attr("id").slice(4, $(this).attr("id").length);
        replist.push(repstr);
      });
      for (let i = 0; i < replist.length; i++) {
        if (value == replist[i]) {
          this.$message("该模型已打开");
          return;
        }
      }
      var selectRowData = this.gridApi.getSelectedRows();
      var relationType = null;
      var objectName = "";
      var detailConfig = null;
      for (var i = 0; i < this.modelDetailRelation.length; i++) {
        if (this.value == this.modelDetailRelation[i].relationObjectUuid) {
          relationType = this.modelDetailRelation[i].relationType;
          objectName = this.modelDetailRelation[i].relationObjectName;
          detailConfig = this.modelDetailRelation[i].modelDetailConfig;
          break;
        }
      }
      if (relationType == 1) {
        var detailValue = [];
        for (var i = 0; i < this.modelDetailRelation.length; i++) {
          if (this.modelDetailRelation[i].relationObjectUuid == this.value) {
            for (
              var j = 0;
              j < this.modelDetailRelation[i].modelDetailConfig.length;
              j++
            ) {
              var key =
                this.modelDetailRelation[i].modelDetailConfig[j].resultColumn;
              var obj = { moduleParamId: "", paramValue: "" };
              obj.moduleParamId =
                this.modelDetailRelation[i].modelDetailConfig[j].ammParamUuid;
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
            const obj = { sqls: sql, businessField: "modelresultdetail", modelType: this.getModelType(this.modelType) };
            getExecuteTask(obj)
              .then((resp) => {
                this.currentExecuteSQL = resp.data.executeSQLList;
                //界面渲染完成之后开始执行sql,将sql送入调度
                startExecuteSql(resp.data).then((result) => {});
              })
              .catch((result) => {
                this.$message({ type: "info", message: "执行失败" });
              });
            // startExecuteSql(obj).then((resp) => {
            //   if (!resp.data.isError) {
            //     this.currentExecuteSQL = resp.data.executeSQLList;
            //   } else {
            //     this.$message({ type: "info", message: "执行失败" });
            //   }
            // });
          });
        });
      } else if (relationType == 2) {
        //modelOutputColumn
        var sql = "SELECT * FROM " + objectName + " WHERE ";
        var filterSql = "";
        for (var i = 0; i < detailConfig.length; i++) {
          var eachFilter = detailConfig[i].relFilterValue;
          loop: for (var j = 0; j < this.modelOutputColumn.length; j++) {
            if (
              eachFilter.indexOf(this.modelOutputColumn[j].outputColumnName) >
              -1
            ) {
              eachFilter = eachFilter.replace(
                this.modelOutputColumn[j].outputColumnName,
                selectRowData[0][
                  this.modelOutputColumn[j].outputColumnName.toLowerCase()
                ]
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
        const obj = { sqls: sql, businessField: "modelresultdetail", modelType: this.getModelType(this.modelType) };
        getExecuteTask(obj)
          .then((resp) => {
            this.currentExecuteSQL = resp.data.executeSQLList;
            //界面渲染完成之后开始执行sql,将sql送入调度
            startExecuteSql(resp.data).then((result) => {});
          })
          .catch((result) => {
            this.$message({ type: "info", message: "执行失败" });
          });
        // startExecuteSql(obj).then((resp) => {
        //   if (!resp.data.isError) {
        //     this.currentExecuteSQL = resp.data.executeSQLList;
        //   } else {
        //     this.$message({ type: "info", message: "执行失败" });
        //   }
        // });
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
        this.json_fields[this.nextValue.columnNames[i]] =
          this.nextValue.columnNames[i];
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
        this.AmsWebsocket.getWSBaseUrl(this.AmsModules.ANALYSIS) +
        this.$store.getters.personuuid +
        "modelresultdetail";
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
    /**
     * aggrid单元格修改事件
     * @param event 事件
     */
    agGridUpdateEvent(event) {
      let data = this.handleSelectRowData(event.data);
      //修改或添加处理意见等信息
      addOrUpdate(data).then((result) => {
        //给数据重新赋值并刷新表格
        if (!result.data.isError) {
          this.$message({ type: "error", message: "修改信息失败!" });
          return;
        }
        let modelResultHandle = result.data.modelResultHandle;
        event.data.handle_time = modelResultHandle.handleTime;
        event.data.handle_person_uuid = modelResultHandle.handlePersonUuid;
        event.data.handle_person_name = modelResultHandle.handlePersonName;
        event.data.model_result_handle_uuid =
          modelResultHandle.modelResultHandleUuid;
        event.data.run_task_rel_uuid = modelResultHandle.runTaskRelUuid;
        event.data.model_result_table_name =
          modelResultHandle.modelResultTableName;
        this.rowData[event.rowIndex] = event.data;
        this.gridApi.refreshCells();
      });
    },
    /**
     * 选中的数据行
     * @param data 数据行
     */
    handleSelectRowData(data) {
      let dataObj = {
        modelResultHandleUuid: data.model_result_handle_uuid,
        runTaskRelUuid: this.nowtable.runTaskRelUuid,
        modelResultDetailUuid: data.onlyuuid,
        handleState: data.handle_state,
        handleIdea: data.handle_idea,
        modelResultTableName: this.nowtable.resultTableName,
      };
      return dataObj;
    },
    /**
     * 格式化时间字符串
     * @param date 时间
     * @returns {string}
     */
    formatDate(date) {
      date = date.value;
      if (!date) {
        return "-";
      }
      if (date === "无") {
        return date;
      }
      var date2 = new Date(date);
      var year = date2.getFullYear();
      var month = date2.getMonth() + 1;
      var day = date2.getDate();
      var hours = date2.getHours();
      var minutes = date2.getMinutes();
      var second = date2.getSeconds();
      if (month.toString().length == 1) {
        month = "0" + month;
      }
      if (day.toString().length == 1) {
        day = "0" + day;
      }
      if (hours.toString().length == 1) {
        hours = "0" + hours;
      }
      if (minutes.toString().length == 1) {
        minutes = "0" + minutes;
      }
      if (second.toString().length == 1) {
        second = "0" + second;
      }
      var d =
        year +
        "-" +
        month +
        "-" +
        day +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        second;
      return d;
    },
    /**
     *处理结果
     */
    handleResult() {
      let selRows = this.gridApi.getSelectedRows();
      if (selRows == null || selRows.length <= 0) {
        this.$message({ type: "info", message: "请选择要处理的数据!" });
        return;
      }
      this.handleIdeaDialog = true;
    },
    /**
     * 修改处理结果
     */
    updateHandleResult() {
      let selRows = this.gridApi.getSelectedRows();
      for (let i = 0; i < selRows.length; i++) {
        selRows[i].handle_idea = this.modelResultHandle.handleIdea;
        selRows[i].handle_state = this.modelResultHandle.handleState;
        let data = this.handleSelectRowData(selRows[i]);
        addOrUpdate(data).then((result) => {
          //给数据重新赋值并刷新表格
          if (!result.data.isError) {
            this.$message({ type: "error", message: "修改信息失败!" });
            return;
          }
          let modelResultHandle = result.data.modelResultHandle;
          selRows[i].handle_time = modelResultHandle.handleTime;
          selRows[i].handle_person_uuid = modelResultHandle.handlePersonUuid;
          selRows[i].handle_person_name = modelResultHandle.handlePersonName;
          selRows[i].model_result_handle_uuid =
            modelResultHandle.modelResultHandleUuid;
          selRows[i].run_task_rel_uuid = modelResultHandle.runTaskRelUuid;
          selRows[i].model_result_table_name =
            modelResultHandle.modelResultTableName;
          this.gridApi.refreshCells();
        });
      }
      this.handleIdeaDialog = false;
      this.modelResultHandle.handleIdea = "";
      this.modelResultHandle.handleState = "";
    },
    externalFilterChanged(newValue) {
      const newArr = [];
      this.gridApi.onFilterChanged();
      const keys = this.key;
      if (keys !== "") {
        // 这里是循环遍历把搜索框中内容同表格数据对比，
        // 包含的化重新组成数据赋值给tableList
        this.tableList.forEach((element) => {
          if (element.UploadTime.includes(keys)) {
            newArr.push(element);
            this.tableList = newArr;
          }
        });
        // 不包含就重新获取
      } else {
        return this.getData();
      }
    },
    getModelType (name) {
      if(name == 'SQL模型') {
        return 'sql'
      } else if (name == '图形化模型') {
        return 'graph'
      } else {
        return name
      }
    },
  },
};
</script>
<style scoped>
.itxst {
  margin: 10px;
  text-align: left;
}

.thechard-z {
  margin-right: 20px;
}

.paging-z {
  font-weight: bold;
  color: rgb(52, 57, 66);
  margin: 0 5px;
  font-size: 16px;
  line-height: 16px;
}
</style>
<style>
.ag-theme-balham .ag-header-cell-label{
  justify-content: center;
}
</style>
