<template>
  <div>
    <el-container style="height: 500px; border: 1px solid #eee">
      <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
        <el-tree ref="tree" :data="treeNodeData" :props="defaultProps" :expand-on-click-node="false" default-expand-all @node-click="handleNodeClick">
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <span>
              <i />{{ node.label }}
            </span>
            <span v-if="data.type=='relDetail' || data.type=='filterShowNode'">
              <el-button type="text" size="mini" @click="() => deleteFolder(node, data)"><i class="el-icon-delete" /></el-button>
            </span>
          </span>
        </el-tree>
      </el-aside>
      <div ref="basicInfo" class="detail-form">
        <el-form ref="basicInfoForm" :model="form" :rules="basicInfoRules">
          <el-form-item label="模型名称" prop="modelName">
            <el-input v-model="form.modelName" />
          </el-form-item>
          <el-form-item label="业务分类">
            <el-input v-model="form.modelFolderName" :disabled="true" />
          </el-form-item>
          <el-form-item label="审计事项" prop="auditItemUuid">
            <el-select v-model="form.auditItemUuid" placeholder="请选择审计事项">
              <el-option label="审计事项一" value="1" />
              <el-option label="审计事项二" value="2" />
            </el-select>
          </el-form-item>
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
          <el-form-item label="审计思路">
            <el-input v-model="form.auditIdeas" type="textarea" />
          </el-form-item>
          <el-form-item label="参数条件">
            <el-input v-model="form.paramConditions" type="textarea" />
          </el-form-item>
        </el-form>
      </div>
      <div ref="modelDesign" style="display: none">
        <el-form ref="modelDesignForm" :model="form" label-width="150px" :rules="modelDesignRules">
          <el-form-item style="width: 400px" prop="sqlValue">
            <el-button type="primary" @click="getSqlObj(2)">图形化编辑器</el-button>
            <el-button type="primary" @click="openSqlEditor">SQL编辑器</el-button>
          </el-form-item>
          <el-dialog :fullscreen=true v-if="SQLEditorShow" :destroy-on-close="true" :append-to-body="true" :visible.sync="SQLEditorShow" title="SQL编辑器" width="80%" @close="sqlEditorCloseEvent">
            <SQLEditor ref="SQLEditor" v-if="SQLEditorShow" :sqlEditorParamObj="sqlEditorParamObj" :sqlValue="form.sqlValue"/>
            <div slot="footer">
              <el-button type="primary" @click="getSqlObj">保存</el-button>
              <el-button @click="">取消</el-button>
            </div>
          </el-dialog>
          <el-form-item label="模型SQL">
            <div id="sqlValueView"
                 style="height: 300px; overflow-y: auto; border: 1px solid #e0e0e0; margin-left: 30px; width: 100%; padding: 15px;"></div>
            <el-input  type="textarea" v-model="form.sqlValue" style="display: none;"/>
          </el-form-item>
        </el-form>
      </div>
      <div ref="paramDefaultValue" style="display: none">
        <p style="color:red;font-size:large">拖拽改变参数展示顺序</p>
        <div id="paramList">
          <el-table
            ref="paramData"
            :data="paramData"
            style="width: 100%"
          >
            <el-table-column prop="ammParamUuid" label="参数编号" width="180" />
            <el-table-column prop="paramName" label="参数名称" width="180" />
            <el-table-column prop="paramValue" label="参数默认值" width="180">
              <template slot-scope="scope">
                <v-runtime-template :template="scope.row.paramValue" />
              </template>
            </el-table-column>
            <el-table-column prop="description" label="参数描述" />
          </el-table>
        </div>
      </div>
      <div ref="modelResultOutputCol" style="display: none;">
        <p style="color:red;font-size:large">注意：只显示最后的结果列</p>
        <div style="height:476px;overflow:scroll">
          <el-table ref="columnData" :data="columnData" style="width: 100%">
            <el-table-column prop="outputColumnName" label="输出列名" width="180" />
            <el-table-column prop="" label="数据转码" width="80" />
            <el-table-column prop="columnName" label="是否显示" width="80">
              <template slot-scope="scope">
                <el-select v-model="scope.row.isShow" placeholder="是否显示" value="1">
                  <el-option label="是" :value="1" />
                  <el-option label="否" :value="0" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="columnName" label="对应业务字段" width="180">
              <template slot-scope="scope">
                <el-select v-model="scope.row.businessFieldUuid" value="-1">
                  <el-option
                    v-for="state in businessColumnSelect"
                    :key="state.uuid"
                    :value="state.uuid"
                    :label="state.name"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="columnName" label="别名" width="180">
              <template slot-scope="scope">
                <el-input v-model="scope.row.columnAlias" placeholder="请输入别名" />
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
      <div ref="relInfo" style="display: none">
        <p>在进行审计分析时，模型执行所生成的结果数据在业务逻辑上可能存着关联关系；而在模型的设计过程中，同样可能需要利用到其他模型的执行结果。因此，为了满足这种模型之间的互相利用、相互辅助的功能需求，系统允许用户对多个模型或sql进行关联。
          用户通过本功能来创建并维护模型间的关联关系，以满足多模型联合执行分析的业务需求。
          通过模型设计器，用户能够为当前的模型建立与其他可访问模型的关联关系，并将其分析结果引入到当前模型设计中。</p>
        <el-button style="float: right;position:sticky;top: 260px;" @click="createDetail">新建</el-button>
      </div>
      <div id="modelDetailDiv">
        <div v-for="(modelDetail,index) in modelDetails" :key="modelDetail.id" :ref="modelDetail.id" style="display: none">
          <ModelDetail ref="child" :columns="columnData" :data="modelDetail.data" :tree-id="modelDetail.id" @updateTreeNode="updateTreeNode" />
        </div>
      </div>
      <div ref="chartConfig" style="display: none">
        这是图表配置
      </div>
      <div ref="modelFilterShowParent" style="display: none">
        <p>条件显示能够根据用户所设定的条件及显示样式，对模型执行结果中满足条件的敏感数据或重要数据进行着色显示，使这些数据变的一目了然，
          以便审计人员对这些数据进行审计。</p>
        <p>条件显示设计器以表格的形式列举所有由用户设定的、将被应用于模型执行结果的显示条件及显示样式，用户可通过该列表对各个条件的属性进行快速查看。
          同时用户也可以对显示条件进行添加、修改、删除</p>
        <el-button style="float: right;position:sticky;top: 260px;" @click="createFilterShow">新建</el-button>
      </div>
      <div ref="filterShowDiv">
        <div v-for="(filterShow,index) in filterShows" :key="filterShow.id" :ref="filterShow.id" style="display: none">
          <ModelFilterShow ref="modelFilterSHowChild" :columns="columnData" :data="filterShow.data" :tree-id="filterShow.id" @updateTreeNode="updateTreeNode" />
        </div>
      </div>
    </el-container>
  </div>
