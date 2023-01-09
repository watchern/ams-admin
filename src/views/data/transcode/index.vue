<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getList"
      />
    </div>
    <el-row>
      <el-col align="right">
        <el-button type="primary" size="mini" class="oper-btn add" @click="handleCreate" />
        <el-button type="primary" size="mini" class="oper-btn edit" :disabled="selections.length !== 1" @click="handleUpdate" />
        <el-button type="primary" size="mini" class="oper-btn delete" :disabled="selections.length === 0" @click="handleDelete" />
      </el-col>
    </el-row>
    <el-table
      ref="tb"
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      stripe
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
              label="规则名称"
              prop="ruleName"
              min-width="200px"
              show-overflow-tooltip
      />
      <el-table-column
              label="转码方式"
              align="center"
              prop="ruleType"
              min-width="200px"
              show-overflow-tooltip
              :formatter="formatTag" />
      <el-table-column
              label="规则描述"
              prop="ruleDesc"
              align="center"
              min-width="500px"
              show-overflow-tooltip />
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
    <el-dialog v-if="dialogFormVisible" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
      <div style="height:65vh;">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        class="detail-form"
        style="width: 700px;"
      >
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="temp.ruleName" />
        </el-form-item>
        <el-form-item label="规则描述" prop="ruleDesc">
          <el-input v-model="temp.ruleDesc" type="textarea" />
        </el-form-item>
        <el-form-item label="转码方式" prop="ruleType">
          <el-radio v-model="temp.ruleType" :label="1" :disabled="dialogStatus === 'update' ? true : false">SQL语句</el-radio>
          <el-radio v-model="temp.ruleType" :label="2" :disabled="dialogStatus === 'update' ? true : false">手动输入</el-radio>
        </el-form-item>
         <el-form-item v-if="temp.ruleType === 1" label="转码规则" prop="sqlContent">
          <el-link v-if="temp.ruleType === 1" size="mini" type="primary" @click="exSql()">执行SQL</el-link>
          <el-input v-model="temp.sqlContent" type="textarea"  :placeholder="sqlRuleText"/>
        </el-form-item>
        <el-button
                type="primary"
                @click="viewSqlRule()"
                class="btn btn-primary"
        >查看SQL规则</el-button
        >
         <div v-if="temp.ruleType === 1" :data="sqlRule">
         <el-table>
          <el-table-column prop="codeValue" label="真实值">
            <template slot-scope="scope">
              <el-select ref="codeValue" v-model="scope.row.codeValue" placeholder="请选择真实值">
                <el-option
                  v-for="(name, index) in colsJson"
                  :key="index"
                  :label="name"
                  :value="name"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="transValue" label="显示值">
            <template slot-scope="scope">
              <el-select ref="transValue" v-model="scope.row.transValue" placeholder="请选择显示值">
                <el-option
                  v-for="(name, index) in colsJson"
                  :key="index"
                  :label="name"
                  :value="name"
                />
              </el-select>
            </template>
          </el-table-column>
         </el-table>
        </div>
        <!-- 执行预览弹窗 -->
        <el-dialog v-if="previewVisible" :visible.sync="previewVisible" width="800px" :modal="false">
          <el-row>
            <el-col>
              <childTabs ref="childTabs" :pre-value="executeSQLList" use-type="previewTable" />
            </el-col>
          </el-row>
          <span slot="footer">
            <el-button type="primary" @click="previewVisible = false">关闭</el-button>
          </span>
        </el-dialog>
      </el-form>
      <el-upload
        v-if="temp.ruleType === 2"
        class="upload"
        :show-file-list="false"
        action=""
        :multiple="false"
        :http-request="beforeUpload"
        accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      />
<!--        <el-link size="mini" type="primary">导入</el-link>-->
<!--        <span style="font-size:2px;color:red">(请选择xls或者xlsx格式,导入第一列为真实值,第二列为转码值)</span>-->

      <el-table v-if="temp.ruleType === 2" :data="transColRelsData" height="calc(100% - 260px)" class="detail-form" style="margin-bottom: 10px">
        <el-table-column prop="codeValue" label="真实值" show-overflow-tooltip>
          <template slot-scope="scope">
