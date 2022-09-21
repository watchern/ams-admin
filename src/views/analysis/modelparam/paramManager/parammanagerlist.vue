<template>
  <div class="app-container">
    <el-container>
      <el-aside class="tree-side">
        <el-input
          v-model="filterText"
          placeholder="输入关键字进行过滤"
          class="tree-search"
        />
        <MyElTree
          ref="tree"
          :data="treeData"
          :filter-node-method="filterNode"
          default-expand-all
          :expand-on-click-node="false"
          node-key="id"
          check-strictly
          @node-click="handleNodeClick"
        >
      <span slot-scope="{ node, data }" class="custom-tree-node">
        <span> <i :class="data.icon" />{{ node.label }} </span>
        <span v-if="data.type == 'folder'">
          <el-button
            title="添加参数分类"
            type="text"
            size="mini"
            class="tree-line-btn"
            @click.stop="() => setSelectTreeNode(node, data, 1)"
          ><svg-icon icon-class="icon-add-1"
          /></el-button>
          <el-button
            title="修改参数分类"
            type="text"
            size="mini"
            class="tree-line-btn"
            @click.stop="() => setSelectTreeNode(node, data, 2)"
          ><svg-icon icon-class="icon-edit-1"
          /></el-button>
          <el-button
            title="删除参数分类"
            type="text"
            size="mini"
            class="tree-line-btn"
            @click.stop="() => deleteFolder(node, data)"
          ><svg-icon icon-class="icon-delete-1"
          /></el-button>
        </span>
      </span>
        </MyElTree>
      </el-aside>
      <div style="margin-top: 10px;margin-left:10px;width: calc(100% - 320px)">
        <div class="filter-container">
          <QueryField ref="queryfield" :form-data="queryFields" @submit="getParamList" />
        </div>
        <el-row type="flex" class="row-bg">
          <el-col align="right">
            <el-button type="primary" class="oper-btn add" :disabled="btnState.addBtnState" @click="addParamForm" />
            <el-button type="primary" class="oper-btn edit" :disabled="btnState.updateBtnState" @click="updateParamForm" />
            <el-button type="primary" class="oper-btn delete" :disabled="btnState.deleteBtnState" @click="deleteParam" />
            <el-dropdown placement="bottom" trigger="click" style="margin-left: 10px;">
              <el-button type="primary" :disabled="btnState.otherBtnState" class="oper-btn more" />
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="enableParam">启用</el-dropdown-item>
                <el-dropdown-item @click.native="stopParam">停用</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-col>
        </el-row>
        <el-table
          v-loading="loading"
          ref="paramTableList"
          :data="tableData"
          @select="paramTableSelectEvent"
          @select-all="paramTableSelectEvent"
          :height="autoHeight"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column
            prop="paramName"
            label="参数名称"
            width="300">
          </el-table-column>
          <el-table-column
            prop="dataType"
            label="数据类型"
            width="200"
            :formatter="dataTypeFormatter">
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建日期"
            width="200"
            align="center"
            :formatter="dateFormatter">
          </el-table-column>
          <el-table-column
            prop="createPersonName"
            label="创建人"
            width="200">
          </el-table-column>
          <el-table-column
            prop="enabled"
            label="参数状态"
            width="200"
            align="center"
            :formatter="enabledFormatter">
          </el-table-column>
        </el-table>
       <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getParamList" />
      </div>
    </el-container>
    <el-dialog
      :close-on-click-modal="false"
      v-if="dialogFormVisible"
      title="请填写分类信息"
      :visible.sync="dialogFormVisible"
    >
      <el-form :model="form" class="detail-form">
        <el-form-item label="分类名称">
          <el-input v-model="form.folderName" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="() => enterBtn()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :append-to-body="false"
      :close-on-click-modal="false"
      v-if="addParamDialog"
      :title="textMap[dialogStatus]"
      :visible.sync="addParamDialog">
      <addParam :selectTreeNode="selectTreeNode" @refshParamList="refshParamList" :operationObj="operationObj" ref="addParam"></addParam>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addParamDialog = false">取 消</el-button>
        <el-button type="primary" @click="() => saveParam()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import MyElTree from '@/components/public/tree/src/tree.vue'
