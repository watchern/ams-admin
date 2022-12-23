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
              <el-option label="草稿"
                         value="草稿"></el-option>
              <el-option label="办理中"
                         value="办理中"></el-option>
              <el-option label="办理完成"
                         value="办理完成"></el-option>
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
        <el-button type="primary"
                   @click="joinUpdateDialog">修改</el-button>
        <el-button type="primary" @click="handleEvent">办理</el-button>
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

    <!--    修改弹窗-->
    <el-dialog title="个人空间申请"
               :visible.sync="openUpdateDialog"
               width="60%">
      <ExpansionUpdate ref="expansionUpdatePage"
                       @fromSon="joinUpdateDialog"
                       @fromSonCloseDiaglog="closeInsertDialog"
                       @fromSonUpdate="onUpdate"
      >

      </ExpansionUpdate>
<!--      <el-form :model="personalSpace"-->
<!--               class="demo-form-inline"-->
<!--               label-width="80px">-->
<!--        <el-form-item label="申请名称">-->
<!--          <el-input v-model="personalSpace.personalSpaceName"-->
<!--                    placeholder="申请名称"></el-input>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="扩容容量">-->
<!--          <el-input v-model="personalSpace.personalSpaceCapacity"-->
<!--                    placeholder="扩容容量"-->
<!--                    type="number"-->
<!--                    :max="1024"-->
<!--                    :min="0"-->
<!--                    @input="inputChange"-->
<!--                    style="width: 540px"></el-input>-->
<!--          <el-select v-model="personalSpaceCapacityNeed"-->
<!--                     placeholder="容量单位">-->
<!--            <el-option label="GB"-->
<!--                       value="GB"></el-option>-->
<!--            <el-option label="MB"-->
<!--                       value="MB"></el-option>-->
<!--            <el-option label="KB"-->
<!--                       value="KB"></el-option>-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="审批人">-->
<!--          <el-input v-model="personalSpace.personalSpaceApproving"-->
<!--                    placeholder="选择审批人"-->
<!--                    style="width: 670px"></el-input>-->
<!--          <el-button type="primary">选择</el-button>-->
<!--        </el-form-item>-->
<!--        <el-row type="flex"-->
<!--                justify="end">-->
<!--          <el-button type="primary"-->
<!--                     @click="onUpdate">保存</el-button>-->
<!--          <el-button type="primary"-->
<!--                     @click="closeInsertDialog">关闭</el-button>-->
<!--        </el-row>-->
<!--      </el-form>-->
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
                @closeModal="closeFlowItem"
                @delectData="delectData"
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
  </div>
</template>

