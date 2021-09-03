<template>
  <div class="app-container" v-loading="editorModelLoading">
    <el-container class="el-container">
      <div ref="modelDesign" class="div-width">
        <el-form ref="modelDesignForm" :model="form" :rules="modelDesignRules" :disabled="isBanEdit">
          <div v-for="state in modelTypeObj" :key="state.id" :value="state.id" :label="state.id" class="sqlEditorParamWidthOn"
               id="graphDiv">
            <SQLEditor :data-user-id='dataUserId' :scene-code1='sceneCode' :modelUuid='form.modelUuid'
                       @getSqlObj="getSqlObj" v-if="state.id==sqlEditorStr" ref="SQLEditor"
                       :sql-editor-param-obj="sqlEditorParamObj" :sql-value="form.sqlValue" :callType="editorModel"
                       :locationUuid="form.locationUuid" :locationName="form.locationName" :style="{height: someHeight + 'px'}"/>
            <graph ref="graph" :graphUuidParam="form.graphUuid" openGraphTypeParam="4" @getGraphObj="getGraphObj" openTypeParam="2" :refreshGraph="refreshAppleTable"
                   v-if="state.id==graphEditorStr"></graph>
          </div>
          <div class="modelInfoClass" v-show="modelInfoDraw" style="position:absolute; height: calc(100% - 125px); overflow:auto">
            <div ref="basicInfo" class="detail-form">
              <el-form ref="basicInfoForm" :model="form" :rules="basicInfoRules" :disabled="isBanEdit">
                <el-row>
                  <el-col :span="20">
                    <el-form-item label="模型名称" prop="modelName">
                      <el-input v-model="form.modelName"/>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-form-item label="业务分类">
                    <el-col :span="18">
                      <el-input v-model="form.modelFolderUuid" class="display" :disabled="true"/>
                      <el-input v-model="form.modelFolderName" :disabled="true"/>
                    </el-col>
                    <el-col :span="2">
                      <el-button ref="businessFolderBtnRef" @click="modelFolderTreeDialog = true" type="primary">选择</el-button>
                    </el-col>
                    <el-col :span="2"></el-col>
                  </el-form-item>
                </el-row>
                <el-row>
                  <el-form-item label="审计事项" prop="auditItemUuid">
                    <el-col :span="18">
                      <el-input v-model="form.auditItemUuid" class="display" :disabled="true"/>
                      <el-input v-model="form.auditItemName" :disabled="true"/>
                    </el-col>
                    <el-button @click="showAuditItemTree" type="primary">选择</el-button>
                  </el-form-item>
                </el-row>
                <el-row>
                  <el-col :span="20">
                    <el-form-item label="风险等级" prop="riskLevelUuid">
                      <el-select v-model="form.riskLevelUuid" placeholder="请选择风险等级" style="width:100%;">
                        <el-option
                          v-for="state in riskLeve"
                          :key="state.codeValue"
                          :value="state.codeValue"
                          :label="state.codeName"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="20">
                    <el-form-item label="模型类型" prop="modelType">
                      <el-select disabled v-model="form.modelType" placeholder="请选择模型类型" style="width:100%">
                        <el-option
                          v-for="state in modelTypeData"
                          :key="state.codeValue"
                          :value="state.codeValue"
                          :label="state.codeName"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="20">
                    <el-form-item label="模型用途" prop="modelUse">
                      <!-- 模型用途为预警的模型不能编辑模型用途 -->
                      <el-select v-model="form.modelUse" :disabled="form.modelUse==2" placeholder="请选择模型用途" style="width:100%;">
                        <el-option
                          v-for="item in modelUseList"
                          :key="item.value"
                          :value="item.value"
                          :label="item.label"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="20">
                    <el-form-item label="审计思路">
                      <el-input v-model="form.auditIdeas" type="textarea"/>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="20">
                    <el-form-item label="参数条件">
                      <el-input v-model="form.paramConditions" type="textarea"/>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </div>
          <div class="modelInfoClass" v-show="useParamDraw" style="position:absolute; height: calc(100% - 125px); overflow:auto">
            <div ref="paramDefaultValue" class="default-value">
              <div style="font-size: 20px">
                模型参数
                <el-tooltip class="item" effect="dark" content="拖拽改变参数展示顺序" placement="top-start">
                  <i class="el-icon-info"/></el-tooltip>
              </div>
              <div id="paramList">
                <paramshownew ref="apple" v-show="paramShowVIf"></paramshownew>
              </div>
            </div>
          </div>
          <div class="modelInfoClass " v-show="resultConfigDraw" style="position:absolute; height: calc(100% - 125px); overflow:auto">
            <el-tabs v-model="activeName" :stretch="true" style="width: 92%">
              <el-tab-pane label="模型结果" name="first"><div v-show="!isExecuteSql" align='center' class="notExecuteSqlClass" >执行SQL后才能设置</div><div v-show="isExecuteSql" ref="modelResultOutputCol" class="default-value">
                <div style="font-size: 20px">
                  模型结果
                  <el-tooltip class="item" effect="dark" content="只显示最后的结果列" placement="top-start">
                    <i class="el-icon-info"/></el-tooltip>
                </div>
                <div class="model-result-output-col detail-form">
                  <el-table ref="columnData" :data="columnData" class="div-width">
                    <el-table-column prop="outputColumnName" label="输出列名" width="180"/>
                    <el-table-column prop="dataCoding" label="数据转码" width="180">
                      <template slot-scope="scope">
                        <SelectTransCode ref="SelectTransCode" :transuuid.sync="scope.row.dataCoding"/>
                      </template>
                    </el-table-column>
                    <el-table-column prop="columnName" label="是否显示" width="80">
                      <template slot-scope="scope">
                        <el-select v-model="scope.row.isShow" placeholder="是否显示" value="1" :disabled="isBanEdit">
                          <el-option label="是" :value="1"/>
                          <el-option label="否" :value="0"/>
                        </el-select>
                      </template>
                    </el-table-column>
