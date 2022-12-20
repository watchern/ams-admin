<template>
  <div class="admin_right_main">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="待办列表" name="todoList">
        <div class="search_template">
          <div class="title_template">
            <span class="title_font">查询</span>
            <!-- <div class="el-icon-d-caret" @click="test()"></div> -->
            <div class="el-icon-top" @click="test()" v-if="disp"></div>
            <div class="el-icon-bottom" @click="test()" v-if="!disp"></div>
          </div>
          <el-collapse-transition>
            <div class="content" v-show="disp">
              <div class="content_form">
                <el-form ref="form" :model="queryTodoForm" label-width="128px" size="mini">
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="标题" class="form_item" prop="applyTitle">
                        <el-input
                          v-model="queryTodoForm.applyTitle"
                          :title="queryTodoForm.applyTitle"
                          style="width:180px;"
                        ></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="审批类型" class="form_item" prop="applyTypeName">
                        <el-input
                          v-model="queryTodoForm.applyTypeName"
                          :title="queryTodoForm.applyTypeName"
                          style="width:180px;"
                        ></el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
                <div class="operate_template">
                  <div class="operate_template_content">
                    <el-button
                      size="mini"
                      @click="reset"
                      type="info"
                      class="operate_btn reset_btn"
                    >重置</el-button>
                    <el-button
                      size="mini"
                      @click="queryTodo"
                      type="info"
                      class="operate_btn search_btn"
                    >查询</el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </div>
        <div class="table_template">
          <div
            class="table_header"
            v-if="tableOption.isShowHeader !=undefined?tableOption.isShowHeader:true"
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
            :height="disp == true ?(screenHeight-360)+'px':(screenHeight-198)+'px'"
          >
            <el-table-column type="selection"></el-table-column>
            <el-table-column label="序号" type="index"></el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="applyTitle" label="标题" width>
              <template slot-scope="scope">
                <el-link
                  @click="todo(scope.row)"
                  v-model="scope.row.applyTitle"
                  type="primary"
                  :underline="false"
                  class="linkClass"
                >{{scope.row.applyTitle}}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="applyTypeName" label="审批类型" show-overflow-tooltip width></el-table-column>
            <el-table-column prop="createPersonName" label="申请人" show-overflow-tooltip width></el-table-column>
            <el-table-column prop="applyTime" label="申请时间" show-overflow-tooltip width></el-table-column>
            <el-table-column prop="fromDate" label="到达时间" show-overflow-tooltip></el-table-column>
            <el-table-column prop="viewProcess" label="流程跟踪" show-overflow-tooltip width>
              <template slot-scope="scope">
                <el-link
                  @click="todoOpinionList(scope.row)"
                  type="primary"
                  :underline="false"
                  class="linkClass"
                >流程跟踪</el-link>
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
              style="width: 100%;position: relative;display: flex;justify-content: flex-end;padding: 0 20px;"
              :total="todoTotal"
            ></el-pagination>
          </div>
        </div>
        <el-dialog title="流程跟踪" :visible.sync="todoFlow" v-if="todoFlow" width="80%">
          <div>
            <flowOpinionList :applyUuid="applyUuid"></flowOpinionList>
          </div>
          <span slot="footer">
            <el-button size="mini" type="info" class="table_header_btn" @click="todoFlow = false">关闭</el-button>
          </span>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
const coutPx = 158 + 44 + 48 + 20 + 20 + 60;
import flowOpinionList from "./flowOpinionList";
import todoDetail from "./todoDetail";
// import {dict} from "@/static/inc/dict.js" //注意路径

