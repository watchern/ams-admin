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
      <el-button type="primary" @click="exportExcel">导出</el-button>
      <el-button type="primary">图标显示</el-button>
      <el-button type="primary" @click="getValues">关联项目</el-button>
      <el-button
        type="primary"
        @click="removeRelated('dc99c210a2d643cbb57022622b5c1752')"
        >移除关联</el-button
      >
      <el-button type="primary" @click="queryConditionSetting"
        >查询条件设置</el-button
      >
      <!-- <el-button type="primary" @click="addDetailRel('qwer', '项目10')"
        >重置</el-button -->
      <el-button type="primary" @click="reSet">重置</el-button>
    </el-row>
    <el-row v-if="modelResultButtonIsShow">
      <el-button type="primary">导出</el-button>
      <el-button type="primary">图标展示</el-button>
    </el-row>
    <!-- 使用ag-grid-vue组件 其中columnDefs为列，rowData为表格数据 -->
    <ag-grid-vue
      v-if="isSee"
      style="height: 200px"
      class="table ag-theme-balham"
      :column-defs="columnDefs"
      :row-data="rowData"
      :enable-col-resize="true"
      row-selection="multiple"
      :get-row-style="this.renderTable"
      @cellClicked="onCellClicked"
      @gridReady="onGridReady"
      v-loading="isLoading"
    />
    <el-card v-if="!isSee" class="box-card">
      <div>{{errorMessage}}</div>
    </el-card>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="pageQuery.pageNo"
      :limit.sync="pageQuery.pageSize"
      @pagination="initData"
    />
    <el-pagination
      v-if="modelResultPageIsSee"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="page"
      :page-sizes="[10,20,30,50]"
      :page-size="limit"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total1"
    >
    </el-pagination>
  </div>
</template>

<script>
// 引入样式文件
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
// 引入ag-grid-vue
import { AgGridVue } from "ag-grid-vue";
import Pagination from "@/components/Pagination/index";
import {
  selectTable,
  selectByRunResultTableUUid,
  batchSaveResultDetailProjectRel,
  selectPrimaryKeyByTableName,
  removeResultDetailProjectRel,
  selectConditionShow,
} from "@/api/analysis/auditModelResult";
import axios from "axios";
import VueAxios from "vue-axios";
import AV from "leancloud-storage";
import myQueryBuilder from "@/views/analysis/auditModelResult/myQueryBuilder";
import { string } from "jszip/lib/support";
export default {
  // 注册draggable组件
  components: {
    AgGridVue,
    Pagination,
    myQueryBuilder,
  },
  /**
   * 模型运行结果使用变量：nowtable：表示模型结果表对象   modelUuid：根据modelUUid进行表格渲染，只有主表用渲染
   */
  props: ["nowtable", "modelUuid", "useType", "prePersonalVal"],
  data() {
    return {
      dialogVisible: false,
      // 定义ag-grid列
      columnDefs: [],
      // 需要显示的数据
      rowData: [],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
      },
      total: 0,
      myFlag: false, // 用来判断主表界面有按钮，辅表界面没有按钮，为true是主表，为false是辅表
      selectRows: [],
      detailTable: [],
      primaryKey: "", // 保存每个表中的主键，因为每个表的主键都不一样，所以得根据表明查出来
      dataArray: [], // 保存当前表格中的数据
      queryData: [], // 保存列信息，用来传给子组件(queryBuilder组件)
      queryJson: {}, // 用来储存由子组件传过来的 queryBuilder 的 Json数据
      conditionShowData: [], // 存放模型运行结果需要渲染的数据
      primaryKey: "",  //存放模型运行结果主键
      isLoading: true, 
      nextValue: [], //存放模型结果后传进来的值
      modelResultData: [],  //用来存放模型结果数据
      modelResultColumnNames: [],  // 用来存放模型结果的列名
      limit: 10,  ////模型结果前台分页的初始一页有多少条数据属性
      total1: null, //模型结果前台分页的total属性
      page: 1, //模型结果前台分页的当前页属性
      isSee:true, //当输入sql错误和结果集为0的时候不显示aggrid表格
      errorMessage:'',  //存放模型结果错误消息
      modelResultPageIsSee:false, //模型结果分页是否可见
      modelResultButtonIsShow:false //模型结果按钮是否可见
    };
  },
  mounted() {
    this.getRenderTableData();
  },
  methods: {
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
                  alert("关联失败，因为其中" + str + "已经关联");
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
        alert("请选择后再进行关联");
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
    onCellClicked(cell) {
    },
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
        selectTable(this.pageQuery, sql).then((resp) => {
          this.total = resp.data.total;
          this.dataArray = resp.data.records[0].result;
          this.queryData = resp.data.records[0].columnInfo;
          // 将返回对象的所有属性，按顺序提取出来，用于后续生成ag-grid列信息
          for (const key in resp.data.records[0].result[0]) {
            colNames.push(key);
          }
          // 生成ag-grid列信息
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
          // 生成ag-frid表格数据
          for (var i = 0; i < resp.data.records[0].result.length; i++) {
            da.push(resp.data.records[0].result[i]);
          }
        });
        this.columnDefs = col;
        this.rowData = da;
        this.isLoading = false;
      } else if (this.useType == "sqlEditor") {
        this.loading = true;
        this.nextValue = nextValue;
        var col = [];
        var rowData = [];
        if (this.prePersonalVal.id == this.nextValue.executeSQL.id) {
          if(this.nextValue.result == undefined){
              this.isSee = false
              this.modelResultPageIsSee = false
              this.modelResultButtonIsShow = false
              this.errorMessage = this.nextValue.executeSQL.message
          }else{
            this.modelResultButtonIsShow = true
            this.modelResultPageIsSee = true
               this.modelResultData = this.nextValue.result;
          this.modelResultColumnNames = this.nextValue.columnNames;
          for (var j = 0; j <= this.nextValue.columnNames.length; j++) {
            var rowColom = {
              headerName: this.nextValue.columnNames[j],
              field: this.nextValue.columnNames[j],
            };
            var key = this.nextValue.columnNames[j];
            var value = this.nextValue.result[j];
            col.push(rowColom);
          }
          for (var k = 0; k < this.nextValue.result.length; k++) {
            rowData.push(this.nextValue.result[k]);
          }
          this.columnDefs = col;
          this.getList()
          // this.rowData = rowData 
          
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
      this.queryJson = queryJson;
      if (sql == "") {
        sql = "undefined";
      }
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
      this.initData("undefined");
    },
    /**
     * 渲染表格，将颜色渲染上去
     */
    renderTable(params) {
      if (this.modelUuid != undefined) {
        for (var i = 0; i < this.conditionShowData[0].length; i++) {
          for (var j = 0; j < this.conditionShowData[0][i].length; j++) {
            if (
              params.data[this.primaryKey] == this.conditionShowData[0][i][j]
            ) {
              return {
                "background-color": JSON.parse(this.conditionShowData[1][i])
                  .backGroundColor,
                color: JSON.parse(this.conditionShowData[1][i]).fontColor,
              };
            }
          }
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
                this.initData();
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
  },
};
</script>
<style scoped>
.itxst {
  margin: 10px;
  text-align: left;
}
</style>
