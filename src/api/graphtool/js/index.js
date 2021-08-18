import { saveGraphInterface,getExecuteNodeInfoPost,importGraphXml,exportGraphXml,deleteExecuteNodes,executeNodeSql,dealReplaceParamSql } from '@/api/graphtool/apiJs/graphList'
import { progressDownLoad,getPreNodes,changeNodeIcon,nodeCallBack } from '@/api/graphtool/js/common'
import dayjs from 'dayjs'

let graphIndexVue = null//vue实例
let graph = null
/**
 * 获取vue实例
 * @param _this vue实例
 */
export const sendIndexJs = (_this) => {
    graphIndexVue = _this
    graph = _this.graph
}

// 替换左侧资源树表节点的类型
export function replaceNodeType(e) {
    const tableIconPath = require('@/styles/icons/table_1.png')
    const viewIconPath = require('@/styles/icons/view.png')
    // 默认展开根节点的ID集合
    $(e).each(function() {
        var tableType = this.type
        // 统一表和试图的类型为datasource
        switch (tableType) {
            case 'datasource':
                this.icon = tableIconPath
                this.isParent = true
                break
            case 'table':
                this.icon = tableIconPath
                this.type = 'datasource'
                this.oldType = tableType
                this.isParent = true
                break
            case 'view':
                this.icon = viewIconPath
                this.type = 'datasource'
                this.oldType = tableType
                this.isParent = true
                break
        }
        if (this.pid == null || typeof this.pid === 'undefined' || this.pid === '' || this.pid.toUpperCase() === 'ROOT') {
            this.open = true
        }
    })
}

/**
 * 节点单击事件
 * @description 只适用于开发环境
 */
export function onclick(event, treeId, treeNode) {
    // 隐藏菜单
    hideRMenu('rMenu')
    hideRMenu('folderMenu_dev')
    hideRMenu('moreMenu')
}

// 左侧资源树的右键事件
export function onRightClick(event, treeId, treeNode) {
    if (treeNode == null) {
        return
    }
    var menuId = ''
    switch (graph.openType) {
        case 1:// 开发环境右键菜单
            break
        case 2:// 权限环境右键菜单
            graphIndexVue.zTreeObj.selectNode(treeNode)
            if (treeNode.type === 'datasource') { // 数据表节点
                menuId = 'rMenu'
            }
            break
    }
    if (menuId === '') {
        return
    }
    var height = $(document).height()
    var numm = height - event.clientY
    if (numm < $('#' + menuId).height()) {
        showRMenu(menuId, 'node', event.clientX, event.clientY - $('#' + menuId).height())
    } else {
        showRMenu(menuId, 'node', event.clientX, event.clientY)
    }
}

/**
 * 节点刷新
 * @param treeNode 需刷新的节点对象
 */
export function rootDataRefresh(treeNode) {
    var curNode = treeNode || graphIndexVue.zTreeObj.getSelectedNodes()[0]
    var url = ''
    var param = {}
    if (openType === 1) {
        hideRMenu('folderMenu_dev')
        url = contextPath + '/graphEditor/refreshDevZtreeNode'
        param.folderId = curNode.id
        if (curNode.id === 'bussRootNode_dev') { // 【业务数据】节点
            param.refreshType = '1'
        } else if (curNode.id === 'my_space_dev') { // 个人数据
            param.refreshType = '3'
        } else if (curNode.id === 'other_space_dev') { // 他人数据
            param.refreshType = '4'
        } else { // 【业务数据】节点下的子孙文件夹节点
            param.refreshType = '2'
        }
    } else {
        hideRMenu('rootMenu')
        url = contextPathAuditAnalysis + '/sqlEditor/getBusinessTableSingle'
        param.id = curNode.id
    }
    var loading = $(graphIndexVue.$refs.ztree_datasource_ref).mLoading({ 'text': '', 'hasCancel': false })
    $.post(url, param, function(e) {
        if (e.isError) {
            loading.destroy()
            alertMsg('提示', '刷新' + [curNode.name] + '节点出错，资源树加载失败', 'error')
        } else {
            var res = []
            if (openType === 1) {
                res = e.nodeList
            } else {
                res = e
            }
            // 统一表和试图的类型为datasource，不需要替换的就执行空方法
            replaceNodeType(res)
            graphIndexVue.zTreeObj.removeChildNodes(curNode)
            graphIndexVue.zTreeObj.addNodes(curNode, res)
            loading.destroy()
        }
    }, 'json')
}

// 最大化
export function maxOpen() {
    let tableArea = $('#tableArea')
    let tableArea_height = tableArea.height()
    layer.open({
        id: 'maxOpen11',
        type: 1,
        title: '数据结果集',
        content: tableArea,
        area: ['90%', '90%'],
        skin: 'layui-layer-lan',
        resize: false,
        scrollbar: false,
        success: function(layero, index) {
            $('.layui-layer-shade').appendTo(layero.parent())
            $('#tableArea').css('height', '100%')
            // addWaterMark('handSonTable')
        },
        end: function(index) {
            $('#tableArea').css('height', tableArea_height + 'px')
            // 移除水印
            // $('.mask_div').remove()
        }
    })
}

// 打开
export function openGraph() {
    graphIndexVue.graphListDialogVisible = true
    graphIndexVue.showGraphListType = 'open'
}

/**
 * 自动保存图形化
 * */
export function autoSaveGraph() {
    if (graph.canEditor === false) { // 如果当前图形不可编辑，不提供自动保存功能
        return
    }
    if(graph.openGraphType === 4){//模型图形不提供自动保存
        return;
    }
    var encoder = new mxCodec()
    var node = encoder.encode(graph.getModel())
    var xml = mxUtils.getPrettyXml(node)
    if (typeof graphIndexVue.graphUuid === "undefined" || graphIndexVue.graphUuid === '') {
        graphIndexVue.graphName = '自动保存的副本_' + getCurTime()
        graphIndexVue.description = '系统自动保存的副本'
        graphIndexVue.graphName_show = '自动保存的副本_' + getCurTime()
        graphIndexVue.description_show = '系统自动保存的副本'
    }
    var newNodeData = $.extend(true, {}, graph.nodeData)
    var data = {
        'graphName': graphIndexVue.graphName,
        'description': graphIndexVue.description,
        'graphXml': xml,
        'graphUuid': graphIndexVue.graphUuid,
        'createType': graph.openType,
        'graphType': graph.graphType,
        'nodeData': JSON.stringify(newNodeData) // 各个节点的配置信息
    }
    switch (graph.openGraphType) {
        case 1:// 个人图形
            data.executeStatus = getExecuteDetail()
            break
        case 2:// 个人场景查询
            data.executeStatus = getExecuteDetail()
            data.graphType = 3
            data.publicType = 0
            break
        case 3:// 公共场景查询
            data.executeStatus = 3
            data.publicType = 1
            data.graphType = 3
            break
        case 4:// 模型图形
            data.executeStatus = getExecuteDetail()
            data.modelSql = graphIndexVue.curModelSql// 临时将模型SQL语句绑在数据串中
            break
    }
    saveGraphInterface(data).then(response => {
        if (!response.data) {
            graphIndexVue.$message.error('自动保存图形失败')
        } else {
            graphIndexVue.graphUuid = response.data
        }
    })
}

/**
 * 格式化时间
 * */
function getCurTime() {
    var formatTime = function(data) {
        if (data < 10) {
            return '0' + data
        } else {
            return data
        }
    }
    var myDate = new Date()
    var month = formatTime(myDate.getMonth() + 1)
    var day = formatTime(myDate.getDate())
    var hour = formatTime(myDate.getHours())
    var minutes = formatTime(myDate.getMinutes())
    return '' + myDate.getFullYear() + month + day + hour + minutes
}

/**
 * 判断当前图形中结果表节点的执行情况
 * status：1、全部执行，2、部分执行，3、全部未执行
 * */
