<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField ref="queryfield" :form-data="queryFields" @submit="getList" />
    </div>
    <el-row>
      <el-col align="right">
        <el-button type="primary"  class="oper-btn add" @click="add" />
        <el-button type="primary"  class="oper-btn edit" @click="update" :disabled="!isShowSingleBtn" />
        <el-button type="primary"  class="oper-btn delete" @click="deleteWarning" :disabled="!isShowManyBtn" />
      </el-col>
    </el-row>
    <el-table :key="tableKey" ref="auditWarningList" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;"
              @select="listSelectChange" @select-all="listSelectChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="预警名称" prop="warningName" width="300px"  >
        <template slot-scope="scope">
          <el-link
            @click.native.prevent="detail(scope.row.auditWarningUuid)"
            type="primary">
            {{scope.row.warningName}}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="createUserName" width="150px"  />
      <el-table-column label="创建时间" prop="createTime" :formatter="dateFormatter" align="center"/>
      <el-table-column label="关联类型" prop="warningType" :formatter="warningTypeFormat" align="center"/>
      <el-table-column label="关联模型" prop="sourceCount"  />
      <el-table-column label="操作" prop="isStart" align="center" >
        <template slot-scope="scope">
          <el-link
            type="primary"
            @click="startWarning(scope.row.auditWarningUuid)"
            v-if="scope.row.isStart == 0"
          >
            启动
          </el-link>
          <el-link
            type="primary"
            @click="stopWarning(scope.row.auditWarningUuid)"
            v-if="scope.row.isStart == 1">
            停止
          </el-link>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
    <el-dialog :title="editDialogTitle" v-if='editDialogVisible' :close-on-click-modal="false" :visible.sync="editDialogVisible">
      <EditAuditWarning ref="edit" :option="operationObj.option" :optionUuid="operationObj.optionUuid"/>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">关闭</el-button>
        <el-button type="primary" v-show="operationObj.option === 'add' || operationObj.option === 'update'" @click="save">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { findAuditWarningList, addWarning, deleteAuditWarning, updateWarning, startById, stopById} from '@/api/analysis/auditwarning'
