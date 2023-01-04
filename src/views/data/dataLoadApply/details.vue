<template>
    <div class="admin_right_main">
        <el-form ref="form"
                 label-width="130px"
                 :model="form"
                 :inline="false">
            <el-row>
                <el-col :span="12">
                    <el-form-item label="申请名称 ">
                        <el-input type="text"
                                  v-model="form.applyName"
                                  style="width: 100%;"
                                  :rows="4"
                                  disabled>
                        </el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="申请人 ">
                        <el-input style="width: 100%;"
                                  type="text"
                                  placeholder="默认为当前登录人"
                                  v-model="form.applyPerson"
                                  :rows="4" disabled></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="操作类型">
                        <el-select
                                v-model="form.operationType"
                                id="operationType"
                                name="operationType"
                                disabled>
                            <el-option
                                    v-for="operationType in this.operationTypes"
                                    :value="operationType.value"
                                    :key="operationType.value"
                                    :label="operationType.label"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item v-if="form.operationType === '0'" label="装载类型 ">
                        <el-input style="width: 100%;"
                                  type="text"
                                  v-model="form.loadType"
                                  :rows="4" disabled></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="9">
                    <el-form-item v-if="form.operationType === '0'" label="行分隔符">
                        <el-input style="width: 100%;"
                                  type="text"
                                  v-model="form.lineSeparator"
                                  :rows="4" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="9">
                    <el-form-item v-if="form.operationType === '0'" label="列分隔符">
                        <el-input style="width: 100%;"
                                  type="text"
                                  v-model="form.columnSeparator"
                                  :rows="4" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="4">
                    <el-form-item v-if="form.operationType === '0'">
                        <el-checkbox v-model="form.isHeaderLine" true-label="true" style="margin-left: 20px" disabled>
                            首行为标题行
                        </el-checkbox>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item label="文件名" v-if="form.operationType === '0'">
                <el-input style="width: 100%;"
                          type="text"
                          v-model="form.fileName"
                          :rows="8" disabled></el-input>
            </el-form-item>
            <el-form-item label="文件路径 " v-if="form.operationType === '0'">
                <el-input style="width: 100%;"
                          type="text"
                          v-model="form.filePath"
                          disabled/>
            </el-form-item>
            <el-form-item v-if="form.operationType === '0'" style="margin-left: 40vh">
                <el-button @click="showFile(form)">点击查看文件内容</el-button>
            </el-form-item>


            <el-row v-if="form.operationType === '1'" style="margin-left: 10%">
                <el-col :span="24">
                    <el-table key="colMetaUuid"
                              v-loading="listLoading"
                              fit
                              height="200px"
                              highlight-current-row
                              style="width: 100%;">
                        <el-table-column label="序号" width="60px" align="center"/>
                        <el-table-column label="表路径" align="center">

                        </el-table-column>
                        <el-table-column label="归档方式" width="150px" align="center">
                            <template slot-scope="scope">
                                <el-select
                                        v-model="form.filingMove"
                                        id="fileMove"
                                        name="fileMove"
                                >
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="归档文件/表名称" align="center">
                            <template slot-scope="scope">
                                <el-select
                                        v-model="form.filingFile"
                                        id="filingFile"
                                        name="filingFile"
                                >
                                </el-select>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-col>
            </el-row>
        </el-form>
        <el-dialog v-if="dialogFileVisible"
                   :close-on-click-modal="false"
                   :visible.sync="dialogFileVisible"
                   append-to-body
                   title="文件内容"
                   width="60%"
                   heigth="60%"
        >
            <el-input v-model="this.fileString" :rows="20" type="textarea" disabled="disabled"></el-input>
            <el-button @click="dialogFileVisible = false">关闭</el-button>
        </el-dialog>
    </div>

</template>

<script>
    import {
        getById,//详情
        batchUpdateForFinishHandle,
        showFile, //文件查看
    } from "@/api/data/loadApply";

    export default {
        props: {
            detailsUuid: '',
        },
        data() {
            return {
                fileString: '',
                form: {
                    applyName: '',// 申请名称
                    applyPerson: '',// 申请人
                    applyPersonUuid: '',//申请人主键
                    operationType: '0',//操作类型
                    loadType: '',//装载类型
                    currentLink: '',//当前环节
                    status: '',//状态
                    applyTime: '',//申请时间
                    applyUuid: '',//单表主键
                    startTime: '',//开始时间
                    endTime: '',//结束时间
                    lineSeparator: '',//行分隔符
                    columnSeparator: '',//列分隔符
                    isHeaderLine: '',//首行为标题行
                    fileName: '',//文件名称
                    filePath: '',//文件路径
                    fileUuid: '',//文件编码
                    filingMove: '',//归档方式
                    filingFile: '',//归档文件
                    fileType: '',
                },
                operationTypes: [
                    {
                        value: '0',
                        label: '数据装载-一次性装载'
                    },
                    {
                        value: '1',
                        label: '数据下线'
                    }
                ],
                dialogFileVisible: false,
            }
        },
        mounted: function () {
            if (this.detailsUuid !== undefined) {
                this.queryByUuid(this.detailsUuid)
            }
            this.$emit("fromSon")
        },
        methods: {
            showFile(val) {
                console.log("form:", val);
                showFile(val)
                    .then((res) => {
                        this.fileString = res.data
                        console.log("res.data:", res.data)
                        console.log("this.fileString:", this.fileString)
                    })
                this.dialogFileVisible = true;
            },
            queryByUuid(value) {
                getById(value)
                    .then((res) => {
                        this.form = res.data
                        console.log("oldForm:", this.form)
                    })
            },
            updateApplyStatus(value) {
                let loadDownApply = {
                    applyUuid: value
                }
                let relParam = []
                relParam.push(loadDownApply)
                batchUpdateForFinishHandle(relParam)
            },
        }
    }
</script>

<style scoped>
    .admin_right_main >>> .el-form-item {
        margin-top: 25px !important;
        display: flex;
    }

    .admin_right_main >>> .el-form-item--medium .el-form-item__label {
        text-align: right;
        float: left !important;
    }

    .admin_right_main >>> .el-form-item__content {
        flex: 1;
        margin-left: 0 !important;
        float: left;
    }

    .admin_right_main >>> .el-textarea .el-textarea__inner {
        resize: none;
    }
</style>