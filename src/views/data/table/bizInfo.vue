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
          <div v-if="isTrueInput">
            业务表信息：
            <el-form-item label="汉化名称：" prop="chnName">
              <el-input v-model="temp.chnName" style="width:60%;" />
            </el-form-item>
          </div>
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
            <el-table-column prop="bizAttrUuid" label="转码规则" width="260px">
              <template slot-scope="scope">
                <el-select ref="transRuleUuid" v-model="scope.row.transRuleUuid" style="width:90%" filterable placeholder="请选择转码规则">
                  <el-option
                    v-for="item in transJson"
                    :key="item.transRuleUuid"
                    :label="item.ruleName"
                    :value="item.transRuleUuid"
                  >
                    <span v-text="item.ruleName" />
                    <el-button style="float:right" type="primary" size="mini" @click="seleteTransCode(item.transRuleUuid)">查看</el-button>
                  </el-option>
                </el-select>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
        <el-button type="primary" style="float:right;margin-top:20px" @click="saveTable()">保存</el-button>
      </div>
      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <div class="detail-form">
          <el-form
            ref="dataForm"
            :model="tempRule"
            label-position="right"
            style="width: 700px;"
          >
            <el-form-item label="规则名称" prop="ruleName">
              <el-input v-model="tempRule.ruleName" readonly />
            </el-form-item>
            <el-form-item label="规则描述" prop="ruleDesc">
              <el-input v-model="tempRule.ruleDesc" readonly />
            </el-form-item>
            <el-form-item label="转码方式" prop="ruleType">
              <el-input v-model="tempRule.ruleType" readonly />
            </el-form-item>
            <el-form-item v-if="isSql" label="转码规则" prop="sqlContent">
              <el-input v-model="tempRule.sqlContent" readonly />
            </el-form-item>
            <el-row v-if="isSql">
              <el-col :span="12">
                <el-form-item label="真实值" prop="sceneName" label-width="150px">
                  <el-input v-model="tempRule.sceneName" readonly class="input" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="业务属性编码" prop="sceneCode" label-width="150px">
                  <el-input v-model="tempRule.sceneCode" readonly class="input" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-table v-if="!isSql" :data="tempRule.transColRels" height="200">
              <el-table-column prop="codeValue" label="真实值" show-overflow-tooltip>
                <template slot-scope="scope" show-overflow-tooltip>
                  <el-tooltip :disabled="scope.row.codeValue.length < 12" effect="dark" :content="scope.row.codeValue" placement="top">
                    <el-input v-model="scope.row.codeValue" readonly style="width:90%;" />
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="transValue" label="显示值" show-overflow-tooltip>
                <template slot-scope="scope">
                  <el-tooltip :disabled="scope.row.transValue.length < 10" effect="dark" :content="scope.row.transValue" placement="top">
                    <el-input v-model="scope.row.transValue" readonly style="width:90%;" />
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </el-form>
        </div>
        <div slot="footer">
          <el-button type="primary" @click="dialogFormVisible = false">关闭</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getTableCol, getTableInfo, saveTableInfo } from '@/api/data/table-info'
import { listByPage } from '@/api/data/biz-attr'
import { seleteCodeAll, selectById } from '@/api/data/transCode'
export default {
  data() {
    return {
      isShow: false,
      tableKey: 'bizAttrUuid',
      isSql: false,
      list: null,
      readonly: true,
      total: 0,
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
    var tableId = this.$parent.$data.tableId
    this.initTable(tableId)
  },
  methods: {
    initTable(tableId) {
      listByPage(this.pageQuery).then(resp => {
        this.bizJson = resp.data.records
      })
      seleteCodeAll(this.pageQuery).then(resp => {
        this.transJson = resp.data.records
      })
      this.isShow = true
      getTableCol(tableId).then(resp => {
        this.temp.colMetas = resp.data
      })
      getTableInfo(tableId).then(resp => {
        if (resp.data.chnName != null) {
          this.temp = resp.data
          this.isTrueInput = true
        }
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
