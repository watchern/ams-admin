<template>
  <div class="sql-model">
    <m-list-box>
      <div slot="text"><span style="color: red;">*</span>数据源</div>
      <div slot="content">
        <m-datasource
          ref="refDs"
          :data="{ type:type,datasource:datasource }"
          @on-dsData="_onDsData"
        />
      </div>
    </m-list-box>
    <m-list-box style="display: none">
      <div slot="text">sql类型</div>
      <div slot="content">
        <!-- 默认为非查询，不显示 -->
        <div style="display: inline-block;">
          <m-sql-type
            :sql-type="sqlType"
            @on-sqlType="_onSqlType"
          />
        </div>
        <div
          v-if="sqlType==0"
          style="display: inline-block;padding-left: 10px;margin-top: 2px;"
        >
          <x-checkbox-group v-model="showType">
            <x-checkbox
              :label="'TABLE'"
              :disabled="isDetails"
            >表格</x-checkbox>
            <x-checkbox
              :label="'ATTACHMENT'"
              :disabled="isDetails"
            >附件</x-checkbox>
          </x-checkbox-group>
        </div>
      </div>
    </m-list-box>
    <m-list-box v-show="type === 'HIVE'">
      <div slot="text">sql参数</div>
      <div slot="content">
        <x-input
          v-model="connParams"
          :disabled="isDetails"
          type="input"
          placeholder="请输入格式为 + ' key1=value1;key2=value2...'"
          autocomplete="off"
        />
      </div>
    </m-list-box>
    <m-list-box>
      <div slot="text">

        <span style="color: red;">*
        </span>sql语句<el-tooltip class="item" effect="dark" content="多条sql语句使用/进行分隔" placement="top-start">
          <i class="el-icon-info" />
        </el-tooltip></div>
      <div slot="content">
        <div class="from-mirror">
          <textarea
            id="code-sql-mirror"
            name="code-sql-mirror"
            style="opacity: 0;"
          />
        </div>
      </div>
    </m-list-box>
    <m-list-box v-if="type === 'HIVE'">
      <div slot="text">UDF函数</div>
      <div slot="content">
        <m-udfs
          ref="refUdfs"
          :udfs="udfs"
          :type="type"
          @on-udfsData="_onUdfsData"
        />
      </div>
    </m-list-box>
    <m-list-box>
      <div slot="text">自定义参数</div>
      <div slot="content">
        <m-local-params
          ref="refLocalParams"
          :udp-list="localParams"
          @on-udpData="_onUdpData"
        />
      </div>
    </m-list-box>
    <m-list-box>
      <div slot="text">前置sql</div>
      <div slot="content">
        <m-statement-list
          ref="refPreStatements"
          :statement-list="preStatements"
          @on-statement-list="_onPreStatements"
        />
      </div>
    </m-list-box>
    <m-list-box>
      <div slot="text">后置sql</div>
      <div slot="content">
        <m-statement-list
          ref="refPostStatements"
          :statement-list="postStatements"
          @on-statement-list="_onPostStatements"
        />
      </div>
    </m-list-box>
  </div>
</template>
<script>
import _ from 'lodash'
import mUdfs from './_source/udfs'
import mListBox from './_source/listBox'
import mSqlType from './_source/sqlType'
import mDatasource from './_source/datasource'
import mLocalParams from './_source/localParams'
import mStatementList from './_source/statementList'
import disabledState from '@/components/etl/mixin/disabledState'
import codemirror from '@/components/etl/file/codemirror'
import $ from 'jquery'

let editor

