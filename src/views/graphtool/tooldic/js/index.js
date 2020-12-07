import { saveGraphInterface,getExecuteNodeInfoPost,importGraphXml,exportGraphXml } from '@/api/graphtool/graphList'
import { progressDownLoad,getPreNodes } from '@/views/graphtool/tooldic/js/common'
let indexVue = null// index.vue实例
let curModelSql = ''// 用来临时存储打开模型图形时的模型SQL语句
let nodeParamRelArr = []// 用来存储每个节点设置的参数信息
let isSearchExpand = false// 左侧资源树搜索功能的变量

/**
 * 获取vue实例
 * @param _this vue实例
 */
export const sendIndexJs = (_this) => {
    indexVue = _this
}

// 替换左侧资源树表节点的类型
export function replaceNodeType(e) {
    // 默认展开根节点的ID集合
    var openNodeIdArr = ['bussRootNode_dev', 'my_space_dev', 'other_space_dev', 'bussRootNode', 'bussDataRoot', 'my_space']
    $(e).each(function() {
        var tableType = this.type
        // 统一表和试图的类型为datasource
        switch (tableType) {
            case 'datasource':
                this.icon = 'images/icon/tableNode.png'
                break
            case 'table':
            case 'view':
                this.icon = 'images/icon/tableNode.png'
                this.type = 'datasource'
                this.oldType = tableType
                break
        }
        if ($.inArray(this.id, openNodeIdArr) > -1) {
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
            // 隐藏菜单
            hideRMenu('rMenu')
            hideRMenu('folderMenu_dev')
            hideRMenu('moreMenu')
            var nodes = indexVue.zTreeObj.getSelectedNodes()
            // 获取全部选中的节点
            if (nodes && nodes.length > 1) { // 多个节点时
                menuId = 'folderMenu_dev'
                // 设置选中节点的状态
                var hasTreeNode = false
                for (var j = 0; j < nodes.length; j++) {
                    if (nodes[j].id === treeNode.id) {
                        hasTreeNode = true
                        break
                    }
                }
                if (hasTreeNode) {
                    for (var k = 0; k < nodes.length; k++) {
                        indexVue.zTreeObj.selectNode(nodes[k], true)
                    }
                } else {
                    indexVue.zTreeObj.cancelSelectedNode()
                    indexVue.zTreeObj.selectNode(treeNode)
                    onRightClick(event, treeId, treeNode)
                    return
                }
                $('#addFolder').hide()
                $('#eidtFolder').hide()
                $('#delFolder').hide()
                $('#rootDataRefresh').hide()
                if ($('#moveTo').is(':hidden')) {
                    $('#moveTo').show()
                }
            } else {
                indexVue.zTreeObj.selectNode(treeNode)
                if (treeNode.type === 'folder') { // 文件夹节点
                    menuId = 'folderMenu_dev'
                    // 处理当前节点的右键事件菜单
                    if (treeNode.id === 'bussRootNode_dev' || treeNode.str === 'public') { // 【业务数据】节点及其下属子孙文件夹节点
                        if (treeNode.id === 'bussRootNode_dev') { // 【业务数据节点】
                            if ($('#addFolder').is(':hidden')) {
                                $('#addFolder').show()
                            }
                            if ($('#rootDataRefresh').is(':hidden')) {
                                $('#rootDataRefresh').show()
                            }
                            $('#eidtFolder').hide()
                            $('#delFolder').hide()
                            $('#moveTo').hide()
                        } else { // 【业务数据】节点下的子孙文件夹节点
                            if ($('#addFolder').is(':hidden')) {
                                $('#addFolder').show()
                            }
                            if ($('#rootDataRefresh').is(':hidden')) {
                                $('#rootDataRefresh').show()
                            }
                            if ($('#eidtFolder').is(':hidden')) {
                                $('#eidtFolder').show()
                            }
                            if ($('#delFolder').is(':hidden')) {
                                $('#delFolder').show()
                            }
                            if ($('#moveTo').is(':hidden')) {
                                $('#moveTo').show()
                            }
                        }
                    } else if (treeNode.id === 'my_space_dev' || treeNode.id === 'other_space_dev') { // 【个人数据】、【他人数据】节点
                        $('#addFolder').hide()
                        $('#eidtFolder').hide()
                        $('#delFolder').hide()
                        $('#moveTo').hide()
                        if ($('#rootDataRefresh').is(':hidden')) {
                            $('#rootDataRefresh').show()
                        }
                    }
                }
                if (treeNode.type === 'datasource') { // 数据表节点
                    menuId = 'rMenu'
                    $('#relationTableQuery').hide()
                    $('#editTable_li').hide()
                    $('#dropTable_li').hide()
                    if (treeNode.str === 'public' && $('#rMenu>ul li').length < 5) {
                        var moveTo_li_html = '<li onclick="moveTo(\'rMenu\')">移动至</li>'
                        $('#rMenu>ul').append(moveTo_li_html)
                    }
                }
            }
            break
        case 2:// 权限环境右键菜单
            indexVue.zTreeObj.selectNode(treeNode)
            if (treeNode.type === 'datasource') { // 数据表节点
                menuId = 'rMenu'
            //     if (treeNode.pid === 'importDataTable') {
            //         $('#editTable_li').show()
            //         $('#dropTable_li').show()
            //     } else {
            //         $('#editTable_li').hide()
            //         $('#dropTable_li').hide()
            //     }
            // } else if (treeNode.id === 'bussDataRoot' || treeNode.id === 'bussRootNode' || treeNode.id === 'my_space') {
            //     menuId = 'rootMenu'
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
    var curNode = treeNode || indexVue.zTreeObj.getSelectedNodes()[0]
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
    var loading = $('#ztree_datasource').mLoading({ 'text': '', 'hasCancel': false })
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
            indexVue.zTreeObj.removeChildNodes(curNode)
            indexVue.zTreeObj.addNodes(curNode, res)
            loading.destroy()
        }
    }, 'json')
}

/**
 * 新建文件夹
 */
export function addFolder() {
    hideRMenu('folderMenu_dev')
    var curNode = indexVue.zTreeObj.getSelectedNodes()[0]
    layer.open({
        id: 'addFolder_layer',
        type: 2,
        title: '新建文件夹',
        content: contextPathAuditAnalysis + '/page/cm/folder/folder.jsp',
        area: ['600px', '260px'],
        skin: 'layui-layer-lan',
        resize: false,
        scrollbar: false,
        btn: ['确定', '取消'],
        success: function(layero, index) {
            window[layero.find('iframe')[0]['name']].$('#folderName').val('')
            window[layero.find('iframe')[0]['name']].$('#folderSort').val('')
        },
        btn1: function(index, layero) {
            var folderName = window[layero.find('iframe')[0]['name']].$('#folderName').val()
            var folderSort = window[layero.find('iframe')[0]['name']].$('#folderSort').val()
            if (folderName === '') {
                alertMsg('错误', '文件夹名称不可为空', 'error')
                return
            }
            if (folderSort === '') {
                folderSort = 1// 不填写则默认排序号为1
            } else {
                if (parseInt(folderSort) < 0) { // 大于等于0的正整数
                    alertMsg('错误', '排序号必须是大于0的整数', 'error')
                    return
                }
            }
            var data = {
                'parentFolderId': curNode.id,
                'folderName': folderName,
                'folderSort': folderSort
            }
            $.post(contextPathAuditAnalysis + '/folder/addFolder', data, function(e) {
                alertMsg('提示', '新建成功', 'info')
                layer.close(index)
                rootDataRefresh(curNode)
            }, 'json')
        },
        btn2: function(index, layero) {
            layer.close(index)
        }
    })
}

/**
 * 修改文件夹
 */
export function editFolder() {
    hideRMenu('folderMenu_dev')
    var curNode = indexVue.zTreeObj.getSelectedNodes()[0]
    var oldFolderName = ''; var oldFolderSort = ''
    $.post(contextPathAuditAnalysis + '/folder/findFolder', { 'folderId': curNode.id }, function(e) {
        oldFolderName = e.folderName
        oldFolderSort = e.folderSort
        layer.open({
            id: 'editFolder_layer',
            type: 2,
            title: '修改文件夹',
            content: contextPathAuditAnalysis + '/page/cm/folder/folder.jsp',
            area: ['600px', '260px'],
            skin: 'layui-layer-lan',
            resize: false,
            scrollbar: false,
            btn: ['确定', '取消'],
            success: function(layero, index) {
                window[layero.find('iframe')[0]['name']].$('#folderName').val(oldFolderName)
                window[layero.find('iframe')[0]['name']].$('#folderSort').val(oldFolderSort)
            },
            btn1: function(index, layero) {
                var folderName = window[layero.find('iframe')[0]['name']].$('#folderName').val()
                var folderSort = window[layero.find('iframe')[0]['name']].$('#folderSort').val()
                if (folderName === '') {
                    alertMsg('错误', '文件夹名称不可为空', 'error')
                    return
                }
                if (folderSort === '') {
                    folderSort = 1// 不填写则默认排序号为1
                } else {
                    if (parseInt(folderSort) < 0) { // 大于等于0的正整数
                        alertMsg('错误', '排序号必须是大于0的整数', 'error')
                        return
                    }
                }
                var data = {
                    'folderId': curNode.id,
                    'folderName': folderName,
                    'folderSort': folderSort
                }
                $.post(contextPathAuditAnalysis + '/folder/editFolder', data, function(res) {
                    alertMsg('提示', '修改成功', 'info')
                    layer.close(index)
                    if (oldFolderSort === folderSort) { // 如果排序没变，只刷新当前节点
                        curNode.name = folderName
                        curNode.displayName = folderName
                        indexVue.zTreeObj.updateNode(curNode)
                    } else { // 刷新当前节点的父节点
                        var nodes = indexVue.zTreeObj.getNodesByParam('id', curNode.pid, null)
                        if (nodes && nodes.length > 0) {
                            rootDataRefresh(nodes[0])
                        }
                    }
                }, 'json')
            },
            btn2: function(index, layero) {
                layer.close(index)
            }
        })
    }, 'json')
}

/**
 * 删除文件夹
 */
export function delFolder() {
    hideRMenu('folderMenu_dev')
    var curNode = indexVue.zTreeObj.getSelectedNodes()[0]
    if (nodes[0].children && nodes[0].children.length > 0) {
        alertMsg('错误', '该文件夹下有子文件夹或数据表，不能删除', 'error')
        return
    }
    confirmMsg('提示', '是否确认删除文件夹【' + nodes[0].name + '】？', 'info', function() {
        $.post(contextPathAuditAnalysis + '/folder/delFolder', { 'folderId': curNode.id, 'folderName': curNode.name }, function(e) {
            alertMsg('提示', '删除成功', 'info')
            indexVue.zTreeObj.removeNode(curNode)
        }, 'json')
    }, function() {})
}

/**
 * 移动至
 */
export function moveTo(containerId) {
    hideRMenu(containerId)
    var selectedNodes = indexVue.zTreeObj.getSelectedNodes()
    var tableNameArrInRootFolder = []; var tableNameArrInOtherFolder = []; var folderIdArr = []// 数据表节点和文件夹节点分开存储
    // 检验所选的节点是否均可被移动
    var hasChildren = false// 是否有子节点
    var verify = true
    var message = ''
    var notMoveNodeIdArr = ['bussRootNode_dev', 'my_space_dev', 'other_space_dev', 'tempTable_dev_my', 'graphDataTable_dev_my', 'tempTable_dev_other', 'graphDataTable_dev_other']
    for (var i = 0; i < selectedNodes.length; i++) {
        if (selectedNodes[i].type === 'folder') { // 文件夹节点
            if ($.inArray(selectedNodes[i].id, notMoveNodeIdArr) > -1) {
                verify = false
                message = '只能移动【业务数据】节点下的文件夹节点'
                break
            } else {
                if (selectedNodes[i].children.length > 0 && hasChildren === false) {
                    hasChildren = true
                }
            }
            folderIdArr.push(selectedNodes[i].id)
        } else { // selectedNodes.type == "datasource"，数据表节点
            if (selectedNodes[i].str !== 'public') { // str属性是特殊标志，用来区分数据表是公共的还是个人的
                verify = false
                message = '只能移动【业务数据】节点下的数据表节点'
                break
            }
            if (selectedNodes[i].pid === 'bussRootNode_dev') {
                var obj = {
                    'tableName': selectedNodes[i].name,
                    'tableType': selectedNodes[i].oldType
                }
                tableNameArrInRootFolder.push(obj)// 存放【业务数据】节点下的数据表
            } else {
                tableNameArrInOtherFolder.push(selectedNodes[i].name)// 存放【业务数据】节点下属的子孙文件夹节点下的数据表
            }
        }
    }
    if (!verify) {
        alertMsg('提示', message, 'info')
        return
    }
    if (hasChildren) {
        confirmMsg('提示', '您所选中的节点中有含子文件夹或数据表的文件夹节点，是否继续？', 'info', function() {
            moveToCallBack(selectedNodes, tableNameArrInRootFolder, tableNameArrInOtherFolder, folderIdArr)
        }, function() {})
    } else {
        moveToCallBack(selectedNodes, tableNameArrInRootFolder, tableNameArrInOtherFolder, folderIdArr)
    }
}

/**
 * 移动至方法的内部回调方法
 */
function moveToCallBack(selectedNodes, tableNameArrInRootFolder, tableNameArrInOtherFolder, folderIdArr) {
    var folderZtree, loadParam
    var html = '<ul class="ztree" id="folderZtree" style="overflow: auto;width:100%;"></ul>'
    var setting = {
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
            enable: true,
            chkStyle: 'radio',
            radioType: 'all'
        },
        view: {
            selectedMulti: false
        },
        edit: {
            enable: false
        }
    }
    layer.open({
        id: 'moveTo_layer',
        type: 1,
        title: '选择文件夹',
        content: html,
        area: ['400px', '500px'],
        skin: 'layui-layer-lan',
        resize: false,
        scrollbar: false,
        btn: ['确定', '取消'],
        success: function(layero, index) {
            $('#folderZtree').height(($(document).height() * 0.8 - 35) + 'px')
            loadParam = $('#folderZtree').mLoading({ 'text': '正在加载，请稍后……', 'hasCancel': false })
            $.post(contextPath + '/graphEditor/getFolderZtree', {}, function(e) {
                if (e.isError) {
                    alertMsg('提示', '加载文件夹树出错', 'error')
                    loadParam.destroy()
                } else {
                    folderZtree = $.fn.zTree.init($('#folderZtree'), setting, e.nodeList)
                    loadParam.destroy()
                }
            }, 'json')
        },
        btn1: function(index, layero) {
            var nodes = folderZtree.getCheckedNodes()
            if (nodes && nodes.length > 0) {
                var parentFolderId = nodes[0].id
                // 验证所选目标文件夹是否是待移动节点的父节点
                var verify = true
                var message = ''
                for (var i = 0; i < selectedNodes.length; i++) {
                    if (selectedNodes[i].pid === parentFolderId) {
                        verify = false
                        message = '节点【' + selectedNodes[i].name + '】已存在与【' + nodes[0].name + '】下，不可同级移动'
                        break
                    }
                }
                if (verify) {
                    loadParam = $('body').mLoading({ 'text': '正在移动节点至目标文件夹【' + nodes[0].name + '】，请稍后……', 'hasCancel': false })
                    var paramData = {
                        'tableNamesInRootFolder': JSON.stringify(tableNameArrInRootFolder),
                        'tableNamesInOtherFolder': tableNameArrInOtherFolder.join(','),
                        'folderIds': folderIdArr.join(','),
                        'parentFolderId': parentFolderId
                    }
                    $.post(contextPath + '/graphEditor/moveToFolder', paramData, function(e) {
                        loadParam.destroy()
                        if (e.isError) {
                            alertMsg('提示', '移动至文件夹【' + nodes[0].name + '】出错', 'error')
                        } else {
                            layer.close(index)
                            alertMsg('提示', '移动至目标文件夹【' + nodes[0].name + '】成功', 'error')
                            nodes = indexVue.zTreeObj.getNodesByParam('id', 'bussRootNode_dev')// 直接刷新【业务数据】节点
                            rootDataRefresh(nodes[0])
                        }
                    }, 'json')
                } else {
                    alertMsg('提示', message, 'info')
                }
            } else {
                alertMsg('提示', '请选择一个文件夹', 'info')
            }
        },
        btn2: function(index, layero) {
            layer.close(index)
        }
    })
}

