<template>
  <div class="app-container">
    <el-row>
      <el-col align="right">
        <el-button type="primary" size="mini" class="oper-btn add" title="添加" @click="addCol()" />
        <el-button type="danger" size="mini" class="oper-btn delete" title="删除" :disabled="selections.length === 0" @click="delCol()" />
      </el-col>
    </el-row>
    <el-table :data="temp" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="indexName" label="名称" show-overflow-tooltip>
        <template slot-scope="scope" show-overflow-tooltip>
          <el-tooltip :disabled="scope.row.indexName.length < 12" effect="dark" :content="scope.row.indexName" placement="top">
            <el-input v-model="scope.row.indexName" style="width:90%;" />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="indexType" label="类型">
        <template slot-scope="scope">
          <el-select v-model="scope.row.indexType" filterable style="width:90%" placeholder="请选择索引类型">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="columnName" label="列" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-select ref="columnName" v-model="scope.row.columnName" filterable style="width:90%" placeholder="请选择列">
            <el-option
              v-for="item in sqlType"
              :key="item.colName"
              :label="item.colName"
              :value="item.colName"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="onlyIndex" label="是否唯一" width="80px">
        <template slot-scope="scope">
          <el-radio-group v-model="scope.row.onlyIndex">
            <el-radio :label="'1'" @click.native.prevent="clickitem(scope.$index,'1')">&nbsp;</el-radio>
          </el-radio-group>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getColsInfo, selectIndexInfo } from '@/api/data/table-info'
export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ['tableId'],
  data() {
    return {
      options: [{
        value: 'NORMAL',
        label: 'NORMAL'

      },
      {
        value: 'BITMAP',
        label: 'BITMAP'
      }
      ],
      copyColObj: {},
      selections: [],
      sqlType: {},
      temp: []
    }
  },
  created() {
    this.initTable(this.tableId)
  },
  methods: {
    initTable(tableId) {
      selectIndexInfo(tableId).then(resp => {
        this.temp = resp.data
      })
      getColsInfo(tableId).then(resp => {
        this.sqlType = resp.data
      })
    },
    handleSelectionChange(val) {
      this.selections = val
    },
    addCol() {
      var newObj = {} // copy obj
      newObj.indexName = ''
      newObj.indexType = 'NORMAL'
      newObj.columnName = ''
      newObj.onlyIndex = '0'
      this.temp.splice(this.temp.length, 0, newObj)
    },
    delCol() {
      this.selections.forEach((r, i) => {
        var index = this.temp.findIndex(v => JSON.stringify(v) === JSON.stringify(r))
        this.temp.splice(index, 1)
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
