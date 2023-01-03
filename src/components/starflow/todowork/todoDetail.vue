<template>
  <div class="admin_right_main todoDetail">
    <div class="content_form">
      <el-form
              ref="applyTitleForm"
              :model="applyTitleform"
              label-width="128px"
              size="mini"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
                    label="审批标题："
                    class="form_item form_item_one"
                    style="display: flex"
            >
              <el-input
                      v-if="this.approvalData.customizedType == 'isdrafter'"
                      type="input"
                      :title="applyTitleform.applyTitle"
                      v-model="applyTitleform.applyTitle"
              ></el-input>
              <div class="noEditDiv" v-else>
                {{ applyTitleform.applyTitle }}
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
                    label="审批类型："
                    class="form_item form_item_one"
                    style="display: flex"
            >
              <div class="noEditDiv">{{ applyTitleform.applyTypeName }}</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

<!--    <div>-->
<!--      需要动态引入各个业务的详情页面 进行展示-->
<!--       <el-button @click="qihuan">展开详情</el-button>-->
       <div v-if="displayBus">
<!--         <expansionDetail ref="ceshi"  :id=""></expansionDetail>-->
<!--       <businessDetail-->
<!--              ref="businessDetail"-->
<!--              :applyType="applyDetail.type"-->
<!--              :versionUuid="flowItemParam.versionUuid"-->
<!--              :appDataUuid="flowItemParam.appDataUuid"-->
<!--              :flowSetup="flowSetup"-->
<!--              :actionIdList="actionIdList"-->
<!--              :approvalData="approvalData"-->
<!--      ></businessDetail>-->
<!--         <button @click="templateButton">111111</button>-->
      <component :is="bottomPanel" ref="applyPage" @fromSon=sonFun />
         <!-- 流程内容：审核意见、填写意见、选择下一步 -->
         <div class="flow_template">
           <template v-if="flowSetup.opinionList">
             <div class="table_template">
               <div class="title_template title_font">
                 <span>审核列表</span>
               </div>
               <el-table
                       ref="opinionTable"
                       :data="tableData"
                       border
                       style="width: 100%"
               >
                 <el-table-column label="序号" type="index"></el-table-column>
                 <el-table-column
                         prop="activityName"
                         label="活动"
                         width
                 ></el-table-column>
                 <el-table-column prop="noteText" label="意见"></el-table-column>
                 <el-table-column
                         prop="personName"
                         label="姓名"
                         width
                 ></el-table-column>
                 <el-table-column prop="noteDate" label="办理时间"></el-table-column>
               </el-table>
             </div>
           </template>
           <template v-if="flowSetup.opinion">
             <div class="opinion_template">
               <div class="title_template">
                 <span class="title_font">审核意见</span>
               </div>
               <div class="content">
                 <div class>
                   <el-form
                           ref="form"
                           :model="opinionform"
                           label-width="128px"
                           size="mini"
                   >
                     <!-- 是否同意，切换工作流分支 -->
                     <el-row :gutter="20">
                       <el-col :span="12">
                         <el-form-item
                                 label="是否同意"
                                 class="form_item"
                                 v-if="showDoAgree"
                         >
                           <el-switch
                                   v-if="forbiddoAgree || forbidAgree4Yw"
                                   v-model="opinionform.doAgree"
                                   @change="fetchBranch"
                                   disabled
                           ></el-switch>
                           <el-switch
                                   v-else
                                   v-model="opinionform.doAgree"
                                   @change="fetchBranch"
                           ></el-switch>
                         </el-form-item>
                       </el-col>
                     </el-row>
                     <el-row :gutter="20">
                       <el-col :span="8">
                         <el-form-item
                                 label="处理意见"
                                 class="form_item"
                                 prop="opinion"
                         >
                           <el-input
                                   type="textarea"
                                   v-model="opinionform.opinion"
                           ></el-input>
                         </el-form-item>
                       </el-col>
                       <el-col :span="12">
                         <div v-if="yancheng">
                           常用语：
                           <el-select
                                   v-model="id"
                                   clearable
                                   placeholder="请选择"
                                   @change="selectedValue"
                           >
                             <el-option
                                     v-for="item in reportNameList"
                                     :key="item.id"
                                     :label="item.name"
                                     :value="item.name"
                             >
                             </el-option>
                           </el-select>
                         </div>
                       </el-col>
                     </el-row>
                     <el-row :gutter="20" v-if="showDoCheck">
                       <el-col :span="8">
                         <el-form-item
                                 label="是否通过"
                                 class="form_item"
                                 prop="doCheck"
                         >
                           <el-switch v-model="opinionform.doCheck"></el-switch>
                         </el-form-item>
                       </el-col>
                     </el-row>
                   </el-form>
                 </div>
               </div>
             </div>
           </template>
           <template v-if="flowSetup.nextStep && this.isLast">
             <div class="person_template">
               <div class="title_template">
                 <span class="title_font">选择下一步</span>
               </div>
               <div class="content">
                 <div class>
                   <el-form
                           ref="form"
                           :model="personform"
                           label-width="128px"
                           size="mini"
                   >
                     <el-row :gutter="20">
                       <el-col :span="12">
                         <el-form-item label="流程节点" class="form_item">
                           <el-radio-group
                                   v-model="personform.activity"
                                   @change="handleChange"
                           >
                             <el-radio
                                     v-for="(item, index) in activityList"
                                     :key="index"
                                     :label="item.activityId"
                             >{{ item.activityName }}</el-radio
                             >
                           </el-radio-group>
                         </el-form-item>
                       </el-col>
                     </el-row>
                     <el-row :gutter="20">
                       <el-col :span="24">
                         <el-form-item label="办理人" class="form_item">
                           <el-checkbox-group
                                   v-model="checkedPerList"
                                   v-if="this.isAllAssignment == 'checkbox'"
                           >
                             <el-row :gutter="20">
                               <el-col :span="12">
                                 <el-checkbox
                                         v-for="item in personItem"
                                         :key="item.personUuid"
                                         :label="item.personUuid"
                                 >{{ item.personName }}</el-checkbox
                                 >
                               </el-col>
                             </el-row>
                           </el-checkbox-group>

                           <el-radio-group
                                   @change="checkedPersonList"
                                   v-model="personform.transactor"
                                   v-if="this.isAllAssignment == 'radio'"
                           >
                             <el-row :gutter="20">
                               <el-col
                                       :span="12"
                                       v-for="(item, index) in personItem"
                                       :key="index"
                               >
                                 <el-radio :label="item.personUuid">{{
                                   item.personName
                                   }}</el-radio>
                               </el-col>
                             </el-row>
                           </el-radio-group>
                         </el-form-item>
                       </el-col>
                     </el-row>
                   </el-form>
                 </div>
               </div>
             </div>
           </template>
           <!-- 流程最后一个节点flowEnd展示选择知会人 -->
           <template v-if="this.notifyPersonTag">
             <div class="person_template">
               <div class="title_template">
                 <span class="title_font">选择知会人</span>
               </div>
               <div class="content">
                 <div class>
                   <el-form ref="form" :model="form" label-width="128px" size="mini">
                     <el-row :gutter="20">
                       <el-col :span="12">
                         <el-form-item
                                 label="知会人："
                                 class="form_item"
                                 prop="personName"
                         >
                           <el-input
                                   v-model="form.personName"
                                   style="width: 180px"
                                   readonly="readonly"
                           ></el-input>
                           <el-input
                                   v-model="form.personCode"
                                   v-if="(show = false)"
                           ></el-input>
                           <el-button
                                   size="mini"
                                   type="info"
                                   class="table_header_btn"
                                   @click="selectNotifyPerson"
                           >选择</el-button
                           >
                         </el-form-item>
                       </el-col>
                     </el-row>
                   </el-form>
                   <!-- 选择知会人 -->
                   <!-- <el-dialog
                     title="选择人员"
                     :visible.sync="dialogVisibleNotifyPerson"
                     v-if="dialogVisibleNotifyPerson"
                     :destroy-on-close="true"
                     :close-on-click-modal="false"
                     append-to-body
                     width="70%"
                   >
                     <span>
                       <OrgPersonListOut
                         ref="auditObjLeader"
                         @closeMain="closeObjLeader"
                         @closeObjLeader="closeLeaderdialog"
                       ></OrgPersonListOut>
                     </span>
                   </el-dialog> -->
                 </div>
               </div>
             </div>
           </template>
         </div>
         <div class="btns_wrap">
           <div class="btns_rigth">
             <el-button
                     class="btn_editor"
                     type="primary"
                     @click="back"
                     v-if="!isRemingMessage"
             >返回</el-button
             >
             <el-button
                     class="btn_editor"
                     type="primary"
                     @click="saveNew"
                     v-if="!flowSetup.done"
             >提交</el-button
             >
             <el-button
                     type="primary"
                     class="btn_editor"
                     @click="takeBack"
                     v-if="
            flowSetup.done &&
            approvalData.applyState == 1 &&
            this.flowItemParam.stopSuspendSign != '2' &&
            this.out != '1'
          "
             >收回</el-button
             >
             <el-button
                     type="primary"
                     class="btn_editor"
                     @click="stopSuspend"
                     v-if="this.flowItemParam.stopSuspendSign == '2' && this.out != '1'"
             >终止</el-button
             >
           </div>
         </div>

       </div>
