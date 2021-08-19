<template>
  <div class="app-container">
    <el-row>
      <el-col v-if="openType !== 'showTable' && openType !== 'tableRegister'" align="right">
        <el-button type="primary" size="mini" class="oper-btn add" @click="addCol()" />
        <el-button type="primary" size="mini" class="oper-btn delete" :disabled="selections.length === 0" @click="delCol()" />
      </el-col>
    </el-row>
    <!-- 如果进行查看 -->
    <el-table
      v-if="openType === 'showTable' || openType === 'tableRegister'"
      :data="temp"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="表名称" width="150px" prop="tbName" />
      <el-table-column label="字段名称" width="150px" prop="colName" />
      <el-table-column label="从表名称" width="200px" prop="relationTableName" />
      <el-table-column label="关联字段" width="150px" prop="relationCol" />
      <el-table-column label="关联关系" align="center" prop="sqlGenJoinType" :formatter="formatSqlGenJoinType" />
      <el-table-column label="过滤条件" prop="describtion">
        <template v-if="scope.row.sqlGenOnStr!=null && scope.row.sqlGenOnStr.length>0" slot-scope="scope">
          <el-popover trigger="hover" placement="top" width="500">
            <el-row>
              <el-col :span="24">
                {{ scope.row.sqlGenOnStr }}
              </el-col>
            </el-row>
            <div slot="reference" class="name-wrapper">
              <!-- <el-tag><i class="el-icon-tickets" /></el-tag> -->
              <el-link :underline="false" type="primary">查看过滤</el-link>
            </div>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <!-- 如果进行关联操作 -->
    <el-table v-if="openType !== 'showTable' && openType !== 'tableRegister'" :data="temp" max-height="500px" @selection-change="handleSelectionChange" class="detail-form">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="colMetaUuid" label="关联字段">
        <template slot-scope="scope">
          <el-select v-model="scope.row.colMetaUuid" filterable style="width:90%" placeholder="请选择关联列">
            <el-option
              v-for="item in colNames"
              :key="item.colMetaUuid"
              :label="item.colName"
              :value="item.colMetaUuid"
              :disabled="item.disabled"
            />
          </el-select>
        </template>
      </el-table-column>
      <!-- <el-table :data="temp.relationObject"> -->
      <el-table-column prop="relTableMetaUuid" label="从表名称">
        <template slot-scope="scope">
          <el-row>
            <el-col :span="16">
              <el-input v-model="scope.row.relTableMetaUuid" style="display: none" :disabled="true" />
              <el-input v-model="scope.row.relationTableName" :disabled="true" />
            </el-col>
            <el-col :span="6">
              <el-button size="mini" style="padding:10px;" @click="showDataTree(scope.row.index)">选择</el-button>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column prop="relColMetaUuid" label="关联字段">
        <template slot-scope="scope">
          <el-select v-model="scope.row.relColMetaUuid" filterable style="width:90%" placeholder="请选择关联列">
            <el-option
              v-for="item in scope.row.relationCols"
              :key="item.colMetaUuid"
              :label="item.colName"
              :value="item.colMetaUuid"
              :disabled="item.disabled"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="sqlGenJoinType" label="关联关系">
        <template slot-scope="scope">
          <el-select v-model="scope.row.sqlGenJoinType" filterable style="width:90%" placeholder="请选择关联关系">
            <el-option
              v-for="item in sqlJoinCols"
              :key="item.sqlGenJoinType"
              :label="item.sqlGenJoinName"
              :value="item.sqlGenJoinType"
              :disabled="item.disabled"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="过滤条件" align="center" prop="sqlGenOnStr">
        <template slot-scope="scope">
          <el-row>
            <el-col :span="5">
              <el-popover trigger="hover" placement="top" width="500">
                <el-row>
                  <el-col :span="24">
                    {{ scope.row.sqlGenOnStr }}
                  </el-col>
                </el-row>
                <div slot="reference" class="name-wrapper">
                  <!-- <el-tag><i class="el-icon-tickets" /></el-tag> -->
                  <el-link :underline="false" type="primary">查看过滤</el-link>
                </div>
              </el-popover>
              <el-input v-show="false" v-model="scope.row.sqlGenOnStrJson " :disabled="true" />
            </el-col>
            <el-button @click="openQueryBuilder(scope.row.index)">设置</el-button>
          </el-row>
          <el-dialog title="条件设置" :visible.sync="queryBuilderDialogVisible" width="30%" :append-to-body="true" :close-on-click-modal="false">
            <myQueryBuilder
              v-if="queryBuilderDialogVisible"
              ref="myQueryBuilder"
              :columns="columnList"
              :data="queryBuilderJson"
              :inputselectvalue="scope.row.outputColum"
            />
            <span slot="footer" class="dialog-footer">
              <el-button @click="queryBuilderDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="queryCondition">确定</el-button>
            </span>
          </el-dialog>
        </template>
      </el-table-column>
      <!-- </el-table> -->
      <el-dialog v-if="dataTableTree" :destroy-on-close="true" :append-to-body="true" :visible.sync="dataTableTree" title="请选择数据表" width="80%" :close-on-click-modal="false">
        <data-tree ref="dataTableTree" :data-user-id="dataUserId" :scene-code="sceneCode" />
        <div slot="footer">
          <el-button tvype="primary" @click="getDataTable">确定</el-button>
          <el-button @click="dataTableTree = false">取消</el-button>
        </div>
      </el-dialog>
    </el-table>
  </div>
</template>

