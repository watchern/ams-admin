<template>
  <div class="app-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getList"
      />
    </div>
    <div>
      <el-button type="primary" size="mini" @click="handleCreate()">添加</el-button>
      <el-button type="primary" size="mini" :disabled="selections.length !== 1" @click="handleUpdate()">修改</el-button>
      <el-button type="danger" size="mini" :disabled="selections.length === 0" @click="handleDelete()">删除</el-button>
      <el-button type="primary" size="mini" :disabled="selections.length !== 1" @click="bindRes()">绑定资源</el-button>
      <el-button type="danger" size="mini" :disabled="selections.length === 0" @click="authentic()">授权</el-button>
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
      <el-table-column label="数据角色名称" width="200px" align="center" prop="dataRoleName" />
      <el-table-column label="创建时间" width="300px" align="center" :formatter="formatCreateTime" prop="createTime" />
      <el-table-column label="授权方式" width="200px" align="center" prop="authenType" />
      <el-table-column label="数据筛选器状态" prop="filterState" style="width = 200px" />
      <el-table-column label="数据有效期" prop="timeDuring" :formatter="formatDuring" style="width = 400px" />
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <div class="detail-form">
        <el-form
          ref="dataForm"
          :rules="rules"
          :model="temp"
          label-position="right"
          style="width: 700px; margin-left:50px;"
        >
          <el-form-item label="数据角色名称" prop="dataRoleName">
            <el-input v-model="temp.dataRoleName" />
          </el-form-item>
          <el-form-item label="授权方式" prop="authenType">
            <el-select ref="authenType" v-model="temp.authenType" placeholder="请选择授权方式">
              <el-option
                v-for="item in authenTypeJson"
                :key="item.codeValue"
                :label="item.codeName"
                :value="item.codeValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="数据筛选器状态" prop="filterState">
            <el-input v-model="temp.filterState" type="textarea" />
          </el-form-item>
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="temp.startTime"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              clearable
              style="width: 100%"
              :picker-options="startDatePicker"
              :disabled="dialogStatus=='view'"
              type="datetime"
              :placeholder="dialogStatus=='view'?'':'请输入生效开始时间'"
            />
          </el-form-item>
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="temp.endTime"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              clearable
              style="width: 100%"
              :picker-options="endDatePicker"
              :disabled="dialogStatus=='view'"
              type="datetime"
              :placeholder="dialogStatus=='view'?'':'请输入生效结束时间'"
            />
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listByPage, save, update, del } from '@/api/data/role'
import QueryField from '@/components/Ace/query-field/index'
import { getDictList } from '@/utils'

