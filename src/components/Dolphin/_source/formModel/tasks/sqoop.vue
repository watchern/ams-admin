/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div class="sql-model">

    <m-list-box>
      <div slot="text">{{ $t('Direct') }}</div>
      <div slot="content">
        <x-select
          v-model="modelType"
          style="width: 130px;"
          :disabled="isDetails"
        >
          <x-option
            v-for="city in modelTypeList"
            :key="city.code"
            :value="city.code"
            :label="city.code"
          />
        </x-select>
      </div>
    </m-list-box>

    <template>
      <m-list-box>
        <div slot="text" style="font-weight:bold">{{ $t('Data Source') }}</div>
      </m-list-box>
      <hr style="margin-left: 60px;">
      <m-list-box>
        <div slot="text">{{ $t('Type') }}</div>
        <div slot="content">
          <x-select
            v-model="sourceType"
            style="width: 130px;"
            :disabled="isDetails"
            @on-change="_handleSourceTypeChange"
          >
            <x-option
              v-for="city in sourceTypeList"
              :key="city.code"
              :value="city.code"
              :label="city.code"
            />
          </x-select>
        </div>
      </m-list-box>

      <template v-if="sourceType ==='MYSQL'">

        <m-list-box>
          <div slot="text">{{ $t('Datasource') }}</div>
          <div slot="content">
            <m-datasource
              ref="refSourceDs"
              :data="{ type:sourceMysqlParams.srcType,datasource:sourceMysqlParams.srcDatasource }"
              @on-dsData="_onSourceDsData"
            />
          </div>
        </m-list-box>

        <m-list-box>
          <div slot="text">{{ $t('ModelType') }}</div>
          <div slot="content">
            <x-radio-group v-model="srcQueryType" @on-change="_handleQueryType">
              <x-radio label="0">{{ $t('Form') }}</x-radio>
              <x-radio label="1">SQL</x-radio>
            </x-radio-group>
          </div>
        </m-list-box>

        <template v-if="sourceMysqlParams.srcQueryType=='0'">

          <m-list-box>
            <div slot="text">{{ $t('Table') }}</div>
            <div slot="content">
              <x-input
                v-model="sourceMysqlParams.srcTable"
                :disabled="isDetails"
                type="text"
                :placeholder="$t('Please enter Mysql Table(required)')"
              />
            </div>
          </m-list-box>

          <m-list-box>
            <div slot="text">{{ $t('ColumnType') }}</div>
            <div slot="content">
              <x-radio-group v-model="sourceMysqlParams.srcColumnType">
                <x-radio label="0">{{ $t('All Columns') }}</x-radio>
                <x-radio label="1">{{ $t('Some Columns') }}</x-radio>
              </x-radio-group>
            </div>
          </m-list-box>

          <m-list-box v-if="sourceMysqlParams.srcColumnType=='1'">
            <div slot="text">{{ $t('Column') }}</div>
            <div slot="content">
              <x-input
                v-model="sourceMysqlParams.srcColumns"
                :disabled="isDetails"
                type="text"
                :placeholder="$t('Please enter Columns (Comma separated)')"
              />
            </div>
          </m-list-box>
        </template>
      </template>
    </template>

    <template v-if="sourceType=='HIVE'">
      <m-list-box>
        <div slot="text">{{ $t('Database') }}</div>
        <div slot="content">
          <x-input
            v-model="sourceHiveParams.hiveDatabase"
            :disabled="isDetails"
            type="text"
            :placeholder="$t('Please enter Hive Database(required)')"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('Table') }}</div>
        <div slot="content">
          <x-input
            v-model="sourceHiveParams.hiveTable"
            :disabled="isDetails"
            type="text"
            :placeholder="$t('Please enter Hive Table(required)')"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('Hive partition Keys') }}</div>
        <div slot="content">
          <x-input
            v-model="sourceHiveParams.hivePartitionKey"
            :disabled="isDetails"
            type="text"
            :placeholder="$t('Please enter Hive Partition Keys')"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('Hive partition Values') }}</div>
        <div slot="content">
          <x-input
            v-model="sourceHiveParams.hivePartitionValue"
            :disabled="isDetails"
            type="text"
            :placeholder="$t('Please enter Hive Partition Values')"
          />
        </div>
      </m-list-box>
    </template>

    <template v-if="sourceType=='HDFS'">
      <m-list-box>
        <div slot="text">{{ $t('Export Dir') }}</div>
        <div slot="content">
          <x-input
            v-model="sourceHdfsParams.exportDir"
            :disabled="isDetails"
            type="text"
            :placeholder="$t('Please enter Export Dir(required)')"
          />
        </div>
      </m-list-box>
    </template>

    <m-list-box v-show="srcQueryType === '1' && sourceType ==='MYSQL'">
      <div slot="text">{{ $t('SQL Statement') }}</div>
      <div slot="content">
        <div class="from-mirror">
          <textarea
            id="code-sqoop-mirror"
            name="code-sqoop-mirror"
            style="opacity: 0;"
          />
        </div>
      </div>
    </m-list-box>

    <template>
      <m-list-box v-show="sourceType === 'MYSQL'">
        <div slot="text">{{ $t('Map Column Hive') }}</div>
        <div slot="content">
          <m-local-params
            ref="refMapColumnHiveParams"
            :udp-list="sourceMysqlParams.mapColumnHive"
            :hide="false"
            @on-local-params="_onMapColumnHive"
          />
        </div>
      </m-list-box>
      <m-list-box v-show="sourceType === 'MYSQL'">
        <div slot="text">{{ $t('Map Column Java') }}</div>
        <div slot="content">
          <m-local-params
            ref="refMapColumnJavaParams"
            :udp-list="sourceMysqlParams.mapColumnJava"
            :hide="false"
            @on-local-params="_onMapColumnJava"
          />
        </div>
      </m-list-box>
    </template>

    <m-list-box>
      <div slot="text" style="font-weight:bold">{{ $t('Data Target') }}</div>
    </m-list-box>
    <hr style="margin-left: 60px;">

    <m-list-box>
      <div slot="text">{{ $t('Type') }}</div>
      <div slot="content">
        <x-select
          v-model="targetType"
          style="width: 130px;"
          :disabled="isDetails"
        >
          <x-option
            v-for="city in targetTypeList"
            :key="city.code"
            :value="city.code"
            :label="city.code"
          />
        </x-select>
      </div>
    </m-list-box>
    <div v-show="targetType==='HIVE'">
      <m-list-box>
        <div slot="text">{{ $t('Database') }}</div>
        <div slot="content">
          <x-input
            v-model="targetHiveParams.hiveDatabase"
            :disabled="isDetails"
            type="text"
            :placeholder="$t('Please enter Hive Database(required)')"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('Table') }}</div>
        <div slot="content">
          <x-input
            v-model="targetHiveParams.hiveTable"
            :disabled="isDetails"
            type="text"
            :placeholder="$t('Please enter Hive Table(required)')"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('CreateHiveTable') }}</div>
        <div slot="content">
          <x-switch v-model="targetHiveParams.createHiveTable" />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('DropDelimiter') }}</div>
        <div slot="content">
          <x-switch v-model="targetHiveParams.dropDelimiter" />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('OverWriteSrc') }}</div>
        <div slot="content">
          <x-switch v-model="targetHiveParams.hiveOverWrite" />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('ReplaceDelimiter') }}</div>
        <div slot="content">
          <x-input
            v-model="targetHiveParams.replaceDelimiter"
            :disabled="isDetails"
            type="text"
            :placeholder="$t('Please enter Replace Delimiter')"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('Hive partition Keys') }}</div>
        <div slot="content">
          <x-input
            v-model="targetHiveParams.hivePartitionKey"
            :disabled="isDetails"
            type="text"
            :placeholder="$t('Please enter Hive Partition Keys')"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('Hive partition Values') }}</div>
        <div slot="content">
          <x-input
            v-model="targetHiveParams.hivePartitionValue"
            :disabled="isDetails"
            type="text"
            :placeholder="$t('Please enter Hive Partition Values')"
          />
        </div>
      </m-list-box>
    </div>
    <div v-show="targetType==='HDFS'">
      <m-list-box>
        <div slot="text">{{ $t('Target Dir') }}</div>
        <div slot="content">
          <x-input
            v-model="targetHdfsParams.targetPath"
            :disabled="isDetails"
            type="text"
            :placeholder="$t('Please enter Target Dir(required)')"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('DeleteTargetDir') }}</div>
        <div slot="content">
          <x-switch v-model="targetHdfsParams.deleteTargetDir" />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('CompressionCodec') }}</div>
        <div slot="content">
          <x-radio-group v-model="targetHdfsParams.compressionCodec">
            <x-radio label="snappy">snappy</x-radio>
            <x-radio label="lzo">lzo</x-radio>
            <x-radio label="gzip">gzip</x-radio>
            <x-radio label="">no</x-radio>
          </x-radio-group>
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('FileType') }}</div>
        <div slot="content">
          <x-radio-group v-model="targetHdfsParams.fileType">
            <x-radio label="--as-avrodatafile">avro</x-radio>
            <x-radio label="--as-sequencefile">sequence</x-radio>
            <x-radio label="--as-textfile">text</x-radio>
            <x-radio label="--as-parquetfile">parquet</x-radio>
          </x-radio-group>
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('FieldsTerminated') }}</div>
        <div slot="content">
          <x-input
            v-model="targetHdfsParams.fieldsTerminated"
            :disabled="isDetails"
            type="text"
            :placeholder="$t('Please enter Fields Terminated')"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('LinesTerminated') }}</div>
        <div slot="content">
          <x-input
            v-model="targetHdfsParams.linesTerminated"
            :disabled="isDetails"
            type="text"
            :placeholder="$t('Please enter Lines Terminated')"
          />
        </div>
      </m-list-box>
    </div>
    <div v-show="targetType==='MYSQL'">
      <m-list-box>
        <div slot="text">{{ $t('Datasource') }}</div>
        <div slot="content">
          <m-datasource
            ref="refTargetDs"
            :data="{ type:targetMysqlParams.targetType,datasource:targetMysqlParams.targetDatasource }"
            @on-dsData="_onTargetDsData"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('Table') }}</div>
        <div slot="content">
          <x-input
            v-model="targetMysqlParams.targetTable"
            :disabled="isDetails"
            type="text"
            :placeholder="$t('Please enter Mysql Table(required)')"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('Column') }}</div>
        <div slot="content">
          <x-input
            v-model="targetMysqlParams.targetColumns"
            :disabled="isDetails"
            type="text"
            :placeholder="$t('Please enter Columns (Comma separated)')"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('FieldsTerminated') }}</div>
        <div slot="content">
          <x-input
            v-model="targetMysqlParams.fieldsTerminated"
            :disabled="isDetails"
            type="text"
            :placeholder="$t('Please enter Fields Terminated')"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('LinesTerminated') }}</div>
        <div slot="content">
          <x-input
            v-model="targetMysqlParams.linesTerminated"
            :disabled="isDetails"
            type="text"
            :placeholder="$t('Please enter Lines Terminated')"
          />
        </div>
      </m-list-box>
      <m-list-box>
        <div slot="text">{{ $t('IsUpdate') }}</div>
        <div slot="content">
          <x-switch v-model="targetMysqlParams.isUpdate" />
        </div>
      </m-list-box>
      <m-list-box v-show="targetMysqlParams.isUpdate">
        <div slot="text">{{ $t('UpdateKey') }}</div>
        <div slot="content">
          <x-input
            v-model="targetMysqlParams.targetUpdateKey"
            :disabled="isDetails"
            type="text"
            :placeholder="$t('Please enter Update Key')"
          />
        </div>
      </m-list-box>
      <m-list-box v-show="targetMysqlParams.isUpdate">
        <div slot="text">{{ $t('UpdateMode') }}</div>
        <div slot="content">
          <x-radio-group v-model="targetMysqlParams.targetUpdateMode">
            <x-radio label="updateonly">{{ $t('OnlyUpdate') }}</x-radio>
            <x-radio label="allowinsert">{{ $t('AllowInsert') }}</x-radio>
          </x-radio-group>
        </div>
      </m-list-box>

    </div>
    <m-list-box>
      <div slot="text">{{ $t('Concurrency') }}</div>
      <div slot="content">
        <x-input
          v-model="concurrency"
          :disabled="isDetails"
          type="text"
          :placeholder="$t('Please enter Concurrency')"
        />
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
</template>
<script>
import _ from 'lodash'
import i18n from '@/module/i18n'
import mListBox from './_source/listBox'
import mDatasource from './_source/datasource'
import mLocalParams from './_source/localParams'
import disabledState from '@/module/mixin/disabledState'
import codemirror from '@/components/Dolphin/file/codemirror'

