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
        <el-button
          type="primary"
          title="测试连接"
          class="oper-btn link"
          :disabled="selections.length !== 1"
          @click="testConnect"
        />
        <el-button
          type="primary"
          title="新增"
          class="oper-btn add"
          @click="handelCreated"
        />
        <el-button
          type="primary"
          title="编辑"
          class="oper-btn edit"
          :disabled="selections.length !== 1"
          @click="hadleUpdate()"
        />
        <el-button
          type="primary"
          title="删除"
          class="oper-btn delete"
          :disabled="selections.length === 0"
          @click="handleDelete()"
        /></el-col>
    </el-row>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      stripe
      fit
      style="width: 100%;"
      :data="list"
      border
      highlight-current-row
      height="calc(100vh - 350px)"
      max-height="calc(100vh - 350px)"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
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
          <el-popover trigger="hover" placement="top" width="500">
            <!-- <p>{{ scope.row.connectionParams }}</p> -->
            <el-row>
              <label class="col-md-4">
                jdbc url:
              </label>
              <div class="col-md-8">
                {{ JSON.parse(scope.row.connectionParams).jdbcUrl }}
              </div>
            </el-row>
            <el-row>
              <label class="col-md-4">
                用户名:
              </label>
              <div class="col-md-8">
                {{ JSON.parse(scope.row.connectionParams).user }}
              </div>
            </el-row>
            <div slot="reference" class="name-wrapper">
              <el-link :underline="false" type="primary">查看参数</el-link>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        label="描述"
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
        width="250px"
        align="center"
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
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dataForm"
        :model="datasource"
        :rules="rules"
        label-position="right"
        class="detail-form"
        style="height:62vh; overflow:auto;"
      >
        <el-form-item
          label="数据源类型"
          prop="dbType"
        >
          <el-radio-group v-model="datasource.dbType" size="small">
            <el-radio :label="'MYSQL'">MYSQL</el-radio>
            <el-radio :label="'POSTGRESQL'">POSTGRESQL</el-radio>
            <el-radio :label="'HIVE'">HIVE/IMPALA</el-radio>
            <el-radio :label="'SPARK'">SPARK</el-radio>
            <el-radio :label="'CLICKHOUSE'">CLICKHOUSE</el-radio>
            <el-radio :label="'ORACLE'">ORACLE</el-radio>
            <el-radio :label="'SQLSERVER'">SQLSERVER</el-radio>
            <el-radio
              :label="'DB2'"
              class="radio-label-last"
            >DB2</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="数据源名称"
          prop="name"
        >
          <el-input
            v-model="datasource.name"
            :disabled="isDetails"
            placeholder="请输入数据源名称(必填)"
          />
        </el-form-item>
        <el-form-item
          label="IP主机名"
          prop="host"
        >
          <el-input
            v-model="datasource.host"
            :disabled="isDetails"
            placeholder="请输入IP主机名(必填)"
          />
        </el-form-item>
        <el-form-item
          label="端口"
          prop="port"
        >
          <el-input
            v-model="datasource.port"
            :disabled="isDetails"
            placeholder="请输入端口(必填)"
          />
        </el-form-item>
        <el-form-item
          label="用户名"
          prop="userName"
        >
          <el-input
            v-model="datasource.userName"
            :disabled="isDetails"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item
          label="密码"
          prop="password"
        >
          <el-input
            v-model="datasource.password"
            :disabled="isDetails"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item
          v-if="showConnectType"
          label="服务名或SID"
          prop="connectType"
        >
          <el-radio-group v-model="datasource.connectType" size="small">
            <el-radio :label="'ORACLE_SERVICE_NAME'">服务名</el-radio>
            <el-radio :label="'ORACLE_SID'">SID</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="数据库名"
          prop="database"
        >
          <!-- :class="{hidden:showdDatabase}" -->
          <el-input
            v-model="datasource.database"
            :disabled="isDetails"
            placeholder="数据库名"
          />
        </el-form-item>
        <el-form-item
          label="jdbc连接参数"
          prop="other"
        >
          <el-input
            v-model="datasource.other"
            :disabled="isDetails"
            type="textarea"
            :placeholder="_rtOtherPlaceholder()"
          />
        </el-form-item>
        <el-form-item
          label="描述"
          prop="note"
        >
          <el-input
            v-model="datasource.note"
            :disabled="isDetails"
            type="textarea"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button
          type="text"
          @click="dialogFormVisible = false"
        > 取消</el-button>
        <el-button
          type="primary"
          :loading="testLoading"
          @click="_testConnect()"
        >测试连接</el-button>
        <el-button
          type="primary"
          :loading="spinnerLoading"
          @click="dialogStatus==='create'?createData():updateData()"
        >保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { pageList, deleteByIds, verifyDSName, getById } from '@/api/etlscheduler/datasource'
