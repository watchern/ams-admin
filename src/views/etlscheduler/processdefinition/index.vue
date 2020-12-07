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
      <el-col align="right"> <!-- 新增 -->
        <el-button
          type="primary"
          title="新增"
          class="oper-btn add"
          @click="handleCreate()"
        />
        <!-- 修改 selections.length !== 1 -->
        <el-button
          type="primary"
          title="编辑已停用的流程"
          class="oper-btn edit"
          :disabled="updateStatus"
          @click="handleUpdate()"
        />
        <!-- 启用 -->
        <el-button
          type="primary"
          title="启用"
          class="oper-btn start"
          :disabled="startStatus"
          @click="handleStart()"
        />
        <!-- 停用 -->
        <el-button
          type="primary"
          title="停用"
          :disabled="stopStatus"
          class="oper-btn pause"
          @click="handleStop()"
        />
        <!-- 删除 -->
        <el-button
          type="primary"
          title="删除已停用的流程"
          class="oper-btn delete"
          :disabled="deleteStatus"
          @click="handleDelete()"
        />
        <!-- 下载 -->
        <el-button
          type="primary"
          title="下载"
          class="oper-btn import"
          :disabled="selections.length === 0"
          @click="handleDownload()"
        />
        <!-- 上传 -->
        <!-- multiple -->
        <el-upload
          class="upload-demo"
          action=""
          :on-remove="handleRemove"
          :headers="headers"
          :http-request="uploadFile"
          :limit="3"
          :auto-upload="true"
          :on-change="handleFileChange"
          :show-file-list="false"
          style="display:inline-block;padding-left:10px"
        >
          <el-button type="primary" title="上传" class="oper-btn export" />
        </el-upload></el-col>
    </el-row>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      stripe
      fit
      style="width: 100%;"
      :data="list"
      border
      highlight-current-row
      height="calc(100vh - 300px)"
      max-height="calc(100vh - 300px)"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column label="流程名称" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-link target="_blank" :underline="false" type="primary" @click="handleView(scope.row.processDefinitionUuid)">{{ scope.row.name }}</el-link>
        </template>
      </el-table-column>
      <!--
      <el-table-column
        label="排序号"
        width="150px"
        align="center"
        prop="orderNo"
      />
      -->
      <el-table-column
        label="状态"
        width="150px"
        align="center"
        prop="status"
        :formatter="formatStatus"
      />
      <el-table-column
        label="流程描述"
        prop="description"
      />
      <el-table-column
        label="最新修改人"
        align="center"
        prop="updateUserName"
      />
      <el-table-column
        label="修改时间"
        width="300px"
        align="center"
        prop="updateTime"
      />
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="pageQuery.pageNo"
      :limit.sync="pageQuery.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listByPage, del, updateDefinitionStatus } from '@/api/etlscheduler/processdefinition'
import QueryField from '@/components/Ace/query-field/index'
import axios from 'axios'

