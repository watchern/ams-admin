<template>
    <div style="height: 560px;padding: 20px 0 0 120px;" v-loading="transcodeLoading" element-loading-text="正在加载转码规则数据，请稍后……">
        <el-table :data="items" height="450" class="layeringTable" style="width: 700px;">
            <el-table-column label="字段名称" width="300" header-align="center" :resizable="false">
                <template slot-scope="scope">
                    <el-select v-model="scope.row.selectColumnName" filterable style="width: 100%;">
                        <el-option v-for="colObj in scope.row.colArr" :key="colObj.columnName" :value="colObj.columnName">{{ colObj.columnName }}</el-option>
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column label="转码规则" width="300" header-align="center" :resizable="false">
                <template slot-scope="scope">
                    <el-select v-model="scope.row.transRuleUuid" filterable @change="getRuleName(scope.row.transRuleUuid,scope.$index)" style="width: 100%;">
                        <el-option v-for="ruleObj in ruleArr" :key="ruleObj.transRuleUuid" :label="ruleObj.ruleName" :value="ruleObj.transRuleUuid">
                            <el-col :span="20" style="text-overflow: ellipsis;overflow: hidden;white-space: nowrap;">
                                <el-tooltip class="item" effect="dark" :content="ruleObj.ruleName" placement="bottom">
                                    <span>{{ruleObj.ruleName}}</span>
                                </el-tooltip>
                            </el-col>
                            <el-col :span="4">
                                <el-button type="primary" class="oper-btn detail" @click="previewTransCode(ruleObj.transRuleUuid)" title="查看规则详情" style="float:right;line-height: normal;"/>
                            </el-col>
                        </el-option>
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center" :resizable="false">
                <template slot-scope="scope">
                    <el-button v-if="scope.$index === 0" type="primary" class="oper-btn add" @click="addTranscode" title="添加规则" style="line-height: normal;"/>
                    <el-button v-if="scope.$index !== 0" type="primary" class="oper-btn delete" title="删除规则" @click="deleteRule(scope.$index)" style="line-height: normal;"/>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog v-if="detailDialogVisible" :visible.sync="detailDialogVisible" title="数据转码详情" :append-to-body="!pressEscape"
                   :close-on-press-escape="pressEscape" :close-on-click-modal="clickModal" width="600px">
            <TranscodeDetail :transRuleUuid="transRuleUuid"/>
        </el-dialog>
    </div>
</template>

<script>
    import {getTransCodeList} from '@/api/data/transCode'
    import TranscodeDetail from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/transcode/transcodeDetail.vue'
    export default {
        name: 'TranscodeSet',
        components:{ TranscodeDetail },
        data() {
            return {
                transcodeLoading:true,
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
            getTransCodeList().then(response => {
                this.transcodeLoading = false
                if (response.data == null) {
                    this.$message.error('转码规则数据获取失败')
                } else {
                    this.ruleArr = response.data
                    this.$nextTick(() => {
                        this.init()
                    })
                }
            }).catch( () => {
                this.transcodeLoading = false
            })
        },
        methods: {
            init() {
                let graph = this.$parent.$parent.$parent.graph
                this.nodeData = graph.nodeData[graph.curCell.id]
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
                    let parentId = graph.nodeData[graph.curCell.id].parentIds[0]
                    let preNodeData = graph.nodeData[parentId]
                    let columnsInfo = []
                    if (preNodeData) {
                        if (preNodeData.nodeInfo.optType === 'newNullNode' && !preNodeData.isSet) {		// 如果前置节点是未配置的结果表
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
                    this.addTranscode()
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
