<template>
  <div class="app-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getList"
      />
    </div>
    <div v-if="power==undefined">
      <el-button type="primary" size="mini" @click="handleCreate()">添加</el-button>
      <el-button type="primary" size="mini" :disabled="selections.length !== 1" @click="handleUpdate()">修改</el-button>
      <el-button type="danger" size="mini" :disabled="selections.length === 0" @click="handleDelete()">删除</el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="规则名称" width="300px" align="center" prop="ruleName" />
      <el-table-column label="转码方式" width="300px" align="center" prop="ruleType" :formatter="formatTag" />
      <el-table-column label="规则描述" prop="ruleDesc" />
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
    <el-button v-if="power == 0" :disabled="selections.length !== 1" type="primary" size="mini" class="el_header_button" style="margin-right: 20px;float: right;" @click="selectTransRule()">确定</el-button>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="120px"
        style="width: 700px; "
      >
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="temp.ruleName" />
        </el-form-item>
        <el-form-item label="规则描述" prop="ruleDesc">
          <el-input v-model="temp.ruleDesc" type="textarea" />
        </el-form-item>
        <el-form-item label="转码方式" prop="ruleType">
          <el-radio v-model="temp.ruleType" :label="1">SQL语句</el-radio>
          <el-radio v-model="temp.ruleType" :label="2">手动输入</el-radio>
        </el-form-item>
        <el-form-item v-if="temp.ruleType === 1" label="转码规则" prop="sqlContent" placeholder="请输入SQL">
          <el-button v-if="temp.ruleType === 1" type="primary" size="mini" class="el_header_button" style="margin-right: 20px;float: left;" @click="exSql()">执行SQL</el-button>
          <el-input v-model="temp.sqlContent" type="textarea" style="width:500px" />
        </el-form-item>
        <el-form-item v-if="temp.ruleType === 1" label="真实值" prop="codeValue" style="width:200px">
          <el-input v-model="temp.codeValue" />
        </el-form-item>
        <el-form-item v-if="temp.ruleType === 1" label="显示值" prop="transValue" style="width:200px">
          <el-input v-model="temp.transValue" />
        </el-form-item>
      </el-form>
      <el-upload
        v-if="temp.ruleType === 2"
        class="upload"
        :show-file-list="false"
        action=""
        :multiple="false"
        :http-request="beforeUpload"
        accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        :limit="1"
      >
        <el-button size="small" type="primary">上传</el-button>
      </el-upload>

      <el-table v-if="temp.ruleType === 2" :data="transColRelsData" height="200">
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
      <el-button v-if="dialogStatus ==='update'" type="primary" size="mini" class="el_header_button" style="margin-right: 20px;float: right;" @click="updateData()">保存</el-button>
      <el-button v-if="dialogStatus ==='create'" type="primary" size="mini" class="el_header_button" style="margin-right: 20px;float: right;" @click="createData()">保存</el-button>
      <el-button type="primary" size="mini" class="el_header_button" style="margin-right: 20px;float: right;" @click="closeDialog()">取消</el-button>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listByPage, save, update, del, selectOne } from '@/api/data/transCode'
