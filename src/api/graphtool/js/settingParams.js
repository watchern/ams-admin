import {getParamsTree, getFolderAndParams} from '@/api/analysis/sqleditor/sqleditor'
import * as paramCommonJs from '@/api/graphtool/js/paramCommon'
import { findParamsAndModelRelParams,verifySqlNodeSelectOption } from '@/api/graphtool/apiJs/graphList'
let CodeMirror = require("@/components/ams-codemirror/lib/codemirror")
// let paramManager = false// 是否具有参数管理员权限（默认为false）
// let developManager = false// 是否具有开发人员权限（默认为false）
let settingVue = null
export const sendSettingVue = ( (_this) => {
    settingVue = _this
})

/**
 * 初始化页面
 * @param nodeId 节点ID
 */
export async function init(nodeId) {
    // 初始化节点信息树
    await initNodeZtree(nodeId)
    // 初始化参数树
    getParamsTree().then(result => {
        settingVue.paramZtreeObj = $.fn.zTree.init($(settingVue.$refs.paramZtreeRef), settingVue.initZtreeSetting('paramZtree'), result.data.paramNode)
        // paramManager = result.data.paramManager
        // developManager = result.data.developManager
    })
}

/**
 * 初始化节点信息树
 * @param nodeId 节点ID
 */
async function initNodeZtree(nodeId) {
    let isError = false
    let message = ''
    // 获取节点名称
    let nodeName = settingVue.graph.nodeData[nodeId].nodeInfo.nodeName
    // 获取节点类型
    let optType = settingVue.graph.nodeData[nodeId].nodeInfo.optType
    let nodeExcuteStatus = settingVue.graph.nodeData[nodeId].nodeInfo.nodeExcuteStatus
    let flag = false//节点的SQL语句是否含有【*】或者SELECT项中是否含有函数项，目的是为了在树节点在显示时用原字段还是别名
    let columnsInfo = []//当前节点的输出字段
    if(nodeExcuteStatus === 3){//当前节点执行成功，直接取标识值
        flag = graph.nodeData[nodeId].nodeInfo.hasSign
        columnsInfo = settingVue.graph.nodeData[nodeId].columnsInfo
    }else{
        let response = null
        let param = {"nodeData":JSON.stringify(settingVue.graph.nodeData),"nodeId":nodeId,"optType":optType,"openType":settingVue.graph.openType}
        let sqlFun = function (response) {
            if(response.data.isError){
                isError = true
                message = `SQL语句解析失败：${response.data.message}`
            }else{
                let hasSign = response.data.hasSign//SQL语句的SELECT项是否含有【*】
                let hasFunOutPut = response.data.hasFunOutPut//SQL语句的SELECT项是否含有特殊函数
                if(hasSign){//此处只判断是否含有【*】
                    isError = true
                    message = `无法解析节点的输出字段信息，请先执行节点`
                }else{
                    flag = hasSign || hasFunOutPut
                    graph.nodeData[nodeId].nodeInfo.hasSign = flag
                    columnsInfo = response.data.columnsInfo
                    settingVue.graph.nodeData[nodeId].tempColumnsInfo = response.data.columnsInfo
                }
            }
        }
        //先组装节点的SQL语句并进行解析，获取标识值
        switch (optType) {
            case "sql":
                if(settingVue.graph.nodeData[nodeId].sqlIsChanged){//如果SQL编辑器的SQL语句发生了变化，则重新解析SQL语句
                    response = await verifySqlNodeSelectOption(param)
                    sqlFun(response)
                }else{//若没有发生变化，则使用临时输出列信息
                    if(typeof settingVue.graph.nodeData[nodeId].tempColumnsInfo !== 'undefined' && settingVue.graph.nodeData[nodeId].tempColumnsInfo.length > 0){
                        columnsInfo = settingVue.graph.nodeData[nodeId].tempColumnsInfo
                    }else{
                        response = await verifySqlNodeSelectOption(param)
                        sqlFun(response)
                    }
                }
                break
            case "filter":
            case "sort":
            case "layering":
            case "groupCount":
            case "delRepeat":
            case "change":
            case "relation":
                response = await verifySqlNodeSelectOption(param)
                if(response.data.isError){
                    isError = true
                    message = `获取节点输出字段信息失败：${response.data.message}`
                }else{
                    flag = response.data.hasFunOutPut
                    columnsInfo = settingVue.graph.nodeData[nodeId].columnsInfo
                }
                break
        }
    }
    if (!isError) {
        // 组织列节点信息
        let nodeRootId = new UUIDGenerator().id
        settingVue.nodeZtreeRoot = {
            'id': nodeRootId,
            'pid': null,
            'name': nodeName,
            'displayName': nodeName,
            'level': 1,
            'open': true,
            'isParent': true,
            'type': 'node',
            'children': []
        }
        const columnIconPath = require('@/styles/icons/column.png')
        for (let i = 0; i < columnsInfo.length; i++) {
            // 判断当前的输出列数组中是输出字段的（isOutputColumn == 1）
            if (columnsInfo[i].isOutputColumn === 1) {
                let obj = {
                    'id': new UUIDGenerator().id,
                    'pid': nodeRootId,
                    'level': 2,
                    'open': false,
                    'isParent': false,
                    'type': 'column',
                    'icon': columnIconPath
                }
                //根据不同节点组织节点名称
                switch (optType) {
                    case "sql":
                    case "filter":
                    case "sort":
                    case "layering":
                    case "groupCount":
                    case "delRepeat":
                    case "change":
                    case "relation":
                        if(flag){
                            obj.name = columnsInfo[i].newColumnName
                        }else{
                            obj.name = columnsInfo[i].columnName
                        }
                        break
                    case "sample":
                    case "union":
                        obj.name = columnsInfo[i].newColumnName
                        break
                }
                obj.displayName = columnsInfo[i].newColumnName
                settingVue.nodeZtreeRoot.children.push(obj)
            }
        }
        if (settingVue.nodeZtreeRoot.children.length === 0) {
            settingVue.$message({ type: 'warning', message: '当前节点无可使用输出字段，请重新执行节点' })
        }else{
            settingVue.nodeZtreeObj = $.fn.zTree.init($(settingVue.$refs.nodeZtreeRef), settingVue.initZtreeSetting('nodeZtree'), [settingVue.nodeZtreeRoot])
            settingVue.initTreeSuccess = true
        }
    } else {
        settingVue.$message.error(message)
    }
}