</template>
<script>
import ModelDetail from '@/views/analysis/auditModel/modelDetail'
import ModelFilterShow from '@/views/analysis/auditModel/modelFilterShow'
import SQLEditor from '@/views/analysis/SQLEditor/index'
import VRuntimeTemplate from 'v-runtime-template'
import {getDictList} from '@/utils/index'
export default {
  name: 'EditModel',
  components: { ModelDetail, ModelFilterShow, VRuntimeTemplate, SQLEditor },
  props: ['openValue', 'operationObj'],
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
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      SQLEditorShow: false,
      paramData: [],
      paramValueModel: {},
      columnData: [],
      form: {
        modelName: '',
        modelFolderUuid: '',
        modelFolderName: '',
        auditItemUuid: '',
        riskLevelUuid: '',
        auditIdeas: '',
        paramConditions: '',
        sqlValue: ''
      },
      parammModelRel: {},
      sqlObj: {
        sqlValue: '',
        params: [],
        column: []
      },
      businessColumnSelect: [],
      columnTypeSelect: [],
      selectTreeNode: null,
      modelDetails: [],
      filterShows: [],
      newRelInfoValue:{},
      newFilterShowValue:{},
      sqlEditorParamObj:{},
      modelDetailIndex: 0,
      riskLeve:[],
      modelFilterShowIndex: 0,
      modelOriginalTable: [],
      modelChartSetup: {},
      currentSelectTreeNode: null,
      basicInfoRules: {
        modelName: [
          { type: 'string', required: true, message: '请输入模型名称', trigger: 'blur' }
        ],
        auditItemUuid: [
          { required: true, message: '请选择审计事项', trigger: 'change' }
        ],
        riskLevelUuid: [
          { type: 'string', required: true, message: '请选择风险等级', trigger: 'change' }
        ]
      },
      modelDesignRules: {
        sqlValue: [{ type: 'string', required: true, message: '请选择输入模型SQL', trigger: 'blur' }] }
    }
  },
  watch: {
    newRelInfoValue(newChild) {
      this.$nextTick(function(){
        this.handleNodeClick(newChild)
      })
    },
    newFilterShowValue(newChild){
      this.$nextTick(function(){
        this.handleNodeClick(newChild)
      })
    }
  },
  created() {
  },
  mounted() {
    this.initData()
    // 如果为2则反显要修改的数据
    if (this.operationObj.operationType == 2) {
      var model = this.operationObj.model
      this.displayData(model)
    }
  },
  methods: {
    /**
     *初始化数据
     */
    initData() {
      // 初始化模型分类数据
      this.selectTreeNode = this.openValue
      this.form.modelFolderUuid = this.openValue.id
      this.form.modelFolderName = this.openValue.label
      // 初始化业务字段列表
      const businessColumnSelect = [{ uuid: '1', name: '机构名称' }, { uuid: '2', name: '机构代码' }]
      this.businessColumnSelect = businessColumnSelect
      // 初始化字段类型
      const columnTypeSelect = [{ uuid: 'int', name: '数值' }, { uuid: 'varchar', name: '字符串' }, { uuid: 'date', name: '日期' }, { uuid: 'money', name: '金额' }]
      this.columnTypeSelect = columnTypeSelect
      //初始化风险等级
      this.riskLeve = getDictList('002002')
      //初始化审计事项
    },
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
      //todo 获取到参数的默认值，是个JSON，将JSON存入到数据库
      const paramData = this.$refs.paramData.data
      var paramIndex = 0
      for (let i = 0; i < paramData.length; i++) {
        // todo 处理参数的值，现在拿的还是html
        paramData[i].paramSort = ++paramIndex
      }
      this.form.parammModelRel = paramData
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
     *打开sql编辑器
     */
    openSqlEditor(){
      // 打开sql编辑器窗体
      this.SQLEditorShow = true
    },
    /**
     * 获取SQL编辑器或图形化编辑器编辑的sql等信息并展示到界面
     */
    getSqlObj(modelType) {
      let returnObj = this.$refs.SQLEditor.getSaveInfo();
      if(returnObj == undefined){
        return
      }
      //region 初始化SQL语句显示
      this.displaySQL(returnObj);
      //endregion
      console.log(returnObj);
      //转换参数格式 重置参数对象属性，因为SQL编辑器是移植的，因此兼容那边的数据格式，因此对数据格式进行转换
      let params = this.changeParamDataFormat(returnObj.params,1);
      //转换列格式 处理sql编辑器返回的列数据信息，拼接成该界面能识别的格式
      let column = this.changeColumnDataFormat(returnObj.columnNames,returnObj.columnTypes);
      //处理历史表
      let modelOriginalTable = this.changeOriginalTable(returnObj.modelOriginalTable);
      let sqlObj = {
        sqlValue:returnObj.sqlValue,
        params:params,
        column:column,
        modelChartSetup:returnObj.modelChartSetup,
        modelOriginalTable:modelOriginalTable
      };
/*      const sqlObj = {
        sqlValue: 'select * from AA_AUDIT_ITEM',
        column: [{ columnName: 'AUDIT_ITEM_UUID', columnType: 'varchar' }, { columnName: 'AUDIT_ITEM_NAME', columnType: 'varchar' }],
        params: [
          { ammParamUuid: '1', paramName: '参数一', description: '这是参数一的说明', paramValue: '<input value="haha"></input>' },
          { ammParamUuid: '2', paramName: '参数二', description: '这是参数二的说明', paramValue: '<select placeholder="是否显示" value="1">\n' +
              '                  <option label="是" :value="1" />\n' +
              '                  <option label="否" :value="0" />\n' +
              '                </select>' }],
        modelChartSetup: { chartJson: '哈哈哈哈' },
        modelOriginalTable: [{ originalTableName: '表1', executionType: '1' }, { originalTableName: '表2', executionType: '2' }]
      }*/
      this.form.sqlValue = sqlObj.sqlValue
      // 初始化默认参数
      //todo 在这初始化界面
      this.paramData = sqlObj.params
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
      this.SQLEditorShow = false
    },
    /**
     *相互转换param数据格式
     */
    changeParamDataFormat(paramObj,type){
      if(paramObj == undefined || paramObj == null){
        return;
      }
      if(type == 1){
        //SQL编辑器参数对象转编辑界面参数对象
        let params = [];
        for(let i = 0;i < paramObj.length;i++){
          let obj = {
            ammParamUuid:paramObj[i].moduleParamId,
            paramName:paramObj[i].name,
            copyParamId:paramObj[i].copyParamId,
            description:"",
            paramValue:""
          };
          params.push(obj);
        }
        return params;
      }
      else if(type == 2){
        //参数界面编辑对象转SQL编辑器参数对象
        var returnObj = {"arr" : []};
        for(let b = 0; b< paramObj.length;b++){
          let id = "{#"+paramObj[b].ammParamUuid+"#}";
          let name = paramObj[b].paramName;
          let moduleParamId = paramObj[b].linkParamUuid;
          let allowedNull = typeof paramObj[b].ammParamChoice.allowedNull != "undefined" ? paramObj[b].ammParamChoice.allowedNull : 1;
          var obj = {
            id : id,
            name : name,
            moduleParamId:moduleParamId,
            copyParamId:id,
            allowedNull:allowedNull
          };
          returnObj.arr.push(obj);
        }
        return returnObj;
      }
    },
    /**
     *转换列对象
     * @param columnNames 列名称
     * @param columnType 列类型
     */
    changeColumnDataFormat(columnNames,columnType){
      //[{ columnName: 'AUDIT_ITEM_UUID', columnType: 'varchar' }, { columnName: 'AUDIT_ITEM_NAME', columnType: 'varchar' }]
      let returnObj = []
      for (let i = 0;i < columnNames.length;i++){
        var obj = {
          columnName:columnNames[i],
          columnType:"varchar"
        }
        returnObj.push(obj)
      }
      return returnObj
    },
    /**
     * 转换列对象
     * @param originalTableObj 历史表对象
     */
    changeOriginalTable(originalTableObj){
      let resultObj = []
      for(let i = 0;i < originalTableObj.length;i++){
        let obj = {
          originalTableName:originalTableObj[i].tableName,
          executionType:originalTableObj[i].tableType
        }
        resultObj.push(obj)
      }
      return resultObj
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
      this.form.sqlValue = sqlStr
      $("#sqlValue").val();
      $("#sqlValueView").html(sql);
    },
    /**
     * 设置选中的树节点
     * @param node 节点
     */
    setSelectTreeNode(node) {
      this.selectTreeNode = this.openValue
      this.form.modelFolderUuid = this.openValue.id
      this.form.modelFolderName = this.openValue.label
    },
    /**
     * 创建模型详细
     */
    createDetail() {
      if (this.columnData.length == 0) {
        this.$message({ type: 'info', message: '请先编写SQL!' })
        return
      }
      ++this.modelDetailIndex
      const newChild = {
        id: 'rel' + this.modelDetailIndex,
        label: '关联' + this.modelDetailIndex,
        children: [],
        pid: 5,
        type: 'relDetail'
      }
      const treeNode = this.$refs.tree.getCurrentNode()
      treeNode.children.push(newChild)
      this.modelDetails.push({ id: 'rel' + this.modelDetailIndex, data: [] })
      this.newRelInfoValue = newChild
    },
    /**
     * 创建过滤条件显示
     */
    createFilterShow() {
      if (this.columnData.length == 0) {
        this.$message({ type: 'info', message: '请先编写SQL!' })
        return
      }
      ++this.modelFilterShowIndex
      const newChild = {
        id: 'filterShow' + this.modelFilterShowIndex,
        label: '条件显示' + this.modelFilterShowIndex,
        children: [],
        type: 'filterShowNode'
      }
      const treeNode = this.$refs.tree.getCurrentNode()
      treeNode.children.push(newChild)
      this.filterShows.push({ id: 'filterShow' + this.modelFilterShowIndex, data: [] })
      this.newFilterShowValue = newChild
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
      this.columnTypeSelect = []
      this.selectTreeNode = null
      this.modelDetails = []
      this.modelDetailIndex = 0
      this.filterShows = []
      this.paramData = []
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
      model.modelFolderName = this.openValue.label
      this.form = model
      // endregion
      // region 反显SQL显示
      let paramObj = this.changeParamDataFormat(model.parammModelRel,2)
      let returnObj = {};
      returnObj.params = paramObj.arr
      this.sqlEditorParamObj = paramObj
      returnObj.sqlValue = this.form.sqlValue
      this.displaySQL(returnObj)
      // endregion
      // region 反显参数默认值
      this.paramData = model.parammModelRel
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
        this.filterShows.push({ id: 'filterShow' + this.modelFilterShowIndex, data: model.resultFilterShow[i]})
      }
      // endregion
    },
    sqlEditorCloseEvent(){
      //sql编辑器关闭时候销毁数据
      this.SQLEditorShow = false;
    }
  }
}
</script>
