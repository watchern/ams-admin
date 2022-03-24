<template>
  <div>
    <p style="font-size:large;font-weight:bold">基本信息</p>
    <!-- <p style="color:silver;font-size:large">———————————————————————————</p> -->
    <p style="border-top:2px solid silver;width:100%;height:0px;margin:5px;"></p>
    <el-container style="height: 450px;">
      <div ref="basicInfo" style="float: left">
        <el-form ref="basicInfoForm" :model="form" :rules="rules" class="detail-form" :disabled="isBanEdit">
          <el-form-item label="名称" prop="filterName">
            <el-input v-model="form.filterName" @input="nameValueChange" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="form.filterMemo" type="textarea" />
          </el-form-item>
          <p style="font-size:large;font-weight:bold">条件展示设置</p>
          <!-- <p style="color:silver;font-size:large">———————————————————————————</p> -->
          <p style="border-top:2px solid silver;width:100%;height:0px;margin:5px;"></p>
          <el-row>
            <el-form-item label="过滤条件" prop="filterValue">
              <el-col :span="20">
                <el-input v-model="form.filterValue" :disabled="true" />
              </el-col>
              <el-button @click="showQueryBuilder" type="primary">设置</el-button>
            </el-form-item>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="字体颜色">
                <Colorpicker v-model="form.fontColor" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="背景色">
                <Colorpicker v-model="form.backGroundColor" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-container>
    <el-dialog title="条件设置" :close-on-click-modal="false" :visible.sync="queryBuilderDialogVisible" width="30%" :append-to-body="true">
      <myQueryBuilder
        v-if="queryBuilderDialogVisible"
        ref="myQueryBuilder"
        :columns="queryRules"
        :data="form.queryBuilderJson"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="queryBuilderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="queryCondition">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import Colorpicker from '@/components/public/vue-color-picker/packages/color-picker/src/color-picker'
import myQueryBuilder from '@/views/analysis/auditmodelresult/myquerybuilder'
export default {
  name: 'ModelFilterShow',
  components: { Colorpicker, myQueryBuilder },
  props: ['columns', 'treeId', 'data','operationtype'],
  data() {
    return {
      form: {
        filterName: '',
        filterMemo: '',
        filterJson: '',
        filterValue: '',
        colorJson: '',
        fontColor: '',
        backGroundColor: '',
        queryBuilderJson: {}
      },
      isBanEdit:false,
      queryRules: {},
      queryBuilderDialogVisible: false,
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
    initData() {
      // 如果数据不为0则证明是修改，需要反显数据
      if (this.data.length != 0) {
        // 反显数据
        this.form.filterName = this.data.filterName
        this.form.filterMemo = this.data.filterMemo
        this.form.queryBuilderJson = JSON.parse(this.data.filterJson)
        this.form.filterValue = this.data.filterValue
        // 反显背景色和字体颜色
        const colorJson = JSON.parse(this.data.colorJson)
        this.form.fontColor = colorJson.fontColor
        this.form.backGroundColor = colorJson.backGroundColor
        //判断是查看还是编辑
        if(this.operationtype == 3){
          this.isBanEdit = true
        }
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
      this.form.filterJson = JSON.stringify(this.form.queryBuilderJson)
      return this.form
    },
    /**
       * 设置queryBuilder列
       */
    setQueryBuilderColumn() {
      const queryRules = []
      for (let i = 0; i < this.columns.length; i++) {
        const obj = {}
        obj.columnType = this.columns[i].columnType
        obj.columnName = this.columns[i].outputColumnName
        queryRules.push(obj)
      }
      this.queryRules.columnList = queryRules
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
    },
    showQueryBuilder() {
      this.queryBuilderDialogVisible = true
    },
    queryCondition() {
      const obj = this.$refs.myQueryBuilder.getSelectSql()
      this.form.filterValue = obj.sql
      this.form.queryBuilderJson = obj.queryJson
      this.queryBuilderDialogVisible = false
    }
  }
}
</script>
