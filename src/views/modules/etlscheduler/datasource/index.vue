<template>
  <div class="app-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getList"
      />
    </div>
    <div>
      <!-- <m-list-construction>
        <template slot="conditions">
          <m-conditions>
            <template slot="button-group">
              <x-button
                type="primary"
                size="mini"
                @click="_create('')"
              >添加</x-button>
            </template>
          </m-conditions>
        </template>
      </m-list-construction> -->
      <el-button
        type="primary"
        size="mini"
        @click="hadleCreate"
      >添加</el-button>
      <el-button
        type="primary"
        size="mini"
        :disabled="selections.length !== 1"
        @click="_edit"
      >修改</el-button>
      <el-button
        type="danger"
        size="mini"
        :disabled="selections.length === 0"
        @click="handleDelete()"
      >删除</el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      stripe
      fit
      style="width: 100%;"
      :data="list"
      border
      highlight-current-row
      max-height="800"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
      @on-update="_onUpdate"
    >
      <el-table-column
        type="selection"
        align="center"
      />
      <el-table-column
        label="数据源名称"
        width="250px"
        align="center"
        prop="name"
      />
      <el-table-column
        label="数据源类型"
        width="250px"
        align="center"
        prop="type"
        :formatter="formatType"
      />
      <el-table-column
        label="数据源参数"
        width="200px"
        align="center"
        prop="connectionParams"
      >
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <p>{{ scope.row.connectionParams }}</p>
            <div slot="reference" class="name-wrapper">
              <el-tag><i class="el-icon-tickets" /></el-tag>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        label="描述"
        width="200px"
        align="center"
        prop="note"
      />
      <el-table-column
        label="创建时间"
        width="250px"
        align="center"
        prop="createTime"
      />
      <el-table-column
        label="修改时间"
        align="center"
        width="250px"
        prop="updateTime"
      />
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="pageQuery.pageNo"
      :limit.sync="pageQuery.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { pageList, save, update, deleteByIds } from '@/api/etlscheduler/datasource'
import QueryField from '@/components/Ace/query-field/index'

import { mapActions } from 'vuex'
import mCreateDataSource from './pages/list/_source/createDataSource'
import listUrlParamHandle from '@/components/Dolphin/mixin/listUrlParamHandle'

export default {
  name: 'DatasourceIndexP',
  components: { Pagination, QueryField },
  mixins: [listUrlParamHandle],
  props: {},
  data() {
    return {
      tableKey: 'datasourceUuid',
      list: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '数据源名称', name: 'name', type: 'text', value: '' },
        { label: '数据源类型', name: 'type', type: 'select',
          data: [{ name: 'mysql', value: '0' }, { name: 'postgresql', value: '1' },
            { name: 'hive', value: '2' }, { name: 'spark', value: '3' },
            { name: 'clickhouse', value: '4' }, { name: 'oracle', value: '5' },
            { name: 'SQLServer', value: '6' }, { name: 'db2', value: '7' }]
        },
        // { label: '登录方式', name: 'loginTyp', type: 'select',
        //   data: [{ name: '用户名密码', value: '1' }, { name: 'kerbors认证', value: '2' }]
        // },
        // {
        //   label: '参数状态', name: 'status', type: 'select',
        //   data: [{ name: '启用', value: '1' }, { name: '停用', value: '0' }],
        //   default: '1'
        // },
        { label: '模糊查询', name: 'keyword', type: 'fuzzyText' }
      ],
      // 格式化参数列表
      formatMap: {
        type: {
          0: 'MYSQL',
          1: 'POSTGRESQL',
          2: 'HIVE/IMPALA',
          3: 'SPARK',
          4: 'CLICKHOUSE',
          5: 'ORACLE',
          6: 'SQLSERVER',
          7: 'DB2',
          null: '其它'
        }
      },
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      temp: {
        name: null,
        type: null,
        connectionParams: null,
        note: null,
        createTime: null,
        updateTime: null
      },
      selections: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改数据源',
        create: '添加数据源'
      },
      dialogPvVisible: false,
      rules: {
        status: [{ required: true, message: '请选择参数状态', trigger: 'change' }]
      },
      downloadLoading: false
      // ,
    //   // is Loading
    //   isLoading: true,
    //   // data sources(List)
    //   datasourcesList: [],
    //   searchParams: {
    //     // Number of pages per page
    //     pageSize: 10,
    //     // Number of pages
    //     pageNo: 1,
    //     // Search value
    //     searchVal: ''
    //   }
    }
  },
  watch: {
  },
  created() {
    this.getList()
  },
  methods: {
    ...mapActions('datasource', ['getDatasourcesListP']),
    getList(query) {
      this.listLoading = true
      if (query) this.pageQuery.condition = query
      pageList(this.pageQuery).then(resp => {
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
    },
    handleFilter() {
      this.pageQuery.pageNo = 1
      this.getList()
    },
    hadleCreate() {
      this._create()
    },
    sortChange(data) {
      const { prop, order } = data
      this.pageQuery.sortBy = order
      this.pageQuery.sortName = prop
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        name: null,
        type: null,
        connectionParams: null,
        note: null,
        createTime: null,
        updateTime: null
      }
    },
    handleCreate() {
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
    handleUpdate() {
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
            const index = this.list.findIndex(v => v.paramUuid === this.temp.paramUuid)
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
    handleDelete() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.datasourceUuid) })
      deleteByIds(ids.join(',')).then(() => {
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
    // 格式化表格
    formatType(data) {
      return this.formatMap.type[data.type]
    },
    // 添加事件
    _create(item) {
      const self = this
      const modal = this.$modal.dialog({
        closable: false,
        showMask: true,
        escClose: true,
        className: 'v-modal-custom',
        transitionName: 'opacityp',
        render(h) {
          return h(mCreateDataSource, {
            on: {
              onUpdate() {
                self._debounceGET('false')
                modal.remove()
              },
              close() {
                modal.remove()
              }
            },
            props: {
              item: item
            }
          })
        }
      })
    },
    _edit() {
      const item = Object.assign({}, this.selections[0])
      // findComponentDownward(this.$root, 'datasource-indexP')
      this._create(item)
    },
    _onUpdate() {
      this._debounceGET('false')
    }
    /**
     * get data(List)
     */
    // _getList (flag) {
    //   this.isLoading = !flag
    //   this.getDatasourcesListP(this.searchParams).then(res => {
    //     if (this.searchParams.pageNo > 1 && res.totalList.length == 0) {
    //       this.searchParams.pageNo = this.searchParams.pageNo - 1
    //     } else {
    //       this.datasourcesList = []
    //       this.datasourcesList = res.totalList
    //       this.total = res.total
    //       this.isLoading = false
    //     }
    //   }).catch(e => {
    //     this.isLoading = false
    //   })
    // }
  }
}
</script>
<style scoped>
  .el-tag {
	background-color: transparent;
	border-color: transparent;
	color: #409eff;
  font-size: 22px;
  cursor: pointer;
  }
</style>
