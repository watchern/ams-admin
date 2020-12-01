import { deleteExecuteNodes, checkTableName,executeNodeSql } from '@/api/graphtool/graphList'
import * as validateJs from '@/views/graphtool/tooldic/js/validate'
import {updateResourceZtreeNodeName} from '@/views/graphtool/tooldic/js/index'
let hL = null
let graphIndexVue = null
export var sendGraphIndexVue = (_this) => {
    graphIndexVue = _this
}

// 功能节点跳转
export function data_filter(type, name, nodeName) {
    var curNodeId = graph.curCell.id
    var obj = validateJs.verifyPreNodes(type, curNodeId)
    if (obj.isError) {
        alertMsg('错误', obj.message, 'error')
        return
    }
    if (!validateJs.settingVerify(type)) {
        return
    }
    var url = ''
    if (type === 'relation') {
        url = '/#/graphtool/tooldic/relation'
    } else if (type === 'groupCount') {
        url = '/#/graphtool/tooldic/groupCount'
    } else {
        url = '/#/graphtool/tooldic/nodeSetting?jspType=' + type
    }
    var setting = {
        id: 'setProperty',
        type: 2,
        title: name,
        content: url,
        area: ['90%', '90%'],
        skin: 'layui-layer-lan',
        success: function() {
            if (type !== 'barChart') {
                var link = "<a style='color:#fff;position:absolute;top:13px;right:80px;font-size:15px;' class='open_" + type + "' href='javascript:void(0);' onclick='showSettingRemark(this,\"" + type + "\")' title='点击查看详细的配置说明'>"
                link += "<span style='position: relative;left: 5px;bottom: 2px;'>帮助</span></a>"
                $('.layui-layer-title').after(link)
            }
            $('#setProperty>iframe').attr('scrolling', 'no')
        }
    }
    if (graph.canEditor) { // 如果能编辑，则能保存修改后的配置
        setting.btn = ['确定', '取消']
        setting.btn1 = function(index, layero) {
            if (settingCallBack(curNodeId, type, layero)) {
                layer.close(index)
                autoExcute()
            }
        }
        setting.btn2 = function(index, layero) {
            layer.close(index)
        }
        setting.cancel = function(index, layero) {
            if (confirm('即将关闭配置页面，是否更新并保存配置信息？')) { // 只有当点击confirm框的确定时，该层才会关闭
                if (settingCallBack(curNodeId, type, layero)) {
                    autoExcute()
                }
            }
        }
    } else {
        setting.btn = ['关闭']
        setting.btn1 = function(index) {
            layer.close(index)
        }
    }
    layer.open(setting)
}

/**
 * 配置完成后的回调方法
 * */
function settingCallBack(curNodeId, type, layero) {
    if (!window[layero.find('iframe')[0]['name']].basicInfoVerify()) {
        window[layero.find('iframe')[0]['name']].$('#myTab>li:eq(0)>a').click()
        return false
    }
    if (!window[layero.find('iframe')[0]['name']].inputVerify()) {
        window[layero.find('iframe')[0]['name']].$('#myTab>li:eq(1)>a').click()
        return false
    }
    var childrenIds = graph.nodeData[curNodeId].childrenIds.slice()
    if (childrenIds.length > 0) {
        if (!confirm('该操作会影响本节点及后续节点的执行信息，是否继续？')) {
            return false
        }
    }
    if (type === 'relation' || type === 'groupCount') {					// 数据关联和分组汇总节点特殊处理
        var flag = window[layero.find('iframe')[0]['name']].saveNodeInfo()
        if (!flag) {
            return false
        }
    } else if (type === 'comparison' || type === 'barChart') {		// 频次分析没有输出列，特殊处理
        window[layero.find('iframe')[0]['name']].saveNotOutput()
    } else {
        if (!window[layero.find('iframe')[0]['name']].outputVerify()) {
            return false
        }
        window[layero.find('iframe')[0]['name']].saveGraphNodeSetting()
    }
    // 变更当前节点的配置状态信息
    graph.nodeData[curNodeId].nodeInfo.nodeExcuteStatus = 1
    graph.nodeData[curNodeId].isSet = true
    graph.nodeData[curNodeId].setting.settingId = new UUIDGenerator().id
    changeNodeIcon(1, true, curNodeId)
    graph.cellLabelChanged(graph.curCell, graph.nodeData[curNodeId].nodeInfo.nodeName, null)
    // 自动生成节点和线，start
    graph.getModel().beginUpdate()
    try {
        var nodeType = graph.nodeData[curNodeId].nodeInfo.optType
        // 判断当前节点是否已经生成【结果表】节点
        var y = graph.curCell.geometry.y				// 纵向坐标位置
        if (nodeType === 'layering') {				// 数据分层节点特殊处理
            if (childrenIds.length > 0) {					// 如果有已经生成的结果表，则先删除已有的结果表
                var cells = []
                for (var i = 0; i < childrenIds.length; i++) {
                    cells.push(graph.model.getCell(childrenIds[i]))
                }
                if (cells.length > 0) {
                    graph.setSelectionCells(cells)
                    deleteCells(true)
                    // 对应删除右侧所使用资源树上的节点
                    deleteResourceZtreeNode(childrenIds)
                }
            }
            var newTableArr = []; var newSqlArr = []; var areaArr = []
            var resultTableNameArr = graph.nodeData[curNodeId].nodeInfo.resultTableNameArr
            var nodeSqlArr = graph.nodeData[curNodeId].nodeInfo.nodeSqlArr
            var colName = graph.nodeData[curNodeId].setting.hierarchy_column
            var layeringArr = graph.nodeData[curNodeId].setting.hierarchy_map
            for (var j = 0; j < layeringArr.length; j++) {
                var name = colName + '【' + layeringArr[j].c_col_1 + '至' + layeringArr[j].c_col_2 + '】'
                areaArr.push('字段【' + colName + '】：' + layeringArr[j].c_col_1 + '至' + layeringArr[j].c_col_2)
                autoCreateNode(y + j * 130, j, name)
                if (resultTableNameArr.length === 0) {
                    newTableArr.push('')
                    newSqlArr.push('')
                    continue
                }
                if (j <= resultTableNameArr.length - 1) {
                    newTableArr[j] = resultTableNameArr[j]
                    newSqlArr[j] = nodeSqlArr[j]
                } else {
                    newTableArr.push('')
                    newSqlArr.push('')
                }
            }
            graph.nodeData[curNodeId].nodeInfo.resultTableNameArr = newTableArr.slice()
            graph.nodeData[curNodeId].nodeInfo.nodeSqlArr = newSqlArr.slice()
            graph.nodeData[curNodeId].nodeInfo.areaArr = areaArr
        } else {
            if (childrenIds.length === 0 && nodeType !== 'barChart') {			// 自定义图形不生成结果表
                autoCreateNode(y)
            }
        }
    } finally {
        graph.getModel().endUpdate()
    }
    // 自动生成节点和线，end
    if (childrenIds.length > 0) {
        changeNodeInfo(curNodeId, false)
    }
    // 记录执行操作的操作痕迹
    refrashHistoryZtree('配置【' + graph.curCell.value + '】节点')
    // 自动保存图形化
    autoSaveGraph()
    return true
}

/**
 * 根据不同节点的类型，展示不同的操作说明内容
 * @param obj 点击按钮对象
 * @param type	节点类型
 * */
function showSettingRemark(obj, type) {
    if ($(obj).hasClass('system-o-step')) {
        top.layer.open({
            id: 'showSettingRemark111',
            title: '帮助',
            type: 2,
            content: contextPathAuditAnalysis + '/systemOperateHelp/show/' + type,
            area: ['90%', '90%'],
            skin: 'layui-layer-lan',
            scrollbar: false,
            maxmin: true
        })
    } else {
        top.layer.open({
            id: 'showSettingRemark111',
            type: 2,
            title: '帮助',
            content: 'page/C_Rows_Data/settingRemark.jsp?type=' + type,
            area: ['600px', '90%'],
            skin: 'layui-layer-lan',
            maxmin: true,
            scrollbar: false
        })
    }
}

/**
 * 自动生成结果表
 * @param	y	生成节点的垂直坐标
 * @param	index	只适用于数据分层节点，用来标注结果表对应的分层区间，下标从0开始
 * @param	name	生成节点的名称，默认为“结果表”
 * */
function autoCreateNode(y, index, name) {
    // 获取当前节点的坐标位置
    var x = graph.curCell.geometry.x
    if (!y) {
        y = graph.curCell.geometry.y
    }
    if (typeof name === 'undefined' || name == null) {
        name = '结果表'
    }
    var type = 'newNullNode'
    var cell = graph.insertVertex(graph.getDefaultParent(), null, name, x + 180, y, 100, 100, createCellShape(type))			// 生成节点
    cell.nodeType = type
    var options = {
        'id': cell.id,
        'name': name,
        'type': type
    }
    initNodeData(options, true)
    if (typeof index !== 'undefined' && index != null) {
        graph.nodeData[cell.id].nodeInfo.index = index
    }
    var edge = graph.insertEdge(graph.getDefaultParent(), null, getEdgeCount() + 1, graph.curCell, cell, 'rounded=0;html=1;jettySize=auto;orthogonalLoop=1;strokeColor=#3E6F96;strokeWidth=2;')		// 生成线
    // 刷新画布
    // 将生成的线添加到线的集合中
    if (!graph.edgeArr[edge.id]) {
        graph.edgeArr[edge.id] = { 'source': graph.curCell, 'target': cell }
    }
    // 添加父、子ID信息
    graph.nodeData[graph.curCell.id].childrenIds.push(cell.id)
    graph.nodeData[cell.id].parentIds.push(graph.curCell.id)
    // 将生成的节点添加到节点集合中
    graph.oldOptArr.push({ 'optType': 'create', 'optArr': [{ 'id': cell.id, 'nodeData': graph.nodeData[cell.id] }] })
    // 刷新所使用资源树
    refrashResourceZtree(cell.id, name, cell.nodeType)
}

/**
 * 递归遍历获取当前节点的子孙节点ID集合
 * @param curNodeId	开始变更的节点ID
 * */
function getAllChildrenIds(curNodeId) {
    var idArr = []		// 存放需要变更的节点的ID
    idArr = getIdArr(idArr, curNodeId)
    return idArr
}

/**
 * 递归遍历变更当前节点的子孙节点的状态信息
 * @param curNodeId	开始变更的节点ID
 * @param isChangeSource		是否需要改变节点信息
 * */
function changeNodeInfo(curNodeId, isChangeSource) {
    var idArr = getAllChildrenIds(curNodeId)	// 得到当前节点的子孙节点集合
    idArr.unshift(curNodeId)	// 将当前节点添加至集合的第一个位置
    for (var i = 0; i < idArr.length; i++) {		// 循环变更信息
        graph.nodeData[idArr[i]].nodeInfo.nodeExcuteStatus = 1				// 置节点执行状态为未执行
        graph.nodeData[idArr[i]].isChangeSource = isChangeSource			// 置改变前置节点信息为已改变
        if (graph.nodeData[idArr[i]].isSet && graph.nodeData[idArr[i]].isChangeSource) {		// 如果当前节点已配置且改变了前置节点信息
            graph.nodeData[idArr[i]].isSet = false			// 重置其配置状态，在打开时不读取已配置信息，重新进行配置
        }
        changeNodeIcon(1, graph.nodeData[idArr[i]].isSet, idArr[i])
    }
}

/**
 * 获取当前节点的后续所有分支的子孙节点ID集合
 * @param idArr		节点ID集合
 * @param nodeId  当前节点ID
 * */
function getIdArr(idArr, nodeId) {
    if (graph.nodeData[nodeId]) {
        var childrenIds = graph.nodeData[nodeId].childrenIds
        for (var i = 0; i < childrenIds.length; i++) {
            idArr.push(childrenIds[i])
            idArr = getIdArr(idArr, childrenIds[i])
        }
    }
    return idArr
}

/**
 * 根据当前节点获取它的前置所有未执行成功且已配置过的节点的ID集合
 * @param curCellId 当前节点的ID
 * @param arr 前置所有未执行节点的ID集合
 * */
