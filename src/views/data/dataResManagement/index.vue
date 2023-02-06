<template>
  <!--数据资源管理 业务系统管理 -->
  <div class="page-container">
    <div class="filter-container">
      <div class="query-field">
        <el-form :inline="true"
                 :model="query"
                 label-position="bottom">
          <el-form-item label="系统名称：">
            <el-input v-model="query.businessSystemName"
                      clearable />
          </el-form-item>

          <el-form-item label="系统代码：">
            <el-input v-model="query.businessSystemCode"
                      clearable />
          </el-form-item>

          <el-form-item label="创建人：">
            <el-input v-model="query.createUserName"
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
      <div class="padding10">
        <el-row>
          <el-col align="right">
            <el-button type="primary"
                       class="oper-btn add btn-width-md"
                       @click="add()" />
            <!-- <el-button type="primary"
                   class="oper-btn edit"
                   @click="edit()" />

        <el-button type="primary"
                   class="oper-btn delete"
                   @click="delete_data()" /> -->
          </el-col>
        </el-row>
      </div>

      <el-table v-loading="listLoading"
                :data="page_list.records"
                height="calc(100vh - 321px)"
                border
                fit
                highlight-current-row
                style="width: 100%;height:calc(100% - 140px);overflow: auto;"
                @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection"
                         width="55" /> -->
        <el-table-column label="系统名称"
                         prop="businessSystemName">
          <template slot-scope="scope">
            <el-button type="text"
                       size="mini"
                       prop="displayTbName"
                       style="background: none;"
                       @click="details(scope.row.businessSystemUuid)">{{scope.row.businessSystemName}}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="系统代码"
                         prop="businessSystemCode" />
        <el-table-column label="创建时间"
                         align="center"
                         :formatter="formatCreateTime"
                         prop="createTime" />
        <el-table-column label="创建人"
                         align="center"
                         prop="createUserName" />
        <el-table-column label="操作"
                         align="center">
          <template slot-scope="scope">
            <el-button type="primary"
                       class="oper-btn edit"
                       title="修改"
                       size="mini"
                       @click="edit_table(scope.row.businessSystemUuid)" />
            <el-button type="primary"
                       class="oper-btn delete"
                       title="删除"
                       size="mini"
                       @click="delete_table(scope.row.businessSystemUuid)" />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination v-show="page_list.total>0"
                   :total="page_list.total"
                   :current-page="page_list.currentPage"
                   background
                   @current-change="handleCurrentChange"
                   @size-change="handleSizeChange"
                   layout="total, sizes, prev, pager, next, jumper"></el-pagination>

    <!-- 新增编辑 -->
    <el-dialog :title="title"
               :visible.sync="dialogVisible"
               @close="handleClose('form')"
               class="dialog"
    >
      <div class="add-dialog">
        <el-form :rules="rules"
                 ref="form"
                 :model="form"
                 :inline="false"
                class="detail-form"
        >
  <!--        width="40%"-->

          <el-form-item label="系统名称:"
                        prop="businessSystemName">
            <el-input type="text"
                      style="width: 95%"
                      v-model="form.businessSystemName"
                      :readonly="title == '查看业务系统'"
                      :rows="3">
            </el-input>
          </el-form-item>
          <el-form-item label="系统代码:"
                        prop="businessSystemCode">
            <el-input
                      style="width: 95%"
                      type="textarea"
                      :readonly="title == '查看业务系统'"
                      v-model="form.businessSystemCode"></el-input>
          </el-form-item>
          <el-form-item label="执行时间间隔:"
                        prop="businessSystemEtldate">
            <!-- <el-date-picker v-model="form.businessSystemEtldate"
                              type="date"
                              :disabled="title == '查看业务系统'"
                              format="yyyy-MM-dd"
                              value-format="yyyy-MM-dd"
                              placeholder="选择日期"> -->
            <el-input
                      type="input"
                      style="width: 95%"
                      :readonly="title == '查看业务系统'"
                      v-model.number="form.businessSystemEtldate"></el-input>
            <!-- </el-date-picker> -->

          </el-form-item>
          <!-- <el-form-item label="创建人:"
                          prop="createUserName">
              <el-input type="textarea"
                        style="width: 80%;"
                        :rows="4"
                        :disabled="title == '查看业务系统'"
                        v-model="form.createUserName">
              </el-input>
            </el-form-item> -->

          <el-form-item label="文件推送路径:"
                        prop="filePushPath">
            <el-input type="textarea"
                      :rows="3"
                      style="width: 95%"
                      :readonly="title == '查看业务系统'"
                      v-model="form.filePushPath">
            </el-input>
          </el-form-item>

          <el-form-item label="数据备份路径:"
                        prop="dataBackupPath">
            <el-input type="textarea"
                      :rows="3"
                      style="width: 95%"
                      :readonly="title == '查看业务系统'"
                      v-model="form.dataBackupPath">
            </el-input>
          </el-form-item>

          <el-form-item label="数据移动目录:"
                        prop="dataMoveDir">
            <el-input type="textarea"
                      :rows="3"
                      style="width: 95%"
                      :readonly="title == '查看业务系统'"
                      v-model="form.dataMoveDir">
            </el-input>
          </el-form-item>
        </el-form>

        <span slot="footer"
              class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     :readonly="isDisable"
                     v-if="title !== '查看业务系统'"
                     @click="save('form')">保存</el-button>
        </span>
      </div>
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
} from "@/api/lhg/dataResManagement.js";

