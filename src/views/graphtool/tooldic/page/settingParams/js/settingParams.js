import {getParamsTree, getFolderAndParams} from '@/api/analysis/sqleditor/sqleditor'
import * as paramCommonJs from '@/views/graphtool/tooldic/js/paramCommon'
import { findParamsAndModelRelParams } from '@/api/graphtool/graphList'
let CodeMirror = require("@/components/ams-codemirror/lib/codemirror")
// 节点树、参数树的对象
let nodeZtreeObj, paramZtreeObj
// let paramManager = false// 是否具有参数管理员权限（默认为false）
// let developManager = false// 是否具有开发人员权限（默认为false）
let paramIdsdArr = []// 用来记录已经替换过的参数ID集合（不可去除）
let isFirstPaste = true// 本次改变内容是否是执行第一次粘贴操作
let checkSqlText = ''// 当前光标所在行从第0列到光标所在列之间的文本内容
let settingVue = null
export const sendSettingVue = ( (_this) => {
    settingVue = _this
})

/**
 * 初始化页面
 * @param nodeId 节点ID
 */
export function init(nodeId) {
    // 初始化节点信息树
    initNodeZtree(nodeId)
    // 初始化参数树
    initParamZtree()
}

/**
 * 初始化节点信息树
 * @param nodeId 节点ID
 */
function initNodeZtree(nodeId) {
    let isError = false
    // 获取节点名称
    let nodeName = settingVue.graph.nodeData[nodeId].nodeInfo.nodeName
    // 获取节点类型
    let optType = settingVue.graph.nodeData[nodeId].nodeInfo.optType
    if (optType === 'sql' && typeof settingVue.graph.nodeData[nodeId].sqlIsChanged !== 'undefined') {
        let hasSign = graph.nodeData[nodeId].nodeInfo.hasSign;//SELECT语句的输出列是否含有【*】
        if(hasSign){
            let nodeExcuteStatus = settingVue.graph.nodeData[nodeId].nodeInfo.nodeExcuteStatus
            if (nodeExcuteStatus !== 3 && settingVue.graph.nodeData[nodeId].sqlIsChanged) {
                isError = true
            }
        }
    }
    if (!isError) {
        // 获取节点的输出字段
        let columnsInfo = settingVue.graph.nodeData[nodeId].columnsInfo
        let nodeSetting = {
            data: {
                key: {
                    checked: 'isChecked',
                    name: 'name',
                    title: 'displayName'
                },
                // 设置数据格式
                simpleData: {
                    enable: true
                }
            },
            check: {
                enable: false,
                chkStyle: 'radio',
                radioType: 'all'
            },
            view: {
                selectedMulti: false
            },
            edit: {
                enable: true,
                showRenameBtn: false,
                showRemoveBtn: false,
                drag: { // 禁止拖拽变更树节点
                    autoExpandTrigger: false, // 拖拽时父节点自动展开是否触发 onExpand
                    prev: false,
                    inner: false,
                    next: false
                }
            },
            callback: {
                onDrop: function(event, treeId, treeNodes) {
                    // 判断是否在可拖拽区域内
                    if (!inArea()) {
                        return
                    }
                    let columnName = treeNodes[0].name
                    // 获取文本框内的光标对象
                    let cursor = settingVue.editor.getCursor()
                    settingVue.editor.replaceRange(columnName, cursor, cursor)
                },
                beforeDrag: function(treeId, treeNodes) {
                    let thisNode = treeNodes[0]
                    // 如果不是字段节点，不做任何操作
                    if (treeNodes[0] && treeNodes[0].type !== 'column') {
                        return false
                    } else {
                        return true
                    }
                }
            }
        }
        // 组织列节点信息
        let nodeRootId = new UUIDGenerator().id
        let nodeRoot = {
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
                    'icon': '/images/ico/column.png'
                }
                //根据不同节点组织节点名称
                switch (optType) {
                    case "sql":
                        var hasSign = graph.nodeData[nodeId].nodeInfo.hasSign;//SELECT语句的输出列是否含有【*】
                        if(hasSign){//有【*】则使用结果集输出字段进行设参
                            obj.name = columnsInfo[i].newColumnName;
                            obj.displayName = columnsInfo[i].newColumnName;
                        }else{//没有【*】则使用原字段进行设参
                            obj.name = columnsInfo[i].columnName;
                            obj.displayName = columnsInfo[i].newColumnName;
                        }
                        nodeRoot.children.push(obj);
                        break;
                    case "filter":
                    case "sort":
                    case "layering":
                    case "groupCount":
                    case "delRepeat":
                        obj.name = columnsInfo[i].columnName;
                        obj.displayName = columnsInfo[i].newColumnName;
                        nodeRoot.children.push(obj);
                        break;
                    case "change":
                        obj.name = columnsInfo[i].columnName;
                        obj.displayName = columnsInfo[i].newColumnName;
                        if($.inArray(nodeNameArr,obj.name) < 0){//此处是为了去除重复的未被转码的原字段
                            nodeNameArr.push(obj.name);
                            nodeRoot.children.push(obj);
                        }
                        break;
                    case "relation":
                        obj.name = columnsInfo[i].tableAlias + "." + columnsInfo[i].columnName;
                        obj.displayName = columnsInfo[i].tableAlias + "." + columnsInfo[i].newColumnName;
                        nodeRoot.children.push(obj);
                        break;
                    case "sample":
                    case "union":
                        obj.name = columnsInfo[i].newColumnName;
                        obj.displayName = columnsInfo[i].newColumnName;
                        nodeRoot.children.push(obj);
                        break;
                }
            }
        }
        if(nodeRoot.children.length > 0){
            settingVue.initTreeSuccess = true
        }
        nodeZtreeObj = $.fn.zTree.init($('#nodeZtree'), nodeSetting, nodeRoot)
        if (nodeRoot.children.length === 0) {
            settingVue.$message({ type: 'warning', message: '当前节点无可使用输出字段，请重新执行节点' })
        }
    } else {
        settingVue.$message({ type: 'warning', message: 'SQL语句发生改变且节点未执行成功，无法获取节点的输出字段信息' })
    }
}

