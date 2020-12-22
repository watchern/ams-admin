<template>
  <!-- firstParentTabCon.vue界面是父页签第一个页签中的内容 -->
  <div class="app-container">
    <el-container>
      <el-header>
        <div class="filter-container" >
          <QueryField
            ref="queryfield"
            :form-data="queryFields"
            @submit="getLikeList"
          />
        </div>
      </el-header>
      <el-main>
        <div align="right" style="width: 57%">
          <el-row>
            <el-button
              :disabled="false"
              type="primary"
              size="small"
              @click=""
              title="处理"
              class="oper-btn processing"
              @click="handleResult"
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
          height="450px">
          <el-table-column type="selection" width="55" />
          <el-table-column
            label="模型名称"
            width="300px"
            align="center"
            prop="model.modelName">
            <template slot-scope="scope">
              <a type="text" style="color: #409eff" @click="
                  getResultTables(
                    scope.row.runResultTables,
                    scope.row.model.modelName,
                    scope.row.model.modelUuid,
                    scope.row.runStatus,
                    resultSpiltObjects
                  )">{{ scope.row.model.modelName }}</a>
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
            align="center"
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
            width="200px">
            <template slot-scope="scope">
              <el-link type="primary" @click="selectSql(scope.row)">{{ settingInfoSqlFormatter(scope.row)}}</el-link>
            </template>
          </el-table-column>
          <el-table-column
            label="运行参数"
            prop="settingInfo"
            align="center"
            width="200px"
            :formatter="settingInfoParamsArrFormatter"
          />
          <el-table-column
            label="关联项目"
            prop="projectName"
            align="center"
            width="200px"
          />
             <el-table-column
            label="共享人"
            prop="runResultShare.userName"
            align="center"
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
    <el-dialog v-if="sqlInfoDialog" :visible.sync="sqlInfoDialog" title="SQL信息" width="50%">
      <el-input
        disabled
        type="textarea"
        :rows="15"
        v-model="sqlInfo">
      </el-input>
    </el-dialog>
    <el-dialog
      title="请处理"
      :visible.sync="handleIdeaDialog"
      width="30%"
      :append-to-body="true">
      <div ref="basicInfo">
        <el-form ref="basicInfoForm">
          <el-row>
            <el-col :span="24">
              <el-form-item label="处理状态">
                <el-select style="margin: 5px" v-model="modelResultHandle.handleState">
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
                <el-input v-model="modelResultHandle.handleIdea" type="textarea" :rows="6" placeholder="请输入内容"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
      <el-button @click="handleIdeaDialog = false">取 消</el-button>
      <el-button type="primary" @click="updateHandleResult()">确 定</el-button></span>
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
  addCoverResultRelProject
} from "@/api/analysis/auditmodelresult"
import { selectLikePageVoHandle,updateRunTaskRel } from "@/api/analysis/modelresulthandle"
import { uuid2, addRunTaskAndRunTaskRel } from "@/api/analysis/auditmodel";
import QueryField from "@/components/Ace/query-field/index";
import Pagination from "@/components/Pagination/index";
import { elementInside } from "dropzone";
import runimmediatelycon from "@/views/analysis/auditmodel/runimmediatelycon";
import axios from "axios";
import VueAxios from "vue-axios";
import AV from "leancloud-storage";
import { getParamSettingArr } from "@/api/analysis/auditparam";
import personTree from "@/components/publicpersontree/index";
export default {
  components: { Pagination, QueryField, runimmediatelycon, personTree },
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
      modelResultHandle:{
        handleState:'',
        handleIdea:''
      },
      //处理意见dialog
      handleIdeaDialog:false,
      resultSpiltObjects: {}, //存储点击结果拆分要传往后台的数据
      sqlInfo:"",
      sqlInfoDialog: false, //点击模型结果关联按钮控制人员dialog显示
    };
  },
  created() {
    //判断是不是从项目进来的 如果从项目进来则走项目的权限
    // todo 梁瑞
    let params = this.getQueryString()
    if(params.projectUuid != undefined){
      alert(params.projectUuid)
    }
    else{
      this.getLikeList()
    }
  },
  methods: {
    /**
     *解析url上的参数
     */
    getQueryString() {
      let url = window.location.href
      var params = [],
        h;
      var hash = url.slice(url.indexOf("?") + 1).split('&');
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
          resultSpiltObjects
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
        sql = sql.substring(0,10)
        sql = sql + "..."
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
          var runTask = null;
        } else {
          var runTask = { runUserName: query.runUserName };
        }
        query.model = model;
        query.runTask = runTask;
        this.pageQuery.condition = query;
      }
        selectLikePageVoHandle(this.pageQuery).then(
        (resp) => {
          this.total = resp.data.total;
          this.list = resp.data.records;
          this.listLoading = false;
        }
      );
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
      if (this.share.length == 0 && this.notShare.length == 0) {
        this.$message({ message: "请选择要删除的运行结果" });
      } else if (this.notShare.length != 0 && this.share.length == 0) {
        // 当选中的要删除结果中都是自己的没有别人共享结果的时候
        var flag = true;
        // 判断选中的项目中是否有关联的项目
        for (var i = 0; i < this.notShare.length; i++) {
          if (this.notShare[i].projectName != null) {
            flag = false;
            break;
          }
        }
        // 如果有关联的项目
        if (flag == false) {
          this.$message({
            message: "选择的运行结果有项目关联，请取消关联，再删除！",
          });
        } else {
          // 打开删除提示框
          this.open();
        }
      } else if (this.notShare.length == 0 && this.share.length != 0) {
        // 当选中的要删除结果中没有自己的都是别人共享结果的时候
        // 打开删除提示框
        this.open1();
      } else {
        // 当选中的要删除结果中有自己的也有别人共享结果的时候
        var flag = true;
        // 判断自己的结果中有无项目关联
        for (var i = 0; i < this.notShare.length; i++) {
          if (this.notShare[i].projectName != null) {
            flag = false;
            break;
          }
        }
        if (flag == false) {
          this.$message({
            message: "选择的运行结果有项目关联，请取消关联，再删除！",
          });
        } else {
          // 打开删除提示框
          this.open2();
        }
      }
    },
    /**
     * 打开确认删除弹出层,当勾选中共享结果为0是打开，非共享不为0时调用
     */
    open() {
      this.$confirm("此操作将永久删除该结果, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      })
        .then(() => {
          var ids = [];
          for (var i = 0; i < this.notShare.length; i++) {
            ids[i] = this.notShare[i].runTaskRelUuid;
          }
          batchDeleteRunTaskRel(ids.join(",")).then((resp) => {
            if (resp.data == true) {
              this.getLikeList();
              this.$message({
                type: "success",
                message: "删除成功!",
              });
            } else {
              this.$message({
                type: "error",
                message: "删除失败!",
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
    },
    /**
     * 当共享的长度不为0，非共享长度为0时调用
     */
    open1() {
      this.$confirm("此操作将永久删除该结果, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      })
        .then(() => {
          var ids = [];
          for (var i = 0; i < this.share.length; i++) {
            ids[i] = this.share[i].runResultShare.runResultShareUuid;
          }
          deleteRunResultShare(ids.join(",")).then((resp) => {
            if (resp.data == true) {
              this.getLikeList();
              this.$message({
                type: "success",
                message: "删除成功!",
              });
            } else {
              this.$message({
                type: "error",
                message: "删除失败!",
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
    },
    /**
     * 当共享和非共享都不为0的时候调用
     */
    open2() {
      this.$confirm("此操作将永久删除该结果, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      })
        .then(() => {
          this.success = false;
          this.success1 = false;
          var ids1 = [];
          var ids = [];
          for (var i = 0; i < this.notShare.length; i++) {
            ids1[i] = this.notShare[i].runTaskRelUuid;
          }
          batchDeleteRunTaskRel(ids1.join(",")).then((resp) => {
            if (resp.data == true) {
              this.success = true;
            }
          });
          for (var i = 0; i < this.share.length; i++) {
            ids[i] = this.share[i].runResultShare.runResultShareUuid;
          }
          deleteRunResultShare(ids.join(",")).then((resp) => {
            if (resp.data == true) {
              this.success1 = true;
            }
            if (this.success == true && this.success1 == true) {
              this.getLikeList();
              this.$message({
                type: "success",
                message: "删除成功!",
              });
            } else {
              this.$message({
                type: "error",
                message: "删除失败!",
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
    selectSql(row){
      if (row.settingInfo == null) {
        return ""
      } else {
        var sql = JSON.parse(row.settingInfo).sql
        this.sqlInfo = sql
        this.sqlInfoDialog = true
      }
    },
    /**
     * 处理结果
     */
    handleResult(){
      var selectObj = this.$refs.resultTable.selection
      if(selectObj.length == 0){
        this.$message({
          type: "info",
          message: "请选择要处理的模型结果",
        })
        return
      }
      this.handleIdeaDialog = true
    },
    /**
     * 修改模型结果的处理意见
     */
    updateHandleResult(){
      var selectObj = this.$refs.resultTable.selection
      for(let i = 0;i < selectObj.length;i++){
        //组织处理意见等对象
        selectObj[i].handleState = this.modelResultHandle.handleState
        selectObj[i].handleIdea = this.modelResultHandle.handleIdea
        updateRunTaskRel(selectObj[i]).then(result => {})
        this.handleIdeaDialog = false
        //处理完成直接修改
      }
    }
  },
};
</script>

