<template>
  <div class="admin_right_main">
    <template v-if="flowSet.opinionList">
      <div class="table_template">
        <div class="table_header"
             v-if="tableOption.isShowHeader !=undefined?tableOption.isShowHeader:true">
          <div class="table_header_default">
            <div class="table_header_default_title">
              <div class="marginR40">
                <span class="title_font">审批列表</span>
              </div>
            </div>
          </div>
        </div>
        <el-table ref="opinionTable"
                  :data="tableData"
                  border
                  style="width: 100%">
          <el-table-column label="序号"
                           type="index"></el-table-column>
          <el-table-column prop="activityName"
                           label="活动"
                           width></el-table-column>
          <el-table-column prop="noteText"
                           label="意见"></el-table-column>
          <el-table-column prop="personName"
                           label="姓名"
                           width></el-table-column>
          <el-table-column prop="noteDate"
                           label="办理时间"></el-table-column>
        </el-table>
      </div>
    </template>
    <template v-if="flowSet.opinion">
      <div class="opinion_template">
        <div class="title_template">
          <span class="title_font">审批意见</span>
        </div>
        <div class="content">
          <div class>
            <el-form ref="form"
                     :model="opinionform"
                     label-width="128px"
                     size="mini">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="处理意见"
                                class="form_item"
                                prop="opinion">
                    <el-input type="textarea"
                              v-model="opinionform.opinion"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </div>
      </div>
    </template>
    <div class="person_template">
      <div class="title_template">
        <span class="title_font">选择下一步</span>
      </div>
      <div class="content">
        <div class>
          <el-form ref="form"
                   :model="personform"
                   label-width="128px"
                   size="mini">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="流程节点"
                              class="form_item"
                              v-if="flowItem.wftype != 'dtOperatePermissionApply'">
                  <el-radio-group v-model="personform.activity"
                                  @change="handleChange">
                    <el-radio v-for="(item,index) in activityList"
                              :key="index"
                              :label="item.activityId">{{ item.activityName }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>

                <!--数据使用申请情况下 start-->
                <el-form-item label="流程节点"
                              class="form_item"
                              v-if="flowItem.wftype === 'dtOperatePermissionApply'">
                  <el-checkbox-group v-model="activityChecked">
                    <el-checkbox v-for="(item,index) in activityList"
                                 :key="index"
                                 :label="item"
                                 :checked="isSubscriber(item.activityName)"
                                 :disabled="isSubscriber(item.activityName)"><span
                            @click.prevent="currentChecked = index">{{ item.activityName }}</span>
                    </el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
                <!--数据使用申请情况下 end-->

              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="办理人"
                              class="form_item"
                              v-if="flowItem.wftype != 'dtOperatePermissionApply'">
                  <el-checkbox-group v-model="checkedPerList"
                                     @change="checkedPersonList"
                                     v-if="this.isAllAssignment=='checkbox'">
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <el-checkbox v-for="item in personItem"
                                     :key="item.personUuid"
                                     :label="item.personUuid">{{ item.personName }}
                        </el-checkbox>
                      </el-col>
                    </el-row>
                  </el-checkbox-group>
                  <el-radio-group v-model="personform.transactor"
                                  v-if="this.isAllAssignment=='radio'">
                    <el-row :gutter="20">
                      <el-col :span="12"
                              v-for="(item,index) in personItem"
                              :key="index">
                        <el-radio :label="item.personUuid">{{ item.personName }}</el-radio>
                      </el-col>
                    </el-row>
                  </el-radio-group>
                </el-form-item>

                <!--数据使用申请情况下 start-->
                <el-form-item label="办理人"
                              class="form_item"
                              v-if="flowItem.wftype === 'dtOperatePermissionApply'">
                  <el-checkbox-group v-model="perCheckedTemp"
                                     @change="checkedPersonListApply">
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <el-checkbox v-for="(item,index) in personItem"
                                     :key="item.personUuid"
                                     :label="item.personUuid"
                                     :checked="currentChecked == 0"
                                     :disabled="currentChecked == 0"><span>{{ item.personName }}</span>
                        </el-checkbox>
                      </el-col>
                    </el-row>
                  </el-checkbox-group>
                </el-form-item>
                <!--数据使用申请情况下 end-->

              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { submitToPerson, selectPerson4Data, submitToPersonDistribute } from "@/api/starflow";
import { json } from "body-parser";
import { getDefaultPersonId } from "@/api/data/dataPermission";

export default {
  props: ["flowItem", "flowSet", "flowParam"],
  data () {
    return {
      tableOption: { isShowHeader: true, height: "auto" },
      opinionItem: {},
      tableData: [],
      opinionform: {
        opinion: ""
      },
      personform: {
        activity: "",
        transactor: "",
        transitionId: ""
      },
      //存放临时的数组
      activityList: [],
      personItem: [],
      formData: {},
      checkedPerList: [],
      isAllAssignment: "",
      //选择的下一节点集合
      activityChecked: [],
      //临时存储当前显示身份选中人员
      perCheckedTemp: [],
      //需要按顺序插入选中人员
      perChecked: [[], [], []],
      //当前节点，数据授权三个身份，区分当前身份，显示当前身份所有人员，身份的顺序唯一标识
      //0：认权人  1：数据管理员   2：行领导
      currentChecked: 0
    };
  },
  //mounted：页面初始化方法，html加载完成后执行，执行顺序:子组件-父组件
  mounted: function () {
    this.init();
  },
  computed: {
    lessionMstate () {
      return this.$store.state.applyInfo.applyInfo.mstate;
    }
  },
  watch: {
    flowParam () {
      var mstate = this.$store.state.applyInfo.applyInfo.mstate;
      if (mstate == "0") {
        this.submitFlow();
        //业务数据更新失败，提醒重新提交
      }
    },
    activityChecked (newVal, oldVal) {
      if (newVal[newVal.length - 1].activityName === '数据管理员') {
        this.currentChecked = 1;
      } else if (newVal[newVal.length - 1].activityName === '行领导') {
        this.currentChecked = 2;
      }
    },
    currentChecked (newVal, oldVal) {
      this.personItem = this.activityList[newVal].personList;
      this.perCheckedTemp = this.perChecked[newVal];
    }
  },
  methods: {
    init () {
      selectPerson4Data(this.flowItem).then((resp) => {
        //初始化列表数据
        if (resp.data) {
          if (resp.data.noteMap.startdetail) {
            this.opinionItem = resp.data.noteMap.startdetail;
            this.opinionItem.activityName = "申请人";
            this.tableData.push(this.opinionItem);
            this.tableData.push.apply(
              this.tableData,
              resp.data.noteMap.detailList
            );
          }
          //初始化参数流程，人员参数
          this.activityList = resp.data.personList;
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
          this.personItem.forEach(item => {
            if (item.personUuid == "flowEnd") {
              item.personName = "无";
            }
          });
        }
        if (this.flowItem.wftype === 'dtOperatePermissionApply') {
          this.initForApply();
        }
      });
    },
    handleChange (val) {
      this.checkedPerList = [];
      this.activityList.forEach(item => {
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
          this.personItem.forEach(item => {
            if (item.personUuid == "flowEnd") {
              item.personName = "无";
            }
          });
          return;
        }
      });
    },
    save () {
      //设置审核状态为审核中调用父页面监听执行更新业务审核状态方法
      this.$store.dispatch("applyInfo/setStatus", "1");
    },
    submitFlow () {
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
      if (this.flowItem.appDataUuid) {
        this.formData.appDataUuid = this.flowItem.appDataUuid;
      } else {
        this.formData.appDataUuid = "";
      }
      this.formData.applyTitle = this.flowItem.applyTitle;
      if (this.flowItem.workEffortId) {
        this.formData.workEffortId = this.flowItem.workEffortId;
      } else {
        this.formData.workEffortId = "";
      }
      if (this.flowItem.detailUuids) {
        this.formData.detailUuids = this.flowItem.detailUuids;
      } else {
        this.formData.detailUuids = "";
      }
      if (this.flowItem.temp1) {
        this.formData.temp1 = this.flowItem.temp1;
      } else {
        this.formData.temp1 = "";
      }
      if (this.flowItem.wftype === 'dtOperatePermissionApply') {
        this.submitFlowForApply();
      } else {
        submitToPerson(this.formData).then((resp) => {
          console.info(JSON.stringify(resp.code))
          if (resp.code == 0) {
            this.common.alertMsg(1, "保存成功");
            //启动流程提交，关闭模态框。
            this.$emit("UpdateBecauseSubmit")
            this.$emit("closeModal", false);
          } else {
            //执行失败
            this.common.alertMsg(4, resp.msg);
            this.$emit("delectData", false);
          }
        });
      }
    },
    checkedPersonList (value) {
      //临时存放被选中人的id集合 和 类的集合
      this.selectPersonUuidList = []
      this.selectPersonUuidList.push(value)
    },
    //数据使用授权申请情况下 start
    //选择办理人
    checkedPersonListApply (value) {
      this.perChecked[this.currentChecked] = value;
      if (value.length > 0) {
        if (this.currentChecked == 1) {
          let flag = true;
          for (let i = 1; i < this.activityChecked.length; i++) {
            if (this.activityChecked[i].activityName == '数据管理员') {
              flag = false;
              break;
            }
          }
          if (flag) {
            this.activityChecked.push(this.activityList[1]);
          }
        } else if (this.currentChecked == 2) {
          let flag = true;
          for (let i = 1; i < this.activityChecked.length; i++) {
            if (this.activityChecked[i].activityName == '行领导') {
              flag = false;
              break;
            }
          }
          if (flag) {
            this.activityChecked.push(this.activityList[2]);
          }
        }
      }
    },
    //认权人默认选中
    isSubscriber (value) {
      if (value === '认权人') {
        return true;
      }
      return false;
    },
    //数据授权申请初始化
    initForApply () {
      for (let i = 0; i < this.activityList.length; i++) {
        if (this.activityList[i].activityName == '数据管理员') {
          this.activityList.unshift(this.activityList.splice(i, 1)[0]);
        }
      }
      for (let i = 0; i < this.activityList.length; i++) {
        if (this.activityList[i].activityName == '认权人') {
          this.activityList.unshift(this.activityList.splice(i, 1)[0]);
        }
      }
      //获取认权人信息
      getDefaultPersonId(this.flowItem.appDataUuid).then(resp => {
        this.activityList[0].personList.pop();
        for (let i = 0; i < resp.data.length; i++) {
          this.activityList[0].personList.push({
            orgUuid: null,
            personName: resp.data[i].personName,
            personUuid: resp.data[i].personUuid,
            sysName: null,
          })
          this.perChecked[0].push(resp.data[i].personUuid);
        }
        this.personItem = this.activityList[this.currentChecked].personList;
      });
    },
    //分发提交
    submitFlowForApply () {
      let hasAdministrator = false;
      let hasBankLeader = false;
      let activityId = [];
      let transitionIds = [];
      let personId = [];
      activityId.push(this.activityChecked[0].activityId);
      transitionIds.push(this.activityChecked[0].transitionId);
      for (let i = 0; i < this.activityChecked.length; i++) {
        if (this.activityChecked[i].activityName == '数据管理员') {
          hasAdministrator = true;
          if (this.perChecked[1].length == 0) {
            this.activityChecked.splice(i, 1);
          } else {
            activityId.splice(1, 0, this.activityChecked[i].activityId);
            transitionIds.splice(1, 0, this.activityChecked[i].transitionId);
          }
        }
        if (this.activityChecked[i].activityName == '行领导') {
          hasBankLeader = true;
          if (this.perChecked[2].length == 0) {
            this.activityChecked.splice(i, 1);
          } else {
            activityId.push(this.activityChecked[i].activityId);
            transitionIds.push(this.activityChecked[i].transitionId);
          }
        }
      }
      if (!hasBankLeader) {
        this.perChecked.splice(2, 1);
      }
      if (!hasAdministrator) {
        this.perChecked.splice(1, 1);
      }
      this.formData.activityId = activityId.join(",");
      for (let i = 0; i < this.perChecked.length; i++) {
        personId.push(this.perChecked[i].join(","));
      }
      this.formData.personUuId = personId.join("|");
      this.formData.transitionId = transitionIds.join(",");
      submitToPersonDistribute(this.formData).then((resp) => {
        console.info(JSON.stringify(resp.code))
        if (resp.code == 0) {
          this.common.alertMsg(1, "保存成功");
          //启动流程提交，关闭模态框。
          this.$emit("UpdateBecauseSubmit")
          this.$emit("closeModal", false);
        } else {
          //执行失败
          this.common.alertMsg(4, resp.msg);
          this.$emit("delectData", false);
        }
      });
    },
    //数据使用授权申请情况下 end
  }
};
</script>

<style src="../css/tableItem.css" scoped>
</style>
<style scoped>
.table_template >>> .el-radio__inner {
  width: 16px;
  height: 16px;
  border: 1px solid #aeb9ca;
}

.table_template >>> .el-radio__inner::after {
  width: 8px;
  height: 8px;
}

.table_template >>> .el-radio__label {
  font-family: PingFangSC-Regular;
  font-size: 12px;
  color: #8998ac;
  letter-spacing: 0;
  line-height: 16px;
}

.table_template >>> .el-radio__input.is-checked + .el-radio__label {
  font-family: PingFangSC-Regular;
  font-size: 12px;
  color: #8998ac;
  letter-spacing: 0;
  line-height: 16px;
}

.table_template >>> .el-radio__input.is-checked .el-radio__inner {
  background: #0070c6 !important;
  border-color: #0070c6 !important;
}
</style>