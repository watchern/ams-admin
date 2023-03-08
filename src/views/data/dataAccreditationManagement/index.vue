<template>
  <div class="page-container">
    <!-- 筛选功能 -->
    <div class="query-field">
      <div class="query-field">
        <div class="left_btn">
          <el-button type="primary"
                     @click="approval_Modify()">认权修改</el-button>
          <el-button type="primary"
                     @click="approval_Add()">认权追加</el-button>
          <el-button type="primary"
                     @click="approval_Retract()">认权收回</el-button>
        </div>
        <div class="right_query">
          <el-form :inline="true"
                   :model="query"
                   label-position="bottom">
            <el-form-item>
              <el-input v-model="query.tableCode"
                        placeholder="请输入资产编号/资产名称"
                        clearable />
            </el-form-item>

            <el-form-item>
              <el-select v-model="query.tableType"
                         clearable
                         @change="selectdata_type"
                         placeholder="请选择资产类型">
                <el-option v-for="item in options_type_list"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value" />
              </el-select>
            </el-form-item>

            <!-- <el-form-item>
              <el-select v-model="query.name"
                         @change="selectdata_satus"
                         placeholder="请选择资产状态">
                <el-option v-for="item in options"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value" />
              </el-select>
            </el-form-item> -->

            <!--            <el-form-item>-->
            <!--              <el-select v-model="query.personName"-->
            <!--                         clearable-->
            <!--                         @change="selectdata_people"-->
            <!--                         placeholder="请选择认权人">-->
            <!--                <el-option v-for="item in options_type_list"-->
            <!--                           :key="item.value"-->
            <!--                           :label="item.label"-->
            <!--                           :value="item.value" />-->
            <!--              </el-select>-->
            <!--            </el-form-item>-->

            <el-form-item>
              <el-input v-model="query.personName"
                        placeholder="请选择认权人"
                        clearable />
            </el-form-item>

            <el-form-item>
              <el-button type="primary"
                         @keyup.enter.native="search"
                         @click="search()">查询</el-button>
              <el-button type="primary"
                         @click="clearAll()">清空</el-button>

            </el-form-item>

          </el-form>
        </div>
      </div>
    </div>

    <!-- table -->
    <div class="padding10">
      <el-table v-loading="listLoading"
                :data="page_list.records"
                ref="multipleTable"
                height="450px"
                border
                fit
                highlight-current-row
                style="width: 100%;height:calc(100% - 140px);overflow: auto;"
                @selection-change="handleSelectionChange">
        <el-table-column type="selection"
                         width="55" />
        <el-table-column label="资产编号"
                         prop="tableRelationQuery">
          <template slot-scope="scope">
            <div v-if="scope.row.tableRelationQuery.tableCode">
              {{scope.row.tableRelationQuery.tableCode.substring(0,scope.row.tableRelationQuery.tableCode.lastIndexOf(">"))}}

            </div>
            <div v-else>--</div>

          </template>
        </el-table-column>
        <el-table-column label="资产名称"
                         prop="displayTbName" />
        <el-table-column label="资产类型"
                         align="center"
                         prop="tableType">
          <template slot-scope="scope">
            {{
                scope.row.tableRelationQuery.tableType == 1
                      ? '表'
                      : scope.row.tableRelationQuery.tableType == 2
                      ? '视图'
                      : scope.row.tableRelationQuery.tableType == 3
                      ? '存储过程'
                      : scope.row.tableRelationQuery.tableType == 4
                      ? '接口'
                      : scope.row.tableRelationQuery.tableType == 5
                       ? '报表'
                      : scope.row.tableRelationQuery.tableType == 6
                      ? '指标'
                      : scope.row.tableRelationQuery.tableType == 7
                      ? '标签' : '其它'
              }}
          </template>
        </el-table-column>

        <!-- <el-table-column label="资产状态"
                         align="center"
                         prop="createUserName" /> -->
        <el-table-column label="所属主题"
                         align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.tableRelationQuery">
              {{scope.row.tableRelationQuery.tableThemeName}}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="所属系统"
                         align="center"
                         prop="businessSystemName">
          <template slot-scope="scope">
            {{scope.row.tableRelationQuery.businessSystemName}}
          </template>

        </el-table-column>

        <!-- <el-table-column label="所属目录"
                         align="center"
                         prop="folderUuid" /> -->
        <el-table-column label="认权人"
                         align="center"
                         prop="personName" />
      </el-table>
      <el-pagination v-show="page_list.total>0"
                     :total="page_list.total"
                     :current-page="page_list.currentPage"
                     @current-change="handleCurrentChange"
                     @size-change="handleSizeChange"
                     layout="total, sizes, prev, pager, next, jumper"></el-pagination>

    </div>
    <!-- 选择责任人 -->
    <el-dialog title="选择责任人"
               :visible.sync="resultShareDialogIsSee"
               :before-close="close_people"
               width="80%">
      <personTree ref="orgPeopleTree"></personTree>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="close_people()">取 消</el-button>
        <el-button type="primary"
                   @click="modelResultShare()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  page_list_data,//列表
  getById,//详情
  save_data,//新增保存
  update_data,//编辑保存
  delete_data,//删除
} from "@/api/lhg/dataAccreditationManagement.js";

