<template>
  <div class="page-container">
    <div class="pd20">
      <div class="query-field">
        <QueryField ref="queryfield"
                    :form-data="queryFields"
                    @submit="getList" />
      </div>
      <div class="mb10">
        <el-row>
          <el-col align="right">
            <el-button type="primary"
                       class="oper-btn "
                       @click="handleAdd()"> <img src="../../../styles/image/add.png"
                   class="btn_icon icon1"
                   alt="">
              <img src="../../../styles/image/add2.png"
                   class="btn_icon icon2"
                   alt="">新增
            </el-button>
            <el-button type="primary"
                       class="oper-btn"
                       :disabled="selections.length !== 1"
                       @click="handleUpdate()"><img src="../../../styles/image/edits.png"
                   class="btn_icon"
                   alt="">编辑</el-button>
            <el-button type="primary"
                       class="oper-btn"
                       @click="handleDel()"><img src="../../../styles/image/delete.png"
                   class="btn_icon"
                   alt="">删除</el-button>
            <el-button type="primary"
                       class="oper-btn "
                       @click="handleTransact()">办理</el-button>
            <el-button type="primary"
                       class="oper-btn "
                       @click="handleExport()">导出</el-button>
          </el-col>
        </el-row>
      </div>

      <el-table :key="tableKey"
                v-loading="listLoading"
                :data="tableData"
                stripe
                border
                fit
                highlight-current-row
                @selection-change="handleSelectionChange"
                style="width: 100%;"
                height="calc(100vh - 300px)"
                @sort-change="sortChange">
        <el-table-column type="selection"
                         width="55" />
        <el-table-column label="申请名称"
                         prop="requestName"
                         min-width="150px"
                         show-overflow-tooltip />
        <el-table-column label="申请时间"
                         align="center"
                         prop="requestTime"
                         min-width="100px"
                         show-overflow-tooltip />
        <el-table-column label="当前环节办理人"
                         align="center"
                         min-width="100px"
                         prop="currentCirPerName" />
        <el-table-column label="申请表名称"
                         align="center"
                         min-width="100px"
                         prop="requestTableName"
                         show-overflow-tooltip />
        <el-table-column label="数据状态"
                         align="center"
                         prop="dataStatus"
                         min-width="100px"
                         :formatter="dataStatusFormat" />
        <el-table-column label="申请人"
                         align="center"
                         min-width="100px"
                         prop="requestPersionName" />
        <el-table-column label="备注"
                         align="center"
                         prop="remark"
                         min-width="100px"
                         show-overflow-tooltip />
        <el-table-column label="操作"
                         align="center"
                         min-width="100px">
          <!--                    <el-button-->
          <!--                            type="primary"-->
          <!--                            class="oper-btn"-->
          <!--                            style="width: auto"-->
          <!--                            @click="showFlow()">流程查看-->
          <!--                    </el-button>-->
          <template slot-scope="scope">
            <el-link @click="showFlow(scope.row)"
                     type="primary"
                     :underline="false"
                     class="linkClass">流程跟踪</el-link>
          </template>
        </el-table-column>
      </el-table>
      <pagination :total="total"
                  :page.sync="pageQuery.pageNo"
                  :limit.sync="pageQuery.pageSize"
                  @pagination="getList" />
      <el-dialog :title="textMap[dialogStatus]"
                 :visible.sync="dialogFormVisible"
                 :before-close="closeDialog">
        <template>
          <el-form ref="dataForm"
                   :rules="rules"
                   :model="temp"
                   label-position="right"
                   width="90%"
                   label-width="100px"
                   class="detail-form">

            <el-form-item prop="requestName"
                          label="申请名称：">
              <el-col :span="24">
                <el-input v-model="temp.requestName" />
              </el-col>
            </el-form-item>
            <el-form-item prop="requestTableName"
                          label="申请表名称：">
              <el-col :span="24">

                <el-button @click="add()"
                           style="float:right">添加一行</el-button>
                <div v-for="(item,index) in requestTableNamelist"
                     :key="item.id"
                     style="display:flex">
                  <el-input v-model="item.name" />
                  <div @click="goDelete(index)"
                       style="margin-left: 10px;cursor:pointer">×</div>
                </div>
              </el-col>
            </el-form-item>
            <el-form-item prop="remark"
                          label="备注：">
              <el-col :span="24">
                <el-input v-model="temp.remark" />
              </el-col>
            </el-form-item>
          </el-form>
        </template>
        <div slot="footer">
          <el-button @click="closeDialog()">取消</el-button>
          <el-button type="primary"
                     @click="dialogStatus === 'create' ? createData() : updateData()">保存</el-button>
        </div>
      </el-dialog>
      <el-dialog title="办理"
                 :visible.sync="dialogTransactVisible"
                 :close-on-click-modal="false">
      </el-dialog>
      <!--        流程跟踪弹框-->
      <!--        <el-dialog-->
      <!--                title="流程跟踪"-->
      <!--                :visible.sync="todoFlow"-->
      <!--                v-if="todoFlow"-->
      <!--                width="80%"-->
      <!--        >-->
      <!--            <div>-->
      <!--                <flowOpinionList-->
      <!--                        :applyUuid="applyUuid"-->
      <!--                        :pageFrom="applyPage"-->
      <!--                ></flowOpinionList>-->
      <!--            </div>-->
      <!--            <span slot="footer">-->
      <!--        <el-button-->
      <!--                size="mini"-->
      <!--                type="info"-->
      <!--                class="table_header_btn"-->
      <!--                @click="todoFlow = false"-->
      <!--        >关闭</el-button-->
      <!--        >-->
      <!--        </span>-->
      <!--        </el-dialog>-->
    </div>
  </div>

