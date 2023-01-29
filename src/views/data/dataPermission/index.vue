<template>
    <div class="dataPermission">
        <!-- 搜索 -->
        <div class="searchBlock">
            <div class="search">
                <div class="search-title">申请名称:</div>
                <div class="search-operation">
                    <el-input
                        v-model="dataBaseData.condition.permissionApplyName"
                        size="small"
                        placeholder="请输入内容"
                        clearable
                    ></el-input>
                </div>
            </div>
            <div class="search">
                <div class="search-title">申请人:</div>
                <div class="search-operation">
                    <el-input
                        v-model="dataBaseData.condition.createUserName"
                        size="small"
                        placeholder="请输入内容"
                        clearable
                    ></el-input>
                </div>
            </div>

            <div class="search">
                <div class="search-title">列表类型:</div>
                <div class="search-operation">
                    <el-select
                        v-model="dataBaseData.condition.workFlowState"
                        filterable
                        clearable
                        placeholder="全部"
                        size="small"
                    >
                        <el-option
                            v-for="(item, index) in listType"
                            :key="index"
                            :label="item.name"
                            :value="item.id"
                        ></el-option>
                    </el-select>
                </div>
            </div>

            <div class="search">
                <div class="search-title">申请时间范围:</div>
                <div class="search-operation">
                    <el-date-picker
                        v-model="times"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                    >
                    </el-date-picker>
                </div>
            </div>
            <div class="search-btn">
                <el-button size="mini" type="primary" @click="goQuery">查询</el-button>
                <el-button size="mini" type="primary" @click="reset">重置</el-button>
            </div>
        </div>
        <!-- 列表 -->
        <div class="listDisplay">
            <div class="operation">
                <!-- <div class="num">
                  查询结果 <span>{{ dataBaseData.total }}</span> 条
                </div> -->
                <div class="operationBut">
                    <el-button size="mini" type="primary" @click="add">添加</el-button>
                    <el-button size="mini" type="primary" @click="goDelete"
                    >删除
                    </el-button
                    >
                    <el-button size="mini" type="primary" @click="goHandle"
                    >办理
                    </el-button
                    >
                    <el-button size="mini" type="primary" @click="goExport"
                    >导出
                    </el-button
                    >
                </div>
            </div>
            <el-table
                :data="tableData"
                border
                style="width: 100%"
                stripe
                v-loading="loading"
                row-key="id"
                height="calc(100vh - 310px)"
                @selection-change="addSelected"
            >
                <el-table-column type="selection" width="55">
                </el-table-column>
                <el-table-column
                    prop="permissionApplyName"
                    label="申请名称"
                    show-overflow-tooltip
                    min-width="150px"
                ></el-table-column>
                <el-table-column
                    prop="createTime"
                    label="申请时间"
                    show-overflow-tooltip
                    min-width="150px"
                >
                </el-table-column>
                <el-table-column
                    prop="workFlowHandlink"
                    label="当前环节"
                    min-width="150px"
                    show-overflow-tooltip
                >
                </el-table-column>
                <el-table-column
                    prop="workFlowState"
                    label="状态"
                    width="100px"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">
                        {{ scope.row.workFlowState | workFlowStateFilter }}
                    </template>
                </el-table-column>
                <el-table-column
                    prop="createUserName"
                    label="申请人"
                    width="150px"
                    show-overflow-tooltip
                ></el-table-column>
                <el-table-column prop="mobile" label="操作" width="120px">
                    <template slot-scope="scope">
                        <div class="editBtn" @click="processView(scope.row)">流程查看</div>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pager">
                <el-pagination
                    small
                    background
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :total="total"
                ></el-pagination>
            </div>
        </div>
        <!-- 新增弹窗 -->
        <el-dialog
            :visible.sync="showAddDialog"
            title="创建申请"
            :close-on-click-modal="false"
            :modal-append-to-body="false"
            width="80%"
            :close-on-press-escape="false"
        >
            <Add @close="closeAddDrawer" @oka="addSucceed" v-if="showAddDialog"></Add>
        </el-dialog>
        <!--    流程办理弹窗-->
        <el-dialog
            v-if="dialogFlowItemShow"
            :close-on-click-modal="false"
            :visible.sync="dialogFlowItemShow"
            title="流程提交"
            width="50%"
        >
            <div>
                <FlowItem
                    ref="flowItem"
                    :flowSet="flowSet"
                    :flowItem="flowItem"
                    :flow-param="flowParam"
                    :columnDefs="columnDefs"
                    :submitData="submitData"
                    :defaultPersonId="defaultPersonId"
                    @closeModal="closeFlowItem"
                    @delectData="delectData"
                    @UpdateBecauseSubmit="updateForSubmit"
                ></FlowItem>
            </div>
            <span class="sess-flowitem" slot="footer">
        <el-button
            size="mini"
            type="primary"
            class="table_header_btn"
            @click="saveOpinion"
        >提交</el-button
        >
        <el-button
            size="mini"
            type="primary"
            class="table_header_btn"
            @click="dialogFlowItemShow = false"
        >关闭</el-button
        >
      </span>
        </el-dialog>
        <!--流程跟踪弹窗-->
        <el-dialog
            title="流程跟踪"
            :visible.sync="todoFlow"
            v-if="todoFlow"
            width="80%"
        >
            <div>
                <flowOpinionList
                    :applyUuid="applyUuid"
                    :pageFrom="applyPage"
                ></flowOpinionList>
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
    </div>
