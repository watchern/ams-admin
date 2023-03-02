<template>
  <div class="page-container">
    <div class="pd20">
      <div class="header_Filter searchBlock query-field">
        <SearchCommon ref="tags"
                      @search="goQuery"
                      :dropDown="dropDown"
                      @clearSearch="onReInput"
                      @change="onChange"
        ></SearchCommon>
<!--        <el-row>-->

<!--          <el-form :inline="true"-->
<!--                   :model="personalSpace"-->
<!--                   class="demo-form-inline">-->
<!--            <el-form-item label="申请名称：">-->
<!--              <el-input v-model="personalSpace.personalSpaceName"-->
<!--                        placeholder="申请名称"></el-input>-->
<!--            </el-form-item>-->
<!--            <el-form-item label="申请人:">-->
<!--              <el-input v-model="personalSpace.personalSpaceApplication"-->
<!--                        placeholder="申请人"></el-input>-->
<!--            </el-form-item>-->
<!--            <el-form-item label="列表类型：">-->
<!--              <el-select v-model="personalSpace.personalSpaceType"-->
<!--                         placeholder="状态选择">-->
<!--                <el-option label="草稿"-->
<!--                           value="草稿"></el-option>-->
<!--                <el-option label="办理中"-->
<!--                           value="办理中"></el-option>-->
<!--                <el-option label="办理完成"-->
<!--                           value="办理完成"></el-option>-->
<!--              </el-select>-->
<!--            </el-form-item>-->
<!--            <el-form-item label="申请时间范围：">-->
<!--              <el-date-picker v-model="personalSpace.personalSpaceDate"-->
<!--                              type="datetimerange"-->
<!--                              format="yyyy-MM-dd"-->
<!--                              value-format="yyyy-MM-dd"-->
<!--                              range-separator="至"-->
<!--                              start-placeholder="开始日期"-->
<!--                              end-placeholder="结束日期">-->
<!--              </el-date-picker>-->
<!--            </el-form-item>-->
<!--            <el-form-item>-->
<!--              <el-button type="primary"-->
<!--                         @click="initPersonalSpaceData">查询</el-button>-->
<!--              <el-button type="primary"-->
<!--                         @click="onReInput">重置</el-button>-->
<!--            </el-form-item>-->
<!--          </el-form>-->
<!--        </el-row>-->
      </div>
      <div class="mb10">
        <el-row>
          <el-col align="right">
            <el-button type="primary"
                       class="oper-btn "
                       @click="joinInsertDialog"><img src="../../../styles/image/add.png"
                   class="btn_icon icon1"
                   alt="">
              <img src="../../../styles/image/add2.png"
                   class="btn_icon icon2"
                   alt="">新增
            </el-button>
            <el-button type="primary"
                       class="oper-btn "
                       @click="onDelete"><img src="../../../styles/image/delete.png"
                   class="btn_icon icon1"
                   alt="">
              <img src="../../../styles/image/delete2.png"
                   class="btn_icon icon2"
                   alt="">删除</el-button>
            <el-button type="primary"
                       class="oper-btn "
                       @click="joinUpdateDialog"><img src="../../../styles/image/edits.png"
                   class="btn_icon icon1"
                   alt="">
              <img src="../../../styles/image/edits2.png"
                   class="btn_icon icon2"
                   alt="">编辑</el-button>
            <el-button type="primary"
                       class="oper-btn "
                       @click="handleEvent"><img src="../../../styles/image/submit.png"
                   class="btn_icon icon1"
                   alt="">
              <img src="../../../styles/image/submit2.png"
                   class="btn_icon icon2"
                   alt="">提交</el-button>
            <el-button type="primary"
                       class="oper-btn "
                       @click="exportAllData">
              <img src="../../../styles/image/export.png"
                   class="btn_icon icon1"
                   alt="">
              <img src="../../../styles/image/export2.png"
                   class="btn_icon icon2"
                   alt="">导出</el-button>
            <!--        <el-button type="primary"-->
            <!--                   @click="backToUpPage">关闭</el-button>-->
          </el-col>
        </el-row>
      </div>
      <el-table :data="personalSpaceDataList"
                v-loading="loading"
                border
                style="width: 100%"
                height="calc(100vh - 310px)"
                @selection-change="handleSelectionChange">
        <el-table-column type="selection"
                         width="55"> </el-table-column>
        <el-table-column prop="personalSpaceName"
                         label="申请名称"
                         min-width="150px"
                         show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="personalSpaceCapacity"
                         label="扩容大小"
                         width="150px"
                         show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="personalSpaceDate"
                         label="申请时间"
                         width="150px"
                         show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="personalSpaceType"
                         label="状态"
                         width="150px"
                         show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="personalSpaceApplication"
                         label="申请人"
                         width="200px"
                         show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="viewProcess"
                         label="操作"
                         width="150px"
                         show-overflow-tooltip>
          <template slot-scope="scope">
            <el-link @click="todoOpinionList(scope.row)"
                     type="primary"
                     :underline="false"
                     class="linkClass">流程跟踪</el-link>
          </template>
        </el-table-column>
      </el-table>
      <el-row>
        <el-pagination @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"
                       background
                       :current-page="query.pageNo"
                       :page-sizes="[5, 10, 15, 20]"
                       :page-size="query.pageSize"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="dataTotal"
                       class="pagination">
        </el-pagination>
      </el-row>

      <!--     添加弹窗-->
      <el-dialog title="个人空间申请"
                 :visible.sync="openInsertDialog">
        <el-form :label-position="labelPosition"
                 :model="personalSpace"
                 class="demo-ruleForm"
                 label-width="80px"
                 :rules="rules"
                 width="60%"
                 ref="form">

          <el-form-item label="申请名称"
                        class="item-b"
                        prop="personalSpaceName">
            <el-input class="item-b-input"
                      v-model="personalSpace.personalSpaceName"
                      placeholder="申请名称"></el-input>
          </el-form-item>
          <el-form-item label="扩容容量"
                        class="item-b"
                        prop="personalSpaceCapacity">
            <div style="display: flex">
              <el-input v-model="personalSpace.personalSpaceCapacity"
                        placeholder="扩容容量"
                        type="number"
                        :max="1024"
                        :min="0"
                        @input="inputChange"
                        style="width: 80%"></el-input>
              <el-select v-model="personalSpaceCapacityNeed"
                         placeholder="容量单位"
                         style="margin-left: 10px">
                <el-option label="GB"
                           value="GB"></el-option>
                <el-option label="MB"
                           value="MB"></el-option>
                <el-option label="KB"
                           value="KB"></el-option>
              </el-select>
            </div>
          </el-form-item>
          <!--        <el-form-item label="审批人">-->
          <!--          <el-input v-model="personalSpace.personalSpaceApproving"-->
          <!--                    placeholder="选择审批人"-->
          <!--                    style="width: 670px"></el-input>-->
          <!--          <el-button type="primary">选择</el-button>-->
          <!--        </el-form-item>-->
        </el-form>
        <el-row type="flex"
                justify="end">
          <el-button @click="closeInsertDialog">关闭</el-button>
          <el-button type="primary"
                     @click="onSubmit">保存</el-button>

        </el-row>
      </el-dialog>
      <!--    修改弹窗-->
      <el-dialog title="个人空间申请"
                 :visible.sync="openUpdateDialog"
                 width="60%">
        <ExpansionUpdate ref="expansionUpdatePage"
                         @fromSon="joinUpdateDialog"
                         @fromSonCloseDiaglog="closeInsertDialog"
                         @fromSonUpdate="onUpdate">
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
      <el-dialog v-if="dialogFlowItemShow"
                 :close-on-click-modal="false"
                 :visible.sync="dialogFlowItemShow"
                 title="流程提交"
                 width="50%">
        <div>
          <FlowItem ref="flowItem"
                    :flowSet="flowSet"
                    :flowItem="flowItem"
                    :flow-param="flowParam"
                    :columnDefs="columnDefs"
                    :submitData="submitData"
                    @closeModal="closeFlowItem"
                    @delectData="delectData"
                    @UpdateBecauseSubmit="batchUpdateForSubmit"></FlowItem>
        </div>
        <span class="sess-flowitem"
              slot="footer">
          <el-button size="mini"
                     @click="dialogFlowItemShow = false">关闭</el-button>
          <el-button size="mini"
                     type="primary"
                     class="table_header_btn"
                     @click="saveOpinion">提交</el-button>

        </span>
      </el-dialog>
      <!--流程跟踪弹窗-->
      <el-dialog title="流程跟踪"
                 :visible.sync="todoFlow"
                 v-if="todoFlow"
                 width="80%">
        <div>
          <flowOpinionList :applyUuid="applyUuid"
                           :pageFrom="applyPage"></flowOpinionList>
        </div>
        <span slot="footer">
          <el-button size="mini"
                     type="info"
                     class="table_header_btn"
                     @click="todoFlow = false">关闭</el-button>
        </span>
      </el-dialog>
    </div>
  </div>