export function getExecuteDetail() {
    var status = 3// 默认为全部未执行
    // 选中所有节点
    graph.selectVertices()
    // 获取所有选中的节点
    var selectCell = graph.getSelectionModel()
    var rsTableCellIdArr = []// 结果表节点ID数组
    var executeNodeNum = 0		// 执行节点的数量
    for (var i = 0; i < selectCell.cells.length; i++) {
        var nodeId = selectCell.cells[i].id
        if (graph.nodeData[nodeId] && graph.nodeData[nodeId].nodeInfo && graph.nodeData[nodeId].nodeInfo.optType === 'newNullNode') {
            rsTableCellIdArr.push(nodeId)
        }
    }
    if (rsTableCellIdArr.length === 0) {
        status = 3
    } else {
        for (var j = 0; j < rsTableCellIdArr.length; j++) {
            var id = rsTableCellIdArr[j]
            if (graph.nodeData[id] && graph.nodeData[id].nodeInfo && (graph.nodeData[id].nodeInfo.nodeExcuteStatus === 3 || graph.nodeData[id].nodeInfo.nodeExcuteStatus === 4)) {
                executeNodeNum++
            }
        }
        if (executeNodeNum === 0) {
            status = 3
        } else if (executeNodeNum > 0 && executeNodeNum < rsTableCellIdArr.length) {
            status = 2
        } else {
            status = 1
        }
    }
    // 取消所有选中状态
    graph.clearSelection()
    return status
}

// 打开图形化后的回调
export function openCallBack(obj) {
    var executeIdArr = []
    graphIndexVue.graphUuid = obj.graphUuid
    graphIndexVue.graphName = obj.graphName
    graphIndexVue.description = obj.description
    graphIndexVue.graphName_show = obj.graphName
    graphIndexVue.description_show = obj.description
    graph.nodeData = JSON.parse(obj.nodeData)
    mxUtils.setPrettyXmlLayout(obj.graphXml)
    if (graph.openGraphType === 4 && typeof obj.modelSql !== 'undefined') { // 如果加载的是模型图形
        graphIndexVue.curModelSql = obj.modelSql
    }
    var arr = Object.keys(graph.nodeData)
    for (var i = 0; i < arr.length; i++) {
        if (graph.nodeData[arr[i]] && graph.nodeData[arr[i]].nodeInfo) {
            var id = graph.nodeData[arr[i]].nodeInfo.nodeId
            var name = graph.nodeData[arr[i]].nodeInfo.nodeName
            var type = graph.nodeData[arr[i]].nodeInfo.optType
            var nodeExcuteStatus = graph.nodeData[arr[i]].nodeInfo.nodeExcuteStatus
            var hasParam = graph.nodeData[arr[i]].hasParam
            var paramsSetting = graph.nodeData[arr[i]].paramsSetting
            if (hasParam && paramsSetting && Object.keys(paramsSetting).length !== 0) {
                graphIndexVue.nodeParamRelArr[arr[i]] = $.extend(true, {}, paramsSetting)
            }
            refrashResourceZtree(id, '加载' + name, type)
            if (graph.openGraphType === 3 || (graph.openGraphType === 1 && graphIndexVue.createUserId !== '' && graphIndexVue.createUserId !== graphIndexVue.loginUserUuid) ||
                parseInt(graphIndexVue.openType_graph) !== parseInt(graph.openType)) { // 如果加载的是公共场景查询图形或者他人分享的图形或者当前打开的图形的数据源环境与当前使用的数据源环境不相符时
                if (type !== 'datasource' && nodeExcuteStatus !== 1) { // 改变非原表节点的执行状态为未执行
                    graph.nodeData[arr[i]].nodeInfo.nodeExcuteStatus = 1
                    // 改变节点执行状态的图标
                    changeNodeIcon(1, null, arr[i])
                }
            } else { // 检测图形中石是否有正在执行中的节点
                if (nodeExcuteStatus === 2) {
                    executeIdArr.push(arr[i])
                }
            }
            // 初始化SQL编辑器节点在操作图形过程中临时附加的sqlIsChanged属性
            if (type === 'sql' && typeof graph.nodeData[arr[i]].sqlIsChanged !== 'undefined') {
                delete graph.nodeData[arr[i]].sqlIsChanged
            }
        }
    }
    // 记录打开操作的操作痕迹
    refrashHistoryZtree('打开图形化')
    // 判断非公共场景查询的图形化的节点中是否有正在执行状态的节点
    // if (graph.openGraphType !== 3 && executeIdArr.length !== 0) { // 如果有，则每隔一分钟请求一次数据
    //     // 从缓冲表中查询与当前图形化有关的执行中节点的执行结果信息
    //     getExecuteNodeInfo(obj.graphUuid, null, executeIdArr, true)
    // }
    // 获取图形上的所有节点和线
    var cellObj = graph.getModel().cells
    var keys = Object.keys(cellObj)
    for (var j = 0; j < keys.length; j++) {
        if (cellObj[keys[j]].edge) { // 线
            // 添加连接线信息
            if (!graph.edgeArr) {
                graph.edgeArr = []
            }
            graph.edgeArr[keys[j]] = { 'source': cellObj[keys[j]].source, 'target': cellObj[keys[j]].target }
        }
    }
    // 初始化历史操作痕迹
    ownerEditor.editor.undoManager.history.pop()
    ownerEditor.editor.undoManager.indexOfNextAdd = 0
}

function getExecuteNodeInfo(graphUuid, executeId, executeIdArr, refreshHistory) {
    let obj = {graphUuid:'',executeId:''}
    let len = executeIdArr.length
    if (graphUuid && graphUuid !== '') {
        obj.graphUuid = graphUuid
    }
    if (executeId && executeId !== '') {
        obj.executeId = executeId
    }
    var inerval = null
    var executeNodeInfo = function() {
        getExecuteNodeInfoPost(obj).then( response => {
            var e = response.data
            if(e && e.length > 0){
                graphIndexVue.resultTabActiveName = '1'
                let count = 0
                let executeIdArr = []
                for (let i = 0; i < e.length; i++) {
                    var executeNodeIds = e[i].executeNodeIds.split(",")
                    var executeId = e[i].executeId
                    var executeNodeData = JSON.parse(e[i].executeNodeData)
                    var message = e[i].message
                    for (let j = 0; j < executeNodeIds.length; j++) {
                        if (!graph.nodeData[executeNodeIds[j]]) {
                            break
                        }
                        var nodeExcuteStatus = graph.nodeData[executeNodeIds[j]].nodeInfo.nodeExcuteStatus
                        var settingId = graph.nodeData[executeNodeIds[j]].setting.settingId
                        // 如果缓冲表中的当前执行中节点包含在graph中的执行中节点队列中，且graph中的当前执行节点状态为执行中，且节点配置信息的ID相同时，则可确定此批次中的执行中节点信息的唯一性
                        if ($.inArray(executeNodeIds[j], executeIdArr) > -1 && nodeExcuteStatus === 2 && executeNodeData[executeNodeIds[j]] && settingId === executeNodeData[executeNodeIds[j]].setting.settingId) {
                            count++
                        }
                    }
                    if (count === executeNodeIds.length) {
                        // 循环所有节点变更执行状态有变化的节点执行状态信息,start
                        nodeCallBack(executeNodeIds, executeNodeData, executeId)
                        // end
                        if (refreshHistory) {
                            $('#sysInfoArea').append(message)
                        }
                        // 自动保存图形化
                        autoSaveGraph()
                        len = len - count // 实时记录剩余的执行中节点数量
                        executeIdArr.push(executeId)
                    }
                }
                if (inerval != null && len === 0) {	// 当剩余的执行中节点数量为0时，结束监听
                    clearInterval(inerval)
                    if(executeIdArr.length > 0){
                        //删除缓冲表中已获取执行结果的数据
                        deleteExecuteNodes(executeIdArr.join(",")).then()
                    }
                }
                if (refreshHistory) {
                    // 记录执行操作
                    refrashHistoryZtree('执行中的节点执行完毕')
                }
            }else{
                if (inerval == null) {
                    inerval = setInterval(executeNodeInfo, 60000)// 设置每一分钟查一次
                }
            }
        })
    }
    executeNodeInfo()
}