export default {
  components: { Pagination, QueryField },
  data() {
    return {
      startDatePicker: this.beginDate(),
      endDatePicker: this.processDate(),
      tableKey: 'dataRoleUuid',
      list: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '数据角色名称', name: 'dataRoleName', type: 'text', value: '' }
      ],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      authenTypeJson: [],
      temp: {
        dataRoleUuid: undefined,
        dataRoleName: '',
        authenType: '',
        filterState: '',
        startTime: '',
        endTime: ''
      },
      selections: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑业务属性',
        create: '添加业务属性'
      },
      dialogPvVisible: false,
      rules: {
        dataRoleName: [{ required: true, message: '请填写数据角色名称', trigger: 'change' }],
        authenType: [{ required: true, message: '请选择授权方式', trigger: 'change' }],
        startTime: [{ required: true, message: '请填写生效开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请填写生效结束时间', trigger: 'change' }],
        filterState: [{ max: 100, message: '长度不得超过100', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    beginDate() {
      const self = this
      return {
        disabledDate(time) {
          if (self.temp.endTime) { // 如果结束时间不为空，则小于结束时间
            return new Date(self.temp.endTime).getTime() < time.getTime()
          } else {
            // return time.getTime() > Date.now()//开始时间不选时，结束时间最大值小于等于当天
          }
        }
      }
    },
    processDate() {
      const self = this
      return {
        disabledDate(time) {
          if (self.temp.startTime) { // 如果开始时间不为空，则结束时间大于开始时间
            return new Date(self.temp.startTime).getTime() > time.getTime()
          } else {
            // return time.getTime() > Date.now()//开始时间不选时，结束时间最大值小于等于当天
          }
        }
      }
    },
    getList(query) {
      this.authenTypeJson = getDictList('004001')
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
    resetTemp() {
      this.temp = {
        dataRoleUuid: undefined,
        dataRoleName: '',
        authenType: '',
        filterState: '',
        startTime: '',
        endTime: ''
      }
    },
    handleCreate() {
      /* console.log(this.$store.getters.personuuid);
      getDict('sex').then(data => {
        console.log(data)
      });*/
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      var starDate = new Date(this.temp.startTime)
      this.temp.startTime = starDate
      var endDate = new Date(this.temp.endTime)
      this.temp.endTime = endDate
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
    handleUpdate() {
      this.temp = Object.assign({}, this.selections[0]) // copy obj
      var startTime = new Date(this.temp.startTime)
      this.temp.startTime = startTime.getFullYear() + '-' + (startTime.getMonth() + 1) + '-' + startTime.getDate() + ' ' + startTime.getHours() + ':' + startTime.getMinutes() + ':' + startTime.getSeconds()
      var endTime = new Date(this.temp.endTime)
      this.temp.endTime = endTime.getFullYear() + '-' + (endTime.getMonth() + 1) + '-' + endTime.getDate() + ' ' + endTime.getHours() + ':' + endTime.getMinutes() + ':' + endTime.getSeconds()
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // formatType(row, column) {
    //   var data = getDictList('004001')
    //   // 根据row.authenType筛选出基础数据 将name值返显
    //   var getOne = data.filter(obj => { return row.authenType === obj.codeValue })
    //   return getOne[0].codeName
    // },
    formatCreateTime(row, column) {
      // 拼接日期规格为YYYY-MM-DD hh:mm:ss
      var createTime = new Date(row.createTime)
      var createTimeRow = createTime.getFullYear() + '-' + (createTime.getMonth() + 1) + '-' + createTime.getDate() + ' ' + createTime.getHours() + ':' + createTime.getMinutes() + ':' + createTime.getSeconds()
      return createTimeRow
    },
    formatDuring(row, column) {
      var startDate = new Date(row.startTime)
      var rowStart = startDate.getFullYear() + '-' + (startDate.getMonth() + 1) + '-' + startDate.getDate() + ' ' + startDate.getHours() + ':' + startDate.getMinutes() + ':' + startDate.getSeconds()
      var endDate = new Date(row.endTime)
      var rowEnd = endDate.getFullYear() + '-' + (endDate.getMonth() + 1) + '-' + endDate.getDate() + ' ' + endDate.getHours() + ':' + endDate.getMinutes() + ':' + endDate.getSeconds()
      return rowStart + '至' + rowEnd
    },
    updateData() {
      var starDate = new Date(this.temp.startTime)
      this.temp.startTime = starDate
      var endDate = new Date(this.temp.endTime)
      this.temp.endTime = endDate
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          update(tempData).then(() => {
            const index = this.list.findIndex(v => v.dataRoleUuid === this.temp.dataRoleUuid)
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
      this.selections.forEach((r, i) => { ids.push(r.dataRoleUuid) })
      del(ids.join(',')).then(() => {
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
    handleSelectionChange(val) {
      this.selections = val
    },
    getSortClass: function(key) {
      const sort = this.pageQuery.sort
      return sort === `+${key}` ? 'asc' : 'desc'
    },

    authentic() {

    },
    bindRes() {
      var roleUuid = this.selections[0].dataRoleUuid
      this.$router.push({
        path: '/data/roleRes/' + roleUuid
      })
    }
  }
}
</script>
