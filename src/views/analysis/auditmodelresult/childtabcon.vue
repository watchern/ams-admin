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
    <el-row style="margin-right: 35px;">
      <div :class="chartClass" title="图表" @click="switchDivStyle('chart')"><span class="icon iconfont" >&#xecee;</span></div>
      <div :class="tableClass" title="表格" @click="switchDivStyle('table')"><span class="icon iconfont" >&#xe6d8;</span></div>
    </el-row>
    <el-row v-if="chartSwitching" style="position:relative">
      <el-row v-if="myFlag">
        <div align="right">
          <el-button
            type="primary"
            class="oper-btn refresh"
            :disabled="modelRunResultBtnIson.associatedBtn"
            @click="openProjectDialog"
            title="分配项目"
          ></el-button>
          <el-button
            :disabled="modelRunResultBtnIson.disassociateBtn"
            type="primary"
            class="oper-btn move"
            @click="removeRelated()"
            title="移除分配项目"
          ></el-button
          >
<!--          <el-button-->
<!--            :disabled="modelRunResultBtnIson.chartDisplayBtn"-->
<!--            type="primary"-->
<!--            class="oper-btn chart"-->
<!--            @click="chartShowIsSee = true"-->
<!--            title="图表展示"-->
<!--          ></el-button>-->
          <el-button
            :disabled="false"
            type="primary"
            @click="queryConditionSetting"
            class="oper-btn search"
            title="查询设置"
          ></el-button>
          <el-button
            :disabled="false"
            type="primary"
            @click="reSet"
            class="oper-btn again-2"
            title="重置"
          ></el-button>
          <el-button
            class="oper-btn link"
            :disabled="modelRunResultBtnIson.modelDetailAssBtn"
            v-if="modelDetailButtonIsShow"
            type="primary"
            @click="openModelDetail"
            title="查询关联"
          ></el-button>
          <el-button
            :disabled="modelRunResultBtnIson.exportBtn"
            type="primary"
            @click="exportExcel"
            class="oper-btn export-2"
            title="导出"
          ></el-button>
          <!-- addDetailRel('qwer1', '项目11') -->
        </div>
      </el-row>

      <ag-grid-vue
        v-if="isSee"
        v-loading="isLoading"
        :style="this.useType==='sqlEditor'?'height:32vh':'height:59vh'"
        class="table ag-theme-balham"
        :column-defs="columnDefs"
        :row-data="rowData"
        rowMultiSelectWithClick="true"
        :enable-col-resize="true"
        :get-row-style="useType=='modelRunResult'?this.renderTable:undefined"
        row-selection="multiple"
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
      <el-row>
        <el-col :span="22">
          <div v-if="modelResultPageIsSee">
            共<span class="paging-z" title="只显示前10000条数据">{{ rowData.length }}</span
            >条
          </div>
        </el-col>
        <el-col :span="2">
          <el-row v-if="modelResultButtonIsShow" style="display: flex">
            <downloadExcel
              :data="tableData"
              :fields="json_fields"
              :name="excelName"
              class="thechard-z"
              v-if="this.preLength==this.myIndex+1 && this.useType!=='sqlEditor'"
            >
              <el-button
                type="primary"
                @click="modelResultExport"
                class="oper-btn export-2"
                title="导出"
              ></el-button>
            </downloadExcel>
          </el-row>
        </el-col>
      </el-row>
    </el-row>
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
    ><div v-if="chartShowIsSee">
      <mtEditor
        ref="chart"
        :data="result"
        :chart-config="nowChartJson"
        :key="chartPreview"
      ></mtEditor>
         </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="chartShowIsSee = false">取 消</el-button>
        <el-button
          v-if="useType == 'sqlEditor' ||  useType == 'modelRunResult'? true: false"
          type="primary"
          @click="chartSaveOrUpdate=='save'?saveChart():updateChart()"
          >保 存</el-button
        >
      </span>
    </el-dialog>
            <el-dialog
          title="请选择项目"
          :visible.sync="projectDialogIsSee"
          width="40%"
        >
          <userProject
            v-if="projectDialogIsSee"
            ref="userproject"
          ></userProject>
          <span slot="footer" class="dialog-footer">
            <el-button @click="projectDialogIsSee = false">取 消</el-button>
            <el-button type="primary" @click="determineProject"
              >确 定</el-button
            >
          </span>
        </el-dialog>
    <el-row v-if="!chartSwitching">
      <div align="right" v-if="this.preLength==this.myIndex+1||myFlag">
        <div class="smallImgs">
          <div align="right">
            <a
              v-if="(useType=='sqlEditor'||myFlag) && !chartSwitching"
              @click="openChartDialog"
              title="添加图表"
              style="margin: 10px 6px 10px 0;float: right"
            >添加</a>
          </div>
          <img v-for="(item,key) in chartConfigs" :src="item.dataUrl" class="chartSwitching" @click="changeChart(item.id)" :key="key"/>
        </div>
        <div v-if="!isHaveCharts && !afterAddChartsWithNoConfigure">
        <img
          src="./imgs/change.png"
          v-if="useType=='sqlEditor'||myFlag"
          type="primary"
          @click="openEditChartDialog"
          class="change-pos"
          title="修改图表"
        />
        <img
          src="./imgs/deletein.png"
          v-if="useType=='sqlEditor'||myFlag"
          type="primary"
          @click="deleteChart"
          class="delete-pos"
          title="删除图表"
        />
        </div>
      </div>
    <div style="height: 450px;" v-if="this.preLength==this.myIndex+1||myFlag">
      <div align='center' style='font-weight:lighter ;font-size:15px' v-if="afterAddChartsWithNoConfigure">请选择图表</div>
      <div align='center' style='font-weight:lighter ;font-size:15px' v-if="isHaveCharts">暂无图表</div>
      <div v-if="afterResult" style="height: 350px;">
      <mtEditor v-loading="chartLoading" :key="chartPreview" ref='chart1' :data='result' :chart-config='nowChartJson' :preview="true"></mtEditor>
      </div>
    </div>
  </el-row>
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
import userProject from "@/views/base/userproject/index";
import {handleDataSingleValue,handleDataManyValue} from '@/api/analysis/thresholdvalue'
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
  addModelChartSetup,
  getModelChartSetup,
  updateModelChartSetup,
  deleteModelChartSetup,
  sendToOA,
  getResultRelProject
} from "@/api/analysis/auditmodelresult";
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
import "iview/dist/styles/iview.css";
import {uuid2} from "@/api/analysis/auditmodel";

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
    userProject
  },
  watch: {
    modelDetailModelResultDialogIsShow(value) {
      this.$nextTick(function () {
        if (value) {
          this.initWebSocket();
        }
      });
    },
    nowChartJson () {
        this.chartPreview = !this.chartPreview
      }
  },
  /**
   * 模型运行结果使用变量：nowtable：表示模型结果表对象   modelUuid：根据modelUUid进行表格渲染，只有主表用渲染  useType=modelRunResult 表示是模型运行结果所用
   * sql编辑器模型结果使用变量：useType=sqlEditor 表示是sql编辑器模型结果所用  prePersonalVal：每一个prePersonalVal对应一个childtabcon组件，后续会触发父组件chidltabs中的loadTableData方法来根据prePersonalVal进行aggrid数据的展现
   */
  props: [
    "nowtable",
    "modelUuid",
    "useType",
    "prePersonalVal",
    "resultSpiltObjects",
    "modelId",
    "preLength",
    "myIndex",
    "chartModelUuid",
    "settingInfo"
  ],
  data() {
    return {
      chartPreview: true,
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
      imgBaseCode:'',
      myFlag: false, // 用来判断主表界面有按钮，辅表界面没有按钮，为true是主表，为false是辅表
      selectRows: [], //用于存放多选框选中的数据
      detailTable: [], //存放关联详细表
      dataArray: [], // 保存当前表格中的数据
      queryData: [], // 保存列信息，用来传给子组件(queryBuilder组件)
      queryJson: {}, // 用来储存由子组件传过来的 queryBuilder 的 Json数据
      primaryKey: "", // 存放模型运行结果主键
      isLoading: true, //给agrrid加遮罩
      nextValue: [], // 存放模型结果后传进来的值
      modelResultData: [], // 用来存放模型结果数据
      modelResultColumnNames: [], // 用来存放模型结果的列名
      total1: null, // 模型结果前台分页的total属性
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
      chartShowIsSee: false,
      result: {},   //给myeditor传的数据
      chartSaveOrUpdate: "", //判断图标是保存还是更新操作
      nowChartJson: undefined, //存储当前正在显示的图表的json
      modelChartSetups:[],  //用于存储添加的多个图标，用于图表返显功能
      chartConfigs:[],   //用于存储当前模型的图表config   （myeditor组件的chart-config属性）chartConfigs
      afterResult:false,  //等result数据赋值完以后再初始化返显的charts组件
      chartLoading:true,  //图表加载的loading
      afterAddChartsWithNoConfigure:false,
      isHaveCharts:false, //判断该模型是否有图表
      projectDialogIsSee:false,   //用来控制项目dialog显示
      chartSwitching: true,  //控制表格与图表切换
      modelObj:{},  //查询当前模型结果对应的的model对象
      rowIndex:'',  //存储点击表格的行数
      tableClass:'el-btn-no-color',
      chartClass:'el-btn-color'
    };
  },
  mounted() {
    this.getRenderTableData();
    this.chartReflexion();
  },
  created() {
    let _this=this;
    window.openModelDetailNew=_this.openModelDetailNew;
  },
  methods: {
    switchDivStyle(type){
      if (type === 'table'){
        this.chartSwitching = false
        this.tableClass = 'el-btn-color'
        this.chartClass = 'el-btn-no-color'
      }else if(type === 'chart'){
        this.chartSwitching = true
        this.tableClass = 'el-btn-no-color'
        this.chartClass = 'el-btn-color'
      }
    },
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
     * 移除关联方法
     * resultDetailProjectRelId:  resultDetailProjectRel表的主键
     */
    removeRelated() {
      this.getValues()
      var onlyuuids = []
      for(var i = 0;i<this.selectRows.length;i++){
        onlyuuids.push(this.selectRows[i].onlyuuid)
      }
      var resultDetailProjectRelIds = onlyuuids.join(',')
      removeResultDetailProjectRel(resultDetailProjectRelIds).then((resp) => {
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
    openProjectDialog(){
            getResultRelProject(this.nowtable.runTaskRelUuid).then(resp=>{
        if(resp.data.length==0){
          this.projectDialogIsSee = true;
       }else{
          this.$message({
            message: "模型结果已经关联项目，详细结果就不能再关联",
          });
        }
      })
    },
        /**
     * 选择项目后点击dialog的确定按钮触发
     */
    determineProject() {
      var projects = this.$refs.userproject.getSelectValue();
        if (projects.length === 0) {
          this.$message({
            message: "请选择要关联的项目",
          });
        } else if (projects.length === 1) {
          this.addDetailRel(
            projects[0].PRJ_PROJECT_UUID,
            projects[0].PRJ_NAME
          );
          this.projectDialogIsSee = false;
        } else {
          this.$message({
            message: "只能关联一个项目",
          });
        }
    },
    /**
     * 关联项目
     */
    addDetailRel(projectId, projctName) {
      this.getValues();
      selectByRunResultTableUUid(this.nowtable.runResultTableUuid).then(
        (resp) => {
          this.detailTable = resp.data;
          var resultDetailProjectRels = [];
          if (resp.data.length == 0) {
            // 根据当前运行结果表查看运行结果详细与项目关联表里有没有值，如果没有值则直接关联
            selectPrimaryKeyByTableName().then((resp) => {
              this.primaryKey = resp.data;
              for (var i = 0; i < this.selectRows.length; i++) {
                var resultDetailProjectRel = {
                  resultDetailProjectRelId: "",
                  runResultTableUuid: this.nowtable.runResultTableUuid,
                  runTaskRelUuid: this.nowtable.runTaskRelUuid,
                  projectId: projectId,
                  resultDetailId: this.selectRows[i][
                    this.primaryKey.toLowerCase()
                  ],
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
            });
          } else {
            // 根据当前运行结果表查看运行结果详细与项目关联表里有没有值，如果有值则要判断是否关联过该主键，如果添加过就不能重复关联
            var resultDetailProjectRels = [];
            var related = [];
            selectPrimaryKeyByTableName().then((resp) => {
              this.primaryKey = resp.data;
              for (var i = 0; i < this.selectRows.length; i++) {
                for (var j = 0; j < this.detailTable.length; j++) {
                  if (
                    this.selectRows[i][this.primaryKey.toLowerCase()] ==
                    this.detailTable[j].resultDetailId
                  ) {
                    related.push(
                      this.selectRows[i][this.primaryKey.toLowerCase()]
                    );
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
                    resultDetailId: this.selectRows[i][
                      this.primaryKey.toLowerCase()
                    ],
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
                var resultDetailProjectRels1 = [];
                for (var i = 0; i < this.selectRows.length; i++) {
                  var resultDetailProjectRel = {
                    resultDetailProjectRelId: "",
                    runResultTableUuid: this.nowtable.runResultTableUuid,
                    runTaskRelUuid: this.nowtable.runTaskRelUuid,
                    projectId: projectId,
                    resultDetailId: this.selectRows[i][
                      this.primaryKey.toLowerCase()
                    ],
                    projectName: projctName,
                  };
                  resultDetailProjectRels1.push(resultDetailProjectRel);
                }
                batchCoverAddResultDetailProjectRel(
                  resultDetailProjectRels1
                ).then((resp) => {
                  if (resp.data == true) {
                    var str = "";
                    for (var i = 0; i < related.length; i++) {
                      if (i != related.length - 1) {
                        str += related[i] + " , ";
                      } else {
                        str += related[i];
                      }
                    }
                    this.$message({
                      type: "success",
                      message:
                        "关联成功！ 其中 " +
                        str +
                        " 为主键的结果以前关联的项目被覆盖",
                    });
                  } else {
                    this.$message({
                      type: "error",
                      message: "关联失败!",
                    });
                  }
                });
              }
            });
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
    },
    initData(sql, nextValue,modelName) {
      this.result = {}
      if (this.useType == "modelRunResult") {
        this.isLoading = true;
        // 当当前表是主表的时候myFlag赋值为true
        if (this.nowtable.tableType == 1) {
          this.myFlag = true;
        }else{
          this.chartLoading = false
        }
        var colNames = [];
        var col = [];
        var da = [];
        var renderColumns = [] //存储需要渲染的列名
        var renderObject = {}  //存储key-value格式对象，key为列名  value为这一列对应的模型阈值关联对象
        //2021年2月4日 16:35:28   新增给带详细的模型结果列增加超链接样式
        let modelResultDetailCol = []
        if(this.modelObj.modelDetailRelation){
          //循环模型详细关联
          for(let i = 0; i < this.modelObj.modelDetailRelation.length;i++){
            //获取关联对象
            let modelDetailRelation = this.modelObj.modelDetailRelation[i]
            //循环模型关联详细配置
            for(let j = 0;j < modelDetailRelation.modelDetailConfig.length;j++){
              let modelDetailConfig = modelDetailRelation.modelDetailConfig[j]
              //确保数据不是undefined或null
              if(modelDetailConfig.resultColumn){
                //添加到数据 用于下边列处理的时候 作为判断条件
                modelResultDetailCol.push(modelDetailConfig.resultColumn.toUpperCase())
              }
            }
          }
        }
        var modelThresholdValues = []
        if (this.settingInfo!=undefined){
          modelThresholdValues.push(JSON.parse(this.settingInfo).thresholdValueRel)
        }else {
          modelThresholdValues =  this.modelObj.modelThresholdValues
        }
        //循环阈值对象  取出阈值对象里面的列名  用于下边裂处理的时候 作为判断条件
        for (var i = 0; i < modelThresholdValues.length;i++){
          if(modelThresholdValues[i].thresholdValue.thresholdValueType == 2 && renderColumns.indexOf(modelThresholdValues[i].modelResultColumnName)==-1){
            renderColumns.push(modelThresholdValues[i].modelResultColumnName)
          }
        }
        for(var i = 0;i < modelThresholdValues.length;i++){
          if(modelThresholdValues[i].thresholdValue.thresholdValueType == 2){
            if (typeof modelThresholdValues[i].colorInfo === 'string'){
              modelThresholdValues[i].colorInfo = JSON.parse(modelThresholdValues[i].colorInfo)
            }
            renderObject[modelThresholdValues[i].modelResultColumnName] = modelThresholdValues[i]
          }
        }
        this.pageQuery.condition = this.nowtable;
        if (typeof sql !== "string") {
          sql = "undefined";
        }
        selectTable(this.pageQuery, sql, this.resultSpiltObjects).then(
          (resp) => {
            // var modelThre
            var column = resp.data.records[0].columns;
            var columnToUppercase = []
            for(var i = 1;i<column.length;i++){
              columnToUppercase.push(column[i].toUpperCase())
            }
            this.result.column = columnToUppercase;
            this.result.id = this.modelObj.modelUuid
            this.result.name = this.modelObj.modelName
            var chartData = [];
            for (var i = 0; i < resp.data.records[0].result.length; i++) {
              var eachChartData = [];
              for (var j = 1; j < column.length; j++) {
                eachChartData.push(resp.data.records[0].result[i][column[j]]);
              }
              chartData.push(eachChartData);
            }
            this.result.data = chartData;
            var columnInfo = resp.data.records[0].columnInfo.columnList;
            var columnType = [];
            for (var i = 1; i < columnInfo.length; i++) {
              //number,varchar,time,float
              var type = "";
              if (
                columnInfo[i].columnType.toUpperCase().indexOf("VARCHAR") != -1
              ) {
                type = "varchar";
              } else if (
                columnInfo[i].columnType.toUpperCase().indexOf("NUMBER") !=
                  -1 ||
                columnInfo[i].columnType.toUpperCase().indexOf("INT") != -1
              ) {
                type = "number";
              } else if (
                columnInfo[i].columnType.toUpperCase().indexOf("TIMESTAMP") !=
                  -1 ||
                columnInfo[i].columnType.toUpperCase().indexOf("DATE") != -1
              ) {
                type = "time";
              } else if (
                columnInfo[i].columnType.toUpperCase().indexOf("FLOAT") != -1
              ) {
                type = "float";
              }
              columnType.push(type);
            }
            this.result.columnType = columnType;
            this.afterResult = true
            if (resp.data.records[0].result.length == 0) {
              this.isLoading = false;
            }
            this.total = resp.data.total;
            this.dataArray = resp.data.records[0].result;
            this.queryData = resp.data.records[0].columnInfo;
            colNames = resp.data.records[0].columns
            // 生成ag-grid列信息
            if (this.modelUuid != undefined) {
              var onlyFlag = false
              if (this.settingInfo != undefined){
                for (var i = 0; i < colNames.length; i++) {
                      if(onlyFlag==false){
                        var rowColom = {
                          headerName: "onlyuuid",
                          field: "onlyuuid",
                          checkboxSelection: true,
                        };
                        col.push(rowColom);
                        onlyFlag = true
                      }
                        var rowColom = {}
                        if (renderColumns.indexOf(colNames[i].toUpperCase()) != -1 || modelResultDetailCol.indexOf(colNames[i].toUpperCase()) != -1){
                          var thresholdValueRel =  renderObject[colNames[i].toUpperCase()]
                          rowColom =  {
                            headerName: colNames[i],
                            field: colNames[i],
                            cellRenderer:(params) => {return this.changeCellColor(params,thresholdValueRel,modelResultDetailCol)}}
                        }else {
                          rowColom = {
                            headerName: colNames[i],
                            field: colNames[i],
                          };
                        }
                        col.push(rowColom);
                }
              }else {
                for (var i = 0; i < colNames.length; i++) {
                  loop: for (var j = 0; j < this.modelOutputColumn.length; j++) {
                    if (this.modelOutputColumn[j].outputColumnName.toLowerCase() == colNames[i]) {
                      if(onlyFlag==false){
                        var rowColom = {
                          headerName: "onlyuuid",
                          field: "onlyuuid",
                          checkboxSelection: true,
                        };
                        col.push(rowColom);
                        onlyFlag = true
                      }
                      if (this.modelOutputColumn[j].isShow == 1) {
                        var rowColom = {}
                        if (renderColumns.indexOf(colNames[i].toUpperCase()) != -1 || modelResultDetailCol.indexOf(colNames[i].toUpperCase()) != -1){
                          var thresholdValueRel =  renderObject[colNames[i].toUpperCase()]
                          rowColom =  {
                            headerName: this.modelOutputColumn[j].columnAlias,
                            field: colNames[i],
                            cellRenderer:(params) => {return this.changeCellColor(params,thresholdValueRel,modelResultDetailCol)}}
                        }else {
                          rowColom = {
                            headerName: this.modelOutputColumn[j].columnAlias,
                            field: colNames[i],
                          };
                        }
                        col.push(rowColom);
                      }
                      break loop;
                    }
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
                      this.modelOutputColumn[
                        k
                      ].outputColumnName.toLowerCase() == colNames[j]
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
          }
        );
        this.columnDefs = col;
        this.rowData = da;
      } else if (
        this.useType == "sqlEditor"
      ){
        this.getIntoModelResultDetail(nextValue)
       }else if( this.useType == "modelPreview"){
        this.loading = true;
        this.nextValue = nextValue;
        var col = [];
        var rowData = [];
        if (this.prePersonalVal.id == this.nextValue.executeSQL.id) {
          if (this.nextValue.executeSQL.state == "2") {
            if (this.nextValue.executeSQL.type == "SELECT") {
              if (true) {
                this.modelResultButtonIsShow = true;
                this.modelResultPageIsSee = true;
                this.modelResultData = this.nextValue.result;
                this.result.column = this.nextValue.columnNames;
                var columnTypes1 = this.nextValue.columnTypes;
                var columnType = [];
                for (var i = 0; i < columnTypes1.length; i++) {
                  var type = "";
                  if (columnTypes1[i].toUpperCase().indexOf("VARCHAR") != -1) {
                    type = "varchar";
                  } else if (
                    columnTypes1[i].toUpperCase().indexOf("NUMBER") != -1 ||
                    columnTypes1[i].toUpperCase().indexOf("INT") != -1
                  ) {
                    type = "number";
                  } else if (
                    columnTypes1[i].toUpperCase().indexOf("TIMESTAMP") != -1 ||
                    columnTypes1[i].toUpperCase().indexOf("DATE") != -1
                  ) {
                    type = "time";
                  } else if (
                    columnTypes1[i].toUpperCase().indexOf("FLOAT") != -1
                  ) {
                    type = "float";
                  }
                  columnType.push(type);
                }
                var resultData = this.nextValue.result;
                this.result.id = this.nextValue.modelUuid
                this.result.name = modelName
                this.result.columnType = columnType;
                var chartData = [];
                for (var i = 0; i < resultData.length; i++) {
                  var eachChartData = [];
                  for (var j = 0; j < this.nextValue.columnNames.length; j++) {
                    eachChartData.push(
                      resultData[i][this.nextValue.columnNames[j]]
                    );
                  }
                  chartData.push(eachChartData);
                }
                this.result.data = chartData;
                // this.rowData = this.modelResultData;
                this.modelResultColumnNames = this.nextValue.columnNames;
                selectModel(this.modelId).then((resp) => {
                  var modelOutputColumn = resp.data.modelOutputColumn
                  var datacodes = [];
                  for (var i = 0; i <modelOutputColumn.length; i++) {
                    if (modelOutputColumn[i].dataCoding != undefined) {
                      datacodes.push(modelOutputColumn[i].dataCoding);
                    }
                  }
                  for (var j = 0; j < this.nextValue.columnNames.length; j++) {
                    var rowColom = {}
                    for (var n = 0;n<modelOutputColumn.length;n++){
                      if (modelOutputColumn[n].outputColumnName ==
                        this.nextValue.columnNames[j]){
                        if (modelOutputColumn[n].isShow == 1) {
                          rowColom = {
                            headerName: modelOutputColumn[n].columnAlias,
                            field: this.nextValue.columnNames[j],
                            width: "180",
                          };
                        }
                      }
                    }
                    if (rowColom.field!=undefined){
                      col.push(rowColom);
                    }
                  }
                  if (datacodes.length > 0) {
                    for (var k = 0; k < this.nextValue.result.length; k++) {
                      rowData.push(this.nextValue.result[k]);
                    }
                    getTransMap(datacodes.join(",")).then((resp) => {
                      var dataCoding = resp.data;
                      for (var i = 0; i < resultData.length; i++) {
                        for (var j = 0; j < this.nextValue.columnNames.length; j++) {
                          for (var k = 0; k < modelOutputColumn.length; k++) {
                              if(modelOutputColumn[k].outputColumnName == this.nextValue.columnNames[j]){
                                if (modelOutputColumn[k].dataCoding != undefined) {
                                  var a = rowData[i][this.nextValue.columnNames[j]];
                                  rowData[i][this.nextValue.columnNames[j]] = dataCoding[
                                    modelOutputColumn[k].dataCoding
                                    ][a];
                                }
                              }
                          }
                        }
                      }
                      this.rowData = rowData
                    });
                  }else {
                    for (var k = 0; k < this.nextValue.result.length; k++) {
                      rowData.push(this.nextValue.result[k]);
                    }
                    this.rowData = rowData
                  }
                  this.columnDefs = col;
                  this.afterResult = true
                })
              }
            } else {
              this.isSee = false;
              this.modelResultPageIsSee = false;
              this.modelResultButtonIsShow = false;
              this.errorMessage = this.nextValue.executeSQL.msg;
            }
          } else if (this.nextValue.executeSQL.state == "3") {
            this.isSee = false;
            this.modelResultPageIsSee = false;
            this.modelResultButtonIsShow = false;
            this.errorMessage = this.nextValue.executeSQL.msg;
          }
          this.isLoading = false;
        }
      } else if (this.useType == "previewTable") {
        this.getIntoModelResultDetail(nextValue)
      } else if (this.useType == "graph") {
        this.getIntoModelResultDetail(nextValue)
      }
    },
    /**
     * 显示模型结果详细提取公共代码
     * */
    getIntoModelResultDetail(nextValue){
      this.loading = true;
      this.nextValue = nextValue;
      var col = [];
      var rowData = [];
      if (this.prePersonalVal.id == this.nextValue.executeSQL.id) {
        if (this.nextValue.executeSQL.state == "2") {
          if (this.nextValue.executeSQL.type == "SELECT") {
              this.modelResultButtonIsShow = true;
              this.modelResultPageIsSee = true;
              this.modelResultData = this.nextValue.result;
              this.result.column = this.nextValue.columnNames;
              var columnTypes1 = this.nextValue.columnTypes;
              var columnType = [];
              for (var i = 0; i < columnTypes1.length; i++) {
                var type = "";
                if (columnTypes1[i].toUpperCase().indexOf("VARCHAR") != -1 || columnTypes1[i].toUpperCase().indexOf("CHAR") != -1) {
                  type = "varchar";
                } else if (
                  columnTypes1[i].toUpperCase().indexOf("NUMBER") != -1 ||
                  columnTypes1[i].toUpperCase().indexOf("INT") != -1
                ) {
                  type = "number";
                } else if (
                  columnTypes1[i].toUpperCase().indexOf("TIMESTAMP") != -1 ||
                  columnTypes1[i].toUpperCase().indexOf("DATE") != -1
                ) {
                  type = "time";
                } else if (
                  columnTypes1[i].toUpperCase().indexOf("FLOAT") != -1
                ) {
                  type = "float";
                }
                columnType.push(type);
              }
              var resultData = this.nextValue.result;
              this.result.id = uuid2()
              this.result.name = '模型'
              this.result.columnType = columnType;
              var chartData = [];
              for (var i = 0; i < resultData.length; i++) {
                var eachChartData = [];
                for (var j = 0; j < this.nextValue.columnNames.length; j++) {
                  eachChartData.push(
                    resultData[i][this.nextValue.columnNames[j]]
                  );
                }
                chartData.push(eachChartData);
              }
              this.result.data = chartData;
              this.rowData = this.modelResultData;
              this.modelResultColumnNames = this.nextValue.columnNames;
              if (this.prePersonalVal['agridColumnDatas'] === undefined){
              for (var j = 0; j < this.nextValue.columnNames.length; j++) {
                var rowColom = {
                  headerName: this.nextValue.columnNames[j],
                  field: this.nextValue.columnNames[j],
                  width: "180",
                };
                var key = this.nextValue.columnNames[j];
                var value = this.nextValue.result[j];
                col.push(rowColom);
              }
              }else {
                col = this.prePersonalVal['agridColumnDatas']
              }
              for (var k = 0; k < this.nextValue.result.length; k++) {
                rowData.push(this.nextValue.result[k]);
              }
              this.columnDefs = col;
            this.afterResult = true
          } else {
            this.isSee = false;
            this.modelResultPageIsSee = false;
            this.modelResultButtonIsShow = false;
            this.errorMessage = this.nextValue.executeSQL.msg;
          }
        } else if (this.nextValue.executeSQL.state == "3") {
          this.isSee = false;
          this.modelResultPageIsSee = false;
          this.modelResultButtonIsShow = false;
          this.errorMessage = this.nextValue.executeSQL.msg;
        }
        this.isLoading = false;
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
      var modelThresholdValues = []
      if (this.settingInfo!=undefined){
        modelThresholdValues.push(JSON.parse(this.settingInfo).thresholdValueRel)
      }else {
        modelThresholdValues =  this.modelObj.modelThresholdValues
      }
      var thresholdValueRel = {}
      this.isLoading = false;
      for (var i = 0;i<modelThresholdValues.length;i++){
        thresholdValueRel = modelThresholdValues[i]
        if(thresholdValueRel && thresholdValueRel.thresholdValue.thresholdValueType == 1){
          if(typeof (modelThresholdValues[i].colorInfo) === "string"){
            let colorInfo = JSON.parse(modelThresholdValues[i].colorInfo)
            modelThresholdValues[i].colorInfo = colorInfo
          }
          //判断颜色等信息
          return handleDataSingleValue(params.data,thresholdValueRel)
        }
      }
    },
    changeCellColor(params,thresholdValueRel,modelResultDetailCol){
      if(thresholdValueRel){
        let returnValue = handleDataManyValue(params,thresholdValueRel)
        //如果当该列是关联详细列又是阈值展现改变颜色列的时候做特殊处理
        //如果两种都存在则优先判断阈值，如果阈值成立则显示阈值颜色，阈值不成立则显示超链接颜色
        if(returnValue.toString().indexOf("<span") != -1){
          return returnValue
        }
        else{
          let dom = params.value
          if(modelResultDetailCol.indexOf(params.column.colId.toUpperCase()) != -1){
            dom = "<span onclick='openModelDetailNew()' style='text-decoration:underline;color:blue;cursor:pointer'>" + params.value + "</span>"
          }
          return dom
        }
      }
      else{
        if(modelResultDetailCol.indexOf(params.column.colId.toUpperCase()) != -1){
          let dom = "<span onclick='openModelDetailNew()' style='text-decoration:underline;color:blue;cursor:pointer'>" + params.value + "</span>"
          return dom
        }
        return params.value
      }
    },
    /**
     * 在渲染表格之前拿到渲染表格时需要的数据
     */
    getRenderTableData() {
      if (this.useType == "modelRunResult") {
        if (this.modelUuid != undefined) {
          if (this.settingInfo === undefined){
            selectPrimaryKeyByTableName().then((resp) => {
              this.primaryKey = resp.data;
              selectModel(this.modelUuid).then((resp) => {
                this.modelObj = resp.data
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
            });
          }else {
            this.initData();
          }
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
    //单元格点击事件
    onCellClicked(cell) {
      this.rowIndex = cell.rowIndex
    },
    /**
     * 点击详细打开dialog效果
     */
    openModelDetailNew(selRows) {
      this.options = [];
      for (var i = 0; i < this.modelDetailRelation.length; i++) {
        var eachOption = {
          value: this.modelDetailRelation[i].relationObjectUuid,
          label: this.modelDetailRelation[i].modelDetailName,
        };
        this.options.push(eachOption);
      }
      this.modelDetailDialogIsShow = true;
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
              var key = this.modelDetailRelation[i].modelDetailConfig[j]
                .resultColumn;
              var obj = { moduleParamId: "", paramValue: "" };
              obj.moduleParamId = this.modelDetailRelation[i].modelDetailConfig[
                j
              ].ammParamUuid;
              obj.paramValue = this.rowData[this.rowIndex][key.toLowerCase()];
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
            const obj = { sqls: sql, businessField: "modelresultdetail" };
            getExecuteTask(obj)
              .then((resp) => {
                this.currentExecuteSQL = resp.data.executeSQLList;
                //界面渲染完成之后开始执行sql,将sql送入调度
                startExecuteSql(resp.data).then((result) => {});
              })
              .catch((result) => {
                this.$message({ type: "info", message: "执行失败" });
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
            if (
              eachFilter.indexOf(this.modelOutputColumn[j].outputColumnName) >
              -1
            ) {
              eachFilter = eachFilter.replace(
                this.modelOutputColumn[j].outputColumnName,
                this.rowData[this.rowIndex][
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
        const obj = { sqls: sql, businessField: "modelresultdetail" };
        getExecuteTask(obj)
          .then((resp) => {
            this.currentExecuteSQL = resp.data.executeSQLList;
            //界面渲染完成之后开始执行sql,将sql送入调度
            startExecuteSql(resp.data).then((result) => {});
          })
          .catch((result) => {
            this.$message({ type: "info", message: "执行失败" });
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
      /*      const webSocketPath =
        "ws://localhost:8086/analysis/websocket?" +
        this.$store.getters.personuuid;*/
      const webSocketPath =
        process.env.VUE_APP_ANALYSIS_WEB_SOCKET +
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
     * sql编辑器保存图标
     */
    saveChart(){
      this.isHaveCharts = false
      this.afterAddChartsWithNoConfigure = false
      this.chartShowIsSee = false;
        var chartJson = this.$refs.chart.getChartConfig();
        this.chartConfigs.push(chartJson)
        this.nowChartJson = chartJson
        var modelUuid = this.nowtable.runResultTableUuid==undefined?this.chartModelUuid:this.nowtable.runTaskRelUuid
        var modelChartSetup = {
          chartJson: JSON.stringify(chartJson),
          modelUuid: modelUuid,
        };
        this.modelChartSetups.push(modelChartSetup)
        addModelChartSetup(modelChartSetup).then((resp) => {
          if (resp.data) {
            this.$notify({
              title: this.$t("提示"),
              message: this.$t("添加图表成功"),
              type: "success",
              duration: 2000,
              position: "bottom-right",
            });
          }
        });
    },
    /**
     * 修改图表方法
     */
    updateChart(){
      var chartJson = this.$refs.chart.getChartConfig();
      for(var i = 0;i<this.chartConfigs.length;i++){
        if(this.nowChartJson.id == this.chartConfigs[i].id){
          this.chartConfigs.splice(i,1)
          break
        }
      }
      this.chartConfigs.push(chartJson)
      if(this.modelChartSetups.length!=0){
        var modelChartSetup = {}
        for(var i =0;i<this.modelChartSetups.length;i++){
           var charjson= JSON.parse(this.modelChartSetups[i].chartJson)
           if(charjson.id==this.nowChartJson.id){
             modelChartSetup = this.modelChartSetups[i]
             modelChartSetup.chartJson = JSON.stringify(chartJson)
             break
           }
        }
        if (modelChartSetup.chartSetupUuid === undefined){
          this.$notify({
            title: this.$t("提示"),
            message: this.$t("修改成功"),
            type: "success",
            duration: 2000,
            position: "bottom-right",
          });
        }else {
          updateModelChartSetup(modelChartSetup).then((resp) => {
            if (resp.data) {
              this.$notify({
                title: this.$t("提示"),
                message: this.$t("修改成功"),
                type: "success",
                duration: 2000,
                position: "bottom-right",
              });
            }
          });
        }
      }else{
              this.$notify({
              title: this.$t("提示"),
              message: this.$t("修改成功"),
              type: "success",
              duration: 2000,
              position: "bottom-right",
            });
      }
      this.chartShowIsSee = false;
    },
    /**
     * 获取参数返显的数据
     */
    chartReflexion() {
      this.chartConfigs = []
      this.modelChartSetups = []
      if(this.nowtable.runResultTableUuid!=undefined){
        getModelChartSetup(this.nowtable.runTaskRelUuid).then((resp) => {
              if (resp.data.isError == true) {
            //做保存操作
            this.chartSaveOrUpdate = "save";
          } else {
            //做修改操作
            this.modelChartSetups = resp.data.modelChartSetups;
            for(var i = 0;i<this.modelChartSetups.length;i++){
              this.chartConfigs.push(JSON.parse(this.modelChartSetups[i].chartJson))
            }
            this.nowChartJson = this.chartConfigs[0]
            this.chartSaveOrUpdate = "update";
          }
          if(this.chartConfigs.length==0){
            this.isHaveCharts = true
          }
          this.chartLoading = false
        });
      }else{
         if (this.modelUuid != undefined) {
        getModelChartSetup(this.modelUuid).then((resp) => {
          if (resp.data.isError == true) {
            //做保存操作
            this.chartSaveOrUpdate = "save";
          } else {
            //做修改操作
            this.modelChartSetups = resp.data.modelChartSetups;
            for(var i = 0;i<this.modelChartSetups.length;i++){
              this.chartConfigs.push(JSON.parse(this.modelChartSetups[i].chartJson))
            }
            this.nowChartJson = this.chartConfigs[0]
            this.chartSaveOrUpdate = "update";
          }
          if(this.chartConfigs.length==0){
            this.isHaveCharts = true
          }
          this.chartLoading = false
        });
      } else if (this.modelId != undefined) {
        getModelChartSetup(this.modelId).then((resp) => {
          if (resp.data.isError == true) {
            //做保存操作
            this.chartSaveOrUpdate = "save";
          } else {
              //做修改操作
            this.modelChartSetups = resp.data.modelChartSetups;
            for(var i = 0;i<this.modelChartSetups.length;i++){
              this.chartConfigs.push(JSON.parse(this.modelChartSetups[i].chartJson))
            }
            this.nowChartJson = this.chartConfigs[0]
            this.chartSaveOrUpdate = "update";
          }
          if(this.chartConfigs.length==0){
            this.isHaveCharts = true
          }
          this.chartLoading = false
        });
      }
      }

    },
    /**
     * 打开添加图标的dialog
     */
    openChartDialog(){
      this.afterAddChartsWithNoConfigure = true
      this.chartSaveOrUpdate = 'save'
      this.nowChartJson = undefined
      this.chartShowIsSee = true
    },
    /**
     * 点击小图表的时候大图标切换方法
     */
    changeChart(chartId){
      this.afterAddChartsWithNoConfigure = false
      var chartConfigs = this.chartConfigs
      for(var i = 0;i<chartConfigs.length;i++){
        if(chartId==chartConfigs[i].id){
          this.nowChartJson = chartConfigs[i]
          break
        }
      }
    },
    /**
     * 打开修改图表的dialog
     */
    openEditChartDialog(){
      this.chartSaveOrUpdate = 'update'
      this.chartShowIsSee = true
    },
    /**
     * 删除图标
     */
    deleteChart(){
      if (this.nowChartJson === undefined){
        this.$message({
          message: "请选择图表后在删除!",
        });
        return
      }
      for(var i = 0;i<this.chartConfigs.length;i++){
        if(this.nowChartJson.id == this.chartConfigs[i].id){
          this.chartConfigs.splice(i,1)
          break
        }
      }
      if(this.modelChartSetups.length!=0){
        var modelChartSetupUuid = {}
        for(var i =0;i<this.modelChartSetups.length;i++){
           var charjson= JSON.parse(this.modelChartSetups[i].chartJson)
           if(charjson.id==this.nowChartJson.id){
             modelChartSetupUuid = this.modelChartSetups[i].chartSetupUuid
             break
           }
        }
        if (modelChartSetupUuid===undefined){
          this.$notify({
            title: this.$t("提示"),
            message: this.$t("删除成功"),
            type: "success",
            duration: 2000,
            position: "bottom-right",
          });
        }else {
          deleteModelChartSetup(modelChartSetupUuid).then((resp) => {
            if (resp.data) {
              this.$notify({
                title: this.$t("提示"),
                message: this.$t("删除成功"),
                type: "success",
                duration: 2000,
                position: "bottom-right",
              });
            }
          });
        }
      }else{
              this.$notify({
              title: this.$t("提示"),
              message: this.$t("删除成功"),
              type: "success",
              duration: 2000,
              position: "bottom-right",
            });
      }
      if(this.chartConfigs.length!=0){
        this.nowChartJson = this.chartConfigs[0]
      }else{
        this.nowChartJson = undefined
        this.isHaveCharts = true
      }
    }
  },
};
</script>
<style scoped>
.itxst {
  margin: 10px;
  text-align: left;
  /* overflow: auto; */
}
.thechard-z {
  margin-right: 15px;
}
.paging-z {
  font-weight: bold;
  color: rgb(52, 57, 66);
  margin: 0 5px;
  font-size: 16px;
  line-height: 16px;
}
.delete-pos{
  width:25px;
  position: absolute;
  right: 60px;
  z-index:20;
}
.change-pos{
  width:29px;
  position: absolute;
  right: 35px;
  z-index:20;
}
.chartSwitching{
  width:24px;
  height:24px;
  margin: 10px 6px 0px 0px;
  display: block;
  cursor: pointer;
  /*border:1px solid #999;*/
  /*border-radius: 15%;*/
}

>>>.el-btn-no-color{
  width: 44px;
  float: left;
  border: solid 1px #E0E0E0;
  height: 29px;
  margin: -7px 3px 3px 0px;
  cursor: pointer;
  text-align: center;
}

>>>.el-btn-color{
  background: aliceblue;
  width: 44px;
  float: left;
  border: solid 1px #E0E0E0;
  height: 29px;
  margin: -7px 3px 3px 0px;
  cursor: pointer;
  text-align: center;
}
.smallImgs{
  float: right;
  height: 723px;
  padding-left: 5px;
  background: rgb(245,245,245);
  position: relative;
  z-index: 10;
  margin: -50px -8px 0px 0px;
}
</style>
