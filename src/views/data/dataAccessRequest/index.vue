<template>
    <div class="page-container">
        <div class="filter-container">
            <QueryField
                    ref="queryfield"
                    :form-data="queryFields"
                    @submit="getList"
            />
        </div>
        <el-row>
            <el-col align="right">
                <el-button type="primary" class="oper-btn add" @click="handleAdd()" />
                <el-button type="primary" class="oper-btn edit" :disabled="selections.length !== 1" @click="handleUpdate()" />
                <el-button type="primary" class="oper-btn delete" :disabled="selections.length === 0" @click="handleDel()" />
                <el-button type="primary" class="oper-btn transact" @click="handleTransact()" />
                <el-button type="primary" class="oper-btn export" @click="handleExport()" />
            </el-col>
        </el-row>
        <el-table
                :key="tableKey"
                v-loading="listLoading"
                :data="tableData"
                height="400px"
                stripe
                border
                fit
                highlight-current-row
                @selection-change="handleSelectionChange"
                style="width: 100%;"
                @sort-change="sortChange"
        >
            <el-table-column type="selection" width="55" />
            <el-table-column label="申请名称" align="center" prop="requestName" />
            <el-table-column label="申请时间" align="center" prop="requestTime" />
            <el-table-column label="当前环节办理人" align="center" prop="currentCirPerName"/>
            <el-table-column label="申请表名称" align="center" prop="requestTableName" />
            <el-table-column label="数据状态" align="center" prop="dataStatus" :formatter="dataStatusFormat"/>
            <el-table-column label="申请人" align="center" prop="requestPersionName"/>
            <el-table-column label="备注" align="center" prop="remark"/>
            <el-table-column label="操作" align="center">
                    <el-button
                            type="primary"
                            class="oper-btn"
                            style="width: auto"
                            @click="showFlow()">流程查看
                    </el-button>
            </el-table-column>
        </el-table>
        <pagination
                v-show="total>0"
                :total="total"
                :page.sync="pageQuery.pageNo"
                :limit.sync="pageQuery.pageSize"
                @pagination="getList"
        />
        <el-dialog
                :title="textMap[dialogStatus]"
                :visible.sync="dialogFormVisible"
                :before-close="closeDialog"
        >
            <template>
                <el-form
                        ref="dataForm"
                        :rules="rules"
                        :model="temp"
                        label-position="right"
                        width="80%"
                        class="detail-form"
                >
                    <el-form-item prop="requestName" label="申请名称">
                        <el-input v-model="temp.requestName"/>
                    </el-form-item>
                    <el-form-item prop="requestTableName" label="申请表名称">
                        <el-button @click="add()" style="float:right">添加一行</el-button>
                        <div v-for="(item,index) in requestTableNamelist" :key="item.id" style="display:flex">
                            <el-input v-model="item.name" /> <div @click="goDelete(index)" style="margin-left: 10px;cursor:pointer">×</div>
                        </div>
                    </el-form-item>
                    <el-form-item prop="remark" label="备注">
                        <el-input v-model="temp.remark" />
                    </el-form-item>
                </el-form>
            </template>
            <div slot="footer">
                <el-button @click="closeDialog()"
                >取消</el-button
                >
                <el-button
                        type="primary"
                        @click="dialogStatus === 'create' ? createData() : updateData()"
                >保存</el-button
                >
            </div>
        </el-dialog>
        <el-dialog title="办理" :visible.sync="dialogTransactVisible" :close-on-click-modal="false">
        </el-dialog>
    </div>
</template>