import QueryField from '@/components/Ace/query-field/index'
import store from '@/store'
import { mapActions } from 'vuex'
import listUrlParamHandle from '@/components/etl/mixin/listUrlParamHandle'
import { isJson } from '@/components/etl/util/util'

export default {
  name: 'DatasourceIndexP',
  components: { Pagination, QueryField },
  mixins: [listUrlParamHandle],
  props: {},
  data() {
    var checkOther = (rule, value, callback) => {
      if (!isJson(value) && value !== '') {
        return callback(new Error('jdbc连接参数不是一个正确的JSON格式'))
      } else {
        callback()
      }
    }
    return {
      store,
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
        }
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
        condition: {},
        pageNo: 1,
        pageSize: 20,
        sortBy: 'desc',
        sortName: 'updateTime'
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
        create: '新增数据源'
      },
      dialogPvVisible: false,
      rules: {
        dbType: [{ required: true, message: '请选择数据源类型', trigger: 'change' }],
        note: [{ max: 500, message: '数据源描述在500个字符之内', trigger: 'change' }],
        name: [{ required: true, message: '请填写数据源名称', trigger: 'change' },
          { max: 20, message: '数据源名称在20个字符之内', trigger: 'change' }],
        port: [{ required: true, message: '请填写端口号', trigger: 'change' },
          { max: 5, message: '端口号在5个字符之内', trigger: 'change' }],
        host: [{ required: true, message: '请填写IP/主机名', trigger: 'change' }],
        connectType: [{ required: true, message: '请选择数据连接类型', trigger: 'change' }],
        userName: [{ required: true, message: '请输入用户名', trigger: 'change' },
          { max: 20, message: '用户名在20个字符之内', trigger: 'change' }],
        database: [{ required: true, message: '请填写数据库名', trigger: 'change' },
          { pattern: /^[0-9a-zA-Z_]{1,}$/, message: '数据库名称由字母、数字和下划线组成' }],
        other: [{ validator: checkOther, trigger: 'change' }]
      },
      downloadLoading: false,
      datasource: {
        // 数据源类型
        dbType: 'MYSQL',
        // 数据源名称
        name: '',
        // 描述
        note: '',
        // ip
        host: '',
        // 端口
        port: '',
        // 数据库名称
        database: '',
        // principal
        principal: '',
        // 账号
        userName: '',
        // 密码
        password: '',
        // 数据连接类型
        connectType: '',
        // Jdbc 连接参数
        other: ''
      },
      // btn test loading
      testLoading: false,
      showPrincipal: true,
      showdDatabase: false,
      showConnectType: false,
      isShowPrincipal: true,
      // prePortMapper: {},
      spinnerLoading: false,
      datasourceUuid: null,
      isDetails: false
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
  computed: {
    getDbType: function() {
      return this.datasource.dbType
    }
  },
  watch: {
    showdDatabase(val) {
      if (val === true) {
        this.rules.database[0].required = false
      } else {
        this.rules.database[0].required = true
      }
    },
    getDbType(value) {
      if (value === 'POSTGRESQL') {
        this.showdDatabase = true
      } else {
        this.showdDatabase = false
      }

      if (value === 'ORACLE' && this.dialogStatus === 'create') {
        this.showConnectType = true
        this.datasource.connectType = 'ORACLE_SERVICE_NAME'
      } else if (value === 'ORACLE' && this.dialogStatus !== 'create') {
        this.showConnectType = true
      } else {
        this.showConnectType = false
      }
      // Set default port for each type datasource Set default port for each type datasource 为每个类型数据源设置默认端口
      this._setDefaultValues(value)

      // if ((value === 'HIVE' || value === 'SPARK')) {
      //   this.showPrincipal = true
      // } else {
      //   this.showPrincipal = false
      // }
      // TODOKerberos
      // return new Promise((resolve, reject) => {
      // this.store.dispatch('datasource/getKerberosStartupState').then(res => {
      //   this.isShowPrincipal = res
      //   if ((value === 'HIVE' || value === 'SPARK') && this.isShowPrincipal === true) {
      //     this.showPrincipal = false
      //   } else {
      //     this.showPrincipal = true
      //   }
      // }).catch(e => {
      //   this.$message.error(e.msg || '')
      //   reject(e)
      // })
      // })
    }
  },
  created() {
    this.getList()
  },
  methods: {
    ...mapActions('datasource', ['getDatasourcesListP']),
    _rtOtherPlaceholder() {
      return `请输入格式为 {"key1":"value1","key2":"value2"...} 连接参数`
    },
    getList(query) {
      this.listLoading = true
      if (query) {
        this.pageQuery.condition = query
        this.pageQuery.pageNo = 1
      }
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
    handelCreated() {
      this.resetDatasource()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this._setDefaultValues()
      this.datasourceUuid = null
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    resetDatasource() {
      this.datasource = {
        // 数据源类型
        dbType: 'MYSQL',
        // 数据源名称
        name: '',
        // 描述
        note: '',
        // ip
        host: '',
        // 端口
        port: '',
        // 数据库名称
        database: '',
        // principal
        principal: '',
        // 账号
        userName: '',
        // 密码
        password: '',
        // 数据连接类型
        connectType: '',
        // Jdbc 连接参数
        other: ''
      }
    },
    // hadleCreate() {
    //   this._create('')
    // },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this._verifName().then(res => {
            this._submit('createDatasources')
          })
        }
      })
    },
    hadleUpdate() {
      const item = Object.assign({}, this.selections[0])
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.datasourceUuid = item.datasourceUuid
      this._getEditDatasource(item.datasourceUuid)
      this._setDefaultValues()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this._verifName().then(res => {
            this._submit('updateDatasource')
          })
        }
      })
    },
    /**
     * submit => add/update
     */
    _submit(val) {
      this.spinnerLoading = true
      const param = this._rtParam()
      // edit
      if (val === 'updateDatasource') {
        param.datasourceUuid = this.datasourceUuid
      }
      this.store.dispatch(`datasource/${val}`, param).then(res => {
        this.$notify({
          title: this.$t('message.title'),
          message: res.msg,
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
        this.spinnerLoading = false
        this.getList()
        this.dialogFormVisible = false
      }).catch(e => {
        // this.$message.error(e.msg || '')
        this.spinnerLoading = false
      })
    },
    /**
     * Verify that the data source name exists 验证数据源名称是否存在
     */
    _verifName() {
      return new Promise((resolve, reject) => {
        const item = Object.assign({}, this.selections[0])
        if (item.name === this.datasource.name) {
          resolve()
          return
        }
        verifyDSName(this.datasource.name).then(res => {
          resolve()
        }).catch(e => {
          // this.$message.error(e.msg || '')
          reject(e)
        })
      })
    },
    testConnect() {
      const item = Object.assign({}, this.selections[0])
      getById(item.datasourceUuid).then(res => {
        this.store.dispatch('datasource/connectDatasources', { connectionParams: JSON.stringify(res.data) }).then(resp => {
          setTimeout(() => {
            this.$notify({
              title: this.$t('message.title'),
              message: '测试连接成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          }, 0)
        }).catch(e => {
          this.$message.error(e.msg || '测试连接失败')
        })
      })
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
    handleDelete() {
      this.$confirm(this.$t('confirm.delete'), this.$t('confirm.title'), {
        confirmButtonText: this.$t('confirm.okBtn'),
        cancelButtonText: this.$t('confirm.cancelBtn'),
        type: 'warning'
      }).then(() => {
        var ids = []
        this.selections.forEach((r, i) => { ids.push(r.datasourceUuid) })
        deleteByIds(ids.join(',')).then(() => {
          this.getList()
          this.$notify({
            title: this.$t('message.title'),
            message: this.$t('message.delete.success'),
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
        })
      }).catch(() => {
        // this.$notify({
        //   title: '消息',
        //   message: '已取消删除',
        //   duration: 2000,
        //   position: 'bottom-right'
        // })
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
    _rtParam() {
      return {
        dbType: this.datasource.dbType,
        name: this.datasource.name,
        note: this.datasource.note,
        host: this.datasource.host,
        port: this.datasource.port,
        database: this.datasource.database,
        principal: this.datasource.principal,
        userName: this.datasource.userName,
        password: this.datasource.password,
        connectType: this.datasource.connectType,
        other: this.datasource.other
      }
    },
    /**
     * test connect
     */
    _testConnect() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.testLoading = true
          this.store.dispatch('datasource/connectDatasources', { connectionParams: JSON.stringify(this._rtParam()) }).then(res => {
            setTimeout(() => {
              this.$notify({
                title: this.$t('message.title'),
                message: '测试连接成功',
                type: 'success',
                duration: 2000,
                position: 'bottom-right'
              })
              this.testLoading = false
            }, 0)
          }).catch(e => {
          // this.$message.error(e.msg || '')
            this.testLoading = false
          })
        }
      })
    }, /**
     * Get modified data 修改数据
     */
    _getEditDatasource(val) {
      getById(val).then(res => {
        this.datasource.dbType = res.data.dbType
        this.datasource.name = res.data.name
        this.datasource.note = res.data.note
        this.datasource.host = res.data.host

        // When in Editpage, Prevent default value overwrite backfill value  在编辑页中，防止默认值覆盖回填值
        // const that = this
        setTimeout(() => {
          this.datasource.port = res.data.port
        }, 0)

        this.datasource.principal = res.data.principal
        this.datasource.database = res.data.database
        this.datasource.userName = res.data.userName
        this.datasource.password = res.data.password
        this.datasource.connectType = res.data.connectType
        this.datasource.other = JSON.stringify(res.data.other) === '{}' ? '' : JSON.stringify(res.data.other)
      }).catch(e => {
        // this.$message.error(e.msg || '')
      })
    },
    /**
     * Set default port for each type. 为每种类型设置默认端口
     */
    _setDefaultValues(value) {
      // Default type is MYSQL
      const dbType = this.datasource.dbType || 'MYSQL'

      const defaultPort = this._getDefaultPort(dbType)

      // Backfill the previous input from memcache
      // const mapperPort = this.prePortMapper[dbType]
      // this.datasource.port = mapperPort || defaultPort
      this.datasource.port = defaultPort
    },

    /**
     * Get default port by type  按类型获取默认端口
     */
    _getDefaultPort(dbType) {
      var defaultPort = ''
      switch (dbType) {
        case 'MYSQL':
          defaultPort = '3306'
          break
        case 'POSTGRESQL':
          defaultPort = '5432'
          break
        case 'HIVE':
          defaultPort = '10000'
          break
        case 'SPARK':
          defaultPort = '10015'
          break
        case 'CLICKHOUSE':
          defaultPort = '8123'
          break
        case 'ORACLE':
          defaultPort = '1521'
          break
        case 'SQLSERVER':
          defaultPort = '1433'
          break
        case 'DB2':
          defaultPort = '50000'
          break
        default:
          break
      }
      return defaultPort
    }
  }
}
</script>
<style scoped>
.el-radio {
  font-size: 12px;
	margin-right: 15px;
}
.el-radio__label {
	font-size: 12px;
	padding-left: 5px;
}
</style>
