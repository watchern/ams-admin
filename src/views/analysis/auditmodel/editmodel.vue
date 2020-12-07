<template>
  <div class="app-container" v-loading="editorModelLoading">
    <el-container class="el-container">
      <div id="drag" ref="dragDiv" class="drag">
        <div class="title">
          <h2>···</h2>
          <div style="display:none">
            <a class="min" href="javascript:" title="最小化"></a>
            <a class="max" href="javascript:" title="最大化"></a>
            <a class="revert" href="javascript:" title="还原"></a>
            <a class="close" href="javascript:" title="关闭"></a>
          </div>
        </div>
        <div class="resizeL"></div>
        <div class="resizeT"></div>
        <div class="resizeR"></div>
        <div class="resizeB"></div>
        <div class="resizeLT"></div>
        <div class="resizeTR"></div>
        <div class="resizeBR"></div>
        <div class="resizeLB"></div>
        <div class="content">
          <el-aside style="width:100%">
            <el-tree class="el-tree-rewrite" ref="tree" :data="treeNodeData" :props="defaultProps" :expand-on-click-node="false" default-expand-all @node-click="handleNodeClick">
              <span slot-scope="{ node, data }" class="custom-tree-node">
                <span>
                  {{ node.label }}
                </span>
                <span v-if="data.type=='relInfo'">
                  <el-button type="text" title="添加关联详细" size="mini" @click.stop="() => createDetail(node,data)"><i class="el-icon-circle-plus-outline"/></el-button>
                </span>
                <span v-if="data.type=='filterShow'">
                  <el-button type="text" title="添加条件显示" size="mini" @click.stop="() => createFilterShow(node,data)"><i class="el-icon-circle-plus-outline"/></el-button>
                </span>
                <span v-if="data.type=='relDetail' || data.type=='filterShowNode'">
                  <el-button type="text" size="mini" @click="() => deleteFolder(node, data)"><i class="el-icon-delete"/></el-button>
                </span>
              </span>

            </el-tree>
              <div class="custom-tree-caidan ">
                <img class="custom-save" :src="imgCus2" @click="save"/>
                <img class="custom-close" :src="imgCus1" @click="closeWinfrom" />
              </div>
              <div class="custom-tree-shangla">
                <img class="custom-shouqi"  :src="imgCus3" @click="customup"/>
                <img class="custom-xiala" :src="imgCus3" @click="customdown" />
              </div>
          </el-aside>
        </div>
      </div>
      <div ref="basicInfo" class="detail-form">
        <el-form ref="basicInfoForm" :model="form" :rules="basicInfoRules" :disabled="isBanEdit">
          <el-row>
            <el-col :span="15">
              <el-form-item label="模型名称" prop="modelName">
                <el-input v-model="form.modelName" />
              </el-form-item>
            </el-col>
          </el-row>
            <el-row>
              <el-form-item label="业务分类">
                <el-col :span="15">
                  <el-input v-model="form.modelFolderUuid" class="display" :disabled="true" />
                  <el-input v-model="form.modelFolderName" :disabled="true" />
                </el-col>
                <el-col :span="2"><el-button ref="businessFolderBtnRef" @click="modelFolderTreeDialog = true">选择</el-button></el-col>
                <el-col :span="2"></el-col>
              </el-form-item>
            </el-row>
          <el-row>
            <el-form-item label="审计事项" prop="auditItemUuid">
              <el-col :span="15">
                <el-input v-model="form.auditItemUuid" class="display" :disabled="true" />
                <el-input v-model="form.auditItemName" :disabled="true" />
              </el-col>
              <el-button @click="showAuditItemTree">选择</el-button>
            </el-form-item>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="风险等级" prop="riskLevelUuid">
                  <el-select v-model="form.riskLevelUuid" placeholder="请选择风险等级">
                    <el-option
                      v-for="state in riskLeve"
                      :key="state.codeValue"
                      :value="state.codeValue"
                      :label="state.codeName"
                    />
                  </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="模型类型" prop="modelType">
                <el-select v-model="form.modelType" placeholder="请选择模型类型" @change="modelTypeChangeEvent">
                  <el-option
                    v-for="state in modelTypeData"
                    :key="state.codeValue"
                    :value="state.codeValue"
                    :label="state.codeName"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="15">
              <el-form-item label="审计思路">
                <el-input v-model="form.auditIdeas" type="textarea" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="15">
              <el-form-item label="参数条件">
                <el-input v-model="form.paramConditions" type="textarea" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div ref="modelDesign" class="display div-width">
        <el-form ref="modelDesignForm" :model="form" :rules="modelDesignRules" :disabled="isBanEdit">
          <div v-for="state in modelTypeObj" :key="state.id" :value="state.id" :label="state.id">
            <SQLEditor @getSqlObj="getSqlObj" v-if="state.id=='002003001'" ref="SQLEditor"
                       :sql-editor-param-obj="sqlEditorParamObj" :sql-value="form.sqlValue" :callType="editorModel" class="sql-editor" />
            <graph v-if="state.id=='002003002'"></graph>
          </div>
          <el-form-item label="模型sql" prop="sqlValue" class="display">
            <el-input v-model="form.sqlValue" type="textarea"/>
          </el-form-item>
        </el-form>
      </div>
      <div ref="paramDefaultValue" class="display default-value">
        <p class="p-div">拖拽改变参数展示顺序</p>
        <div id="paramList">
          <paramShow ref="apple"></paramShow>
        </div>
      </div>
      <div ref="modelResultOutputCol" class="display default-value">
        <p class="p-div">注意：只显示最后的结果列</p>
        <div class="model-result-output-col">
          <el-table ref="columnData" :data="columnData" class="div-width" >
            <el-table-column prop="outputColumnName" label="输出列名" width="180" />
            <el-table-column prop="dataCoding" label="数据转码" width="180">
              <template slot-scope="scope">
                <SelectTransCode ref="SelectTransCode" :transuuid.sync="scope.row.dataCoding" />
              </template>
            </el-table-column>
            <el-table-column prop="columnName" label="是否显示" width="80">
              <template slot-scope="scope">
                <el-select v-model="scope.row.isShow" placeholder="是否显示" value="1" :disabled="isBanEdit">
                  <el-option label="是" :value="1" />
                  <el-option label="否" :value="0" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="columnName" label="对应业务字段" width="180">
              <template slot-scope="scope">
                <el-select v-model="scope.row.businessFieldUuid" value="-1" :disabled="isBanEdit">
                  <el-option
                    v-for="state in businessColumnSelect"
                    :key="state.attrCode"
                    :value="state.attrCode"
                    :label="state.attrName"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="columnName" label="别名" width="180">
              <template slot-scope="scope">
                <el-input v-model="scope.row.columnAlias" placeholder="请输入别名" :disabled="isBanEdit" />
              </template>
            </el-table-column>
            <!--          <el-table-column prop="columnType" label="字段类型标记" width="180">
              <template slot-scope="scope" v-model="scope.row.columnType">
                {{scope.row.columnType}}
          &lt;!&ndash;      <el-input v-model="scope.row.columnType" :value="scope.row.outputColumnType"/>
                <el-select v-model="scope.row.columnType" :value="scope.row.outputColumnType">
                  <el-option
                    v-for="state in columnTypeSelect"
                    :key="state.uuid"
                    :value="state.uuid"
                    :label="state.name"
                  />
                </el-select>&ndash;&gt;
              </template>
            </el-table-column>-->
          </el-table>
        </div>
      </div>
      <div ref="relInfo" class="display default-value">
        <p class="words">在进行审计分析时，模型执行所生成的结果数据在业务逻辑上可能存着关联关系；而在模型的设计过程中，同样可能需要利用到其他模型的执行结果。因此，为了满足这种模型之间的互相利用、相互辅助的功能需求，系统允许用户对多个模型或sql进行关联。
          用户通过本功能来创建并维护模型间的关联关系，以满足多模型联合执行分析的业务需求。
          通过模型设计器，用户能够为当前的模型建立与其他可访问模型的关联关系，并将其分析结果引入到当前模型设计中。</p>
        <!--<el-button @click="createDetail">新建</el-button>-->
      </div>
      <div id="modelDetailDiv">
        <div v-for="(modelDetail,index) in modelDetails" :key="modelDetail.id" :ref="modelDetail.id" class="display default-value">
          <ModelDetail ref="child" :operationtype="operationObj.operationType" :columns="columnData" :data="modelDetail.data" :tree-id="modelDetail.id" @updateTreeNode="updateTreeNode" />
        </div>
      </div>
      <div ref="chartConfig" class="display default-value">
        这是图表配置
      </div>
      <div ref="modelFilterShowParent" class="display default-value">
        <p class="words">条件显示能够根据用户所设定的条件及显示样式，对模型执行结果中满足条件的敏感数据或重要数据进行着色显示，使这些数据变的一目了然，
          以便审计人员对这些数据进行审计。</p>
        <p class="words">条件显示设计器以表格的形式列举所有由用户设定的、将被应用于模型执行结果的显示条件及显示样式，用户可通过该列表对各个条件的属性进行快速查看。
          同时用户也可以对显示条件进行添加、修改、删除</p>
        <!--<el-button @click="createFilterShow">新建</el-button>-->
      </div>
      <div ref="filterShowDiv">
        <div v-for="(filterShow,index) in filterShows" :key="filterShow.id" :ref="filterShow.id" class="display default-value">
          <ModelFilterShow ref="modelFilterSHowChild" :operationtype="operationObj.operationType" :columns="columnData" :data="filterShow.data" :tree-id="filterShow.id" @updateTreeNode="updateTreeNode" />
        </div>
      </div>
    </el-container>
    <el-dialog v-if="auditItemTree" :destroy-on-close="true" :append-to-body="true" :visible.sync="auditItemTree" title="请选择审计事项" width="80%">
      <AuditItemTree ref="auditItemTreeRef"></AuditItemTree>
      <div slot="footer">
        <el-button type="primary" @click="getAuditItem">确定</el-button>
        <el-button @click="auditItemTree=false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog v-if="modelFolderTreeDialog" :visible.sync="modelFolderTreeDialog" title="选择业务分类" width="50%">
      <ModelFolderTree ref="modelFolderTree" public-model="editorModel" />
      <div slot="footer">
        <el-button type="primary" @click="setBusinessFolder">确定</el-button>
        <el-button @click="modelFolderTreeDialog=false">取消</el-button>
      </div>
    </el-dialog>
    <!-- <div ref="btnDivRef" class="div-btn" v-show="isShowBtn">
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="closeWinfrom">取消</el-button>
    </div> -->
  </div>
