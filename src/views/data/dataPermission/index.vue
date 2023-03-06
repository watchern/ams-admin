<template>
  <div class="page-container">
    <div class="pd20">
<!--      查询-->
      <div class="que-component">
        <SearchCommon ref="tags"
                      @search="goQuery"
                      @clearSearch="reset"
                      :dropDown="dropDown"
                      @change="onChange"></SearchCommon>
      </div>
      <!-- 之前搜索 -->
      <!-- <div class="searchBlock"> -->
<!--      <div class="query-field">-->
<!--        <el-row>-->
<!--          <el-col :span="22">-->
<!--            <el-form :inline="true"-->
<!--                     :model="dataBaseData"-->
<!--                     label-position="bottom">-->
<!--              <el-row>-->
<!--                <el-form-item label="申请名称："-->
<!--                              prop="condition">-->
<!--                  <el-input v-model="dataBaseData.condition.permissionApplyName"-->
<!--                            size="small"-->
<!--                            placeholder="请输入内容"-->
<!--                            clearable></el-input>-->
<!--                </el-form-item>-->
<!--                <el-form-item label="申请人："-->
<!--                              prop="condition">-->
<!--                  <el-input v-model="dataBaseData.condition.createUserName"-->
<!--                            size="small"-->
<!--                            placeholder="请输入内容"-->
<!--                            clearable></el-input>-->
<!--                </el-form-item>-->
<!--                <el-form-item label="列表类型："-->
<!--                              prop="condition">-->
<!--                  <el-select v-model="dataBaseData.condition.workFlowState"-->
<!--                             filterable-->
<!--                             clearable-->
<!--                             placeholder="全部"-->
<!--                             size="small">-->
<!--                    <el-option v-for="(item, index) in listType"-->
<!--                               :key="index"-->
<!--                               :label="item.name"-->
<!--                               :value="item.id"></el-option>-->
<!--                  </el-select>-->
<!--                </el-form-item>-->
<!--                <el-form-item label="申请时间范围："-->
<!--                              prop="condition">-->
<!--                  <el-date-picker v-model="dataBaseData.times"-->
<!--                                  type="daterange"-->
<!--                                  range-separator="至"-->
<!--                                  start-placeholder="开始日期"-->
<!--                                  end-placeholder="结束日期">-->
<!--                  </el-date-picker>-->
<!--                </el-form-item>-->

<!--                  <el-button-->
<!--                             type="primary"-->
<!--                             @click="goQuery">查询</el-button>-->
<!--                  <el-button-->
<!--                             type="primary"-->
<!--                             @click="reset">重置</el-button>-->
<!--                </el-form-item>-->
<!--              </el-row>-->
<!--            </el-form>-->
            <!-- <div class="searchBlock_left"> -->

            <!-- <div class="search">
              <div class="search-title">申请名称:</div>
              <div class="search-operation">
                <el-input v-model="dataBaseData.condition.permissionApplyName"
                          size="small"
                          placeholder="请输入内容"
                          clearable></el-input>
              </div>
            </div> -->
            <!-- <div class="search">
              <div class="search-title">申请人:</div>
              <div class="search-operation">
                <el-input v-model="dataBaseData.condition.createUserName"
                          size="small"
                          placeholder="请输入内容"
                          clearable></el-input>
              </div>
            </div> -->

            <!-- <div class="search">
              <div class="search-title">列表类型:</div>
              <div class="search-operation">
                <el-select v-model="dataBaseData.condition.workFlowState"
                           filterable
                           clearable
                           placeholder="全部"
                           size="small">
                  <el-option v-for="(item, index) in listType"
                             :key="index"
                             :label="item.name"
                             :value="item.id"></el-option>
                </el-select>
              </div>
            </div>

            <div class="search">
              <div class="search-title">申请时间范围:</div>
              <div class="search-operation">
                <el-date-picker v-model="times"
                                type="daterange"
                                range-separator="至"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期">
                </el-date-picker>
              </div>
            </div> -->

            <!-- </div> -->