</template>

<script>
import {
  insertPersonalSpace,
  deletePersonalSpace,
  queryAllPersonalSpace,
  exportAllPersonalSpace,
  setPersonalSpaceSession,
  updatePersonalSpace,
  batchUpdateForHandle,
} from "@/api/data/personalSpace";

import FlowItem from "@/components/starflow/todowork/flowItem";
import ExpansionUpdate from "@/views/data/expansion/ExpansionUpdate";
import flowOpinionList from "@/components/starflow/todowork/flowOpinionList";
export default {
  components: {
    FlowItem,
    ExpansionUpdate,
    flowOpinionList,
  },
  data () {
    return {
      loading:false,
      //查询
      dropDown:[
        {
          code: 'personalSpaceName',
          name: '申请名称',
          value: []
        },
        {
          code: 'personalSpaceApplication',
          name: '申请人',
          value: []
        },
        {
          code: 'personalSpaceType',
          name: '列表类型',
          value: []
        },
        {
          code: 'personalSpaceDateStart',
          name: '开始创建时间',
          value: []
        },
        {
          code: 'personalSpaceDateEnd',
          name: '结束创建时间',
          value: []
        }
      ],
      labelPosition: "top",
      personalSpace: {
        personalSpaceName: "", //个人空间申请名称
        personalSpaceApplication: "", //申请人
        personalSpaceType: "", //业务所处状态
        personalSpaceDate: "", //申请日期
        personalSpaceCapacity: "", //申请的容量
        //修改查询组件添加查询时间字段
        personalSpaceDateStart:"",//开始申请日期
        personalSpaceDateEnd:"",//结束申请日期
        // personalSpaceStatus:'',//根据原型画过来的 暂时没用到捏
        // personalSpaceApproving:'',
      },
      rules: {
        personalSpaceName: [
          { required: true, message: "申请名称不能为空", trigger: "blur" },
        ],
        personalSpaceCapacity: [
          { required: true, message: "扩容容量不能为空", trigger: "blur" },
        ],
      },
      personalSpaceDataList: [], //查询并展示的数据集合
      openInsertDialog: false, //打开添加弹窗
      openUpdateDialog: false, //打开修改弹窗
      personalSpaceCapacityNeed: "", //该变量为容量的单位 在最后会和容量做一个拼接
      personalSpaceUuidList: [], //删除或者批量删除 id集合
      dataTotal: 100, //数据的总数
      personalSpaceSelectionList: [], //被选中的数据的集合
      dialogFlowItemShow: false, //流程弹窗
      query: {
        condition: {},
        pageNo: 1,
        pageSize: 5,
      },
      flowSet: {
        opinionList: false,
        opinion: false,
        nextStep: true,
        isSecond: false,
      },
      flowItem: {
        //动态赋值
        wftype: "auditNotice", //当前业务所属的流程的id
        applyUuid: "", //申请单主键id
        detailUuids: "",
        applyTitle: "", //请求的标题
        workEffortId: "", //节点id
        appDataUuid: "", //业务主键id
        versionUuid: "", //版本id
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
        sceneName: "",
        sceneCode: "",
      },
      todoFlow: false, //流程查看的弹窗控制
      applyPage: "applyPage", //有这个标识 查询流程的时候会走相对应的方法
    };
  },
  watch: {
    openInsertDialog (val) {
      if (!val) {
        this.$refs['form'].resetFields();
      }
    }

  },
  mounted () {
    // this.initPersonalSpaceData();
    this.goQuery();
  },
  methods: {
    onChange (serachParams) {
      this.personalSpaceData = serachParams;
    },

    goQuery(query){
      this.loading = true;
      query = this.$refs.tags.serachParams
      if(query)this.query.condition = this.personalSpace;
      queryAllPersonalSpace(this.query).then((res) => {
        this.loading = false;
        this.personalSpaceDataList = res.data.records;
        this.dataTotal = res.data.total;
        this.query.pageSize = res.data.size;
        this.query.pageNo = res.data.current;
      });
    },
    // initPersonalSpaceData () {
    //   var date1 = "";
    //   date1 = this.personalSpace.personalSpaceDate.toString();
    //   this.personalSpace.personalSpaceDate = date1;
    //   this.query.condition = this.personalSpace;
    //   queryAllPersonalSpace(this.query)
    //     .then((res) => {
    //       this.personalSpaceDataList = res.data.records;
    //       this.dataTotal = res.data.total;
    //       this.query.pageSize = res.data.size;
    //       this.query.pageNo = res.data.current;
    //       this.clearParams();
    //     })
    //     .catch((err) => { });
    // },
    exportAllData () {
      if (
        this.personalSpaceUuidList.length == 0 ||
        this.personalSpaceUuidList.length == undefined
      ) {
        this.$confirm("未选择指定数据将导出全部?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          exportAllPersonalSpace();
        });
      } else {
        setPersonalSpaceSession(this.personalSpaceUuidList).then((res) => {
          if (res.msg == "成功") {
            exportAllPersonalSpace();
          }
        });
      }
    },
    handleSelectionChange (val) {
      this.personalSpaceUuidList = [];
      this.personalSpaceSelectionList = [];
      val.forEach((value, index) => {
        this.personalSpaceUuidList.push(value.personalSpaceUuid);
      });
      val.forEach((value, index) => {
        this.personalSpaceSelectionList.push(value);
      });
    },
    onReInput () {
      this.clearParams();
      let param = {};
    },
    backToUpPage () {
      this.$router.go(-1);
    },
    //打开新增弹窗
    joinInsertDialog () {
      this.$nextTick(() => {
        this.clearParams();
      });
      this.openInsertDialog = true;
    },
    //关闭新增弹窗
    closeInsertDialog () {
      this.openInsertDialog = false;
      this.openUpdateDialog = false;
      this.clearParams();
    },
    //新增页面保存方法
    onSubmit () {
      const capacity1 = this.personalSpace.personalSpaceCapacity;
      const capacity2 = this.personalSpaceCapacityNeed;
      this.personalSpace.personalSpaceCapacity = capacity1 + capacity2;
      const param = this.personalSpace;
      if (
        this.personalSpace.personalSpaceName == undefined ||
        this.personalSpace.personalSpaceName == null ||
        this.personalSpace.personalSpaceName == "" ||
        this.personalSpace.personalSpaceCapacity == undefined ||
        this.personalSpace.personalSpaceCapacity == null ||
        this.personalSpace.personalSpaceCapacity == "" ||
        this.personalSpaceCapacityNeed == undefined ||
        this.personalSpaceCapacityNeed == null ||
        this.personalSpaceCapacityNeed == ""
        // || this.personalSpace.personalSpaceApproving == undefined || this.personalSpace.personalSpaceApproving == null || this.personalSpace.personalSpaceApproving == ''
      ) {
        const h = this.$createElement;
        this.$notify({
          title: "提示",
          message: h("i", { style: "color: teal" }, "输入不能为空"),
        });
        return;
      }
      insertPersonalSpace(param)
        .then((res) => {
          if (res.data == 200) {
            // this.$message({
            //   type: 'success',
            //   message: '添加成功'
            // })
            this.$notify.success("添加成功");
            this.openInsertDialog = false;
            this.clearParams();
          }
          this.initPersonalSpaceData();
        })
        .catch((err) => {
          this.$notify.error("添加失败");
        });
    },
    // 删除按钮
    onDelete () {
      var result = "";
      this.personalSpaceSelectionList.forEach((value, index) => {
        if (value.personalSpaceType != "草稿") {
          this.$notify.warning("只有草稿状态才可以删除");
          result = "break";
        }
      });
      if (result == "break") {
        return;
      }
      const params = this.personalSpaceUuidList;
      if (params.length == 0) {
        this.$message({
          type: "warning",
          message: "未选择删除对象",
        });
      } else {
        this.$confirm("是否删除该条数据?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          center: true,
        }).then(() => {
          deletePersonalSpace(params).then((res) => {
            this.$notify.success("删除成功");
            this.initPersonalSpaceData();
          });
        });
      }
    },
    //分页组件的页大小change事件
    handleSizeChange (val) {
      this.query.pageSize = val;
      this.initPersonalSpaceData();
    },
    //分页组件当前页change事件
    handleCurrentChange (val) {
      this.query.pageNo = val;
      this.initPersonalSpaceData();
    },
    //清空数据
    clearParams () {
      this.personalSpace = {
        personalSpaceName: "",
        personalSpaceApplication: "",
        personalSpaceType: "",
        personalSpaceDate: "",
        personalSpaceCapacity: "",
        personalSpaceDateStart:"",//开始申请日期
        personalSpaceDateEnd:"",//结束申请日期
        // personalSpaceStatus:'',
        // personalSpaceApproving:'',
      };
      this.personalSpaceCapacityNeed = "";
    },
    //容量大小输入限制
    inputChange (val) {
      if (val < 0) {
        this.personalSpace.personalSpaceCapacity = 0;
      }
      if (val > 1024) {
        this.personalSpace.personalSpaceCapacity = 1024;
      }
    },
    //提交按钮
    handleEvent () {
      if (this.personalSpaceSelectionList.length > 1) {
        this.$notify.warning("一次只能提交一条数据");
        return;
      }
      if (this.personalSpaceSelectionList[0].personalSpaceType !== "草稿") {
        this.$notify.warning("办理中或办理完成的业务不可提交");
        return;
      }
      this.temp = Object.assign({}, this.personalSpaceSelectionList[0]);
      //业务主键
      this.flowItem.appDataUuid = this.temp.personalSpaceUuid;
      //版本id 随机生成
      this.flowItem.versionUuid = this.common.randomString4Len(8);
      //申请业务的名字（待办标题）
      this.flowItem.applyTitle = this.temp.personalSpaceName;
      this.dialogFlowItemShow = true;
    },
    // 打开修改弹窗
    joinUpdateDialog () {
      const param = this.personalSpaceUuidList[0];
      if (param == undefined || param == null || param.length == 0) {
        this.$notify.warning("请选择对象");
        return;
      }
      if (this.personalSpaceSelectionList.length > 1) {
        this.$notify.warning("一次只能修改一条数据");
        return;
      }
      if (this.personalSpaceSelectionList[0].personalSpaceType !== "草稿") {
        this.$notify.warning("只有草稿状态可修改");
        return;
      }
      this.openUpdateDialog = true;
      //当在业务管理页面时候 不应该调用这个方法  在工作流中才调用 后期需要标识
      this.$refs.expansionUpdatePage.queryByUuid(param);
    },
    //修改方法
    onUpdate (personalSpace, personalSpaceCapacityNeed) {
      const capacity1 = personalSpace.personalSpaceCapacity;
      const capacity2 = personalSpaceCapacityNeed;
      personalSpace.personalSpaceCapacity = capacity1 + capacity2;
      const param = personalSpace;
      updatePersonalSpace(param)
        .then((res) => {
          this.$notify.success("修改成功");
          this.openUpdateDialog = false;
          this.initPersonalSpaceData();
        })
        .catch((err) => {
          this.$notify.error("修改失败");
          this.openUpdateDialog = false;
        });
    },
    //打开流程弹窗
    handle () {
      this.dialogFlowItemShow = true;
    },
    closeFlowItem (val) {
      this.dialogFlowItemShow = val;
      this.flowParam = 0;
      // this.initData();
    },
    delectData (val) {
      this.dialogFlowItemShow = val;
    },
    saveOpinion () {
      //保存业务数据成功后
      setTimeout(() => {
        this.$refs["flowItem"].submitFlow();
        //将状态修改为办理中
      }, 20);
    },
    //打开流程跟踪弹窗
    todoOpinionList (row) {
      //正常情况下 applyUuid 为 审批单主键
      //在业务页面 因为拿到 审批单主键比较麻烦
      // 所以在子页面中引入了 根据业务id 查询的方法
      //父页面 传给子组件一个 applyPage 即可 (写死)
      this.applyUuid = row.personalSpaceUuid;
      this.todoFlow = true;
    },
    batchUpdateForSubmit () {
      batchUpdateForHandle(this.personalSpaceSelectionList).then((res) => {
        this.initPersonalSpaceData();
      });
    }
  },
};
</script>
<style lang="scss" scoped>
.padding10 {
  padding: 10px;
  box-sizing: border-box;
}
.buttonExpan {
  display: flex;
  float: right;
}
.header_Filter {
  width: 100%;
}
.demo-ruleForm {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  ::v-deep .el-form-item {
    margin-bottom: 22px !important;
  }
  ::v-deep .el-form-item__label {
    text-align: right;
    vertical-align: middle;
    //float: left !important;
  }
}
.pagination {
  padding-left: 15px;
}
</style>