function getNotExecuteNode(curCellId, arr) {
    var parentIds = graph.nodeData[curCellId].parentIds
    if (parentIds.length > 0) {
        for (var i = 0; i < parentIds.length; i++) {
            var nodeExecuteStatus = graph.nodeData[parentIds[i]].nodeInfo.nodeExcuteStatus
            if (nodeExecuteStatus !== 3 && $.inArray(parentIds[i], arr) < 0) {
                arr = verifyExsist(graph.nodeData, arr, parentIds[i], null, 3)
            } else {
                continue
            }
            arr = getNotExecuteNode(parentIds[i], arr)
        }
    }
    return arr
}

/**
 * 根据当前节点获取它的前置所有节点的ID集合（不包括原表）
 * @param nodeData 当前图形中所有节点的信息
 * @param curCellId 当前节点的ID
 * @param arr 前置所有节点的ID集合
 * */
function getPreNodesNotDatasource(nodeData, curCellId, arr) {
    var parentIds = nodeData[curCellId].parentIds
    if (parentIds.length > 0) {
        for (var i = 0; i < parentIds.length; i++) {
            var optType = nodeData[parentIds[i]].nodeInfo.optType
            if (optType !== 'datasource' && $.inArray(parentIds[i], arr) < 0) {
                arr = verifyExsist(nodeData, arr, parentIds[i], 'datasource', null)
            } else {
                continue
            }
            arr = getPreNodesNotDatasource(nodeData, parentIds[i], arr)
        }
    }
    return arr
}

/**
 * 根据当前节点获取它的前置所有节点的ID集合
 * @param curCellId 当前节点的ID
 * @param arr 前置所有节点的ID集合
 * */
export function getPreNodes(curCellId, arr) {
    var parentIds = graph.nodeData[curCellId].parentIds
    if (parentIds.length > 0) {
        for (var i = 0; i < parentIds.length; i++) {
            if ($.inArray(parentIds[i], arr) < 0) {
                arr = verifyExsist(graph.nodeData, arr, parentIds[i], null, null)
            } else {
                continue
            }
            arr = getPreNodes(parentIds[i], arr)
        }
    }
    return arr
}

/**
 * 判断当前节点的父节点是否在数组中存在
 * @param nodeData 当前图形中所有节点的信息
 * @param arr 待筛选数据集合
 * @param curNodeId 当前节点
 * @param filterNodeOptType 父节点操作类型筛选条件
 * @param filterNodeExecuteStatus 父节点执行状态筛选条件
 */
function verifyExsist(nodeData, arr, curNodeId, filterNodeOptType, filterNodeExecuteStatus) {
    var ifExsist = false; var index = -1
    if (nodeData[curNodeId]) {
        var pre_parentIds = nodeData[curNodeId].parentIds
        if (pre_parentIds && pre_parentIds.length > 0) {
            for (var j = 0; j < pre_parentIds.length; j++) {
                index = arr.indexOf(pre_parentIds[j])
                if (filterNodeOptType && nodeData[pre_parentIds[j]]) {
                    var optType = nodeData[pre_parentIds[j]].nodeInfo.optType
                    if (optType !== filterNodeOptType && index > -1) {
                        ifExsist = true
                        break
                    }
                } else if (filterNodeExecuteStatus && nodeData[pre_parentIds[j]]) {
                    var nodeExecuteStatus = nodeData[pre_parentIds[j]].nodeInfo.nodeExcuteStatus
                    if (nodeExecuteStatus !== filterNodeExecuteStatus && index > -1) {
                        ifExsist = true
                        break
                    }
                } else {
                    if (index > -1) {
                        ifExsist = true
                        break
                    }
                }
            }
        }
    }
    if (ifExsist) {
        arr.splice((index + 1), 0, curNodeId)
    } else {
        arr.unshift(curNodeId)
    }
    return arr
}

/**
 * 获取当前节点及其前置节点中正在执行的节点的ID集合
 * @param curCellId	当前执行的节点ID
 * @return executingNodeIdArr	正在执行的节点的ID集合
 * */
function getExecutingNodeIdArr(curCellId, executingNodeIdArr) {
    var nodeExcuteStatus = graph.nodeData[curCellId].nodeInfo.nodeExcuteStatus
    if (nodeExcuteStatus === 2) {
        executingNodeIdArr.push(curCellId)
        var parentIds = graph.nodeData[curCellId].parentIds
        for (var i = 0; i < parentIds.length; i++) {
            var pre_nodeExcuteStatus = graph.nodeData[parentIds[i]].nodeInfo.nodeExcuteStatus
            if (pre_nodeExcuteStatus === 2) {
                executingNodeIdArr = getExecutingNodeIdArr(parentIds[i], executingNodeIdArr)
            }
        }
    }
    return executingNodeIdArr
}

/**
 * 节点取消执行方法
 * */
export function cancelExecute() {
    if (graph.nodeData[graph.curCell.id].nodeInfo.nodeExcuteStatus !== 2) {
        alertMsg('错误', '该节点不是正在执行的节点', 'error')
        return
    }
    var executingNodeIdArr = []
    executingNodeIdArr = getExecutingNodeIdArr(graph.curCell.id, executingNodeIdArr)
    // 改变所有执行中节点的状态为未执行
    for (var i = 0; i < executingNodeIdArr.length; i++) {
        if (graph.nodeData[executingNodeIdArr[i]]) {
            graph.nodeData[executingNodeIdArr[i]].nodeInfo.nodeExcuteStatus = 1
            changeNodeIcon(1, null, executingNodeIdArr[i])
        }
    }
    if (executingNodeIdArr.length > 0) {
        // 记录取消执行操作
        refrashHistoryZtree('取消节点执行')
        // 自动保存图形化
        autoSaveGraph()
    }
}

/**
 * 	循环遍历处理待执行节点ID集合
 * 	@param notExecuteNodeIdArr 待执行节点ID数组
 */
function dealWithNodeIdArr(notExecuteNodeIdArr) {
    var returnObj = {
        'verify': true,
        'message': ''
    }
    var checkFlag = true; var isDeleteTable = false
    // 验证结果表是否已经创建
    for (var i = 0; i < notExecuteNodeIdArr.length; i++) {
        var isCreateTable = graph.nodeData[notExecuteNodeIdArr[i]].nodeInfo.isCreateTable
        // 判断节点中是否要创建表
        if (isCreateTable === 1) { // 若创建
            // 获取当前节点的结果表名称
            var resultTableName = graph.nodeData[notExecuteNodeIdArr[i]].nodeInfo.resultTableName
            // 如果结果表不为空，说明之前执行过，则进行结果表名称的重复性校验（重复则定义删除标志）
            if (resultTableName !== '') {
                checkTableName({ 'tableName': resultTableName, 'openType': graph.openType }).then( response => {
                    if(response.data == null){
                        checkFlag = false
                        returnObj.message = '校验节点【' + graph.nodeData[notExecuteNodeIdArr[i]].nodeInfo.nodeName + '】的结果表出错'
                    }else {
                        isDeleteTable = response.data
                    }
                })
                // $.ajax({
                //     url: contextPath + '/graphEditor/checkTableName',
                //     data: { 'tableName': resultTableName, 'openType': graph.openType },
                //     dataType: 'json',
                //     type: 'post',
                //     async: false,
                //     success: function(e) {
                //         if (e.isError) {
                //             checkFlag = false
                //             returnObj.message = '校验节点【' + graph.nodeData[notExecuteNodeIdArr[i]].nodeInfo.nodeName + '】的结果表是否已被创建时出错'
                //         } else {
                //             isDeleteTable = e.isDeleteTable
                //         }
                //     }
                // })
            }
            graph.nodeData[notExecuteNodeIdArr[i]].nodeInfo.isDeleteTable = isDeleteTable
        } else {
            var userTableName = graph.nodeData[notExecuteNodeIdArr[i]].nodeInfo.userTableName// 自定义命名的结果表名称
            if (userTableName && userTableName !== '') { // 说明去除了保存临时数据的选项，此时需删除已保存的临时结果表
                graph.nodeData[notExecuteNodeIdArr[i]].nodeInfo.isDeleteTable = true
                delete graph.nodeData[notExecuteNodeIdArr[i]].nodeInfo.userTableName
            }
        }
        if (!checkFlag) {
            break
        }
    }
    if (!checkFlag) {
        returnObj.verify = false
    }
    return returnObj
}

/**
 * 组织所有待执行节点队列中有参数设置的节点的HTML
 * @param nodeIdArr 待执行的节点ID数组
 */
function createParamNodeHtml(nodeIdArr) {
    var returnObj = {
        'isError': false, // 组织过程中是否有错误
        'message': '', // 提示信息（主要是错误信息）
        'htmlContent': ''// 组织返回的参数节点的HTML
        // "paramArr" : []//记录有参数节点的参数设置数组
    }
    // 第一层循环只是判断当前待执行节点队列中是否有参数节点
    var checkParam = false// 默认没有参数节点
    for (let i = 0; i < nodeIdArr.length; i++) {
        let hasParam = graph.nodeData[nodeIdArr[i]].hasParam// 是否有参数
        let paramsSetting = graph.nodeData[nodeIdArr[i]].paramsSetting// 参数设置信息
        if (hasParam && paramsSetting && paramsSetting.arr && paramsSetting.arr.length !== 0) {
            checkParam = true
            break
        }
    }
    if (checkParam) { // 如果有参数节点
        var paramsArr = []// 定义所有母参信息数组
        $.ajax({
            url: contextPath + '/graphEditor/getNodeParams',
            type: 'post',
            dataType: 'json',
            async: false,
            success: function(e) {
                if (e.isError) {
                    returnObj.isError = true
                    returnObj.message = e.message
                } else {
                    paramsArr = e.paramList
                }
            },
            error: function() {
                returnObj.isError = true
                returnObj.message = '请求失败，加载参数出错'
            }
        })
        if (returnObj.isError) {
            return returnObj
        }
        var nodeParamObj = {}// 节点与参数配置绑定的对象
        for (var i = 0; i < nodeIdArr.length; i++) {
            var hasParam = graph.nodeData[nodeIdArr[i]].hasParam// 是否有参数
            var paramsSetting = graph.nodeData[nodeIdArr[i]].paramsSetting
            if (hasParam && paramsSetting && paramsSetting.arr && paramsSetting.arr.length !== 0) {
                var copyParamArr = []// 定义所有参数的对象数组（已去重）
                var paramSql = paramsSetting.sql// 获取参数的SQL语句
                var arr = paramsSetting.arr// 获取设置的参数数组
                var moduleParamArr = []// 母参数数组（去重用）
                for (var j = 0; j < arr.length; j++) { // 循环节点上绑定的参数（复制参数）
                    for (var k = 0; k < paramsArr.length; k++) { // 循环所有母版参数
                        var moduleParamId = paramsArr[k].ammParamUuid
                        if (moduleParamId === arr[j].moduleParamId && $.inArray(moduleParamId, moduleParamArr) < 0) { // 匹配复制参数的母版参数ID
                            if (arr[j].defaultVal) {
                                paramsArr[k].defaultVal = arr[j].defaultVal
                            }
                            copyParamArr.push(paramsArr[k])
                            moduleParamArr.push(moduleParamId)
                            break
                        }
                    }
                }
                if (copyParamArr.length > 0) {
                    nodeParamObj[nodeIdArr[i]] = copyParamArr
                }
            }
        }
        returnObj.htmlContent += "<div class='col-sm-12'>"
        var selectNum = 0// 用于临时记录参数为下拉列表的个数
        var selectTreeNum = 0// 用于临时记录参数为下拉树的个数
        var keys = Object.keys(nodeParamObj)// 获取有参数设置的节点的ID集合
        for (var j = 0; j < keys.length; j++) {
            var curNodeId = keys[j]
            var nodeName = graph.nodeData[curNodeId].nodeInfo.nodeName
            returnObj.htmlContent += "<div class='panel-group nodeParam' id='accordion" + j + "'>" +
                "<div class='panel panel-default'><div class='panel-heading'><h4 class='panel-title'>" +
                "<a data-id='" + curNodeId + "' data-toggle='collapse' data-parent='#accordion" + j + "' href='#collapse" + j + "'>【" + nodeName + '】节点</a>' +
                '</h4></div>'
            if (j === 0) { // 默认打开第一个节点
                returnObj.htmlContent += "<div id='collapse" + j + "' class='panel-collapse collapse in'>"
            } else {
                returnObj.htmlContent += "<div id='collapse" + j + "' class='panel-collapse collapse'>"
            }
            returnObj.htmlContent += "<div class='panel-body' style='padding: 10px 0;'>"
            // 遍历该节点绑定的所有参数
            var copyParamArr = nodeParamObj[curNodeId]
            var paramHtml = ''
            for (var k = 0; k < copyParamArr.length; k++) {
                var description = '（参数说明：无）'
                if (typeof copyParamArr[k].description !== 'undefined') {
                    description = '（参数说明：' + copyParamArr[k].description + '）'
                }
                paramHtml += "<div class='row'><div class='col-sm-12'><div class='form-group'><label class='col-sm-2' style='text-align: right;padding: 10px 7px;'>" + copyParamArr[k].paramName + "&nbsp;&nbsp;</label><div class='col-sm-4'>"
                var RO = initParamHtml_Common(copyParamArr[k], selectNum, selectTreeNum)
                if (typeof RO.selectNum !== 'undefined') {
                    selectNum = RO.selectNum
                }
                if (typeof RO.selectTreeNum !== 'undefined') {
                    selectTreeNum = RO.selectTreeNum
                }
                if (RO.isError) {
                    paramHtml += "</div><label class='col-sm-4'></label></div></div></div>"
                    returnObj.isError = true
                    returnObj.message += RO.message + '\n'
                } else {
                    paramHtml += RO.htmlContent + RO.spanHtml + "</div><label  class='col-sm-4' style='padding: 10px 7px;'>" + description + '</label></div></div></div>'
                }
            }
            returnObj.htmlContent += paramHtml + '</div></div></div></div>'
        }
        returnObj.htmlContent += '</div>'
        // 删除记录数
        delete graph.selectNum
        delete graph.selectTreeNum
    }
    return returnObj
}

