<template>
  <div class="app-container">
    <div class="filter-container">
      <QueryField ref="queryfield" :form-data="queryFields" @submit="getList" />
    </div>
    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;" @sort-change="sortChange" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="模型名称" width="100px" align="center" prop="modelName" />
      <el-table-column label="平均运行时间" width="150px" align="center" prop="runTime" />
      <el-table-column label="审计事项" prop="auditItemUuid" />
      <el-table-column label="风险等级" prop="riskLevelUuid" />
      <el-table-column label="模型类型" prop="modelType" :formatter="modelTypeFormatter" />
      <el-table-column label="创建时间" prop="createTime" :formatter="dateFormatter" />
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
  </div>
</template>
<script>
import { findModel } from '@/api/analysis/auditModel'
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
      queryFields: [
        { label: '模型名称', name: 'modelName', type: 'fuzzyText', value: '' },
        { label: '审计事项', name: 'auditItem', type: 'fuzzyText' },
        { label: '风险等级', name: 'riskLevelUuid', type: 'fuzzyText' }
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
      if (modelType == 1) {
        return '审计模型'
      } else if (modelType == 2) {
        return '图形化模型'
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
    handleFilter() {
      this.pageQuery.pageNo = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      this.pageQuery.sortBy = order
      this.pageQuery.sortName = prop
      this.handleFilter()
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
    }
  }
}
</script>
