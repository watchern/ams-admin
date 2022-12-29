<template>
    <div>
        <el-form :model="personalSpace"
                 class="demo-form-inline"
                 label-width="80px">
            <el-form-item label="申请名称">
                <el-input v-model="personalSpace.personalSpaceName"
                          placeholder="申请名称"
                          disabled
                ></el-input>
            </el-form-item>
            <el-form-item label="扩容容量">
                <el-input v-model="personalSpace.personalSpaceCapacity"
                          placeholder="扩容容量"
                          type="number"
                          :max="1024"
                          :min="0"
                          disabled
                          style="width: 540px"></el-input>
                <el-select v-model="personalSpaceCapacityNeed"
                           placeholder="容量单位"
                           disabled
                >
                    <el-option label="GB"
                               value="GB"></el-option>
                    <el-option label="MB"
                               value="MB"></el-option>
                    <el-option label="KB"
                               value="KB"></el-option>
                </el-select>
            </el-form-item>
<!--            <el-form-item label="审批人">-->
<!--                <el-input v-model="personalSpace.personalSpaceApproving"-->
<!--                          placeholder="选择审批人"-->
<!--                          disabled="true"-->
<!--                          style="width: 670px"></el-input>-->
<!--            </el-form-item>-->

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

<style scoped>

</style>