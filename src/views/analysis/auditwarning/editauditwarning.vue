<template>
  <div class="app-container" v-loading="isShowLoading">
    <el-dialog title="选择模型列表" v-if='selectModelVisible' :visible.sync="selectModelVisible" :append-to-body="true" width="80%">
      <SelectModels ref="selectModels" power="warning"/>
      <div slot="footer" class="dialog-footer">
        <el-button @click="selectModelVisible = false">关闭</el-button>
        <el-button type="primary" @click="selectModel">确定</el-button>
      </div>
    </el-dialog>
    <el-tabs v-model="tabShow">
      <el-tab-pane label="基本信息" name="baseInfo">
        <el-form ref="baseDataForm" :rules="rules" class="detail-form" :model="temp" :disabled="allReadOnly" >
          <el-form-item label="预警名称" prop="warningName" >
            <el-input v-model="temp.warningName"  />
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item label="预警类型" >
                <el-select v-model="temp.warningType" placeholder="请选择预警类型" >
                  <el-option label="模型" :value="1"></el-option>
                  <el-option label="指标" :value="2"></el-option>
                </el-select>
              </el-form-item> 
            </el-col>
            <el-col :span="12">
              <el-form-item  label="结果保存地址">
                <el-input  class="el-input-z" readonly="readonly" v-model="this.auditWarningSave.locationName"/>
                <span class="btn-z" @click="modelResultSavePathDialog = true">选择</span>   
              </el-form-item>
            </el-col>
          </el-row>

          
          
          <el-form-item label="关联模型" v-if="temp.warningType == 1">
            <el-row>
              <el-col align="right">
                <el-link type="primary" v-if="!allReadOnly" @click="selectModelVisible = true">选择模型</el-link>
              </el-col>
            </el-row>
            <el-table key="modelList" v-loading="modelListLoading" ref="modelListTable" align="center" :data="temp.modelList" border fit highlight-current-row>
              <el-table-column label="模型名称"  prop="modelName" />
              <el-table-column label="平均运行时间"  prop="runTime" />
              <el-table-column label="模型类型"  prop="modelType" :formatter="modelTypeFormatter" />
              <el-table-column label="审计事项"  prop="auditItemName" />
              <el-table-column
                v-if="!allReadOnly"
                label="操作"
                prop="auditItemName">
                <template slot-scope="scope">
                  <el-link
                    type="primary"
                    @click.native.prevent="deleteModel(scope.$index, temp.modelList)">
                    删除
                  </el-link>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item label="关联指标" v-if="temp.warningType == 2">
            <el-table key="indexList" ref="indexListTable" align="center" :data="temp.indexList" border fit highlight-current-row>
              <el-table-column label="指标名称"  prop="modelName" />
              <el-table-column label="平均运行时间"  prop="runTime" />
              <el-table-column label="指标类型"  prop="modelType" :formatter="modelTypeFormatter" />
              <el-table-column label="审计事项"  prop="auditItemName" />
            </el-table>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="执行信息" name="executeInfo">
        <el-form ref="executeDataForm" :rules="rules" class="detail-form" :model="temp" :disabled="allReadOnly" >
          <el-form-item label="执行方式" >
            <el-select v-model="temp.executeMode" placeholder="请选择执行方式">
              <el-option label="单次执行" :value="1"></el-option>
              <el-option label="多次执行" :value="2"></el-option>
              <el-option label="周期执行" :value="3"></el-option>
            </el-select>
          </el-form-item>
          <!--单次执行时间选择-->
          <el-form-item label="执行时间" v-if="temp.executeMode == 1" prop="singleExecuteTime">
            <el-date-picker
              v-model="temp.singleExecuteTime"
              type="datetime"
              placeholder="选择执行时间"
              align="right"
              :picker-options="executeTimeOptions">
            </el-date-picker>
          </el-form-item>
          <!--多次执行时间选择-->
          <el-form-item label="多次执行时间" v-if="temp.executeMode == 2"  >
            <el-form-item label="" v-for="(domain, index) in temp.manyTimesExecuteTime" :prop="'manyTimesExecuteTime.' + index + '.executeTime'" :rules="rules.manyTimesExecuteTime.executeTime">
              <el-date-picker
                type="datetime"
                v-model="domain.executeTime"
                placeholder="选择多次执行时间"
                align="right"
                :picker-options="executeTimeOptions">
              </el-date-picker>
              <!--<el-button type="primary" v-if="index==0" @click="addExecuteTime">添加</el-button>-->
              <el-link type="primary" v-if="index==0" @click="addExecuteTime">添加&nbsp;</el-link>
              <el-link type="primary" v-if="temp.manyTimesExecuteTime.length > 1" @click="removeExecuteTime(domain)">删除</el-link>
              <!--<el-button type="primary" v-if="temp.manyTimesExecuteTime.length > 1" @click="removeExecuteTime(domain)">删除</el-button>-->
            </el-form-item>
          </el-form-item>
          <!--周期执行时间配置选择-->
          <el-form-item label="" v-if="temp.executeMode == 3"  >
            <el-form-item label="执行周期设置" >
              <el-select v-model="temp.intervalExecuteTime.intervalType" placeholder="请选择执行周期">
                <el-option label="每天" :value="1"></el-option>
                <el-option label="每周" :value="2"></el-option>
                <el-option label="每月" :value="3"></el-option>
                <el-option label="每年" :value="4"></el-option>
              </el-select>
            </el-form-item>
            <!--周期执行每周-->
            <el-form-item label="" v-if="temp.intervalExecuteTime.intervalType == 2"  >
              <el-checkbox-group v-model="temp.intervalExecuteTime.weekValue">
                <el-checkbox :label=1>星期一</el-checkbox>
                <el-checkbox :label=2>星期二</el-checkbox>
                <el-checkbox :label=3>星期三</el-checkbox>
                <el-checkbox :label=4>星期四</el-checkbox>
                <el-checkbox :label=5>星期五</el-checkbox>
                <el-checkbox :label=6>星期六</el-checkbox>
                <el-checkbox :label=7>星期日</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <!--周期执行每月-->
            <el-form-item label="" v-for="(domain, index) in temp.intervalExecuteTime.monthValue" v-if="temp.intervalExecuteTime.intervalType == 3"  >
              第 <el-input-number v-model="domain.value"  :min="1" :max="31">
                </el-input-number> 天
              <el-link type="primary" v-if="index==0 && !allReadOnly" @click="addMonth">添加 &nbsp;</el-link>
              <el-link type="primary" v-if="temp.intervalExecuteTime.monthValue.length > 1  && !allReadOnly" @click="removeMonth(domain)">删除</el-link>
            </el-form-item>
            <!--周期执行每年-->
            <el-form-item label="" v-for="(domain, index) in temp.intervalExecuteTime.monthDayValue" v-if="temp.intervalExecuteTime.intervalType == 4"  >
              第 <el-select v-model="domain.month" placeholder="请选择执行周期">
                  <el-option label="1月" :value="1"></el-option>
                  <el-option label="2月" :value="2"></el-option>
                  <el-option label="3月" :value="3"></el-option>
                  <el-option label="4月" :value="4"></el-option>
                  <el-option label="5月" :value="5"></el-option>
                  <el-option label="6月" :value="6"></el-option>
                  <el-option label="7月" :value="7"></el-option>
                  <el-option label="8月" :value="8"></el-option>
                  <el-option label="9月" :value="9"></el-option>
                  <el-option label="10月" :value="10"></el-option>
                  <el-option label="11月" :value="11"></el-option>
                  <el-option label="12月" :value="12"></el-option>
                </el-select> 月
              第 <el-input-number v-model="domain.day"  :min="1" :max="31">
                </el-input-number> 天
              <el-link type="primary" v-if="index==0 && !allReadOnly" @click="addMonthDay">添加&nbsp;</el-link>
              <el-link type="primary" v-if="temp.intervalExecuteTime.monthDayValue.length > 1  && !allReadOnly" @click="removeMonthDay(domain)">删除</el-link>
            </el-form-item>
            <el-form-item label="执行时间设置" prop="intervalExecuteTime.executeTime" :rules="rules.singleExecuteTime" >
              <el-time-picker
                v-model="temp.intervalExecuteTime.executeTime"
                format='HH:mm'
                value-format="HH:mm"
                :picker-options="{
                  selectableRange: '00:00:00 - 23:59:00'
                }"
                placeholder="请输入执行时间">
              </el-time-picker>
            </el-form-item>
            <!--暂时去掉开始和结束时间-->
            <el-form-item label="开始结束日期" v-show="false" >
              <el-date-picker
                :picker-options="executeTimeOptions"
                v-model="temp.intervalExecuteTime.rangeTime"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
              </el-date-picker>
            </el-form-item>
          </el-form-item>
          <!--周期执行时间配置选择end-->
          <!--模型参数配置-->
          <el-form-item label="模型参数配置" v-show="temp.warningType == 1" >
            <paramDraw v-for="(domain, index) in temp.modelList" v-if="domain.paramObj != undefined && domain.paramObj.length > 0" :myId="domain.modelUuid" :ref="'paramDrawRef'+domain.modelUuid"/>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      title="选择模型结果保存路径"
      :visible.sync="modelResultSavePathDialog"
      width="30%"
      :append-to-body="true"
    >
      <data-tree
        :data-user-id="personCode"
        :scene-code="sceneCode"
        :tree-type="treeType"
        @node-click="handleClick"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="modelResultSavePathDialog = false">取 消</el-button>
        <el-button type="primary" @click="modelResultSavePathDetermine"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import SelectModels from '@/views/analysis/auditmodel/index'