/**
 * 自动执行
 */
function autoExcute() {
    var childrenIds = graph.nodeData[ graph.curCell.id].childrenIds
    if (childrenIds.length > 0 && childrenIds.length === 1) {
        confirmMsg('提示', '节点配置成功，是否立即执行？', 'info', function() {
            var cell = graph.getModel().getCell(childrenIds[0])
            if (cell) {
                graph.curCell = cell
                executeNode()
            } else {
                alertMsg('错误', '自动获取执行节点出错，请手动选择节点执行', 'error')
            }
        }, function() {})
    }
}

/**
 * 执行本节点方法的内部调用方法
 * @param notExecuteNodeIdArr 所有未执行节点的ID数组
 * */
export function executeNode(notExecuteNodeIdArr) {
    var executeCellId = graph.curCell.id
    var obj = {
        'verify': true,
        'message': ''
    }
    if (typeof notExecuteNodeIdArr === "undefined" || notExecuteNodeIdArr == null || notExecuteNodeIdArr.length === 0) {
        if (!validateJs.executeVerify()) {
            return
        }
        // 从当前执行节点（选中节点）递归查找所有未执行成功且已经配置过的前置节点集合,start
        notExecuteNodeIdArr = [executeCellId]
        notExecuteNodeIdArr = getNotExecuteNode(executeCellId, notExecuteNodeIdArr)
        // 从当前执行节点（选中节点）递归查找所有未执行成功且已经配置过的前置节点集合,end
    }
    // 判断当前队列中是否存在未配置成功的操作节点
    if (hasNotSetNode(notExecuteNodeIdArr)) {
        alertMsg('提示', '当前执行的节点中存在未配置的节点', 'info')
        return
    }
    // 校验结果表是否有自己的配置信息
    var isSet = graph.nodeData[executeCellId].isSet
    var parentIds = graph.nodeData[executeCellId].parentIds
    // 如果数组中只有一个当前结果表的ID，并且该结果未配置，则添加其上级节点一起重新执行
    if (notExecuteNodeIdArr.length === 1 && notExecuteNodeIdArr[0] === executeCellId && !isSet && parentIds && parentIds.length > 0) {
        notExecuteNodeIdArr.unshift(parentIds[0])
    }
    // 处理待执行节点队列数组
    obj = dealWithNodeIdArr(notExecuteNodeIdArr)
    if (!obj.verify) {
        alertMsg('提示', obj.message, 'info')
        return
    }
    graphIndexVue.executeType = 1
    graphIndexVue.websocketBatchId = new UUIDGenerator().id
    // 获取组织参数的html代码
    var returnObj = createParamNodeHtml(notExecuteNodeIdArr)
    if (returnObj.htmlContent && returnObj.htmlContent !== '') { // 如果有组织的参数html
        graph.htmlContent = returnObj.htmlContent// 将html串绑定在graph上
        layer.open({
            id: 'nodeParamSetting',
            type: 2,
            title: '节点参数设置',
            content: 'page/inputParams/inputParams.jsp',
            area: ['1000px', '600px'],
            skin: 'layui-layer-lan',
            btn: ['确定', '取消'],
            btn1: function(index, layero) {
                // 替换节点的参数
                var returnVal = $(layero).find('iframe')[0].contentWindow.replaceNodeParam()
                if (returnVal.verify) {
                    layer.close(index)
                    // 节点的核心执行方法
                    executeNode_callback(notExecuteNodeIdArr)
                } else {
                    alertMsg('提示', returnVal.message, 'info')
                }
            },
            btn2: function(index, layero) {
                layer.close(index)
            }
        })
    } else {
        // 节点的核心执行方法
        executeNode_callback(notExecuteNodeIdArr)
    }
}

/**
 * 执行本节点方法（执行当前节点这条线上所有未执行的节点，执行过的节点会被忽略）
 * @param notExecuteNodeIdArr 所有未执行节点的ID数组
 * */
function executeNode_callback(notExecuteNodeIdArr) {
    // 更改执行状态图标为执行中
    for (var j = 0; j < notExecuteNodeIdArr.length; j++) {
        graph.nodeData[notExecuteNodeIdArr[j]].nodeInfo.nodeExcuteStatus = 2
        changeNodeIcon(2, null, notExecuteNodeIdArr[j])
    }
    // 判断所执行的节点集合中是否包含数据分层节点，有的话做特殊处理
    for (var i = 0; i < notExecuteNodeIdArr.length; i++) {
        // 如果是数据分层节点，并且结果表的数组长度不为0
        if (graph.nodeData[notExecuteNodeIdArr[i]].nodeInfo.optType === 'layering' && graph.nodeData[notExecuteNodeIdArr[i]].nodeInfo.resultTableNameArr.length > 0) {
            // 获取当前节点的子节点（结果表）的ID数组
            var childrenIds = graph.nodeData[notExecuteNodeIdArr[i]].childrenIds
            if (childrenIds && childrenIds.length > 0) {
                for (var c = 0; c < childrenIds.length; c++) {
                    // 如果队列中的子节点ID在所有待执行的节点的ID队列中
                    if ($.inArray(childrenIds[c], notExecuteNodeIdArr) > 0) {
                        // 获取执行队列中子节点（结果表）的下标
                        var index = graph.nodeData[childrenIds[c]].nodeInfo.index
                        // 设置数据分层节点当前被执行的是第几个子节点
                        graph.nodeData[notExecuteNodeIdArr[i]].setting.index = index
                        // 获取数据分层节点的结果表数组
                        var resultTableNameArr = graph.nodeData[notExecuteNodeIdArr[i]].nodeInfo.resultTableNameArr
                        // 若数组不为空（其部分子节点被执行过）
                        if (resultTableNameArr.length > 0) {
                            // 设置数据分层节点的当前队列中子节点的结果表名称
                            graph.nodeData[notExecuteNodeIdArr[i]].nodeInfo.resultTableName = resultTableNameArr[index]
                        }
                    }
                }
            }
        }
    }
    var executeCellId = graph.curCell.id
    // 校验结果表是否有自己的配置信息
    var isSet = graph.nodeData[executeCellId].isSet
    var parentIds = graph.nodeData[executeCellId].parentIds
    // 记录执行操作
    refrashHistoryZtree('开始执行【' + graph.curCell.value + '】节点')
    // 自动保存图形化
    autoSaveGraph()
    var executeId = new UUIDGenerator().id
    var dataParam = {
        'openType': graph.openType,
        'executeId': executeId,
        'graphUuid': $('#graphUuid').val(),
        'graphName': $('#graphName').val(),
        'nodeIdList': notExecuteNodeIdArr.join(","),
        'nodeData': JSON.stringify(graph.nodeData),
        'websocketBatchId':graphIndexVue.websocketBatchId
        // 'executeType':1//执行本节点
    }
    $('#sysInfoArea').html('')
    graphIndexVue.executeNodeIdArr = notExecuteNodeIdArr
    graphIndexVue.executeId = executeId
    graphIndexVue.resultTableArr = []
    graphIndexVue.$nextTick( () => {
        executeNodeSql(dataParam).then(response => {
            if(response.data != null){
                // $('#sysInfoArea').html(response.data.message)
                if(response.data.isError){
                    $('#sysInfoArea').append("<p style='color:red'>节点执行失败！\n错误信息："+ response.data.message +"</p>");
                    graphIndexVue.layuiTabClickLi(1)
                    // 更改执行状态图标为未执行
                    for (var j = 0; j < notExecuteNodeIdArr.length; j++) {
                        graph.nodeData[notExecuteNodeIdArr[j]].nodeInfo.nodeExcuteStatus = 1
                        changeNodeIcon(1, null, notExecuteNodeIdArr[j])
                    }
                    // 循环所有节点变更执行状态有变化的节点执行状态信息
                    // nodeCallBack(notExecuteNodeIdArr, response.data.nodeData, executeId)
                    autoSaveGraph()
                }
            }else{
                $('#sysInfoArea').html("请求失败！")
            }
        })
    })
}

/**
 * 执行到本节点（执行当前节点这条线上所有节点，包括已执行过的）
 * */
export function executeToNode() {
    if (!validateJs.executeVerify()) {
        return
    }
    // 从当前执行节点（选中节点）递归查找所有非原表的前置节点集合,start
    var notExecuteNodeIdArr = [graph.curCell.id]
    notExecuteNodeIdArr = getPreNodesNotDatasource(graph.nodeData, graph.curCell.id, notExecuteNodeIdArr)
    // 从当前执行节点（选中节点）递归查找所有非原表的前置节点集合,end
    executeNode(notExecuteNodeIdArr)
}

/**
 * 全部执行
 * */