// 点击节点，查看节点说明信息
export function nodeRemark(nodeType) {
    switch (nodeType) {
        case 'filter':// 数据筛选
            graphIndexVue.nodeRemarkHtml = '根据前置原表或结果表的表数据设置筛选条件'
            break
        case 'sort':// 数据排序
            graphIndexVue.nodeRemarkHtml = '根据前置原表或结果表对部分字段设置排序，包括正序和倒序'
            break
        case 'sample':// 数据抽样
            graphIndexVue.nodeRemarkHtml = '根据前置原表或结果表对表数据进行抽样设置，包括按样本量（个）、比例（%）、前N个、等距抽样'
            break
        case 'layering':// 数据分层
            graphIndexVue.nodeRemarkHtml = '根据前置原表或结果表对某个字段进行分层设置，分层字段的数据必须是数值型或日期类型'
            break
        case 'groupCount':// 分组汇总
            graphIndexVue.nodeRemarkHtml = "根据前置原表或结果表对部分字段进行分组和汇总设置，汇总时会根据字段类型的不同进行不同方式的汇总，汇总方式包括汇总、求和、最大值、最小值、平均值<span style='color:red'>（注：若同时进行分组和汇总的设置，则结果集中只显示设置的字段，其他字段不显示；若只设置分组，则可自定义选择显示结果集的输出字段）</span>"
            break
        case 'delRepeat':// 数据去重
            graphIndexVue.nodeRemarkHtml = "根据前置原表或结果表对部分字段进行去重设置，从而达到对表数据的去重<span style='color:red'>（注：去重后的结果集中只显示设置去重的字段，其他字段不显示）</spn>"
            break
        case 'comparison':// 数据频次分析
            graphIndexVue.nodeRemarkHtml = '<p>描述：</p>' +
                '<p>（1）根据前置原表或结果表的表数据，分析表的某字段中XX内容在表中出现的次数，本节点支持对多个表进行分析</p>' +
                '<p>（2）例子（两表）：分析【表A】的【姓名】字段和【表B】的【客户名称】字段中【张三】在【表A】和【表B】中出现的次数</p>'
            break
        case 'change':// 数据转码
            graphIndexVue.nodeRemarkHtml = '<p>描述：</p>' +
                '<p>（1）根据前置原表或结果表对部分字段设置转码规则，从而将表中的原数据转换成转码后的数据</p>' +
                '<p>（2）转码规则有特定的人员负责维护，图形化工具中只会选择需要的规则，并不会进行维护</p>' +
                '<p>（3）在结果集中会追加显示一列数据（该字段未转码前的数据），追加的列仅作为对比列进行显示，不会作为输出字段被应用到下一个节点中</p>' +
                '<p>（4）例子：可将将【表A】中【性别】字段中的0或1对应的转换为男和女</p>'
            break
        case 'union':// 数据融合
            graphIndexVue.nodeRemarkHtml = '<p>1、描述</p>' +
                '<p>（1）根据前置原表或结果表对部分字段中的数据进行横向结果处理，包括合并、交集、补集</p>' +
                '<p>（2）本节点仅支持对两个表进行操作</p>' +
                '<p>2、名称解释</p>' +
                "<p>（1）合并：选取两个表的合并字段（字段的数据含义和数据类型必须相同），根据合并字段显示两个表所选字段内容合并后的结果数据，输出结果中的字段将以主表（基表）为主（<a data_type='union' class='viewEg'>点击查看图例</a>）</p>" +
                "<p>（2）交集：选取两个表的交集字段（字段的数据含义和数据类型必须相同），根据交集字段显示两个表所选字段内容中完全相同部分的结果数据，输出结果中的字段将以主表（基表）为主（<a data_type='intersect' class='viewEg'>点击查看图例</a>）</p>" +
                "<p>（3）补集：选取两个表的补集字段（字段的数据含义和数据类型必须相同），根据补集字段显示副表（从表）所选取字段中的内容不存在于主表（基表）所选取字段中的内容的数据，输出结果中的字段将以主表（基表）为主（<a data_type='exclude' class='viewEg'>点击查看图例</a>）</p>"
            break
        case 'barChart':// 自定义图形
            graphIndexVue.nodeRemarkHtml = '根据前置原表或结果表的表数据，可对其进行多维度的图表、图形分析，从而更加直观的了解数据的变化趋势，包括柱状图、饼图、折线图、散点图等'
            break
        case 'sql':// SQL查询器
            graphIndexVue.nodeRemarkHtml = '用户可借助SQL查询器自定义编写SQL语句，对数据进行实时查询'
            break
        case 'newNullNode':// 结果表
            graphIndexVue.nodeRemarkHtml = '根据前置节点的配置自动生成，展示的数据是根据前置配置节点的条件设置所执行后的过滤数据'
            break
        case 'datasource':// 原表
            graphIndexVue.nodeRemarkHtml = '包括数据库中原始表、汉化表、个人数据表'
            break
        case 'relation':// 数据关联
            graphIndexVue.nodeRemarkHtml = '<p>1、描述</p>' +
                '<p>（1）根据前置原表或结果表对其进行联查设置，关联方式包括左连接、右连接、内连接、外连接</p>' +
                '<p>（2）本节点支持多张表同时做关联设置（至少两张表）</p>' +
                '<p>2、名称解释</p>' +
                "<p>（1）左连接：选取关联字段将两张表进行关联，左表的所有数据均显示，右表的数据只显示关联字段值相等的数据，若右表关联结果无数据则补空显示（<a data_type='left_join' class='viewEg'>点击查看图例</a>）</p>" +
                "<p>（2）右连接：选取关联字段将两张表进行关联，右表的所有数据均显示，左表的数据只显示关联字段值相等的数据，若左表关联结果无数据则补空显示（<a data_type='right_join' class='viewEg'>点击查看图例</a>）</p>" +
                "<p>（3）内连接：选取关联字段将两张表进行关联，仅显示两张表中关联字段值相等的数据（<a data_type='inner_join' class='viewEg'>点击查看图例</a>）</p>" +
                "<p>（4）外连接：选取关联字段将两张表进行关联，显示出左表和右表关联后的所有数据，但去除重复数据，两表中若无关联数据则补空显示（<a data_type='join' class='viewEg'>点击查看图例</a>）</p>"
            break
    }
    graphIndexVue.detailTabActiveName = '1'
}

// 右侧所使用资源树代码块,start----------------------------
export const historySetting = {
    view: {
        selectedMulti: false
    },
    data: {
        simpleData: {
            enable: true
        },
        key: {
            title: 'displayName'
        }
    },
    callback: {
        onClick: function(event, treeId, treeNode) {
            confirmMsg('提示', '确定跳转到到此处？', 'info', function() {
                let resourceRootNode = graphIndexVue.resourceRootNode;
                // 更新所有节点信息
                graph.nodeData = JSON.parse(graph.historyNodeInfo[treeNode.id].nodeData)
                // 刷新svg
                mxUtils.setPrettyXmlLayout(graph.historyNodeInfo[treeNode.id].xml)
                // 更新所使用资源树
                graphIndexVue.resourceZtree.removeChildNodes(resourceRootNode)
                resourceRootNode.children = graph.historyNodeInfo[treeNode.id].resourceZtreeNodes
                resourceRootNode.open = true
                graphIndexVue.resourceZtree = $.fn.zTree.init($('#resourceZtree'), resourceSetting, resourceRootNode)
                ownerEditor.resetHistory()
                graphIndexVue.executeTaskObj = {}
                graphIndexVue.curCell = null
                // 查找当前快照下的graph中节点状态为执行中的节点
                // var executingNodeIdArr = []
                // var arr = Object.keys(graph.nodeData)
                // var graphUuid = $('#graphUuid').val()
                // for (var k = 0; k < arr.length; k++) {
                //     var nodeExcuteStatus = graph.nodeData[arr[k]].nodeInfo.nodeExcuteStatus
                //     if (nodeExcuteStatus === 2) {
                //         executingNodeIdArr.push(arr[k])
                //     }
                // }
                // getExecuteNodeInfo(graphUuid, null, executingNodeIdArr, false)
            }, function() {})
        }
    }
}
// 所使用资源树刷新
export function refrashResourceZtree(id, name, type) {
    var resourceNode = {
        'name': name,
        'displayName': name,
        'id': id,
        'pid': 'resourceRoot',
        'level': 1,
        'type': 'resourceNode',
        'isParent': false,
        'open': false,
        'icon': 'images/icon/text.png'
    }
    var nodes = graphIndexVue.resourceZtree.getNodesByParam('pid', null, null)
    nodes[0].children.push(resourceNode)
    $.fn.zTree.init($('#resourceZtree'), resourceSetting, nodes[0])
}