/**
 * 初始化参数树
 */
function initParamZtree() {
    let paramSetting = {
        data: {
            key: {
                checked: 'isChecked',
                name: 'name',
                title: 'displayName'
            },
            // 设置数据格式
            simpleData: {
                enable: true,
                idKey: 'id',
                PidKey: 'pid'
            }
        },
        check: {
            enable: false
        },
        view: {
            selectedMulti: false
        },
        callback: {
            onDrop: function(event, treeId, treeNodes) { // 每次拖参数都会基于拖动的参数新复制一个参数
                // 判断是否在可拖拽区域内
                if (!inArea()) {
                    return
                }
                let copyParamId = new UUIDGenerator().id// 复制参数的ID
                let id = '{#' + copyParamId + '#}'
                let cursor = settingVue.editor.getCursor()// 获取编辑器的光标
                settingVue.editor.replaceRange(id, cursor, cursor)// 在编辑器的光标位置添加id的值
                let dom = $("<button class='divEditorBtn' id='" + id + "'>" + treeNodes[0].name + '</buttonn>').get(0)
                let endCursor = { ch: cursor.ch + id.length, line: cursor.line, sticky: null }
                // 将id替换成button的内容（只改变显示效果，编辑器的真实值不变）
                settingVue.editor.markText(cursor, endCursor, {
                    replacedWith: dom,
                    className: 'paramBlock'
                })
                /**
                 * 参数对象
                 * @param id 新参数拼接特殊符号后的ID
                 * @param copyParamId 新参数的ID
                 * @param moduleParamId 母参的ID
                 * @param name新参数的名称（与母参数一致）
                 * @type {{id: string, copyParamId: *, moduleParamId: *, name: *}}
                 */
                let obj = {
                    'id': id,
                    'copyParamId': copyParamId,
                    'moduleParamId': treeNodes[0].id,
                    'allowedNull': treeNodes[0].extCol, // 临时占用此属性来存储该参数是否可以为空
                    'name': treeNodes[0].name
                }
                if (Object.keys(settingVue.paramsSetting).length === 0) {
                    settingVue.paramsSetting.arr = []
                }
                settingVue.paramsSetting.arr.push(obj)
                let divBtnObj = {
                    'id': id, // 加上占位符后的复制参数ID
                    'opt': 1// 参数是否生效（不生效是指在当前SQL编辑中已被删除），0、不生效，1、生效
                }
                settingVue.paramDivArr.push(divBtnObj)
            },
            beforeDrag: function(treeId, treeNodes) {
                // 如果是参数 允许拖动 否则不可以
                let thisNode = treeNodes[0]
                if (thisNode.type !== 'paramNode') {
                    return false
                }
            },
            onExpand: function(event, treeId, treeNode) {
                if (!treeNode.children || treeNode.children.length === 0) {
                    loadParamChildrenNodes(treeNode)
                }
            }
        },
        edit: {
            enable: true,
            showRenameBtn: false,
            showRemoveBtn: false,
            drag: {
                prev: false,
                next: false,
                inner: false
            }
        }
    }
    getParamsTree().then(result => {
        paramZtreeObj = $.fn.zTree.init($('#paramZtree'), paramSetting,  result.data.paramNode)
        // paramManager = result.data.paramManager
        // developManager = result.data.developManager
    })
}

