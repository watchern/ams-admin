<template>
  <div style="overflow-y: visible;" ref="inputParamContent" class="paramadrawnew">
    <div ref="nodeParam" style="overflow:auto;max-height:62vh" class="detail-form">
      <el-row  v-for="(paramInfo,ind) in paramInfoArr" :key="ind" style="margin: 15px;" >
        <el-col :span="7" style="line-height:36px;padding-right: 10px;">
          <el-tooltip :content="paramInfo.description" placement="bottom">
            <label>{{paramInfo.paramName}}</label>
          </el-tooltip>
        </el-col>
        <el-col :span="15">
          <!-- 下拉列表类型 -->
          <el-select v-model="paramListValueList[ind]" ref="selectParam"  style="width: 100%;" v-if="paramInfo.inputType === 'lineinp' " 
              :multiple="paramInfo.dataChoiceType == 0 || paramInfo.dataChoiceType == '0'" filterable clearable @change="changeRelationParam(ind)">
            <el-option v-for="item in paramInfo.data" :value="paramInfo.dataType == 'str' ? `'`+ item.value + `'`: item.value" :label="item.name" :key="item.value" >
              <span style="float: left"> {{ item.name}}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value == item.name ? "" : item.value}}  &nbsp;&nbsp;&nbsp;&nbsp;</span>
            </el-option>
          </el-select>
          <!-- <div class="select-div el-input__inner" ref="selectParam" :index="ind" v-if="paramInfo.inputType === 'lineinp'" :id="paramInfo.id" :title="paramInfo.title"></div> -->
          <el-input ref="paramOption" :index="ind" v-if="paramInfo.inputType === 'textinp'" :title="paramInfo.title" v-model="paramInfo.dataDefaultVal" class="textParam"></el-input>
          <!-- 树类型参数 -->
          <el-cascader
            v-model="paramTreeValueList[ind]"
            v-if="paramInfo.inputType === 'treeinp'"
            style="width:100%"
            ref="selectTreeParam"
            :props="{ label:'name',  multiple: paramInfo.dataChoiceType == 0 || paramInfo.dataChoiceType == '0', emitPath: false,checkStrictly: true}"
            :options="paramInfo.data"
            @change="changeRelationParam(ind)"
            multiple
            clearable />
          <!-- <div class="select-div" ref="selectTreeParam" :index="ind" v-if="paramInfo.inputType === 'treeinp'" :id="paramInfo.id" :title="paramInfo.title"></div> -->
          <span  v-if="paramInfo.inputType === 'timeinp'" >
            <el-date-picker v-if="paramInfo.timeFormat!='other'" ref="paramOption" :index="ind"  :title="paramInfo.title" :type="paramInfo.timeFormat" placeholder="选择日期" :value-format="timeDealFormat(paramInfo.timeFormat)"  v-model="paramInfo.dataDefaultVal" style="width: 98%;" @change="changeRelationParam(ind)"></el-date-picker> 
            <el-date-picker v-else ref="paramOption" :index="ind"  :title="paramInfo.title" type="date" placeholder="选择日期" :value-format="paramInfo.customizeFormat" v-model="paramInfo.dataDefaultVal" style="width: 98%;" @change="changeRelationParam(ind)"></el-date-picker> 
          </span>
        </el-col>
        <el-col :span="2" v-show="paramInfo.allowedNull">
          <div style="color: red;display: inline-block;font-weight: bold;font-size: 20px;">*</div>
        </el-col>
      </el-row>
      <!-- 分隔线 -->
      <!-- <el-divider v-if="paramInfoArr.length>0"></el-divider> -->
    </div>  
  </div>
