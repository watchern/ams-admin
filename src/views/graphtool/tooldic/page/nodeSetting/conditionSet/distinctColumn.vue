<template>
    <div style="padding: 30px 0 0 80px;">
        <el-transfer filterable filter-placeholder="请输入搜索内容" v-model="columnDataValue" :data="columnData" :titles="['可选字段', '去重字段']" @change="changeSortData"></el-transfer>
    </div>
</template>

<script>
    export default {
        name: 'DistinctColumnSet',
        data(){
            return {
                nodeData:null,
                columnData:[],
                columnDataValue:[],
                curColumnsInfo:[]
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            init() {
                let graph = this.$parent.$parent.$parent.graph
                this.nodeData = graph.nodeData[graph.curCell.id]
                this.curColumnsInfo = this.$parent.$parent.$parent.columnsInfoPre
                if (this.nodeData.isSet) {
                    this.curColumnsInfo = this.nodeData.setting.columnsInfo
                    this.columnDataValue = this.nodeData.setting.delRepeatData
                    this.$parent.$parent.$parent.$refs.outputColumnVueRef.re_checkbox(this.columnDataValue)// 反显
                }
                Array.from(this.curColumnsInfo,item => {
                    this.columnData.push({
                        'pinyin': item.newColumnName,
                        'label': item.newColumnName,
                        'key': item.newColumnName
                    })
                })
            },
            changeSortData(){
                this.$parent.$parent.$parent.$refs.outputColumnVueRef.re_checkbox(this.columnDataValue)
            },
            saveSetting() {
                this.nodeData.setting.delRepeatData = this.columnDataValue
                this.nodeData.setting.columnsInfo = this.curColumnsInfo
            },
            inputVerify() {
                let verify = true
                if (this.columnDataValue.length === 0) {
                    this.$message({ type: 'warning', message: '已选择去重字段列表不能为空' })
                    verify = false
                }
                return verify
            }
        }
    }
</script>
<style scoped type="text/css">
    >>> .el-transfer-panel{
        width: 300px;
        height: 530px;
    }
    >>> .el-transfer-panel__list.is-filterable{
        height: 425px;
    }
    >>> .el-checkbox{
        margin-right: 15px;
    }
</style>