import personTree from "@/components/publicpersontree/index";

export default {
  components: {
    personTree: () => import('@/components/publicpersontree/index')

  },
  data () {
    return {
      query: {
        tableCode: '',//资产编号
        tableType: '',//资产类型
        personName: '',//资产认权人姓名
        pageNo: 1,
        pageSize: 10,

      },
      // 资产类型
      options_type_list: [
        {
          value: 1,
          label: '表'
        },
        {
          value: 2,
          label: '视图'
        },
        {
          value: 3,
          label: '存储过程'
        },
        {
          value: 4,
          label: '接口'
        },
        {
          value: 5,
          label: '报表'
        },
        {
          value: 6,
          label: '指标'
        },
        {
          value: 7,
          label: '标签'
        },
        {
          value: 8,
          label: '其它'
        },
      ],
      form: {
        personName: '',//资产认权人姓名
        tableMetaUuid: '',
        // personUuid: [],
        // personName: [],
        personLiables: [],
      },
      page_list: [],//列表分页
      listLoading: false,
      Selectval_list: [],//多选的值

      isDisable: false, //防止重复提交
      resultShareDialogIsSee: false,//认权修改
      click_type: '',//0,修改 1.追加，

    };
  },
  created () {
    this.getList();//刷新列表
  },
  methods: {
    // 认权修改
    approval_Modify () {
      this.click_type = '0'
      if (this.Selectval_list.length !== 0) {
        this.resultShareDialogIsSee = true//认权修改

        var tableMetaUuid = [];
        for (var i = 0; i < this.Selectval_list.length; i++) {

          tableMetaUuid.push(this.Selectval_list[i].tableMetaUuid)
        }

        this.form.tableMetaUuid = tableMetaUuid
      } else {
        this.$message({
          message: '请选择数据后进行修改',
          type: 'warning',
          showClose: true,
        })
      }

    },
    // 清除多选框
    clearcheckbox () {
      this.$nextTick(() => {
        if (this.$refs.multipleTable) {
          this.$refs.multipleTable.clearSelection();//清除多选框
        }
        if (this.$refs.orgPeopleTree) {
          if (this.$refs.multipleTable) {
            this.$refs.orgPeopleTree.$refs.multipleTable.clearSelection();//清空选择的认权人
            this.$refs.orgPeopleTree.findOrgTree_data();
            this.$refs.orgPeopleTree.list = [];
            this.$refs.orgPeopleTree.total = 0;
          }
        }
      })
    },

    // 认权追加
    approval_Add () {
      if (this.Selectval_list.length !== 0) {
        this.resultShareDialogIsSee = true

        this.clearcheckbox();
        this.click_type = '1'
        var tableMetaUuid = [];
        for (var i = 0; i < this.Selectval_list.length; i++) {
          tableMetaUuid.push(this.Selectval_list[i].tableMetaUuid)
        }
        this.form.tableMetaUuid = tableMetaUuid
      } else {
        this.$message({
          message: '请选择数据后进行追加',
          type: 'warning',
          showClose: true,
        })
      }
    },

    // 认权收回
    approval_Retract () {
      // this.resultShareDialogIsSee = true
      var tableMetaUuid = [];
      if (this.Selectval_list.length == 0) {
        this.$message({
          type: 'warning',
          message: '请选择数据后进行收回',
        })
        return
      }
      for (var i = 0; i < this.Selectval_list.length; i++) {
        tableMetaUuid.push(this.Selectval_list[i].tableMetaUuid)
      }
      // 
      // return false
      // this.form.tableMetaUuid = tableMetaUuid.join(",");
      this.form.tableMetaUuid = tableMetaUuid;

      // 删除
      let params = {
        tableMetaUuids: this.form.tableMetaUuid,
      }
      delete_data(params).then((res) => {

        if (res.code == 0) {
          this.$message({
            message: '删除成功',
            type: 'success',
            showClose: true,
          })
        } else {
          this.$message({
            message: res.msg,
            type: 'error',
            showClose: true,
          })
        }
        this.getList();//刷新列表
      })

    },
    // 请选择资产类型
    selectdata_type (val) {

    },
    // // 请选择资产状态
    // selectdata_satus (val) {

    // },
    // 请选择认权人
    selectdata_people (val) {

    },
    // 清空
    clearAll () {
      this.query.personName = ''//资产认权人姓名
      this.query.tableType = ''//资产类型
      this.query.tableCode = ''//资产编号
    },
    search () {
      this.query.pageNo = 1
      this.getList();//刷新列表
    },

    // 刷新列表
    getList () {
      this.listLoading = true
      let params = {
        personName: this.query.personName,
        tableType: this.query.tableType,
        tableCode: this.query.tableCode,
        pageNo: this.query.pageNo,
        pageSize: this.query.pageSize,
      }
      page_list_data(params).then(res => {
        this.listLoading = false
        this.page_list = res.data;

      })
    },
    // 分页
    handleCurrentChange (val) {
      this.query.pageNo = val
      this.getList();//刷新列表
    },
    // 每页多少条
    handleSizeChange (val) {
      this.query.pageSize = val
      this.getList();//刷新列表
    },
    // 多选
    handleSelectionChange (val) {
      this.Selectval_list = val;
    },
    // 关闭选择认权人
    close_people () {
      this.resultShareDialogIsSee = false
      this.clearcheckbox();
    },

    // 保存任权人
    modelResultShare () {
      // var runTaskRelUuids = [];
      var personUuids = [];
      var personNames = [];
      var arr = []
      var selectedNode = this.$refs.orgPeopleTree.getSelectValue();
      for (var i = 0; i < selectedNode.length; i++) {
        personUuids.push(selectedNode[i].personuuid);
        personNames.push(selectedNode[i].cnname);
        let obj = {
          personUuid: selectedNode[i].personuuid, personName: selectedNode[i].cnname
        }
        arr.push(obj)
      }
      this.form.personLiables = arr
      let params = {
        tableMetaUuids: this.form.tableMetaUuid,
        personLiables: this.form.personLiables,// 资产责任
      }
      // 
      // 修改
      if (this.click_type == '0') {
        update_data(params).then(res => {
          if (res.code == 0) {
            this.$message({
              message: '修改成功',
              type: 'success',
              showClose: true,
            })

            this.resultShareDialogIsSee = false//关闭
            this.getList();//刷新列表
            this.clearcheckbox();
          } else {
            this.$message({
              message: res.msg,
              type: 'error',
              showClose: true,
            })
          }
          this.resultShareDialogIsSee = false//关闭
          this.clearcheckbox();
        })
      } else if (this.click_type == '1') {
        // 新增
        save_data(params).then(res => {
          if (res.code == 0) {
            this.$message({
              message: '新增成功',
              type: 'success',
              showClose: true,
            })
            this.resultShareDialogIsSee = false//关闭
            this.getList();//刷新列表
            this.clearcheckbox();
          } else {
            this.$message({
              message: res.msg,
              type: 'error',
              showClose: true,
            })
            this.resultShareDialogIsSee = false//关闭
            this.clearcheckbox();
          }
        })
      }
    },
  }
};
</script>

<style scoped >
@import url("./../../../assets/css/common.css");

.query-field {
}
.left_btn {
  float: left;
}
.right_query {
  flex: 1;
  text-align: right;
}
</style>