export function executeAllNode() {
    // 获取当前图形化中所有末级结果表节点集合
    var nodeDataArr = []
    var cells = graph.getModel().cells
    var key = Object.keys(cells)
    if (key && key.length > 0) {
        for (var i = 0; i < key.length; i++) {
            if (cells[key[i]].vertex === 1 && graph.nodeData[key[i]]) {
                // 如果是节点且节点类型是结果表(无下级节点)
                var parentIds = []; var preNodeData = {}
                if (graph.nodeData[key[i]].nodeInfo.optType === 'newNullNode' && graph.nodeData[key[i]].childrenIds.length === 0) {
                    // 向上找一层
                    parentIds = graph.nodeData[key[i]].parentIds
                    if (parentIds && parentIds.length > 0) {
                        preNodeData = graph.nodeData[parentIds[0]]
                        if (preNodeData && !preNodeData.isSet) { // 如果当前结果表节点的父节点没有配置
                            // 再向上找一层
                            parentIds = graph.nodeData[preNodeData.nodeInfo.nodeId].parentIds
                            if (parentIds && parentIds.length > 0) {
                                for (var k = 0; k < parentIds.length; k++) {
                                    if (graph.nodeData[parentIds[k]] && graph.nodeData[parentIds[k]].nodeInfo.optType === 'newNullNode') {
                                        nodeDataArr.push(graph.nodeData[parentIds[k]])
                                    }
                                }
                            }
                        } else {
                            if (graph.nodeData[key[i]]) {
                                nodeDataArr.push(graph.nodeData[key[i]])
                            }
                        }
                    }
                }
                // 如果是节点且节点类型是自定义图形
                if (graph.nodeData[key[i]].nodeInfo.optType === 'barChart') {
                    // 向上找一层
                    parentIds = graph.nodeData[key[i]].parentIds
                    if (parentIds && parentIds.length > 0) {
                        preNodeData = graph.nodeData[parentIds[0]]
                        // 如果该上级节点的类型是结果表
                        if (preNodeData && preNodeData.nodeInfo && preNodeData.nodeInfo.optType === 'newNullNode') {
                            nodeDataArr.push(graph.nodeData[preNodeData.nodeInfo.nodeId])
                        }
                    }
                }
            }
        }
    }
    if (nodeDataArr.length === 0) {
        graphIndexVue.$message({ type: 'warning', message: '暂无可执行的节点' })
        return
    }
    graphIndexVue.$confirm('运行全部的节点耗时较长，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
    }).then(() => {
        for (var i = 0; i < key.length; i++) {
            // 如果是节点且不是原表，则先变更节点的执行状态为未执行
            if (cells[key[i]].vertex === 1 && graph.nodeData[key[i]] && graph.nodeData[key[i]].nodeInfo &&
                graph.nodeData[key[i]].nodeInfo.optType !== 'datasource' && graph.nodeData[key[i]].nodeInfo.nodeExcuteStatus !== 1) {
                graph.nodeData[key[i]].nodeInfo.nodeExcuteStatus = 1
                changeNodeIcon(1, null, key[i])
            }
        }
        // 记录执行操作
        refrashHistoryZtree('开始全部执行所有节点')
        // notExecuteNodeObject待执行节点的对象，格式{"executeId":notExecuteNodeIdArr}
        // 其中，executeId为当前这条线的执行ID（自动生成），notExecuteNodeIdArr为该结果表节点的所有非原表的前置节点ID集合
        var notExecuteNodeObject = {}// 每条线的节点数组所组成的大数组对象，格式[[],[],[]...]
        var allNodeIdArr = []// 所有待执行节点的ID集合
        var returnObj = {
            'verify': true,
            'message': ''
        }
        // 以每个末级结果表所关联前置的节点为一条线，每次循环获取这条线上所有的节点
        for (var j = 0; j < nodeDataArr.length; j++) {
            // 获取当前结果表的节点ID
            var nodeId = nodeDataArr[j].nodeInfo.nodeId
            // 获取当前结果表节点
            var cell = graph.getModel().getCell(nodeId)
            if (cell) {
                // 获取该节点的所有非原表的前置节点集合
                var notExecuteNodeIdArr = getPreNodesNotDatasource(graph.nodeData, cell.id, [cell.id])
                // 判断当前队列中是否存在未配置成功的操作节点
                if (hasNotSetNode(notExecuteNodeIdArr)) {
                    returnObj.verify = false
                    returnObj.message = '当前执行的节点中存在未配置的节点'
                    break
                }
                // 处理待执行节点队列数组
                returnObj = dealWithNodeIdArr(notExecuteNodeIdArr)
                if (!returnObj.verify) {
                    break
                }
                allNodeIdArr.push.apply(allNodeIdArr, notExecuteNodeIdArr)
                var executeId = new UUIDGenerator().id// 生成执行ID
                notExecuteNodeObject[executeId] = notExecuteNodeIdArr
            }
        }
        if (!returnObj.verify) {
            graphIndexVue.$message({ type: 'warning', message: returnObj.message })
            return
        }
        // 获取组织参数的html代码
        returnObj = createParamNodeHtml(allNodeIdArr)
        if (returnObj.htmlContent && returnObj.htmlContent !== '') { // 如果有组织的参数html
            graph.htmlContent = returnObj.htmlContent// 将html串绑定在graph上
            layer.open({
                id: 'nodeParamSetting',
                type: 2,
                title: '节点参数设置',
                content: 'page/inputParams/inputParams.jsp',
                area: ['1000px', '600px'],
                skin: 'layui-layer-lan',
                btn: ['确定', '取消'],
                btn1: function(index, layero) {
                    // 替换节点的参数
                    var returnVal = $(layero).find('iframe')[0].contentWindow.replaceNodeParam()
                    if (returnVal.verify) {
                        layer.close(index)
                        // 节点的核心执行方法
                        executeAllNode_callback(allNodeIdArr, notExecuteNodeObject)
                    } else {
                        graphIndexVue.$message({ type: 'info', message: returnVal.message })
                    }
                },
                btn2: function(index, layero) {
                    layer.close(index)
                }
            })
        } else {
            // 节点的核心执行方法
            executeAllNode_callback(allNodeIdArr, notExecuteNodeObject)
        }
        // 记录执行操作
        refrashHistoryZtree('节点全部执行完毕')
    })
}

/**
 * 全部执行内部调用方法
 * @param nodeIdArr 待执行节点的数组，格式：[[],[],[]]
 * @param notExecuteNodeObject 待执行节点的对象，格式{"executeId":*,"notExecuteNodeIdArr":[]}
 * */
function executeAllNode_callback(nodeIdArr, notExecuteNodeObject) {
    // 更改执行状态图标为执行中
    for (var i = 0; i < nodeIdArr.length; i++) {
        if (graph.nodeData[nodeIdArr[i]].nodeInfo.nodeExcuteStatus !== 2) {
            graph.nodeData[nodeIdArr[i]].nodeInfo.nodeExcuteStatus = 2
            changeNodeIcon(2, null, nodeIdArr[i])
        }
    }
    var load = $('body').mLoading({ 'text': '正在执行全部节点，请稍后……', 'hasCancel': false, 'hasTime': true })
    var dataParam = {
        'openType': graph.openType,
        'graphUuid': $('#graphUuid').val(),
        'graphName': $('#graphName').val(),
        'nodeIdList': nodeIdArr,
        'nodeData': JSON.stringify(graph.nodeData),
        'nodeObject': JSON.stringify(notExecuteNodeObject)
    }
    $.ajax({
        url: contextPath + '/graphEditor/executeAllNode',
        type: 'post',
        data: dataParam,
        dataType: 'json',
        timeout: limitTime, // 超时时间设置，单位毫秒,此处设置20分钟超时
        complete: function(xhr) {
            load.hide()
            if (xhr.statusText === 'timeout') {				// 如果出现超时，每隔一分钟从缓冲表中查询与当前图形化有关的执行中节点的执行结果信息
                alertMsg('提示', '执行时间较长，已提交至后台执行，可刷新页面重新查看图形的执行结果', 'info')
            } else {
                if (xhr.responseJSON.isError) {
                    alertMsg('提示', xhr.responseJSON.message, 'info')
                    // 更改执行状态图标为未执行
                    for (var i = 0; i < nodeIdArr.length; i++) {
                        graph.nodeData[nodeIdArr[i]].nodeInfo.nodeExcuteStatus = 1
                        changeNodeIcon(1, null, nodeIdArr[i])
                    }
                } else {
                    $('ul.layui-tab-title li:eq(1)').click()
                    $('#sysInfoArea').html(xhr.responseJSON.message)
                    // 循环所有节点变更执行状态有变化的节点执行状态信息
                    nodeCallBack(nodeIdArr, JSON.parse(xhr.responseJSON.nodeData), null)
                }
                // 自动保存图形化
                autoSaveGraph()
            }
        }
    })
}

/**
 * 执行后或新打开图形化后的部分功能回调
 * @param executeNodeArr 执行中的节点ID集合
 * @param executeNodeData 执行中的节点信息集合
 * @param executeId	 缓冲表中存储的执行中节点数据的主键ID
 * */
export function nodeCallBack(executeNodeArr, executeNodeData, executeId) {
    var stopNodeId = ''					// 停止节点的ID
    for (var k = 0; k < executeNodeArr.length; k++) {
        if (!graph.nodeData[executeNodeArr[k]]) {		// 若没有当前节点，直接跳过
            continue
        }
        if (graph.nodeData[executeNodeArr[k]].nodeInfo.nodeExcuteStatus !== 2 && stopNodeId === executeNodeArr[k]) {			// 若当前节点是停止节点（只针对于结果表）
            continue
        }
        if (graph.nodeData[executeNodeArr[k]].nodeInfo.nodeExcuteStatus === 1) {			// 若当前节点是因取消执行操作变为未执行，直接跳过
            continue
        }
        if(typeof executeNodeData !== "undefined" && executeNodeData != null){
            // 循环赋值
            graph.nodeData[executeNodeArr[k]] = $.extend(true, {}, executeNodeData[executeNodeArr[k]])
        }
        var nodeExcuteStatus = graph.nodeData[executeNodeArr[k]].nodeInfo.nodeExcuteStatus
        var optType = graph.nodeData[executeNodeArr[k]].nodeInfo.optType
        var isSet = graph.nodeData[executeNodeArr[k]].isSet
        // 获取当前节点的所有子孙节点集合
        var cIdArr = getAllChildrenIds(executeNodeArr[k])
        // 获取当前节点的所有子集合
        var childrenIds = graph.nodeData[executeNodeArr[k]].childrenIds
        if (nodeExcuteStatus === 3) {
            if (optType === 'sql') {					// SQL查询器单独处理SQL语句
                var sql = strEncryption(graph.nodeData[executeNodeArr[k]].nodeInfo.nodeSql)
                graph.nodeData[executeNodeArr[k]].setting.sql = sql
                graph.nodeData[executeNodeArr[k]].nodeInfo.nodeSql = sql
                graph.nodeData[executeNodeArr[k]].nodeInfo.resultSql = strEncryption(graph.nodeData[executeNodeArr[k]].nodeInfo.resultSql)
            }
            if (optType !== 'newNullNode') {					// 如果当前节点是操作节点
                if (optType === 'layering') {					// 如果节点是数据分层，则需特殊处理
                    // 获取当前节点的所有下一级节点
                    var childrenIds = graph.nodeData[executeNodeArr[k]].childrenIds
                    if (childrenIds.length > 0) {
                        var childCount = 0
                        for (var j = 0; j < childrenIds.length; j++) {
                            var child_nodeExcuteStatus = graph.nodeData[childrenIds[j]].nodeInfo.nodeExcuteStatus
                            if (child_nodeExcuteStatus === 3 || child_nodeExcuteStatus === 2) {
                                childCount++
                            }
                        }
                        if (childCount === childrenIds.length) {
                            changeNodeIcon(3, null, executeNodeArr[k])
                        } else {
                            changeNodeIcon(1, null, executeNodeArr[k])
                            graph.nodeData[executeNodeArr[k]].nodeInfo.nodeExcuteStatus = 1
                        }
                    }
                } else {
                    changeNodeIcon(3, null, executeNodeArr[k])
                }
            } else {
                if (stopNodeId !== executeNodeArr[k]) {				// 如果当前结果表不是停止节点
                    changeNodeIcon(3, null, executeNodeArr[k])
                }
            }
        }
        if (nodeExcuteStatus === 4) {				// 如果当前节点执行出错，则后置子孙节点状态置为未执行
            changeNodeIcon(4, null, executeNodeArr[k])
            graph.nodeData[executeNodeArr[k]].nodeInfo.nodeExcuteStatus = 4
            if (optType !== 'newNullNode') {						// 如果当前节点为操作节点
                if (optType === 'sql') {					// SQL查询器单独处理SQL语句
                    var sql = strEncryption(graph.nodeData[executeNodeArr[k]].nodeInfo.nodeSql)
                    graph.nodeData[executeNodeArr[k]].setting.sql = sql
                    graph.nodeData[executeNodeArr[k]].nodeInfo.nodeSql = sql
                    graph.nodeData[executeNodeArr[k]].nodeInfo.resultSql = strEncryption(graph.nodeData[executeNodeArr[k]].nodeInfo.resultSql)
                }
                for (var t = 0; t < childrenIds.length; t++) {						// 遍历当前节点的所有子集合
                    if ($.inArray(childrenIds[t], executeNodeArr) > -1) {		// 如果子节点ID包含在执行节点队列中，节点状态与当前节点状态保持一致，为执行出错状态
                        if (graph.nodeData[childrenIds[t]].isSet) {
                            stopNodeId = executeNodeArr[k]
                        } else {
                            stopNodeId = childrenIds[t]
                            graph.nodeData[childrenIds[t]].nodeInfo.nodeExcuteStatus = 4
                            changeNodeIcon(4, null, childrenIds[t])
                        }
                    }
                }
                for (var j = 0; j < cIdArr.length; j++) {						// 遍历当前节点的所有子孙节点集合
                    if ($.inArray(cIdArr[j], executeNodeArr) > -1 && $.inArray(cIdArr[j], childrenIds) < 0) { // 如果子孙节点ID包含在执行节点队列中且不包含在子节点ID集合中（即当前节点的所有孙子节点）
                        graph.nodeData[cIdArr[j]].nodeInfo.nodeExcuteStatus = 1
                        changeNodeIcon(1, null, cIdArr[j])
                    }
                }
            } else {
                if (isSet) {
                    stopNodeId = executeNodeArr[k]
                }
            }
        }
    }
    if (executeId && executeId !== '') {
        // 删除缓冲表中的执行节点信息
        deleteExecuteNodes(executeId).then();
    }
}

/**
 * 判断当前待执行的节点中是否存在未配置的操作节点
 * @param nodeIdArr 待执行的节点的ID集合
 */