<!--                    <el-table-column prop="columnName" label="对应业务字段" width="180">-->
<!--                      <template slot-scope="scope">-->
<!--                        <el-select v-model="scope.row.businessFieldUuid" value="-1" :disabled="isBanEdit">-->
<!--                          <el-option-->
<!--                            v-for="state in businessColumnSelect"-->
<!--                            :key="state.attrCode"-->
<!--                            :value="state.attrCode"-->
<!--                            :label="state.attrName"-->
<!--                          />-->
<!--                        </el-select>-->
<!--                      </template>-->
<!--                    </el-table-column>-->
                    <el-table-column prop="columnName" label="别名" width="180">
                      <template slot-scope="scope">
                        <el-input v-model="scope.row.columnAlias" placeholder="请输入别名" :disabled="isBanEdit"/>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div></el-tab-pane>
              <el-tab-pane label="模型关联" name="second"><div v-show="!isExecuteSql" align='center' class="notExecuteSqlClass" >执行SQL后才能设置</div><div v-show="isExecuteSql" id="modelDetailDiv">
                <div style="font-size: 20px;margin-left: 3%">
                  模型关联
                  <el-tooltip class="item" effect="dark" content="在进行审计分析时，模型执行所生成的结果数据在业务逻辑上可能存着关联关系；
                  而在模型的设计过程中，同样可能需要利用到其他模型的执行结果。因此，为了满足这种模型之间的互相利用、相互辅助的功能需求，
                  系统允许用户对多个模型或sql进行关联。
                  用户通过本功能来创建并维护模型间的关联关系，以满足多模型联合执行分析的业务需求。
                  通过模型设计器，用户能够为当前的模型建立与其他可访问模型的关联关系，并将其分析结果引入到当前模型设计中。" placement="top-start">
                    <i class="el-icon-info"/></el-tooltip>
                </div>
                  <el-row>
                    <div style="width: 94%" align="right">
                      <el-button :disabled="modelRelatedButton.add" type="primary" class="oper-btn add" @click="addModelRelation" />
                      <el-button :disabled="modelRelatedButton.edit" type="primary" class="oper-btn edit" @click="editModelRelation" />
                      <el-button :disabled="modelRelatedButton.delete" type="primary" class="oper-btn delete" @click="deleteModelRelation" />
                    </div>
                  </el-row>
                  <el-table :data="modelDetails" class="div-width" style="margin-left: 3%" @selection-change="handleSelectionChange">
                    <el-table-column
                      type="selection"
                      width="60">
                    </el-table-column>
                    <el-table-column prop="modelDetailName" label="名称" width="200"/>
                    <el-table-column prop="modelDetailMemo" label="描述" width="200"/>
                    <el-table-column prop="relationType" label="关联类型" width="200" :formatter="modelTypeFormatter"/>
                  </el-table>
              </div></el-tab-pane>
              <el-tab-pane label="模型条件" name="third">
                <div align='center' v-show="!isExecuteSql" class="notExecuteSqlClass" >执行SQL后才能设置</div>
                <div v-show="isExecuteSql">
                <div style="font-size: 20px;margin-left: 3%">
                  模型条件
                  <el-tooltip class="item" effect="dark" content="" placement="top-start">
                    <i class="el-icon-info"/></el-tooltip>
                </div>
                <el-row>
                  <div style="width: 94%" align="right">
                    <el-button :disabled="thresholdButton.add" type="primary" class="oper-btn add" @click="addthreshold" />
                    <el-button :disabled="thresholdButton.edit" type="primary" class="oper-btn edit" @click="editthreshold" />
                    <el-button :disabled="thresholdButton.delete" type="primary" class="oper-btn delete" @click="deleteThreshold" />
                  </div>
                </el-row>
                <el-table :data="threshold" class="div-width" style="margin-left: 3%" @selection-change="handleSelectionChangeThreshold">
                  <el-table-column
                    type="selection"
                    width="60">
                  </el-table-column>
                  <el-table-column prop="modelResultColumnName" label="阈值字段" width="200"/>
                  <el-table-column prop="operator" label="运算符" width="200"/>
                  <el-table-column prop="thresholdValue.thresholdValueName" label="阈值名称" width="200"/>
                </el-table>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
          <div class="editmodel-right"><!--v-if="!modifying"-->
            <div @click="clickModelInfo()"><span :class="changeBtn.one === true?'self-made-btn-a':'self-made-btn'"  class="rightButtonClassa">基础信息</span></div>
            <div @click="clickUseParam()"><span :class="changeBtn.two === true?'self-made-btn-a':'self-made-btn'" class="rightButtonClassa">已用参数</span></div>
            <div @click="clickResultConfig()"><span :class="changeBtn.three === true?'self-made-btn-a':'self-made-btn'" class="rightButtonClassa">结果展现</span></div>
            <el-button type="primary" size="small" class="oper-btn save-none" style="position: absolute;bottom: 95px;left: 9px;width: 24px" @click="save" />
            <el-button type="primary" size="small" class="oper-btn cancel-none" style="position: absolute;bottom: 35px;left: -1px;width: 24px;" @click="closeWinfrom" />
          </div>
          <el-form-item label="模型sql" prop="sqlValue" class="display">
            <el-input v-model="form.sqlValue" type="textarea"/>
          </el-form-item>
        </el-form>
      </div>
    </el-container>
    <el-dialog v-if="auditItemTree" :destroy-on-close="true" :append-to-body="true" :visible.sync="auditItemTree"
               title="请选择审计事项" width="80%" :close-on-click-modal="false">
      <AuditItemTree ref="auditItemTreeRef"></AuditItemTree>
      <div slot="footer">
        <el-button  type="primary" @click="getAuditItem">确定</el-button>
        <el-button @click="auditItemTree=false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog v-if="modelFolderTreeDialog" :visible.sync="modelFolderTreeDialog" title="选择业务分类" width="50%" :close-on-click-modal="false">
      <ModelFolderTree ref="modelFolderTree" public-model="editorModel"/>
      <div slot="footer">
        <el-button type="primary" @click="setBusinessFolder">确定</el-button>
        <el-button @click="modelFolderTreeDialog=false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog v-if="modelDetailIsSee" :visible.sync="modelDetailIsSee" :title="modelDetailAdd===true?'添加模型关联':'修改模型关联'" width="50%" :close-on-click-modal="false">
      <model-detail style="height:500px" ref="child" v-if="modelDetailIsSee" :data="modelDetailAdd===true?{}:editingModelDetail" :operationtype="operationObj.operationType" :columns="columnData"></model-detail>
      <div slot="footer">
        <el-button type="primary" @click="modelDetailAdd===true?createDetail():editModelRelationDetermine()">确定</el-button>
        <el-button @click="closeModelRelationDetermine()">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog v-if="thresholdIsSee" :visible.sync="thresholdIsSee" :title="thresholdAdd===true?'添加模型阈值':'修改模型阈值'" width="50%" :close-on-click-modal="false">
          <thresholdvaluerel v-if="thresholdIsSee" ref="thresholdChild" :setThreasholdValueObj="setThreasholdValueObj"></thresholdvaluerel>
      <div slot="footer">
        <el-button type="primary" @click="thresholdAdd===true?createThreshold():editThresholdDetermine()">确定</el-button>
        <el-button @click="thresholdIsSee=false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import ModelDetail from '@/views/analysis/auditmodelone/modeldetail'