export default {
  name: 'Sql',
  // components: { mListBox, mDatasource, mLocalParams, mUdfs, mSqlType, mStatementList, mEmail }
  components: { mListBox, mDatasource, mLocalParams, mUdfs, mSqlType, mStatementList },
  mixins: [disabledState],
  props: {
    backfillItem: Object,
    // createNodeId: Number
    createNodeId: String
  },
  data() {
    return {
      // Data source type
      type: '',
      // data source
      datasource: '',
      // Return to the selected data source
      rtDatasource: '',
      // Sql statement
      sql: '',
      // Custom parameter
      localParams: [],
      // UDF function
      udfs: '',
      // Sql type
      sqlType: '1',
      // Email title
      title: '',
      // Form/attachment
      showType: ['TABLE'],
      // Sql parameter
      connParams: '',
      // Pre statements
      preStatements: [],
      // Post statements
      postStatements: [],
      // recipients
      receivers: [],
      // copy to
      receiversCc: []
    }
  },
  computed: {
    cacheParams() {
      return {
        type: this.type,
        datasource: this.rtDatasource,
        udfs: this.udfs,
        sqlType: this.sqlType,
        title: this.title,
        receivers: this.receivers.join(','),
        receiversCc: this.receiversCc.join(','),
        showType: (() => {
          const showType = this.showType
          if (showType.length === 2 && showType[0] === 'ATTACHMENT') {
            return [showType[1], showType[0]].join(',')
          } else {
            return showType.join(',')
          }
        })(),
        localParams: this.localParams,
        connParams: this.connParams,
        preStatements: this.preStatements,
        postStatements: this.postStatements
      }
    }
  },
  watch: {
    // Listening to sqlType
    sqlType(val) {
      if (val === 0) {
        this.showType = []
      }
      if (val !== 0) {
        this.title = ''
        this.receivers = []
        this.receiversCc = []
      }
    },
    // Listening data source
    type(val) {
      if (val !== 'HIVE') {
        this.connParams = ''
      }
    },
    // Watch the cacheParams
    cacheParams(val) {
      this._cacheParams()
    }
  },
  created() {
    const o = this.backfillItem

    // Non-null objects represent backfill
    if (!_.isEmpty(o)) {
      // backfill
      this.type = o.params.type || ''
      this.datasource = o.params.datasource || ''
      this.sql = o.params.sql || ''
      this.udfs = o.params.udfs || ''
      this.sqlType = o.params.sqlType
      this.connParams = o.params.connParams || ''
      this.localParams = o.params.localParams || []
      if (o.params.showType === '') {
        this.showType = []
      } else {
        this.showType = o.params.showType.split(',') || []
      }
      this.preStatements = o.params.preStatements || []
      this.postStatements = o.params.postStatements || []
      this.title = o.params.title || ''
      this.receivers = o.params.receivers && o.params.receivers.split(',') || []
      this.receiversCc = o.params.receiversCc && o.params.receiversCc.split(',') || []
    }
    // // read tasks from cache
    // if (!_.some(this.store.state.dag.cacheTasks, { id: this.createNodeId }) &&
    //   this.router.history.currentRoute.name !== 'processinstance') {

    if (!_.some(this.store.state.dag.cacheTasks, { id: this.createNodeId })) {
      this._getReceiver()
    }
  },
  mounted() {
    setTimeout(() => {
      this._handlerEditor()
    }, 200)
  },
  destroyed() {
    /**
     * Destroy the editor instance
     */
    if (editor) {
      editor.toTextArea() // Uninstall
      editor.off($('.code-sql-mirror'), 'keypress', this.keypress)
      editor.off($('.code-sql-mirror'), 'changes', this.changes)
    }
  },
  methods: {
    /**
     * return sqlType
     */
    _onSqlType(a) {
      this.sqlType = a
      if (a === 0) {
        this.showType = ['TABLE']
      }
    },
    /**
     * return udfs
     */
    _onUdfsData(a) {
      this.udfs = a
    },
    /**
     * return Custom parameter
     */
    _onUdpData(a) {
      this.localParams = a
    },
    /**
     * return data source
     */
    _onDsData(o) {
      this.type = o.type
      this.rtDatasource = o.datasource
    },
    /**
     * return pre statements
     */
    _onPreStatements(a) {
      this.preStatements = a
    },
    /**
     * return post statements
     */
    _onPostStatements(a) {
      this.postStatements = a
    },
    /**
     * verification
     */
    _verification() {
      if (!editor.getValue()) {
        this.$message.warning(`请输入sql语句(必填)`)
        return false
      }

      // datasource Subcomponent verification
      // if (!this.$refs.refDs._verifDatasource()) {
      //   return false
      // }
      // if (this.sqlType === 0 && !this.showType.length) {
      //   this.$message.warning(`表格、附件必须勾选一个`)
      //   return false
      // }
      // if (this.sqlType === 0 && !this.title) {
      //   this.$message.warning(`邮件主题必填`)
      //   return false
      // }
      // if (this.sqlType === 0 && !this.receivers.length) {
      //   this.$message.warning(`收件人邮箱必填`)
      //   return false
      // }
      // receivers Subcomponent verification
      // if (this.sqlType === 0 && !this.$refs.refEmail._manualEmail()) {
      //   return false
      // }
      // // receiversCc Subcomponent verification
      // if (this.sqlType === 0 && !this.$refs.refCc._manualEmail()) {
      //   return false
      // }
      // udfs Subcomponent verification Verification only if the data type is HIVE
      if (this.type === 'HIVE') {
        if (!this.$refs.refUdfs._verifUdfs()) {
          return false
        }
      }

      // localParams Subcomponent verification
      if (!this.$refs.refLocalParams._verifProp()) {
        return false
      }

      // preStatements Subcomponent verification
      if (!this.$refs.refPreStatements._verifProp()) {
        return false
      }

      // postStatements Subcomponent verification
      if (!this.$refs.refPostStatements._verifProp()) {
        return false
      }

      // storage
      this.$emit('on-params', {
        type: this.type,
        datasource: this.rtDatasource,
        sql: editor.getValue(),
        udfs: this.udfs,
        sqlType: this.sqlType,
        title: this.title,
        receivers: this.receivers.join(','),
        receiversCc: this.receiversCc.join(','),
        showType: (() => {
          /**
           * Special processing return order TABLE,ATTACHMENT
           * Handling checkout sequence
           */
          const showType = this.showType
          if (showType.length === 2 && showType[0] === 'ATTACHMENT') {
            return [showType[1], showType[0]].join(',')
          } else {
            return showType.join(',')
          }
        })(),
        localParams: this.localParams,
        connParams: this.connParams,
        preStatements: this.preStatements,
        postStatements: this.postStatements
      })
      return true
    },
    /**
     * Processing code highlighting
     */
    _handlerEditor() {
      // this._destroyEditor()

      // editor
      editor = codemirror('code-sql-mirror', {
        mode: 'sql',
        readOnly: this.isDetails
      })
      this.keypress = () => {
        if (!editor.getOption('readOnly')) {
          editor.showHint(
            {
              completeSingle: false
            }
          )
        }
      }

      this.changes = () => {
        // editor.showHint()
        this._cacheParams()
      }

      // Monitor keyboard
      editor.on('keypress', this.keypress)

      // editor.on('changes', this.changes)

      // 代码自动提示功能，记住使用cursorActivity事件不要使用change事件，这是一个坑，那样页面直接会卡死
      editor.on('cursorActivity', this.changes)

      editor.setValue(this.sql)

      return editor
    },
    _getReceiver() {
      // const param = {}
      // const current = this.router.history.current
      // if (current.name === 'projects-definition-details') {
      //   param.processDefinitionId = current.params.id
      // } else {
      //   param.processInstanceId = current.params.id
      // }
      // this.store.dispatch('dag/getReceiver', param).then(res => {
      //   this.receivers = res.receivers && res.receivers.split(',') || []
      //   this.receiversCc = res.receiversCc && res.receiversCc.split(',') || []
      // })
    },
    _cacheParams() {
      this.$emit('on-cache-params', {
        type: this.type,
        datasource: this.rtDatasource,
        sql: editor ? editor.getValue() : '',
        udfs: this.udfs,
        sqlType: this.sqlType,
        title: this.title,
        receivers: this.receivers.join(','),
        receiversCc: this.receiversCc.join(','),
        showType: (() => {
          const showType = this.showType
          if (showType.length === 2 && showType[0] === 'ATTACHMENT') {
            return [showType[1], showType[0]].join(',')
          } else {
            return showType.join(',')
          }
        })(),
        localParams: this.localParams,
        connParams: this.connParams,
        preStatements: this.preStatements,
        postStatements: this.postStatements
      })
    },
    _destroyEditor() {
      if (editor) {
        editor.toTextArea() // Uninstall
        editor.off($('.code-sql-mirror'), 'keypress', this.keypress)
        editor.off($('.code-sql-mirror'), 'cursorActivity', this.changes)
      }
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss">
.requiredIcon {
  color: #ff0000;
  padding-right: 4px;
}
</style>