// 工作区节点的名称改变联动更新所使用资源树节点的名称
export function updateResourceZtreeNodeName(treeNodeId, name) {
    var nodes = graphIndexVue.resourceZtree.getNodesByParam('id', treeNodeId, null)
    nodes[0].name = name
    nodes[0].displayName = name
    graphIndexVue.resourceZtree.updateNode(nodes[0])
}

// 删除工作区节点时联动删除所使用资源树的对应节点，支持批量删除
export function deleteResourceZtreeNode(treeNodeIdArr) {
    for (var i = 0; i < treeNodeIdArr.length; i++) {
        var nodes = graphIndexVue.resourceZtree.getNodesByParam('id', treeNodeIdArr[i], null)
        graphIndexVue.resourceZtree.hideNode(nodes[0])
    }
}

// 撤销操作变更所使用资源树的节点显示状态
/*
* idArr 撤销操作的所有节点id
* status 是否显示
* */
export function undoResourceZtreeNode(idArr, status) {
    // 判断是否是新打开的图形化后直接执行的撤销操作
    if (idArr.length === 0) {
        var parent = graph.getDefaultParent()
        var parentChildren = parent.children
        for (var k = 0; k < parentChildren.length; k++) {
            if (parentChildren[k].vertex) {
                idArr.push(parentChildren[k].id)
            }
        }
    }
    for (var i = 0; i < idArr.length; i++) {
        var nodes = graphIndexVue.resourceZtree.getNodesByParam('id', idArr[i], null)
        if (nodes.length !== 0) {
            if (nodes[0].isHidden && status) {
                for (var j = 0; j < nodes.length; j++) {
                    graphIndexVue.resourceZtree.showNode(nodes[j])
                }
            }
            if (!nodes[0].isHidden && !status) {
                for (var t = 0; t < nodes.length; t++) {
                    graphIndexVue.resourceZtree.hideNode(nodes[t])
                }
            }
        }
    }
}

// 恢复操作变更所使用资源树的节点显示状态
/*
 * idArr 恢复操作的所有节点id
 * status 是否显示
 * */
export function redoResourceZtreeNode(idArr, status) {
    // 判断是否是新打开的图形化后直接对执行的撤销操作进行恢复操作
    if (idArr.length === 0) {
        var parent = graph.getDefaultParent()
        var parentChildren = parent.children
        for (var k = 0; k < parentChildren.length; k++) {
            if (parentChildren[k].vertex) {
                idArr.push(parentChildren[k].id)
            }
        }
    }
    for (var i = 0; i < idArr.length; i++) {
        var nodes = graphIndexVue.resourceZtree.getNodesByParam('id', idArr[i], null)
        if (nodes.length !== 0) {
            if (nodes[0].isHidden && !status) {
                for (var j = 0; j < nodes.length; j++) {
                    graphIndexVue.resourceZtree.showNode(nodes[j])
                }
            }
            if (!nodes[0].isHidden && status) {
                for (var t = 0; t < nodes.length; t++) {
                    graphIndexVue.resourceZtree.hideNode(nodes[t])
                }
            }
        }
    }
}

// 右侧所使用资源树代码块,end---------------

// 右侧操作痕迹树代码块,start----------------------------
export const resourceSetting = {
    view: {
        selectedMulti: false
    },
    data: {
        simpleData: {
            enable: true
        },
        key: {
            title: 'displayName'
        }
    },
    callback: {
        onClick: function(event, treeId, treeNode) {
            var curCell = graph.model.getCell(treeNode.id)
            graph.setSelectionCell(curCell)
            lightHeight(treeNode.id)
        }
    }
}
// 操作痕迹树刷新
export function refrashHistoryZtree(name) {
    var id = new UUIDGenerator().id
    var historyNode = {
        'name': name,
        'displayName': name,
        'id': id,
        'pid': 'historyRoot',
        'level': 1,
        'type': 'historyNode',
        'isParent': false,
        'open': false,
        'icon': 'images/icon/text.png'
    }
    var nodes = graphIndexVue.historyZtree.getNodesByParam('pid', null, null)
    nodes[0].children.push(historyNode)
    $.fn.zTree.init($('#historyZtree'), historySetting, nodes[0])
    saveOptHistoryInfo(id)
}

// 右侧操作痕迹树代码块,end---------------

/**
 * 保存每步操作痕迹的图形化XML信息和节点信息
 * */
function saveOptHistoryInfo(id) {
    var encoder = new mxCodec()
    var node = encoder.encode(graph.getModel())
    var xml = mxUtils.getPrettyXml(node)
    var resourceZtreeNodes = graphIndexVue.resourceZtree.getNodesByParam('pid', 'resourceRoot', null)
    graph.historyNodeInfo[id] = {
        'node': node,
        'xml': xml,										// 图形化XML信息
        'nodeData': JSON.stringify(graph.nodeData),		// 图形化节点信息
        'resourceZtreeNodes': resourceZtreeNodes
    }
}

// 节点右键事件,start
export function showRMenu(menuId, type, x, y, containerId) {
    x += document.body.scrollLeft
    y += document.body.scrollTop
    $('#' + menuId + ' ul').show()
    $('#' + menuId).css({ 'top': y + 'px', 'left': x + 'px', 'visibility': 'visible' })
    $('body').bind('mousedown', { 'menuId': menuId }, onBodyMouseDown)
}

export function hideRMenu(menuId) {
    if ($('#' + menuId)[0]) $('#' + menuId).css({ 'visibility': 'hidden' })
    $('body').unbind('mousedown', onBodyMouseDown)
}

function onBodyMouseDown(event) {
    if (!(event.target.id === event.data.menuId || $(event.target).parents('#' + event.data.menuId).length > 0)) {
        $('#' + event.data.menuId).css({ 'visibility': 'hidden' })
    }
}
// end

// 导入
export function importGraph(data) {
    var val = $('#importGraphInp').val()
    if (val !== '') {
        if (val.split('.')[1] !== 'xml') {
            graphIndexVue.$message({ type: 'warning', message: '导入的文件仅支持xml格式' })
        }else{
            let graphType = (graph.openGraphType === 2 || graph.openGraphType === 3) ? 3 : 1
            let formData = new FormData()
            formData.append("file",data.target.files[0])
            formData.append("graphType",graphType)
            var loading = $('body').mLoading({ 'text': '正在导入文件，请稍后……', 'hasCancel': false })
            importGraphXml(formData).then( response => {
                loading.destroy()
                if(response.data){
                    graphIndexVue.$notify({ title: '提示', message: '文件导入成功', position: 'bottom-right' })
                }else{
                    graphIndexVue.$message.error('导入时解析文件出错')
                }
            })
        }
    }else{
        graphIndexVue.$message({ type: 'warning', message: '未选择待上传的文件' })
    }
}

// 导出
export function exportGraph() {
    hideRMenu('moreMenu')
    graphIndexVue.graphListDialogVisible = true
    graphIndexVue.showGraphListType = 'export'
    if (typeof graphIndexVue.$refs.graphListExport !== "undefined") {//非首次加载需刷新列表
        graphIndexVue.$refs.graphListExport.getGraphList();
    }
}

export function exportGraphBack(param) {
    let loading = $('body').mLoading({ 'text': '正在导出图形，请稍后……', 'hasCancel': false })
    // todo
    let fileName = graphIndexVue.$store.getters.personcode + '_exportGraph_' + dayjs(new Date()).format('YYYYMMDDHHmmssSSS') + '.xml'
    exportGraphXml({fileName,...param}).then( response => {
        debugger
        if(response.data){
            progressDownLoad('/graphtool/graphCt/downLoadXml', fileName, {fileName: fileName}, function() {
                loading.destroy()
                graphIndexVue.$notify({ title: '提示', message: '图形文件下载成功', position: 'bottom-right' })
            }, function() {
                loading.destroy()
                graphIndexVue.$message.error('图形文件下载失败')
            }, function() {})
        }else{
            loading.destroy()
            graphIndexVue.$message.error('图形导出失败')
        }
    })
}

// 前进
export function next() {
    if (graph.canEditor === false) {
        graphIndexVue.$message({ type: 'warning', message: '当前图形您没有【恢复】操作的权限' })
        return
    }
    ownerEditor.redo()
}

// 后退
export function back() {
    if (graph.canEditor === false) {
        graphIndexVue.$message({ type: 'warning', message: '当前图形您没有【撤销】操作的权限' })
        return
    }
    ownerEditor.undo()
}

