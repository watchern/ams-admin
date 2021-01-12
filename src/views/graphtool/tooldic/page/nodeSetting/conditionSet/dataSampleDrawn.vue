<template>
    <div style="height: 600px;">
        <div style="padding: 50px 0 0 180px;">
            <el-row>
                <el-col :span="6">
                    <el-radio v-model="radioVal" label="samCount">样本量（个）抽样</el-radio>
                </el-col>
                <el-col :span="10">
                    <el-input type="number" placeholder="请输入样本数量" min="1" step="10" v-model="samCount"></el-input>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="6">
                    <el-radio v-model="radioVal" label="proportion" >比例（%）抽样</el-radio>
                </el-col>
                <el-col :span="10">
                    <el-input type="number" placeholder="请输入样本数量比例" min="1" max="100" step="5" v-model="proportion"></el-input>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="6">
                    <el-radio v-model="radioVal" label="preNumber" >前N个抽样</el-radio>
                </el-col>
                <el-col :span="10">
                    <el-input type="number" placeholder="请输入数量" min="1" v-model="preNumber"></el-input>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="6">
                    <el-radio v-model="radioVal" label="eqCountSample" >等距抽样</el-radio>
                </el-col>
                <el-col :span="10">
                    <el-input type="number" placeholder="请输入样本步长" min="1" v-model="eqCountSample"></el-input>
                </el-col>
            </el-row>
                <!--<el-row>-->
                    <!--<el-col :span="6">-->
                        <!--<el-radio v-model="radioVal" label="simpleRom">简单随机抽样</el-radio>-->
                    <!--</el-col>-->
                <!--</el-row>-->
        </div>
    </div>
</template>

<script>
    export default {
        name: 'DataSampleDrawnSet',
        data(){
            return {
                nodeData:null,
                setting:null,
                radioVal:'samCount',
                samCount:null,
                proportion:null,
                preNumber:null,
                eqCountSample:null,
                radioMap:{
                    "samCount":"样本量（个）抽样",
                    "proportion":"比例（%）抽样",
                    "preNumber":"前N个抽样",
                    "eqCountSample":"等距抽样"
                }
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
                    this.radioVal = this.nodeData.setting.radioValue
                    this[this.radioVal] = this.nodeData.setting.samCountVal
                }
            },
            inputVerify() {
                let verify = true
                let value = this[this.radioVal]
                if(value == null || isNaN(value)){
                    verify = false
                    this.$message({'type': 'warning','message': `【${this.radioMap[this.radioVal]}】项未输入正确的数值`})
                }else{
                    if(Number(value) === 0){
                        verify = false
                        this.$message({'type': 'warning','message': `【${this.radioMap[this.radioVal]}】项可输入最小值应为1`})
                    }else{
                        if(this.radioVal === "proportion" && Number(value) > 100){
                            verify = false
                            this.$message({'type': 'warning','message': `【${this.radioMap[this.radioVal]}】项可输入最大值应为100`})
                        }
                    }
                }
                return verify
            },
            saveSetting() {
                this.nodeData.setting = {
                    "radioValue":this.radioVal,// 样本类型
                    "samCountVal":this[this.radioVal]// 样本值
                }
            }
        }
    }
</script>

<style scoped type="text/css">
    .el-row{
        padding: 10px 0;
    }
    .el-col{
        text-align:right;
        padding-right: 20px;
        line-height: 36px;
    }
</style>