// 重新加载参数文件夹节点的子节点
export function loadParamChildrenNodes(treeNode) {
    let dataParam = {
        'id': treeNode.id,
        'type': treeNode.type,
        'level': treeNode.level,
        'isPersonalParam': false
    }
    dataParam.isPersonalParam = paramCommonJs.getRootNodeType(treeNode, settingVue.paramZtreeObj)
    getFolderAndParams(dataParam).then( response => {
        settingVue.paramZtreeObj.removeChildNodes(treeNode)
        settingVue.paramZtreeObj.addNodes(treeNode, response.data)
    })
}

/**
 * 初始化文本编辑编辑器
 * @param textarea 初始化为sql编辑器的指定文本域id
 */
export function initSqlEditor(textarea,heightPx) {
    // 初始化CodeMirror
    let editor = CodeMirror.fromTextArea(textarea, {
        mode: 'text/x-mssql',
        theme: 'idea',
        indentWithTabs: true,
        lineNumbers: true,
        lineWrapping: true,
        smartIndent: true,
        autofocus: true,
        matchBrackets: true,
        styleActiveLine: true
    })
    editor.on('beforeChange', function(instance, changeObj) {
        if (changeObj.origin === 'paste' && settingVue.isFirstPaste) {
            settingVue.cursor = editor.getCursor()
            settingVue.checkSqlText = editor.getRange({ ch: 0, line: settingVue.cursor.line }, { ch: settingVue.cursor.ch, line: settingVue.cursor.line })
            settingVue.isFirstPaste = false
        }
    })
    editor.on('change', function(instance, changeObj) {
        if (!changeObj.origin) {
            return
        }
        let changeText = ''
        let opt = 1// 默认有效
        let selectTextArr = changeObj.text// 这个值是个数组，有默认值（为长度为1的空串）
        if ((selectTextArr.length === 1 && selectTextArr[0] !== '') || selectTextArr.length > 1) { // 恢复、插入内容
            for (let i = 0; i < selectTextArr.length; i++) {
                changeText += selectTextArr[i]
            }
        }
        if (changeText === '') {
            selectTextArr = changeObj.removed// 这个值也是个数组，有默认值（为长度为1的空串）
            if ((selectTextArr.length === 1 && selectTextArr[0] !== '') || selectTextArr.length > 1) { // 撤销、删除内容
                for (let i = 0; i < selectTextArr.length; i++) {
                    changeText += selectTextArr[i]
                }
                opt = 0
            }
        }
        // 匹配“{#”和“#}”纯粹是为了提高代码的执行效率（只有参数按钮会同时含有“{#”和“#}”）
        if (changeText.indexOf('{#') > -1 && changeText.indexOf('#}') > -1 && settingVue.paramDivArr && settingVue.paramDivArr.length > 0) {
            for (let i = 0; i < settingVue.paramDivArr.length; i++) {
                if (changeText.indexOf(settingVue.paramDivArr[i].id) > -1) {
                    settingVue.paramDivArr[i].opt = opt
                }
            }
        }
        // 如果是粘贴操作
        if (changeObj.origin === 'paste' && settingVue.paramsSetting && settingVue.paramsSetting.arr && settingVue.paramsSetting.arr.length > 0) {
            let hasPaste = false
            for (let i = 0; i < settingVue.paramsSetting.arr.length; i++) {
                if (changeText.indexOf(settingVue.paramsSetting.arr[i].id) > -1) { // 如果粘贴的是已含有的参数
                    let copyParamId = new UUIDGenerator().id
                    let id = '{#' + copyParamId + '#}'
                    let name = settingVue.paramsSetting.arr[i].name
                    let obj = {
                        'oldParamId': settingVue.paramsSetting.arr[i].id, // 被复制参数的ID
                        'id': id, // 加上占位符后的复制参数ID
                        'copyParamId': copyParamId, // 复制参数ID
                        'moduleParamId': settingVue.paramsSetting.arr[i].moduleParamId, // 复制参数的母参ID
                        'allowedNull': settingVue.paramsSetting.arr[i].allowedNull, // 参数是否可以为空
                        'name': name// 参数名称
                    }
                    settingVue.paramsSetting.arr.push(obj)
                    hasPaste = true
                }
            }
            if (hasPaste) {
                replaceCopyParam(settingVue.paramsSetting)
            }
            settingVue.isFirstPaste = true
        }
    })
    // 设置脚本展示tab的上面编辑器高度
    editor.setSize('auto', heightPx + 'px')
    return editor
}

