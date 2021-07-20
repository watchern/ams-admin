/**
 * 连接线规则验证
 * @param curSelCell 当前生成的连接线
 */
export function edgeVerify(curSelCell) {
    // console.log(curSelCell)
    // console.log(graph.edgeArr)
    if (curSelCell.source == null && curSelCell.target != null || curSelCell.source != null && curSelCell.target == null) { // 不允许连接线没有来源或没有目标
        alertMsg('警告', '不允许的操作', 'warning')
        removeCellsHistory(curSelCell)
        return false
    }
    if (curSelCell.source == null && curSelCell.target == null) {	// 鼠标不允许移除连接线
        alertMsg('警告', '不允许的操作', 'warning')
        removeCellsHistory(curSelCell)
        return false
    }
    var preNode = curSelCell.target.getSourceNodes()
    var nextNode = curSelCell.source.getTargetNodes()
    if (preNode.length === 0) {				// 节点自连接（闭环）
        alertMsg('警告', '不允许的连接', 'warning')
        removeCellsHistory(curSelCell)
        return false
    }
    var optArr = ['filter', 'sort', 'sample', 'layering', 'groupCount', 'delRepeat', 'change', 'comparison', 'barChart', 'intersect', 'exclude', 'union', 'relation', 'sql']
    if ('datasource,sql'.indexOf(curSelCell.target.nodeType) > -1 && preNode.length > 0) { // 原表与SQL查询器入0出n
        alertMsg('提示', '数据表与SQL查询器只能作为根节点', 'info')
        removeCellsHistory(curSelCell)
        return false
    }
    if ($.inArray(curSelCell.target.nodeType, optArr) > -1 && 'datasource,newNullNode'.indexOf(curSelCell.source.nodeType) < 0) { // 所有操作节点的来源只能是原表、和结果表
        alertMsg('警告', '不允许的连接', 'warning')
        removeCellsHistory(curSelCell)
        return false
    }
    if ($.inArray(curSelCell.source.nodeType, optArr) > -1) {
        if (curSelCell.target.nodeType !== 'newNullNode') { // 所有操作节点出的节点只能是结果表
            alertMsg('警告', '不允许的连接', 'warning')
            removeCellsHistory(curSelCell)
            return false
        } else if (nextNode.length > 1 && curSelCell.source.nodeType !== 'layering') { // 除了数据分层，其他的节点有且只有一个出去的线
            alertMsg('提示', '最多连接一个结果表', 'warning')
            removeCellsHistory(curSelCell)
            return false
        }
    }
    if ('filter,sort,sample,layering,groupCount,delRepeat,change,customizeChart'.indexOf(curSelCell.target.nodeType) > -1 && preNode.length > 1) {
        // 数据筛选、数据排序、数据抽样、数据分层、分组汇总、数据去重、数据转码入1出1
        alertMsg('提示', '最多连接 1 个节点', 'warning')
        removeCellsHistory(curSelCell)
        return false
    }
    if ('intersect,exclude,union'.indexOf(curSelCell.target.nodeType) > -1 && preNode.length > 2) { // 数据合并、数据交集与数据补集入2出1
        alertMsg('提示', '最多连接 2 个节点', 'warning')
        removeCellsHistory(curSelCell)
        return false
    }
    if ('barChart'.indexOf(curSelCell.source.nodeType) > -1 && preNode.length > 0) { // 自定义图形入1出0
        alertMsg('提示', '自定义图形只能作为末级节点', 'warning')
        removeCellsHistory(curSelCell)
        return false
    }
    if (curSelCell.target.nodeType === 'newNullNode') {				// 结果表
        if ('datasource,newNullNode'.indexOf(curSelCell.source.nodeType) > -1) { // 入的节点只能是操作节点，不能是原表、结果表
            alertMsg('警告', '不允许的连接', 'warning')
            removeCellsHistory(curSelCell)
            return false
        } else if (preNode.length > 1) {		// 入1出n（数据频次分析的结果表入1出0）
            alertMsg('提示', '结果表只有一个来源节点', 'warning')
            removeCellsHistory(curSelCell)
            return false
        }
    }
    if (curSelCell.source.nodeType === 'newNullNode') {
        var resultPreNodes = curSelCell.source.getSourceNodes()
        if (resultPreNodes.length > 0 && resultPreNodes[0].nodeType === 'comparison' && preNode.length > 0) { // 数据频次分析产生的结果表不能有出去的线
            alertMsg('提示', '数据频次分析产生的结果表只能作为末级节点', 'warning')
            removeCellsHistory(curSelCell)
            return false
        }
    }
    return true
}