<!--          </el-col>-->
<!--        </el-row>-->
<!--      </div>-->
      <!-- 列表 -->
      <div class="listDisplay">
        <div class="mb10">
          <el-row>
            <el-col :span="24"
                    align="right">
              <el-button size="small"
                         class="oper-btn"
                         type="primary"
                         @click="add"> <img src="../../../styles/image/add.png"
                     class="btn_icon icon1"
                     alt="">
                <img src="../../../styles/image/add2.png"
                     class="btn_icon icon2"
                     alt="">
                新增
              </el-button>
              <el-button size="small"
                         type="primary"
                         class="oper-btn"
                         @click="goDelete"><img src="../../../styles/image/delete.png"
                     class="btn_icon icon1"
                     alt="">
                <img src="../../../styles/image/delete2.png"
                     class="btn_icon icon2"
                     alt="">删除</el-button>
              <el-button size="small"
                         type="primary"
                         class="oper-btn"
                         @click="goUpdate"><img src="../../../styles/image/edits.png"
                     class="btn_icon icon1"
                     alt="">
                <img src="../../../styles/image/edits2.png"
                     class="btn_icon icon2"
                     alt="">编辑</el-button>
              <el-button size="small"
                         type="primary"
                         class="oper-btn"
                         @click="goHandle">
                <img src="../../../styles/image/ban.png"
                     class="btn_icon icon1"
                     alt="">
                <img src="../../../styles/image/ban2.png"
                     class="btn_icon icon2"
                     alt="">办理</el-button>
              <!--                    <el-button size="mini" type="primary" @click="goExport">导出</el-button>-->
            </el-col>
          </el-row>
        </div>
        <el-table :data="tableData"
                  border
                  style="width: 100%"
                  stripe
                  v-loading="loading"
                  row-key="id"
                  height="calc(100vh - 300px)"
                  @selection-change="addSelected">
          <el-table-column type="selection"
                           width="55">
          </el-table-column>
          <el-table-column prop="permissionApplyName"
                           label="申请名称"
                           show-overflow-tooltip
                           min-width="150px">
            <template slot-scope="scope">
              <el-link type="text"
                       :underline="false"
                       @click="showApplyDetail(scope.row)">{{ scope.row.permissionApplyName }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column prop="createTime"
                           label="申请时间"
                           show-overflow-tooltip
                           min-width="150px">
          </el-table-column>
          <el-table-column prop="workFlowState"
                           label="状态"
                           width="100px"
                           show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.workFlowState | workFlowStateFilter }}
            </template>
          </el-table-column>
          <el-table-column prop="createUserName"
                           label="申请人"
                           width="150px"
                           show-overflow-tooltip></el-table-column>
          <el-table-column prop="mobile"
                           label="操作"
                           width="120px">
            <template slot-scope="scope">

              <el-link type="text"
                       :underline="false"
                       @click="processView(scope.row)">流程查看</el-link>

            </template>
          </el-table-column>
        </el-table>
        <el-pagination layout="total, sizes, prev, pager, next, jumper"
                       @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"
                       :total="total"></el-pagination>
      </div>
      <!-- 新增弹窗 -->
      <el-dialog :visible.sync="showAddDialog"
                 :title="addOrUpdate == 0 ? '创建申请':'修改申请'"
                 :close-on-click-modal="false"
                 :modal-append-to-body="false"
                 width="70%"
                 :close-on-press-escape="false">
        <Add :temp="temp"
             :addOrUpdate="addOrUpdate"
             @close="closeAddDrawer"
             @oka="addSucceed"
             v-if="showAddDialog"></Add>
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
                    :defaultPersonId="defaultPersonId"
                    @closeModal="closeFlowItem"
                    @delectData="delectData"
                    @UpdateBecauseSubmit="updateForSubmit"></FlowItem>
        </div>
        <span class="sess-flowitem"
              slot="footer">
          <el-button size="mini"
                     type="primary"
                     class="table_header_btn"
                     @click="saveOpinion">提交</el-button>
          <el-button size="mini"
                     type="primary"
                     class="table_header_btn"
                     @click="dialogFlowItemShow = false">关闭</el-button>
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
      <!--申请详情弹窗-->
      <el-dialog title="申请详情"
                 :visible.sync="showDetail"
                 v-if="showDetail"
                 width="80%">
        <div>
          <Add :temp="tempDetail"
               :addOrUpdate="2"></Add>
          <dataPermissionsDetail ref="applyPage"
                                 @fromSon="fromSon"></dataPermissionsDetail>
        </div>
        <span slot="footer">
          <el-button size="mini"
                     type="info"
                     class="table_header_btn"
                     @click="showDetail = false">关闭</el-button>
        </span>
      </el-dialog>
    </div>
  </div>

