<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField ref="queryfield" :form-data="queryFields" @submit="getList" />
    </div>
    <div style="float: right;">
      <el-button type="primary" @click="add">新增</el-button>
      <el-button type="primary" @click="update">修改</el-button>
    </div>
    <el-table :key="tableKey" ref="auditWarningList" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;">
      <el-table-column type="selection" width="55" />
      <el-table-column label="预警名称" prop="warningName" width="100px" align="center"  />
      <el-table-column label="创建人" prop="createUserName" width="150px" align="center"  />
      <el-table-column label="创建时间" prop="createTime" :formatter="dateFormatter" />
      <el-table-column label="关联类型" prop="warningType"  />
      <el-table-column label="关联模型/指标数量" prop="sourceCount"  />
      <el-table-column label="操作" prop="isDeleted"  />
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
    <el-dialog :title="editDialogTitle" v-if='editDialogVisible' :visible.sync="editDialogVisible" :append-to-body="true">
      <EditAuditWarning ref="edit"/>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">关闭</el-button>
        <el-button type="primary" v-show="operationObj.option === 'add' || operationObj.option === 'update'" @click="save">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { findAuditWarningList } from '@/api/analysis/auditwarning'
import QueryField from '@/components/Ace/query-field/index'
import Pagination from '@/components/Pagination/index'
import EditAuditWarning from '@/views/analysis/auditwarning/editauditwarning'
export default {
  name: 'auditWarningList',
  components: { Pagination, QueryField, EditAuditWarning },
  data() {
    return {
      //表格id
      tableKey: 'auditWarningTable',
      //表格数据
      list: null,
      //查询总数
      total: 0,
      //遮罩
      listLoading: false,
      //编辑审计预警dialog标题
      editDialogTitle : "添加审计预警",
      //编辑审计预警dialog是否展现
      editDialogVisible : false,
      //查询条件
      queryFields: [
        { label: '预警名称', name: 'warningName', type: 'fuzzyText', value: '' },
        { label: '创建人', name: 'createUserName', type: 'fuzzyText' },
        { label: '创建日期', name: 'createTime', type: 'timePeriod' }
      ],
      //新增，编辑，详情操作参数
      operationObj: {
        //操作类型 add添加 update修改 detail详情
        option : "add",
        //操作数据的主键
        optionUuid : ""
      },
      //分页查询条件
      pageQuery: {
        //分页查询条件对象
        condition: {},
        //查询页数
        pageNo: 1,
        //每页显示多少条
        pageSize: 20
      }
    }
  },
  computed: {

  },
  created() {
    this.getList()
  },
  methods: {
    /**
     * 格式化时间字符串
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的时间字符串}
     */
    dateFormatter(row, column) {
      const datetime = row.createTime
      if (datetime) {
        var dateMat = new Date(datetime)
        var year = dateMat.getFullYear()
        var month = dateMat.getMonth() + 1
        var day = dateMat.getDate()
        var hh = dateMat.getHours()
        var mm = dateMat.getMinutes()
        var ss = dateMat.getSeconds()
        var timeFormat = year + '-' + month + '-' + day + ' ' + hh + ':' + mm + ':' + ss
        return timeFormat
      }
      return ''
    },

    /**
     * 获取审计预警列表
     * @param query 查询条件
     */
    getList(query) {
      this.listLoading = true
      if (query) {
        this.pageQuery.condition = query
      }
      findAuditWarningList(this.pageQuery).then(resp => {
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
    },

    /**
     * 新增审计预警
     */
    add(){
      this.editDialogTitle = "添加审计预警"
      this.editDialogVisible = true
    },

    /**
     * 审计预警
     */
    update(){
      this.editDialogTitle = "修改审计预警"
      this.editDialogVisible = true
    },

    /**
     * 保存审计预警调用
     */
    save(){
      this.$refs['edit'].getFormData()
    }


  }
}
</script>
