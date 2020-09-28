<template>
  <div class="app-container">
    <div class="filter-container">
      <QueryField ref="queryfield" :form-data="queryFields" @submit="getList" />
    </div>
    <div style="float: right;">
      <el-button type="primary" icon="el-icon-zoom-in" @click="">预览</el-button>
      <el-button type="primary" icon="el-icon-add-location" @click="addModel">新增</el-button>
      <el-button type="primary" icon="el-icon-edit" @click="updateModel">修改</el-button>
      <el-button type="primary" icon="el-icon-delete" @click="deleteModel">删除</el-button>
      <el-dropdown placement="bottom" trigger="click" style="margin-left: 10px;" @command="">
        <el-button type="primary">其他操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
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
      <el-table-column type="selection" width="55" />
      <el-table-column label="模型名称" width="100px" align="center" prop="modelName" />
      <el-table-column label="平均运行时间" width="150px" align="center" prop="runTime" />
      <el-table-column label="审计事项" prop="auditItemName" />
      <el-table-column label="风险等级" prop="riskLevelUuid" :formatter="riskLevelFormatter" />
      <el-table-column label="模型类型" prop="modelType" :formatter="modelTypeFormatter" />
      <el-table-column label="创建时间" prop="createTime" :formatter="dateFormatter" />
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
    <el-dialog :visible.sync="editModelShow" :title="editModelTitle">
      <EditModel ref="editModel" :open-value="selectTreeNode" @hideModal="hideEditModal" />
      <div slot="footer">
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="hideEditModal">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { findModel, saveModel, deleteModel } from '@/api/analysis/auditModel'
import QueryField from '@/components/Ace/query-field/index'
import Pagination from '@/components/Pagination/index'
import EditModel from '@/views/analysis/auditModel/editModel'
export default {
  name: 'ModelListTable',
<<<<<<< HEAD
  components: { Pagination, QueryField },
=======
  components: { Pagination, QueryField, EditModel },
>>>>>>> 9d1175af27a6fa7e17abfee65afe3f428e704343
  data() {
    return {
      tableKey: 'errorUuid',
      list: null,
      total: 0,
      listLoading: false,
      editModelTitle: '添加模型',
      editModelShow: false,
      dialogFormVisible: true,
      selectTreeNode: null,
      queryFields: [
        { label: '模型名称', name: 'modelName', type: 'fuzzyText', value: '' },
        { label: '审计事项', name: 'auditItemName', type: 'fuzzyText' },
        { label: '风险等级', name: 'riskLevelUuid', type: 'select',
          data: [{ name: '请选择', value: '-1' }, { name: '高', value: '1' }, { name: '中', value: '2' }, { name: '低', value: '3' }],
          default: '-1' }
      ],
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
    /**
     * 格式化时间字符串
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的时间字符串}
     */
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
<<<<<<< HEAD
=======
    /**
     * 格式化类型
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的字符串}
     */
>>>>>>> 9d1175af27a6fa7e17abfee65afe3f428e704343
    modelTypeFormatter(row, column) {
      const modelType = row.modelType
      if (modelType == 1) {
        return '审计模型'
      } else if (modelType == 2) {
        return '图形化模型'
<<<<<<< HEAD
=======
      }
    },
    riskLevelFormatter(row, column) {
      var riskLevel = row.riskLevelUuid
      if (riskLevel == 1) {
        return '高'
      } else if (riskLevel == 2) {
        return '中'
      } else if (riskLevel == 3) {
        return '低'
>>>>>>> 9d1175af27a6fa7e17abfee65afe3f428e704343
      }
    },
    /**
     * 获取模型列表
     * @param query 查询条件
     */
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
    /**
     * 设置选中的树节点
     * @param data 树节点
     */
    setSelectTreeNode(data) {
      this.selectTreeNode = data
    },
    /**
     * 保存模型
     */
    save() {
      var modelObj = this.$refs.editModel.getModelObj()
      if (modelObj == null || modelObj == false) {

      }
      return
      this.editModelShow = false
      this.listLoading = true
      saveModel(modelObj).then(result => {
        if (result.code == 0) {
          this.getList(this.query)// 刷新列表
          this.$emit('refreshTree')
          this.listLoading = false
          this.$refs.editModel.clear()
        } else {
          this.$message({ type: 'error', message: '新增模型失败!' })
          this.listLoading = false
        }
      })
    },
    /**
     * 重置查询
     */
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
      if (this.selectTreeNode == null) {
        this.$message({ type: 'info', message: '请先选择模型分类!' })
      } else {
        this.editModelShow = true
        // this.$refs.editModel.setSelectTreeNode(this.selectTreeNode);
      }
    },
    updateModel() {

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
        if (selectObj == undefined || selectObj.length == 0) {
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
      debugger
      alert('这是共享')
    }
  }
}
</script>
