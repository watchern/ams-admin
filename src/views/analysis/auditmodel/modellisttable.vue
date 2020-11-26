<template>
  <div class="tree-list-container">
    <el-tabs v-model="editableTabsValue" closable @tab-remove="removeTab">
      <el-tab-pane label="模型列表" name="modelList">
        <div class="filter-container">
          <QueryField ref="queryfield" :form-data="queryFields" @submit="getList" />
        </div>
        <el-row type="flex" class="row-bg" v-if="power!='warning'">
          <el-col align="right">
            <el-button type="primary" :disabled="btnState.previewBtn" class="oper-btn detail" @click="previewModel" />
            <el-button type="primary" :disabled="btnState.addBtnState" class="oper-btn add" @click="addModel" />
            <el-button type="primary" :disabled="btnState.editBtnState" class="oper-btn edit" @click="updateModel" />
            <el-button type="primary" :disabled="btnState.deleteBtnState" class="oper-btn delete" @click="deleteModel" />
            <el-dropdown placement="bottom" trigger="click" class="el-dropdown">
              <el-button type="primary" :disabled="btnState.otherBtn" class="oper-btn more" />
              <el-dropdown-menu slot="dropdown">
<!--                  <el-dropdown-item @click.native="exportModel">导出</el-dropdown-item>
                <el-dropdown-item @click.native="importData">导入</el-dropdown-item>-->
                <el-dropdown-item @click.native="shareModelDialog">共享</el-dropdown-item>
                <el-dropdown-item @click.native="publicModel('publicModel')">发布</el-dropdown-item>
                <el-dropdown-item @click.native="cancelPublicModel()">撤销发布</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-col>
        </el-row>
        <el-table :key="tableKey" style="height: 450px;overflow-y: scroll" ref="modelListTable" v-loading="listLoading"
                  :data="list" border fit highlight-current-row @select="modelTableSelectEvent" @select-all="modelTableSelectEvent">
          <el-table-column type="selection" width="55" />
          <el-table-column label="模型名称" width="100px" align="left" prop="modelName">
            <template slot-scope="scope">
              <el-link type="primary" @click="selectModelDetail(scope.row.modelUuid)">{{scope.row.modelName}}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="平均运行时间" width="150px" align="center" prop="runTime" />
          <el-table-column label="审计事项" prop="auditItemName" align="center" />
          <el-table-column label="风险等级" prop="riskLevelUuid" align="center" :formatter="riskLevelFormatter" />
          <el-table-column label="模型类型" prop="modelType" align="center" :formatter="modelTypeFormatter" />
          <el-table-column label="创建时间" prop="createTime" align="center" :formatter="dateFormatter" />
        </el-table>
        <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
      </el-tab-pane>
      <el-tab-pane
        v-for="(item, index) in editableTabs"
        :key="item.name"
        :label="item.title"
        :name="item.name">
        <!--增加参数输入组件-->
        <el-collapse v-model="activeNames">
          <el-collapse-item name="1" v-if="item.isExistParam">
            <template slot="title"><div class="panel-font-size">参数输入区域</div></template>
            <el-row>
              <el-col :span="22">
                <crossrangeParam :myId="item.name" :ref="item.name + 'param'"></crossrangeParam>
              </el-col>
              <el-col :span="2">
                <el-button type="primary" @click="queryModel(item.name)">查询</el-button>
              </el-col>
            </el-row>
          </el-collapse-item>
          <el-collapse-item name="2">
            <template slot="title"><div class="panel-font-size">结果展示区域</div></template>
            <!--增加结果组件-->
            <el-row>
              <el-col :span="24">
                <childTabs :ref="item.name" :key="1" :pre-value="item.executeSQLList" use-type="sqlEditor"/>
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
    </el-tabs>
    <modelshoppingcart v-show="isShowShoppingCart" ref="modelShoppingCartRef"></modelshoppingcart>
    <el-dialog v-if="treeSelectShow" :visible.sync="treeSelectShow" title="发布模型" width="50%">
      <ModelFolderTree ref="modelFolderTree" :public-model="publicModelValue" />
      <div slot="footer">
        <el-button type="primary" @click="updatePublicModel">确定</el-button>
        <el-button @click="treeSelectShow=false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="请输入参数" v-if="dialogFormVisible" :visible.sync="dialogFormVisible" :append-to-body="true">
      <paramDraw ref="paramDrawRef" :myId="paramDrawUuid"/>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">关闭</el-button>
        <el-button type="primary" @click="replaceNodeParam">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="请选择共享人员" v-if="dialogFormVisiblePersonTree" :visible.sync="dialogFormVisiblePersonTree" :append-to-body="true">
      <personTree ref="personTree"/>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisiblePersonTree = false">关闭</el-button>
        <el-button type="primary" @click="shareModel">确定</el-button>
      </div>
    </el-dialog>
    <el-upload
      style="position: relative;top: -40px;left: 240px;display: none"
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
import { findModel, saveModel, deleteModel,shareModel, selectModel, updateModel,updateModelBasicInfo,exportModel,setModelSession } from '@/api/analysis/auditmodel'
import QueryField from '@/components/Ace/query-field/index'
import Pagination from '@/components/Pagination/index'
import ModelFolderTree from '@/views/analysis/auditmodel/modelfoldertree'
import EditModel from '@/views/analysis/auditmodel/editmodel'
import { getOneDict } from '@/utils/index'
import childTabs from '@/views/analysis/auditmodelresult/childtabs'
import { startExecuteSql } from '@/api/analysis/sqleditor/sqleditor'
import crossrangeParam from '@/views/analysis/modelparam/crossrangeparam'
import paramDraw from '@/views/analysis/modelparam/paramdraw'
import {replaceNodeParam,replaceCrossrangeNodeParam } from '@/api/analysis/auditparam'
import modelshoppingcart from '@/views/analysis/auditmodel/modelshoppingcart'
import personTree from '@/components/publicpersontree/index'
export default {
  name: 'ModelListTable',
  components: { Pagination, QueryField, EditModel,ModelFolderTree,childTabs,crossrangeParam,paramDraw,modelshoppingcart,personTree },
  props:['power'],
  data() {
    return {
      tableKey: 'errorUuid',
      //list列表
      list: null,
      total: 0,
      //遮罩
      listLoading: false,
      //编辑框名称
      editModelTitle: '',
      isShowShoppingCart:false,
      //发布模型dialog
      treeSelectShow:false,
      //折叠面板默认展开
      activeNames:['1','2'],
      //编辑模型dialog
      editModelShow: false,
      //发布模型
      publicModelValue:"publicModel",
      //选中树节点
      selectTreeNode: null,
      //编辑模型遮罩
      editorModelLoading:false,
      //是否修改
      isUpdate: false,
      //页签默认值
      editableTabsValue: 'modelList',
      //页签数组
      editableTabs:[],
      //已经正在预览的模型
      modelPreview:[],
      paramDrawUuid:'',
      //记录模型是否首次运行  如果非首次运行则不重复加载参数
      modelRunTaskList:{},
      //参数输入界面
      dialogFormVisible:false,
      //按钮状态
      btnState:{
        addBtnState:false,
        editBtnState:true,
        deleteBtnState:true,
        previewBtn:true,
        otherBtn:true
      },
      //当前预览模型参数和sql
      currentPreviewModelParamAndSql:{},
      queryFields: [
        { label: '模型名称', name: 'modelName', type: 'fuzzyText', value: '' },
        { label: '审计事项', name: 'auditItemName', type: 'fuzzyText' },
        { label: '风险等级', name: 'riskLevelUuid', type: 'select',
          data: [{ name: '请选择', value: '-1' }, { name: '高', value: '002002001' }, { name: '中', value: '002002002' }, { name: '低', value: '002002003' }],
          default: '-1' }
      ],
      //是否编辑模型对象
      operationObj: {},
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
      },
      //人员选择
      dialogFormVisiblePersonTree:false
    }
  },
  computed: {

  },
  created() {
    //this.getList({ modelFolderUuid: 1 })
  },
  watch:{
    dialogFormVisible(value){
      this.$nextTick(function(){
        if(value){
          this.$refs.paramDrawRef.initParamHtmlSS(this.currentPreviewModelParamAndSql.sqlValue, this.currentPreviewModelParamAndSql.paramObj, '请输入参数', this.paramDrawUuid)
        }
      })
    },
    editableTabs(){
      this.$nextTick(function(){
        //页签添加完成后初始化新界面的参数
        if(this.currentPreviewModelParamAndSql.paramObj != undefined){
          this.$refs.[this.currentPreviewModelParamAndSql.modelUuid + 'param'][0].
          initParamHtmlSS(this.currentPreviewModelParamAndSql.sqlValue, this.currentPreviewModelParamAndSql.paramObj, '请输入参数', this.currentPreviewModelParamAndSql.modelUuid)
        }
      })
    }
  },
  mounted() {
    this.initWebSocket()
  },
  methods: {
    /**
     *初始化webSocket
     */
    initWebSocket() {
      this.webSocket = this.getWebSocket()
    },
    /**
     *
     * 使用说明：
     * 1、WebSocket客户端通过回调函数来接收服务端消息。例如：webSocket.onmessage
     * 2、WebSocket客户端通过send方法来发送消息给服务端。例如：webSocket.send();
     */
    getWebSocket() {
      /*const webSocketPath = 'ws://localhost:8086/analysis/websocket?' + this.$store.getters.personuuid*/
      const webSocketPath = process.env.VUE_APP_ANALYSIS_WEB_SOCKET + this.$store.getters.personuuid+"modellisttable";
      // WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
      this.webSocket = new WebSocket(webSocketPath) // 建立与服务端的连接
      // 当服务端打开连接
      this.webSocket.onopen = function(event) {
      }
      // 发送消息
      this.webSocket.onmessage = function(event) {
        func1(event)
      }
      const func2 = function func3(val) {
        const dataObj = JSON.parse(val.data)
/*        if(this.currentPreviewModelParamAndSql.paramObj != undefined){
          this.$refs.[dataObj.modelUuid + 'param'][0].
          initParamHtmlSS(this.currentPreviewModelParamAndSql.sqlValue, this.currentPreviewModelParamAndSql.paramObj, '请输入参数', dataObj.modelUuid)
        }*/
        this.$refs.[dataObj.modelUuid][0].loadTableData(dataObj)
      }
      const func1 = func2.bind(this)
      this.webSocket.onclose = function(event) {
      }
      // 通信失败
      this.webSocket.onerror = function(event) {
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
     * 格式化模型类型
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的字符串}
     */
    modelTypeFormatter(row, column) {
      const modelType = row.modelType
      let dicObj = getOneDict(modelType)
      let value = ""
      if(dicObj.length == 0){
        return "";
      }
      value = dicObj[0].codeName;
      return value
    },
    /**
     * 格式化风险等级
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的字符串}
     */
    riskLevelFormatter(row, column) {
      let riskLevel = row.riskLevelUuid
      let value = ""
      let dicObj = getOneDict(riskLevel)
      if(dicObj.length == 0){
        return "";
      }
      value = dicObj[0].codeName;
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
      this.editorModelLoading = true
      if (!this.isUpdate) {
        saveModel(modelObj).then(result => {
          if (result.code === 0) {
            this.getList(this.query)// 刷新列表
            this.$emit('refreshTree')
            this.editorModelLoading = false
            this.editModelShow = false
            // this.$refs.editModel.clear();
          } else {
            this.$message({ type: 'error', message: '新增模型失败!' })
            this.editorModelLoading = false
          }
        })
      } else {
        updateModel(modelObj).then(result => {
          if (result.code === 0) {
            this.getList(this.query)// 刷新列表
            this.$emit('refreshTree')
            this.editorModelLoading = false
            this.editModelShow = false
            // this.$refs.editModel.clear();
          } else {
            this.$message({ type: 'error', message: '修改模型失败!' })
            this.editorModelLoading = false
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
    modelTableSelectEvent(selection, row) {
      var selectObj = this.$refs.modelListTable.selection
      if(selectObj.length == 1){
        //显示全部按钮
        this.btnState.otherBtn = false
        this.btnState.deleteBtnState = false
        this.btnState.addBtnState = false
        this.btnState.editBtnState = false
        this.btnState.previewBtn = false
        this.isShowShoppingCart = true
        this.$refs.modelShoppingCartRef.setMemo(selectObj)
      }
      else if(selectObj.length > 1){
        //只显示删除和添加按钮
        this.btnState.otherBtn = false
        this.btnState.deleteBtnState = false
        this.btnState.addBtnState = false
        this.btnState.editBtnState = true
        this.btnState.previewBtn = true
        this.isShowShoppingCart = true
        this.$refs.modelShoppingCartRef.setMemo(selectObj)
      }
      else if(selectObj.length == 0){
        //只显示添加按钮
        this.btnState.otherBtn = true
        this.btnState.deleteBtnState = true
        this.btnState.addBtnState = false
        this.btnState.editBtnState = true
        this.btnState.previewBtn = true
        this.isShowShoppingCart = false
      }
    },
    /**
     * 添加模型
     */
    addModel() {
      this.isUpdate = false
      let operationObj = { operationType:1,folderId:"",folderName:""}
      if(this.selectTreeNode != null){
        if(this.selectTreeNode.pid == 0 ||this.selectTreeNode.pid == null){
          this.$message({ type: 'info', message: '不允许建立在根目录' })
          return
        }
        operationObj = { operationType:1,folderId:this.selectTreeNode.id,folderName:this.selectTreeNode.label}
      }
      sessionStorage.setItem('operationObj', JSON.stringify(operationObj));
      this.$store.commit('aceState/setRightFooterTags',{
        type:'active',
        val:{
          name:'新增模型',
          path:'/analysis/editorModel'
        }
      })
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
            model: result.data,
            folderId:"",
            folderName:""
          }
          sessionStorage.setItem('operationObj', JSON.stringify(operationObj));
          this.$store.commit('aceState/setRightFooterTags',{
            type:'active',
            val:{
              name:'修改模型',
              path:'/analysis/editorModel'
            }
          })
        } else {
          this.$message({ type: 'error', message: '修改失败' })
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
      this.$confirm('此操作将永久删除该模型, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteModel(selectObj).then(result => {
          if (result.code == 0) {
            this.getList(this.query)
            this.$emit('refreshTree')
            this.$notify({
              title:'提示',
              message:'删除成功',
              type:'success',
              duration:2000,
              position:'bottom-right'
            });
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
          this.$message({ type: 'error', message: tips + '失败' })
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
    /**
     *打开人员选择
     */
    shareModelDialog(){
      var selectObj = this.$refs.modelListTable.selection
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: 'info', message: '请先选择要共享的模型!' })
        return
      }
      this.dialogFormVisiblePersonTree = true
      //弹出人员选择窗体
    },
    /**
     *共享模型
     */
    shareModel(){
      //获取选中的人员
      //循环组织对象添加数据
      var selectObj = this.$refs.modelListTable.selection
      let modelShareRelList = [];
      let persons = this.$refs.personTree.getSelectValue()
      for(let i = 0;i < selectObj.length;i++){
        for(let j = 0;j < persons.length;j++){
          let obj = {
            modelUuid:selectObj[i].modelUuid,
            belongUuid:persons[j].personuuid,
            belongName:persons[j].cnname
          }
          modelShareRelList.push(obj)
        }
      }
      shareModel(modelShareRelList).then(result=>{
        if(result.code == 0){
          this.$notify({
            title:'提示',
            message:'共享成功',
            type:'success',
            duration:2000,
            position:'bottom-right'
          });
          this.dialogFormVisiblePersonTree = false
        }
        else{
          this.$message({ type: 'error', message: '共享模型失败!' })
        }
      })
    },
    previewModel(){
      var selectObj = this.$refs.modelListTable.selection
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: 'info', message: '请先选择要预览的模型!' })
        return
      }
      if(selectObj.length > 1){
        this.$message({ type: 'info', message: '只能运行一个模型!' })
        return
      }
      if(this.modelPreview.indexOf(selectObj[0].modelUuid) != -1) {
        this.$message({ type: 'info', message: '该模型已经运行完成，请勿重复运行'})
        this.editableTabsValue = selectObj[0].modelUuid;
        return
      }
      //获取模型信息，判断是否存在参数，如果存在参数则弹出输入参数界面，否则直接送入后台执行
      selectModel(selectObj[0].modelUuid).then(result => {
        if (result.code == 0) {
          if(result.data.parammModelRel.length == 0){
            let obj = {
              sqls:result.data.sqlValue,
              modelUuid:selectObj[0].modelUuid,
              businessField:'modellisttable'
            }
            startExecuteSql(obj).then((result) => {
              if (!result.data.isError) {
                this.addTab(selectObj[0],false,result.data.executeSQLList)
              } else {
                this.$message({ type: 'info', message: '执行失败' })
              }
            })
          }
          else{
            let paramObj = []
            for(let i = 0;i < result.data.parammModelRel.length;i++){
              if(result.data.parammModelRel[i].paramValue === ""){
                continue
              }
              paramObj.push(JSON.parse(result.data.parammModelRel[i].paramValue))
            }
            this.currentPreviewModelParamAndSql.sqlValue = result.data.sqlValue
            this.currentPreviewModelParamAndSql.paramObj = paramObj
            this.currentPreviewModelParamAndSql.modelUuid = selectObj[0].modelUuid
            //展现参数输入界面
            let timestamp = new Date().getTime()
            this.paramDrawUuid = timestamp
            this.dialogFormVisible = true
          }
        } else {
          this.$message({ type: 'error', message: '获取模型信息失败' })
        }
      })
    },
    /**
     * 添加页签
     * @param modelObj 模型对象
     * @param isExistParam 参数对象
     * @param executeSQLList 执行sql列表
     */
    addTab(modelObj,isExistParam,executeSQLList) {
      this.editableTabs.push({
        title: modelObj.modelName + "结果",
        name: modelObj.modelUuid,
        isExistParam:isExistParam,
        executeSQLList:executeSQLList
      });
      this.editableTabsValue = modelObj.modelUuid;
      this.modelPreview.push(modelObj.modelUuid)
    },
    /**
     * 移除页签
     * @param targetName
     */
    removeTab(targetName) {
      let tabs = this.editableTabs;
      let activeName = this.editableTabsValue;
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
              activeName = nextTab.name;
            }
          }
        });
      }
      //移除已经运行的参数列表
      this.modelPreview.splice(this.modelPreview.indexOf(targetName),1)
      this.editableTabsValue = activeName;
      this.editableTabs = tabs.filter(tab => tab.name !== targetName);
      if(this.editableTabs.length == 0){
        this.editableTabsValue = "modelList";
      }
    },
    /**
     * 获取替换参数后的sql并执行sql
     */
    replaceNodeParam() {
      var selectObj = this.$refs.modelListTable.selection
      var obj = replaceNodeParam(this.paramDrawUuid)
      if (!obj.verify) {
        this.$message({ type: 'info', message: obj.message })
        return
      }
      obj.sqls = obj.sql
      obj.modelUuid = selectObj[0].modelUuid
      obj.businessField = 'modellisttable'
      //合并参数 将输入的值替换到当前界面
      this.currentPreviewModelParamAndSql.paramObj = obj.paramsArr
      //this.mergeParamObj(obj.paramsArr)
      startExecuteSql(obj).then((result) => {
        this.dialogFormVisible = false
        if (!result.data.isError) {
          this.addTab(selectObj[0],true,result.data.executeSQLList)
          //记录当前模型的执行任务列表，为了在结果页再次执行时与之前的数据对应
          this.modelRunTaskList[obj.modelUuid] = result.data.executeSQLList
        } else {
          this.$message({ type: 'info', message: '执行失败' })
        }
      })
    },
    /**
     * 合并参数对象
     * @param paramsArr 替换参数值后的参数数组
     */
    mergeParamObj(paramsArr){
      let paramObj = this.currentPreviewModelParamAndSql.paramObj    //模型的参数数组
      for (let i = 0;i < paramObj.length;i++){
        for (let j = 0;j < paramsArr.length;j++){
          if(paramObj[i].moduleParamId == paramsArr[j].moduleParamId){
            //如果母参相等说明是同一个参数，将输入的值替换到里面
            paramObj[i].paramValue = paramsArr[j].paramValue
          }
        }
      }
    },
    /**
     * 参数界面点击查询按钮
     * @param modelUuid 模型编号
     */
    queryModel(modelUuid){
      var obj = replaceCrossrangeNodeParam(modelUuid)
      if (!obj.verify) {
        this.$message({ type: 'info', message: obj.message })
        return
      }
      obj.sqls = obj.sql
      obj.modelUuid = modelUuid
      obj.executeSQLList = this.modelRunTaskList[obj.modelUuid]
      obj.businessField = 'modellisttable'
      //重置数据展现界面数据
      this.$refs.[modelUuid][0].reSetTable()
      startExecuteSql(obj).then((result) => {
        this.dialogFormVisible = false
        if (!result.data.isError) {

        } else {
          this.$message({ type: 'info', message: '执行失败' })
        }
      })
    },
    /**
     * 获取模型列表选中的数据
     */
    getModelListCheckData(){
      return this.$refs.modelListTable.selection
    },
    /**
     * 查看模型
     * @param modelUuid 模型编号
     */
    selectModelDetail(modelUuid){
      this.isUpdate = true
      selectModel(modelUuid).then(result => {
        if (result.code == 0) {
          this.editModelTitle = result.data.modelName + '详细'
          var operationObj = {
            operationType: 3,
            model: result.data,
            folderId:"",
            folderName:"",
            formName:result.data.modelName + '详细'
          }
          sessionStorage.setItem('operationObj', JSON.stringify(operationObj));
          this.$store.commit('aceState/setRightFooterTags',{
            type:'active',
            val:{
              name:result.data.modelName + '详细',
              path:'/analysis/editorModel'
            }
          })
        } else {
          this.$message({ type: 'error', message: '查看模型详细失败' })
        }
      })
    }
  }
}
</script>

<style>

.el-dropdown{
  margin-left: 10px;
}

.panel-font-size{
  font-size: 25px;
}
</style>