export default {
  components: {
    flowOpinionList,
    todoDetail,
    // preInvestEdit,
    // todoworkmethods
  },
  watch: {
    lessionChange() {
      this.init();
    },
    // lessionMstate() {
    //   var newMstate = this.$store.state.applyInfo.applyInfo.newMstate;
    // 业务数据更新成功，执行流程操作
    // if (newMstate == "0") {
    //   alert(newMstate)
    //   this.stopSuspendFlow(this.approvalData);
    // 业务数据更新失败，提醒重新提交
    // this.$store.dispatch("applyInfo/setNewMstate", "");
    // }
    // }
  },
  mounted: function () {
    const that = this;
    // window.onresize = () => {
    //   return (() => {
    //     window.fullHeight = document.documentElement.clientHeight;
    //     that.screenHeight = window.fullHeight;
    //   })();
    // };
    //  this.common.endLoading();
    // clearTimeout(time1);
    let projectStatus1 = this.$route.query.projectStatus;
    this.projectStatus=projectStatus1;
    if( "1"==projectStatus1){
      this.yancheng=true;
    }
    this.init();
  },
  data() {
    return {
      yancheng:false,
      projectStatus:"",
      disp: true,
      screenHeight: document.documentElement.clientHeight,
      // applyStateOption: this.common.setJsonSelectValue("auditStatus"),
      //查询区显示隐藏
      queryShow: false,
      //Tab默认激活
      activeName: "todoList",
      tableOption: { isShowHeader: true, height: "auto" },
      dialogVisible: false,
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
      },
      //初始化审批页面参数
      flowItem: {
        wftype: "cn_com_boe_as_yearPlan",
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

    // lessionMstate() {
    //   return this.$store.state.applyInfo.applyInfo.newMstate;
    // }
  },
  methods: {
    test() {
      this.disp = !this.disp;
    },
    init() {
      if (this.todoTag) {
        this.$axios
          .get("/starflow/applyMes/sf/apply/auditDataList", {
            params: {
              applyTitle: this.queryTodoForm.applyTitle,
              applyTypeName: this.queryTodoForm.applyTypeName,
              pageNo: this.todoCurPage,
              pageSize: this.todoPageSize,
            },
          })
          .then((response) => {
            console.log(123);
            console.log(response);
            this.todoData = response.data.data.entities;
            this.todoTotal = response.data.data.count;
            this.changePageArr();
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        this.$axios
          .get("/starflow/applyMes/sf/apply/auditDataList", {
            params: {
              currentState: "done",
              applyTitle: this.queryDoneForm.applyTitle,
              applyTypeName: this.queryDoneForm.applyTypeName,
              applyState: this.queryDoneForm.applyState,
              pageNo: this.doneCurPage,
              pageSize: this.donePageSize,
            },
          })
          .then((response) => {
            console.log(456);
            console.log(response);
            this.doneData = response.data.data.entities;
            this.doneTotal = response.data.data.count;
            this.donechangePageArr();
          })
          .catch(function (error) {
            console.log(error);
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
    clickHandle() {
      this.dialogVisible = true;
    },
    todo(row) {
      alert(row.currentState )
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
      this.$router.push({
        name: "todoDetail",
        params: {
          approvalData: row,
          applyDetail: this.applyDetail,
          flowSet: this.flowSet,
          flowItem: this.flowItem,
          projectStatus:this.projectStatus,//zhouyu
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
      this.$router.push({
        name: "todoDetail",
        params: {
          approvalData: row,
          applyDetail: this.applyDetail,
          flowSet: this.flowSet,
          flowItem: this.flowItem,
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
    viewApplyInfo(row) {
      this.applyUuid = row.applyUuid;
      // this.doneFlow = true;
      this.viewAppInfo = true;
    },
    queryTodo() {
      this.todoCurPage = 1;
      this.init();
    },
    queryDone() {
      this.doneCurPage = 1;
      this.init();
    },
    reset() {
      this.queryTodoForm = {};
    },
    resetDone() {
      this.queryDoneForm = {};
    },
    //点击收回按钮
    takeBack(row) {
      console.log(JSON.stringify(row));
      // this.takeBackFlow(row);
      // // 待办列表里，默认业务方法执行状态是空
      // this.applyInfo.mstate = "";
      // alert(this.applyInfo.newMstate)
      // alert(this.$store.state.applyInfo.applyInfo.status)
      // this.flowSet.nextStep = false;
      // this.flowSet.opinion = false;
      // this.flowSet.done = true;
      // this.flowItem.applyUuid = row.applyUuid;
      // this.flowItem.appDataUuid = row.appDataUuid;
      // this.flowItem.versionUuid = row.versionUuid;
      // this.flowItem.detailUuids = row.detailUuids;
      // this.flowItem.workEffortId = row.workEffortId;
      // this.flowItem.wftype = this.dict.flowValueFun(row.applyType);
      // this.flowItemParam = this.flowItem;
      // this.flowSetup = this.flowSet;
      // this.approvalData = row;
      // this.applyTitleform.applyTitle = this.approvalData.applyTitle;
      // this.applyTitleform.applyTypeName = this.approvalData.applyTypeName;
      // this.applyDetail.type = row.applyType;
      // // actionIdList  判断是否可编辑
      // this.applyDetail.isEdit = true;
      // this.applyDetail.canEdit = 1;
      // this.$store.dispatch("applyInfo/setStatus", "1");
      // alert(12312312312312);
      // alert(this.applyDetail.type)
      // this.$refs[this.applyDetail.type + "Edit"].updateSave();

      // var data={
      //             verUuid: row.versionUuid,
      //             otherFileUuid: row.appDataUuid,
      //             type:row.applyType,
      //             status:"0",
      //             // projectUuid: data1.projectUuid,
      //             // prjDocTypeUuid: data1.prjDocTypeUuid,
      // }

      //       this.diyUpdate(data);
    },
    //点击终止按钮
    stopSuspend(row) {
      //待办列表里，默认业务方法执行状态是空
      // alert(1);
      this.applyInfo.mstate = "";
      this.flowSet.nextStep = false;
      this.flowSet.opinion = false;
      this.flowSet.done = true;
      this.flowItem.applyUuid = row.applyUuid;
      this.flowItem.appDataUuid = row.appDataUuid;
      this.flowItem.versionUuid = row.versionUuid;
      this.flowItem.detailUuids = row.detailUuids;
      this.flowItem.workEffortId = row.workEffortId;
      this.flowItem.wftype = this.dict.flowValueFun(row.applyType);
      this.flowItemParam = this.flowItem;
      this.flowSetup = this.flowSet;
      this.approvalData = row;
      this.applyTitleform.applyTitle = this.approvalData.applyTitle;
      this.applyTitleform.applyTypeName = this.approvalData.applyTypeName;

      // alert(row.applyType)
      this.applyDetail.type = row.applyType;
      // alert(this.applyDetail.type)
      // actionIdList  判断是否可编辑
      this.applyDetail.isEdit = true;
      this.applyDetail.canEdit = 1;
      // alert(1312312);
      this.$store.dispatch("applyInfo/setStatus", "1");

      // alert(131231212312312312312);
      // alert(this.applyDetail.type);
      this.$refs[this.applyDetail.type + "Edit"].updateSave();
    },
    //终止流程
    stopSuspendFlow(row) {
      this.formData = row;
      console.log("ceshi----------" + JSON.stringify(this.formData));
      // this.common.endLoading();
      // this.common.startLoading();
      this.$axios
        .post("/starflow/applyMes/sf/apply/stopSuspend", this.formData)
        .then((response) => {
          // alert(JSON.stringify(response.data.data));
          if (response.data.data) {
            this.common.endLoading();
            this.common.alertMsg(1, "终止流程成功");
            //如果是启动流程提交，关闭模态框。不是跳转待办页面。
            this.$router.push({
              path: "/todowork",
            });
          } else {
            // this.common.endLoading();
            //执行失败
            //修改业务审核状态

            // alert(JSON.stringify("nihao"));
            // this.$store.dispatch("applyInfo/setNewFstate", "1");
            this.common.alertMsg(4, "终止流程失败");
          }
        });
    },
    //收回流程
    takeBackFlow(row) {
      this.formData = row;
      console.log("ceshi----------" + JSON.stringify(this.formData));
      // this.common.endLoading();
      // this.common.startLoading();
      this.$axios
        .post("/starflow/applyMes/sf/apply/takeBack", this.formData)
        .then((response) => {
          if (response.data.data) {
            this.common.endLoading();
            this.common.alertMsg(1, "保存成功");
            //如果是启动流程提交，关闭模态框。不是跳转待办页面。
            this.$router.push({
              path: "/todowork",
            });
          } else {
            // this.common.endLoading();
            //执行失败
            //修改业务审核状态
            // alert(JSON.stringify("nihao"));
            // this.$store.dispatch("applyInfo/setNewFstate", "1");
            this.common.alertMsg(4, "终止流程失败");
          }
        });
    },
    //更新we_party_Assignment 表中的 CURRENT_STATE
    updateToAccepted(row) {
      this.$axios
        .post("/starflow/applyMes/sf/apply/updateToAccepted", row)
        .then((response) => {
          if (response.data.code == "0") {
            this.partyAssignment = true;
          }
        });
    },
  },
};
</script>
<style src="../css/tableItem.css" scoped>
</style>