function removeCellsHistory(curSelCell) {

    if (!graph.edgeArr[curSelCell.id]) { // 如果当前线不在集合中（即为新增的线），则删除
        let obj = graph.getDeletableCells(graph.getSelectionCells())
        console.log(obj)
        if (obj == null || obj == '' || obj == []) {
            graph.removeCells([curSelCell], false)
        } else {
            graph.removeCells(graph.getDeletableCells(graph.getSelectionCells()), false)
        }
        ownerEditor.editor.undoManager.indexOfNextAdd -= 2
        ownerEditor.editor.undoManager.history.splice(ownerEditor.editor.undoManager.history.length - 2, 2)
    } else { // 撤销本次操作，同时删除历史记录
        console.log('删除历史')
        ownerEditor.editor.undoManager.undo()
        ownerEditor.editor.undoManager.history.pop()
    }
}

/**
 * 打开配置属性是验证来源线数量
 * */
export function verifyPreNodes(type, curNodeId) {
    var parentIds = graph.nodeData[curNodeId].parentIds
    var obj = {
        'isError': false,
        'message': ''
    }
    if (parentIds.length === 0) {
        obj.isError = true
        obj.message = '未连接上级节点'
    } else {
        switch (type) {
            case 'union':// 数据合并
                if (parentIds.length !== 2) {
                    obj.isError = true
                    obj.message = '请连接两个上级节点'
                }
                break
            case 'relation':// 数据关联
                if (parentIds.length < 2) {
                    obj.isError = true
                    obj.message = '至少连接两个上级节点'
                }
                break
        }
    }
    return obj
}

/**
 *节点配置验证
 *@param type 节点所属类型
 */
export function settingVerify(type) {
    var isExecute = true
    var isSet = graph.nodeData[graph.curCell.id].isSet;
    if (type === 'barChart' || type === 'relation' || type === 'layering') { // 对于自定义图形、数据关联、数据分层节点，需在配置之前校验前置节点必须执行成功
        if (!isSet) {
            var preNodeIds = graph.nodeData[graph.curCell.id].parentIds
            var nodeExcuteStatus
            if (type === 'barChart') {
                nodeExcuteStatus = graph.nodeData[preNodeIds[0]].nodeInfo.nodeExcuteStatus
                if (nodeExcuteStatus !== 3) {
                    isExecute = false
                }
            }
            if (type === 'relation') {
                for (var i = 0; i < preNodeIds.length; i++) {
                    nodeExcuteStatus = graph.nodeData[preNodeIds[i]].nodeInfo.nodeExcuteStatus
                    if (nodeExcuteStatus !== 3) {
                        isExecute = false
                        break
                    }
                }
            }
            if (type === 'layering') {
                nodeExcuteStatus = graph.nodeData[preNodeIds[0]].nodeInfo.nodeExcuteStatus
                if (nodeExcuteStatus !== 3) {
                    isExecute = false
                }
            }
        }
    } else {
        if (!verifyPreNode(graph.curCell.id)) {
            return false
        }
    }
    if (!isExecute) {
        alertMsg('错误', '前置节点未执行成功，不能进行节点配置', 'error')
        return false
    }
    return true
}

/**
 * 验证当前节点的前置节点是否执行
 * @param curNodeId 当前节点ID
 * */