import QueryField from '@/components/Ace/query-field/index'
import XLSX from 'xlsx'
export default {
  components: { Pagination, QueryField },
  // eslint-disable-next-line vue/require-prop-types
  props: ['power'],
  data() {
    return {
      transColRelsData: [],
      // table下动态绑定的值
      tableInput: {
        transColRels: {
          codeValue: null,
          transValue: null,
          start: '0'
        }
      },
      tableKey: 'transRuleUuid',
      list: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '转码方式', name: 'ruleType', type: 'select',
          data: [{ name: 'SQL语句', value: '1' }, { name: '手动输入', value: '2' }],
          default: '-1' },
        { label: '规则名称', name: 'ruleName', type: 'fuzzyText' }
      ],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      temp: {
        transRuleUuid: undefined,
        ruleName: '',
        ruleType: '',
        ruleDesc: '',
        transColRels: []
      },
      selections: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑转码规则',
        create: '添加转码规则'
      },
      dialogPvVisible: false,
      rules: {
        ruleName: [{ required: true, message: '请填写规则名称', trigger: 'change' }],
        ruleType: [{ required: true, message: '请填写转码方式', trigger: 'change' }],
        ruleDesc: [{ max: 100, message: '长度不得超过100', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 初始化手动输入方式的动态输入框
    openAddNewDialog() {
      let isExist = false // 是否存在输入行
      if (this.transColRelsData.length > 0) {
        for (let i = 0; i < this.transColRelsData.length; i++) {
          if (this.transColRelsData[i].start === '0') {
            isExist = true
            break
          }
        }
        if (!isExist) {
          this.transColRelsData.push(this.tableInput.transColRels)
        }
      } else {
        this.transColRelsData.push(this.tableInput.transColRels)
      }
    },
    formatTag(row, column) {
      return row.ruleType === '1' ? 'SQL语句' : '手动输入'
    },
    // 动态添加一行
    lineAdd(index, ipTable) {
      switch (ipTable) {
        case 'transColRels':
          if (this.tableInput.transColRels.codeValue == null || this.tableInput.transColRels.codeValue.trim() <= 0) {
            this.$message.error('请填写真实值')
            return
          }
          if (this.tableInput.transColRels.transValue == null || this.tableInput.transColRels.transValue.trim() <= 0) {
            this.$message.error('请填转码值')
            return
          }
          var tempRow = JSON.parse(JSON.stringify(this.tableInput.transColRels))
          tempRow.start = '1'
          this.transColRelsData.splice(-1, 0, tempRow)
          this.transColRelsData[this.transColRelsData.length - 1].codeValue = null
          this.transColRelsData[this.transColRelsData.length - 1].transValue = null
          this.transColRelsData[this.transColRelsData.length - 1].start = '0'
          break
      }
    },
    // 动态删除一行
    lineDelete(index, ipTable) {
      switch (ipTable) {
        case 'transColRels':
          this.transColRelsData.splice(index, 1)
          break
      }
    },
    getList(query) {
      var getPower = this.$route.query.power
      if (getPower !== undefined) {
        this.power = getPower
      }
      this.listLoading = true
      if (query) this.pageQuery.condition = query
      listByPage(this.pageQuery).then(resp => {
        console.log(resp)
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
    },
    handleFilter() {
      this.pageQuery.pageNo = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      this.pageQuery.sortBy = order
      this.pageQuery.sortName = prop
      this.handleFilter()
    },
    // 初始化添加表单内容
    resetTemp() {
      this.temp = {
        transRuleUuid: undefined,
        ruleName: '',
        ruleType: 1,
        ruleDesc: ''
      }
    },
    // 打开新增内容
    handleCreate() {
      this.openAddNewDialog()
      this.resetTemp()
      this.transColRelsData = []
      // 初始化一行输入行为可编辑，按钮设为添加
      var temporaryObj = this.tableInput.transColRels
      temporaryObj.start = '0'
      temporaryObj.transValue = null
      temporaryObj.codeValue = null
      this.transColRelsData.push(temporaryObj)
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 添加
    createData() {
      // 先移除有空数据的输入行
      if (this.transColRelsData.length > 0) {
        if (this.transColRelsData[this.transColRelsData.length - 1].start === '0' && this.transColRelsData[this.transColRelsData.length - 1].codeValue === null) {
          this.transColRelsData.splice(this.transColRelsData.length - 1, 1)
        }
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.transColRels = this.transColRelsData
          console.log(this.temp)
          save(this.temp).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          })
        }
      })
    },
    exSql() {
    },
    handleUpdate() {
      var rulObj = Object.assign({}, this.selections[0]) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      selectOne(rulObj).then(res => {
        this.temp = res.data
        this.transColRelsData = res.data.transColRels
        // 添加最后一行输入行为可编辑，按钮设为添加
        var temporaryObj = this.tableInput.transColRels
        temporaryObj.start = '0'
        temporaryObj.transValue = null
        temporaryObj.codeValue = null
        this.transColRelsData.push(temporaryObj)
      })
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    selectTransRule() {
      var transObj
      var rulObj = Object.assign({}, this.selections[0]) // copy obj
      if (rulObj !== null) {
        selectOne(rulObj).then(res => {
          transObj = res.data
        })
      }
      return transObj
    },
    updateData() {
      // 先移除输入行
      if (this.transColRelsData.length > 0) {
        if (this.transColRelsData[this.transColRelsData.length - 1].start === '0' && this.transColRelsData[this.transColRelsData.length - 1].codeValue === null) {
          this.transColRelsData.splice(this.transColRelsData.length - 1, 1)
        }
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          var tempData = Object.assign({}, this.temp)
          console.log(tempData)
          update(tempData).then(() => {
            const index = this.list.findIndex(v => v.transRuleUuid === this.temp.transRuleUuid)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          })
        }
      })
    },
    handleDelete() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r) })
      del(ids).then(() => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    async beforeUpload(e) {
      var file = e.file // 文件信息
      if (!file) {
        // 没有文件
        return false
      } else if (!/\.(xls|xlsx)$/.test(file.name.toLowerCase())) {
        // 格式根据自己需求定义
        this.$message.error('上传格式不正确，请上传xls或者xlsx格式')
        return false
      }

      const fileReader = new FileReader()
      fileReader.onload = (ev) => {
        try {
          const data = ev.target.result
          const workbook = XLSX.read(data, {
            type: 'binary' // 以字符编码的方式解析
          })
          console.log(workbook)
          const exlname = workbook.SheetNames[0] // 取第一张表
          const exl = XLSX.utils.sheet_to_json(workbook.Sheets[exlname]) // 生成json表格内容
          // 将 JSON 数据挂到 data 里
          this.transColRelsData = exl
          // 添加最后一行输入行为可编辑，按钮设为添加
          var temporaryObj = this.tableInput.transColRels
          temporaryObj.start = '0'
          temporaryObj.transValue = null
          temporaryObj.codeValue = null
          this.transColRelsData.push(temporaryObj)
          // document.getElementsByName('file')[0].value = '' // 根据自己需求，可重置上传value为空，允许重复上传同一文件
        } catch (e) {
          console.log('出错了：：')
          return false
        }
      }
      fileReader.readAsBinaryString(file)
    },
    closeDialog() {
      this.dialogFormVisible = false
    },
    handleSelectionChange(val) {
      var selectObjs = val
      this.selections = val
      console.log(selectObjs)
      return selectObjs
    },
    getSortClass: function(key) {
      const sort = this.pageQuery.sort
      return sort === `+${key}` ? 'asc' : 'desc'
    }
  }
}
</script>
