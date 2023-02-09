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
                <el-button type="primary" class="oper-btn transact" @click="handleTransact()"/>
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
                            @click="showFlow()">流程查看
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
        <!--        v-show="total>0"-->
        <pagination
                :total="total"
                :page.sync="pageQuery.pageNo"
                :limit.sync="pageQuery.pageSize"
                @pagination="getList"
        />
        <el-dialog title="办理" :visible.sync="dialogTransactVisible" :close-on-click-modal="false">
        </el-dialog>
        <el-dialog title="流程" :visible.sync="dialogFlowVisible" :close-on-click-modal="false">
        </el-dialog>
        <el-dialog title="下载" :visible.sync="dialogdownLoadVisible" :close-on-click-modal="false">
        </el-dialog>
        <el-dialog title="文件预览" :visible.sync="dialogFileVisible" :close-on-click-modal="false">
            <div class="detail-form">
                <template class="detail-form">
                    <!--                    :key="tableKey"-->
                    <!--                    v-loading="listLoading"-->
                    <!--                    <el-table-->
                    <!--                            :data="countList"-->
                    <!--                            stripe-->
                    <!--                            border-->
                    <!--                            fit-->
                    <!--                            style="width: 100%;"-->
                    <!--                            highlight-current-row-->
                    <!--                            @current-change="handleCurrentChange"-->
                    <!--                    >-->
                    <!--                        <el-table-column type="index" width="50"></el-table-column>-->
                    <!--                        <el-table-column label="申请名称" align="center" prop="shenqingmingcheng" />-->
                    <!--                    </el-table>-->
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
    ///查询条件
    import QueryField from '@/components/public/query-field/index'
    //分页组件
    import Pagination from '@/components/Pagination' // secondary package based on el-pagination
    import {listByPage} from '@/api/data/exportApproval'

    export default {
        components: {Pagination, QueryField},
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
                        label: '列表类型',
                        name: 'LisrType',
                        type: 'select',
                        data: [{name: '草稿', value: 1}, {name: '待办理', value: 2}, {name: '已办理', value: 3}],
                    },
                    {
                        label: "申请时间范围",
                        name: "requsetTimePeriod",
                        type: "timePeriod",
                        data: [],
                        default: "-1",
                    }
                ],
                // //复选框选中个数
                // selections: [],
                //查询列表的接口主键
                // tableKey: 'dataRoleUuid',
                tableKey: '',
                //表单加载
                listLoading: false,
                //表单列表
                tableData: [],
                // tableData: [{
                //     requestModelName: 'SQL编辑器',
                //     requestTime: '2016-05-02',
                //     refSafeTable: '安全表',
                //     tableSafeLevel: '三级',
                //     currentLink:'',
                //     status:'待办理',
                //     requestPersionName:''
                // }, {
                //     requestModelName: 'SQL编辑器SQL编辑器SQL编辑器SQL编辑器',
                //     requestTime: '2016-05-02 11:11:00',
                //     refSafeTable: '安全表2安全表2安全表2安全表2安全表2安全表2安全表2安全表2安全表2',
                //     tableSafeLevel: '三级2',
                //     currentLink:'',
                //     status:'已办理',
                //     requestPersionName:''
                // },{
                //     requestModelName: 'SQL编辑器2',
                //     requestTime: '2016-05-02',
                //     refSafeTable: '安全表2',
                //     tableSafeLevel: '三级2',
                //     currentLink:'',
                //     status:'草稿',
                //     requestPersionName:''
                // }],
                //页面列表分页
                pageQuery: {
                    condition: null,
                    pageNo: 1,
                    pageSize: 20,
                    sortBy: 'asc',
                    sortName: 'create_time'
                },
                total: 0,
                //之前页面的类型
                // authenTypeJson: [],
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
        //vue声明周期 页面刷新前执行 getList获取总条数
        created() {
            this.getList()
        },

        methods: {
            //办理
            handleTransact() {
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

            // //复选框操作
            // handleSelectionChange(val) {
            //     this.selections = val
            // },

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


            // //原页面授权方式状态转换码
            // formatAuthenType(row, column) {
            //     var data = getDictList('004001')
            //     // var authenObj = data.filter(obj => { return obj.codeValue === row.authenType })
            //     // if (authenObj !== null) {
            //     //     return authenObj[0].codeName
            //     // }
            // },

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