//获取中间、最终结果表的输出列信息
export function getResultColumnInfo(){
    let middleTableArr = []
    let finalTable = {}
    let isError = false
    let message = ''
    let resultTableNodeId = ''// 最终结果表的节点ID（仅有一个）
    // 先判断在整个图形中是否存在打了标记的最终结果表，默认为未标记（false）
    let hasResultSign = false
    let nodeIdArr = Object.keys(graph.nodeData)
    for (let i = 0; i < nodeIdArr.length; i++) {
        let resultTableStatus = graph.nodeData[nodeIdArr[i]].nodeInfo.resultTableStatus
        if (resultTableStatus === 2) {
            hasResultSign = true
            resultTableNodeId = nodeIdArr[i]
            break
        }
    }
    if (!hasResultSign) {
        isError = true
        message = '未将结果表标记为最终结果表'
    }else {
        let lineNodeIdArr = []
        if(graph.nodeData[resultTableNodeId].nodeInfo.optType === "datasource"){//只将原表标记成了最终结果表
            lineNodeIdArr = [resultTableNodeId]
        }else{// 以模型最终结果表节点为最末级节点，向上寻找所有的节点
            lineNodeIdArr = getPreNodes(resultTableNodeId, [resultTableNodeId])
        }
        for (let i = 0; i < lineNodeIdArr.length; i++) {
            let curNodeInfo = graph.nodeData[lineNodeIdArr[i]].nodeInfo
            if(curNodeInfo.optType === 'datasource' || curNodeInfo.optType === 'newNullNode'){//如果是源表或结果表
                if(curNodeInfo.midTableStatus === 2 || curNodeInfo.resultTableStatus === 2){//如果是被标记为辅助结果表或最终结果表
                    let columnsInfo = null
                    if(curNodeInfo.optType === 'datasource'){
                        columnsInfo = graph.nodeData[lineNodeIdArr[i]].columnsInfo
                    }else if(curNodeInfo.optType === 'newNullNode'){
                        // 先获取该结果表的前置节点ID集合
                        let parentIds = graph.nodeData[lineNodeIdArr[i]].parentIds
                        // 如果该节点的前置节点ID在当前的节点ID集合批次中（因结果表的前置节点有且只有一个，所以可直接使用parentIds[0]）
                        if (parentIds.length > 0 && $.inArray(parentIds[0], lineNodeIdArr) > -1) {
                            columnsInfo = graph.nodeData[parentIds[0]].columnsInfo
                        }
                    }else{
                        continue
                    }
                    let columnNameArr = []//输出列名称数组
                    let columnTypeArr = []//输出列类型数组
                    for (let k = 0; k < columnsInfo.length; k++) {
                        // 判断是否为输出列
                        let isOutputColumn = columnsInfo[k].isOutputColumn
                        if (isOutputColumn === 1) { // 如果是输出列，则拼接输出列的字符串
                            columnNameArr.push(columnsInfo[k].newColumnName)
                            columnTypeArr.push(columnsInfo[k].columnType)
                        }
                    }
                    if (curNodeInfo.midTableStatus === 2) { // 如果是被标记为辅助结果表
                        middleTableArr.push({columnNameArr,columnTypeArr})
                    }
                    if (curNodeInfo.resultTableStatus === 2) { // 如果是被标记为最终结果表，则说明此节点将作最后一个结果表节点
                        finalTable = {columnNameArr,columnTypeArr}
                        break
                    }
                }
            }
        }
    }
    return {isError,message,middleTableArr,finalTable}
}