import {findModelsWithParam, getWarningById} from '@/api/analysis/auditwarning'
import {getOneDict} from "@/utils"
import paramDraw from '@/views/analysis/modelparam/paramdraw'
import {replaceNodeParam } from '@/api/analysis/auditparam'
import dataTree from "@/views/data/role-res/data-tree";
export default {
  name:"editAuditWarning",
  components: { SelectModels, paramDraw , dataTree},
  props: {
    //操作类型 add添加 update更新 detail详情查看
    option : {
      required: true,
      type: String
    },
    //操作对象uuid
    optionUuid : {
      type: String
    }
  },
  data() {
    return {
      //关联模型列表loading
      modelListLoading : false,
      //Tab标签页显示名称
      tabShow : "baseInfo",
      //全局只读 在查看详情时=true
      allReadOnly : false,
      //组件loading是否展现
      isShowLoading:false,
      //单次/多次/周期执行的周期开始结束时间 执行时间选择配置
      executeTimeOptions:{
        disabledDate(time){
          //不能选择小于当前日志的事件
          return new Date(time.toLocaleDateString()) < new Date(new Date().toLocaleDateString())
        }
      },
      //表单数据
      temp: {
        //预警名称
        warningName : "",
        //预警类型1、模型；2、指标
        warningType : 1,
        //执行方式 默认位1 1单次 2多次 3周期
        executeMode : 1,
        //单次执行时间
        singleExecuteTime: '',
        //多次执行时间关联
        manyTimesExecuteTime:[{
          //多次执行的执行时间
          executeTime:''
        }],
        //周期执行时间关联
        intervalExecuteTime:{
          //周期执行的执行时间
          executeTime : '',
          //周期的起始时间，用于绑定日期选择
          rangeTime:[new Date(),new Date()],
          //周期执行的开始时间
          startTime : '',
          //周期执行的结束时间
          endTime : '',
          //周期类型 1、每天；2、每周；3、每月；4、每年
          intervalType : 1,
          //每周执行时间
          weekValue : [],
          //每月执行时间
          monthValue : [{
            value:''
          }],
          //每年执行时间
          monthDayValue : [{
            month : '',
            day : ''
          }]
        },
        //模型列表
        modelList:[],
        //指标列表
        indexList:[]
      },
      //是否显示选择模型列表
      selectModelVisible : false,
      //表单校验规则
      rules:{
        warningName : {
          required : true,
          message : "请输入预警名称"
        },
        singleExecuteTime:{
          required : true,
          message : "请输入执行时间"
        },
        manyTimesExecuteTime : {
          executeTime:{
            required : true,
            message : "请输入多次执行时间"
          }
        }
      },
      //提交表单时对应后端的AuditWarning
      auditWarningSave:{
        //审计预警主键
        auditWarningUuid : "",
        //预警名称
        warningName : "",
        //预警类型1、模型；2、指标
        warningType : '',
        //执行方式 默认位1 1单次 2多次 3周期
        executeMode : "",
        //创建人名称
        createUserName:'',
        //创建人uuid
        createUserUuid:'',
        //修改人名称
        updateUserName:'',
        //修改人uuid
        updateUserUuid:'',
        //创建时间
        createTime:'',
        //修改时间
        updateTime:'',
        //是否删除
        isDeleted:'',
        //预警任务关联表
        warningTaskRel:[],
        //预警执行时间关联表
        warningExecuteTime:[],
        //保存结果位置编号
        locationUuid:'',
        //保存结果文件夹名称
        locationName:''
      },
      //已经初始化参数的模型
      initedParamModel:[],
      modelResultSavePathDialog: false,
      tempPath:'',
      tempId:'',
      nodeType:'',
      SavePath:'选择模型结果保存路径',
      personCode: this.$store.state.user.code,
      sceneCode: "auditor",
      treeType: "save",
    }
  },
  created() {
    //添加则不做任何操作
    if(this.option == "add"){
      return;
    }
    //更新和详情情况下 没有主键 则报错
    if( (this.option == "detail" || this.option == "update") && !this.optionUuid){
      this.$message({
        type: 'error',
        message: '预警详情获取主键失败!'
      })
      return;
    }
    //详情页全部只读
    if(this.option == "detail"){
      this.allReadOnly = true
    }
    this.isShowLoading = true
    //加载审计预警对象
    getWarningById(this.optionUuid).then(resp => {
      if(resp.code !== 0 ){
        this.$message({
          type: 'error',
          message: '加载审计预警详情失败!'
        })
        return;
      }
      this.auditWarningSave = resp.data
      //将后端存储对象转换为前端展现对象
      this.temp.warningName = this.auditWarningSave.warningName
      this.temp.warningType = this.auditWarningSave.warningType
      this.temp.executeMode = this.auditWarningSave.executeMode
      this.temp.locationUuid = this.auditWarningSave.locationUuid
      this.temp.locationName = this.auditWarningSave.locationName
      //单次执行
      if(this.auditWarningSave.executeMode == 1){
        this.temp.singleExecuteTime = this.auditWarningSave.warningExecuteTime[0].executeTime
        //多次执行
      }else if(this.auditWarningSave.executeMode == 2){
        this.temp.manyTimesExecuteTime = this.auditWarningSave.warningExecuteTime
        //周期执行
      }else if(this.auditWarningSave.executeMode == 3){
        let executeTime = new Date(this.auditWarningSave.warningExecuteTime[0].executeTime)
        this.temp.intervalExecuteTime.executeTime = executeTime.getHours() + ":" + executeTime.getMinutes()
        this.temp.intervalExecuteTime.rangeTime = [this.auditWarningSave.warningExecuteTime[0].startTime,this.auditWarningSave.warningExecuteTime[0].endTime]
        this.temp.intervalExecuteTime.startTime = this.auditWarningSave.warningExecuteTime[0].startTime
        this.temp.intervalExecuteTime.endTime = this.auditWarningSave.warningExecuteTime[0].endTime
        this.temp.intervalExecuteTime.intervalType = this.auditWarningSave.warningExecuteTime[0].intervalType
          //每周
          if(this.temp.intervalExecuteTime.intervalType == "2"){
            for(let w of this.auditWarningSave.warningExecuteTime[0].warningIntervalDetail){
              this.temp.intervalExecuteTime.weekValue.push(w.weekValue)
            }
            //每月
          }else if(this.temp.intervalExecuteTime.intervalType == "3"){
            this.temp.intervalExecuteTime.monthValue = []
            for(let m of this.auditWarningSave.warningExecuteTime[0].warningIntervalDetail){
              this.temp.intervalExecuteTime.monthValue.push({
                value:m.monthValue
              })
            }
            //每年
          }else if(this.temp.intervalExecuteTime.intervalType == "4"){
            this.temp.intervalExecuteTime.monthDayValue = []
            for(let m of this.auditWarningSave.warningExecuteTime[0].warningIntervalDetail){
              this.temp.intervalExecuteTime.monthDayValue.push({
                month : m.monthValue,
                day : m.dayValue,
              })
            }
          }
      }
      //模型则组织模型数据
      if(this.auditWarningSave.warningType == "1"){
        //组织模型列表
        for(let taskRef of this.auditWarningSave.warningTaskRel){

          if(!taskRef.settingInfo){
            continue
          }
          let settingInfo = JSON.parse(taskRef.settingInfo)
          taskRef.sqlValue = settingInfo.sql
          taskRef.modelUuid = taskRef.sourceUuid
          if(!settingInfo.paramsArr){
            this.temp.modelList.push(taskRef)
            continue
          }
          //有参数配置信息则转换为json对象
          taskRef.paramObj = settingInfo.paramsArr
          this.temp.modelList.push(taskRef)
        }

      }
      //加载完成 去掉loading
      this.isShowLoading = false
    })

  },
  watch:{
    //监听执行方式改变
    'temp.executeMode' : function(newValue, oldValue){

    },
    //监听周期的起始时间
    'temp.intervalExecuteTime.rangeTime' : function(newValue, oldValue){
      //获取最新时间段
      if(newValue && newValue.length === 2){
        this.temp.intervalExecuteTime.startTime = newValue[0]
        this.temp.intervalExecuteTime.endTime = newValue[1]
      }
    },
    'temp.modelList':function(newValue, oldValue){
      this.$nextTick(function(){
        //页签添加完成后初始化新界面的参数
        for(let model of this.temp.modelList){
          //是否已经创建
          let isCreated = false
          //过滤掉已经创建参数关联的模型
          for(let old of this.initedParamModel){
            if(old.modelUuid == model.modelUuid){
              isCreated = true
              continue
            }
          }
          if(isCreated){
            continue
          }
          if(model.paramObj && model.paramObj.length > 0){
            this.initedParamModel.push(model)
            this.$refs["paramDrawRef"+model.modelUuid][0].initParamHtmlSS(model.sqlValue, model.paramObj, model.modelName, model.modelUuid)
          }
        }
      })
    }

  },
  methods: {

    //将前端表单数据转换为要保存的后端对象
    formToSaveObj(){
      this.auditWarningSave.warningName = this.temp.warningName
      this.auditWarningSave.warningType  = this.temp.warningType
      this.auditWarningSave.executeMode  = this.temp.executeMode
      this.auditWarningSave.warningExecuteTime = []
      //单次执行
      if(this.temp.executeMode == 1){
        let singleExecuteTime = {}
        singleExecuteTime.executeTime = this.temp.singleExecuteTime
        //与审计预警表关联字段
        singleExecuteTime.auditWarningUuid = this.auditWarningSave.auditWarningUuid
        this.auditWarningSave.warningExecuteTime.push(singleExecuteTime)
        //多次执行
      }else if(this.temp.executeMode == 2){
        for(let obj of this.temp.manyTimesExecuteTime){
          //与审计预警表关联字段
          obj.auditWarningUuid = this.auditWarningSave.auditWarningUuid
        }
        this.auditWarningSave.warningExecuteTime = this.temp.manyTimesExecuteTime
        //周期执行
      }else if(this.temp.executeMode == 3){
        let warningExecuteTime = {}
        warningExecuteTime.intervalType = this.temp.intervalExecuteTime.intervalType
        warningExecuteTime.executeTime = new Date("1999-01-01 " + this.temp.intervalExecuteTime.executeTime)
        warningExecuteTime.startTime = this.temp.intervalExecuteTime.startTime
        warningExecuteTime.endTime = this.temp.intervalExecuteTime.endTime
        //与审计预警表关联字段
        warningExecuteTime.auditWarningUuid = this.auditWarningSave.auditWarningUuid
        //每周
        if(warningExecuteTime.intervalType == 2){
          warningExecuteTime.warningIntervalDetail = []
          for(let week of this.temp.intervalExecuteTime.weekValue){
            warningExecuteTime.warningIntervalDetail.push({ weekValue:week})
          }
          //每月
        }else if(warningExecuteTime.intervalType == 3){
          warningExecuteTime.warningIntervalDetail = []
          for(let month of this.temp.intervalExecuteTime.monthValue){
            warningExecuteTime.warningIntervalDetail.push({monthValue:month.value})
          }
          //每年
        }else if(warningExecuteTime.intervalType == 4){
          warningExecuteTime.warningIntervalDetail = []
          for(let monthDay of this.temp.intervalExecuteTime.monthDayValue){
            warningExecuteTime.warningIntervalDetail.push({monthValue:monthDay.month, dayValue:monthDay.day})
          }
        }
        this.auditWarningSave.warningExecuteTime.push(warningExecuteTime)
      }
      this.auditWarningSave.warningTaskRel = []
      //模型参数关联
      if(this.auditWarningSave.warningType == 1){
        //获取模型参数配置
        for(let model of this.temp.modelList){
          let taskRel = {
            //与审计预警表关联字段
            auditWarningUuid : this.auditWarningSave.auditWarningUuid,
            sourceUuid : model.modelUuid,
            //模型版本号
            modelVersion : model.modelVersion,
            settingInfo : JSON.stringify({sql:model.sqlValue})
          }
          //没参数直接添加
          if(!model.paramObj || model.paramObj.length == 0){
            this.auditWarningSave.warningTaskRel.push(taskRel)
            continue
          }
          taskRel.settingInfo = JSON.stringify(this.getModelParamById(model))
          this.auditWarningSave.warningTaskRel.push(taskRel)
        }
      }

    },
    //从参数组件中获取模型配置的参数信息
    getModelParamById(model){
      if(!model){
        return {};
      }
      let param = replaceNodeParam(model.modelUuid)
      //模型的参数数组
      let paramObj = model.paramObj
      for (let i = 0;i < paramObj.length;i++){
        for (let j = 0;j < param.paramsArr.length;j++){
          if(paramObj[i].moduleParamId == param.paramsArr[j].moduleParamId){
            //如果母参相等说明是同一个参数，将输入的值替换到里面
            paramObj[i].paramValue = param.paramsArr[j].paramValue
          }
        }
      }
      return {sql:param.sql,paramsArr:model.paramObj}
    },

    //删除模型
    deleteModel(index, rows) {
      rows.splice(index, 1);
    },
    //选择模型
    selectModel(){
      let models = this.$refs['selectModels'].getModelListCheckData()
      if(models && models.length >0){
        this.selectModelVisible = false
        let modelUuids = []
        for(let model of models){
          modelUuids.push(model.modelUuid)
        }
        this.modelListLoading = true
        findModelsWithParam(modelUuids).then(result => {
          this.modelListLoading = false
          if(result.code !== 0){
            this.$message({
              type: 'error',
              message: '请求参数信息失败!'
            })
            return
          }
          for(let obj of result.data){
            //没有参数的模型不转换参数
            if(obj.parammModelRel.length == 0){
              continue
            }
            obj.paramObj = []
            for(let param of obj.parammModelRel){
              if(param.paramValue === ""){
                continue
              }
              obj.paramObj.push(JSON.parse(param.paramValue))
            }
          }

          this.temp.modelList = this.temp.modelList.concat(result.data)
        })
        return
      }
      this.$message({
        type: 'error',
        message: '请最少选择一个模型!'
      })
    },
    //添加多次执行时间
    addExecuteTime(){
      this.temp.manyTimesExecuteTime.push({
        executeTime:''
      })
    },
    //删除多次执行时间
    removeExecuteTime(obj){
      let index = this.temp.manyTimesExecuteTime.indexOf(obj)
      if (index !== -1) {
        this.temp.manyTimesExecuteTime.splice(index, 1)
      }
    },
    //添加月周期执行天数
    addMonth(){
      this.temp.intervalExecuteTime.monthValue.push({
        value:''
      })
    },
    //删除月周期执行天数
    removeMonth(obj){
      let index = this.temp.intervalExecuteTime.monthValue.indexOf(obj)
      if (index !== -1) {
        this.temp.intervalExecuteTime.monthValue.splice(index, 1)
      }
    },
    //添加年周期执行月数天数
    addMonthDay(){
      this.temp.intervalExecuteTime.monthDayValue.push({
        month : '',
        day : ''
      })
    },
    //删除年周期执行月数天数
    removeMonthDay(obj){
      let index = this.temp.intervalExecuteTime.monthDayValue.indexOf(obj)
      if (index !== -1) {
        this.temp.intervalExecuteTime.monthDayValue.splice(index, 1)
      }
    },
    //获取整体表单要存储的对象
    getFormData(){
      let isSubmit = false;
      this.$refs["baseDataForm"].validate((valid) => {
        if(!valid){
          this.tabShow = "baseInfo"
        } else {
          this.$refs["executeDataForm"].validate((valide) => {
              if(!valide){
                this.tabShow = "executeInfo"
              }else{
                //将前端表单组织成要存储的对象
                this.formToSaveObj()
                isSubmit = this.auditWarningSave
                if(this.auditWarningSave.warningTaskRel.length == 0){
                  this.$message({
                    type: 'info',
                    message: '请选择要执行的模型或指标'
                  })
                  his.tabShow = "baseInfo"
                  isSubmit = false;
                }
                //非周期执行需要校验执行时间 执行时间必须大于当前时间
                if(this.auditWarningSave.executeMode != "3"){
                  let cuurDate = new Date()
                  for(let exeTime of this.auditWarningSave.warningExecuteTime){
                    if(typeof exeTime.executeTime == "string"){
                      exeTime.executeTime = new Date(exeTime.executeTime);
                    }
                    if(exeTime.executeTime <= cuurDate){
                      this.$message({
                        type: 'error',
                        message: '该执行时间小于当前时间' + exeTime.executeTime.toLocaleString()
                      })
                      isSubmit = false;
                      this.tabShow = "executeInfo"
                      break
                    }
                  }
                }

              }
          })
        }
      })
      return isSubmit
    },
    /**
     * 格式化模型类型
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的字符串}
     */
    modelTypeFormatter(row, column) {
      const modelType = row.modelType
      let dicObj = getOneDict(modelType)
      let value = ""
      if(dicObj.length == 0){
        return "";
      }
      value = dicObj[0].codeName;
      return value
    },
    handleClick(data, node, tree) {
      this.tempPath = data.label;
      this.tempId = data.id;
      this.auditWarningSave.locationUuid = this.tempId
      this.auditWarningSave.locationName = this.tempPath
      this.nodeType = data.type;
    },

    modelResultSavePathDetermine() {
      if (this.nodeType == "folder") {
        // this.path = "当前执行sql保存路径:" + this.tempPath;
        // this.modelResultSavePathId = this.tempId;
        this.modelResultSavePathDialog = false;
      } else if (this.nodeType == "") {
        this.$message({
          message: "请选择路径",
          type: "warning",
        });
      } else {
        this.$message({
          message: "只能选择文件夹",
          type: "warning",
        });
      }
    }
  }
}
</script>
<style scoped>
  .el-input-z{
    width: 60%;
    margin: 0 35px 0 0;
    cursor:no-drop
  }
  .btn-z{
    width: 70px;
    height: 36px;
    display: inline-block;
    border-radius: 4px;
    background-color: #353a43;
    border-color: #353a43;
    color: #c8ff8c;
    font-weight: bold;
    text-align: center;
    padding: 0 10px;
    cursor:pointer;
  }
  .el-select{
  width: 320px;
}
</style>