export default {
  components: { Pagination, QueryField },
  data() {
    return {
      tableKey: 'processDefinitionUuid',
      list: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '流程名称', name: 'name', type: 'text', value: '' },
        // { label: '模糊查询', name: 'keyword', type: 'fuzzyText' },
        {
          label: '流程状态', name: 'status', type: 'select',
          data: [{ name: '启用', value: '1' }, { name: '停用', value: '0' }],
          default: '1'
        }
      ],
      // 格式化参数列表
      formatMap: {
        status: {
          1: '启用',
          0: '停用',
          null: '启用'
        }
      },
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      temp: {
        processDefinitionUuid: null
      },
      selections: [],
      downloadLoading: false,
      startStatus: true,
      stopStatus: true,
      updateStatus: true,
      deleteStatus: true,
      headers: { 'Content-Type': 'multipart/form-data' },
      file: ''
    }
  },
  watch: {
    // 监听selections集合
    selections() {
      if (this.selections.length > 0) {
        this.startStatus = false
        this.stopStatus = false
        this.deleteStatus = false
        this.selections.forEach((r, i) => {
          // 遍历选择的数组判断状态，如果是有启用的，启用按钮和删除不可用
          if (r.status === 1) {
            this.startStatus = true
            this.deleteStatus = true
          } else if (r.status === 0) {
            // 遍历选择的数组判断状态，如果是有禁用的，禁用按钮不可用
            this.stopStatus = true
          }
        })
      } else {
        this.startStatus = true
        this.stopStatus = true
        this.deleteStatus = true
      }
      if (this.selections.length === 1) {
        this.selections.forEach((r, i) => {
          // 遍历选择的数组判断状态，如果是有启用的，修改按钮不可用
          if (r.status === 1) {
            this.updateStatus = true
          } else if (r.status === 0) {
            // 遍历选择的数组判断状态，如果是有禁用的，修改按钮不可用
            this.updateStatus = false
          }
        })
      } else {
        this.updateStatus = true
      }
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
    handleCreate() {
      // 流程定义新增
      this.$router.push('/etlscheduler/workflow')
    },
    handleUpdate() {
      this.temp = Object.assign({}, this.selections[0])
      // 编辑的页面跳转,传递状态为0为编辑
      this.$router.push(`/etlscheduler/definition/${this.temp.processDefinitionUuid}/0`)
    },
    handleView(processDefinitionUuid) {
      // 查看详情的页面跳转,传递状态为1为查看
      this.$router.push(`/etlscheduler/definition/${processDefinitionUuid}/1`)
    },
    handleStart() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.processDefinitionUuid) })
      updateDefinitionStatus(ids.join(','), 1).then(() => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '启用成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    // 导出流程
    handleDownload() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.processDefinitionUuid) })
      const downloadBlob = (data, fileNameS = 'json') => {
        if (!data) {
          return
        }
        const blob = new Blob([data])
        const fileName = `${fileNameS}.json`
        if ('download' in document.createElement('a')) { // 不是IE浏览器
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.setAttribute('download', fileName)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link) // 下载完成移除元素
          window.URL.revokeObjectURL(url) // 释放掉blob对象
        } else { // IE 10+
          window.navigator.msSaveBlob(blob, fileName)
        }
      }
      axios({ method: 'get',
        url: `/etlscheduler/processDefinition/export/${ids.join(',')}`,
        responseType: 'blob'
      }).then((res) => {
        downloadBlob(res.data, 'process_' + new Date().getTime())
        this.getList()
        this.$notify({
          title: '成功',
          message: '下载成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      }).catch((err) => {
        console.error(err)
      })
    },
    handleStop() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.processDefinitionUuid) })
      updateDefinitionStatus(ids.join(','), 0).then(() => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '停用成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    handleDelete() {
      this.$confirm('此操作将删除相关的调度任务, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var ids = []
        this.selections.forEach((r, i) => { ids.push(r.processDefinitionUuid) })
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
      }).catch(() => {
        this.$notify({
          title: '消息',
          message: '已取消删除',
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
    // 上传文件，获取文件流
    handleFileChange(file) {
      // console.log(file)
      this.file = file.raw
    },
    handleRemove(file, fileList) {
      this.file = ''
    },
    beforeUpload(file) {

    },
    submitUpload() {
      if (this.file !== '') {
        this.$refs.uploadForm.submit()
      } else {
        this.$message({
          message: '请先选择文件!',
          type: 'warning',
          duration: '2000'
        })
      }
    },
    // 自定义上传
    uploadFile() {
      const index = this.file.name.lastIndexOf('.')
      const suffix = this.file.name.substr(index + 1)
      // 创建表单对象
      const formData = new FormData()
      // 后端接受参数 ，可以接受多个参数
      formData.append('file', this.file)
      formData.append('uploadFileName', 'git')
      formData.append('uploadFileContentType', suffix)
      axios({
        url: '/etlscheduler/processDefinition/import-definition',
        method: 'post',
        data: formData
      }).then((res) => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '导入成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    // 格式化表格
    formatStatus(data) {
      return this.formatMap.status[data.status]
    }
  }
}
</script>
<style scoped>
.buttonText{
  color: #409eff;
}
</style>
