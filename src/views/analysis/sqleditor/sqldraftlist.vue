<template>
  <div class="app-container">
    <div class="filter-container">
      <QueryField ref="queryfield" :form-data="queryFields" @submit="getList" />
    </div>
    <div style="float: right;">
      <el-button type="primary" icon="el-icon-delete" @click="deleteSqlDraft">删除</el-button>
    </div>
    <el-table :key="tableKey" ref="sqlDraftListTable" v-loading="listLoading" :data="list" border fit highlight-current-row height="300px">
      <el-table-column type="selection" width="55" />
      <el-table-column label="草稿名称" width="300px" align="center" prop="draftTitle" />
      <el-table-column label="草稿创建时间" width="300px" align="center" prop="createTime" :formatter="dateFormatter" />
      <el-table-column label="操作" align="center" width="150px" prop="" >
        <template slot-scope="scope">
          <el-button @click="selectDetail(scope)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination style="height:30px" v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
    <el-dialog v-if="sqlDraftDetail" title="草稿SQL" :visible.sync="sqlDraftDetail" :append-to-body="true" width="80%">
      <div id="sqlValueViewShow" ref="sqlValueViewShow" style="height: 300px; overflow-y: auto; border: 1px solid #E0E0E0; margin-left: 30px; width: 95%; padding: 15px;">
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {findSqlDraft,deleteSqlDraft} from '@/api/analysis/sqleditor/sqldraft'
import QueryField from '@/components/public/query-field/index'
import Pagination from '@/components/Pagination/index'
export default {
  name: 'SqlDraftList',
  components: { Pagination, QueryField },
  data() {
    return {
      tableKey: 'sqlDraftUuid',
      list: null,
      total: 0,
      sqlDraftDetail: false,
      queryFields: [
        { label: 'SQL标题', name: 'draftTitle', type: 'fuzzyText', value: '' },
      ],
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
            headerName: '草稿标题',
            field: 'draftTitle',
            pinned: 'left',
            filter: 'agTextColumnFilter'
          },
          {
            headerName: '草稿日期',
            field: 'createTime',
            pinned: 'left'
          },
          {
            headerName: '操作',
            field: 'modelType',
            filter: 'agNumberColumnFilter'
          }
        ]
      },
      formStyle: {
        width: '700px',
        height: '400px'
      },
      pageQuery: {
        condition: null,
        pageNo: 1,
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
     * 获取SQL草稿列表
     * @param query 查询条件
     */
    getList(query) {
      this.listLoading = true
      if (query) {
        this.pageQuery.condition = query
      }
      findSqlDraft(this.pageQuery).then(resp => {
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
    },
    /**
     * 重置查询
     */
    resetQuery() {
      this.query = {
        condition: {
          opIp: '',
          moduleName: '',
          opOperate: '',
          opInfo: '',
          endTime: '',
          opTime: '',
          opUserName: ''
        }
      }
    },
    /**
     * 删除草稿
     */
    deleteSqlDraft() {
      var selectObj = this.$refs.sqlDraftListTable.selection
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: 'info', message: '请先选择要删除的草稿!' })
        return
      }
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = [];
        for (let i = 0;i < selectObj.length;i++){
          ids.push(selectObj[i].sqlDraftUuid);
        }
        deleteSqlDraft(ids.join(',')).then(result => {
          if (result.code == 0) {
            this.getList(this.query)
            this.$notify({
              title:'提示',
              message:'删除成功',
              type:'info',
              duration:2000,
              position:'bottom-right'
            });
          } else {
            this.$message({ type: 'error', message: '删除失败' })
          }
        })
      }).catch(() => {

      })
    },
    selectDetail(data){
      this.sqlDraftDetail = true;
      let returnObj = {};
      returnObj.sqlValue = data.row.draftSql;
      var paramJson = JSON.parse(data.row.paramJson);
      if(paramJson.arr == undefined){
        returnObj.params = [];
      }
      else{
        returnObj.params = paramJson.arr
      }
      setTimeout(()=>{
        this.displaySQL(returnObj);
      })
    },
    displaySQL(returnObj){
      let sql = returnObj.sqlValue;
      let arrPram = returnObj.params;
      let sqlStr = returnObj.sqlValue;
      let reg;
      for(let i = 0 ; i <arrPram.length; i++){
        reg = new RegExp(arrPram[i].id , "g" );
        let html = " <button class='divEditorBtn' type='button' id='"+arrPram[i].id+"'>"+arrPram[i].name+"</button> ";
        sql = sql.replace(reg, html);
        sqlStr = sqlStr.replace(reg,""+arrPram[i].id+"");
      }
      $("#sqlValueViewShow").html(sql);
    },
    getSelectRow(){
      var returnObj = {
        "verify" : false,
        "sqlDraftObj" : {
          "draftSql" : "",
          "paramJson" : "",
          "draftUuid" : "",
          "draftTitle" : ""
        }
      };
      let datas = this.$refs.sqlDraftListTable.selection;
      if(datas.length == 0 || datas.length > 1){
        this.$message({ type: 'info', message: '请选择一条数据'})

      }
      else{
        let rowData = datas[0];
        returnObj.sqlDraftObj.draftSql = rowData.draftSql;
        returnObj.sqlDraftObj.paramJson = rowData.paramJson;
        returnObj.sqlDraftObj.sqlDraftUuid = rowData.sqlDraftUuid;
        returnObj.sqlDraftObj.draftTitle = rowData.draftTitle;
        returnObj.verify = true;
      }
      return returnObj;
    }
  }
}
</script>
