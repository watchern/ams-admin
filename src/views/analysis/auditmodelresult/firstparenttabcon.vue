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
      <el-main style="width: 91.8vw">
        <div align="right">
          <el-row>
            <el-dropdown>
              <el-button
                type="primary"
                @click="openProjectDialog"
                :disabled="buttonIson.AssociatedBtn"
                class="oper-btn link-2"
                title="分配项目"
              ></el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="modelResultOpenDialog">分配项目</el-dropdown-item>
                <el-dropdown-item @click.native="modelResultOpenDialog">结果分配</el-dropdown-item>
                <el-dropdown-item @click.native="RemoverelationProject">移除分配项目</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
<!--            <el-button-->
<!--              type="primary"-->
<!--              @click="openProjectDialog"-->
<!--              :disabled="buttonIson.AssociatedBtn"-->
<!--              class="oper-btn link-2"-->
<!--              title="分配项目"-->
<!--            ></el-button>-->
<!--            <el-button-->
<!--              type="primary"-->
<!--              @click="modelResultOpenDialog()"-->
<!--              :disabled="buttonIson.resultShareBtn"-->
<!--              class="oper-btn share"-->
<!--              title="结果分配"-->
<!--            ></el-button>-->
<!--            &lt;!&ndash; relationProject('4534532', '项目5') &ndash;&gt;-->
<!--            <el-button-->
<!--              type="primary"-->
<!--              @click="RemoverelationProject()"-->
<!--              :disabled="buttonIson.DisassociateBtn"-->
<!--              class="oper-btn move"-->
<!--              title="移除分配项目"-->
<!--            ></el-button>-->
            <el-button
              type="primary"
              :disabled="buttonIson.resultSplitBtn"
              class="oper-btn split-2"
              @click="openResultSplitDialog"
              title="结果拆分"
              style="margin-left: 10px"
            ></el-button>
            <el-button
              type="primary"
              @click="exportExcel"
              :disabled="buttonIson.exportBtn"
              class="oper-btn export-2"
              title="结果导出"
            ></el-button>
            <el-button
              :disabled="buttonIson.deleteBtn"
              type="primary"
              @click="deleteRunTaskRel"
              class="oper-btn delete"
              title="结果删除"
            ></el-button>
          </el-row>
        </div>
        <el-table
          id="table"
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
          <el-table-column type="selection" width="55" />
          <el-table-column
            label="模型名称"
            width="300px"
            align="center"
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
            label="运行状态"
            width="100px"
            align="center"
            prop="runStatus"
            :formatter="readStatusFormatter"
            ><template slot-scope="scope">
              <i
                :class="runStatusIconFormatter(scope.row.runStatus)"
                :style="runStatusStyleFormatter(scope.row.runStatus)"
              ></i> </template
          ></el-table-column>
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
            label="执行进度"
            prop="executeProgress"
            align="center"
            width="200px"
          >
            <template slot-scope="scope">
              <el-progress
                :percentage="executeProgressFormate(scope.row.executeProgress)"
                :color="customColorMethod(scope.row.executeProgress)"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="结果总条数"
            width="100px"
            align="center"
            prop="runResultTables"
            :formatter="dataCountFormatter"
          />
          <el-table-column
            label="定时运行时间"
            width="200px"
            align="center"
            prop="runTask.timingExecute"
            :formatter="dateFormatter2"
          />
          <el-table-column
            label="运行开始时间"
            width="200px"
            align="center"
            prop="runStartTime"
            :formatter="dateFormatter"
          />
          <el-table-column
            label="运行结束时间"
            width="200px"
            align="center"
            prop="runEndTime"
            :formatter="dateFormatter1"
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
            align="center"
            width="200px"
            :formatter="settingInfoParamsArrFormatter"
          />
          <el-table-column
            label="运行信息"
            prop="runMessage"
            align="center"
            width="200px"
          >
            <template slot-scope="scope">
              <el-link type="primary" @click="selectrunMessage(scope.row)">{{
                runMessageFormatter(scope.row)
              }}</el-link>
            </template>
          </el-table-column>
          <el-table-column
            label="关联项目"
            prop="projectName"
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
          <el-table-column
            fixed="right"
            label="操作"
            width="150px"
            align="center"
          >
            <template slot-scope="scope">
              <div>
                <a
                  v-if="scope.row.runStatus == 4"
                  @click="reRunReParam(scope.row)"
                  style="color: #409eff"
                  >重新运行</a
                >
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-dialog
          title="模型运行设置-立即"
          :visible.sync="runimmediatelyIsSee"
          width="60%"
          :append-to-body="true"
        >
          <runimmediatelycon
            v-if="runimmediatelyIsSee"
            ref="modelsetting"
            :timing="false"
            :models="this.currentData"
          />
          <span slot="footer" class="dialog-footer">
            <el-button @click="runimmediatelyIsSee = false">取 消</el-button>
            <el-button type="primary" @click="modelRunSetting">确 定</el-button>
          </span>
        </el-dialog>
        <el-dialog
          title="模型运行设置-定时"
          :visible.sync="timingExecutionIsSee"
          width="60%"
          :append-to-body="true"
        >
          <runimmediatelycon
            v-if="timingExecutionIsSee"
            ref="modelsetting"
            :timing="true"
            :models="this.currentData"
          />
          <span slot="footer" class="dialog-footer">
            <el-button @click="timingExecutionIsSee = false">取 消</el-button>
            <el-button type="primary" @click="modelRunSetting">确 定</el-button>
          </span>
        </el-dialog>
        <el-dialog
          title="结果拆分"
          :visible.sync="resultSplitDialogIsSee"
          width="40%"
        >
          <div align="center">
            <span>要拆分的数据：</span>
            <el-select
              multiple
              style="width: 50%"
              size="medium"
              v-model="selectedValue"
              placeholder="请选择"
            >
              <el-option
                v-for="(item, key) in ResultSplitoptions"
                :key="key"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="resultSplitDialogIsSee = false">取 消</el-button>
            <el-button type="primary" @click="ResultSplitDialogDetermine"
              >确 定</el-button
            >
          </span>
        </el-dialog>
        <el-dialog
          title="请选择要分享的人员"
          :visible.sync="resultShareDialogIsSee"
          width="50%"
        >
          <personTree ref="orgPeopleTree"></personTree>
          <span slot="footer" class="dialog-footer">
            <el-button @click="resultShareDialogIsSee = false">取 消</el-button>
            <el-button type="primary" @click="modelResultShare"
              >确 定</el-button
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
      v-if="runMessageInfoDialog"
      :visible.sync="runMessageInfoDialog"
      title="运行信息"
      width="50%"
    >
      <el-input disabled type="textarea" :rows="15" v-model="runMessageInfo">
      </el-input>
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
  sendToOA,
  deleteRunResultShareByRunTaskRelUuid
} from "@/api/analysis/auditmodelresult";
import { uuid2, addRunTaskAndRunTaskRel } from "@/api/analysis/auditmodel";
import QueryField from "@/components/Ace/query-field/index";
import Pagination from "@/components/Pagination/index";
import { elementInside } from "dropzone";
import runimmediatelycon from "@/views/analysis/auditmodel/runimmediatelycon";
import axios from "axios";
import VueAxios from "vue-axios";
import AV from "leancloud-storage";
import userProject from "@/views/base/userproject/index";
import { getParamSettingArr } from "@/api/analysis/auditparam";
import personTree from "@/components/publicpersontree/index";
export default {
  components: {
    Pagination,
    QueryField,
    runimmediatelycon,
    personTree,
    userProject,
  },
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
        DisassociateBtn: true,
        deleteBtn: true,
        resultSplitBtn: true,
        resultShareBtn: true,
        exportBtn: false,
      },
      sqlInfoDialog: false,
      runMessageInfoDialog: false,
      setDateTime: "",
      nowRunTaskRel: null,
      //单次/多次/周期执行的周期开始结束时间 执行时间选择配置
      executeTimeOptions: {
        disabledDate(time) {
          //不能选择小于当前日志的事件
          return (
            new Date(time.toLocaleDateString()) <
            new Date(new Date().toLocaleDateString())
          );
        },
      },
      runimmediatelyIsSee: false,
      timingExecutionIsSee: false,
      currentData: [],
      resultSplitDialogIsSee: false, //结果拆分dialog是否可见
      ResultSplitoptions: [], //存储结果拆分dialog的下拉框中的数据
      selectedValue: [], //结果查分下拉框选中的值
      resultSpiltedRunResultRel: [], //存储进行结果拆分的模型任务关联对象
      resultSpiltObjects: {}, //存储点击结果拆分要传往后台的数据
      resultShareDialogIsSee: false, //点击模型结果关联按钮控制人员dialog显示
      projectDialogIsSee: false, //关联项目dialog是否可见
    };
  },
  created() {
    this.getLikeList();
  },
  methods: {
    openProjectDialog() {
      var flag = true;
      for (var i = 0; i < this.selected1.length; i++) {
        if (this.selected1[i].runStatus != 3) {
          flag = false;
          break;
        }
      }
      if(flag){
        this.projectDialogIsSee = true;
      }else{
        this.$message({
            message: "未运行成功的结果不能分配项目",
         });
      }
    },
    /**
     * 导出方法
     */
    exportExcel() {
      axios({
        method: "get",
        url: "/analysis/RunTaskRelController/exportRunTaskRelTable",
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
    customColorMethod(percentage) {
      if (percentage < 30) {
        return "#909399";
      } else if (percentage < 70) {
        return "#e6a23c";
      } else {
        return "#67c23a";
      }
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
        if(sql==null){
          return ''
        }else{
        sql = sql.substring(0, 10);
        sql = sql + "...";
        return sql;
        }
      }
    },
    runMessageFormatter(row, column) {
      if (row.runMessage == null) {
        return "";
      } else {
        var runMessage = row.runMessage;
        runMessage = runMessage.substring(0, 4);
        runMessage = runMessage + "...";
        return runMessage;
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
        if (params == undefined) {
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
     * 格式化已阅状态
     * @param row 行数据
     * @param column 列数据
     * @returns {string} 返回格式化后的数据
     */
    readStatusFormatter(row, column) {
      var status = row.runStatus;
      if (status == 1) {
        return "待运行";
      } else if (status == 2) {
        return "运行中";
      } else if (status == 3) {
        return "运行成功";
      } else {
        return "运行失败";
      }
    },
    /**
     * 运行状态图标展示
     */
    runStatusIconFormatter(status) {
      if (status == 1) {
        return "el-icon-video-play";
      } else if (status == 2) {
        return "el-icon-loading";
      } else if (status == 3) {
        return "el-icon-success";
      } else {
        return "el-icon-error";
      }
    },
    /**
     * 运行状态图标颜色
     */
    runStatusStyleFormatter(status) {
      if (status == 1) {
        return "color:blue";
      } else if (status == 2) {
        return "el-icon-loading";
      } else if (status == 3) {
        return "color:green";
      } else {
        return "color:red";
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
      getRunTaskRelByPage(this.pageQuery, this.resultSpiltObjects).then(
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
        this.buttonIson.DisassociateBtn = true;
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
        // 判断选中的项目中是否有分配的项目
        for (var i = 0; i < this.notShare.length; i++) {
          if (this.notShare[i].projectName != null) {
            flag = false;
            break;
          }
        }
        // 如果有分配的项目
        if (flag == false) {
          this.$message({
            message: "选择的运行结果有项目分配，请取消分配，再删除！",
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
        // 判断自己的结果中有无项目分配
        for (var i = 0; i < this.notShare.length; i++) {
          if (this.notShare[i].projectName != null) {
            flag = false;
            break;
          }
        }
        if (flag == false) {
          this.$message({
            message: "选择的运行结果有项目分配，请取消分配，再删除！",
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
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
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
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
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
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
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
     * 选择项目后点击dialog的确定按钮触发
     */
    determineProject() {
      var projects = this.$refs.userproject.getSelectValue();

        if (projects.length === 0) {
          this.$message({
            message: "请选择要分配的项目",
          });
        } else if (projects.length === 1) {
          this.relationProject(
            projects[0].PRJ_PROJECT_UUID,
            projects[0].PRJ_NAME
          );
          this.projectDialogIsSee = false;
        } else {
          this.$message({
            message: "只能分配一个项目",
          });
        }
    },
    /**
     * 分配项目按钮触发
     */
    relationProject(projectId, projctName) {
      var selected2 = this.selected1;
      if (selected2.length == 0) {
        this.$message({ message: "请选择运行结果" });
      } else {
        this.listLoading = true;
        if (this.resultSpiltObjects.orgNameValues != undefined) {
          var mainTableUuids = [];
          var selectRunTaskRelUuid = [];
          for (var i = 0; i < this.selected1.length; i++) {
            selectRunTaskRelUuid.push(this.selected1[i].runTaskRelUuid);
            var runResultTables = this.selected1[i].runResultTables;
            for (var j = 0; j < runResultTables.length; j++) {
              if (runResultTables[j].tableType == 1) {
                mainTableUuids.push(runResultTables[j].runResultTableUuid);
              }
            }
          }
          selectPrimaryKeyByTableName().then((resp) => {
            var primaryKey = resp.data;
            getDataAfterResultSpiltToRelateProject(
              this.resultSpiltObjects,
              projectId,
              projctName,
              selectRunTaskRelUuid
            ).then((resp) => {
              if (resp.data == true) {
                this.listLoading = false;
                this.getLikeList();
                this.$message({
                  type: "success",
                  message: "分配成功!",
                });
              } else {
                this.listLoading = false;
                this.$message({
                  type: "error",
                  message: "分配失败!",
                });
              }
            });
          });
        } else {
          this.listLoading = true;
          var resultRelPro = [];
          for (var i = 0; i < selected2.length; i++) {
            var resultRelProject = {
              runTaskRelUuid: selected2[i].runTaskRelUuid,
              projectUuid: projectId,
              projectName: projctName,
            };
            resultRelPro.push(resultRelProject);
          }
          ResultRelProject(resultRelPro).then((resp) => {
            var flag = resp.data.flag;
            var resultRelProjects = resp.data.resultRelProjects;
            if (flag == "haveRelated") {
              var modelNames = [];
              for (var i = 0; i < resultRelProjects.length; i++) {
                for (var j = 0; j < this.selected1.length; j++) {
                  if (
                    resultRelProjects[i].runTaskRelUuid ==
                    this.selected1[j].runTaskRelUuid
                  ) {
                    modelNames.push(this.selected1[j].model.modelName);
                  }
                }
              }
              var resultRelPros = [];
              for (var i = 0; i < selected2.length; i++) {
                var resultRelProject = {
                  runTaskRelUuid: selected2[i].runTaskRelUuid,
                  projectUuid: projectId,
                  projectName: projctName,
                };
                resultRelPros.push(resultRelProject);
              }
              addCoverResultRelProject(resultRelPros).then((resp) => {
                if (resp.data == true) {
                  var message = "分配成功！其中  ";
                  for (var i = 0; i < modelNames.length; i++) {
                    message += modelNames[i] + " , ";
                  }
                  this.getLikeList();
                  this.listLoading = false;
                  message += "之前分配的项目已被覆盖";
                  this.listLoading = false;
                  this.$message({ type: "success", message: message });
                } else {
                  this.listLoading = false;
                  this.$message({
                    type: "error",
                    message: "分配失败!",
                  });
                }
              });
            } else if (flag == true) {
              this.listLoading = false;
              this.getLikeList();
              this.$message({
                type: "success",
                message: "分配成功!",
              });
            } else if (flag == false) {
              this.listLoading = false;
              this.$message({
                type: "error",
                message: "分配失败!",
              });
            }
          });
        }
      }
    },
    /**
     * 移除项目分配
     */
    RemoverelationProject() {
      var ids = [];
      for (var i = 0; i < this.selected1.length; i++) {
        ids.push(this.selected1[i].runTaskRelUuid);
      }
      var resultRelProjectUuids = ids.join(",");
      rmResultRelProjectlr(resultRelProjectUuids).then((resp) => {
        deleteRunResultShareByRunTaskRelUuid(resultRelProjectUuids).then(resp =>{
          if (resp.data == true) {
            this.getLikeList();
            this.$message({
              type: "success",
              message: "取消分配成功!",
            });
          } else {
            this.$message({
              type: "error",
              message: "取消分配失败!",
            });
          }
        })
      });
    },
    /**
     * 结果共享
     */
    modelResultShare() {
      this.listLoading = true;
      var runTaskRelUuids = [];
      var personUuids = [];
      var personNames = []
      var selectedNode = this.$refs.orgPeopleTree.getSelectValue();
      for (var i = 0; i < selectedNode.length; i++) {
        personUuids.push(selectedNode[i].personuuid);
        personNames.push(selectedNode[i].cnname);
      }
      for (var i = 0; i < this.selected1.length; i++) {
        runTaskRelUuids.push(this.selected1[i].runTaskRelUuid);
      }
      if (personUuids.length > 0) {
        insertRunResultShare(runTaskRelUuids, personUuids,personNames).then((resp) => {
          this.listLoading = false;
          if (resp.data == true) {
            this.$message({
              type: "success",
              message: "结果共享成功!",
            });
          } else {
            this.$message({
              type: "error",
              message: "结果共享失败!",
            });
          }
          this.resultShareDialogIsSee = false;
        });
      } else {
        this.listLoading = false;
        this.$message({
          message: "请选择要分配的人员！",
        });
      }
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
     * 执行进度格式化
     */
    executeProgressFormate(executeProgress) {
      if (executeProgress == null) {
        return 0;
      } else {
        var executeProgress1 = parseInt(executeProgress);
        return executeProgress1;
      }
    },
    /**
     * 重新运行功能
     */
    reRunReParam(runTaskRel) {
      var runType = runTaskRel.runTask.runType;
      this.nowRunTaskRel = runTaskRel;
      this.currentData = [];
      this.currentData.push(runTaskRel.model);
      if (runType == 3) {
        this.runimmediatelyIsSee = true;
      } else if (runType == 2) {
        this.timingExecutionIsSee = true;
      }
    },
    /**
     * 添加运行任务和运行任务分配表
     */
    modelRunSetting() {
      var runType = this.nowRunTaskRel.runTask.runType;
      var results = this.$refs.modelsetting.replaceParams();
      this.replacedInfo = results.replaceInfo;
      var modelResultSavePathId = results.modelResultSavePathId;
      var dateTime = results.dateTime;
      var settingInfo = {
        sql: this.replacedInfo[0].sql,
        paramsArr: this.replacedInfo[0].paramsArr,
      };
      this.nowRunTaskRel.model = results.models[0];
      this.nowRunTaskRel.settingInfo = settingInfo;
      this.nowRunTaskRel.locationUuid = modelResultSavePathId;
      if (this.timingExecutionIsSee) {
        if (dateTime == "") {
          this.$message({
            message: "请输入定时时间",
            type: "warning",
          });
        } else if (this.replacedInfo[0].sql == "") {
          this.$message({
            message: "请输入参数",
            type: "warning",
          });
        } else if (modelResultSavePathId == "") {
          this.$message({
            message: "请选择模型结果保存路径",
            type: "warning",
          });
        } else {
          if (runType == 3) {
            reRunRunTask(this.nowRunTaskRel).then((resp) => {
              if (resp.data == true) {
                this.getLikeList();
              } else {
                this.$message({ type: "info", message: "重新执行失败!" });
              }
            });
          } else if (runType == 2) {
            reRunRunTask(this.nowRunTaskRel, dateTime).then((resp) => {
              if (resp.data == true) {
                this.getLikeList();
              } else {
                this.$message({ type: "info", message: "重新执行失败!" });
              }
            });
          }
          this.runimmediatelyIsSee = false;
          this.timingExecutionIsSee = false;
        }
      } else if (this.runimmediatelyIsSee) {
        if (this.replacedInfo[0].sql == "") {
          this.$message({
            message: "请输入参数",
            type: "warning",
          });
        } else if (modelResultSavePathId == "") {
          this.$message({
            message: "请选择模型结果保存路径",
            type: "warning",
          });
        } else {
          if (runType == 3) {
            reRunRunTask(this.nowRunTaskRel).then((resp) => {
              if (resp.data == true) {
                this.getLikeList();
              } else {
                this.$message({ type: "info", message: "重新执行失败!" });
              }
            });
          } else if (runType == 2) {
            reRunRunTask(this.nowRunTaskRel, dateTime).then((resp) => {
              if (resp.data == true) {
                this.getLikeList();
              } else {
                this.$message({ type: "info", message: "重新执行失败!" });
              }
            });
          }
          this.runimmediatelyIsSee = false;
          this.timingExecutionIsSee = false;
        }
      }
    },
    /**
     * 点击结果拆分后打开dialog方法
     */
    openResultSplitDialog() {
      this.listLoading = true;
      this.ResultSplitoptions = [];
      var flag = true;
      for (var i = 0; i < this.selected1.length; i++) {
        if (this.selected1[i].runStatus != 3) {
          flag = false;
          break;
        }
      }
      if (flag == true) {
        getResultSplitSelectData(this.selected1).then((resp) => {
          this.resultSpiltObjects.orgNameColumnList =
            resp.data.orgNameColumnList;
          this.resultSpiltObjects.orgUuidColumnList =
            resp.data.orgUuidColumnList;
          var message = resp.data.message;
          var result = resp.data.selectValue;
          if (message == "") {
            for (var i = 0; i < result.length; i++) {
              var option = {
                value: result[i].org_uuid + "," + result[i].org_name,
                label: result[i].org_uuid + "(" + result[i].org_name + ")",
              };
              this.ResultSplitoptions.push(option);
            }
            this.listLoading = false;
            this.resultSplitDialogIsSee = true;
          } else {
            this.listLoading = false;
            this.$message({
              showClose: true,
              message: message,
            });
          }
        });
      } else {
        this.listLoading = false;
        this.$message({
          showClose: true,
          message: "只有运行成功的才可以结果拆分",
        });
      }
    },
    /**
     * 点击结果拆分确定按钮触发的事件
     */
    ResultSplitDialogDetermine() {
      var selectValue = this.selectedValue;
      var orgNameValues = [];
      var orgUuidValues = [];
      for (var i = 0; i < selectValue.length; i++) {
        var eachValue = selectValue[i].split(",");
        orgNameValues[i] = eachValue[1];
        orgUuidValues[i] = eachValue[0];
      }
      this.resultSpiltObjects.orgUuidValues = orgUuidValues;
      this.resultSpiltObjects.orgNameValues = orgNameValues;
      this.resultSpiltObjects.resultSpiltedRunResultRel = this.selected1;
      this.getLikeList();
      this.resultSplitDialogIsSee = false;
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
    selectrunMessage(row) {
      if (row.runMessage == null) {
        return "";
      } else {
        var runMessage = row.runMessage;
        this.runMessageInfo = runMessage;
        this.runMessageInfoDialog = true;
      }
    },
    modelResultOpenDialog() {
      this.resultShareDialogIsSee = true;
    },
    sendToOA() {
      const dataUserId = this.$store.getters.datauserid;
      const dataUserName = this.$store.getters.datausername;
      var runTaskRelUuid = this.selected1[0].runTaskRelUuid;
      sendToOA(runTaskRelUuid, dataUserId, dataUserName).then((resp) => {
        this.$message({
          type: "success",
          message: "发送成功!",
        });
      });
    },
  },
};
</script>