export default {
  components: {},
  data () {
    return {
      // 查询列表
      query: {
        businessSystemName: '',// 业务系统名称
        businessSystemCode: '',// 业务系统代码
        createUserName: '',// 业务系统创建人
        beforSemantics: '',
        pageNo: 1,
        pageSize: 10,
      },
      listLoading: false,
      page_list: [],//列表
      Selectval: [],//多选的值
      // 新增的数据
      form: {
        businessSystemName: '',// 业务系统名称
        businessSystemCode: '',// 业务系统代码
        businessSystemEtldate: '',// 业务系统数据时间
        filePushPath: '',//文件推送路径
        dataBackupPath: '',//数据备份路径
        dataMoveDir: '',//数据移动目录
        businessSystemUuid: '',//单表id
        // createUserName: '',//创建人
      },

      dialogVisible: false,//新增弹窗
      isDisable: false, //防止重复提交
      title: '',//弹窗标题

      rules: {
        businessSystemName: [
          { required: true, message: '请输入名称', trigger: 'blur' },
        ],
        businessSystemCode: [
          { required: true, message: '请输入系统代码', trigger: 'change' },
        ],
        businessSystemEtldate: [
          { required: true, message: '请输入时间', trigger: 'change' },
          { type: 'number', message: '时间必须为数字值' },
        ],
        beforSemantics: [
          { required: true, message: '请输入创建人', trigger: 'blue' },
        ],

        filePushPath: [
          { required: true, message: '请输入文件推送路径', trigger: 'blur' },
        ],

        dataBackupPath: [
          { required: true, message: '请输入数据备份路径', trigger: 'blur' },
        ],

        dataMoveDir: [
          { required: true, message: '请输入数据移动目录', trigger: 'blur' },
        ],

      }
    };
  },
  computed: {},
  watch: {},
  created () {
    this.getList();//刷新列表
  },
  methods: {
    // 时间格式化、
    formatCreateTime (row, column) {
      // 拼接日期规格为YYYY-MM-DD hh:mm:ss
      var createTime = new Date(row.createTime)
      var createTimeRow = createTime.getFullYear() + '-' + (createTime.getMonth() + 1) + '-' + createTime.getDate() + ' ' + createTime.getHours() + ':' + createTime.getMinutes() + ':' + createTime.getSeconds()
      return createTimeRow
    },

    // 清空
    clearAll () {
      this.query.businessSystemName = ''
      this.query.businessSystemCode = ''
      this.query.createUserName = ''
    },
    search () {
      this.query.pageNo = 1
      this.getList();//刷新列表
    },
    // 刷新列表
    getList () {
      this.listLoading = true
      let params = {
        condition: {
          businessSystemName: this.query.businessSystemName,
          businessSystemCode: this.query.businessSystemCode,
          createUserName: this.query.createUserName,
        },
        pageNo: this.query.pageNo,
        pageSize: this.query.pageSize,
      }
      page_list_data(params).then(res => {
        this.page_list = res.data;
        this.listLoading = false
      })
    },
    // 多选
    handleSelectionChange (val) {
      this.Selectval = val;
    },
    // 分页
    handleCurrentChange (val) {
      this.query.pageNo = val
      this.getList()
    },
    // 每页多少条
    handleSizeChange (val) {
      this.query.pageSize = val
      this.getList()
    },
    // 详情
    details (businessSystemUuid) {
      this.title = '查看业务系统'
      this.form.businessSystemUuid = businessSystemUuid
      this.dialogVisible = true
      this.details_details();
    },
    // 新建
    add () {
      this.dialogVisible = true
      this.title = '新建业务系统'
      // 清除校验
      if (this.$refs.form) {
        this.$nextTick(() => {
          this.$refs['form'].clearValidate()
        })
      }
    },
    // 编辑
    edit_table (businessSystemUuid) {
      this.dialogVisible = true
      this.isDisable = false

      this.title = '编辑业务系统'
      this.form.businessSystemUuid = businessSystemUuid
      this.details_details();
    },

    // 详情 接口
    details_details () {
      let params = {
        businessSystemUuid: this.form.businessSystemUuid
      }
      getById(params).then(res => {
        this.form = res.data

      })
    },


    // 新建保存 && 编辑保存
    save (form) {
      this.isDisable = true
      setTimeout(() => {
        this.isDisable = false
      }, 2000)

      this.$refs[form].validate((valid) => {
        if (valid) {
          if (this.title == '新建业务系统') {
            let params = {
              businessSystemName: this.form.businessSystemName,
              businessSystemCode: this.form.businessSystemCode,
              businessSystemEtldate: this.form.businessSystemEtldate,
              filePushPath: this.form.filePushPath,
              dataBackupPath: this.form.dataBackupPath,
              dataMoveDir: this.form.dataMoveDir,
            }
            save_data(params).then(res => {
              if (res.code == 0) {
                this.$message({
                  message: '新增成功',
                  type: 'success',
                  showClose: true,
                })
                this.dialogVisible = false
                this.getList()
              } else {
                this.$message({
                  message: res.msg,
                  type: 'error',
                  showClose: true,
                })
              }
            })
          } else {
            let params = {
              businessSystemUuid: this.form.businessSystemUuid,
              businessSystemName: this.form.businessSystemName,
              businessSystemCode: this.form.businessSystemCode,
              businessSystemEtldate: this.form.businessSystemEtldate,
              filePushPath: this.form.filePushPath,
              dataBackupPath: this.form.dataBackupPath,
              dataMoveDir: this.form.dataMoveDir,
            }
            update_data(params).then(res => {
              if (res.code == 0) {
                this.$message({
                  message: '编辑成功',
                  type: 'success',
                  showClose: true,
                })
                this.dialogVisible = false
                this.getList()
              } else {
                this.$message({
                  message: res.msg,
                  type: 'error',
                  showClose: true,
                })
              }
            })
          }

        } else {
          this.$message({
            message: '请填写信息',
            type: 'info',
            showClose: true,
          })
          return false
        }
      })
    },

    // 关闭弹窗
    handleClose (form) {
      this.$refs[form].resetFields() //清空添加的值
    },

    // edit () {

    // },

    // delete_data () {

    // },

    // 删除
    delete_table (businessSystemUuid) {
      let params = {
        businessSystemUuid: businessSystemUuid,
      }
      delete_data(params).then(res => {
        if (res.code == 0) {
          this.$message({
            message: '删除成功',
            type: 'success',
            showClose: true,
          })
          this.getList()
        } else {
          this.$message({
            message: res.msg,
            type: 'error',
            showClose: true,
          })
        }
      })
    },
  }

};
</script>

<style scoped >
@import url("./../../../assets/css/common.css");

/*.data_res >>> .el-form-item {*/
/*   margin-top: 25px !important;*/
/*   display: flex;*/
/* }*/
/*.data_res >>> .el-form-item--medium .el-form-item__label {*/
/*  text-align: right;*/
/*  float: left !important;*/
/*}*/
/*.data_res >>> .el-form-item__content {*/
/*  flex: 1;*/
/*  margin-left: 0 !important;*/
/*  ;*/
/*}*/
/*.data_res >>> .el-textarea .el-textarea__inner {*/
/*  resize: none;*/
/*}*/
.dialog >>> .el-dialog__body{
  padding: 5px 0 20px 20px !important;
}

.add-dialog {
  height: 70vh !important;
  overflow-y: auto;
}


.detail-form {
  padding: 5px 0 20px 20px !important;
}

  .detail-form >>> .el-textarea .el-textarea__inner{
    border: 1px solid #343942!important;
    resize: none;
    border-radius: 1px;
  }

.detail-form >>> .el-form-item__content {
  margin-left: 10px !important;
}

.dialog-footer{
  float: right;
  padding-right: 20px;
}
</style>
