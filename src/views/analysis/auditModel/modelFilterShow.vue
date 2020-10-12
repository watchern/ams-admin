<template>
  <div>
    <p style="font-size:large;font-weight:bold">基本信息</p>
    <p style="color:silver;font-size:large">———————————————————————————</p>
    <el-container style="height: 450px;">
      <div id="hahaha" ref="basicInfo" style="float: left">
        <el-form ref="basicInfoForm" :model="form" label-width="90px" :rules="rules">
          <el-form-item label="名称" prop="filterName">
            <el-input v-model="form.filterName" @input="nameValueChange" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="form.filterMemo" type="textarea" />
          </el-form-item>
          <p style="font-size:large;font-weight:bold">条件展示设置</p>
          <p style="color:silver;font-size:large">———————————————————————————</p>
          <el-form-item label="过滤条件" prop="filterValue">
            <queryBuilder ref="queryBuilder" v-model="form.filterJson" :rules="queryRules" @sql="getSql" />
          </el-form-item>
          <el-form-item label="字体颜色">
            <Colorpicker v-model="form.fontColor" />
          </el-form-item>
          <el-form-item label="背景色">
            <Colorpicker v-model="form.backGroundColor" />
          </el-form-item>
        </el-form>
      </div>
      <el-button @click="test">哈哈哈哈</el-button>
    </el-container>
  </div>
</template>
<script>
import Colorpicker from '@/components/Ace/vue-color-picker/packages/color-picker/src/color-picker'
import queryBuilder from '@/components/Ace/vue-query-builder/src/VueQueryBuilder'
export default {
  name: 'ModelFilterShow',
  components: { Colorpicker, queryBuilder },
  props: ['columns', 'treeId','data'],
  data() {
    return {
      form: {
        filterName: '',
        filterMemo: '',
        filterJson: {},
        filterValue: '',
        colorJson: '',
        fontColor: '',
        backGroundColor: ''
      },
      queryRules: [],
      rules: {
        filterName: [{ type: 'string', required: true, message: '请输入名称', trigger: 'blur' }],
        filterValue: [{ type: 'string', required: true, message: '请输入过滤条件', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.setQueryBuilderColumn()
    this.setColor()
  },
  mounted() {
    this.initData()
  },
  methods: {
    /**
     *初始化数据
     */
    initData(){
/*      this.form: {
        filterName: '',
          filterMemo: '',
          filterJson: {},
        filterValue: '',
          colorJson: '',
          fontColor: '',
          backGroundColor: ''
      },*/
      // 如果数据不为0则证明是修改，需要反显数据
      if (this.data.length != 0) {
        //反显数据
        this.form.filterName = this.data.filterName;
        this.form.filterMemo = this.data.filterMemo;
        this.form.filterJson = JSON.parse(this.data.filterJson);
        this.form.filterValue = this.data.filterValue;
        //反显背景色和字体颜色
        let colorJson = JSON.parse(this.data.colorJson);
        this.form.fontColor = colorJson.fontColor
        this.form.backGroundColor = colorJson.backGroundColor
      }
    },
    getForm() {
      let verResult = false
      this.$refs['basicInfoForm'].validate((valid) => {
        if (valid) {
          verResult = valid
        }
      })
      if (!verResult) {
        const treeId = this.treeId
        return { verResult: false, treeId: treeId }
      }
      const fontColor = this.form.fontColor
      const backGroundColor = this.form.backGroundColor
      const colorJson = {
        fontColor: fontColor,
        backGroundColor: backGroundColor
      }
      this.form.colorJson = JSON.stringify(colorJson)
      this.form.filterJson = JSON.stringify(this.form.filterJson)
      return this.form
    },
    /**
       * 设置queryBuilder列
       */
    setQueryBuilderColumn() {
      const queryRules = []
      for (let i = 0; i < this.columns.length; i++) {
        const operators = this.getQueryBuilderOperators(this.columns[i])
        const obj = {}
        obj.type = 'text'
        obj.id = this.columns[i].outputColumnName
        obj.label = this.columns[i].outputColumnName
        obj.operators = operators
        queryRules.push(obj)
      }
      this.queryRules = queryRules
    },
    /**
       * 设置默认颜色
       */
    setColor() {
      this.form.fontColor = '#000000'
      this.form.backGroundColor = '#000000'
    },
    nameValueChange(value) {
      // 值改变同时更改树节点名称
      this.$emit('updateTreeNode', value)
    },
    getSql(sql) {
      this.form.filterValue = sql
      console.log(sql)
    },
    /**
       * 获取queryBuilder的过滤选项  只分两种，数值和字符串
       * @returns {string[]}
       */
    getQueryBuilderOperators(columnObj) {
      let operators = []
      if (columnObj.columnType.indexOf('varchar') != -1) {
        operators = ['=', '<>', 'like', 'not like']
      } else if (columnObj.columnType.indexOf('int') != -1 || columnObj.columnType.indexOf('number') != -1) {
        operators = ['=', '<>', '<', '<=', '>', '>=']
      }
      // 初始化querybuilder
      return operators
    },
    test() {
      console.log(this.$refs.queryBuilder)
      console.log(this.form)
      console.log(JSON.stringify(this.form.json))
      const sql = this.queryToSql(this.form.json)
      console.log(sql)
    },
    queryToSql(query) {
      debugger
      const sql = []
      const that = this
      const logicalOperator = query.logicalOperator
      const children = query.children
      children.forEach((child) => {
        const type = child.type
        if (type === 'query-builder-rule') {
          sql.push(child.query.rule)
          sql.push(child.query.operator)
          sql.push(child.query.value)
        } else {
          sql.push('(')
          sql.push(that.queryToSql(child.query))
          sql.push(')')
        }
        sql.push(logicalOperator)
      })
      sql.splice(sql.length - 1, sql.length)
      return sql.join(' ')
    }
  }
}
</script>
