<template>
  <div class="admin_right_main">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="待办列表" name="todoList">
        <!-- <div class="filter-container">
          <QueryField ref="queryfield" :form-data="queryFields" @submit="queryTodo" />
        </div> -->
        <div class="table_template">
          <div
            class="table_header"
            v-if="
              tableOption.isShowHeader != undefined
                ? tableOption.isShowHeader
                : true
            "
          >
            <div class="table_header_default">
              <div class="table_header_default_title">
                <div class="marginR40">
                  <span class="title_font">待办列表</span>
                </div>
              </div>
            </div>
          </div>
          <el-table
            ref="todoTable"
            :data="todoData"
            border
            :max-height="tableHeight"
            style="width: 100%"
            @selection-change="handleSelectionChange"
            :height="
              disp == true
                ? screenHeight - 360 + 'px'
                : screenHeight - 198 + 'px'
            "
          >
            <el-table-column type="selection"></el-table-column>
            <el-table-column label="序号" type="index"></el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              prop="applyTitle"
              label="标题"
              width
            >
              <template slot-scope="scope">
                <el-link
                  @click="todo(scope.row)"
                  v-model="scope.row.applyTitle"
                  type="primary"
                  :underline="false"
                  class="linkClass"
                  >{{ scope.row.applyTitle }}</el-link
                >
              </template>
            </el-table-column>
            <el-table-column
              prop="applyTypeName"
              label="审批类型"
              show-overflow-tooltip
              width
            ></el-table-column>
            <el-table-column
              prop="createPersonName"
              label="申请人"
              show-overflow-tooltip
              width
            ></el-table-column>
            <el-table-column
              prop="applyTime"
              label="申请时间"
              show-overflow-tooltip
              width
            ></el-table-column>
            <el-table-column
              prop="fromDate"
              label="到达时间"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="viewProcess"
              label="流程跟踪"
              show-overflow-tooltip
              width
            >
              <template slot-scope="scope">
                <el-link
                  @click="todoOpinionList(scope.row)"
                  type="primary"
                  :underline="false"
                  class="linkClass"
                  >流程跟踪</el-link
                >
              </template>
            </el-table-column>
          </el-table>

          <div class="table_page">
            <el-pagination
              @size-change="handleSizeChange"
              :page-sizes="pageArr"
              @current-change="todoCurChange"
              :current-page="todoCurPage"
              :page-size="todoPageSize"
              layout="total,sizes, prev, pager, next, jumper"
              style="
                width: 100%;
                position: relative;
                display: flex;
                justify-content: flex-end;
                padding: 0 20px;
              "
              :total="todoTotal"
            ></el-pagination>
          </div>
        </div>
        <el-dialog
          title="流程跟踪"
          :visible.sync="todoFlow"
          v-if="todoFlow"
          width="80%"
        >
          <div>
            <flowOpinionList :applyUuid="applyUuid"></flowOpinionList>
          </div>
          <span slot="footer">
            <el-button
              size="mini"
              type="info"
              class="table_header_btn"
              @click="todoFlow = false"
              >关闭</el-button
            >
          </span>
        </el-dialog>
      </el-tab-pane>
      <el-tab-pane label="已办列表" name="doneList">
        <!-- <div class="filter-container">
          <QueryField ref="queryfield" :form-data="queryFields" @submit="queryDone" />
        </div> -->
        <div class="table_template">
          <div
            class="table_header"
            v-if="
              tableOption.isShowHeader != undefined
                ? tableOption.isShowHeader
                : true
            "
          >
            <div class="table_header_default">
              <div class="table_header_default_title">
                <div class="marginR40">
                  <span class="title_font">已办列表</span>
                </div>
              </div>
            </div>
          </div>
          <el-table
            ref="doneTable"
            :data="doneData"
            border
            :max-height="tableHeight"
            style="width: 100%"
            @selection-change="handleSelectionChange"
            :height="
              disp == true
                ? screenHeight - 360 + 'px'
                : screenHeight - 198 + 'px'
            "
          >
            <el-table-column type="selection"></el-table-column>
            <el-table-column label="序号" type="index"></el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              prop="applyTitle"
              label="标题"
              width
            >
              <template slot-scope="scope">
                <el-link
                  @click="done(scope.row)"
                  v-model="scope.row.applyTitle"
                  type="primary"
                  :underline="false"
                  class="linkClass"
                  >{{ scope.row.applyTitle }}</el-link
                >
              </template>
            </el-table-column>
            <el-table-column
              prop="applyTypeName"
              label="审批类型"
              show-overflow-tooltip
              width
            ></el-table-column>
            <el-table-column
              prop="createPersonName"
              label="申请人"
              show-overflow-tooltip
              width
            ></el-table-column>
            <el-table-column
              prop="applyTime"
              label="申请时间"
              show-overflow-tooltip
              width
            ></el-table-column>
            <el-table-column
              prop="fromDate"
              label="到达时间"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="thruDate"
              label="完成时间"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="applyState"
              label="处理结果"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>{{
                  dict.toName("auditStatus", scope.row.applyState)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="flowTrack"
              label="流程跟踪"
              show-overflow-tooltip
              width
            >
              <template slot-scope="scope">
                <el-link
                  @click="doneOpinionList(scope.row)"
                  type="primary"
                  :underline="false"
                  class="linkClass"
                  >流程跟踪</el-link
                >
              </template>
            </el-table-column>
          </el-table>

          <div class="table_page">
            <el-pagination
              @size-change="donehandleSizeChange"
              :page-sizes="donepageArr"
              @current-change="doneCurChange"
              :current-page="doneCurPage"
              :page-size="donePageSize"
              layout="total,sizes, prev, pager, next, jumper"
              style="
                width: 100%;
                position: relative;
                display: flex;
                justify-content: flex-end;
                padding: 0 20px;
              "
              :total="doneTotal"
            ></el-pagination>
          </div>
        </div>
        <el-dialog
          title="详细跟踪【未完成】"
          :visible.sync="viewAppInfo"
          v-if="viewAppInfo"
          width="80%"
        >
          <div>
            <todoDetail :applyUuid="applyUuid"></todoDetail>
          </div>
          <span slot="footer">
            <el-button
              size="mini"
              type="info"
              class="table_header_btn"
              @click="doneFlow = false"
              >关闭</el-button
            >
          </span>
        </el-dialog>
        <el-dialog
          title="流程跟踪"
          :visible.sync="doneFlow"
          v-if="doneFlow"
          width="80%"
        >
          <div>
            <flowOpinionList :applyUuid="applyUuid"></flowOpinionList>
          </div>
          <span slot="footer">
            <el-button
              size="mini"
              type="info"
              class="table_header_btn"
              @click="doneFlow = false"
              >关闭</el-button
            >
          </span>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
const coutPx = 158 + 44 + 48 + 20 + 20 + 60;
import flowOpinionList from "../todowork/flowOpinionList";
import todoDetail from "./todoDetail";
import { auditDataList,updateToAccepted } from "@/api/starflow";
// import QueryField from '@/components/public/query-field/index'
// import {dict} from "@/static/inc/dict.js" //注意路径

export default {
  components: {
    flowOpinionList,
    todoDetail,
    // QueryField,
  },
  watch: {
    lessionChange() {
      this.init();
    },
  },
  mounted: function () {
    let projectStatus1 = this.$route.query.projectStatus;
    this.projectStatus = projectStatus1;
    if ("1" == projectStatus1) {
      this.yancheng = true;
    }

    this.init();
  },
  data() {
    return {
      //查询条件
      projectStatus: "",
      yancheng: false,
      queryFields: [
        { label: "标题", name: "applyTitle", type: "fuzzyText", value: "" },
        { label: "审批类型", name: "applyTypeName", type: "fuzzyText" },
      ],
      disp: true,
      screenHeight: document.documentElement.clientHeight,
      //查询区显示隐藏
      queryShow: false,
      //Tab默认激活
      activeName: "todoList",
      tableOption: { isShowHeader: true, height: "auto" },
      todoFlow: false,
      doneFlow: false,
      viewAppInfo: false,
      todoTag: true,
      //流程跟踪弹出框使用
      applyUuid: "",
      //控制审批页面元素显示隐藏参数
      flowSet: {
        opinionList: true,
        opinion: true,
        nextStep: true,
        done: false,
      },
      //初始化审批页面参数
      flowItem: {
        wftype: "",
        applyUuid: "",
        detailUuids: "",
        versionUuid: "",
        workEffortId: "",
        activityId: "",
      },
      //审核信息的状态
      applyInfo: {
        //业务主键
        appDataUuid: "",
        //版本
        versionUuid: "",
        //业务主键批量提交
        detailUuids: "",
        //业务审核状态,0未提交，1审核中，2审核中，3审核不通过
        status: "",
        //业务方法的成功失败0成功，1失败
        mstate: "",
        //流程方法的成功失败0成功，1失败
        fstate: "",
        //是否更新业务代码
        isUpdate: "",

        //流程方法的成功失败0成功，1失败
        Newfstate: "",
        //收回，终止业务方法的成功失败0成功，1失败
        newMstate: "",
      },
      applyDetail: {
        type: "",
        isEdit: false,
      },
      queryTodoForm: {
        applyTitle: "",
      },
      queryDoneForm: {
        applyTitle: "",
      },
      todoCurPage: 1,
      todoTotal: 0,
      todoPageSize: 10,
      doneCurPage: 1,
      doneTotal: 0,
      donePageSize: 10,
      donepageArr: [],
      pageArr: [],
      todoData: [],
      doneData: [],
      multipleSelection: [],
      formData: {},
      flowSetup: {},
      applyTitleform: {},
      flowItemParam: {},
      approvalData: {},
      testvalue: "",
      //收回，终止功能临时数据
      projectUuid: "",
      prjDocTypeUuid: "",
      //更新we_party_Assignment所返回的结果成功与否
      partyAssignment: false,
    };
  },
  computed: {
    ...mapGetters(["innerHeight"]),
    tableHeight() {
      //计算页面表格的距离顶部高低
      let height = "auto";
      if (!this.tableOption.height) {
        let num = this.innerHeight - coutPx;
        height = num;
      } else {
        height = this.tableOption.height;
      }
      console.log(height);
      return height;
    },
    //监控待办已办的激活事件
    lessionChange() {
      return this.todoTag;
    },
  },
  methods: {
    test() {
      this.disp = !this.disp;
    },
    init() {
      if (this.todoTag) {
        this.listLoading = true;
        var obj = {
          applyTitle: this.queryTodoForm.applyTitle,
          applyTypeName: this.queryTodoForm.applyTypeName,
          pageNo: this.todoCurPage,
          pageSize: this.todoPageSize,
        };
        auditDataList(obj).then((resp) => {
          console.log(123);
          console.log(resp);
          this.todoData = resp.data.entities;
          this.todoTotal = resp.data.count;
          this.changePageArr();
        });
      } else {
        var obj = {
          currentState: "done",
          applyTitle: this.queryDoneForm.applyTitle,
          applyTypeName: this.queryDoneForm.applyTypeName,
          applyState: this.queryDoneForm.applyState,
          pageNo: this.doneCurPage,
          pageSize: this.donePageSize,
        };
        auditDataList(obj).then((resp) => {
          console.log(123);
          console.log(resp);
          this.doneData = resp.data.entities;
          this.doneTotal = resp.data.count;
          this.donechangePageArr();
        });
      }
    },
    handleClick(tab) {
      if (tab.paneName == "doneList") {
        this.todoTag = false;
      } else {
        this.todoTag = true;
      }
    },
    //待办
    todoCurChange(val) {
      this.todoCurPage = val;
      this.init();
    },
    handleSizeChange(val) {
      this.todoPageSize = val;
      this.init();
    },
    changePageArr() {
      this.pageArr = this.common.changePageArr(this.todoTotal);
    },
    //已办
    doneCurChange(val) {
      this.doneCurPage = val;
      this.init();
    },
    donehandleSizeChange(val) {
      this.donePageSize = val;
      this.init();
    },
    donechangePageArr() {
      this.donepageArr = this.common.changePageArr(this.doneTotal);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    todo(row) {
      console.log(row,"row")
      if (row.currentState == "CAL_SENT") {
        this.updateToAccepted(row);
        if (!this.partyAssignment) {
          this.common.alertMsg(4, "数据更新失败");
          return;
        }
      }

      this.applyInfo.appDataUuid = row.appDataUuid;
      this.applyInfo.versionUuid = row.versionUuid;
      this.applyInfo.detailUuids = row.detailUuids;
      //待办列表里，默认审核状态是审核中value=1
      this.applyInfo.status = "1";
      //待办列表里，默认业务方法执行状态是空
      this.applyInfo.mstate = "";
      //待办列表里，默认流程方法执行状态是空
      // this.applyInfo.fstate = "";
      //待办列表里，默认流程方法执行状态是空
      this.applyInfo.newFstate = "";
      //业务数据是否更新过业务代码
      // this.applyInfo.isUpdate = "";
      //初始化vuex里的审核状态，或者覆盖之前存储的值
      this.$store.dispatch("applyInfo/setApplyInfo", this.applyInfo);
      //跳转页面，name值可以动态获取row.apptype;
      this.applyDetail.type = row.applyType;
      this.flowItem.applyUuid = row.applyUuid;
      this.flowItem.appDataUuid = row.appDataUuid;
      this.flowItem.versionUuid = row.versionUuid;
      this.flowItem.detailUuids = row.detailUuids;
      //用来区分主子项目
      this.flowItem.planTag = row.temp2;
      console.log(this.applyDetail.type);
      this.flowItem.workEffortId = row.workEffortId;
      this.flowItem.temp1 = row.temp1;
      this.flowItem.wftype = this.dict.flowValueFun(row.applyType);
      this.rojectType = row.workflowPackageId;
      this.$router.push({
        name: "todoDetail",
        params: {
          approvalData: row,
          applyDetail: this.applyDetail,
          flowSet: this.flowSet,
          flowItem: this.flowItem,
          projectStatus: this.projectStatus,
        },
      });
    },
    done(row) {
      //   return;
      this.applyInfo.appDataUuid = row.appDataUuid;
      this.applyInfo.versionUuid = row.versionUuid;
      this.applyInfo.detailUuids = row.detailUuids;
      this.flowSet.nextStep = false;
      this.flowSet.opinion = false;
      this.flowSet.done = true;
      //待办列表里，默认业务方法执行状态是空
      this.applyInfo.mstate = "";
      //待办列表里，默认流程方法执行状态是空
      this.applyInfo.fstate = "";
      //业务数据是否更新过业务代码
      this.applyInfo.isUpdate = "";
      //待办列表里，默认流程方法执行状态是空
      this.applyInfo.newFstate = "";
      //初始化vuex里的审核状态，或者覆盖之前存储的值
      this.$store.dispatch("applyInfo/setApplyInfo", this.applyInfo);

      //跳转页面，name值可以动态获取row.apptype;
      this.applyDetail.type = row.applyType;
      //当前流程的流转状态
      this.flowItem.applyUuid = row.currentState;
      this.flowItem.applyUuid = row.applyUuid;
      this.flowItem.appDataUuid = row.appDataUuid;
      this.flowItem.versionUuid = row.versionUuid;
      this.flowItem.detailUuids = row.detailUuids;
      // console.log(this.applyDetail.type)
      this.flowItem.workEffortId = row.workEffortId;
      //用来区分主子项目
      this.flowItem.planTag = row.temp2;
      this.flowItem.wftype = this.dict.flowValueFun(row.applyType);
      this.flowItem.temp1 = row.temp1;
      this.rojectType = row.workflowPackageId;
      this.$router.push({
        name: "todoDetail",
        params: {
          approvalData: row,
          applyDetail: this.applyDetail,
          flowSet: this.flowSet,
          flowItem: this.flowItem,
          projectStatus: this.projectStatus,
        },
      });
    },
    todoOpinionList(row) {
      this.applyUuid = row.applyUuid;
      this.todoFlow = true;
    },
    doneOpinionList(row) {
      this.applyUuid = row.applyUuid;
      this.doneFlow = true;
    },
    queryTodo(query) {
      this.queryTodoForm.applyTitle = query.applyTitle;
      this.queryTodoForm.applyTypeName = query.applyTypeName;
      this.todoCurPage = 1;
      this.init();
    },
    queryDone(query) {
      this.queryTodoForm.applyTitle = query.applyTitle;
      this.queryTodoForm.applyTypeName = query.applyTypeName;
      this.doneCurPage = 1;
      this.init();
    },
    reset() {
      this.queryTodoForm = {};
    },
    resetDone() {
      this.queryDoneForm = {};
    },
    //更新we_party_Assignment 表中的 CURRENT_STATE  工作项改为已受理

    updateToAccepted(row) {
      updateToAccepted(row).then((resp) => {
        if (resp.data.code == "0") {
            this.partyAssignment = true;
          }
        });
    },
  },
};
</script>
<style src="../css/tableItem.css" scoped>
</style>