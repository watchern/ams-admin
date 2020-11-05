<template>
  <div class="app-container">
    <el-tabs v-model="tabShow" type="card">
      <el-tab-pane label="基本信息" name="baseInfo">
        <el-form ref="baseDataForm" :rules="rules" class="detail-form" :model="temp" label-position="right" >
          <el-form-item label="预警名称" prop="warningName">
            <el-input v-model="temp.warningName" />
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="执行信息" name="executeInfo">
        <el-form ref="executeDataForm" :rules="rules" class="detail-form" :model="temp" label-position="right" >
          <el-form-item label="执行方式" >
            <el-select v-model="temp.executeMode" placeholder="请选择执行方式">
              <el-option label="单次执行" value="1"></el-option>
              <el-option label="多次执行" value="2"></el-option>
              <el-option label="周期执行" value="3"></el-option>
            </el-select>
          </el-form-item>
          <!--单次执行时间选择-->
          <el-form-item label="执行时间" v-if="temp.executeMode == 1" prop="singleExecuteTime">
            <el-date-picker
              v-model="temp.singleExecuteTime"
              type="datetime"
              :readonly="allReadOnly"
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
                :readonly="allReadOnly"
                placeholder="选择多次执行时间"
                align="right"
                :picker-options="executeTimeOptions">
              </el-date-picker>
              <!--<el-button type="primary" v-if="index==0" @click="addExecuteTime">添加</el-button>-->
              <el-link type="primary" v-if="index==0" @click="addExecuteTime">添加</el-link>
              <el-link type="primary" v-if="temp.manyTimesExecuteTime.length > 1" @click="removeExecuteTime(domain)">删除</el-link>
              <!--<el-button type="primary" v-if="temp.manyTimesExecuteTime.length > 1" @click="removeExecuteTime(domain)">删除</el-button>-->
            </el-form-item>
          </el-form-item>
          <!--周期执行时间配置选择-->
          <el-form-item label="" v-if="temp.executeMode == 3"  >
            <el-form-item label="执行周期设置" >
              <el-select v-model="temp.intervalExecuteTime.intervalType" placeholder="请选择执行周期">
                <el-option label="每天" value="1"></el-option>
                <el-option label="每周" value="2"></el-option>
                <el-option label="每月" value="3"></el-option>
                <el-option label="每年" value="4"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="执行时间设置"  >
              <el-time-picker
                v-model="temp.intervalExecuteTime.executeTime"
                :readonly="allReadOnly"
                format='HH:mm'
                value-format="HH:mm"
                :picker-options="{
                  selectableRange: '00:00:00 - 23:59:00'
                }"
                placeholder="请输入执行时间">
              </el-time-picker>
            </el-form-item>
            <el-form-item label="开始结束日期"  >
              <el-date-picker
                v-model="temp.intervalExecuteTime.rangeTime"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
              </el-date-picker>
            </el-form-item>
          </el-form-item>
          <!--周期执行时间配置选择end-->
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name:"editAuditWarning",
  data() {
    return {
      //Tab标签页显示名称
      tabShow : "baseInfo",
      //全局只读 在查看详情时=true
      allReadOnly : false,
      //单次多次执行时间选择配置
      executeTimeOptions:{
        disabledDate(time){
          //不能选择小于当前日志的事件
          return new Date(time.toLocaleDateString()) < new Date(new Date().toLocaleDateString())
        }/*,
        selectableRange:
          new Date(new Date().setHours(new Date().getHours() + 1)).format(
            'hh'
          ) + ':00:00 - 23:59:59'*/
      },
      //表单数据
      temp: {
        //审计预警主键
        auditWarningUuid : "",
        //预警名称
        warningName : "",
        //预警类型1、模型；2、指标
        warningType : '',
        //执行方式 默认位1 1单次 2多次 3周期
        executeMode : "1",
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
          rangeTime:'',
          //周期执行的开始时间
          startTime : '',
          //周期执行的结束时间
          endTime : '',
          //周期类型 1、每天；2、每周；3、每月；4、每年
          intervalType : ''
        }
      },
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
      }
    }
  },
  created() {
  },
  watch:{
    //监听执行方式改变
    'temp.executeMode' : function(newValue, oldValue){

    },
    //监听周期的起始时间
    'temp.intervalExecuteTime.rangeTime' : function(newValue, oldValue){
      alert(newValue);
    }
  },
  methods: {
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
    //获取整体表单数据
    getFormData(){
      this.$refs["baseDataForm"].validate((valid) => {
        if (valid) {
          this.tabShow = "executeInfo"
          this.$refs["executeDataForm"].validate((valid) => {
            if (valid) {
              alert('执行信息成功')
            } else {
              alert('error 执行信息!!')
              return false
            }
          })
        } else {
          this.tabShow = "baseInfo"
          return false
        }
      })
    }
  }
}
</script>