function hasNotSetNode(nodeIdArr) {
    var isExsist = false
    // 判断当前队列中是否存在未配置成功的操作节点
    for (var n = 0; n < nodeIdArr.length; n++) {
        var curNodeData = graph.nodeData[nodeIdArr[n]]
        // 如果存在未配置的操作节点
        if (curNodeData && curNodeData.nodeInfo.optType !== 'datasource' && curNodeData.nodeInfo.optType !== 'newNullNode' && !curNodeData.isSet) {
            isExsist = true
            break
        }
    }
    return isExsist
}

/**
 * 判断当前执行的节点集合中有没有需要创建表的节点（即保存数据的节点）
 * @param nodeIdArr 待执行节点集合
 */
function hasCreateTableNode(nodeIdArr) {
    var result = false
    for (var i = 0; i < nodeIdArr.length; i++) {
        var isCreateTable = graph.nodeData[nodeIdArr[i]].nodeInfo.isCreateTable
        if (isCreateTable === 1) { // 保存数据
            result = true
            break
        }
    }
    return result
}

/**
 * 设置模型最终结果表或中间结果表的图标
 * @param status 是否标记：1、移除标记，2、打标记
 * @param type 标记类型：0、中间结果表标记，1、最终结果表标记
 * */
export function setNodeOutputTypeIcon(status, type) {
    var curCellId = graph.curCell.id
    var url = ''
    if (type === 0) { // 中间结果表标记的图片路径
        url = '../../lib/graphtool/images/graphicon/centeroutmark@2x.png'
    } else { // 最终结果表标记的图片路径
        url = '../../lib/graphtool/images/graphicon/finaloutmark@2x.png'
    }
    $('.output-mark').each(function(i, v) {
        if ($(this)[0].getAttribute('nodeId') === curCellId) {
            if (status === 2) {
                $(this).attr('xlink:href', url)
            } else {
                $(this).attr('xlink:href', '')
            }
        }
    })
}

/**
 * 根据当前节点的执行状态和配置状态切换小图标
 * @param	nodeExcuteStatus	节点执行状态
 * @param	isSet	节点配置状态
 * @param	id		需改变的当前节点的ID
 * */
export function changeNodeIcon(nodeExcuteStatus, isSet, id) {
    var curCellId = id || graph.curCell.id
    $('.exestate-mark').each(function(i, v) {
        if ($(this)[0].getAttribute('nodeId') === curCellId) { // 有两个
            if (nodeExcuteStatus && nodeExcuteStatus != null) {
                switch (nodeExcuteStatus) {
                    case 1:		// 未执行
                        $(this).attr('xlink:href', '../../lib/graphtool/images/icon/point_gray.png')
                        break
                    case 2:	// 执行中
                        $(this).attr('xlink:href', '../../lib/graphtool/images/icon/point_yellow.png')
                        break
                    case 3:	// 执行成功
                        $(this).attr('xlink:href', '../../lib/graphtool/images/icon/point_green.png')
                        break
                    case 4:	// 执行失败
                        $(this).attr('xlink:href', '../../lib/graphtool/images/icon/point_red.png')
                        break
                }
            }
            if (isSet != null && typeof (isSet) !== 'undefined') {
                if (isSet) {
                    $('.setting-mark:eq(' + i + ')').attr('xlink:href', '../../lib/graphtool/images/icon/point_green.png')
                } else {
                    $('.setting-mark:eq(' + i + ')').attr('xlink:href', '../../lib/graphtool/images/icon/point_gray.png')
                }
            }
        }
    })
}

/**
 * 设置原表的复制图标
 * */
export function setDataSourceCopyIcon(curCellId) {
    $('.copyIcon-mark').each(function(i, v) {
        if ($(this)[0].getAttribute('nodeId') === curCellId) {
            $(this).attr('xlink:href', '../../lib/graphtool/images/icon/copyIcon.png')
        }
    })
}

/**
 * 根据当前节点ID，高亮显示其前置节点和线
 * */
export function lightHeight(curCellId) {
    // 先清空前一次高亮节点结合的样式，start
    var cells = graph.highLight
    if (cells && cells.length > 0) {
        for (var k = 0; k < cells.length; k++) {
            if (cells[k].edge) {
                var h = new mxCellHighlight(graph, '#3e6f96', 2)
                h.highlight(graph.view.getState(cells[k]))
            }
        }
        if (hL != null) {
            hL.destroy()
        }
    }
    // end
    if (!curCellId || curCellId == null) {
        return
    }
    graph.highLight = []
    var parent = graph.getDefaultParent()
    var parentChildren = parent.children
    for (var i = 0; i < parentChildren.length; i++) {
        if (parentChildren[i].edge && parentChildren[i].target && parentChildren[i].target.id === curCellId) {
            graph.highLight.push(parentChildren[i])// 获取线
            graph.highLight.push(parentChildren[i].source)// 获取节点
        }
        if (parentChildren[i].vertex === 1 && !parentChildren[i].source && parentChildren[i].id === curCellId) {
            graph.highLight.push(parentChildren[i])// 获取当前节点（无父节点时高亮）
        }
    }
    for (var j = 0; j < graph.highLight.length; j++) {
        hL = new mxCellHighlight(graph, '#00A8FF', 2)
        hL.highlight(graph.view.getState(graph.highLight[j]))
    }
}

/**
 * SQL详情（查询执行语句）
 */
export function curNodeSQL() {
    var nodeSql = ''
    var nodeExcuteStatus = graph.nodeData[graph.curCell.id].nodeInfo.nodeExcuteStatus
    if (nodeExcuteStatus === 1) {			// 未执行
        alertMsg('提示', '该节点尚未执行，请执行后再查看！', 'info')
        return
    } else if (nodeExcuteStatus === 2) {			// 执行中
        alertMsg('提示', '该节点尚未执行完成，请等待执行完成后再查看！', 'info')
        return
    } else {
        var optType = graph.nodeData[graph.curCell.id].nodeInfo.optType
        var isSet = graph.nodeData[graph.curCell.id].isSet
        if (optType === 'newNullNode' && !isSet) {					// 结果表未配置（空结果表）
            var curId = graph.nodeData[graph.curCell.id].parentIds[0]
            optType = graph.nodeData[curId].nodeInfo.optType
            switch (optType) {
                case 'layering':// 数据分层需根据当前结果的下标在上级节点的SQL数组中取
                    var index = graph.nodeData[graph.curCell.id].nodeInfo.index
                    nodeSql = graph.nodeData[curId].nodeInfo.nodeSqlArr[index]
                    break
                case 'sql':// SQL编辑器中的SQL语句是加密的，需解密显示
                    nodeSql = strDecryption(graph.nodeData[curId].nodeInfo.resultSql)
                    break
                default:
                    nodeSql = graph.nodeData[curId].nodeInfo.nodeSql
                    break
            }
            var hasParam = graph.nodeData[curId].hasParam
            var paramsSetting = graph.nodeData[curId].paramsSetting
            if (hasParam && paramsSetting && paramsSetting.arr && paramsSetting.arr.length !== 0) {
                var replaceParamSql = graph.nodeData[curId].replaceParamSql
                nodeSql = 'SELECT * FROM (' + nodeSql + ') WHERE ' + replaceParamSql
            }
        } else if (optType === 'sql') {
            nodeSql = strDecryption(graph.nodeData[graph.curCell.id].nodeInfo.nodeSql)
        } else {
            nodeSql = graph.nodeData[graph.curCell.id].nodeInfo.nodeSql
        }
    }
    layer.open({
        id: 'curNodeSQL',
        type: 1,
        title: '查询执行语句',
        content: "<textarea style='width: 100%; height: 100%; border: none; padding: 5px; resize: none;'></textarea>",
        area: ['800px', '400px'],
        skin: 'layui-layer-lan',
        resize: false,
        scrollbar: false,
        success: function(layero) {
            $('#curNodeSQL').css('overflow', 'hidden')
            if (typeof nodeSql === 'undefined' || nodeSql === '' || nodeSql === 'undefined') {
                nodeSql = '无'
            }
            $('#curNodeSQL>textarea').val(nodeSql)
        }
    })
}

/**
 * 双击预览数据 / 右键查看数据
 * */
export function previewNodeData() {
    let curNodeInfo = graph.nodeData[graph.curCell.id].nodeInfo;
    let nodeExcuteStatus = curNodeInfo.nodeExcuteStatus
    if (nodeExcuteStatus !== 3) {
        graphIndexVue.$message({ type: 'warning', message: '当前节点未执行成功，不能预览数据' })
        return
    }
    let nodeId = ''
    let nodeName = ''
    let resultTableName = ''
    switch (curNodeInfo.optType) {
        case 'datasource':				// 如果是原表，直接拿其临时表名称
            resultTableName = curNodeInfo.resultTableName
            nodeId = curNodeInfo.nodeId
            nodeName = curNodeInfo.nodeName
            break
        case 'newNullNode':// 如果是结果表
            if (!curNodeInfo.isSet) {// 如果是未配置的结果表，拿其前置节点的临时表名称
                var parentIds = graph.nodeData[graph.curCell.id].parentIds
                if (graph.nodeData[parentIds[0]].nodeInfo.optType === 'layering') {
                    resultTableName = graph.nodeData[parentIds[0]].nodeInfo.resultTableNameArr[curNodeInfo.index]
                } else {
                    resultTableName = graph.nodeData[parentIds[0]].nodeInfo.resultTableName
                }
                nodeId = graph.nodeData[parentIds[0]].nodeInfo.nodeId
                nodeName = graph.nodeData[parentIds[0]].nodeInfo.nodeName+"_"+graph.nodeData[graph.curCell.id].nodeInfo.nodeName
            } else {																										// 如果是非空结果表，直接拿其临时表名称
                resultTableName = curNodeInfo.resultTableName
                nodeId = curNodeInfo.nodeId
                nodeName = curNodeInfo.nodeName
            }
            break
    }
    if (resultTableName === '') {
        graphIndexVue.$message.error('预览数据的表名称为空，预览失败')
        return
    }
    graphIndexVue.resultTableArr = []
    graphIndexVue.$nextTick( () => {
        graphIndexVue.websocketBatchId = new UUIDGenerator().id
        graphIndexVue.resultTableArr = [{nodeId, nodeName, resultTableName}]
        graphIndexVue.preValue = [{id:nodeId,name:nodeName}]
        graphIndexVue.layuiTabClickLi(0)
        graphIndexVue.viewData()
    })
}

/**
 * 预览数据
 * @param tableName 预览表名称
 * @param optType 节点类型，可为空
 * @param connGraph 是否关联图形化功能菜单
 * @param viewAllData 是否预览全部数据
 * */
function viewData(tableName, optType, connGraph, viewAllData) {
    $('ul.layui-tab-title li:eq(0)').click()
    var load = $('#tableArea').mLoading({ 'hasTime': true })
    var dataParam = {
        'tableName': tableName,
        'openType': graph.openType,
        'viewAllData': !!viewAllData
    }
    $.ajax({
        url: contextPath + '/graphEditor/viewData',
        type: 'post',
        data: dataParam,
        dataType: 'json',
        success: function(res) {
            load.destroy()
            if (res.isError) {
                $('ul.layui-tab-title li:eq(1)').click()
                $('#sysInfoArea').html(res.message)
                $('#sysInfoArea').css({ 'color': 'red' })
            } else {
                $('#exportAllData').show()
                $('#viewAllData').show()
                $('#sysInfoArea').html(res.message)
                $('#sysInfoArea').css({ 'color': '#0DD140' })
                $('#tableArea').html(handSonTableHtml())
                var setting = {
                    'url': contextPath + '/graphEditor/viewData',
                    'param': dataParam,
                    'res': res,
                    'dropDownMenu': true,
                    'readOnly': true,
                    'isPage': true,
                    'contextMenu': true,
                    'pageUp': true,
                    'connGraph': connGraph,
                    'relation': true,
                    'viewAllData': viewAllData
                }
                if (optType && optType !== '') {				// 需特殊处理节点的结果集数据
                    var columnsSet = []
                    if (graph.curCell) {
                        graph.curCellId = graph.curCell.id
                    }
                    switch (optType) {
                        case 'comparison':							// 频次分析
                            if (res.columnInfo && res.columnInfo.columnList) {
                                let columnInfo = res.columnInfo.columnList
                                for (var i = 0; i < columnInfo.length; i++) {
                                    var obj = {
                                        'data': columnInfo[i].columnName,
                                        'readOnly': true
                                    }
                                    if (columnInfo[i].columnName === '涉及表数量') {
                                        obj.renderer = comparisonLink
                                    } else {
                                        obj.renderer = 'html'
                                    }
                                    columnsSet.push(obj)
                                }
                            }
                            break
                    }
                    setting.columnsSet = columnsSet
                }
                handSonTableFun(setting)
                graph.curTableName = tableName
            }
        }
    })
}

