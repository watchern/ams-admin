<template>
  <div>
    <div style="display: flex">
      <el-row style="right: 100px">
        <el-form :inline="true" :model="personalSpace" class="demo-form-inline" label-width="150px">
          <el-form-item label="申请名称">
            <el-input  v-model="personalSpace.personalSpaceName" placeholder="申请名称"></el-input>
          </el-form-item>
          <el-form-item label="申请人">
            <el-input v-model="personalSpace.personalSpaceApproving" placeholder="审批人"></el-input>
          </el-form-item>
          <el-form-item label="列表类型">
            <el-select v-model="personalSpace.personalSpaceStatus" placeholder="状态选择">
              <el-option label="待办" value="待办"></el-option>
              <el-option label="已办" value="已办"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-row>
      <el-row style="right: 200px">
        <el-form :inline="true" :model="personalSpace" class="demo-form-inline" label-width="100px">
          <el-form-item label="申请时间范围">
            <el-date-picker
                    v-model="personalSpace.personalSpaceDate"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary">查询</el-button>
            <el-button type="primary" @click="onReInput">重置</el-button>
          </el-form-item>
        </el-form>
      </el-row>
      <el-row style="left: 350px">
        <el-button type="primary" @click="joinInsertDialog">添加</el-button>
        <el-button type="primary" @click="onDelete">删除</el-button>
        <el-button type="primary">办理</el-button>
        <el-button type="primary" @click="exportAllData">导出</el-button>
        <el-button type="primary" @click="backToUpPage">关闭</el-button>
      </el-row>
    </div>

    <el-table
            :data="tableData"
            border
            style="width: 100%"
            @selection-change="handleSelectionChange"
    >
      <el-table-column
              type="selection"
              width="55">
      </el-table-column>
      <el-table-column
              fixed
              prop="date"
              label="申请名称"
      >
      </el-table-column>
      <el-table-column
              prop="name"
              label="扩容大小"
      >
      </el-table-column>
      <el-table-column
              prop="province"
              label="申请时间"
      >
      </el-table-column>
      <el-table-column
              prop="city"
              label="状态"
      >
      </el-table-column>
      <el-table-column
              prop="address"
              label="申请人"
      >
      </el-table-column>
      <el-table-column
              label="操作"
      >
        <el-button type="text">流程查看</el-button>
      </el-table-column>
    </el-table>
    <el-row style="left: 250px">
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="query.pageNo"
              :page-sizes="[10, 20, 30, 40]"
              :page-size="query.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="dataTotal">
      </el-pagination>
    </el-row>
    <!--     添加弹窗-->
    <el-dialog
            title="个人空间申请"
            :visible.sync="openInsertDialog"
            width="60%"
    >
      <el-form :model="personalSpace" class="demo-form-inline" label-width="80px">
        <el-form-item label="申请名称">
          <el-input  v-model="personalSpace.personalSpaceName" placeholder="申请名称"></el-input>
        </el-form-item>
        <el-form-item label="扩容容量">
          <el-input v-model="personalSpace.personalSpaceCapacity" placeholder="扩容容量" style="width: 550px"></el-input>
          <el-select v-model="personalSpaceCapacityNeed" placeholder="容量单位">
            <el-option label="GB" value="GB"></el-option>
            <el-option label="MB" value="MB"></el-option>
            <el-option label="KB" value="KB"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审批人">
          <el-input v-model="personalSpace.personalSpaceApproving" placeholder="选择审批人" style="width: 670px"></el-input>
          <el-button type="primary">选择</el-button>
        </el-form-item>
        <el-row type="flex" justify="end">
          <el-button type="primary" @click="onSubmit">保存</el-button>
          <el-button type="primary" @click="closeInsertDialog">关闭</el-button>
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
  } from "../../../api/analysis/personalSpace";
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
        tableData: [{
          date: '2016-05-02',
          name: '王小虎',
          province: '上海',
          city: '普陀区',
          address: '上海市普陀区金沙江路 1518 弄',
          zip: 200333
        }, {
          date: '2016-05-04',
          name: '王小虎',
          province: '上海',
          city: '普陀区',
          address: '上海市普陀区金沙江路 1517 弄',
          zip: 200333
        }, {
          date: '2016-05-01',
          name: '王小虎',
          province: '上海',
          city: '普陀区',
          address: '上海市普陀区金沙江路 1519 弄',
          zip: 200333
        }, {
          date: '2016-05-03',
          name: '王小虎',
          province: '上海',
          city: '普陀区',
          address: '上海市普陀区金沙江路 1516 弄',
          zip: 200333
        }],
        openInsertDialog: false,
        personalSpaceCapacityNeed:'',//该变量为容量的单位 在最后会和容量做一个拼接
        personalSpaceUuidList:[], //删除或者批量删除 id集合
        dataTotal: 200,//数据的总数
        query:{
          pageNo:1,
          pageSize: 10
        },
      }
    },
    mounted() {
      // this.initPersonalSpaceData()
    },
    methods:{
      initPersonalSpaceData(){
        const params = this.query
        queryAllPersonalSpace(params)
                .then((res)=>{
                  // this.tableData = res.data
                  // this.dataTotal = res.data.length
                })
                .catch((err)=>{

                })
      },
      exportAllData(){
        exportAllPersonalSpace()
                .then((res)=>{

                })
                .catch((err)=>{

                })
      },
      handleSelectionChange(val){
        // forEach((value,index)=>{
        //     this.personalSpaceUuidList.push(val.personalSpaceUuid)
        // })
      },
      onReInput(){
        console.log(this.personalSpace.personalSpaceDate,"date")
        this.personalSpace = {
          personalSpaceName: '',
          personalSpaceApplication: '',
          personalSpaceType:'',
          personalSpaceDate:'',
          personalSpaceCapacity:'',
          personalSpaceStatus:'',
          personalSpaceApproving:'',
        }
      },
      backToUpPage(){
        this.$router.go(-1)
      },
      joinInsertDialog(){
        console.log("进入打开dialog方法")
        this.openInsertDialog = true
      },
      closeInsertDialog(){
        this.openInsertDialog = false
        this.personalSpace = {
          personalSpaceName: '',
          personalSpaceApplication: '',
          personalSpaceType:'',
          personalSpaceDate:'',
          personalSpaceCapacity:'',
          personalSpaceStatus:'',
          personalSpaceApproving:'',
        }
      },
      onSubmit(){
        this.$nextTick(()=>{
          this.personalSpace = {
            personalSpaceName: '',
            personalSpaceApplication: '',
            personalSpaceType:'',
            personalSpaceDate:'',
            personalSpaceCapacity:'',
            personalSpaceStatus:'',
            personalSpaceApproving:'',
          }
        })
        const capacity1 = this.personalSpace.personalSpaceCapacity
        const capacity2 = this.personalSpaceCapacityNeed
        this.personalSpace.personalSpaceCapacity = capacity1+capacity2
        const param = this.personalSpace
        insertPersonalSpace(param)
                .then((res)=>{
                  console.log("新增成功")
                })
                .catch((err)=>{})
        console.log("新增失败")
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
                    console.log("删除成功")
                  })
        }
      },
      handleSizeChange(val){
        console.log(val,"sizeChange")
        // this.initPersonalSpaceData()
      },
      handleCurrentChange(val){
        console.log(val,"currentChange")
        // this.initPersonalSpaceData()
      }
    }
  }
</script>

<style scoped>

</style>
