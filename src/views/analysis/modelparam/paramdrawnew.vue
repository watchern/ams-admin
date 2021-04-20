<template>
  <div style="overflow-y: visible;" ref="inputParamContent" class="paramadrawnew">
    <div ref="nodeParam">
      <el-row  v-for="(paramInfo,ind) in paramInfoArr" :key="ind" style="margin: 15px;" >
        <el-col :span="7" style="line-height:36px;padding-right: 10px;">
          <el-tooltip :content="paramInfo.description" placement="bottom">
            <label>{{paramInfo.paramName}}</label>
          </el-tooltip>
        </el-col>
        <el-col :span="15">
          <div class="select-div" ref="selectParam" :index="ind" v-if="paramInfo.inputType === 'lineinp'" :id="paramInfo.id" :title="paramInfo.title"></div>
          <el-input ref="paramOption" :index="ind" v-if="paramInfo.inputType === 'textinp'" :title="paramInfo.title" v-model="paramInfo.dataDefaultVal" class="textParam"></el-input>
          <div class="select-div" ref="selectTreeParam" :index="ind" v-if="paramInfo.inputType === 'treeinp'" :id="paramInfo.id" :title="paramInfo.title"></div>
          <span  v-if="paramInfo.inputType === 'timeinp'" >
            <el-date-picker v-if="paramInfo.timeFormat!='other'" ref="paramOption" :index="ind"  :title="paramInfo.title" :type="paramInfo.timeFormat" placeholder="选择日期" :value-format="timeDealFormat(paramInfo.timeFormat)"  v-model="paramInfo.dataDefaultVal" style="width: 98%;"></el-date-picker> 
            <el-date-picker v-else ref="paramOption" :index="ind"  :title="paramInfo.title" type="date" placeholder="选择日期" :value-format="paramInfo.customizeFormat" v-model="paramInfo.dataDefaultVal" style="width: 98%;"></el-date-picker> 
          </span>
        </el-col>
        <el-col :span="2" v-show="paramInfo.allowedNull">
          <div style="color: red;display: inline-block;font-weight: bold;font-size: 20px;">*</div>
        </el-col>
      </el-row>
      <!-- 分隔线 -->
      <el-divider v-if="paramInfoArr.length>0"></el-divider>
    </div>  
  </div>
