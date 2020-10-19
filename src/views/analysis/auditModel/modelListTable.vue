<template>
  ·  <div class="list-container">
    <div class="filter-container">
      <QueryField ref="queryfield" :form-data="queryFields" @submit="getList" />
    </div>
<<<<<<< HEAD
    <div style="float: right;">
      <el-button type="primary" class="oper-btn show" @click="addModel" />
      <el-button type="primary" class="oper-btn add" @click="addModel" />
      <el-button type="primary" class="oper-btn edit" @click="updateModel" />
      <el-button type="primary" class="oper-btn delete" @click="deleteModel" />
      <el-dropdown placement="bottom" trigger="click" style="margin-left: 10px;">
        <el-button type="primary" class="oper-btn more" />
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="batch_remarks">导出</el-dropdown-item>
          <el-dropdown-item command="export_excel">导入</el-dropdown-item>
          <el-dropdown-item @click="batch_remarks">共享</el-dropdown-item>
          <el-dropdown-item command="batch_remarks">发布</el-dropdown-item>
          <el-dropdown-item command="batch_remarks">撤销发布</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-table :key="tableKey" ref="modelListTable" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;">
=======
    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;" @sort-change="sortChange" @selection-change="handleSelectionChange">
>>>>>>> dev-etl
      <el-table-column type="selection" width="55" />
      <el-table-column label="模型名称" width="100px" align="center" prop="modelName" />
      <el-table-column label="平均运行时间" width="150px" align="center" prop="runTime" />
      <el-table-column label="审计事项" prop="auditItemUuid" />
      <el-table-column label="风险等级" prop="riskLevelUuid" />
      <el-table-column label="模型类型" prop="modelType" :formatter="modelTypeFormatter" />
      <el-table-column label="创建时间" prop="createTime" :formatter="dateFormatter" />
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
<<<<<<< HEAD
    <el-dialog v-if="editModelShow" :visible.sync="editModelShow" :title="editModelTitle" width="100%">
      <EditModel ref="editModel" :open-value="selectTreeNode" :operation-obj="operationObj" @hideModal="hideEditModal" />
      <div slot="footer">
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="hideEditModal">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { findModel, saveModel, deleteModel, selectModel, updateModel } from '@/api/analysis/auditModel'
=======
  </div>