import ModelFilterShow from '@/views/analysis/auditmodel/modelfiltershow'
import SQLEditor from '@/views/analysis/sqleditor/index'
import AuditItemTree from '@/views/analysis/auditmodel/auditItemtree'
import {getBusinessAttribute, saveModel, updateModel, uuid2} from '@/api/analysis/auditmodel'
import VRuntimeTemplate from 'v-runtime-template'
import paramShow from "@/views/analysis/modelparam/paramshow";
import {getDictList} from '@/utils/index'
import {getUuid} from '@/api/analysis/common'
import ModelFolderTree from '@/views/analysis/auditmodel/modelfoldertree'
import SelectTransCode from '@/views/data/table/transcodeselect'
import modelshoppingcart from '@/views/analysis/auditmodel/modelshoppingcart'
import graph from '@/views/graphtool/tooldic/index'
import messageTips from '@/views/analysis/auditmodel/message'
import paramshownew from "@/views/analysis/modelparam/paramshownew";
import thresholdvaluerel from "@/views/analysis/auditmodelone/thresholdvaluerelOne";
import chartAudit from "@/api/analysis/chartauditmodel"
// import func from 'vue-temp/vue-editor-bridge'
export default {
  name: 'EditModel',
  components: {
    modelshoppingcart,
    ModelDetail,
    ModelFilterShow,
    VRuntimeTemplate,
    SQLEditor,
    AuditItemTree,
    paramShow,
    ModelFolderTree,
    SelectTransCode,
    graph,
    messageTips,
    paramshownew,
    thresholdvaluerel
  },
  props: ['openValue'],
  data() {
    return {
      modelDetailIsSee:false,
      activeName: 'first',
      modifying:false,
      modelInfoDraw:false,
      useParamDraw:false,
      resultConfigDraw:false,
      dataUserId: undefined,
      sceneCode: undefined,
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      //是否显示审计事项树
      auditItemTree: false,
      sqlEditorStr: '002003001',//sql编辑器编码
      graphEditorStr: '002003002',//图形化编码
      //是否显示保存取消按钮
      isShowBtn: true,
      //打开sql编辑器时给sql编辑器传值，告诉sql编辑器是从模型编辑界面进来的
      editorModel: "editorModel",
      //是否禁止编辑
      isBanEdit: false,
      //是否显示模型分类树
      modelFolderTreeDialog: false,
      //列数据
      columnData: [],
      //实体对象
      form: {
        modelUuid: '',
        modelName: '',
        modelFolderUuid: '',
        modelFolderName: '',
        auditItemUuid: '',
        riskLevelUuid: '',
        auditIdeas: '',
        paramConditions: '',
        sqlValue: '',
        auditItemName: '',
        modelType: '',  //002003001审计模型编号  002003002图形化编号
        locationName: '',
        locationUuid: '',
        graphUuid: '',
        modelUse: 1 // 审计用途
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
      // 模型详细对象数据
      oldModelDetails: [],
      dragMinWidth: 250,
      dragMinHeight: 180,
      //条件显示数组
      filterShows: [],
      //校验规则失败自动跳转用的对象
      newRelInfoValue: {},
      //sql编辑器参数对象
      sqlEditorParamObj: {},
      //添加模型详细树时候的索引
      modelDetailIndex: 0,
      paramShowVIf: false,
      editorModelLoading: false,
      //风险等级
      riskLeve: [],
      // 模型用途
      modelUseList: [{label:"审计查询",value: 1},{label:"审计预警",value: 2}],
      //模型类型
      modelTypeData: [],
      //添加条件显示时候树的索引
      modelFilterShowIndex: 0,
      //模型历史表数组
      modelOriginalTable: [],
      //模型图表配置
      modelChartSetup: {},
      //模型类型数组
      modelTypeObj: [],
      //关闭窗体时候用的窗体名
      formName: "新增模型",
      //操作对象
      operationObj: {},
      //图形化的列信息，比较列是否相同
      graphColumnInfo: null,
      //sql编辑器界面返回来的参数
      sqlEditorParam: null,
      basicInfoRules: {
        modelName: [
          {type: 'string', required: true, message: '请输入模型名称', trigger: 'blur'}
        ],
        auditItemUuid: [
          {required: true, message: '请选择审计事项', trigger: 'change'}
        ],
        riskLevelUuid: [
          {type: 'string', required: true, message: '请选择风险等级', trigger: 'change'}
        ],
        modelUse: [{required: true, message: '请选择模型用途', trigger: 'change'}],
        modelType: [{type: 'string', required: true, message: '请选择模型类型', trigger: 'change'}
        ]
      },
      modelDesignRules: {
        sqlValue: [{type: 'string', required: true, message: '请选择输入模型SQL', trigger: 'blur'}]
      },
      imgCus1: require("@/views/analysis/auditmodel/imgs/close.png"),
      imgCus2: require("@/views/analysis/auditmodel/imgs/save.png"),
      imgCus3: require("@/views/analysis/auditmodel/imgs/opentop.png"),
      paramShowArr: this.sqlEditorParam,
      changeBtn: {  //设置sql编辑器右侧按钮的高亮效果
        one: false,
        two: false,
        three: false
      },
      modelRelatedButton:{  //模型关联维护按钮可用控制
        add:false,
        delete:true,
        edit:true
      },
      editingModelDetail:{},
      modelDetailAdd:true,   //判断模型关联是修改还是添加状态
      selectedModelDetail:[],  //存储选中的模型关联对象
      threshold:[],
      thresholdButton:{   //阈值维护按钮可用控制
        add:false,
        delete:true,
        edit:true
      },
      thresholdIsSee:false,
      thresholdAdd:true, //判断模型阈值是修改还是添加状态
      setThreasholdValueObj:{
        isDisplay:false ,   //查看是true   其他是false
        thresholdValueRelObj:{},
        columns:[]
      },
      selectedThreshold:[],
      isExecuteSql:false,
      // modelDetailIsSeeHeight:"",
      someHeight: 700
    }
  },
  watch: {
    paramShowVIf(newChild) {
          this.$refs.apple.initSetting(this.sqlEditorParam)
    }
  },
  created() {
    // this.modelDetailIsSeeHeight = ""
    //设置一个默认的模型编号
    this.form.modelUuid = getUuid()
    this.operationObj = JSON.parse(sessionStorage.getItem('operationObj'));
    if (this.operationObj.modelType!= '' && this.operationObj.modelType!= undefined){
      this.form.modelType = this.operationObj.modelType
      this.modelTypeChangeEvent(this.form.modelType)
    }
    this.paramShowVIf = true
    if (this.operationObj.model != undefined){
      this.form.graphUuid = this.operationObj.model.graphUuid
      this.isExecuteSql = true
      this.modelTypeChangeEvent(this.operationObj.model.modelType)
    }
    if (this.$route.query.dataUserId != 'undefined' && this.$route.query.sceneCode != 'undefined') {
      this.dataUserId = this.$route.query.dataUserId
      this.sceneCode = this.$route.query.sceneCode
    } else {
      this.dataUserId = undefined
      this.sceneCode = undefined
    }
  },
  mounted() {
    // this.initEvent()
    this.initData(this.operationObj)
    // 如果为2则反显要修改的数据
    if (this.operationObj.operationType == 2) {
      this.setThreasholdValueObj.isDisplay = true
      this.isUpdate = true
      var model = this.operationObj.model
      this.displayData(model)
      this.formName = "修改模型"
    }
    // 如果为2则反显要显示的数据
    if (this.operationObj.operationType == 3) {
      this.setThreasholdValueObj.isDisplay = true
      this.isUpdate = true
      var model = this.operationObj.model
      this.displayData(model)
      this.formName = this.operationObj.formName
      //隐藏按钮
      this.isShowBtn = false
      //禁用所有界面可编辑元素
      this.isBanEdit = true
    }
    // 自适应高度
    let windowHeight = document.getElementsByClassName("app-container")[0]
    this.someHeight = windowHeight.offsetHeight
  },
  methods: {
    editThresholdDetermine(){
      var thresholdObj = this.$refs.thresholdChild.getSaveObj()
      for (var j = 0 ;j<this.threshold.length; j++){
        if (this.threshold[j].onlyId===this.setThreasholdValueObj.thresholdValueRelObj.onlyId){
          this.threshold.splice(j,1,thresholdObj)
        }
      }
      this.thresholdIsSee = false
    },
    deleteThreshold(){
      for(var i = 0;i<this.selectedThreshold.length;i++){
        for (var j = 0 ;j<this.threshold.length; j++){
          if (this.threshold[j].onlyId===this.selectedThreshold[i].onlyId){
            this.threshold.splice(j,1)
          }
        }
      }
    },
    editthreshold(){
      this.setThreasholdValueObj.isDisplay = true
      this.thresholdAdd = false
      this.thresholdIsSee = true
    },
    addthreshold(){
      this.setThreasholdValueObj.isDisplay = false
      this.thresholdAdd = true
      this.thresholdIsSee = true
    },
    //模型类型格式化
    modelTypeFormatter(val){
      if (val.relationType === 1){
        return '关联模型'
      }else if(val.relationType === 2){
        return '关联表'
      }
    },
    /**
     * 当模型关联表格数据勾选发生变化时触发
     * **/
    handleSelectionChange(val){
      if (val.length==0){
        this.modelRelatedButton.add = false
        this.modelRelatedButton.edit = true
        this.modelRelatedButton.delete = true
      }else if (val.length==1){
        this.modelRelatedButton.add = false
        this.modelRelatedButton.edit = false
        this.modelRelatedButton.delete = false
      }else if (val.length>1){
        this.modelRelatedButton.add = false
        this.modelRelatedButton.edit = true
        this.modelRelatedButton.delete = false
      }
      this.editingModelDetail = val[0]
      this.selectedModelDetail = val
    },
    handleSelectionChangeThreshold(val){
      if (val.length==0){
        this.thresholdButton.add = false
        this.thresholdButton.edit = true
        this.thresholdButton.delete = true
      }else if (val.length==1){
        this.thresholdButton.add = false
        this.thresholdButton.edit = false
        this.thresholdButton.delete = false
      }else if (val.length>1){
        this.thresholdButton.add = false
        this.thresholdButton.edit = true
        this.thresholdButton.delete = false
      }
      this.setThreasholdValueObj.thresholdValueRelObj = val[0]
      this.selectedThreshold = val
    },
    /**
     * 点击模型关联添加按钮触发方法
     * **/
    addModelRelation(){
      this.modelDetailAdd = true
      this.modelDetailIsSee = true
    },
    /**
     * 点击模型关联修改按钮触发方法
     * **/
    editModelRelation(){
      this.modelDetailAdd = false
      this.modelDetailIsSee = true
      this.oldModelDetails = JSON.parse(JSON.stringify(this.modelDetails));
    },
    deleteModelRelation(){
      for(var i = 0;i<this.selectedModelDetail.length;i++){
         for (var j = 0 ;j<this.modelDetails.length; j++){
              if (this.modelDetails[j].onlyId===this.selectedModelDetail[i].onlyId){
                this.modelDetails.splice(j,1)
              }
        }
      }
    },
    editModelRelationDetermine(){
      var modelDetailObj =  this.$refs.child.getObj()
      if (modelDetailObj.verResult == false){
        this.$message(modelDetailObj.message)
        return
      }else {
        // this.modelDetailIsSee = false
        // modelDetailObj.onlyId = uuid2()
        // this.modelDetails.push(modelDetailObj)
        for (var j = 0 ;j<this.modelDetails.length; j++){
          if (this.modelDetails[j].onlyId===this.editingModelDetail.onlyId){
            this.modelDetails.splice(j,1,this.editingModelDetail)
          }
        }
        this.modelDetailIsSee = false
      }
    },
    // 取消编辑
    closeModelRelationDetermine(){
      if(this.modelDetailAdd) this.modelDetailIsSee = false
      else {
        this.modelDetails = this.oldModelDetails
        this.modelDetailIsSee = false
      }
    },
    clickModelInfo(){
      if (this.modifying == true && this.modelInfoDraw == true){
        this.modifying = false
        this.modelInfoDraw = false
        this.changeBtn.one = false
      }else if (this.modifying == true && this.modelInfoDraw == false){
        this.modifying = true
        this.useParamDraw = false
        this.resultConfigDraw = false
        this.modelInfoDraw = true
        this.changeBtn.one = true
        this.changeBtn.two = this.changeBtn.three = false
      }else {
        this.useParamDraw = false
        this.resultConfigDraw = false
        this.modelInfoDraw = true
        this.modifying = true
        this.changeBtn.one = true
      }
    },
    clickUseParam(){
      // 刷新参数列表
      this.refreshAppleTable()
      if (this.modifying == true && this.useParamDraw == true){
        this.modifying = false
        this.useParamDraw = false
        this.changeBtn.two = false
      }else if (this.modifying == true && this.useParamDraw == false){
        this.modifying = true
        this.useParamDraw = true
        this.resultConfigDraw = false
        this.modelInfoDraw = false
        this.changeBtn.two = true
        this.changeBtn.one = this.changeBtn.three = false
      }else {
        this.modelInfoDraw = false
        this.useParamDraw = true
        this.resultConfigDraw = false
        this.modifying = true
        this.changeBtn.two = true
      }
      if (this.form.modelType === "002003002") {
        //说明是图形化模型，从图形化组件里获取列信息
        this.getGraphObj()
      }
    },
    clickResultConfig(){
      if (this.modifying == true && this.resultConfigDraw == true){
        this.modifying = false
        this.resultConfigDraw = false
        this.changeBtn.three = false
      }else if (this.modifying == true && this.resultConfigDraw == false){
        this.modifying = true
        this.useParamDraw = false
        this.resultConfigDraw = true
        this.modelInfoDraw = false
        this.changeBtn.three = true
        this.changeBtn.two = this.changeBtn.one = false
      }else {
        this.modelInfoDraw = false
        this.useParamDraw = false
        this.resultConfigDraw = true
        this.modifying = true
        this.changeBtn.three = true
      }
      if (this.form.modelType === "002003002") {
        //说明是图形化模型，从图形化组件里获取列信息
        this.getGraphObj()
      }
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => {});
    },
    /**
     *初始化数据
     */
    initData(operationObj) {
      // 初始化模型分类数据
      if (operationObj.folderId != "") {
        this.form.modelFolderUuid = operationObj.folderId
        this.form.modelFolderName = operationObj.folderName
      }
      // 初始化业务字段列表
      getBusinessAttribute().then(result => {
        if (result.data != null) {
          this.businessColumnSelect = result.data
        }
      })
      // 初始化字段类型
      const columnTypeSelect = [{uuid: 'int', name: '数值'}, {uuid: 'varchar', name: '字符串'}, {
        uuid: 'date',
        name: '日期'
      }, {uuid: 'money', name: '金额'}]
      this.columnTypeSelect = columnTypeSelect
      // 初始化风险等级
      this.riskLeve = getDictList('002002')
      // 初始化审计事项
      this.modelTypeData = getDictList('002003')
    },
    /**
     * 获取当前界面的模型对象
     */
    async getModelObj() {
      let allVer = true
      let paramDefaultValue;
      let columnData = this.$refs.columnData.data
      // region 校验基本信息
      let basicInfoVerResult = false
      this.$refs['basicInfoForm'].validate((valid) => {
        if (valid) {
          basicInfoVerResult = valid
        }
      })
      if (!basicInfoVerResult) {
       if (this.modifying == true && this.modelInfoDraw == false){
          this.modifying = true
          this.useParamDraw = false
          this.resultConfigDraw = false
          this.modelInfoDraw = true
          this.changeBtn.one = true
          this.changeBtn.two = this.changeBtn.three = false
        }else {
          this.useParamDraw = false
          this.resultConfigDraw = false
          this.modelInfoDraw = true
          this.modifying = true
          this.changeBtn.one = true
        }
        return null
      }
      if (this.$refs.SQLEditor != undefined) {
        // region 校验sql语句
        let modelDesignVerResult = false
        this.$refs['modelDesignForm'].validate((valid) => {
          if (valid) {
            modelDesignVerResult = valid
            message = "请先编写SQL"
          }
        })
        let message = ""
        if (this.$refs.SQLEditor[0].getSQLIsUpdate()) {
          modelDesignVerResult = false
          message = "请先执行或校验SQL"
        }
        // endregion
        //获取SQL编辑器参数对象 到下边去处理
        if (this.sqlEditorParamObj.arr.length != 0) {
          // paramDefaultValue = this.$refs.apple.getParamSettingArr(this.sqlEditorParamObj.arr);
          paramDefaultValue = this.$refs.apple.getParamsSetting()
          if (!paramDefaultValue.verify) {
            this.$message({type: 'info', message: paramDefaultValue.message})
            return null
          }
        }
      } else if (this.$refs.graph != undefined) {
        // 获取图形化参数对象  到下边去处理
        paramDefaultValue = this.$refs.graph[0].getParamsArr()
        //处理模型结果固定输出列
        //说明选择了图形化并且没有输出列，自动获取，如果获取不到则返回并给予提示
        if (this.form.modelType == "002003002") {
          let saveResult = true
          let graphObjResult = this.getGraphObj()
          paramDefaultValue = this.$refs.apple.getParamsSetting()
          if (!graphObjResult) {
            return null
          } else {
            //获取完图形化的列信息之后重新赋值 因为这个时候界面没渲染完成，因此直接从数据里拿
            columnData = this.columnData
            //拿到列之后图形化就可以保存了，调用图形化的保存方法
            await this.$refs.graph[0].saveModelGraph().then(result => {
              this.modelSql = result.modelSql
              if(result.isError){
                saveResult = false
                this.$message({type: 'error', message: result.message})
              }
              this.form.graphUuid = result.graphUuid
            });
            if(!saveResult){
              return null
            }
          }
        }
      } else {
        allVer = false
      }
      if (!allVer) {
        return null
      }
      // region 处理模型结果固定输出列数据
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
      //拿到默认值后组织成后台数据库的格式
      if (paramDefaultValue != undefined && paramDefaultValue.length != 0) {
        if(paramDefaultValue.paramSettingArr){
          var paramData = paramDefaultValue.paramSettingArr
        }else{
          var paramData = paramDefaultValue
        }
        let newParamData = []
        for (let i = 0; i < paramData.length; i++) {
          var obj = {
            ammParamUuid: paramData[i].copyParamId,
            resourceType: 1,
            paramValue: JSON.stringify(paramData[i]),
            paramSort: paramData[i].sort,
            moduleParamId: paramData[i].moduleParamId
          }
          newParamData.push(obj)
        }
        this.form.parammModelRel = newParamData
      }
      for(var i = 0;i<this.modelDetails.length;i++){
        delete this.modelDetails[i].onlyId
      }
      this.form.modelDetailRelation = this.modelDetails// 模型关联详细
      // endregion
      // region 处理图表
      this.form.modelChartSetup = this.modelChartSetup
      // endregion
      // region 模型SQL所用到的表
      this.form.modelOriginalTable = this.modelOriginalTable
      // endregion
      for(var i = 0;i<this.threshold.length;i++){
        delete this.threshold[i].onlyId
      }
      this.form.modelThresholdValues = this.threshold
      //region 获取sql编辑器那边所选中的保存路径
      // endregionalert
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
      this.form.graphUuid = ""
      // 初始化默认参数
      // 初始化参数默认值界面界面
      if (returnObj.params.length != 0) {
        this.sqlEditorParam = returnObj.params
        this.$refs.apple.initSetting(this.sqlEditorParam)
      } else {
        // 编辑时清空参数的情况
        this.$refs.apple.removeParam()
      }
      this.sqlEditorParamObj = {arr: returnObj.params}//给sql编辑器的参数对象赋值，编辑使用
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
      if (this.columnData.length==0){
        this.isExecuteSql = false
      }else if (this.columnData.length>0){
        this.isExecuteSql = true
      }
      this.setThreasholdValueObj.columns = []
      for (var i = 0;i<columnData.length;i++){
        this.setThreasholdValueObj.columns.push(columnData[i].outputColumnName)
      }
      // 模型SQL用到的数据表
      this.modelOriginalTable = sqlObj.modelOriginalTable
      // 处理图表JSON
      this.modelChartSetup = sqlObj.modelChartSetup
      this.form.locationName = returnObj.locationName
      this.form.locationUuid = returnObj.locationUuid
    },
    // 刷新参数列表
    refreshAppleTable(){
      this.$refs.apple.refreshTable()
    },
    /**
     *获取图形化对象
     */
    getGraphObj() {
      //如果没有选择任何类型则不加载
      if (this.form.modelType === '') {
        return
      }
      if (this.$refs.graph === undefined) {
        return
      }
      //获取图形化列信息
      const returnObj = this.$refs.graph[0].getResultColumnInfo()
      //判断旧的图形化信息是否为空  如果不为空则说明是二次加载，判断是否一致，如果不一致则重新加载
      if (this.graphColumnInfo != null) {
        //如果对象为空则直接返回
        if (returnObj == undefined) {
          return false
        }
        if (returnObj.isError == true) {
          this.$message({type: 'info', message: returnObj.message})
          return false
        }
        let contrastResult = this.contrastGraphColumnInfo(returnObj)
        //如果为true说明结果列相同，不需要重新加载
        // if (contrastResult) {
        //   return true
        // }
      }
      //region 初始化模型结果固定输出列
      const columnData = []
      if (returnObj.finalTable.columnNameArr !== undefined){
        for (let i = 0; i < returnObj.finalTable.columnNameArr.length; i++) {
          const columnDataObj = {
            outputColumnName: returnObj.finalTable.columnNameArr[i],
            columnType: returnObj.finalTable.columnTypeArr[i]
          }
          columnData.push(columnDataObj)
        }
        //endregion
        // region初始化默认参数
        // 初始化参数默认值界面界面
        let params = this.$refs.graph[0].getParamsArr()
        if (params.length != 0) {
          this.sqlEditorParam = params
          this.$refs.apple.initSetting(this.sqlEditorParam)
        }else {
          // 编辑时清空参数的情况
          this.$refs.apple.removeParam()
        }
        // 
        //endregion
        let that = this
        setTimeout(function () {
          that.refreshAppleTable()
        }, 500)
        this.columnData = columnData
        if (this.columnData.length==0){
          this.isExecuteSql = false
        }else if (this.columnData.length>0){
          this.isExecuteSql = true
        }
        this.setThreasholdValueObj.columns = []
        for (var i = 0;i<columnData.length;i++){
          this.setThreasholdValueObj.columns.push(columnData[i].outputColumnName)
        }
        //直接获取图形化编号
        this.form.sqlValue = ""
      }
      return true
    },
    /**
     *对比本次图形化和之前的列信息，比对是否一致，如果一直择不加载，不一致则加载
     * @param returnObj 要对比的图形化列信息对象
     */
    contrastGraphColumnInfo(returnObj) {
      let oldColumnNameArr = this.graphColumnInfo.finalTable.columnNameArr
      let newColumnNameArr = returnObj.finalTable.columnNameArr
      if (oldColumnNameArr.sort().toString() === newColumnNameArr.sort().toString()) {
        return true
      }
      return false
    },
    /**
     *相互转换param数据格式
     * @param paramObj 参数对象
     * @param type 1、获取sql编辑器时候需要的
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
        var returnObj = {'arr': []}
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
    closeWinfrom() {
      this.$store.commit('aceState/setRightFooterTags', {
        type: 'close',
        val: {
          name: this.formName,
          path: '/analysis/editorModel'
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
      $('#sqlValueView').html(sql)
    },
    /**
     * 创建模型详细
     */
    createDetail() {
      var modelDetailObj =  this.$refs.child.getObj()
      if (modelDetailObj.verResult == false){
        this.$message(modelDetailObj.message)
        return
      }else {
        this.modelDetailIsSee = false
        modelDetailObj.onlyId = uuid2()
        this.modelDetails.push(modelDetailObj)
      }
    },
    createThreshold(){
      var thresholdObj = this.$refs.thresholdChild.getSaveObj()
      if (thresholdObj===undefined){
        this.$message('缺少阈值字段')
      }else {
        this.thresholdIsSee = false
        thresholdObj.onlyId = uuid2()
        this.threshold.push(thresholdObj)
      }
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
        sqlValue: '',
        modelUse: 0
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
      //模型详细数组
      this.modelDetails = []
      //模型详细索引
      this.modelDetailIndex = 0
      //条件显示数组
      this.filterShows = []
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
          outputColumnName: model.modelOutputColumn[i].outputColumnName,
          outputColumnType: model.modelOutputColumn[i].columnType
        }
        columnData.push(columnDataObj)
      }
      // 列数据
      this.columnData = columnData
      this.setThreasholdValueObj.columns = []
      for (var i = 0;i<columnData.length;i++){
        this.setThreasholdValueObj.columns.push(this.columnData[i].outputColumnName)
      }
      // endregion
      // region 反显基本信息
      this.form = model
      // endregion
      // region 反显SQL显示
      //组织参数默认值等数据，用于sql反显以及参数默认值反显
      let displayParamObj = []
      for (let i = 0; i < model.parammModelRel.length; i++) {
        if (model.parammModelRel[i].paramValue === "") {
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
      if (returnObj.params.arr.length != 0) {
        this.sqlEditorParam = displayParamObj
        this.paramShowVIf = true
      }
      // endregion
      // region 模型结果输出列
      this.columnData = model.modelOutputColumn
      if (this.form.modelType === this.graphEditorStr) {
        this.graphColumnInfo = {finalTable: {columnNameArr: []}}
        for (let i = 0; i < this.columnData.length; i++) {
          this.graphColumnInfo.finalTable.columnNameArr.push(this.columnData[i].outputColumnName)
        }
      }
      // region 反显关联详细
      for (let i = 0; i < model.modelDetailRelation.length; i++) {
          model.modelDetailRelation[i].onlyId = uuid2()
          this.modelDetails.push(model.modelDetailRelation[i])
      }
      // endregion
      // region 反显图表配置

      // endregion
      // region 反显模型历史表
      this.modelOriginalTable = model.modelOriginalTable
      // endregion
      // region 反显条件展示
      for(let i = 0;i<model.modelThresholdValues.length;i++){
        model.modelThresholdValues[i].onlyId = uuid2()
        this.threshold.push(model.modelThresholdValues[i])
      }
      // endregion
      this.displaySQL(returnObj)
    },
    /**
     *显示审计事项树
     */
    showAuditItemTree() {
      this.auditItemTree = true
    },
    /**
     * 获取审计事项
     */
    getAuditItem() {
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
    modelTypeChangeEvent(vId) {
      this.modelTypeObj = []
      if (vId === this.sqlEditorStr) {
        let obj = {
          id: this.sqlEditorStr
        }
        this.modelTypeObj.push(obj)
      }
      if (vId == this.graphEditorStr) {
        let obj = {
          id: this.graphEditorStr
        }
        this.modelTypeObj.push(obj)
        this.$nextTick(() => {
          $("#graphDiv").css({
            "height": function () {
              return $(this).parent().parent().height()
            }
          })
        })
      }
    },
    /**
     * 设置业务分类
     */
    setBusinessFolder() {
      let selectNode = this.$refs.modelFolderTree.getSelectNode()
      if (selectNode.id == undefined) {
        this.$message({type: 'info', message: "请选择业务分类"})
        return
      }
      if (selectNode.pid == 0 || selectNode.pid == null || selectNode.pid == undefined) {
        this.$message({type: 'info', message: '不允许建立在根目录'})
        return
      } else {
        this.form.modelFolderUuid = selectNode.id
        this.form.modelFolderName = selectNode.label
        this.modelFolderTreeDialog = false
      }
    },
    /**
     * 保存模型
     */
    async save() {
      let modelObj = await this.getModelObj()
      if (modelObj == null) {
        return
      }
      // 如果是图形化模型 取modelSql
      if (this.form.modelType === "002003002"){
        modelObj.sqlValue = this.modelSql
      }
      this.editorModelLoading = true
      if (!this.isUpdate) {
        saveModel(modelObj).then(result => {
          this.editorModelLoading = false
          if (result.code === 0) {
            this.$notify({
              title: '提示',
              message: '新增成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            });
            this.closeWinfrom()
          } else {
            this.$message({type: 'error', message: '新增模型失败!'})
          }
        })
      } else {
        updateModel(modelObj).then(result => {
          this.editorModelLoading = false
          if (result.code === 0) {
            this.$notify({
              title: '提示',
              message: '修改成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            });
            this.closeWinfrom()
          } else {
            this.$message({type: 'error', message: '修改模型失败!'})
          }
        })
      }
      //}
      // 调用保存图表拖拽布局
      chartAudit.$emit('chartAuditOn');
    }
  }
}
</script>
<style scoped>
.display {
  display: none;

}

.div-width {
  width: 100%;
}

.el-container {
  border: 1px solid #eee;
}

.div-btn {
  margin-top: -3%;
  float: right;
  position: relative;
}

.p-div {
  color: red;
  font-size: large;
}

.model-result-output-col {
  /* height: 650px;
  overflow-y: scroll; */
}

.default-value {
  margin-left: 20px;
}

.drag {
  position: absolute;
  z-index: 1000;
  top: 35px;
  right: 35px;
  width: 95px;
  background: #F2F2F2;
  border-radius: 15px;
  font-weight: bold;
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


.el-tree-rewrite {
  background: #F2F2F2;
  width: 100%;
}

.custom-tree-node {
  position: relative;
  left: -2px;
  font-size: 13px;
  color: #353A43;
}

.custom-tree-caidan {
  border-top: 1px solid #f0f0f0;
  width: 100%;
  margin-top: 5px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 12px;
}

.custom-tree-caidan img {
  width: 20px;
  height: 20px;
  margin: 10px 0 0 0px;
}

.custom-tree-shangla {
  border-top: 1px solid #f0f0f0;
  margin-top: 5px;
  width: 100%;
  height: 10px;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.custom-xiala {
  transform: rotate(180deg);
  display: none;
}

#drag .custom-tree-node span:first-child {
  width: 56px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: inline-block;
}

#drag span {
  float: left;
}

.words {
  width: 1000px;
  /* height: 200px; */
  margin: 50px 0 0 50px;
  box-shadow: 0 0 9px 5px rgba(0, 0, 0, .15);
  border-radius: 8px;
  font-size: 20px;
  color: #70747a;
  text-align: justify;
  line-height: 36px;
  padding: 10px;
}

.content {
  overflow: hidden;
}

.modelInfoClass {
  z-index:999;
  background-color: white;
  position: relative;
  animation: modelInfo 0.5s forwards;
  right: 60px;
}

@keyframes modelInfo {
  0%{width: 0%;}
  100%{width: 706px}
}
.sqlEditorWidth{
  float: left;
  animation: sqlEditorWidth 0.5s forwards;
}
@keyframes sqlEditorWidth {
  0%{width: calc(100% - 45px);}
  100%{width: 50%;}
}

.sqlEditorParamWidthOn{
  float: left;
  animation: sqlEditorWidth1 0.5s forwards
}
@keyframes sqlEditorWidth1 {
  0%{width: 50%;}
  100%{width: calc(100% - 45px);}
}
.rightButtonClass{
  width: 25px;
  height: 25px;
  margin: 22px 0 15px 10px;
  cursor: pointer;
}
.notExecuteSqlClass{
  font-weight:lighter ;
  font-size:15px;
  margin-top:50px
}
.rightButtonClassa{
  display: inline-block;
  font-size: 14px;
  height: 40px;
  width: 40px;
  line-height: 16px;
  border-radius: 3px;
  margin: 12px 0 0 3px;
  padding: 3.5px 5px 5px 5.5px;
  cursor: pointer;
}
.rightButtonClassa:hover{
  background: rgba(0,0,0,0.1)
}
</style>
