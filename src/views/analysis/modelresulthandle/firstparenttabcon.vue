<template>
  <!-- firstParentTabCon.vue界面是父页签第一个页签中的内容 -->
  <div class="app-container">
    <el-container>
      <el-header>
        <div class="filter-container">
          <QueryField
            ref="queryfield"
            :form-data="queryFields"
            @submit="getLikeList"
          />
        </div>
      </el-header>
      <!-- style="width: 92vw" -->
      <el-main>
        <div align="right">
          <el-row>
            <el-button
              :disabled="false"
              type="primary"
              size="small"
              class="oper-btn processing"
              @click="handleResult"
            ></el-button>
            <el-button
              :disabled="buttonIson.deleteBtn"
              type="primary"
              @click="deleteRunTaskRel"
              class="oper-btn delete-projectrel btn-width-max"
            ></el-button>
          </el-row>
        </div>
        <el-table
          id="table"
          ref="resultTable"
          :key="tableKey"
          v-loading="listLoading"
          :data="list"
          border
          fit
          highlight-current-row
          @sort-change="sortChange"
          @selection-change="handleSelectionChange"
          height="450px"
        >
          <el-table-column type="selection" width="55px" />
          <el-table-column
            label="模型名称"
            width="300px"
            prop="model.modelName"
          >
            <template slot-scope="scope">
              <a
                type="text"
                style="color: #409eff"
                @click="
                  getResultTables(
                    scope.row.runResultTables,
                    scope.row.model.modelName,
                    scope.row.model.modelUuid,
                    scope.row.runStatus,
                    resultSpiltObjects
                  )
                "
                >{{ scope.row.model.modelName }}</a
              >
            </template>
          </el-table-column>
          <el-table-column
            label="处理状态"
            width="100px"
            align="center"
            prop="handleState"
          />
          <el-table-column
            label="处理意见"
            width="100px"
            prop="handleIdea"
          />
          <el-table-column
            label="运行人"
            width="100px"
            align="center"
            prop="runTask.runUserName"
          />
          <el-table-column
            label="运行类型"
            width="100px"
            align="center"
            prop="runTask.runType"
            :formatter="runTypeFormate"
          />
          <el-table-column
            label="结果总条数"
            width="100px"
            align="center"
            prop="runResultTables"
            :formatter="dataCountFormatter"
          />
          <el-table-column
            label="运行SQL"
            prop="settingInfo"
            align="center"
            width="200px"
          >
            <template slot-scope="scope">
              <el-link type="primary" @click="selectSql(scope.row)">{{
                settingInfoSqlFormatter(scope.row)
              }}</el-link>
            </template>
          </el-table-column>
          <el-table-column
            label="运行参数"
            prop="settingInfo"
            width="200px"
            :formatter="settingInfoParamsArrFormatter"
          />
          <el-table-column
            label="关联项目"
            prop="projectName"
            width="200px"
          />
          <el-table-column
            v-if="false"
            label="运行结果共享表主键"
            prop="runResultShare.runResultShareUuid"
            align="center"
            width="200px"
          />
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="pageQuery.pageNo"
          :limit.sync="pageQuery.pageSize"
          @pagination="getLikeList"
        />
      </el-main>
    </el-container>
    <el-dialog
      v-if="sqlInfoDialog"
      :visible.sync="sqlInfoDialog"
      title="SQL信息"
      width="50%"
    >
      <el-input disabled type="textarea" :rows="15" v-model="sqlInfo">
      </el-input>
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
                  <el-option value="处理中">处理中</el-option>
                  <el-option value="已完成">已完成</el-option>
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
import {
  getRunTaskRelByPage,
  batchDeleteRunTaskRel,
  ResultRelProject,
  rmResultRelProjectlr,
  insertRunResultShare,
  deleteRunResultShare,
  exportRunTaskRel,
  reRunRunTask,
  getResultSplitSelectData,
  selectPrimaryKeyByTableName,
  batchSaveResultDetailProjectRel,
  selectByRunResultTableUUids,
  getDataAfterResultSpiltToRelateProject,
  addCoverResultRelProject,
  batchDeleteResultRelProject
} from "@/api/analysis/auditmodelresult";
import {
  selectLikePageVoHandle,
  updateRunTaskRel,
} from "@/api/analysis/modelresulthandle";
import { uuid2, addRunTaskAndRunTaskRel } from "@/api/analysis/auditmodel";
import QueryField from "@/components/public/query-field/index";
import Pagination from "@/components/Pagination/index";
import { elementInside } from "dropzone";
import runimmediatelycon from "@/views/analysis/auditmodel/runimmediatelycon";
import axios from "axios";
import VueAxios from "vue-axios";
import AV from "leancloud-storage";
import { getParamSettingArr } from "@/api/analysis/auditparam";
import personTree from "@/components/publicpersontree/index";
import { getDictList } from '@/utils'
import flowItem from "ams-starflow-vue/src/components/todowork/flowItem";
export default {
  components: { Pagination, QueryField, runimmediatelycon, personTree, flowItem },
  data() {
    return {
      tableKey: "errorUuid",
      list: null, // 绑定elementTable的数据
      total: 0,
      listLoading: false, //elementTable的遮罩
      queryFields: [
        //最上面模模糊查询所用数据
        { label: "模型名称", name: "modelName", type: "fuzzyText" },
        { label: "运行人", name: "runUserName", type: "fuzzyText" },
        { label: "运行sql", name: "sql", type: "fuzzyText" },
        { label: "运行参数", name: "param", type: "fuzzyText" },
        { label: "执行时间范围", name: "runStartTime", type: "timePeriod" },
      ],
      formStyle: {
        width: "700px",
        height: "400px",
      },
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
      },
      share: [], // 存储共享的运行结果
      notShare: [], // 存储不是共享的运行结果
      success: false, // 用来测试open2方法里的batchDeleteRunTaskRel方法返回值是否为true，如果为true则success为true
      success1: false, // 用来测试open2方法里的deleteRunResultShare方法返回值是否为true，如果为true则success为true
      selected1: [], // 存储表格中选中的数据
      buttonIson: {
        AssociatedBtn: true,
        DisassociateBtn: false,
        deleteBtn: true,
        resultSplitBtn: true,
        resultShareBtn: true,
        exportBtn: false,
      },
      //模型结果处理对象
      modelResultHandle: {
        handleState: "",
        handleIdea: "",
      },
      //处理意见dialog
      handleIdeaDialog: false,
      resultSpiltObjects: {}, //存储点击结果拆分要传往后台的数据
      sqlInfo: "",
      sqlInfoDialog: false, //点击模型结果关联按钮控制人员dialog显示
      projectUuid: "", //关联项目的Uuid
    };
  },
  created() {
    let params = this.getQueryString();
    if (params.projectUuid != undefined) {
      this.projectUuid = params.projectUuid;
      this.getLikeList();
    } else {
      this.getLikeList();
    }
  },
  watch: {
    // 监听父组件传值projectId
    projectId() {
      this.getLikeList()
      // this.getProjectPerson(this.projectId)
    },
  },
  methods: {
    /**
     *解析url上的参数
     */
    getQueryString() {
      let url = window.location.href;
      var params = [],
        h;
      var hash = url.slice(url.indexOf("?") + 1).split("&");
      for (var i = 0; i < hash.length; i++) {
        h = hash[i].split("="); //
        params[h[0]] = h[1];
      }
      return params;
    },
    /**
     * 格式化时间字符串
     * @param row 行数据
     * @param column 列数据
     * @returns {string} 返回格式化后的字符串
     */
    dateFormatter(row, column) {
      const datetime = row.runStartTime;
      if (datetime) {
        var dateMat = new Date(datetime);
        var year = dateMat.getFullYear();
        var month = dateMat.getMonth() + 1;
        var day = dateMat.getDate();
        var hh = dateMat.getHours();
        var mm = dateMat.getMinutes();
        var ss = dateMat.getSeconds();
        if (hh < 10) {
          hh = "0" + hh;
        }
        if (mm < 10) {
          mm = "0" + mm;
        }
        if (ss < 10) {
          ss = "0" + ss;
        }
        var timeFormat =
          year + "-" + month + "-" + day + " " + hh + ":" + mm + ":" + ss;
        return timeFormat;
      }
      return "";
    },
    /**
     * val是运行结果中的resultTables
     * modelName是选中的模型的名字
     */
    getResultTables(val, modelName, modelUuid, runStatus, resultSpiltObjects) {
      if (runStatus == 3) {
        var assistTables = [];
        var mainTable = null;
        for (var i = 0; i < val.length; i++) {
          if (val[i].tableType == 1) {
            mainTable = val[i];
          } else {
            assistTables.push(val[i]);
          }
        }
        // 触发父类方法addTab在index.vue界面，同时穿过三个参数assistTables：辅表（运行结果表）数组  mainTable：主表（运行结果表对象）
        // modelName：模型的名称，用来给新页签赋值title属性用
        this.$emit(
          "addtab",
          assistTables,
          mainTable,
          modelName,
          modelUuid,
          resultSpiltObjects,
          this.projectUuid
        );
      } else {
        this.$message({
          type: "info",
          message: "该运行结果不是成功状态",
        });
      }
    },
    /**
     格式化时间字符串
     * @param row 行数据
     * @param column 列数据
     * @returns {string} 返回格式化后的字符串
     */
    dateFormatter1(row, column) {
      const datetime = row.runEndTime;
      if (datetime) {
        var dateMat = new Date(datetime);
        var year = dateMat.getFullYear();
        var month = dateMat.getMonth() + 1;
        var day = dateMat.getDate();
        var hh = dateMat.getHours();
        var mm = dateMat.getMinutes();
        var ss = dateMat.getSeconds();
        if (hh < 10) {
          hh = "0" + hh;
        }
        if (mm < 10) {
          mm = "0" + mm;
        }
        if (ss < 10) {
          ss = "0" + ss;
        }
        var timeFormat =
          year + "-" + month + "-" + day + " " + hh + ":" + mm + ":" + ss;
        return timeFormat;
      }
      return "";
    },
    dateFormatter2(row) {
      const datetime = row.runTask.timingExecute;
      if (datetime) {
        var dateMat = new Date(datetime);
        var year = dateMat.getFullYear();
        var month = dateMat.getMonth() + 1;
        var day = dateMat.getDate();
        var hh = dateMat.getHours();
        var mm = dateMat.getMinutes();
        var ss = dateMat.getSeconds();
        if (hh < 10) {
          hh = "0" + hh;
        }
        if (mm < 10) {
          mm = "0" + mm;
        }
        if (ss < 10) {
          ss = "0" + ss;
        }
        var timeFormat =
          year + "-" + month + "-" + day + " " + hh + ":" + mm + ":" + ss;
        return timeFormat;
      } else {
        return "无";
      }
    },
    /**
     * 格式化执行信息，取出执行信息中的sql
     */
    settingInfoSqlFormatter(row, column) {
      if (row.settingInfo == null) {
        return "";
      } else {
        var sql = JSON.parse(row.settingInfo).sql;
        if(!sql){
          return ""
        }
        sql = sql.substring(0, 10);
        sql = sql + "...";
        return sql;
      }
    },
    /**
     * 格式化执行信息，取出执行信息中的paramArr
     */
    settingInfoParamsArrFormatter(row, column) {
      if (row.settingInfo == null) {
        return "无";
      } else {
        var paramShowStr = "";
        var params = JSON.parse(row.settingInfo).paramsArr;
        if (params == undefined || params.length == 0) {
          return "无";
        } else {
          for (var i = 0; i < params.length; i++) {
            paramShowStr +=
              params[i].name + " : " + params[i].paramValue + "\r\n";
          }
          // var paramsArr = JSON.stringify(JSON.parse(row.settingInfo).paramsArr);
          return paramShowStr;
        }
      }
    },
    /**
     * 查询列表方法
     */
    getLikeList(query) {
      this.listLoading = true;
      var model = {};
      var runTask = {};
      if (query) {
        if (query.modelName == null || query.modelName == "") {
          model = null;
        } else {
          model = { modelName: query.modelName };
        }
        if (query.runUserName == null || query.runUserName == "") {
          runTask = null;
        } else {
          runTask = { runUserName: query.runUserName };
        }
        if (this.projectUuid != "") {
          resultRelProject = { resultRelProjectUuid: this.projectUuid };
        }
        query.resultRelProject = resultRelProject;
        query.model = model;
        query.runTask = runTask;
        this.pageQuery.condition = query;
      } else {
        var runTaskRel = {};
        var resultRelProject = {};
        if (this.projectUuid != "") {
          resultRelProject = { resultRelProjectUuid: this.projectUuid };
        }
        runTaskRel.resultRelProject = resultRelProject;
        this.pageQuery.condition = runTaskRel;
      }
      selectLikePageVoHandle(this.pageQuery).then((resp) => {
        this.total = resp.data.total;
        this.list = resp.data.records;
        this.listLoading = false;
      });
    },
    /**
     * 当多选框改变时触发
     */
    handleSelectionChange(val) {
      if (val.length <= 0) {
        this.buttonIson.AssociatedBtn = true;
        this.buttonIson.DisassociateBtn = false;
        this.buttonIson.deleteBtn = true;
        this.buttonIson.resultSplitBtn = true;
        this.buttonIson.resultShareBtn = true;
        this.buttonIson.exportBtn = false;
      } else if (val.length == 1) {
        this.buttonIson.AssociatedBtn = false;
        this.buttonIson.DisassociateBtn = false;
        this.buttonIson.deleteBtn = false;
        this.buttonIson.resultSplitBtn = true;
        this.buttonIson.resultShareBtn = false;
        this.buttonIson.exportBtn = false;
      } else if (val.length > 1) {
        this.buttonIson.AssociatedBtn = false;
        this.buttonIson.DisassociateBtn = false;
        this.buttonIson.deleteBtn = false;
        this.buttonIson.resultSplitBtn = false;
        this.buttonIson.resultShareBtn = false;
        this.buttonIson.exportBtn = false;
      }
      this.share.splice(0, this.share.length);
      this.notShare.splice(0, this.notShare.length);
      // 把共享过来的运行结果放进share数组，自己的运行结果放进notShare数组
      for (var i = 0; i < val.length; i++) {
        if (val[i].runResultShare.runResultShareUuid != null) {
          this.share.push(val[i]);
        } else {
          this.notShare.push(val[i]);
        }
      }
      // 把选中的所有数据赋值给selected1，供后续方法使用
      this.selected1 = val;
    },
    handleFilter() {
      this.pageQuery.pageNo = 1;
      this.getLikeList();
    },
    sortChange(data) {
      const { prop, order } = data;
      this.pageQuery.sortBy = order;
      this.pageQuery.sortName = prop;
      this.handleFilter();
    },
    /**
     * 点击删除按钮触发的事件
     */
    deleteRunTaskRel() {
      var selected = this.selected1;
      var tips = "";
      var resultRelProjectUuids = []
      for (var i = 0; i < selected.length; i++) {
        if (selected[i].resultRelProject.resultRelProjectUuid == null) {
          tips += selected[i].model.modelName + " , ";
        }else{
          resultRelProjectUuids.push(selected[i].resultRelProject.resultRelProjectUuid)
        }
      }
      if (tips != "") {
        tips += "不存在项目关联不能删除";
        this.$message({
          message: tips,
        });
      } else {
        batchDeleteResultRelProject(resultRelProjectUuids).then(resp=>{
          if(resp.data==true){
             this.$notify({
              title: this.$t("提示"),
              message: this.$t("删除成功"),
              type: "success",
              duration: 2000,
              position: "bottom-right",
            });
          }else{
          this.$message({
            type: "error",
            message: "移除关联项目失败!",
          });
          }
        })
        this.getLikeList()
      }
    },
    /**
     * 运行类型格式化
     */
    runTypeFormate(row) {
      var runType = row.runTask.runType;
      if (runType == 2) {
        return "定时运行";
      } else if (runType == 3) {
        return "立即运行";
      }
    },
    /**
     * 结果总条数格式化
     */
    dataCountFormatter(row) {
      var tables = row.runResultTables;
      var dataCount = 0;
      for (var i = 0; i < tables.length; i++) {
        if (tables[i].tableType == 1) {
          dataCount = tables[i].dataCount;
        }
      }
      return dataCount;
    },
    /**
     * 查看sql
     * @param row 查看的sql行
     * @returns {string}
     */
    selectSql(row) {
      if (row.settingInfo == null) {
        return "";
      } else {
        var sql = JSON.parse(row.settingInfo).sql;
        this.sqlInfo = sql;
        this.sqlInfoDialog = true;
      }
    },
    /**
     * 处理结果
     */
    handleResult() {
      var selectObj = this.$refs.resultTable.selection;
      if (selectObj.length == 0) {
        this.$message({
          type: "info",
          message: "请选择要处理的模型结果",
        });
        return;
      }
      this.handleIdeaDialog = true;
    },
    /**
     * 修改模型结果的处理意见
     */
    updateHandleResult() {
      var selectObj = this.$refs.resultTable.selection;
      for (let i = 0; i < selectObj.length; i++) {
        //组织处理意见等对象
        selectObj[i].handleState = this.modelResultHandle.handleState;
        selectObj[i].handleIdea = this.modelResultHandle.handleIdea;
        updateRunTaskRel(selectObj[i]).then((result) => {});
        this.handleIdeaDialog = false;
        //处理完成直接修改
      }
    },
  },
};
</script>

