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
        <el-button type="primary" class="oper-btn  setting" :disabled="selections.length !== 1" title="设置" @click="setBaseCode" />
        <el-button type="primary" class="oper-btn add" title="添加" @click="addCode" />
        <el-button type="primary" size="mini" :disabled="selections.length === 0" title="删除" class="oper-btn delete" @click="deleteCode()" />
        <el-button type="primary" size="mini" class="oper-btn edit" :disabled="selections.length !== 1" title="修改" @click="updateCode()" />
      </el-col>
    </el-row>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      height="calc(100vh - 300px)"
      max-height="calc(100vh - 300px)"
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column label="选择" type="selection" width="55"/>
      <el-table-column label="代码类别名称" prop="dataSortName"/>
      <el-table-column label="代码类别编码" width="300px" align="center" prop="dataSortValue" />
      <el-table-column label="代码类别描述" prop="dataSortDesc"/>
      <!-- <el-table-column label="创建时间" width="300px" align="center" prop="createTime" /> -->
      <el-table-column label="展现形式" prop="extendTag" :formatter="formatTag" align="center"/>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
    <!-- 这是第一个弹窗，用来添加基础数据类别 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" height="70vh">
      <el-form
        class="detail-form"
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
      >
        <el-form-item label="代码类别名称" prop="dataSortName">
          <el-input v-model="temp.dataSortName" />
        </el-form-item>
        <el-form-item label="代码类别编码" prop="dataSortValue">
          <el-input v-model="temp.dataSortValue" />
        </el-form-item>
        <el-form-item label="代码类别描述" prop="dataSortDesc">
          <el-input v-model="temp.dataSortDesc" />
        </el-form-item>
        <el-form-item label="展现形式" prop="extendTag">
          <el-select ref="relTypeSelect" v-model="temp.extendTag" placeholder="请选择展现形式">
            <el-option label="列表类" :value="0" />
            <el-option label="树形类" :value="1" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" size="mini" @click="closeDialog()" style="color:#353A43;background:#fff;border:none;font-weight:bold;font-size:14px">取消</el-button>
        <el-button @click="dialogStatus==='create'?createData():updateData()" style="color:#c8ff8c;background:#353A43">保存</el-button>
      </div>
    </el-dialog>
    <!-- 这是第二个弹窗，用来操作类别下具体的基础数据 -->
    <el-dialog :title="textMap[dialogSecondStatus]" :visible.sync="dialogFormSecond">
      <el-form
        class="detail-form"
        ref="dataSecondForm"
        :rules="rulesSecond"
        :model="tempSecond"
        label-position="right"
        
        
      >
        <el-form-item label="代码类别" prop="dataSortUuid" hidden>
          <el-input v-model="tempSecond.dataSortUuid"  />
        </el-form-item>
        <el-form-item label="通用代码名称" prop="codeName">
          <el-input v-model="tempSecond.codeName" />
        </el-form-item>
        <el-form-item label="通用代码编码" prop="codeValue">
          <el-input v-model="tempSecond.codeValue"  @change="numberSecond()" />
        </el-form-item>
        <el-form-item label="通用代码描述" prop="codeDesc">
          <el-input v-model="tempSecond.codeDesc"  />
        </el-form-item>
        <el-form-item label="代码排序号" prop="codeIndex">
          <el-input v-model="tempSecond.codeIndex"  @change="numberIndex()" />
        </el-form-item>
        <el-form-item label="状态" prop="codeState">
          <el-select ref="relTypeSelect" v-model="tempSecond.codeState" placeholder="通用代码状态" >
            <el-option label="可用" :value="0" />
            <el-option label="禁用" :value="1" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-button type="danger" class="oper-btn delete" size="mini" :disabled="selectionSecond.length === 0" @click="deleteDataSecond()" style="float:right;margin:0 15px 0 10px"></el-button>
      <el-button type="primary" class="oper-btn edit" size="mini" :disabled="selectionSecond.length !== 1" @click="updateDataSecond()" style="float:right"></el-button>
      <el-button type="primary" class="oper-btn again-2" size="mini" @click="resetTempSecond()" style="float:right"></el-button>
      <el-button type="primary" class="oper-btn add" size="mini" @click="addSecondCode()" style="float:right"></el-button>
      
      
      
      <el-table
        :key="tableSecondKey"
        v-loading="listLoadingSecond"
        :data="listSecond"
        border
        fit
        highlight-current-row
        height="250"
        style="width: 100%;"
        @sort-change="sortChange"
        @selection-change="handleSelectionChangeSecond"
      >
        <el-table-column label="选择" type="selection" width="55px" />
        <el-table-column label="通用代码名称" width="200px" align="center" prop="codeName" />
        <el-table-column label="通用代码编码" width="200px" align="center" prop="codeValue" />
        <el-table-column label="通用代码描述" width="200px" align="center" prop="codeDesc" />
        <el-table-column label="通用代码排序" width="150px" align="center" prop="codeIndex" />
        <el-table-column label="状态" width="100px" align="center" prop="codeState" :formatter="formatState" />
      </el-table>
      <pagination v-show="totalSecond>0" :total="totalSecond" :page.sync="pageQuerySecond.pageNo" :limit.sync="pageQuerySecond.pageSize" @pagination="setBaseCode" />
    </el-dialog>
    <!-- 这是第三个弹窗，用来操作类别下具体的基础数据 -->
    <!-- <el-dialog v-if="dialogTreeVisible" :visible.sync="dialogTreeVisible" :title="editModelTitle">
      <BaseCodeTree ref="editModel" />
      <div slot="footer">
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="hideEditModal">取消</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>
<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listByPage, save, update, del, inItCode, saveSecond, updateSecond, delSecond } from '@/api/base/sysdata'
import QueryField from '@/components/Ace/query-field/index'
export default {
  components: { Pagination, QueryField },
  data() {
    return {
      dialogTreeVisible: false,
      tableKey: 'dataSortUuid',
      tableSecondKey: 'codeUuid',
      list: null,
      listSecond: null,
      total: 0,
      totalSecond: 0,
      listLoading: false,
      listLoadingSecond: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '代码类别名称', name: 'dataSortValue', type: 'text', value: '' },
        { label: '代码类别编码', name: 'dataSortDesc', type: 'text', value: '' }
      ],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      pageQuerySecond: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      temp: {
        dataSortUuid: '',
        dataSortName: '',
        dataSortValue: '',
        dataSortDesc: '',
        extendTag: -1
      },
      tempSecond: {
        codeUuid: '',
        dataSortUuid: '',
        codeVaule: '',
        codeName: '',
        codeDesc: '',
        codeState: -1,
        codeIndex: ''
      },
      selections: [],
      selectionSecond: [],
      dialogFormVisible: false,
      dialogFormSecond: false,
      dialogStatus: '',
      dialogSecondStatus: '',
      textMap: {
        update: '修改代码',
        create: '新增代码'
      },
      dialogPvVisible: false,
      rules: {
        dataSortName: [{ required: true, message: '请填写代码类别名称', trigger: 'change' }],
        dataSortValue: [{ required: true, message: '请填写代码类别编码', trigger: 'change' }],
        dataSortDesc: [{ max: 100, message: '长度不得超过100', trigger: 'change' }],
        extendTag: [{ required: true, message: '请选择数据展示类型', trigger: 'change' }]
      },
      rulesSecond: {
        codeName: [{ required: true, message: '请填写通用代码类别名称', trigger: 'change' }],
        codeValue: [{ required: true, message: '请填写通用代码编码', trigger: 'change' }],
        codeDesc: [{ max: 100, message: '长度不得超过100', trigger: 'change' }],
        codeIndex: [{ required: true, message: '请填写通用代码排序号', trigger: 'change' }],
        codeState: [{ required: true, message: '请选择代码状态', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList(query) {
      this.listLoading = true
      if (query) this.pageQuery.condition = query
      listByPage(this.pageQuery).then(resp => {
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
    },
    // // 校验类别格式
    // number() {
    //   var data = this.temp.dataSortValue
    //   const codeValue = new RegExp('^[0-9]{4,32}$').test(data)
    //   if (!codeValue) {
    //     this.$notify.error({
    //       title: '错误',
    //       message: '请输入4-32位的数字',
    //       position: 'bottom-right'
    //     })
    //     this.temp.dataSortValue = ''
    //   }
    // },
    // 校验编码格式
    numberSecond() {
      var data = this.tempSecond.codeValue
      const codeValue = new RegExp('^[0-9]{4,32}$').test(data)
      if (!codeValue) {
        this.$notify.error({
          title: '错误',
          message: '请输入4-32位的数字',
          position: 'bottom-right'
        })
        this.tempSecond.codeValue = ''
      }
    },
    numberIndex() {
      var data = this.tempSecond.codeIndex
      const codeIndex = new RegExp('^[0-9]$').test(data)
      if (!codeIndex) {
        this.$notify.error({
          title: '错误',
          message: '请输入纯数字',
          position: 'bottom-right'
        })
        this.tempSecond.codeIndex = ''
      }
    },
    handleFilter() {
      this.pageQuery.pageNo = 1
      this.getList()
    },
    // 列表转码 拓展类型 0为列表类 其他为树状
    formatTag(row, column) {
      return row.extendTag === '0' ? '列表类' : '树形类'
    },
    // 列表转码 基础数据状态 0为可用 1为禁用
    formatState(row, column) {
      return row.codeState === '0' ? '可用' : '禁用'
    },
    sortChange(data) {
      const { prop, order } = data
      this.pageQuery.sortBy = order
      this.pageQuery.sortName = prop
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        dataSortUuid: undefined,
        attrName: '',
        attrCode: '',
        describe: ''
      }
    },
    resetTempSecond() {
      this.tempSecond = {
        codeUuid: '',
        dataSortUuid: this.selections[0].dataSortUuid,
        codeVaule: '',
        codeName: '',
        codeDesc: '',
        codeState: '',
        codeIndex: ''
      }
    },
    // clearValidate(){
    //     this.$nextTick(() => {
    //       this.$refs['dataSecondForm'].clearValidate()
    //   })      
    // },
    addCode() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
        // this.$refs['dataSecondForm'].clearValidate()
      })
    },
    closeDialog() {
      this.dialogFormVisible = false
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
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
    updateCode() {
      this.temp = Object.assign({}, this.selections[0]) // copy obj
      this.temp.extendTag = Number(this.temp.extendTag)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
        // this.$refs['dataSecondForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          update(tempData).then(() => {
            const index = this.list.findIndex(v => v.dataSortUuid === this.temp.dataSortUuid)
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
    deleteCode() {
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
         var ids = []
        this.selections.forEach((r, i) => { ids.push(r.dataSortUuid) })
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
      }).catch(() => {
        this.$notify({
          title: '消息',
          message: '已取消删除',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    // 打开设置第二个弹窗 基础设置信息
    setBaseCode() {
      const openType = Object.assign({}, this.selections[0])
      // 如果是0 则为列表类型 打开列表窗体
      if (openType.extendTag === '0') {
        this.resetTempSecond()
        this.dialogFormSecond = true
        this.pageQuerySecond.condition = Object.assign({}, this.selections[0])
        this.tempSecond.dataSortUuid = this.selections[0].dataSortUuid
        inItCode(this.pageQuerySecond).then(resp => {
          this.totalSecond = resp.data.total
          this.listSecond = resp.data.records
        })
        this.$nextTick(() => {
          this.$refs['dataSecondForm'].clearValidate()
      })    
      } else {
        this.openTree()
      }
    },
    // 如果是树状图,打开树页面
    openTree() {
      this.$store.dispatch('dataSort/setDataSortUuid', this.selections[0].dataSortUuid)
      this.$store.dispatch('dataSort/setDataSortName', this.selections[0].dataSortName)
      this.$router.push({
        path: `/base/basecodetree`
      })
    },
    addSecondCode() {
      this.$refs['dataSecondForm'].validate((valid) => {
        if (valid) {
          saveSecond(this.tempSecond).then(() => {
            this.setBaseCode()
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
    updateDataSecond() {
      this.$refs['dataSecondForm'].validate((valid) => {
        if (valid) {
          const tempDataSecond = Object.assign({}, this.tempSecond)
          updateSecond(tempDataSecond).then(() => {
            const index = this.listSecond.findIndex(v => v.codeUuid === this.tempSecond.codeUuid)
            this.listSecond.splice(index, 1, tempDataSecond)
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
    deleteDataSecond() {
      var ids = []
      this.selectionSecond.forEach((r, i) => { ids.push(r) })
      delSecond(ids).then(() => {
        this.setBaseCode()
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    handleSelectionChange(val) {
      this.selections = val
    },
    handleSelectionChangeSecond(val) {
      this.selectionSecond = val
      this.tempSecond = Object.assign({}, this.selectionSecond[0]) // copy obj
      if (val.length !== 0) {
        this.tempSecond.codeState = Number(this.tempSecond.codeState)
      }
    },
    getSortClass: function(key) {
      const sort = this.pageQuery.sort
      return sort === `+${key}` ? 'asc' : 'desc'
    }
  }
}
</script>
