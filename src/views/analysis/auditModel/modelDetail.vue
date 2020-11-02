<template>
  <div>
    <p style="color:red;font-size:large">注意：只显示最后的结果列</p>
    <p style="font-size:large;font-weight:bold">基本信息</p>
    <p style="color:silver;font-size:large">———————————————————————————</p>
    <el-container style="height: 450px;">
      <div ref="basicInfo" style="float: left">
        <el-form ref="basicInfoForm" :model="form" label-width="90px" :rules="rules">
          <el-form-item label="名称" prop="modelDetailName">
            <el-input v-model="form.modelDetailName" @input="nameValueChange" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="form.modelDetailMemo" type="textarea" />
          </el-form-item>
          <p style="font-size:large;font-weight:bold">关联设置</p>
          <p style="color:silver;font-size:large">———————————————————————————</p>
          <el-form-item label="关联类型" prop="relationType">
            <el-col>
              <el-row :span="20">
                <el-select ref="relTypeSelect" v-model="form.relationType" placeholder="请选择关联类型" @change="relTypeSelectChange">
                  <el-option label="关联模型" :value="1" />
                  <el-option label="关联表" :value="2" />
                </el-select>
              </el-row>
            </el-col>
          </el-form-item>
          <div ref="relModelDivParent" style="display: none;">
            <el-row>
              <el-form-item label="被关联模型">
                <el-col :span="20">
                  <el-input v-model="form.relationObjectUuid" :disabled="true" />
                  <el-input v-model="form.relationObjectName" :disabled="true" />
                </el-col>
                <el-button @click="selectModel">选择</el-button>
              </el-form-item>
            </el-row>
            <div ref="relModelTableDiv" style="display: none">
              <el-button type="primary" size="mini" style="float: right" @click="addRelFilter(1)">添加</el-button>
              <el-table ref="relModelTable" :data="relModelTable" border fit highlight-current-row style="width: 100%;">
                <el-table-column label="原模型字段" width="200" align="center">
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.resultColumn" value="-1">
                      <el-option label="请选择" value="-1" />
                      <el-option
                        v-for="state in columns"
                        :key="state.outputColumnName"
                        :value="state.outputColumnName"
                        :label="state.outputColumnName"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="关联模型参数" width="170px" align="center">
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.ammParamUuid" value="-1">
                      <el-option label="请选择" value="-1" />
                      <el-option
                        v-for="state in relModelParam"
                        :key="state.ammParamUuid"
                        :value="state.ammParamUuid"
                        :label="state.paramName"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150px" align="center">
                  <template slot-scope="scope">
                    <el-button type="primary" size="mini" @click.native.prevent="deleteRow(scope.$index, relModelTable)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          <div ref="relTableDivParent" style="display: none;">
            <el-row>
              <el-form-item label="被关联表" prop="relationObjectUuidTable">
                <el-col :span="20">
                  <el-input v-model="form.relationObjectUuid" style="display: none" :disabled="true" />
                  <el-input v-model="form.relationObjectName" :disabled="true" />
                </el-col>
                <el-button @click="showDataTree">选择</el-button>
              </el-form-item>
            </el-row>
            <div ref="relTableDiv" style="display: none">
              <el-button type="primary" size="mini" style="float: right" @click="addRelFilter(2)">添加</el-button>
              <el-table ref="relTable" :data="relTable" border fit highlight-current-row style="width: 100%;">
                <el-table-column label="关联表字段" width="200" align="center" prop="modelName">
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.relColumn" value="-1">
                      <el-option label="请选择" value="-1" />
                      <el-option
                        v-for="state in relTableColumn"
                        :key="state.colMetaUuid"
                        :value="state.colMetaUuid"
                        :label="state.chnName"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="过滤条件" width="170px" align="center" prop="">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.relFilterValue" />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150px" align="center" prop="runTime">
                  <template slot-scope="scope">
                    <el-button type="primary" size="mini" @click.native.prevent="deleteRow(scope.$index, relTable)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-form>
      </div>
    </el-container>
    <el-dialog v-if="ModelTreeDialog" :destroy-on-close="true" :append-to-body="true" :visible.sync="ModelTreeDialog" title="请选择模型" width="80%">
      <ModelFolderTree ref="modelFolderTree" v-loading="modelTreeLoading" />
      <div slot="footer">
        <el-button type="primary" @click="getSelectModel">确定</el-button>
        <el-button @click="ModelTreeDialog = false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog v-if="dataTableTree" :destroy-on-close="true" :append-to-body="true" :visible.sync="dataTableTree" title="请选择数据表" width="80%">
      <data-tree ref="dataTableTree" v-loading="dataTableTreeLoading" />
      <div slot="footer">
        <el-button type="primary" @click="getDataTable">确定</el-button>
        <el-button @click="dataTableTree = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import dataTree from '@/views/data/role-res/data-tree'