import QueryField from '@/components/public/query-field/index'
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
      //列表遮罩
      listLoading: false,
      //是否展示修改等单个数据操作按钮
      isShowSingleBtn : false,
      //是否展示删除等多个数据操作按钮
      isShowManyBtn : false,
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
        //操作数据主键
        optionUuid : "",
        //保存结果文件夹名称
        // locationName : ""
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
     * 启动预警
     * @param id 审计预警主键
     */
    startWarning(id){
      if(!id){
        this.$message({
          type: 'info',
          message: '请先选择要启动的预警!'
        })
        return
      }
      startById(id).then(resp => {
        if(resp.code !== 0){
          this.$message({
            type: 'error',
            message: '启动预警失败'
          })
          return
        }
        this.$notify({
          title:'提示',
          message:'启动成功',
          type:'success',
          duration:2000,
          position:'bottom-right'
        });
        this.getList()
      })
    },
    /**
     * 停止预警
     * @param id 审计预警主键
     */
    stopWarning(id){
      if(!id){
        this.$message({
          type: 'info',
          message: '请先选择要停止的预警!'
        })
        return
      }
      stopById(id).then(resp => {
        if(resp.code !== 0){
          this.$message({
            type: 'error',
            message: '停止预警失败'
          })
          return
        }
        this.$notify({
          title:'提示',
          message:'停止成功',
          type:'success',
          duration:2000,
          position:'bottom-right'
        });
        this.getList()
      })
    },

    /**
     * 列选择触发事件
     * @param selection 已选择行
     */
    listSelectChange(selection){
      if(selection && selection.length == 0){
        this.isShowManyBtn = false
        this.isShowSingleBtn = false
      }
      if(selection && selection.length > 0){
        this.isShowManyBtn = true
      }
      if(selection && selection.length == 1){
        this.isShowSingleBtn = true
      }
      if(selection && selection.length > 1){
        this.isShowSingleBtn = false
        this.isShowManyBtn = true
      }

    },
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
      this.operationObj.option = "add"
      this.editDialogTitle = "添加审计预警"
      this.editDialogVisible = true
    },

    /**
     * 更新审计预警
     */
    update(){
      let selectObj = this.$refs.auditWarningList.selection
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: 'info', message: '请先选择要修改的审计预警!' })
        return
      }
      this.operationObj.option = "update"
      this.operationObj.optionUuid = selectObj[0].auditWarningUuid
      this.editDialogTitle = "修改审计预警"
      this.editDialogVisible = true
    },

    /**
     * 查看审计预警
     */
    detail(id,locaname){
      this.operationObj.option = "detail"
      this.operationObj.optionUuid = id
      this.editDialogTitle = "审计预警详情"
      this.editDialogVisible = true
      // this.operationObj.locationName = locaname
      // console.log(locaname+"111")
    },

    /**
     * 删除审计预警
     */
    deleteWarning(id){
      let selectObj = this.$refs.auditWarningList.selection
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: 'info', message: '请先选择要删除的审计预警!' })
        return
      }
      //组织删除审计预警
      let deleteObj = []
      for(let obj of selectObj){
        if(!obj){
          continue
        }
        deleteObj.push({
          auditWarningUuid : obj.auditWarningUuid,
          warningName : obj.warningName,
          isDeleted : obj.isDeleted
        })
      }
      this.$confirm('确定删除选中的审计预警信息吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(()=>{
        //删除审计预警信息
        deleteAuditWarning(deleteObj).then(resp=>{
          if(resp.code !== 0){
            this.$message({
              type: 'error',
              message: '删除失败'
            })
            return
          }
          this.$notify({
            title:'提示',
            message:'删除成功',
            type:'success',
            duration:2000,
            position:'bottom-right'
          })
          this.getList()
        })
      })
    },

    /**
     * 保存审计预警调用
     */
    save: function () {
      let fromData = this.$refs['edit'].getFormData()
      if (!fromData) {
        return
      }
      //新增
      if (this.operationObj.option == "add") {
        //获取表单数据中的模型列表
        var editModelList = this.$refs['edit'].temp.modelList;
        //遍历模型列表
        for (var item in editModelList) {
          var warResTbName = editModelList[item].warningResTbName;
          //如果模型设置了模型运行结果名进行下列操作
          if (warResTbName !== undefined) {
            var settingInfoSql = fromData.warningTaskRel[item].settingInfo;
            //将填入的模型运行结果名赋值给formData
            fromData.warningTaskRel[item].warningResTbName = warResTbName;
            //找出想要替换的表名
            var newsettingInfoSql = settingInfoSql.split("CREATE TABLE")[1];
            newsettingInfoSql = newsettingInfoSql.split("AS")[0];
            newsettingInfoSql = newsettingInfoSql.trim();
            //将原表名替换成模型运行结果名
            settingInfoSql = settingInfoSql.replaceAll(newsettingInfoSql,warResTbName);
            fromData.warningTaskRel[item].settingInfo = settingInfoSql;
          }
        }
        addWarning(fromData).then(resp => {
          if (resp.code != 0) {
            this.$message({
              type: 'error',
              message: '保存预警信息失败!'
            })
            return
          }

          this.$notify({
            title: '提示',
            message: '保存预警信息成功!',
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
          this.editDialogVisible = false
          this.getList()
        })
      } else if (this.operationObj.option == "update") {
        updateWarning(fromData).then(resp => {
          //获取表单数据中的模型列表
          var editModelList =this.$refs['edit'].temp.modelList;
          //遍历模型列表
          for (var item in editModelList) {
            var warResTbName = editModelList[item].warningResTbName;
            //如果模型设置了模型运行结果名进行下列操作
            if (warResTbName !== undefined) {
              //将填入的模型运行结果名赋值给formData
              fromData.warningTaskRel[item].warningResTbName = warResTbName;

              var settingInfoSql = fromData.warningTaskRel[item].settingInfo;
              if(settingInfoSql.length>12){
                //找出想要替换的表名
                var newsettingInfoSql = settingInfoSql.split("CREATE TABLE")[1];
                newsettingInfoSql = newsettingInfoSql.split("AS")[0];
                newsettingInfoSql = newsettingInfoSql.trim();
                //将原表名替换成模型运行结果名
                settingInfoSql = settingInfoSql.replaceAll(newsettingInfoSql,warResTbName);
                fromData.warningTaskRel[item].settingInfo = settingInfoSql;
              }
            }
          }
          if (resp.code != 0) {
            this.$message({
              type: 'error',
              message: '保存预警信息失败!'
            })
            return
          }
          this.$notify({
            title: '提示',
            message: '保存预警信息成功!',
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
          this.editDialogVisible = false
          this.getList()
        })
      }
    },

    /**
     * 审计预警关联类型格式化
     */
    warningTypeFormat(row, column){
      let warningType = {
        1:"模型",
        2:"指标"
      }
      return warningType[row.warningType]
    },
  }
}
</script>