/**
 * 关联表查询
 * @param tableName 表名称
 * */
function relationTableQueryDialog(tableName) {
    var relationTableInit = function(tableName) {
        var tableGridObj = new TableGrid()
        var setting = {
            tableId: 'resultTable',
            tableUrl: contextPath + '/graphEditor/getRightMenuRelationTable',
            params: { 'tableName': tableName },
            rownumbers: true,
            colModel: [
                {
                    'label': '原表名',
                    'name': 'SOURCE_TABLE',
                    'align': 'center'
                }, {
                    'label': '关联表名',
                    'name': 'TARGET_TABLE',
                    'align': 'center'
                }, {
                    'label': '原表字段',
                    'name': 'SOURCE_COLUMN',
                    'align': 'center'
                }, {
                    'label': '关联表字段',
                    'name': 'TARGET_COLUMN',
                    'align': 'center'
                }
            ],
            scroll: false,
            height: '100%',
            width: '100%'
        }
        tableGridObj.initGridData(setting)
    }
    layer.open({
        id: 'relationTableQueryDialog',
        type: 1,
        title: '关联表查询',
        content: '<div id="tableArea" class="table-view" style="width:100%;"><table class="table table-striped" id="resultTable"></table></div>',
        area: ['800px', '400px'],
        skin: 'layui-layer-lan',
        resize: false,
        scrollbar: false,
        success: function(layero) {
            relationTableInit(tableName)
        }
    })
}

/**
 * 频次分析的结果集数据添加超链接
 * */
function comparisonLink(instance, td, row, col, prop, value, cellProperties) {
    var escaped = Handsontable.helper.stringify(value)
    var parentIds = graph.nodeData[graph.curCell.id].parentIds
    var dataTableName = graph.nodeData[parentIds[0]].nodeInfo.dataTableName
    var cVal = $(td).parent().find('td:eq(0)').html()
    td.innerHTML = '<a href="javascript:void(0)" onclick="showTableDetail(\'' + dataTableName + '\',\'' + cVal + '\')" style="cursor:point">' + escaped + '</a>'
    return td
}

/**
 * 展示频次分析各个表的具体数据
 * */
function showTableDetail(dataTableName, cVal) {
    cVal = escape(encodeURIComponent(cVal))
    layer.open({
        id: 'analysisDataDetail',
        type: 2,
        title: '频次分析数据详情',
        content: 'page/C_Rows_Data/analysisDetailData.jsp?dataTableName=' + encodeURIComponent(dataTableName) + '&cVal=' + cVal + '&openType=' + graph.openType,
        area: ['90%', '90%'],
        skin: 'layui-layer-lan',
        resize: false,
        scrollbar: false,
        btn: ['关闭'],
        btn1: function(index) {
            layer.close(index)
        }
    })
}

/**
 * 节点重命名
 * */
export function reName() {
    var value = graph.curCell.value
    var name = graph.curCell.edge ? '连接线序号' : '节点名称'
    var html = '<div class="form-group" style="padding-top:35px;">' +
        '<label for="nodeName" class="col-sm-3 control-label" style="text-align:right;">' + name + '</label>' +
        '<div class="col-sm-8">'
    if (graph.curCell.edge) {
        html += '<input type="number" class="form-control" id="nodeName" autocomplete="off" placeholder="重命名" step="1"/>'
    } else {
        html += '<input type="text" class="form-control" id="nodeName" autocomplete="off" placeholder="重命名"/>'
    }
    html += '</div></div>'
    layer.open({
        id: 'reName',
        type: 1,
        title: '重命名',
        content: html,
        area: ['400px', '200px'],
        skin: 'layui-layer-lan',
        resize: false,
        scrollbar: false,
        btn: ['确定', '取消'],
        success: function(layero) {
            $('#curNodeSQL').css('overflow', 'hidden')
            $('#nodeName ').val(value)
        },
        btn1: function(index, layero) {
            var newVal = $('#nodeName').val()
            if (newVal === '') {
                alertMsg('提示', '节点名称不能为空', 'info')
                return false
            }
            var oldName = graph.curCell.value
            graph.cellLabelChanged(graph.curCell, newVal, null)
            if (graph.curCell.vertex === 1) {
                updateResourceZtreeNodeName(graph.curCell.id, newVal)
                // 更新操作痕迹树
                refrashHistoryZtree('重命名节点【' + newVal + '】')
            } else {
                refrashHistoryZtree('重命名连接线【' + newVal + '】')
            }
            if (graph.nodeData[graph.curCell.id] && graph.nodeData[graph.curCell.id].nodeInfo) {
                graph.nodeData[graph.curCell.id].nodeInfo.nodeName = newVal
            }
            // 自动保存图形化
            autoSaveGraph()
            layer.close(index)
        },
        btn2: function(index) {
            layer.close(index)
        }
    })
}

/**
 * 重新配置（只有结果表才有该事件）
 * */
function reSetProperty() {
    // 初始化节点信息
    var options = {
        'id': graph.curCell.id,
        'name': graph.curCell.value,
        'type': 'newNullNode'
    }
    initNodeData(options, false)
    // 判断前置节点的执行状态，与其保持一致
    var parentIds = graph.nodeData[graph.curCell.id].parentIds
    var nodeExcuteStatus = graph.nodeData[parentIds[0]].nodeInfo.nodeExcuteStatus
    graph.nodeData[graph.curCell.id].nodeInfo.nodeExcuteStatus = nodeExcuteStatus
    // 重置节点的状态图标
    changeNodeIcon(nodeExcuteStatus, graph.nodeData[graph.curCell.id].isSet)
}

/**
 * 清除配置（只有操作节点才有该事件）
 * */
export function reSetOptProperty() {
    graphIndexVue.$confirm('确定清除当前节点的配置信息?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
    }).then(() => {
        var curNodeId = graph.curCell.id
        var nodeExcuteStatus = graph.nodeData[curNodeId].nodeInfo.nodeExcuteStatus
        if (nodeExcuteStatus === 2) {
            graphIndexVue.$message({ type: 'warning', message: '当前节点正在执行，不可清除' })
            return
        }
        graph.nodeData[curNodeId].nodeInfo.nodeExcuteStatus = 1	// 置节点执行状态为未执行
        graph.nodeData[curNodeId].isSet = false// 重置其配置状态，在打开时不读取已配置信息，重新进行配置
        // 重置当前操作节点的状态图标
        changeNodeIcon(1, false, graph.curCell.id)
        // 更新其结果表的执行状态，与其保持一致
        var childrenIds = graph.nodeData[graph.curCell.id].childrenIds
        if (childrenIds && childrenIds.length > 0) {
            for (var i = 0; i < childrenIds.length; i++) {
                // 重置结果表节点的配置信息
                graph.nodeData[childrenIds[i]].nodeInfo.nodeExcuteStatus = 1	// 置节点执行状态为未执行
                graph.nodeData[childrenIds[i]].isSet = false// 重置其配置状态，在打开时不读取已配置信息，重新进行配置
                // 重置结果表节点的状态图标
                changeNodeIcon(1, false, childrenIds[i])
            }
        }
        autoSaveGraph()
        graphIndexVue.$message({ type: 'success', message: '节点配置已清除' })
    })
}

/**
 * SQL编辑
 */
function sqlNodeEdit() {
    var curSql = graph.nodeData[graph.curCell.id].setting.sql || ''
    window.sessionStorage.setItem('sql', curSql)
    layer.open({
        id: 'sqlNodeEdit',
        type: 2,
        title: '我的SQL编辑',
        content: '../sqlEditor/sqlEditor.jsp',
        area: ['100%', '100%'],
        skin: 'layui-layer-lan',
        resize: false,
        scrollbar: false,
        btn: ['确定', '取消'],
        success: function() {
            var link = "<a style='color:#fff;position:absolute;top:13px;right:80px;font-size:15px;' class='open_sql' href='#' title=\"点击查看详细的配置说明\">"
            link += '<img src="images/icon/open_help.png" width="16px" height="16px" style="background-size:100%;vertical-align:inherit;"/>'
            link += '<span style="position: relative;left: 5px;bottom: 2px;">帮助</span></a>'
            $('.layui-layer-title').after(link)
            $('.open_sql').click(function() {
                showSettingRemark('sql')
            })
        },
        btn1: function(index, layero) {
            var returnObj = $(layero).find('iframe')[0].contentWindow.getSaveInfo()
            if (returnObj.isError) {
                alertMsg('提示', returnObj.message, 'info')
            } else {
                if ($.trim(returnObj.sql) !== '') {
                    if (graph.openGraphType === '1') { // 如果是普通个人图形
                        sqlNodeEdit_callBack(returnObj, layero)
                        layer.close(index)
                    } else { // 如果是场景查询图形和模型图形
                        if (returnObj.isChange) {
                            confirmMsg('提示', returnObj.message + '，是否继续？', 'info', function() {
                                graph.nodeData[graph.curCell.id].sqlIsChanged = true
                                graph.nodeData[graph.curCell.id].columnsInfo = []// 若SQL发生改变，则清除当前节点的输出列信息
                                sqlNodeEdit_callBack(returnObj, layero)
                                layer.close(index)
                            }, function() {})
                        } else {
                            graph.nodeData[graph.curCell.id].sqlIsChanged = false
                            sqlNodeEdit_callBack(returnObj, layero)
                            layer.close(index)
                        }
                    }
                } else {
                    alertMsg('提示', '请输入SQL内容', 'info')
                }
            }
        },
        btn2: function(index) {
            layer.close(index)
        }
    })
}

function sqlNodeEdit_callBack(returnObj, layero) {
    var verify = $(layero).find('iframe')[0].contentWindow.verifySql()
    // if(!verify.verifyFormat){
    // 	alertMsg("提示","SQL语句不合法，验证不通过","warning");
    // 	return false;
    // }
    // 是否保存数据
    var ifSaveData = $(layero).find('iframe')[0].contentWindow.$('#ifSaveData')[0]
    // 获取用户自定义表名称（只有保存数据时才会有值,否则为“”值）
    var tableName = $(layero).find('iframe')[0].contentWindow.$('#dataTableName').val()
    // 获取旧的用户自定义的表名称（只有设置过保存数据且保存过节点配置时才会有，否则为“undefined”）
    var userTableName = graph.nodeData[graph.curCell.id].nodeInfo.userTableName
    if ($(ifSaveData).is(':checked')) {
        graph.nodeData[graph.curCell.id].nodeInfo.isCreateTable = 1
        graph.nodeData[graph.curCell.id].nodeInfo.userTableName = tableName
    } else {
        graph.nodeData[graph.curCell.id].nodeInfo.isCreateTable = 0
    }
    graph.nodeData[graph.curCell.id].isSet = true
    graph.nodeData[graph.curCell.id].nodeInfo.nodeExcuteStatus = 1
    graph.nodeData[graph.curCell.id].nodeInfo.nodeSql = strEncryption(returnObj.sql)
    graph.nodeData[graph.curCell.id].setting.sql = strEncryption(returnObj.sql)
    // 更新SQL编辑器的配置状态
    changeNodeIcon(1, true, graph.curCell.id)
    // 更新结果表的状态
    if (verify.verifySelect) {
        if (graph.nodeData[graph.curCell.id].childrenIds.length === 0) {
            graph.getModel().beginUpdate()
            try {
                // 自动生成结果表
                autoCreateNode()
            } finally {
                graph.getModel().endUpdate()
            }
        } else {
            if (returnObj.isChange || (userTableName && userTableName !== tableName)) { // 如果sql值有变化或者改变了用户自定义的结果表名称
                // 更改结果表的状态
                var nodeId = graph.nodeData[graph.curCell.id].childrenIds[0]
                changeNodeInfo(nodeId, true)
            }
        }
    }
    // 自动保存图形化
    autoSaveGraph()
}

/**
 * 获取所有原表的ID
 * */