<!--            v-if="scope.row.start !='0' || scope.row.start == undefined"-->
            <el-input v-model="scope.row.codeValue" style="width:90%;" />
<!--            <el-input v-if="scope.row.start =='0'" v-model="tableInput.transColRels.codeValue" style="width:90%;" />-->
          </template>
        </el-table-column>
        <el-table-column prop="transValue" label="转码值" show-overflow-tooltip>
          <template slot-scope="scope">
<!--            v-if="scope.row.start !='0' || scope.row.start == undefined"-->
            <el-input v-model="scope.row.transValue" style="width:90%;" />
<!--            <el-input v-if="scope.row.start =='0'" v-model="tableInput.transColRels.transValue" style="width:90%;" />-->
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
<!--            scope.row.start !='0' || scope.row.start == undefined-->
            <el-link
              v-if="transColRelsData.length != 1"
              size="mini"
              type="danger"
              style="margin-right:10px"
              @click="lineDelete(scope.$index,'transColRels')"
            >
              删除
            </el-link>
            <el-link
              v-if="scope.$index == transColRelsData.length - 1"
              size="mini"
              type="primary"
              @click="lineAdd(scope.$index,'transColRels')"
            >
              添加
            </el-link>
          </template>
        </el-table-column>
      </el-table>
      </div>
      <div slot="footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">保存</el-button>
      </div>
    </el-dialog>
    <el-dialog
            :append-to-body="true"
            :close-on-click-modal="false"
            v-if="SQLRuleDialog"
            title="SQL规则"
            :visible.sync="SQLRuleDialog"
    >
      <el-input
              :autosize="{ minRows: 2, maxRows: 5 }"
              type="textarea"
              :disabled="true"
              v-model="sqlRuleText"
      >
      </el-input>
      <div slot="footer" class="dialog-footer">
        <el-button @click="SQLRuleDialog = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import childTabs from '@/views/analysis/auditmodelresult/childtabs'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listByPage, save, update, del, selectOne, previewSql, getTrueSql, getShowSql , getSqlRules} from '@/api/data/transCode'
