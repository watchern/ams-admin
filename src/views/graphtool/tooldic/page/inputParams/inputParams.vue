<template>
    <div ref="inputParamContent" class="detail-form">
        <el-collapse accordion v-model="activeName">
            <el-collapse-item v-for="(nodeParamInfo,index) in nodeParamInfoArr" :key="nodeParamInfo.nodeId" :title="nodeParamInfo.nodeName" :name="nodeParamInfo.curInd" :index="index" ref="nodeParam">
                <div>
                    <el-row v-for="(paramInfo,ind) in nodeParamInfo.paramInfoArr" :key="ind" style="padding:5px 0;">
                        <el-col :span="7" style="line-height:36px;padding-right: 10px;text-align: right;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;">
                            <el-tooltip :content="getContent(paramInfo)" placement="bottom">
                                <label>{{paramInfo.paramName}}</label>
                            </el-tooltip>
                        </el-col>
                        <el-col :span="15">
                            <!-- <div ref="selectParam" :index="ind" v-if="paramInfo.inputType === 'lineinp'" :id="paramInfo.id" :title="paramInfo.title" :nodeId="nodeParamInfo.nodeId" class="xm-select-demo"></div> -->
                            <!-- 下拉列表类型 -->
                            <el-select @change="changeRelationParam(index,ind)" @click.native="changeparamdata(index,paramInfo,ind)" v-model="paramListValueList[ind]" ref="selectParam"  style="width: 100%;" v-if="paramInfo.inputType === 'lineinp' " 
                                :multiple="paramInfo.dataChoiceType == 0 || paramInfo.dataChoiceType == '0'" filterable clearable>
                                <el-option v-for="(item,i) in paramInfo.data" :value="item.value" :label="item.name" :key="'oplist'+i" >
                                <span style="float: left"> {{ item.name }}</span>
                                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value == item.name ? "" : item.value}}  &nbsp;&nbsp;&nbsp;&nbsp;</span>
                                </el-option>
                            </el-select>
                            <el-input @change="changeRelationParam(index,ind)" @click.native="changeparamdata(index,paramInfo,ind)" ref="paramOption" :index="ind" v-if="paramInfo.inputType === 'textinp'" :title="paramInfo.title" v-model="paramInfo.value" class="textParam"></el-input>
                            <el-date-picker @change="changeRelationParam(index,ind)" @click.native="changeparamdata(index,paramInfo,ind)" ref="paramOption" :index="ind"  v-if="paramInfo.inputType === 'timeinp'" :title="paramInfo.title" type="date" placeholder="选择日期" v-model="paramInfo.value" style="width: 100%;" value-format="yyyy-MM-dd"></el-date-picker>
                            <!-- <div ref="selectTreeParam" :index="ind" v-if="paramInfo.inputType === 'treeinp'" :id="paramInfo.id" :title="paramInfo.title" :nodeId="nodeParamInfo.nodeId" class="xm-select-demo"></div> -->
                            <!-- 树类型参数 -->
                            <el-cascader
                                @change="changeRelationParam(index,ind)"
                                @click.native="changeparamdata(index,paramInfo,ind)"
                                v-model="paramTreeValueList[ind]"
                                v-if="paramInfo.inputType === 'treeinp'"
                                style="width:100%"
                                ref="selectTreeParam"
                                :props="{ label:'name',  multiple: paramInfo.dataChoiceType == 0 || paramInfo.dataChoiceType == '0', emitPath: false}"
                                :options="paramInfo.data"
                                multiple
                                clearable />
                        </el-col>
                        <el-col :span="2" v-show="paramInfo.allowedNull">
                            <div style="color: red;display: inline-block;font-weight: bold;font-size: 20px;">*</div>
                        </el-col>
                    </el-row>
                </div>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script>
    import request from '@/utils/request'
    import '@/components/ams-loading/css/loading.css'
    import { findParamsAndModelRelParams,executeParamSql,getSelectTreeData,replaceModelSqlByParams  } from '@/api/graphtool/apiJs/graphList'
    import * as paramCommonJs from '@/api/graphtool/js/paramCommon'
    export default {
        name: 'InputParams',
        data(){
            return {
                selectNum:0,// 用于临时记录参数为下拉列表的个数
                selectTreeNum:0,// 用于临时记录参数为下拉树的个数
                nodeParamInfoArr:[],
                activeName:[],
                loading:null,
                paramListValueList: [], // 下拉列表参数值集合
                paramTreeValueList: [] // 下拉树列表参数值集合
            }
        },
        props:["nodeData","nodeIdArr"],
        methods:{
            //图形化兼容参数条件
            changeparamdata(index,info,ind){
              let paramsArr = []
              if(info.paramConditionList.length>0){
                console.log('有关联关系')
                this.nodeParamInfoArr[index].paramInfoArr[ind].data = []
                console.log(info.paramConditionList)
                for(let i = 0; i<info.paramConditionList.length;i++){
                    console.log("=====")
                  for(let j =0;j<this.nodeParamInfoArr[index].paramInfoArr.length;j++){
                    if(info.paramConditionList[i].relationParamId == this.nodeParamInfoArr[index].paramInfoArr[j].dataId){
                      console.log(j)
                      console.log(this.nodeParamInfoArr[index].paramInfoArr[j])
                      let repvalue = this.nodeParamInfoArr[index].paramInfoArr[j].inputType == "textinp"?this.nodeParamInfoArr[index].paramInfoArr[j].value:this.nodeParamInfoArr[index].paramInfoArr[j].inputType == "lineinp"?(Array.isArray(this.paramListValueList[j])?this.paramListValueList[j].join(','):this.paramListValueList[j]):this.nodeParamInfoArr[index].paramInfoArr[j].inputType == "treeinp"?(Array.isArray(this.paramTreeValueList[j])?this.paramTreeValueList[j].join(','):this.paramTreeValueList[j]):this.nodeParamInfoArr[index].paramInfoArr[j].value
                      if(this.nodeParamInfoArr[index].paramInfoArr[j].useQuotation == "1" ){
                        if(repvalue!=undefined && repvalue!=''){
                          repvalue = "'" + repvalue + "'"
                        }else{
                          repvalue = ""
                        }
                      }
                      paramsArr.push({
                        id:info.paramConditionList[i].relationParamId,
                        paramValue:repvalue,
                        useQuotation:this.nodeParamInfoArr[index].paramInfoArr[j].useQuotation,
                      })
                    }
                  }
                }
                request({
                  baseURL: '/analysis',
                  url: '/paramConditionController/getParamConditionSqlResult',
                  method: 'post',
                  data:{
                    "paramId":info.dataId,
                    "paramsArr":paramsArr
                  }
                }).then(result => {
                  if(result.data.isError == true){
                    this.$message({type: 'error', message: result.data.message})
                  }else{
                    let list = []
                    for(let i =0;i<result.data.paramList.length;i++){
                      list.push(
                        {
                            'name': result.data.paramList[i].C_NAME,
                            'value': result.data.paramList[i].C_CODE,
                            'pValue':result.data.paramList[i].P_CODE && result.data.paramList[i].P_CODE || 0,
                            // 'pValue':paramCommonJs.pValueFormat(result.data.paramList[i].P_CODE, info),
                            'children': [],
                        }
                      )
                    }
                    this.nodeParamInfoArr[index].paramInfoArr[ind].data = paramCommonJs.matchingPcRelation(list, 0, true)
                  }
                })
              }
            },
            async changeRelationParam(index,ind){
              for(let i=0;i<this.nodeParamInfoArr[index].paramInfoArr.length;i++){
                if(this.nodeParamInfoArr[index].paramInfoArr[i].paramConditionList){
                  //找到被关联参数
                  for(let j =0;j<this.nodeParamInfoArr[index].paramInfoArr[i].paramConditionList.length;j++){
                    if(this.nodeParamInfoArr[index].paramInfoArr[i].paramConditionList[j].relationParamId == this.nodeParamInfoArr[index].paramInfoArr[ind].dataId){
                      if(this.nodeParamInfoArr[index].paramInfoArr[i].selectNum==1){
                        this.paramListValueList[i] = []
                      }else{
                        this.paramListValueList[i] = ''
                      }
                      this.changeparamdata(this.nodeParamInfoArr[index].paramInfoArr[i],i)
                      this.$forceUpdate() 
                    }
                  }
                }
              }
            },
            /**
             * 组织所有待执行节点队列中有参数设置的节点的HTML
             * @author JL
             */
            async createParamNodeHtml(type){
                try {
                    this.loading = $(this.$refs.inputParamContent).mLoading({ 'text': '正在初始化数据，请稍后……', 'hasCancel': false })
                    let paramsArr = []// 定义所有母参信息数组
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
                    let nodeParamObj = {}// 节点与参数配置绑定的对象
                    let replist = []
                    //增加情况判断是否是全部执行
                    if(type=="all"){
                        replist = Object.keys(this.nodeData)
                    }else{
                        replist = this.nodeIdArr
                    }
                    for (let i = 0; i < replist.length; i++) {
                        let hasParam = this.nodeData[replist[i]].hasParam// 是否有参数
                        let paramsSetting = this.nodeData[replist[i]].paramsSetting
                        if (hasParam && paramsSetting && paramsSetting.arr && paramsSetting.arr.length !== 0) {
                            let copyParamArr = []// 定义所有参数的对象数组（已去重）
                            let arr = paramsSetting.arr// 获取设置的参数数组
                            let moduleParamArr = []// 母参数数组（去重用）
                            for (let j = 0; j < arr.length; j++) { // 循环节点上绑定的参数（复制参数）
                                for (let k = 0; k < paramsArr.length; k++) { // 循环所有母版参数
                                    let moduleParamId = paramsArr[k].ammParamUuid
                                    if (moduleParamId === arr[j].moduleParamId && $.inArray(moduleParamId, moduleParamArr) < 0) { // 匹配复制参数的母版参数ID
                                        if (arr[j].defaultVal) {
                                            paramsArr[k].defaultVal = arr[j].defaultVal
                                        }
                                        copyParamArr.push(paramsArr[k])
                                        moduleParamArr.push(moduleParamId)
                                        // break
                                    }
                                }
                            }
                            if (copyParamArr.length > 0) {
                                nodeParamObj[replist[i]] = copyParamArr
                            }
                        }
                    }
                    let keys = Object.keys(nodeParamObj)// 获取有参数设置的节点的ID集合
                    for (let j = 0; j < keys.length; j++) {
                        let curNodeId = keys[j]
                        let nodeParamInfoObj = {
                            "curInd": j,
                            "nodeId": curNodeId,
                            "nodeName": `【${this.nodeData[curNodeId].nodeInfo.nodeName}】节点`,
                            "paramInfoArr": [],
                        }
                        if (j === 0) {
                            this.activeName.push(j)
                        }
                        // 遍历该节点绑定的所有参数
                        let copyParamArr = nodeParamObj[keys[j]]
                        for (let k = 0; k < copyParamArr.length; k++) {
                            let paramInfoObj = {
                                "paramName": copyParamArr[k].paramName,
                                "description": '（参数说明：无）',
                                "inputType": copyParamArr[k].inputType,//参数类型
                                "useQuotation":copyParamArr[k].useQuotation,
                                "example":copyParamArr[k].example,
                                "paramConditionList":copyParamArr[k].paramConditionList,
                            }
                            if (typeof copyParamArr[k].description !== 'undefined' && copyParamArr[k].description != null) {
                                paramInfoObj.description = '（参数说明：' + copyParamArr[k].description + '）'
                            }
                            let returnObj = await this.initParamHtml(copyParamArr[k], paramInfoObj, this.selectNum, this.selectTreeNum, k)
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
                            nodeParamInfoObj.paramInfoArr.push(paramInfoObj)
                        }
                        this.nodeParamInfoArr.push(nodeParamInfoObj)
                    }
                    this.$nextTick(() => {
                        // this.initParamInputAndSelect()
                        this.loading.destroy()
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
                            // 下拉列表默认值
                            if (paramObj.paramChoice.choiceType === '1'){
                            // 单选
                            // this.paramListValueList[index] = paramObj.defaultVal
                            this.paramListValueList[index] = paramObj.useQuotation == '1'? `'` + paramObj.defaultVal + `'` : paramObj.defaultVal
                            } else {
                            // 多选
                            const list = [] 
                            paramObj.defaultVal.forEach(o => {
                                if(paramObj.useQuotation == '1') { list.push(`'` + o + `'`) }
                                else {list.push(o) }
                                // list.push(o)
                            })
                            this.paramListValueList[index] = list
                            }
                            // 默认值
                            obj.setParamObj.value = this.paramListValueList[index]
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
                            obj.setParamObj.dataDefaultVal = paramObj.defaultVal
                            // 默认值
                            obj.setParamObj.value = paramObj.defaultVal
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
                                // 默认值
                                obj.setParamObj.value = paramObj.defaultVal
                            }
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
                                // this.paramTreeValueList[index] = paramObj.defaultVal
                                this.paramTreeValueList[index] = paramObj.useQuotation == '1' ? `'` + paramObj.defaultVal + `'` : paramObj.defaultVal
                            } else {
                                // 多选
                                const list = []
                                paramObj.defaultVal.forEach(o => {
                                    if(paramObj.useQuotation == '1') { list.push(`'` + o + `'`) }
                                    else { list.push(o) }
                                    // list.push(o)
                                })
                                this.paramTreeValueList[index] = list
                            }
                            // 默认值
                            obj.setParamObj.value = this.paramTreeValueList[index]
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
             * 替换参数
             * @return {{verify: boolean, message: string}}
             * @author JL
             */
            async replaceNodeParam() {
                let _this = this
                let returnObj = {
                    'verify': true, // 校验是否通过
                    'message': ''// 提示信息
                }
                // 循环所有节点
                let nodeParamDom = this.$refs.nodeParam
                if(nodeParamDom && nodeParamDom.length > 0){
                    for(let i=0; i<nodeParamDom.length; i++){
                        let filterArr = []// 参数条件的数组，包含参数ID和参数值
                        let paramNum = 0// 记录参数不允许为空却未输入值的参数数量
                        let hasAllowedNullParam = false// 本次查询是否含有可为空的参数条件
                        let index = nodeParamDom[i].$attrs.index
                        let nodeName = this.nodeParamInfoArr[index].nodeName// 当前节点的名称
                        let nodeId = this.nodeParamInfoArr[index].nodeId// 当前节点的ID
                        let paramsSetting = this.nodeData[nodeId].paramsSetting// 获取当前节点得参数配置信息
                        let replaceParamSql = paramsSetting.sql// 获取参数的SQL语句(替换后的sql)
                        let arr = paramsSetting.arr// 参数数组
                        // 先去除已存在的value值
                        for (let k = 0; k < arr.length; k++) {
                            if (typeof arr[k].value !== 'undefined') {
                                delete arr[k].value
                            }
                        }
                        let paramInfoArr = this.nodeParamInfoArr[index].paramInfoArr
                        let paramInfoObj = null
                        // 获取参数查询条件（文本框）
                        let paramOptionDom = this.$refs.paramOption
                        if(paramOptionDom && paramOptionDom.length > 0) {
                          for (let j = 0; j < paramOptionDom.length; j++) {
                            let index = paramOptionDom[j].$attrs.index
                            if (index < paramInfoArr.length) {
                              paramInfoObj = paramInfoArr[index]
                              let moduleParamId = paramInfoObj.dataId// 母参数ID
                              let allowedNull = typeof paramInfoObj.dataAllowedNull !== 'undefined' ? paramInfoObj.dataAllowedNull : '1'// 是否允许为空，当为undefined时默认为可为空
                              for (let w = 0; w < arr.length; w++) { // 遍历当前节点绑定的参数，给每个参数绑定空值
                                if (arr[w].moduleParamId === moduleParamId) {
                                  arr[w]['allowedNull'] = allowedNull
                                }
                              }
                              let paramValue = typeof paramInfoObj.value !== 'undefined' ? paramInfoObj.value : ""
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
                        }

                        // 获取参数查询条件（下拉列表）
                        let selectParamDom = this.$refs.selectParam
                        if(selectParamDom && selectParamDom.length > 0){
                            for(var listnum = 0; listnum< this.paramListValueList.length;listnum++){
                                if( typeof this.paramListValueList[listnum] !== 'undefined'){
                                    paramInfoObj = paramInfoArr[listnum]
                                    let moduleParamId = paramInfoObj.dataId// 母参数ID
                                    let allowedNull = typeof paramInfoObj.dataAllowedNull !== 'undefined' ? paramInfoObj.dataAllowedNull : '1'// 是否允许为空，当为undefined时默认为可为空
                                    let choiceType = paramInfoObj.dataChoiceType// 当前参数是多选还是单选：0：多选，1、单选
                                    let obj = {
                                        'moduleParamId': moduleParamId,
                                        'paramValue': '',
                                        'allowedNull': '0'
                                    }
                                    for (let w = 0; w < arr.length; w++) { // 遍历当前节点绑定的参数，给每个参数绑定空值
                                        if (arr[w].moduleParamId === moduleParamId) {
                                            arr[w]['allowedNull'] = allowedNull
                                        }
                                    }
                                    if (allowedNull === 1) { // 允许为空
                                        obj.allowedNull = '1'
                                        if (this.paramListValueList[listnum].length === 0) { // 未选择值
                                            hasAllowedNullParam = true
                                            for (let w = 0; w < arr.length; w++) { // 遍历当前节点绑定的参数，给每个参数绑定空值
                                                if (arr[w].moduleParamId === moduleParamId) {
                                                arr[w]['value'] = ''
                                                }
                                            }
                                        } else {
                                            if (choiceType === '1') { // 单选
                                                obj.paramValue = _this.paramListValueList[listnum]
                                            } else { // 多选
                                                obj.paramValue = _this.paramListValueList[listnum].join(',')
                                            }
                                        }
                                        filterArr.push(obj)
                                    } else { // 不允许为空
                                        if (this.paramListValueList[listnum].length !== 0) {
                                            if (choiceType === '1') { // 单选
                                                obj.paramValue = _this.paramListValueList[listnum]
                                            } else {
                                                obj.paramValue = _this.paramListValueList[listnum].join(',')
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
                                    for (let w = 0; w < arr.length; w++) { // 遍历当前节点绑定的参数，给每个参数绑定空值
                                        if (arr[w].moduleParamId === moduleParamId) {
                                            arr[w]['allowedNull'] = allowedNull
                                        }
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
                            returnObj.message += nodeName + '含有未输入值的参数项，请重新输入\n'
                            delete this.nodeData[nodeId].replaceParamSql
                            break
                        } else {
                            // 第二步，判断设置长度值文本框输入的值是否满足条件
                            let textParamLen = $(nodeParamDom[i]).find('.textParam').length
                            for (let t = 0; t < textParamLen; t++) {
                                let textParam = $(nodeParamDom[i]).find('.textParam:eq(' + t + ')')
                                let index = textParam.attr("index")
                                paramInfoObj = paramInfoArr[index]
                                let dataLength = paramInfoObj.dataDatalength// 获取参数值长度
                                let paramName = paramInfoObj.dataName// 获取参数名称
                                if (typeof dataLength !== 'undefined' && paramInfoObj.value.length > parseInt(dataLength)) { // 如果该参数有长度限制且默认值不等于设置的长度值
                                    returnObj.verify = false
                                    returnObj.message += nodeName + '的参数【' + paramName + '】输入值的长度与设置的长度值【' + parseInt(dataLength) + '】不相等'
                                    break
                                }
                            }
                            if (!returnObj.verify) {
                                break
                            } else {
                                if (hasAllowedNullParam) { // 如果存在可为空的参数并且为空值，走后台进行空参替换
                                    const response = await replaceModelSqlByParams(replaceParamSql, JSON.stringify(arr))
                                    if(response.data == null || response.data.isError){// 出错后replaceParamSql的值会在后台置为空
                                        returnObj.verify = false
                                        returnObj.message = nodeName + '替换空值参数时出错'
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
                                                replaceParamSql = replaceParamSql.replace(arr[a].id, filterArr[x].paramValue)// 将参数SQL中的参数ID替换为输入得值
                                            }
                                        }
                                    }
                                    this.nodeData[nodeId].replaceParamSql = replaceParamSql
                                } else {
                                    break
                                }
                            }
                        }
                    }
                }
                return returnObj
            },
            /**
             * 获取参数的全部title信息
             * @param obj
             */
            getContent(obj){
                return `${obj.paramName}【${obj.description}】`
            }
        }
    }
</script>
<style scoped type="text/css">
    xm-select > .xm-body{
        max-height: 240px !important;
    }
</style>