export function getColumnsByTable(treeNode, async, closeParent) {
    var data = {
        'id': treeNode.id,
        'level': treeNode.level,
        'isSqlEditor': false,
        'openType': openType,
        'tableName': treeNode.name
    }
    // 如果是开发测试数据源环境
    if (openType === 1) {
        data.type = '1'
    } else { // openType==2（如果是业务权限数据源环境）
        // 如果是业务数据或业务维度目录文件夹下的表
        if (treeNode.idPath.indexOf('bussDataRoot') > -1 || treeNode.idPath.indexOf('bussRootNode') > -1) {
            data.type = '0'
        } else {	// 如果是个人数据文件夹下的表
            data.type = '1'
        }
    }
    $.ajax({
        url: contextPath + '/graphEditor/getColumnsByTable',
        type: 'post',
        data: data,
        async: typeof async !== 'undefined' ? async : true,
        dataType: 'json',
        success: function(e) {
            if (e.isError) {
                alertMsg('提示', '数据加载出错，原因：' + e.message, 'error')
            } else {
                indexVue.zTreeObj.removeChildNodes(treeNode)
                indexVue.zTreeObj.addNodes(treeNode, e.data, closeParent)
            }
        }
    })
}

// 最大化
export function maxOpen() {
    var tableArea_height = $('#tableArea').height()
    var handSonTable_height = $('#handSonTable').height()
    layer.open({
        id: 'maxOpen11',
        type: 1,
        title: '数据结果集',
        content: $('#tableArea'),
        area: ['90%', '90%'],
        skin: 'layui-layer-lan',
        resize: false,
        scrollbar: false,
        success: function(layero, index) {
            $('.layui-layer-shade').appendTo(layero.parent())
            $('#tableArea').css('height', '100%')
            $('#handSonTable').css('height', (document.documentElement.clientHeight * 0.8 - 100) + 'px')
            if (hot != null) {
                hot.render()
            }
            addWaterMark('handSonTable')
        },
        end: function(index) {
            $('#tableArea').css('height', tableArea_height + 'px')
            $('#handSonTable').css('height', handSonTable_height + 'px')
            if (hot != null) {
                hot.render()
            }
            // 移除水印
            $('.mask_div').remove()
        }
    })
}

// 预览全部数据
export function viewAllData() {
    confirmMsg('提示', '若当前结果集数据量过大会消耗大量系统资源，请确认是否继续？', 'info', function() {
        var type = graph.isCurDataSource// 是否使用当前的数据源环境
        if (graph.viewDataType === 1) { // 左侧树右键预览数据产生的结果
            viewData(graph.curTableName, '', false, type, true)
        } else { // graph.viewDataType === 2，工作区【结果表】节点右键执行/预览数据产生的结果
            var optType = graph.nodeData[graph.curCellId].nodeInfo.optType
            if (!graph.nodeData[graph.curCellId].isSet && optType === 'newNullNode') {
                var parentIds = graph.nodeData[graph.curCellId].parentIds
                optType = graph.nodeData[parentIds[0]].nodeInfo.optType
            }
            viewData(graph.curTableName, optType, true, type, true)
        }
    }, function() {})
}