</template>
<script>
import { findModel } from '@/api/analysis/auditModel'
>>>>>>> dev-etl
import QueryField from '@/components/Ace/query-field/index'
import Pagination from '@/components/Pagination/index'
export default {
  name: 'ModelListTable',
  components: { Pagination, QueryField, EditModel },
  data() {
    return {
      tableKey: 'errorUuid',
      list: null,
      total: 0,
      listLoading: false,
<<<<<<< HEAD
      editModelTitle: '',
      editModelShow: false,
      dialogFormVisible: true,
      selectTreeNode: null,
      isUpdate: false,
=======
>>>>>>> dev-etl
      queryFields: [
        { label: '模型名称', name: 'modelName', type: 'fuzzyText', value: '' },
        { label: '审计事项', name: 'auditItem', type: 'fuzzyText' },
        { label: '风险等级', name: 'riskLevelUuid', type: 'fuzzyText' }
      ],
      operationObj: {},
      // selectedRowVal:0,
      tableOptions: {
        columnDefs: [
          {
            headerName: '',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width: 30,
            pinned: 'left',
            display: false
          },
          {
            field: 'errorUuid',
            hide: true
          },
          {
            headerName: '模型名称',
            field: 'modelName',
            pinned: 'left',
            filter: 'agTextColumnFilter'
          },
          {
            headerName: '平均运行时间',
            field: 'runTime',
            pinned: 'left'
          },
          {
            headerName: '审计事项',
            field: 'auditItemUuid',
            pinned: 'left'
          },
          {
            headerName: '风险等级',
            field: 'riskLevelUuid',
            filter: 'agNumberColumnFilter'
          },
          {
            headerName: '模型类型',
            field: 'modelType',
            filter: 'agNumberColumnFilter'
          }
        ]
      },
      formStyle: {
        width: '700px',
        height: '400px'
      },
      temp: {
        modelUuid: '',
        modelName: '',
        modelFolderUuid: '',
        auditItemUuid: '',
        riskLevelUuid: '',
        auditIdeas: '',
        paramConditions: '',
        sqlValue: '',
        modelType: ''
      },
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20
      }
    }
  },
  computed: {

  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter(row, column) {
      const datetime = row.createTime
      if (datetime) {
        var dateMat = new Date(datetime)
        var year = dateMat.getFullYear()
        var month = dateMat.getMonth() + 1
        var day = dateMat.getDate()
        var hh = dateMat.getHours()
        var mm = dateMat.getMinutes()
        var ss = dateMat.getSeconds()
        var timeFormat = year + '-' + month + '-' + day + ' ' + hh + ':' + mm + ':' + ss
        return timeFormat
      }
      return ''
    },

    /**
     * 格式化类型
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的字符串}
     */
    modelTypeFormatter(row, column) {
      const modelType = row.modelType
      if (modelType === '1') {
        return '审计模型'
      } else if (modelType === '2') {
        return '图形化模型'
      }
    },
    riskLevelFormatter(row, column) {
      var riskLevel = row.riskLevelUuid
      if (riskLevel === '1') {
        return '高'
      } else if (riskLevel === '2') {
        return '中'
      } else if (riskLevel === '3') {
        return '低'
      }
    },
    getList(query) {
      this.listLoading = true
      if (query) {
        this.pageQuery.condition = query
      }
      findModel(this.pageQuery).then(resp => {
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
    },
    handleSelectionChange(val) {
      this.selections = val
    },
<<<<<<< HEAD
    /**
     * 保存模型
     */
    save() {
      var modelObj = this.$refs.editModel.getModelObj()
      if (modelObj == null) {
        return
      }
      this.listLoading = true
      if (!this.isUpdate) {
        saveModel(modelObj).then(result => {
          if (result.code === 0) {
            this.getList(this.query)// 刷新列表
            this.$emit('refreshTree')
            this.listLoading = false
            this.editModelShow = false
            // this.$refs.editModel.clear();
          } else {
            this.$message({ type: 'error', message: '新增模型失败!' })
            this.listLoading = false
          }
        })
      } else {
        updateModel(modelObj).then(result => {
          if (result.code === 0) {
            this.getList(this.query)// 刷新列表
            this.$emit('refreshTree')
            this.listLoading = false
            this.editModelShow = false
            // this.$refs.editModel.clear();
          } else {
            this.$message({ type: 'error', message: '修改模型失败!' })
            this.listLoading = false
          }
        })
      }
=======
    handleFilter() {
      this.pageQuery.pageNo = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      this.pageQuery.sortBy = order
      this.pageQuery.sortName = prop
      this.handleFilter()
>>>>>>> dev-etl
    },
    resetQuery() {
      this.query = {
        condition: {
          opIp: '',
          moduleName: '',
          opOperate: '',
          opInfo: '',
          endTime: '',
          opTime: '',
          opUserName: ''
        }
      }
<<<<<<< HEAD
    },
    /**
     * 隐藏编辑模型界面
     */
    hideEditModal() {
      this.editModelShow = false
    },
    /**
     * 添加模型
     */
    addModel() {
      this.isUpdate = false
      if (this.selectTreeNode == null) {
        this.$message({ type: 'info', message: '请先选择模型分类!' })
      } else {
        var operationObj = { operationType: 1 }
        this.operationObj = operationObj
        this.editModelTitle = '添加模型'
        this.editModelShow = true
      }
    },
    updateModel() {
      this.isUpdate = true
      var selectObj = this.$refs.modelListTable.selection
      if (selectObj.length == 0) {
        this.$message({ type: 'info', message: '最少选择一个模型!' })
        return
      }
      if (selectObj.length > 1) {
        this.$message({ type: 'info', message: '只能选择一个模型!' })
        return
      }
      this.editModelTitle = '修改模型'
      selectModel(selectObj[0].modelUuid).then(result => {
        if (result.code == 0) {
          var operationObj = {
            operationType: 2,
            model: result.data
          }
          this.operationObj = operationObj
          this.editModelShow = true
          this.getList(this.query)
          this.$emit('refreshTree')
        } else {
          this.$message({ type: 'error', message: '删除失败' })
        }
      })
    },
    /**
     * 删除模型
     */
    deleteModel() {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var selectObj = this.$refs.modelListTable.selection
        if (selectObj == undefined || selectObj.length === 0) {
          this.$message({ type: 'info', message: '请先选择要删除的模型!' })
          return
        }
        deleteModel(selectObj).then(result => {
          if (result.code == 0) {
            this.getList(this.query)
            this.$emit('refreshTree')
          } else {
            this.$message({ type: 'error', message: '删除失败' })
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    batch_remarks() {

=======
>>>>>>> dev-etl
    }
  }
}
</script>