import QueryField from '@/components/public/query-field/index'
import XLSX from 'xlsx'
export default {
  components: { Pagination, QueryField, childTabs },
  // eslint-disable-next-line vue/require-prop-types
  data() {
    return {
      selectType: 'handleSelectionChangeOne',
      transColRelsData: [],
      previewVisible: false,
      // table下动态绑定的值
      sqlRule: [{
        codeValue: null,
        transValue: null
      }],
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
      executeSQLList: [],
      arrSql: {},
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
        codeValue: '',
        transValue: '',
        transColRels: [{
          codeValue: null,
          transValue: null
        }],
        sqlContent : ''
      },
      colsJson: [],
      selections: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改转码规则',
        create: '新增转码规则'
      },
      dialogPvVisible: false,
      rules: {
        ruleName: [{ required: true, message: '请填写规则名称', trigger: 'change' }],
        ruleType: [{ required: true, message: '请填写转码方式', trigger: 'change' }],
        ruleDesc: [{ max: 100, message: '长度不得超过100', trigger: 'change' }]
      },
      downloadLoading: false,
      SQLRuleDialog: false,
      sqlRuleText: "格式：SELECT A,B FROM 模式.C\nA:真实值，B:显示值，若字段过多,则默认只使用前两列进行真实值与显示值的匹配",
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
      return row.ruleType === 1 ? 'SQL语句' : '手动输入'
    },
    // 动态添加一行
    lineAdd(index, ipTable) {
      switch (ipTable) {
        case 'transColRels':
          var codeValue = this.transColRelsData[index].codeValue
          var transValue = this.transColRelsData[index].transValue
          if (codeValue == null || codeValue == '') {
            this.$message.error('请填写真实值')
            return
          }
          if (transValue==null || transValue == '') {
            this.$message.error('请填转码值')
            return
          }
          this.transColRelsData.push( { codeValue: null, transValue: null ,start: '0'})
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
      this.listLoading = true
      if (query) this.pageQuery.condition = query
      listByPage(this.pageQuery).then(resp => {
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
        ruleDesc: '',
        codeValue: '',
        transValue: '',
        transColRels: [{
          codeValue: null,
          transValue: null
        }]
      }
    },
    resetSqlRule() {
      this.sqlRule = [{
        codeValue: null,
        transValue: null
      }]
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
      // 空值检验
      if (this.transColRelsData.length > 0 && this.temp.ruleType === 2) {
        var codeValue = this.transColRelsData[this.transColRelsData.length - 1].codeValue
        var transValue = this.transColRelsData[this.transColRelsData.length - 1].transValue
        if (codeValue == null || codeValue == '') {
          this.$message({ type: 'error', message: '请填写真实值' })
          return
        }
        if (transValue==null || transValue == '') {
          this.$message({ type: 'error', message: '请填转码值' })
          return
        }
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.temp.ruleType === 2) {
            this.temp.transColRels = this.transColRelsData

            save(this.temp).then(() => {
              this.getList()
              this.previewVisible = false
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000,
                position: 'bottom-right'
              })
            })
          } else {
            this.temp.transColRels = this.sqlRule
            // 查询的SQL语句应对应库中的真实表名，由用户自己控制SQL语句
              //获取初始值和转码值的list
                getSqlRules(this.temp.sqlContent).then(re => {
                //声明一个最终赋值给temp的数组
                const transColRels = [];
                //遍历返回的data
                for(const item in re.data){
                  //声明初始值和转码值的对象需要在遍历中，否则对象可能会覆盖
                  const transColRel = {
                    codeValue: '',
                    transValue: ''
          }
                  //将初始值和转码值存入对象中
                  transColRel.codeValue = re.data[item][0];
                  transColRel.transValue = re.data[item][1];
                  //将对象存入数组中
                  transColRels.push(transColRel);
                }
                //将数组存入temp对象，在执行save方法时，就可以一并存入数据库
                this.temp.transColRels = transColRels;

          save(this.temp).then(() => {
            this.getList()
            this.previewVisible = false
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          })
              })
          }
        }
      })
    },
    exSql() {
      var transCodeObj = {}
      if (typeof (this.temp.sqlContent) === 'undefined') {
        this.$message({ type: 'info', message: '执行失败！转码规则未填写' })
        return
      }
      // 查询的SQL语句应对应库中的真实表名，由用户自己控制SQL语句
      // getTrueSql(this.temp.sqlContent).then(resp =>{
      // transCodeObj.sqlContent = resp.data
        transCodeObj.sqlContent = this.temp.sqlContent

      previewSql(transCodeObj).then(res => {
        this.transCodeShow = true
        this.colsJson = res.data.columnNames
        this.executeSQLList = res.data.executeTask.executeSQL
        this.arrSql = res.data
        this.previewVisible = true
        this.$nextTick(() => {
          this.$refs.childTabs.loadTableData(this.arrSql)
        })
      })
      // })
    },
    handleUpdate() {
      var rulObj = Object.assign({}, this.selections[0]) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      selectOne(rulObj).then(res => {
        if (res.data.ruleType === 1) {
        this.resetTemp()
          // 查询的SQL语句应对应库中的真实表名，由用户自己控制SQL语句
            // getShowSql(res.data.sqlContent).then(resp =>{
        this.temp = res.data
              this.temp.sqlContent = res.data.sqlContent
          this.colsJson = []
          this.colsJson.push(this.temp.transColRels[0].transValue)
          this.colsJson.push(this.temp.transColRels[0].codeValue)
          this.sqlRule = res.data.transColRels
          this.temp.transColRels = []
          this.transColRelsData = []
            // })
        } else {
          this.colsJson = []
          this.resetSqlRule()
            this.temp =  res.data;
          this.transColRelsData = res.data.transColRels
          var temporaryObj = this.tableInput.transColRels
          temporaryObj.start = '0'
          temporaryObj.transValue = this.transColRelsData[this.transColRelsData.length - 1].transValue
          temporaryObj.codeValue = this.transColRelsData[this.transColRelsData.length - 1].codeValue
          this.transColRelsData.push(temporaryObj)
          this.transColRelsData.splice(this.transColRelsData.length - 2, 1)
        }
        // 添加最后一行输入行为可编辑，按钮设为添加
      })
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      // 空值检验
      if (this.transColRelsData.length > 0 && this.temp.ruleType === 2) {
        var codeValue = this.transColRelsData[this.transColRelsData.length - 1].codeValue
        var transValue = this.transColRelsData[this.transColRelsData.length - 1].transValue
        if (codeValue == null || codeValue == '') {
          this.$message({ type: 'error', message: '请填写真实值' })
          return
        }
        if (transValue==null || transValue == '') {
          this.$message({ type: 'error', message: '请填转码值' })
          return
        }
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // if (this.temp.ruleType === 2) {
          //   this.temp.transColRels = this.transColRelsData
          // }
          if (this.temp.ruleType === 1) {
            this.temp.transColRels = '';
            // 查询的SQL语句应对应库中的真实表名，由用户自己控制SQL语句
              //获取初始值和转码值的list
              getSqlRules(this.temp.sqlContent).then(re => {
                //声明一个最终赋值给temp的数组
                const transColRels = [];
                //遍历返回的data
                for (const item in re.data) {
                  //声明初始值和转码值的对象需要在遍历中，否则对象可能会覆盖
                  const transColRel = {
                    codeValue: '',
                    transValue: ''
                  }
                  //将初始值和转码值存入对象中
                  transColRel.codeValue = re.data[item][0];
                  transColRel.transValue = re.data[item][1];
                  //将对象存入数组中
                  transColRels.push(transColRel);
                }
                //将数组存入temp对象
                this.temp.transColRels = transColRels;

                var tempData = Object.assign({}, this.temp)
                update(tempData).then(() => {
                  const index = this.list.findIndex(v => v.transRuleUuid === this.temp.transRuleUuid)
                  this.list.splice(index, 1, this.temp)
                  this.previewVisible = false
                  this.dialogFormVisible = false
                  this.$notify({
                    title: '成功',
                    message: '更新成功',
                    type: 'success',
                    duration: 2000,
                    position: 'bottom-right'
                  })
                })
              })
            // })
          } else {
            this.temp.sqlContent = ''
            this.temp.transColRels = this.transColRelsData

          var tempData = Object.assign({}, this.temp)
          update(tempData).then(() => {
            const index = this.list.findIndex(v => v.transRuleUuid === this.temp.transRuleUuid)
            this.list.splice(index, 1, this.temp)
            this.previewVisible = false
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
        }
      })
    },
    handleDelete() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r) })
      this.$confirm('确定删除该转码规则?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        del(ids).then((resp) => {
          if(resp){
          this.getList()
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
          }else{
            this.$notify({
              title: '失败',
              message: '删除失败',
              type: 'error',
              duration: 2000,
              position: 'bottom-right'
            })
          }
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
          const exlname = workbook.SheetNames[0] // 取第一张表
          const exl = XLSX.utils.sheet_to_json(workbook.Sheets[exlname], { header: 1, defval: '' }) // 生成json表格内容
          var transArr = []
          for (const obj in exl) {
            const tranObj = {}
            tranObj.codeValue = exl[obj][0]
            tranObj.transValue = exl[obj][1]
            transArr.push(tranObj)
          }
          // 将 JSON 数据挂到 data 里
          this.transColRelsData = transArr
          // 添加最后一行输入行为可编辑，按钮设为添加
          var temporaryObj = this.tableInput.transColRels
          temporaryObj.start = '0'
          temporaryObj.transValue = this.transColRelsData[this.transColRelsData.length - 1].transValue
          temporaryObj.codeValue = this.transColRelsData[this.transColRelsData.length - 1].codeValue
          this.transColRelsData.push(temporaryObj)
          this.transColRelsData.splice(this.transColRelsData.length - 2, 1)
          // document.getElementsByName('file')[0].value = '' // 根据自己需求，可重置上传value为空，允许重复上传同一文件
        } catch (e) {
          console.log('出错了：：')
          return false
        }
      }
      fileReader.readAsBinaryString(file)
    },
    // 多选数据库
    handleSelectionChange(val) {
      this.selections = val
    },
    getSortClass: function(key) {
      const sort = this.pageQuery.sort
      return sort === `+${key}` ? 'asc' : 'desc'
    },
    viewSqlRule() {
      this.SQLRuleDialog = true;
    },
  }
}
</script>
<style scoped>
>>>.el-dialog{
  height: 70vh!important;
}
>>>.el-dialog__body{
  height: calc(100% - 100px);
  overflow: auto;
}
</style>