<template>
    <div id="div_config">
        <div style="color:red">注：两张表所勾选融合字段的含义和顺序需保持一致，均可通过拖动行改变字段的的显示顺序</div>
        <div id="table_left" class="div_table">
            <div class="_table">
                <div class="_table_th">
                    <div id="table_name_left"></div>
                    <div class="mtDiv"><input id="mainTable_left" type="checkbox" @click="mainTableClick('left','right')"/>&nbsp;主表</div>
                </div>
                <div style="height: 400px;width: 400px;overflow-y: auto;">
                    <table id="col_table_col_left_data" class="table table-striped">
                        <thead>
                        <tr class="tr_th">
                            <th width="100px"><input id="sel_all_left" @click="selectAll('left')" type="checkbox" class="form-control"/></th>
                            <th>融合字段</th>
                        </tr>
                        </thead>
                        <tbody>
                            <tr v-for="leftObj in leftTableColArr" :nodeId="leftObj.nodeId">
                                <td>
                                    <input type="checkbox" class="form-control columnCk" @click="columnClick('left')" v-if="leftObj.checked" checked="checked"/>
                                    <input type="checkbox" class="form-control columnCk" @click="columnClick('left')" v-if="!leftObj.checked"/>
                                </td>
                                <td align="left">{{leftObj.colName}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="div_table" style="width: 130px;margin-top: 150px">
            <select id="conn_type" name="conn_type" class="form-control">
                <option value="union">合并</option>
                <option value="intersect">交集</option>
                <option value="exclude">补集</option>
            </select>
        </div>
        <div id="table_right" class="div_table">
            <div class="_table">
                <div class="_table_th">
                    <div id="table_name_right"></div>
                    <div class="mtDiv"><input id="mainTable_right" type="checkbox" @click="mainTableClick('right','left')"/>&nbsp;主表</div>
                </div>
                <div style="height: 400px;width: 400px;overflow-y: auto;">
                    <table id="col_table_col_right_data" class="table table-striped">
                        <thead>
                        <tr>
                            <th width="100px"><input id="sel_all_right" @click="selectAll('right')" type="checkbox" class="form-control"/></th>
                            <th>融合字段</th>
                        </tr>
                        </thead>
                        <tbody>
                            <tr v-for="rightObj in rightTableColArr" :nodeId="rightObj.nodeId">
                                <td>
                                    <input type="checkbox" class="form-control columnCk" @click="columnClick('right')" v-if="rightObj.checked" checked="checked"/>
                                    <input type="checkbox" class="form-control columnCk" @click="columnClick('right')" v-if="!rightObj.checked"/>
                                </td>
                                <td align="left">{{rightObj.colName}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    var nodeData
    export default {
        name: 'unionDataSet',
        data(){
            return{
                leftTableColArr:[],
                rightTableColArr:[]
            }
        },
        mounted(){
            this.init();
        },
        methods:{
            init(){
                let svg_width = (($(document).width() - 930) / 2) + 'px'
                $('#div_config').css({ 'margin-left': svg_width, 'margin-top': '20px' })
                let graph = this.$parent.graph
                nodeData = graph.nodeData[graph.curCell.id]
                let parentIds = nodeData.parentIds
                let isSet = nodeData.isSet
                if (isSet) {
                    var setting = nodeData.setting
                    $('#conn_type').selectpicker('val', setting.conn_type)
                    var left_data = setting.left_data
                    var right_data = setting.right_data
                    var mainType = ''// 默认主表
                    $('#table_name_left').attr('nodeId', left_data.nodeId)
                    $('#table_name_left').html(left_data.nodeName)
                    $('#table_name_right').attr('nodeId', right_data.nodeId)
                    $('#table_name_right').html(right_data.nodeName)
                    if (left_data.mainTable) {
                        mainType = 'left'
                        $('#mainTable_left').attr('checked', 'checked')
                    }
                    if (right_data.mainTable) {
                        mainType = 'right'
                        $('#mainTable_right').attr('checked', 'checked')
                    }
                    if (left_data.selectAll) {
                        $('#sel_all_left').attr('checked', 'checked')
                    }
                    if (right_data.selectAll) {
                        $('#sel_all_right').attr('checked', 'checked')
                    }
                    let colArr = [];
                    // var html = ''; var indexArr = []
                    $(left_data.columnSetArr).each(function(i, v) {
                        let nodeId = left_data.preNodeId
                        let colName = v.name
                        let checked = false
                        if (v.checked) {
                            checked = true
                        }
                        colArr.push({nodeId,colName,checked})
                    })
                    if (colArr.length !== 0) {
                        $('#col_table_col_left_data>tbody').html(html).sortable().disableSelection()
                        this.leftTableColArr = [...colArr];
                    }
                    colArr = [];
                    $(right_data.columnSetArr).each(function(i, v) {
                        let nodeId = right_data.preNodeId
                        let colName = v.name
                        let checked = false
                        if (v.checked) {
                            checked = true
                        }
                        colArr.push({nodeId,colName,checked})
                    })
                    if (colArr.length !== 0) {
                        $('#col_table_col_right_data>tbody').html(html).sortable().disableSelection()
                        this.rightTableColArr = [...colArr];
                    }
                    // 反显输出列
                    var data = []
                    $('#col_table_col_' + mainType + '_data>tbody>tr').each(function(i, v) {
                        if ($(this).find('.columnCk').prop('checked')) {
                            var obj = {
                                'nodeId': $(this).attr('nodeId'),
                                'value': $(this).find('td:eq(1)').html(),
                                'nullNodeId': $('#table_name_' + mainType).attr('nodeId')
                            }
                            data.push(obj)
                        }
                    })
                    this.$parent.$refs.outputColumn.re_checkbox(data, true)
                } else {
                    let this_vue = this;
                    if (parentIds && parentIds.length > 0) {
                        $(parentIds).each(function(i, v) {
                            var per_node = graph.nodeData[v]
                            var columnsInfo = per_node.columnsInfo
                            var nodeName = per_node.nodeInfo.nodeName
                            var nodeId = per_node.nodeInfo.nodeId
                            var preNodeId = per_node.nodeInfo.nodeId
                            // 如果前置节点为结果表且该结果表未配置
                            if (per_node && per_node.nodeInfo.optType === 'newNullNode' && !per_node.isSet) {
                                let per_node_parentIds = per_node.parentIds
                                if (per_node_parentIds && per_node_parentIds.length > 0) {
                                    columnsInfo = graph.nodeData[per_node_parentIds[0]].columnsInfo
                                    preNodeId = graph.nodeData[per_node_parentIds[0]].nodeInfo.nodeId
                                }
                            }
                            let colArr = [];
                            $(columnsInfo).each(function(ind, val) {
                                if (val.isOutputColumn) {
                                    let nodeId = preNodeId;
                                    let colName = val.newColumnName;
                                    colArr.push({nodeId,colName});
                                }
                            })
                            if (colArr.length !== 0) {
                                if (i === 0) {
                                    $('#table_name_left').attr('nodeId', nodeId)
                                    $('#table_name_left').html(nodeName)
                                    // $('#col_table_col_left_data>tbody').html(html)
                                    this_vue.leftTableColArr = [...colArr]
                                    // register('left')
                                    // 拖动排序使用，如果不需要就注释或删除
                                    $('#col_table_col_left_data>tbody').sortable().disableSelection()
                                } else {

                                    $('#table_name_right').attr('nodeId', nodeId)
                                    $('#table_name_right').html(nodeName)
                                    // $('#col_table_col_right_data>tbody').html(html)
                                    // register('right')
                                    this_vue.rightTableColArr = [...colArr]
                                    // 拖动排序使用，如果不需要就注释或删除
                                    $('#col_table_col_right_data>tbody').sortable().disableSelection()
                                }
                            }
                        })
                    }
                }
            },
            columnClick(type){//选择列的点击事件
                let chknum = $("#col_table_col_" + type + "_data>tbody>tr").length// 选项总个数
                let chk = $('#col_table_col_' + type + '_data>tbody>tr .checked').length
                let $_this = $('#sel_all_' + type)
                if (!$(this).prop('checked')) {			// 取消选中
                    if ($_this.prop('checked')) {
                        $('#sel_all_' + type).icheck('unchecked')
                    }
                } else {				// 选中
                    if (!$_this.prop('checked') && chknum === (chk + 1)) {
                        $('#sel_all_' + type).icheck('checked')
                    }
                }
                // 刷新输出字段信息
                if ($('#mainTable_' + type).prop('checked')) {
                    var data = []
                    $('#col_table_col_' + type + '_data>tbody>tr').each(function(i, v) {
                        if ($(this).find('.columnCk').prop('checked')) {
                            var obj = {
                                'nodeId': $(this).attr('nodeId'),
                                'value': $(this).find('td:eq(1)').html(),
                                'nullNodeId': $('#table_name_' + type).attr('nodeId')
                            }
                            data.push(obj)
                        }
                    })
                    this.$parent.$refs.outputColumn.re_checkbox(data, true)
                }
            },
            mainTableClick(type,otherType){//选择主表的点击事件
                let data = []
                if ($('#mainTable_' + type).prop('checked')) {
                    $('#mainTable_' + otherType).icheck('unchecked')
                    // 刷新输出字段信息
                    $('#col_table_col_'+type+'_data>tbody>tr').each(function(i, v) {
                        if ($(this).find('.columnCk').prop('checked')) {
                            var obj = {
                                'nodeId': $(this).attr('nodeId'),
                                'value': $(this).find('td:eq(1)').html(),
                                'nullNodeId': $('#table_name_'+type).attr('nodeId')
                            }
                            data.push(obj)
                        }
                    })
                } else {
                    $('#mainTable_'+otherType).icheck('checked')
                    $('#col_table_col_'+otherType+'_data>tbody>tr').each(function(i, v) {
                        if ($(this).find('.columnCk').prop('checked')) {
                            var obj = {
                                'nodeId': $(this).attr('nodeId'),
                                'value': $(this).find('td:eq(1)').html(),
                                'nullNodeId': $('#table_name_'+otherType).attr('nodeId')
                            }
                            data.push(obj)
                        }
                    })
                }
                this.$parent.$refs.outputColumn.re_checkbox(data, true)
            },
            selectAll(type){
                if ($('#sel_all_'+type).prop('checked')) {
                    $('#col_table_col_'+type+'_data>tbody>tr>td .columnCk').each(function () {
                        $(this).attr('checked','checked')
                    })
                    // $('#col_table_col_'+type+'_data>tbody>tr>td .columnCk').attr('checked','checked')
                    // 同时如果左侧表被选为主表
                    if ($('#mainTable_'+type).prop('checked')) {
                        var data = []
                        $('#col_table_col_'+type+'_data>tbody>tr').each(function(i, v) {
                            var obj = {
                                'value': $(this).find('td:eq(1)').html(),
                                'nodeId': $(this).attr('nodeId'),
                                'nullNodeId': $('#table_name_'+type).attr('nodeId')
                            }
                            data.push(obj)
                        })
                        this.$parent.$refs.outputColumn.re_checkbox(data, true)
                    }
                } else {
                    $('#col_table_col_'+type+'_data>tbody>tr>td .columnCk').each(function () {
                        $(this).removeAttr('checked')
                    })
                    // $('#col_table_col_'+type+'_data>tbody>tr>td .columnCk').attr('checked',false)
                    // 同时如果左侧表被选为主表
                    if ($('#mainTable_'+type).prop('checked')) {
                        this.$parent.$refs.outputColumn.re_checkbox(null, true)
                    }
                }
            }
        }
    }

    /**
     * 保存设置
     */
    function saveSetting() {
        var left_data = {
            'nodeId': $('#table_name_left').attr('nodeId'),
            'nodeName': $('#table_name_left').html(),
            'columnSetArr': [],
            'mainTable': false,
            'selectAll': $('#sel_all_left').prop('checked'),
            'preNodeId': $('#col_table_col_left_data>tbody>tr:eq(0)').attr('nodeId')
        }
        var right_data = {
            'nodeId': $('#table_name_right').attr('nodeId'),
            'nodeName': $('#table_name_right').html(),
            'columnSetArr': [],
            'mainTable': false,
            'selectAll': $('#sel_all_right').prop('checked'),
            'preNodeId': $('#col_table_col_right_data>tbody>tr:eq(0)').attr('nodeId')
        }
        if ($('#mainTable_left').prop('checked')) {
            left_data.mainTable = true
        } else {
            right_data.mainTable = true
        }
        $('#col_table_col_left_data>tbody>tr').each(function(i, v) {
            var obj = { 'name': $(this).find('td:eq(1)').html() }
            if ($(this).find('.columnCk').prop('checked')) {
                obj.checked = true
            }
            left_data.columnSetArr.push(obj)
        })
        $('#col_table_col_right_data>tbody>tr').each(function(i, v) {
            var obj = { 'name': $(this).find('td:eq(1)').html() }
            if ($(this).find('.columnCk').prop('checked')) {
                obj.checked = true
            }
            right_data.columnSetArr.push(obj)
        })
        nodeData.setting.left_data = left_data// 选择的数据（带顺序）
        nodeData.setting.right_data = right_data// 选择的数据（带顺序）
        nodeData.setting.conn_type = $('#conn_type').val()
    }

    // 页面输入项的校验(或空配置校验)
    function inputVerify() {
        if (!$('#mainTable_left').prop('checked') && !$('#mainTable_right').prop('checked')) {
            alertMsg('提示', '尚未勾选设置主表', 'info')
            return false
        }
        var type = 'left'
        if ($('#mainTable_right').prop('checked')) {
            type = 'right'
        }
        if ($('#col_table_col_' + type + '_data>tbody>tr .checked').length === 0) {
            alertMsg('提示', '请勾选主表的输出字段', 'info')
            return false
        }
        var verify = true
        $('#col_table_col_' + type + '_data>tbody>tr').each(function(i, v) {
            if ($(this).find('.columnCk').prop('checked')) {
                var anotherType = type === 'left' ? 'right' : 'left'
                if (!$('#col_table_col_' + anotherType + '_data>tbody>tr:eq(' + i + ') .columnCk').prop('checked')) {
                    alertMsg('提示', '左右表所选择的字段勾选状态不一致，请修改', 'info')
                    verify = false
                    return false
                }
            }
        })
        if (!verify) {
            return false
        }
        return true
    }
</script>

<style scoped type="text/css">
    #col_table_col_left_data,#col_table_col_right_data {
        margin:0 auto;
        float: left;
        text-align: center;
    }
    #col_table_col_left_data>thead>tr,#col_table_col_left_data>tbody>tr,
    #col_table_col_right_data>thead>tr,#col_table_col_right_data>tbody>tr{
        height:38px;
        line-height: 38px;
    }
    #col_table_col_left_data>thead>tr>th,#col_table_col_right_data>thead>tr>th{
        border:1px solid #ddd;
    }
    #col_table_col_left_data>tbody>tr>td,#col_table_col_right_data>tbody>tr>td{
        border:1px solid #ddd;
    }
    img {
        cursor:pointer;
        width: 24px;
    }
    ._table {
        float: left;
        width: 400px;
        height: 440px;
        margin-top:20px;
        background-color: #fff;
        border:1px solid #E6E6E6;
        /*overflow-y: auto;*/
    }
    ._table_th {
        height: 40px;
    }
    #table_name_left,#table_name_right,.mtDiv{
        display:inline-block;
        text-align: center;
    }
    #table_name_left,#table_name_right{
        width:290px;
        padding-top: 10px;
    }
    .mtDiv{
        width: 80px;
        padding-top: 10px;
    }
    .tr_th{
        margin-left: 4px;
        margin-top: 3px;
    }
    .div_table {
        float: left;
        border: 1px solid #fff;
    }
</style>