export function getDataSourceTable() {
    var dataSourceNodeValArr = []
    var parent = graph.getDefaultParent()
    if (parent.children) {
        var parentChildren = parent.children
        for (var i = 0; i < parentChildren.length; i++) {
            if (parentChildren[i].vertex === 1 && graph.nodeData[parentChildren[i].id] && graph.nodeData[parentChildren[i].id].nodeInfo.optType === 'datasource') {
                dataSourceNodeValArr.push(parentChildren[i].value)
            }
        }
    }
    return dataSourceNodeValArr
}

/**
 * 判断当前队列中是否含有执行数据跑批的数据表节点
 * @param notExecuteNodeIdArr 待执行的节点ID集合
 * @param callback 执行的回调函数
 * @param executeAllNode 是否执行全部节点（全部执行功能）
 */
function hasRunningTaskTable(notExecuteNodeIdArr, callback, executeAllNode) {
    var tableNameArr = []// 使用到的源表名称
    var sql = ''// 临时存储所有SQL编辑器节点所汇总的SQL语句
    if (executeAllNode) { // 如果是全部执行，则只需找到所有的源表和SQL编辑器节点
        for (var t = 0; t < notExecuteNodeIdArr.length; t++) {
            nodeInfo = graph.nodeData[notExecuteNodeIdArr[t]].nodeInfo
            if (nodeInfo) {
                switch (nodeInfo.optType) {
                    case 'datasource':
                        tableNameArr.push(nodeInfo.nodeName)
                        break
                    case 'sql':
                        sql += nodeInfo.nodeSql + '\n'
                        break
                }
            }
        }
    } else {
        // 找出当前待执行节点队列中的头节点（可能不止一个且每个头节点只能是源表或SQL编辑器节点或操作节点）
        var headNodeArr = []
        var curNodeParentIds = ''
        for (var i = 0; i < notExecuteNodeIdArr.length; i++) {
            curNodeParentIds = graph.nodeData[notExecuteNodeIdArr[i]].parentIds
            if (curNodeParentIds) {
                if (curNodeParentIds.length === 0) { // 无父节点的为头节点
                    headNodeArr.push(notExecuteNodeIdArr[i])
                } else {
                    for (var j = 0; j < curNodeParentIds.length; j++) {
                        // 如果当前节点的父节点不包含在当前待执行队列中，则说明该节点是头节点
                        if (notExecuteNodeIdArr.indexOf(curNodeParentIds[j]) < 0 && headNodeArr.indexOf(notExecuteNodeIdArr[i]) < 0) {
                            headNodeArr.push(notExecuteNodeIdArr[i])
                            break
                        }
                    }
                }
            }
        }
        // 判断每个头节点所在的条线上是否存在已保存结果的结果表或原始业务表
        for (var k = 0; k < headNodeArr.length; k++) {
            curNodeParentIds = graph.nodeData[headNodeArr[k]].parentIds
            if (curNodeParentIds) {
                var nodeInfo
                if (curNodeParentIds.length === 0) { // 本身就是源表或SQL编辑器节点
                    nodeInfo = graph.nodeData[headNodeArr[k]].nodeInfo
                    if (nodeInfo) {
                        switch (nodeInfo.optType) {
                            case 'datasource':
                                tableNameArr.push(nodeInfo.nodeName)
                                break
                            case 'sql':
                                sql += nodeInfo.nodeSql + '\n'
                                break
                        }
                    }
                } else { // 临时表节点
                    var newNodeParentIds = []
                    // 过滤掉已存在于队列中头节点的父节点ID
                    for (var m = 0; m < curNodeParentIds.length; m++) {
                        if (notExecuteNodeIdArr.indexOf(curNodeParentIds[m]) < 0 && newNodeParentIds.indexOf(curNodeParentIds[m]) < 0) {
                            newNodeParentIds.push(curNodeParentIds[m])
                        }
                    }
                    // 递归获取当前节点的父节点中存在源表与SQL编辑器节点的集合
                    var nodeIds = getRunningTaskNodes(newNodeParentIds, [])
                    for (var n = 0; n < nodeIds.length; n++) {
                        nodeInfo = graph.nodeData[nodeIds[n]].nodeInfo
                        if (nodeInfo) {
                            switch (nodeInfo.optType) {
                                case 'datasource':
                                    tableNameArr.push(nodeInfo.nodeName)
                                    break
                                case 'sql':
                                    sql += nodeInfo.nodeSql + '\n'
                                    break
                            }
                        }
                    }
                }
            }
        }
    }
    var tableNames = tableNameArr.length === 0 ? '' : tableNameArr.join(',')
    if (sql === '' && tableNames === '') {
        if (typeof callback === 'function') {
            callback()
        }
    } else {
        var loading = $('body').mLoading({ 'text': '正在检测数据表信息，请稍后……' })
        $.post(contextPath + '/graphEditor/verifyRunningTask', { 'sql': sql, 'tableNames': tableNames }, function(e) {
            loading.destroy()
            if (e.isError) {
                if (e.data) {
                    if (confirm(e.message)) {
                        if (typeof callback === 'function') {
                            callback()
                        }
                    }
                } else {
                    alertMsg('提示', e.message, 'info')
                }
            } else {
                if (typeof callback === 'function') {
                    callback()
                }
            }
        }, 'json')
    }
}

/**
 * 递归获取当前节点的父节点中存在源表与SQL编辑器节点的集合
 * 如果当节点保存了临时表结果，则终止这条线剩余节点的递归查询
 * @param nodeParentIds 当前待递归查询节点的父节点ID集合
 * @param nodeIds 源表与SQL编辑器节点的集合
 */
function getRunningTaskNodes(nodeParentIds, nodeIds) {
    for (var i = 0; i < nodeParentIds.length; i++) {
        var nodeInfo = graph.nodeData[nodeParentIds[i]].nodeInfo
        if (nodeInfo) {
            if ((nodeInfo.optType === 'sql' || nodeInfo.optType === 'datasource') && nodeIds.indexOf(nodeParentIds[i]) < 0) { // SQL编辑器节点或源表
                nodeIds.push(nodeParentIds[i])
            } else { // 其他操作节点
                if (nodeInfo.nodeExcuteStatus !== 3 || nodeInfo.isCreateTable === 0) { // 节点未执行成功或者未保存临时结果数据，则继续向上递归查找
                    var pre_nodeParentIds = graph.nodeData[nodeParentIds[i]].parentIds
                    if (pre_nodeParentIds && pre_nodeParentIds.length > 0) {
                        nodeIds = getRunningTaskNodes(pre_nodeParentIds, nodeIds)
                    }
                }
            }
        }
    }
    return nodeIds
}

/**
 * 保存数据信息
 * @param id
 * @param setting
 */
function saveGraphData(id, setting) {
    graph.nodeData[id]['setting'] = setting// save settting
    graph.nodeData[id]['isSet'] = true
}

// 对字符串进行加密
function strEncryption(str) {
    str = encodeURIComponent(str)
    var key = CryptoJS.enc.Utf8.parse(enctyptionKey)
    var srcs = CryptoJS.enc.Utf8.parse(str)
    var encryptStr = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 })
    return encryptStr.toString()
}

// 对字符串进行解密
function strDecryption(str) {
    var key = CryptoJS.enc.Utf8.parse(enctyptionKey)
    var decryptStr = CryptoJS.AES.decrypt(str, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 })
    return decodeURIComponent(CryptoJS.enc.Utf8.stringify(decryptStr).toString())
}

// 判断更改的操作中是否包含节点
function hadNode(edit) {
    var hadNode = false
    for (var i = 0; i < edit.changes.length; i++) {
        var cell = edit.changes[i].cell ? edit.changes[i].cell : edit.changes[i].child
        if (cell.vertex === 1) {
            hadNode = true
            break
        }
    }
    return hadNode
}

// 撤销上一步操作，改变节点信息
function changeUndoNodeInfo(edit, flag) {
    if (hadNode(edit)) {
        var valArr = getDataSourceTable()
        var optType = graph.oldOptArr[graph.oldOptArr.length - 1].optType
        var optArr = graph.oldOptArr[graph.oldOptArr.length - 1].optArr
        var arr = []; var nodeIdArr = []
        for (var i = 0; i < optArr.length; i++) {
            nodeIdArr.push(optArr[i].id)
        }
        switch (optType) {
            case 'delete':				// 删除操作
            case 'cut':						// 剪切操作
                for (var i = 0; i < optArr.length; i++) {
                    var nodeId = optArr[i].id
                    var nodeData = optArr[i].nodeData
                    if (!flag) {
                        // 更改当前节点的前置节点与后续节点的子、父节点ID集合信息
                        var parentIds = nodeData.parentIds			// 当前节点的父节点ID集合
                        var childrenIds = nodeData.childrenIds	// 当前节点的子节点ID集合
                        for (var k = 0; k < parentIds.length; k++) {
                            if ($.inArray(parentIds[k], nodeIdArr) < 0) {						// 如果当前节点的父节点ID不包含在所操作的节点ID集合中
                                graph.nodeData[parentIds[k]].childrenIds.push(nodeId)				// 当前节点的父节点的子节点ID集合中增加当前节点ID
                            }
                        }
                        for (var j = 0; j < childrenIds.length; j++) {
                            if ($.inArray(childrenIds[j], nodeIdArr) < 0) {						// 如果当前节点的子节点ID不包含在所操作的节点ID集合中
                                graph.nodeData[childrenIds[j]].parentIds.push(nodeId)			// 当前节点的子节点的父节点ID集合中增加当前节点ID
                            }
                        }
                        graph.nodeData[nodeId] = nodeData
                    }
                    arr.push({ 'id': nodeId, 'nodeData': nodeData })
                }
                break
            case 'drag':					// 拖拽操作
            case 'create':				// 自动生成
            case 'paste':					// 粘贴操作
                for (var i = 0; i < optArr.length; i++) {
                    var nodeId = optArr[i].id
                    var nodeData = optArr[i].nodeData
                    if (!flag) {
                        // 针对粘贴操作，在撤销操作时改变与其相关的节点配置信息
                        if (optType === 'paste') {
                            var preNodeArr = graph.nodeData[nodeId].parentIds
                            var nextNodeArr = graph.nodeData[nodeId].childrenIds
                            // 在前置节点的子节点ID集合中去除自身ID
                            for (var j = 0; j < preNodeArr.length; j++) {
                                if (graph.nodeData[preNodeArr[j].id] && $.inArray(nodeId, graph.nodeData[preNodeArr[j].id].childrenIds) > -1 && $.inArray(preNodeArr[j].id, nodeIdArr) < 0) {
                                    var index = $.inArray(nodeId, graph.nodeData[preNodeArr[j].id].childrenIds)
                                    graph.nodeData[preNodeArr[j].id].childrenIds.splice(index, 1)
                                }
                            }
                            // 在后置节点的父节点ID集合中去除自身ID
                            for (var j = 0; j < nextNodeArr.length; j++) {
                                if (graph.nodeData[nextNodeArr[j].id] && $.inArray(nodeId, graph.nodeData[nextNodeArr[j].id].parentIds) > -1 && $.inArray(nextNodeArr[j].id, nodeIdArr) < 0) {
                                    var index = $.inArray(nodeId, graph.nodeData[nextNodeArr[j].id].parentIds)
                                    graph.nodeData[nextNodeArr[j].id].parentIds.splice(index, 1)
                                    graph.nodeData[nextNodeArr[j].id].isSet = false
                                }
                            }
                        }
                        delete graph.nodeData[nodeId]
                    }
                    arr.push({ 'id': nodeId, 'nodeData': nodeData })
                }
                break
        }
        if (!flag) {
            graph.oldOptArr.splice(graph.oldOptArr.length - 1, 1)
            graph.newOptArr.push({ 'optType': optType, 'optArr': arr })
        }
        // 更改节点的配置和执行状态
        for (var i = 0; i < nodeIdArr.length; i++) {
            if (!graph.nodeData[nodeIdArr[i]]) {
                continue
            }
            changeNodeIcon(graph.nodeData[nodeIdArr[i]].nodeInfo.nodeExcuteStatus, graph.nodeData[nodeIdArr[i]].isSet, nodeIdArr[i])
            if (graph.nodeData[nodeIdArr[i]].nodeInfo.optType === 'datasource' && valArr.length > 0 && $.inArray(graph.nodeData[nodeIdArr[i]].nodeInfo.nodeName, valArr) > -1) {
                setDataSourceCopyIcon(nodeIdArr[i])
            }
        }
    } else {				// 撤销连接线时，更改连接线所关联的节点父、子节点ID集合的信息
        if (!edit.changes[0].child) {
            return
        }
        var isShow = true					// 还原生成的连线
        if (edit.changes[0].child.source == null && edit.changes[0].child.target == null) {
            isShow = false						// 撤销生成的连线
        }
        var source = isShow ? edit.changes[0].child.source : (Object.keys(graph.edgeArr).length > 0 ? graph.edgeArr[Object.keys(graph.edgeArr)[Object.keys(graph.edgeArr).length - 1]].source : null)
        var target = isShow ? edit.changes[0].child.target : (Object.keys(graph.edgeArr).length > 0 ? graph.edgeArr[Object.keys(graph.edgeArr)[Object.keys(graph.edgeArr).length - 1]].target : null)
        var index = 0
        if (source) {
            if (isShow && $.inArray(target.id, graph.nodeData[source.id].childrenIds) < 0) {
                graph.nodeData[source.id].childrenIds.push(target.id)
            } else if (!isShow && $.inArray(target.id, graph.nodeData[source.id].childrenIds) > -1) {
                index = $.inArray(target.id, graph.nodeData[source.id].childrenIds)
                graph.nodeData[source.id].childrenIds.splice(index, 1)
            }
        }
        if (target) {
            if (isShow && $.inArray(source.id, graph.nodeData[target.id].parentIds) < 0) {
                graph.nodeData[target.id].parentIds.push(source.id)
            } else if (!isShow && $.inArray(source.id, graph.nodeData[target.id].parentIds) > -1) {
                index = $.inArray(source.id, graph.nodeData[target.id].parentIds)
                graph.nodeData[target.id].parentIds.splice(index, 1)
            }
        }
    }
}

