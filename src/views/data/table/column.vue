<template>
  <div class="app-container">
    <el-row>
      <el-col v-if="openType !== 'showTable'" align="right">
        <el-button type="primary" size="mini" class="oper-btn iconoper-export" title="上移" @click="upTheCol()" />
        <el-button type="primary" size="mini" class="oper-btn iconoper-import" title="下移" @click="downTheCol()" />
        <el-button type="primary" size="mini" class="oper-btn add" title="添加" @click="addCol()" />
        <el-button type="primary" size="mini" class="oper-btn edit" title="复制" :disabled="selections.length !== 1" @click="copyCol()" />
        <el-button type="danger" size="mini" class="oper-btn delete" title="删除" :disabled="selections.length === 0" @click="delCol()" />
      </el-col>
    </el-row>
    <template v-if="openType !== 'showTable'" class="detail-form">
      <el-form
        ref="dataForm"
        :model="tempTable"
      >
        <el-form-item label="表名称" prop="tableName">
          <el-input v-model="tempTable.tableName" />
        </el-form-item>
        <el-form-item v-if="openType !== 'addTable'" label="新建表注释" prop="tableComment">
          <el-input v-model="tempTable.tableComment" />
        </el-form-item>
      </el-form>
    </template>
    <el-table :data="temp" height="600px" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="colName" label="字段名称" show-overflow-tooltip>
        <template slot-scope="scope" show-overflow-tooltip>
          <el-tooltip :disabled="scope.row.colName.length < 12" effect="dark" :content="scope.row.colName" placement="top">
            <el-input v-model="scope.row.colName" style="width:90%;" :disabled="openType === 'showTable'" />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="dataType" label="数据类型">
        <template slot-scope="scope">
          <el-select ref="dataType" v-model="scope.row.dataType" :disabled="openType === 'showTable'" filterable style="width:90%" placeholder="请选择数据类型">
            <el-option
              v-for="item in sqlType"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="dataLength" label="数据长度" show-overflow-tooltip>
        <template slot-scope="scope" show-overflow-tooltip>
          <el-input v-model="scope.row.dataLength" style="width:90%;" :disabled="openType === 'showTable'" />
        </template>
      </el-table-column>
      <el-table-column prop="isNullable" label="是否为空" width="80px">
        <template slot-scope="scope">
          <el-radio v-model="scope.row.isNullable" :disabled="openType === 'showTable'" :label="1" @click.native.prevent="clickitem(scope.$index,1)"><span /></el-radio>
        </template>
      </el-table-column>
      <el-table-column v-if="openType !== 'addTable'" prop="colComment" label="注释" show-overflow-tooltip>
        <template slot-scope="scope" show-overflow-tooltip>
          <el-input v-model="scope.row.colComment" :disabled="openType === 'showTable'" style="width:90%;" />
        </template>
      </el-table-column>
    </el-table>
    <el-button v-if="openType !== 'showTable'" type="primary" style="float:right;margin-top:20px" @click="openType==='addTable'?saveTable():updateTable()">保存</el-button>
  </div>
</template>