</template>
<script>
import ModelDetail from '@/views/analysis/auditmodel/modeldetail'
import ModelFilterShow from '@/views/analysis/auditmodel/modelfiltershow'
import SQLEditor from '@/views/analysis/sqleditor/index'
import AuditItemTree from '@/views/analysis/auditmodel/auditItemtree'
import { getBusinessAttribute, saveModel, updateModel } from '@/api/analysis/auditmodel'
import VRuntimeTemplate from 'v-runtime-template'
import paramShow from "@/views/analysis/modelparam/paramshow";
import { getDictList } from '@/utils/index'
import ModelFolderTree from '@/views/analysis/auditmodel/modelfoldertree'
import SelectTransCode from '@/views/data/table/transcodeselect'
import modelshoppingcart from '@/views/analysis/auditmodel/modelshoppingcart'
import graph from '@/views/graphtool/tooldic/index'
// import func from 'vue-temp/vue-editor-bridge'
export default {
  name: 'EditModel',
  components: {modelshoppingcart, ModelDetail, ModelFilterShow, VRuntimeTemplate, SQLEditor,AuditItemTree,paramShow,ModelFolderTree,SelectTransCode,graph },
  props: ['openValue'],
  data() {
    return {
      treeNodeData: [
        {
          id: '1',
          label: '基本信息',
          type: 'basicInfo'
        },
        {
          id: '2',
          label: '模型设计',
          type: 'modelDesign'
        },
        {
          id: '3',
          label: '模型参数',
          type: 'paramDefaultValue'
        },
        {
          id: '4',
          label: '模型结果',
          type: 'modelResultOutputCol'
        },
        {
          id: '5',
          label: '模型详细',
          type: 'relInfo',
          children: []
        },
        {
          id: '6',
          label: '模型图表',
          type: 'chartConfig'
        },
        {
          id: '7',
          label: '模型条件',
          type: 'filterShow',
          children: []
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      //是否显示审计事项树
      auditItemTree:false,
      //是否显示保存取消按钮
      isShowBtn:true,
      //打开sql编辑器时给sql编辑器传值，告诉sql编辑器是从模型编辑界面进来的
      editorModel:"editorModel",
      //是否禁止编辑
      isBanEdit:false,
      //是否显示模型分类树
      modelFolderTreeDialog:false,
      //列数据
      columnData: [],
      //实体对象
      form: {
        modelName: '',
        modelFolderUuid: '',
        modelFolderName: '',
        auditItemUuid: '',
        riskLevelUuid: '',
        auditIdeas: '',
        paramConditions: '',
        sqlValue: '',
        auditItemName:'',
        modelType:''
      },
      //参数模型关联对象
      parammModelRel: {},
      //sql对象
      sqlObj: {
        sqlValue: '',
        params: [],
        column: []
      },
      //选择的业务列
      businessColumnSelect: [],
      //列类型数组
      columnTypeSelect: [],
      //模型详细对象数组
      modelDetails: [],
      dragMinWidth: 250,
      dragMinHeight: 180,
      //条件显示数组
      filterShows: [],
      //校验规则失败自动跳转用的对象
      newRelInfoValue: {},
      newFilterShowValue: {},
      //sql编辑器参数对象
      sqlEditorParamObj: {},
      //添加模型详细树时候的索引
      modelDetailIndex: 0,
      editorModelLoading:false,
      //风险等级
      riskLeve: [],
      //模型类型
      modelTypeData:[],
      //添加条件显示时候树的索引
      modelFilterShowIndex: 0,
      //模型历史表数组
      modelOriginalTable: [],
      //模型图表配置
      modelChartSetup: {},
      //当前选中树节点
      currentSelectTreeNode: null,
      //模型类型数组
      modelTypeObj:[],
      //关闭窗体时候用的窗体名
      formName:"",
      //操作对象
      operationObj:{},
      basicInfoRules: {
        modelName: [
          { type: 'string', required: true, message: '请输入模型名称', trigger: 'blur' }
        ],
        auditItemUuid: [
          { required: true, message: '请选择审计事项', trigger: 'change' }
        ],
        riskLevelUuid: [
          { type: 'string', required: true, message: '请选择风险等级', trigger: 'change' }
        ],
        modelType: [{ type: 'string', required: true, message: '请选择模型类型', trigger: 'change' }
        ]
      },
      modelDesignRules: {
        sqlValue: [{ type: 'string', required: true, message: '请选择输入模型SQL', trigger: 'blur' }]
      },
      imgCus1:require("@/views/analysis/auditmodel/imgs/close.png"),
      imgCus2:require("@/views/analysis/auditmodel/imgs/save.png"),
      imgCus3:require("@/views/analysis/auditmodel/imgs/opentop.png")
    }
  },
  watch: {
    newRelInfoValue(newChild) {
      this.$nextTick(function() {
        this.handleNodeClick(newChild)
      })
    },
    newFilterShowValue(newChild) {
      this.$nextTick(function() {
        this.handleNodeClick(newChild)
      })
    }
  },
  created() {
    this.operationObj = JSON.parse(sessionStorage.getItem('operationObj'));
  },
  mounted() {
    this.initEvent()
    this.initData(this.operationObj)
    // 如果为2则反显要修改的数据
    if (this.operationObj.operationType == 2) {
      this.isUpdate = true
      var model = this.operationObj.model
      this.displayData(model)
      this.formName = "修改模型"
    }

    // 如果为2则反显要显示的数据
    if (this.operationObj.operationType == 3) {
      this.isUpdate = true
      var model = this.operationObj.model
      this.displayData(model)
      this.formName = this.operationObj.formName
      //隐藏按钮
      this.isShowBtn = false
      //禁用所有界面可编辑元素
      this.isBanEdit = true
    }
    else{
      this.formName = "新增模型"
    }
  },
  methods: {
    /**
     *初始化数据
     */
    initData(operationObj) {
      // 初始化模型分类数据
      if(operationObj.folderId != ""){
        this.form.modelFolderUuid = operationObj.folderId
        this.form.modelFolderName = operationObj.folderName
      }
      // 初始化业务字段列表
      getBusinessAttribute().then(result=>{
        if(result.data != null){
          this.businessColumnSelect = result.data
        }
      })
      // 初始化字段类型
      const columnTypeSelect = [{ uuid: 'int', name: '数值' }, { uuid: 'varchar', name: '字符串' }, { uuid: 'date', name: '日期' }, { uuid: 'money', name: '金额' }]
      this.columnTypeSelect = columnTypeSelect
      // 初始化风险等级
      this.riskLeve = getDictList('002002')
      // 初始化审计事项
      this.modelTypeData = getDictList('002003')
    },

    /**
     * 点击之后切换页签
     * @param data 点击的数据
     * @param node 树节点
     */
    handleNodeClick(data, node) {
      this.hideModelDetail()
      if (data.type == 'basicInfo') {
        this.$refs.modelDesign.style.display = 'none'
        this.$refs.paramDefaultValue.style.display = 'none'
        this.$refs.modelResultOutputCol.style.display = 'none'
        this.$refs.relInfo.style.display = 'none'
        this.$refs.chartConfig.style.display = 'none'
        this.$refs.modelFilterShowParent.style.display = 'none'
        this.$refs.basicInfo.style.display = 'block'
      } else if (data.type == 'modelDesign') {
        this.$refs.basicInfo.style.display = 'none'
        this.$refs.paramDefaultValue.style.display = 'none'
        this.$refs.modelResultOutputCol.style.display = 'none'
        this.$refs.chartConfig.style.display = 'none'
        this.$refs.modelFilterShowParent.style.display = 'none'
        this.$refs.relInfo.style.display = 'none'
        this.$refs.modelDesign.style.display = 'block'
      } else if (data.type == 'paramDefaultValue') {
        this.$refs.basicInfo.style.display = 'none'
        this.$refs.modelDesign.style.display = 'none'
        this.$refs.modelResultOutputCol.style.display = 'none'
        this.$refs.chartConfig.style.display = 'none'
        this.$refs.modelFilterShowParent.style.display = 'none'
        this.$refs.relInfo.style.display = 'none'
        this.$refs.paramDefaultValue.style.display = 'block'
      } else if (data.type == 'modelResultOutputCol') {
        this.$refs.basicInfo.style.display = 'none'
        this.$refs.modelDesign.style.display = 'none'
        this.$refs.paramDefaultValue.style.display = 'none'
        this.$refs.chartConfig.style.display = 'none'
        this.$refs.modelFilterShowParent.style.display = 'none'
        this.$refs.relInfo.style.display = 'none'
        this.$refs.modelResultOutputCol.style.display = 'block'
      } else if (data.type == 'relInfo') {
        this.$refs.basicInfo.style.display = 'none'
        this.$refs.modelDesign.style.display = 'none'
        this.$refs.paramDefaultValue.style.display = 'none'
        this.$refs.modelResultOutputCol.style.display = 'none'
        this.$refs.chartConfig.style.display = 'none'
        this.$refs.modelFilterShowParent.style.display = 'none'
        this.$refs.relInfo.style.display = 'block'
      } else if (data.type == 'chartConfig') {
        this.$refs.basicInfo.style.display = 'none'
        this.$refs.modelDesign.style.display = 'none'
        this.$refs.paramDefaultValue.style.display = 'none'
        this.$refs.modelResultOutputCol.style.display = 'none'
        this.$refs.modelFilterShowParent.style.display = 'none'
        this.$refs.relInfo.style.display = 'none'
        this.$refs.chartConfig.style.display = 'block'
      } else if (data.type == 'filterShow') {
        this.$refs.basicInfo.style.display = 'none'
        this.$refs.modelDesign.style.display = 'none'
        this.$refs.paramDefaultValue.style.display = 'none'
        this.$refs.modelResultOutputCol.style.display = 'none'
        this.$refs.relInfo.style.display = 'none'
        this.$refs.chartConfig.style.display = 'none'
        this.$refs.modelFilterShowParent.style.display = 'block'
      } else if (data.type == 'relDetail' || data.type == 'filterShowNode') {
        // 获取指定div
        this.$refs.basicInfo.style.display = 'none'
        this.$refs.modelDesign.style.display = 'none'
        this.$refs.paramDefaultValue.style.display = 'none'
        this.$refs.modelResultOutputCol.style.display = 'none'
        this.$refs.relInfo.style.display = 'none'
        this.$refs.chartConfig.style.display = 'none'
        this.$refs.modelFilterShowParent.style.display = 'none'
        if (this.$refs.[data.id][0] != undefined) {
          this.$refs.[data.id][0].style.display = 'block'
        }
      }
      this.currentSelectTreeNode = data
    },
    /**
     *隐藏模型详细
     */
    hideModelDetail() {
      for (let i = 0; i < this.modelDetails.length; i++) {
        const id = this.modelDetails[i].id
        this.$refs.[id][0].style.display = 'none'
      }
      for (let i = 0; i < this.filterShows.length; i++) {
        const id = this.filterShows[i].id
        this.$refs.[id][0].style.display = 'none'
      }
    },
    /**
     * 获取当前界面的模型对象
     */
    getModelObj() {
      // region 校验基本信息
      let basicInfoVerResult = false
      this.$refs['basicInfoForm'].validate((valid) => {
        if (valid) {
          basicInfoVerResult = valid
        }
      })
      if (!basicInfoVerResult) {
        // 自动选中指定树节点
        this.handleNodeClick({
          id: '1',
          label: '基本信息',
          type: 'basicInfo'
        }, null)
        return null
      }
      // endregion
      // region 校验sql语句
      let modelDesignVerResult = false
      this.$refs['modelDesignForm'].validate((valid) => {
        if (valid) {
          modelDesignVerResult = valid
        }
      })
      if (!modelDesignVerResult) {
        // 自动选中指定树节点
        this.handleNodeClick({
          id: '2',
          label: '模型设计',
          type: 'modelDesign'
        }, null)
        return null
      }
      // endregion
      // region 处理模型结果固定输出列数据
      const columnData = this.$refs.columnData.data
      let columnOrder = 0
      for (let i = 0; i < columnData.length; i++) {
        if (columnData[i].isShow == undefined) {
          columnData[i].isShow = 1
          columnData[i].columnOrder = ++columnOrder
        }
      }
      this.form.modelOutputColumn = columnData
      // endregion
      // region 处理参数数据
      // 获取到参数的默认值，是个JSON，将JSON存入到数据库  以便下次反显时使用
      if(this.sqlEditorParamObj.arr.length != 0){
        let paramDefaultValue = this.$refs.apple.getParamSettingArr(this.sqlEditorParamObj.arr);
        if(!paramDefaultValue.verify){
          this.$message({ type: 'info', message: paramDefaultValue.message})
          return null
        }
        //拿到默认值后组织成后台数据库的格式
        const paramData = paramDefaultValue.paramSettingArr
        let newParamData = []
        for (let i = 0; i < paramData.length; i++) {
          var obj = {
            ammParamUuid:paramData[i].copyParamId,
            resourceType:1,
            paramValue:JSON.stringify(paramData[i]),
            paramSort:paramData[i].sort,
            moduleParamId:paramData[i].moduleParamId
          }
          newParamData.push(obj)
        }
        this.form.parammModelRel = newParamData
      }
      // endregion
      // region 获取模型详细
      let verModelDetail = true
      const modelDetailRelation = []
      for (const i in this.modelDetails) {
        const modelDetailObj = this.$refs.child[i].getObj()
        if (modelDetailObj.verResult == undefined) {
          modelDetailRelation.push(modelDetailObj)
        } else {
          verModelDetail = false
          const treeNode = { id: modelDetailObj.treeId, type: 'relDetail' }
          this.handleNodeClick(treeNode, null)
          break
        }
      }
      if (!verModelDetail) {
        return
      }
      this.form.modelDetailRelation = modelDetailRelation// 模型关联详细
      // endregion
      // region 处理图表
      this.form.modelChartSetup = this.modelChartSetup
      // endregion
      // region 模型SQL所用到的表
      this.form.modelOriginalTable = this.modelOriginalTable
      // endregion
      // region 处理模型条件显示
      let resultFilterResult = true
      const resultFilterShow = []
      for (const i in this.filterShows) {
        const filterShowObj = this.$refs.modelFilterSHowChild[i].getForm()
        if (filterShowObj.verResult == undefined) {
          resultFilterShow.push(filterShowObj)
        } else {
          const treeNode = { id: filterShowObj.treeId, type: 'filterShowNode' }
          this.handleNodeClick(treeNode, null)
          resultFilterResult = false
        }
      }
      if (!resultFilterResult) {
        return null
      }
      this.form.resultFilterShow = resultFilterShow
      // endregion
      return this.form
    },
    /**
     * 获取SQL编辑器或图形化编辑器编辑的sql等信息并展示到界面
     */
    getSqlObj() {
      //const returnObj = this.$refs.SQLEditor.getSaveInfo()
      const returnObj = this.$refs.SQLEditor[0].getSaveInfo()
      if (returnObj == undefined) {
        return
      }
      // 转换参数格式 重置参数对象属性，因为SQL编辑器是移植的，因此兼容那边的数据格式，因此对数据格式进行转换
      const params = this.changeParamDataFormat(returnObj.params, 1)
      // 转换列格式 处理sql编辑器返回的列数据信息，拼接成该界面能识别的格式
      const column = this.changeColumnDataFormat(returnObj.columnNames, returnObj.columnTypes)
      // 处理历史表
      const modelOriginalTable = this.changeOriginalTable(returnObj.modelOriginalTable)
      const sqlObj = {
        sqlValue: returnObj.sqlValue,
        params: params,
        column: column,
        modelChartSetup: returnObj.modelChartSetup,
        modelOriginalTable: modelOriginalTable
      }
      this.form.sqlValue = sqlObj.sqlValue
      // 初始化默认参数
      // 初始化参数默认值界面界面
      if(returnObj.params.length != 0){
        this.$refs.apple.createParamTableHtml(true, returnObj.params, true);
      }
      this.sqlEditorParamObj = {arr:returnObj.params}//给sql编辑器的参数对象赋值，编辑使用
      // region 初始化固定列
      const columnData = []
      for (let i = 0; i < sqlObj.column.length; i++) {
        const columnDataObj = {
          outputColumnName: sqlObj.column[i].columnName,
          columnType: sqlObj.column[i].columnType
        }
        columnData.push(columnDataObj)
      }
      // endregion
      // 列数据
      this.columnData = columnData
      // 模型SQL用到的数据表
      this.modelOriginalTable = sqlObj.modelOriginalTable
      // 处理图表JSON
      this.modelChartSetup = sqlObj.modelChartSetup
    },
    /**
     *相互转换param数据格式
     */
    changeParamDataFormat(paramObj, type) {
      if (paramObj == undefined || paramObj == null) {
        return
      }
      if (type == 1) {
        // SQL编辑器参数对象转编辑界面参数对象
        const params = []
        for (let i = 0; i < paramObj.length; i++) {
          const obj = {
            ammParamUuid: paramObj[i].moduleParamId,
            paramName: paramObj[i].name,
            copyParamId: paramObj[i].copyParamId,
            description: '',
            paramValue: ''
          }
          params.push(obj)
        }
        return params
      } else if (type == 2) {
        // 参数界面编辑对象转SQL编辑器参数对象
        var returnObj = { 'arr': [] }
        for (let b = 0; b < paramObj.length; b++) {
          const id = '{#' + paramObj[b].ammParamUuid + '#}'
          const name = paramObj[b].paramName
          const moduleParamId = paramObj[b].linkParamUuid
          const allowedNull = typeof paramObj[b].ammParamChoice.allowedNull !== 'undefined' ? paramObj[b].ammParamChoice.allowedNull : 1
          var obj = {
            id: id,
            name: name,
            moduleParamId: moduleParamId,
            copyParamId: id,
            allowedNull: allowedNull
          }
          returnObj.arr.push(obj)
        }
        return returnObj
      }
    },
    /**
     *转换列对象
     * @param columnNames 列名称
     * @param columnType 列类型
     */
    changeColumnDataFormat(columnNames, columnType) {
      // [{ columnName: 'AUDIT_ITEM_UUID', columnType: 'varchar' }, { columnName: 'AUDIT_ITEM_NAME', columnType: 'varchar' }]
      const returnObj = []
      for (let i = 0; i < columnNames.length; i++) {
        var obj = {
          columnName: columnNames[i],
          columnType: columnType[i]
        }
        returnObj.push(obj)
      }
      return returnObj
    },
    closeWinfrom(){
      this.$store.commit('aceState/setRightFooterTags',{
        type:'close',
        val:{
          name:this.formName,
          path:'/analysis/editorModel'
        }
      })
    },
    /**
     * 转换列对象
     * @param originalTableObj 历史表对象
     */
    changeOriginalTable(originalTableObj) {
      const resultObj = []
      for (let i = 0; i < originalTableObj.length; i++) {
        const obj = {
          originalTableName: originalTableObj[i].tableName,
          executionType: originalTableObj[i].tableType
        }
        resultObj.push(obj)
      }
      return resultObj
    },
    /**
     * 反显sql语句
     * @param returnObj sql编辑器拿到的对象
     */
    displaySQL(returnObj) {
      let sql = returnObj.sqlValue
      const arrPram = returnObj.params
      let sqlStr = returnObj.sqlValue
      //初始化sql编辑器
      this.modelTypeObj = []
      if(this.form.modelType == "002003001"){
        let obj = {
          id:'002003001'
        }
        this.modelTypeObj.push(obj)
      }
      else if(this.form.modelType == "002003002"){
        let obj = {
          id:'002003002'
        }
        this.modelTypeObj.push(obj)
      }
      $('#sqlValueView').html(sql)
    },
    /**
     * 创建模型详细
     */
    createDetail(treeNode,data) {
      if (this.columnData.length == 0) {
        this.$message({ type: 'info', message: '请先编写SQL!' })
        return
      }
      $("#drag").css("width",115)
      ++this.modelDetailIndex
      const newChild = {
        id: 'rel' + this.modelDetailIndex,
        label: '关联' + this.modelDetailIndex,
        children: [],
        pid: 5,
        type: 'relDetail'
      }
      if(data == undefined){
        data = this.$refs.tree.getCurrentNode()
      }
      data.children.push(newChild)
      this.modelDetails.push({ id: 'rel' + this.modelDetailIndex, data: [] })
      this.newRelInfoValue = newChild
      //添加完成之后更改div高度
      this.$refs.dragDiv.style.height = this.$refs.dragDiv.style.height + 20
    },
    /**
     * 创建过滤条件显示
     */
    createFilterShow(treeNode,data) {
      if (this.columnData.length == 0) {
        this.$message({ type: 'info', message: '请先编写SQL!' })
        return
      }
      $("#drag").css("width",115)
      ++this.modelFilterShowIndex
      const newChild = {
        id: 'filterShow' + this.modelFilterShowIndex,
        label: '条件显示' + this.modelFilterShowIndex,
        children: [],
        type: 'filterShowNode'
      }
      if(data == undefined){
        data = this.$refs.tree.getCurrentNode()
      }
      data.children.push(newChild)
      this.filterShows.push({ id: 'filterShow' + this.modelFilterShowIndex, data: [] })
      this.newFilterShowValue = newChild
      this.$refs.dragDiv.style.height = this.$refs.dragDiv.style.height + 20
    },
    /**
     * 清空界面数据
     */
    clear() {
      this.form = {
        modelName: '',
        modelFolderUuid: '',
        modelFolderName: '',
        auditItemUuid: '',
        riskLevelUuid: '',
        auditIdeas: '',
        paramConditions: '',
        sqlValue: ''
      }
      this.parammModelRel = {}
      this.sqlObj = {
        sqlValue: '',
        params: [],
        column: []
      }
      this.businessColumnSelect = []
      //列类型列表
      this.columnTypeSelect = []
      //选择树节点
      this.selectTreeNode = null
      //模型详细数组
      this.modelDetails = []
      //模型详细索引
      this.modelDetailIndex = 0
      //条件显示数组
      this.filterShows = []
      //树数据
      this.treeNodeData = [
        {
          id: '1',
          label: '基本信息',
          type: 'basicInfo'
        },
        {
          id: '2',
          label: '模型设计',
          type: 'modelDesign'
        },
        {
          id: '3',
          label: '参数默认值',
          type: 'paramDefaultValue'
        },
        {
          id: '4',
          label: '模型结果输出列',
          type: 'modelResultOutputCol'
        },
        {
          id: '5',
          label: '关联详细',
          type: 'relInfo',
          children: []
        },
        {
          id: '6',
          label: '图表配置',
          type: 'chartConfig'
        },
        {
          id: '7',
          label: '条件展示',
          type: 'filterShow',
          children: []
        }
      ]
    },
    /**
     * 删除添加的节点
     * @param node 树节点
     * @param data 要删除的节点
     */
    deleteFolder(node, data) {
      const parent = node.parent
      const children = parent.data.children || parent.data
      const index = children.findIndex(d => d.id === data.id)
      children.splice(index, 1)
      if (data.type === 'relDetail') {
        for (let i = 0; i < this.modelDetails.length; i++) {
          const id = this.modelDetails[i].id
          if (id == data.id) {
            this.modelDetails.splice(i, 1)
            break
          }
        }
      } else if (data.type === 'filterShowNode') {
        for (let i = 0; i < this.filterShows.length; i++) {
          const id = this.filterShows[i].id
          if (id === data.id) {
            this.filterShows.splice(i, 1)
            break
          }
        }
      }
    },
    /**
     * 修改树节点名称
     * @param value 要修改的值
     */
    updateTreeNode(value) {
      this.currentSelectTreeNode.label = value
    },
    /**
     * 如果是修改模型的话则反显数据
     * @param model 要反显的数据
     */
    displayData(model) {
      // region 处理模型结果列
      const columnData = []
      for (let i = 0; i < model.modelOutputColumn.length; i++) {
        const columnDataObj = {
          outputColumnName: model.modelOutputColumn[i].columnName,
          outputColumnType: model.modelOutputColumn[i].columnType
        }
        columnData.push(columnDataObj)
      }
      // 列数据
      this.columnData = columnData
      // endregion
      // region 反显基本信息
      this.form = model
      // endregion
      // region 反显SQL显示
      //组织参数默认值等数据，用于sql反显以及参数默认值反显
      let displayParamObj = []
      for(let i = 0;i < model.parammModelRel.length;i++){
        if(model.parammModelRel[i].paramValue === ""){
          continue
        }
        displayParamObj.push(JSON.parse(model.parammModelRel[i].paramValue))
      }
      const paramObj = {}
      paramObj.arr = displayParamObj
      const returnObj = {}
      returnObj.params = paramObj
      this.sqlEditorParamObj = paramObj
      returnObj.sqlValue = this.form.sqlValue
      // endregion
      // region 反显参数默认值
      if(returnObj.params.arr.length != 0){
        this.$refs.apple.createParamTableHtml(true, displayParamObj, true);
      }
      // endregion
      // region 模型结果输出列
      this.columnData = model.modelOutputColumn
      // endregion
      // region 反显关联详细
      var treeNodeDetail = this.treeNodeData[4]
      for (let i = 0; i < model.modelDetailRelation.length; i++) {
        ++this.modelDetailIndex
        const newChild = {
          id: 'rel' + this.modelDetailIndex,
          label: model.modelDetailRelation[i].modelDetailName,
          children: [],
          pid: 5,
          type: 'relDetail'
        }
        // 添加树节点
        treeNodeDetail.children.push(newChild)
        this.modelDetails.push({ id: 'rel' + this.modelDetailIndex, data: model.modelDetailRelation[i] })
      }
      // endregion
      // region 反显图表配置

      // endregion
      // region 反显模型历史表
      this.modelOriginalTable = model.modelOriginalTable
      // endregion
      // region 反显条件展示
      var treeNodeFilterShow = this.treeNodeData[6]
      for (let i = 0; i < model.resultFilterShow.length; i++) {
        ++this.modelFilterShowIndex
        const newChild = {
          id: 'filterShow' + this.modelFilterShowIndex,
          label: model.resultFilterShow[i].filterName,
          children: [],
          type: 'filterShowNode'
        }
        treeNodeFilterShow.children.push(newChild)
        this.filterShows.push({ id: 'filterShow' + this.modelFilterShowIndex, data: model.resultFilterShow[i] })
      }
      // endregion
      this.displaySQL(returnObj)
    },
    /**
     *显示审计事项树
     */
    showAuditItemTree(){
      this.auditItemTree = true
    },
    /**
     * 获取审计事项
     */
    getAuditItem(){
      let tree = this.$refs.auditItemTreeRef.getTree()
      let currentNode = tree.getCheckedNodes()[0]
      this.form.auditItemUuid = currentNode.id
      this.form.auditItemName = currentNode.label
      this.auditItemTree = false
    },
    /**
     *根据选择的数据加载指定sql编辑界面
     * @param vId  002003001审计模型编号  002003002图形化编号
     */
    modelTypeChangeEvent(vId){
      this.modelTypeObj = []
      if(vId == "002003001"){
        let obj = {
          id:'002003001'
        }
        this.modelTypeObj.push(obj)
        //
        // let obj2= {
        //   id: '2',
        //   label: '模型设计',
        //   type: 'modelDesign'
        // }
        // this.handleNodeClick(obj2)
      }
      if(vId == "002003002"){
        let obj = {
          id:'002003002'
        }
        this.modelTypeObj.push(obj)
      }
    },
    /**
     * 设置业务分类
     */
    setBusinessFolder(){
      let selectNode = this.$refs.modelFolderTree.getSelectNode()
      if(selectNode.id == undefined){
        this.$message({ type: 'info', message: "请选择业务分类"})
        return
      }
      if(selectNode.pid == 0 || selectNode.pid == null || selectNode.pid == undefined){
        this.$message({ type: 'info', message: '不允许建立在根目录' })
        return
      }
      else{
        this.form.modelFolderUuid = selectNode.id
        this.form.modelFolderName = selectNode.label
        this.modelFolderTreeDialog = false
      }
    },
    /**
     * 保存模型
     */
    save() {
      var modelObj = this.getModelObj()
      if (modelObj == null) {
        return
      }
      this.editorModelLoading = true
      if (!this.isUpdate) {
        saveModel(modelObj).then(result => {
          this.editorModelLoading = false
          if (result.code === 0) {
            this.$notify({
              title:'提示',
              message:'新增成功',
              type:'success',
              duration:2000,
              position:'bottom-right'
            });
            this.closeWinfrom()
          } else {
            this.$message({ type: 'error', message: '新增模型失败!' })
          }
        })
      } else {
        updateModel(modelObj).then(result => {
          this.editorModelLoading = false
          if (result.code === 0) {
            this.$notify({
              title:'提示',
              message:'修改成功',
              type:'success',
              duration:2000,
              position:'bottom-right'
            });
            this.closeWinfrom()
          } else {
            this.$message({ type: 'error', message: '修改模型失败!' })
          }
        })
      }
    },
    initEvent() {
      var oDrag = document.getElementById('drag')
      var oTitle = this.byClass('title', oDrag)[0]
      var oL = this.byClass('resizeL', oDrag)[0]
      var oT = this.byClass('resizeT', oDrag)[0]
      var oR = this.byClass('resizeR', oDrag)[0]
      var oB = this.byClass('resizeB', oDrag)[0]
      var oLT = this.byClass('resizeLT', oDrag)[0]
      var oTR = this.byClass('resizeTR', oDrag)[0]
      var oBR = this.byClass('resizeBR', oDrag)[0]
      var oLB = this.byClass('resizeLB', oDrag)[0]
      this.drag(oDrag, oTitle)
      //四角
      this.resize(oDrag, oLT, true, true, false, false)
      this.resize(oDrag, oTR, false, true, false, false)
      this.resize(oDrag, oBR, false, false, false, false)
      this.resize(oDrag, oLB, true, false, false, false)
      //四边
      this.resize(oDrag, oL, true, false, false, true)
      this.resize(oDrag, oT, false, true, true, false)
      this.resize(oDrag, oR, false, false, false, true)
      this.resize(oDrag, oB, false, false, true, false)
/*      oDrag.style.left = (document.documentElement.clientWidth - oDrag.offsetWidth) / 2 + 'px'
      oDrag.style.top = (document.documentElement.clientHeight - oDrag.offsetHeight) / 2 + 'px'*/
    },
    drag(oDrag, handle) {
      var disY = 0
      var disX = 0
      var oMin = this.byClass('min', oDrag)[0]
      var oMax = this.byClass('max', oDrag)[0]
      var oRevert = this.byClass('revert', oDrag)[0]
      var oClose = this.byClass('close', oDrag)[0]
      handle = handle || oDrag
      handle.style.cursor = 'move'
      handle.onmousedown = function(event) {
        var event = event || window.event
        disX = event.clientX - oDrag.offsetLeft
        disY = event.clientY - oDrag.offsetTop
        document.onmousemove = function(event) {
          var event = event || window.event
          var iL = event.clientX - disX
          var iT = event.clientY - disY
          var maxL = document.documentElement.clientWidth - oDrag.offsetWidth
          var maxT = document.documentElement.clientHeight - oDrag.offsetHeight
          iL <= 0 && (iL = 0)
          iT <= 0 && (iT = 0)
          iL >= maxL && (iL = maxL)
          iT >= maxT && (iT = maxT)
          oDrag.style.left = iL + 'px'
          oDrag.style.top = iT + 'px'
          return false
        }
        document.onmouseup = function() {
          document.onmousemove = null
          document.onmouseup = null
          this.releaseCapture && this.releaseCapture()
        }
        this.setCapture && this.setCapture()
        return false
      }
      //最大化按钮
      oMax.onclick = function() {
        oDrag.style.top = oDrag.style.left = 0
        oDrag.style.width = document.documentElement.clientWidth - 2 + 'px'
        oDrag.style.height = document.documentElement.clientHeight - 2 + 'px'
        this.style.display = 'none'
        oRevert.style.display = 'block'
      }
      //还原按钮
      oRevert.onclick = function() {
        oDrag.style.width = this.dragMinWidth + 'px'
        oDrag.style.height = this.dragMinHeight + 'px'
        oDrag.style.left = (document.documentElement.clientWidth - oDrag.offsetWidth) / 2 + 'px'
        oDrag.style.top = (document.documentElement.clientHeight - oDrag.offsetHeight) / 2 + 'px'
        this.style.display = 'none'
        oMax.style.display = 'block'
      }
      //最小化按钮
      oMin.onclick = oClose.onclick = function() {
        oDrag.style.display = 'none'
        var oA = document.createElement('a')
        oA.className = 'open'
        oA.href = 'javascript:;'
        oA.title = '还原'
        document.body.appendChild(oA)
        oA.onclick = function() {
          oDrag.style.display = 'block'
          document.body.removeChild(this)
          this.onclick = null
        }
      }
      //阻止冒泡
      oMin.onmousedown = oMax.onmousedown = oClose.onmousedown = function(event) {
        this.onfocus = function() {
          this.blur()
        };
        (event || window.event).cancelBubble = true
      }
    },
    resize(oParent, handle, isLeft, isTop, lockX, lockY) {
      handle.onmousedown = function(event) {
        var event = event || window.event
        var disX = event.clientX - handle.offsetLeft
        var disY = event.clientY - handle.offsetTop
        var iParentTop = oParent.offsetTop
        var iParentLeft = oParent.offsetLeft
        var iParentWidth = oParent.offsetWidth
        var iParentHeight = oParent.offsetHeight
        document.onmousemove = function(event) {
          var event = event || window.event
          var iL = event.clientX - disX
          var iT = event.clientY - disY
          var maxW = document.documentElement.clientWidth - oParent.offsetLeft - 2
          var maxH = document.documentElement.clientHeight - oParent.offsetTop - 2
          var iW = isLeft ? iParentWidth - iL : handle.offsetWidth + iL
          var iH = isTop ? iParentHeight - iT : handle.offsetHeight + iT
          isLeft && (oParent.style.left = iParentLeft + iL + 'px')
          isTop && (oParent.style.top = iParentTop + iT + 'px')
          iW < this.dragMinWidth && (iW = this.dragMinWidth)
          iW > maxW && (iW = maxW)
          lockX || (oParent.style.width = iW + 'px')
          iH < this.dragMinHeight && (iH = this.dragMinHeight)
          iH > maxH && (iH = maxH)
          lockY || (oParent.style.height = iH + 'px')
          if ((isLeft && iW == this.dragMinWidth) || (isTop && iH == this.dragMinHeight)) document.onmousemove = null
          return false
        }
        document.onmouseup = function() {
          document.onmousemove = null
          document.onmouseup = null
        }
        return false
      }
    },
    byId: function(id) {
      return typeof id === 'string' ? document.getElementById(id) : id
    },
    byClass: function(sClass, oParent) {
      var aClass = []
      var reClass = new RegExp('(^| )' + sClass + '( |$)')
      var aElem = this.byTagName('*', oParent)
      for (var i = 0; i < aElem.length; i++) reClass.test(aElem[i].className) && aClass.push(aElem[i])
      return aClass
    },
    byTagName: function(elem, obj) {
      return (obj || document).getElementsByTagName(elem)
    },
    customclose: function(){
      var oDrag = document.getElementById('drag')
      oDrag.style.display = 'none'
    },
    customup:function(){
      var oSpan = document.getElementsByClassName('el-tree')[0]
      var oDown = document.getElementsByClassName('custom-xiala')[0]
      var oUp = document.getElementsByClassName('custom-shouqi')[0]
      oSpan.style.display = 'none'
      oUp.style.display = 'none'
      oDown.style.display = 'inline-block'
    },
    customdown:function(){
      var oSpan = document.getElementsByClassName('el-tree')[0]
      var oDown = document.getElementsByClassName('custom-xiala')[0]
      var oUp = document.getElementsByClassName('custom-shouqi')[0]
      oSpan.style.display = 'block'
      oUp.style.display = 'inline-block'
      oDown.style.display = 'none'
    }
  }
}
</script>
<style scoped>
.sql-editor{
  height: 842px;
  /* overflow-y:scroll */
}

.display{
  display: none;

}

.div-width{
  width:100%;
}

.el-container{
  border: 1px solid #eee
}

.div-btn{
  margin-top: -3%;
  float: right;
  position: relative;
}

.p-div{
  color:red;
  font-size:large;
}

.model-result-output-col{
  height: 650px;
  overflow-y: scroll;
}

.default-value{
  margin-left:20px;
}

.drag {
  position: absolute;
  z-index: 1000;
  top: 40px;
  left: 85%;
  width: 95px;
  background: #FFFFFF;
  border-radius: 5px;
  box-shadow: 0px 3px 8px 7px #00000015;
}

#drag .title {
  position: relative;
  height: 12px;
}

#drag .title h2 {
  font-size: 24px;
  height: 12px;
  line-height: 10px;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
}