</template>
<script>
import '@/components/ams-loading/css/loading.css'
import { findParamsAndModelRelParams,executeParamSql,getSelectTreeData,replaceModelSqlByParams ,recplaceParams } from '@/api/graphtool/apiJs/graphList'
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
      hasParam:false
    }
  },created(){
    addJsFile('/lib/layui/xm-select.js','xm-select')
  },
  beforeDestroy() {
    removeJcCssfile("xm-select.js","js")
  },methods:{
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
              if (flag==='modelPreview' ||flag==='auditwarring'){
                if (this.arr[j].paramValue) {
                  paramsArr[k].defaultVal = this.arr[j].paramValue
                }
              }else{
                if (this.arr[j].defaultVal) {
                  paramsArr[k].defaultVal = this.arr[j].defaultVal
                }
              }
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
          "inputType": copyParamArr[n].inputType//参数类型
        }
        if (typeof copyParamArr[n].description !== 'undefined' && copyParamArr[n].description != null) {
          paramInfoObj.description = '（参数说明：' + copyParamArr[n].description + '）'
        }
        let returnObj = await this.initParamHtml(copyParamArr[n], paramInfoObj, this.selectNum, this.selectTreeNum)
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
      console.log(this.paramInfoArr);
      this.$nextTick(() => {
        this.initParamInputAndSelect()
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
    async initParamHtml(paramObj, setParamObj, selectNum, selectTreeNum) {
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
      if(paramObj.paramChoice.allowedNull === 0) {
        obj.setParamObj.allowedNull = true
      }
      let hasSql = false// 下拉列表或下拉树是非SQL方式或者是SQL方式但值为空
      switch (obj.setParamObj.inputType) {
        case 'lineinp':// 下拉列表
          if (!paramSql) {// 备选sql为空的情况下 取静态的option值
            $.each(paramObj.paramChoice.paramOptionsList, function(i, v) {
              if (v.optionsVal && v.optionsName) {
                // 组织下拉选项数据
                dataArr.push({
                  'name': v.optionsName,
                  'value': v.optionsVal
                })
              }
            })
          } else { // 执行备选sql
            if (paramSql !== '') {
              hasSql = true// 下拉列表是SQL方式
              if (typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null) { // 如果有该参数默认值，则直接执行备选SQL加载初始化数据
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
                    if (e.valueList && e.valueList.length > 0) {
                      for (let k = 0; k < e.valueList.length; k++) {
                        dataArr.push({
                          'name': e.valueList[k].paramName,
                          'value': e.valueList[k].paramValue
                        })
                      }
                    }
                  }
                }
              }
            }
          }
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
          if(typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null){
            obj.setParamObj.dataDefaultVal = paramObj.defaultVal
          }
          if(dataArr.length > 0){
            obj.setParamObj.data = dataArr
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
            if (typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null) { // 如果有该参数默认值，则直接执行备选SQL加载初始化数据
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
                    dataArr = paramCommonJs.organizeSelectTreeData(response.data.result)
                  }else{
                    dataArr = []
                  }
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
    /**
     * 初始化下拉列表、下拉树
     * @author JL
     */
    initParamInputAndSelect() {
      let vue_this = this
      // 初始化下拉列表
      let selectParam = this.$refs.selectParam
      if (selectParam && selectParam.length > 0) {
        for(let i=0; i<selectParam.length; i++) {
          let divId = selectParam[i].getAttribute("id")
          let paramInfoObj = this.paramInfoArr.find(item => item.id === divId)
          if(typeof paramInfoObj === "undefined"){
            continue;
          }
          let choiceType = paramInfoObj.dataChoiceType// 下拉列表的数据是单选还是多选
          let sql = typeof paramInfoObj.dataSql !== 'undefined' ? paramInfoObj.dataSql : ''// 该参数是否有SQL语句（0否1是）
          let dataArr = typeof paramInfoObj.data !== 'undefined' ? paramInfoObj.data : []// 下拉列表数据
          let initDataArr = false// 是否初始化数据
          let selectSetting = {
            el: `#${divId}`,
            filterable: true,
            filterMethod: function (val, item) {
              if (val === item.value || (item.name && item.name.indexOf(val) > -1)) { // 把value相同的搜索出来或把名称中包含的搜索出来
                return true
              }
              return false// 不知道的就不管了
            },
            data: dataArr
          }
          if (choiceType === '1') { // 单选
            selectSetting.radio = true
            selectSetting.clickClose = true
          }
          if (sql !== '') { // 当前参数是SQL语句方式
            let associatedParamIdArr = typeof paramInfoObj.dataAssociatedParamIdArr !== 'undefined' ? paramInfoObj.dataAssociatedParamIdArr : []// 当前参数的被关联的参数的集合
            let paramArr = typeof paramInfoObj.dataParamArr !== 'undefined' ? paramInfoObj.dataParamArr : []// 影响当前参数的主参数的集合
            selectSetting.show = function () {
              initDataArr = vue_this.selectShow($(vue_this.$refs.inputParamContent), '#selectParam', paramInfoObj.selectNum, paramInfoObj, sql, paramArr, dataArr, initDataArr)
            }
            selectSetting.hide = function () {
              if (initDataArr && dataArr.length === 0) {
                let selectXs = xmSelect.get(`#${divId}`, true)// 获取当前下拉框的实体对象
                dataArr = selectXs.options.data
                initDataArr = false
              }
              if ($.inArray(paramInfoObj.dataId, associatedParamIdArr) > -1) {
                vue_this.selectHide('#selectParam', paramInfoObj.selectNum,associatedParamIdArr)
              }
            }
          }
          // 设置默认值
          let defaultVal = []
          if (paramInfoObj.dataDefaultVal instanceof Array){
            selectSetting.initValue = paramInfoObj.dataDefaultVal
          }else {
            defaultVal.push(paramInfoObj.dataDefaultVal)
            if (typeof defaultVal !== 'undefined') {
              selectSetting.initValue = defaultVal// 初始化默认值
            }
          }
          xmSelect.render(selectSetting)
        }
      }
      // 初始化下拉树
      let selectTreeParam = this.$refs.selectTreeParam
      if (selectTreeParam && selectTreeParam.length > 0) {
        for(let i=0; i<selectTreeParam.length; i++){
          let divId = selectTreeParam[i].getAttribute("id")
          let paramInfoObj = this.paramInfoArr.find(item => item.id === divId)
          if(typeof paramInfoObj === "undefined"){
            continue;
          }
          let choiceType = paramInfoObj.dataChoiceType// 下拉列表的数据是单选还是多选
          let sql = typeof paramInfoObj.dataSql !== 'undefined' ? paramInfoObj.dataSql : ''// 该参数是否有SQL语句（0否1是）
          let dataArr = typeof paramInfoObj.data !== 'undefined' ? paramInfoObj.data : []// 下拉列表数据
          let initDataArr = false// 是否初始化数据
          let selectSetting = {
            el: `#${divId}`, // 此处使用【i】的原因在于每个参数都可能被重复使用，只能通过数量下标来确保【el】唯一
            // autoRow: true,
            filterable: true,
            tree: {
              show: true,
              showFolderIcon: true, // 显示三角标
              showLine: true, // 显示虚线
              indent: 30, // 间距
              strict: false// 严格父子结构
            },
            height: 'auto',
            data: dataArr
          }
          if (sql !== '') { // 当前参数是SQL语句方式
            let associatedParamIdArr = typeof paramInfoObj.dataAssociatedParamIdArr !== 'undefined' ? paramInfoObj.dataAssociatedParamIdArr : []// 当前参数的被关联的参数的集合
            let paramArr = typeof paramInfoObj.dataParamArr !== 'undefined' ? paramInfoObj.dataParamArr : []// 影响当前参数的主参数的集合
            selectSetting.show = function () {
              initDataArr = vue_this.selectShow($(vue_this.$refs.inputParamContent), "#selectTreeParam", paramInfoObj.selectTreeNum, paramInfoObj, sql, paramArr, dataArr, initDataArr)
            }
            selectSetting.hide = function() {
              if (initDataArr && dataArr.length === 0) {
                let selectXs = xmSelect.get(`#${divId}`, true)// 获取当前下拉框的实体对象
                dataArr = selectXs.options.data
                initDataArr = false
              }
              if ($.inArray(paramInfoObj.dataId, associatedParamIdArr) > -1) {
                vue_this.selectHide("#selectTreeParam", paramInfoObj.selectTreeNum,associatedParamIdArr)
              }
            }
          }
          // 设置默认值
          let defaultVal = []
          if (paramInfoObj.dataDefaultVal instanceof Array){
            selectSetting.initValue = paramInfoObj.dataDefaultVal
          }else {
            defaultVal.push(paramInfoObj.dataDefaultVal)
            if (typeof defaultVal !== 'undefined') {
              selectSetting.initValue = defaultVal// 初始化默认值
            }
          }
          defaultVal.push(paramInfoObj.dataDefaultVal)
          if (choiceType === '1') { // 单选
            selectSetting.radio = true
            selectSetting.clickClose = true
          } else {
            selectSetting.on = function(data) {
              let arr = data.arr
              let checkData = data.change.slice(0, 1)// 当前选中的节点数据
              let newDataArr = paramCommonJs.getChildrenData(checkData[0], [checkData[0]])// 获取当前选中的节点数据和其子孙节点数据
              if (data.isAdd) { // 选中时
                // 先将dataArr在arr中已存在的部分移除
                for (let k = 0; k < newDataArr.length; k++) { // 遍历即将取消选中的上级节点
                  for (let j = arr.length - 1; j >= 0; j--) { // 倒叙遍历所有选中的节点
                    if (arr[j].value === newDataArr[k].value && arr[j].pValue === newDataArr[k].pValue) { // 若存在
                      arr.splice(j, 1)// 则倒序移除
                      break
                    }
                  }
                }
                // 将下拉树组装好的数据进行拆分，把每个对象的孩子差分出来
                let preDataArr = paramCommonJs.getSplitDataArr(dataArr)
                // 根据当前节点递归获取未被选中的且需要被选中的上级节点
                let parentUnCheckedArr = paramCommonJs.getParentUnChecked(checkData[0], [], preDataArr, arr)
                newDataArr = newDataArr.concat(parentUnCheckedArr)
                arr.push.apply(arr, newDataArr)// 将新选中的与已选中的进行合并
              } else { // 取消选中时
                // 根据当前节点递归获取被选中的且需要取消选中的上级节点
                let parentCheckedArr = paramCommonJs.getParentChecked(checkData[0], [], arr)
                // 遍历取消上级节点的选中状态
                for (let k = 0; k < parentCheckedArr.length; k++) { // 遍历即将取消选中的上级节点
                  for (let j = arr.length - 1; j >= 0; j--) { // 倒叙遍历所有选中的节点
                    if (arr[j].value === parentCheckedArr[k].value && arr[j].pValue === parentCheckedArr[k].pValue) { // 若存在则倒序移除
                      arr.splice(j, 1)
                      break
                    }
                  }
                }
                // 遍历取消当前节点的子孙节点的选中状态
                for (let m = 0; m < newDataArr.length; m++) { // 遍历即将取消选中的节点
                  for (let n = arr.length - 1; n >= 0; n--) { // 倒叙遍历所有选中的节点
                    if (arr[n].value === newDataArr[m].value && arr[n].pValue === newDataArr[m].pValue) { // 若存在则倒序移除
                      arr.splice(n, 1)
                      break
                    }
                  }
                }
              }
              return arr
            }
          }
          xmSelect.render(selectSetting)
        }
      }
      this.loading.destroy()
    },
    /**
     * 根据影响当前参数的主参所选中的值，过滤当前参数的数据
     * @param dom 遮罩层dom对象
     * @param idStr 当前下拉框是下拉列表还是下拉树（传它们的部分ID标识）
     * @param ind 参数的标识（下标）
     * @param paramInfoObj 参数信息对象
     * @param sql 当前参数的SQL语句
     * @param paramArr 它受谁影响，即它为被关联参数时，其主参数的集合
     * @param dataArr 原始数据（未过滤之前的数据）
     * @param initDataArr 此次加载的是否是初始化数据
     * @description 下拉框展开时调用
     * @author JL
     */
    async selectShow(dom, idStr, ind, paramInfoObj, sql, paramArr, dataArr, initDataArr) {
      this.loading = $(dom).mLoading({ 'text': '参数数据请求中，请稍后……', 'hasCancel': false })
      // 找出该参数与被关联参数之间的联系（它影响谁和谁影响它两种）
      try {
        let sqlWhereStr = ''
        let selectXs = null
        // 在当前参数列表中匹配影响当前参数的主参数集合，获取其选中的值拼接where条件
        for (let t = 0; t < paramArr.length; t++) {
          if (paramArr[t].paramId === paramInfoObj.dataId) {
            selectXs = xmSelect.get(idStr + ind, true)// 获取当前下拉框的实体对象
            let selectedObjArr = selectXs.getValue()// 获取选中的参数值集合
            if (selectedObjArr && selectedObjArr.length > 0) {
              let associatedParamCol = paramArr[t].associatedParamCol// 被关联参数值（对应的列名称）
              let key = paramArr[t].paramValueType === 'realValue' ? 'value' : 'name'// 判断是真实值还是显示值
              if (paramInfoObj.dataChoiceType === '1') { // 单选
                sqlWhereStr += ' and ' + associatedParamCol + "='" + selectedObjArr[0][key] + "'"
              } else { // 多选
                let valueStr = ''
                for (let k = 0; k < selectedObjArr.length; k++) {
                  valueStr += "'" + selectedObjArr[k][key] + "',"
                }
                if (valueStr !== '') {
                  valueStr = valueStr.substring(0, valueStr.length - 1)
                }
                sqlWhereStr += ' and ' + associatedParamCol + ' in (' + valueStr + ')'
              }
            }
            break
          }
        }
        selectXs = xmSelect.get(idStr + ind, true)// 获取当前下拉框的实体对象
        let oldSqlWhereStr = typeof $(idStr + ind).attr('data-sqlWhereStr') !== 'undefined' ? $(idStr + ind).attr('data-sqlWhereStr') : ''
        let response = null;
        if (sqlWhereStr !== '') {
          if (oldSqlWhereStr === '' || oldSqlWhereStr !== sqlWhereStr) {
            sql = 'SELECT * FROM (' + sql + ') where 1=1' + sqlWhereStr
            if (idStr === '#selectParam') { // 下拉列表
              response = await executeParamSql(sql)
            } else { // idStr=='#selectTreeParam'   下拉树
              response = await getSelectTreeData(sql)
            }
            if (response.data.isError) {
              this.loading.destroy()
              this.$message.error(`获取参数${paramInfoObj.dataName}的值的失败，原因：${response.data.message}`)
            } else {
              let newDataArr = []
              if (idStr === '#selectParam') {
                for (let k = 0; k < response.data.paramList.length; k++) {
                  newDataArr.push({
                    'name': response.data.paramList[k].paramName,
                    'value': response.data.paramList[k].paramValue
                  })
                }
              } else { // idStr=='#selectTreeParam'
                newDataArr = paramCommonJs.organizeSelectTreeData(response.data.result)
              }
              selectXs.update({
                data: newDataArr
                // autoRow: true,
              })
              $(idStr + ind).attr('data-sqlWhereStr', sqlWhereStr)
              this.loading.destroy()
            }
          } else {
            this.loading.destroy()
          }
        }
        if (sqlWhereStr === '' && dataArr.length === 0) { // 当影响它的主参没有选择值且本身没数据时（第一次加载全部数据）
          initDataArr = true
          if (idStr === '#selectParam') { // 下拉列表
            response = await executeParamSql(sql)
          } else { // idStr=='#selectTreeParam'   下拉树
            response = await getSelectTreeData(sql)
          }
          if (response.data.isError) {
            this.loading.destroy()
            this.$message.error(`获取参数${paramInfoObj.dataName}的值的失败，原因：${response.data.message}`)
          } else {
            if (idStr === '#selectParam') {
              for (let k = 0; k < response.data.paramList.length; k++) {
                dataArr.push({
                  'name': response.data.paramList[k].paramName,
                  'value': response.data.paramList[k].paramValue
                })
              }
            } else { // idStr=='#selectTreeParam'
              dataArr = paramCommonJs.organizeSelectTreeData(response.data.result)
            }
            selectXs.update({
              data: dataArr
              // autoRow: true,
            })
            this.loading.destroy()
          }
        }
        if (sqlWhereStr === '' && dataArr.length !== 0) {
          if (paramArr.length !== 0) { // 本身受其它参数影响
            selectXs.update({
              data: dataArr
              // autoRow: true,
            })
          }
          $(idStr + ind).removeAttr('data-sqlWhereStr')
          this.loading.destroy()
        }
      } catch (e) {
        this.loading.destroy()
        this.$message.error('程序执行出错，刷新参数数据失败')
        console.info(e)
      }
      return initDataArr
    },
    /**
     * 清空当前参数的被关联参数的值
     * @param idStr 当前下拉框是下拉列表还是下拉树（传它们的部分ID标识）
     * @param ind 参数的标识（下标）
     * @param associatedParamIdArr 当前参数的所有被关联参数ID数组
     * @description 当前参数选中值时调用
     * @author JL
     */
    selectHide(idStr, ind, associatedParamIdArr) {
      let selectXs = xmSelect.get(idStr + ind, true)// 获取当前下拉框的实体对象
      let selectedObj = selectXs.getValue()// 获取选中的参数值
      if (selectedObj && selectedObj.length > 0) {
        selectXs.setValue([])// 清空选中值
      }
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
          if(selectParamDom && selectParamDom.length > 0){
            for(let n=0; n<selectParamDom.length; n++){
              let index = selectParamDom[n].getAttribute("index")
              paramInfoObj = paramInfoArr[index]
              let moduleParamId = paramInfoObj.dataId// 母参数ID
              let allowedNull = typeof paramInfoObj.dataAllowedNull !== 'undefined' ? paramInfoObj.dataAllowedNull : '1'// 是否允许为空，当为undefined时默认为可为空
              let choiceType = paramInfoObj.dataChoiceType// 当前参数是多选还是单选：0：多选，1、单选
              let selectParamXs = xmSelect.get('#selectParam' + paramInfoObj.selectNum, true)// 获取下拉列表参数的单实例
              let paramSelectedObj = selectParamXs.getValue()// 获取选中的参数值名称
              let obj = {
                'moduleParamId': moduleParamId,
                'paramValue': '',
                'allowedNull': '0'
              }
              if (allowedNull === 1) { // 允许为空
                obj.allowedNull = '1'
                if (paramSelectedObj.length === 0) { // 未选择值
                  hasAllowedNullParam = true
                  for (let w = 0; w < arr.length; w++) { // 遍历当前节点绑定的参数，给每个参数绑定空值
                    if (arr[w].moduleParamId === moduleParamId) {
                      arr[w]['value'] = ''
                    }
                  }
                } else {
                  if (choiceType === '1') { // 单选
                    obj.paramValue = paramSelectedObj[0].value
                  } else {
                    for (let j = 0; j < paramSelectedObj.length; j++) { // 多值，以'','',……形式展现
                      obj.paramValue += "'" + paramSelectedObj[j].value + "',"
                    }
                    obj.paramValue = obj.paramValue.substring(0, obj.paramValue.length - 1)
                  }
                }
                filterArr.push(obj)
              } else { // 不允许为空
                if (paramSelectedObj.length !== 0) {
                  if (choiceType === '1') { // 单选
                    obj.paramValue = paramSelectedObj[0].value
                  } else {
                    for (let j = 0; j < paramSelectedObj.length; j++) { // 多值，以'','',……形式展现
                      obj.paramValue += "'" + paramSelectedObj[j].value + "',"
                    }
                    obj.paramValue = obj.paramValue.substring(0, obj.paramValue.length - 1)
                  }
                  filterArr.push(obj)
                } else {
                  paramNum++
                }
              }
            }
          }

          // 获取参数查询条件（下拉树）
          let selectTreeParamDom = this.$refs.selectTreeParam
          if(selectTreeParamDom && selectTreeParamDom.length > 0) {
            for (let m = 0; m < selectTreeParamDom.length; m++) {
              // $(this).find('.selectTreeParam').each(function(i, v) {
              let index = selectTreeParamDom[m].getAttribute("index")
              paramInfoObj = paramInfoArr[index]
              let moduleParamId = paramInfoObj.dataId// 母参数ID
              let allowedNull = typeof paramInfoObj.dataAllowedNull !== 'undefined' ? paramInfoObj.dataAllowedNull : '1'// 是否允许为空，当为undefined时默认为可为空
              let choiceType = paramInfoObj.dataChoiceType// 当前参数是多选还是单选：0：多选，1、单选
              let selectTreeParamXs = xmSelect.get('#selectTreeParam' + paramInfoObj.selectTreeNum, true)// 获取下拉树参数的单实例
              let paramSelectedObj = selectTreeParamXs.getValue()// 获取选中的参数值名称
              let obj = {
                'moduleParamId': moduleParamId,
                'paramValue': '',
                'allowedNull': '0'
              }
              if (allowedNull === 1) { // 允许为空
                obj.allowedNull = '1'
                if (paramSelectedObj.length === 0) { // 未选择值
                  hasAllowedNullParam = true
                  for (let w = 0; w < arr.length; w++) { // 遍历当前节点绑定的参数，给每个参数绑定空值
                    if (arr[w].moduleParamId === moduleParamId) {
                      arr[w]['value'] = ''
                    }
                  }
                } else {
                  if (choiceType === '1') { // 单选
                    obj.paramValue = paramSelectedObj[0].value
                  } else {
                    for (let b = 0; b < paramSelectedObj.length; b++) { // 多值，以'','',……形式展现
                      obj.paramValue += "'" + paramSelectedObj[b].value + "',"
                    }
                    obj.paramValue = obj.paramValue.substring(0, obj.paramValue.length - 1)
                  }
                }
                filterArr.push(obj)
              } else { // 不允许为空
                if (paramSelectedObj.length !== 0) {
                  if (choiceType === '1') { // 单选
                    obj.paramValue = paramSelectedObj[0].value
                  } else {
                    for (let b = 0; b < paramSelectedObj.length; b++) { // 多值，以'','',……形式展现
                      obj.paramValue += "'" + paramSelectedObj[b].value + "',"
                    }
                    obj.paramValue = obj.paramValue.substring(0, obj.paramValue.length - 1)
                  }
                  filterArr.push(obj)
                } else {
                  paramNum++
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
              if (typeof dataLength !== 'undefined' && paramInfoObj.dataDefaultVal.length !== parseInt(dataLength)) { // 如果该参数有长度限制且默认值不等于设置的长度值
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
                      replaceParamSql = replaceParamSql.replace(arr[a].id, filterArr[x].paramValue)// 将参数SQL中的参数ID替换为输入得值
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
