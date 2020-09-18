<template>
  <div class="app-container">
    <!-- 关键词搜索 -->
    <div
      id="searchAll"
      class="filter-container"
    >
      <el-input
        v-model="datasource.keyWord"
        :placeholder="$t('etlscheduler_table.key') "
        style="width: 500px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <span
        id="search-down"
        @click="showup"
      ><i class="el-icon-caret-bottom myicon" /></span>
      <el-button
        v-waves
        class="filter-item search-all"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        {{ $t('table.search') }}
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        {{ $t('table.add') }}
      </el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >
        {{ $t('table.export') }}
      </el-button>
    </div>
    <!-- 条件模糊搜索 -->
    <div
      id="searchSwitch"
      class="filter-container"
    >
      <el-input
        v-model="datasource.dsName"
        :placeholder="$t('etlscheduler_table.dsName') "
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="datasource.dsStatus"
        :placeholder="$t('etlscheduler_table.dsStatus') "
        clearable
        style="width: 200px"
        class="filter-item"
      >
        <!--label是显示的值，value是传递的值  -->
        <el-option
          v-for="item in importanceOptions"
          :key="item"
          :label="item.value"
          :value="item.id"
        />
      </el-select>
      <span
        id="search-up"
        @click="showdown"
      ><i class="el-icon-caret-top myicon" /></span>
      <el-button
        v-waves
        class="filter-item search"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        {{ $t('table.search') }}
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        {{ $t('table.add') }}
      </el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >
        {{ $t('table.export') }}
      </el-button>
    </div>
    <!-- 数据表格 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        prop="dsName"
        :label="$t('etlscheduler_table.dsName')"
        width="150"
        sortable
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.dsName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="dsType"
        :label="$t('etlscheduler_table.dsType')"
        width="150"
        :formatter="dataFormatType"
        sortable
      >
        <template slot-scope="{row}">
          <span>{{ dataFormatType(row.dsType) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="jdbcUrl"
        :label="$t('etlscheduler_table.jdbcUrl')"
        width="150"
        sortable
      >
        <template slot-scope="{row}">
          <span>{{ row.jdbcUrl }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="driverClass"
        :label="$t('etlscheduler_table.driverClass')"
        width="150"
        sortable
      >
        <template slot-scope="{row}">
          <span>{{ row.driverClass }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="loginType"
        :label="$t('etlscheduler_table.loginType')"
        width="150"
        :formatter="dataFormatLoginType"
        sortable
      >
        <template slot-scope="{row}">
          <span>{{ dataFormatLoginType(row.loginType) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="authFilePath"
        :label="$t('etlscheduler_table.authFilePath')"
        width="150"
        sortable
      >
        <template slot-scope="{row}">
          <span>{{ row.authFilePath }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="loginName"
        :label="$t('etlscheduler_table.loginName')"
        width="150"
        sortable
      >
        <template slot-scope="{row}">
          <span>{{ row.loginName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="dsStatus"
        :label="$t('etlscheduler_table.dsStatus')"
        width="150"
        :formatter="dataFormatStatus"
        sortable
      >
        <template slot-scope="{row}">
          <span>{{ dataFormatStatus(row.dsStatus) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="updateTime"
        :label="$t('etlscheduler_table.updateTime')"
        width="240"
        :formatter="dataFormatTime"
        sortable
      >
        <template slot-scope="{row}">
          <span>{{ dataFormatTime(row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.actions')"
        align="center"
        width="280"
        class-name="small-padding fixed-width"
        fixed="right"
      >
        <template slot-scope="{row,$index}">
          <el-button
            type="primary"
            size="mini"
            @click="handleUpdate(row)"
          >
            {{ $t('table.edit') }}
          </el-button>
          <el-button
            v-if="row.status!='published'"
            size="mini"
            type="success"
            @click="handleModifyStatus(row)"
          >测试连接
          </el-button>
          <el-button
            v-if="row.status!='deleted'"
            size="mini"
            type="danger"
            @click="handleDelete(row,$index)"
          >
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
    <!-- 添加、修改使用的表单 -->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="datasource"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item
          :label="$t('etlscheduler_table.dsName')"
          prop="dsName"
        >
          <el-input v-model="adddatasource.dsName" />
        </el-form-item>
        <el-form-item
          :label="$t('etlscheduler_table.jdbcUrl')"
          prop="jdbcUrl"
        >
          <el-input v-model="adddatasource.jdbcUrl" />
        </el-form-item>
        <el-form-item
          :label="$t('etlscheduler_table.dsType')"
          prop="dsType"
        >
          <el-select
            v-model="adddatasource.dsType"
            :placeholder="$t('etlscheduler_table.switchDsType')"
          >
            <el-option
              :label="$t('etlscheduler_table.dsTypeOne')"
              :value="1"
            />
            <el-option
              :label="$t('etlscheduler_table.dsTypeTwo')"
              :value="2"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('etlscheduler_table.driverClass')"
          prop="driverClass"
        >
          <el-input v-model="adddatasource.driverClass" />
        </el-form-item>
        <el-form-item
          :label="$t('etlscheduler_table.loginType')"
          prop="loginType"
        >
          <el-select
            v-model="adddatasource.loginType"
            :placeholder="$t('etlscheduler_table.switchLoginType')"
          >
            <el-option
              :label="$t('etlscheduler_table.loginTypeOne')"
              :value="1"
            />
            <el-option
              :label="$t('etlscheduler_table.loginTypeTwo')"
              :value="2"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('etlscheduler_table.loginName')"
          prop="loginName"
        >
          <el-input v-model="adddatasource.loginName" />
        </el-form-item>
        <el-form-item
          :label="$t('etlscheduler_table.loginPassword')"
          prop="loginPassword"
        >
          <el-input
            v-model="adddatasource.loginPassword"
            show-password
          />
        </el-form-item>
        <el-form-item
          :label="$t('etlscheduler_table.dsStatus')"
          prop="dsStatus"
        >
          <el-select
            v-model="adddatasource.dsStatus"
            :placeholder="$t('etlscheduler_table.switchDsStatus')"
          >
            <el-option
              :label="$t('etlscheduler_table.dsStatusTypeOne')"
              :value="1"
            />
            <el-option
              :label="$t('etlscheduler_table.dsStatusTypeTwo')"
              :value="0"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('etlscheduler_table.authFilePath')"
          prop="authFilePath"
        >
          <el-input v-model="adddatasource.authFilePath" />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()"
        >
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import {
  findPageList, create, deleteById, testConn,
  getById, update
} from '@/api/etlscheduler/datasource.js'
import waves from '@/directive/waves' // waves directive
// import { parseTime } from '@/utils'
import moment from 'moment'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import $ from 'jquery'

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]
// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'DataSource',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      // filter-container使用
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined,
        type: undefined
      },
      // el-table使用
      tableKey: 0,
      list: [],
      listLoading: true,
      total: 0,
      // 分页参数
      basePageParam: {
        condition: {
        },
        pageNo: 0,
        pageSize: 10,
        sortName: '',
        sortBy: ''
      },
      // 自定义的对象
      datasource: {
        jdbcDsUuid: '',
        jdbcUrl: '',
        authFilePath: '',
        driverClass: '',
        dsName: '',
        dsStatus: '',
        dsType: '',
        isDel: '',
        createTime: '',
        createUserName: '',
        createUserUuid: '',
        updateTime: '',
        updateUserName: '',
        updateUserUuid: '',
        loginName: '',
        loginPassword: '',
        loginType: '',
        keyWord: ''
      },
      adddatasource: {
        jdbcDsUuid: '',
        jdbcUrl: '',
        authFilePath: '',
        driverClass: '',
        dsName: '',
        dsStatus: '',
        dsType: '',
        isDel: '',
        createTime: '',
        createUserName: '',
        createUserUuid: '',
        updateTime: '',
        updateUserName: '',
        updateUserUuid: '',
        loginName: '',
        loginPassword: '',
        loginType: ''
      },
      // 添加修改表单使用
      textMap: {
        update: '编辑数据源',
        create: '添加数据源'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      // 查询
      importanceOptions: [{ id: 0, value: '停用' }, { id: 1, value: '启用' }],
      // buzhidao
      calendarTypeOptions,
      key: ''
    }
  },
  created() {
    // 初始化list赋值
    this.getList()
  },
  methods: {
    // 两种搜索框切换的方法
    showup() {
      $('#searchAll').css('display', 'none')
      $('#searchSwitch').css('display', 'block')
      this.datasource = {}
    },
    showdown() {
      $('#searchAll').css('display', 'block')
      $('#searchSwitch').css('display', 'none')
      this.datasource = {}
    },
    getList() {
      this.listLoading = true
      this.basePageParam.pageNo = this.listQuery.page
      this.basePageParam.pageSize = this.listQuery.limit
      this.basePageParam.condition = this.datasource
      findPageList(this.basePageParam).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    // 显示第一页
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 排序
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    // 表单格式化
    dataFormatTime(data) {
      if (data === '' || data == null) {
        return null
      } else {
        return moment(data).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    dataFormatType(data) {
      return data === 1 ? 'oracle' : data === 2 ? 'hive' : '未知'
    },
    dataFormatLoginType(data) {
      return data === 1 ? '用户名密码' : data === 2 ? 'kerbors认证' : '未知'
    },
    dataFormatStatus(data) {
      return data === 1 ? '启用' : data === 0 ? '停用' : '未知'
    },
    // 添加和修改的对象初始化
    resetDatasource() {
      this.adddatasource = {
        jdbcDsUuid: '',
        jdbcUrl: '',
        authFilePath: '',
        driverClass: '',
        dsName: '',
        dsStatus: '',
        dsType: '',
        isDel: '',
        createTime: '',
        createUserName: '',
        createUserUuid: '',
        updateTime: '',
        updateUserName: '',
        updateUserUuid: '',
        loginName: '',
        loginPassword: '',
        loginType: ''
      }
    },
    // 添加对象
    handleCreate() {
      this.resetDatasource()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          // this.temp.author = 'vue-element-admin'
          create(this.adddatasource).then(() => {
            this.list.unshift(this.adddatasource)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    // 修改对象
    handleUpdate(row) {
      getById(row.jdbcDsUuid).then(res => {
        this.adddatasource = res.data
      })
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // const tempData = Object.assign({}, this.datasource)
          update(this.adddatasource).then(() => {
            // const index = this.list.findIndex(v => v.id === this.temp.id)
            // this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    // 删除
    handleDelete(row) {
      deleteById(row.jdbcDsUuid).then(() => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    // 测试连接的方法
    handleModifyStatus(row) {
      testConn(row.jdbcDsUuid).then(res => {
        if (res.code === 0) {
          this.$notify({
            title: '测试成功',
            message: '测试成功',
            type: 'success',
            duration: 2000
          })
        } else {
          this.$notify({
            title: '测试失败',
            message: '测试失败',
            type: 'danger',
            duration: 2000
          })
        }
      })
    }
  }
}
</script>
<style scoped>
.search {
  margin-left: 290px;
}
.search-all {
  margin-left: 190px;
}
.myicon {
  font-size: 100;
  cursor: pointer;
}
#searchSwitch {
  display: none;
}
</style>