// 重新加载参数文件夹节点的子节点
function loadParamChildrenNodes(treeNode) {
    let dataParam = {
        'id': treeNode.id,
        'type': treeNode.type,
        'level': treeNode.level,
        'isPersonalParam': false
    }
    dataParam.isPersonalParam = paramCommonJs.getRootNodeType(treeNode, paramZtreeObj)
    getFolderAndParams(dataParam).then( response => {
        paramZtreeObj.removeChildNodes(treeNode)
        paramZtreeObj.addNodes(treeNode, response.data)
    })
}

/**
 * 判断拖拽的节点是否在文本域内
 */
function inArea() {
    let codeMirrorWrap = $(settingVue.$refs.settingParamDiv).find(".CodeMirror-wrap")
    let width = codeMirrorWrap.width()
    let height = codeMirrorWrap.height()
    if ((settingVue.mouseX < 30) || (settingVue.mouseX > width) || (settingVue.mouseY <= 0) || (settingVue.mouseY > height)) {
        return false
    }
    return true
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
        if (changeObj.origin === 'paste' && isFirstPaste) {
            settingVue.cursor = editor.getCursor()
            checkSqlText = editor.getRange({ ch: 0, line: settingVue.cursor.line }, { ch: settingVue.cursor.ch, line: settingVue.cursor.line })
            isFirstPaste = false
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
            isFirstPaste = true
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
                    if (settingVue.cursor.line === b && checkSqlText.indexOf(oldParamId) < 0) { // 在当前行已有参数前粘贴
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
                if (paramIdsdArr.indexOf(arr[a].id) < 0) {
                    let obj = {
                        'id': arr[a].id, // 加上占位符后的复制参数ID
                        'opt': 1// 参数是否生效（不生效是指在当前SQL编辑中已被删除），0、不生效，1、生效
                    }
                    settingVue.paramDivArr.push(obj)
                    paramIdsdArr.push(arr[a].id)
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
export function initSetting() {
    //判断节点树是否正常加载（防止存在不正确的自定义参数SQL语句）
    if(!settingVue.initTreeSuccess){
        settingVue.setParamArr = []
        settingVue.$message({ type:"warning", message:'界面未成功初始化数据，配置加载失败'})
        return
    }
    let load = $(settingVue.$refs.settingParamDiv).mLoading({ 'text': '正在加载配置，请稍后……', 'hasCancel': false })
    try {
        // 第一步：先判断编辑的参数SQL语句是否有变化
        let oldSql = settingVue.sql// 获取旧SQL语句
        let newSql = settingVue.editor.getValue()// 获取新编辑的SQL
        let hasSetParamIdArr = []// 存放有效参数集合中已配置过得参数集合
        if (settingVue.isAdd) { // 如果是新增
            if (oldSql === newSql) { // 如果SQL无变化
                load.hide()
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
                    // $('.setParamTr:eq(' + i + ')').remove()// 则删除当前行
                }
            }
        }
        if (paramArr.length === 0) {
            load.hide()
            settingVue.setParamArr = []
            settingVue.$message({ type:"warning", message:'尚未设置参数，无法进行参数配置'})
            return
        }
        // 第四步：获取数据库所有母参数信息
        findParamsAndModelRelParams().then( response => {
            if(response.data == null){
                load.hide()
                settingVue.$message.error('获取参数信息失败')
            }else {
                if (response.data.isError) {
                    load.hide()
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
                                let returnObj = paramCommonJs.getSettingParamArr(paramObj, setParamObj)
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
                    $(settingVue.$refs.setParamTbody).sortable().disableSelection()
                    settingVue.$nextTick(() => {
                        // 第六步：统一初始化参数的html（文本框、下拉列表、下拉树），并反显已配置参数的信息（包括默认值和排序值）
                        initParam(paramArr, hasSetParamIdArr)
                        // 第七步：刷新SQL值，将已编写的SQL赋值给sql
                        settingVue.sql = settingVue.editor.getValue()
                        load.hide()
                    })
                }
            }
        })
    } catch (e) {
        load.hide()
        console.info(e)
    }
}

/**
 * 初始化及反显已配置的下拉树和下拉列表的参数（默认值和排序）
 * @param paramArr 待配置的复制参数集合
 * @param hasSetParamIdArr 已配置的复制参数ID集合
 */
function initParam(paramArr, hasSetParamIdArr) {
    // 初始化日期插件
    if ($('.form_date').length > 0) {
        $('.form_date').each(function(i, v) {
            let setting = {
                format: 'yyyy-mm-dd',
                language: 'zh-CN',
                todayBtn: true,
                autoclose: true,
                todayHighlight: true,
                startView: 2,
                showMeridian: true,
                minView: 2
            }
            $(this).datetimepicker(setting)
        })
    }
    // 初始化下拉列表
    let $selectParam = settingVue.$refs.selectParam
    if ($selectParam && $selectParam.length > 0) {
        for(let i=0; i<$selectParam.length; i++){
            let index = Number($selectParam[i].parentNode.getAttribute("index"))
            let choiceType = settingVue.setParamArr[index].dataChoiceType// 下拉列表的数据是单选还是多选
            let moduleParamId = settingVue.setParamArr[index].dataId// 母参ID
            let paramName = settingVue.setParamArr[index].dataName// 母参名称
            let sql = typeof settingVue.setParamArr[index].dataSql !== "undefined" ? settingVue.setParamArr[index].dataSql : ''// 该参数是否有SQL语句（0否1是）
            let dataArr = typeof settingVue.setParamArr[index].data !== 'undefined' ? settingVue.setParamArr[index].data : []// 下拉列表数据
            let initDataArr = false// 是否初始化数据
            let selectSetting = {
                el: '#selectParam' + moduleParamId, // 此处不使用【i】的原因在于每个参数都唯一不会重复，故【el】唯一
                filterable: true,
                filterMethod: function(val, item, index, prop) {
                    if (val === item.value) { // 把value相同的搜索出来
                        return true
                    }
                    if (item.name && item.name.indexOf(val) > -1) { // 名称中包含的搜索出来
                        return true
                    }
                    return false// 不知道的就不管了
                },
                data: dataArr
            }
            if (choiceType == 1) { // 单选
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
            if(typeof settingVue.setParamArr[index].value !== "undefined" && settingVue.setParamArr[index].value != null){
                selectSetting.initValue = settingVue.setParamArr[index].value
            }
            xmSelect.render(selectSetting)
        }
    }
    // 初始化下拉树
    let $selectTreeParam = settingVue.$refs.selectTreeParam
    if ($selectTreeParam && $selectTreeParam.length > 0) {
        for(let i=0; i<$selectTreeParam.length; i++){
            let index = Number($selectTreeParam[i].parentNode.getAttribute("index"))
            let choiceType = settingVue.setParamArr[index].dataChoiceType// 下拉列表的数据是单选还是多选
            let moduleParamId = settingVue.setParamArr[index].dataId// 母参ID
            let paramName = settingVue.setParamArr[index].dataName// 母参名称
            let sql = typeof settingVue.setParamArr[index].dataSql !== "undefined" ? settingVue.setParamArr[index].dataSql : ''// 该参数是否有SQL语句（0否1是）
            let dataArr = typeof settingVue.setParamArr[index].data !== 'undefined' ? settingVue.setParamArr[index].data : []// 下拉列表数据
            let initDataArr = false// 是否初始化数据
            let selectSetting = {
                el: '#selectTreeParam' + moduleParamId, // 此处不使用【i】的原因在于每个参数都唯一不会重复，故【el】唯一
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
            if(typeof settingVue.setParamArr[index].value !== "undefined" && settingVue.setParamArr[index].value != null){
                selectSetting.initValue = settingVue.setParamArr[index].value
            }
            if (choiceType == 1) { // 单选
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
    // 验证文本框输入的默认值
    for(let i=0; i<settingVue.$refs.setParamTr.length; i++){
        let index = Number(settingVue.$refs.setParamTr[i].parentNode.getAttribute("index"))
        if(settingVue.setParamArr[index].value !== '' && settingVue.setParamArr[index].inputType === 'textinp'){// 如果当前值不为空且如果是文本框参数（非日期）
            //验证文本框参数值的长度是否满足
            let paramName = settingVue.setParamArr[index].dataName// 获取参数名称
            let dataLength = settingVue.setParamArr[index].dataDataLength// 获取参数值长度
            // 如果该参数有长度限制且默认值不等于设置的长度值
            if (typeof dataLength !== 'undefined' && settingVue.setParamArr[index].value.length !== parseInt(dataLength)) {
                returnObj.verify = false
                returnObj.message = '参数【' + paramName + '】输入值的长度与设置的长度值【' + parseInt(dataLength) + '】不相等'
                return false
            }
        }
    }
    if (!returnObj.verify) {
        return returnObj
    }
    // 绑定下拉列表选中的默认值
    let $selectParam = settingVue.$refs.selectParam
    if ($selectParam && $selectParam.length > 0) {
        for (let i = 0; i < $selectParam.length; i++) {
            // $('.selectParam').each(function(i, v) {
            let index = Number($selectParam[i].parentNode.getAttribute("index"))
            let moduleParamId = settingVue.setParamArr[index].dataId// 母参ID
            let selectParamXs = xmSelect.get('#selectParam' + moduleParamId, true)
            let paramSelectedObj = selectParamXs.getValue()// 获取选中的参数值名称
            let defaultValueArr = []
            for (let j = 0; j < paramSelectedObj.length; j++) {
                defaultValueArr.push(paramSelectedObj[j].value)
            }
            if (defaultValueArr.length > 0) {
                // $(this).attr('data-value', JSON.stringify(defaultValueArr))
                settingVue.setParamArr[index].value = defaultValueArr
            }
        }
    }
    // 绑定下拉树选中的默认值
    let $selectTreeParam = settingVue.$refs.selectTreeParam
    if ($selectTreeParam && $selectTreeParam.length > 0) {
        for (let i = 0; i < $selectTreeParam.length; i++) {
            // $('.selectTreeParam').each(function(i, v) {
            let index = Number($selectTreeParam[i].parentNode.getAttribute("index"))
            let moduleParamId = settingVue.setParamArr[index].dataId// 母参ID
            let selectTreeParamXs = xmSelect.get('#selectTreeParam' + moduleParamId, true)
            let paramSelectedObj = selectTreeParamXs.getValue()// 获取选中的参数值名称
            let defaultValueArr = []
            for (let j = 0; j < paramSelectedObj.length; j++) {
                defaultValueArr.push(paramSelectedObj[j].value)
            }
            if (defaultValueArr.length > 0) {
                // $(this).attr('data-value', JSON.stringify(defaultValueArr))
                settingVue.setParamArr[index].value = defaultValueArr
            }
        }
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
                    for(let k=0; k<settingVue.$refs.setParamTr.length; k++){
                        let index = Number(settingVue.$refs.setParamTr[k].getAttribute("index"))
                        let moduleParamId = settingVue.setParamArr[index].dataId// 取得当前行绑定的参数ID
                        // let moduleParamId = $(this).attr('data-id')// 取得当前行绑定的参数ID
                        if (obj.moduleParamId === moduleParamId) {
                            if (typeof settingVue.setParamArr[index].value !== 'undefined') {
                                defaultVal = settingVue.setParamArr[index].value
                            }
                            sortVal = parseInt(k + 1)
                            break
                        }
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
