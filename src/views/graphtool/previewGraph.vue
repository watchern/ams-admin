<template>
    <div ref="basicInfo">
        <el-form ref="basicInfoForm" :model="formData" class="detail-form">
            <el-row>
                <el-col>
                    <el-form-item label="图形名称" prop="graphName">
                        <el-input v-model="formData.graphName" :disabled="true" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="图形类型" prop="graphType">
                        <el-select v-model="formData.graphType" :disabled="true" style="width: 100%">
                            <el-option label="个人图形" :value="1" />
                            <el-option label="他人分享图形" :value="2" />
                            <el-option label="场景查询图形" :value="3" />
                            <el-option label="个人场景查询图形" :value="5" />
                            <el-option label="模型图形" :value="4" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12" style="padding-left: 10px;">
                    <el-form-item label="执行状态" prop="executeStatus">
                        <el-select v-model="formData.executeStatus" :disabled="true" style="width: 100%">
                            <el-option label="全部执行" :value="1" />
                            <el-option label="部分执行" :value="2" />
                            <el-option label="未执行" :value="3" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col>
                    <el-form-item label="创建人" prop="createUserName">
                        <el-input v-model="formData.createUserName" :disabled="true" />
                    </el-form-item>
                </el-col>
                <el-col>
                    <el-form-item label="创建时间" prop="createTime">
                        <el-input v-model="formData.createTime" :disabled="true" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col>
                    <el-form-item label="修改人" prop="updateUserName">
                        <el-input v-model="formData.updateUserName" :disabled="true" />
                    </el-form-item>
                </el-col>
                <el-col>
                    <el-form-item label="修改时间" prop="updateTime">
                        <el-input v-model="formData.updateTime" :disabled="true" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col>
                    <el-form-item label="图形描述" prop="description">
                        <el-input v-model="formData.description" autosize type="textarea" :disabled="true" />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script>
    import { getGraphInfoById } from '@/api/graphtool/apiJs/graphList'
    export default {
        name: 'PreviewGraph',
        props: ['graphUuid'],
        data() {
            return {
                formData: {
                    graphName: '',
                    graphType: '',
                    executeStatus: '',
                    createUserName: '',
                    createTime: '',
                    updateUserName: '',
                    updateTime: '',
                    description: ''
                }
            }
        },
        created() {
            getGraphInfoById(this.graphUuid).then(response => {
                if (response.data) {
                    response.data.createTime = this.dateFormatter(response.data.createTime)
                    response.data.updateTime = this.dateFormatter(response.data.updateTime)
                    this.formData = { ...this.formData, ...response.data }// 覆盖赋值
                } else {
                    this.$message.error('加载图形详情信息失败')
                }
            })
        },
        methods:{
            dateFormatter(datetime) {
                let timeStr = ''
                if (datetime && datetime.trim().length > 0) {
                    let dateMat = new Date(datetime)
                    let year = dateMat.getFullYear()
                    let month = this.convertData(dateMat.getMonth() + 1)
                    let day = this.convertData(dateMat.getDate())
                    let hh = this.convertData(dateMat.getHours())
                    let mm = this.convertData(dateMat.getMinutes())
                    let ss = this.convertData(dateMat.getSeconds())
                    timeStr = year + '-' + month + '-' + day + ' ' + hh + ':' + mm + ':' + ss
                }
                return timeStr
            },
            convertData(str){
                if(str < 10){
                    str = `0${str}`
                }
                return str
            }
        }
    }
</script>