export async function saveModelGraph(){
    graphIndexVue.loading = $(graphIndexVue.$refs.graphToolDiv).mLoading({ 'text': '正在运行校验图形节点，请稍后……', 'hasCancel': false })
    let isError = false
    let message = ''
    let modelSql = ''//生成的模型语句
    let modelParamIdArr = [];//模型中用到的参数ID数组
    let paramArr = [];//模型中用到的参数数组信息
    let graphUuid = ''
    let resultTableNodeId = ''// 最终结果表的节点ID（仅有一个）
    // 先判断在整个图形中是否存在打了标记的最终结果表，默认为未标记（false）
    let hasResultSign = false
    let nodeIdArr = Object.keys(graph.nodeData)
    for (let i = 0; i < nodeIdArr.length; i++) {
        let resultTableStatus = graph.nodeData[nodeIdArr[i]].nodeInfo.resultTableStatus
        if (resultTableStatus === 2) {
            hasResultSign = true
            resultTableNodeId = nodeIdArr[i]
            break
        }
    }
    if (!hasResultSign) {
        isError = true
        message = '未将结果表标记为最终结果表'
    }else {
        let newNodeData = { ...{}, ...graph.nodeData }
        if(newNodeData[resultTableNodeId].nodeInfo.optType === "datasource"){//只将原表标记成了最终结果表
            modelSql += "/*原表【" + newNodeData[resultTableNodeId].nodeInfo.nodeName + "】的查询SQL语句*/\n" + newNodeData[resultTableNodeId].nodeInfo.nodeSql + "\n";
        }else{
            // 以模型最终结果表节点为最末级节点，向上寻找所有的节点
            let lineNodeIdArr = getPreNodes(resultTableNodeId, [resultTableNodeId])
            var dataParam = {
                'openType': graph.openType,
                'nodeIdList': lineNodeIdArr.join(","),
                'nodeData': JSON.stringify(graph.nodeData),
                "noData":true
            }
            console.log('情况2')
            const response = await executeNodeSql(dataParam)
            if(response.data != null){
                //改变当前图形节点的信息
                nodeCallBack(lineNodeIdArr, response.data.nodeData)
                if(response.data.isError){
                    isError = true
                    message = '模型设计校验图形未通过：存在运行出错的节点'
                }else{
                    newNodeData = { ...{}, ...graph.nodeData }//二次赋值是因为此时的【graph.nodeData】部分值发生了改变
                    let dropViewSql = ''//删除视图的SQL语句
                    let dropTableSql = ''//删除表的SQL语句
                    let selectSql = ''
                    let tableName = ''
                    for (let i = 0; i < lineNodeIdArr.length; i++) {
                        let curNodeInfo = newNodeData[lineNodeIdArr[i]].nodeInfo
                        if(curNodeInfo.optType === 'datasource'){
                            if(curNodeInfo.midTableStatus === 2 || curNodeInfo.resultTableStatus === 2){
                                selectSql = curNodeInfo.nodeSql
                                if(newNodeData[lineNodeIdArr[i]].hasParam && newNodeData[lineNodeIdArr[i]].paramsSetting){
                                    selectSql += " WHERE " +  newNodeData[lineNodeIdArr[i]].paramsSetting.sql;//参数部分的SQL语句（where条件部分）
                                    let arr = newNodeData[lineNodeIdArr[i]].paramsSetting.arr
                                    for(let t=0; t<arr.length; t++){
                                        modelParamIdArr.push(arr[t].copyParamId);
                                        paramArr.push({ ...{}, ...arr[t] });//此处深层扩展赋值，是为了当改变paramArr中得值时不影响paramsSetting得值
                                    }
                                }
                                modelSql += "/*原表【" + curNodeInfo.nodeName + "】的查询SQL语句*/\n" + selectSql + "\n";
                            }
                        }
                        if(curNodeInfo.optType === 'newNullNode'){
                            //先获取该结果表的前置节点ID集合
                            let parentIds = newNodeData[lineNodeIdArr[i]].parentIds;
                            //如果该节点的前置节点ID在当前的节点ID集合批次中（因结果表的前置节点有且只有一个，所以可直接使用parentIds[0]）
                            if(parentIds.length > 0 && $.inArray(parentIds[0],lineNodeIdArr) > -1) {
                                //获取前置节点的节点信息
                                let preNodeInfo = newNodeData[parentIds[0]].nodeInfo
                                //获取前置节点的输出列信息集合
                                let preColumnsInfo = graph.nodeData[parentIds[0]].columnsInfo
                                //循环获取输出列
                                let selectColArr = []
                                for(var k=0; k<preColumnsInfo.length; k++){
                                    if(preColumnsInfo[k].isOutputColumn === 1){//如果是输出列，则拼接输出列的字符串
                                        selectColArr.push(preColumnsInfo[k].newColumnName)
                                    }
                                }
                                if(preNodeInfo.optType === "layering"){//如果是前置节点是数据分层节点，则当前结果表的临时表名称需按照下标取值
                                    let index = curNodeInfo.index;//获取当前结果表的下标
                                    //获取数据分层节点的结果表数组
                                    let resultTableNameArr = preNodeInfo.resultTableNameArr;
                                    //若数组不为空
                                    if(resultTableNameArr.length > index){
                                        selectSql = preNodeInfo.nodeSqlArr[index]
                                        tableName = resultTableNameArr[index]
                                    }
                                }else if(preNodeInfo.optType === "sql"){
                                    selectSql = preNodeInfo.resultSql
                                    tableName = preNodeInfo.resultTableName
                                }else{//其他类型的操作节点都一样，直接取前置节点的临时表名称
                                    selectSql = preNodeInfo.nodeSql
                                    tableName = preNodeInfo.resultTableName
                                }
                                //组织SQL语句
                                if(curNodeInfo.midTableStatus === 2 || curNodeInfo.resultTableStatus === 2){//如果结果表是辅助结果表或最终结果表
                                    dropTableSql += "/*节点【" + preNodeInfo.nodeName + "】的删除结果表的SQL语句*/\n DROP TABLE " + tableName + "\n"
                                    if(graphIndexVue.dbType === "db2"){//不能移动位置
                                        modelSql += "/*节点【" + preNodeInfo.nodeName + "】的创建结果表的SQL语句*/\n CREATE TABLE " + tableName + " AS (" + selectSql + ") definition only\n";
                                        //此句只适用于业务库是DB2数据库（目的是为了实现CREATE TABLE xx AS SELECT……的数据插入）
                                        modelSql += "/*节点【" + preNodeInfo.nodeName + "】的结果表插入数据的SQL语句*/\n INSERT INTO " + tableName + " " + selectSql + ";\n";
                                    }else{
                                        modelSql += "/*节点【" + preNodeInfo.nodeName + "】的创建结果表的SQL语句*/\n CREATE TABLE " + tableName + " AS " + selectSql + "\n";
                                    }
                                    selectSql = `SELECT ${selectColArr.join(",")} FROM ${tableName}`
                                    if(newNodeData[parentIds[0]].hasParam && newNodeData[parentIds[0]].paramsSetting){
                                        //此处处理不同操作节点SELECT语句附带的参数条件
                                        let dealParam = {
                                            "sql": selectSql,
                                            "replaceParamSql": newNodeData[parentIds[0]].paramsSetting.sql,
                                            "optType":preNodeInfo.optType
                                        }
                                        const dealSqlResponse = await dealReplaceParamSql(dealParam)
                                        if(dealSqlResponse.data == null || dealSqlResponse.data.isError){
                                            isError = true
                                            message = '未正确获取模型语句'
                                            break
                                        }else{
                                            selectSql = dealSqlResponse.data.dealSql
                                        }
                                        let arr = newNodeData[parentIds[0]].paramsSetting.arr
                                        for(let t=0; t<arr.length; t++){
                                            modelParamIdArr.push(arr[t].copyParamId);
                                            paramArr.push({ ...{}, ...arr[t] });//此处深层扩展赋值，是为了当改变paramArr中得值时不影响paramsSetting得值
                                        }
                                    }
                                    modelSql += "/*节点【" + preNodeInfo.nodeName + "】的查询结果表的SQL语句*/\n " + selectSql + "\n"
                                }else{
                                    dropViewSql += "/*节点【" + preNodeInfo.nodeName + "】的删除结果视图的SQL语句*/\n DROP VIEW " + tableName + "\n"
                                    if(graphIndexVue.dbType === "db2") {
                                        modelSql += "/*节点【" + preNodeInfo.nodeName + "】的创建结果视图的SQL语句*/\n CREATE VIEW " + tableName + " AS SELECT * FROM (" + selectSql + ") SORT_TEMP\n";//不能移动位置
                                    } else {
                                        modelSql += "/*节点【" + preNodeInfo.nodeName + "】的创建结果视图的SQL语句*/\n CREATE VIEW " + tableName + " AS " + selectSql + "\n";//不能移动位置
                                    }
                                }
                            }
                        }

                    }
                    //重新生成每个节点中参数的ID
                    // for(var n=0; n<modelParamIdArr.length; n++){
                    //     var curCopyParamId = modelParamIdArr[n];//原参数ID
                    //     var newCopyParamId = new UUIDGenerator().id;//新生成的参数ID
                    //     //开始替换ID
                    //     modelSql = modelSql.replace(curCopyParamId,newCopyParamId);//替换modelSql中的参数ID
                    //     modelParamIdArr.splice(n,1,newCopyParamId);//替换modelParamIdArr中的参数ID
                    //     for(var m=0; m<paramArr.length; m++){
                    //         if(curCopyParamId === paramArr[m].copyParamId){
                    //             paramArr[m].copyParamId = newCopyParamId;//替换paramArr中的参数ID
                    //             paramArr[m].id = paramArr[m].id.replace(curCopyParamId,newCopyParamId);
                    //             break;
                    //         }
                    //     }
                    //     var keys = Object.keys(newNodeData);
                    //     if(keys && keys.length > 0){
                    //         for(var c=0; c<keys.length; c++){//替换newGraph中各个节点的参数ID
                    //             if(typeof newNodeData[keys[c]].paramsSetting !== "undefined"){
                    //                 var curArr = newNodeData[keys[c]].paramsSetting.arr;
                    //                 var curSql = newNodeData[keys[c]].paramsSetting.sql;
                    //                 newNodeData[keys[c]].paramsSetting.sql = curSql.replace(curCopyParamId,newCopyParamId);
                    //                 if(typeof curArr !== "undefined" && curArr.length > 0){
                    //                     for(var a=0; a<curArr.length; a++){
                    //                         if(curCopyParamId === curArr[a].copyParamId){
                    //                             curArr[a].copyParamId = newCopyParamId;
                    //                             curArr[a].id = curArr[a].id.replace(curCopyParamId,newCopyParamId);
                    //                             break;
                    //                         }
                    //                     }
                    //                 }
                    //             }
                    //         }
                    //     }
                    //     //替换ID结束
                    // }
                    modelSql = dropViewSql + dropTableSql + modelSql
                }

            }else{
                isError = true
                message = '模型设计校验图形的请求失败'
            }
        }
        if(!isError){
            //保存当前模型图形信息
            //获取图形xml数据
            var encoder = new mxCodec();
            var node = encoder.encode(graph.getModel());
            var xml = mxUtils.getPrettyXml(node);
            //组织请求的json数据
            let curTime = getCurTime()
            var param = {
                "graphUuid" : graphIndexVue.graphUuid,
                "createType" : graphIndexVue.openType_graph,
                "graphType" : 4,
                "executeStatus" : getExecuteDetail(),
                "graphName" : '模型图形_' + curTime,
                "description": '系统自动保存的模型图形_' + curTime,
                "graphXml" : xml,
                "nodeData" : JSON.stringify(newNodeData), //各个节点的配置信息
                "modelSql" : modelSql
            };
            await saveGraphInterface(param).then(response => {
                if (!response.data) {
                    isError = true
                    message = '模型设计保存图形信息失败'
                } else {
                    graphIndexVue.graphUuid = response.data
                    graphUuid = response.data
                }
            })
        }
    }
    graphIndexVue.loading.destroy()
    return {isError,message,graphUuid,modelSql,modelParamIdArr,paramArr}
}

/**
 * 设置图形节点参数
 */
