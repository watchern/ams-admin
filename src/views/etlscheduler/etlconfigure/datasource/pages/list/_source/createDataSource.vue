<template>
  <div class="datasource-popup-model">
    <div class="top-p">
      <span>{{ item ? `修改` : `创建` }}数据源</span>
    </div>
    <div class="content-p">
      <div class="create-datasource-model">
        <m-list-box-f>
          <template slot="name"><strong>*</strong>数据源类型</template>
          <template slot="content">
            <x-radio-group
              v-model="dbType"
              size="small"
            >
              <x-radio :label="'MYSQL'">MYSQL</x-radio>
              <x-radio :label="'POSTGRESQL'">POSTGRESQL</x-radio>
              <x-radio :label="'HIVE'">HIVE/IMPALA</x-radio>
              <x-radio :label="'SPARK'">SPARK</x-radio>
              <x-radio :label="'CLICKHOUSE'">CLICKHOUSE</x-radio>
              <x-radio :label="'ORACLE'">ORACLE</x-radio>
              <x-radio :label="'SQLSERVER'">SQLSERVER</x-radio>
              <x-radio
                :label="'DB2'"
                class="radio-label-last"
              >DB2</x-radio>
            </x-radio-group>
          </template>
        </m-list-box-f>
        <m-list-box-f>
          <template slot="name"><strong>*</strong>数据源名称</template>
          <template slot="content">
            <x-input
              v-model="name"
              type="input"
              :maxlength="60"
              placeholder="请输入数据源名称"
              autocomplete="off"
            />
          </template>
        </m-list-box-f>
        <m-list-box-f>
          <template slot="name"><strong>*</strong>IP主机名</template>
          <template slot="content">
            <x-input
              v-model="host"
              type="input"
              :maxlength="60"
              placeholder="请输入IP主机名"
              autocomplete="off"
            />
          </template>
        </m-list-box-f>
        <m-list-box-f>
          <template slot="name"><strong>*</strong>端口</template>
          <template slot="content">
            <x-input
              v-model="port"
              type="input"
              placeholder="请输入端口号"
              autocomplete="off"
            />
          </template>
        </m-list-box-f>
        <!-- <m-list-box-f :class="{hidden:showPrincipal}">
          <template slot="name"><strong>*</strong>操作人</template>
          <template slot="content">
            <x-input type="input"
                     v-model="principal"
                     placeholder="请输入操作人"
                     autocomplete="off">
            </x-input>
          </template>
        </m-list-box-f> -->
        <m-list-box-f>
          <template slot="name"><strong>*</strong>用户名</template>
          <template slot="content">
            <x-input
              v-model="userName"
              type="input"
              :maxlength="60"
              placeholder="请输入用户名"
              autocomplete="off"
            />
          </template>
        </m-list-box-f>
        <m-list-box-f>
          <template slot="name">密码</template>
          <template slot="content">
            <x-input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              autocomplete="off"
            />
          </template>
        </m-list-box-f>
        <m-list-box-f v-if="showConnectType">
          <template slot="name"><strong>*</strong>服务名或SID</template>
          <template slot="content">
            <x-radio-group
              v-model="connectType"
              size="small"
            >
              <x-radio :label="'ORACLE_SERVICE_NAME'">服务名</x-radio>
              <x-radio :label="'ORACLE_SID'">SID</x-radio>
            </x-radio-group>
          </template>
        </m-list-box-f>
        <m-list-box-f>
          <template slot="name"><strong :class="{hidden:showdDatabase}">*</strong>数据库名</template>
          <template slot="content">
            <x-input
              v-model="database"
              type="input"
              :maxlength="60"
              placeholder="请输入数据库名"
              autocomplete="off"
            />
          </template>
        </m-list-box-f>
        <m-list-box-f>
          <template slot="name">jdbc连接参数</template>
          <template slot="content">
            <x-input
              v-model="other"
              type="textarea"
              :autosize="{minRows:2}"
              :placeholder="_rtOtherPlaceholder()"
              autocomplete="off"
            />
          </template>
        </m-list-box-f>
        <m-list-box-f>
          <template slot="name">描述</template>
          <template slot="content">
            <x-input
              v-model="note"
              type="textarea"
              placeholder="请输入描述"
              autocomplete="off"
            />
          </template>
        </m-list-box-f>
      </div>
    </div>
    <div class="bottom-p">
      <x-button
        type="primary"
        class="btnclass"
        @click="_close()"
      > 取消</x-button>
      <x-button
        type="success"
        class="btnclass"
        :loading="testLoading"
        @click="_testConnect()"
      >测试连接</x-button>
      <x-button
        type="primary"
        class="btnclass"
        :loading="spinnerLoading"
        @click="_ok()"
      >保存</x-button>
    </div>
  </div>
