<template>
  <div>
    <div class="header_Filter padding10">
      <el-row>
        <el-form :inline="true"
                 :model="personalSpace"
                 class="demo-form-inline">
          <el-form-item label="申请名称:">
            <el-input v-model="personalSpace.personalSpaceName"
                      placeholder="申请名称"></el-input>
          </el-form-item>
          <el-form-item label="申请人:">
            <el-input v-model="personalSpace.personalSpaceApplication"
                      placeholder="申请人"></el-input>
          </el-form-item>
          <el-form-item label="列表类型:">
            <el-select v-model="personalSpace.personalSpaceType"
                       placeholder="状态选择">
              <el-option label="待办"
                         value="待办"></el-option>
              <el-option label="已办"
                         value="已办"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="申请时间范围:">
            <el-date-picker v-model="personalSpace.personalSpaceDate"
                            type="datetimerange"
                            format="yyyy-MM-dd"
                            value-format="yyyy-MM-dd"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="initPersonalSpaceData">查询</el-button>
            <el-button type="primary"
                       @click="onReInput">重置</el-button>
          </el-form-item>
        </el-form>
      </el-row>
    </div>
    <div class="padding10">

      <el-row>
        <el-button type="primary"
                   @click="joinInsertDialog">添加</el-button>
        <el-button type="primary"
                   @click="onDelete">删除</el-button>
        <el-button type="primary">办理</el-button>
        <el-button type="primary"
                   @click="exportAllData">导出</el-button>
        <el-button type="primary"
                   @click="backToUpPage">关闭</el-button>
      </el-row>
    </div>
    <div class="padding10">

      <el-table :data="personalSpaceDataList"
                border
                style="width: 100%"
                @selection-change="handleSelectionChange">
        <el-table-column type="selection"
                         width="55">
        </el-table-column>
        <el-table-column fixed
                         prop="personalSpaceName"
                         label="申请名称">
        </el-table-column>
        <el-table-column prop="personalSpaceCapacity"
                         label="扩容大小">
        </el-table-column>
        <el-table-column prop="personalSpaceDate"
                         label="申请时间">
        </el-table-column>
        <el-table-column prop="personalSpaceType"
                         label="状态">
        </el-table-column>
        <el-table-column prop="personalSpaceApplication"
                         label="申请人">
        </el-table-column>
        <el-table-column label="操作">
          <el-button type="text">流程查看</el-button>
        </el-table-column>
      </el-table>
      <el-row style="left: 250px">
        <el-pagination @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"
                       :current-page="query.pageNo"
                       :page-sizes="[5, 10, 15, 20]"
                       :page-size="query.pageSize"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="dataTotal">
        </el-pagination>
      </el-row>
    </div>

    <!--     添加弹窗-->
    <el-dialog title="个人空间申请"
               :visible.sync="openInsertDialog"
               width="60%">
      <el-form :model="personalSpace"
               class="demo-form-inline"
               label-width="80px">
        <el-form-item label="申请名称">
          <el-input v-model="personalSpace.personalSpaceName"
                    placeholder="申请名称"></el-input>
        </el-form-item>
        <el-form-item label="扩容容量">
          <el-input v-model="personalSpace.personalSpaceCapacity"
                    placeholder="扩容容量"
                    type="number"
                    :max="1024"
                    :min="0"
                    @input="inputChange"
                    style="width: 540px"></el-input>
          <el-select v-model="personalSpaceCapacityNeed"
                     placeholder="容量单位">
            <el-option label="GB"
                       value="GB"></el-option>
            <el-option label="MB"
                       value="MB"></el-option>
            <el-option label="KB"
                       value="KB"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审批人">
          <el-input v-model="personalSpace.personalSpaceApproving"
                    placeholder="选择审批人"
                    style="width: 670px"></el-input>
          <el-button type="primary">选择</el-button>
        </el-form-item>
        <el-row type="flex"
                justify="end">
          <el-button type="primary"
                     @click="onSubmit">保存</el-button>
          <el-button type="primary"
                     @click="closeInsertDialog">关闭</el-button>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
  import {insertPersonalSpace
    ,deletePersonalSpace
    ,queryAllPersonalSpace
    ,exportAllPersonalSpace
    ,setPersonalSpaceSession
  } from "@/api/analysis/personalSpace";
  export default {
    data(){
      return{
        personalSpace: {
          personalSpaceName: '',
          personalSpaceApplication: '',
          personalSpaceType:'',
          personalSpaceDate:'',
          personalSpaceCapacity:'',
          personalSpaceStatus:'',
          personalSpaceApproving:'',
        },
        personalSpaceDataList: [],//查询并展示的数据集合
        openInsertDialog: false,//打开添加弹窗
        personalSpaceCapacityNeed:'',//该变量为容量的单位 在最后会和容量做一个拼接
        personalSpaceUuidList:[], //删除或者批量删除 id集合
        dataTotal: 100,//数据的总数
        query:{
          condition:{},
          pageNo:1,
          pageSize: 5
        },
      }
    },
    mounted() {
      this.initPersonalSpaceData()
    },
    methods:{
      initPersonalSpaceData(){
        var date1 = ''
        date1 = this.personalSpace.personalSpaceDate.toString()
        this.personalSpace.personalSpaceDate = date1
        this.query.condition = this.personalSpace
        queryAllPersonalSpace(this.query)
          .then((res)=>{
            this.personalSpaceDataList = res.data.records
            this.dataTotal = res.data.total
            this.query.pageSize = res.data.size
            this.query.pageNo = res.data.current
            this.clearParams()
          })
          .catch((err)=>{

          })
      },
      exportAllData(){
        if(this.personalSpaceUuidList.length == 0 || this.personalSpaceUuidList.length == undefined){
          this.$confirm('未选择指定数据将导出全部?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          })
          .then(()=>{
            // setPersonalSpaceSession(this.personalSpaceUuidList)
            // .then((res)=>{
              exportAllPersonalSpace()
            // })
          })
        }else{
          setPersonalSpaceSession(this.personalSpaceUuidList)
          .then((res)=>{
            if(res.msg == "成功"){
              exportAllPersonalSpace()
            }
          })
        }
      },
      handleSelectionChange(val){
        this.personalSpaceUuidList = []
        val.forEach((value,index)=>{
          this.personalSpaceUuidList.push(value.personalSpaceUuid)
        })
      },
      onReInput(){
        this.clearParams()
      },
      backToUpPage(){
        this.$router.go(-1)
      },
      joinInsertDialog(){
        this.$nextTick(()=>{
          this.clearParams()
        })
        this.openInsertDialog = true
      },
      closeInsertDialog(){
        this.openInsertDialog = false
        this.clearParams()
      },
      onSubmit(){
        const capacity1 = this.personalSpace.personalSpaceCapacity
        const capacity2 = this.personalSpaceCapacityNeed
        this.personalSpace.personalSpaceCapacity = capacity1+capacity2
        const param = this.personalSpace
        if(this.personalSpace.personalSpaceName == undefined || this.personalSpace.personalSpaceName == null || this.personalSpace.personalSpaceName == ''
        || this.personalSpace.personalSpaceCapacity == undefined || this.personalSpace.personalSpaceCapacity == null || this.personalSpace.personalSpaceCapacity == ''
        || this.personalSpaceCapacityNeed == undefined || this.personalSpaceCapacityNeed == null || this.personalSpaceCapacityNeed == ''
        || this.personalSpace.personalSpaceApproving == undefined || this.personalSpace.personalSpaceApproving == null || this.personalSpace.personalSpaceApproving == ''
        ){
          const h = this.$createElement;
          this.$notify({
            title: '提示',
            message: h('i', { style: 'color: teal'}, '输入不能为空')
          });
          return;
        }
        insertPersonalSpace(param)
                .then((res)=>{
                  if(res.data == 200){
                    this.$message({
                      type: 'success',
                      message: '添加成功'
                    })
                    this.openInsertDialog = false
                    this.clearParams()
                  }
                  this.initPersonalSpaceData()
                })
                .catch((err)=>{
                  console.log("新增失败")
                })
      },
      onDelete(){
        const params = this.personalSpaceUuidList
        if(params.length == 0){
          this.$message({
            type: 'warning',
            message: '未选择删除对象'
          })
        }else{
          deletePersonalSpace(params)
            .then((res)=>{
              this.initPersonalSpaceData()
              // location.reload()
            })
        }
      },
      handleSizeChange(val){
        this.query.pageSize = val
        this.initPersonalSpaceData()
      },
      handleCurrentChange(val){
        this.query.pageNo = val
        this.initPersonalSpaceData()
      },
      clearParams(){
        this.personalSpace = {
          personalSpaceName: '',
          personalSpaceApplication: '',
          personalSpaceType:'',
          personalSpaceDate:'',
          personalSpaceCapacity:'',
          personalSpaceStatus:'',
          personalSpaceApproving:'',
        }
        this.personalSpaceCapacityNeed = ''
      },
      inputChange(val){
        if(val<0){
          this.personalSpace.personalSpaceCapacity = 0
        }
        if(val >1024){
          this.personalSpace.personalSpaceCapacity = 1024
        }
      },
    }
  }
</script>

<style scoped>
.padding10 {
  padding: 10px;
  box-sizing: border-box;
}
.header_Filter {
  width: 100%;
}
</style>