</template>
<script>
import '@/components/ams-loading/css/loading.css'
import { findParamsAndModelRelParams,executeParamSql,getSelectTreeData,recplaceParams } from '@/api/graphtool/apiJs/graphList'
import * as paramCommonJs from '@/api/graphtool/js/paramCommon'
import {removeJcCssfile,addJsFile} from "@/api/analysis/common"
export default {
  name: "paramdrawnew",
  props:['arr','sql'],
  data(){
    return{
      loading:null,
      selectNum:0,// 用于临时记录参数为下拉列表的个数
      selectTreeNum:0,// 用于临时记录参数为下拉树的个数
      paramInfoArr:[],
      activeName:'collapse1',
      overallParmaobj:{},    //定义全局参数对象 用于模型预览不同模型，将第一次输入的参数传入第二次输入参数界面
      collapseTitle:'',
      hasParam:false,
      paramListValueList: [], // 下拉列表参数值集合
      paramTreeValueList: [] // 下拉树列表参数值集合
    }
  },created(){
    addJsFile('/lib/layui/xm-select.js','xm-select')
  },
  beforeDestroy() {
    removeJcCssfile("xm-select.js","js")
  },methods:{
    async changeRelationParam(ind){
      for(let i=0;i<this.paramInfoArr.length;i++){
        if(this.paramInfoArr[i].masterparam && this.paramListValueList[ind]!=''){
          //找到被关联参数
        if(this.paramInfoArr[i].masterparam.masterParamUuid == this.paramInfoArr[ind].dataId){
          //拼sql
          let paramSql = this.paramInfoArr[i].dataSql + " WHERE " + this.paramInfoArr[i].masterparam.slaveParamCol
          // 单选
          if(typeof(this.paramListValueList[ind])=='string'){
            console.log("单选值：" + this.paramListValueList[ind])
            paramSql += "="
            paramSql += this.paramListValueList[ind]
          }else{
            // 多选
            console.log("多选值：" + this.paramListValueList[ind])
            paramSql += " in ("
            for(let j=0;j<this.paramListValueList[ind].length;j++){
              let rvalue = this.paramListValueList[ind][j]
              console.log(this.paramListValueList[ind])
              if(this.paramInfoArr[i].masterparam.relationMode==1){
                }else{
                  let rdata = this.paramInfoArr[ind].data
                  for(let k=0;k<rdata.length;k++){
                    let rv1 = (rdata[k].value.indexOf("'") == -1? ("'"+rdata[k].value+"'"):rdata[k].value)
                    let rv2 = (rvalue.indexOf("'") == -1? ("'"+rvalue+"'"):rvalue)
                    if(rv1 == rv2){
                      rvalue = rdata[k].name
                    }
                  }
                }
                if(rvalue.indexOf("'") != -1){
                  paramSql += rvalue+","
                }else{
                  paramSql += "'"+rvalue+"',"
                }
                }
                if(paramSql.charAt(paramSql.length-1)==","){
                  paramSql = paramSql.substring(0, paramSql.length-1);
                }
            paramSql += ")"
          }
          
          const response = await executeParamSql(paramSql)
          let dataArr = []
          if(response.data == null){
            this.$message(`获取参数值的失败`)
            }else {
              if (response.data.isError) {
                this.$message(`获取参数值的失败`)
              } else {
                let e = response.data
                if (e.paramList && e.paramList.length > 0) {
                  // 给下拉列表赋值
                  for (let k = 0; k < e.paramList.length; k++) {
                    dataArr.push({
                      'name': e.paramList[k].paramName,
                      'value': e.paramList[k].paramValue
                    })
                  }
                }
                this.paramInfoArr[i].data = dataArr
                this.paramListValueList[i] = ''
              }
            }
          }
        }
        }
      },
    async createParamNodeHtml(id,collapseTitle,flag){
      try {
        this.loading = $(this.$refs.inputParamContent).mLoading({ 'text': '正在初始化数据，请稍后……', 'hasCancel': false })
        this.collapseTitle = collapseTitle
        let paramsArr = []// 定义所有母参信息数组
      let nodeParamInfoObj = {
        "paramInfoArr": [],
      }
      const response = await findParamsAndModelRelParams()
      if(response.data == null){
        this.$message.error('获取参数信息失败')
        return
      }else {
        if (response.data.isError) {
          this.$message.error(response.data.message)
          return
        } else {
          paramsArr = response.data.paramList// 定义所有母参信息数组
        }
      }
      let moduleParamArr = []// 母参数数组（去重用）
      let copyParamArr = []// 定义所有参数的对象数组（已去重）
        for (let j = 0; j < this.arr.length; j++) {
          for (let k = 0; k < paramsArr.length; k++) {
            let moduleParamId = paramsArr[k].ammParamUuid
            if (moduleParamId === this.arr[j].moduleParamId && $.inArray(moduleParamId, moduleParamArr) < 0) { // 匹配复制参数的母版参数ID
              this.arr[j].allowedNull = paramsArr[k].paramChoice.allowedNull
              // if (flag==='modelPreview' ||flag==='auditwarning'){
              //   if (this.arr[j].paramValue) {
              //     paramsArr[k].defaultVal = this.arr[j].paramValue
              //     // paramsArr[k].defaultVal = this.arr[j].defaultVal
              //   }
              // }else{
              //   if (this.arr[j].defaultVal) {
              //     paramsArr[k].defaultVal = this.arr[j].defaultVal
              //   }
              // }
              // 默认值赋值
              if (this.arr[j].defaultVal) {
                  paramsArr[k].defaultVal = this.arr[j].defaultVal
                }
              this.arr[j].useQuotation = paramsArr[k].useQuotation
              copyParamArr.push(paramsArr[k])
              moduleParamArr.push(moduleParamId)
              break
            }
          }
        }
        for (var i = 0;i<this.arr.length;i++){
          this.arr[i] = JSON.parse(JSON.stringify(this.arr[i]).replace(/paramValue/g,"value"))
        }
        var eachParamObj = {
          'sql': this.sql,
          'paramsArr': this.arr
        }
        this.overallParmaobj[id] = eachParamObj
      for (let n = 0; n < copyParamArr.length; n++) {
        let paramInfoObj = {
          "paramName": copyParamArr[n].paramName,
          "description": '（参数说明：无）',
          "inputType": copyParamArr[n].inputType,//参数类型
          "masterparam": copyParamArr[n].paramRelationList[0]
        }
        if (typeof copyParamArr[n].description !== 'undefined' && copyParamArr[n].description != null) {
          paramInfoObj.description = '（参数说明：' + copyParamArr[n].description + '）'
        }
        let returnObj = await this.initParamHtml(copyParamArr[n], paramInfoObj, this.selectNum, this.selectTreeNum, n)
        if (typeof returnObj.selectNum !== 'undefined') {
          this.selectNum = returnObj.selectNum
          paramInfoObj.selectNum = returnObj.selectNum
        }
        if (typeof returnObj.selectTreeNum !== 'undefined') {
          this.selectTreeNum = returnObj.selectTreeNum
          paramInfoObj.selectTreeNum = returnObj.selectTreeNum
        }
        if (returnObj.isError) {
          this.$message.error(returnObj.message)
          return
        } else {
          paramInfoObj = {...paramInfoObj, ...returnObj.setParamObj}
          paramInfoObj.description += `${paramInfoObj.title}`
        }
        this.paramInfoArr.push(paramInfoObj)
      }
      this.$nextTick(() => {
        // this.initParamInputAndSelect()
        this.loading.destroy()
        let nodeParamDom = this.$refs.nodeParam
        // if (nodeParamDom.$children.length===0){
        //   this.hasParam = true
        // }
      })
      }catch (e) {
        this.loading.destroy()
        console.info(e)
      }
    },
    /**
     * 根据参数类型组织参数的HTML元素
     * createParamNodeHtml()方法内部调用的方法
     * @param paramObj 参数对象
     * @param setParamObj 待返回的参数对象
     * @param selectNum 下拉列表参数的个数
     * @param selectTreeNum 下拉树参数的个数
     * @author JL
     */
    async initParamHtml(paramObj, setParamObj, selectNum, selectTreeNum, index) {
      let obj = {
        "selectNum":selectNum,
        "selectTreeNum":selectTreeNum,
        "setParamObj":{...{}, ...setParamObj},
        "isError": false,
        "message": ""
      }
      let dataArr = []// 下拉列表或下拉树的数据的数组
      let paramArr = []// 影响当前参数的主参集合
      let associatedParamIdArr = []// 受当前参数影响的被关联参数ID集合
      let paramSql = paramObj.paramChoice.optionsSql//拉列表或下拉树的SQL语句
      obj.setParamObj.title = paramObj.paramChoice.allowedNull === 0 ? '不可为空' : '可为空'
      obj.setParamObj.allowedNull = false
      obj.setParamObj.dataType = paramObj.dataType // dataType
      if(paramObj.paramChoice.allowedNull === 0) {
        obj.setParamObj.allowedNull = true
      }
      let hasSql = false// 下拉列表或下拉树是非SQL方式或者是SQL方式但值为空
      switch (obj.setParamObj.inputType) {
        case 'lineinp':// 下拉列表
          if (!paramSql) {// 备选sql为空的情况下 取静态的option值
            // 下拉静态列表赋值
            paramObj.paramChoice.ammParamOptionsList.forEach(r => {
              if (r.optionsVal && r.optionsName) {
                // 组织下拉选项数据
                dataArr.push({'name': r.optionsName,'value': r.optionsVal })
              }
            })
          } else { // 执行备选sql
            if (paramSql !== '') {
              hasSql = true// 下拉列表是SQL方式
               // 初始化默认执行sql
                const response = await executeParamSql(paramSql)
                if(response.data == null){
                  obj.isError = true
                  obj.message = `获取参数【${paramObj.paramName}】的值的失败`
                }else {
                  if (response.data.isError) {
                    obj.isError = true
                    obj.message = `获取参数【${paramObj.paramName}】的值的失败，原因：${response.data.message}`
                  } else {
                    let e = response.data
                    if (e.paramList && e.paramList.length > 0) {
                      // 给下拉列表赋值
                      for (let k = 0; k < e.paramList.length; k++) {
                        dataArr.push({
                          'name': e.paramList[k].paramName,
                          'value': e.paramList[k].paramValue
                        })
                      }
                    }
                  }
                }

            }
          }
          // data赋值
          if(typeof obj.selectNum !== 'undefined' && obj.selectNum != null){
            obj.selectNum++
            obj.setParamObj.id = `selectParam${obj.selectNum}`
          }else{
            obj.setParamObj.id = `selectParam${paramObj.ammParamUuid}`
          }
          obj.setParamObj.dataId = paramObj.ammParamUuid
          obj.setParamObj.dataName = paramObj.paramName
          obj.setParamObj.dataChoiceType = paramObj.paramChoice.choiceType
          if(hasSql){
            obj.setParamObj.dataSql = paramSql
            obj.setParamObj.dataParamArr = paramArr
            obj.setParamObj.dataAssociatedParamIdArr = associatedParamIdArr
          }
          
          if(dataArr.length > 0){
            obj.setParamObj.data = dataArr
          }
          if(typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null){
            obj.setParamObj.dataDefaultVal = paramObj.defaultVal
            // 下拉列表默认值
            if (paramObj.paramChoice.choiceType === '1'){
              // 单选
              this.paramListValueList[index] = paramObj.dataType == 'str'? `'` + paramObj.defaultVal + `'` : paramObj.defaultVal
            } else {
              // 多选
              const list = [] 
              if (paramObj.defaultVal.length > 0){
                paramObj.defaultVal.forEach(o => {
                  if(paramObj.dataType == 'str') { list.push(`'` + o + `'`) }
                  else {list.push(o) }
                })
                this.paramListValueList[index] = list
              }
              
            }
          }
          if(typeof paramObj.paramChoice.allowedNull !== 'undefined' && paramObj.paramChoice.allowedNull != null){
            obj.setParamObj.dataAllowedNull = paramObj.paramChoice.allowedNull
          }
          break
        case 'textinp':// 文本框
          if (typeof paramObj.dataLength !== 'undefined' && paramObj.dataLength != null) {
            obj.setParamObj.title += `,参数值的长度为${paramObj.dataLength}`
          }
          obj.setParamObj.dataId = paramObj.ammParamUuid
          obj.setParamObj.dataName = paramObj.paramName
          if(typeof paramObj.paramChoice.allowedNull !== 'undefined' && paramObj.paramChoice.allowedNull != null){
            obj.setParamObj.dataAllowedNull = paramObj.paramChoice.allowedNull
          }
          if(typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null){
            // obj.setParamObj.dataDefaultVal = paramObj.defaultVal
            obj.setParamObj.dataDefaultVal = paramObj.defaultVal
          }
          if(typeof paramObj.dataLength !== 'undefined' && paramObj.dataLength != null){
            obj.setParamObj.dataDataLength = paramObj.dataLength
          }
          break
        case 'timeinp':// 时间
          if (paramObj.dataType === 'date') { // 暂时只支持日期，不支持时间段
            obj.setParamObj.dataId = paramObj.ammParamUuid
            obj.setParamObj.dataName = paramObj.paramName
            if(typeof paramObj.paramChoice.allowedNull !== 'undefined' && paramObj.paramChoice.allowedNull != null){
              obj.setParamObj.dataAllowedNull = paramObj.paramChoice.allowedNull
            }
            if(typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null){
              obj.setParamObj.dataDefaultVal = paramObj.defaultVal
            }
             //时间类型（年/月/日/其他）
            obj.setParamObj.timeFormat = paramObj.paramTimes.timeFormat;
            obj.setParamObj.customizeFormat = paramObj.paramTimes.customizeFormat; 
          }
          break
        case 'treeinp':// 下拉树
          if (paramSql !== '') { // 执行备选SQL
            hasSql = true
            const response = await getSelectTreeData(paramSql)
              if(response.data == null){
                obj.isError = true
                obj.message = `获取参数【${paramObj.paramName}】的值的失败`
              }else {
                if (response.data.isError) {
                  obj.isError = true
                  obj.message = `获取参数【${paramObj.paramName}】的值的失败，原因：${response.data.message}`
                } else {
                  if(response.data.result && response.data.result.length > 0){
                    dataArr = paramCommonJs.organizeSelectTreeDataByType(response.data.result, obj.setParamObj.dataType)
                  }else{
                    dataArr = []
                  }
                }
              }
          }
          if(typeof obj.selectTreeNum !== 'undefined' && obj.selectTreeNum != null){
            obj.selectTreeNum++
            obj.setParamObj.id = `selectTreeParam${obj.selectTreeNum}`
          }else{
            obj.setParamObj.id = `selectTreeParam${paramObj.ammParamUuid}`
          }
          obj.setParamObj.dataId = paramObj.ammParamUuid
          obj.setParamObj.dataName = paramObj.paramName
          obj.setParamObj.dataChoiceType = paramObj.paramChoice.choiceType
          if(hasSql){
            obj.setParamObj.dataSql = paramSql
            obj.setParamObj.dataParamArr = paramArr
            obj.setParamObj.dataAssociatedParamIdArr = associatedParamIdArr
          }
          if(typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null){
            obj.setParamObj.dataDefaultVal = paramObj.defaultVal
            // 下拉树默认值
            if (paramObj.paramChoice.choiceType === '1'){
              // 单选
              // this.paramTreeValueList[index] = list[0]
              this.paramTreeValueList[index] = paramObj.dataType == 'str' ? `'` + paramObj.defaultVal + `'` : paramObj.defaultVal
            } else {
              // 多选
              const list = []
              if (paramObj.defaultVal.length > 0){
                paramObj.defaultVal.forEach(o => {
                  if(paramObj.dataType == 'str') { list.push(`'` + o + `'`) }
                  else {list.push(o) }
                })
                this.paramTreeValueList[index] = list
              }
              
            }
          }else{
            // 下拉树默认值
            if (paramObj.paramChoice.choiceType === '1'){
              // 单选
              // this.paramTreeValueList[index] = list[0]
              this.paramTreeValueList[index] = ''
            } else {
              // 多选
                this.paramTreeValueList[index] = [] 
            }
          }
            
          if(dataArr.length > 0){
            obj.setParamObj.data = dataArr
          }
          if(typeof paramObj.paramChoice.allowedNull !== 'undefined' && paramObj.paramChoice.allowedNull != null){
            obj.setParamObj.dataAllowedNull = paramObj.paramChoice.allowedNull
          }
          break
      }
      return obj
    },
    //处理时间格式
    timeDealFormat(val){
      if(val=="year"){
        return "yyyy";
      }else if(val=="month"){
        return "yyyy-MM";
      }else{
        return "yyyy-MM-dd";
      }
    },
    /**
     * 替换参数
     * @return {{verify: boolean, message: string}}
     * @author JL
     */
    replaceNodeParam(id) {
      let returnObj = {
        'verify': true, // 校验是否通过
        'message': '',// 提示信息
        'sql': '', // 返回的SQL语句
        'paramsArr': [] // 返回的参数数组，对象格式{"moduleParamId":xx,"paramName":xx,"paramValue":xx,"allowedNull":xx}
      }
      // 循环所有节点
      let nodeParamDom = this.$refs.nodeParam
      if(nodeParamDom){
          let filterArr = []// 参数条件的数组，包含参数ID和参数值
          let paramNum = 0// 记录参数不允许为空却未输入值的参数数量
          let hasAllowedNullParam = false// 本次查询是否含有可为空的参数条件
          let replaceParamSql = this.overallParmaobj[id].sql
          // let arr = paramsSetting.arr// 参数数组
          let arr = this.overallParmaobj[id].paramsArr
          // 先去除已存在的value值
          for (let k = 0; k < arr.length; k++) {
            if (typeof arr[k].value !== 'undefined') {
              delete arr[k].value
            }
          }
          let paramInfoArr = this.paramInfoArr
          let paramInfoObj = null
          // 获取参数查询条件（文本框）
          let paramOptionDom = this.$refs.paramOption
          if(paramOptionDom && paramOptionDom.length > 0){
            for(let j=0; j<paramOptionDom.length; j++){
              let index = paramOptionDom[j].$attrs.index
              paramInfoObj = paramInfoArr[index]
              let moduleParamId = paramInfoObj.dataId// 母参数ID
              let allowedNull = typeof paramInfoObj.dataAllowedNull !== 'undefined' ? paramInfoObj.dataAllowedNull : '1'// 是否允许为空，当为undefined时默认为可为空
              let paramValue = typeof paramInfoObj.dataDefaultVal !== 'undefined' ? paramInfoObj.dataDefaultVal :''
              let obj = {
                'moduleParamId': moduleParamId,
                'paramValue': $.trim(paramValue), // 处理可能存在的空格
                'allowedNull': '0'
              }
              if (allowedNull === 1) { // 允许为空
                obj.allowedNull = '1'
                if (paramValue === '') {
                  hasAllowedNullParam = true
                  for (let w = 0; w < arr.length; w++) { // 遍历当前节点绑定的参数，给每个参数绑定空值
                    if (arr[w].moduleParamId === moduleParamId) {
                      arr[w]['value'] = ''
                    }
                  }
                }
                filterArr.push(obj)
              } else { // 不允许为空
                if (paramValue !== '') {
                  filterArr.push(obj)
                } else {
                  paramNum++
                }
              }
            }
          }
          // 获取参数查询条件（下拉列表）
          let selectParamDom = this.$refs.selectParam
          if(selectParamDom && selectParamDom.length > 0) {
            for(var i = 0; i< this.paramListValueList.length;i++){
             if( typeof this.paramListValueList[i] !== 'undefined'){
               paramInfoObj = paramInfoArr[i]
              let moduleParamId = paramInfoObj.dataId// 母参数ID
              let allowedNull = typeof paramInfoObj.dataAllowedNull !== 'undefined' ? paramInfoObj.dataAllowedNull : '1'// 是否允许为空，当为undefined时默认为可为空
              let choiceType = paramInfoObj.dataChoiceType// 当前参数是多选还是单选：0：多选，1、单选
              let obj = {
                'moduleParamId': moduleParamId,
                'paramValue': '',
                'allowedNull': '0'
              }
              if (allowedNull === 1) { // 允许为空
                obj.allowedNull = '1'
                if (this.paramListValueList[i].length === 0) { // 未选择值
                  hasAllowedNullParam = true
                  for (let w = 0; w < arr.length; w++) { // 遍历当前节点绑定的参数，给每个参数绑定空值
                    if (arr[w].moduleParamId === moduleParamId) {
                      arr[w]['value'] = ''
                    }
                  }
                } else {
                  if (choiceType === '1') { // 单选
                    obj.paramValue = this.paramListValueList[i]
                  } else { // 多选
                    obj.paramValue = this.paramListValueList[i].join(',')
                  }
                  
                }
                filterArr.push(obj)
              } else { // 不允许为空
                if (this.paramListValueList[i].length !== 0 ) {
                  if (choiceType === '1') { // 单选
                    obj.paramValue = this.paramListValueList[i]
                  } else {
                    obj.paramValue = this.paramListValueList[i].join(',')
                  }
                  filterArr.push(obj)
                } else {
                  paramNum++
                }
              }
             }
            }
          }
          // 获取参数查询条件（下拉树）
          let selectTreeParamDom = this.$refs.selectTreeParam
          if(selectTreeParamDom && selectTreeParamDom.length > 0) {
            for(var treenum = 0; treenum< this.paramTreeValueList.length;treenum++){
             if( typeof this.paramTreeValueList[treenum] !== 'undefined'){
               paramInfoObj = paramInfoArr[treenum]
              let moduleParamId = paramInfoObj.dataId// 母参数ID
              let allowedNull = typeof paramInfoObj.dataAllowedNull !== 'undefined' ? paramInfoObj.dataAllowedNull : '1'// 是否允许为空，当为undefined时默认为可为空
              let choiceType = paramInfoObj.dataChoiceType// 当前参数是多选还是单选：0：多选，1、单选
              let obj = {
                'moduleParamId': moduleParamId,
                'paramValue': '',
                'allowedNull': '0'
              }
              if (allowedNull === 1) { // 允许为空
                obj.allowedNull = '1'
                if (this.paramTreeValueList[treenum].length === 0) { // 未选择值
                  hasAllowedNullParam = true
                  for (let w = 0; w < arr.length; w++) { // 遍历当前节点绑定的参数，给每个参数绑定空值
                    if (arr[w].moduleParamId === moduleParamId) {
                      arr[w]['value'] = ''
                    }
                  }
                } else {
                  if (choiceType === '1') { // 单选
                    obj.paramValue = this.paramTreeValueList[treenum]
                  } else { // 多选
                    obj.paramValue = this.paramTreeValueList[treenum].join(',')
                  }
                  
                }
                filterArr.push(obj)
              } else { // 不允许为空
                if (this.paramTreeValueList[treenum].length !== 0) {
                  if (choiceType === '1') { // 单选
                    obj.paramValue = this.paramTreeValueList[treenum]
                  } else {
                    obj.paramValue = this.paramTreeValueList[treenum].join(',')
                  }
                  filterArr.push(obj)
                } else {
                  paramNum++
                }
              }
             }
           }
          }
          if (paramNum !== 0) { // 第一步，先判断是否有必填的参数没有输入值
            returnObj.verify = false
            returnObj.message +='含有未输入值的参数项，请重新输入'
          } else {
            // 第二步，判断设置长度值文本框输入的值是否满足条件
            let textParamLen = $(nodeParamDom[0]).find('.textParam').length
            for (let t = 0; t < textParamLen; t++) {
              let textParam = $(nodeParamDom[0]).find('.textParam:eq(' + t + ')')
              let index = textParam.attr("index")
              paramInfoObj = paramInfoArr[index]
              let dataLength = paramInfoObj.dataDatalength// 获取参数值长度
              let paramName = paramInfoObj.dataName// 获取参数名称
              if (typeof dataLength !== 'undefined' && paramInfoObj.dataDefaultVal.length > parseInt(dataLength)) { // 如果该参数有长度限制且默认值不等于设置的长度值
                returnObj.verify = false
                returnObj.message +=  '参数【' + paramName + '】输入值的长度与设置的长度值【' + parseInt(dataLength) + '】不相等'
                break
              }
            }
            if (!returnObj.verify) {
            } else {
              if (hasAllowedNullParam) { // 如果存在可为空的参数并且为空值，走后台进行空参替换
                const response = recplaceParams(replaceParamSql, JSON.stringify(arr))
                //const response = await replaceModelSqlByParams(replaceParamSql, JSON.stringify(arr))
                if(response.data == null || response.data.isError){// 出错后replaceParamSql的值会在后台置为空
                  returnObj.verify = false
                  returnObj.message = '替换空值参数时出错'
                }else{
                  replaceParamSql = response.data.sql
                }
              }
              if (replaceParamSql !== '') {
                // 替换参数SQL中的ID（多值怎么替换？）
                for (let x = 0; x < filterArr.length; x++) { // 遍历所有母参数信息
                  let moduleParamId = filterArr[x].moduleParamId
                  for (let a = 0; a < arr.length; a++) { // 遍历当前节点绑定的参数
                    if (arr[a].moduleParamId === moduleParamId) {
                      if (arr[a].paramValue instanceof Array){
                        var paramValue = []
                        paramValue.push(filterArr[x].paramValue)
                        arr[a].paramValue = paramValue
                      }else {
                        arr[a].paramValue = filterArr[x].paramValue
                      }
                      replaceParamSql = replaceParamSql.replaceAll(arr[a].id, filterArr[x].paramValue)// 将参数SQL中的参数ID替换为输入得值
                    }
                  }
                }
                returnObj.sql = replaceParamSql
              }
            }
          }
          returnObj.paramsArr = arr
      }

      return returnObj
    }
  }
}
</script>

<style lang="scss" scoped>
  .paramadrawnew>>>.el-collapse-item__wrap{
    overflow: scroll;
  }
  .paramadrawnew>>>.select-div{
    z-index: 40000;
  }
</style>
<style>
 .paramadrawnew .xm-body .scroll-body{
   max-width:500px;
}
</style>