<script>
    import QueryField from '@/components/public/query-field/index'
    import Pagination from '@/components/Pagination'
    import { listByPage,save,update,del } from '@/api/data/accessRequest'
    export default {
        components: { Pagination, QueryField },
        data() {
            return {
                //新增/修改弹框申请表名称数组
                requestTableNamelist:[],
                //查询条件
                queryFields: [
                    {
                        label: '申请名称',
                        name: 'requestName',
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
                        label: '数据状态',
                        name: 'dataStatus',
                        type: 'select',
                        data: [
                            { name: '需求提出', value:0 },
                            { name: '上游协调', value:1 },
                            { name: '数据推送', value:2 },
                            { name: '数据接入', value:3 },
                            { name: '数据上线', value:4 }
                            ],
                    },
                    {
                        label: "申请时间范围",
                        name: "requestTime",
                        type: "timePeriod",
                        data: [],
                        default: "-1",
                    }
                ],
                //页面复选框选中个数
                selections: [],
                //查询列表主键
                tableKey: 'dataAccessReqUuid',
                listLoading: false,
                //表单列表
                tableData: [],
                //页面列表分页
                total: 0,
                pageQuery: {
                    condition: null,
                    pageNo: 1,
                    pageSize: 20,
                    sortBy: 'asc',
                    sortName: 'create_time'
                },
                //新增修改弹框
                dialogFormVisible:false,
                dialogStatus:"",
                textMap:{
                    create: "新增",
                    update: "修改",
                },
                temp: {
                    dataAccessReqUuid: undefined,//主键
                    requestName: "",//申请名称
                    requestTime: "",//申请时间
                    currentCirPerName:"",//当前环节办理人名称
                    requestTableName: "",//申请表名称
                    dataStatus: "",
                    requestPersionName: "",
                    remark: "",
                    requestTableNamelist:[]
                },
                rules: {
                    requestName: [
                        { required: true, message: "申请名称不能为空", trigger: 'blur' },
                    ],
                    //申请表名称 现在换成多条了  requestTableNamelist数组
                    // requestTableName: [
                    //     { required: true, message: "申请表名称不能为空", trigger: 'blur' },
                    // ],
                },
                //办理按钮弹框
                dialogTransactVisible:false,
                //查看流程弹框
                dialogFlowVisible:false,
            }
        },
        created() {
            this.getList()
        },
        methods: {
            // //申请时间格式化
            // dateFormatter(row, column) {
            //     debugger
            //     const datetime = row.requsetTime
            //     console.log(datetime)
            //     if (datetime) {
            //         var dateMat = new Date(datetime)
            //         var year = dateMat.getFullYear()
            //         var month = dateMat.getMonth() + 1
            //         var day = dateMat.getDate()
            //         var hh = dateMat.getHours()
            //         var mm = dateMat.getMinutes()
            //         var ss = dateMat.getSeconds()
            //         console.log(dateMat,'dateMat')
            //         console.log(year,'year')
            //         var timeFormat = year + '-' + month + '-' + day + ' ' + hh + ':' + mm + ':' + ss
            //         console.log(timeFormat,'timeFormat')
            //         return timeFormat
            //     }
            //     return ''
            // },
            //数据状态格式化
            dataStatusFormat(row, column) {
                let dataStatus = {
                    0: "需求提出",
                    1: "上游协调",
                    2: "数据推送",
                    3: "数据接入",
                    4: "数据上线"
                }
                return dataStatus[row.dataStatus]
            },
            //关闭新增/修改弹窗
            closeDialog(){
                this.dialogFormVisible = false
                this.requestTableNamelist = []
            },
            //新增申请表名称
            add(){
                let obj ={
                    id:"",
                    name:""
                }
                this.requestTableNamelist.push(obj)
            },
            //删除添加的申请表名称输入框
            goDelete(index){
                //控制删除添加的必留
                if(this.requestTableNamelist.length>1){
                    this.requestTableNamelist.splice(index,1)
                }
            },
            //重置
            resetTemp() {
                this.temp = {
                    dataAccessReqUuid:'',
                    requestName: '',
                    requestTableName: '',
                    remark: '',
                    requestTableNamelist:[]
                }
            },
            //添加按钮
            handleAdd(){
                this.resetTemp();
                this.dialogStatus = "create";
                this.dialogFormVisible = true;
                this.requestTableNamelist= []
        },
            //新增保存
            createData(){
                var arr =[]
                this.requestTableNamelist.forEach((item,index) =>{
                    if(item.name){
                        arr.push(item.name)
                    }
                })
                //申请表名称转换成字符串
                this.temp.requestTableName = arr.join(',')
                this.$refs['dataForm'].validate((valid) => {
                    if (valid) {
                        save(this.temp).then(() => {
                            this.getList()
                            this.dialogFormVisible = false
                            this.$notify({
                                title: '成功',
                                message: '创建成功',
                                type: 'success',
                                duration: 2000,
                                position: 'bottom-right'
                            })
                        })
                    }
                })
            },
            //修改按钮
            handleUpdate(){
                this.dialogStatus = "update";
                this.dialogFormVisible = true;
                this.$nextTick(() => {
                    this.$refs['dataForm'].clearValidate()
                })
                this.temp = Object.assign({}, this.selections[0])
                //将表名拆分成数组
                    var arr = this.temp.requestTableName.split(",")
                    arr.forEach(item=>{
                        let obj ={
                            id: '',
                            name:item
                        }
                        this.requestTableNamelist.push(obj)
                    })
            },
            //修改保存
            updateData() {
                var arr =[]
                this.requestTableNamelist.forEach((item,index) =>{
                    if(item.name){
                        arr.push(item.name)
                    }
                })
                //申请表名称转换成字符串
                this.temp.requestTableName = arr.join(',')
                this.$refs['dataForm'].validate((valid) => {
                    if (valid) {
                        const tempData = Object.assign({}, this.temp)
                        console.log(tempData)
                        update(tempData).then(() => {
                            const index = this.tableData.findIndex(v => v.dataAccessReqUuid === this.temp.dataAccessReqUuid)
                            this.tableData.splice(index, 1, this.temp)
                            this.dialogFormVisible = false
                            this.$notify({
                                title: '成功',
                                message: '更新成功',
                                type: 'success',
                                duration: 2000,
                                position: 'bottom-right'
                            })
                        })
                    }
                })
            },
            //删除
            handleDel(){
            var ids = []
            this.selections.forEach((r, i) => { ids.push(r.dataAccessReqUuid)})
            this.$confirm('此操作将永久删除这些数据，是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                center: true
            }).then(() => {
                del(ids.join(',')).then(() => {
                    this.getList()
                    this.$notify({
                        title: '成功',
                        message: '删除成功',
                        type: 'success',
                        duration: 2000,
                        position: 'bottom-right'
                    })
                })
            })
            },
            //办理
            handleTransact(){
                this.dialogTransactVisible = true
            },
            //导出按钮
            handleExport() {
                if (this.selections.length == 0 || this.selections.length == undefined) {
                    this.$confirm('未选择指定数据将导出全部?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                    })
                    //         .then(()=>{
                    //         exportAllData()
                    //         })
                    // }
                    // else{
                    //     setPersonalSpaceSession(this.personalSpaceUuidList)
                    //         .then((res)=>{
                    //             if(res.msg == "成功"){
                    //                 exportAllPersonalSpace()
                    //             }
                    //         })
                    //  }
                }
            },
            //分页
            sortChange(data) {
                const { prop, order } = data
                this.pageQuery.sortBy = order
                this.pageQuery.sortName = prop
                this.handleFilter()
            },
            handleFilter() {
                this.pageQuery.pageNo = 1
                this.getList()
            },
            //复选框操作
            handleSelectionChange(val) {
                this.selections = val
                console.log(val)
            },
            //查看流程
            showFlow(){
                this.dialogFlowVisible=true
            },
            getList(query) {
                this.listLoading = true
                if (query) this.pageQuery.condition = query
                listByPage(this.pageQuery).then(resp => {
                    this.total = resp.data.total
                    this.tableData = resp.data.records
                    this.listLoading = false
                })
            },
            getSortClass: function(key) {
                const sort = this.pageQuery.sort
                return sort === `+${key}` ? 'asc' : 'desc'
            },
        }
    }
</script>
