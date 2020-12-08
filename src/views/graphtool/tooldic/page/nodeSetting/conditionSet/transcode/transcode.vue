<template>
    <div id="transcode">
        <div class="layui-form-item" style="padding-top:20px;">
            <label class="layui-form-label">上一节点名称：<span></span></label>
            <div class="layui-input-block">
                <button type="button" style="float:right;" class="layui-btn" @click="addTranscode">添加</button>
            </div>
        </div>
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
                    <el-select v-model="item.transRuleUuid" filterable @change="getRuleName(item.transRuleUuid,index)">
                        <el-option v-for="ruleObj in ruleArr" :key="ruleObj.transRuleUuid" :label="ruleObj.ruleName" :value="ruleObj.transRuleUuid">{{ ruleObj.ruleName }}
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
            let loading = $('#transcode').mLoading({ 'text': '正在加载转码规则数据，请稍后……', 'hasCancel': false })
            getTransCodeList().then(response => {
                loading.destroy();
                if (response.data == null) {
                    this.$message.error({ message: '转码规则数据获取失败' })
                } else {
                    this.ruleArr = response.data
                }
            })
            this.$nextTick(() => {
                this.init()
                window.inputVerify = this.inputVerify
                window.saveSetting = this.saveSetting
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
            getRuleName(transRuleUuid,index){
                let ruleObj = this.ruleArr.find(n => n.transRuleUuid === transRuleUuid)
                if(typeof ruleObj !== "undefined"){
                    this.items[index].ruleName = ruleObj.ruleName
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
            },
            saveSetting() {
                let arr = {}
                Array.from(this.items, (n) => arr[n.selectColumnName] = {
                    'transRuleUuid': n.transRuleUuid,
                    'ruleName': n.ruleName
                })
                nodeData.setting.columns = this.columns
                nodeData.setting.tableData = arr
            },
            inputVerify() {
                if(this.items.length === 0){
                    this.$message({ type: 'warning', message: '未添加转码规则' })
                    return false
                }
                let index = this.items.findIndex( n => n.selectColumnName === '' || typeof n.selectColumnName === 'undefined')
                if(index > -1){
                    this.$message({ type: 'warning', message: '存在未选择转码字段的行' })
                    return false
                }
                index = this.items.findIndex( n => n.transRuleUuid === '' || typeof n.transRuleUuid === 'undefined')
                if(index > -1){
                    this.$message({ type: 'warning', message: '存在未选择转码规则的字段' })
                    return false
                }
                let verify = true
                let transRuleUuidArr = []
                for(let i=0; i<this.items.length; i++){
                    if(transRuleUuidArr.includes(this.items[i].transRuleUuid)){
                        verify = false
                        break
                    }else{
                        transRuleUuidArr.push(this.items[i].transRuleUuid)
                    }
                }
                if (!verify) {
                    this.$message.error({ message: '同一个字段不能选择多个转码规则' })
                }
                return verify
            }
        }
    }
</script>

<style scoped type="text/css">
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
