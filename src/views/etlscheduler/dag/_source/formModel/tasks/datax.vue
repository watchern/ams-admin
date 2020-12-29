<template>
  <div class="datax-model">
    <m-list-box>
      <div slot="text">{{ $t('Custom template') }}</div>
      <div slot="content">
        <label class="label-box">
          <div style="padding-top: 5px;">
            <x-switch v-model="enable" :disabled="isDetails" @on-click="_onSwitch" />
          </div>
        </label>
      </div>
    </m-list-box>
    <div v-if="!enable">
      <m-list-box>
        <div slot="text">{{ $t('Datasource') }}</div>
        <div slot="content">
          <m-datasource
            ref="refDs"
            :support-type="['MYSQL','POSTGRESQL', 'ORACLE', 'SQLSERVER']"
            :data="{ type:dsType,datasource:datasource }"
            @on-dsData="_onDsData"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('SQL Statement') }}</div>
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
      <m-list-box>
        <div slot="text">{{ $t('TargetDataBase') }}</div>
        <div slot="content">
          <m-datasource
            ref="refDt"
            :support-type="['MYSQL','POSTGRESQL', 'ORACLE', 'SQLSERVER']"
            :data="{ type:dtType,datasource:datatarget }"
            @on-dsData="_onDtData"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('TargetTable') }}</div>
        <div slot="content">
          <x-input
            v-model="targetTable"
            type="input"
            :placeholder="$t('Please enter the table of target')"
            autocomplete="off"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('TargetDataBase') }}{{ $t('Pre Statement') }}</div>
        <div slot="content">
          <m-statement-list
            ref="refPreStatements"
            :statement-list="preStatements"
            @on-statement-list="_onPreStatements"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('TargetDataBase') }}{{ $t('Post Statement') }}</div>
        <div slot="content">
          <m-statement-list
            ref="refPostStatements"
            :statement-list="postStatements"
            @on-statement-list="_onPostStatements"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">
          <span>{{ $t('SpeedByte') }}</span>
        </div>
        <div slot="content">
          <m-select-input v-model="jobSpeedByte" :list="[0,1,10,50,100,512]" />
          <span>({{ $t('0 means unlimited by byte') }})</span>
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">
          <span>{{ $t('SpeedRecord') }}</span>
        </div>
        <div slot="content">
          <m-select-input v-model="jobSpeedRecord" :list="[0,500,1000,1500,2000,2500,3000]" />
          <span>({{ $t('0 means unlimited by count') }})</span>
        </div>
      </m-list-box>
    </div>
    <div v-else>
      <m-list-box>
        <div slot="text">json</div>
        <div slot="content">
          <div class="from-mirror">
            <textarea
              id="code-json-mirror"
              name="code-json-mirror"
              style="opacity: 0;"
            />
          </div>
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('Custom Parameters') }}</div>
        <div slot="content">
          <m-local-params
            ref="refLocalParams"
            :udp-list="localParams"
            :hide="false"
            @on-local-params="_onLocalParams"
          />
        </div>
      </m-list-box>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import mListBox from './_source/listBox'
import mDatasource from './_source/datasource'
import mLocalParams from './_source/localParams'
import mStatementList from './_source/statementList'
import disabledState from '@/components/etl/mixin/disabledState'
import mSelectInput from '../_source/selectInput'
import codemirror from '@/components/etl/file/codemirror'

let editor
let jsonEditor