export function showParamNodeList(){
//获取所有操作节点的数组（可用于设置参数的节点）,后台【保存】和【生成场景查询】方法也有用到此数组，修改时请同时修改
    let optTypeArr = ["filter","sort","sample","layering","groupCount","delRepeat","change","union","relation","sql"];
    //先获取所有执行成功的结果表节点ID数组
    let resultTableNodeIdArr = [];
    let nodeIdArr = Object.keys(graph.nodeData);
    for(let i=0;i<nodeIdArr.length;i++) {
        //当前节点的类型
        let optType = graph.nodeData[nodeIdArr[i]].nodeInfo.optType;
        if($.inArray(optType,optTypeArr) > -1 && graph.nodeData[nodeIdArr[i]].isSet){//将当前已配置成功的节点加入到数组中
            resultTableNodeIdArr.push(nodeIdArr[i]);
        }
    }
    if(graphIndexVue.openGraphType === 2 || graphIndexVue.openGraphType === 3){//场景查询
        //对节点进行排序（使用直接排序算法）
        resultTableNodeIdArr = sortNodeByVal(resultTableNodeIdArr);
    }
    //弹框显示节点的参数配置列表，start
    //获取当前图形中的所有线
    var edgeArr = [];
    var cells = graph.getModel().cells;//当前图形中的所有节点和线
    var keys = Object.keys(cells);
    for(var j=0; j<keys.length; j++){
        if(cells[keys[j]].edge){//连接线
            edgeArr.push(cells[keys[j]]);
        }
    }
    graphIndexVue.nodeParamArr = []
    for(let i=0; i<resultTableNodeIdArr.length; i++){
        let nodeId = resultTableNodeIdArr[i]
        let nodeName = graph.nodeData[resultTableNodeIdArr[i]].nodeInfo.nodeName;//节点名称
        let paramsSetting = $.extend(true,{},graphIndexVue.nodeParamRelArr[resultTableNodeIdArr[i]]);//参数配置信息
        let hasParamSet = false
        let lineNum = 0;//节点生成的序号，默认为0
        for(let k=0; k<edgeArr.length; k++){
            if(edgeArr[k].source && edgeArr[k].source.id === resultTableNodeIdArr[i]){
                lineNum = edgeArr[k].value;
                break;
            }
        }
        if(paramsSetting && paramsSetting.arr && paramsSetting.arr.length > 0){
            hasParamSet = true
        }
        graphIndexVue.nodeParamArr.push({nodeId,nodeName,hasParamSet,lineNum})
    }
    if(graphIndexVue.nodeParamArr.length > 0){
        graphIndexVue.nodeParamListDialogVisible = true
        if(graphIndexVue.openGraphType === 2 || graphIndexVue.openGraphType === 3){//只有场景查查询才提供数据行的拖拽排序功能
            graphIndexVue.$nextTick( () => {
                $(graphIndexVue.$refs.nodeParamTable.$refs.bodyWrapper.children[0].children[1]).sortable().disableSelection()
            })
        }
    }else{
        graphIndexVue.$message({ type: 'warning', message: '暂无可设置参数的节点' })
    }
    //弹框显示节点的参数配置列表，end
}


export function showParamNodeListCallBack() {
    //循环遍历修改nodeData的部分属性值
    let keyArr = Object.keys(graph.nodeData);
    for(let k=0; k<keyArr.length; k++){
        let nodeId = keyArr[k];
        //匹配设置参数的节点，将参数设置绑定到newGraph中
        let paramSetTrDom = graphIndexVue.$refs.nodeParamTable.$refs.bodyWrapper.children[0].children[1].children
        if(typeof paramSetTrDom !== 'undefined' && paramSetTrDom.length > 0){
            $.each(function () {
                let index = parseInt($(this).find("td:eq(0)>div>div").html()) - 1
                //进行节点的匹配
                if(graphIndexVue.nodeParamArr[index].nodeId === nodeId){
                    graph.nodeData[nodeId].nodeInfo.dataSourceType = graph.openType//给当前节点绑定节点的执行数据源环境
                    //获取节点的参数配置信息
                    let paramsSetting = $.extend(true,{},graphIndexVue.nodeParamRelArr[nodeId])
                    if(typeof paramsSetting !== "undefined" && Object.keys(paramsSetting).length > 0){//如果参数设置不为空
                        //绑定参数设置状态和值
                        graph.nodeData[nodeId].hasParam = true
                        graph.nodeData[nodeId].paramsSetting = paramsSetting
                        graph.nodeData[nodeId].nodeInfo.nodeSort = i
                        return false
                    }
                }
            })
        }
    }
    graphIndexVue.nodeParamListDialogVisible = false
}

/**
 * 对节点进行排序（使用直接排序算法）
 * @param nodeIdArr 生成场景查询的图形节点ID集合
 * @description 只适用与生成场景查询
 */
function sortNodeByVal(nodeIdArr) {
    var sortValArr = []; var notSortValArr = []
    // 先将全部节点ID数组进行拆分，区分是否设置过排序值
    for (var k = 0; k < nodeIdArr.length; k++) {
        if (typeof graph.nodeData[nodeIdArr[k]].nodeInfo.nodeSort !== 'undefined') {
            sortValArr.push(nodeIdArr[k])// 已排序节点ID数组
        } else {
            notSortValArr.push(nodeIdArr[k])// 未排序节点ID数组
        }
    }
    if (sortValArr.length === 0) { // 如果已排序的节点ID数组长度为0，直接返回未排序的节点ID数组
        return notSortValArr
    }
    // 对已排序的节点使用直接简单排序算法按从小到大顺序二次排序
    var index = 0
    for (var i = 1; i < sortValArr.length; i++) { // 第一层是控制循环的次数
        index = 0// 每次进入循环需使用数组的第一个值进行比较
        for (var j = 0; j <= sortValArr.length - i; j++) { // 第二次循环是每次循环需比较的次数
            if (parseInt(graph.nodeData[sortValArr[j]].nodeInfo.nodeSort) > parseInt(graph.nodeData[sortValArr[index]].nodeInfo.nodeSort)) {
                index = j
            }
        }
        var tempObj = sortValArr[sortValArr.length - i]// 将此次要交换的值存储到临时变量中（较小的值）
        sortValArr[sortValArr.length - i] = sortValArr[index]// 将较大的值存储到之前存储较小值的位置
        sortValArr[index] = tempObj// 将较小的值存储在原来存储较大值的位置
    }
    if (notSortValArr.length > 0) {
        sortValArr.push.apply(sortValArr, notSortValArr)
    }
    return sortValArr
}

/**
 * 给节点设置参数（或修改参数）
 * @param nodeId 节点ID
 * @param index 当前节点在参数节点数组中的下标
 */
export function settingParam(nodeId,index) {
    // 先获取当前节点的参数配置信息
    let paramsSetting = typeof graphIndexVue.nodeParamRelArr[nodeId] === 'undefined' ? {} : graphIndexVue.nodeParamRelArr[nodeId]// 先获取实时设置的参数信息
    graphIndexVue.sp_nodeId = nodeId
    graphIndexVue.sp_paramsSetting = paramsSetting
    graphIndexVue.nodeParamSettingDialogVisible = true
}

export function settingParamsCallBack() {
    // 获取操作提示
    let msg = graphIndexVue.$refs.settingParams.getOptMessage()
    graphIndexVue.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
        closeOnClickModal:false,
        closeOnPressEscape:false
    }).then(() => {
        // 获取弹出层的参数配置
        let returnObj = graphIndexVue.$refs.settingParams.getParamsSetting()
        if (!returnObj.verify) {
            graphIndexVue.$message({ type: 'warning', message: returnObj.message })
        } else {
            let nodeId = graphIndexVue.sp_nodeId
            let nodeParamItem = graphIndexVue.nodeParamArr.find(item => item.nodeId === nodeId)
            if (returnObj.paramsSetting.sql !== "" && returnObj.paramsSetting.arr.length > 0) {
                if(typeof nodeParamItem !== "undefined"){
                    nodeParamItem.hasParamSet = true
                }
                // 绑定节点的参数配置信息
                graphIndexVue.nodeParamRelArr[nodeId] = {...{}, ...returnObj.paramsSetting}
                graph.nodeData[nodeId].hasParam = true
                graph.nodeData[nodeId].paramsSetting = returnObj.paramsSetting
            } else {
                if(typeof nodeParamItem !== "undefined"){
                    nodeParamItem.hasParamSet = false
                }
                let nodeName = graph.nodeData[nodeId].nodeInfo.nodeName
                graphIndexVue.$message({ type: 'warning', message: `节点【${nodeName}】参数设置不正确，不对参数配置信息进行保存` })
                delete graph.nodeData[nodeId].hasParam;
                delete graph.nodeData[nodeId].paramsSetting;
                delete graphIndexVue.nodeParamRelArr[nodeId]
            }
            graphIndexVue.initNodeSettingVue = false
            graphIndexVue.nodeParamSettingDialogVisible = false
            autoSaveGraph()
        }
    }).catch( ()=> {})
}

