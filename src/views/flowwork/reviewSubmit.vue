<template>
  <div class="admin_right_main todoDetail" id="flowItem2">
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
                type="input"
                :title="applyTitleform.applyTitle"
                v-model="applyTitleform.applyTitle"
              ></el-input>
            </el-form-item>
          </el-col>
          <!--          <el-col :span="12">-->
          <!--            <el-form-item label="审批类型：" class="form_item form_item_one" style="display:flex;">-->
          <!--              <div class="noEditDiv">{{applyTitleform.applyTypeName}}</div>-->
          <!--            </el-form-item>-->
          <!--          </el-col>-->
        </el-row>
      </el-form>
    </div>
    <template>
      <businessDetail
        ref="businessDetail"
        :flowItem="flowItem"
        :columnDefs="columnDefs"
        :submitData="submitData"
        :ifdel="false"
        @submitFlow="submitFlow"
      ></businessDetail>
    </template>
    <el-form>
      <el-form-item label="发布路径">
        <el-input v-model="treeUrlname" disabled></el-input>
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="showWorkTree = true"
      >选择发布位置</el-button
    >

    <!-- 流程内容：审核意见、填写意见、选择下一步 -->
    <div class="flow_template">
      <template>
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
                </el-row>
              </el-form>
            </div>
          </div>
        </div>
      </template>
      <template>
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
                        @change="checkedPersonList"
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
    </div>
    <el-dialog
      :visible.sync="showWorkTree"
      :modal="false"
      title="选择要发布到的位置"
    >
      <div>
        <ModelFolderTree
          ref="modelFolderTree"
          :public-model="publicModelValue"
        />
        <div slot="footer" style="padding: 10px 0">
          <el-button type="primary" @click="updatePublicModel">确定</el-button>
          <el-button @click="showWorkTree = false">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import ModelFolderTree from "@/views/analysis/auditmodel/modelfoldertree";
//用于知会人
import businessDetail from "./reviewDetail";
export default {
  props: ["flowItem", "flowSet", "flowParam", "columnDefs", "submitData"],
  components: {
    businessDetail,
    ModelFolderTree,
  },
  data() {
    return {
      // 发布模型
      publicModelValue: "publicModel",
      //文件结构树相关
      treeUrlname: "",
      treeUrlid: "",
      showWorkTree: false,
      //是否显示业务组件
      displayBus: false,
      //是否显示知会人
      notifyPersonTag: false,
      //选择知会人弹窗
      dialogVisibleNotifyPerson: false,
      //知会人使用集合
      form: {},
      jumpTag: "",
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
      approvalData: [],
    };
  },
  destroyed() {
    clearInterval(this.timer);
  },
  mounted: function () {
    this.applyTitleform.applyTitle = this.flowItem.applyTitle;
    this.applyTitleform.applyTypeName = this.flowItem.applyTypeName;
    this.applyTitleform.applyType = this.flowItem.applyType;
    this.init();
  },
  watch: {
    treeUrlid: {
      handler(val, oldVal) {
        this.$emit("changeTreeData", {
          treeUrlname: this.treeUrlname,
          treeUrlid: this.treeUrlid,
        });
      },
    },
  },
  methods: {
    /**
     * 修改要发布的模型
     */
    updatePublicModel() {
      const selectNode = this.$refs.modelFolderTree.getSelectNode();
      this.showWorkTree = false;
      console.log(selectNode);
      this.treeUrlname = selectNode.label;
      this.treeUrlid = selectNode.id;
    },
    //获取applyInfo信息
    init() {
      this.axios
        .post("/starflow/applyMes/sf/apply/selectPerson4Data", this.flowItem)
        .then((response) => {
          //初始化列表数据
          if (response.data.data) {
            if (response.data.data.noteMap.startdetail) {
              this.opinionItem = response.data.data.noteMap.startdetail;
              this.opinionItem.activityName = "申请人";
              this.tableData.push(this.opinionItem);
              this.tableData.push.apply(
                this.tableData,
                response.data.data.noteMap.detailList
              );
            }
            //初始化参数流程，人员参数
            this.activityList = response.data.data.personList;
            this.personItem = this.activityList[0].personList;
            this.isAllAssignment = this.activityList[0].isAllAssignment;
            this.personform.activity = this.activityList[0].activityId;
            this.personform.transitionId = this.activityList[0].transitionId;
            this.personform.transactor = this.personItem[0].personUuid;
            if (this.activityList[0].customizedType) {
              this.personform.customizedType = this.activityList[0].activityId;
            } else {
              this.personform.customizedType = "";
            }
            //处理流程结束节点，如果是结束节点，设置人员的名称为无
            this.personItem.forEach((item) => {
              if (item.personUuid == "flowEnd") {
                item.personName = "无";
              }
            });
          }
        })
        .catch(function (error) {
          console.log(error);
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

    /**
     * 工作流  点击提交审核按钮
     */
    saveOpinion() {
      setTimeout(() => {
        this.$refs["businessDetail"].saveOpinion(
          this.applyTitleform.applyTitle
        );
      }, 20);
    },

    submitFlow(modelRelationUuid) {
      if (this.isAllAssignment == "checkbox") {
        this.formData.personUuId = this.checkedPerList.join(",");
      } else {
        this.formData.personUuId = this.personform.transactor;
      }
      this.formData.isAllAssignment = this.isAllAssignment;
      if (this.flowItem.wftype) {
        this.formData.wftype = this.flowItem.wftype;
      } else {
        this.formData.wftype = "";
      }
      this.formData.applyUuid = this.flowItem.applyUuid;
      this.formData.versionUuid = this.flowItem.versionUuid;
      this.formData.activityId = this.personform.activity;
      this.formData.transitionId = this.personform.transitionId;
      //是否大项目
      this.formData.temp2 = this.flowItem.planTag;
      //审核信息
      this.formData.remark = this.opinionform.opinion;
      //业务表主键uuid
      this.formData.appDataUuid = modelRelationUuid;
      this.formData.applyTitle = this.applyTitleform.applyTitle;
      this.formData.workEffortId = "";
      if (this.flowItem.detailUuids) {
        this.formData.detailUuids = this.flowItem.detailUuids;
      } else {
        this.formData.detailUuids = "";
      }
      // console.log(this.formData);
      this.axios
        .post("/starflow/applyMes/sf/apply/submitToPerson", this.formData)
        .then((response) => {
          if (response.data.code == "0") {
            this.common.alertMsg(1, "保存成功");
            //启动流程提交，关闭模态框。
            this.$emit("closeModal", false);
            // this.$emit("delectData", false);
          } else {
            //执行失败
            this.common.alertMsg(4, response.data.msg);
            this.$emit("delectData", false);
          }
        })
        .catch((error) => {
          console.log(error);
          //执行失败
          this.common.alertMsg(4, error);
          this.$emit("delectData", false);
        });
    },
  },
};
</script>
<style>
.admin_right_main .content_form .el-input .el-input__inner {
  width: 360px;
}

.todoDetail .el-form-item__label {
  float: left !important;
}

.todoDetail .form_item_one .el-form-item__content {
  margin-left: 0px !important;
}
.todoDetail .el-form-item__label {
  font-weight: normal !important;
}
.todoDetail .el-radio__label {
  /* color: #68707a !important; */
  font-size: 13px !important;
}
.todoDetail .el-radio {
  color: #68707a !important;
}
#flowItem2 .el-button--primary {
  background-color: #409eff !important;
  border-color: #409eff !important;
  color: #fff !important;
}
.title_template {
  padding: 20px 0 10px 0 !important;
}
</style>