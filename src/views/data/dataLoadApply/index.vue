<template>
    <!--数据资源管理 数据装载与下线申请 -->
    <div class="page-container">
        <div class="filter-container">
            <div class="query-field">
                <el-form :inline="true"
                         :model="query"
                         label-position="bottom">
                    <el-row>
                        <el-col>
                            <el-form-item label="申请名称：" prop="applyName">
                                <el-input v-model="query.applyName"
                                          clearable/>
                            </el-form-item>
                            <el-form-item label="申请人：" prop="applyPerson">
                                <el-input v-model="query.applyPerson"
                                          clearable/>
                            </el-form-item>
                            <el-form-item label="列表类型：" prop="status">
                                <el-select v-model="query.status"
                                           clearable
                                           placeholder="请选择列表类型">
                                    <el-option v-for="item in statusType"
                                               :key="item.value"
                                               :label="item.label"
                                               :value="item.value"/>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="申请时间范围：" prop="applyTime" style="display: inline-block;">
                                <el-date-picker
                                        v-model="query.startTime"
                                        type="datetime"
                                        placeholder="开始时间"
                                        value-format="yyyy-MM-dd HH:mm:ss"/>
                                <el-date-picker
                                        v-model="query.endTime"
                                        type="datetime"
                                        placeholder="结束时间"
                                        value-format="yyyy-MM-dd HH:mm:ss"/>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @keyup.enter.native="search" @click="search()">查询</el-button>
                                <el-button type="primary" @click="clearAll()">重置</el-button>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </div>
            <div class="padding10">
                <div class="right_btn">
                    <el-button size="mini" type="primary" @click="apply_add()">添加</el-button>
                    <el-button size="mini" type="primary" :disabled="Selectval_list.length === 0" @click="apply_deletes()">删除</el-button>
                    <el-button size="mini" type="primary" :disabled="Selectval_list.length === 0" @click="apply_transact()">办理</el-button>
                    <el-button size="mini" type="primary" :disabled="Selectval_list.length !== 1" @click="apply_edit()">编辑</el-button>
                </div>
            </div>
            <el-table v-loading="listLoading"
                      :data="page_list.records"
                      fit
                      highlight-current-row
                      style="width: 100%"
                      height="calc(100vh - 320px)"
                      @selection-change="handleSelectionChange">
                <el-table-column type="selection"
                                 width="55"/>
                <el-table-column label="申请名称"
                                 prop="applyName"
                                 min-width="150px"
                                 show-overflow-tooltip/>
                <el-table-column label="申请时间"
                                 :formatter="formatApplyTime"
                                 align="center"
                                 min-width="100px"
                                 prop="applyTime"
                                 show-overflow-tooltip/>
                <el-table-column label="当前环节"
                                 align="center"
                                 min-width="100px"
                                 prop="currentLink"
                                 show-overflow-tooltip/>
                <el-table-column label="上一办理人"
                                 align="center"
                                 min-width="100px"
                                 prop=""/>
                <el-table-column label="状态"
                                 align="center"
                                 min-width="100px"
                                 prop="status">
                </el-table-column>
                <el-table-column label="申请人"
                                 align="center"
                                 min-width="100px"
                                 prop="applyPerson"/>
                <el-table-column label="流程查看"
                                 align="center"
                                 min-width="100px"
                                 prop="viewProcess">
                    <template slot-scope="scope">
                        <el-link type="primary"
                                 :underline="false"
                                 @click="todoOpinionList(scope.row)">流程跟踪
                        </el-link>
                    </template>
                </el-table-column>
                <el-table-column label="操作"
                                 align="center"
                                 min-width="100px"
                                 prop="applyPerson">
                    <template slot-scope="scope">
                        <el-button type="primary"
                                   class="oper-btn detail"
                                   title="详情"
                                   @click="show_details(scope.row.applyUuid)"/>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-pagination v-show="page_list.total>0"
                       :total="page_list.total"
                       :current-page="page_list.currentPage"
                       background
                       @current-change="handleCurrentChange"
                       @size-change="handleSizeChange"
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        <!-- 添加 -->
        <el-dialog :title="title"
                   class="data_res"
                   :visible.sync="applyDialogVisible"
                   @close="handleClose('form')"
                   width="70%">
            <el-form :rules="rules"
                     ref="form"
                     label-width="130px"
                     :model="form"
                     :inline="false">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="申请名称 "
                                      prop="applyName">
                            <el-input type="text"
                                      v-model="form.applyName"
                                      style="width: 100%;"
                                      :rows="4">
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="申请人 "
                                      prop="applyPerson">
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
                        <el-form-item label="操作类型" prop="operationType">
                            <el-select
                                    v-model="form.operationType"
                                    id="operationType"
                                    name="operationType"
                                    :disabled="dialogStatusValue"
                            >
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
                        <el-form-item v-if="form.operationType === '0'" label="装载类型 " prop="loadType">
                            <el-select
                                    v-model="form.loadType"
                                    id="loadType"
                                    name="loadType"
                            >
                                <el-option value="">请选择</el-option>
                                <el-option value="个人数据">个人数据</el-option>
                                <el-option value="全行数据">全行数据</el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col>
                        <el-form>
                            <el-form-item v-if="form.operationType === '0'">
                                <div style="float:right">
                                    <el-upload
                                            class="upload-demo"
                                            ref="upload"
                                            :on-change="select"
                                            action=""
                                            :file-list="fileList"
                                            :http-request="uploadOk"
                                            :show-file-list="false"
                                            :auto-upload="false"
                                            accept=".xls,.xlsx,.txt">
                                        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                                        <el-button style="margin-left: 10px;" size="small" type="success"
                                                   @click="submitUpload">上传
                                        </el-button>
                                    </el-upload>
                                </div>
                            </el-form-item>
                        </el-form>
                    </el-col>
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
                            <template slot-scope="scope">
                                <el-select
                                        v-model="scope.row.lineSeparator"
                                        id="lineSeparator"
                                        name="lineSeparator"
                                        style="width: 80%"
                                        :disabled="scope.row.disabled"
                                >
                                    <el-option
                                            v-for="lineSeparator in lineSeparators"
                                            :value="lineSeparator.value"
                                            :key="lineSeparator.value"
                                            :label="lineSeparator.label"
                                    ></el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column
                                prop="columnSeparator"
                                label="列分隔符"
                                min-width="100px"
                                align="center"
                                show-overflow-tooltip>
                            <template slot-scope="scope">
                                <el-select
                                        v-model="scope.row.columnSeparator"
                                        id="columnSeparator"
                                        name="columnSeparator"
                                        style="width: 80%"
                                        :disabled="scope.row.disabled"
                                >
                                    <el-option
                                            v-for="columnSeparator in columnSeparators"
                                            :value="columnSeparator.value"
                                            :key="columnSeparator.value"
                                            :label="columnSeparator.label"
                                    ></el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column prop="isHeaderLine"
                                         label="首行是否为标题行"
                                         align="center"
                                         min-width="80px"
                        >
                            <template slot-scope="scope">
                                <el-checkbox v-model="scope.row.isHeaderLine" true-label="true" false-label="false">
                                </el-checkbox>
                            </template>
                        </el-table-column>
                        <el-table-column align="center" min-width="80px" label="操作">
                            <template slot-scope="scope">
                                <el-link
                                        size="mini"
                                        type="danger"
                                        style="margin-right:10px"
                                        @click="lineDelete(scope.$index,'file')"
                                >删除
                                </el-link>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-row>


                <el-row v-if="form.operationType === '1'" style="margin-left: 10%">
                    <el-col :span="6">
                        <el-form-item>
                            <DataTree>

                            </DataTree>
                        </el-form-item>
                    </el-col>
                    <el-col :span="2" style="width: 45px; padding-top: 60px">
                        <div class="transfer-center">
                            <p class="transfer-center-item">
                                <el-button
                                        type="primary"
                                        icon="el-icon-arrow-right"
                                        circle
                                        @click="addApply"
                                />
                            </p>
                            <p class="transfer-center-item">
                                <el-button
                                        type="primary"
                                        icon="el-icon-arrow-left"
                                        circle
                                        @click="delApply"
                                />
                            </p>
                        </div>
                    </el-col>
                    <el-col :span="16">
                        <el-table key="colMetaUuid"
                                  v-loading="listLoading"
                                  border
                                  fit
                                  height="316px"
                                  highlight-current-row
                                  style="width: 100%;"
                                  @selection-change="handleSelectionChange">
                            <!--                            <el-table-column width="40px" type="selection"/>-->
                            <el-table-column type="selection" width="55px"/>
                            <el-table-column label="序号" width="60px" align="center" prop="applyId"/>
                            <el-table-column
                                    label="表路径"
                                    min-width="150px"
                                    show-overflow-tooltip>
                            </el-table-column>
                            <el-table-column
                                    label="归档方式"
                                    min-width="200px"
                                    align="center"
                                    prop="createTime"
                                    show-overflow-tooltip>
                                <template slot-scope="scope">
                                    <el-select
                                            v-model="form.filingMove"
                                            id="fileMove"
                                            name="fileMove"
                                    >
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    label="归档文件/表名称"
                                    align="center"
                                    min-width="200px"
                                    prop="createTime"
                                    show-overflow-tooltip>
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

            <span slot="footer"
                  class="dialog-footer">
          <el-button @click="applyDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     :disabled="isDisable"
                     @click="save('form')">保存</el-button>

        </span>

        </el-dialog>

        <el-dialog v-if="dialogVisible"
                   :close-on-click-modal="false"
                   :visible.sync="dialogVisible"
                   title="流程提交"
                   width="50%"
        >
            <div>
                <FlowItem
                        ref="flowItem"
                        :flowSet="flowSet"
                        :flowItem="flowItem"
                        :flow-param="flowParam"
                        :columnDefs="columnDefs"
                        :submitData="submitData"
                        @closeModal="closeFlowItem"
                        @delectData="delectData"
                ></FlowItem>
            </div>
            <span class="sess-flowitem" slot="footer">
        <el-button
                size="mini"
                type="primary"
                class="table_header_btn"
                @click="saveOpinion"
        >提交</el-button
        >
        <el-button
                size="mini"
                type="primary"
                class="table_header_btn"
                @click="dialogVisible = false"
        >关闭</el-button
        >
      </span>
        </el-dialog>


        <el-dialog v-if="dialogDetailVisible"
                   :close-on-click-modal="false"
                   :visible.sync="dialogDetailVisible"
                   title="详情"
                   width="50%"
        >
            <div>
                <Details ref="detailsUuid"
                         :detailsUuid='detailsUuid'
                ></Details>
            </div>
            <el-button
                    size="mini"
                    type="primary"
                    class="table_header_btn"
                    @click="dialogDetailVisible = false"
            >关闭
            </el-button
            >
        </el-dialog>

        <!--流程跟踪弹窗-->
        <el-dialog
                title="流程跟踪"
                :visible.sync="todoFlow"
                v-if="todoFlow"
                width="80%"
        >
            <div>
                <flowOpinionList :applyUuid="applyUuid" :pageFrom="applyPage"></flowOpinionList>
            </div>
            <span slot="footer">
            <el-button
                    size="mini"
                    type="info"
                    class="table_header_btn"
                    @click="todoFlow = false"
            >关闭</el-button
            >
          </span>
        </el-dialog>

    </div>

