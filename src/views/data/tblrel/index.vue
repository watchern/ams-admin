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
      <el-table-column label="表名称" prop="tbName" />
      <el-table-column label="字段名称" prop="colName" />
      <el-table-column label="从表名称" prop="relationTableName" />
      <el-table-column label="从表字段" prop="relationCol" />
      <el-table-column label="关联关系" align="center" prop="sqlGenJoinType" :formatter="formatSqlGenJoinType" />
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <template class="detail-form">
        <el-form
          ref="dataForm"
          :rules="rules"
          :model="temp"
          label-position="right"
          width="80%"
        >
          <el-form-item prop="tableMetaUuid" label="选择主表">
            <el-input v-model="temp.tbName" :disabled="true" />
            <el-input v-model="temp.tableMetaUuid" :disabled="true" style="display: none" />
          </el-form-item>
          <el-form-item prop="colMetaUuid" label="列名称">
            <el-row>
              <el-col :span="6">
                <el-input v-model="temp.colMetaUuid" :disabled="true" />
                <el-input v-model="temp.colMetaName" :disabled="true" style="display: none" />
              </el-col>
              <el-col :span="6">
                <el-button @click="showDataTree(1)">选择</el-button>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item prop="relTableMeataUuid" label="被关联表">
            <el-input v-model="temp.relationTableName" :disabled="true" />
            <el-input v-model="temp.relTableMetaUuid" :disabled="true" style="display: none" />
          </el-form-item>
          <el-form-item prop="relColMetaUuid" label="关联字段">
            <el-row>
              <el-col :span="16">
                <el-input v-model="temp.relationCol" :disabled="true" />
                <el-input v-model="temp.relColMetaUuid" style="display:none" hidden :disabled="true" />
              </el-col>
              <el-col :span="6">
                <el-button @click="showDataTree(2)">选择</el-button>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item prop="sqlGenJoinType" label="关联关系">
            <el-select v-model="temp.sqlGenJoinType" filterable placeholder="请选择关联关系">
              <el-option
                v-for="item in sqlJoinCols"
                :key="item.sqlGenJoinType"
                :label="item.sqlGenJoinName"
                :value="item.sqlGenJoinType"
                :disabled="item.disabled"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </template>
      <div slot="footer">
        <el-button size="mini" @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">保存</el-button>
      </div>
      <el-dialog v-if="dataTableTree" :destroy-on-close="true" :append-to-body="true" :visible.sync="dataTableTree" title="请选择数据表" width="80%">
        <data-tree ref="dataTableTree" :data-user-id="dataUserId" :scene-code="sceneCode" />
        <div slot="footer">
          <el-button tvype="primary" @click="getDataTable">确定</el-button>
          <el-button @click="dataTableTree = false">取消</el-button>
        </div>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
import dataTree from '@/views/data/role-res/data-tree'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { getTableByCol } from '@/api/data/table-info'
import { listByPage, save, update, del } from '@/api/data/tablerelation'
import QueryField from '@/components/Ace/query-field/index'

export default {
  components: { Pagination, QueryField, dataTree },
  data() {
    return {
      tableKey: 'tableRelationUuid',
      list: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '表名称', name: 'tbName', type: 'text' }
      ],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      temp: {
        tableMetaUuid: '',
        tbName: '',
        tableRelationUuid: '',
        selectType: 1,
        sqlGenJoinType: '',
        relColMetaUuid: ''
      },
      sceneCode: 'auditor',
      dataUserId: this.$store.getters.personcode,
      selections: [],
      dataTableTree: false,
      dialogFormVisible: false,
      dialogStatus: '',
      tableObj: {},
      tableRelObj: {},
      textMap: {
        update: '修改业务属性',
        create: '新增业务属性'
      },
      sqlJoinCols: [{
        sqlGenJoinName: 'left join',
        sqlGenJoinType: 1
      },
      {
        sqlGenJoinName: 'right join',
        sqlGenJoinType: 2
      },
      {
        sqlGenJoinName: 'full join',
        sqlGenJoinType: 3
      },
      {
        sqlGenJoinName: 'inner join',
        sqlGenJoinType: 4
      }
      ],
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
    showDataTree(val) {
      this.selectType = val
      this.dataTableTree = true
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
        tableMetaUuid: '',
        tbName: '',
        tableRelationUuid: '',
        sqlGenJoinType: '',
        relColMetaUuid: '',
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
        console.log(this.temp)
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
            const index = this.list.findIndex(v => v.tableRelationUuid === this.temp.tableRelationUuid)
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
      this.selections.forEach((r, i) => { ids.push(r.tableRelationUuid) })
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
    formatSqlGenJoinType(row, column) {
      if (row.sqlGenJoinType === 1) {
        return 'left join'
      } else if (row.SqlGenJoinType === 2) {
        return 'right join'
      } else if (row.SqlGenJoinType === 3) {
        return 'full join'
      } else if (row.SqlGenJoinType === 4) {
        return 'inner join'
      }
    },
    getDataTable() {
      const dataTree = this.$refs.dataTableTree.getTree()
      const currentNode = dataTree.getCurrentNode()
      if (currentNode.type !== 'col') {
        this.$message({ type: 'info', message: '请选择数据表列!' })
        return
      }
      this.loadTable(currentNode.id)
      if (this.selectType === 1) {
        this.temp.colName = currentNode.label
        this.temp.colMetaUuid = currentNode.id
        getTableByCol(currentNode.id).then(resp => {
          this.colsList = resp.data.colMetas
        })
      } else {
        this.temp.relationTableName = currentNode.label
        this.temp.relTableMetaUuid = currentNode.id
        getTableByCol(currentNode.id).then(resp => {
          this.colsRelList = resp.data.colMetas
        })
      }
      this.dataTableTree = false
    },
    loadTable(id) {
      // 获取选中列的表id，表名称信息
      getTableByCol(id).then(result => {
        if (result.data == null) {
          this.$message({ type: 'info', message: '加载数据表列失败!' })
          return
        }
        if (this.selectType === 1) {
          this.tableObj = result.data
        } else {
          this.tableRelObj = result.data
        }
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