// 替换参数
export function replaceParam(paramObj) {
    if (paramObj == null || typeof paramObj === 'undefined') {
        return
    }
    if (Object.keys(paramObj).length > 0) {
        let arr = paramObj.arr// 获取参数列表
        let lines = settingVue.editor.lineCount()// 获取sql行数
        for (let a = 0; a < arr.length; a++) { // 第一层循环参数列表
            let indexArr = []
            for (let b = 0; b < lines; b++) { // 第二层循环sql编辑器的内容行数
                indexArr = []// 数组清空
                let text = settingVue.editor.getLine(b)// 获取当前行的内容
                indexArr = getIndexArr(text, arr[a].id, 0, indexArr)// 获取某行内容中参数id字符串出现的位置数组
                for (let i = 0; i < indexArr.length; i++) { // 第三层循环获取出来的字符串数组
                    let dom = $("<button class='divEditorBtn' id='" + arr[a].id + "'>" + arr[a].name + '</buttonn>').get(0)
                    let startCursor = { ch: indexArr[i], line: b, sticky: null }
                    let endCursor = { ch: indexArr[i] + arr[a].id.length, line: b, sticky: null }
                    settingVue.editor.markText(startCursor, endCursor, {
                        replacedWith: dom,
                        className: 'paramBlock'
                    })
                    let divBtnObj = {
                        'id': arr[a].id, // 加上占位符后的复制参数ID
                        'opt': 1// 参数是否生效（不生效是指在当前SQL编辑中已被删除），0、不生效，1、生效
                    }
                    settingVue.paramDivArr.push(divBtnObj)
                }
            }
        }
    }
}

/**
 * 替换复制参数
 * @param paramObj 所有参数对象
 */
function replaceCopyParam(paramObj) {
    if (paramObj == null || typeof paramObj === 'undefined') {
        return
    }
    if (Object.keys(paramObj).length > 0) {
        let arr = paramObj.arr// 获取参数列表
        let lines = settingVue.editor.lineCount()// 获取sql行数
        for (let a = 0; a < arr.length; a++) { // 第一层循环参数列表
            if (!arr[a].oldParamId) {
                continue
            }
            let oldParamId = arr[a].oldParamId
            delete paramObj.arr[a].oldParamId
            let indexArr = []
            for (let b = settingVue.cursor.line; b < lines; b++) { // 第二层循环sql编辑器的内容行数
                indexArr = []// 数组清空
                let text = settingVue.editor.getLine(b)// 获取当前行的内容
                if (text === '') {
                    continue
                }
                indexArr = getIndexArr(text, oldParamId, 0, indexArr)// 获取某行内容中参数id字符串出现的位置数组
                if (indexArr.length === 0) {
                    continue
                }
                let ch = settingVue.cursor.ch
                if (indexArr.length === 1) { // 复制的参数到新的行时
                    ch = indexArr[0]
                } else { // indexArr.length > 1（复制参数在当前行时）
                    if (settingVue.cursor.line === b && settingVue.checkSqlText.indexOf(oldParamId) < 0) { // 在当前行已有参数前粘贴
                        ch = indexArr[0]
                    } else { // 在当前行已有参数后粘贴
                        ch = indexArr[1]
                    }
                }
                let startCursor = { ch: ch, line: b, sticky: null }
                let endCursor = { ch: ch + arr[a].id.length, line: b, sticky: null }
                settingVue.editor.replaceRange(arr[a].id, startCursor, endCursor)// 替换复制的参数的ID
                let dom = $("<button class='divEditorBtn' id='" + arr[a].id + "'>" + arr[a].name + '</buttonn>').get(0)
                settingVue.editor.markText(startCursor, endCursor, {
                    replacedWith: dom,
                    className: 'paramBlock'
                })
                if (settingVue.paramIdsdArr.indexOf(arr[a].id) < 0) {
                    let obj = {
                        'id': arr[a].id, // 加上占位符后的复制参数ID
                        'opt': 1// 参数是否生效（不生效是指在当前SQL编辑中已被删除），0、不生效，1、生效
                    }
                    settingVue.paramDivArr.push(obj)
                    settingVue.paramIdsdArr.push(arr[a].id)
                }
            }
        }
    }
}

