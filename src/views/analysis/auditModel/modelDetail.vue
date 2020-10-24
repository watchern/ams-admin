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
            <el-select ref="relTypeSelect" v-model="form.relationType" placeholder="请选择关联类型" @change="relTypeSelectChange">
              <el-option label="关联模型" :value="1" />
              <el-option label="关联表" :value="2" />
            </el-select>
          </el-form-item>
          <div ref="relModelDivParent" style="display: none;">
            <el-form-item label="被关联模型">
              <el-select v-model="form.relationObjectUuid" value="-1" @change="relModelSelectChange">
                <el-option label="请选择" value="-1" />
                <el-option label="模型1" value="1" />
                <el-option label="模型2" value="2" />
              </el-select>
              <el-input></el-input>
            </el-form-item>
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
                        :label="state.ammParamName"
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
            <el-form-item label="被关联表" prop="relationObjectUuidTable">
              <el-select v-model="form.relationObjectUuid" value="-1" @change="relTableSelectChange">
                <el-option label="请选择" value="-1" />
                <el-option label="表1" value="1" />
                <el-option label="表2" value="2" />
              </el-select>
            </el-form-item>
            <div ref="relTableDiv" style="display: none">
              <el-button type="primary" size="mini" style="float: right" @click="addRelFilter(2)">添加</el-button>
              <el-table ref="relTable" :data="relTable" border fit highlight-current-row style="width: 100%;">
                <el-table-column label="关联表字段" width="200" align="center" prop="modelName">
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.relColumn" value="-1">
                      <el-option label="请选择" value="-1" />
                      <el-option
                        v-for="state in relTableColumn"
                        :key="state.columnUuid"
                        :value="state.columnUuid"
                        :label="state.columnName"
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
  </div>
</template>
<script>
export default {
  name: 'EditModel',
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
        modelDetailConfig: []
      },
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
          this.initModelTree()
          // 初始化完成树之后初始化被关联模型的参数
          this.relModelSelectChange(this.data.relationObjectUuid)
          // 初始化关联模型table
          this.relModelTable = this.data.modelDetailConfig
        }
        if (this.data.relationType == 2) {
          // 显示界面dom
          this.$refs.relTableDivParent.style = 'block'
          this.$refs.relTableDiv.style = 'block'
          this.initTableTree()
          this.relTableSelectChange(this.data.relationObjectUuid)
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
    relTableSelectChange(vId) {
      if (vId == -1) {
        this.$refs.relTableDiv.style.display = 'none'
      } else {
        // todo 获取选中表的列id，列名称等信息，具体等张闯
        var relTableColumn = [{ columnUuid: 'lie1', columnName: '列1' }, { columnUuid: 'lie2', columnName: '列2' }]
        this.relTableColumn = relTableColumn
        this.$refs.relTableDiv.style.display = 'block'
      }
    },
    /**
       * 关联类型下拉框改变事件
       */
    relTypeSelectChange(vId) {
      // 根据选择的类型来决定加载模型还是加载数据表
      if (vId == 1) {
        this.$refs.relTableDivParent.style.display = 'none'
        this.$refs.relModelDivParent.style.display = 'block'
        this.initModelTree()
        // 加载模型下拉树
      } else if (vId == 2) {
        this.$refs.relModelDivParent.style.display = 'none'
        this.$refs.relTableDivParent.style.display = 'block'
        this.initTableTree()
        // 加载数据表的下拉树
      }
    },
    initModelTree() {

    },
    initTableTree() {

    },
    /**
       * 删除表格指定行
       * @param index 要删除的索引
       * @param rows 要删除的数据数组
       */
    deleteRow(index, rows) {
      rows.splice(index, 1)
    },
    nameValueChange(value) {
      // 值改变同时更改树节点名称
      this.$emit('updateTreeNode', value)
    }
  }
}
</script>