</template>

<script>
    import {
        page_list_data,//列表
        getById,//详情
        save_data,//新增保存
        update_data,//编辑保存
        delete_data,//删除
        batchUpdateForHandle,
        upload
    } from "@/api/data/loadApply";
    import FileImport from '@/views/data/dataLoadApply/fileupload';
    import DataTree from '@/components/public/tree/src/tree';
    import FlowItem from '@/components/starflow/todowork/flowItem';
    import Details from '@/views/data/dataLoadApply/details';
    import flowOpinionList from "@/components/starflow/todowork/flowOpinionList"


    export default {
        components: {FileImport, DataTree, FlowItem, Details, flowOpinionList},
        data() {
            return {
                fileList: [],
                tableData: [],
                splitName: [],
                file: {
                    fileName: '',
                    fileType: '',
                    lineSeparator: '回车换行符',
                    columnSeparator: '制表符',
                    isHeaderLine: 'true',
                    disabled: false,
                },


                // 查询列表
                query: {
                    applyName: '',// 申请名称
                    applyPerson: '',// 申请人
                    status: '',// 列表类型
                    startTime: '',//开始时间
                    endTime: '',//结束时间
                    pageNo: 1,
                    pageSize: 10,
                },
                //工作流办理状态
                statusType: [
                    {
                        value: '草稿',
                        label: '草稿'
                    },
                    {
                        value: '办理中',
                        label: '办理中'
                    },
                    {
                        value: '已办',
                        label: '已办'
                    },
                ],
                listLoading: false,
                page_list: [],//列表
                details: {
                    applyName: '',// 申请名称
                    applyPerson: '',// 申请人
                    applyPersonUuid: '',//申请人主键
                    operationType: '',//操作类型
                    loadType: '',//装载类型
                    currentLink: '',//当前环节
                    status: '',//状态
                    applyTime: '',//申请时间
                    startTime: '',//开始时间
                    applyUuid: '',//单表主键
                    endTime: '',//结束时间
                    lineSeparator: '',//行分隔符
                    columnSeparator: '',//列分隔符
                    fileName: '',//文件名称
                    filePath: '',//文件路径
                    fileUuid: '',//文件编码
                    filingMove: '',//归档方式
                    filingFile: '',//归档文件
                    fileType: '',
                },
                //详情
                Selectval_list: [],//多选的值
                //装载类型
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
                //行分隔符
                lineSeparators: [
                    {
                        value: '回车换行符',
                        label: '回车换行符'
                    },
                    {
                        value: '回车符',
                        label: '回车符'
                    },
                    {
                        value: '换行符',
                        label: '换行符'
                    },
                    {
                        value: '冒号',
                        label: '冒号'
                    },
                    {
                        value: '分号',
                        label: '分号'
                    },
                    {
                        value: '逗号',
                        label: '逗号'
                    },
                    {
                        value: '制表符',
                        label: '制表符'
                    },
                    {
                        value: '竖线',
                        label: '竖线'
                    }
                ],
                //列分隔符
                columnSeparators: [
                    {
                        value: '回车换行符',
                        label: '回车换行符'
                    },
                    {
                        value: '回车符',
                        label: '回车符'
                    },
                    {
                        value: '换行符',
                        label: '换行符'
                    },
                    {
                        value: '冒号',
                        label: '冒号'
                    },
                    {
                        value: '分号',
                        label: '分号'
                    },
                    {
                        value: '逗号',
                        label: '逗号'
                    },
                    {
                        value: '制表符',
                        label: '制表符'
                    },
                    {
                        value: '竖线',
                        label: '竖线'
                    }
                ],
                inputTypeValueStr: null,
                // 新增的数据
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
                    fileName: '',//文件名称
                    filePath: '',//文件路径
                    fileUuid: '',//文件编码
                    filingMove: '',//归档方式
                    filingFile: '',//归档文件
                    fileType: '',
                },
                isDisable: false, //防止重复提交
                applyDialogVisible: false,//申请弹窗
                dialogVisible: false,//流程弹窗
                dialogDetailVisible: false,//详情弹窗
                title: '', //弹窗标题
                fileType: '',
                //新增编辑弹窗状态
                dialogStatus: '',
                updateShow: false,
                applySelectionList: [],
                todoFlow: false, //流程查看的弹窗控制
                applyPage: 'applyPage', //有这个标识 查询流程的时候会走相对应的方法

                rules: {
                    applyName: [
                        {required: true, message: '请输入名称', trigger: 'blur'},
                    ],
                    // applyPerson: [
                    //     // { required: true, message: '请输入申请人', trigger: 'blur' },
                    // ],
                    operationType: [
                        {required: true, message: '请选择操作类型', trigger: 'change'},
                    ],
                    loadType: [
                        {required: true, message: '请选择装载类型', trigger: 'change'},
                    ],
                    lineSeparator: [
                        {required: true, message: '请选择行操作符', trigger: 'change'},
                    ],
                    columnSeparator: [
                        {required: true, message: '请选择列操作符', trigger: 'change'},
                    ],
                },
                //工作流相关
                flowSet: {
                    opinionList: false,
                    opinion: false,
                    nextStep: true,
                    isSecond: false,
                },
                //工作流相关
                flowItem: {
                    //动态赋值
                    wftype: "auditNotice",
                    applyUuid: "",
                    detailUuids: "",
                    applyTitle: "",
                    workEffortId: "",
                    appDataUuid: "",
                    versionUuid: "",
                    isSecond: false,
                    temp1: "",
                },
                //工作流相关
                flowParam: 0,
                //工作流相关
                columnDefs: [],
                //工作流相关
                submitData: {
                    versionUuid: "tlLuwUhC",
                    busTableName: "", //表名
                    busDatabaseName: "warehouse", //数据库名
                    busDatabaseType: "", //
                    status: "1", //预警数据状态
                    busdatas: [],
                },
                //工作流相关
                temp: {
                    sceneUuid: undefined,
                    sceneName: '',
                    sceneCode: ''
                },
                detailsUuid: '',
                //判断是新增还是修改，状态标识符
                dialogStatusValue: false,
            };
        },
        computed: {},
        watch: {},
        created() {
            this.getList();//刷新列表
        },
        methods: {
            select(file, fileList) {
                this.file.disabled = true
                this.fileList = fileList;
                const time = new Date().getTime();
                for (let i = 0; i < this.fileList.length; i++) {
                    // console.log("fileList:",this.fileList[i])
                    // this.splitName = this.fileList[i].name.split('.');
                    // console.log("this.splitName",this.splitName)
                    // this.fileList[i].name = this.splitName[0] + time + "." + this.splitName[1];
                    // console.log("fileList.fileName:",this.fileList[i].name)
                    this.splitName = this.fileList[i].name.split('.');
                    let fileName = this.splitName[0] + time + "." + this.splitName[1];
                    let f = new File([fileList[i].raw],fileName);
                    f.uid = fileList[i].uid;
                    this.fileList[i].raw = f;
                    this.fileList[i].name = this.splitName[0] + time + "." + this.splitName[1];
                    console.log(fileList[i])
                }
                let extName = file.name.substring(file.name.lastIndexOf(".") + 1).toLowerCase();
                this.tableData.push(this.file)
                this.file.fileName = file.name;
                if (extName === 'txt') {
                    this.file.fileType = '文本文件'
                    this.file.disabled = false
                } else if (extName === 'xls') {
                    this.file.fileType = 'EXCEL数据表(97-2003)'
                } else if (extName === 'xlsx') {
                    this.file.fileType = 'EXCEL数据表(2010)'
                }
                console.log("tableData:", this.tableData)
                console.log("fileList:", fileList)
                this.file = this.$options.data().file
            },
            submitUpload() {
                if (this.fileList.length === 0) {
                    this.$notify.warning("请选择文件后上传！")
                    return
                }
                console.log("测试")
                this.$refs.upload.submit();
            },
            uploadOk(file, fileList) {
                let fd = new FormData();
                for (let i = 0; i < this.fileList.length; i++) {
                    fd.append("files", this.fileList[i].raw);
                }
                upload(fd).then(() => {
                    this.$notify({
                        title: "成功",
                        message: "上传成功",
                        type: "success",
                        duration: 2000,
                        position: "bottom-right",
                    });
                })
            },
            // 动态删除一行
            lineDelete(index, ipTable) {
                console.log("ipTable:", ipTable)
                console.log("index:", index)
                switch (ipTable) {
                    case 'file':
                        this.tableData.splice(index, 1)
                        break
                }
                this.fileList.splice(index, 1)
            },


            //添加
            apply_add() {
                this.applyDialogVisible = true
                this.dialogStatusValue = false
                this.dialogStatus = 'create'
                this.title = '创建申请'
                this.fileType = ''
                // 清除校验
                if (this.$refs.form) {
                    this.$nextTick(() => {
                        this.$refs['form'].clearValidate()
                    })
                }
            },
            // 编辑
            apply_edit() {
                let applyUuid = '';
                this.Selectval_list.forEach((r) => {
                    applyUuid = r.applyUuid;
                });
                this.applyDialogVisible = true
                this.isDisable = false
                this.updateShow = true
                this.dialogStatusValue = true

                this.title = '编辑申请'
                this.dialogStatus = 'update'

                this.form.applyUuid = applyUuid
                this.details_details();
            },
            //删除
            apply_deletes() {
                let applyUuids = [];
                this.Selectval_list.forEach((r) => {
                    applyUuids.push(r.applyUuid);
                });
                this.$confirm("确定删除所选申请?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                    center: true,
                }).then(() => {
                    delete_data(applyUuids.join(",")).then(() => {
                        this.getList();
                        this.$notify({
                            title: "成功",
                            message: "删除成功",
                            type: "success",
                            duration: 2000,
                            position: "bottom-right",
                        });
                    });
                });
            },
            //办理
            apply_transact() {
                this.temp = Object.assign({}, this.applySelectionList[0])
                // alert(JSON.stringify(this.temp))
                //业务主键
                this.flowItem.appDataUuid = this.temp.applyUuid;
                //版本id 随机生成
                this.flowItem.versionUuid = this.common.randomString4Len(8);
                // this.flowItem.applyTitle="场景详情流程";
                //申请业务的名字（待办标题）
                this.flowItem.applyTitle = this.temp.applyName;
                this.dialogVisible = true
            },
            //工作流相关
            closeFlowItem(val) {
                this.dialogVisible = val;
                this.flowParam = 0;
                // this.initData();
            },
            //工作流相关
            delectData(val) {
                this.dialogVisible = val;
            },
            // 时间格式化
            formatApplyTime(row) {
                // 拼接日期规格为YYYY-MM-DD hh:mm:ss
                let applyTime = new Date(row.applyTime)
                return applyTime.getFullYear() + '-' + (applyTime.getMonth() + 1) + '-' + applyTime.getDate() + ' ' + applyTime.getHours() + ':' + applyTime.getMinutes() + ':' + applyTime.getSeconds()
            },

            // 清空
            clearAll() {
                this.query.applyName = ''
                this.query.applyPerson = ''
                this.query.status = ''
                this.query.startTime = ''
                this.query.endTime = ''
            },
            search() {
                this.query.pageNo = 1
                this.getList();//刷新列表
            },
            // 刷新列表
            getList() {
                this.listLoading = true
                let params = {
                    condition: {
                        applyName: this.query.applyName,
                        applyPerson: this.query.applyPerson,
                        status: this.query.status,
                        startTime: this.query.startTime,
                        endTime: this.query.endTime,
                    },
                    pageNo: this.query.pageNo,
                    pageSize: this.query.pageSize,
                }
                page_list_data(params).then(res => {
                    this.page_list = res.data;
                    this.listLoading = false
                })
            },
            //详情
            show_details(applyUuid) {
                this.form.applyUuid = applyUuid
                this.detailsUuid = applyUuid
                this.dialogDetailVisible = true
            },

            // 编辑 接口
            details_details() {
                getById(this.form.applyUuid).then(res => {
                    console.log("res.data:", res.data)
                    this.form = res.data
                    this.tableData = res.data.fileList
                })
            },
            // 多选
            handleSelectionChange(val) {
                this.applySelectionList = []
                this.Selectval_list = val;
                val.forEach((value) => {
                    this.applySelectionList.push(value)
                })
            },
            // 分页
            handleCurrentChange(val) {
                this.query.pageNo = val
                this.getList()
            },
            // 每页多少条
            handleSizeChange(val) {
                this.query.pageSize = val
                this.getList()
            },

            // 新建保存 && 编辑保存
            save(form) {
                this.isDisable = true
                setTimeout(() => {
                    this.isDisable = false
                }, 2000)

                this.$refs[form].validate((valid) => {
                    if (valid) {
                        if (this.title === '创建申请') {
                            let params = {
                                loadDownApply: {
                                    applyName: this.form.applyName,
                                    applyPerson: this.form.applyPerson,
                                    operationType: this.form.operationType,
                                    loadType: this.form.loadType,
                                },
                                // tableData: {
                                //
                                // },
                                "tableData": JSON.stringify(this.tableData),
                            }
                            console.log("this.tableData.length:", this.tableData.length)
                            if (this.tableData.length === 0) {
                                this.$notify.warning("请选择文件！")
                                return
                            }
                            //save_data方法调用后台save接口实现新增功能
                            save_data(params).then(res => {
                                if (res.code === 0) {
                                    this.$message({
                                        message: '新增成功',
                                        type: 'success',
                                        showClose: true,
                                    })
                                    this.applyDialogVisible = false
                                    this.getList()
                                } else {
                                    this.$message({
                                        message: res.msg,
                                        type: 'error',
                                        showClose: true,
                                    })
                                }
                            })
                        } else {
                            let params = {
                                loadDownApply: {
                                    applyUuid: this.form.applyUuid,
                                    applyName: this.form.applyName,
                                    operationType: this.form.operationType,
                                    loadType: this.form.loadType,
                                },
                                "tableData": JSON.stringify(this.tableData),
                            }
                            //只有状态为草稿时才能实现对数据的编辑修改
                            if (this.form.status !== '草稿') {
                                this.$notify.warning("只有草稿状态可修改")
                                return
                            }
                            //update_data方法调用后台update接口实现编辑功能
                            update_data(params).then(res => {
                                if (res.code === 0) {
                                    this.$message({
                                        message: '编辑成功',
                                        type: 'success',
                                        showClose: true,
                                    })
                                    this.applyDialogVisible = false
                                    this.dialogStatusValue = false
                                    this.getList()
                                } else {
                                    this.$message({
                                        message: res.msg,
                                        type: 'error',
                                        showClose: true,
                                    })
                                }
                            })
                        }
                    } else {
                        this.$message({
                            message: '请填写信息',
                            type: 'info',
                            showClose: true,
                        })
                        return false
                    }
                })
            },

            // 关闭弹窗
            handleClose(form) {
                this.$refs[form].resetFields() //清空添加的值
                this.updateShow = false
                this.fileList = []
                this.tableData = []
            },
            //子组件fileupload传值给父组件，用showFileType事件接收值赋给变量fileType
            showFileType(fileType) {
                this.fileType = fileType;
            },
            //子组件fileupload传值给父组件，用showFilePath事件接收值赋给变量fileType
            showFilePath(filePath) {
                this.form.fileName = filePath;
            },
            //打开流程跟踪弹窗
            todoOpinionList(row) {
                this.applyUuid = row.applyUuid;
                this.todoFlow = true;
            },
            addApply() {

            },
            delApply() {

            },
            //工作流相关
            saveOpinion() {
                //保存业务数据成功后
                setTimeout(() => {
                    this.$refs["flowItem"].submitFlow();
                    //将状态修改为办理中
                    batchUpdateForHandle(this.applySelectionList)
                        .then(() => {
                            location.reload()
                        })
                }, 20);
            },
        }

    };
</script>

<style scoped>
    .right_btn {
        display: flex;
        float: right;
    }

    @import url("./../../../assets/css/common.css");

    .data_res >>> .el-form-item {
        margin-top: 25px !important;
        display: flex;
    }

    .data_res >>> .el-form-item--medium .el-form-item__label {
        text-align: right;
        float: left !important;
    }

    .data_res >>> .el-form-item__content {
        flex: 1;
        margin-left: 0 !important;
        float: left;
    }

    .data_res >>> .el-textarea .el-textarea__inner {
        resize: none;
    }

    .transfer-center-item {
        width: 40px;
        height: 80px;
    }
</style>