/**
 * 清除对节点设置的参数信息
 * @param nodeId 节点ID
 * @param index 当前节点在参数节点数组中的下标
 */
export function clearSettingParam(nodeId,index) {
    graphIndexVue.$confirm('确定清除参数信息?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
        closeOnClickModal:false,
        closeOnPressEscape:false
    }).then(() => {
        graphIndexVue.nodeParamArr[index].hasParamSet = false
        delete graphIndexVue.nodeParamRelArr[nodeId]// 清除绑定的节点参数配置信息
        // 同时清除节点数据中已绑定的参数信息
        if (graph.nodeData[nodeId] && graph.nodeData[nodeId].hasParam) {
            delete graph.nodeData[nodeId].hasParam
            delete graph.nodeData[nodeId].paramsSetting
            delete graph.nodeData[nodeId].nodeInfo.nodeSort
            delete graph.nodeData[nodeId].replaceParamSql
        }
    }).catch( ()=> {})
}

/**
 * 左侧资源树的搜素
 */
export function searchZtree() {
    var searchText = $.trim(graphIndexVue.searchZtreeContent)
    if (searchText === '') {
        if (graphIndexVue.isSearchExpand) {
            showNodes()
            graphIndexVue.zTreeObj.expandAll(false)
            graphIndexVue.isSearchExpand = false
        }
    } else {
        if (graphIndexVue.isSearchExpand) {
            showNodes()
        }
        graphIndexVue.isSearchExpand = true
        isHiddenNodes(false, searchText)
        var nodeList = graphIndexVue.zTreeObj.getNodesByFilter(getFilter)
        if (nodeList && nodeList.length > 0) {
            expandNodes(nodeList)
            updateNodes(nodeList, true)
            hiddenNodes(nodeList, searchText)
        } else {
            var nodeArr = getAllNodes()
            for (var i = 0; i < nodeArr.length; i++) {
                if (nodeArr[i].pid) {
                    graphIndexVue.zTreeObj.hideNode(nodeArr[i])
                }
            }
        }
    }
}

function getFilter(node) {
    var searchText = $.trim(graphIndexVue.searchZtreeContent)
    return (node.name.indexOf(searchText) > -1 || node.name.indexOf(searchText.toUpperCase()) > -1 || node.name.indexOf(searchText.toLowerCase()) > -1)
}

function expandNodes(nodes) {
    for (var i = 0, l = nodes.length; i < l; i++) {
        var pNode = nodes[i].getParentNode()
        if (pNode) {
            graphIndexVue.zTreeObj.expandNode(pNode, true, false, false)
        }
    }
}

function updateNodes(nodeList, highlight) {
    for (var i = 0; i < nodeList.length; i++) {
        nodeList[i].highlight = highlight
        graphIndexVue.zTreeObj.updateNode(nodeList[i])
    }
}

function hiddenNodes(nodeList, searchText) {
    isHiddenNodes(true, searchText)
    for (var i = 0; i < nodeList.length; i++) {
        nodeList[i].isHidden = false
        graphIndexVue.zTreeObj.updateNode(nodeList[i])
        var pNode = nodeList[i].getParentNode()
        if (pNode && pNode.isHidden) {
            pNode.isHidden = false
            pNode.open = true
            graphIndexVue.zTreeObj.updateNode(pNode)
        }
    }
}

function showNodes() {
    var nodeArr = getAllNodes()
    for (var k = 0; k < nodeArr.length; k++) {
        if (nodeArr[k].isHidden) {
            nodeArr[k].isHidden = false
            graphIndexVue.zTreeObj.updateNode(nodeArr[k])
        }
        graphIndexVue.zTreeObj.showNode(nodeArr[k])
    }
}

function getAllNodes() {
    var nodeArr = []
    var nodes = graphIndexVue.zTreeObj.getNodes()
    for (var i = 0; i < nodes.length; i++) {
        nodeArr.push(nodes[i])
        nodeArr = getNodeChildren(nodes[i], nodeArr)
    }
    return nodeArr
}

function getNodeChildren(node, nodeArr) {
    var children = node.children
    if (children && children.length > 0) {
        for (var j = 0; j < children.length; j++) {
            nodeArr.push(children[j])
            if (children[j].children && children[j].children.length > 0) {
                nodeArr = getNodeChildren(children[j], nodeArr)
            }
        }
    }
    return nodeArr
}

function isHiddenNodes(flag, searchText) {
    var allNodeList = graphIndexVue.zTreeObj.transformToArray(graphIndexVue.zTreeObj.getNodes())
    if (flag) {
        for (var i = 0; i < allNodeList.length; i++) {
            if (allNodeList[i].pid != null && graphIndexVue.zTreeObj.getNodesByFilter(getFilter, false, allNodeList[i]).length === 0 &&
                (allNodeList[i].name.indexOf(searchText) < 0 && allNodeList[i].name.indexOf(searchText.toUpperCase()) < 0 && allNodeList[i].name.indexOf(searchText.toLowerCase()) < 0)) {		// 过滤掉最根节点
                graphIndexVue.zTreeObj.hideNode(allNodeList[i])
            }
        }
    } else {
        for (var i = 0; i < allNodeList.length; i++) {
            if (allNodeList[i].isHidden === true) {
                allNodeList[i].isHidden = false
                graphIndexVue.zTreeObj.updateNode(allNodeList[i])
            }
        }
    }
}

/**
 * 折叠/展开菜单事件
 */
export function hideAndShow() {
    var event = event || window.event
    var x = event.clientX
    var y = event.clientY
    var H_S_Menu = $("#H_S_Menu")
    var container = $("#geToolbarContainer")
    var w_ = document.documentElement.clientWidth - x
    if (w_ < H_S_Menu.width()) {
        x = document.documentElement.clientWidth - H_S_Menu.width() - 20
    }
    y += document.body.scrollTop
    $('#H_S_Menu ul').show()
    H_S_Menu.css({ 'top': y + 'px', 'left': x + 'px', 'visibility': 'visible' })
    $('body').bind('mousedown', { 'menuId': "H_S_Menu" }, onBodyMouseDown)
}

/**
 * 隐藏与显示工具栏
 */
export function hideAndShowToolBar() {
    hideRMenu('H_S_Menu')
    ownerEditor.toolBarH_S()
}

/**
 * 隐藏与显示左侧资源树
 */
export function hideAndShowLeftArea() {
    hideRMenu('H_S_Menu')
    ownerEditor.leftAreaH_S()
}

/**
 * 隐藏与显示右侧所使用资源树
 */
export function hideAndShowRightArea() {
    hideRMenu('H_S_Menu')
    ownerEditor.rightAreaH_S()
}

// 修改参数设置
export function modifyParam() {
    var nodeId = graph.curCell.id
    var paramsSetting = graphIndexVue.nodeParamRelArr[nodeId] ? graphIndexVue.nodeParamRelArr[nodeId] : {}// 先获取节点的参数信息
    graphIndexVue.sp_nodeId = nodeId
    graphIndexVue.sp_paramsSetting = paramsSetting
    graphIndexVue.nodeParamSettingDialogVisible = true
}

export function getParamsArr(){
    let paramsArr = []
    let nodeIdArr = Object.keys(graphIndexVue.nodeParamRelArr)
    for(let i=0; i<nodeIdArr.length; i++){
        let keys = Object.keys(graphIndexVue.nodeParamRelArr[nodeIdArr[i]])
        //paramSetting不为{}，存在当前节点，当前节点设置了参数信息
        if(keys.length !==0 && typeof graph.nodeData[nodeIdArr[i]] !== "undefined" && graph.nodeData[nodeIdArr[i]].hasParam){
            let arr = graphIndexVue.nodeParamRelArr[nodeIdArr[i]].arr
            Array.from(arr, item => paramsArr.push(item))
        }
    }
    return paramsArr
}

/**
 * 查看数据频次分析节点涉及表数量的详情数据
 * @param dataTableName 详情表名称
 * @param columnVal 涉及字段的当前值
 */
export function showComparisonTableDetail(dataTableName,columnVal) {
    graphIndexVue.comparison_dataTableName = dataTableName
    graphIndexVue.comparison_columnVal = columnVal
    graphIndexVue.comparisonTableDetailDialogVisible = true
}
