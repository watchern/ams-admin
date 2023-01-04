<template>
    <div>
        <el-form :model="personalSpace"
                 class="demo-ruleForm"
                 label-width="80px">
            <el-form-item label="申请名称" class="item-b">
                <el-input v-model="personalSpace.personalSpaceName"
                          placeholder="申请名称"
                          disabled
                ></el-input>
            </el-form-item>
            <el-form-item label="扩容容量" class="item-b">
                <div style="display: flex">
                    <el-input v-model="personalSpace.personalSpaceCapacity"
                              placeholder="扩容容量"
                              type="number"
                              :max="1024"
                              :min="0"
                              style="width: 80%"
                              disabled
                    ></el-input>
                    <el-select v-model="personalSpaceCapacityNeed"
                               placeholder="容量单位"
                               style="margin-left: 10px"
                               disabled
                    >
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
    </div>
</template>

<script>
    import {
        batchUpdateForFinishHandle
        ,queryByPersonalSpaceUuid
        ,batchUpdateForBackApplicationHandle
    } from "@/api/analysis/personalSpace";
    export default {
        name: "expansionDetail",
        data(){
            return{
                personalSpace: {
                    personalSpaceName: '',
                    personalSpaceApplication: '',
                    personalSpaceType:'',
                    personalSpaceDate:'',
                    personalSpaceCapacity:'',
                    personalSpaceStatus:'',
                    // personalSpaceApproving:'',
                },
                personalSpaceCapacityNeed:'',//该变量为容量的单位 在最后会和容量做一个拼接
            }
        },
        mounted() {
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
            //更新对应业务状态方法 可以加入自己的style
            updateApplyStatus(value){
                var personalSpace = {
                    personalSpaceUuid: value
                }
                var relParam = []
                relParam.push(personalSpace)
                batchUpdateForFinishHandle(relParam)
            },
            updateApplyStatusBecauseBackApplication(value){
                //以后可能会出现扩展 这边先自己拼装一个 实体类 传到后台
                var personalSpace = {
                    personalSpaceUuid: value
                }
                var relParam = []
                relParam.push(personalSpace)
                batchUpdateForBackApplicationHandle(relParam)
            }
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