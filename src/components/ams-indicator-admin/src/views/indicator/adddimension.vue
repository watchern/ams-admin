<template>
    <el-container>
        <el-main>
            <el-form>
                <el-form-item label="维度名称">
                    <el-input id="dimensionName" v-model="form.dimensionName"></el-input>
                </el-form-item>
                <el-form-item label="维度表">
                    <el-input id="tableName" v-model="form.tableName" readonly="readonly"></el-input>
                </el-form-item>
                <el-form-item label="维度列">
                    <el-input id="colName" v-model="form.colName" readonly="readonly"></el-input>
                </el-form-item>
                <el-form-item label="维度说明">
                    <el-input type="textarea" id="dimensionMemo" v-model="form.dimensionMemo"></el-input>
                </el-form-item>
            </el-form>
        </el-main>
        <el-footer>
            <div style="float: right">
                <el-button type="primary" @click="saveDimension">保存</el-button>
                <el-button type="primary" @click="closeDialog">取消</el-button>
            </div>
        </el-footer>
    </el-container>
</template>
<script>
import request from '@/utils/request'
import $ from 'jquery'
import { Loading } from 'element-ui'
export default {
  name: 'addDimension',
  props: ['tableId','tableName','columnId','columnName','dimUUID'],
  components: {

	},
  data() {
    return {
        form: {
          dimensionName: '',
          tableName: '',
          columnName: '',
          dimensionMemo: ''
        },
        /**
         * 修改维度数据对象
         * @type {null}
         */
        editDimDataObj: null,

        /**
         * 1代表全行 2代表机构 3代表审计师(个人)
         * @type {number}
         */
        auditorOrauditorgan: 0
    }
  },
  mounted() {
      this.initData()
  },
  created() {
    this.clearData()
  },
  methods: {
    /**
     * 初始化数据
     */
    initData() {
        if(this.dimUUID == null) {//判断该id是否为空 如果为空则是新增  反之编辑
            this.form.tableName = this.tableName
            this.form.colName = this.columnName
        }
        else {
            this.initAntiDisplayData()
        }
    },
    /**
     * 保存维度
     */
    saveDimension() {
        if(this.dimUUID == null) {//判断该id是否为空 如果为空则是新增  反之编辑
            this.addDimensions()
        }
        else {
            this.editDimension()
        }
    },

    /**
     * 添加维度
     */
    addDimensions() {
        var that = this
        if(!this.vel()){
            return
        }
        var operation = this.getOperation()
        var data = {
            inDimensionUuid:"",
            dimensionName:this.form.dimensionName,
            dimensionMemo:this.form.dimensionMemo,
            createPersonName:"",
            dimensionTemporary:0,
            dimensionIsdeletetemp:0,
            createTime:"",
            updateTime:"",
            createPersonUuid:"",
            dimensionFormula:"",
            belongOrg:'',
            dimensionOperation:operation
        }
        var dimColumnData = {
            inDimColumnUuid:'',
            inDimensionUuid:'',
            tableUuid:this.tableId,
            columnUuid:this.columnId
        }
        var url = this.contextUrl + "/InDimension/insertSelective"
        $.post(url,{inDimension:JSON.stringify(data),inDimColumn:JSON.stringify(dimColumnData)},function (res) {
            if(res.state == true){
                that.$emit('addInTable',that.tableId)
                that.$emit('getAllDimension',that.tableId)
                that.$emit('getAllColumn',that.tableId)
                that.clearData()
                that.closeDialog()
            }
            else{
                that.$message(res.message)
            }
        },"json")
    },

    /**
     * 编辑维度时反显数据
     */
    initAntiDisplayData() {
        var that = this
        var dimUUID= this.dimUUID
        var url = this.contextUrl + "/InDimension/selectByPrimaryKey"
        $.post(url,{inDimensionUuid:dimUUID},function (res) {
            that.form.dimensionName = res.dimensionName
            that.form.tableName = res.tableName
            that.form.colName = res.columnName
            that.form.dimensionMemo = res.dimensionMemo
            // if(res.dimensionOperation == 1){
            //     radioClick("noting")
            // }
            // if(res.dimensionOperation == 2){
            //     $("#switch").attr("checked","checked")
            // }
            // if(res.dimensionOperation == 3){
            //     radioClick("split")
            // }
            that.editDimDataObj = res
        },"json")
    },
    /**
     * 修改维度
     */
    editDimension() {
        if(!this.vel()){
            return
        }
        var that = this
        var operation = this.getOperation()
        this.editDimDataObj.dimensionName = this.form.dimensionName
        this.editDimDataObj.dimensionMemo = this.form.dimensionMemo
        this.editDimDataObj.dimensionOperation = operation
        //因维度时间报错 所以注销维度创建时间和修改时间
        //editDimDataObj.createTime = new Date(editDimDataObj.createTime)
        //editDimDataObj.updateTime = new Date(editDimDataObj.updateTime)
        var url = this.contextUrl + "/InDimension/updateByPrimaryKeySelective"
        $.post(url,{inDimension:JSON.stringify(this.editDimDataObj)},function (res) {
            if(res.state == true) {
                that.$emit('getAllDimension',that.tableId)
                that.$emit('getAllColumn',that.tableId)
                that.clearData()
                that.closeDialog()
            }
            else {
                that.$message(res.message)
            }
        },"json")
    },

    /**
     * 获取单选按钮哪个选中
     * @returns {number} 返回选中的值
     */
    getOperation() {
        // var noting = $("#noting").attr("checked")
        // var switchs = $("#switch").attr("checked")
        // var split = $("#split").attr("checked")
        // if(noting == "checked"){
        //     return 1
        // }
        // if(switchs == "checked"){
        //     return 2
        // }
        // if(split == "checked"){
        //     return 3
        // }
        // return 1
        return null
    },

    /**
     * 设置radio的选中状态
     * @param id 要设置的编号
     */
    // radioClick(id) {
    //     $("#noting").removeAttr("checked")
    //     $("#switch").removeAttr("checked")
    //     $("#split").removeAttr("checked")
    //     $("#" + id).attr("checked","checked")
    // },

    /**
     * 关闭窗体
     */
    closeDialog() {
        this.$emit('closeDimension')
    },

    /**
     * 验证
     * @returns {boolean}
     */
    vel() {
        var dimName = this.form.dimensionName
        if(dimName.length > 50){
            this.$message("维度名称不允许超过50个字符！")
            return
        }
        var dimMemo = $("#dimensionMemo").text()
        if(dimMemo.length >2000){
            this.$message("维度描述不允许超过2000！")
            return
        }
         if( dimName == null || dimName.trim() == ""){
             this.$message("维度名称不允许为空！")
             return false
         }
         return true
    },
    clearData(){
      this.form = {
          dimensionName: '',
          tableName: '',
          columnName: '',
          dimensionMemo: ''
      }
      this.editDimDataObj = null
    }
  }
}
</script>
<style scoped>
>>>label {
        display: inline-block;
        width: 100px;
        text-align: right;
    }
</style>

