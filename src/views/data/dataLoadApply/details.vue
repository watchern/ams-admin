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
            <el-table v-if="form.operationType === '0'"
                      :data="tableData"
                      height="250"
                      border
                      style="width: 100%">
                <el-table-column
                        prop="fileName"
                        min-width="100px"
                        label="文件名"
                        show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                        prop="fileType"
                        min-width="100px"
                        label="文件类型"
                        align="center"
                        show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                        prop="lineSeparator"
                        min-width="100px"
                        label="行分隔符"
                        align="center"
                        show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                        prop="columnSeparator"
                        label="列分隔符"
                        min-width="100px"
                        align="center"
                        show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="isHeaderLine"
                                 label="首行是否为标题行"
                                 align="center"
                                 min-width="80px"
                >
                    <template slot-scope="scope">
                        <el-checkbox v-model="scope.row.isHeaderLine" :disabled="true" true-label="true" false-label="false">
                        </el-checkbox>
                    </template>
                </el-table-column>

            </el-table>
            <el-row v-if="form.operationType === '1'" style="margin-left: 10%">
                <el-col :span="24">
                    <el-table key="colMetaUuid"
                              v-loading="listLoading"
                              border
                              fit
                              :data="tableDataOffline"
                              height="316px"
                              highlight-current-row
                              style="width: 100%;">
                        <el-table-column label="序号" width="60px" align="center" type="index"/>
                        <el-table-column
                                label="表路径"
                                prop="tablePath"
                                min-width="150px"
                                show-overflow-tooltip>
                        </el-table-column>
                        <el-table-column
                                label="归档方式"
                                min-width="200px"
                                align="center"
                                prop="archiveType"
                                show-overflow-tooltip>
                            <template slot-scope="scope">
                                <el-select v-model="scope.row.archiveType" placeholder="请选择" disabled>
                                    <el-option
                                            v-for="item in options"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value">
                                    </el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column
                                label="归档文件/表名称"
                                align="center"
                                min-width="200px"
                                prop="archiveFileTableName"
                                show-overflow-tooltip>
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.archiveFileTableName" id="filingFile" disabled
                                ></el-input>
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
                tableData: [],
                tableDataOffline:[],
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
                showFile(val)
                    .then((res) => {
                        this.fileString = res.data
                    })
                this.dialogFileVisible = true;
            },
            queryByUuid(value) {
                getById(value)
                    .then((res) => {
                        this.form = res.data
                        this.tableData = res.data.fileList
                        this.tableDataOffline = res.data.fileList
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