<script>
import { getSqlType, getColsInfo } from '@/api/data/table-info'
import { getExecuteTask } from '@/api/analysis/sqleditor/sqleditor'
export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ['tableId', 'openType', 'forderId'],
  data() {
    return {
      copyColObj: {},
      selections: [],
      sqlType: {},
      temp: [],
      tempColumn: [],
      tempTable: {}
    }
  },
  created() {
    this.initTable(this.tableId)
  },
  methods: {
    initTable(tableId) {
      getSqlType().then(resp => {
        this.sqlType = resp.data
      })
      if (this.openType !== 'addTable') {
        getColsInfo(tableId).then(resp => {
          // 返回两个新的数组
          this.tempColumn = resp.data.slice()
          this.temp = JSON.parse(JSON.stringify(resp.data))
        })
      }
    },
    handleSelectionChange(val) {
      this.selections = val
    },
    upTheCol() {
      var rulObj = Object.assign({}, this.selections[0]) // copy obj
      var index = this.temp.findIndex(v => JSON.stringify(v) === JSON.stringify(rulObj))
      this.temp.splice(index - 1, 0, rulObj)
      this.temp.splice(index + 1, 1)
      this.selections = rulObj
      // var rulObj = Object.assign({}, this.selections[0]) // copy obj
      // var index = this.temp.findIndex(v => JSON.stringify(v) === JSON.stringify(rulObj))
      // if (this.temp.length > 1 && index !== 0) {
      //   var tempObj = this.temp[index - 1]
      //   this.temp[index - 1] = this.temp[index]
      //   this.temp[index] = tempObj
      // }
    },
    downTheCol() {
      var rulObj = Object.assign({}, this.selections[0]) // copy obj
      var index = this.temp.findIndex(v => JSON.stringify(v) === JSON.stringify(rulObj))
      this.temp.splice(index - 1, 0, rulObj)
      this.temp.splice(index + 1, 1)
      this.selections = rulObj
      // var rulObj = Object.assign({}, this.selections[0]) // copy obj
      // var index = this.temp.findIndex(v => JSON.stringify(v) === JSON.stringify(rulObj))
      // if (this.temp.length > 1 && index !== this.temp.length - 1) {
      //   var tempObj = this.temp[index + 1] // 以c为基点
      //   this.temp[index + 1] = this.temp[index]
      //   this.temp[index] = tempObj
      // }
    },
    addCol() {
      var newObj = {} // copy obj
      newObj.colName = ''
      newObj.dataType = 'VARCHAR2'
      newObj.dataLength = ''
      newObj.isNullable = 0
      newObj.colComment = ''
      this.temp.splice(this.temp.length, 0, newObj)
    },
    delCol() {
      this.selections.forEach((r, i) => {
        var index = this.temp.findIndex(v => JSON.stringify(v) === JSON.stringify(r))
        this.temp.splice(index, 1)
      })
    },
    copyCol() {
      this.copyColObj = Object.assign({}, this.selections[0])
      this.temp.splice(this.temp.length, 0, this.copyColObj)
    },
    clickitem(row, e) {
      // 当点击已经选中的把 isNullable 置0，就是取消选中，并返回
      if (this.temp[row].isNullable === e) {
        this.temp[row].isNullable = 0
        return
      }
      // 不是选中，选中当前点击 Radio
      this.temp[row].isNullable = e
    },
    // 保存基本信息
    saveTable() {
      var sql = 'create table ' + this.tempTable.tableName + ' (' + '\n'
      // var tableComments = '\n'
      // if (this.tempTable.tableComment !== null) {
      //   tableComments = tableComments + '\n' + 'comment on table ' + this.tempTable.tableName + ' is ' + "'" + this.tempTable.tableComment + "';"
      // }
      for (let index = 0; index < this.temp.length; index++) {
        const r = this.temp[index]
        if (r.isNullable === 0) {
          r.isNullable = 'NULL'
        } else {
          r.isNullable = 'NOT NULL'
        }
        if (r.dataLength !== '') {
          r.dataType = r.dataType + '(' + r.dataLength + ') '
        }
        // if (r.colComment !== '') {
        //   tableComments = tableComments + '\n' + 'comment on column ' + this.tempTable.tableName + '.' + r.colName + ' is ' + "'" + r.colComment + "';"
        // }
        if (index < this.temp.length - 1) {
          sql = sql + r.colName + ' ' + r.dataType + ' ' + r.isNullable + ',' + '\n'
        } else {
          sql = sql + r.colName + ' ' + r.dataType + ' ' + r.isNullable + '  );'
        }
      }
      // sql = sql + tableComments
      var sqlObj = {}
      sqlObj.sqls = sql
      sqlObj.isExistParam = false
      sqlObj.businessField = 'createResourceTable'
      sqlObj.modelResultSavePathId = this.forderId
      getExecuteTask(sqlObj).then((result) => {
        this.$notify({
          title: '成功',
          message: '创建成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      }).catch((result) => {
        this.executeLoading = false
      })
      // saveTableCols(sql).then(() => {
      //   this.getList()
      //   this.dialogFormVisible = false
      //   this.$notify({
      //     title: '成功',
      //     message: '创建成功',
      //     type: 'success',
      //     duration: 2000,
      //     position: 'bottom-right'
      //   })
      // })
    },
    updateTable() {
      var newColumn = this.arrRemoveMix(this.temp, this.tempColumn)
      var oldColumn = this.arrRemoveMix(this.tempColumn, this.temp)
      // 修改字段类型sql
      var modify = ''
      // 新增字段sql
      var add = ''
      // 重命名字段sql
      var alter = ''
      // 删除字段sql
      var drop = ''
      var sql = 'ALTER TABLE ' + this.tempTable.tableName + ' (' + '\n'
      for (let index = 0; index < newColumn.length; index++) {
        const r = newColumn[index]
        if (typeof r.colMetaUuid === 'undefined') {
          if (r.isNullable === 0) {
            r.isNullable = 'NULL'
          } else {
            r.isNullable = 'NOT NULL'
          }
          if (r.dataLength !== '') {
            r.dataType = r.dataType + '(' + r.dataLength + ') '
          }
          add = add + 'ADD ( "' + r.colName + '" ' + r.dataType + ' ' + r.isNullable + ' ) ;' + '\n'
        } else {
          var oldCol = oldColumn.filter(obj => { return obj.colMetaUuid === r.colMetaUuid })
          var reNameArr = oldColumn.filter(obj => { return obj.colName === r.colName })
          if (r.isNullable === 0) {
            r.isNullable = 'NULL'
          } else {
            r.isNullable = 'NOT NULL'
          }
          if (r.dataLength !== '') {
            r.dataType = r.dataType + '(' + r.dataLength + ') '
          }
          // 如果初始表列id在最终保存修改中找不到,说明该列已经重命名
          if (reNameArr.length === 0) {
            alter = alter + 'ALTER TABLE "' + this.tempTable.tableName + '" RENAME COLUMN"' + oldCol[0].colName + '" TO "' + r.colName + '";' + '\n'
            modify = modify + 'MODIFY ( "' + oldCol[0].colName + '" ' + r.dataType + ' ' + r.isNullable + ' ) ;' + '\n'
          } else {
            modify = modify + 'MODIFY ( "' + r.colName + '" ' + r.dataType + ' ' + r.isNullable + ' ) ;' + '\n'
          }
        }
      }

      for (let index = 0; index < oldColumn.length; index++) {
        const r = oldColumn[index]
        if (typeof r.colMetaUuid !== 'undefined') {
          var dropArr = newColumn.filter(obj => { return obj.colMetaUuid === r.colMetaUuid })
          // 如果初始表列id在最终保存修改中找不到,说明该列已经被删除
          if (dropArr.length === 0) {
            drop = drop + 'ALTER TABLE "' + this.tempTable.tableName + '" DROP("' + r.colName + '");' + '\n'
          }
        }
      }
      sql = modify + add + drop + alter
      console.log(sql)
    },
    arrRemoveMix(arr1, arr2) {
      return this.filterData(this.arrayDifference(arr1, arr2))
    },
    arrayDifference(a, b) { // 差集 a - b
      const clone = a.slice(0) // clone = a
      for (let i = 0; i < b.length; i++) {
        const temp = b[i]
        for (var j = 0; j < clone.length; j++) {
          // eslint-disable-next-line eqeqeq
          if (this.isObjectValueEqual(temp, clone[j])) {
            clone.splice(j, 1) // remove clone[j]
          }
        }
      }
      return clone
    },
    filterData(array) { // 去重
      return Array.from(new Set(array))
    },
    // 判断两个对象的值是否都相同
    isObjectValueEqual(a, b) {
      // 取对象a和b的属性名
      var aProps = Object.getOwnPropertyNames(a)
      var bProps = Object.getOwnPropertyNames(b)
      // 判断属性名的length是否一致
      if (aProps.length !== bProps.length) {
        return false
      }
      // 循环取出属性名，再判断属性值是否一致
      for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i]
        if (propName !== '__ob__') {
          if (a[propName] !== b[propName]) {
            return false
          }
        }
      }
      return true
    }
  }}
</script>