let editor

export default {
  name: 'Sql',
  components: { mListBox, mDatasource, mLocalParams },
  mixins: [disabledState],
  props: {
    backfillItem: Object
  },
  data() {
    return {

      /**
         * Customer Params
         */
      localParams: [],
      /**
         * mysql query type
         */
      srcQueryType: '1',
      /**
         * source data source
         */
      srcDatasource: '',
      /**
         * target data source
         */
      targetDatasource: '',
      /**
         * concurrency
         */
      concurrency: 1,
      /**
         * direct model type
         */
      modelType: 'import',

      modelTypeList: [{ code: 'import' }, { code: 'export' }],

      sourceTypeList: [
        {
          code: 'MYSQL'
        },
        {
          code: 'HDFS'
        },
        {
          code: 'HIVE'
        }
      ],

      targetTypeList: [
        {
          code: 'HIVE'
        },
        {
          code: 'HDFS'
        }
      ],

      sourceType: 'MYSQL',
      targetType: 'HDFS',

      sourceMysqlParams: {
        srcType: 'MYSQL',
        srcDatasource: '',
        srcTable: '',
        srcQueryType: '1',
        srcQuerySql: '',
        srcColumnType: '0',
        srcColumns: '',
        srcConditionList: [],
        mapColumnHive: [],
        mapColumnJava: []
      },

      sourceHdfsParams: {
        exportDir: ''
      },

      sourceHiveParams: {
        hiveDatabase: '',
        hiveTable: '',
        hivePartitionKey: '',
        hivePartitionValue: ''
      },

      targetHdfsParams: {
        targetPath: '',
        deleteTargetDir: true,
        fileType: '--as-avrodatafile',
        compressionCodec: 'snappy',
        fieldsTerminated: '',
        linesTerminated: ''
      },

      targetMysqlParams: {
        targetType: 'MYSQL',
        targetDatasource: '',
        targetTable: '',
        targetColumns: '',
        fieldsTerminated: '',
        linesTerminated: '',
        preQuery: '',
        isUpdate: false,
        targetUpdateKey: '',
        targetUpdateMode: 'allowinsert'
      },

      targetHiveParams: {
        hiveDatabase: '',
        hiveTable: '',
        createHiveTable: false,
        dropDelimiter: false,
        hiveOverWrite: true,
        replaceDelimiter: '',
        hivePartitionKey: '',
        hivePartitionValue: ''

      }
    }
  },

  computed: {
    cacheParams() {
      return {
        concurrency: this.concurrency,
        modelType: this.modelType,
        sourceType: this.sourceType,
        targetType: this.targetType,
        localParams: this.localParams,
        sourceMysqlParams: this.sourceMysqlParams,
        sourceHdfsParams: this.sourceHdfsParams,
        sourceHiveParams: this.sourceHiveParams,
        targetHdfsParams: this.targetHdfsParams,
        targetMysqlParams: this.targetMysqlParams,
        targetHiveParams: this.targetHiveParams
      }
    }
  },
  watch: {
    // Listening to sqlType
    sqlType(val) {
      if (val == 0) {
        this.showType = []
      }
      if (val != 0) {
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
    this._destroyEditor()
    const o = this.backfillItem

    // Non-null objects represent backfill
    if (!_.isEmpty(o)) {
      this.concurrency = o.params.concurrency || 1,
      this.modelType = o.params.modelType,
      this.sourceType = o.params.sourceType,
      this._getTargetTypeList(this.sourceType)
      this.targetType = o.params.targetType,
      this._getSourceParams(o.params.sourceParams),
      this._getTargetParams(o.params.targetParams),
      this.localParams = o.params.localParams
    }
  },

  mounted() {
    setTimeout(() => {
      this._handlerEditor()
    }, 200)

    setTimeout(() => {
      this.srcQueryType = this.sourceMysqlParams.srcQueryType
    }, 500)
  },

  destroyed() {
    /**
       * Destroy the editor instance
       */
    if (editor) {
      editor.toTextArea() // Uninstall
      editor.off($('.code-sqoop-mirror'), 'keypress', this.keypress)
      editor.off($('.code-sqoop-mirror'), 'changes', this.changes)
      editor = null
    }
  },
  methods: {

    _handleQueryType(o) {
      this.sourceMysqlParams.srcQueryType = this.srcQueryType
    },

    _handleSourceTypeChange(a) {
      this._getTargetTypeList(a.label)
      this.targetType = this.targetTypeList[0].code
    },

    _getTargetTypeList(data) {
      switch (data) {
        case 'MYSQL':
          this.targetTypeList = [
            {
              code: 'HIVE'
            },
            {
              code: 'HDFS'
            }
          ]
          break
        case 'HDFS':
          this.targetTypeList = [
            {
              code: 'MYSQL'
            }
          ]
          break
        case 'HIVE':
          this.targetTypeList = [
            {
              code: 'MYSQL'
            }
          ]
          break
        default:
          this.targetTypeList = [
            {
              code: 'HIVE'
            },
            {
              code: 'HDFS'
            }
          ]
          break
      }
    },

    _onMapColumnHive(a) {
      this.sourceMysqlParams.mapColumnHive = a
      console.log(this.sourceMysqlParams.mapColumnHive)
    },

    _onMapColumnJava(a) {
      this.sourceMysqlParams.mapColumnJava = a
      console.log(this.sourceMysqlParams.mapColumnJava)
    },

    /**
       * return data source
       */
    _onSourceDsData(o) {
      this.sourceMysqlParams.srcType = o.type
      this.sourceMysqlParams.srcDatasource = o.datasource
    },

    /**
       * return data source
       */
    _onTargetDsData(o) {
      this.targetMysqlParams.targetType = o.type
      this.targetMysqlParams.targetDatasource = o.datasource
    },

    /**
      * stringify the source params
      */
    _handleSourceParams() {
      var params = null
      switch (this.sourceType) {
        case 'MYSQL':
          this.sourceMysqlParams.srcQuerySql = editor ? editor.getValue() : this.sourceMysqlParams.srcQuerySql
          params = JSON.stringify(this.sourceMysqlParams)
          break
        case 'ORACLE':
          params = JSON.stringify(this.sourceOracleParams)
          break
        case 'HDFS':
          params = JSON.stringify(this.sourceHdfsParams)
          break
        case 'HIVE':
          params = JSON.stringify(this.sourceHiveParams)
          break
        default:
          params = ''
          break
      }
      return params
    },

    /**
      * stringify the target params
      */
    _handleTargetParams() {
      var params = null
      switch (this.targetType) {
        case 'HIVE':
          params = JSON.stringify(this.targetHiveParams)
          break
        case 'HDFS':
          params = JSON.stringify(this.targetHdfsParams)
          break
        case 'MYSQL':
          params = JSON.stringify(this.targetMysqlParams)
          break
        default:
          params = ''
          break
      }

      return params
    },

    /**
       * get source params by source type
       */
    _getSourceParams(data) {
      switch (this.sourceType) {
        case 'MYSQL':
          this.sourceMysqlParams = JSON.parse(data)
          this.srcDatasource = this.sourceMysqlParams.srcDatasource
          break
        case 'ORACLE':
          this.sourceOracleParams = JSON.parse(data)
          break
        case 'HDFS':
          this.sourceHdfsParams = JSON.parse(data)
          break
        case 'HIVE':
          this.sourceHiveParams = JSON.parse(data)
          break
        default:
          break
      }
    },

    /**
       * get target params by target type
       */
    _getTargetParams(data) {
      switch (this.targetType) {
        case 'HIVE':
          this.targetHiveParams = JSON.parse(data)
          break
        case 'HDFS':
          this.targetHdfsParams = JSON.parse(data)
          break
        case 'MYSQL':
          this.targetMysqlParams = JSON.parse(data)
          this.targetDatasource = this.targetMysqlParams.targetDatasource
          break
        default:
          break
      }
    },

    /**
       * verification
       */
    _verification() {
      switch (this.sourceType) {
        case 'MYSQL':
          if (!this.$refs.refSourceDs._verifDatasource()) {
            return false
          }
          if (this.srcQueryType === '1') {
            if (!editor.getValue()) {
              this.$message.warning(`${i18n.$t('Please enter a SQL Statement(required)')}`)
              return false
            }
          } else {
            if (this.sourceMysqlParams.srcTable === '') {
              this.$message.warning(`${i18n.$t('Please enter Mysql Table(required)')}`)
              return false
            }

            if (this.sourceMysqlParams.srcColumnType === '1' && this.sourceMysqlParams.srcColumns === '') {
              this.$message.warning(`${i18n.$t('Please enter Columns (Comma separated)')}`)
              return false
            }
          }

          break
        case 'HDFS':
          if (this.sourceHdfsParams.exportDir === '') {
            this.$message.warning(`${i18n.$t('Please enter Export Dir(required)')}`)
            return false
          }
          break
        case 'HIVE':
          if (this.sourceHiveParams.hiveDatabase === '') {
            this.$message.warning(`${i18n.$t('Please enter Hive Database(required)')}`)
            return false
          }
          if (this.sourceHiveParams.hiveTable === '') {
            this.$message.warning(`${i18n.$t('Please enter Hive Table(required)')}`)
            return false
          }
          break
        default:
          break
      }

      switch (this.targetType) {
        case 'HIVE':
          if (this.targetHiveParams.hiveDatabase === '') {
            this.$message.warning(`${i18n.$t('Please enter Hive Database(required)')}`)
            return false
          }
          if (this.targetHiveParams.hiveTable === '') {
            this.$message.warning(`${i18n.$t('Please enter Hive Table(required)')}`)
            return false
          }
          break
        case 'HDFS':
          if (this.targetHdfsParams.targetPath === '') {
            this.$message.warning(`${i18n.$t('Please enter Target Dir(required)')}`)
            return false
          }
          break
        case 'MYSQL':
          if (!this.$refs.refTargetDs._verifDatasource()) {
            return false
          }

          if (this.targetMysqlParams.targetTable === '') {
            this.$message.warning(`${i18n.$t('Please enter Mysql Table(required)')}`)
            return false
          }
          break
        default:
          break
      }

      // storage
      this.$emit('on-params', {
        concurrency: this.concurrency,
        modelType: this.modelType,
        sourceType: this.sourceType,
        targetType: this.targetType,
        sourceParams: this._handleSourceParams(),
        targetParams: this._handleTargetParams(),
        localParams: this.localParams
      })
      return true
    },

    /**
       * Processing code highlighting
       */
    _handlerEditor() {
      this._destroyEditor()

      editor = codemirror('code-sqoop-mirror', {
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

      this.changes = () => {
        this._cacheParams()
      }

      // Monitor keyboard
      editor.on('keypress', this.keypress)

      editor.on('changes', this.changes)

      editor.setValue(this.sourceMysqlParams.srcQuerySql)

      return editor
    },

    /**
       * return localParams
       */
    _onLocalParams(a) {
      this.localParams = a
    },

    _cacheParams() {
      this.$emit('on-cache-params', {
        concurrency: this.concurrency,
        modelType: this.modelType,
        sourceType: this.sourceType,
        targetType: this.targetType,
        sourceParams: this._handleSourceParams(),
        targetParams: this._handleTargetParams(),
        localParams: this.localParams
      })
    },

    _destroyEditor() {
      if (editor) {
        editor.toTextArea() // Uninstall
        editor.off($('.code-sqoop-mirror'), 'keypress', this.keypress)
        editor.off($('.code-sqoop-mirror'), 'changes', this.changes)
        editor = null
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

