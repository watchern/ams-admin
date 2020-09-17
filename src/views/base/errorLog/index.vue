<template>
  <div class="main-page w100 h100 flex a-center j-start flex-row">
    <!--右侧表-->
    <div class="main-page-right flex1 h100">
      <div class="search-right h100 flex a-center j-end flex-row">
        <el-form :inline="true" :model="query" class="demo-form-inline">
          <el-form-item label="操作用户">
            <el-input v-model="query.condition.opUserName" placeholder="操作用户" />
          </el-form-item>
          <el-form-item label="操作IP">
            <el-input v-model="query.condition.opIp" placeholder="操作IP" />
          </el-form-item>
          <el-form-item label="异常类">
            <el-input v-model="query.condition.opClass" placeholder="异常类" />
          </el-form-item>
          <el-form-item label="异常方法">
            <el-input v-model="query.condition.opMethod" placeholder="异常方法" />
          </el-form-item>
          <el-form-item label="开始时间">
            <el-input v-model="query.condition.startTime" placeholder="开始时间" />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-input v-model="query.condition.endTime" placeholder="结束时间" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="init">查询</el-button>
            <el-button type="primary" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="new-table-content">
        <!--          <div class="count-total-wrap">
            <i class="el-icon-warning icon-waring" />
            <span class="info">共{{ total }}项 已选择 <span class="info-color">{{ selectedRowVal }}</span> 项</span>
          </div>-->
        <div class="new-table-content-wrap">
          <new-ag-grid ref="agGridDom" :table-options="tableOptions" :row-data="tableData" :page-num="pageNum" :page-size="pageSize" :total="total" @handleCurrentChange="initPage" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TableCommon from '@/mixin/table-common.js'
import { listByPage } from '@/api/base/base'
export default {
  mixins: [TableCommon],
  data() {
    return {
      currentPage: 1,
      pageSize: 20,
      total: 0,
      tableData: [],
      // selectedRowVal:0,
      tableOptions: {
        columnDefs: [
          {
            headerName: '',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width: 30,
            pinned: 'left',
            display: false
          },
          {
            field: 'errorUuid',
            hide: true
          },
          {
            headerName: '操作用户',
            field: 'opUserName',
            pinned: 'left',
            filter: 'agTextColumnFilter'
          },
          {
            headerName: '操作IP',
            field: 'opIp',
            pinned: 'left'
          },
          {
            headerName: '异常类',
            field: 'opClass',
            pinned: 'left'
          },
          {
            headerName: '异常方法',
            field: 'opMethod',
            filter: 'agNumberColumnFilter'
          },
          {
            headerName: '异常时间',
            field: 'logTime',
            filter: 'agNumberColumnFilter',
            valueFormatter: function(item) {
              return item.data.createTime
            }
          },
          {
            headerName: '异常信息',
            field: 'logContent',
            filter: 'agNumberColumnFilter'
          }
        ]
      },
      formStyle: {
        width: '700px',
        height: '400px'
      },
      temp: {
        errorUuid: '',
        opUserName: '',
        opUserId: '',
        opIp: '',
        opClass: '',
        opMethod: '',
        logContent: '',
        logTime: '',
        startTime: '',
        endTime: ''
      },
      query: {
        condition: {
          opUserName: '',
          opIp: '',
          opClass: '',
          opMethod: '',
          startTime: '',
          endTime: ''
        }
      },
      rules: {
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      }
    }
  },
  computed: {
    selectedRowVal() {
      return this.$refs['agGridDom'] ? this.$refs['agGridDom'].getSelectRows().length : 0
    }
  },
  created() {
    this.init()
  },
  methods: {
    initPage(currentPage) {
      this.currentPage = currentPage
      this.init()
    },
    init() {
      var param = {
        currentPage: this.currentPage,
        pageSize: this.pageSize
      }
      Object.assign(param, this.query)
      listByPage(param).then(resp => {
        this.total = resp.data.total
        console.log(resp.data.records)
        this.tableData = resp.data.records
      })
    },
    resetQuery() {
      this.query = {
        condition: {
          opUserName: '',
          opIp: '',
          opClass: '',
          opMethod: '',
          startTime: '',
          endTime: ''
        }
      }
    }
  }
}
</script>