</template>

<script>
import Add from './add.vue'
import {
  deleteOperatePermissionApply,
  queryAllOperatePermissionApply,
  updateForHandle
} from "@/api/data/dataPermission";
import { formatDate } from "ams-etlscheduler-hx/src/components/etl/filter/filter";
import FlowItem from '@/components/starflow/todowork/flowItem'
import flowOpinionList from "@/components/starflow/todowork/flowOpinionList";
import dataPermissionsDetail from "@/views/data/dataPermission/dataPermissionsDetail.vue";

export default {
  name: "dataPermission",
  components: {
    Add,
    FlowItem,
    flowOpinionList,
    dataPermissionsDetail,
  },
  props: [],
  data () {
    return {
      dropDown:[
        {
          code: 'permissionApplyName',
          name: '申请名称',
          value: []
        },
        {
          code: 'createUserName',
          name: '申请人',
          value: []
        },
        {
          code: 'workFlowState',
          name: '列表类型',
          value: []
        },
        {
          code: 'startTime',
          name: '开始创建时间',
          value: []
        },
        {
          code: 'endTime',
          name: '结束创建时间',
          value: []
        }
      ],
      listType: [{ name: "草稿", id: "0" }, { name: "办理中", id: "1" }, { name: "办理完成", id: "2" }],
      //新增弹窗是否显示
      showAddDialog: false,
      loading: false,
      dataBaseData: {
        pageSize: 10,
        pageNo: 1,
        times: [],
        condition: {
          permissionApplyName: '',
          createUserName: '',
          workFlowState: '',
          permissionApplyStartTime: '',
          permissionApplyEndTime: '',
        }
      },
      tableData: [],
      // times: [],
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
      showDetail: false, //是否显示详情
      operatePermissionApplyUuid: '',//当前显示详情的申请id
      addOrUpdate: 0,//0为新增，1为修改
      tempDetail: ''//查看详情临时对象
    };
  },
  computed: {},
  watch: {},
  mounted () {
    this.goQuery();
  },
  created () {
    this.goQuery();
  },
  methods: {
    //改变选中数据
    addSelected (val) {
      this.selected = val
    },
    handleCurrentChange (val) {
      this.dataBaseData.pageNo = val
      this.goQuery();
    },
    handleSizeChange (val) {
      this.dataBaseData.pageSize = val
      this.goQuery();
    },

    onChange (serachParams) {
      this.dataBaseData.condition = serachParams;
    },
    // 查询
    goQuery (query) {
      query = this.$refs.tags.serachParams
      this.loading = true;
      if(query) this.dataBaseData.condition = query
      queryAllOperatePermissionApply(this.dataBaseData).then(resp => {
        this.loading = false;
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
    // 查询
    // goQuery () {
    //   // if (this.dataBaseData.times && this.dataBaseData.times.length > 0) {
    //   //   let startTime = new Date(this.dataBaseData.times[0]);
    //   //   let endTime = new Date(this.dataBaseData.times[1]);
    //   //   this.dataBaseData.condition.permissionApplyStartTime = formatDate(startTime);
    //   //   this.dataBaseData.condition.permissionApplyEndTime = formatDate(endTime);
    //   // }
    //   queryAllOperatePermissionApply(this.dataBaseData).then(resp => {
    //     if (resp.data) {
    //       this.tableData = resp.data.records;
    //       this.tableData.sort();
    //       // console.log(this.tableData)
    //       this.selected = [];
    //       this.total = resp.data.total;
    //     } else {
    //       this.tableData = []
    //       this.tableData.sort();
    //     }
    //   })
    // },
    // 重置
    reset () {
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
      this.dataBaseData.times = [];
    },
    // 添加
    add () {
      this.addOrUpdate = 0;
      this.showAddDialog = true;
    },
    // 删除
    goDelete () {
      if (this.selected.length == 0) {
        this.$notify.warning('未选择要删除的对象');
        return;
      }
      if (this.selected[0].workFlowState != '0') {
        this.$notify.warning('办理中或办理完成的业务不可删除');
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
          if (this.dataBaseData.pageNo > Math.ceil(this.total / this.dataBaseData.pageSize) && this.dataBaseData.pageNo > 1) {
            this.dataBaseData.pageNo--;
          }
          this.goQuery();
        })
      })
    },
    // 办理
    goHandle () {
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
    saveOpinion () {
      //保存业务数据成功后
      setTimeout(() => {
        this.$refs["flowItem"].submitFlow();
        //将状态修改为办理中
      }, 20);
    },
    closeFlowItem (val) {
      this.dialogFlowItemShow = val;
      this.flowParam = 0;
      // this.initData();
    },
    delectData (val) {
      this.dialogFlowItemShow = val;
    },
    // 导出
    goExport () {
    }
    ,
    // 流程查看
    processView (row) {
      //正常情况下 applyUuid 为 审批单主键
      //在业务页面 因为拿到 审批单主键比较麻烦
      // 所以在子页面中引入了 根据业务id 查询的方法
      //父页面 传给子组件一个 applyPage 即可 (写死)
      this.applyUuid = row.operatePermissionApplyUuid;
      this.todoFlow = true;
    }
    ,
    // 关闭弹窗
    closeAddDrawer () {
      this.showAddDialog = false
    }
    ,
    // 添加保存
    addSucceed (obj) {
      this.goQuery();
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
    },
    updateForSubmit () {
      updateForHandle(this.selected[0])
        .then((res) => {
          this.goQuery();
        })
    },
    //显示详情初始化数据
    fromSon () {
      this.$refs.applyPage.queryByUuid(this.operatePermissionApplyUuid, false);
    },
    //显示详情
    showApplyDetail (temp) {
      this.operatePermissionApplyUuid = temp.operatePermissionApplyUuid;
      this.tempDetail = temp;
      this.showDetail = true;
    },
    //修改申请信息
    goUpdate () {
      if (this.selected.length == 0) {
        this.$notify.warning("未选择要修改的申请")
        return
      }
      if (this.selected.length > 1) {
        this.$notify.warning("一次只能修改一条数据")
        return
      }
      if (this.selected[0].workFlowState != '0') {
        this.$notify.warning("办理中或办理完成的业务不可修改")
        return
      }
      this.addOrUpdate = 1;
      this.operatePermissionApplyUuid = this.selected[0].operatePermissionApplyUuid;
      this.temp = Object.assign({}, this.selected[0])
      this.showAddDialog = true;

    }
  },
  filters: {
    workFlowStateFilter (val) {
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

<style  scoped>
/* .listDisplaylistDisplay {
  height: calc(100vh - 140px);
} */
.searchBlock {
  width: 100%;
  float: left;
}
.search {
  float: left;
  display: inline-block;
  margin-right: 16px;
  margin-bottom: 8px;
}
.searchBlock_left {
  width: 100%;
}
.search-btn {
  width: 150px;
  text-align: right;
  display: flex;
}
.searchBlock .search-title {
  width: auto;
}
.searchBlock .search-operation {
  min-width: 180px;
  /* border: 1px solid; */
}
.searchBlock >>> .el-input__inner {
  width: 180px;
}
.searchBlock >>> .el-range-editor--medium.el-input__inner .el-range-input {
  height: 32px;
  width: 100px;
}
.searchBlock >>> .el-date-editor {
  width: 240px;
  height: 32px;
}
</style>