</template>

<script>
import QueryField from '@/components/public/query-field/index'
import Pagination from '@/components/Pagination'
import { listByPage, save, update, del, exportData } from '@/api/data/accessRequest'
// import flowOpinionList from "@/components/starflow/todowork/flowOpinionList";
import axios from "axios";
import qs from "qs";

export default {
  // flowOpinionList
  components: { Pagination, QueryField },
  data () {
    return {
      //新增/修改弹框申请表名称数组
      requestTableNamelist: [],
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
            { name: '需求提出', value: 0 },
            { name: '上游协调', value: 1 },
            { name: '数据推送', value: 2 },
            { name: '数据接入', value: 3 },
            { name: '数据上线', value: 4 }
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
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        create: "新增",
        update: "修改",
      },
      temp: {
        dataAccessReqUuid: undefined,//主键
        requestName: "",//申请名称
        requestTime: "",//申请时间
        currentCirPerName: "",//当前环节办理人名称
        requestTableName: "",//申请表名称
        dataStatus: "",
        requestPersionName: "",
        remark: "",
        requestTableNamelist: []
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
      dialogTransactVisible: false,
      //查看流程弹框
      dialogFlowVisible: false,
    }
  },
  created () {
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
    dataStatusFormat (row, column) {
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
    closeDialog () {
      this.dialogFormVisible = false
      this.requestTableNamelist = []
    },
    //新增申请表名称
    add () {
      let obj = {
        id: "",
        name: ""
      }
      this.requestTableNamelist.push(obj)
    },
    //删除添加的申请表名称输入框
    goDelete (index) {
      //控制删除添加的必留
      if (this.requestTableNamelist.length > 1) {
        this.requestTableNamelist.splice(index, 1)
      }
    },
    //重置
    resetTemp () {
      this.temp = {
        dataAccessReqUuid: '',
        requestName: '',
        requestTableName: '',
        remark: '',
        requestTableNamelist: []
      }
    },
    //添加按钮
    handleAdd () {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.requestTableNamelist = []
    },
    //新增保存
    createData () {
      var arr = []
      this.requestTableNamelist.forEach((item, index) => {
        if (item.name) {
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
    handleUpdate () {
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.temp = Object.assign({}, this.selections[0])
      //将表名拆分成数组
      var arr = this.temp.requestTableName.split(",")
      arr.forEach(item => {
        let obj = {
          id: '',
          name: item
        }
        this.requestTableNamelist.push(obj)
      })
    },
    //修改保存
    updateData () {
      var arr = []
      this.requestTableNamelist.forEach((item, index) => {
        if (item.name) {
          arr.push(item.name)
        }
      })
      //申请表名称转换成字符串
      this.temp.requestTableName = arr.join(',')
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
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
    handleDel () {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.dataAccessReqUuid) })
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
    handleTransact () {
      this.dialogTransactVisible = true
    },
    //导出按钮
    handleExport () {
      axios
        .post(`/data/accessRequest/dataAccReqExcelInfo`, qs.stringify({}), {
          // qs.stringify 定义传参格式
          responseType: "blob",//返回的文件流转成blob对象
          // 如果是通过页面表单方式提交，用"application/x-www-form-urlencoded"；
          // 如果是json（要反序列化成字符串），就用"application/json"。
          headers: {
            "Content-Type": "application/x-www-form-urlencoded", // 请求的数据类型为form data格式
          },
        })
        .then((res) => {
          //decodeURI函数用于解码 URI 参数是url 返回值是解码后的字符串
          const filename = decodeURI(
            res.headers["content-disposition"].split(";")[1].split("=")[1]
          );
          const blob = new Blob([res.data], {
            type: "application/octet-stream",
          });
          debugger
          //创建下载链接
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.style.display = "none";
          link.href = url;  //链接到创建的下载地址
          link.setAttribute("download", filename); //下载后文件名
          document.body.appendChild(link); //下载完成移除元素
          link.click(); //点击下载
        });
    },

    // handleExport(){
    //     var obj={
    //         requestName:"111"
    //     }
    //     // exportData(obj).then(res=>{
    //     //     console.log("exportData")
    //     // })
    //     //用post请求的话 拿到token就可以导出文件 但是没有token目前是写死的 需要改成post的请求 然后给返回值
    //     window.open(
    //         "data/accessRequest/dataAccReqExcelInfo?requestName=" + "this.belongYear"+"&result=login&LTPAToken=Y3MqOTQ4NTJjNjU1NzAzN2JhNjAxNTcwM2JiYzk4YTAwMDYqMTI4KlN0cmluZyo5NDg1MmM2OTU3NDE3ZTg5MDE1NzQxOGEwNTgxMDAwMg==&maxInerval=14400"
    //     );
    //     // window.open()
    // },

    // handleExport(query) {
    //     // debugger
    //     // // if (query) this.pageQuery.condition = query
    //     // // console.log(query)
    //     // // listByPage(this.pageQuery).then(resp => {
    //     // //     this.total = resp.data.total
    //     // //     this.tableData = resp.data.records
    //     // //     this.listLoading = false
    //     // // })
    //     // if (this.selections.length == 0 || this.selections.length == undefined) {
    //     //     this.$confirm('未选择指定数据将导出全部?', '提示', {
    //     //         confirmButtonText: '确定',
    //     //         cancelButtonText: '取消',
    //     //         type: 'warning',
    //     //     }).then(()=>{
    //     //         exportData()
    //     //             })
    //     //     }
    //     //     // else{
    //     //     //     setPersonalSpaceSession(this.personalSpaceUuidList)
    //     //     //         .then((res)=>{
    //     //     //             if(res.msg == "成功"){
    //     //     //                 exportAllPersonalSpace()
    //     //     //             }
    //     //     //         })
    //     //     //  }
    //     // },
    // // },
    //分页
    sortChange (data) {
      const { prop, order } = data
      this.pageQuery.sortBy = order
      this.pageQuery.sortName = prop
      this.handleFilter()
    },
    handleFilter () {
      this.pageQuery.pageNo = 1
      this.getList()
    },
    //复选框操作
    handleSelectionChange (val) {
      this.selections = val
    },
    //查看流程
    showFlow () {
      this.dialogFlowVisible = true
    },
    getList (query) {
      this.listLoading = true
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
