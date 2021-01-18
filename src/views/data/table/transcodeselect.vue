<template>
  <div>
    <el-select ref="transRuleUuid" v-model="selectTransId" clearable :disabled="openType === 'showTable'" style="width:90%" filterable placeholder="请选择转码规则" @change="selectChanged">
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <div>
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
</template>

<script>
import { listByPage, selectById } from '@/api/data/transCode'
export default {
  name: 'SelectTransCode',
  // eslint-disable-next-line vue/require-prop-types
  props: ['transuuid', 'openType'],
  data() {
    return {
      selectTransId: '',
      isSql: false,
      readonly: true,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        select: '查看数据转码信息'
      },
      transRuleUuid: [],
      transJson: [],
      tempRule: [],
      pageQuery: {}
    }
  },
  created() {
    this.selectTransId = this.transuuid
    listByPage(this.pageQuery).then(resp => {
      this.transJson = resp.data.records
    })
  },
  methods: {
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
    selectChanged(value) {
      this.$emit('update:transuuid', value)
    }
  }
}
</script>
