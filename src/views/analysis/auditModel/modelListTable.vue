<template>
  <div class="list-container">
    <div class="filter-container">
      <QueryField ref="queryfield" :form-data="queryFields" @submit="getList" />
    </div>
    <div style="float: right;">
      <el-button type="primary" class="oper-btn detail" @click="addModel" />
      <el-button type="primary" class="oper-btn add" @click="addModel" />
      <el-button type="primary" class="oper-btn edit" @click="updateModel" />
      <el-button type="primary" class="oper-btn delete" @click="deleteModel" />
      <el-dropdown placement="bottom" trigger="click" style="margin-left: 10px;">
        <el-button type="primary" class="oper-btn more" />
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="exportModel">导出</el-dropdown-item>
          <el-dropdown-item @click.native="importData">导入</el-dropdown-item>
          <el-dropdown-item @click.native="shareModel">共享</el-dropdown-item>
          <el-dropdown-item @click.native="publicModel('publicModel')">发布</el-dropdown-item>
          <el-dropdown-item @click.native="cancelPublicModel()">撤销发布</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-table :key="tableKey" ref="modelListTable" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;">
      <el-table-column type="selection" width="55" />
      <el-table-column label="模型名称" width="100px" align="center" prop="modelName" />
      <el-table-column label="平均运行时间" width="150px" align="center" prop="runTime" />
      <el-table-column label="审计事项" prop="auditItemName" />
      <el-table-column label="风险等级" prop="riskLevelUuid" :formatter="riskLevelFormatter" />
      <el-table-column label="模型类型" prop="modelType" :formatter="modelTypeFormatter" />
      <el-table-column label="创建时间" prop="createTime" :formatter="dateFormatter" />
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
    <el-dialog v-if="editModelShow" :visible.sync="editModelShow" :title="editModelTitle" width="80%">
      <EditModel ref="editModel" :open-value="selectTreeNode" :operation-obj="operationObj" @hideModal="hideEditModal" />
      <div slot="footer">
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="hideEditModal">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog v-if="treeSelectShow" :visible.sync="treeSelectShow" title="发布模型" width="50%">
      <ModelFolderTree ref="modelFolderTree" :publicModel="publicModelValue"/>
      <div slot="footer">
        <el-button type="primary" @click="updatePublicModel">确定</el-button>
        <el-button @click="treeSelectShow=false">取消</el-button>
      </div>
    </el-dialog>
    <el-upload style="position: relative;top: -40px;left: 240px;display: none"
               :show-file-list="false"
               :on-success="onSuccess"
               :on-error="onError"
               :before-upload="beforeUpload"
               :on-remove="handleRemove"
               action="/modelController/importModel"
               accept=".json"
    >
      <el-button id="importBtn" plain type="primary">导入</el-button>
    </el-upload>
  </div>
