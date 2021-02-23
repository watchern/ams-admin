<template>
    <div style="height: 560px;overflow-y: auto">
        <el-collapse v-model="activeNames">
            <el-collapse-item title="分析字段" name="1">
                <el-table :data="analysisData" :border="tableBorder" fit highlight-current-row style="padding-left: 160px;">
                    <el-table-column label="上一节点名称" header-align="center" prop="nodeName" width="300" :show-overflow-tooltip="true" :resizable="false"/>
                    <el-table-column label="分析字段" header-align="center" prop="columnName" width="300" :resizable="false">
                        <template slot-scope="scope">
                            <el-select v-model="scope.row.columnSelected" filterable style="width: 100%;">
                                <el-option v-for="item in scope.row.columnsInfo" :key="item.columnName" :label="item.columnName" :value="item.columnName">{{ item.columnName }}</el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                </el-table>
            </el-collapse-item>
            <el-collapse-item title="分析内容" name="2">
                <div style="padding-left: 160px;width: 100%;">
                    <el-row>
                        <el-col :span="2">
                            <label style="float: right;line-height: 36px;padding-right: 10px;">分析内容</label>
                        </el-col>
                        <el-col :span="4">
                            <el-select v-model="analysisType" :disabled="analysisDisabled">
                                <el-option v-for="item in analysisTypeArr" :key="item.value" :label="item.name" :value="item.value">{{ item.name }}</el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="7">
                            <el-input v-model="analysisContent" :disabled="analysisDisabled" style="padding: 0 10px;"/>
                        </el-col>
                        <el-col :span="3">
                            <el-checkbox v-model="autoAnalysis" @change="autoContrastChange" style="line-height: 36px;">自动分析</el-checkbox>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="2">
                            <label style="float: right;line-height: 36px;padding-right: 10px;">出现次数</label>
                        </el-col>
                        <el-col :span="4">
                            <el-select v-model="compareType">
                                <el-option v-for="item in compareTypeArr" :key="item.value" :label="item.name" :value="item.value">{{ item.name }}</el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="7">
                            <el-input v-model="displayNum" type="number" style="padding: 0 10px;"/>
                        </el-col>
                        <el-col :span="3">
                            <el-checkbox v-model="ignoreNullVal" style="line-height: 36px;">忽略空值</el-checkbox>
                        </el-col>
                    </el-row>
                </div>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script>
    export default {
        name: 'FrequencyAnalysisSet',
        data() {
            return {
                activeNames:['1','2'],
                nodeData: null,
                analysisData:[],
                analysisContent:'',
                analysisDisabled:false,
                displayNum:null,
                ignoreNullVal:false,
                autoAnalysis:false,
                analysisTypeArr:[{"name":"包含","value":"contain"},{"name":"等于","value":"equal"}],
                analysisType:'contain',
                compareTypeArr:[{"name":"等于","value":"equal"},{"name":"大于等于","value":"gt_eq"},{"name":"小于等于","value":"lt_eq"}],
                compareType:"equal",
                tableBorder:true
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            init() {
                const graph = this.$parent.$parent.$parent.graph
                this.nodeData = graph.nodeData[graph.curCell.id]
                if (this.nodeData.isSet) {
                    let analysisCol = this.nodeData.setting.analysisCol
                    let appearNum = this.nodeData.setting.appearNum
                    this.$nextTick( () => {
                        // 反显节点信息及列信息
                        this.analysisData = this.nodeData.setting.contrastCol
                    })
                    // 反显分析关联字段行信息
                    if (analysisCol.autoContrast) {
                        this.analysisType = "contain"
                        this.analysisDisabled = true
                        this.autoAnalysis = true
                    } else {
                        this.analysisType = analysisCol.type
                        this.analysisContent = analysisCol.value
                    }
                    // 反显出现频次行信息
                    this.compareType = appearNum.type
                    this.displayNum = appearNum.value
                    if (appearNum.ignoreNullVal) {
                        this.ignoreNullVal = true
                    }
                } else {
                    let parentIds = this.nodeData.parentIds
                    let curNodeId = ''
                    for (let i = 0; i < parentIds.length; i++) {
                        let preNodeData = {}
                        // 判断前置节点（结果表）是否有自己的配置
                        if (graph.nodeData[parentIds[i]].isSet) {			// 如果有，则前置节点信息取结果表本身的
                            curNodeId = parentIds[i]
                        } else {			// 如果没有，则前置节点信息取结果表的前置节点的
                            curNodeId = graph.nodeData[parentIds[i]].parentIds[0]
                        }
                        preNodeData = graph.nodeData[curNodeId]
                        const columnsInfo = preNodeData.columnsInfo
                        let curColumnInfo = []
                        for (let j = 0; j < columnsInfo.length; j++) {
                            if (columnsInfo[j].isOutputColumn === 1) {
                                curColumnInfo.push({ 'columnName': columnsInfo[j].newColumnName})
                            }
                        }
                        this.analysisData.push({
                            'nodeId': curNodeId,
                            'nodeName': graph.nodeData[curNodeId].nodeInfo.nodeName,
                            "columnSelected":'',
                            "columnsInfo": curColumnInfo
                        })
                    }
                }
            },
            autoContrastChange(checked) {
                this.autoAnalysis = checked
                if(checked){
                    this.analysisType = "contain"
                    this.analysisDisabled = true
                }else{
                    this.analysisDisabled = false
                }
            },
            saveNotOutput() {
                var analysisCol = {}; var appearNum = {}; var contrastCol = []
                analysisCol.autoContrast = this.autoAnalysis
                if(!this.autoAnalysis){
                    analysisCol.type = this.analysisType
                    analysisCol.value = this.analysisContent
                }
                appearNum.type = this.compareType
                appearNum.value = this.displayNum
                appearNum.ignoreNullVal = this.ignoreNullVal
                for(let i=0; i<this.analysisData.length; i++){
                    let columnSelected = this.analysisData[i].columnSelected
                    let nodeId = this.analysisData[i].nodeId
                    let nodeName = this.analysisData[i].nodeName
                    let columns = []
                    Array.from(this.analysisData[i].columnsInfo, n => {
                        columns.push({...{"selected":n.columnName === columnSelected},...n})
                    })
                    contrastCol.push({nodeId,nodeName,columnSelected,columns})
                }
                this.nodeData.setting.analysisCol = analysisCol
                this.nodeData.setting.appearNum = appearNum
                this.nodeData.setting.contrastCol = contrastCol
            },
            inputVerify() {
                let index = this.analysisData.findIndex( item => item.columnSelected === "")
                if(index > -1){
                    this.$message({ 'type': 'warning', 'message': '含有未选择的分析字段'})
                    return false
                }
                if (this.autoAnalysis) {
                    if (this.displayNum == null || isNaN(this.displayNum)) {
                        this.$message({ 'type': 'warning', 'message': '请输入正确的频次数值'})
                        return false
                    }
                } else {
                    if ($.trim(this.analysisContent) === '') {
                        this.$message({ 'type': 'warning', 'message': '分析内容不能为空'})
                        return false
                    }
                    if (this.displayNum == null || isNaN(this.displayNum)) {
                        this.$message({ 'type': 'warning', 'message': '请输入正确的频次数值'})
                        return false
                    }
                }
                return true
            }
        }
    }
</script>
<style scoped type="text/css">
    .el-row{
        padding: 10px 0;
    }
</style>