import { findModelParamTreeData,addFolder,editFolder,delFolder,listByAmmParam } from '@/api/analysis/parammanagerlist'
import { getUuid } from '@/api/analysis/common'
import QueryField from '@/components/public/query-field/index'
import Pagination from '@/components/Pagination/index'
import addParam from '@/views/analysis/modelparam/paramManager/addParam'
import $ from 'jquery'
import BaseVue from '@/utils/baseVue'
let baseVue = new BaseVue({
    targetel: "paramTableList",
})
export default {
  components: { MyElTree,QueryField,Pagination,addParam},
  mixins:[baseVue],
  data() {
    return {
      //搜索监听
      filterText: null,
      //实体
      form: {
        folderId: null,
        folderName: null,
        parentFolderId: null,
        folderPath:null,
        folderType:"folder"
      },
      tableData: [],
      //添加文件夹dialog
      dialogFormVisible:false,
      // 操作类型 1、添加；2、修改
      operationType:0,
      //树节点数据
      treeData: [],
      selectTreeNode:null,
      //分页数据
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20
      },
      total: 0,
      queryFields: [
        { label: '参数名称', name: 'paramName', type: 'fuzzyText', value: ''},
        { label: '数据类型', name: 'dataType', type: 'select',
          data: [{"name":"数字","value":"num"},{"name":"日期时间","value":"date"},{"name":"文本","value":"str"}],
          default: '-1' },
        { label: '状态', name: 'enabled', type: 'select',
          data: [{"name":"启用","value":"0"},{"name":"停用","value":"1"}],
          default: '0' }
      ],
      setJsonSelectValueData:{},
      analysisUrl: '/analysis',
      btnState:{
        addBtnState:false,
        updateBtnState:true,
        deleteBtnState:true,
        otherBtnState:true
      },
      addParamDialog:false,
      loading:false,
      //操作类型
      operationObj:{
        //1、添加  2、修改
        operationType : 1,
        //参数编号
        paramUuid:''
      },
      textMap: {
        update: '修改模型参数',
        create: '添加模型参数'
      },
      dialogStatus: 'create'
    }
  },
  computed: {
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.initTreeData()
  },
  methods: {
    /**
     *初始化树数据
     */
    initTreeData(){
      findModelParamTreeData().then(resp => {
        this.treeData = resp.data
      })
    },
    /**
     * 表格选择数据事件
     */
    paramTableSelectEvent(selection, row) {
      var selectObj = this.$refs.paramTableList.selection
      if (selectObj.length == 1) {
        // 显示全部按钮
        this.btnState.otherBtnState = false
        this.btnState.deleteBtnState = false
        this.btnState.addBtnState = false
        this.btnState.updateBtnState = false
      } else if (selectObj.length > 1) {
        // 只显示删除和添加按钮
        this.btnState.otherBtnState = false
        this.btnState.deleteBtnState = false
        this.btnState.addBtnState = false
        this.btnState.updateBtnState = true
      } else if (selectObj.length == 0) {
        // 只显示添加按钮
        this.btnState.otherBtnState = true
        this.btnState.deleteBtnState = true
        this.btnState.addBtnState = false
        this.btnState.updateBtnState = true
      }
    },
    /**
     *
     * @param row 格式化行
     * @param column 格式化列
     */
    dataTypeFormatter(row, column){
      var Name_key = this.getDictObjectValue("dataType","/paramController/loadDict?codeType=dataType",row.dataType,"");
      return Name_key
    },
    enabledFormatter(row, column){
      var Name_key = this.getDictObjectValue("enabled","/paramController/loadDict?codeType=enabled",row.enabled,"");
      return Name_key
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
        let dateMat = new Date(datetime)
        let year = dateMat.getFullYear()
        let month = dateMat.getMonth() + 1
        let day = dateMat.getDate()
        let hours = dateMat.getHours()
        let minutes = dateMat.getMinutes()
        let second = dateMat.getSeconds()
        if (month.toString().length == 1) {
          month = "0" + month
        }
        if (day.toString().length == 1) {
          day = "0" + day
        }
        if (hours.toString().length == 1) {
          hours = "0" + hours
        }
        if (minutes.toString().length == 1) {
          minutes = "0" + minutes
        }
        if(second.toString().length == 1){
          second = "0" + second
        }
        var d = year + "-" + month + "-" + day + " " + hours + ":" + minutes+ ":" + second;
        return d;
      }
    },
    /**
     * 树单击事件
     * @param data 选中的数据
     * @param node 选中节点
     */
    handleNodeClick(data, node) {
      this.selectTreeNode = data
      this.getParamList(this.pageQuery.condition)
    },
    /**
     * 节点过滤
     * @param value 值
     * @param data 数据
     */
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    /**
     * 设置选中的节点
     * @param node 整个节点数据
     * @param data 数据 要设置的节点数据
     * @param operationType 1、添加；2、修改
     */
    setSelectTreeNode(node, data, operationType) {
      this.operationType = operationType
      this.selectTreeNode = data
      if (operationType === 2) {
        if(data.pid == 0){
          this.$message({ type: 'info', message: '不允许修改根节点!' })
          return
        }
        this.form.folderName = this.selectTreeNode.label
      }
      this.dialogFormVisible = true
    },
    /**
     * 表单确定按钮
     */
    enterBtn() {
      if (this.operationType === 1) {
        this.addModelParamFolder()
      } else {
        this.updateModelParamFolder()
      }
    },
    addModelParamFolder(){
      this.form.folderId = getUuid()
      this.form.parentFolderId = this.selectTreeNode.id
      this.form.folderSort = 0
      const nodePath = this.$refs.tree.getNodePath(this.selectTreeNode)
      const fullPath = []
      nodePath.forEach((path) => {
        fullPath.push(path.id)
      })
      this.form.folderPath = fullPath.join("/") + "/" + this.form.folderId
      addFolder(this.form).then(result => {
        if(result.data != null){
          const newChild = {
            id: this.form.folderId,
            label: this.form.folderName,
            children: [],
            pid: this.selectTreeNode.id,
            icon: "el-icon-folder",
            type: "folder",
          }
          if (!this.selectTreeNode.children) {
            this.$set(this.selectTreeNode, "children", [])
          }
          this.selectTreeNode.children.push(newChild)
          this.form.folderName = ""
          this.dialogFormVisible = false
        }
        else{
          this.$message({ type: 'error', message: '添加失败!' })
        }
      })
    },
    updateModelParamFolder(){
      this.form.folderId = this.selectTreeNode.id
      this.form.parentFolderId = null
      this.form.folderPath = null
      //加入修改方法
      editFolder(this.form).then(result => {
        if(result.data != null){
          this.initTreeData()
          this.form.folderName = ""
          this.dialogFormVisible = false
        }
        else{
          this.$message({ type: 'error', message: '修改失败!' })
        }
      })
    },
    deleteFolder(node, data){
      if (data.pid === 0) {
        this.$message({ success: "info", message: "根目录不允许删除" })
        return
      }
      if ((data.children !== undefined && data.children.length === 0) || data.children === undefined) {
        this.$confirm("此操作将永久删除该文件夹, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
            delFolder(data.id,data.label).then((result) => {
              if (result.code === 0) {
                this.initTreeData()
              }
              else{
                this.$message({ success: "error", message: "删除失败" })
              }
            })
          })
      } else {
        this.$message({
          success: "error",
          message: "该分类下有分类或模型，不允许删除",
        })
      }
    },
    /**
     * 获取参数列表
     * @param query 查询条件
     */
    getParamList(query) {
      this.btnState.otherBtnState = true
      this.btnState.deleteBtnState = true
      this.btnState.addBtnState = false
      this.btnState.updateBtnState = true
      this.loading = true
      if (query) {
        query.paramFolderUuid = this.selectTreeNode.id
        this.pageQuery.condition = query
      }
      else{
        query = {}
        query.paramFolderUuid = this.selectTreeNode.id
        this.pageQuery.condition = query
      }
      listByAmmParam(this.pageQuery).then(resp => {
        this.loading = false
        this.total = resp.data.total
        this.tableData = resp.data.records
        // 默认选中点击文件夹下第一个表
        let _this = this
        setTimeout(function(){
          _this.$refs.paramTableList.selection.push(_this.tableData[0])
          _this.paramTableSelectEvent();
        },200)
        this.listLoading = false
      })
    },
    // 加载数据字典到本地数组
    getDictObjectValue(classname, url, value, param) {
      let that = this
      var dataObj = {};
      if (!this.setJsonSelectValueData["Dict" + url + param]) {
        $.ajax({
          url: this.analysisUrl + url,
          cache: true,
          data: param,
          async: false,
          dataType: "json",
          success: function (redata, textStatus, jqXHR) {
            redata = JSON.parse(redata.data)
            that.setJsonSelectValueData[url + param] = redata;
            for (var i = 0; i < redata.length; i++) {
              dataObj[redata[i].codeValue] = redata[i].codeName;
            }
            that.setJsonSelectValueData["Dict" + url + param] = dataObj;
          },
          error: function (data, textStatus, jqXHR) {
            that.$message({ type: 'info', message: "加载数据字典" + textStatus + ",classname:" + classname
                + ",url:" + url })
          }
        });
      }
      dataObj = this.setJsonSelectValueData["Dict" + url + param];
      if (value !== "" && value != undefined) {
        return dataObj[value];
      } else {
        return "";
      }
    },
    /**
     *添加参数窗体
     */
    addParamForm(){
      if(this.selectTreeNode == null){
        this.$message({ type: 'info', message: "请选择文件夹"})
        return
      }
      if(this.selectTreeNode.pid == 0){
        this.$message({ type: 'info', message: "不允许创建在根目录下"})
        return
      }
      this.operationObj.operationType = 1
      this.operationObj.paramUuid = ''
      this.dialogStatus = 'create'
      this.addParamDialog = true
    },
    /**
     *保存参数对象
     */
    saveParam(){
      this.$refs.addParam.okBtn()
    },
    /**
     * 刷新参数列表
     */
    refshParamList(){
      this.getParamList(this.pageQuery.condition)
      this.addParamDialog = false
    },
    deleteParam(){
      let that = this
      var selectObj = this.$refs.paramTableList.selection
      if (selectObj.length == 0) {
        this.$message({ type: 'info', message: '最少选择一个参数!' })
        return
      }
      this.$confirm('删除该参数可能会影响到使用该参数的模型 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = []
        let names = []
        for(var i=0; i < selectObj.length;i++){
          ids.push(selectObj[i].ammParamUuid)
          names.push(selectObj[i].paramName)
        }
        var url = this.analysisUrl + "/paramController/deleteParam";
        $.ajax({
          url: url,
          method:"POST",
          cache:false,
          dataType:"json",
          data:{ammParamUuids:ids,ammParamNames:names},
          traditional:true, //默认false
          async: false,
          success: function(data, textStatus, jqXHR){
            if(data.code == 0){
              that.getParamList(that.pageQuery.condition)
              that.$notify({
                title: "成功",
                message: "删除成功！",
                type: "success",
                duration: 2000,
                position: "bottom-right",
              });
            }
            else{
              that.$message({ type: 'error', message: "删除参数出错,参数错误"})
            }
          },
          error:function (){
            that.$message({ type: 'error', message: "删除参数出错,请联系管理员"})
          }
        });
      })
    },
    /**
     * 修改参数
     */
    updateParamForm(){
      var selectObj = this.$refs.paramTableList.selection
      if (selectObj.length == 0) {
        this.$message({ type: 'info', message: '最少选择一个参数!' })
        return
      }
      this.operationObj.operationType = 2
      this.operationObj.paramUuid = selectObj[0].ammParamUuid
      this.dialogStatus = 'update'
      this.addParamDialog = true
    },
    enableParam(){
      let that = this
      var selectObj = this.$refs.paramTableList.selection
      this.$confirm('确定启用选中参数?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = []
        let names = []
        for(var i=0; i < selectObj.length;i++){
          ids.push(selectObj[i].ammParamUuid)
          names.push(selectObj[i].paramName)
        }
        var url = this.analysisUrl + "/paramController/enableParam";
        $.ajax({
          url: url,
          method:"POST",
          cache:false,
          dataType:"json",
          data:{ammParamUuids:ids,ammParamNames:names},
          traditional:true, //默认false
          async: false,
          success: function(data, textStatus, jqXHR){
            if(data.code == 0){
              that.getParamList(that.pageQuery.condition)
            }
            else{
              that.$message({ type: 'error', message: "启用参数出错"})
            }
          },
          error:function (){
            that.$message({ type: 'error', message: "启用参数出错,请联系管理员"})
          }
        });
      })
    },
    stopParam(){
      let that = this
      var selectObj = this.$refs.paramTableList.selection
      this.$confirm('确定停用选中参数?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = []
        let names = []
        for(var i=0; i < selectObj.length;i++){
          ids.push(selectObj[i].ammParamUuid)
          names.push(selectObj[i].paramName)
        }
        var url = this.analysisUrl + "/paramController/stopParam";
        $.ajax({
          url: url,
          method:"POST",
          cache:false,
          dataType:"json",
          data:{ammParamUuids:ids,ammParamNames:names},
          traditional:true, //默认false
          async: false,
          success: function(data, textStatus, jqXHR){
            if(data.code == 0){
              that.getParamList(that.pageQuery.condition)
            }
            else{
              that.$message({ type: 'error', message: "启用参数出错"})
            }
          },
          error:function (){
            that.$message({ type: 'error', message: "启用参数出错,请联系管理员"})
          }
        });
      })
    }
  }
}
</script>