</template>
<script>
import store from '@/store'
import { isJson } from '@/components/etl/util/util'
import mListBoxF from '@/components/etl/listBoxF/listBoxF'
import { verifyDSName, getById } from '@/api/etlscheduler/datasource'
export default {
  name: 'CreateDatasource',
  components: { mListBoxF },
  props: {
    item: Object
  },
  data() {
    return {
      store,
      // btn 加载
      spinnerLoading: false,
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
      other: '',
      // btn test loading
      testLoading: false,
      showPrincipal: true,
      showdDatabase: false,
      showConnectType: false,
      isShowPrincipal: true,
      prePortMapper: {}
    }
  },
  watch: {
    dbType(value) {
      if (value === 'POSTGRESQL') {
        this.showdDatabase = true
      } else {
        this.showdDatabase = false
      }

      if (value === 'ORACLE' && !this.item.id) {
        this.showConnectType = true
        this.connectType = 'ORACLE_SERVICE_NAME'
      } else if (value === 'ORACLE' && this.item.id) {
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
    },
    /**
     * Cache the previous input port for each type datasource 为每个类型数据源缓存以前的输入端口
     * @param value
     */
    port(value) {
      this.prePortMapper[this.dbType] = value
    }
  },
  created() {
    // Backfill  回填
    if (this.item.datasourceUuid) {
      this._getEditDatasource()
    }

    this._setDefaultValues()
  },

  mounted() {
  },

  methods: {
    _rtOtherPlaceholder() {
      return `请输入格式为 {"key1":"value1","key2":"value2"...} 连接参数`
    },
    /**
     * 提交
     */
    _ok() {
      if (this._verification()) {
        this._verifName().then(res => {
          this._submit()
        })
      }
    },
    /**
     * close
     */
    _close() {
      this.$emit('close')
    },
    /**
     * return param
     */
    _rtParam() {
      return {
        dbType: this.dbType,
        name: this.name,
        note: this.note,
        host: this.host,
        port: this.port,
        database: this.database,
        principal: this.principal,
        userName: this.userName,
        password: this.password,
        connectType: this.connectType,
        other: this.other
      }
    },
    /**
     * test connect
     */
    _testConnect() {
      if (this._verification()) {
        this.testLoading = true
        this.store.dispatch('datasource/connectDatasources', { connectionParams: JSON.stringify(this._rtParam()) }).then(res => {
          setTimeout(() => {
            this.$message.success(res.msg)
            this.testLoading = false
          }, 0)
          // console.log(res)
          // if (res.code === 0) {
          //   this.$message.success(res.msg)
          //   this.testLoading = false
          // }
        }).catch(e => {
          // this.$message.error(e.msg || '')
          this.testLoading = false
        })
      }
    },
    /**
     * Verify that the data source name exists 验证数据源名称是否存在
     */
    _verifName() {
      return new Promise((resolve, reject) => {
        if (this.name === this.item.name) {
          resolve()
          return
        }
        verifyDSName(this.name).then(res => {
          resolve()
        }).catch(e => {
          // this.$message.error(e.msg || '')
          reject(e)
        })
      })
    },
    /**
     * 必填项
     */
    _verification() {
      if (!this.name) {
        this.$message.warning(`Please enter resource name`)
        return false
      }
      if (!this.host) {
        this.$message.warning(`Please enter IP/hostname`)
        return false
      }
      if (!this.port) {
        this.$message.warning(`Please enter port`)
        return false
      }
      if (!this.userName) {
        this.$message.warning(`Please enter user name`)
        return false
      }

      if (!this.database && this.showdDatabase === false) {
        this.$message.warning(`Please enter database name`)
        return false
      }
      if (this.other) {
        if (!isJson(this.other)) {
          this.$message.warning(`jdbc connection parameters is not a correct JSON format`)
          return false
        }
      }

      return true
    },
    /**
     * submit => add/update
     */
    _submit() {
      this.spinnerLoading = true
      const param = this._rtParam()
      // edit
      if (this.item) {
        param.datasourceUuid = this.item.datasourceUuid
      }
      this.store.dispatch(`datasource/${this.item ? 'updateDatasource' : 'createDatasources'}`, param).then(res => {
        this.$message.success(res.msg)
        this.spinnerLoading = false
        this.$emit('onUpdate')
      }).catch(e => {
        // this.$message.error(e.msg || '')
        this.spinnerLoading = false
      })
    },
    /**
     * Get modified data 修改数据
     */
    _getEditDatasource() {
      getById(this.item.datasourceUuid).then(res => {
        this.dbType = res.data.dbType
        this.name = res.data.name
        this.note = res.data.note
        this.host = res.data.host

        // When in Editpage, Prevent default value overwrite backfill value  在编辑页中，防止默认值覆盖回填值
        const that = this
        setTimeout(() => {
          this.port = res.data.port
        }, 0)

        this.principal = res.data.principal
        this.database = res.data.database
        this.userName = res.data.userName
        this.password = res.data.password
        this.connectType = res.data.connectType
        this.other = JSON.stringify(res.data.other) === '{}' ? '' : JSON.stringify(res.data.other)
      }).catch(e => {
        // this.$message.error(e.msg || '')
      })
      // this.store.dispatch('datasource/getEditDatasource', { id: this.item.datasourceUuid }).then(res => {
      //   this.type = res.type
      //   this.name = res.name
      //   this.note = res.note
      //   this.host = res.host

      //   // When in Editpage, Prevent default value overwrite backfill value  在编辑页中，防止默认值覆盖回填值
      //   const that = this
      //   setTimeout(() => {
      //     this.port = res.port
      //   }, 0)

      //   this.principal = res.principal
      //   this.database = res.database
      //   this.userName = res.userName
      //   this.password = res.password
      //   this.connectType = res.connectType
      //   this.other = JSON.stringify(res.other) === '{}' ? '' : JSON.stringify(res.other)
      // }).catch(e => {
      //   this.$message.error(e.msg || '')
      // })
    },
    /**
     * Set default port for each type. 为每种类型设置默认端口
     */
    _setDefaultValues(value) {
      // Default type is MYSQL
      const dbType = this.dbType || 'MYSQL'

      const defaultPort = this._getDefaultPort(dbType)

      // Backfill the previous input from memcache
      const mapperPort = this.prePortMapper[dbType]

      this.port = mapperPort || defaultPort
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

<style lang="scss" rel="stylesheet/scss">
.btnclass{
  background: #353a43;
  border-color: #353a43;
  font-weight: bold;
  margin-right: 10px;
}
.btnclass:hover{
  background: #353a43;
  border-color: #353a43;
  color: #c8ff8c;
  font-weight: bold;
}
.datasource-popup-model {
  background: #fff;
  border-radius: 3px;

  .top-p {
    height: 70px;
    line-height: 70px;
    border-radius: 3px 3px 0 0;
    padding: 0 20px;
    > span {
      font-size: 20px;
    }
  }
  .bottom-p {
    text-align: right;
    height: 72px;
    line-height: 72px;
    border-radius: 0 0 3px 3px;
    padding: 0 20px;
  }
  .content-p {
    min-width: 850px;
    min-height: 100px;
    .list-box-f {
      .text {
        width: 166px;
      }
      .cont {
        width: calc(100% - 186px);
      }
    }
  }
  .radio-label-last {
    margin-left: 0px !important;
  }
}
</style>
