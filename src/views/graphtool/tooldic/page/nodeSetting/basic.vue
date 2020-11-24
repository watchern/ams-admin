<template>
    <div>
        <form class="form-horizontal" style="background-color:rgba(0,0,0,0) !important;">
            <div class="col-sm-12">
                <div class="control-label col-sm-2 label1">节点名称</div>
                <div class="form-element col-sm-3">
                    <input id="node_name" type="text" name="node_name" class="form-control sea_text">
                </div>
                <div class="form-element col-sm-1">
                    <span style="color: red;font-weight:bold;font-size: 20px;">*</span>
                </div>
                <div class="control-label col-sm-2 label1">执行状态</div>
                <div class="form-element col-sm-3">
                    <input id="nodeExcuteStatus_hid" type="text" style="display: none" name="nodeExcuteStatus_hid" class="form-control sea_text">
                    <input id="nodeExcuteStatus" type="text" readonly="readonly" name="nodeExcuteStatus" class="form-control sea_text">
                </div>
            </div>
            <div class="col-sm-12">
                <div class="control-label col-sm-2 label1">
                    是否保存数据
                </div>
                <div class="control-label col-sm-4 label1" style="text-align: left !important;">
                    <input id="isSaveData" type="checkbox" class="form-control" @click="saveData" style="width: 20px;height: 20px;display: inline;">
                    <span class="dataTableNameDiv" style="color: red;position: absolute;">【结果表显示名称：当前登录人名称_输入的结果表名称XXX_当前时间】</span>
                </div>
                <div class="control-label col-sm-2 dataTableNameDiv label1">
                    结果表名称
                </div>
                <div class="form-element col-sm-3 dataTableNameDiv">
                    <input id="dataTableName" type="text" class="form-control">
                </div>
                <div class="form-element col-sm-1 dataTableNameDiv">
                    <span style="color: red;font-weight:bold;font-size: 20px;">*</span>
                </div>
            </div>
            <div class="col-sm-12">
                <div class="control-label col-sm-2 label1">备注</div>
                <div class="form-element col-sm-9">
                    <textarea id="nodeDescription" name="nodeDescription" class="form-control" autocomplete="off" placeholder="请输入" rows="3" />
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    var nodeData, nodeInfo
    export default {
        name: 'BasicSetting',
        // data(){
        //     return{
        //         node_name: '', // 节点名称
        //         nodeExcuteStatus: '', // 节点执行状态：1未执行2执行中3已执行4执行失败
        //         isCreateTable: 0, // 是否保存数据
        //         nodeDescription: '', // 节点描述
        //     }
        // },
        mounted() {
            this.init()
            window.basicInfoVerify = this.basicInfoVerify
        },
        methods: {
            init() {
                /**
                 * 获取前置节点输出列信息
                 * 前提是前置节点一定存在
                 * 获得上移节点字段列已经选择的信息字段
                 */
                let graph = this.$parent.graph
                nodeData = graph.nodeData[graph.curCell.id]
                nodeInfo = nodeData.nodeInfo
                let columnsInfoPre = this.$parent.columnsInfoPre
                var parentIds = nodeData.parentIds
                if (parentIds.length > 0) {
                    for (let i = 0; i < parentIds.length; i++) {
                        var parent_node = graph.nodeData[parentIds[i]] // one parent
                        var resourceTableName = '"' + parent_node.nodeInfo.nodeName + '"'
                        if (parent_node && parent_node.nodeInfo.optType === 'newNullNode' && !parent_node.isSet) {		// 如果前置节点为结果表且该结果表未配置
                            var pre_parentIds = parent_node.parentIds
                            if (pre_parentIds && pre_parentIds.length > 0) {
                                parent_node = graph.nodeData[pre_parentIds[0]]
                                resourceTableName = '"' + parent_node.nodeInfo.nodeName + '"_' + resourceTableName
                            }
                        }
                        var filter_columnsInfoPre = JSON.parse(JSON.stringify(parent_node.columnsInfo))// 这时上级节点一定是已经配置完成
                        for (let j = 0; j < filter_columnsInfoPre.length; j++) {
                            if (filter_columnsInfoPre[j].isOutputColumn) {
                                filter_columnsInfoPre[j].rtn = resourceTableName
                                filter_columnsInfoPre[j].nodeId = parent_node.nodeInfo.nodeId
                                filter_columnsInfoPre[j].nullNodeId = parentIds[i]
                                columnsInfoPre.push(filter_columnsInfoPre[j])
                            }
                        }
                    }
                }
                this.init_basic()
            },
            saveData() {
                if ($('#isSaveData').is(':checked')) {
                    $('.dataTableNameDiv').css("visibility","visible")
                    var dataTableName = $('#dataTableName').val()
                    if (dataTableName === '') {
                        $('#dataTableName').val(nodeInfo.nodeName + '结果表')
                    }
                } else {
                    $('.dataTableNameDiv').css("visibility","hidden")
                    $('#isSaveDataTitle').hide()
                }
            },
            init_basic: function() {
                $('#node_name').val(nodeInfo.nodeName)
                $('.dataTableNameDiv').css("visibility","hidden")
                if (nodeInfo.isCreateTable && nodeInfo.isCreateTable === 1) {
                    $('#isSaveData').attr('checked', 'checked')
                    $('#dataTableName').val(nodeInfo.userTableName)
                    $('.dataTableNameDiv').css("visibility","visible")
                } else {
                    $('#isCreateTable').icheck('unchecked')
                }
                $('#nodeExcuteStatus').val(this.conversion(nodeInfo.nodeExcuteStatus)).css('readonly', 'readonly')
                $('#nodeDescription').text(typeof nodeInfo.nodeDescription === 'undefined' ? '' : nodeInfo.nodeDescription)
            },
            save_base: function() {
                if ($('#isSaveData').is(':checked')) {
                    nodeInfo.isCreateTable = 1
                    nodeInfo.userTableName = $('#dataTableName').val()
                } else {
                    nodeInfo.isCreateTable = 0
                }
                nodeInfo.nodeName = $('#node_name').val()
                nodeInfo.nodeDescription = $('#nodeDescription').val()
            },
            conversion: function(exe_type) {
                if (typeof exe_type === 'undefined') {
                    return '未执行'
                } else {
                    var text = ''
                    switch (exe_type) {
                        case 1:
                            text = '未执行'
                            break
                        case 2:
                            text = '执行中'
                            break
                        case 3:
                            text = '执行成功'
                            break
                        case 4:
                            text = '执行失败'
                            break
                    }
                    return text
                }
            },
            basicInfoVerify() {
                var node_name = $('#node_name').val()
                var isSaveData = $('#isSaveData').prop('checked')
                var dataTableName = $('#dataTableName').val()
                var nameContainArr = ['`', '~', '!', '@', '%', '^', '&', '*', '(', ')', '）', '+', '/', '-']
                if (node_name === '') {
                    alertMsg('提示', '请输入节点名称', 'info')
                    return false
                }
                if (isSaveData && dataTableName === '') {
                    alertMsg('提示', '请输入结果表名称', 'info')
                    return false
                }
                var hasSpecailChar = false
                var specailChar = ''
                for (var i = 0; i < nameContainArr.length; i++) {
                    specailChar = nameContainArr[i]
                    if (dataTableName.indexOf(specailChar) > 0) {
                        hasSpecailChar = true
                        break
                    }
                }
                if (hasSpecailChar) {
                    alertMsg('提示', "结果表名称不能含有特殊字符“<span style='color: red;font-weight: bold;font-size: 20px;'>" + specailChar + '</span>”', 'info')
                    return false
                }
                return true
            }
        }
    }


    // function saveNotOutput() {
    //     basicObj.save_base()
    //     saveSetting()
    //     nodeData.isSet = true
    // }
</script>

<style scoped type="text/css">
    .label1{
        padding: 12px 5px 0 10px !important;
    }
</style>
