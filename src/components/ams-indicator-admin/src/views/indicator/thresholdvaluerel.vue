<template>
  <div class="app-container">
    <el-form class="detail-form" ref="info" :model="thresholdValueRelObj" :rules="basicInfoRules">
      <el-row>
        <el-col :span="23">
          <el-form-item label="阈值字段" prop="modelResultColumnName">
            <el-select v-model="thresholdValueRelObj.modelResultColumnName" style="width:100%">
              <el-option v-for="(data,num) in setThreasholdValueObj.columns" :key="data" :value="data" :label="data">
                {{data}}
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="运算符" prop="operator">
            <el-select v-model="thresholdValueRelObj.operator">
              <el-option v-for="(item,i) in operatorObj" :key="item.value" :label="item.name" :value="item.value">
                {{item.name}}
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="阈值名称" prop="thresholdValueName">
            <el-input v-model="thresholdValueRelObj.thresholdValueUuid" style="display: none" :disabled="true"/>
            <el-select v-model="thresholdValueRelObj.thresholdValueName" placeholder="请选择">
              <el-option :label="thresholdValueRelObj.thresholdValueName" :value="thresholdValueRelObj.thresholdValueName" style="height: auto">
                <thresholdvaluetree v-loading="loading" ref="thresholdvaluetree" @thresholdValueClick="setSelectTreeNode"></thresholdvaluetree>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-show="isShowThresholdValueObject">
        <el-col :span="23">
          <el-form-item label="关联阈值对象列" prop="thresholdValueObject">
            <el-select v-model="thresholdValueRelObj.thresholdValueObject" style="width:100%">
              <el-option v-for="(data,num) in setThreasholdValueObj.columns" :key="data" :value="data" :label="data">
                {{data}}
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item label="背景色" prop="backgroundColor">
            <Colorpicker v-model="thresholdValueRelObj.colorInfo.backgroundColor"></Colorpicker>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="字体颜色" prop="fontColor">
            <Colorpicker v-model="thresholdValueRelObj.colorInfo.fontColor"></Colorpicker>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-footer>
      <div style="float: right">
        <el-button type="primary" @click="getSaveObj">确定</el-button>
        <el-button type="primary" @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="clearThresholdValue">清除</el-button>
      </div>
    </el-footer>
  </div>
</template>
<script>
import Colorpicker from '../../lib/vue-color-picker/packages/color-picker/src/color-picker'
import thresholdvaluetree from '../../../../../views/analysis/thresholdvalue/thresholdvaluetree'
import {findThresholdValueById} from '../../../../../api/analysis/thresholdvalue'
export default {
  name:'ThresholdValueRel',
  components: { Colorpicker,thresholdvaluetree},
  props:['setThreasholdValueObj'],
  mounted() {
    if(this.setThreasholdValueObj.isDisplay){
      //反显数据
      this.thresholdValueRelObj = this.setThreasholdValueObj.thresholdValueRelObj
      if(this.thresholdValueRelObj.thresholdValue.thresholdValueType == 2){
        this.isShowThresholdValueObject = true
      }
      else{
        this.isShowThresholdValueObject = false
        this.thresholdValueRelObj.thresholdValueObject = ""
      }
    }
  },
  data() {
    return {
      thresholdValueRelObj:{
        //模型阈值主键
        modelThresholdValueUuid:'',
        //阈值主键
        thresholdValueUuid:'',
        //阈值名称
        thresholdValueName:"",
        //颜色信息
        colorInfo:{backgroundColor:'#000000',fontColor:'#000000'},
        //模型结果列名
        modelResultColumnName:'',
        //运算符 = >  >= < <=类似等等
        operator:'=',
        //阈值对象字段，当阈值类型为多值时该字段有值
        thresholdValueObject:'',
        //选择的关联的真正的阈值对象
        thresholdValue:{}
      },
      //是否显示关联阈值对象列
      isShowThresholdValueObject:false,
      operatorObj:[
        {value:'=',name:'等于'},
        {value:'>',name:'大于'},
        {value:'>=',name:'大于等于'},
        {value:'<',name:'小于'},
        {value:'<=',name:'小于等于'},
        {value:'startswith',name:'开头是'},
        {value:'endingwith',name:'结尾是'},
        {value:'like',name:'包含'},
        {value:'notlike',name:'不包含'},
      ],
      basicInfoRules:{
        modelResultColumnName: [
          {type: 'string', required: true, message: '请选择阈值字段', trigger: 'blur'}
        ],
        thresholdValueName: [
          {type: 'string',required: true, message: '请选择阈值', trigger: 'blur'}
        ],
        thresholdValueObject: [{required: true,type: 'string', validator:this.verValueMethods}]
      },
      loading:false
    }
  },
  methods: {
    verValueMethods(rule, value, callback){
      if(this.isShowThresholdValueObject){
        if(this.thresholdValueRelObj.thresholdValueObject === ""){
          callback(new Error('请选择阈值关联对象列'))
        }
        else{
          callback()
        }
      }
      else{
        callback()
      }
    },
    setSelectTreeNode(data){
      if(data.type==="folder"){
        this.$message({type:'info',message:'不能选择文件夹!'})
        return
      }
      this.loading = true
      this.thresholdValueRelObj.thresholdValueUuid = data.id
      this.thresholdValueRelObj.thresholdValueName = data.label
      findThresholdValueById(data.id).then(result=>{
        this.loading = false
        if(result.data != null){
          this.thresholdValueRelObj.thresholdValue = result.data
        }
        if(result.data.thresholdValueType == 2){
          this.isShowThresholdValueObject = true
        }
        else{
          this.isShowThresholdValueObject = false
          this.thresholdValueRelObj.thresholdValueObject = ""
        }
      })
      //获取到后调用后台取到全部对象
    },
    getSaveObj(){
      let verResult = false
      this.$refs['info'].validate((valid) => {
        if (valid) {
          verResult = true
        } else {
          return false;
        }
      });
      if(verResult){
        //校验通过  调用回调 设置值
        this.$emit("inSetThresholdValue",this.thresholdValueRelObj,this.setThreasholdValueObj.analysisRegionId)
        this.closeDialog()
      }
    },
    closeDialog(){
      this.$emit("closeThresholdValueRel")
    },
    clearThresholdValue(){
      this.$emit("clearThresholdValue",this.setThreasholdValueObj.analysisRegionId)
      this.$emit("closeThresholdValueRel")
    }
  }
}
</script>

<style>

</style>
