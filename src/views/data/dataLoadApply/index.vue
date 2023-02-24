<template>
  <!--数据资源管理 数据装载与下线申请 -->
  <div class="page-container">
    <div class="pd20">
      <div class="filter-container">
        <div class="query-field">
          <el-form :inline="true"
                   :model="query"
                   label-position="bottom">
            <el-row>
              <el-col>
                <el-form-item label="申请名称："
                              prop="applyName">
                  <el-input v-model="query.applyName"
                            style="width: 200px"
                            clearable />
                </el-form-item>
                <el-form-item label="申请人："
                              prop="applyPerson">
                  <el-input v-model="query.applyPerson"
                            clearable />
                </el-form-item>
                <el-form-item label="列表类型："
                              prop="status">
                  <el-select v-model="query.status"
                             clearable
                             placeholder="请选择列表类型">
                    <el-option v-for="item in statusType"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value" />
                  </el-select>
                </el-form-item>
                <el-form-item label="申请时间范围："
                              prop="applyTime"
                              style="display: inline-block;">
                  <el-date-picker v-model="query.startTime"
                                  type="datetime"
                                  placeholder="开始时间"
                                  value-format="yyyy-MM-dd HH:mm:ss" />
                  <el-date-picker v-model="query.endTime"
                                  type="datetime"
                                  placeholder="结束时间"
                                  value-format="yyyy-MM-dd HH:mm:ss" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary"
                             @keyup.enter.native="search"
                             @click="search()">查询</el-button>
                  <el-button type="primary"
                             @click="clearAll()">重置</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div class="right_btn mb10">
          <el-button class="oper-btn"
                     type="primary"
                     @click="apply_add()"> <img src="../../../styles/image/add.png"
                 class="btn_icon icon1"
                 alt="">
            <img src="../../../styles/image/add2.png"
                 class="btn_icon icon2"
                 alt="">新增
          </el-button>
          <el-button type="primary"
                     class="oper-btn"
                     :disabled="Selectval_list.length === 0"
                     @click="apply_deletes()"><img src="../../../styles/image/delete.png"
                 class="btn_icon icon1"
                 alt="">
            <img src="../../../styles/image/delete2.png"
                 class="btn_icon icon2"
                 alt="">删除
          </el-button>
          <el-button class="oper-btn"
                     type="primary"
                     :disabled="Selectval_list.length === 0"
                     @click="apply_transact()">
            <img src="../../../styles/image/ban.png"
                 class="btn_icon icon1"
                 alt="">
            <img src="../../../styles/image/ban2.png"
                 class="btn_icon icon2"
                 alt="">办理
          </el-button>
          <el-button type="primary"
                     class="oper-btn"
                     :disabled="Selectval_list.length !== 1"
                     @click="apply_edit()">
            <img src="../../../styles/image/edits.png"
                 class="btn_icon icon1"
                 alt="">
            <img src="../../../styles/image/edits2.png"
                 class="btn_icon icon2"
                 alt="">编辑
          </el-button>
        </div>
        <el-table v-loading="listLoading"
                  :data="page_list.records"
                  fit
                  highlight-current-row
                  style="width: 100%"
                  height="calc(100vh - 280px)"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection"
                           width="55" />
          <el-table-column label="申请名称"
                           prop="applyName"
                           min-width="150px"
                           show-overflow-tooltip />
          <el-table-column label="申请时间"
                           :formatter="formatApplyTime"
                           align="center"
                           min-width="100px"
                           prop="applyTime"
                           show-overflow-tooltip />
          <!--                <el-table-column label="当前环节"-->
          <!--                                 align="center"-->
          <!--                                 min-width="100px"-->
          <!--                                 prop="currentLink"-->
          <!--                                 show-overflow-tooltip/>-->
          <!--                <el-table-column label="上一办理人"-->
          <!--                                 align="center"-->
          <!--                                 min-width="100px"-->
          <!--                                 prop=""/>-->
          <el-table-column label="状态"
                           align="center"
                           min-width="100px"
                           prop="status">
          </el-table-column>
          <el-table-column label="申请人"
                           align="center"
                           min-width="100px"
                           prop="applyPerson" />
          <el-table-column label="流程查看"
                           align="center"
                           min-width="100px"
                           prop="viewProcess">
            <template slot-scope="scope">
              <el-link v-if="scope.row.status == '办理中' || scope.row.status == '办理完成'"
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
              <el-link type="text"
                       :underline="false"
                       @click="show_details(scope.row.applyUuid)">详情</el-link>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-pagination v-show="page_list.total>0"
                     :total="page_list.total"
                     :current-page="page_list.currentPage"
                     @current-change="handleCurrentChange"
                     @size-change="handleSizeChange"
                     layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      <!-- 添加 -->
      <el-dialog :title="title"
                 class="data_res"
                 top="5vh"
                 :visible.sync="applyDialogVisible"
                 @close="handleClose('form')"
                 width="70%">
        <el-form :rules="rules"
                 ref="form"
                 label-position="top"
                 label-width="130px"
                 :model="form"
                 :inline="false">

          <el-row>
            <el-col :span="11">
              <el-form-item label="申请名称："
                            prop="applyName">
                <el-input type="text"
                          v-model="form.applyName"
                          style="width: 100%;"
                          :rows="4">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="11"
                    :offset="2">
              <el-form-item label="申请人："
                            label-position="top"
                            prop="applyPerson">
                <el-input style="width: 100%;"
                          type="text"
                          v-model="form.applyPerson"
                          :rows="4"
                          disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="11">
              <el-form-item label="操作类型："
                            prop="operationType">
                <el-select v-model="form.operationType"
                           style="width: 100%;"
                           id="operationType"
                           name="operationType"
                           :disabled="dialogStatusValue"
                           @change="typeChange">
                  <el-option v-for="operationType in this.operationTypes"
                             :value="operationType.value"
                             :key="operationType.value"
                             :label="operationType.label"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="11"
                    :offset="2">
              <el-form-item v-if="form.operationType === '0'"
                            label="装载类型："
                            prop="loadType">
                <el-select v-model="form.loadType"
                           style="width: 100%;"
                           id="loadType"
                           name="loadType">
                  <el-option value="个人数据">个人数据</el-option>
                  <el-option value="全行数据">全行数据</el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col align="right">
              <el-form-item v-if="form.operationType === '0'">
                <div class="padding10"
                     style="float:right">
                  <el-upload class="upload-demo"
                             ref="upload"
                             :on-change="select"
                             action=""
                             :file-list="fileList"
                             :show-file-list="false"
                             :auto-upload="false"
                             accept=".xls,.xlsx,.txt">
                    <el-button slot="trigger"
                               size="small"
                               type="primary">选取文件</el-button>
                    <el-button style="margin-left: 10px;"
                               size="small"
                               type="success"
                               @click="submitUpload">上传
                    </el-button>
                  </el-upload>
                </div>

              </el-form-item>
            </el-col>
          </el-row>
          <el-table v-if="form.operationType === '0'"
                    :data="tableData"
                    height="250"
                    border
                    style="width: 100%">
            <el-table-column prop="fileName"
                             min-width="100px"
                             label="文件名"
                             show-overflow-tooltip>
            </el-table-column>
            <el-table-column prop="displayTableName"
                             min-width="100px"
                             label="表名称">
              <template slot-scope="scope">
                <el-input v-model="scope.row.displayTableName"
                          id="displayTableName"
                          type="text" />
              </template>
            </el-table-column>
            <el-table-column prop="fileType"
                             min-width="50px"
                             label="文件类型"
                             show-overflow-tooltip>
            </el-table-column>
            <el-table-column prop="lineSeparator"
                             min-width="100px"
                             label="行分隔符"
                             show-overflow-tooltip>
              <template slot-scope="scope">
                <el-select v-model="scope.row.lineSeparator"
                           id="lineSeparator"
                           name="lineSeparator"
                           style="width: 80%"
                           :disabled="scope.row.disabled"
                           placeholder="无">
                  <el-option v-for="lineSeparator in lineSeparators"
                             :value="lineSeparator.value"
                             :key="lineSeparator.value"
                             :label="lineSeparator.label"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="columnSeparator"
                             label="列分隔符"
                             min-width="100px"
                             show-overflow-tooltip>
              <template slot-scope="scope">
                <el-select v-model="scope.row.columnSeparator"
                           id="columnSeparator"
                           name="columnSeparator"
                           style="width: 80%"
                           :disabled="scope.row.disabled"
                           placeholder="无">
                  <el-option v-for="columnSeparator in columnSeparators"
                             :value="columnSeparator.value"
                             :key="columnSeparator.value"
                             :label="columnSeparator.label"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="isHeaderLine"
                             label="首行是否为标题行"
                             align="center"
                             min-width="60px">
              <template slot-scope="scope">
                <el-checkbox v-model="scope.row.isHeaderLine"
                             @change="checkHeaderLine(scope.row.fileName)"
                             true-label="true"
                             false-label="false">
                </el-checkbox>
              </template>
            </el-table-column>
            <el-table-column align="center"
                             min-width="120px"
                             label="补充表名">
              <template slot-scope="scope">
                <!--                  <el-select v-model="scope.row.selectTableName"-->
                <!--                             :disabled="scope.row.isHeaderLine==='true'"-->
                <!--                             placeholder="选择文件">-->
                <!--                      <el-option v-for="item in FileInfo" :key="item.loadDownAppyFileUuid" :label="item.displayTableName" :value="item.tableMetaId"></el-option>-->
                <!--                  </el-select>-->
                <el-input v-model="scope.row.selectTableName"
                          :disabled='true'
                          style="max-width: 100px" />
                <el-link size="small"
                         :disabled="scope.row.isHeaderLine==='true'"
                         @click="selectFile(scope.$index,scope.row.fileName)"
                         style="max-width: 40px">选择</el-link>
              </template>

            </el-table-column>
            <!--            <el-table-column align="center"-->
            <!--                             min-width="60px"-->
            <!--                             label="选择">-->
            <!--              <template slot-scope="scope">-->

            <!--              </template>-->

            <!--            </el-table-column>-->
            <el-table-column align="center"
                             min-width="80px"
                             label="操作">
              <template slot-scope="scope">
                <el-link size="mini"
                         type="danger"
                         @click="lineDelete(scope.$index,'file')">删除
                </el-link>
              </template>
            </el-table-column>
          </el-table>

          <el-row v-if="form.operationType === '1'">
            <div style="display: flex;">
              <el-col :span="6">
                <LeftTrees ref="tree_left"></LeftTrees>
              </el-col>
              <el-col :span="2">
                <div class="transfer-center">
                  <p class="transfer-center-item">
                    <el-button type="primary"
                               icon="el-icon-arrow-right"
                               circle
                               @click="addGrop()"
                               title="选中（或勾选）左侧组织树节点并点击此按钮可以向表格中添加下线文件" />
                  </p>
                </div>
              </el-col>
              <el-col :span="16"
                      text-align="right">
                <div class="padding10">

                  <el-button type="primary"
                             class="oper-btn"
                             :disabled="selections.length === 0"
                             @click="removeGrp()"><img src="../../../styles/image/delete.png"
                         class="btn_icon icon1"
                         alt="">
                    <img src="../../../styles/image/delete2.png"
                         class="btn_icon icon2"
                         alt="">删除</el-button>
                </div>

                <el-table key="colMetaUuid"
                          v-loading="listLoading"
                          border
                          fit
                          :data="tableDataOffline"
                          height="288px"
                          highlight-current-row
                          style="width: 100%;"
                          @selection-change="handleSelectionTreeChange">
                  <!--                            <el-table-column width="40px" type="selection"/>-->
                  <el-table-column type="selection"
                                   width="55px" />
                  <el-table-column label="序号"
                                   width="60px"
                                   type="index" />
                  <el-table-column prop="tableMetaId"
                                   v-if="false" />
                  <el-table-column label="表路径"
                                   prop="tablePath"
                                   min-width="150px"
                                   show-overflow-tooltip>
                  </el-table-column>
                  <el-table-column label="归档方式"
                                   prop="archiveType"
                                   props>
                    <template slot-scope="scope">
                      <el-select v-model="scope.row.archiveType"
                                 placeholder="请选择">
                        <el-option v-for="item in options"
                                   :key="item.value"
                                   :label="item.label"
                                   :value="item.value">
                        </el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="归档文件/表名称"
                                   prop="archiveFileTableName"
                                   show-overflow-tooltip>
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.archiveFileTableName"
                                id="filingFile"></el-input>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </div>

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
                 width="50%">
        <div>
          <FlowItem ref="flowItem"
                    :flowSet="flowSet"
                    :flowItem="flowItem"
                    :flow-param="flowParam"
                    :columnDefs="columnDefs"
                    :submitData="submitData"
                    @closeModal="closeFlowItem"
                    @delectData="delectData"
                    @UpdateBecauseSubmit="batchUpdateForHandleClose"></FlowItem>
        </div>
        <span class="sess-flowitem"
              slot="footer">
          <el-button size="small"
                     class="table_header_btn"
                     @click="dialogVisible = false">关闭</el-button>
          <el-button size="small"
                     type="primary"
                     class="table_header_btn"
                     @click="saveOpinion">提交</el-button>

        </span>
      </el-dialog>

      <el-dialog v-if="dialogDetailVisible"
                 :close-on-click-modal="false"
                 :visible.sync="dialogDetailVisible"
                 title="详情"
                 width="80%">
        <div>
          <Details ref="detailsUuid"
                   :detailsUuid='detailsUuid'></Details>
        </div>
        <div style="text-align: right;">
          <el-button size="mini"
                     type="primary"
                     class="table_header_btn"
                     @click="dialogDetailVisible = false">关闭
          </el-button>
        </div>

      </el-dialog>

      <!--流程跟踪弹窗-->
      <el-dialog title="流程跟踪"
                 :visible.sync="todoFlow"
                 v-if="todoFlow"
                 width="80%">
        <div>
          <flowOpinionList :applyUuid="applyUuid"
                           :pageFrom="applyPage"></flowOpinionList>
        </div>
        <span slot="footer">
          <el-button size="mini"
                     type="info"
                     class="table_header_btn"
                     @click="todoFlow = false">关闭</el-button>
        </span>
      </el-dialog>

      <!--选择文件弹窗-->
      <el-dialog title="选择补充文件"
                 :visible.sync="selectFileInfo"
                 v-if="selectFileInfo"
                 width="30%">
        <LeftTrees ref="tree_left"></LeftTrees>

        <span class="sess-flowitem"
              slot="footer">
          <el-button size="small"
                     class="table_header_btn"
                     @click="selectFileInfo = false">关闭</el-button>
          <el-button size="small"
                     type="primary"
                     class="table_header_btn"
                     @click="confirmFile">确认</el-button>

        </span>
      </el-dialog>

    </div>
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
  upload,//文件上传
} from "@/api/data/loadApply";
import LeftTrees from '@/components/loginTree/leftTree.vue';
import FlowItem from '@/components/starflow/todowork/flowItem';
import Details from '@/views/data/dataLoadApply/details';
import flowOpinionList from "@/components/starflow/todowork/flowOpinionList"