/**
 * 获取某行内容中字符串出现的位置数组
 * @param text 文本内容
 * @param str 字符串
 * @param index 出现位置
 * @param indexArr 位置数组
 * */
function getIndexArr(text, str, index, indexArr) {
    index = text.indexOf(str, index)
    if (index !== -1) {
        indexArr.push(index)
        indexArr = getIndexArr(text, str, parseInt(index + 1), indexArr)
    }
    return indexArr
}


/**
 * 初始化参数配置
 */
export async function initSetting() {
    //判断节点树是否正常加载（防止存在不正确的自定义参数SQL语句）
    if(!settingVue.initTreeSuccess){
        settingVue.setParamArr = []
        settingVue.settingLoading = false
        return
    }
    try {
        if(!settingVue.settingLoading){
            settingVue.loadText = "正在加载参数信息，请稍后……"
            settingVue.settingLoading = true
        }
        // 第一步：先判断编辑的参数SQL语句是否有变化
        let oldSql = settingVue.sql// 获取旧SQL语句
        let newSql = settingVue.editor.getValue()// 获取新编辑的SQL
        let hasSetParamIdArr = []// 存放有效参数集合中已配置过得参数集合
        if (settingVue.isAdd) { // 如果是新增
            if (oldSql === newSql) { // 如果SQL无变化
                settingVue.settingLoading = false
                return
            }
        } else { // 如果是修改
            settingVue.isAdd = true
            if (settingVue.paramsSetting.arr && settingVue.paramsSetting.arr.length > 0) {
                for (let i = 0; i < settingVue.paramsSetting.arr.length; i++) {
                    if ($.inArray(settingVue.paramsSetting.arr[i].moduleParamId, hasSetParamIdArr) < 0) {
                        hasSetParamIdArr.push(settingVue.paramsSetting.arr[i].moduleParamId)
                    }
                }
            }
        }
        // 第二步：先获取有效的参数集合
        let paramArr = []
        for (let i = 0; i < settingVue.paramDivArr.length; i++) {
            if (settingVue.paramDivArr[i].opt === 1) { // 如果当前参数有效
                for (let j = 0; j < settingVue.paramsSetting.arr.length; j++) {
                    if (settingVue.paramDivArr[i].id === settingVue.paramsSetting.arr[j].id) { // 在已拖拽过的参数（包含中间删掉的参数）中匹配参数
                        paramArr.push(settingVue.paramsSetting.arr[j])
                        break
                    }
                }
            }
        }
        // 第三步：遍历已配置过得参数行（若有多余行则删除）,同时找到已配置的参数
        for(let i=settingVue.setParamArr.length - 1; i>=0; i--){// 倒序遍历已渲染的参数配置数组
            let moduleParamId = settingVue.setParamArr[i].dataModuleParamId// 取得当前行绑定的母参ID
            let num = 0// 记录参数比较值不相等的次数
            for (let j = 0; j < paramArr.length; j++) { // 遍历有效的参数集合
                if (moduleParamId !== paramArr[j].moduleParamId) {
                    num++
                }
                if ($.inArray(paramArr[j].moduleParamId, hasSetParamIdArr) < 0 && moduleParamId === paramArr[j].moduleParamId) {
                    hasSetParamIdArr.push(paramArr[j].moduleParamId)
                }
                if (num === paramArr.length) { // 如果参数配置行的参数与有效参数集合匹配不上
                    let index = settingVue.setParamArr.findIndex(item => item.dataModuleParamId === moduleParamId)
                    settingVue.setParamArr.splice(index,1)// 则删除当前元素
                }
            }
        }
        if (paramArr.length === 0) {
            settingVue.settingLoading = false
            settingVue.setParamArr = []
            settingVue.$message({ type:"warning", message:'尚未设置参数，无法进行参数配置'})
            return
        }
        // 第四步：获取数据库所有母参数信息
        const response = await findParamsAndModelRelParams()
        if(response.data == null){
            settingVue.settingLoading = false
            settingVue.$message.error('获取参数信息失败')
        }else {
            if (response.data.isError) {
                settingVue.settingLoading = false
                settingVue.$message.error({message: response.data.message})
            } else {
                let paramList = response.data.paramList// 定义所有母参信息数组
                // 第五步：找出有效参数集合中未配置的参数,并追加TR行
                let moduleParamArr = []// 存储已匹配的母版参数集合
                for (let j = 0; j < paramArr.length; j++) { // 遍历有效的参数集合
                    let hasExist = false
                    for (let i = 0; i < settingVue.setParamArr.length; i++) {
                        if (settingVue.setParamArr[i].dataModuleParamId === paramArr[j].moduleParamId) {
                            hasExist = true
                            break
                        }
                    }
                    if ($.inArray(paramArr[j].moduleParamId, hasSetParamIdArr) > -1 && hasExist) { // 过滤掉有效参数集合中已经配置过的参数
                        continue
                    }
                    if ($.inArray(paramArr[j].moduleParamId, moduleParamArr) > -1) { // 过滤掉有效参数集合中母参重复的复制参数
                        continue
                    }
                    let setParamObj = {dataModuleParamId: paramArr[j].moduleParamId, name: paramArr[j].name,}
                    for (let k = 0; k < paramList.length; k++) { // 循环所有母版参数
                        let moduleParamId = paramList[k].ammParamUuid
                        let paramObj = {...{}, ...paramList[k]}
                        if (moduleParamId === paramArr[j].moduleParamId && $.inArray(moduleParamId, moduleParamArr) < 0) { // 匹配复制参数的母版参数ID
                            setParamObj.inputType = paramObj.inputType//参数类型
                            //设置默认值
                            if ($.inArray(paramArr[j].moduleParamId, hasSetParamIdArr) > -1 && moduleParamId === paramArr[j].moduleParamId &&
                                paramArr[j].defaultVal && paramArr[j].defaultVal !== '') {
                                setParamObj.value = paramArr[j].defaultVal
                                paramObj.defaultVal = paramArr[j].defaultVal
                            }
                            let returnObj = await paramCommonJs.getSettingParamArr(paramObj, setParamObj)
                            if (!returnObj.isError) {
                                setParamObj = returnObj.setParamObj
                            } else {
                                settingVue.$message.error({message: returnObj.message})
                            }
                            moduleParamArr.push(moduleParamId)
                            if (typeof paramObj.description !== 'undefined' && paramObj.description != null) {
                                setParamObj.description = paramObj.description
                            }
                            settingVue.setParamArr.push(setParamObj)
                            break
                        }
                    }
                }
                $(settingVue.$refs.setParamTable.$refs.bodyWrapper.children[0].children[1]).sortable().disableSelection()
                settingVue.$nextTick(() => {
                    // 第六步：统一初始化参数的html（文本框、下拉列表、下拉树）
                    initParam()
                    // 第七步：刷新SQL值，将已编写的SQL赋值给sql
                    settingVue.sql = settingVue.editor.getValue()
                    settingVue.settingLoading = false
                })
            }
        }
    } catch (e) {
        settingVue.settingLoading = false
        console.info(e)
    }
}

