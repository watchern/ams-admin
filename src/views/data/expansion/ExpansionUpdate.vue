<template>
    <div>
        <el-form :model="personalSpace"
                 class="demo-ruleForm"
                 label-width="80px">
            <el-form-item label="申请名称" class="item-b">
                <el-input v-model="personalSpace.personalSpaceName"
                          placeholder="申请名称"></el-input>
            </el-form-item>
            <el-form-item label="扩容容量" class="item-b">
                <div style="display: flex">
                    <el-input v-model="personalSpace.personalSpaceCapacity"
                              placeholder="扩容容量"
                              type="number"
                              :max="1024"
                              :min="0"
                              @input="inputChange"
                              style="width: 80%"></el-input>
                    <el-select v-model="personalSpaceCapacityNeed"
                               placeholder="容量单位" style="margin-left: 10px">
                        <el-option label="GB"
                                   value="GB"></el-option>
                        <el-option label="MB"
                                   value="MB"></el-option>
                        <el-option label="KB"
                                   value="KB"></el-option>
                    </el-select>
                </div>
            </el-form-item>
            <!--        <el-form-item label="审批人">-->
            <!--          <el-input v-model="personalSpace.personalSpaceApproving"-->
            <!--                    placeholder="选择审批人"-->
            <!--                    style="width: 670px"></el-input>-->
            <!--          <el-button type="primary">选择</el-button>-->
            <!--        </el-form-item>-->

        </el-form>
        <el-row type="flex"
                justify="end">
          <el-button type="primary"
                     @click="onUpdate">保存</el-button>
          <el-button type="primary"
                     @click="closeUpdateDialog">关闭</el-button>
        </el-row>
    </div>
</template>

<script>
    import {
        batchUpdateForFinishHandle
        ,queryByPersonalSpaceUuid
    } from "@/api/data/personalSpace";
    export default {
        name: "expansionDetail",
        props:{
            applyUuid: ''
        },
        data(){
            return{
                personalSpace: {
                    personalSpaceName: '',
                    personalSpaceApplication: '',
                    personalSpaceType:'',
                    personalSpaceDate:'',
                    personalSpaceCapacity:'',
                    personalSpaceStatus:'',
                },
                personalSpaceCapacityNeed:'',//该变量为容量的单位 在最后会和容量做一个拼接

            }
        },
        mounted() {
            //因为生命周期问题 只能出此下策多调用一次 后期应该进行调整
            this.$emit("fromSon")
        },
        methods:{
            queryByUuid(value){
                queryByPersonalSpaceUuid(value)
                    .then((res)=>{
                        this.personalSpace = res.data
                        var length = res.data.personalSpaceCapacity.length
                        this.personalSpaceCapacityNeed = res.data.personalSpaceCapacity.substring(length-2)
                        this.personalSpace.personalSpaceCapacity = res.data.personalSpaceCapacity.substring(0,length-2)
                    })
            },
            updateApplyStatus(value){
                batchUpdateForFinishHandle(value)
            },
            inputChange(val){
                if(val<0){
                    this.personalSpace.personalSpaceCapacity = 0
                }
                if(val >1024){
                    this.personalSpace.personalSpaceCapacity = 1024
                }
            },
            onUpdate(){
                this.$emit('fromSonUpdate',this.personalSpace,this.personalSpaceCapacityNeed)
            },
            closeUpdateDialog(){
                this.$emit('fromSonCloseDiaglog')
            },

        }
    }
</script>

<style lang="scss" scoped>
    .padding10 {
        padding: 10px;
        box-sizing: border-box;
    }
    .header_Filter {
        width: 100%;
    }
    .demo-ruleForm {
        margin-top:20px;
        display: flex;
        flex-wrap: wrap;
        ::v-deep .el-form-item {
            margin-bottom: 22px !important;
        }
        ::v-deep .el-form-item__label {
            text-align: right;
            vertical-align: middle;
            float: left !important;
        }
    }
</style>