</template>

<script>
import Add from './add.vue'
import {
    deleteOperatePermissionApply,
    queryAllOperatePermissionApply,
    updateForHandle
} from "@/api/data/dataPermission";
import {formatDate} from "ams-etlscheduler-hx/src/components/etl/filter/filter";
import FlowItem from '@/components/starflow/todowork/flowItem'
import flowOpinionList from "@/components/starflow/todowork/flowOpinionList";

export default {
    name: "dataPermission",
    components: {
        Add,
        FlowItem,
        flowOpinionList,
    },
    props: [],
    data() {
        return {
            listType: [{name: "草稿", id: "0"}, {name: "办理中", id: "1"}, {name: "办理完成", id: "2"}],
            //新增弹窗是否显示
            showAddDialog: false,
            loading: false,
            dataBaseData: {
                pageSize: 10,
                pageNo: 1,
                condition: {
                    permissionApplyName: '',
                    createUserName: '',
                    workFlowState: '',
                    permissionApplyStartTime: '',
                    permissionApplyEndTime: '',
                }
            },
            tableData: [],
            times: [],
            total: 0,
            selected: [],
            temp: {
                sceneUuid: undefined,
                sceneName: '',
                sceneCode: ''
            },
            flowItem: {
                //动态赋值
                wftype: "dtOperatePermissionApply",//当前业务所属的流程的id
                applyUuid: "",//申请单主键id
                detailUuids: "",
                applyTitle: "",//请求的标题
                workEffortId: "",//节点id
                appDataUuid: "",//业务主键id
                versionUuid: "",//版本id
                isSecond: false,
                temp1: "",
            },
            dialogFlowItemShow: false,//流程弹窗
            flowSet: {
                opinionList: false,
                opinion: false,
                nextStep: true,
                isSecond: false,
            },
            flowParam: 0,
            columnDefs: [],
            submitData: {
                versionUuid: "tlLuwUhC",
                busTableName: "", //表名
                busDatabaseName: "warehouse", //数据库名
                busDatabaseType: "", //
                status: "1", //预警数据状态
                busdatas: [],
            },
            defaultPersonId: [],
            todoFlow: false, //流程查看的弹窗控制
            applyPage: "applyPage", //有这个标识 查询流程的时候会走相对应的方法
        };
    },
    computed: {},
    watch: {},
    mounted() {
    },
    created() {
        this.goQuery();
    },
    methods: {
        //改变选中数据
        addSelected(val) {
            this.selected = val
        },
        handleCurrentChange(val) {
            this.dataBaseData.pageNo = val
            this.goQuery();
        },
        handleSizeChange(val) {
            this.dataBaseData.pageSize = val
            this.goQuery();
        },
        // 查询
        goQuery() {
            if (this.times && this.times.length > 0) {
                let startTime = new Date(this.times[0]);
                let endTime = new Date(this.times[1]);
                this.dataBaseData.condition.permissionApplyStartTime = formatDate(startTime);
                this.dataBaseData.condition.permissionApplyEndTime = formatDate(endTime);
            }
            queryAllOperatePermissionApply(this.dataBaseData).then(resp => {
                if (resp.data) {
                    this.tableData = resp.data.records;
                    this.tableData.sort();
                    this.selected = [];
                    this.total = resp.data.total;
                } else {
                    this.tableData = []
                    this.tableData.sort();
                }
            })
        },
        // 重置
        reset() {
            this.dataBaseData = {
                pageSize: 10,
                pageNo: 1,
                condition: {
                    permissionApplyName: '',
                    createUserName: '',
                    workFlowState: '',
                    permissionApplyStartTime: '',
                    permissionApplyEndTime: '',
                }
            };
            this.times = [];
        },
        // 添加
        add() {
            this.showAddDialog = true;
        },
        // 删除
        goDelete() {
            if (this.selected.length == 0) {
                this.$notify.warning('未选择要删除的对象');
                return;
            }
            let operatePermissionApplyUuidList = [];
            for (let i = 0; i < this.selected.length; i++) {
                operatePermissionApplyUuidList.push(this.selected[i].operatePermissionApplyUuid)
            }
            this.$confirm("是否删除该条数据?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                center: true,
            }).then(() => {
                deleteOperatePermissionApply(operatePermissionApplyUuidList).then(resp => {
                    this.$notify.success("删除成功");
                    if (this.dataBaseData.pageNo > (this.total / this.dataBaseData.pageSize) && this.dataBaseData.pageNo > 1) {
                        this.dataBaseData.pageNo--;
                    }
                    this.goQuery();
                })
            })
        },
        // 办理
        goHandle() {
            if (this.selected.length == 0) {
                this.$notify.warning("未选择要办理的申请")
                return
            }
            if (this.selected.length > 1) {
                this.$notify.warning("一次只能提交一条数据")
                return
            }
            if (this.selected[0].workFlowState != '0') {
                this.$notify.warning("办理中或办理完成的业务不可提交")
                return
            }
            this.temp = Object.assign({}, this.selected[0])
            // getDefaultPersonId(this.temp.operatePermissionApplyUuid).then(resp => {
            //     this.defaultPersonId = resp.data
            //业务主键
            this.flowItem.appDataUuid = this.temp.operatePermissionApplyUuid;
            //版本id 随机生成
            this.flowItem.versionUuid = this.common.randomString4Len(8);
            //申请业务的名字（待办标题）
            this.flowItem.applyTitle = this.temp.permissionApplyName;
            this.dialogFlowItemShow = true;
            // }).catch();
        },
        saveOpinion() {
            //保存业务数据成功后
            setTimeout(() => {
                this.$refs["flowItem"].submitFlow();
                //将状态修改为办理中
            }, 20);
        },
        closeFlowItem(val) {
            this.dialogFlowItemShow = val;
            this.flowParam = 0;
            // this.initData();
        },
        delectData(val) {
            this.dialogFlowItemShow = val;
        },
        // 导出
        goExport() {
        }
        ,
        // 流程查看
        processView(row) {
            //正常情况下 applyUuid 为 审批单主键
            //在业务页面 因为拿到 审批单主键比较麻烦
            // 所以在子页面中引入了 根据业务id 查询的方法
            //父页面 传给子组件一个 applyPage 即可 (写死)
            this.applyUuid = row.operatePermissionApplyUuid;
            this.todoFlow = true;
        }
        ,
        // 关闭弹窗
        closeAddDrawer() {
            this.showAddDialog = false
        }
        ,
        // 添加保存
        addSucceed(obj) {
            this.showAddDialog = false
            // if (this.tableData.length < this.dataBaseData.pageSize){
            //     this.tableData.push({
            //         permissionApplyName: obj.permissionApplyName,
            //         createUserName: obj.createUserName,
            //         workFlowState: 0,
            //         createTime: formatDate(new Date()),
            //     });
            //     this.tableData.sort();
            // }
            this.goQuery();
        },
        updateForSubmit() {
            updateForHandle(this.selected[0])
                .then((res) => {
                    this.goQuery();
                })
        },
    },
    filters: {
        workFlowStateFilter(val) {
            if (val == 0) {
                return "草稿";
            }
            if (val == 1) {
                return "办理中";
            }
            if (val == 2) {
                return "办理完成";
            }
        }
    }
};
</script>

<style lang="sass" scoped></style>
