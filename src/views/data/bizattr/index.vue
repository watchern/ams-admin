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
        <el-button type="primary" title="新增" class="oper-btn add" @click="add" />
        <el-button type="primary" title="修改" class="oper-btn edit" :disabled="selections.length !== 1" @click="update" />
        <el-button type="primary" title="删除" class="oper-btn delete" :disabled="selections.length === 0" @click="deleteBiz" />
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
      <el-table-column label="业务属性名称" width="300px" align="center" prop="attrName" />
      <el-table-column label="业务属性编码" width="300px" align="center" prop="attrCode" />
      <el-table-column label="创建时间" width="300px" align="center" prop="createTime" />
      <el-table-column label="描述" prop="describtion" />
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <template >
        <div class="detail-form">
          <el-form
            ref="dataForm"
            :rules="rules"
            :model="temp"
            label-position="right"
            width="80%"
          >
            <el-form-item label="业务属性名称" prop="attrName">
              <el-input v-model="temp.attrName" />
            </el-form-item>
            <el-form-item label="业务属性编码" prop="attrCode">
              <el-input v-model="temp.attrCode" />
            </el-form-item>
            <el-form-item label="描述" prop="describtion">
              <el-input v-model="temp.describtion" type="textarea" />
            </el-form-item>
          </el-form>
        </div>
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
import { listByPage, save, update, del } from '@/api/data/biz-attr'
import QueryField from '@/components/Ace/query-field/index'

export default {
  components: { Pagination, QueryField },
  data() {
    return {
      tableKey: 'bizAttrUuid',
      list: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '业务属性编码', name: 'attrCode', type: 'text', value: '' },
        { label: '业务属性名称', name: 'attrName', type: 'fuzzyText' },
        // {label: '性别', name:'sex', type: 'select',
        //   data: [{name: '男', value: '1'}, {name: '女', value: '0'}],
        //   default: '1'},
        { label: '创建时间', name: 'createTime', type: 'timePeriod' }
      ],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      temp: {
        bizAttrUuid: undefined,
        attrName: '',
        attrCode: '',
        describtion: ''
      },
      selections: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改业务属性',
        create: '新增业务属性'
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
    sortChange(data) {
      const { prop, order } = data
      this.pageQuery.sortBy = order
      this.pageQuery.sortName = prop
      this.handleFilter()
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
            const index = this.list.findIndex(v => v.bizAttrUuid === this.temp.bizAttrUuid)
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
      this.selections.forEach((r, i) => { ids.push(r.bizAttrUuid) })
      this.$confirm('确定删除图形?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
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
