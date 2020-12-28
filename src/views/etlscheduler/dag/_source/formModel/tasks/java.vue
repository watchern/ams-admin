<template>
  <div class="java-model">
    <!-- <m-list-box>
      <div slot="text">节点编码</div>
      <div slot="content">
        <label class="label-box">
          <x-input
            v-model="taskCode"
            type="text"
            :disabled="isDetails"
            placeholder="请输入节点编码(必填)"
            :maxlength="100"
            autocomplete="off"
          />
        </label>
      </div>
    </m-list-box> -->
    <!-- <m-list-box>
      <div slot="text">出错策略</div>
      <div slot="content">
        <x-select
          v-model="errorType"
          placeholder="请选择出错策略(必填)"
          style="width: 288px;"
          :disabled="isDetails"
        >
          <x-option
            v-for="model in errorTypeList"
            :key="model.value"
            :value="model.value"
            :label="model.name"
          />
        </x-select>
      </div>
    </m-list-box>
    <m-list-box
      v-if="errorhide"
    >
      <div slot="text">出错次数</div>
      <div slot="content">
        <label class="label-box">
          <x-input
            v-model="errorTime"
            type="text"
            :disabled="isDetails"
            placeholder="请输入出错次数(必填)"
            :maxlength="100"
            autocomplete="off"
          />
        </label>
      </div>
    </m-list-box> -->
    <m-list-box>
      <div slot="text"><span style="color: red;">*</span>驱动类</div>
      <div slot="content">
        <x-select
          v-model="clas"
          placeholder="请选择驱动类"
          style="width: 500px;"
          :disabled="isDetails"
          filterable
          @on-change="_classChange"
        >
          <x-option
            v-for="model in classList"
            :key="model.name"
            :value="model.name"
            :label="model.className"
          />
        </x-select>
      </div>
    </m-list-box>
    <!-- <m-list-box>
      <div slot="text">自定义参数</div>
      <div slot="content">
        <m-local-params
          ref="refLocalParams"
          :udp-list="localParams"
          @on-udpData="_onUdpData"
        />
      </div>
    </m-list-box> -->
    <m-list-box
      v-if="hide"
    >
      <div slot="text"><span style="color: red;">*</span>驱动类参数</div>
      <div slot="content">
        <m-java-params
          ref="refjavaParams"
          :udp-list="localParams"
          @on-udpData="_onUdpDatapar"
        />
      </div>
    </m-list-box>
  </div>
</template>
<script>
import _ from 'lodash'
import mListBox from './_source/listBox'
import mJavaParams from './_source/javaParams'
import disabledState from '@/components/etl/mixin/disabledState'
import $ from 'jquery'
import { findParams } from '@/api/etlscheduler/processdefinition'
let editor

export default {
  name: 'Java',
  components: { mListBox, mJavaParams },
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
      // Custom parameter
      localParams: [],
      // UDF function
      udfs: '',
      // Email title
      title: '',
      // Form/attachment
      showType: ['TABLE'],
      // taskCode: '',
      // errorType: '',
      // errorTypeList: [{ name: '不重试', value: '0' }, { name: '重试', value: '1' }],
      // errorTime: '',
      classList: [],
      clas: '',
      hide: false,
      errorhide: false
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
        // taskCode: this.taskCode,
        // errorType: this.errorType,
        // errorTime: this.errorTime,
        clas: this.clas,
        showType: (() => {
          const showType = this.showType
          if (showType.length === 2 && showType[0] === 'ATTACHMENT') {
            return [showType[1], showType[0]].join(',')
          } else {
            return showType.join(',')
          }
        })(),
        localParams: this.localParams
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
    // errorType(val) {
    //   if (val === '1') {
    //     this.errorhide = true
    //   }
    //   if (val === '0') {
    //     this.errorhide = false
    //   }
    // },
    clas(val) {
      if (val !== '') {
        this.hide = true
      }
      if (val === '') {
        this.hide = false
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
      // this.taskCode = o.params.taskCode || ''
      // this.errorType = o.params.errorType || ''
      // this.errorTime = o.params.errorTime || ''
      this.clas = o.params.mainClass || ''
      this.localParams = o.params.localParams || ''
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
      // this._getReceiver()
    }
  },
  mounted() {
    setTimeout(() => {
      this._handlerEditor()
    }, 200)
    const dag = _.cloneDeep(this.store.state.dag)
    this.classList = dag.classListS
  },
  destroyed() {
    /**
     * Destroy the editor instance
    */
    if (editor) {
      // editor.toTextArea() // Uninstall
      // editor.off($('.code-sql-mirror'), 'keypress', this.keypress)
      // editor.off($('.code-sql-mirror'), 'changes', this.changes)
    }
  },
  methods: {
    _classChange(a) {
      findParams(a.value).then(resp => {
        this.localParams = resp.data
      })
    },
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
    _onUdpDatapar(a) {
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
      if (!this.$refs.refjavaParams._verifProp()) {
        return false
      }
      // if (!_.trim(this.taskCode)) {
      //   this.$message.warning(`请输入节点编码（必填）`)
      //   return false
      // }
      // if (!_.trim(this.errorType)) {
      //   this.$message.warning(`请选择出错策略（必填）`)
      //   return false
      // }
      // if (!_.trim(this.errorTime) && _.trim(this.errorType) === 1) {
      //   this.$message.warning(`请选择出错次数（必填）`)
      //   return false
      // }
      // storage
      this.$emit('on-params', {
        type: this.type,
        title: this.title,
        // taskCode: this.taskCode,
        // errorType: this.errorType,
        // errorTime: this.errorTime,
        mainClass: this.clas,
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
        localParams: this.localParams
      })
      return true
    },
    /**
     * Processing code highlighting
     */
    _handlerEditor() {
      this._destroyEditor()

      // // editor
      // editor = codemirror('code-java-mirror', {
      //   mode: 'java',
      //   readOnly: this.isDetails
      // })

      // this.keypress = () => {
      //   if (!editor.getOption('readOnly')) {
      //     editor.showHint({
      //       completeSingle: false
      //     })
      //   }
      // }

      // this.changes = () => {
      //   this._cacheParams()
      // }

      // Monitor keyboard
      // editor.on('keypress', this.keypress)

      // editor.on('changes', this.changes)

      // editor.setValue(this.sql)

      return editor
    },
    // _getReceiver() {
    // const param = {}
    // const current = this.router.history.current
    // if (current.name === 'projectsdefinitiondetails') {
    // param.processDefinitionId = current.params.id
    // } else {
    // param.processInstanceId = current.params.id\
    // }
    // this.store.dispatch('dag/getReceiver', param).then(res => {
    //   this.receivers = res.receivers && res.receivers.split(',') || []
    //   this.receiversCc = res.receiversCc && res.receiversCc.split(',') || []
    // })
    // },
    _cacheParams() {
      this.$emit('on-cache-params', {
        type: this.type,
        datasource: this.rtDatasource,
        // taskCode: this.taskCode,
        // errorType: this.errorType,
        // errorTime: this.errorTime,
        mainClass: this.clas,
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
        // editor.toTextArea() // Uninstall
        // editor.off($('.code-sql-mirror'), 'keypress', this.keypress)
        // editor.off($('.code-sql-mirror'), 'changes', this.changes)
      }
    }
  }
}
</script>
