<template>
  <!-- firstParentTabCon.vue界面是父页签第一个页签中的内容 -->
  <div class="app-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getLikeList"
      />
    </div>
    <div align="right" style="width: 70%">
      <el-row>
        <el-button
          type="primary"
          @click="relationProject('453453', '项目2')"
          :disabled="buttonIson.AssociatedBtn"
          class="oper-btn refresh"
        ></el-button>
        <el-button
          type="danger"
          @click="RemoverelationProject('asdasdasdas')"
          :disabled="buttonIson.DisassociateBtn"
        >移除项目关联</el-button
        >
        <el-button
          :disabled="buttonIson.deleteBtn"
          type="danger"
          @click="deleteRunTaskRel"
          class="oper-btn delete"
        ></el-button>
        <el-button
          type="primary"
          :disabled="buttonIson.resultSplitBtn"
          class="oper-btn split-2"
        ></el-button>
        <el-button
          type="primary"
          @click="modelResultShare('99999', '888888')"
          :disabled="buttonIson.resultShareBtn"
          class="oper-btn share"
        ></el-button>
        <el-button
          type="primary"
          @click="exportExcel"
          :disabled="buttonIson.exportBtn"
          class="oper-btn export-2"
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
      style="overflow-x: scroll; width: 70%"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        label="模型名称"
        width="100px"
        align="center"
        prop="model.modelName"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="
              getResultTables(
                scope.row.runResultTables,
                scope.row.model.modelName,
                scope.row.model.modelUuid,
                scope.row.runStatus
              )
            "
          >{{ scope.row.model.modelName }}</el-button
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
        label="定时运行时间"
        width="200px"
        align="center"
        prop="runEndTime"
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
        :formatter="settingInfoSqlFormatter"
      />
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
      />
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
      <el-table-column fixed="right" label="操作" width="150px">
        <template slot-scope="scope">
          <el-button type="primary" @click="reRun(scope.row)"
          >重新运行</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="设置定时时间"
      :visible.sync="settingTimingIsSee"
      width="30%"
    >
      <el-date-picker
        v-model="setDateTime"
        type="datetime"
        placeholder="选择日期时间"
      >
      </el-date-picker>
      <span slot="footer" class="dialog-footer">
        <el-button @click="settingTimingIsSee = false">取 消</el-button>
        <el-button type="primary" @click="afterSettingTime">确 定</el-button>
      </span>
    </el-dialog>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="pageQuery.pageNo"
      :limit.sync="pageQuery.pageSize"
      @pagination="getLikeList"
    />
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
  } from "@/api/analysis/auditmodelresult";
  import QueryField from "@/components/Ace/query-field/index";
  import Pagination from "@/components/Pagination/index";
  import { elementInside } from "dropzone";
  import axios from "axios";
  import VueAxios from "vue-axios";
  import AV from "leancloud-storage";
  import { getParamSettingArr } from "@/api/analysis/auditparam";
  export default {
    components: { Pagination, QueryField },
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
        settingTimingIsSee: false,
        setDateTime: "",
        nowRunTaskRel: null,
      };
    },
    created() {
      this.getLikeList();
    },
    methods: {
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
          var timeFormat =
            year + "-" + month + "-" + day + " " + hh + ":" + mm + ":" + ss;
          return timeFormat;
        }
        return "";
      },
      dateFormatter2(row) {
        const datetime = row.timingExecute;
        if (datetime) {
          var dateMat = new Date(datetime);
          var year = dateMat.getFullYear();
          var month = dateMat.getMonth() + 1;
          var day = dateMat.getDate();
          var hh = dateMat.getHours();
          var mm = dateMat.getMinutes();
          var ss = dateMat.getSeconds();
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
        getRunTaskRelByPage(this.pageQuery).then((resp) => {
          this.total = resp.data.total;
          this.list = resp.data.records;
          this.listLoading = false;
        });
      },
      /**
       * 当多选框改变时触发
       */
      //      buttonIson:{AssociatedBtn:true,DisassociateBtn:true,deleteBtn:true,resultSplitBtn:true,resultShareBtn:true,exportBtn:false}
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
          this.buttonIson.resultSplitBtn = false;
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
          alert("请选择要删除的运行结果");
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
            alert("选择的运行结果有项目关联，请取消关联，再删除！");
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
            alert("选择的运行结果有项目关联，请取消关联，再删除！");
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
       * 关联项目按钮触发
       */
      relationProject(projectId, projctName) {
        var selected2 = this.selected1;
        var flag = true;
        // 判断勾选的结果是否已经关联了选中的项目
        for (var i = 0; i < selected2.length; i++) {
          var flag = true;
          if (selected2[i].projectName) {
            var m = selected2[i].projectName.split(",");
            for (var j = 0; j < m.length; j++) {
              if (m[j] == projctName) {
                flag = false;
                break;
              }
            }
          }
        }
        if (selected2.length == 0) {
          alert("请选择运行结果");
        } else if (flag == false) {
          alert("选中的运行结果中，存在已关联该项目的结果");
        } else {
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
            if (resp.data == true) {
              this.getLikeList();
              this.$message({
                type: "success",
                message: "关联成功!",
              });
            } else {
              this.$message({
                type: "error",
                message: "关联失败!",
              });
            }
          });
        }
      },
      /**
       * 移除项目关联
       */
      RemoverelationProject(resultRelProjectUuid) {
        console.log(this.selected1);
        rmResultRelProjectlr(resultRelProjectUuid).then((resp) => {
          if (resp.data == true) {
            this.getLikeList();
            this.$message({
              type: "success",
              message: "取消关联成功!",
            });
          } else {
            this.$message({
              type: "error",
              message: "取消关联失败!",
            });
          }
        });
      },
      /**
       * 结果共享
       */
      modelResultShare(runTaskRelUuid, userUuid) {
        var runResultShare = {
          runTaskRelUuid: runTaskRelUuid,
          userUuid: userUuid,
        };
        insertRunResultShare(runResultShare).then((resp) => {
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
        });
      },
      /**
       * val是运行结果中的resultTables
       * modelName是选中的模型的名字
       */
      getResultTables(val, modelName, modelUuid, runStatus) {
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
          this.$emit("addtab", assistTables, mainTable, modelName, modelUuid);
        } else {
          this.$message({
            type: "info",
            message: "该运行结果不是成功状态",
          });
        }
      },
      reRun(runTaskRel) {
        var runType = runTaskRel.runTask.runType;
        this.nowRunTaskRel = runTaskRel;
        if (runType == 3) {
          reRunRunTask(runTaskRel).then((resp) => {
            if (resp.data == true) {
              this.getLikeList();
            } else {
              this.$message({ type: "info", message: "重新执行失败!" });
            }
          });
        } else if (runType == 2) {
          this.settingTimingIsSee = true;
        }
      },
      runTypeFormate(row) {
        var runType = row.runTask.runType;
        if (runType == 2) {
          return "定时运行";
        } else if (runType == 3) {
          return "立即运行";
        }
      },
      executeProgressFormate(executeProgress) {
        if (executeProgress == null) {
          return 0;
        } else {
          var executeProgress1 = parseInt(executeProgress);
          return executeProgress1;
        }
      },
      afterSettingTime() {
        reRunRunTask(this.nowRunTaskRel, this.setDateTime).then((resp) => {
          if (resp.data == true) {
            this.getLikeList();
          } else {
            this.$message({ type: "info", message: "重新执行失败!" });
          }
        });
        this.settingTimingIsSee = false;
      },
    },
  };
</script>