export default {
  name: 'Datax',
  components: { mListBox, mDatasource, mLocalParams, mStatementList, mSelectInput },
  mixins: [disabledState],
  props: {
    backfillItem: Object,
    createNodeId: Number
  },

  data() {
    return {
      // Data Custom template
      enable: false,
      // Data source type
      dsType: '',
      // data source
      datasource: '',
      // Data source type
      dtType: '',
      // data source
      datatarget: '',
      // Return to the selected data source
      rtDatasource: '',
      // Return to the selected data target
      rtDatatarget: '',
      // Sql statement
      sql: '',
      json: '',
      // target table
      targetTable: '',
      // Pre statements
      preStatements: [],
      // Post statements
      postStatements: [],
      // speed byte
      jobSpeedByte: 0,
      // speed record
      jobSpeedRecord: 1000,
      // Custom parameter
      localParams: [],
      customConfig: 0
    }
  },
  computed: {
    cacheParams() {
      return {
        dsType: this.dsType,
        dataSource: this.rtDatasource,
        dtType: this.dtType,
        dataTarget: this.rtDatatarget,
        targetTable: this.targetTable,
        jobSpeedByte: this.jobSpeedByte * 1024,
        jobSpeedRecord: this.jobSpeedRecord,
        preStatements: this.preStatements,
        postStatements: this.postStatements
      }
    }
  },
  watch: {
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
      if (o.params.customConfig == 0) {
        this.customConfig = 0
        this.enable = false
        this.dsType = o.params.dsType || ''
        this.datasource = o.params.dataSource || ''
        this.dtType = o.params.dtType || ''
        this.datatarget = o.params.dataTarget || ''
        this.sql = o.params.sql || ''
        this.targetTable = o.params.targetTable || ''
        this.jobSpeedByte = o.params.jobSpeedByte / 1024 || 0
        this.jobSpeedRecord = o.params.jobSpeedRecord || 0
        this.preStatements = o.params.preStatements || []
        this.postStatements = o.params.postStatements || []
      } else {
        this.customConfig = 1
        this.enable = true
        this.json = o.params.json || []
        this.localParams = o.params.localParams || ''
      }
    }
  },
  mounted() {
    if (this.customConfig) {
      setTimeout(() => {
        this._handlerJsonEditor()
      }, 200)
    } else {
      setTimeout(() => {
        this._handlerEditor()
      }, 200)
    }
  },
  destroyed() {
    /**
       * Destroy the editor instance
       */
    if (editor) {
      editor.toTextArea() // Uninstall
      editor.off($('.code-sql-mirror'), 'keypress', this.keypress)
    }
    if (jsonEditor) {
      jsonEditor.toTextArea() // Uninstall
      jsonEditor.off($('.code-json-mirror'), 'keypress', this.keypress)
    }
  },
  methods: {
    _onSwitch(is) {
      if (is) {
        this.customConfig = 1
        setTimeout(() => {
          this._handlerJsonEditor()
        }, 200)
      } else {
        this.customConfig = 0
        setTimeout(() => {
          this._handlerEditor()
        }, 200)
      }
    },
    /**
       * return data source
       */
    _onDsData(o) {
      this.dsType = o.type
      this.rtDatasource = o.datasource
    },
    /**
       * return data target
       */
    _onDtData(o) {
      this.dtType = o.type
      this.rtDatatarget = o.datasource
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
       * return localParams
       */
    _onLocalParams(a) {
      this.localParams = a
    },
    /**
       * verification
       */
    _verification() {
      if (this.customConfig) {
        if (!jsonEditor.getValue()) {
          this.$message.warning(`${i18n.$t('Please enter a JSON Statement(required)')}`)
          return false
        }

        // localParams Subcomponent verification
        if (!this.$refs.refLocalParams._verifProp()) {
          return false
        }

        // storage
        this.$emit('on-params', {
          customConfig: this.customConfig,
          json: jsonEditor.getValue(),
          localParams: this.localParams
        })
        return true
      } else {
        if (!editor.getValue()) {
          this.$message.warning(`${i18n.$t('Please enter a SQL Statement(required)')}`)
          return false
        }

        // datasource Subcomponent verification
        if (!this.$refs.refDs._verifDatasource()) {
          return false
        }

        // datasource Subcomponent verification
        if (!this.$refs.refDt._verifDatasource()) {
          return false
        }

        if (!this.targetTable) {
          this.$message.warning(`${i18n.$t('Please enter a Target Table(required)')}`)
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
          customConfig: this.customConfig,
          dsType: this.dsType,
          dataSource: this.rtDatasource,
          dtType: this.dtType,
          dataTarget: this.rtDatatarget,
          sql: editor.getValue(),
          targetTable: this.targetTable,
          jobSpeedByte: this.jobSpeedByte * 1024,
          jobSpeedRecord: this.jobSpeedRecord,
          preStatements: this.preStatements,
          postStatements: this.postStatements
        })
        return true
      }
    },
    /**
       * Processing code highlighting
       */
    _handlerEditor() {
      this._destroyEditor()

      // editor
      editor = codemirror('code-sql-mirror', {
        mode: 'sql',
        readOnly: this.isDetails
      })

      this.keypress = () => {
        if (!editor.getOption('readOnly')) {
          editor.showHint({
            completeSingle: false
          })
        }
      }

      // Monitor keyboard
      editor.on('keypress', this.keypress)

      editor.on('changes', () => {
        this._cacheParams()
      })

      editor.setValue(this.sql)

      return editor
    },
    _handlerJsonEditor() {
      this._destroyJsonEditor()

      // jsonEditor
      jsonEditor = codemirror('code-json-mirror', {
        mode: 'json',
        readOnly: this.isDetails
      })

      this.keypress = () => {
        if (!jsonEditor.getOption('readOnly')) {
          jsonEditor.showHint({
            completeSingle: false
          })
        }
      }

      // Monitor keyboard
      jsonEditor.on('keypress', this.keypress)

      jsonEditor.on('changes', () => {
        // this._cacheParams()
      })

      jsonEditor.setValue(this.json)

      return jsonEditor
    },
    _cacheParams() {
      this.$emit('on-cache-params', {
        dsType: this.dsType,
        dataSource: this.rtDatasource,
        dtType: this.dtType,
        dataTarget: this.rtDatatarget,
        sql: editor ? editor.getValue() : '',
        targetTable: this.targetTable,
        jobSpeedByte: this.jobSpeedByte * 1024,
        jobSpeedRecord: this.jobSpeedRecord,
        preStatements: this.preStatements,
        postStatements: this.postStatements
      })
    },
    _destroyEditor() {
      if (editor) {
        editor.toTextArea() // Uninstall
        editor.off($('.code-sql-mirror'), 'keypress', this.keypress)
        editor.off($('.code-sql-mirror'), 'changes', this.changes)
      }
    },
    _destroyJsonEditor() {
      if (jsonEditor) {
        jsonEditor.toTextArea() // Uninstall
        jsonEditor.off($('.code-json-mirror'), 'keypress', this.keypress)
        jsonEditor.off($('.code-json-mirror'), 'changes', this.changes)
      }
    }
  }
}
</script>
