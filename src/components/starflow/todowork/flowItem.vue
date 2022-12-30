<template>
    <div class="admin_right_main">
        <template v-if="flowSet.opinionList">
            <div class="table_template">
                <div
                        class="table_header"
                        v-if="tableOption.isShowHeader !=undefined?tableOption.isShowHeader:true"
                >
                    <div class="table_header_default">
                        <div class="table_header_default_title">
                            <div class="marginR40">
                                <span class="title_font">审批列表</span>
                            </div>
                        </div>
                    </div>
                </div>
                <el-table ref="opinionTable" :data="tableData" border style="width: 100%">
                    <el-table-column label="序号" type="index"></el-table-column>
                    <el-table-column prop="activityName" label="活动" width></el-table-column>
                    <el-table-column prop="noteText" label="意见"></el-table-column>
                    <el-table-column prop="personName" label="姓名" width></el-table-column>
                    <el-table-column prop="noteDate" label="办理时间"></el-table-column>
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
                        <el-form ref="form" :model="opinionform" label-width="128px" size="mini">
                            <el-row :gutter="20">
                                <el-col :span="8">
                                    <el-form-item label="处理意见" class="form_item" prop="opinion">
                                        <el-input type="textarea" v-model="opinionform.opinion"></el-input>
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
                    <el-form ref="form" :model="personform" label-width="128px" size="mini">
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="流程节点" class="form_item">
                                    <el-radio-group v-model="personform.activity" @change="handleChange">
                                        <el-radio
                                                v-for="(item,index) in activityList"
                                                :key="index"
                                                :label="item.activityId"
                                        >{{item.activityName}}</el-radio>
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
                                            v-if="this.isAllAssignment=='checkbox'"
                                    >
                                        <el-row :gutter="20">
                                            <el-col :span="12">
                                                <el-checkbox
                                                        v-for="item in personItem"
                                                        :key="item.personUuid"
                                                        :label="item.personUuid"
                                                >{{item.personName}}</el-checkbox>
                                            </el-col>
                                        </el-row>
                                    </el-checkbox-group>
                                    <el-radio-group
                                            v-model="personform.transactor"
                                            v-if="this.isAllAssignment=='radio'"
                                    >
                                        <el-row :gutter="20">
                                            <el-col :span="12" v-for="(item,index) in personItem" :key="index">
                                                <el-radio :label="item.personUuid">{{item.personName}}</el-radio>
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
    </div>
</template>

<script>
    import { submitToPerson,selectPerson4Data } from "@/api/starflow";
    import { json } from "body-parser";
    export default {
        props: ["flowItem", "flowSet","flowParam"],
        data() {
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
                isAllAssignment: ""
            };
        },
        //mounted：页面初始化方法，html加载完成后执行，执行顺序:子组件-父组件
        mounted: function() {
            this.init();
        },
        computed: {
            lessionMstate() {
                return this.$store.state.applyInfo.applyInfo.mstate;
            }
        },
        watch: {
            flowParam(){
                var mstate = this.$store.state.applyInfo.applyInfo.mstate;
                if (mstate == "0") {
                    this.submitFlow();
                    //业务数据更新失败，提醒重新提交
                }
            }
        },
        methods: {
            init() {
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
                });
            },
            handleChange(val) {
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
            save() {
                //设置审核状态为审核中调用父页面监听执行更新业务审核状态方法
                this.$store.dispatch("applyInfo/setStatus", "1");
            },
            submitFlow() {
                if (this.isAllAssignment == "checkbox") {
                    this.formData.personUuId = this.checkedPerList.join(",");
                } else {
                    this.formData.personUuId = this.personform.transactor;
                }
                this.formData.isAllAssignment=this.isAllAssignment;
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
                submitToPerson(this.formData).then((resp) => {
                    console.info(JSON.stringify(resp.code))
                    if (resp.code == 0) {
                        this.common.alertMsg(1, "保存成功");
                        //启动流程提交，关闭模态框。
                        this.$emit("closeModal", false);
                    } else {
                        //执行失败
                        this.common.alertMsg(4, resp.msg);
                        this.$emit("delectData", false);
                    }
                });
            }
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
        background: #0070c6;
        border-color: #0070c6;
    }
</style>