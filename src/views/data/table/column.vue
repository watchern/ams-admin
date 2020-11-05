<template>
  <div class="app-container">
    <div>
      <div class="detail-form">
        <el-table :data="temp" height="200">
          <el-table-column prop="codeValue" label="真实值" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-input v-if="scope.row.start !='0' || scope.row.start == undefined" v-model="scope.row.codeValue" style="width:90%;" />
              <el-input v-if="scope.row.start =='0'" v-model="tableInput.transColRels.codeValue" style="width:90%;" />
            </template>
          </el-table-column>
          <el-table-column prop="transValue" label="转码值" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-input v-if="scope.row.start !='0' || scope.row.start == undefined" v-model="scope.row.transValue" style="width:90%;" />
              <el-input v-if="scope.row.start =='0'" v-model="tableInput.transColRels.transValue" style="width:90%;" />
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.start !='0' || scope.row.start == undefined"
                size="mini"
                type="danger"
                @click="lineDelete(scope.$index,'transColRels')"
              ><i class="iconfont icon-delete" /></el-button>
              <el-button
                v-if="scope.row.start =='0'"
                size="mini"
                type="primary"
                @click="lineAdd(scope.$index,'transColRels')"
              ><i class="iconfont icon-add" /></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { getSqlType } from '@/api/data/table-info'
export default {
  data() {
    return {
      parentContent: '',
      // table下动态绑定的值
      tableInput: {
        transColRels: {
          codeValue: null,
          transValue: null,
          start: '0'
        }
      },
      temp: {
        colName: '',
        dataType: '',
        dataLength: '',
        isNullable: '', // 0 是1 否
        colComment: ''
      }
    }
  },
  created() {
    var tableId = this.$parent.$data.tableId
    this.initTable(tableId)
  },
  methods: {
    initTable(tableId) {
      getSqlType().then(resp => {
        console.log(resp.data)
      })
    }
  }}
</script>