<script>
import dataTree from '@/views/data/role-res/data-tree'
import myQueryBuilder from '@/views/analysis/auditmodelresult/myquerybuilder'
import { getColsInfo } from '@/api/data/table-info'
import { saveTableRelation, getById } from '@/api/data/tablerelation'
export default {
  components: { dataTree, myQueryBuilder },
  // eslint-disable-next-line vue/require-prop-types
  props: ['tableId', 'openType'],
  data() {
    return {
      sceneCode: 'auditor',
      dataUserId: this.$store.getters.personcode,
      columnList: {},
      relTableColumn: [],
      currentFilterInputId: '',
      queryBuilderJson: {},
      // 关联类型为数据表时，记录当前input框的值
      inputValue: {},
      // 关联类型为数据表时，记录当前input框的JSON值 主要用于queryBuilder反显
      inputValueJson: {},
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
      options: [{
        value: 'NORMAL',
        label: 'NORMAL'

      },
      {
        value: 'BITMAP',
        label: 'BITMAP'
      }
      ],
      // 数据表树dialog
      dataTableTree: false,
      queryBuilderDialogVisible: false,
      copyColObj: {},
      selections: [],
      sqlType: {},
      temp: [],
      tempItemInd: 0,
      curItempItemInd: 0
    }
  },
  created() {
    if (this.openType !== 'addTable') {
      this.initTable(this.tableId)
    }
  },
  methods: {
    initTable(tableId) {
      this.temp = []
      getById(tableId).then(resp => {
        this.temp = resp.data
        console.log(this.temp)
        this.temp.forEach(element => {
          element.index = this.tempItemInd
          this.tempItemInd++
        })
      })
      getColsInfo(tableId).then(resp => {
        this.colNames = resp.data.colMetas
        var columObjs = []
        resp.data.colMetas.forEach(r => {
          var columObj = {}
          columObj.columnType = r.dataType
          columObj.columnName = r.colName
          columObjs.push(columObj)
        })
        this.columnList.columnList = columObjs
      })
    },
    queryCondition() {
      const obj = this.$refs.myQueryBuilder.getSelectSql()
      this.queryBuilderDialogVisible = false
      this.setFilter(obj.sql, JSON.stringify(obj.queryJson))
    },
    setFilter(sql, queryJson) {
      debugger
      this.temp[this.currentFilterInputId].sqlGenOnStr = sql
      this.temp[this.currentFilterInputId].sqlGenOnStrJson = queryJson
    },
    handleSelectionChange(val) {
      this.selections = val
    },
    addCol() {
      var newObj = {} // copy obj
      newObj.index = this.tempItemInd
      newObj.colMetaUuid = ''
      newObj.relTableMetaUuid = ''
      newObj.relationTableName = ''
      newObj.relColMetaUuid = ''
      newObj.relationCol = ''
      newObj.relationCols = [{ colMetaUuid: '', colName: '' }]
      newObj.sqlGenJoinType = null
      newObj.sqlGenOnStr = ''
      newObj.sqlGenOnStrJson = ''
      newObj.outputColum = []
      this.temp.push(newObj)
      this.tempItemInd++
    },
    showDataTree(ind) {
      this.curItempItemInd = ind
      this.dataTableTree = true
    },
    delCol() {
      this.selections.forEach((r, i) => {
        var index = this.temp.findIndex(v => JSON.stringify(v) === JSON.stringify(r))
        this.temp.splice(index, 1)
      })
    },
    getDataTable() {
      const dataTree = this.$refs.dataTableTree.getTree()
      const currentNode = dataTree.getCurrentNode()
      if (currentNode.type !== 'table') {
        this.$message({ type: 'info', message: '请选择数据表!' })
        return
      }
      this.loadTableCol(currentNode.id)
      const tempItem = this.temp.find(item => item.index === this.curItempItemInd)
      if (typeof tempItem !== 'undefined') {
        tempItem.relationTableName = currentNode.label
        tempItem.relTableMetaUuid = currentNode.id
        tempItem.tableMetaUuid = this.tableId
        getColsInfo(currentNode.id).then(resp => {
          tempItem.relationCols = resp.data.colMetas
          resp.data.colMetas.forEach(r => {
            var columObj = {}
            columObj.columnType = r.dataType
            columObj.outputColumnName = r.colName
            tempItem.outputColum.push(columObj)
          })
        })
      }
      this.dataTableTree = false
    },
    formatSqlGenJoinType(row) {
      let sqlGenJoinType = ''
      switch (row.sqlGenJoinType) {
        case 1:
          sqlGenJoinType = 'left join'
          break
        case 2:
          sqlGenJoinType = 'right join'
          break
        case 3:
          sqlGenJoinType = 'full join'
          break
        case 4:
          sqlGenJoinType = 'inner join'
          break
      }
      return sqlGenJoinType
    },
    loadTableCol(id) {
      // 获取选中表的列id，列名称等信息
      getColsInfo(id).then(result => {
        if (result.data == null) {
          this.$message({ type: 'info', message: '加载数据表列失败!' })
          return
        }
        this.relTableColumn = result.data
      })
    },
    openQueryBuilder(id) {
      if (this.temp[id].sqlGenOnStrJson !== '') {
        this.queryBuilderJson = JSON.parse(this.temp[id].sqlGenOnStrJson)
      }
      this.queryBuilderDialogVisible = true
      this.currentFilterInputId = id
    },
    saveTableRelation() {
      saveTableRelation(this.temp).then(() => {
        this.$notify({
          title: '成功',
          message: '保存成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    clickitem(row, e) {
      // 当点击已经选中的把 onlyIndex 置0，就是取消选中，并返回
      if (this.temp[row].onlyIndex === e) {
        this.temp[row].onlyIndex = '0'
        return
      }
      // 不是选中，选中当前点击 Radio
      this.temp[row].onlyIndex = e
    }
  }}
</script>
