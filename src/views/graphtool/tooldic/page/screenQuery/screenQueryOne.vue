<template>
    <div ref="screenTableMain" :style="screenStyle" v-loading="screenLoading" element-loading-text="数据加载中">
        <el-collapse v-model="activeName" accordion v-if="queryFilter">
            <el-collapse-item name="1" title="查询条件">
                <div :style="collapseStyle">
                    <el-row v-for="(filter,ind) in queryFilterArr" :key="ind">
                        <el-col :span="4" style="line-height:36px;padding-right: 10px;text-align: right;">
                            <label>{{filter.paramName}}</label>
                        </el-col>
                        <el-col :span="6">
                            <div ref="selectParamScreen" :index="ind" v-if="filter.inputType === 'lineinp'" :id="filter.id" :title="filter.title" class="xm-select-demo"></div>
                            <el-input ref="paramOptionScreen" :index="ind" v-if="filter.inputType === 'textinp'" :title="filter.title" v-model="filter.value" class="textParam"></el-input>
                            <el-date-picker ref="paramOptionScreen" :index="ind"  v-if="filter.inputType === 'timeinp'" :title="filter.title" type="date" placeholder="选择日期" v-model="filter.value" style="width: 100%;"></el-date-picker>
                            <div ref="selectTreeParamScreen" :index="ind" v-if="filter.inputType === 'treeinp'" :id="filter.id" :title="filter.title" class="xm-select-demo"></div>
                        </el-col>
                        <el-col :span="1" v-show="filter.allowedNull">
                            <div style="color: red;display: inline-block;font-weight: bold;font-size: 20px;">*</div>
                        </el-col>
                        <el-col :span="9" style="line-height:36px;">
                            <label>{{filter.description}}</label>
                        </el-col>
                        <el-col :span="4" v-show="ind === 0" style="text-align: center;">
                            <el-button v-show="!initQuery" type="primary" @click="queryData">查询</el-button>
                            <el-button v-show="!initQuery" type="primary" @click="resetQuery">清空</el-button>
                            <el-button v-show="initQuery" type="primary" @click="initQueryData">初始化查询</el-button>
                        </el-col>
                    </el-row>
                </div>
            </el-collapse-item>
            <el-collapse-item name="2" title="查询结果">
                <el-row>
                    <el-col style="text-align: right;padding-right: 30px;">
                        <el-button type="primary" @click="dealData('filter')">筛选</el-button>
                        <el-button type="primary" @click="dealData('sort')">排序</el-button>
                        <el-button type="primary" @click="dealData('groupCount')">分组统计</el-button>
                    </el-col>
                </el-row>
                <el-row>
                    <ChildTabCons ref="resultTable" use-type="graph" :nowtable="resultInfo" :prePersonalVal="resultInfo" v-if="showTableResult"/>
                </el-row>
            </el-collapse-item>
        </el-collapse>
        <div v-if="!queryFilter">
            <el-row>
                <el-col :span="10">
                    <el-button type="primary" @click="dealData('filter')">筛选</el-button>
                    <el-button type="primary" @click="dealData('sort')">排序</el-button>
                    <el-button type="primary" @click="dealData('groupCount')">分组统计</el-button>
                </el-col>
                <el-col :span="10" style="float: right;text-align: right;padding-right: 30px;">
                    <el-button v-show="!initQuery" type="primary" @click="queryData">查询</el-button>
                    <el-button v-show="!initQuery" type="primary" @click="resetQuery">清空</el-button>
                    <el-button v-show="initQuery" type="primary" @click="initQueryData">初始化查询</el-button>
                </el-col>
            </el-row>
            <el-row>
                <ChildTabCons ref="resultTable" use-type="graph" :nowtable="resultInfo" :prePersonalVal="resultInfo" v-if="showTableResult"/>
            </el-row>
        </div>
        <el-dialog v-if="nodeParamDialogVisible" :visible.sync="nodeParamDialogVisible" title="前置节点参数设置" :close-on-press-escape="autoCloseDialog" :close-on-click-modal="autoCloseDialog" width="600px">
            <InputParams ref="inputParams" :nodeData="allNodeData" :nodeIdArr="executeNodeIdArr"/>
            <div slot="footer">
                <el-button @click="nodeParamDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="executeParamCallBack">保存</el-button>
            </div>
        </el-dialog>
        <el-dialog v-if="dataDealDialogVisible" :visible.sync="dataDealDialogVisible" :title="dataDealDialogTitle" :close-on-press-escape="autoCloseDialog" :close-on-click-modal="autoCloseDialog" width="1000px">
            <ScreenQueryFilter ref="dataDealScreen" v-if="dataDealType === 'filter'" :columnInfoArr="columnInfoArr" :nodes="settingObj.filterSetting"/>
            <ScreenQuerySort ref="dataDealScreen" v-if="dataDealType === 'sort'" :columnInfoArr="columnInfoArr" :setting="settingObj.sortSetting"/>
            <ScreenQueryGroupCount ref="dataDealScreen" v-if="dataDealType === 'groupCount'" :columnInfoArr="columnInfoArr" :setting="settingObj.groupCountSetting"/>
            <div slot="footer">
                <el-button @click="dataDealDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="dealDataCallBack">保存</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import InputParams from '@/views/graphtool/tooldic/page/inputParams/inputParams.vue'
    import ChildTabCons from "@/views/analysis/auditmodelresult/childtabcon"
    import ScreenQueryFilter from '@/views/graphtool/tooldic/page/screenQuery/screenQuery_filter.vue'
    import ScreenQuerySort from '@/views/graphtool/tooldic/page/screenQuery/screenQuery_sort.vue'
    import ScreenQueryGroupCount from '@/views/graphtool/tooldic/page/screenQuery/screenQuery_groupCount.vue'
    import { findParamsAndModelRelParams,executeParamSql,getSelectTreeData,replaceModelSqlByParams,
        getScreenGraphInfo,getScreenExecuteSql,selectScreenQueryData,dealReplaceParamSql } from '@/api/graphtool/apiJs/graphList'
    import * as paramCommonJs from '@/views/graphtool/tooldic/js/paramCommon'
    import { getPreNodesNotDatasource } from '@/views/graphtool/tooldic/js/common'
    export default {
        name: "screenQueryOne",
        components:{ InputParams, ChildTabCons, ScreenQueryFilter, ScreenQuerySort, ScreenQueryGroupCount },
        data() {
            return {
                screenLoading: true,
                loginUserUuid:'',//当前登录人的UUID
                screenStyle: '',
                collapseStyle:'',
                settingObj: {
                    "initSql": "",//初始化或带参数查询的SQL语句
                    "filterSetting": [],
                    "sortSetting": [],
                    "groupCountSetting": {
                        "countData": [],
                        "groupData": []
                    }
                },
                paramsArr: [],//系统所有参数集合
                arr: [],//当前节点绑定的所有参数集合
                sql: '',//当前节点的查询SQL语句
                paramSql: '',//当前节点的参数SQL语句
                dataParamSql: '',//当前列表数据的查询条件
                curReplaceParamSql:'',//当前节点的参数SQL
                columnInfoArr: [],//显示的列信息集合
                isQuery: false,//是否查询过结果
                selectNum: 0, //定义查询条件为下拉列表的参数个数
                selectTreeNum: 0,//定义查询条件为下拉树的参数个数
                allNodeData: {}, //当前图形的所有节点的数据
                executeNodeIdArr:[],//当前节点的前置节点ID集合
                curOptType: '',//当前节点的类型
                rsCurPage: {},//当前分页对象的部分信息（包括当前页码、当前每页显示条数）
                loginUserId:'',//当前登录人的ID
                queryFilterArr:[],//查询条件集合
                queryFilter:false,
                activeName:'1',
                initQuery:false,//是否有结果集
                resultInfo:null,//查询结果集的数据信息
                showTableResult:false,//是否展示查询结果列表
                autoCloseDialog:false,
                nodeParamDialogVisible:false,
                dataDealDialogVisible:false,
                dataDealDialogTitle:'',
                dataDealType:''
            }
        },
        props: ['screenParam'],
        mounted() {
            this.init()
        },
        methods: {
            async init() {
                let height = $(this.$parent.$parent.$parent.$parent.$refs.screenMainContain).height() - 70
                this.screenStyle = `width:100%;height:${height}px;overflow-y:auto;`
                this.collapseStyle = `width:100%;height:${height - 130}px;overflow-y:auto;`
                this.loginUserId = this.$store.state.user.code
                this.loginUserUuid = this.$store.state.user.id
                let nodeId = this.screenParam.nodeData.nodeInfo.nodeId
                let nodeName = this.screenParam.nodeData.nodeInfo.nodeName
                try {
                    //获取图形节点的所有参数信息
                    let response = await findParamsAndModelRelParams()
                    if (response.data == null){
                        this.$message.error("查询条件信息获取失败")
                    }else {
                        if (response.data.isError) {
                            this.$message.error(response.data.message)
                        } else {
                            this.paramsArr = response.data.paramList// 定义所有母参信息数组
                            //先根据节点ID获取当前节点的基本信息和所有参数信息
                            response = await getScreenGraphInfo({
                                "graphUuid": this.screenParam.graphUuid,
                                "nodeId": nodeId
                            })
                            if (response.data == null || response.data.isError) {
                                this.$message.error(`获取节点${nodeName}的信息失败`)
                                return;
                            }
                            if (typeof response.data.graphObj === "undefined" || response.data.graphObj == null) {
                                this.$message.error(`获取图形${this.screenParam.graphName}的信息失败`)
                                return;
                            }
                            if (typeof response.data.nodeObj === "undefined" || response.data.nodeObj == null) {
                                this.$message.error(`获取节点${nodeName}的信息失败`)
                                return;
                            }
                            this.allNodeData = JSON.parse(response.data.graphObj.nodeData)
                            //获取当前节点所有数据
                            let curNodeData = JSON.parse(response.data.nodeObj.nodeData)
                            this.curOptType = curNodeData.nodeInfo.optType;//获取当前节点的类型
                            //刷新数据分层节点的下标
                            if (this.curOptType === "layering" && this.allNodeData[nodeId].setting) {
                                if (typeof this.screenParam.layering_index === 'undefined') {//默认加载第一个分层区间，否则为自主选择的分层区间
                                    this.screenParam.layering_index = 0
                                }
                                this.allNodeData[nodeId].setting.index = this.screenParam.layering_index
                            }
                            //组装列表字段数组
                            var columnsInfo = curNodeData.columnsInfo;
                            Array.from(curNodeData.columnsInfo, item => {
                                if(item.isOutputColumn === 1){
                                    this.columnInfoArr.push(item);
                                }
                            })
                            //获取参数配置信息
                            let paramsSetting = curNodeData.paramsSetting
                            let isError = false
                            let message = ""
                            if (curNodeData.hasParam) {//如果当前节点设置了参数，则拼接参数html元素代码
                                this.queryFilter = true
                                this.paramSql = paramsSetting.sql//获取参数的SQL语句
                                this.arr = paramsSetting.arr//获取设置的参数数组
                                let moduleParamArr = []//母参数数组（去重用）
                                for (let j = 0; j < this.arr.length; j++) {//循环节点上绑定的参数（复制参数）
                                    let copyParamObj = {};//定义复制参数的对象
                                    for (let m = 0; m < this.paramsArr.length; m++) {//循环所有母版参数
                                        let moduleParamId = this.paramsArr[m].ammParamUuid
                                        if (moduleParamId === this.arr[j].moduleParamId && $.inArray(moduleParamId, moduleParamArr) < 0) {//匹配复制参数的母版参数ID
                                            copyParamObj = $.extend(true, {}, this.paramsArr[m])
                                            if (this.arr[j].defaultVal) {
                                                copyParamObj.defaultVal = this.arr[j].defaultVal
                                            }
                                            moduleParamArr.push(moduleParamId)
                                            break
                                        }
                                    }
                                    if (Object.keys(copyParamObj).length === 0) {
                                        continue
                                    }
                                    let queryFilterObj = {
                                        "paramName": copyParamObj.paramName,
                                        "description": '（参数说明：无）',
                                        "inputType": copyParamObj.inputType//参数类型
                                    }
                                    if (typeof copyParamObj.description !== 'undefined' && copyParamObj.description != null) {
                                        queryFilterObj.description = '（参数说明：' + copyParamObj.description + '）'
                                    }
                                    let returnObj = await this.initParamHtml(copyParamObj, queryFilterObj, this.selectNum, this.selectTreeNum)
                                    if (typeof returnObj.selectNum !== 'undefined') {
                                        this.selectNum = returnObj.selectNum
                                        queryFilterObj.selectNum = returnObj.selectNum
                                    }
                                    if (typeof returnObj.selectTreeNum !== 'undefined') {
                                        this.selectTreeNum = returnObj.selectTreeNum
                                        queryFilterObj.selectTreeNum = returnObj.selectTreeNum
                                    }
                                    if (returnObj.isError) {
                                        this.$message.error(returnObj.message)
                                        return
                                    } else {
                                        queryFilterObj = {...queryFilterObj, ...returnObj.setParamObj}
                                    }
                                    this.queryFilterArr.push(queryFilterObj)
                                }
                                this.$nextTick(() => {
                                    //初始化文本框、下拉列表、下拉树
                                    this.initParamInputAndSelect();
                                })
                                this.screenLoading = false
                            } else {
                                this.screenLoading = false
                                this.initQuery = true
                            }
                            if (isError) {
                                this.$message.error(message);
                            }
                        }
                    }
                }catch (e) {
                    this.screenLoading = false
                    this.$message.error('初始化数据失败');
                    console.info(e);
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
                let nodeId = this.screenParam.nodeData.nodeInfo.nodeId
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
                        obj.selectNum++
                        obj.setParamObj.id = `selectParamScreen${obj.selectNum}${nodeId}`
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
                                obj.setParamObj.value = paramObj.defaultVal
                            }
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
                        obj.selectTreeNum++
                        obj.setParamObj.id = `selectTreeParamScreen${obj.selectTreeNum}${nodeId}`
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
             * 初始化下拉列表、下拉树，并反显默认值
             * @author JL
             */
            initParamInputAndSelect() {
                let vue_this = this
                // 初始化下拉列表
                let selectParamScreen = this.$refs.selectParamScreen
                if (selectParamScreen && selectParamScreen.length > 0) {
                    for(let i=0; i<selectParamScreen.length; i++) {
                        let index = selectParamScreen[i].getAttribute("index")
                        let divId = selectParamScreen[i].getAttribute("id")
                        let queryFilterObj = this.queryFilterArr[index]
                        let choiceType = queryFilterObj.dataChoiceType// 下拉列表的数据是单选还是多选
                        let sql = typeof queryFilterObj.dataSql !== 'undefined' ? queryFilterObj.dataSql : ''// 该参数是否有SQL语句（0否1是）
                        let dataArr = typeof queryFilterObj.data !== 'undefined' ? queryFilterObj.data : []// 下拉列表数据
                        let initDataArr = false// 是否初始化数据
                        let selectSetting = {
                            el: `#${divId}`,
                            filterable: true,
                            filterMethod: function (val, item) {
                                if (val === item.value || (item.name && item.name.indexOf(val) > -1)) { // 把value相同的搜索出来或者把名称中包含的搜索出来
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
                            let associatedParamIdArr = typeof queryFilterObj.dataAssociatedParamIdArr !== 'undefined' ? queryFilterObj.dataAssociatedParamIdArr : []// 当前参数的被关联的参数的集合
                            let paramArr = typeof queryFilterObj.dataParamArr !== 'undefined' ? queryFilterObj.dataParamArr : []// 影响当前参数的主参数的集合
                            selectSetting.show = function () {
                                initDataArr = vue_this.selectShow($(vue_this.$refs.screenTableMain), '#selectParamScreen', queryFilterObj.selectNum, queryFilterObj, sql, paramArr, dataArr, initDataArr)
                            }
                            selectSetting.hide = function () {
                                if (initDataArr && dataArr.length === 0) {
                                    let selectXs = xmSelect.get(divId, true)// 获取当前下拉框的实体对象
                                    dataArr = selectXs.options.data
                                    initDataArr = false
                                }
                                if ($.inArray(queryFilterObj.dataId, associatedParamIdArr) > -1) {
                                    vue_this.selectHide('#selectParamScreen', queryFilterObj.selectNum,associatedParamIdArr)
                                }
                            }
                        }
                        // 设置默认值
                        let defaultVal = queryFilterObj.dataDefaultVal
                        if (typeof defaultVal !== 'undefined') {
                            selectSetting.initValue = defaultVal// 初始化默认值
                        }
                        xmSelect.render(selectSetting)
                    }
                }
                // 初始化下拉树
                let selectTreeParamScreen = this.$refs.selectTreeParamScreen
                if (selectTreeParamScreen && selectTreeParamScreen.length > 0) {
                    for(let i=0; i<selectTreeParamScreen.length; i++){
                        let index = selectTreeParamScreen[i].getAttribute("index")
                        let divId = selectTreeParamScreen[i].getAttribute("id")
                        let queryFilterObj = this.queryFilterArr[index]
                        let choiceType = queryFilterObj.dataChoiceType// 下拉列表的数据是单选还是多选
                        let sql = typeof queryFilterObj.dataSql !== 'undefined' ? queryFilterObj.dataSql : ''// 该参数是否有SQL语句（0否1是）
                        let dataArr = typeof queryFilterObj.data !== 'undefined' ? queryFilterObj.data : []// 下拉列表数据
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
                            let associatedParamIdArr = typeof queryFilterObj.dataAssociatedParamIdArr !== 'undefined' ? queryFilterObj.dataAssociatedParamIdArr : []// 当前参数的被关联的参数的集合
                            let paramArr = typeof queryFilterObj.dataParamArr !== 'undefined' ? queryFilterObj.dataParamArr : []// 影响当前参数的主参数的集合
                            selectSetting.show = function () {
                                initDataArr = vue_this.selectShow($(vue_this.$refs.screenTableMain), "#selectTreeParamScreen", queryFilterObj.selectTreeNum, queryFilterObj, sql, paramArr, dataArr, initDataArr)
                            }
                            selectSetting.hide = function() {
                                if (initDataArr && dataArr.length === 0) {
                                    let selectXs = xmSelect.get(divId, true)// 获取当前下拉框的实体对象
                                    dataArr = selectXs.options.data
                                    initDataArr = false
                                }
                                if ($.inArray(queryFilterObj.dataId, associatedParamIdArr) > -1) {
                                    vue_this.selectHide("#selectTreeParamScreen", queryFilterObj.selectTreeNum,associatedParamIdArr)
                                }
                            }
                        }
                        // 设置默认值
                        let defaultVal = queryFilterObj.dataDefaultVal
                        if (typeof defaultVal !== 'undefined') {
                            selectSetting.initValue = defaultVal// 初始化默认值
                        }
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
                                        for (let n = arr.length - 1; n>= 0; n--) { // 倒叙遍历所有选中的节点
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
            },
            /**
             * 根据影响当前参数的主参所选中的值，过滤当前参数的数据
             * @param dom 遮罩层dom对象
             * @param idStr 当前下拉框是下拉列表还是下拉树（传它们的部分ID标识）
             * @param ind 参数的标识（下标）
             * @param queryFilterObj 参数信息对象
             * @param sql 当前参数的SQL语句
             * @param paramArr 它受谁影响，即它为被关联参数时，其主参数的集合
             * @param dataArr 原始数据（未过滤之前的数据）
             * @param initDataArr 此次加载的是否是初始化数据
             * @description 下拉框展开时调用
             * @author JL
             */
            async selectShow(dom, idStr, ind, queryFilterObj, sql, paramArr, dataArr, initDataArr) {
                // this.loading = $(dom).mLoading({ 'text': '参数数据请求中，请稍后……', 'hasCancel': false })
                this.screenLoading = true
                let nodeId = this.screenParam.nodeData.nodeInfo.nodeId
                // 找出该参数与被关联参数之间的联系（它影响谁和谁影响它两种）
                try {
                    let sqlWhereStr = ''
                    let selectXs = null
                    // 在当前参数列表中匹配影响当前参数的主参数集合，获取其选中的值拼接where条件
                    for (let t = 0; t < paramArr.length; t++) {
                        if (paramArr[t].paramId === queryFilterObj.dataId) {
                            selectXs = xmSelect.get(idStr + ind + nodeId, true)// 获取当前下拉框的实体对象
                            let selectedObjArr = selectXs.getValue()// 获取选中的参数值集合
                            if (selectedObjArr && selectedObjArr.length > 0) {
                                let associatedParamCol = paramArr[t].associatedParamCol// 被关联参数值（对应的列名称）
                                let key = paramArr[t].paramValueType === 'realValue' ? 'value' : 'name'// 判断是真实值还是显示值
                                if (queryFilterObj.dataChoiceType === '1') { // 单选
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
                    selectXs = xmSelect.get(idStr + ind + nodeId, true)// 获取当前下拉框的实体对象
                    let oldSqlWhereStr = typeof $(idStr + ind + nodeId).attr('data-sqlWhereStr') !== 'undefined' ? $(idStr + ind + nodeId).attr('data-sqlWhereStr') : ''
                    let response = null;
                    if (sqlWhereStr !== '') {
                        if (oldSqlWhereStr === '' || oldSqlWhereStr !== sqlWhereStr) {
                            sql = 'SELECT * FROM (' + sql + ') where 1=1' + sqlWhereStr
                            if (idStr === '#selectParamScreen') { // 下拉列表
                                response = await executeParamSql(sql)
                            } else { // idStr=='#selectTreeParamScreen'   下拉树
                                response = await getSelectTreeData(sql)
                            }
                            if (response.data.isError) {
                                this.screenLoading = false
                                this.$message.error(`获取参数${queryFilterObj.dataName}的值的失败，原因：${response.data.message}`)
                            } else {
                                let newDataArr = []
                                if (idStr === '#selectParamScreen') {
                                    for (let k = 0; k < response.data.paramList.length; k++) {
                                        newDataArr.push({
                                            'name': response.data.paramList[k].paramName,
                                            'value': response.data.paramList[k].paramValue
                                        })
                                    }
                                } else { // idStr=='#selectTreeParamScreen'
                                    newDataArr = paramCommonJs.organizeSelectTreeData(response.data.result)
                                }
                                selectXs.update({
                                    data: newDataArr
                                    // autoRow: true,
                                })
                                $(idStr + ind + nodeId).attr('data-sqlWhereStr', sqlWhereStr)
                                this.screenLoading = false
                            }
                        } else {
                            this.screenLoading = false
                        }
                    }
                    if (sqlWhereStr === '' && dataArr.length === 0) { // 当影响它的主参没有选择值且本身没数据时（第一次加载全部数据）
                        initDataArr = true
                        if (idStr === '#selectParamScreen') { // 下拉列表
                            response = await executeParamSql(sql)
                        } else { // idStr=='#selectTreeParamScreen'   下拉树
                            response = await getSelectTreeData(sql)
                        }
                        if (response.data.isError) {
                            this.screenLoading = false
                            this.$message.error(`获取参数${queryFilterObj.dataName}的值的失败，原因：${response.data.message}`)
                        } else {
                            if (idStr === '#selectParamScreen') {
                                for (let k = 0; k < response.data.paramList.length; k++) {
                                    dataArr.push({
                                        'name': response.data.paramList[k].paramName,
                                        'value': response.data.paramList[k].paramValue
                                    })
                                }
                            } else { // idStr=='#selectTreeParamScreen'
                                dataArr = paramCommonJs.organizeSelectTreeData(response.data.result)
                            }
                            selectXs.update({
                                data: dataArr
                                // autoRow: true,
                            })
                            this.screenLoading = false
                        }
                    }
                    if (sqlWhereStr === '' && dataArr.length !== 0) {
                        if (paramArr.length !== 0) { // 本身受其它参数影响
                            selectXs.update({
                                data: dataArr
                                // autoRow: true,
                            })
                        }
                        $(idStr + ind + nodeId).removeAttr('data-sqlWhereStr')
                        this.screenLoading = false
                    }
                } catch (e) {
                    this.screenLoading = false
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
                let nodeId = this.screenParam.nodeData.nodeInfo.nodeId
                let selectXs = xmSelect.get(idStr + ind + nodeId, true)// 获取当前下拉框的实体对象
                let selectedObj = selectXs.getValue()// 获取选中的参数值
                if (selectedObj && selectedObj.length > 0) {
                    selectXs.setValue([])// 清空选中值
                }
            },
            pageInit(sql){
                if(this.$parent.$parent.$parent.$parent.screenListLoading === false){
                    this.$parent.$parent.$parent.$parent.screenListLoading = true
                }
                this.resultInfo = {"id":this.screenParam.nodeData.nodeInfo.nodeId,"name":this.screenParam.nodeData.nodeInfo.nodeName}
                let param = {"sql":sql}
                let webSocketUuid = new UUIDGenerator().id
                param.graphName = this.screenParam.graphName
                param.nodeId = this.screenParam.nodeData.nodeInfo.nodeId
                param.nodeName = this.screenParam.nodeData.nodeInfo.nodeName
                param.websocketUuid = webSocketUuid
                this.$parent.$parent.$parent.$parent.webSocketUuid = webSocketUuid
                selectScreenQueryData(param).then().catch( () => {
                    this.$parent.$parent.$parent.$parent.screenListLoading = false
                })
            },
            async queryData() {
                let filterArr = []//参数条件的数组，包含参数ID和参数值，也只存储输了值的参数
                let paramNum = 0//记录参数不允许为空却未输入值的参数数量
                let hasAllowedNullParam = false//本次查询是否含有可为空的参数条件
                let queryFilterObj = null
                //先去除已存在的value值
                for(let i=0; i<this.arr.length; i++){
                    if(typeof this.arr[i].value !== "undefined"){
                        delete this.arr[i].value;
                    }
                }
                let paramOptionScreen = this.$refs.paramOptionScreen
                if(paramOptionScreen && paramOptionScreen.length > 0){
                    for(let j=0; j<paramOptionScreen.length; j++){
                        let index = paramOptionScreen[j].$attrs.index
                        queryFilterObj = this.queryFilterArr[index]
                        let moduleParamId = queryFilterObj.dataId// 母参数ID
                        let allowedNull = typeof queryFilterObj.dataAllowedNull !== 'undefined' ? queryFilterObj.dataAllowedNull : '1'// 是否允许为空，当为undefined时默认为可为空
                        let paramValue = queryFilterObj.value
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
                let selectParamScreen = this.$refs.selectParamScreen
                if(selectParamScreen && selectParamScreen.length > 0){
                    for(let n=0; n<selectParamScreen.length; n++){
                        let index = selectParamScreen[n].getAttribute("index")
                        queryFilterObj = this.queryFilterArr[index]
                        let moduleParamId = queryFilterObj.dataId// 母参数ID
                        let allowedNull = typeof queryFilterObj.dataAllowedNull !== 'undefined' ? queryFilterObj.dataAllowedNull : '1'// 是否允许为空，当为undefined时默认为可为空
                        let choiceType = queryFilterObj.dataChoiceType// 当前参数是多选还是单选：0：多选，1、单选
                        let selectParamXs = xmSelect.get(`#selectParamScreen${queryFilterObj.selectNum}${this.screenParam.nodeData.nodeInfo.nodeId}`, true)// 获取下拉列表参数的单实例
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
                let selectTreeParamScreen = this.$refs.selectTreeParamScreen
                if(selectTreeParamScreen && selectTreeParamScreen.length > 0) {
                    for (let m = 0; m < selectTreeParamScreen.length; m++) {
                        let index = selectTreeParamScreen[m].getAttribute("index")
                        queryFilterObj = this.queryFilterArr[index]
                        let moduleParamId = queryFilterObj.dataId// 母参数ID
                        let allowedNull = typeof queryFilterObj.dataAllowedNull !== 'undefined' ? queryFilterObj.dataAllowedNull : '1'// 是否允许为空，当为undefined时默认为可为空
                        let choiceType = queryFilterObj.dataChoiceType// 当前参数是多选还是单选：0：多选，1、单选
                        let selectTreeParamXs = xmSelect.get(`#selectTreeParamScreen${queryFilterObj.selectTreeNum}${this.screenParam.nodeData.nodeInfo.nodeId}`, true)// 获取下拉树参数的单实例
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
                if(paramNum !== 0){//第一步，先判断是否有必填的参数没有输入值
                    this.$message({'type':'warning','message':'查询条件含有空值项，请重新输入'})
                }else{
                    //第二步，判断设置长度值文本框输入的值是否满足条件
                    let verify = true;
                    let message = "";
                    if(paramOptionScreen && paramOptionScreen.length > 0){
                        for(let g=0; g<paramOptionScreen.length; g++) {
                            if($(paramOptionScreen[g]).hasClass("textParam")){
                                let index = paramOptionScreen[g].$attrs.index
                                queryFilterObj = this.queryFilterArr[index]
                                let dataLength = queryFilterObj.dataDatalength// 获取参数值长度
                                let paramName = queryFilterObj.dataName// 获取参数名称
                                if (typeof dataLength !== 'undefined' && queryFilterObj.value.length !== parseInt(dataLength)) { // 如果该参数有长度限制且默认值不等于设置的长度值
                                    verify = false
                                    message = `查询条件【${paramName}】输入值的长度与设置的长度值【${parseInt(dataLength)}】不相等`
                                    break
                                }
                            }
                        }
                    }
                    if(!verify){
                        this.$message(({'type':'warning','message':message}))
                    }else {
                        this.curReplaceParamSql = this.paramSql;
                        if (hasAllowedNullParam) {//如果存在可为空的参数并且为空值，走后台进行空参替换
                            const response = await replaceModelSqlByParams(replaceParamSql, JSON.stringify(arr))
                            if(response.data == null || response.data.isError){// 出错后replaceParamSql的值会在后台置为空
                                this.$message.error("替换空值参数时出错")
                            }else{
                                this.curReplaceParamSql = response.data.sql
                            }
                        }
                        if (this.curReplaceParamSql !== "") {
                            for (var j = 0; j < filterArr.length; j++) {//遍历所有母参数信息
                                var moduleParamId = filterArr[j].moduleParamId;
                                for (var k = 0; k < this.arr.length; k++) {//遍历当前节点绑定的参数
                                    if (this.arr[k].moduleParamId === moduleParamId) {
                                        this.curReplaceParamSql = this.curReplaceParamSql.replace(this.arr[k].id, filterArr[j].paramValue);//将参数SQL中的参数ID替换为输入得值
                                    }
                                }
                            }
                            this.initExecuteSql();
                        }
                    }
                }
            },
            /**
             * 初始化当前节点的查询SQL语句
             */
            initExecuteSql(){
                let nodeId = this.screenParam.nodeData.nodeInfo.nodeId
                //根据当前节点获取它的前置所有节点的ID集合（不包括原表）
                this.executeNodeIdArr = getPreNodesNotDatasource(this.allNodeData,nodeId,[]);//此处不包含当前节点
                let checkParam = false// 默认没有参数节点
                for (let i = 0; i < this.executeNodeIdArr.length; i++) {
                    let hasParam = this.allNodeData[this.executeNodeIdArr[i]].hasParam// 是否有参数
                    let paramsSetting = this.allNodeData[this.executeNodeIdArr[i]].paramsSetting// 参数设置信息
                    if (hasParam && paramsSetting && paramsSetting.arr && paramsSetting.arr.length !== 0) {
                        checkParam = true
                        break
                    }
                }
                if(checkParam){
                    this.nodeParamDialogVisible = true
                    this.$nextTick( () => {
                        this.$refs.inputParams.createParamNodeHtml()
                    })
                }else{
                    this.executeNodeIdArr.push(nodeId)
                    //如果是数据分层节点，需添加当前选中的区间结果表的节点ID，目的是为了在数据分层的节点数组中根据结果表的下表获取相应的信息
                    if(this.curOptType === "layering"){
                        let childrenIds = this.allNodeData[nodeId].childrenIds
                        if(typeof childrenIds !== 'undefined' && childrenIds.length > 0 && typeof childrenIds[this.screenParam.layering_index] !== 'undefined'){
                            this.executeNodeIdArr.push(childrenIds[this.screenParam.layering_index])
                        }
                    }
                    this.getScreenExecuteSql();
                }
            },
            async executeParamCallBack(){
                let returnVal = await this.$refs.inputParams.replaceNodeParam()
                if (returnVal.verify) {
                    this.nodeParamDialogVisible = false
                    this.executeNodeIdArr.push(this.screenParam.nodeData.nodeInfo.nodeId)
                    this.getScreenExecuteSql();
                } else {
                    this.$refs.inputParams.$message({'type':'warning', 'message':returnVal.message})
                }
            },
            /**
             * 重根据前置所有节点信息组装当前节点的查询SQL语句
             */
            getScreenExecuteSql(){
                this.$parent.$parent.$parent.$parent.screenListLoading = true
                let param = {"nodeData":JSON.stringify(this.allNodeData),"nodeIdList":this.executeNodeIdArr}
                getScreenExecuteSql(param).then( response => {
                    if(response.data.isError){
                        this.$parent.$parent.$parent.$parent.screenListLoading = false
                        this.$message.error("初始化查询SQL语句失败")
                    }else{
                        let curNodeData = response.data.dealNodeData
                        let nodeId = this.screenParam.nodeData.nodeInfo.nodeId
                        let optType = curNodeData[nodeId].nodeInfo.optType
                        if(optType === "layering"){
                            var selectSqlNotViewTableArr = curNodeData[nodeId].nodeInfo.selectSqlNotViewTableArr
                            this.sql = selectSqlNotViewTableArr[this.screenParam.layering_index]
                        }else{
                            this.sql = curNodeData[nodeId].nodeInfo.selectSqlNotViewTable
                        }
                        if(this.sql === ""){
                            this.$parent.$parent.$parent.$parent.screenListLoading = false
                            this.$message.error("初始化查询SQL语句失败")
                        }else{
                            if(this.curReplaceParamSql !== ''){
                                let paramData = {"sql":this.sql,"replaceParamSql":this.curReplaceParamSql,"optType":this.curOptType}
                                dealReplaceParamSql(paramData).then( res => {
                                    if(res.data == null || res.data.isError){// 出错后replaceParamSql的值会在后台置为空
                                        this.$message.error("获取结果集数据出错：结果集SQL执行失败")
                                    }else{
                                        let curSql = res.data.dealSql
                                        this.sql = curSql
                                        this.pageInit(curSql);
                                        this.settingObj.initSql = curSql;
                                    }
                                }).catch( () => {
                                    this.$parent.$parent.$parent.$parent.screenListLoading = false
                                })
                            }else{
                                this.pageInit(this.sql);
                                this.settingObj.initSql = this.sql;
                            }
                        }
                    }
                }).catch( () => {
                    this.$parent.$parent.$parent.$parent.screenListLoading = false
                })
            },
            /**
             * 重置查询条件
             */
            resetQuery(){
                Array.from(this.queryFilterArr, item => {
                    if(typeof item.value !== "undefined"){//文本框和日期框
                        item.value = ''
                    }
                    if(typeof item.id !== "undefined"){//下拉列表和下拉树
                        let selectXs = xmSelect.get(`#${item.id}`, true)
                        selectXs.setValue([]);
                    }
                })
            },
            initQueryData(){
                this.curReplaceParamSql = ''
                this.initExecuteSql();
            },
            dealData(type){
                if(!this.isQuery){
                    this.$message({'type':'warning','message':'尚无结果数据，只能对查询的结果数据进行设置'})
                    return
                }
                this.dataDealType = type
                //先获取当前列表的所有查询条件
                switch (type) {
                    case "filter"://过滤设置
                        this.dataDealDialogTitle = "筛选设置";
                        break;
                    case "sort"://排序设置
                        this.dataDealDialogTitle = "排序设置";
                        break;
                    case "groupCount"://分组统计设置
                        this.dataDealDialogTitle = "分组统计设置";
                        break;
                }
                this.dataDealDialogVisible = true
            },
            dealDataCallBack(){
                let verify = this.$refs.dataDealScreen.verifySetting()
                if(verify){
                    let whereObj = this.$refs.dataDealScreen.saveSetting()
                    if((whereObj.hasWhere && whereObj.whereStr !== "") || !whereObj.hasWhere){//有where条件并且条件不为空的，或者没有where条件的
                        switch (this.dataDealType) {
                            case "filter"://过滤设置
                                this.settingObj.filterSetting = whereObj.setting;
                                break;
                            case "sort"://排序设置
                                this.settingObj.sortSetting = whereObj.setting;
                                break;
                            case "groupCount"://分组统计设置
                                this.settingObj.groupCountSetting = whereObj.setting;
                                break;
                        }
                        this.dataDealDialogVisible = false
                        this.sql = `SELECT ${whereObj.columnArr.join(",")} FROM (${this.settingObj.initSql}) ${whereObj.whereStr}`
                        this.pageInit(this.sql);
                    }else{
                        this.$refs.dataDealScreen.$message.error("配置条件为空，不可保存");
                    }
                }
            }
        }
    }
    </script>