import ModelFolderTree from '@/views/analysis/auditModel/modelFolderTree'
import { selectModel, getTableCol } from '@/api/analysis/auditModel'
export default {
  name: 'EditModel',
  components: { ModelFolderTree, dataTree },
  props: ['columns', 'treeId', 'data'],
  data() {
    return {
      form: {
        modelRelationUuid: '',
        modelUuid: '',
        modelDetailName: '',
        modelDetailMemo: '',
        relationType: '',
        relationObjectUuid: '',
        relationObjectName: '',
        modelDetailConfig: []
      },
      ModelTreeDialog: false,
      modelTreeLoading: false,
      dataTableTree: false,
      dataTableTreeLoading: false,
      relModelTable: [],
      relModelParam: [],
      relTable: [],
      relTableColumn: [],
      rules: {
        modelDetailName: [
          { type: 'string', required: true, message: '请输入详细名称', trigger: 'blur' }
        ],
        relationType: [
          { required: true, message: '请选择关联类型', trigger: 'change' }
        ]
        /*        relationObjectUuidModel: [
          { validator:verForm, trigger: 'change' }
        ],
        relationObjectUuidTable: [
          { validator:verForm, trigger: 'change' }
        ]*/
      }
    }
  },
  created() {
  },
  mounted() {
    this.initData()
  },
  methods: {
    /**
     * 初始化数据
     */
    initData() {
      if (this.data.length != 0) {
        // 如果数据不为0则证明是修改，需要反显数据
        this.form = this.data
        // 初始化关联详细配置
        if (this.data.relationType == 1) {
          // 显示界面dom
          this.$refs.relModelDivParent.style = 'block'
          this.$refs.relModelTableDiv.style = 'block'
          // 初始化完成树之后初始化被关联模型的参数
          this.loadParamInfo(this.data.relationObjectUuid)
          // 初始化关联模型table
          this.relModelTable = this.data.modelDetailConfig
        }
        if (this.data.relationType == 2) {
          // 显示界面dom
          this.$refs.relTableDivParent.style = 'block'
          this.$refs.relTableDiv.style = 'block'
          this.initTableTree()
          // 初始化关联表table
          this.relTable = this.data.modelDetailConfig
        }
      }
    },
    /**
     *获取要添加的对象
     */
    getObj() {
      var verResult = false
      this.$refs['basicInfoForm'].validate((valid) => {
        if (valid) {
          verResult = valid
        }
      })
      if (!verResult) {
        var treeId = this.treeId
        return { verResult: false, treeId: treeId }
      }
      // 组织关联详细的对象
      if (this.$refs.relTypeSelect.value == 1) {
        // 如果为关联模型则取模型表的数据
        this.form.modelDetailConfig = this.$refs.relModelTable.data
      } else if (this.$refs.relTypeSelect.value == 2) {
        // 如果为关联表则取表的数据
        this.form.modelDetailConfig = this.$refs.relTable.data
      }
      return this.form
    },
    /**
       * 添加关联条件
       * @param type 1、关联模型；2、关联表
       */
    addRelFilter(type) {
      if (type == 1) {
        this.relModelTable.push({})
      } else {
        this.relTable.push({})
      }
    },
    /**
       * 关联模型下拉框改变事件
       */
    relModelSelectChange(vId) {
      if (vId == -1) {
        this.$refs.relModelTableDiv.style.display = 'none'
      } else {
        // 加载选择模型的参数
        // todo 获取选中模型的关联参数
        var relModelParam = [{ ammParamUuid: 'canshu1', ammParamName: '參數1' }, { ammParamUuid: 'canshu2', ammParamName: '參數2' }]
        this.relModelParam = relModelParam
        this.$refs.relModelTableDiv.style.display = 'block'
      }
    },
    loadTableCol(data) {
      // 获取选中表的列id，列名称等信息
      getTableCol(data.id).then(result => {
        if (result.data == null) {
          this.$message({ type: 'info', message: '加载数据表列失败!' })
          return
        }
        debugger
        this.relTableColumn = result.data
        this.$refs.relTableDiv.style.display = 'block'
      })
    },
    /**
       * 关联类型下拉框改变事件
       */
    relTypeSelectChange(vId) {
      // 根据选择的类型来决定加载模型还是加载数据表
      if (vId == 1) {
        this.$refs.relTableDivParent.style.display = 'none'
        this.$refs.relModelDivParent.style.display = 'block'
        this.$refs.relTableDiv.style.display = 'none'
      } else if (vId == 2) {
        this.$refs.relModelDivParent.style.display = 'none'
        this.$refs.relTableDivParent.style.display = 'block'
        this.$refs.relModelTableDiv.style.display = 'none'
      }
      // 清空数据
      this.relTable = []
      this.relModelTable = []
      this.form.relationObjectName = ''
      this.form.relationObjectUuid = ''
    },
    /**
       * 删除表格指定行
       * @param index 要删除的索引
       * @param rows 要删除的数据数组
       */
    deleteRow(index, rows) {
      rows.splice(index, 1)
    },
    /**
     * 值改变同时更改树节点名称
     * @param value 改变的值
     */
    nameValueChange(value) {
      this.$emit('updateTreeNode', value)
    },
    /**
     * 关联模型选择模型窗体
     */
    selectModel() {
      this.ModelTreeDialog = true
    },
    /**
     * 获取模型选择窗体选择的数据
     */
    getSelectModel() {
      const modelTreeNode = this.$refs.modelFolderTree.getSelectNode()
      if (modelTreeNode.type != 'model') {
        this.$message({ type: 'info', message: '请选择模型!' })
        return
      }
      this.modelTreeLoading = true
      // 获取模型基本信息开始初始化能关联的参数
      this.loadParamInfo(modelTreeNode.id)
    },
    /**
     * 加载模型参数信息
     * @param modelUuid 模型编号
     */
    loadParamInfo(modelUuid) {
      selectModel(modelUuid).then(result => {
        this.modelTreeLoading = false
        if (result.data == null) {
          this.$message({ type: 'error', message: '获取模型信息失败!' })
          return
        }
        if (result.data.parammModelRel.length == 0) {
          this.$message({ type: 'info', message: '该模型没有参数,请重新选择!' })
          return
        }
        this.ModelTreeDialog = false
        // 初始化模型的参数
        this.relModelParam = result.data.parammModelRel
        // 设置对象
        this.form.relationObjectUuid = result.data.modelUuid
        this.form.relationObjectName = result.data.modelName
        this.$refs.relModelTableDiv.style = 'block'
      })
    },
    /**
     * 显示数据表树
     */
    showDataTree() {
      this.dataTableTree = true
    },
    getDataTable() {
      const dataTree = this.$refs.dataTableTree.getTree()
      const currentNode = dataTree.getCurrentNode()
      if (currentNode.type != 'table') {
        this.$message({ type: 'info', message: '请选择数据表!' })
        return
      }
      this.loadTableCol(currentNode)
      this.form.relationObjectName = currentNode.label
      this.form.relationObjectUuid = currentNode.id
      this.dataTableTree = false
    }
  }
}
</script>
