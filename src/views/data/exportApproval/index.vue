<template>
    <div class="page-container">
        <div class="filter-container">
            <QueryField
                    ref="queryfield"
                    :form-data="queryFields"
                    @submit="getList"
            />
        </div>
        <!--        办理按钮-->
        <el-row>
            <el-col align="right">
                <el-button type="primary" class="oper-btn transact" :disabled="selections.length !== 1" @click="handleTransact()"/>
            </el-col>
        </el-row>
        <el-table
                :key="tableKey"
                v-loading="listLoading"
                :data="tableData"
                stripe
                border
                fit
                highlight-current-row
                style="width: 100%;"
                height="calc(100vh - 330px)"
                @sort-change="sortChange"
                @selection-change="handleSelectionChange"
        >
            <el-table-column type="selection" width="55"/>
            <el-table-column
                    label="申请模块名称"
                    prop="requestModelName"
                    min-width="200px"
                    show-overflow-tooltip
            />
            <el-table-column
                    label="涉及安全表"
                    prop="refSafeTable"
                    width="200px"
                    show-overflow-tooltip
            />
            <el-table-column
                    label="当前环节"
                    align="center"
                    prop="currentLink"
                    width="200px"
                    show-overflow-tooltip
            />
            <el-table-column
                    label="表安全等级"
                    align="center"
                    prop="tbSafeLevel"
                    width="150px"
                    show-overflow-tooltip
            />
            <el-table-column
                    label="数据敏感级别"
                    align="center"
                    prop="dataSensitiveLevel"
                    width="150px"
                    show-overflow-tooltip
            />
            <el-table-column
                    label="状态"
                    align="center"
                    prop="status"
                    width="150px"
                    :formatter="statusFormat"
                    show-overflow-tooltip
            />
            <el-table-column
                    label="申请时间"
                    prop="requestTime"
                    align="center"
                    width="200px"
                    show-overflow-tooltip
            />
            <el-table-column
                    label="数据申请人"
                    align="center"
                    prop="requestPersionName"
                    width="200px"
                    show-overflow-tooltip
            />
            <el-table-column
                    label="操作"
                    align="center"
                    width="300px"
            >
                <template slot-scope="scope">
                    <el-button
                            v-if="scope.row.status == '1' || scope.row.status == '2'"
                            type="primary"
                            class="oper-btn"
                            style="width: auto"
                            @click="showFlow()">流程跟踪
                    </el-button>
                    <el-button
                            v-if="scope.row.status == '2'"
                            type="primary"
                            class="oper-btn"
                            style="width: auto"
                            @click="downLoad()">下载
                    </el-button>
                    <el-button
                            v-if="scope.row.status == '1' || scope.row.status == '2'"
                            type="primary"
                            class="oper-btn"
                            style="width: auto"
                            @click="showFile()">文件预览
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <pagination
                :total="total"
                :page.sync="pageQuery.pageNo"
                :limit.sync="pageQuery.pageSize"
                @pagination="getList"
        />
        <el-dialog title="办理" :visible.sync="dialogTransactVisible" :close-on-click-modal="false">
            <div>
                <div>待开发</div>>
                <FlowItem></FlowItem>
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
        <el-dialog title="流程跟踪---待开发" :visible.sync="dialogFlowVisible" :close-on-click-modal="false">
            <div>
                <flowOpinionList></flowOpinionList>
            </div>
        </el-dialog>
        <el-dialog title="下载" :visible.sync="dialogdownLoadVisible" :close-on-click-modal="false">
            <div>待开发</div>>
        </el-dialog>
        <el-dialog title="文件预览" :visible.sync="dialogFileVisible" :close-on-click-modal="false">
            <div class="detail-form">
                <template class="detail-form">
                    <div>待开发</div>
                </template>
            </div>
            <div slot="footer" class="table-footer">
                <el-button type="text" @click="nextList()">下一页</el-button>
                <el-button type="text" @click="allList()">查看全部</el-button>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button class="oper-btn" @click="dialogFileVisible = false">返 回</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
    import QueryField from '@/components/public/query-field/index'
    import Pagination from '@/components/Pagination'
    import {listByPage} from '@/api/data/exportApproval'
    import flowOpinionList from "@/components/starflow/todowork/flowOpinionList";
    import FlowItem from '@/components/starflow/todowork/flowItem'



    export default {
        components: { FlowItem,flowOpinionList,Pagination, QueryField},
        data() {
            return {
                //查询条件
                queryFields: [
                    {
                        label: '申请模块名称',
                        name: 'requestModelName',
                        type: 'text',
                        value: ''
                    },
                    {
                        label: '申请人',
                        name: 'requestPersionName',
                        type: 'text',
                        value: ''
                    },
                    {
                        label: '状态',
                        name: 'status',
                        type: 'select',
                        data: [{name: '草稿', value: 0}, {name: '待办理', value: 1}, {name: '已办理', value: 2}],
                    },
                    {
                        label: "申请时间范围",
                        name: "requsetTime",
                        type: "timePeriod"
                    }
                ],
                //复选框选中个数
                selections: [],
                //查询列表的接口主键
                tableKey: '',
                dataExportUuid:'',
                //表单加载
                listLoading: false,
                //表单列表
                tableData: [],
                //页面列表分页
                pageQuery: {
                    condition: null,
                    pageNo: 1,
                    pageSize: 20,
                    sortBy: 'asc',
                    sortName: 'create_time'
                },
                total: 0,
                //列表按钮对应弹框
                dialogTransactVisible: false,
                dialogFlowVisible: false,
                dialogdownLoadVisible: false,
                dialogFileVisible: false,
                //文件预览内按钮弹框
                nextVisible: false,
                totalVisible: false
            }
        },
        created() {
            this.getList()
        },

        methods: {
            //复选框操作
            handleSelectionChange(val) {
                this.selections = val
            },
            //办理
            handleTransact() {
                console.log(this.selections,'this.selections')
                debugger
                if (this.selections[0].workFlowState == '2') {
                    this.$notify.warning("办理完成的业务不可提交")
                    return
                }
                this.dialogTransactVisible = true
            },
            //分页
            sortChange(data) {
                const {prop, order} = data
                this.pageQuery.sortBy = order
                this.pageQuery.sortName = prop
                this.handleFilter()
            },
            handleFilter() {
                this.pageQuery.pageNo = 1
                this.getList()
            },



            //查看流程
            showFlow() {
                this.dialogFlowVisible = true
            },
            //下载
            downLoad() {
                this.dialogdownLoadVisible = true
            },
            //文件预览
            showFile() {
                this.dialogFileVisible = true
            },
            //预览列表下一页
            nextList() {
                this.nextVisible = true
            },
            //查看全部
            allList() {
                this.totalVisible = true
            },

            //状态转换
            statusFormat(row, column){
                let status = {
                    0: "草稿",
                    1: "待办理",
                    2: "已办理",
                }
                return status[row.status]
            },
            //分页查询
            getList(query) {
                if (query) this.pageQuery.condition = query
                listByPage(this.pageQuery).then(resp => {
                    this.total = resp.data.total
                    this.tableData = resp.data.records
                    this.listLoading = false
                })
            },
            getSortClass: function (key) {
                const sort = this.pageQuery.sort
                return sort === `+${key}` ? 'asc' : 'desc'
            },
        }
    }
</script>
