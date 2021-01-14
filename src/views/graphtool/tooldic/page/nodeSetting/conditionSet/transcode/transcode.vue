<template>
    <div ref="transcode" style="height: 570px;">
        <div class="layui-form-item" style="padding-top:20px; width: 700px;margin-left:125px;">
            <label class="layui-form-label">上一节点名称：<span ref="nodeName"></span></label>
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
        <el-dialog v-if="detailDialogVisible" :visible.sync="detailDialogVisible" title="数据转码详情" :append-to-body="!pressEscape"
                   :close-on-press-escape="pressEscape" :close-on-click-modal="clickModal" width="600px">
            <TranscodeDetail :transRuleUuid="transRuleUuid"/>
        </el-dialog>
    </div>
</template>

<script>
    import '@/components/ams-loading/css/loading.css'
    import {getTransCodeList} from '@/api/data/transCode'
    import TranscodeDetail from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/transcode/transcodeDetail.vue'
    export default {
        name: 'TranscodeSet',
        components:{ TranscodeDetail },
        data() {
            return {
                nodeData:null,
                columns: [],
                items: [],
                ruleArr: [],
                detailDialogVisible:false,
                pressEscape:false,
                clickModal:false,
                transRuleUuid:''
            }
        },
        mounted() {
            let loading = $(this.$refs.transcode).mLoading({ 'text': '正在加载转码规则数据，请稍后……', 'hasCancel': false })
            getTransCodeList().then(response => {
                loading.destroy();
                if (response.data == null) {
                    this.$message.error('转码规则数据获取失败')
                } else {
                    this.ruleArr = response.data
                    this.$nextTick(() => {
                        this.init()
                    })
                }
            })
        },
        methods: {
            init() {
                let graph = this.$parent.graph
                this.nodeData = graph.nodeData[graph.curCell.id]
                let parentIds = graph.nodeData[graph.curCell.id].parentIds
                $(this.$refs.nodeName).html(graph.nodeData[parentIds[0]].nodeInfo.nodeName)
                // 判断当前节点是否已配置过
                if (this.nodeData.isSet) {			// 如果配置过，直接读取已配置转码设置
                    var tableData = this.nodeData.setting.tableData
                    var changeColName = Object.keys(tableData)
                    this.columns = JSON.parse(JSON.stringify(this.nodeData.setting.columns))
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
                this.transRuleUuid = transRuleUuid
                this.detailDialogVisible = true
            },
            saveSetting() {
                let arr = {}
                Array.from(this.items, (n) => arr[n.selectColumnName] = {
                    'transRuleUuid': n.transRuleUuid,
                    'ruleName': n.ruleName
                })
                this.nodeData.setting.columns = this.columns
                this.nodeData.setting.tableData = arr
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
                    this.$message.error('同一个字段不能选择多个转码规则')
                }
                return verify
            }
        }
    }
</script>
<style scoped type="text/css">
    #main_table{
        width:700px;
        max-height:490px;
        margin-left:125px;
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
</style>