// 还原上一步操作，改变节点信息
export function changeRedoNodeInfo(edit, flag) {
    if (hadNode(edit)) {
        var valArr = getDataSourceTable()
        var optType = graph.newOptArr[graph.newOptArr.length - 1].optType
        var optArr = graph.newOptArr[graph.newOptArr.length - 1].optArr
        var arr = []; var nodeIdArr = []
        for (var i = 0; i < optArr.length; i++) {
            nodeIdArr.push(optArr[i].id)
        }
        switch (optType) {
            case 'delete':			// 删除操作
            case 'cut':					// 剪切操作
                for (var i = 0; i < optArr.length; i++) {
                    var nodeId = optArr[i].id
                    var nodeData = optArr[i].nodeData
                    if (!flag) {
                        // 更改当前节点的前置节点与后续节点的子、父节点ID集合信息
                        var parentIds = nodeData.parentIds			// 当前节点的父节点ID集合
                        var childrenIds = nodeData.childrenIds	// 当前节点的子节点ID集合
                        for (var k = 0; k < parentIds.length; k++) {
                            if ($.inArray(parentIds[k], nodeIdArr) < 0) {						// 如果当前节点的父节点ID不包含在所操作的节点ID集合中
                                var index = $.inArray(nodeId, graph.nodeData[parentIds[k]].childrenIds)
                                graph.nodeData[parentIds[k]].childrenIds.splice(index, 1)		// 当前节点的父节点的子节点ID集合中去除当前节点ID
                            }
                        }
                        for (var j = 0; j < childrenIds.length; j++) {
                            if ($.inArray(childrenIds[j], nodeIdArr) < 0) {						// 如果当前节点的子节点ID不包含在所操作的节点ID集合中
                                var index = $.inArray(nodeId, graph.nodeData[childrenIds[k]].parentIds)
                                graph.nodeData[childrenIds[k]].parentIds.splice(index, 1)			// 当前节点的子节点的父节点ID集合中去除当前节点ID
                                graph.nodeData[childrenIds[k]].isSet = false
                            }
                        }
                        delete graph.nodeData[nodeId]
                    }
                    arr.push({ 'id': nodeId, 'nodeData': nodeData })
                }
                break
            case 'drag':				// 拖拽操作
            case 'create':			// 自动生成
            case 'paste':				// 粘贴操作
                for (var i = 0; i < optArr.length; i++) {
                    var nodeId = optArr[i].id
                    var nodeData = optArr[i].nodeData
                    if (!flag) {
                        graph.nodeData[nodeId] = nodeData
                    }
                    arr.push({ 'id': nodeId, 'nodeData': nodeData })
                }
                break
        }
        if (!flag) {
            graph.newOptArr.splice(graph.newOptArr.length - 1, 1)
            graph.oldOptArr.push({ 'optType': optType, 'optArr': arr })
        }
        // 更改节点的配置和执行状态
        for (var i = 0; i < nodeIdArr.length; i++) {
            if (!graph.nodeData[nodeIdArr[i]]) {
                continue
            }
            changeNodeIcon(graph.nodeData[nodeIdArr[i]].nodeInfo.nodeExcuteStatus, graph.nodeData[nodeIdArr[i]].isSet, nodeIdArr[i])
            if (graph.nodeData[nodeIdArr[i]].nodeInfo.optType === 'datasource' && valArr.length > 0 && $.inArray(graph.nodeData[nodeIdArr[i]].nodeInfo.nodeName, valArr) > -1) {
                setDataSourceCopyIcon(nodeIdArr[i])
            }
        }
    } else {					// 还原连接线时，更改连接线所关联的节点父、子节点ID集合的信息
        if (!edit.changes[0].child) {
            return
        }
        var source = edit.changes[0].child.source
        var target = edit.changes[0].child.target
        var index = 0
        if (source) {
            if ($.inArray(target.id, graph.nodeData[source.id].childrenIds) < 0) {
                graph.nodeData[source.id].childrenIds.push(target.id)
            } else {
                index = $.inArray(target.id, graph.nodeData[source.id].childrenIds)
                graph.nodeData[source.id].childrenIds.splice(index, 1)
            }
        }
        if (target) {
            if ($.inArray(source.id, graph.nodeData[target.id].parentIds) < 0) {
                graph.nodeData[target.id].parentIds.push(source.id)
            } else {
                index = $.inArray(source.id, graph.nodeData[target.id].parentIds)
                graph.nodeData[target.id].parentIds.splice(index, 1)
            }
        }
    }
}

export function deleteCells(includeEdges) {
    // Cancels interactive operations
    graph.escape()
    var cells = graph.getDeletableCells(graph.getSelectionCells())
    var nodeIdArr = []
    if (cells != null && cells.length > 0) {
        // 找出节点的关联线
        var cellIdArr = []
        for (var i = 0; i < cells.length; i++) {
            cellIdArr.push(cells[i].id)
        }
        var arr = []			// 将操作的节点信息存根
        for (var i = 0; i < cells.length; i++) {
            if (cells[i].vertex === 1) {
                nodeIdArr.push(cells[i].id)
                // 找出要删除的节点中的末级节点，更改该末级节点及后续节点的信息，start
                var lastNodeIdArr = []
                var childrenIds = graph.nodeData[cells[i].id].childrenIds
                for (var k = 0; k < childrenIds.length; k++) {
                    if ($.inArray(childrenIds[k], cellIdArr) < 0) {
                        lastNodeIdArr.push(childrenIds[k])
                    }
                }
                for (var t = 0; t < lastNodeIdArr.length; t++) {
                    changeNodeInfo(lastNodeIdArr[t], true)
                }
                // end
                arr.push({
                    'id': cells[i].id,
                    'nodeData': graph.nodeData[cells[i].id]
                })
                // 从所有节点的信息配置对象中去除要删除的节点
                delete graph.nodeData[cells[i].id]
                // 获取与要删除的节点相关联的连接线
                var edges = cells[i].edges
                if (edges && edges.length > 0) {
                    for (var j = 0; j < edges.length; j++) {
                        if ($.inArray(edges[j].id, cellIdArr) < 0) {
                            cells.push(edges[j])
                        }
                    }
                }
            } else {
                var preNode = cells[i].source
                var nextNode = cells[i].target
                if (graph.nodeData[nextNode.id] && $.inArray(preNode.id, graph.nodeData[nextNode.id].parentIds) > -1) {
                    var index = $.inArray(preNode.id, graph.nodeData[nextNode.id].parentIds)
                    graph.nodeData[nextNode.id].parentIds.splice(index, 1)
                    // 找出要删除的连接线的目标节点，更改该目标节点及后续节点的信息，start
                    if ($.inArray(nextNode.id, cellIdArr) < 0) {
                        changeNodeInfo(nextNode.id, true)
                    }
                    // end
                }
                if (graph.nodeData[preNode.id] && $.inArray(nextNode.id, graph.nodeData[preNode.id].childrenIds) > -1) {
                    var index = $.inArray(nextNode.id, graph.nodeData[preNode.id].childrenIds)
                    graph.nodeData[preNode.id].childrenIds.splice(index, 1)
                }
            }
        }
        graph.oldOptArr.push({ 'optType': 'delete', 'optArr': arr })
        graph.removeCells(cells, includeEdges)
    }
    return nodeIdArr
}

/**
 * 初始化layui插件
 */
export function initPlugIn() {
    // datetimepicker初始化
    if ($('.form_datetime').length > 0) {
        $('.form_datetime').datetimepicker({
            language: 'zh-CN',
            todayBtn: true,
            autoclose: true,
            todayHighlight: true,
            startView: 'month',
            showMeridian: true
        })
    }
    if ($('.form_date').length > 0) {
        $('.form_date').datetimepicker({
            language: 'zh-CN',
            todayBtn: true,
            autoclose: true,
            todayHighlight: true,
            startView: 'month',
            showMeridian: true,
            minView: 'month'
        })
    }
    if ($('.form_time').length > 0) {
        $('.form_time').datetimepicker({
            language: 'zh-CN',
            todayBtn: true,
            autoclose: true,
            todayHighlight: true,
            startView: 'day',
            showMeridian: true,
            minView: 'hour',
            maxView: 'day'
        })
    }

    // bootstrap-select初始化
    if ($('.selectpicker').length > 0) {
        $('.selectpicker').selectpicker()
    }

    // iCheck初始化
    $("input[type='checkbox'], input[type='radio']").icheck({
        checkboxClass: 'icheckbox_square-purple',
        radioClass: 'iradio_square-purple',
        increaseArea: '20%'
    })
    $('.checkbox, .radio').css('float', 'left')
    $('.checkbox, .radio').css('padding-right', '60px')

    $('.selectpicker').change(function() {
        if (($(this).val()) != null || ($(this).val()) !== '') {
            $(this).parents('.form-group').find('i').remove()
            $(this).parents('.form-group').removeClass('has-error')
            $(this).selectpicker('setStyle', 'btn-danger', 'remove')
        }
    })
}

/**
 * 下载文件 - 带进度监控
 * @param url: 文件下载请求路径
 * @param filename: 保存的文件名
 * @param params: 请求参数
 * @param success: 下载成功回调函数
 * @param error: 下载失败回调函数
 * @param progress: 进度处理回调函数
 **/
export function progressDownLoad(url,filename,params,success,error,progress){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    //监听进度事件
    xhr.addEventListener("progress", function (evt) {
        if(typeof progress === "function"){
            progress(evt);
        }
    }, false);
    xhr.responseType = "blob";
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8");
    xhr.onreadystatechange = function () {
        if(xhr.readyState === 4 && xhr.status === 200){
            if (typeof window.chrome !== 'undefined') {
                // Chrome version
                var reader = new FileReader();
                reader.readAsDataURL(xhr.response);    // 转换为base64，可以直接放入a表情href
                reader.onload = function (e) {
                    // 转换完成，创建一个a标签用于下载
                    var a = document.createElement('a');
                    a.download = filename;
                    a.href = e.target.result;
                    a.target ="downloadframe";
                    $("body").append(a);    // 修复firefox中无法触发click
                    a.click();
                    $(a).remove();
                }
            } else {
                // Firefox version
                var file = new File([xhr.response], filename, { type: 'application/force-download' });
                window.open(URL.createObjectURL(file));
            }
            if(xhr.response && xhr.response.size !== 0){
                if(typeof success === "function"){
                    success();
                }
            }else{
                if(typeof error === "function"){
                    error();
                }
            }
        }
    };
    var paramsStr = "";
    if(params){
        var key = Object.keys(params);
        for (var i=0;i<key.length;i++){
            paramsStr += '&'+key[i]+'='+params[key[i]];
        }
        if(paramsStr !== ""){
            paramsStr = paramsStr.substring(1);
        }
    }
    xhr.send(paramsStr);
}