// 全部导出
export function exportAllData() {
    if (graph.curTableName && graph.curTableName !== '') {
        confirmMsg('提示', '确定导出该结果集的数据(最多导出10000条)？', 'info', function() {
            top.layer.open({
                id: 'chooseFileType',
                type: 1,
                title: '选择文件格式',
                content: $('#chooseFileTypeForm'),
                area: ['600px', '200px'],
                skin: 'layui-layer-lan',
                resize: false,
                scrollbar: false,
                btn: ['导出', '取消'],
                btn1: function(index, layero) {
                    top.layer.close(index)
                    var fileType = top.window.$("#chooseFileType input[name='fileType']:checked").val()
                    var export_loading = $('body').mLoading({ 'text': '正在导出数据，请稍后……' })
                    var isError = false
                    // tableName表名称（已加密）
                    var params = { 'tableName': graph.curTableName }
                    $.post(contextPath + '/graphEditor/preExportAllData', params, function(e) {
                        export_loading.destroy()
                        if (e.isError) {
                            alertMsg('错误', e.message, 'error')
                            isError = true
                        } else {
                            var paramStr = '?tableName=' + encodeURIComponent(e.realTableName) + '&openType=' + openType + '&fileType=' + fileType
                            window.location.href = contextPath + '/graphEditor/exportAllData' + paramStr
                            alertMsg('提示', '文件已下载至虚拟平台【我的文档】网络磁盘中', 'info')
                        }
                    }, 'json')
                },
                btn2: function(index, layero) {
                    top.layer.close(index)
                }
            })
        }, function() {})
    } else {
        alertMsg('提示', '节点未创建临时表或视图，无法导出数据', 'error')
    }
}

// 打开
export function openGraph() {
    hideRMenu('moreMenu')
    indexVue.graphListDialogVisible = true
    indexVue.showGraphListType = 'open'
    if (typeof indexVue.$refs.graphListExport !== "undefined") {//非首次加载需刷新列表
        indexVue.$refs.graphListExport.getGraphList();
    }
}

/**
 * 自动保存图形化
 * */
