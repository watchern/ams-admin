<template>
  <div class="app-container">
    <el-row>
      <el-col v-if="openType!== 'showTable'" align="right">
        <el-button type="primary" size="mini" class="oper-btn add" @click="addCol()" />
        <el-button type="danger" size="mini" class="oper-btn delete" :disabled="selections.length === 0" @click="delCol()" />
      </el-col>
    </el-row>
    <el-table :data="temp" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="colName" label="关联字段">
        <template slot-scope="scope">
          <el-select v-model="scope.row.colName" filterable style="width:90%" placeholder="请选择关联列">
            <el-option
              v-for="item in colNames"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="relTable" label="被关联表">
        <template slot-scope="scope">
          <el-col :span="20">
            <el-input v-model="scope.relationObjectUuid" :disabled="true" />
          </el-col>
          <el-button @click="showDataTree">选择</el-button>
        </template>
      </el-table-column>
      <el-dialog v-if="dataTableTree" :destroy-on-close="true" :append-to-body="true" :visible.sync="dataTableTree" title="请选择数据表" width="80%">
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
import { getColsInfo, selectIndexInfo } from '@/api/data/table-info'
export default {
  components: { dataTree },
  // eslint-disable-next-line vue/require-prop-types
  props: ['tableId', 'openType'],
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
      // 数据表树dialog
      dataTableTree: false,
      copyColObj: {},
      selections: [],
      sqlType: {},
      temp: []
    }
  },
  created() {
    if (this.openType !== 'addTable') {
      this.initTable(this.tableId)
    }
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
      newObj.relTable = ''
      newObj.relColName = ''
      this.temp.splice(this.temp.length, 0, newObj)
    },
    showDataTree() {
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
      this.form.relationObjectName = currentNode.label
      this.form.relationObjectUuid = currentNode.id
      this.dataTableTree = false
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