/**
 * 初始化及反显已配置的下拉树和下拉列表的参数（默认值和排序）
 */
function initParam() {
    for(let p=0; p<settingVue.setParamArr.length; p++){
        let setParamObj = settingVue.setParamArr[p]
        if(setParamObj.inputType === 'lineinp'){// 初始化下拉列表
            let choiceType = setParamObj.dataChoiceType// 下拉列表的数据是单选还是多选
            let moduleParamId = setParamObj.dataId// 母参ID
            let paramName = setParamObj.dataName// 母参名称
            let sql = typeof setParamObj.dataSql !== "undefined" ? setParamObj.dataSql : ''// 该参数是否有SQL语句（0否1是）
            let dataArr = typeof setParamObj.data !== 'undefined' ? setParamObj.data : []// 下拉列表数据
            let initDataArr = false// 是否初始化数据
            let selectSetting = {
                el: '#selectParam' + moduleParamId, // 此处不使用【i】的原因在于每个参数都唯一不会重复，故【el】唯一
                filterable: true,
                filterMethod: function(val, item) {
                    //把value相同的搜索出来或把名称中包含的搜索出来
                    if (val === item.value || (item.name && item.name.indexOf(val) > -1)) {
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
                let associatedParamIdArr = typeof $(this).attr('data-associatedParamIdArr') !== 'undefined' ? JSON.parse($(this).attr('data-associatedParamIdArr')) : []// 当前参数的被关联的参数的集合
                let paramArrNew = typeof $(this).attr('data-paramArr') !== 'undefined' ? JSON.parse($(this).attr('data-paramArr')) : []// 影响当前参数的主参数的集合
                selectSetting.show = function() {
                    initDataArr = paramCommonJs.selectShow(settingVue.$refs.settingParamDiv,'#selectParam', moduleParamId, paramName, sql, choiceType, paramArrNew, dataArr, initDataArr)
                }
                selectSetting.hide = function() {
                    if (initDataArr && dataArr.length === 0) {
                        let selectXs = xmSelect.get('#selectParam' + moduleParamId, true)// 获取当前下拉框的实体对象
                        dataArr = selectXs.options.data
                        initDataArr = false
                    }
                    if ($.inArray(moduleParamId, associatedParamIdArr) > -1) {
                        paramCommonJs.selectHide('#selectParam', moduleParamId,associatedParamIdArr)
                    }
                }
            }
            // 设置默认值
            if(typeof setParamObj.value !== "undefined" && setParamObj.value != null){
                selectSetting.initValue = setParamObj.value
            }
            xmSelect.render(selectSetting)
        }else if(setParamObj.inputType === 'treeinp'){// 初始化下拉树
            let choiceType = setParamObj.dataChoiceType// 下拉列表的数据是单选还是多选
            let moduleParamId = setParamObj.dataId// 母参ID
            let paramName = setParamObj.dataName// 母参名称
            let sql = typeof setParamObj.dataSql !== "undefined" ? setParamObj.dataSql : ''// 该参数是否有SQL语句（0否1是）
            let dataArr = typeof setParamObj.data !== 'undefined' ? setParamObj.data : []// 下拉列表数据
            let initDataArr = false// 是否初始化数据
            let selectSetting = {
                el: '#selectTreeParam' + moduleParamId, // 此处不使用【i】的原因在于每个参数都唯一不会重复，故【el】唯一
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
                let associatedParamIdArr = typeof $(this).attr('data-associatedParamIdArr') !== 'undefined' ? JSON.parse($(this).attr('data-associatedParamIdArr')) : []// 当前参数的被关联的参数的集合
                let paramArrNew = typeof $(this).attr('data-paramArr') !== 'undefined' ? JSON.parse($(this).attr('data-paramArr')) : []// 影响当前参数的主参数的集合
                selectSetting.show = function() {
                    initDataArr = paramCommonJs.selectShow(settingVue.$refs.settingParamDiv,'#selectTreeParam', moduleParamId, paramName, sql, choiceType, paramArrNew, dataArr, initDataArr)
                }
                selectSetting.hide = function() {
                    if (initDataArr && dataArr.length === 0) {
                        let selectXs = xmSelect.get('#selectTreeParam' + moduleParamId, true)// 获取当前下拉框的实体对象
                        dataArr = selectXs.options.data
                        initDataArr = false
                    }
                    if ($.inArray(moduleParamId, associatedParamIdArr) > -1) {
                        paramCommonJs.selectHide('#selectTreeParam', moduleParamId,associatedParamIdArr)
                    }
                }
            }
            // 设置默认值
            if(typeof setParamObj.value !== "undefined" && setParamObj.value != null){
                selectSetting.initValue = setParamObj.value
            }
            if (choiceType === '1') { // 单选
                selectSetting.radio = true
                selectSetting.clickClose = true
            } else { // 多选
                selectSetting.on = function(data) {
                    let arr = data.arr
                    let change = data.change[0]// 每次选中change只有一个值
                    let newDataArr = []
                    let checkData = data.change.slice(0, 1)// 当前选中的节点数据
                    newDataArr.push(checkData[0])
                    newDataArr = getChildrenData(checkData[0], newDataArr)// 获取当前选中的节点数据和其子孙节点数据
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
                        let preDataArr = getSplitDataArr(dataArr)
                        // 根据当前节点递归获取未被选中的且需要被选中的上级节点
                        let parentUnCheckedArr = getParentUnChecked(checkData[0], [], preDataArr, arr)
                        newDataArr = newDataArr.concat(parentUnCheckedArr)
                        arr.push.apply(arr, newDataArr)// 将新选中的与已选中的进行合并
                    } else { // 取消选中时
                        // 根据当前节点递归获取被选中的且需要取消选中的上级节点
                        let parentCheckedArr = getParentChecked(checkData[0], [], arr)
                        // 遍历取消上级节点的选中状态
                        for (let k = 0; k < parentCheckedArr.length; k++) { // 遍历即将取消选中的上级节点
                            for (let j = arr.length - 1; j >= 0; j--) { // 倒叙遍历所有选中的节点
                                if (arr[j].value === parentCheckedArr[k].value && arr[j].pValue === parentCheckedArr[k].pValue) { // 若存在
                                    arr.splice(j, 1)// 则倒序移除
                                    break
                                }
                            }
                        }
                        // 遍历取消当前节点的子孙节点的选中状态
                        for (let k = 0; k < newDataArr.length; k++) { // 遍历即将取消选中的节点
                            for (let j = arr.length - 1; j >= 0; j--) { // 倒叙遍历所有选中的节点
                                if (arr[j].value === newDataArr[k].value && arr[j].pValue === newDataArr[k].pValue) { // 若存在
                                    arr.splice(j, 1)// 则倒序移除
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
}

/**
 * 获取操作提示
 */
export function getOptMessage() {
    let oldSql = settingVue.sql
    let newSql = settingVue.editor.getValue()
    let msg = ''
    if (oldSql === newSql) {
        msg = '确定已完成所有参数的配置?'
    } else {
        msg = '参数已被更改，尚未进行参数配置，是否继续？'
    }
    return msg
}

/**
 * 获取参数配置，组织配置对象
 */
export function getParamsSetting() {
    // 组装对象
    let returnObj = {
        'verify': true,
        'message': '',
        'paramsSetting': {
            'sql': settingVue.editor.getValue(),
            'arr': []
        }
    }
    let trDom = settingVue.$refs.setParamTable.$refs.bodyWrapper.children[0].children[1].children
    if(typeof trDom !== 'undefined' && trDom.length > 0){
        // 验证文本框输入的默认值
        $.each(trDom,function () {
            let index = parseInt($(this).find("td:eq(0)>div>div").html()) - 1
            if(returnObj.verify){
                if(settingVue.setParamArr[index].inputType === 'textinp' && typeof settingVue.setParamArr[index].value !== 'undefined' && settingVue.setParamArr[index].value !== ''){
                    //验证文本框参数值的长度是否满足
                    let paramName = settingVue.setParamArr[index].dataName// 获取参数名称
                    let dataLength = settingVue.setParamArr[index].dataDataLength// 获取参数值长度
                    // 如果该参数有长度限制且默认值不等于设置的长度值
                    if (typeof dataLength !== 'undefined' && settingVue.setParamArr[index].value.length > parseInt(dataLength)) {
                        returnObj.verify = false
                        returnObj.message = '参数【' + paramName + '】输入值的长度与设置的长度值【' + parseInt(dataLength) + '】不相等'
                    }
                }
                if(settingVue.setParamArr[index].inputType === 'lineinp'){//下拉列表
                    let moduleParamId = settingVue.setParamArr[index].dataId// 母参ID
                    let selectParamXs = xmSelect.get('#selectParam' + moduleParamId, true)
                    let paramSelectedObj = selectParamXs.getValue()// 获取选中的参数值名称
                    let defaultValueArr = []
                    for (let j = 0; j < paramSelectedObj.length; j++) {
                        defaultValueArr.push(paramSelectedObj[j].value)
                    }
                    if (defaultValueArr.length > 0) {
                        settingVue.setParamArr[index].value = defaultValueArr
                    }
                }
                if(settingVue.setParamArr[index].inputType === 'treeinp'){//下拉树
                    let moduleParamId = settingVue.setParamArr[index].dataId// 母参ID
                    let selectTreeParamXs = xmSelect.get('#selectTreeParam' + moduleParamId, true)
                    let paramSelectedObj = selectTreeParamXs.getValue()// 获取选中的参数值名称
                    let defaultValueArr = []
                    for (let j = 0; j < paramSelectedObj.length; j++) {
                        defaultValueArr.push(paramSelectedObj[j].value)
                    }
                    if (defaultValueArr.length > 0) {
                        settingVue.setParamArr[index].value = defaultValueArr
                    }
                }
            }
        })
    }
    if (!returnObj.verify) {
        return returnObj
    }
    for (let i = 0; i < settingVue.paramDivArr.length; i++) {
        if (settingVue.paramDivArr[i].opt === 1) { // 如果当前参数有效
            for (let j = 0; j < settingVue.paramsSetting.arr.length; j++) {
                if (settingVue.paramDivArr[i].id === settingVue.paramsSetting.arr[j].id) { // 在已拖拽过的参数（包含中间删掉的参数）中匹配参数
                    let obj = settingVue.paramsSetting.arr[j]
                    obj.sortVal = 1// 先给每个参数赋值默认排序值为1
                    // 设置该参数的默认值和排序值
                    let defaultVal = ''
                    let sortVal = ''
                    let trDom = settingVue.$refs.setParamTable.$refs.bodyWrapper.children[0].children[1].children
                    if(typeof trDom !== 'undefined' && trDom.length > 0){
                        // 验证文本框输入的默认值
                        $.each(trDom,function (k) {
                            let index = parseInt($(this).find("td:eq(0)>div>div").html()) - 1
                            let moduleParamId = settingVue.setParamArr[index].dataId// 取得当前行绑定的参数ID
                            if (obj.moduleParamId === moduleParamId) {
                                if (typeof settingVue.setParamArr[index].value !== 'undefined') {
                                    defaultVal = settingVue.setParamArr[index].value
                                }
                                sortVal = parseInt(k + 1)
                                return false
                            }
                        })
                    }
                    obj.defaultVal = defaultVal
                    if (sortVal !== '') {
                        obj.sortVal = sortVal
                    }
                    returnObj.paramsSetting.arr.push(obj)
                    break
                }
            }
        }
    }
    // 对参数数组的值按照排序值由小到大得顺序进行排序
    paramCommonJs.sortParamArr(returnObj.paramsSetting.arr)
    return returnObj
}


/**
 * 获取参数配置，组织配置对象
 */
export function getParamsSettingBySave() {
    // 组装对象
    let returnObj = {
        'verify': true,
        'message': '',
        'paramsSetting': {
            'sql': settingVue.editor.getValue(),
            'arr': []
        }
    }
    let trDom = settingVue.$refs.setParamTable.$refs.bodyWrapper.children[0].children[1].children
    if (typeof trDom !== 'undefined' && trDom.length > 0) {
        // 验证文本框输入的默认值
        $.each(trDom, function () {
            let index = parseInt($(this).find("td:eq(0)>div>div").html()) - 1
            if (returnObj.verify) {
                if (settingVue.setParamArr[index].inputType === 'textinp' && typeof settingVue.setParamArr[index].value !== 'undefined' && settingVue.setParamArr[index].value !== '') {
                    //验证文本框参数值的长度是否满足
                    let paramName = settingVue.setParamArr[index].dataName // 获取参数名称
                    let dataLength = settingVue.setParamArr[index].dataDataLength // 获取参数值长度
                    // 如果该参数有长度限制且默认值不等于设置的长度值
                    if (typeof dataLength !== 'undefined' && settingVue.setParamArr[index].value.length > parseInt(dataLength)) {
                        returnObj.verify = false
                        returnObj.message = '参数【' + paramName + '】输入值的长度与设置的长度值【' + parseInt(dataLength) + '】不相等'
                    }
                }
                if (settingVue.setParamArr[index].inputType === 'lineinp') { //下拉列表
                    // let moduleParamId = settingVue.setParamArr[index].dataId // 母参ID
                    // let selectParamXs = xmSelect.get('#selectParam' + moduleParamId, true)
                    // let paramSelectedObj = selectParamXs.getValue() // 获取选中的参数值名称
                    console.log('====settingVue.setParamArr[index]===');
                    console.log(settingVue.setParamArr[index]);
                    let paramSelectedObj = settingVue.setParamArr[index].getValue()
                    let defaultValueArr = []
                    for (let j = 0; j < paramSelectedObj.length; j++) {
                        defaultValueArr.push(paramSelectedObj[j].value)
                    }
                    if (defaultValueArr.length > 0) {
                        settingVue.setParamArr[index].value = defaultValueArr
                    }
                }
                if (settingVue.setParamArr[index].inputType === 'treeinp') { //下拉树
                    let moduleParamId = settingVue.setParamArr[index].dataId // 母参ID
                    let selectTreeParamXs = xmSelect.get('#selectTreeParam' + moduleParamId, true)
                    let paramSelectedObj = selectTreeParamXs.getValue() // 获取选中的参数值名称
                    let defaultValueArr = []
                    for (let j = 0; j < paramSelectedObj.length; j++) {
                        defaultValueArr.push(paramSelectedObj[j].value)
                    }
                    if (defaultValueArr.length > 0) {
                        settingVue.setParamArr[index].value = defaultValueArr
                    }
                }
            }
        })
    }
    if (!returnObj.verify) {
        return returnObj
    }
    for (let i = 0; i < settingVue.paramDivArr.length; i++) {
        if (settingVue.paramDivArr[i].opt === 1) { // 如果当前参数有效
            for (let j = 0; j < settingVue.paramsSetting.arr.length; j++) {
                if (settingVue.paramDivArr[i].id === settingVue.paramsSetting.arr[j].id) { // 在已拖拽过的参数（包含中间删掉的参数）中匹配参数
                    let obj = settingVue.paramsSetting.arr[j]
                    obj.sortVal = 1 // 先给每个参数赋值默认排序值为1
                    // 设置该参数的默认值和排序值
                    let defaultVal = ''
                    let sortVal = ''
                    let trDom = settingVue.$refs.setParamTable.$refs.bodyWrapper.children[0].children[1].children
                    if (typeof trDom !== 'undefined' && trDom.length > 0) {
                        // 验证文本框输入的默认值
                        $.each(trDom, function (k) {
                            let index = parseInt($(this).find("td:eq(0)>div>div").html()) - 1
                            let moduleParamId = settingVue.setParamArr[index].dataId // 取得当前行绑定的参数ID
                            if (obj.moduleParamId === moduleParamId) {
                                if (typeof settingVue.setParamArr[index].value !== 'undefined') {
                                    defaultVal = settingVue.setParamArr[index].value
                                }
                                sortVal = parseInt(k + 1)
                                return false
                            }
                        })
                    }
                    obj.defaultVal = defaultVal
                    if (sortVal !== '') {
                        obj.sortVal = sortVal
                    }
                    returnObj.paramsSetting.arr.push(obj)
                    break
                }
            }
        }
    }
    // 对参数数组的值按照排序值由小到大得顺序进行排序
    paramCommonJs.sortParamArr(returnObj.paramsSetting.arr)
    return returnObj
}