<script>
  import {insertPersonalSpace
    ,deletePersonalSpace
    ,queryAllPersonalSpace
    ,exportAllPersonalSpace
    ,setPersonalSpaceSession
    ,updatePersonalSpace
    ,batchUpdateForHandle
    ,batchUpdateForFinishHandle
    ,queryByPersonalSpaceUuid
  } from "@/api/analysis/personalSpace";
  import FlowItem from '@/components/starflow/todowork/flowItem'
  import ExpansionUpdate from "@/views/data/expansion/ExpansionUpdate";
  export default {
    // components: { Pagination, QueryField, FlowItem },
    components: {
      FlowItem
      ,ExpansionUpdate
    },
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
        openUpdateDialog: false,//打开修改弹窗
        personalSpaceCapacityNeed:'',//该变量为容量的单位 在最后会和容量做一个拼接
        personalSpaceUuidList:[], //删除或者批量删除 id集合
        dataTotal: 100,//数据的总数
        personalSpaceSelectionList:[],//被选中的数据的集合
        dialogFlowItemShow: false,//流程弹窗
        query:{
          condition:{},
          pageNo:1,
          pageSize: 5
        },
        flowSet: {
          opinionList: false,
          opinion: false,
          nextStep: true,
          isSecond: false,
        },
        flowItem: {
          //动态赋值
          wftype: "auditNotice",
          applyUuid: "",
          detailUuids: "",
          applyTitle: "",
          workEffortId: "",
          appDataUuid: "",
          versionUuid: "",
          isSecond: false,
          temp1: "",
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
        temp: {
          sceneUuid: undefined,
          sceneName: '',
          sceneCode: ''
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
        this.personalSpaceSelectionList = []
        val.forEach((value,index)=>{
          this.personalSpaceUuidList.push(value.personalSpaceUuid)
        })
        val.forEach((value,index)=>{
          this.personalSpaceSelectionList.push(value)
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
        this.openUpdateDialog = false
        this.clearParams()
      },
      onSubmit(){
        const capacity1 = this.personalSpace.personalSpaceCapacity;
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
        // const personalSpace = {
        //   personalSpaceUuid: this.personalSpaceUuidList[0]
        // }
        // const relParam = []
        // relParam.push(personalSpace)
        // batchUpdateForFinishHandle(relParam)
        if(params.length == 0){
          this.$message({
            type: 'warning',
            message: '未选择删除对象'
          })
        }else{
          deletePersonalSpace(params)
            .then((res)=>{
              this.initPersonalSpaceData()
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
      handleEvent(){
        this.temp = Object.assign({}, this.personalSpaceSelectionList[0])
        console.log(this.personalSpaceSelectionList[0],"this.personalSpaceSelectionList[0]")
        console.log(this.temp,"this.temp")
        // alert(JSON.stringify(this.temp))
        //业务主键
        this.flowItem.appDataUuid=this.temp.personalSpaceUuid;
        //版本id 随机生成
        this.flowItem.versionUuid= this.common.randomString4Len(8);
        // this.flowItem.applyTitle="场景详情流程";
        //申请业务的名字（待办标题）
        this.flowItem.applyTitle=this.temp.personalSpaceName;
        console.log(this.flowItem,"flowItem")
        this.dialogFlowItemShow=true;

      },
      joinUpdateDialog(){
        const param = this.personalSpaceUuidList[0]
        console.log(param,"param")
        if(param == undefined || param == null || param.length == 0){
          this.$notify.warning("请选择对象")
          return
        }
        if(this.personalSpaceSelectionList.length >1){
          this.$notify.warning("一次只能修改一个对象")
          return
        }
        if(this.personalSpaceSelectionList[0].personalSpaceType !== '草稿'){
          this.$notify.warning("只有草稿状态可修改")
          return
        }
        this.openUpdateDialog = true
        //当在业务管理页面时候 不应该调用这个方法  在工作流中才调用 后期需要标识
        this.$refs.expansionUpdatePage.queryByUuid(param)
        // queryByPersonalSpaceUuid(param).then((res)=>{
        //   this.personalSpace = res.data
        //   var length = res.data.personalSpaceCapacity.length
        //   console.log(length,"length")
        //   this.personalSpaceCapacityNeed = res.data.personalSpaceCapacity.substring(length-2)
        //   this.personalSpace.personalSpaceCapacity = res.data.personalSpaceCapacity.substring(0,length-2)
        // })

      },
      onUpdate(personalSpace,personalSpaceCapacityNeed){
        // const capacity1 = this.personalSpace.personalSpaceCapacity
        const capacity1 = personalSpace.personalSpaceCapacity
        // const capacity2 = this.personalSpaceCapacityNeed
        const capacity2 = personalSpaceCapacityNeed
        personalSpace.personalSpaceCapacity = capacity1+capacity2
        const param = personalSpace
        console.log(param,"param")
        updatePersonalSpace(param)
        .then((res)=>{
          this.$notify.success("修改成功")
          setTimeout(() => {
              location.reload()
          }, 20);
        })
        .catch((err)=>{
          this.$notify.error("修改失败")
          this.openUpdateDialog = false;
        })

      },
      handle(){
        this.dialogFlowItemShow=true;
      },
      closeFlowItem(val) {
        this.dialogFlowItemShow = val;
        this.flowParam = 0;
        // this.initData();
      },
      delectData(val) {
        this.dialogFlowItemShow = val;
        // var data = {
        //   busRelationUuid: this.$store.state.applyInfo.applyInfo.appDataUuid,
        // };
        // this.$axios
        //   .post("/ams-clue/busRelation/delete/rollBackData", data)
        //   .then((response) => {
        //     if (response.data.code == "0") {
        //       this.flowItem.appDataUuid = response.data.data.busRelationUuid;
        //     }
        //   })
        //   .catch((error) => {
        //     this.CommonUtil.alertMsg(1, "操作失败！");
        //     console.log(error);
        //   });
        // this.initData();
      },
      saveOpinion() {
        //保存业务数据成功后
        setTimeout(() => {
          this.$refs["flowItem"].submitFlow();
          //将状态修改为办理中
          batchUpdateForHandle(this.personalSpaceSelectionList)
          .then((res)=>{
            location.reload()
          })
        }, 20);
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