export default {
  components: { LeftTrees, FlowItem, Details, flowOpinionList },
  data () {
    return {
      //文件列表存储的数组
      fileList: [],
      //存储文件附带属性的数组
      tableData: [],
      //数据下线存储的数组
      tableDataOffline: [],
      //给tableData赋空的空数组
      tableNullData: [],
      //给tableDataOffline赋空的空数组
      tableNullDataOffline: [],
      //存储分割文件名的数组
      splitName: [],
      isUpload: false,
      //数据下线左侧树的选择
      selections: [],
      treeLoading: false,
      orgTreeData: [],
      selectTableName: '',
      FileInfo: [],
      curItempItemInd: 0,
      fileName: '',
      props: {
        label: "name",
        isLeaf: "leaf",
      },

      file: {
        fileName: '',
        displayTableName: '',
        fileType: '',
        lineSeparator: '',
        columnSeparator: '',
        isHeaderLine: 'true',
        disabled: false,
        selectTableName: '',
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
          value: '办理完成',
          label: '办理完成'
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
          label: '数据装载（一次性装载）'
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
        displayTableName: '',//表名称
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
      selectFileInfo: false,//选择补充文件的弹窗控制
      applyPage: 'applyPage', //有这个标识 查询流程的时候会走相对应的方法

      rules: {
        applyName: [
          { required: true, message: '请输入名称', trigger: 'blur' },
        ],
        operationType: [
          { required: true, message: '请选择操作类型', trigger: 'change' },
        ],
        loadType: [
          { required: true, message: '请选择装载类型', trigger: 'change' },
        ],
        lineSeparator: [
          { required: true, message: '请选择行操作符', trigger: 'change' },
        ],
        columnSeparator: [
          { required: true, message: '请选择列操作符', trigger: 'change' },
        ],
        archiveType: [
          { required: true, message: '请选择列操作符', trigger: 'change' },
        ],
        displayTableName: [
          { required: true, message: '请输入表名称', trigger: 'blur' },
        ]
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
        wftype: "auditNotice2",
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
      options: [{
        value: '0',
        label: '归档到文件'
      }],
    };
  },
  computed: {},
  watch: {},
  created () {
    this.getList();//刷新列表
  },
  methods: {
    //选择补充文件按钮
    selectFile (index, obj) {
      this.curItempItemInd = index;
      this.fileName = obj;
      this.selectFileInfo = true;
      this.$nextTick(() => {
        this.$refs.tree_left.loadLeftTreeTypeFun("4");
      })
    },
    checkHeaderLine (obj) {
      this.tableData.forEach((item) => {
        if (obj == item.fileName && item.isHeaderLine == "true") {
          this.$set(item, "selectTableName", "");
        }
      })
    },
    //选择补充文件弹窗确认按钮
    confirmFile () {
      var nodes = [];
      nodes = this.$refs.tree_left.treeNodeSelectedObj[0].data;
      this.FileInfo = [];
      nodes.forEach((node) => {
        if (node.type === "table") {
          this.FileInfo.push({
            selectTableName: node.label,
          });
        }
      });
      if (this.FileInfo.length != 1) {
        this.$notify.warning("只能选择单个文件！")
      } else {
        this.selectTableName = this.FileInfo[0].selectTableName
        this.selectFileInfo = false;
        this.tableData.forEach((item) => {
          if (this.fileName == item.fileName) {
            this.$set(item, "selectTableName", this.selectTableName)
          }
        })
      }
    },
    typeChange (val) {
      if (val === "1") {
        this.$nextTick(() => {
          this.$refs.tree_left.loadLeftTreeTypeFun("4");
        })
        this.tableData = this.tableNullData
        this.form.loadType = ''
      } else {
        this.tableDataOffline = this.tableNullDataOffline
      }
    },
    //下线方法
    addGrop () {
      var nodes = [];
      nodes = this.$refs.tree_left.treeNodeSelectedObj[0].data;
      this.tableDataOffline = []
      nodes.forEach((node) => {
        if (
          node.type === "table"
        ) {
          this.tableDataOffline.push({
            tableMetaId: node.id,
            tablePath: "数据装载/" + node.label,
            //归档方式默认为归档到文件
            archiveType: this.options[0].value,
            archiveFileTableName: "",
          });
        }
      });
    },
    removeGrp () {
      if (this.selections.length > 0) {
        for (let index = 0; index < this.selections.length; index++) {
          for (let y = 0; y < this.tableDataOffline.length; y++) {
            if (this.tableDataOffline[y] == this.selections[index]) {
              this.tableDataOffline.splice(y, 1);
            }
          }
        }
      }

    },
    handleSelectionTreeChange (val) {
      this.selections = val;
    },

    //装载方法
    select (file, fileList) {
      //默认给disabled属性赋true，当判断文件类型为txt时，改变disabled属性值为false
      this.file.disabled = true
      //往定义的空数组中push列表file
      this.fileList.push(file)
      //往fileList列表数组中添加isUpload属性(判断文件是否上传标识)
      this.fileList[this.fileList.length - 1].isUpload = false
      //获取当前时间
      const time = new Date().getTime();
      //分割文件名，往文件名中加入时间戳，防止文件重复，具体格式：文件名+时间戳+"."+文件类型
      this.splitName = this.fileList[this.fileList.length - 1].name.split('.');
      let fileName = this.splitName[0] + time + "." + this.splitName[1];
      //因为文件file是只读类型，无法更改文件名，所以新建File对象，把file值赋给新对象，然后改变文件名赋给fileList
      let f = new File([fileList[this.fileList.length - 1].raw], fileName);
      f.uid = fileList[this.fileList.length - 1].uid;
      this.fileList[this.fileList.length - 1].raw = f;
      this.fileList[this.fileList.length - 1].name = this.splitName[0] + time + "." + this.splitName[1];
      let extName = file.name.substring(file.name.lastIndexOf(".") + 1).toLowerCase();
      this.tableData.push(this.file)
      this.file.fileName = file.name;
      //判断是否为txt文件，是的话给file中的特定属性赋值，因为业务需求：'xls'和'xlsx'文件的lineSeparator和columnSeparator为空
      if (extName === 'txt') {
        this.file.fileType = 'txt'
        this.file.lineSeparator = '回车换行符'
        this.file.columnSeparator = '制表符'
        //设置了是否可操作的标识，txt文件是可以操作lineSeparator和columnSeparator属性的，所以给disabled属性赋false
        this.file.disabled = false
      } else if (extName === 'xls') {
        this.file.fileType = 'xls'
      } else if (extName === 'xlsx') {
        this.file.fileType = 'xlsx'
      }
      //重置this.file文件，防止编辑失败时点击新增，页面出现编辑中查到的数据
      this.file = this.$options.data().file
    },
    submitUpload () {
      //判断文件上传时是否选择了文件
      if (this.tableData.length === 0) {
        this.$notify.warning("请选择文件后上传！")
        return
      }
      this.uploadOk();
    },
    uploadOk () {
      let fd = new FormData();
      //循环遍历this.fileList列表数组,将文件一一赋给FormData传到后台
      for (let i = 0; i < this.fileList.length; i++) {
        //判断是否已经上传过了
        if (this.fileList[i].isUpload === false) {
          fd.append("files", this.fileList[i].raw)
          this.fileList[i].isUpload = true
        }
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
    lineDelete (index, ipTable) {
      switch (ipTable) {
        case 'file':
          for (let i = 0; i < this.fileList.length; i++) {
            if (this.tableData[index].fileName === this.fileList[i].name) {
              this.fileList.splice(i, 1)
            }
          }
          this.tableData.splice(index, 1)
      }
    },


    //添加
    apply_add () {
      this.form.applyPerson = this.$store.state.user.name;
      this.applyDialogVisible = true
      this.dialogStatusValue = false
      this.dialogStatus = 'create'
      this.title = '创建申请'
      this.fileType = ''
      // this.getOrgTree();
      // 清除校验
      if (this.$refs.form) {
        this.$nextTick(() => {
          this.$refs['form'].clearValidate()
        })
      }
    },
    // 编辑
    apply_edit () {
      let applyUuid = '';
      this.Selectval_list.forEach((r) => {
        applyUuid = r.applyUuid;
      });

      this.title = '编辑申请'

      // this.getOrgTree();

      this.form.applyUuid = applyUuid
      // this.details_details();
      getById(this.form.applyUuid).then(res => {
        this.form = res.data
        //只有状态为草稿时才能实现对数据的编辑修改
        if (this.form.status !== '草稿') {
          this.$notify.warning("只有草稿状态可编辑")
          // this.form.applyName = ''
          // this.form.loadType = ''
          this.form = this.$options.data().form
          this.tableData = this.tableNullData
          this.tableDataOffline = this.tableNullDataOffline
          return
        } else {
          this.dialogStatusValue = true
          this.applyDialogVisible = true
          this.dialogStatus = 'update'
          this.isDisable = false
          this.updateShow = true
        }
        if (this.form.operationType == 0) {
          this.tableData = res.data.fileList
          this.tableData.forEach((r) => {
            r.isUpload = true
            r.disabled = r.fileType !== "txt";
          })
        } else {
          this.$nextTick(() => {
            this.$refs.tree_left.loadLeftTreeTypeFun("4");
          })
          this.tableDataOffline = res.data.fileList
        }
      })

    },
    //删除
    apply_deletes () {
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
      }).catch(() => {
      });
    },
    //办理
    apply_transact () {
      let applyUuid = '';
      this.Selectval_list.forEach((r) => {
        applyUuid = r.applyUuid;
      });
      this.form.applyUuid = applyUuid
      getById(this.form.applyUuid).then(res => {
        this.form.status = res.data.status
        if (this.form.status !== '草稿') {
          this.$notify.warning("只有草稿状态可办理")
        } else {
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
        }
      })
    },
    //工作流相关
    closeFlowItem (val) {
      this.dialogVisible = val;
      this.flowParam = 0;
    }
    ,
    //工作流相关
    delectData (val) {
      this.dialogVisible = val;
    }
    ,
    // 时间格式化
    formatApplyTime (row) {
      // 拼接日期规格为YYYY-MM-DD hh:mm:ss
      let applyTime = new Date(row.applyTime)
      return applyTime.getFullYear() + '-' + (applyTime.getMonth() + 1) + '-' + applyTime.getDate() + ' ' + applyTime.getHours() + ':' + applyTime.getMinutes() + ':' + applyTime.getSeconds()
    }
    ,

    // 清空
    clearAll () {
      this.query.applyName = ''
      this.query.applyPerson = ''
      this.query.status = ''
      this.query.startTime = ''
      this.query.endTime = ''
    }
    ,
    search () {
      this.query.pageNo = 1
      this.getList();//刷新列表
    }
    ,
    // 刷新列表
    getList () {
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
    }
    ,
    //详情
    show_details (applyUuid) {
      this.form.applyUuid = applyUuid
      this.detailsUuid = applyUuid
      this.dialogDetailVisible = true
    }
    ,

    // 编辑 接口
    details_details () {
      getById(this.form.applyUuid).then(res => {
        this.form = res.data
        this.tableData = res.data.fileList
      })
    }
    ,
    // 多选
    handleSelectionChange (val) {
      this.applySelectionList = []
      this.Selectval_list = val;
      val.forEach((value) => {
        this.applySelectionList.push(value)
      })
    }
    ,
    // 分页
    handleCurrentChange (val) {
      this.query.pageNo = val
      this.getList()
    }
    ,
    // 每页多少条
    handleSizeChange (val) {
      this.query.pageSize = val
      this.getList()
    }
    ,

    // 新建保存 && 编辑保存
    save (form) {

      this.isDisable = true
      setTimeout(() => {
        this.isDisable = false
      }, 2000)

      this.$refs[form].validate((valid) => {
        if (valid) {
          let isUpload = true
          //校验是否选择了文件
          if (this.tableData.length == 0 && this.form.operationType == 0) {
            this.$notify.warning("请选择文件！")
            return
          } else if (this.tableDataOffline.length == 0 && this.form.operationType == 1) {
            this.$notify.warning("请选择下线表！")
            return
          } else if (this.tableData.length != 0 && this.form.operationType == 0) {
            //校验文件是否上传
            this.fileList.forEach((r) => {
              if (r.isUpload === false) {
                this.$notify.warning("所选文件" + r.name + "未上传")
                isUpload = false
              }
            })
          }
          //定义数组接收未填写文件名的行数
          let number = []
          //判断装载与下线文件列表中是否填写了文件名，并将未填写文件名的行数填入number数组中
          if (this.form.operationType == 0 && isUpload) {
            this.tableData.forEach((item, index, array) => {
              if (array[index].displayTableName === "") {
                number.push(index + 1)
              }
            })
          } else {
            this.tableDataOffline.forEach((item, index, array) => {
              if (array[index].archiveFileTableName === "") {
                number.push(index + 1)
              }
            })
          }
          //判断数组不为空
          if (number !== undefined && number != null && number.length > 0) {
            let lineNumber = "";
            number.forEach((item, index) => {
              lineNumber += number[index] + ","
            })

            lineNumber = lineNumber.substring(0, lineNumber.lastIndexOf(','));
            if (this.form.operationType == 0) {
              this.$notify.warning("第" + lineNumber + "行数据未填写表名称！")
            } else {
              this.$notify.warning("第" + lineNumber + "行数据未填写归档文件/表名称！")
            }
            return
          }
          //判断不为标题行时是否选择了文件
          let nums = 0;
          this.tableData.forEach((item) => {
            if (item.isHeaderLine == "false" && item.selectTableName == "") {
              nums = 1;
            }
          })
          if (nums == 1) {
            this.$notify.warning("未选择补充表名!");
            return
          }
          if (this.title === '创建申请') {
            let params = {
              loadDownApply: {
                applyName: this.form.applyName,
                applyPerson: this.form.applyPerson,
                operationType: this.form.operationType,
                loadType: this.form.loadType,
              },

              "tableData": this.form.operationType == 0 ? JSON.stringify(this.tableData) : JSON.stringify(this.tableDataOffline),
            }
            //save_data方法调用后台save接口实现新增功能
            if (isUpload) {
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
            }
          } else {
            let params = {
              loadDownApply: {
                applyUuid: this.form.applyUuid,
                applyName: this.form.applyName,
                operationType: this.form.operationType,
                loadType: this.form.loadType,
              },
              "tableData": this.form.operationType == 0 ? JSON.stringify(this.tableData) : JSON.stringify(this.tableDataOffline),
            }
            //update_data方法调用后台update接口实现编辑功能
            if (isUpload) {
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
    handleClose (form) {
      this.$refs[form].resetFields() //清空添加的值
      //关闭弹窗时清空form表单的值
      this.form = this.$options.data().form
      this.updateShow = false
      this.fileList = []
      this.tableData = []
      this.tableDataOffline = []
    },

    //子组件fileupload传值给父组件，用showFileType事件接收值赋给变量fileType
    showFileType (fileType) {
      this.fileType = fileType;
    },

    //子组件fileupload传值给父组件，用showFilePath事件接收值赋给变量fileType
    showFilePath (filePath) {
      this.form.fileName = filePath;
    },

    //打开流程跟踪弹窗
    todoOpinionList (row) {
      this.applyUuid = row.applyUuid;
      this.todoFlow = true;
    },

    //工作流相关
    saveOpinion () {
      //保存业务数据成功后
      setTimeout(() => {
        this.$refs["flowItem"].submitFlow();
        //将状态修改为办理中
      }, 20);
    },

    batchUpdateForHandleClose () {
      batchUpdateForHandle(this.applySelectionList)
        .then(() => {
          this.getList()
        })
    },
  }

}
  ;
</script>

<style scoped>
.right_btn {
  display: flex;
  width: 100%;
  justify-content: flex-end;
}

@import url("./../../../assets/css/common.css");

.data_res >>> .el-form-item {
  /* margin-bottom: 0 !important; */
}
.transfer-center {
  display: flex;
  justify-content: center;
  justify-content: space-around;
  align-items: center;
  height: 100%;
}
.transfer-center-item {
  width: 40px;
  height: 80px;
}
</style>
