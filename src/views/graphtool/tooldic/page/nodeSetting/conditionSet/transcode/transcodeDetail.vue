<template>
    <div style="height: 500px;overflow-y: auto;">
        <el-form :model="formData" class="detail-form">
            <el-row>
                <el-col>
                    <el-form-item label="规则名称">
                        <el-input v-model="formData.ruleName" :disabled="true" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col>
                    <el-form-item label="规则描述">
                        <el-input v-model="formData.ruleDesc" :disabled="true" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col>
                    <el-form-item label="转码方式">
                        <el-input v-model="formData.ruleType" :disabled="true" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col>
                    <el-form-item label="转码规则" v-if="isSql">
                        <!--<el-input type="textarea" v-model="formData.sqlContent" :disabled="true" autosize/>
                        <el-row style="margin-top: 10px;">
                            <el-col :span="4">
                                <label style="float: right;padding-right: 10px;">真实值</label>
                            </el-col>
                            <el-col :span="8">
                                <el-input v-model="formData.sceneName" :disabled="true" />
                            </el-col>
                            <el-col :span="4">
                                <label style="float: right;padding-right: 10px;">转码值</label>
                            </el-col>
                            <el-col :span="8">
                                <el-input v-model="formData.sceneCode" :disabled="true" />
                            </el-col>
                        </el-row>-->
                        <el-input type="textarea" v-model="formData.sqlContent" :disabled="true" autosize/>
                        <el-table height="200" :data="listValue" border fit highlight-current-row>
                            <el-table-column label="真实值" align="center" prop="codeValue"/>
                            <el-table-column label="转码值" align="center" prop="transValue"/>
                        </el-table>
                    </el-form-item>
                    <el-form-item label="转码规则" v-if="!isSql">
                        <el-table height="200" :data="listValue" border fit highlight-current-row>
                            <el-table-column label="真实值" align="center" prop="codeValue"/>
                            <el-table-column label="转码值" align="center" prop="transValue"/>
                        </el-table>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script>
    import {selectById} from '@/api/data/transCode'
    export default {
        name: "transcodeDetail",
        data(){
           return {
               formData:{
                   ruleName:'',
                   ruleDesc:'',
                   ruleType:'',
                   sqlContent:'',
                   sceneName:'',
                   sceneCode:''
               },
               listValue:[],
               isSql:false,
               id:''
           }
        },
        props:['transRuleUuid'],
        mounted(){
            this.init();
        },
        methods:{
            init(){
                let $this = this;
                selectById(this.transRuleUuid).then(res => {
                    $this.formData = {...$this.formData, ...res.data}
                    $this.listValue = res.data.transColRels
                    if ($this.formData.ruleType === 1) {
                        $this.formData.ruleType = 'SQL语句'
                        $this.isSql = true
                    } else {
                        $this.formData.ruleType = '手动添加'
                        $this.isSql = false
                    }
                })
            }
        }
    }
</script>