</template>
<script>
import { findModel, saveModel, deleteModel, selectModel, updateModel,updateModelBasicInfo,exportModel,setModelSession } from '@/api/analysis/auditModel'
import QueryField from '@/components/Ace/query-field/index'
import Pagination from '@/components/Pagination/index'
import ModelFolderTree from '@/views/analysis/auditModel/modelFolderTree'
import EditModel from '@/views/analysis/auditModel/editModel'
import { getOneDict } from '@/utils/index'
export default {
  name: 'ModelListTable',
  components: { Pagination, QueryField, EditModel,ModelFolderTree },
  data() {
    return {
      tableKey: 'errorUuid',
      list: null,
      total: 0,
      listLoading: false,
      editModelTitle: '',
      treeSelectShow:false,
      editModelShow: false,
      publicModelValue:"publicModel",
      dialogFormVisible: true,
      selectTreeNode: null,
      isUpdate: false,
      queryFields: [
        { label: '模型名称', name: 'modelName', type: 'fuzzyText', value: '' },
        { label: '审计事项', name: 'auditItemName', type: 'fuzzyText' },
        { label: '风险等级', name: 'riskLevelUuid', type: 'select',
          data: [{ name: '请选择', value: '-1' }, { name: '高', value: '1' }, { name: '中', value: '2' }, { name: '低', value: '3' }],
          default: '-1' }
      ],
      operationObj: {},
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
            headerName: '模型名称',
            field: 'modelName',
            pinned: 'left',
            filter: 'agTextColumnFilter'
          },
          {
            headerName: '平均运行时间',
            field: 'runTime',
            pinned: 'left'
          },
          {
            headerName: '审计事项',
            field: 'auditItemUuid',
            pinned: 'left'
          },
          {
            headerName: '风险等级',
            field: 'riskLevelUuid',
            filter: 'agNumberColumnFilter'
          },
          {
            headerName: '模型类型',
            field: 'modelType',
            filter: 'agNumberColumnFilter'
          }
        ]
      },
      formStyle: {
        width: '700px',
        height: '400px'
      },
      temp: {
        modelUuid: '',
        modelName: '',
        modelFolderUuid: '',
        auditItemUuid: '',
        riskLevelUuid: '',
        auditIdeas: '',
        paramConditions: '',
        sqlValue: '',
        modelType: ''
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
    //this.getList({ modelFolderUuid: 1 })
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
     * 格式化类型
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的字符串}
     */
    modelTypeFormatter(row, column) {
      const modelType = row.modelType
      if (modelType === '1') {
        return '审计模型'
      } else if (modelType === '2') {
        return '图形化模型'
      }
    },
    riskLevelFormatter(row, column) {
      let riskLevel = row.riskLevelUuid
      let value = ""
      value = getOneDict(riskLevel)[0].codeName;
      return value
    },
    /**
     * 获取模型列表
     * @param query 查询条件
     */
    getList(query) {
      this.listLoading = true
      if (query) {
        this.pageQuery.condition = query
      }
      findModel(this.pageQuery).then(resp => {
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
    },
    /**
     * 设置选中的树节点
     * @param data 树节点
     */
    setSelectTreeNode(data) {
      this.selectTreeNode = data
    },
    /**
     * 保存模型
     */
    save() {
      var modelObj = this.$refs.editModel.getModelObj()
      if (modelObj == null) {
        return
      }
      this.listLoading = true
      if (!this.isUpdate) {
        saveModel(modelObj).then(result => {
          if (result.code === 0) {
            this.getList(this.query)// 刷新列表
            this.$emit('refreshTree')
            this.listLoading = false
            this.editModelShow = false
            // this.$refs.editModel.clear();
          } else {
            this.$message({ type: 'error', message: '新增模型失败!' })
            this.listLoading = false
          }
        })
      } else {
        updateModel(modelObj).then(result => {
          if (result.code === 0) {
            this.getList(this.query)// 刷新列表
            this.$emit('refreshTree')
            this.listLoading = false
            this.editModelShow = false
            // this.$refs.editModel.clear();
          } else {
            this.$message({ type: 'error', message: '修改模型失败!' })
            this.listLoading = false
          }
        })
      }
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
     * 隐藏编辑模型界面
     */
    hideEditModal() {
      this.editModelShow = false
    },
    /**
     * 添加模型
     */
    addModel() {
      this.isUpdate = false
      if (this.selectTreeNode == null) {
        this.$message({ type: 'info', message: '请先选择模型分类!' })
      } else {
        var operationObj = { operationType: 1 }
        this.operationObj = operationObj
        this.editModelTitle = '添加模型'
        this.editModelShow = true
      }
    },
    updateModel() {
      this.isUpdate = true
      var selectObj = this.$refs.modelListTable.selection
      if (selectObj.length == 0) {
        this.$message({ type: 'info', message: '最少选择一个模型!' })
        return
      }
      if (selectObj.length > 1) {
        this.$message({ type: 'info', message: '只能选择一个模型!' })
        return
      }
      this.editModelTitle = '修改模型'
      selectModel(selectObj[0].modelUuid).then(result => {
        if (result.code == 0) {
          var operationObj = {
            operationType: 2,
            model: result.data
          }
          this.operationObj = operationObj
          this.editModelShow = true
          this.getList(this.query)
          this.$emit('refreshTree')
        } else {
          this.$message({ type: 'error', message: '删除失败' })
        }
      })
    },
    /**
     * 删除模型
     */
    deleteModel() {
      var selectObj = this.$refs.modelListTable.selection
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: 'info', message: '请先选择要删除的模型!' })
        return
      }
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteModel(selectObj).then(result => {
          if (result.code == 0) {
            this.getList(this.query)
            this.$emit('refreshTree')
          } else {
            this.$message({ type: 'error', message: '删除失败' })
          }
        })
      })
    },
    /**
     * 发布模型
     */
    publicModel(value){
      if(this.selectTreeNode == null || this.selectTreeNode.path.indexOf('gonggong') != -1){
        this.$message({ type: 'info', message: '只能发布非公共模型下的模型' })
        return
      }
      this.publicModelValue = value;
      var selectObj = this.$refs.modelListTable.selection
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: 'info', message: '请先选择要发布的模型!' })
        return
      }
      this.$confirm('是否确定将选中的模型发布到公共模型下?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.treeSelectShow = true;
      })
    },
    /**
     *撤销发布
     */
    cancelPublicModel(){
      if(this.selectTreeNode == null || this.selectTreeNode.path.indexOf('gonggong') == -1){
        this.$message({ type: 'info', message: '只能撤销公共模型下的模型' })
        return
      }
      var selectObj = this.$refs.modelListTable.selection
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: 'info', message: '请先选择要撤销发布的模型!' })
        return
      }
      this.$confirm('是否确定将选中的模型撤销发布?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        for(let i = 0;i < selectObj.length;i++){
          selectObj[i].modelFolderUuid = 'xiaxian'
        }
        this.updateModelBasicInfo(selectObj,"撤销发布")
      }).catch(()=>{

      })
    },
    /**
     * 修改要发布的模型
     */
    updatePublicModel(){
      let selectNode = this.$refs.modelFolderTree.getSelectNode()
      var selectObj = this.$refs.modelListTable.selection
      for(let i = 0;i < selectObj.length;i++){
        selectObj[i].modelFolderUuid = selectNode.id
      }
      this.updateModelBasicInfo(selectObj,"发布")
    },
    /**
     * 修改模型基本信息
     * @param selectObj 要修改的数组对象
     * @param tips 提示信息
     */
    updateModelBasicInfo(selectObj,tips){
      updateModelBasicInfo(selectObj).then(result => {
        if(result.code == 0){
          this.treeSelectShow = false;
          this.$notify({
            title:'提示',
            message:tips + '成功',
            type:'success',
            duration:2000,
            position:'bottom-right'
          });
          this.getList(this.query)// 刷新列表
          this.$emit('refreshTree')
          //刷新树和列表
        }
        else{
          this.$notify({
            title:'提示',
            message:tips + '失败',
            type:'error',
            duration:2000,
            position:'bottom-right'
          });
        }
      })
    },
    /**
     * 导出模型
     */
    exportModel(){
      var selectObj = this.$refs.modelListTable.selection
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: 'info', message: '请先选择要导出的模型!' })
        return
      }
      let modelIds = [];
      for(let i = 0;i < selectObj.length;i++){
        modelIds.push(selectObj[i].modelUuid)
      }
      setModelSession(modelIds).then(result=>{
        exportModel()
      })
    },
    importData(){
      $("#importBtn").click();
    },
    handleRemove(file, fileList) {
    },
    /**
     * 上传之前回调函数
     */
    beforeUpload(file) {
      this.uploaDialog = true;
    },
    /**
     * 上传失败回调函数
     */
    onError(err, file, fileList) {
      this.$message({
        message: "上传失败",
        type: "error"
      });
    },
    /**
     * 上传成功回调函数
     */
    onSuccess(response, file, fileList) {
      this.$message({
        message: response.msg,
        type: "info"
      });
      file = [];
      fileList = [];
    },
    shareModel(){
      //弹出人员选择窗体
    },
  }
}
</script>