<!--    </div>-->


  </div>
</template>
<script>

  import { selectInitDetail,submitToPerson } from "@/api/starflow";
  import {inItCode,listByPage} from '@/api/base/sysdata'
  // import { resolve } from "path";
  //用于知会人
  // import OrgPersonListOut from "@/components/common/orgPersonListOut";
  // import businessDetail from "@/views/dataDetail/businessDetail";
  // import businessDetail from "@/views/starflow/todowork/businessDetail";
  // const loadComponent = (value) => {
  //   // return (resolve) => require([`@/components/starflow/todowork/${value}`],resolve)
  //   return require([`./${value}`],resolve);
  // }
  const loadComponent = (view) => {
    return (resolve) => require([`@/views/${view}`], resolve)
    // return (resolve) => require([`${view}`], resolve)
  }
  // const loadComponent = (value) =>{return import(`${value}`)} ;
  export default {
    computed: {
      fieldType () {
        return () => import(`${this.type}`)
      }
    },
    data() {
      return {
        applyUuid:'', //业务主键id
        projectStatus: "",
        projectType: "",
        yancheng: false,
        reportNameList: [],
        id: "",
        pageQueryTree: {
          condition: {},
          pageNo: 1,
          pageSize: 1000,
          sortBy: "asc",
          sortName: "create_time",
          modelParamName: "",
        },
        actionIdList: [],
        //是否显示业务组件
        displayBus: false,
        //是否显示知会人
        notifyPersonTag: false,
        //选择知会人弹窗
        dialogVisibleNotifyPerson: false,
        //知会人使用集合
        form: {},
        jumpTag: "",
        // getMstate:"",
        tableOption: { isShowHeader: true, height: "auto" },
        applyDetail: {
          type: "",
          isEdit: false,
        },
        flowItemParam: {
          stopSuspendSign: "",
        },
        flowSetup: {},
        opinionItem: {},
        tableData: [],
        opinionform: {
          opinion: "",
          doCheck: false,
          doAgree: true,
        },
        personform: {
          activity: "",
          transactor: "",
          transitionId: "",
          agreeTag: "true",
        },
        applyTitleform: {
          applyTitle: "",
          applyTypeName: "",
          //立项调整使用
          applyType: "",
        },
        //存放临时的数组
        activityList: [],
        fieldList: [],
        readRightStr: "",
        editRightStr: "",
        personItem: [],
        formData: {},
        //权限
        operateAuthorization: [],
        isRemingMessage: false, //是否是消息提醒点击
        agreeTagList: [],
        agreeTagTrueList: [],
        agreeTagFalseList: [],
        agreeTagAll: {
          agreeTag: "",
          agreeTagList: [],
          agreeTagName: "",
        },
        forbidAgree4Yw: false,
        isTakeBackOrStopSuspend: "",
        isLast: false,
        isAllAssignment: "",
        checkedPerList: [],
        isBpm: false,
        approvalData: {},
        out: "",
        //动态组件相关
        activePage: "", // 变量
        bottomPanel: null, // 定义组件
        selectPersonUuidList: [] //被选中的人员的id集合
      };
    },
    destroyed() {
      clearInterval(this.timer);
    },
    created(){
      // activePage 需要调接口 动态查询页面

      // this.activePage = '@/views/data/dataPermission/index'
      // this.add()
    },
    mounted: function () {
      //当前状态 待办或者已办 根据待办已办查询去对应的基础数据中查询 放开后需要把 dataSortValue 赋值成 dynamicDataSortValue
      // const currentStatus = this.$route.params.approvalData.currentState
      // CAL_COMPLETED 已办 CAL_ACCEPTED 待办
      // let dynamicDataSortValue = ''
      // if(currentStatus == 'CAL_ACCEPTED'){
      //   dynamicDataSortValue = '00000000'
      // }
      // if(currentStatus == 'CAL_COMPLETED'){
      //   dynamicDataSortValue = '00000001'
      // }
      const baseDataSortParam = {
        condition: {
          dataSortName: '',
          dataSortValue: '00000000'
        },
        pageNo: 1,
        pageNum: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      }
      listByPage(baseDataSortParam)
      .then((res)=>{
        const dataSortUuid = res.data.records[0].dataSortUuid
        const dataSortName = res.data.records[0].dataSortName
        const baseCodeInfoParam = {
          condition:{
            baseCodeInfo: '',
            dataSortDesc: '',
            dataSortName: dataSortName,
            dataSortUuid: dataSortUuid,
            dataSortValue: '',
            editTag: null,
            extendTag: '0',
            isDeleted: 0,
            keyword: null,
            remark: null,
          },
          pageNo: 1,
          pageSize: 20,
          sortBy: 'asc',
          sortName: 'create_time'
        }
        const needType = this.$route.params.applyDetail.type
        inItCode(baseCodeInfoParam)
        .then((res)=>{
        const result = res.data.records
        result.forEach((value,index)=>{
          if(value.codeName == needType){
            this.activePage = value.codeDesc
          }
        })
        let out = this.$route.query.out;
        //该部分为其它工程接入审计系统用
        if ("1" == out) {
          //判断路由跳转过来的是否携带参数
          this.projectStatus = this.$route.query.projectStatus;
          this.projectType = this.$route.query.projectType;
          if ("1" == this.projectStatus) {
            this.yancheng = true;
            this.applyIdiomTest();
          }
          this.fetchApply(this.$route.query.applyUuid);
        }
        this.out = out;
        if (
                this.$route.params.approvalData &&
                this.$route.params.approvalData != null
        ) {
          // 这是正常点开待办已办详情，用的this.$router.push，name跳转params传参
          this.approvalData = this.$route.params.approvalData;
          //判断flowItem是从引用组件传递来的，还是通过跳转传递过来的。
          this.flowItemParam = this.$route.params.flowItem;
          this.flowSetup = this.$route.params.flowSet;
          this.applyDetail = this.$route.params.applyDetail;
          this.applyTitleform.applyTitle = this.approvalData.applyTitle;
          this.applyTitleform.applyTypeName = this.approvalData.applyTypeName;
          this.applyTitleform.applyType = this.approvalData.applyType;
          this.jumpTag = this.$route.params.jumpTag;
          this.projectStatus = this.$route.params.projectStatus;
          this.projectType = this.$route.params.projectType;
          this.flowSetup.projectType = this.projectType;
          if ("1" == this.projectStatus) {
            this.yancheng = true;
            this.applyIdiomTest();
          }
          this.init();
        }
        })
      })

    },
    computed: {
      lessionMstate() {
        return this.$store.state.applyInfo.applyInfo.mstate;
      },
      showDoCheck() {
        return this.editRightStr.indexOf("doCheck") != -1;
      },
      //显示是否同意切换
      showDoAgree() {
        var res = false;
        if (
                this.editRightStr.indexOf("doAgree") != -1 ||
                this.readRightStr.indexOf("doAgree") != -1
        ) {
          res = true;
        }
        return res;
      },
      //可见情况下根据工作流配置禁止操作是否同意按钮
      forbiddoAgree() {
        return this.readRightStr.indexOf("doAgree") != -1;
      },
    },
    watch: {
      lessionMstate() {
        var mstate = this.$store.state.applyInfo.applyInfo.mstate;
        //业务数据更新成功，执行流程操作
        if (mstate == "0" && this.isTakeBackOrStopSuspend == "") {
          this.submitFlow();
          //业务数据更新失败，提醒重新提交
        } else if (mstate == "0" && this.isTakeBackOrStopSuspend == "2") {
          this.stopSuspendFlow();
        }
      },
      activePage: {
        handler(value) {
          if(value){
            this.bottomPanel = loadComponent(value)
          }
        },
        immediate: true,
      },
    },
    methods: {
      qihuan(){
        this.add()
              // this.activePage= 'expansionDetail'; // 变量
          },
      //选择知会人
      selectNotifyPerson() {
        this.dialogVisibleNotifyPerson = true;
      },
      //关闭子组件调用的方法，整理数据
      closeObjLeader(val, nodeLabel) {
        // console.log(val, nodeLabel); //被审计对象选定时，这里可以收到信息，在这里接收label
        this.dialogVisibleNotifyPerson = false;
        var prjPersonArr = val;
        var PersonName = "";
        var PersonCode = "";
        for (let i = 0; i < prjPersonArr.length; i++) {
          PersonName += prjPersonArr[i].personName + ",";
          PersonCode += prjPersonArr[i].personcode + ",";
        }
        PersonName = PersonName.substr(0, PersonName.length - 1);
        PersonCode = PersonCode.substr(0, PersonCode.length - 1);
        this.form.personName = PersonName;
        this.form.personCode = PersonCode;
      },
      //关闭知会人弹窗
      closeLeaderdialog() {
        this.dialogVisibleNotifyPerson = false;
      },
      //获取applyInfo信息
      fetchApply: function (applyUuidTmp) {
        this.$axios
                .get("/starflow/applyMes/sf/apply/fetchApply?applyUuid=" + applyUuidTmp)
                .then((response) => {
                  if (response.data.code == "0") {
                    let applyInfoVO = response.data.data;
                    applyInfoVO.workEffortId = this.$route.query.workEffortId;
                    let done = this.$route.query.status == "done" ? true : false;
                    //console.log(applyInfoVO.applyUuid)
                    let flowSet = {
                      opinionList: true,
                      opinion: done ? false : true,
                      nextStep: done ? false : true,
                      done: done,
                    };
                    let applyDetail = {
                      type: applyInfoVO.applyType,
                      isEdit: false,
                    };

                    applyInfoVO.status = "1";
                    //待办列表里，默认业务方法执行状态是空
                    applyInfoVO.mstate = "";
                    //待办列表里，默认流程方法执行状态是空
                    // this.applyInfo.fstate = "";
                    //待办列表里，默认流程方法执行状态是空
                    applyInfoVO.newFstate = "";
                    //初始化vuex里的审核状态，或者覆盖之前存储的值
                    this.$store.dispatch("applyInfo/setApplyInfo", applyInfoVO);
                    // console.log(JSON.stringify(applyInfoVO));
                    this.approvalData = applyInfoVO;
                    this.flowItemParam = applyInfoVO;
                    this.flowSetup = flowSet;
                    this.flowSetup.projectType = this.projectType;
                    this.applyDetail = applyDetail; //this.$route.query.applyDetail;

                    this.applyTitleform.applyTitle = applyInfoVO.applyTitle;
                    this.applyTitleform.applyTypeName = applyInfoVO.applyTypeName;

                    this.init();
                  }
                })
                .catch(function (error) {
                  console.log(error);
                });
      },
      add(){
        var templateParam = this.$route.params.approvalData.appDataUuid
        this.$refs.applyPage.queryByUuid(templateParam)
      },
      init() {
        //临时参数 因为切换账号 太鸡肋 先写死id 进行测试
        // this.$refs["expansionDetailPage"].queryByUuid(templateParam)
        if (this.approvalData.workflowPackageVersion) {
          this.flowItemParam.workflowPackageVersion =
                  this.approvalData.workflowPackageVersion;
        } else {
          this.flowItemParam.workflowPackageVersion = "";
        }
        if (this.approvalData.workflowPackageId) {
          this.flowItemParam.workflowPackageId =
                  this.approvalData.workflowPackageId;
        } else {
          this.flowItemParam.workflowPackageId = "";
        }
        var hurl = "/applyMes/sf/apply/selectPerson4Data";
        if (this.$route.query.isRemingMessage == "true") {
          hurl = "/applyMes/sf/apply/showApplyInfo";
        }
        if (this.$route.params.isTeSongMessage == "true") {
          hurl = "/applyMes/sf/apply/showApplyInfo";
        }

        selectInitDetail(this.flowItemParam,hurl).then((resp) => {
          //初始化审核列表数据
          if (resp.data) {
            this.isBpm =resp.data.isBpm;
            this.isLast =resp.data.noteMap.isLast;
            this.actionIdList =resp.data.noteMap.actionIdList;
            this.displayBus = true;
            if (resp.data.noteMap.startdetail) {
              this.opinionItem =resp.data.noteMap.startdetail;
              this.opinionItem.activityName = "申请人";
              this.tableData.push(this.opinionItem);
              this.tableData.push.apply(
                      this.tableData,
                      resp.data.noteMap.detailList
              );
            }
            if (resp.data.noteMap.actionIdList) {
              var actionIdList =resp.data.noteMap.actionIdList;
              //判断审计通知书和立项书或其他调用模板的文书的操作权限
              this.operateAuthorization =
                      resp.data.noteMap.actionIdList;
            }
            //判断操作域的读写权限
            if (resp.data.noteMap.fieldList) {
              this.fieldList =resp.data.noteMap.fieldList;
              this.fieldList.forEach((item) => {
                if (item.rightCode == "2") {
                  this.readRightStr = this.readRightStr + item.fieldCode + ",";
                } else if (item.rightCode == "4") {
                  this.editRightStr = this.editRightStr + item.fieldCode + ",";
                }
              });
            }

            //处理新的初始化参数流程，人员参数
            //如果设置了同意不同意域,则需要拆分分支
            if (
                    this.editRightStr.indexOf("doAgree") != -1 ||
                    this.readRightStr.indexOf("doAgree") != -1
            ) {
              resp.data.personList.forEach((item) => {
                if (item.agreeTag == "true") {
                  this.agreeTagTrueList.push(item);
                } else {
                  this.agreeTagFalseList.push(item);
                }
              });
              if (this.agreeTagTrueList.length > 0) {
                var json1 = { agreeTag: true, agreeTagName: "同意" };
                json1["agreeTagList"] = this.agreeTagTrueList;
                this.agreeTagList.push(json1);
              }

              if (this.agreeTagFalseList.length > 0) {
                var json = { agreeTag: false, agreeTagName: "不同意" };
                json["agreeTagList"] = this.agreeTagFalseList;
                this.agreeTagList.push(json);
              }
              //如果没有读写权限,则展示所有分支
            } else {
              var json2 = {};
              json2["agreeTagList"] =resp.data.personList;
              this.agreeTagList.push(json2);
            }

            //初始化参数流程，人员参数
            this.activityList = this.agreeTagList[0].agreeTagList;
            this.personItem = this.activityList[0].personList;
            this.isAllAssignment = this.activityList[0].isAllAssignment;
            this.personform.agreeTag = this.activityList[0].agreeTag;
            this.personform.activity = this.activityList[0].activityId;
            this.personform.transitionId = this.activityList[0].transitionId;
            this.personform.transactor = this.personItem[0].personUuid;
            if (this.activityList[0].customizedType) {
              this.personform.customizedType =
                      this.activityList[0].customizedType;
            } else {
              this.personform.customizedType = "";
            }
            //处理流程结束节点，如果是结束节点，设置人员的名称为无
            this.personItem.forEach((item) => {
              if (item.personUuid == "flowEnd") {
                item.personName = "无";
              }
            });
            //处理知会
            for (var i = 0; i < this.activityList.length; i++) {
              if (this.activityList[i].isInformed == "Y") {
                //流程结束节点显示知会人
                this.notifyPersonTag = true;
              }
            }
          }
        });
        // this.activePage= 'index';

        // this.$axios
        //   .post(hurl, this.flowItemParam)
        //   .then((response) => {
        //     //初始化审核列表数据
        //     if (response.data.data) {
        //       this.isBpm = response.data.data.isBpm;
        //       this.isLast = response.data.data.noteMap.isLast;
        //       this.actionIdList = response.data.data.noteMap.actionIdList;
        //       this.displayBus = true;
        //       if (response.data.data.noteMap.startdetail) {
        //         this.opinionItem = response.data.data.noteMap.startdetail;
        //         this.opinionItem.activityName = "申请人";
        //         this.tableData.push(this.opinionItem);
        //         this.tableData.push.apply(
        //           this.tableData,
        //           response.data.data.noteMap.detailList
        //         );
        //       }
        //       if (response.data.data.noteMap.actionIdList) {
        //         var actionIdList = response.data.data.noteMap.actionIdList;
        //         //判断审计通知书和立项书或其他调用模板的文书的操作权限
        //         this.operateAuthorization =
        //           response.data.data.noteMap.actionIdList;
        //       }
        //       //判断操作域的读写权限
        //       if (response.data.data.noteMap.fieldList) {
        //         this.fieldList = response.data.data.noteMap.fieldList;
        //         this.fieldList.forEach((item) => {
        //           if (item.rightCode == "2") {
        //             this.readRightStr = this.readRightStr + item.fieldCode + ",";
        //           } else if (item.rightCode == "4") {
        //             this.editRightStr = this.editRightStr + item.fieldCode + ",";
        //           }
        //         });
        //       }

        //       //处理新的初始化参数流程，人员参数
        //       //如果设置了同意不同意域,则需要拆分分支
        //       if (
        //         this.editRightStr.indexOf("doAgree") != -1 ||
        //         this.readRightStr.indexOf("doAgree") != -1
        //       ) {
        //         response.data.data.personList.forEach((item) => {
        //           if (item.agreeTag == "true") {
        //             this.agreeTagTrueList.push(item);
        //           } else {
        //             this.agreeTagFalseList.push(item);
        //           }
        //         });
        //         if (this.agreeTagTrueList.length > 0) {
        //           var json1 = { agreeTag: true, agreeTagName: "同意" };
        //           json1["agreeTagList"] = this.agreeTagTrueList;
        //           this.agreeTagList.push(json1);
        //         }

        //         if (this.agreeTagFalseList.length > 0) {
        //           var json = { agreeTag: false, agreeTagName: "不同意" };
        //           json["agreeTagList"] = this.agreeTagFalseList;
        //           this.agreeTagList.push(json);
        //         }
        //         //如果没有读写权限,则展示所有分支
        //       } else {
        //         var json2 = {};
        //         json2["agreeTagList"] = response.data.data.personList;
        //         this.agreeTagList.push(json2);
        //       }

        //       //初始化参数流程，人员参数
        //       this.activityList = this.agreeTagList[0].agreeTagList;
        //       this.personItem = this.activityList[0].personList;
        //       this.isAllAssignment = this.activityList[0].isAllAssignment;
        //       this.personform.agreeTag = this.activityList[0].agreeTag;
        //       this.personform.activity = this.activityList[0].activityId;
        //       this.personform.transitionId = this.activityList[0].transitionId;
        //       this.personform.transactor = this.personItem[0].personUuid;
        //       if (this.activityList[0].customizedType) {
        //         this.personform.customizedType =
        //           this.activityList[0].customizedType;
        //       } else {
        //         this.personform.customizedType = "";
        //       }
        //       //处理流程结束节点，如果是结束节点，设置人员的名称为无
        //       this.personItem.forEach((item) => {
        //         if (item.personUuid == "flowEnd") {
        //           item.personName = "无";
        //         }
        //       });
        //       //处理知会
        //       for (var i = 0; i < this.activityList.length; i++) {
        //         if (this.activityList[i].isInformed == "Y") {
        //           //流程结束节点显示知会人
        //           this.notifyPersonTag = true;
        //         }
        //       }
        //     }
        //   })
        //   .catch(function (error) {
        //     console.log(error);
        //   });

      },
      //切换流程分支
      fetchBranch(val) {
        this.agreeTagList.forEach((item) => {
          if (val == item.agreeTag) {
            this.activityList = item.agreeTagList;
            this.personItem = this.activityList[0].personList;
            this.personform.activity = this.activityList[0].activityId;
            this.personform.transitionId = this.activityList[0].transitionId;
            this.personform.transactor = this.personItem[0].personUuid;
            if (this.activityList[0].customizedType) {
              this.personform.customizedType =
                      this.activityList[0].customizedType;
            } else {
              this.personform.customizedType = "";
            }
            //处理流程结束节点，如果是结束节点，设置人员的名称为无
            this.personItem.forEach((item) => {
              if (item.personUuid == "flowEnd") {
                item.personName = "无";
              }
            });
            return;
          }
        });
      },

      handleChange(val) {
        this.checkedPerList = [];
        this.activityList.forEach((item) => {
          if (val == item.activityId) {
            this.isAllAssignment = item.isAllAssignment;
            this.personItem = item.personList;
            this.personform.activity = item.activityId;
            this.personform.transitionId = item.transitionId;
            this.personform.transactor = this.personItem[0].personUuid;
            if (item.customizedType) {
              this.personform.customizedType = item.customizedType;
            } else {
              this.personform.customizedType = "";
            }
            //处理流程结束节点，如果是结束节点，设置人员的名称为无
            this.personItem.forEach((item) => {
              if (item.personUuid == "flowEnd") {
                item.personName = "无";
              }
            });
            return;
          }
        });
      },

      //处理流程结束节点，如果是结束节点，设置人员的名称为无
      saveNew() {
        if (this.opinionform.opinion == "") {
          this.common.alertMsg(2, "请填写意见后再提交流程");
          return;
        }
        // alert(this.isLast)
        if (this.personItem.length != 0 && this.personItem[0].personUuid) {
          //结束点
          if (
                  this.personItem[0].personUuid != "" &&
                  this.personItem[0].personUuid != null
          ) {
            if (!this.isLast) {
              this.$confirm(this.textShare.submitForLastPerson(), "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
                      .then(() => {
                        this.save();
                      })
                      .catch(() => {});
            } else {
              let subMessage = "";
              if (this.personItem && this.personItem.length != 0) {
                for (var i = 0; i < this.personItem.length; i++) {
                  if (this.personItem[i].personUuid != "flowEnd") {
                    if (
                            this.personform.transactor == this.personItem[i].personUuid
                    ) {
                      subMessage =
                              "确定提交给" + this.personItem[i].personName + "?";
                    }
                  } else {
                    if (this.notifyPersonTag) {
                      //需要选择知会人-并且已经选择知会人
                      if (
                              this.form.personName != null &&
                              this.form.personName != ""
                      ) {
                        subMessage =
                                "您已经选择知会到" + this.form.personName + "确定提交?";
                      } else if (
                              this.form.personName == null ||
                              this.form.personName == ""
                      ) {
                        //需要选择知会人-并且未选择知会人
                        subMessage = "您未选择知会人，确定提交?";
                      }
                    } else {
                      //不需要选择知会人
                      subMessage = "确定提交?";
                    }
                  }
                }
                if (subMessage == "") {
                  subMessage = "确定提交?";
                }
              } else {
                subMessage = "确定提交?";
              }

              this.$confirm(subMessage, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
                      .then(() => {
                        this.save()
                      })
                      .catch(() => {});
              // this.save();
            }
          } else {
            //非结束点
            this.common.alertMsg(2, "非流程结束点,请选择人员");
          }
        } else {
          //非结束点
          this.common.alertMsg(2, "非流程结束点,请选择人员");
        }
      },

      save() {
        //里面存的是 id
        this.common.startLoading();
        this.$store.dispatch(
                "applyInfo/setDoCheckStatus",
                this.opinionform.doCheck
        ); //
        if (this.isLast) {
          if (this.personItem[0].personUuid == "flowEnd") {
            //修改业务审核状态
            this.$store.dispatch("applyInfo/setStatus", "2");
          } else if (
                  this.personform.customizedType &&
                  this.personform.customizedType == "isdrafter"
          ) {
            //上面判断错误 原来写的是 idDrafter 但是传过来的却是 isdrafter
            //修改业务审核状态
            this.$store.dispatch("applyInfo/setStatus", "3");
            //预留返回主审人修改 回调方法 修改对应业务状态为草稿 使用时放开即可
            //这个地方 是 进入了返回主审修改的地方 如果返回主审人是申请人 那么就更新业务状态为草稿
            //业务页面 不写方法虽然不会影响程序正常执行 但是控制台会爆红
            // var createPersonUuid = this.$route.params.approvalData.createPersonUuid
            // if(this.isAllAssignment == 'checkbox'){
            //   this.personItem.forEach((value,index)=>{
            //     if(value.persoUuid == createPersonUuid){
            //       var templateParam = this.$route.params.approvalData.appDataUuid
            //       this.$refs.applyPage.updateApplyStatusBecauseBackApplication(templateParam)
            //     }
            //   })
            // }else{
            //   this.personItem.forEach((value,index)=>{
            //     if(value.personUuid == createPersonUuid){
            //       var templateParam = this.$route.params.approvalData.appDataUuid
            //       this.$refs.applyPage.updateApplyStatusBecauseBackApplication(templateParam)
            //     }
            //   })
            // }
          }
        }
        setTimeout(() => {
          //判断是否为最后一个节点 最后一个节点就将状态改为办理完成
          this.personItem.forEach((value,index)=>{
            if(value.personUuid == 'flowEnd'){
              var templateParam = this.$route.params.approvalData.appDataUuid
              this.$refs["applyPage"].updateApplyStatus(templateParam);
            }
        })
          this.submitFlow();
        }, 20);
      },
      submitFlow() {
        if (this.isAllAssignment == "checkbox") {
          this.formData.personUuId = this.checkedPerList.join(",");
        } else {
          this.formData.personUuId = this.personform.transactor;
        }
        this.formData.isAllAssignment = this.isAllAssignment;
        if (this.flowItemParam.wftype) {
          this.formData.wftype = this.flowItemParam.wftype;
        } else {
          this.formData.wftype = "";
        }
        this.formData.applyUuid = this.flowItemParam.applyUuid;
        this.formData.activityId = this.personform.activity;
        this.formData.transitionId = this.personform.transitionId;
        //审核信息
        this.formData.remark = this.opinionform.opinion;
        this.formData.doCheck = this.opinionform.doCheck;
        this.formData.doAgree = this.opinionform.doAgree;
        //业务表主键uuid
        if (this.flowItemParam.appDataUuid) {
          this.formData.appDataUuid = this.flowItemParam.appDataUuid;
        } else {
          this.formData.appDataUuid = "";
        }
        this.formData.applyTitle = this.applyTitleform.applyTitle;
        if (this.flowItemParam.workEffortId) {
          this.formData.workEffortId = this.flowItemParam.workEffortId;
        } else {
          this.formData.workEffortId = "";
        }
        if (this.flowItemParam.detailUuids) {
          this.formData.detailUuids = this.flowItemParam.detailUuids;
        } else {
          this.formData.detailUuids = "";
        }
        if (this.approvalData.workflowPackageVersion) {
          this.formData.workflowPackageVersion =
                  this.approvalData.workflowPackageVersion;
        } else {
          this.formData.workflowPackageVersion = "";
        }
        if (this.approvalData.workflowPackageId) {
          this.formData.workflowPackageId = this.approvalData.workflowPackageId;
        } else {
          this.formData.workflowPackageId = "";
        }
        //存储消息提醒的审批类型
        this.formData.applyTypeName = this.applyTitleform.applyTypeName;
        //关于知会人的参数
        if (this.form.personCode == null || this.form.personCode == "") {
          this.formData.isInformed = "N";
        } else {
          this.formData.userCode = this.form.personCode;
          this.formData.isInformed = "Y";
        }
        this.common.endLoading();
        this.common.startLoading();
        if (!this.isLast) {
          this.$axios
                  .post("/starflow/applyMes/sf/apply/saveOpinions", this.formData)
                  .then((response) => {
                    if (response.data.code == "0") {
                      this.common.endLoading();
                      this.common.alertMsg(1, "保存成功");
                      //如果是启动流程提交，关闭模态框。不是跳转待办页面。
                      this.$router.push({
                        path: "/todowork",
                        query: {
                          projectStatus: this.projectStatus,
                          projectType: this.projectType,
                        },
                      });
                      // this.common.alertMsg(1, "保存成功");
                    } else {
                      this.common.endLoading();
                      //执行失败
                      if (this.personItem.personUuid == "flowEnd") {
                        //修改业务审核状态
                        this.$store.dispatch("applyInfo/setFstate", "1");
                      } else if (
                              this.personform.customizedType &&
                              this.personform.customizedType == "isdrafter"
                      ) {
                        //修改业务审核状态
                        this.$store.dispatch("applyInfo/setFstate", "1");
                      }
                      this.common.alertMsg(4, response.data.msg);
                    }
                  });
        } else {
          submitToPerson(this.formData).then((resp) => {
            if (resp.code == "0") {
              this.common.endLoading();
              this.common.alertMsg(1, "保存成功");
              //如果是启动流程提交，关闭模态框。不是跳转待办页面。
              this.$router.push({
                path: "/" +
                        "" +
                        "todowork",
                query: {
                  projectStatus: this.projectStatus,
                  projectType: this.projectType,
                },
              });
            } else {
              this.common.endLoading();
              this.common.alertMsg(4, resp.msg);
            }

          });
          // this.$axios
          //   .post("/starflow/applyMes/sf/apply/submitToPerson", this.formData)
          //   .then((response) => {
          //     if (response.data.code == "0") {
          //       this.common.endLoading();
          //       this.common.alertMsg(1, "保存成功");
          //       //如果是启动流程提交，关闭模态框。不是跳转待办页面。
          //       this.$router.push({
          //         path: "/todowork",
          //         query: {
          //           projectStatus: this.projectStatus,
          //           projectType: this.projectType,
          //         },
          //       });
          //     } else {
          //       this.common.endLoading();
          //       this.common.alertMsg(4, response.data.msg);
          //     }
          //   });
        }
        // this.common.endLoading();
      },
      // 返回待办已办
      back() {
        if (this.jumpTag == "1") {
          this.$router.push({
            path: "/netFlowMgr/netFlowManagerList",
          });
          return false;
        }
        this.$router.push({
          name: "todowork",
          query: {
            projectStatus: this.projectStatus,
            projectType: this.projectType,
          },
        });
      },
      //点击收回按钮
      takeBack() {
        this.$confirm("确定要收回吗？", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
                .then(() => {
                  if (this.isBpm) {
                    this.common.alertMsg(2, "该流程bpm中流转过，流程无法收回");
                    this.$router.push({
                      path: "/todowork",
                      query: {
                        projectStatus: this.projectStatus,
                        projectType: this.projectType,
                      },
                    });
                    return false;
                  }
                  this.isTakeBackOrStopSuspend = "1";
                  this.common.startLoading();
                  this.formData.personUuId = this.personform.transactor;
                  if (this.flowItemParam.wftype) {
                    this.formData.wftype = this.flowItemParam.wftype;
                  } else {
                    this.formData.wftype = "";
                  }
                  this.formData.applyUuid = this.flowItemParam.applyUuid;
                  this.formData.activityId = this.personform.activity;
                  this.formData.transitionId = this.personform.transitionId;
                  //审核信息
                  this.formData.remark = this.opinionform.opinion;
                  this.formData.doCheck = this.opinionform.doCheck;
                  this.formData.doAgree = this.opinionform.doAgree;
                  //业务表主键uuid
                  if (this.flowItemParam.appDataUuid) {
                    this.formData.appDataUuid = this.flowItemParam.appDataUuid;
                  } else {
                    this.formData.appDataUuid = "";
                  }
                  this.formData.applyTitle = this.flowItemParam.applyTitle;
                  if (this.flowItemParam.workEffortId) {
                    this.formData.workEffortId = this.flowItemParam.workEffortId;
                  } else {
                    this.formData.workEffortId = "";
                  }
                  if (this.flowItemParam.detailUuids) {
                    this.formData.detailUuids = this.flowItemParam.detailUuids;
                  } else {
                    this.formData.detailUuids = "";
                  }
                  //存储消息提醒的审批类型
                  this.formData.applyTypeName = this.applyTitleform.applyTypeName;
                  this.common.endLoading();
                  this.common.startLoading();
                  this.$axios
                          .post("/starflow/applyMes/sf/apply/takeBack", this.formData)
                          .then((response) => {
                            if (
                                    response.data.code == "0" &&
                                    response.data.data.applyState == "4"
                            ) {
                              this.common.endLoading();
                              //收回成功修改业务审核状态
                              this.$store.dispatch("applyInfo/setStatus", "0");
                              this.$store.dispatch("applyInfo/setNewFstate", "0");
                              //效能审计方案审批（审批过程公用一个页面需要特殊处理）
                              this.common.alertMsg(1, "流程收回成功");
                              //如果是启动流程提交，关闭模态框。不是跳转待办页面。
                              this.$router.push({
                                path: "/todowork",
                                query: {
                                  projectStatus: this.projectStatus,
                                  projectType: this.projectType,
                                },
                              });
                            } else if (
                                    response.data.code == "0" &&
                                    response.data.data.applyState == "1"
                            ) {
                              this.common.endLoading();
                              this.common.alertMsg(1, "流程收回成功");
                              this.$router.push({
                                path: "/todowork",
                                query: {
                                  projectStatus: this.projectStatus,
                                  projectType: this.projectType,
                                },
                              });
                            } else if (response.data.data == "已受理") {
                              this.common.endLoading();
                              this.common.alertMsg(2, "下一环节审批人已查看，无法收回");
                              this.$router.push({
                                path: "/todowork",
                                query: {
                                  projectStatus: this.projectStatus,
                                  projectType: this.projectType,
                                },
                              });

                              this.common.endLoading();
                            } else if (response.data.data == "只能收回一步") {
                              this.common.endLoading();
                              this.common.alertMsg(2, "只能收回一步");
                              this.$router.push({
                                path: "/todowork",
                                query: {
                                  projectStatus: this.projectStatus,
                                  projectType: this.projectType,
                                },
                              });
                            } else {
                              this.common.endLoading();
                              this.common.alertMsg(4, "流程收回失败");
                            }
                          });
                })
                .catch(() => {});
      },

      //点击终止按钮
      stopSuspend() {
        this.$confirm(this.textShare.stopSuspendOperation(), "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
                .then(() => {
                  if (this.isBpm) {
                    this.common.alertMsg(2, "该流程bpm中流转过，流程无法终止");
                    this.$router.push({
                      path: "/netFlowMgr/netFlowManagerList",
                    });
                    return false;
                  }
                  this.isTakeBackOrStopSuspend = "2";
                  this.$store.dispatch("applyInfo/setNewFstate", "0");
                  this.common.startLoading();
                  this.$store.dispatch(
                          "applyInfo/setDoCheckStatus",
                          this.opinionform.doCheck
                  ); //
                  //修改业务审核状态
                  this.$store.dispatch("applyInfo/setStatus", "0");
                  //预留终止之后修改对应业务状态方法 使用时放开即可
                  // var templateParam = this.$route.params.approvalData.appDataUuid
                  // this.$refs.applyPage.updateApplyStatusBecauseBackApplication(templateParam)
                })
                .catch(() => {});
      },
      //终止流程
      stopSuspendFlow() {
        this.formData.personUuId = this.personform.transactor;
        if (this.flowItemParam.wftype) {
          this.formData.wftype = this.flowItemParam.wftype;
        } else {
          this.formData.wftype = "";
        }
        this.formData.applyUuid = this.flowItemParam.applyUuid;
        this.formData.activityId = this.personform.activity;
        this.formData.transitionId = this.personform.transitionId;
        //审核信息
        this.formData.remark = this.opinionform.opinion;
        this.formData.doCheck = this.opinionform.doCheck;
        this.formData.doAgree = this.opinionform.doAgree;
        //业务表主键uuid
        if (this.flowItemParam.appDataUuid) {
          this.formData.appDataUuid = this.flowItemParam.appDataUuid;
        } else {
          this.formData.appDataUuid = "";
        }
        this.formData.applyTitle = this.flowItemParam.applyTitle;
        if (this.flowItemParam.workEffortId) {
          this.formData.workEffortId = this.flowItemParam.workEffortId;
        } else {
          this.formData.workEffortId = "";
        }
        if (this.flowItemParam.detailUuids) {
          this.formData.detailUuids = this.flowItemParam.detailUuids;
        } else {
          this.formData.detailUuids = "";
        }
        //存储消息提醒的审批类型
        this.formData.applyTypeName = this.applyTitleform.applyTypeName;
        this.common.endLoading();
        this.common.startLoading();
        this.$axios
                .post("/starflow/applyMes/sf/apply/stopSuspend", this.formData)
                .then((response) => {
                  if (response.data.data) {
                    this.common.endLoading();

                    //如果是启动流程提交，关闭模态框。不是跳转待办页面。
                    this.$router.push({
                      path: "/netFlowMgr/netFlowManagerList",
                    });
                    this.common.alertMsg(1, "流程终止成功");
                  } else {
                    this.common.endLoading();
                    //执行失败
                    //修改业务审核状态
                    this.$store.dispatch("applyInfo/setStatus", "1");
                    this.common.alertMsg(4, "终止流程失败");
                    this.common.endLoading();
                  }
                });
      },
      //惯用语下拉框选择测试接口
      applyIdiomTest() {
        this.$axios
                .post("/sess/amsApplyIdiom/pageListCurrentPerson", this.pageQueryTree)
                .then((resp) => {
                  this.reportNameList = [];
                  var items = resp.data.data.records;
                  for (let i in items) {
                    var obj = {};
                    obj.id = items[i].idiomUuid;
                    obj.name = items[i].idiomContent;
                    this.reportNameList.push(obj);
                  }
                });
      },
      selectedValue(value) {
        //惯用语选中赋值
        this.opinionform.opinion = value;
      },
      sonFun(){
        this.add()
      },
      checkedPersonList(value){
        this.selectPersonUuidList = []
        this.selectPersonUuidList.push(value)
      }
    },
  };
</script>
<style src="../css/tableItem.css">
</style>
<style src="../css/form.css">
</style>
<style scoped >
  .admin_right_main{
    height: calc(100vh - 100px);
    overflow: auto;
  }

  .admin_right_main >>> .content_form .el-input .el-input__inner {
    width: 360px;
  }

  .todoDetail  >>>.el-form-item__label {
    float: left !important;
  }

  .todoDetail .form_item_one >>>.el-form-item__content {
    margin-left: 0px !important;
  }
  .todoDetail >>> .el-form-item__label {
    font-weight: normal !important;
  }
  .todoDetail >>> .el-radio__label {
    /* color: #68707a !important; */
    font-size: 13px !important;
  }
  .todoDetail >>>.el-radio {
    color: #68707a !important;
  }
</style>