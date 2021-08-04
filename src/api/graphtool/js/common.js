import { cancelExecuteTask, executeNodeSql, executeAllNodeSql } from '@/api/graphtool/apiJs/graphList'
import * as validateJs from '@/api/graphtool/js/validate'
import { updateResourceZtreeNodeName } from '@/api/graphtool/js/index'
let graphIndexVue = null
let graph = null
export var sendGraphIndexVue = (_this) => {
    graphIndexVue = _this
    graph = _this.graph
}

// 打开节点配置
export function data_filter(type, name, nodeName) {
    var curNodeId = graph.curCell.id
    var obj = validateJs.verifyPreNodes(type, curNodeId)
    if (obj.isError) {
        graphIndexVue.$message.error(obj.message)
        return
    }
    if (!validateJs.settingVerify(type)) {
        return
    }
    if (type === 'relation') {
        graphIndexVue.settingType = 'relation'
    } else if (type === 'groupCount') {
        graphIndexVue.settingType = 'groupCount'
    } else {
        graphIndexVue.settingType = 'commonSetting'
    }
    graphIndexVue.sp_optType = type
    graphIndexVue.sp_nodeId = curNodeId
    graphIndexVue.nodeSettingTitle = name
    graphIndexVue.nodeSettingDialogVisible = true
}

/**
 * 保存节点配置
 */
