<template>
  <div class="app-container">
    <div v-if="isShow">
      <div class="detail-form">
        <el-form
          ref="dataForm"
          :model="temp"
          label-position="right"
          style="width: 750px;"
        >
          业务表信息：
          <el-form-item label="汉化名称：" prop="chnName">
            <el-input v-model="temp.chnName" style="width:60%;" />
          </el-form-item>
          列业务信息：
          <el-table :data="temp.colMetas" height="200">
            <el-table-column prop="colName" label="字段名称" show-overflow-tooltip>
              <template slot-scope="scope" show-overflow-tooltip>
                <el-tooltip :disabled="scope.row.colName.length < 12" effect="dark" :content="scope.row.colName" placement="top">
                  <el-input v-model="scope.row.colName" style="width:90%;" />
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="chnName" label="汉化名称" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-tooltip :disabled="scope.row.chnName.length < 10" effect="dark" :content="scope.row.chnName" placement="top">
                  <el-input v-model="scope.row.chnName" style="width:90%;" />
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="bizAttrUuid" label="业务标签">
              <template slot-scope="scope">
                <el-select ref="bizAttrUuid" v-model="scope.row.bizAttrUuid" style="width:90%" placeholder="请选择业务属性">
                  <el-option
                    v-for="item in bizJson"
                    :key="item.bizAttrUuid"
                    :label="item.attrName"
                    :value="item.bizAttrUuid"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="transRuleUuid" label="转码规则" width="260px">
              <template slot-scope="scope">
                <SelectTransCode
                  ref="SelectTransCode"
                  :transuuid.sync="scope.row.transRuleUuid"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-form>
        <el-button type="primary" style="float:right;margin-top:20px" @click="saveTable()">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { getTableCol, getTableInfo, saveTableInfo } from '@/api/data/table-info'
import { listByPage } from '@/api/data/biz-attr'
import SelectTransCode from '@/views/data/table/transcodeselect'
import { selectById } from '@/api/data/transCode'
export default {
  components: { SelectTransCode },
  // eslint-disable-next-line vue/require-prop-types
  props: ['tableId'],
  data() {
    return {
      isShow: false,
      tableKey: 'tableMetaUuid',
      isSql: false,
      transRuleId: '',
      list: null,
      readonly: true,
      total: 0,
      transRuleUuid: '',
      dialogStatus: '',
      textMap: {
        select: '查看数据转码信息'
      },
      isTrueInput: false,
      listLoading: false,
      bizJson: [],
      transJson: [],
      dialogFormVisible: false,
      dialogPvVisible: false,
      temp: {
        tableMetaUuid: '',
        chnName: '',
        colMetas: []
      },
      tempRule: [],
      pageQuery: {
      }
    }
  },
  created() {
    this.initTable(this.tableId)
  },
  methods: {
    initTable(tableId) {
      listByPage(this.pageQuery).then(resp => {
        this.bizJson = resp.data.records
      })
      this.isShow = true
      getTableCol(tableId).then(resp => {
        this.temp.colMetas = resp.data
      })
      getTableInfo(tableId).then(resp => {
        this.temp = resp.data
        this.isTrueInput = true
      })
    },
    seleteTransCode(ruleId) {
      this.dialogStatus = 'select'
      selectById(ruleId).then(res => {
        this.tempRule = res.data
        if (this.tempRule.ruleType === 1) {
          this.dialogFormVisible = true
          this.tempRule.ruleType = 'SQL语句'
          this.isSql = true
        } else {
          this.dialogFormVisible = true
          this.tempRule.ruleType = '手动添加'
          this.isSql = false
        }
      })
    },
    setTransId(childData) {
      this.temp.colMetas.transRuleId = childData
    },
    saveTable() {
      saveTableInfo(this.temp).then(() => {
        this.$notify({
          title: '成功',
          message: '创建成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    resetTemp() {
      this.temp = {
        bizAttrUuid: undefined,
        attrName: '',
        attrCode: '',
        describe: ''
      }
    }
  }
}
</script>