export function autoSaveGraph() {
    if (graph.canEditor === false) { // 如果当前图形不可编辑，不提供自动保存功能
        return
    }
    var encoder = new mxCodec()
    var node = encoder.encode(graph.getModel())
    var xml = mxUtils.getPrettyXml(node)
    if (typeof indexVue.graphUuid === "undefined" || indexVue.graphUuid === '') {
        indexVue.graphName = '自动保存的副本_' + getCurTime()
        indexVue.description = '系统自动保存的副本'
        $('#graphName_show').val('自动保存的副本_' + getCurTime())
        $('#description_show').val('系统自动保存的副本')
    }
    var newNodeData = $.extend(true, {}, graph.nodeData)
    var data = {
        'graphName': indexVue.graphName,
        'description': indexVue.description,
        'graphXml': xml,
        'graphUuid': indexVue.graphUuid,
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
            break
        case 3:// 公共场景查询
            data.executeStatus = 3
            data.publicType = 1
            data.graphType = 3
            break
        case 4:// 模型图形
            data.executeStatus = getExecuteDetail()
            data.modelSql = curModelSql// 临时将模型SQL语句绑在数据串中
            data.nodeData = JSON.stringify(newNodeData)
            break
    }
    saveGraphInterface(data).then(response => {
        if (!response.data) {
            indexVue.$message({ type: 'info', message: '自动保存图形失败' })
        } else {
            indexVue.graphUuid = response.data
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
    indexVue.graphUuid = obj.graphUuid
    indexVue.graphName = obj.graphName
    indexVue.description = obj.description
    $('#graphName_show').val(obj.graphName)
    $('#description_show').val(obj.description)
    graph.nodeData = JSON.parse(obj.nodeData)
    mxUtils.setPrettyXmlLayout(obj.graphXml)
    if (graph.openGraphType === 4 && typeof obj.modelSql !== 'undefined') { // 如果加载的是模型图形
        curModelSql = obj.modelSql
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
                nodeParamRelArr[arr[i]] = $.extend(true, {}, paramsSetting)
            }
            refrashResourceZtree(id, '加载' + name, type)
            if (graph.openGraphType === 3 || (graph.openGraphType === 1 && indexVue.createUserId !== '' && indexVue.createUserId !== indexVue.loginUserUuid) ||
                parseInt(indexVue.openType_graph) !== parseInt(graph.openType)) { // 如果加载的是公共场景查询图形或者他人分享的图形或者当前打开的图形的数据源环境与当前使用的数据源环境不相符时
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
    if (graph.openGraphType !== '3' && executeIdArr.length !== 0) { // 如果有，则每隔一分钟请求一次数据
        // 从缓冲表中查询与当前图形化有关的执行中节点的执行结果信息
        getExecuteNodeInfo(obj.graphUuid, null, executeIdArr, true)
    }
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

export function getExecuteNodeInfo(graphUuid, executeId, executeIdArr, refreshHistory) {
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
                $('ul.layui-tab-title li:eq(1)').click()
                var count = 0
                for (let i = 0; i < e.length; i++) {
                    var executeNodeIds = JSON.parse(e[i].executeNodeIds)
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
                    }
                }
                if (inerval != null && len === 0) {	// 当剩余的执行中节点数量为0时，结束监听
                    clearInterval(inerval)
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

// 保存
export function saveGraph(type) {
    var str = type === 'saveGraph' ? '保存' : '另存为'
    if (graph.canEditor === false) {
        alertMsg('提示', '当前图形您没有【' + str + '】操作的权限', 'info')
        return
    }
    // if (graph.openGraphType === 2 || graph.openGraphType === 3) { // 保存场景查询图形
    //     createScreenQuery(type)
    // } else if (graph.openGraphType === 4) { // 保存模型图形
    //     createDegreeModel(type)
    // } else {
        if (Object.keys(graph.nodeData).length === 0) {
            alertMsg('提示', '当前图形无节点数据，不可保存', 'info')
            return
        }
        var encoder = new mxCodec()
        var node = encoder.encode(graph.getModel())
        var xml = mxUtils.getPrettyXml(node)

        layer.open({
            id: 'saveGraph1',
            type: 1,
            title: '图形化' + str,
            content: $('#saveGraph'),
            area: ['50%', '40%'],
            skin: 'layui-layer-lan',
            resize: false,
            scrollbar: false,
            btn: ['确定', '取消'],
            btn1: function(index, layero) {
                var data = {
                    'createType': openType,
                    'executeStatus': getExecuteDetail(),
                    'graphName': $('#graphName').val(),
                    'description': $('#description').val(),
                    'graphXml': xml,
                    'graphType': '1', // 个人图形
                    'nodeData': JSON.stringify(graph.nodeData) // 各个节点的配置信息
                }
                if (type === 'saveGraph') {
                    data.graphUuid = $('#graphUuid').val()
                }
                $.ajax({
                    url: contextPath + '/graphEditor/saveGraph',
                    type: 'post',
                    dataType: 'json',
                    data: data,
                    success: function(e) {
                        alertMsg('提示', e.message, 'info')
                        if (!e.isError) {
                            $('#graphUuid').val(e.graphUuid)
                            if (type === 'saveGraph') {
                                $('#graphName_show').val($('#graphName').val())
                                $('#description_show').val($('#description').val())
                            }
                            layer.close(index)
                        }
                    }
                })
            },
            btn2: function(index) {
                layer.close(index)
            }
        })
    // }
}

// 帮助
export function help() {
    layer.open({
        id: 'graphHelp',
        type: 2,
        title: '图形化帮助手册',
        content: 'page/C_Rows_Data/help.jsp',
        area: ['90%', '90%'],
        skin: 'layui-layer-lan',
        resize: false,
        scrollbar: false,
        btn: ['关闭'],
        btn1: function(index, layero) {
            layer.close(index)
        }
    })
}

// 点击节点，查看节点说明信息
export function nodeRemark(nodeType) {
    var html = ''
    switch (nodeType) {
        case 'filter':					// 数据筛选
            html += '根据前置原表或结果表的表数据设置筛选条件'
            break
        case 'sort':					// 数据排序
            html += '根据前置原表或结果表对部分字段设置排序，包括正序和倒序'
            break
        case 'sample':				// 数据抽样
            html += '根据前置原表或结果表对表数据进行抽样设置，包括按样本量（个）、比例（%）、前N个、等距抽样'
            break
        case 'layering':			// 数据分层
            html += '根据前置原表或结果表对某个字段进行分层设置，分层字段的数据必须是数值型或日期类型'
            break
        case 'groupCount':		// 分组汇总
            html += "根据前置原表或结果表对部分字段进行分组和汇总设置，汇总时会根据字段类型的不同进行不同方式的汇总，汇总方式包括汇总、求和、最大值、最小值、平均值<span style='color:red'>（注：若同时进行分组和汇总的设置，则结果集中只显示设置的字段，其他字段不显示；若只设置分组，则可自定义选择显示结果集的输出字段）</span>"
            break
        case 'delRepeat':			// 数据去重
            html += "根据前置原表或结果表对部分字段进行去重设置，从而达到对表数据的去重<span style='color:red'>（注：去重后的结果集中只显示设置去重的字段，其他字段不显示）</spn>"
            break
        case 'comparison':		// 数据频次分析
            html += '<p>描述：</p>' +
                '<p>（1）根据前置原表或结果表的表数据，分析表的某字段中XX内容在表中出现的次数，本节点支持对多个表进行分析</p>' +
                '<p>（2）例子（两表）：分析【表A】的【姓名】字段和【表B】的【客户名称】字段中【张三】在【表A】和【表B】中出现的次数</p>'
            break
        case 'change':				// 数据转码
            html += '<p>描述：</p>' +
                '<p>（1）根据前置原表或结果表对部分字段设置转码规则，从而将表中的原数据转换成转码后的数据</p>' +
                '<p>（2）转码规则有特定的人员负责维护，图形化工具中只会选择需要的规则，并不会进行维护</p>' +
                '<p>（3）在结果集中会追加显示一列数据（该字段未转码前的数据），追加的列仅作为对比列进行显示，不会作为输出字段被应用到下一个节点中</p>' +
                '<p>（4）例子：可将将【表A】中【性别】字段中的0或1对应的转换为男和女</p>'
            break
        case 'union':				// 数据融合
            html += '<p>1、描述</p>' +
                '<p>（1）根据前置原表或结果表对部分字段中的数据进行横向结果处理，包括合并、交集、补集</p>' +
                '<p>（2）本节点仅支持对两个表进行操作</p>' +
                '<p>2、名称解释</p>' +
                "<p>（1）合并：选取两个表的合并字段（字段的数据含义和数据类型必须相同），根据合并字段显示两个表所选字段内容合并后的结果数据，输出结果中的字段将以主表（基表）为主（<a onclick='viewEg(\"union\")'>点击查看图例</a>）</p>" +
                "<p>（2）交集：选取两个表的交集字段（字段的数据含义和数据类型必须相同），根据交集字段显示两个表所选字段内容中完全相同部分的结果数据，输出结果中的字段将以主表（基表）为主（<a onclick='viewEg(\"intersect\")'>点击查看图例</a>）</p>" +
                "<p>（3）补集：选取两个表的补集字段（字段的数据含义和数据类型必须相同），根据补集字段显示副表（从表）所选取字段中的内容不存在于主表（基表）所选取字段中的内容的数据，输出结果中的字段将以主表（基表）为主（<a onclick='viewEg(\"exclude\")'>点击查看图例</a>）</p>"
            break
        case 'barChart':			// 自定义图形
            html += '根据前置原表或结果表的表数据，可对其进行多维度的图表、图形分析，从而更加直观的了解数据的变化趋势，包括柱状图、饼图、折线图、散点图等'
            break
        case 'sql':						// SQL查询器
            html += '用户可借助SQL查询器自定义编写SQL语句，对数据进行实时查询'
            break
        case 'newNullNode':	// 结果表
            html += '根据前置节点的配置自动生成，展示的数据是根据前置配置节点的条件设置所执行后的过滤数据'
            break
        case 'datasource':	// 原表
            html += '包括数据库中原始表、汉化表、个人数据表'
            break
        case 'relation':				// 数据关联
            html += '<p>1、描述</p>' +
                '<p>（1）根据前置原表或结果表对其进行联查设置，关联方式包括左连接、右连接、内连接、外连接</p>' +
                '<p>（2）本节点支持多张表同时做关联设置（至少两张表）</p>' +
                '<p>2、名称解释</p>' +
                "<p>（1）左连接：选取关联字段将两张表进行关联，左表的所有数据均显示，右表的数据只显示关联字段值相等的数据，若右表关联结果无数据则补空显示（<a onclick='viewEg(\"left_join\")'>点击查看图例</a>）</p>" +
                "<p>（2）右连接：选取关联字段将两张表进行关联，右表的所有数据均显示，左表的数据只显示关联字段值相等的数据，若左表关联结果无数据则补空显示（<a onclick='viewEg(\"right_join\")'>点击查看图例</a>）</p>" +
                "<p>（3）内连接：选取关联字段将两张表进行关联，仅显示两张表中关联字段值相等的数据（<a onclick='viewEg(\"inner_join\")'>点击查看图例</a>）</p>" +
                "<p>（4）外连接：选取关联字段将两张表进行关联，显示出左表和右表关联后的所有数据，但去除重复数据，两表中若无关联数据则补空显示（<a onclick='viewEg(\"join\")'>点击查看图例</a>）</p>"
            break
    }
    $('#detailContainer>.nav-tabs>li:eq(1)>a').click()
    $('#nodeRemark').html(html)
}

// 点击链接预览图片
function viewEg(type) {
    var src = 'page/C_Rows_Data/images/'; var alt = ''
    switch (type) {
        case 'left_join':
            src += 'left_join.jpg'
            alt = '左连接'
            break
        case 'right_join':
            src += 'right_join.jpg'
            alt = '右连接'
            break
        case 'inner_join':
            src += 'inner_join.jpg'
            alt = '内连接'
            break
        case 'join':
            src += 'join.jpg'
            alt = '外连接'
            break
        case 'union':
            src += 'union.png'
            alt = '合并'
            break
        case 'intersect':
            src += 'intersect.png'
            alt = '交集'
            break
        case 'exclude':
            src += 'exclude.jpg'
            alt = '补集'
            break
    }
    layer.photos({
        photos: { 'data': [{ 'src': src, 'alt': alt }] },
        anim: 5
    })
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
                let resourceRootNode = indexVue.resourceRootNode;
                // 更新所有节点信息
                graph.nodeData = JSON.parse(graph.historyNodeInfo[treeNode.id].nodeData)
                // 刷新svg
                mxUtils.setPrettyXmlLayout(graph.historyNodeInfo[treeNode.id].xml)
                // 更新所使用资源树
                indexVue.resourceZtree.removeChildNodes(resourceRootNode)
                resourceRootNode.children = graph.historyNodeInfo[treeNode.id].resourceZtreeNodes
                resourceRootNode.open = true
                indexVue.resourceZtree = $.fn.zTree.init($('#resourceZtree'), resourceSetting, resourceRootNode)
                ownerEditor.resetHistory()
                // 查找当前快照下的graph中节点状态为执行中的节点
                var executingNodeIdArr = []
                var arr = Object.keys(graph.nodeData)
                var graphUuid = $('#graphUuid').val()
                for (var k = 0; k < arr.length; k++) {
                    var nodeExcuteStatus = graph.nodeData[arr[k]].nodeInfo.nodeExcuteStatus
                    if (nodeExcuteStatus === 2) {
                        executingNodeIdArr.push(arr[k])
                    }
                }
                getExecuteNodeInfo(graphUuid, null, executingNodeIdArr, false)
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
    var nodes = indexVue.resourceZtree.getNodesByParam('pid', null, null)
    nodes[0].children.push(resourceNode)
    $.fn.zTree.init($('#resourceZtree'), resourceSetting, nodes[0])
}

// 工作区节点的名称改变联动更新所使用资源树节点的名称
export function updateResourceZtreeNodeName(treeNodeId, name) {
    var nodes = indexVue.resourceZtree.getNodesByParam('id', treeNodeId, null)
    nodes[0].name = name
    nodes[0].displayName = name
    indexVue.resourceZtree.updateNode(nodes[0])
}

// 删除工作区节点时联动删除所使用资源树的对应节点，支持批量删除
export function deleteResourceZtreeNode(treeNodeIdArr) {
    for (var i = 0; i < treeNodeIdArr.length; i++) {
        var nodes = indexVue.resourceZtree.getNodesByParam('id', treeNodeIdArr[i], null)
        indexVue.resourceZtree.hideNode(nodes[0])
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
            if (parentChildren[k].vertex === 1) {
                idArr.push(parentChildren[k].id)
            }
        }
    }
    for (var i = 0; i < idArr.length; i++) {
        var nodes = indexVue.resourceZtree.getNodesByParam('id', idArr[i], null)
        if (nodes.length !== 0) {
            if (nodes[0].isHidden && status) {
                for (var j = 0; j < nodes.length; j++) {
                    indexVue.resourceZtree.showNode(nodes[j])
                }
            }
            if (!nodes[0].isHidden && !status) {
                for (var t = 0; t < nodes.length; t++) {
                    indexVue.resourceZtree.hideNode(nodes[t])
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
            if (parentChildren[k].vertex === 1) {
                idArr.push(parentChildren[k].id)
            }
        }
    }
    for (var i = 0; i < idArr.length; i++) {
        var nodes = indexVue.resourceZtree.getNodesByParam('id', idArr[i], null)
        if (nodes.length !== 0) {
            if (nodes[0].isHidden && !status) {
                for (var j = 0; j < nodes.length; j++) {
                    indexVue.resourceZtree.showNode(nodes[j])
                }
            }
            if (!nodes[0].isHidden && status) {
                for (var t = 0; t < nodes.length; t++) {
                    indexVue.resourceZtree.hideNode(nodes[t])
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
    var nodes = indexVue.historyZtree.getNodesByParam('pid', null, null)
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
    var resourceZtreeNodes = indexVue.resourceZtree.getNodesByParam('pid', 'resourceRoot', null)
    graph.historyNodeInfo[id] = {
        'node': node,
        'xml': xml,										// 图形化XML信息
        'nodeData': JSON.stringify(graph.nodeData),		// 图形化节点信息
        'resourceZtreeNodes': resourceZtreeNodes
    }
}

// 节点右键事件,start
export function showRMenu(menuId, type, x, y, containerId) {
    if (containerId) { // 只有【折叠/展开】右键菜单时计算X坐标
        var w_ = $('#' + containerId).width() - event.clientX
        if (w_ < $('#' + menuId).width()) {
            x = $('#' + containerId).width() - $('#' + menuId).width() - 10
        }
    } else {
        x += document.body.scrollLeft
    }
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
            indexVue.$message({ type: 'info', message: '导入的文件仅支持xml格式' })
        }else{
            let graphType = (graph.openGraphType === 2 || graph.openGraphType === 3) ? 3 : 1
            let formData = new FormData()
            formData.append("file",data.target.files[0])
            formData.append("graphType",graphType)
            var loading = $('body').mLoading({ 'text': '正在导入文件，请稍后……', 'hasCancel': false })
            importGraphXml(formData).then( response => {
                loading.destroy()
                if(response.data){
                    indexVue.$message({ type: 'info', message: '文件导入成功' })
                }else{
                    indexVue.$message({ type: 'info', message: '导入时解析文件出错' })
                }
            })
        }
    }else{
        indexVue.$message({ type: 'info', message: '未选择待上传的文件' })
    }
}

// 导出
export function exportGraph() {
    hideRMenu('moreMenu')
    indexVue.graphListDialogVisible = true
    indexVue.showGraphListType = 'export'
    if (typeof indexVue.$refs.graphListExport !== "undefined") {//非首次加载需刷新列表
        indexVue.$refs.graphListExport.getGraphList();
    }
}

export function exportGraphBack(param) {
    let loading = $('body').mLoading({ 'text': '正在导出图形，请稍后……', 'hasCancel': false })
    let fileName = indexVue.$store.getters.personcode + '_exportGraph_' + new Date().Format('yyyyMMddHHmmssS') + '.xml'
    exportGraphXml({fileName,...param}).then( response => {
        if(response.data){
            progressDownLoad('/graphtool/graphCt/downLoadXml', fileName, {fileName: fileName}, function() {
                loading.destroy()
                indexVue.$message({ type: 'info', message: '图形文件下载成功' })
            }, function() {
                loading.destroy()
                indexVue.$message({ type: 'info', message: '图形文件下载失败' })
            }, function() {})
        }else{
            loading.destroy()
            indexVue.$message({ type: 'info', message: '图形导出失败' })
        }
    })
}

// 前进
export function next() {
    if (graph.canEditor === false) {
        indexVue.$message({ type: 'info', message: '当前图形您没有【恢复】操作的权限' })
        return
    }
    ownerEditor.redo()
}

// 后退
export function back() {
    if (graph.canEditor === false) {
        indexVue.$message({ type: 'info', message: '当前图形您没有【撤销】操作的权限' })
        return
    }
    ownerEditor.undo()
}

// 数据导入
function importData() {
    var catalogId = 'importDataTable'
    layer.open({
        id: 'importData',
        type: 2,
        title: '数据导入',
        content: '/AuditAnalysis/personSpaceDirectory/toImportDataPage?catalogId=' + catalogId,
        area: ['90%', '90%'],
        skin: 'layui-layer-lan',
        btn: ['关闭'],
        cancel: function(index, layero) {
            layer.close()
        }
    })
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
        // 判断模型最终结果表的节点是否执行成功
        if (graph.nodeData[resultTableNodeId].nodeInfo.nodeExcuteStatus !== 3) {
            isError = true
            message = '您标记的最终结果表尚未执行成功'
        }else{
            // 以模型最终结果表节点为最末级节点，向上寻找所有的节点
            let lineNodeIdArr = getPreNodes(resultTableNodeId, [resultTableNodeId])
            for (let i = 0; i < lineNodeIdArr.length; i++) {
                let curNodeInfo = graph.nodeData[lineNodeIdArr[i]].nodeInfo
                if (curNodeInfo.nodeExcuteStatus !== 3) {
                    isError = true
                    message = '节点【' + curNodeInfo.nodeName + '】尚未执行成功'
                    break
                } else {
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
        }
    }
    return {isError,message,middleTableArr,finalTable}
}

// 生成风险查证模型
export function createDegreeModel(type) {
    hideRMenu('moreMenu')
    var loading = $('body').mLoading({ 'text': '正在校验节点信息，请稍后……', 'hasCancel': false })
    // 获取所有操作节点的数组（可用于设置参数的节点）
    var optTypeArr = ['datasource', 'filter', 'sort', 'sample', 'layering', 'groupCount', 'delRepeat', 'change', 'union', 'relation', 'sql']
    var resultTableNodeId = ''// 模型最终结果表的节点ID（仅有一个）
    // 先判断在整个图形中是否存在打了标记的模型最终结果表，默认为未标记（false）
    var hasResultSign = false
    var nodeIdArr = Object.keys(graph.nodeData)
    for (var i = 0; i < nodeIdArr.length; i++) {
        var resultTableStatus = graph.nodeData[nodeIdArr[i]].nodeInfo.resultTableStatus
        if (resultTableStatus === 2) {
            hasResultSign = true
            resultTableNodeId = nodeIdArr[i]
            break
        }
    }
    if (!hasResultSign) {
        loading.destroy()
        alertMsg('提示', '未将结果表标记为模型的最终结果表', 'info')
        return
    }
    // 判断模型最终结果表的节点是否执行成功
    if (graph.nodeData[resultTableNodeId].nodeInfo.nodeExcuteStatus !== 3) {
        loading.destroy()
        alertMsg('提示', '您标记的模型的最终结果表尚未执行成功', 'info')
        return
    }
    // 以模型最终结果表节点为最末级节点，向上寻找所有的节点
    var lineNodeIdArr = getPreNodes(resultTableNodeId, [resultTableNodeId])
    // 检测是否存在未执行成功的节点，默认不存在（即都执行成功，verify = true）
    var ifSuccess = true; var msg = ''
    var nodeObjArr = []; var modelOutputColumn = ''
    for (var i = 0; i < lineNodeIdArr.length; i++) {
        var curNodeInfo = graph.nodeData[lineNodeIdArr[i]].nodeInfo
        if (curNodeInfo.nodeExcuteStatus !== 3) {
            msg = '节点【' + curNodeInfo.nodeName + '】尚未执行成功'
            ifSuccess = false
            break
        } else {
            /**
             * 组织节点对象信息
             * @param nodeId 节点ID
             * @param nodeName 节点名称
             * @param optType 节点类型
             * @param createSql 创建节点临时表/视图的SQL语句
             * @param selectSql 查询节点数据的SQL语句
             * @param isCreateTable 当前节点是否保存数据（是否创建的是表）
             * @type {{nodeId: string, nodeName: string, optType: String, createSql: string, selectSql: string, isCreateTable: boolean}}
             */
            var nodeObj = {
                'nodeId': '',
                'nodeName': '',
                'optType': '',
                'createSql': '',
                'selectSql': '',
                'isCreateTable': false
            }
            // 只拼接原表与结果表的SQL语句
            if (curNodeInfo.optType === 'datasource') { // 原表
                nodeObj.nodeId = curNodeInfo.nodeId
                nodeObj.nodeName = curNodeInfo.nodeName
                nodeObj.optType = curNodeInfo.optType
                nodeObj.selectSql = curNodeInfo.nodeSql
                nodeObj.midTableStatus = curNodeInfo.midTableStatus
                nodeObjArr.push(nodeObj)
            }
            if (curNodeInfo.optType === 'newNullNode') { // 结果表
                // 该前置节点的临时表名称
                var tableName = ''
                // 当前结果表的查询SQL语句
                var curSelectSql = ''
                // 先获取该结果表的前置节点ID集合
                var parentIds = graph.nodeData[lineNodeIdArr[i]].parentIds
                // 该节点的输出列名称
                var selectCol = ''
                // 如果该节点的前置节点ID在当前的节点ID集合批次中（因结果表的前置节点有且只有一个，所以可直接使用parentIds[0]）
                if (parentIds.length > 0 && $.inArray(parentIds[0], lineNodeIdArr) > -1) {
                    // 获取前置节点的输出列信息集合
                    var preColumnsInfo = graph.nodeData[parentIds[0]].columnsInfo
                    // 获取前置节点的节点信息
                    var preNodeInfo = graph.nodeData[parentIds[0]].nodeInfo
                    nodeObj.nodeId = preNodeInfo.nodeId
                    nodeObj.nodeName = preNodeInfo.nodeName
                    nodeObj.optType = preNodeInfo.optType
                    // 判断该前置节点是否保存了数据
                    var isCreateTable = preNodeInfo.isCreateTable
                    if (preNodeInfo.optType === 'layering') { // 如果是前置节点是数据分层节点，则当前结果表的临时表名称需按照下标取值
                        var index = curNodeInfo.index// 获取当前结果表的下标
                        // 获取数据分层节点的结果表数组
                        var resultTableNameArr = preNodeInfo.resultTableNameArr
                        // 若数组不为空
                        if (resultTableNameArr.length > index) {
                            // 设置数据分层节点的当前队列中子节点的结果表名称
                            tableName = strDecryption(resultTableNameArr[index])
                            curSelectSql = preNodeInfo.nodeSqlArr[index]
                        }
                    } else if (preNodeInfo.optType === 'sql') {
                        tableName = strDecryption(preNodeInfo.resultTableName)
                        curSelectSql = strDecryption(preNodeInfo.resultSql)
                    } else { // 其他类型的操作节点都一样，直接取前置节点的临时表名称
                        tableName = strDecryption(preNodeInfo.resultTableName)
                        curSelectSql = preNodeInfo.nodeSql
                    }
                    nodeObj.resultTableName = tableName
                    nodeObj.curSelectSql = curSelectSql
                    if (isCreateTable === 1) { // 如果保存了数据，就取表名称
                        nodeObj.createSql = 'CREATE TABLE ' + tableName + ' AS '
                        nodeObj.isCreateTable = true
                    } else { // isCreateTable == 0，没保存数据，取视图名称
                        nodeObj.createSql = 'CREATE OR REPLACE VIEW ' + tableName + ' AS '
                    }
                    // 循环
                    for (var k = 0; k < preColumnsInfo.length; k++) {
                        // 判断是否为输出列
                        var isOutputColumn = preColumnsInfo[k].isOutputColumn
                        // 获取输出列名称
                        var newColumnName = preColumnsInfo[k].newColumnName
                        if (isOutputColumn === 1) { // 如果是输出列，则拼接输出列的字符串
                            selectCol += newColumnName + ','
                        }
                    }
                    selectCol = selectCol.substring(0, selectCol.length - 1)
                }
                if (curNodeInfo.midTableStatus === 2) { // 如果是被标记为模型的辅助结果表，则需多生成一个SELECT查询语句
                    nodeObj.selectSql = 'SELECT ' + selectCol + ' FROM ' + tableName
                }
                if (curNodeInfo.resultTableStatus === 2) { // 如果是被标记为模型的最终结果表，则说明此节点将作为该模型的最后一个结果表节点
                    nodeObj.selectSql = 'SELECT ' + selectCol + ' FROM ' + tableName
                    nodeObjArr.push(nodeObj)
                    modelOutputColumn = selectCol
                    break
                }
                nodeObjArr.push(nodeObj)
            }
        }
    }
    loading.destroy()
    if (!ifSuccess) {
        alertMsg('提示', msg, 'info')
        return
    }
    // 获取当前图形中的所有线
    var edgeArr = []
    var cells = graph.getModel().cells// 当前图形中的所有节点和线
    var keys = Object.keys(cells)
    for (var j = 0; j < keys.length; j++) {
        if (cells[keys[j]].edge) { // edge == 1为连接线
            edgeArr.push(cells[keys[j]])
        }
    }
    var html = "<div class='col-sm-8' style='height: 505px;overflow-y: auto;margin-left: 16.666%;'><table class='table table-bordered'><thead><tr><th align='center'>节点名称</th><th align='center'>结果表序号</th><th align='center'>操作</th></tr></thead><tbody>"
    // 循环nodeObjArr，这里存放的节点都是可以设置参数的节点，拼接html表格
    for (var i = 0; i < nodeObjArr.length; i++) {
        var nodeId = nodeObjArr[i].nodeId// 节点ID
        var optType = nodeObjArr[i].optType// 节点的类型
        var selectSql = nodeObjArr[i].selectSql// 节点的查询语句
        if ((selectSql === '' && optType !== 'datasource') || (optType === 'datasource' && nodeObjArr[i].midTableStatus !== 2)) { // 如果当前节点的查询语句为空，则说明当前节点不能设置参数，跳过
            continue
        }
        var nodeName = nodeObjArr[i].nodeName// 节点名称
        var paramsSetting = $.extend(true, {}, nodeParamRelArr[nodeId])// 参数配置信息
        var lineNum = 0// 节点生成的序号，默认为0
        for (var k = 0; k < edgeArr.length; k++) {
            if (edgeArr[k].source && edgeArr[k].source.id === nodeId) {
                lineNum = edgeArr[k].value
                break
            }
        }
        html += "<tr class='paramSetTr' nodeId='" + nodeId + "'><td align='center'>" + nodeName + "</td><td align='center'>" + lineNum + "</td><td align='center'>"
        if (paramsSetting && paramsSetting.arr && paramsSetting.arr.length > 0) {
            html += "<button type='button' class='paramSetting btn btn-primary' onclick='settingParam(this,\"" + nodeId + "\")'>修改参数</button>" +
                "<button type='button' id='clearBtn' class='btn btn-primary' style='margin-left: 10px;' onclick='clearSettingParam(this,\"" + nodeId + "\")'>清除参数</button>"
        } else {
            html += "<button type='button' class='paramSetting btn btn-primary' onclick='settingParam(this,\"" + nodeId + "\")'>设置参数</button>"
        }
        html += '</td></tr>'
    }
    html += '</tbody></table></div>'
    var strMsg = ''
    if (type === 'saveGraph') {
        strMsg = '生成'
        if (openGraphType === '4') {
            strMsg = '保存'
        }
    } else {
        strMsg = '另存为'
    }
    layer.open({
        type: 1,
        title: strMsg + '风险查证模型—模型节点参数设置',
        id: 'screenQueryParamSetting',
        area: ['1000px', '600px'],
        btn: ['确定', '取消'],
        skin: 'layui-layer-lan',
        content: html,
        btn1: function(index, layero) {
            var newGraph = $.extend(true, {}, graph.nodeData)
            var modelSql = ''// 组织模型SQL语句
            var dropSql = ''// 模型SQL的删除临时表语句
            var modelParamIdArr = []// 模型中用到的参数ID数组
            var paramArr = []
            for (var k = 0; k < nodeObjArr.length; k++) {
                var nodeId = nodeObjArr[k].nodeId
                var nodeName = nodeObjArr[k].nodeName
                var optType = nodeObjArr[k].optType
                var typeTitle = ''; var curDropSql = ''
                if (nodeObjArr[k].isCreateTable) {
                    typeTitle = '表'
                    curDropSql = 'DROP TABLE ' + nodeObjArr[k].resultTableName
                } else {
                    typeTitle = '视图'
                    curDropSql = 'DROP VIEW ' + nodeObjArr[k].resultTableName
                }
                if ($.inArray(optType, optTypeArr) > -1) { // 更改操作节点的部分信息
                    var processNum = 0; var paramSetTr = $('.paramSetTr')
                    // 匹配设置参数的节点，将参数设置绑定到newGraph中
                    paramSetTr.each(function() {
                        // 获取在数据行上绑定的节点ID
                        var trNodeId = $(this).attr('nodeId')
                        // 进行节点的匹配
                        if (trNodeId === nodeId) {
                            newGraph[nodeId].nodeInfo.dataSourceType = graph.openType// 给当前节点绑定节点的执行数据源环境
                            // 获取节点的参数配置信息
                            var paramsSetting = $.extend(true, {}, nodeParamRelArr[nodeId])
                            var paramSql = ''; var arr = []
                            if (optType === 'datasource' && nodeObjArr[k].midTableStatus === 2) { // 如果当前节点是原表
                                if (typeof paramsSetting !== 'undefined' && Object.keys(paramsSetting).length > 0) { // 如果参数设置不为空
                                    // 开始组织当前节点的模型语句
                                    paramSql = paramsSetting.sql// 参数部分的SQL语句（where条件部分）
                                    arr = paramsSetting.arr// 当前节点上绑定的参数数组信息
                                    nodeObjArr[k].selectSql += ' WHERE ' + paramSql
                                    for (var t = 0; t < arr.length; t++) {
                                        modelParamIdArr.push(arr[t].copyParamId)
                                        paramArr.push($.extend(true, {}, arr[t]))// 此处深层扩展赋值，是为了当改变paramArr中得值时不影响paramsSetting得值
                                    }
                                    // 绑定参数设置状态和值
                                    newGraph[nodeId].hasParam = true
                                    newGraph[nodeId].paramsSetting = paramsSetting
                                    newGraph[nodeId].nodeInfo.nodeSort = $(this).find('td:eq(1)').html()
                                }
                                modelSql += '/*原表【' + nodeName + '】的查询SQL语句*/\n' + nodeObjArr[k].selectSql + '\n'
                            } else {
                                if (typeof paramsSetting !== 'undefined' && Object.keys(paramsSetting).length > 0) { // 如果参数设置不为空
                                    // 开始组织当前节点的模型语句
                                    paramSql = paramsSetting.sql// 参数部分的SQL语句（where条件部分）
                                    arr = paramsSetting.arr// 当前节点上绑定的参数数组信息
                                    // nodeObjArr[k].selectSql += " WHERE " +  paramSql;
                                    for (var t = 0; t < arr.length; t++) {
                                        modelParamIdArr.push(arr[t].copyParamId)
                                        paramArr.push($.extend(true, {}, arr[t]))// 此处深层扩展赋值，是为了当改变paramArr中得值时不影响paramsSetting得值
                                    }
                                    // 绑定参数设置状态和值
                                    newGraph[nodeId].hasParam = true
                                    newGraph[nodeId].paramsSetting = paramsSetting
                                    newGraph[nodeId].nodeInfo.nodeSort = $(this).find('td:eq(1)').html()
                                    nodeObjArr[k].curSelectSql = 'SELECT * FROM (' + nodeObjArr[k].curSelectSql + ') WHERE ' + paramSql
                                }
                                // 先组建建表/视图的SQL语句
                                modelSql += '/*节点【' + nodeName + '】的结果表的创建' + typeTitle + '的SQL语句*/\n' + nodeObjArr[k].createSql + nodeObjArr[k].curSelectSql + '\n'
                                modelSql += '/*节点【' + nodeName + '】的结果表的查询SQL语句*/\n' + nodeObjArr[k].selectSql + '\n'
                                dropSql += '/*节点【' + nodeName + '】的结果表的删除' + typeTitle + '的SQL语句*/\n' + curDropSql + '\n'
                            }
                        } else {
                            processNum++
                        }
                    })
                    if (processNum === paramSetTr.length) { // 当前节点是过程节点
                        if (optType !== 'datasource') {
                            modelSql += '/*节点【' + nodeName + '】的结果表的创建' + typeTitle + '的SQL语句*/\n' + nodeObjArr[k].createSql + nodeObjArr[k].curSelectSql + '\n'
                            dropSql += '/*节点【' + nodeName + '】的结果表的删除' + typeTitle + '的SQL语句*/\n' + curDropSql + '\n'
                        }
                    }
                }
            }
            layer.close(index)
            var createType = 'edit'
            var graphUuid = $('#graphUuid').val()
            if (type === 'saveGraph') { // 保存操作
                if (openGraphType !== '4') { // 如果当前图形不是模型图形即生成风险查证模型操作，则重置图形ID
                    graphUuid = new UUIDGenerator().id
                    createType = 'add'
                }
            } else { // type=="saveAsGraph"，另存为操作
                graphUuid = new UUIDGenerator().id
                createType = 'add'
            }
            // 当打开的图形是模型图形时，在执行保存和另存为操作时，都需要重新生成每个节点中参数的ID
            // 需重新生成的对象包括：modelSql、modelParamIdArr、paramArr、newGraph
            if (openGraphType === '4') {
                for (var n = 0; n < modelParamIdArr.length; n++) {
                    var curCopyParamId = modelParamIdArr[n]// 原参数ID
                    var newCopyParamId = new UUIDGenerator().id// 新生成的参数ID
                    // 开始替换ID
                    modelSql = modelSql.replace(curCopyParamId, newCopyParamId)// 替换modelSql中的参数ID
                    modelParamIdArr.splice(n, 1, newCopyParamId)// 替换modelParamIdArr中的参数ID
                    for (var m = 0; m < paramArr.length; m++) {
                        if (curCopyParamId === paramArr[m].copyParamId) {
                            paramArr[m].copyParamId = newCopyParamId// 替换paramArr中的参数ID
                            paramArr[m].id = paramArr[m].id.replace(curCopyParamId, newCopyParamId)
                            break
                        }
                    }
                    var keys = Object.keys(newGraph)
                    if (keys && keys.length > 0) {
                        for (var c = 0; c < keys.length; c++) { // 替换newGraph中各个节点的参数ID
                            if (typeof newGraph[keys[c]].paramsSetting !== 'undefined') {
                                var curArr = newGraph[keys[c]].paramsSetting.arr
                                var curSql = newGraph[keys[c]].paramsSetting.sql
                                newGraph[keys[c]].paramsSetting.sql = curSql.replace(curCopyParamId, newCopyParamId)
                                if (typeof curArr !== 'undefined' && curArr.length > 0) {
                                    for (var a = 0; a < curArr.length; a++) {
                                        if (curCopyParamId === curArr[a].copyParamId) {
                                            curArr[a].copyParamId = newCopyParamId
                                            curArr[a].id = curArr[a].id.replace(curCopyParamId, newCopyParamId)
                                            break
                                        }
                                    }
                                }
                            }
                        }
                    }
                    // 替换ID结束
                }
            }
            modelSql += dropSql// 放在此处最优
            pubDialog({
                id: 'createDegreeMode',
                title: strMsg + '风险查证模型—模型基本信息设置',
                params: { 'modelId': curModelId, 'sql': strEncryption(modelSql), 'paramIds': modelParamIdArr.join(','), 'graphUuid': graphUuid, 'paramArr': JSON.stringify(paramArr), 'columns': modelOutputColumn },
                url: contextPathAuditAnalysis + '/mlcRiskModelJumpPage/toModelDemandAddPageTuXingHua',
                funs: {
                    refresh: function(res) {
                        if (typeof res !== 'undefined' && res != null) { // 说明模型保存成功，可以继续保存图形
                            // 获取图形xml数据
                            var encoder = new mxCodec()
                            var node = encoder.encode(graph.getModel())
                            var xml = mxUtils.getPrettyXml(node)
                            var description = '风险查证模型所关联的图形，模型名称为【' + res.modelName + '】'
                            // 组织请求的json数据
                            var param = {
                                'graphUuid': graphUuid,
                                'createType': openType,
                                'executeStatus': getExecuteDetail(),
                                'graphName': res.modelName,
                                'description': description,
                                'graphXml': xml,
                                'nodeData': JSON.stringify(newGraph), // 各个节点的配置信息
                                'modelSql': modelSql,
                                'type': createType
                            }
                            $.ajax({
                                url: contextPath + '/graphEditor/saveModelGraph',
                                type: 'post',
                                dataType: 'json',
                                data: param,
                                success: function(e) {
                                    if (e.isError) {
                                        alertMsg('提示', strMsg + '风险查证模型的图形失败，模型保存失败', 'info')
                                        $.post(contextPathAuditAnalysis + '/mlcRiskModelMan/deleteModel', { 'ids': [res.modelId] }, function() {}, 'json')
                                    } else {
                                        alertMsg('提示', strMsg + '风险查证模型草稿成功，请前往风险查证模型列表进行处理', 'success')
                                        if (type === 'saveGraph' && openGraphType === '4') { // 保存完需刷新页面
                                            var obj = {
                                                'graphUuid': graphUuid,
                                                'graphName': res.modelName,
                                                'description': description,
                                                'nodeData': param.nodeData,
                                                'graphXml': xml,
                                                'modelSql': modelSql
                                            }
                                            openCallBack(obj)
                                        }
                                    }
                                },
                                error: function() {
                                    alertMsg('错误', strMsg + '模型图形的请求失败，风险查证模型保存失败', 'error')
                                    $.post(contextPathAuditAnalysis + '/mlcRiskModelMan/deleteModel', { 'ids': [res.modelId] }, function() {}, 'json')
                                }
                            })
                        } else {
                            alertMsg('提示', strMsg + '风险查证模型失败', 'info')
                        }
                    }
                },
                width: '800px',
                height: '610px'
            })
        },
        btn2: function(index, layero) {
            layer.close(index)
        },
        end: function() {
            if (openGraphType === '1') { // 如果打开的当前图形是个人图形，则设置完参数后清除节点参数信息
                nodeParamRelArr = []
            }
        }
    })
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

// 生成场景查询
export function createScreenQuery(type) {
    // 获取所有操作节点的数组（可用于设置参数的节点）,后台【保存】和【生成场景查询】方法也有用到此数组，修改时请同时修改
    var optTypeArr = ['filter', 'sort', 'sample', 'layering', 'groupCount', 'delRepeat', 'change', 'union', 'relation', 'sql']
    // 先获取所有执行成功的结果表节点ID数组
    var resultTableNodeIdArr = []
    var nodeIdArr = Object.keys(graph.nodeData)
    for (var i = 0; i < nodeIdArr.length; i++) {
        // 当前节点执行状态
        var nodeExcuteStatus = graph.nodeData[nodeIdArr[i]].nodeInfo.nodeExcuteStatus
        // 当前节点的类型
        var optType = graph.nodeData[nodeIdArr[i]].nodeInfo.optType
        if (nodeExcuteStatus === 3 && $.inArray(optType, optTypeArr) > -1) { // 如果执行成功，将当前节点加入到数组中
            resultTableNodeIdArr.push(nodeIdArr[i])
        }
    }
    if (resultTableNodeIdArr.length === 0) {
        alertMsg('提示', '该图形中不存在已设置成功的操作节点', 'info')
        return
    }
    if (type === 'saveGraph' && (openGraphType === '2' || openGraphType === '3')) {
        // 对节点进行排序（使用直接排序算法）
        resultTableNodeIdArr = sortNodeByVal(resultTableNodeIdArr)
    }
    // 弹框显示节点的参数配置列表，start
    // 获取当前图形中的所有线
    var edgeArr = []
    var cells = graph.getModel().cells// 当前图形中的所有节点和线
    var keys = Object.keys(cells)
    for (var j = 0; j < keys.length; j++) {
        if (cells[keys[j]].edge) { // edge == 1为连接线
            edgeArr.push(cells[keys[j]])
        }
    }
    // 拼接html元素
    var fromHtml = $('#saveGraph').html()
    var graphName = $('#graphName').val()
    var description = $('#description').val()
    var html = "<div class='col-sm-5'>" + fromHtml + '</div>'
    html += "<div class='col-sm-7' style='overflow-y: auto;'><div  class='col-sm-12'><span style='color: red;'>注：可上下拖动行改变节点的显示顺序</span></div><div class='col-sm-12' style='height: 505px;'>" +
        "<table class='table table-bordered'><thead><tr><th align='center'>节点名称</th><th align='center'>结果表序号</th><th align='center'>操作</th></tr></thead><tbody>"
    for (var i = 0; i < resultTableNodeIdArr.length; i++) {
        var nodeName = graph.nodeData[resultTableNodeIdArr[i]].nodeInfo.nodeName// 节点名称
        var paramsSetting = $.extend(true, {}, nodeParamRelArr[resultTableNodeIdArr[i]])// 参数配置信息
        var lineNum = 0// 节点生成的序号，默认为0
        for (var k = 0; k < edgeArr.length; k++) {
            if (edgeArr[k].source && edgeArr[k].source.id === resultTableNodeIdArr[i]) {
                lineNum = edgeArr[k].value
                break
            }
        }
        html += "<tr class='paramSetTr' nodeId='" + resultTableNodeIdArr[i] + "'><td align='center'>" + nodeName + "</td><td align='center'>" + lineNum + "</td><td align='center'>"
        if (paramsSetting && paramsSetting.arr && paramsSetting.arr.length > 0) {
            html += "<button type='button' class='paramSetting btn btn-primary' onclick='settingParam(this,\"" + resultTableNodeIdArr[i] + "\")'>修改参数</button>" +
                "<button type='button' id='clearBtn' class='btn btn-primary' style='margin-left: 10px;' onclick='clearSettingParam(this,\"" + resultTableNodeIdArr[i] + "\")'>清除参数</button>"
        } else {
            html += "<button type='button' class='paramSetting btn btn-primary' onclick='settingParam(this,\"" + resultTableNodeIdArr[i] + "\")'>设置参数</button>"
        }
        html += '</td></tr>'
    }
    html += '</tbody></table></div></div>'
    layer.open({
        type: 1,
        title: (type === 'saveGraph' ? '生成' : '另存为') + '场景查询—节点参数设置',
        id: 'screenQueryParamSetting',
        area: ['1000px', '600px'],
        btn: ['确定', '取消'],
        skin: 'layui-layer-lan',
        content: html,
        success: function(layero) {
            if (openGraphType === '2' || openGraphType === '3') { // 如果打开的是场景查询图形（即编辑），则反显名称和描述
                $(layero).find('#graphName').val(graphName)
                $(layero).find('#description').val(description)
            }
            $(layero).find('.table>tbody').sortable().disableSelection()
        },
        btn1: function(index, layero) {
            var graphUuid = $(layero).find('#graphUuid').val()
            graphName = $(layero).find('#graphName').val()
            if (graphName === '') {
                alertMsg('提示', '请输入场景查询的名称', 'info')
                return
            }
            description = $(layero).find('#description').val()
            var newGraphStr = JSON.stringify(graph.nodeData)
            var newGraph = JSON.parse(newGraphStr)// 只能以这种当时解决两个变量指向同一个地址的问题，这样可以做到修改newGraph的值不影响graph的值
            // 循环遍历修改nodeData的部分属性值
            var keyArr = Object.keys(newGraph)
            for (var k = 0; k < keyArr.length; k++) {
                var nodeId = keyArr[k]
                var optType = newGraph[nodeId].nodeInfo.optType
                if ($.inArray(optType, optTypeArr) > -1) { // 更改操作节点的部分信息
                    // 匹配设置参数的节点，将参数设置绑定到newGraph中
                    $('.paramSetTr').each(function() {
                        // 获取在数据行上绑定的节点ID
                        var trNodeId = $(this).attr('nodeId')
                        // 进行节点的匹配
                        if (trNodeId === nodeId) {
                            newGraph[nodeId].nodeInfo.dataSourceType = graph.openType// 给当前节点绑定节点的执行数据源环境
                            // 获取节点的参数配置信息
                            var paramsSetting = $.extend(true, {}, nodeParamRelArr[nodeId])
                            if (typeof paramsSetting !== 'undefined' && Object.keys(paramsSetting).length > 0) { // 如果参数设置不为空
                                // 绑定参数设置状态和值
                                newGraph[nodeId].hasParam = true
                                newGraph[nodeId].paramsSetting = paramsSetting
                                return false
                            }
                        }
                    })
                }
            }
            // 保存场景查询
            // 获取图形xml数据
            var encoder = new mxCodec()
            var node = encoder.encode(graph.getModel())
            var xml = mxUtils.getPrettyXml(node)
            // 则绑定节点的排序值
            $(layero).find('.paramSetTr').each(function(i, v) {
                var nodeId = $(this).attr('nodeId')
                newGraph[nodeId].nodeInfo.nodeSort = i
            })
            // 组织请求的json数据
            var param = {
                'createType': openType,
                'graphName': graphName,
                'description': description,
                'graphXml': xml,
                'nodeData': JSON.stringify(newGraph) // 各个节点的配置信息
            }
            if (type === 'saveGraph') { // 保存
                if (graphUuid !== '') { // 如果图形ID不为空，即在修改图形过程中执行保存场景查询的操作
                    // 如果当前打开的图形是场景查询图形，则图形ID不变，否则后台重新分配图形ID
                    switch (openGraphType) {
                        case '1':// 普通图形
                            param.executeStatus = getExecuteDetail()
                            break
                        case '2':// 个人场景查询图形
                            param.graphUuid = graphUuid
                            param.executeStatus = getExecuteDetail()
                            break
                        case '3':// 公共场景查询图形
                            param.graphUuid = graphUuid
                            param.publicType = '1'
                            param.executeStatus = 3// 未执行
                            break
                    }
                }
            } else { // type=="saveAsGraph"，另存为
                switch (openGraphType) { // 此处不会有出现个人图形的情况
                    case '2':// 个人场景查询图形
                        param.executeStatus = getExecuteDetail()
                        break
                    case '3':// 公共场景查询图形
                        param.publicType = '1'
                        param.executeStatus = '3'// 未执行
                        break
                }
            }
            $.ajax({
                url: contextPath + '/graphEditor/createScreenQuery',
                type: 'post',
                dataType: 'json',
                data: param,
                success: function(e) {
                    alertMsg('提示', e.message, 'info')
                    if (!e.isError) {
                        layer.close(index)
                        if (type === 'saveGraph' && (openGraphType === '2' || openGraphType === '3')) { // 保存完需刷新页面
                            var obj = {
                                'graphUuid': graphUuid,
                                'graphName': graphName,
                                'description': description,
                                'nodeData': param.nodeData,
                                'graphXml': xml
                            }
                            openCallBack(obj)
                        }
                    }
                },
                error: function() {
                    alertMsg('错误', '生成场景查询的请求失败', 'error')
                }
            })
        },
        btn2: function(index, layero) {
            layer.close(index)
        },
        end: function() {
            if (openGraphType === '1') { // 如果打开的当前图形是个人图形，则设置完参数后清除节点参数信息
                nodeParamRelArr = []
            }
        }
    })
    // 弹框显示节点的参数配置列表，end
}

/**
 * 给节点设置参数（或修改参数）
 * @param obj 当前按钮的对象
 * @param nodeId 节点ID
 */
function settingParam(obj, nodeId) {
    // 先获取当前节点的参数配置信息
    var paramsSetting = typeof nodeParamRelArr[nodeId] === 'undefined' ? {} : nodeParamRelArr[nodeId]// 先获取实时设置的参数信息
    window.sessionStorage.setItem('paramsSetting', JSON.stringify(paramsSetting))
    layer.open({
        id: 'settingParam',
        type: 2,
        title: '设置参数',
        content: 'page/settingParams/settingParams.jsp?nodeId=' + nodeId,
        area: ['90%', '90%'],
        skin: 'layui-layer-lan',
        resize: false,
        scrollbar: false,
        btn: ['确定', '取消'],
        btn1: function(index, layero) {
            // 获取操作提示
            var msg = $(layero).find('iframe')[0].contentWindow.settingParams.getOptMessage()
            confirmMsg('提示', msg, 'info', function() {
                // 获取弹出层的参数配置
                var returnObj = $(layero).find('iframe')[0].contentWindow.settingParams.getParamsSetting()
                if (!returnObj.verify) {
                    alertMsg('提示', returnObj.message, 'info')
                } else {
                    var arr = returnObj.paramsSetting.arr// 获取设置参数的数组
                    if (arr.length === 0) {
                        $(obj).html('设置参数')
                        $(obj).next().remove()// 移除后一个兄弟节点（清除参数按钮）
                        var nodeName = graph.nodeData[nodeId].nodeInfo.nodeName
                        alertMsg('提示', '节点【' + nodeName + '】因暂未进行任何参数的设置，故不对其他信息进行保存', 'info')
                        delete nodeParamRelArr[nodeId]
                    } else {
                        $(obj).html('修改参数')
                        if (!$(obj).parent().find('#clearBtn')[0]) {
                            $(obj).after("<button type='button' id='clearBtn' class='btn btn-primary' style='margin-left: 10px;' onclick='clearSettingParam(this,\"" + nodeId + "\")'>清除参数</button>")
                        }
                        // 绑定节点的参数配置信息
                        nodeParamRelArr[nodeId] = $.extend(true, {}, returnObj.paramsSetting)
                    }
                    layer.close(index)
                }
            }, function() {})
        },
        btn2: function(index, layero) {
            layer.close(index)
        }
    })
}

/**
 * 清除对节点设置的参数信息
 * @param obj 当前按钮的对象
 * @param nodeId 节点ID
 */
function clearSettingParam(obj, nodeId) {
    confirmMsg('提示', '确定清除当前节点已设置的参数吗？', 'info', function() {
        var preObj = $(obj).prev()// 前一个兄弟节点（修改参数按钮）
        preObj.html('设置参数')
        delete nodeParamRelArr[nodeId]// 清除绑定的节点参数配置信息
        $(obj).remove()// 移除清除参数按钮
        // 同时清除节点数据中已绑定的参数信息
        if (graph.nodeData[nodeId] && graph.nodeData[nodeId].hasParam) {
            delete graph.nodeData[nodeId].hasParam
            delete graph.nodeData[nodeId].paramsSetting
            delete graph.nodeData[nodeId].nodeInfo.nodeSort
            delete graph.nodeData[nodeId].replaceParamSql
        }
    }, function() {})
}

/**
 * 左侧资源树的搜素
 */
export function searchZtree() {
    var searchText = $.trim(indexVue.searchZtreeContent)
    if (searchText === '') {
        if (isSearchExpand) {
            showNodes()
            indexVue.zTreeObj.expandAll(false)
            isSearchExpand = false
        }
    } else {
        if (isSearchExpand) {
            showNodes()
        }
        isSearchExpand = true
        isHiddenNodes(false, searchText)
        var nodeList = indexVue.zTreeObj.getNodesByFilter(getFilter)
        if (nodeList && nodeList.length > 0) {
            expandNodes(nodeList)
            updateNodes(nodeList, true)
            hiddenNodes(nodeList, searchText)
        } else {
            var nodeArr = getAllNodes()
            for (var i = 0; i < nodeArr.length; i++) {
                if (nodeArr[i].id !== 'bussRootNode' && nodeArr[i].id !== 'bussDataRoot' && nodeArr[i].id !== 'my_space') {
                    indexVue.zTreeObj.hideNode(nodeArr[i])
                }
            }
        }
    }
}

function getFilter(node) {
    var searchText = $.trim(indexVue.searchZtreeContent)
    return (node.name.indexOf(searchText) > -1 || node.name.indexOf(searchText.toUpperCase()) > -1 || node.name.indexOf(searchText.toLowerCase()) > -1)
}

function expandNodes(nodes) {
    for (var i = 0, l = nodes.length; i < l; i++) {
        var pNode = nodes[i].getParentNode()
        if (pNode) {
            indexVue.zTreeObj.expandNode(pNode, true, false, false)
        }
    }
}

function updateNodes(nodeList, highlight) {
    for (var i = 0; i < nodeList.length; i++) {
        nodeList[i].highlight = highlight
        indexVue.zTreeObj.updateNode(nodeList[i])
    }
}

function hiddenNodes(nodeList, searchText) {
    isHiddenNodes(true, searchText)
    for (var i = 0; i < nodeList.length; i++) {
        nodeList[i].isHidden = false
        indexVue.zTreeObj.updateNode(nodeList[i])
        var pNode = nodeList[i].getParentNode()
        if (pNode && pNode.isHidden) {
            pNode.isHidden = false
            pNode.open = true
            indexVue.zTreeObj.updateNode(pNode)
        }
    }
}

function showNodes() {
    var nodeArr = getAllNodes()
    for (var k = 0; k < nodeArr.length; k++) {
        if (nodeArr[k].isHidden) {
            nodeArr[k].isHidden = false
            indexVue.zTreeObj.updateNode(nodeArr[k])
        }
        indexVue.zTreeObj.showNode(nodeArr[k])
    }
}

function getAllNodes() {
    var nodeArr = []
    var nodes = indexVue.zTreeObj.getNodes()
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
    var allNodeList = indexVue.zTreeObj.transformToArray(indexVue.zTreeObj.getNodes())
    if (flag) {
        for (var i = 0; i < allNodeList.length; i++) {
            if (allNodeList[i].pid != null && indexVue.zTreeObj.getNodesByFilter(getFilter, false, allNodeList[i]).length === 0 &&
                (allNodeList[i].name.indexOf(searchText) < 0 && allNodeList[i].name.indexOf(searchText.toUpperCase()) < 0 && allNodeList[i].name.indexOf(searchText.toLowerCase()) < 0)) {		// 过滤掉最根节点
                indexVue.zTreeObj.hideNode(allNodeList[i])
            }
        }
    } else {
        for (var i = 0; i < allNodeList.length; i++) {
            if (allNodeList[i].isHidden === true) {
                allNodeList[i].isHidden = false
                indexVue.zTreeObj.updateNode(allNodeList[i])
            }
        }
    }
}

/**
 * 折叠/展开菜单事件
 */
export function hideAndShow() {
    var y = $('#geToolbarContainer').height()
    var event = event || window.event
    showRMenu('H_S_Menu', 'node', event.clientX, y, 'geToolbarContainer')
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

/**
 * 增加水印
 */
export function addWaterMark(containerId) {
    // 增加水印
    var loginUserId = $('#loginUserId').val()
    var nowTime = getNowTime()
    var setting = { 'watermark_txt': loginUserId + ' ' + nowTime }
    if (containerId && containerId !== '') {
        setting.containerId = containerId
        $('#' + containerId + ' .mask_div').remove()
    } else {
        $('.mask_div').remove()
    }
    watermark(setting)
}

// 修改参数设置
export function modifyParam() {
    var nodeId = graph.curCell.id
    var paramsSetting = nodeParamRelArr[nodeId] ? nodeParamRelArr[nodeId] : {}// 先获取节点的参数信息
    window.sessionStorage.setItem('paramsSetting', JSON.stringify(paramsSetting))
    layer.open({
        id: 'modifyParam',
        type: 2,
        title: '修改参数',
        content: 'page/settingParams/settingParams.jsp?nodeId=' + nodeId,
        area: ['90%', '90%'],
        skin: 'layui-layer-lan',
        resize: false,
        scrollbar: false,
        btn: ['确定', '取消'],
        btn1: function(index, layero) {
            // 获取操作提示
            var msg = $(layero).find('iframe')[0].contentWindow.settingParams.getOptMessage()
            confirmMsg('提示', msg, 'info', function() {
                // 获取弹出层的参数配置
                var returnObj = $(layero).find('iframe')[0].contentWindow.settingParams.getParamsSetting()
                if (!returnObj.verify) {
                    alertMsg('提示', returnObj.message, 'info')
                } else {
                    graph.nodeData[nodeId].paramsSetting = $.extend(true, {}, returnObj.paramsSetting)
                    nodeParamRelArr[nodeId] = $.extend(true, {}, returnObj.paramsSetting)
                    layer.close(index)
                    autoSaveGraph()
                }
            }, function() {})
        },
        btn2: function(index, layero) {
            layer.close(index)
        }
    })
}