export function saveNodeSetting() {
    let curNodeId = graphIndexVue.sp_nodeId
    let verifyFun = function() {
        let type = graphIndexVue.sp_optType
        if (!graphIndexVue.$refs.nodeSetting.$refs.basicVueRef.basicInfoVerify()) {
            $(graphIndexVue.$refs.nodeSetting.$refs.myTab).find('li:eq(0)>a').click()
            return false
        }
        if (type === 'relation' || type === 'groupCount') {					// 数据关联和分组汇总节点特殊处理
            if (!graphIndexVue.$refs.nodeSetting.inputVerify()) {
                $(graphIndexVue.$refs.nodeSetting.$refs.myTab).find('li:eq(1)>a').click()
                return false
            }
        } else {
            if (!graphIndexVue.$refs.nodeSetting.$refs.conditionSet.inputVerify()) {
                $(graphIndexVue.$refs.nodeSetting.$refs.myTab).find('li:eq(1)>a').click()
                return false
            }
            if (type !== 'comparison' && !graphIndexVue.$refs.nodeSetting.$refs.outputColumnVueRef.outputVerify()) {
                return false
            }
        }
        return true
    }
    let saveNodeSettingFun = function() {
        let type = graphIndexVue.sp_optType
        if (type === 'relation' || type === 'groupCount') {
            graphIndexVue.$refs.nodeSetting.saveNodeInfo()
        }else{
            if (type === 'comparison') {
                graphIndexVue.$refs.nodeSetting.$refs.conditionSet.saveNotOutput()
            } else {
                graphIndexVue.$refs.nodeSetting.saveGraphNodeSetting()
            }
        }
        graphIndexVue.nodeSettingDialogVisible = false
        console.log('情况1')
        graphIndexVue.$nextTick( () => {
            // 变更当前节点的配置状态信息
            graph.nodeData[curNodeId].nodeInfo.nodeExcuteStatus = 1
            graph.nodeData[curNodeId].isSet = true
            graph.nodeData[curNodeId].setting.settingId = new UUIDGenerator().id
            changeNodeIcon(1, true, curNodeId)
            graph.cellLabelChanged(graph.curCell, graph.nodeData[curNodeId].nodeInfo.nodeName, null)
            // 自动生成节点和线，start
            graph.getModel().beginUpdate()
            try {
                let nodeType = graph.nodeData[curNodeId].nodeInfo.optType
                // 判断当前节点是否已经生成【结果表】节点
                let y = graph.curCell.geometry.y				// 纵向坐标位置
                if (nodeType === 'layering') {				// 数据分层节点特殊处理
                    if (childrenIds.length > 0) {					// 如果有已经生成的结果表，则先删除已有的结果表
                        let cells = []
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
                    let newTableArr = []
                    let newSqlArr = []
                    let newSelectSqlArr = []
                    let areaArr = []
                    let newIsDeleteTableArr = []
                    let resultTableNameArr = graph.nodeData[curNodeId].nodeInfo.resultTableNameArr
                    let isDeleteTableArr = graph.nodeData[curNodeId].nodeInfo.isDeleteTableArr
                    let nodeSqlArr = graph.nodeData[curNodeId].nodeInfo.nodeSqlArr
                    let selectSqlNotViewTableArr = graph.nodeData[curNodeId].nodeInfo.selectSqlNotViewTableArr
                    let colName = graph.nodeData[curNodeId].setting.hierarchy_column
                    let layeringArr = graph.nodeData[curNodeId].setting.hierarchy_map
                    for (var j = 0; j < layeringArr.length; j++) {
                        var name = colName + '【' + layeringArr[j].c_col_1 + '至' + layeringArr[j].c_col_2 + '】'
                        areaArr.push('字段【' + colName + '】：' + layeringArr[j].c_col_1 + '至' + layeringArr[j].c_col_2)
                        autoCreateNode(y + j * 130, j, name)
                        if (resultTableNameArr.length === 0) {
                            newTableArr.push('')
                            newSqlArr.push('')
                            newSelectSqlArr.push('')
                            newIsDeleteTableArr.push(false)
                            continue
                        }
                        if (j <= resultTableNameArr.length - 1) {
                            newTableArr[j] = resultTableNameArr[j]
                            newSqlArr[j] = nodeSqlArr[j]
                            newSelectSqlArr[j] = selectSqlNotViewTableArr[j]
                            newIsDeleteTableArr[j] = isDeleteTableArr[j]
                        } else {
                            newTableArr.push('')
                            newSqlArr.push('')
                            newSelectSqlArr.push('')
                            newIsDeleteTableArr.push(false)
                        }
                    }
                    graph.nodeData[curNodeId].nodeInfo.resultTableNameArr = newTableArr.slice()
                    graph.nodeData[curNodeId].nodeInfo.isDeleteTableArr = newIsDeleteTableArr.slice()
                    graph.nodeData[curNodeId].nodeInfo.nodeSqlArr = newSqlArr.slice()
                    graph.nodeData[curNodeId].nodeInfo.selectSqlNotViewTableArr = newSelectSqlArr.slice()
                    graph.nodeData[curNodeId].nodeInfo.areaArr = areaArr
                } else {
                    if (childrenIds.length === 0 && nodeType !== 'barChart') {			// 自定义图形不生成结果表
                        autoCreateNode(y)
                    }
                }
            } catch (e) {
                console.info(e)
            }finally {
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
            //自动执行
            autoExcute(curNodeId)
        })
    }
    let childrenIds = graph.nodeData[curNodeId].childrenIds.slice()
    if (childrenIds.length > 0) {
        if(verifyFun()){
            graphIndexVue.$confirm('该操作会影响本节点及后续节点的执行信息，是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                center: true,
                closeOnClickModal:false,
                closeOnPressEscape:false
            }).then(() => {
                saveNodeSettingFun()
            }).catch(() => {
                graphIndexVue.nodeSettingDialogVisible = false
            })
        }
    } else {
        if(verifyFun()){
            saveNodeSettingFun()
        }
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
    var cell = graph.insertVertex(graph.getDefaultParent(), null, name, x + 120, y, 60, 80, createCellShape(type,false))			// 生成节点
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
    return getIdArr([], curNodeId)
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
            delete graph.nodeData[idArr[i]].hasParam;
            delete graph.nodeData[idArr[i]].paramsSetting;
            delete graphIndexVue.nodeParamRelArr[idArr[i]];
        }
        changeNodeIcon(1, graph.nodeData[idArr[i]].isSet, idArr[i])
    }
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
export function getPreNodesNotDatasource(nodeData, curCellId, arr) {
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
 * 节点取消执行方法
 * @param flag 是否自动终止执行任务（当前节点执行出错时需终止后续节点的执行任务）
 * @param curCellId 节点ID
 * */
export function cancelExecute(flag,curCellId) {
    //执行任务的主键
    const taskUuidArr = graphIndexVue.executeTaskObj.executeTask//被取消执行节点的任务UUID
    if(taskUuidArr.length === 0 && !graphIndexVue.executeTaskObj.init && !graphIndexVue.executeTaskObj.isError){
        alertMsg('提示', '未创建完执行任务，请稍后', 'warning')
        return
    }
    curCellId = curCellId ? curCellId : graph.curCell.id
    //获取当前节点的所有子孙节点集合
    var cIdArr = getAllChildrenIds(curCellId)
    if(flag){//curCellId为操作节点的ID
        // 获取当前节点的所有子集合
        const childrenIds = graph.nodeData[curCellId].childrenIds
        cIdArr.forEach(e => {// 遍历当前节点的所有子孙节点集合
            if ($.inArray(e, graphIndexVue.executeNodeIdArr) > -1 && $.inArray(e, childrenIds) < 0) { // 如果子孙节点ID包含在执行节点队列中且不包含在子节点ID集合中（即当前节点的所有孙子节点）
                graph.nodeData[e].nodeInfo.nodeExcuteStatus = 1
                changeNodeIcon(1, null, e)
            }
        })
    }else{//curCellId为结果表节点的ID
        if (graph.nodeData[curCellId].nodeInfo.nodeExcuteStatus !== 2) {
            alertMsg('错误', '该节点不是正在执行的节点', 'error')
            return
        }
        if(graphIndexVue.executeNodeIdArr.length > 0){
            //取消所有正在执行的节点
            graphIndexVue.executeNodeIdArr.forEach(nodeId => {
                if(graph.nodeData[nodeId].nodeInfo.nodeExcuteStatus === 2){
                    graph.nodeData[nodeId].nodeInfo.nodeExcuteStatus = 1
                    changeNodeIcon(1, null, nodeId)
                }
            })
        }else{
            const parentIds = graph.nodeData[curCellId].parentIds//找出当前结果表节点的父节点，有且只有一个
            const executingNodeIdArr = [parentIds[0],curCellId]
            // 改变节点的状态为未执行
            executingNodeIdArr.forEach(nodeId => {
                if (graph.nodeData[nodeId]) {
                    graph.nodeData[nodeId].nodeInfo.nodeExcuteStatus = 1
                    changeNodeIcon(1, null, nodeId)
                }
            })
            cIdArr.forEach(cNodeId => {
                if ($.inArray(cNodeId, graphIndexVue.executeNodeIdArr) > -1) { // 如果子孙节点ID包含在执行节点队列中
                    graph.nodeData[cNodeId].nodeInfo.nodeExcuteStatus = 1
                    changeNodeIcon(1, null, cNodeId)
                }
            })
        }
        // 记录取消执行操作
        refrashHistoryZtree('取消节点执行')
    }
    cancelExecute_callBack(taskUuidArr)
    // 自动保存图形化
    autoSaveGraph()
}

function cancelExecute_callBack(taskUuidArr) {
    if(taskUuidArr.length > 0) {
        cancelExecuteTask(taskUuidArr.join(",")).then(() => {
            graphIndexVue.executeTaskObj = {
                "init": true,
                "executeTask": [],
                "isError":false
            }
        })
    }
}

/**
 * 自动执行
 */
function autoExcute(curNodeId) {
    let childrenIds = graph.nodeData[curNodeId].childrenIds
    if (childrenIds.length > 0 && childrenIds.length === 1) {
        graphIndexVue.$confirm('节点配置成功，是否立即执行?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info',
            center: true,
            closeOnClickModal:false,
            closeOnPressEscape:false
        }).then(() => {
            let cell = graph.getModel().getCell(childrenIds[0])
            if (cell) {
                graph.curCell = cell
                executeNode()
            } else {
                graphIndexVue.$message.error('自动获取执行节点出错，请手动选择节点执行')
            }
        }).catch( ()=> {})
    }
}

/**
 * 执行本节点方法的内部调用方法
 * @param isExecuteToNode 是否是执行到本节点方法
 * */
export function executeNode(isExecuteToNode) {
    if (!validateJs.executeVerify()) {
        return
    }
    var notExecuteNodeIdArr = []//所有未执行节点的ID数组
    graphIndexVue.curExecuteCell = {...{},...graph.curCell}
    var executeCellId = graphIndexVue.curExecuteCell.id
    if(isExecuteToNode){
        // 从当前执行节点（选中节点）递归查找所有非原表的前置节点集合
        notExecuteNodeIdArr = getPreNodesNotDatasource(graph.nodeData, graphIndexVue.curExecuteCell.id, [graphIndexVue.curExecuteCell.id])
    }else{
        // 从当前执行节点（选中节点）递归查找所有未执行成功且已经配置过的前置节点集合
        notExecuteNodeIdArr = getNotExecuteNode(executeCellId, [executeCellId])
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
    let checkParam = false// 默认没有参数节点
    for (let i = 0; i < notExecuteNodeIdArr.length; i++) {
        let hasParam = graph.nodeData[notExecuteNodeIdArr[i]].hasParam// 是否有参数
        let paramsSetting = graph.nodeData[notExecuteNodeIdArr[i]].paramsSetting// 参数设置信息
        if (hasParam && paramsSetting && paramsSetting.arr && paramsSetting.arr.length !== 0) {
            checkParam = true
            break
        }
    }
    graphIndexVue.executeType = ''
    graphIndexVue.executeNodeIdArr = notExecuteNodeIdArr
    if(checkParam){
        graphIndexVue.nodeParamDialogVisible = true
        graphIndexVue.$nextTick( () => {
            graphIndexVue.$refs.inputParams.createParamNodeHtml()
        })
    }else {
        // 节点的核心执行方法
        executeNode_callback(notExecuteNodeIdArr)
    }
}

/**
 * 执行本节点方法（执行当前节点这条线上所有未执行的节点，执行过的节点会被忽略）
 * @param notExecuteNodeIdArr 所有未执行节点的ID数组
 * */
export function executeNode_callback(notExecuteNodeIdArr) {
    // 更改执行状态图标为执行中
    for (var j = 0; j < notExecuteNodeIdArr.length; j++) {
        graph.nodeData[notExecuteNodeIdArr[j]].nodeInfo.nodeExcuteStatus = 2
        changeNodeIcon(2, null, notExecuteNodeIdArr[j])
    }
    graphIndexVue.executeTaskObj = {"init":false,"executeTask":[],"isError":false}
    $(graphIndexVue.$refs.sysInfoArea).html("")
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
    const executeId = new UUIDGenerator().id
    var dataParam = {
        'openType': graph.openType,
        'executeId': executeId,
        'nodeIdList': notExecuteNodeIdArr.join(','),
        'nodeData': JSON.stringify(graph.nodeData),
        'noData':false
    }
    // console.log(graph.nodeData)
    graphIndexVue.initData()
    graphIndexVue.websocketBatchId = executeId
    graphIndexVue.$nextTick(() => {
        executeNodeSql(dataParam).then(response => {
            if (response.data.isError) {
                graphIndexVue.$message.error(`请求失败：${response.data.message}`)
            } else {
                alertMsg('提示', '执行任务创建完成', 'info')
                graphIndexVue.executeTaskObj.executeTask = response.data.taskUuidList
            }
        }).catch(() => {
            graphIndexVue.$message.error('执行操作请求失败')
        })
    })
}

/**
 * 执行到本节点（执行当前节点这条线上所有节点，包括已执行过的）
 * */
export function executeToNode() {
    executeNode(true)
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
            if (cells[key[i]].vertex && graph.nodeData[key[i]]) {
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
        center: true,
        closeOnClickModal:false,
        closeOnPressEscape:false
    }).then(() => {
        for (var i = 0; i < key.length; i++) {
            // 如果是节点且不是原表，则先变更节点的执行状态为未执行
            if (cells[key[i]].vertex && graph.nodeData[key[i]] && graph.nodeData[key[i]].nodeInfo &&
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
                allNodeIdArr.push.apply(allNodeIdArr, notExecuteNodeIdArr)
                var executeId = new UUIDGenerator().id// 生成执行ID
                notExecuteNodeObject[executeId] = notExecuteNodeIdArr
            }
        }
        if (!returnObj.verify) {
            graphIndexVue.$message({ type: 'warning', message: returnObj.message })
            return
        }
        let checkParam = false// 默认没有参数节点
        for (let i = 0; i < allNodeIdArr.length; i++) {
            let hasParam = graph.nodeData[allNodeIdArr[i]].hasParam// 是否有参数
            let paramsSetting = graph.nodeData[allNodeIdArr[i]].paramsSetting// 参数设置信息
            if (hasParam && paramsSetting && paramsSetting.arr && paramsSetting.arr.length !== 0) {
                checkParam = true
                break
            }
        }
        if(checkParam){
            graphIndexVue.nodeParamDialogVisible = true
            graphIndexVue.$nextTick( () => {
                graphIndexVue.$refs.inputParams.createParamNodeHtml()
            })
        }else {
            // 节点的核心执行方法
            executeAllNode_callback(allNodeIdArr, notExecuteNodeObject)
        }
        // 记录执行操作
        refrashHistoryZtree('节点全部执行完毕')
    }).catch( ()=> {})
}

/**
 * 全部执行内部调用方法
 * @param nodeIdArr 待执行节点的数组，格式：[[],[],[]]
 * @param notExecuteNodeObject 待执行节点的对象，格式{"executeId":*,"notExecuteNodeIdArr":[]}
 * */
export function executeAllNode_callback(nodeIdArr, notExecuteNodeObject) {
    // 更改执行状态图标为执行中
    for (var i = 0; i < nodeIdArr.length; i++) {
        if (graph.nodeData[nodeIdArr[i]].nodeInfo.nodeExcuteStatus !== 2) {
            graph.nodeData[nodeIdArr[i]].nodeInfo.nodeExcuteStatus = 2
            changeNodeIcon(2, null, nodeIdArr[i])
        }
    }
    graphIndexVue.executeNodeIdArr = nodeIdArr
    graphIndexVue.executeNodeObject = notExecuteNodeObject
    graphIndexVue.executeType = 'all'
    graphIndexVue.executeTaskObj = {"init":false,"executeTask":[],"isError":false}
    $(graphIndexVue.$refs.sysInfoArea).html("")
    graphIndexVue.loading = $(graphIndexVue.$refs.graphToolDiv).mLoading({ 'text': '正在执行全部节点，请稍后……', 'hasCancel': true, 'hasTime': true, "callback" : function () {
            //执行任务的主键
            const taskUuidArr = graphIndexVue.executeTaskObj.executeTask//被取消执行节点的任务UUID
            if(taskUuidArr.length === 0 && !graphIndexVue.executeTaskObj.init && !graphIndexVue.executeTaskObj.isError){
                alertMsg('提示', '未创建完执行任务，请稍后', 'warning')
            }else{
                //取消所有正在执行的节点
                graphIndexVue.executeNodeIdArr.forEach(t => {
                    if(graph.nodeData[t].nodeInfo.nodeExcuteStatus === 2){
                        graph.nodeData[t].nodeInfo.nodeExcuteStatus = 1
                        changeNodeIcon(1, null, t)
                    }
                })
                cancelExecute_callBack(taskUuidArr)
                // 记录取消执行操作
                refrashHistoryZtree('取消节点执行')
                // 自动保存图形化
                autoSaveGraph()
                graphIndexVue.loading.destroy()
            }
        }})
    var dataParam = {
        'openType': graph.openType,
        'graphUuid': graphIndexVue.graphUuid,
        'nodeIdList': nodeIdArr.join(","),
        'nodeData': JSON.stringify(graph.nodeData),
        'nodeObject': JSON.stringify(notExecuteNodeObject),
        'noData':false
    }
    graphIndexVue.websocketBatchId = new UUIDGenerator().id
    graphIndexVue.initData()
    graphIndexVue.$nextTick(() => {
        executeAllNodeSql(dataParam).then( response => {
            if (response.data == null) {
                loadingInstance.close();
                graphIndexVue.$message.error('全部执行节点的请求失败')
                // 更改执行状态图标为未执行
                for (let i=0; i<nodeIdArr.length; i++) {
                    graph.nodeData[nodeIdArr[i]].nodeInfo.nodeExcuteStatus = 1
                    changeNodeIcon(1, null, nodeIdArr[i])
                }
            } else {
                alertMsg('提示', '执行任务创建完成', 'info')
                const message = response.data.message
                if(message !== ""){
                    const sysInfoAreaHtml = $(graphIndexVue.$refs.sysInfoArea).html()
                    $(graphIndexVue.$refs.sysInfoArea).html(sysInfoAreaHtml + message)
                }
                graphIndexVue.executeTaskObj.executeTask = response.data.taskUuidList
            }
        })
    })
}

export function resetNodeData(curNodeId,executeNodeArr, executeNodeData) {
    if (typeof executeNodeData !== 'undefined' && executeNodeData != null) {
        // 循环赋值
        graph.nodeData[curNodeId] = {...{},...executeNodeData[curNodeId]}
    }
    var nodeExcuteStatus = graph.nodeData[curNodeId].nodeInfo.nodeExcuteStatus
    var optType = graph.nodeData[curNodeId].nodeInfo.optType
    // 获取当前节点的所有子集合
    let childrenIds = graph.nodeData[curNodeId].childrenIds
    if (nodeExcuteStatus === 3) {
        if (optType === 'layering') {// 如果节点是数据分层，则需特殊处理
            // 获取当前节点的所有下一级节点
            if (childrenIds.length > 0) {
                var childCount = 0
                childrenIds.forEach(o =>{
                    const child_nodeExcuteStatus = graph.nodeData[o].nodeInfo.nodeExcuteStatus
                    if (child_nodeExcuteStatus === 3) {
                        childCount++
                    }
                })
                if (childCount === childrenIds.length) {
                    changeNodeIcon(3, null, curNodeId)
                } else {
                    changeNodeIcon(1, null, curNodeId)
                    graph.nodeData[curNodeId].nodeInfo.nodeExcuteStatus = 1
                }
                //变更当前结果表的状态为执行成功
                const curIndex = graph.nodeData[curNodeId].setting.index//数据分层节点当前执行语句的下标（对应结果表的下标）
                let curChildrenIds = "";
                for(let i=0; i<childrenIds.length; i++){//循环子结果表
                    const childIdex = graph.nodeData[childrenIds[i]].nodeInfo.index//获取当前结果表的下标
                    //找到当前返回的是哪一个结果表的执行结果
                    if(childIdex === curIndex && $.inArray(childrenIds[i], executeNodeArr) > -1){
                        curChildrenIds = childrenIds[i]
                        break;
                    }
                }
                if(curChildrenIds !== ""){//变更结果表的状态为执行成功
                    graph.nodeData[curChildrenIds].nodeInfo.nodeExcuteStatus = 3
                    changeNodeIcon(3, null, curChildrenIds)
                    if (graph.nodeData[curChildrenIds].nodeInfo.midTableStatus === 2 || graph.nodeData[curChildrenIds].nodeInfo.resultTableStatus === 2) { // 辅助结果表或最终结果表
                        let isDeleteTableArr = graph.nodeData[curNodeId].nodeInfo.isDeleteTableArr
                        if (curIndex <= isDeleteTableArr.length) {
                            graph.nodeData[curNodeId].nodeInfo.isDeleteTableArr[curIndex] = true
                        }
                    }
                }
            }
        } else {//其他操作节点，只有一个子结果表节点
            changeNodeIcon(3, null, curNodeId)
            // 如果子节点ID包含在执行节点队列中，节点状态与当前节点状态保持一致，为执行成功状态
            if ($.inArray(childrenIds[0], executeNodeArr) > -1) {
                if (!graph.nodeData[childrenIds[0]].isSet) {
                    graph.nodeData[childrenIds[0]].nodeInfo.nodeExcuteStatus = 3
                    changeNodeIcon(3, null, childrenIds[0])
                }
                if (graph.nodeData[childrenIds[0]].nodeInfo.midTableStatus === 2 || graph.nodeData[childrenIds[0]].nodeInfo.resultTableStatus === 2) { // 辅助结果表或最终结果表
                    if (graph.nodeData[curNodeId]) {
                        graph.nodeData[curNodeId].nodeInfo.isDeleteTable = true
                    }
                } else {
                    if (graph.nodeData[curNodeId]) {
                        graph.nodeData[curNodeId].nodeInfo.isDeleteTable = false
                    }
                }
            }
        }
    }
    if (nodeExcuteStatus === 4) {// 如果当前节点执行出错，则后置子孙节点状态置为未执行
        changeNodeIcon(4, null, curNodeId)
        graph.nodeData[curNodeId].nodeInfo.nodeExcuteStatus = 4
        //变更当前结果表的状态为执行失败
        if (optType === 'layering') {// 如果节点是数据分层，则需特殊处理
            const curIndex = graph.nodeData[curNodeId].setting.index
            let curChildrenIds = "";
            for(let i=0; i<childrenIds.length; i++){
                const childIdex = graph.nodeData[childrenIds[i]].nodeInfo.index
                if(childIdex === curIndex && $.inArray(childrenIds[i], executeNodeArr) > -1){
                    curChildrenIds = childrenIds[i]
                    break;
                }
            }
            if(curChildrenIds !== ""){
                graph.nodeData[curChildrenIds].nodeInfo.nodeExcuteStatus = 4
                changeNodeIcon(4, null, curChildrenIds)
            }
        }else{//其他操作节点，只有一个子结果表节点
            if ($.inArray(childrenIds[0], executeNodeArr) > -1) {// 如果子节点ID包含在执行节点队列中，节点状态与当前节点状态保持一致，为执行出错状态
                if (!graph.nodeData[childrenIds[0]].isSet) {
                    graph.nodeData[childrenIds[0]].nodeInfo.nodeExcuteStatus = 4
                    changeNodeIcon(4, null, childrenIds[0])
                }
            }
        }
    }
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
        if (typeof executeNodeData !== 'undefined' && executeNodeData != null) {
            // 循环赋值
            graph.nodeData[executeNodeArr[k]] = {...{},...executeNodeData[executeNodeArr[k]]}
        }
        var nodeExcuteStatus = graph.nodeData[executeNodeArr[k]].nodeInfo.nodeExcuteStatus
        var optType = graph.nodeData[executeNodeArr[k]].nodeInfo.optType
        var isSet = graph.nodeData[executeNodeArr[k]].isSet
        // 获取当前节点的所有子孙节点集合
        var cIdArr = getAllChildrenIds(executeNodeArr[k])
        // 获取当前节点的所有子集合
        let childrenIds = graph.nodeData[executeNodeArr[k]].childrenIds
        let parentIds = graph.nodeData[executeNodeArr[k]].parentIds
        if (nodeExcuteStatus === 3) {
            if (optType !== 'newNullNode') {					// 如果当前节点是操作节点
                if (optType === 'layering') {					// 如果节点是数据分层，则需特殊处理
                    // 获取当前节点的所有下一级节点
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
                        //变更当前结果表的状态为执行成功
                        const curIndex = graph.nodeData[executeNodeArr[k]].setting.index//数据分层节点当前执行语句的下标（对应结果表的下标）
                        let curChildrenIds = "";
                        for(let i=0; i<childrenIds.length; i++){//循环子结果表
                            const childIdex = graph.nodeData[childrenIds[i]].nodeInfo.index//获取当前结果表的下标
                            //找到当前返回的是哪一个结果表的执行结果
                            if(childIdex === curIndex && $.inArray(childrenIds[i], executeNodeArr) > -1){
                                curChildrenIds = childrenIds[i]
                                break;
                            }
                        }
                        if(curChildrenIds !== ""){//变更结果表的状态为执行成功
                            graph.nodeData[curChildrenIds].nodeInfo.nodeExcuteStatus = 3
                            changeNodeIcon(3, null, curChildrenIds)
                            if (graph.nodeData[curChildrenIds].nodeInfo.midTableStatus === 2 || graph.nodeData[curChildrenIds].nodeInfo.resultTableStatus === 2) { // 辅助结果表或最终结果表
                                let isDeleteTableArr = graph.nodeData[executeNodeArr[k]].nodeInfo.isDeleteTableArr
                                if (curIndex <= isDeleteTableArr.length) {
                                    graph.nodeData[executeNodeArr[k]].nodeInfo.isDeleteTableArr[curIndex] = true
                                }
                            }
                        }
                    }
                } else {
                    changeNodeIcon(3, null, executeNodeArr[k])
                }
            } else {
                if (stopNodeId !== executeNodeArr[k]) {				// 如果当前结果表不是停止节点
                    changeNodeIcon(3, null, executeNodeArr[k])
                }
                const pOptType = graph.nodeData[parentIds[0]].nodeInfo.optType
                if(pOptType === "layering") {//如果当前结果表的上级节点是数据分层节点
                    if (graph.nodeData[executeNodeArr[k]].nodeInfo.midTableStatus === 2 || graph.nodeData[executeNodeArr[k]].nodeInfo.resultTableStatus === 2) { // 辅助结果表或最终结果表
                        let isDeleteTableArr = graph.nodeData[parentIds[0]].nodeInfo.isDeleteTableArr
                        const childIdex = graph.nodeData[executeNodeArr[k]].nodeInfo.index//获取当前结果表的下标
                        if(childIdex <= isDeleteTableArr.length){
                            isDeleteTableArr[childIdex] = true
                        }
                    }
                }else{
                    if (graph.nodeData[parentIds[0]]) {
                        graph.nodeData[parentIds[0]].nodeInfo.isDeleteTable = false
                    }
                }
            }
        }
        if (nodeExcuteStatus === 4) {				// 如果当前节点执行出错，则后置子孙节点状态置为未执行
            changeNodeIcon(4, null, executeNodeArr[k])
            graph.nodeData[executeNodeArr[k]].nodeInfo.nodeExcuteStatus = 4
            if (optType !== 'newNullNode') {						// 如果当前节点为操作节点
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
 * 设置模型最终结果表或中间结果表的图标
 * @param status 是否标记：1、移除标记，2、打标记
 * @param type 标记类型：0、中间结果表标记，1、最终结果表标记
 * */
export function setNodeOutputTypeIcon(status, type) {
    var curCellId = graph.curCell.id
    var url = ''
    if (type === 0) { // 中间结果表标记的图片路径
        url = '../../lib/graphtool/images/centeroutmark.png'
    } else { // 最终结果表标记的图片路径
        url = '../../lib/graphtool/images/finaloutmark.png'
    }
    $('.output-mark').each(function(i, v) {
        if ($(this)[0].getAttribute('nodeId') === curCellId) {
            if (status === 2) {
                $(this).attr('src', url)
                this.parentNode.style.display = 'unset'
            } else {
                this.parentNode.style.display = 'none'
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
    $('.exestate-mark').each(function(i) {
        if ($(this)[0].getAttribute('nodeId') === id) { // 有两个
            if (typeof nodeExcuteStatus !== 'undefined' && nodeExcuteStatus != null) {
                switch (nodeExcuteStatus) {
                    case 1:		// 未执行
                        $(this).css('background', '#999999')
                        break
                    case 2:	// 执行中
                        $(this).css('background', '#FECD44')
                        break
                    case 3:	// 执行成功
                        $(this).css('background', '#189D5C')
                        break
                    case 4:	// 执行失败
                        $(this).css('background', '#D81E07')
                        break
                }
            }
            if (isSet != null && typeof (isSet) !== 'undefined') {
                if (isSet) {
                    $('.setting-mark:eq(' + i + ')').css('background', '#189D5C')
                } else {
                    $('.setting-mark:eq(' + i + ')').css('background', '#999999')
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
            $(this).attr('src', '../../lib/graphtool/images/copyIcon.png')
        }
    })
}

/**
 * 根据当前节点ID，高亮显示其前置节点和线
 * */
export function lightHeight(curCellId){
    //先清空前一次高亮节点结合的样式，start
    var cells = graph.highLightList;
    if(cells && cells.length > 0){
        for(var k=0;k<cells.length;k++){
            if(cells[k].cell.edge){
                var h = new mxCellHighlight(graph,"#3e6f96",2);
                h.highlight(graph.view.getState(cells[k].cell));
            }
            if(cells[k].cell.vertex && cells[k].light){
                cells[k].light.destroy();
            }
        }
    }
    //end
    if(typeof curCellId === 'undefined' || curCellId == null){
        return;
    }
    graph.highLightList = [];
    var parent = graph.getDefaultParent();
    var parentChildren = parent.children;
    lightHeightCallBack(curCellId,parentChildren);
    for(var j=0;j<graph.highLightList.length;j++){
        var hL = new mxCellHighlight(graph,"#00A8FF",2);
        hL.highlight(graph.view.getState(graph.highLightList[j].cell));
        graph.highLightList[j].light = hL;
    }
}

function lightHeightCallBack(curCellId,parentChildren){
    for(var i=0;i<parentChildren.length;i++){
        if (parentChildren[i].edge && parentChildren[i].target && parentChildren[i].target.id === curCellId) {
            graph.highLightList.push({cell:parentChildren[i]});//获取线
            lightHeightCallBack(parentChildren[i].source.id, parentChildren);
        }
        if (parentChildren[i].vertex && !parentChildren[i].source && parentChildren[i].id === curCellId) {
            graph.highLightList.push({cell:parentChildren[i]});
        }
    }
}

/**
 * SQL详情（查询执行语句）
 */
export function curNodeSQL() {
    var nodeExcuteStatus = graph.nodeData[graph.curCell.id].nodeInfo.nodeExcuteStatus
    if (nodeExcuteStatus !== 3) {
        graphIndexVue.$message({"type":"warning","message":"该节点尚未执行成功，请执行成功后再查看"})
        return
    } else {
        var optType = graph.nodeData[graph.curCell.id].nodeInfo.optType
        var isSet = graph.nodeData[graph.curCell.id].isSet
        if (optType === 'newNullNode' && !isSet) {					// 结果表未配置（空结果表）
            var curId = graph.nodeData[graph.curCell.id].parentIds[0]
            optType = graph.nodeData[curId].nodeInfo.optType
            switch (optType) {
                case "layering"://数据分层需根据当前结果的下标在上级节点的SQL数组中取
                    var index = graph.nodeData[graph.curCell.id].nodeInfo.index
                    graphIndexVue.curNodeExecuteSQL = graph.nodeData[curId].nodeInfo.nodeSqlArr[index]
                    break;
                default:
                    graphIndexVue.curNodeExecuteSQL = graph.nodeData[curId].nodeInfo.nodeSql
                    break;
            }
        } else if (optType === 'sql') {
            graphIndexVue.curNodeExecuteSQL = graph.nodeData[graph.curCell.id].nodeInfo.nodeSql
        } else {
            graphIndexVue.curNodeExecuteSQL = graph.nodeData[graph.curCell.id].nodeInfo.nodeSql
        }
    }
    graphIndexVue.viewNodeSqlDialogVisible = true
}

/**
 * 双击预览数据 / 右键查看数据
 * */
export function previewNodeData() {
    console.log(graph.nodeData[graph.curCell.id])
    let curNodeInfo = graph.nodeData[graph.curCell.id].nodeInfo
    let nodeExcuteStatus = curNodeInfo.nodeExcuteStatus
    if (nodeExcuteStatus !== 3) {
        graphIndexVue.$message({ type: 'warning', message: '当前节点未执行成功，不能预览数据' })
        return
    }
    let nodeId = ''
    let nodeName = ''
    let resultTableName = ''
    let isRoleTable = false//节点的表是否需要走权限（一版只有CREATE TABLE的临时表走权限）
    let optType = ''
    switch (curNodeInfo.optType) {
        case 'datasource':				// 如果是原表，直接拿其临时表名称
            resultTableName = curNodeInfo.resultTableName
            nodeId = curNodeInfo.nodeId
            nodeName = curNodeInfo.nodeName
            isRoleTable = true
            break
        case 'newNullNode':// 如果是结果表
            if (!graph.nodeData[graph.curCell.id].isSet) { // 如果是未配置的结果表，拿其前置节点的临时表名称
                var parentIds = graph.nodeData[graph.curCell.id].parentIds
                if (graph.nodeData[parentIds[0]].nodeInfo.optType === 'layering') {
                    resultTableName = graph.nodeData[parentIds[0]].nodeInfo.resultTableNameArr[curNodeInfo.index]
                } else {
                    resultTableName = graph.nodeData[parentIds[0]].nodeInfo.resultTableName
                }
                nodeId = graph.nodeData[parentIds[0]].nodeInfo.nodeId
                nodeName = graph.nodeData[parentIds[0]].nodeInfo.nodeName + '_' + graph.nodeData[graph.curCell.id].nodeInfo.nodeName
                optType = graph.nodeData[parentIds[0]].nodeInfo.optType
            } else {																										// 如果是非空结果表，直接拿其临时表名称
                resultTableName = curNodeInfo.resultTableName
                nodeId = curNodeInfo.nodeId
                nodeName = curNodeInfo.nodeName
            }
            let midTableStatus = curNodeInfo.midTableStatus
            let resultTableStatus = curNodeInfo.resultTableStatus
            //如果结果表节点被标记成了中间或最终结果表，并且上级节点的是否删除表的标记为是（打了中间或最终结果表标记却未执行的情况下是否）
            if ((midTableStatus === 2 || resultTableStatus === 2) && graph.nodeData[parentIds[0]].nodeInfo.isDeleteTable) {
                isRoleTable = true
            }
            break
    }
    if (resultTableName === '') {
        graphIndexVue.$message.error('预览数据的表名称为空，预览失败')
        return
    }
    graphIndexVue.initData()
    graphIndexVue.$nextTick(() => {
        graphIndexVue.websocketBatchId = new UUIDGenerator().id
        graphIndexVue.resultTableArr = [{ id: nodeId, name: nodeName, resultTableName: resultTableName, isRoleTable: isRoleTable, optType: optType }]
        graphIndexVue.resultTabActiveName = '0'
        graphIndexVue.viewData()
    })
}

/**
 * 节点重命名
 * */
export function reName() {
    graphIndexVue.reNameObj.value = graph.curCell.value
    graphIndexVue.reNameObj.edge = graph.curCell.edge ? true: false
    graphIndexVue.reNameObj.name = graph.curCell.edge ? '连接线序号' : '节点名称'
    graphIndexVue.nodeReNameDialogVisible = true
}

export function reNameCallBack() {
    const newVal = graphIndexVue.reNameObj.value
    if (newVal === '') {
        graphIndexVue.$message({"type":"warning","message":`${graphIndexVue.reNameObj.name}不能为空`})
        return
    }
    const oldName = graph.curCell.value
    graph.cellLabelChanged(graph.curCell, newVal, null)
    if (graph.curCell.vertex) {
        updateResourceZtreeNodeName(graph.curCell.id, newVal)
        // 更新操作痕迹树
        refrashHistoryZtree(`节点【${oldName}】重命名为【${newVal}】`)
    } else {
        refrashHistoryZtree(`连接线【${oldName}】重命名为【${newVal}】`)
    }
    if (graph.nodeData[graph.curCell.id] && graph.nodeData[graph.curCell.id].nodeInfo) {
        graph.nodeData[graph.curCell.id].nodeInfo.nodeName = newVal
    }
    // 自动保存图形化
    autoSaveGraph()
    graphIndexVue.nodeReNameDialogVisible = false
}

/**
 * 清除配置（只有操作节点才有该事件）
 * */
export function reSetOptProperty() {
    graphIndexVue.$confirm('确定清除当前节点的配置信息?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
        closeOnClickModal:false,
        closeOnPressEscape:false
    }).then(() => {
        var curNodeId = graph.curCell.id
        var nodeExcuteStatus = graph.nodeData[curNodeId].nodeInfo.nodeExcuteStatus
        if (nodeExcuteStatus === 2) {
            graphIndexVue.$message({ type: 'warning', message: '当前节点正在执行，不可清除' })
            return
        }
        graph.nodeData[curNodeId].nodeInfo.nodeExcuteStatus = 1	// 置节点执行状态为未执行
        graph.nodeData[curNodeId].nodeInfo.resultTableName = ""
        if(graph.nodeData[curNodeId].nodeInfo.resultTableNameArr){
            graph.nodeData[curNodeId].nodeInfo.resultTableNameArr = []
        }
        graph.nodeData[curNodeId].isSet = false// 重置其配置状态，在打开时不读取已配置信息，重新进行配置
        delete graph.nodeData[curNodeId].hasParam;
        delete graph.nodeData[curNodeId].paramsSetting;
        delete graphIndexVue.nodeParamRelArr[curNodeId];
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
        graphIndexVue.$notify({
            title: graphIndexVue.$t('message.title'),
            message: graphIndexVue.$t('节点配置已清除'),
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
        })
    }).catch( ()=> {})
}

/**
 * SQL编辑
 */
export function sqlNodeEdit() {
    graphIndexVue.sqlEditorCurSql = graph.nodeData[graph.curCell.id].setting.sql || ''
    graphIndexVue.sqlEditorDialogVisible = true
}

export async function sqlNodeEdit_callBack() {
    let callFun = async function (obj) {
        let response = await graphIndexVue.$refs.sqlEditor.getVerifySqlResult()
        if (response.data.verifySelect) {
            graphIndexVue.sqlEditorDialogVisible = false
            graph.nodeData[graph.curCell.id].isSet = true
            graph.nodeData[graph.curCell.id].nodeInfo.nodeExcuteStatus = 1
            graph.nodeData[graph.curCell.id].nodeInfo.nodeSql = obj.sql
            graph.nodeData[graph.curCell.id].setting.sql = obj.sql
            // 更新SQL编辑器的配置状态
            changeNodeIcon(1, true, graph.curCell.id)
            if (graph.nodeData[graph.curCell.id].childrenIds.length === 0) {
                graph.getModel().beginUpdate()
                try {
                    // 自动生成结果表
                    autoCreateNode()
                } finally {
                    graph.getModel().endUpdate()
                }
            } else {
                if (obj.isChange) { // 如果sql值有变化或者改变了用户自定义的结果表名称
                    // 更改结果表的状态
                    var nodeId = graph.nodeData[graph.curCell.id].childrenIds[0]
                    changeNodeInfo(nodeId, true)
                }
            }
            // 自动保存图形化
            autoSaveGraph()
        }else{
            graphIndexVue.$refs.sqlEditor.$message({"type":"warning", "message":"最末句SQL不是SELECT查询语句，请修改"})
        }
    }
    var returnObj = await graphIndexVue.$refs.sqlEditor.saveSqlInfo()
    if (returnObj.isError) {
        graphIndexVue.$refs.sqlEditor.$message({"type":"warning", "message":returnObj.message})
    } else {
        if ($.trim(returnObj.sql) !== '') {
            // if (graph.openGraphType === 1) { // 如果是普通个人图形
            //     callFun(returnObj)
            // } else { // 如果是场景查询图形和模型图形
                if (returnObj.isChange) {
                    graphIndexVue.$refs.sqlEditor.$confirm(`${returnObj.message}，是否继续？`, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'info',
                        center: true,
                        closeOnClickModal:false,
                        closeOnPressEscape:false
                    }).then(() => {
                        graph.nodeData[graph.curCell.id].sqlIsChanged = true
                        graph.nodeData[graph.curCell.id].columnsInfo = []// 若SQL发生改变，则清除当前节点的输出列信息
                        callFun(returnObj)
                    }).catch( ()=> {})
                } else {
                    graph.nodeData[graph.curCell.id].sqlIsChanged = false
                    callFun(returnObj)
                }
            // }
        } else {
            graphIndexVue.$refs.sqlEditor.$message({"type":"warning", "message":"请输入SQL内容"})
        }
    }
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
            if (parentChildren[i].vertex && graph.nodeData[parentChildren[i].id] && graph.nodeData[parentChildren[i].id].nodeInfo.optType === 'datasource') {
                dataSourceNodeValArr.push(parentChildren[i].value)
            }
        }
    }
    return dataSourceNodeValArr
}

// 判断更改的操作中是否包含节点
function hadNode(edit) {
    var hadNode = false
    for (var i = 0; i < edit.changes.length; i++) {
        var cell = edit.changes[i].cell ? edit.changes[i].cell : edit.changes[i].child
        if (cell.vertex) {
            hadNode = true
            break
        }
    }
    return hadNode
}

// 撤销上一步操作，改变节点信息
export function changeUndoNodeInfo(edit, flag) {
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
            if (cells[i].vertex) {
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
 * 下载文件 - 带进度监控
 * @param url: 文件下载请求路径
 * @param filename: 保存的文件名
 * @param params: 请求参数
 * @param success: 下载成功回调函数
 * @param error: 下载失败回调函数
 * @param progress: 进度处理回调函数
 **/
export function progressDownLoad(url, filename, params, success, error, progress) {
    var xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    // 监听进度事件
    xhr.addEventListener('progress', function(evt) {
        if (typeof progress === 'function') {
            progress(evt)
        }
    }, false)
    xhr.responseType = 'blob'
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            if (typeof window.chrome !== 'undefined') {
                // Chrome version
                var reader = new FileReader()
                reader.readAsDataURL(xhr.response) // 转换为base64，可以直接放入a表情href
                reader.onload = function(e) {
                    // 转换完成，创建一个a标签用于下载
                    var a = document.createElement('a')
                    a.download = filename
                    a.href = e.target.result
                    a.target = 'downloadframe'
                    $('body').append(a) // 修复firefox中无法触发click
                    a.click()
                    $(a).remove()
                }
            } else {
                // Firefox version
                var file = new File([xhr.response], filename, { type: 'application/force-download' })
                window.open(URL.createObjectURL(file))
            }
            if (xhr.response && xhr.response.size !== 0) {
                if (typeof success === 'function') {
                    success()
                }
            } else {
                if (typeof error === 'function') {
                    error()
                }
            }
        }
    }
    var paramsStr = ''
    if (params) {
        var key = Object.keys(params)
        for (var i = 0; i < key.length; i++) {
            paramsStr += '&' + key[i] + '=' + params[key[i]]
        }
        if (paramsStr !== '') {
            paramsStr = paramsStr.substring(1)
        }
    }
    xhr.send(paramsStr)
}