function verifyPreNode(curNodeId) {
    var verify = true
    var parentIds = graph.nodeData[curNodeId].parentIds
    for (var i = 0; i < parentIds.length; i++) {
        var parentNodeData = graph.nodeData[parentIds[i]]
        if (parentNodeData.nodeInfo.optType === 'sql') {					// 如果前置节点是SQL查询器节点
            // 判断SQL查询器节点是否已执行
            if (parentNodeData.nodeInfo.nodeExcuteStatus !== 3) {				// 未执行
                alertMsg('错误', '前置节点【SQL查询器】生成的SQL语句未执行', 'warning')
                verify = false
                break
            }
        } else {				// 如果是其他节点
            // 判断节点的字段信息是否完整
            var columnsInfo = parentNodeData.columnsInfo
            var optType = parentNodeData.nodeInfo.optType
            var nodeExcuteStatus = parentNodeData.nodeInfo.nodeExcuteStatus
            if (parentNodeData.nodeInfo.optType === 'newNullNode' && !parentNodeData.isSet) {
                if (parentNodeData.parentIds.length > 0 && graph.nodeData[parentNodeData.parentIds[0]]) {
                    columnsInfo = graph.nodeData[parentNodeData.parentIds[0]].columnsInfo
                    optType = graph.nodeData[parentNodeData.parentIds[0]].nodeInfo.optType
                    nodeExcuteStatus = graph.nodeData[parentNodeData.parentIds[0]].nodeInfo.nodeExcuteStatus
                }
            }
            var count = 0
            for (var j = 0; j < columnsInfo.length; j++) {
                var isOutputColumn = columnsInfo[j].isOutputColumn				// 是否为输出列
                if (isOutputColumn === 0) {				// 否
                    count++
                }
            }
            if (columnsInfo.length === count && columnsInfo.length !== 0) {
                alertMsg('提示', '前置节点未配置输出列', 'warning')
                verify = false
                break
            }
            if (columnsInfo.length === 0) {
                alertMsg('提示', '前置节点无输出列，需执行前置节点', 'warning')
                verify = false
                break
            }
        }
    }
    return verify
}

/**
 * 执行校验
 */
export function executeVerify() {
    // 校验当前节点是否关联前置节点
    var parentNodes = graph.curCell.getSourceNodes()
    if (parentNodes.length === 0) {
        alertMsg('提示', '请关联一个前置节点', 'warning')
        return false
    }
    // 校验其前置节点是否有正在执行的
    if (!verifyExecuting(graph.curCell.id, true)) {
        alertMsg('提示', '待执行的节点中存在正在执行的节点，请稍后……', 'warning')
        return false
    }
    return true
}

/**
 * 验证此次执行操作的所有的节点中是否有正在执行的节点
 * @param curCellId	当前执行的节点ID
 * @param isCurCell	是否为当前执行节点
 * */
function verifyExecuting(curCellId, isCurCell) {
    var verify = true
    if (isCurCell) {				// 如果是当前执行节点
        var nodeExcuteStatus = graph.nodeData[curCellId].nodeInfo.nodeExcuteStatus
        if (nodeExcuteStatus === 2) {				// 执行状态为执行中，直接返回验证不通过
            return false
        }
    }
    var parentIds = graph.nodeData[curCellId].parentIds
    if (parentIds.length > 0) {
        for (var i = 0; i < parentIds.length; i++) {				// 遍历前置节点集合
            var nodeExecuteStatus = graph.nodeData[parentIds[i]].nodeInfo.nodeExcuteStatus
            if (nodeExecuteStatus === 2) {				// 执行状态为执行中，验证不通过
                verify = false
                break
            } else {								// 否则继续向上级节点递归
                verify = verifyExecuting(parentIds[i], false)				// 返回验证状态
                if (!verify) break				// 当递归的上级节点验证不通过，直接结束循环
            }
        }
    }
    return verify
}
