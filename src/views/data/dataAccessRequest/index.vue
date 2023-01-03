<template>
    <div class="page-container">
        <!--            查询条件-->
        <div class="filter-container">
            <QueryField
                    ref="queryfield"
                    :form-data="queryFields"
                    @submit="getList"
            />
        </div>

        <!--办理按钮-->
        <el-row>
            <el-col align="right">
                <el-button type="primary" class="oper-btn add" @click="handleAdd()" />
                <el-button type="primary" class="oper-btn edit" :disabled="selections.length !== 1" @click="handleUpdate()" />
                <el-button type="primary" class="oper-btn delete" :disabled="selections.length === 0" @click="handleDel()" />
                <el-button type="primary" class="oper-btn transact" @click="handleTransact()" />
                <el-button type="primary" class="oper-btn export" @click="handleExport()" />
            </el-col>
        </el-row>

        <!--        列表-->
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
            <el-table-column label="申请时间" align="center" prop="requestTime"/>
            <el-table-column label="当前环节办理人" align="center" prop="currentCirPerName"/>
            <el-table-column label="申请表名称" align="center" prop="requestTableName" />
            <el-table-column label="数据状态" align="center" prop="dataStatus"/>
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
<!--        v-show="total>0"-->
        <pagination
                :total="total"
                :page.sync="pageQuery.pageNo"
                :limit.sync="pageQuery.pageSize"
                @pagination="getList"
        />
        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
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
                <el-button @click="dialogFormVisible = false"
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

    ///查询条件
    import QueryField from '@/components/public/query-field/index'
    //分页组件
    import Pagination from '@/components/Pagination'

    //接口
    import { listByPage,save,del } from '@/api/data/accessRequest'


    export default {
        components: { Pagination, QueryField },
        data() {
            return {
                requestTableNamelist:[{id:"1",name:"2"}],
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
                        label: '列表类型',
                        name: 'LisrType',
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
                        name: "requsetTimePeriod",
                        type: "timePeriod",
                        data: [],
                        default: "-1",
                    }
                ],
                //复选框选中个数
                selections: [],
                //查询列表的接口主键
                // tableKey: 'dataRoleUuid',
                tableKey: 'dataAccessReqUuid',
                //表单加载
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
                dialogFormVisible:false,
                dialogStatus:"",
                textMap:{
                    create: "新增",
                    update: "修改",
                },
                temp: {
                    dataAccessReqUuid: undefined,
                    requestName: "",
                    requestTime: "",
                    currentCirPerName:"",
                    requestTableName: "",
                    dataStatus: "",
                    requestPersionName: "",
                    remark: "",
                    requestTableNamelist:[]
                },
                rules: {
                    requestName: [
                        { required: true, message: "申请名称不能为空", trigger: 'blur' },
                    ],
                    requestTableName: [
                        { required: true, message: "申请表名称不能为空", trigger: 'blur' },
                    ],
                },

                //之前页面的类型
                // authenTypeJson: [],
                //列表按钮对应弹框
                dialogTransactVisible:false,
                dialogFlowVisible:false,
            }
        },
        //vue声明周期 页面刷新前执行 getList获取总条数
        created() {
            this.getList()
            // let arr = [1,2,3]
            // arr.forEach(item=>{
            //     let obj ={
            //         id: Date.now(),
            //         name:item
            //     }
            //     this.requestTableNamelist.push(obj)
            // })
        },

        methods: {
            add(){
                let obj ={
                    id: Date.now(),
                    name:""
                }
                this.requestTableNamelist.push(obj)
            },
            goDelete(index){
                //控制删除添加的必留
                if(this.requestTableNamelist.length>1){
                    this.requestTableNamelist.splice(index,1)
                }
            },
            resetTemp() {
                this.temp = {
                    dataAccessReqUuid:'',
                    requestName: '',
                    requestTableName: '',
                    remark: ''
                }
            },
            //添加
            handleAdd(){
                this.resetTemp();
                this.dialogStatus = "create";
                this.dialogFormVisible = true;

        },
            createData(){
                var arr =[]
                this.requestTableNamelist.forEach((item,index) =>{
                    if(item.name){
                        arr.push(item.name)
                    }
                })
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

                // console.log(arr,"arr")
                // console.log(arr.join(','),"arr,,,,")
                // console.log(arr.splice(","),"3333")
            },

            // createData() {
            //     this.$refs['dataForm'].validate((valid) => {
            //         if (valid) {
            //             save(this.temp).then(() => {
            //                 this.getList()
            //                 this.dialogFormVisible = false
            //                 this.$notify({
            //                     title: '成功',
            //                     message: '创建成功',
            //                     type: 'success',
            //                     duration: 2000,
            //                     position: 'bottom-right'
            //                 })
            //             })
            //         }
            //     })
            // },




            //修改
            handleUpdate(){
                this.temp = Object.assign({}, this.selections[0])
                this.dialogStatus = "update";
                this.dialogFormVisible = true;

            },
            updateData(){},
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


            // //原页面授权方式状态转换码
            // formatAuthenType(row, column) {
            //     var data = getDictList('004001')
            //     // var authenObj = data.filter(obj => { return obj.codeValue === row.authenType })
            //     // if (authenObj !== null) {
            //     //     return authenObj[0].codeName
            //     // }
            // },

            getList(query) {
                // this.listLoading = true
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
