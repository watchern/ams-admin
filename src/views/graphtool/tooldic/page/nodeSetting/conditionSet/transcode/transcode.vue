<template>
    <div id="transcode">
        <form class="layui-form">
            <div class="layui-form-item">
                <label class="layui-form-label">上一节点名称：<span></span></label>
                <div class="layui-input-block">
                    <button type="button" style="float:right;" class="layui-btn" @click="addTranscode">添加</button>
                </div>
            </div>
        </form>
        <table id="main_table" class="table table-striped">
            <thead>
            <tr>
                <td width="250px">字段名称</td>
                <td width="350px">转码规则</td>
                <td width="100px">操作</td>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item,index) in items" :key="item.key">
                <td>
                    <el-select v-model="item.selectColumnName" filterable>
                        <el-option v-for="colObj in item.colArr" :key="colObj.columnName" :value="colObj.columnName">{{ colObj.columnName }}</el-option>
                    </el-select>
                </td>
                <td>
                    <el-select v-model="item.transRuleUuid" filterable>
                        <el-option v-for="ruleObj in ruleArr" :key="ruleObj.transRuleUuid" :value="ruleObj.ruleName">{{ ruleObj.ruleName }}
                            <button class="chooseRule layui-btn" @click="previewTransCode(ruleObj.transRuleUuid)" style="float: right;height: 30px;line-height: 30px;">查看</button>
                        </el-option>
                    </el-select>
                </td>
                <td>
                    <button class="layui-btn" @click="deleteRule(index)">删除</button>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    import {getTransCodeList} from '@/api/data/transCode'
    import SelectTransCode from '@/views/data/table/transcodeselect'
    var nodeData
    export default {
        name: 'TranscodeSet',
        data() {
            return {
                columns: [],
                items: [],
                ruleArr: [],
            }
        },
        mounted() {
            let loading = $('#transcode').mLoading({ 'text': '正在加载转码数据，请稍后……', 'hasCancel': false })
            getTransCodeList().then(response => {
                loading.destroy();
                if (response.data == null) {
                    alertMsg('提示', '转码数据获取失败', 'error')
                } else {
                    this.ruleArr = response.data
                }
            })
            this.$nextTick(() => {
                this.init()
            })
        },
        methods: {
            init() {
                let graph = this.$parent.graph
                nodeData = graph.nodeData[graph.curCell.id]
                let parentIds = graph.nodeData[graph.curCell.id].parentIds
                $('#transcode span').html(graph.nodeData[parentIds[0]].nodeInfo.nodeName)
                // 判断当前节点是否已配置过
                if (nodeData.isSet) {			// 如果配置过，直接读取已配置转码设置
                    var tableData = nodeData.setting.tableData
                    var changeColName = Object.keys(tableData)
                    this.columns = JSON.parse(JSON.stringify(nodeData.setting.columns))
                    for (var k = 0; k < changeColName.length; k++) {
                        this.addTranscode(changeColName[k], tableData[changeColName[k]].transRuleUuid, tableData[changeColName[k]].ruleName)
                    }
                } else {				// 否则读取前置节点信息进行转码设置
                    // 获取前置节点信息
                    var parentId = graph.nodeData[graph.curCell.id].parentIds[0]
                    var preNodeData = graph.nodeData[parentId]
                    var optType = ''; var isSet = false; var columnsInfo = []
                    if (preNodeData) {
                        optType = preNodeData.nodeInfo.optType
                        isSet = preNodeData.isSet
                        if (optType === 'newNullNode' && !isSet) {		// 如果前置节点是未配置的结果表
                            parentId = graph.nodeData[parentId].parentIds[0]
                            preNodeData = graph.nodeData[parentId]
                        }
                        columnsInfo = preNodeData.columnsInfo
                    }
                    for (var i = 0; i < columnsInfo.length; i++) {
                        if (columnsInfo[i].isOutputColumn === 1) {
                            this.columns.push(columnsInfo[i].newColumnName)
                        }
                    }
                }
            },
            addTranscode(selectVal, transRuleUuid, ruleName) {
                let selectColumnName = ''
                let colArr = []
                for (let i = 0; i < this.columns.length; i++) {
                    if (selectVal && selectVal === this.columns[i]) {
                        selectColumnName = this.columns[i]
                    }
                    colArr.push({ columnName: this.columns[i] })
                }
                this.items.push({
                    'transRuleUuid': transRuleUuid,
                    'ruleName': ruleName,
                    'colArr': colArr,
                    'selectColumnName': selectColumnName,
                })
            },
            deleteRule(index) {
                this.items.splice(index, 1)
            },
            previewTransCode(transRuleUuid) {
                top.layer.open({
                    id: 'transcodeDetail',
                    type: 2,
                    title: '查看数据转码信息',
                    content: '/#/graphtool/tooldic/transcodeDetail?id='+transRuleUuid,
                    area: ['600px', '500px'],
                    skin: 'layui-layer-lan',
                    btn: ['关闭'],
                    btn1: function(index, layero) {
                        top.layer.close(index)
                    }
                })
            }
        }
    }

    function saveSetting() {
        var curSelectVal = []; var verify = true; var arr = {}
        $.each($('.selectCol'), function(i, v) {
            var val = $(this).val()
            val = val == null ? '' : val
            if ($.inArray(val, curSelectVal) > -1) {
                verify = false
                return false
            } else {
                curSelectVal.push(val)
                var transRuleUuid = $('.transRuleUuid:eq(' + i + ')').val()
                var ruleName = $('.ruleName:eq(' + i + ')').val()
                if (transRuleUuid !== '' && transRuleUuid != null) {
                    arr[val] = {
                        'transRuleUuid': transRuleUuid,
                        'ruleName': ruleName
                    }
                }
            }
        })
        if (!verify) {
            alertMsg('错误', '同一个字段不能选择多个转码规则', 'error')
            return
        }
        nodeData.setting.columns = columns
        nodeData.setting.tableData = arr
    }

    // 页面输入项的校验(或空配置校验)
    function inputVerify() {
        var verify = true
        if ($('.transRuleUuid').length === 0) {
            alertMsg('提示', '未添加转码规则！', 'info')
            verify = false
        } else {
            $('.ruleName').css('border', '1px solid #e6e6e6')
        }
        $('.transRuleUuid').each(function(i, v) {
            if ($(this).val() === '') {
                alertMsg('提示', '未对所选字段匹配转码规则', 'info')
                $('.ruleName:eq(' + i + ')').css('border', '1px solid red')
                verify = false
                return false
            }
        })
        return verify
    }
</script>

<style type="text/css">
    #transcode{
        width:700px;
        height:450px;
        overflow-y: auto;
        overflow-x: hidden;
        margin:0 auto;
    }
    #main_table{
        width:700px;
        height:auto;
    }
    #main_table td{
        text-align: center;
        border:1px solid #DBDBDB;
        background-color: #fff;
    }
    #main_table>thead>tr>td{
        background-color:#5886B2;
        color:#fff;
    }
    #main_table button{
        height:30px;
        line-height: 30px;
    }
    .layui-form-label{
        width:auto;
        float:left;
        font-size: 20px;
    }
    .selectCol{
        width:90%;
        height:30px;
        line-height: 30px;
        font-size: 16px;
    }
    .ruleName{
        width:70%;
        height:30px;
        line-height:30px;
        display:inline;
    }
    form{
        background: none;
    }
</style>
