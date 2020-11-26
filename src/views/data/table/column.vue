<template>
  <div class="app-container">
    <el-row>
      <el-col align="right">
        <el-button type="primary" size="mini" class="oper-btn iconoper-export" title="上移" @click="upTheCol()" />
        <el-button type="primary" size="mini" class="oper-btn iconoper-import" title="下移" @click="downTheCol()" />
        <el-button type="primary" size="mini" class="oper-btn add" title="添加" @click="addCol()" />
        <el-button type="primary" size="mini" class="oper-btn edit" title="复制" :disabled="selections.length !== 1" @click="copyCol()" />
        <el-button type="danger" size="mini" class="oper-btn delete" title="删除" :disabled="selections.length === 0" @click="delCol()" />
      </el-col>
    </el-row>
    <el-table :data="temp" height="600px" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="colName" label="字段名称" show-overflow-tooltip>
        <template slot-scope="scope" show-overflow-tooltip>
          <el-tooltip :disabled="scope.row.colName.length < 12" effect="dark" :content="scope.row.colName" placement="top">
            <el-input v-model="scope.row.colName" style="width:90%;" />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="dataType" label="数据类型">
        <template slot-scope="scope">
          <el-select ref="dataType" v-model="scope.row.dataType" filterable style="width:90%" placeholder="请选择数据类型">
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
          <el-input v-model="scope.row.dataLength" style="width:90%;" />
        </template>
      </el-table-column>
      <el-table-column prop="isNullable" label="是否为空" width="80px">
        <template slot-scope="scope">
          <el-radio v-model="scope.row.isNullable" :label="1" @click.native.prevent="clickitem(scope.$index,1)">&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column prop="colComment" label="注释" show-overflow-tooltip>
        <template slot-scope="scope" show-overflow-tooltip>
          <el-input v-model="scope.row.colComment" style="width:90%;" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getSqlType, getColsInfo } from '@/api/data/table-info'
export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ['tableId'],
  data() {
    return {
      copyColObj: {},
      selections: [],
      sqlType: [],
      temp: []
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
      getColsInfo(tableId).then(resp => {
        this.temp = resp.data
      })
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
    }
  }}
</script>
