<template>
    <div style="height: 600px;">
        <div style="width: 80%;padding-left: 15%;padding-top: 50px;">
            <el-row>
                <el-table height="200" :data="analysisData" :border="tableBorder" fit highlight-current-row>
                    <el-table-column label="上一节点名称" align="center" prop="nodeName"/>
                    <el-table-column label="分析字段" align="center" prop="columnName">
                        <template slot-scope="scope">
                            <el-select v-model="scope.row.columnSelected" filterable>
                                <el-option v-for="item in analysisColumnArr" :key="item.columnName" :label="item.columnName" :value="item.columnName">{{ item.columnName }}</el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
            <el-row>
                <el-col :span="4">
                    <label style="float: right;line-height: 36px;padding-right: 10px;">分析内容</label>
                </el-col>
                <el-col :span="4">
                    <el-select v-model="analysisType" :disabled="analysisDisabled">
                        <el-option v-for="item in analysisTypeArr" :key="item.value" :label="item.name" :value="item.value">{{ item.name }}</el-option>
                    </el-select>
                </el-col>
                <el-col :span="8">
                   <el-input v-model="analysisContent" :disabled="analysisDisabled" style="padding: 0 10px;"/>
                </el-col>
                <el-col :span="4">
                    <el-checkbox v-model="autoAnalysis" @change="autoContrastChange" style="line-height: 36px;">自动分析</el-checkbox>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="4">
                    <label style="float: right;line-height: 36px;padding-right: 10px;">出现次数</label>
                </el-col>
                <el-col :span="4">
                    <el-select v-model="compareType">
                        <el-option v-for="item in compareTypeArr" :key="item.value" :label="item.name" :value="item.value">{{ item.name }}</el-option>
                    </el-select>
                </el-col>
                <el-col :span="8">
                    <el-input v-model="displayNum" type="number" style="padding: 0 10px;"/>
                </el-col>
                <el-col :span="4">
                    <el-checkbox v-model="ignoreNullVal" style="line-height: 36px;">忽略空值</el-checkbox>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'FrequencyAnalysisSet',
        data() {
            return {
                nodeData: null,
                analysisData:[],
                analysisColumnArr:[],
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
                const graph = this.$parent.graph
                this.nodeData = graph.nodeData[graph.curCell.id]
                if (this.nodeData.isSet) {
                    var analysisCol = this.nodeData.setting.analysisCol
                    var appearNum = this.nodeData.setting.appearNum
                    this.analysisColumnArr = this.nodeData.setting.analysisColumnArr
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
                    var parentIds = this.nodeData.parentIds
                    for (let i = 0; i < parentIds.length; i++) {
                        var preNodeData = {}
                        // 判断前置节点（结果表）是否有自己的配置
                        if (graph.nodeData[parentIds[i]].isSet) {			// 如果有，则前置节点信息取结果表本身的
                            preNodeData = graph.nodeData[parentIds[i]]
                        } else {			// 如果没有，则前置节点信息取结果表的前置节点的
                            var pre_parentIds = graph.nodeData[parentIds[i]].parentIds
                            preNodeData = graph.nodeData[pre_parentIds[0]]
                        }
                        var columnsInfo = preNodeData.columnsInfo
                        for (var j = 0; j < columnsInfo.length; j++) {
                            if (columnsInfo[j].isOutputColumn === 1) {
                                this.analysisColumnArr.push({ 'columnName': columnsInfo[j].newColumnName})
                            }
                        }
                        var obj = {
                            'nodeId': parentIds[i],
                            'nodeName': graph.nodeData[parentIds[i]].nodeInfo.nodeName,
                            "columnSelected":''
                        }
                        this.analysisData.push(obj)
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
                    Array.from(this.analysisColumnArr, (n) => columns.push({
                        "columnName":n.columnName,
                        "selected":n.columnName === columnSelected
                    }))
                    contrastCol.push({nodeId,nodeName,columnSelected,columns})
                }
                this.nodeData.setting.analysisCol = analysisCol
                this.nodeData.setting.appearNum = appearNum
                this.nodeData.setting.contrastCol = contrastCol
                this.nodeData.setting.analysisColumnArr = this.analysisColumnArr
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