#drag .title div {
  position: absolute;
  height: 19px;
  top: 2px;
  right: 0;
}

#drag .title a, a.open {
  float: left;
  width: 21px;
  height: 19px;
  display: block;
  margin-left: 5px;
}


.el-tree-rewrite{
  background: #fff;
  width: 100%;
}

.custom-tree-node{
  position: relative;
  left: -2px;
  font-size: 13px;
  color: #353A43;
}

.custom-tree-caidan{
  border-top: 1px solid #f0f0f0;
  width: 100%;
  margin-top: 5px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 12px;
}

.custom-tree-caidan img{
  width: 20px;
  height: 20px;
  margin: 10px 0 0 0px;
}
.custom-tree-shangla{
  border-top: 1px solid #f0f0f0;
  margin-top: 5px;
  width: 100%;
  height: 10px;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.custom-xiala{
  transform: rotate(180deg);
  display: none;
}

#drag .custom-tree-node span:first-child{
  width:56px;
  white-space:nowrap;
  text-overflow:ellipsis;
  overflow:hidden;
  display: inline-block;
}

#drag span{
  float: left;
}

.words{
  width: 1000px;
  /* height: 200px; */
  margin: 50px 0 0 50px;
  box-shadow: 0 0 9px 5px rgba(0,0,0,.15);
  border-radius: 8px;
  font-size: 20px;
  color: #70747a;
  text-align: justify;
  line-height: 36px;
  padding: 10px;
}

.content{
  overflow: hidden;
}
</style>
