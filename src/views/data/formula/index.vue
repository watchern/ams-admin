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
        <el-button type="primary" class="oper-btn buildsql btn-width-max" @click="buildModelSQL" />
        <el-button type="primary" class="oper-btn exportsql btn-width-max" @click="exportSQL" />
        <el-button type="primary" class="oper-btn add" @click="add" />
        <el-button type="primary" class="oper-btn edit" :disabled="selections.length !== 1" @click="update" />
        <el-button type="primary" class="oper-btn delete" :disabled="selections.length === 0" @click="deleteBiz" />
      </el-col>
    </el-row>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="指标模块" width="150px" align="center" prop="indexModule" />
      <el-table-column label="指标名称" width="150px" align="center" prop="indexName" />
      <el-table-column label="公式内容" width="500px" align="center" prop="formulaContent" />
      <el-table-column label="创建人名称" width="300px" align="center" prop="createPersonName" />
      <el-table-column label="创建时间" width="300px" align="center" prop="createTime" />
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
      <template class="detail-form">
        <el-form
          ref="dataForm"
          :rules="rules"
          :model="temp"
          label-position="right"
          width="80%"
          :close-on-click-modal="false"
        >
          <el-form-item label="指标模块" prop="indexModule">
            <el-select v-model="temp.indexModule" value="">
              <el-option value="营运能力" />
              <el-option value="盈利能力" />
              <el-option value="偿债能力" />
            </el-select>
          </el-form-item>
          <el-form-item label="指标名称" prop="indexName">
            <el-input v-model="temp.indexName" />
          </el-form-item>
          <el-form-item label="公式内容" prop="formulaContent">
            <el-input
              v-model="temp.formulaContent"
              type="textarea"
              placeholder="示例： [现金流量表.营业收入]/[现金流量表.平均总资产]+30  科目名称请查询作业平台的 “基础数据” "
            />
          </el-form-item>
          <el-form-item label="公式说明" prop="formulaComment">
            <el-input v-model="temp.formulaComment" type="textarea" />
          </el-form-item>
        </el-form>
      </template>
      <div slot="footer">
        <el-button size="mini" @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listByPage, save, update, del, wideTableSQL, generateIndexSQL } from '@/api/data/formula'
import QueryField from '@/components/public/query-field/index'

export default {
  components: { Pagination, QueryField },
  data() {
    return {
      tableKey: 'formulaId',
      list: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '指标模块', name: 'indexModule', type: 'fuzzyText' },
        { label: '指标名称', name: 'indexName', type: 'fuzzyText', value: '' }
      ],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      temp: {
        formulaId: undefined,
        indexModule: '',
        indexName: '',
        formulaContent: '',
        formulaComment: ''
      },
      selections: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改',
        create: '新增'
      },
      dialogPvVisible: false,
      rules: {
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
    sortChange(data) {
      const { prop, order } = data
      this.pageQuery.sortBy = order
      this.pageQuery.sortName = prop
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        formulaId: undefined,
        indexModule: '',
        indexName: '',
        formulaContent: '',
        formulaComment: ''
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
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          save(this.temp).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          })
        }
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
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          update(tempData).then(() => {
            const index = this.list.findIndex(v => v.formulaId === this.temp.formulaId)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          })
        }
      })
    },
    deleteBiz() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.formulaId) })
      del(ids.join(',')).then(() => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    handleSelectionChange(val) {
      this.selections = val
    },
    getSortClass: function(key) {
      const sort = this.pageQuery.sort
      return sort === `+${key}` ? 'asc' : 'desc'
    },
    exportSQL() {
      wideTableSQL().then(resp => {
        console.log(resp.data)
      })
    },
    buildModelSQL() {
      generateIndexSQL().then(resp => {
        this.$notify({
          title: '成功',
          message: '模型编译成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    }
  }
}
</script>
