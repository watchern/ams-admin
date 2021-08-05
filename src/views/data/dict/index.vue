<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getList"
      />
    </div>
    <el-row>
      <el-col align="right">
        <el-button type="primary" class="oper-btn export-5 btn-width-md" @click="exportFile" />
        <el-button type="primary" class="oper-btn import-2" @click="importFile" />
      </el-col>
    </el-row>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;height:calc(100% - 140px);overflow: auto;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="所属系统名称" width="300px" align="center" prop="folderName" />
      <el-table-column label="数据表名称" width="300px" prop="displayTbName" />
      <el-table-column label="汉化表名称" width="300px" prop="chnName" />
      <el-table-column label="创建时间" width="300px" align="center" :formatter="formatCreateTime" prop="createTime" />
      <el-table-column label="操作" align="center" min-width="100">
        <template slot-scope="scope">
          <el-button type="primary" class="oper-btn detail" title="预览" size="mini" @click="selectFilterOne(scope.row.tableMetaUuid)" />
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
    <!-- 弹窗1 预览数据-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisibleTable" :close-on-click-modal="false">
      <template>
        <div class="detail-form" style="height:62vh; overflow:auto;">
          <el-form
            ref="dataForm"
            :rules="rules"
            :model="tempObj"
            label-position="right"
            width="80%"
          >
            <el-form-item label="所属系统名称" prop="folderName">
              <el-input v-model="tempObj.folderName" disabled />
            </el-form-item>
            <el-form-item label="数据表名称" prop="displayTbName">
              <el-input v-model="tempObj.displayTbName" disabled />
            </el-form-item>
            <el-form-item label="汉化表名称" prop="chnName">
              <el-input v-model="tempObj.chnName" disabled />
            </el-form-item>
          </el-form>
          <el-table
            :key="colKey"
            :data="tempObj.colMetas"
            border
            fit
            highlight-current-row
            style="width: 100%;overflow: auto;"
          >
            <el-table-column label="字段名称" width="250px" prop="colName" />
            <el-table-column label="字段汉化名称" width="250px" prop="chnName" />
            <el-table-column label="字段类型" width="150px" align="center" prop="dataType" />
            <el-table-column label="字段长度" width="150px" align="center" prop="dataLength" />
          </el-table>
        </div>
      </template>
      <div slot="footer">
        <el-button type="primary" size="mini" @click="dialogFormVisibleTable = false">关闭</el-button>
      </div>
    </el-dialog>
    <!-- 弹窗2 导入数据-->
    <el-dialog v-if="importVisible" :title="textMap[dialogStatus]" :visible.sync="importVisible" :close-on-click-modal="false" width="800px">
      <el-row>
        <el-col>
          <directory-file-import @fileuploadname="fileuploadname" />
        </el-col>
      </el-row>
      <span slot="footer">
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" @click="importTable">导入</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import directoryFileImport from '@/views/data/tableupload'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listByPage, selectOne, importTable } from '@/api/data/dict'
import axios from 'axios'
import QueryField from '@/components/public/query-field/index'
import qs from 'qs'

export default {
  components: { Pagination, QueryField, directoryFileImport },
  data() {
    return {
      tableKey: 'tableMetaUuid',
      colKey: 'colMetaUuid',
      list: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '数据表名称', name: 'displayTbName', type: 'text', value: '' },
        { label: '汉化表名称', name: 'chnName', type: 'text', value: '' }
      ],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      tempObj: {
        tableMetaUuid: '',
        folderName: '',
        displayTbName: '',
        chnName: '',
        createTime: '',
        colMetas: []
      },
      selections: [],
      dialogFormVisibleTable: false,
      importVisible: false,
      dialogStatus: '',
      importtemp: {},
      textMap: {
        preview: '查看数据表字典',
        import: '导入数据表字典'
      },
      dialogPvVisible: false,
      rules: {
        attrName: [{ required: true, message: '请填写业务属性名称', trigger: 'change' }],
        attrCode: [{ required: true, message: '请填写业务属性编码', trigger: 'change' }],
        describtion: [{ max: 100, message: '长度不得超过100', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList(query) {
      this.listLoading = true
      if (query) this.pageQuery.condition = query
      listByPage(this.pageQuery).then(resp => {
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
    },
    handleFilter() {
      this.pageQuery.pageNo = 1
      this.getList()
    },
    selectFilterOne(tableMetaUuid) {
      this.listLoading = true
      this.dialogStatus = 'preview'
      var objArr = this.list.filter(obj => { return obj.tableMetaUuid === tableMetaUuid })
      this.tempObj = objArr[0]
      selectOne(tableMetaUuid).then(resp => {
        console.log(resp)
        this.tempObj.colMetas = resp.data.colMetas
        this.dialogFormVisibleTable = true
        this.listLoading = false
      })
    },
    formatCreateTime(row, column) {
      // 拼接日期规格为YYYY-MM-DD hh:mm:ss
      var createTime = new Date(row.createTime)
      var createTimeRow = createTime.getFullYear() + '-' + (createTime.getMonth() + 1) + '-' + createTime.getDate() + ' ' + createTime.getHours() + ':' + createTime.getMinutes() + ':' + createTime.getSeconds()
      return createTimeRow
    },
    sortChange(data) {
      const { prop, order } = data
      this.pageQuery.sortBy = order
      this.pageQuery.sortName = prop
      this.handleFilter()
    },
    // 导出表信息作为模板
    exportFile() {
      if (this.selections.length === 0) {
        this.$message({ type: 'info', message: '无选择表,失败!' })
      } else {
        axios.post(`/data/tableMeta/exportFile`, qs.stringify({ tableMetasJson: JSON.stringify(this.selections) }),
          { responseType: 'blob', headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // 请求的数据类型为form data格式
          }}
        ).then(res => {
          const filename = decodeURI(
            res.headers['content-disposition'].split(';')[1].split('=')[1]
          )
          const blob = new Blob([res.data], {
            type: 'application/octet-stream'
          })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.setAttribute('download', filename)
          document.body.appendChild(link)
          link.click()
        })
      }
    },
    fileuploadname(data) {
      this.importtemp.tableFileName = data
    },
    importFile() {
      this.dialogStatus = 'import'
      this.importVisible = true
    },
    importTable() {
      importTable(this.importtemp).then(res => {
        if (res.data.code === '200') {
          this.importVisible = false
          this.$notify({
            title: '成功',
            message: res.data.msg,
            type: 'success',
            duration: 5000,
            position: 'bottom-right'
          })
          this.getList()
        } else {
          this.$message({
            type: 'error',
            message: res.data.msg
          })
        }
      })
    },
    resetTemp() {
      this.temp = {
        bizAttrUuid: undefined,
        attrName: '',
        attrCode: '',
        describtion: ''
      }
    },
    add() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    update() {
      this.temp = Object.assign({}, this.selections[0]) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleSelectionChange(val) {
      this.selections = val
    },
    getSortClass: function(key) {
      const sort = this.pageQuery.sort
      return sort === `+${key}` ? 'asc' : 'desc'
    }
  }
}
</script>
