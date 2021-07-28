<template>
  <!-- firstParentTabCon.vue界面是父页签第一个页签中的内容 -->
  <div class="app-container">
    <!-- 问题新增和编辑的弹框 -->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <!-- label-width="140px" -->
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        class="detail-form"
        style="height:62vh;overflow:auto;"
      >
        <el-row>
          <el-col :span="11">
            <el-form-item
              label="问题名称"
              prop="problemName"
            >
              <el-input
                v-model="temp.problemName"
                :placeholder="disableUpdate === true ? '' : '请输入问题名称'"
                :disabled="disableUpdate"
              />
            </el-form-item>
          </el-col>
          <el-col :span="11" :offset="2">
            <el-form-item label="问题来源" prop="problemSource">
              <el-select
                v-model="temp.problemSource"
                :placeholder="disableUpdate === true ? '' : '问题来源'"
                style="width:100%"
                disabled="disabled"
              >
                <el-option
                  v-for=" item in problemSourceList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="11">
            <el-form-item label="项目名称" prop="projectUuid">
              <el-select
                v-model="temp.projectUuid"
                :placeholder="disableUpdate === true ? '' : '请选择项目名称'"
                :disabled="disableUpdate"
                style="width:100%"
                @change="resetAudit"
              >
                <el-option
                  v-for=" item in projectQueryList"
                  :key="item.projectUuid"
                  :label="item.projectName"
                  :value="item.projectUuid"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="11" :offset="2">
            <el-form-item label="是否重要" prop="isImportant">
              <el-select
                v-model="temp.isImportant"
                :placeholder="disableUpdate === true ? '' : '请选择'"
                :disabled="disableUpdate"
                style="width:100%"
              >
                <el-option
                  v-for="item in isImportantList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="11">
            <el-form-item label="审计人员" prop="auditPersonUuid">
              <el-select
                v-model="temp.auditPersonUuid"
                :placeholder="disableUpdate === true ? '' : '请选择'"
                :disabled="disableUpdate"
                style="width:100%"
              >
                <el-option
                  v-for="item in personQueryList"
                  :key="item.auditPersonUuid"
                  :label="item.auditPersonName"
                  :value="item.auditPersonUuid"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="11" :offset="2">
            <el-form-item label="问题发现时间" prop="discoveryTime">
              <el-date-picker
                v-model="temp.discoveryTime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                :placeholder="disableUpdate === true ? '' : '请选择问题发现时间'"
                style="width:100%"
                :disabled="disableUpdate"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="11">
            <el-form-item label="问题分类" prop="problemType">
              <el-input
                v-model="temp.problemType"
                :placeholder="disableUpdate === true ? '' : '请选择问题分类'"
                :disabled="disableUpdate"
                @focus="handleTreeView()"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="21">
            <el-form-item label="问题明细:" />
          </el-col>
          <el-col align="right">
            <!-- 新增 -->
            <el-button type="primary" class="oper-btn add" :disabled="disableUpdate" @click="detailHandleCreate()" />
            <!-- 修改 -->
            <!--<el-button type="primary" class="oper-btn edit"-->
            <!--:disabled="detailSelections.length !== 1 && disableUpdate"-->
            <!--@click="detailHandleUpdate()"/>-->
            <!-- 删除 -->
            <!--<el-button type="primary" class="oper-btn delete" :disabled="detailSelections.length === 0 && disableUpdate"-->
            <!--@click=""/>-->
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <template>
              <el-table
                :key="detailTableKey"
                v-loading="detailListLoading"
                fit
                style="width: 100%;"
                border
                :data="temp.problemDetailsList"
                highlight-current-row
                @selection-change="handleDetailSelectionChange"
              >
                <!--<el-table-column  label="序号"  align="center"  type="index" />-->
                <!--<el-table-column type="selection" align="center" v-if="!disableUpdate"/>-->
                <el-table-column label="问题明细" width="200px" align="center" prop="problemDetailDesc">
                  <template slot-scope="scope">
                    <el-link
                      :underline="false"
                      type="primary"
                      @click="showProblemDetail(scope.row)"
                    >{{ scope.row.problemDetailDesc }}</el-link>
                  </template>
                </el-table-column>
                <el-table-column label="整改措施" width="200px" align="center" prop="rectifyMeasure" />
                <el-table-column label="最晚整改时间" width="200px" align="center" prop="rectifyTime" />
                <el-table-column label="责任人" width="200px" align="center" prop="dutyPerson" />
                <el-table-column label="违规积分" width="200px" align="center" prop="violationPoints" />
                <el-table-column label="处罚金额" width="200px" align="center" prop="penalty" />
                <el-table-column label="是否入账" width="200px" align="center" prop="isEnterAccount" :formatter="formatIsImportant" />
                <el-table-column label="整改状态" width="200px" align="center" prop="rectifyStatus" :formatter="formatStatus" />
                <el-table-column label="操作" width="200px" align="center" fixed="right">
                  <template slot-scope="scope">
                    <!--修改-->
                    <el-button
                      type="primary"
                      class="oper-btn edit"
                      @click="detailHandleUpdate(scope.$index)"
                      :disabled="disableUpdate"
                    />
                    <!--删除-->
                    <el-button
                      type="primary"
                      class="oper-btn delete"
                      @click="detailHandleDelete(scope.$index)"
                      :disabled="disableUpdate"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button v-if="!closeStatus" @click="dialogFormVisible = false">取消</el-button>
        <el-button
          v-if="closeStatus"
          type="primary"
          @click="dialogFormVisible = false"
        >关闭
        </el-button>
        <el-button
          v-if="!closeStatus"
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()"
        >提交审核
        </el-button>
        <el-button
          v-if="!closeStatus"
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()"
        >保存
        </el-button>
      </div>
    </el-dialog>
    <!--问题明细新增+编辑框-->
    <el-dialog
      :title="detailTextMap[detailDialogStatus]"
      :visible.sync="detailDialogFormVisible"
      :close-on-click-modal="false"
    >
      <!-- label-width="140px" -->
      <el-form
        ref="detailDataForm"
        :rules="detailRules"
        :model="detailTemp"
        label-position="right"
        class="detail-form"
        style="height:62vh;overflow:auto;"
      >
        <el-row>
          <el-col :span="11">
            <el-form-item
              label="责任人"
              prop="dutyPerson"
            >
              <el-input
                v-model="detailTemp.dutyPerson"
                :placeholder="detailDisableUpdate === true ? '' : '请输入责任人'"
                :disabled="detailDisableUpdate"
              />
            </el-form-item>
          </el-col>
          <el-col :span="11" :offset="2">
            <el-form-item label="整改状态" prop="rectifyStatus">
              <el-select
                v-model="detailTemp.rectifyStatus"
                :placeholder="detailDisableUpdate === true ? '' : '整改状态'"
                :disabled="detailDisableUpdate"
                style="width:100%"
              >
                <el-option
                  v-for=" item in rectifyStatusList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="11">
            <el-form-item label="违规积分" prop="violationPoints">
              <el-input
                v-model="detailTemp.violationPoints"
                :placeholder="detailDisableUpdate === true ? '' : '请输入违规积分'"
                :disabled="detailDisableUpdate"
              />
            </el-form-item>
          </el-col>
          <el-col :span="11" :offset="2">
            <el-form-item label="整改时间" prop="rectifyTime">
              <el-date-picker
                v-model="detailTemp.rectifyTime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                :placeholder="detailDisableUpdate === true ? '' : '请选择整改时间'"
                style="width:100%"
                :disabled="detailDisableUpdate"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="11">
            <el-form-item label="处罚金额" prop="penalty">
              <el-input
                v-model="detailTemp.penalty"
                :placeholder="detailDisableUpdate === true ? '' : '请输入处罚金额'"
                :disabled="detailDisableUpdate"
              />
            </el-form-item>
          </el-col>
          <el-col :span="11" :offset="2">
            <el-form-item label="是否入账" prop="isEnterAccount">
              <el-select
                v-model="detailTemp.isEnterAccount"
                :placeholder="detailDisableUpdate === true ? '' : '请选择是否入账'"
                :disabled="detailDisableUpdate"
                style="width:100%"
              >
                <el-option
                  v-for=" item in isEnterAccountList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="问题明细" prop="problemDetailDesc">
              <el-input
                v-model="detailTemp.problemDetailDesc"
                :placeholder="detailDisableUpdate === true ? '' : '请输入问题明细'"
                :disabled="detailDisableUpdate"
                type="textarea"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="整改措施" prop="rectifyMeasure">
              <el-input
                v-model="detailTemp.rectifyMeasure"
                :placeholder="detailDisableUpdate === true ? '' : '请输入整改措施'"
                :disabled="detailDisableUpdate"
                type="textarea"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button v-if="!detailCloseStatus" @click="detailDialogFormVisible = false">取消</el-button>
        <el-button
          v-if="detailCloseStatus"
          type="primary"
          @click="detailDialogFormVisible = false"
        >关闭
        </el-button>
        <el-button
          v-if="!detailCloseStatus"
          type="primary"
          @click="detailDialogStatus==='detailCreate'?detailCreateData():detailUpdateData()"
        >保存
        </el-button>
      </div>
    </el-dialog>
    <!--树弹框-->
    <el-dialog
      title="请选择问题分类"
      :visible.sync="dialogTreeFormVisible"
      :close-on-click-modal="false"
    >
      <div style="height:62vh; overflow:auto;">
        <el-input
          v-model="filterText"
          placeholder="输入关键字进行过滤"
        />
        <!-- :check-strictly="true" 父子节点不关联 -->
        <el-tree
          ref="tree"
          :data="ptFatherTreeData"
          :props="defaultProps"
          :check-strictly="true"
          show-checkbox
          default-expand-all
          :filter-node-method="filterNode"
          node-key="id"
          style="margin-top:10px"
          @node-click="handleNodeClick"
          @check-change="checkChange"
        />
      </div>
      <div slot="footer">
        <el-button v-if="!closeStatus" @click="dialogTreeFormVisible = false">取消</el-button>
        <el-button v-if="closeStatus" type="primary" @click="dialogTreeFormVisible = false">确定</el-button>
        <el-button
          v-if="!closeStatus"
          type="primary"
          @click="insertOrg()"
        >保存</el-button>
      </div>
    </el-dialog>
    <el-container>
      <el-header>
        <div class="filter-container">
          <QueryField
            ref="queryfield"
            :form-data="queryFields"
            @submit="getLikeList"
          />
        </div>
      </el-header>
      <!-- style="width: 92vw" -->
      <el-main>
        <div align="right">
          <el-row>
            <el-button
              :disabled="false"
              type="primary"
              size="small"
              class="oper-btn"
              @click="problem"
            >
            生成问题</el-button>
            <el-button
              :disabled="false"
              type="primary"
              size="small"
              class="oper-btn processing"
              @click="handleResult"
            ></el-button>
            <el-button
              :disabled="buttonIson.deleteBtn"
              type="primary"
              @click="deleteRunTaskRel"
              class="oper-btn delete-3"
            ></el-button>
          </el-row>
        </div>
        <el-table
          id="table"
          ref="resultTable"
          :key="tableKey"
          v-loading="listLoading"
          :data="list"
          border
          fit
          highlight-current-row
          @sort-change="sortChange"
          @selection-change="handleSelectionChange"
          height="450px"
        >
          <el-table-column type="selection" width="55px" />
          <el-table-column
            label="模型名称"
            width="300px"
            prop="model.modelName"
          >
            <template slot-scope="scope">
              <a
                type="text"
                style="color: #409eff"
                @click="
                  getResultTables(
                    scope.row.runResultTables,
                    scope.row.model.modelName,
                    scope.row.model.modelUuid,
                    scope.row.runStatus,
                    resultSpiltObjects
                  )
                "
                >{{ scope.row.model.modelName }}</a
              >
            </template>
          </el-table-column>
          <el-table-column
            label="处理状态"
            width="100px"
            align="center"
            prop="handleState"
          />
          <el-table-column
            label="处理意见"
            width="100px"
            prop="handleIdea"
          />
          <el-table-column
            label="运行人"
            width="100px"
            align="center"
            prop="runTask.runUserName"
          />
          <el-table-column
            label="运行类型"
            width="100px"
            align="center"
            prop="runTask.runType"
            :formatter="runTypeFormate"
          />
          <el-table-column
            label="结果总条数"
            width="100px"
            align="center"
            prop="runResultTables"
            :formatter="dataCountFormatter"
          />
          <el-table-column
            label="运行SQL"
            prop="settingInfo"
            align="center"
            width="200px"
          >
            <template slot-scope="scope">
              <el-link type="primary" @click="selectSql(scope.row)">{{
                settingInfoSqlFormatter(scope.row)
              }}</el-link>
            </template>
          </el-table-column>
          <el-table-column
            label="运行参数"
            prop="settingInfo"
            width="200px"
            :formatter="settingInfoParamsArrFormatter"
          />
          <el-table-column
            label="关联项目"
            prop="projectName"
            width="200px"
          />
          <el-table-column
            v-if="false"
            label="运行结果共享表主键"
            prop="runResultShare.runResultShareUuid"
            align="center"
            width="200px"
          />
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="pageQuery.pageNo"
          :limit.sync="pageQuery.pageSize"
          @pagination="getLikeList"
        />
      </el-main>
    </el-container>
    <el-dialog
      v-if="sqlInfoDialog"
      :visible.sync="sqlInfoDialog"
      title="SQL信息"
      width="50%"
    >
      <el-input disabled type="textarea" :rows="15" v-model="sqlInfo">
      </el-input>
    </el-dialog>
    <el-dialog
      title="请处理"
      :visible.sync="handleIdeaDialog"
      width="30%"
      :append-to-body="true"
    >
      <div ref="basicInfo">
        <el-form ref="basicInfoForm">
          <el-row>
            <el-col :span="24">
              <el-form-item label="处理状态">
                <el-select
                  style="margin: 5px"
                  v-model="modelResultHandle.handleState"
                >
                  <el-option value="待处理">待处理</el-option>
                  <el-option value="处理中">处理中</el-option>
                  <el-option value="已完成">已完成</el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="处理意见">
                <el-input
                  v-model="modelResultHandle.handleIdea"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入内容"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleIdeaDialog = false">取 消</el-button>
        <el-button type="primary" @click="updateHandleResult()"
          >确 定</el-button
        ></span
      >
    </el-dialog>
  </div>
</template>
<script>
import {
  getRunTaskRelByPage,
  batchDeleteRunTaskRel,
  ResultRelProject,
  rmResultRelProjectlr,
  insertRunResultShare,
  deleteRunResultShare,
  exportRunTaskRel,
  reRunRunTask,
  getResultSplitSelectData,
  selectPrimaryKeyByTableName,
  batchSaveResultDetailProjectRel,
  selectByRunResultTableUUids,
  getDataAfterResultSpiltToRelateProject,
  addCoverResultRelProject,
  batchDeleteResultRelProject
} from "@/api/analysis/auditmodelresult";
import {
  selectLikePageVoHandle,
  updateRunTaskRel,
} from "@/api/analysis/modelresulthandle";
import { uuid2, addRunTaskAndRunTaskRel } from "@/api/analysis/auditmodel";
import QueryField from "@/components/public/query-field/index";
import Pagination from "@/components/Pagination/index";
import { elementInside } from "dropzone";
import runimmediatelycon from "@/views/analysis/auditmodel/runimmediatelycon";
import axios from "axios";
import VueAxios from "vue-axios";
import AV from "leancloud-storage";
import { getParamSettingArr } from "@/api/analysis/auditparam";
import personTree from "@/components/publicpersontree/index";
import { listByPage, save, update, del, personList, projectList, toTreeData, getDictList } from
  './problem'
export default {
  components: { Pagination, QueryField, runimmediatelycon, personTree },
  data() {
    // 数字校验
    const isNum = (rule, value, callback) => {
      const price = /^[0-9]*$/
      if(value==null){
        value =''
      }
      if (!price.test(value)) {
        callback(new Error('该项必须填写数字'))
      } else {
        callback()
      }
    }
    return {
      tableKey: "errorUuid",
      list: null, // 绑定elementTable的数据
      total: 0,
      listLoading: false, //elementTable的遮罩
      queryFields: [
        //最上面模模糊查询所用数据
        { label: "模型名称", name: "modelName", type: "fuzzyText" },
        { label: "运行人", name: "runUserName", type: "fuzzyText" },
        { label: "运行sql", name: "sql", type: "fuzzyText" },
        { label: "运行参数", name: "param", type: "fuzzyText" },
        { label: "执行时间范围", name: "runStartTime", type: "timePeriod" },
      ],
      formStyle: {
        width: "700px",
        height: "400px",
      },
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
      },
      share: [], // 存储共享的运行结果
      notShare: [], // 存储不是共享的运行结果
      success: false, // 用来测试open2方法里的batchDeleteRunTaskRel方法返回值是否为true，如果为true则success为true
      success1: false, // 用来测试open2方法里的deleteRunResultShare方法返回值是否为true，如果为true则success为true
      selected1: [], // 存储表格中选中的数据
      buttonIson: {
        AssociatedBtn: true,
        DisassociateBtn: false,
        deleteBtn: true,
        resultSplitBtn: true,
        resultShareBtn: true,
        exportBtn: false,
      },
      //模型结果处理对象
      modelResultHandle: {
        handleState: "",
        handleIdea: "",
      },
      //处理意见dialog
      handleIdeaDialog: false,
      resultSpiltObjects: {}, //存储点击结果拆分要传往后台的数据
      sqlInfo: "",
      sqlInfoDialog: false, //点击模型结果关联按钮控制人员dialog显示
      projectUuid: "", //关联项目的Uuid
      // 格式化参数列表
      formatMap: {
        rectifyStatus: {
          1: '未整改',
          2: '整改中',
          3: '已整改',
          4: '无法整改',
          null: ''
        },
        isImportant: {
          1: '是',
          0: '否'
        }
      },
      // 问题属性绑定
      temp: {
        problemUuid: null, // 问题UUID
        problemName: null, // 问题name
        problemSource: null, // 问题来源
        projectUuid: null, // 项目UUID
        projectName: null, // 项目name
        isImportant: null, // 是否重要
        auditPersonUuid: null, // 审计人员UUID
        auditPersonName: null, // 审计人员name
        discoveryTime: null, // 问题发现时间
        problemType: null, // 问题类型
        problemDetailsList: []// 问题明细List
      },
      // 问题明细属性绑定
      detailTemp: {
        dutyPerson: null, // 责任人
        problemUuid: null, // 问题Uuid
        rectifyStatus: null, // 整改状态
        violationPoints: null, // 违规积分
        rectifyTime: null, // 整改时间
        penalty: null, // 处罚金额
        isEnterAccount: null, // 是否入账
        problemDetailDesc: null, // 问题明细
        rectifyMeasure: null// 整改措施
      },
      // 问题信息弹窗绑定
      selections: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改问题',
        create: '生成问题',
        show: '查看问题详情'
      },
      // 问题详细信息弹窗绑定
      detailSelections: [],
      detailDialogFormVisible: false,
      detailDialogStatus: '',
      detailTextMap: {
        detailUpdate: '修改问题明细',
        detailCreate: '新增问题明细',
        detailShow: '查看问题明细详情'
      },
      // 新增问题的表单验证
      rules: {
        problemName: [{ required: true, message: '请填写问题名称', trigger: 'change' },
          { max: 100, message: '问题名称在100个字符之内', trigger: 'change' }],
        problemSource: [{ required: true }],
        projectUuid: [{ required: true, message: '请选择项目名称', trigger: 'change' }],
        isImportant: [{ required: true, message: '请选择', trigger: 'change' }],
        auditPersonUuid: [{ required: true, message: '请选择审计人员', trigger: 'change' }],
        problemType: [{ required: true, message: '请选择问题分类', trigger: 'change' }]
      },
      disableUpdate: false,
      closeStatus: false,
      downloadLoading: false,
      // 新增问题明细的表单验证
      detailRules: {
        dutyPerson: [{ required: true, message: '请填写责任人', trigger: 'change' },
          { max: 100, message: '问题名称在100个字符之内', trigger: 'change' }],
        rectifyStatus: [{ required: true, message: '请选择整改状态', trigger: 'change' }],
        problemDetailDesc: [{ required: true, message: '请输入问题明细', trigger: 'change' }],
        violationPoints: [{ required: false, message: '请输入违规积分', trigger: 'change' },
          { validator: isNum, trigger: 'change' }]
      },
      // 问题明细窗口属性
      detailDisableUpdate: false,
      detailCloseStatus: false,
      detailDownloadLoading: false,
      // “问题来源属性”下拉框列表
      problemSourceList: [{ label: '现场审计', value: 1 }, { label: '审计模型', value: 2 }],
      // “整改状态”下拉框列表
      rectifyStatusList: [{ label: '未整改', value: 1 }, { label: '整改中', value: 2 },
        { label: '已整改', value: 3 }, { label: '无法整改', value: 4 }],
      // “是否重要”属性下拉框列表
      isImportantList: [{ label: '是', value: 1 }, { label: '否', value: 2 }],
      // “是否入账”属性下拉框列表
      isEnterAccountList: [{ label: '是', value: 1 }, { label: '否', value: 2 }],
      // 修改、删除时锁定记录下标
      detailIndex: null,
      detailList: null, // 问题明细结果集
      projectQueryList: null, // 项目结果集
      personQueryList: null, // 所属项目组成员结果集
      ptFatherTreeData: [''], // 问题分类树组件父节点数据
      ptSonTreeData: [''], // 问题分类树组件子节点数据
      ptHeadTreeData: [''], // 问题分类一级节点数据
      detailListLoading: false,
      detailTableKey: 'problemDetailUuid',
      // 项目结果集查询分页参数
      pageQueryProjectList: {
        condition: {},
        pageNo: 1,
        pageSize: 2000,
        sortBy: 'desc',
        sortName: 'updateTime'
      },
      // 问题分类树相关属性
      filterText: '',
      checkedId: null,
      dialogTreeFormVisible: false,
      defaultProps: {
        children: 'children',
        label: 'label',
        id: 'id',
        value: ''
      }
    };
  },
  created() {
    let params = this.getQueryString();
    if (params.projectUuid != undefined) {
      this.projectUuid = params.projectUuid;
      this.getLikeList();
    } else {
      this.getLikeList();
    }
  },
  watch: {
    // 监听项目UUID
    'temp.projectUuid': {
      handler: function() {
        this.getProjectPerson(this.temp.projectUuid)
      }
    },
    // 监听问题明细违规积分
    'detailTemp.violationPoints': {
      handler: function() {
        if (typeof (this.detailTemp.violationPoints) != 'undefined' &&
            this.detailTemp.violationPoints != null) {
          this.detailTemp.penalty = this.detailTemp.violationPoints * 100
        }
      }
    }
  },
  methods: {
    // 问题表单初始化
    resetTemp() {
      this.temp = {
        problemUuid: null, // 问题UUID
        problemName: null, // 问题name
        problemSource: 2, // 问题来源
        projectUuid: null, // 项目UUID
        projectName: null, // 项目name
        isImportant: null, // 是否重要
        auditPersonUuid: null, // 审计人员UUID
        auditPersonName: null, // 审计人员name
        discoveryTime: null, // 问题发现时间
        problemType: null, // 问题类型
        problemDetailsList: []// 问题明细List
      }
    },
    // 问题明细表单初始化
    detailResetTemp() {
      this.detailTemp = {
        dutyPerson: null, // 责任人
        problemUuid: null, // 问题Uuid
        rectifyStatus: null, // 整改状态
        violationPoints: null, // 违规积分
        rectifyTime: null, // 整改时间
        penalty: null, // 处罚金额
        isEnterAccount: null, // 是否入账
        problemDetailDesc: null, // 问题明细
        rectifyMeasure: null// 整改措施
      }
    },
    handleCreate() {
      this.closeStatus = false
      this.disableUpdate = false
      this.resetTemp()
      this.dialogStatus = 'create'
      // 打开新增对话框前获取项目结果集
      projectList(this.pageQueryProjectList).then(resp => {
        this.projectQueryList = resp.data.records
        if (resp.data.records !== null && resp.data.records.length) {
          this.temp.projectUuid = resp.data.records[0].projectUuid
          this.temp.projectName = resp.data.records[0].projectName
          this.getProjectPerson(resp.data.records[0].projectUuid)
        }
      })
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 问题明细添加按钮触发函数
    detailHandleCreate() {
      this.detailCloseStatus = false
      this.detailDisableUpdate = false
      this.detailResetTemp()
      this.detailDialogStatus = 'detailCreate'
      this.detailDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['detailDataForm'].clearValidate()
      })
    },
    // 新增问题
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 界面无输入域，自动赋值项目Uuid和审计人员Name
          if (typeof (this.temp.projectUuid) !== 'undefined' && this.temp.projectUuid !== null) { this.temp.projectName = _.find(this.projectQueryList, ['projectUuid', this.temp.projectUuid]).projectName }
          if (typeof (this.temp.auditPersonUuid) !== 'undefined' && this.temp.auditPersonUuid !== null) { this.temp.auditPersonName = _.find(this.personQueryList, ['auditPersonUuid', this.temp.auditPersonUuid]).auditPersonName }
          save(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: this.$t('message.title'),
              message: this.$t('message.insert.success'),
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          })
        }
      })
    },
    // 新增问题明细
    detailCreateData() {
      this.$refs['detailDataForm'].validate((valid) => {
        // 判断问题明细List是否为空，为空则将其转为数组防止无法push
        if (valid) {
          if (this.temp.problemDetailsList === null) this.temp.problemDetailsList = []
          this.temp.problemDetailsList.push(this.detailTemp)// 将明细表单的值存入问题的List
          this.detailDialogFormVisible = false
        }
      })
    },
    handleUpdate() {
      this.closeStatus = false
      this.disableUpdate = false
      // 打开新增对话框前获取项目结果集
      projectList(this.pageQueryProjectList).then(resp => {
        this.projectQueryList = resp.data.records
      })
      this.temp = Object.assign({}, this.selections[0]) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 界面无输入域，自动赋值项目name和审计人员name
          if (typeof (this.temp.projectUuid) !== 'undefined' && this.temp.projectUuid !== null) { this.temp.projectName = _.find(this.projectQueryList, ['projectUuid', this.temp.projectUuid]).projectName }
          if (typeof (this.temp.auditPersonUuid) !== 'undefined' && this.temp.auditPersonUuid !== null) { this.temp.auditPersonName = _.find(this.personQueryList, ['auditPersonUuid', this.temp.auditPersonUuid]).auditPersonName }
          const tempData = Object.assign({}, this.temp)
          update(tempData).then(() => {
            const index = this.list.findIndex(v => v.problemUuid === this.temp.problemUuid)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.getList()
            this.$notify({
              title: this.$t('message.title'),
              message: this.$t('message.update.success'),
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          })
        }
      })
    },
    // 点击问题明细修改按钮事件
    detailHandleUpdate(str) {
      // this.detailIndex = str //将取得的下标做临时存储
      this.detailCloseStatus = false
      this.detailDisableUpdate = false
      // console.log('取得的下标：' + str)
      // console.log("存入的下标："+this.detailIndex)
      // console.log(this.temp.problemDetailsList[this.detailIndex])
      this.detailTemp = this.temp.problemDetailsList[str] // copy obj
      this.detailDialogStatus = 'detailUpdate'
      this.detailDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['detailDataForm'].clearValidate()
      })
    },
    detailUpdateData() {
      this.$refs['detailDataForm'].validate((valid) => {
        if (valid) {
          // this.temp.problemDetailsList.splice(this.detailIndex,1,this.detailTemp)
          this.detailDialogFormVisible = false
          // console.log(this.temp.problemDetailsList[this.detailIndex])
          // console.log(this.detailIndex)
        }
      })
    },
    handleDelete() {
      this.$confirm(this.$t('confirm.delete'), this.$t('confirm.title'), {
        confirmButtonText: this.$t('confirm.okBtn'),
        cancelButtonText: this.$t('confirm.cancelBtn'),
        type: 'warning'
      }).then(() => {
        var ids = []
        this.selections.forEach((r, i) => {
          ids.push(r.problemUuid)
        })
        del(ids.join(',')).then(() => {
          this.getList()
          this.$notify({
            title: this.$t('message.title'),
            message: this.$t('message.delete.success'),
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
        })
      }).catch(() => {
        // this.$notify({
        //   title: '消息',
        //   message: '已取消删除',
        //   duration: 2000,
        //   position: 'bottom-right'
        // })
      })
    },
    // 删除问题明细
    detailHandleDelete(str) {
      this.$confirm(this.$t('confirm.delete'), this.$t('confirm.title'), {
        confirmButtonText: this.$t('confirm.okBtn'),
        cancelButtonText: this.$t('confirm.cancelBtn'),
        type: 'warning'
      }).then(() => {
        this.temp.problemDetailsList.splice(str, 1)
        console.log(this.temp.problemDetailsList)
      })
    },
    // 树节点过滤
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    handleNodeClick(item, node, self) {
      // 自己定义的editCheckId，防止单选出现混乱
      this.checkedId = item.id
      this.$refs.tree.setCheckedKeys([item.id])
    },
    checkChange(item, node, self) {
      if (node === true) {
        this.checkedId = item.id
        this.$refs.tree.setCheckedKeys([item.id])
      } else {
        if (this.checkedId === item.id) {
          this.$refs.tree.setCheckedKeys([item.id])
        }
      }
    },
    // 控制树是否显示
    handleTreeView() {
      // this.ptSonTreeData = getDictSonList("002004")
      this.ptFatherTreeData = getDictList('002004')
      this.ptFatherTreeData = toTreeData(this.ptFatherTreeData, 'codeUuid', 'parentCodeUuid', 'codeName', '002004')
      // console.log(this.ptSonTreeData)
      // console.log(this.ptFatherTreeData)
      // console.log(this.ptHeadTreeData)
      this.dialogTreeFormVisible = true
    },
    insertOrg() {
      if (typeof (this.$refs.tree.getCheckedNodes()[0]) !== 'undefined' && this.$refs.tree.getCheckedNodes()[0] != null) {
        this.temp.problemType = this.$refs.tree.getCheckedNodes()[0].label
        this.dialogTreeFormVisible = false
      } else {
        this.$message.error('请选择问题分类')
      }
      this.checkedId = null
    },
    handleSelectionChange(val) {
      this.selections = val
    },

    handleDetailSelectionChange(val) {
      this.detailSelections = val
    },

    getSortClass: function(key) {
      const sort = this.pageQuery.sort
      return sort === `+${key}` ? 'asc' : 'desc'
    },
    // 格式化整改状态
    formatStatus(data) {
      return this.formatMap.rectifyStatus[data.rectifyStatus]
    },
    // 格式化是否入账
    formatIsImportant(data) {
      return this.formatMap.isImportant[data.isImportant]
    },
    // 获取当前项目的参与审计人员
    getProjectPerson(id) {
      personList(id).then(resp => {
        this.personQueryList = resp.data
      })
    },
    // 初始化审计人员
    resetAudit() {
      this.temp.auditPersonUuid = null
    },
    /**
     *解析url上的参数
     */
    getQueryString() {
      let url = window.location.href;
      var params = [],
        h;
      var hash = url.slice(url.indexOf("?") + 1).split("&");
      for (var i = 0; i < hash.length; i++) {
        h = hash[i].split("="); //
        params[h[0]] = h[1];
      }
      return params;
    },
    /**
     * 格式化时间字符串
     * @param row 行数据
     * @param column 列数据
     * @returns {string} 返回格式化后的字符串
     */
    dateFormatter(row, column) {
      const datetime = row.runStartTime;
      if (datetime) {
        var dateMat = new Date(datetime);
        var year = dateMat.getFullYear();
        var month = dateMat.getMonth() + 1;
        var day = dateMat.getDate();
        var hh = dateMat.getHours();
        var mm = dateMat.getMinutes();
        var ss = dateMat.getSeconds();
        if (hh < 10) {
          hh = "0" + hh;
        }
        if (mm < 10) {
          mm = "0" + mm;
        }
        if (ss < 10) {
          ss = "0" + ss;
        }
        var timeFormat =
          year + "-" + month + "-" + day + " " + hh + ":" + mm + ":" + ss;
        return timeFormat;
      }
      return "";
    },
    /**
     * val是运行结果中的resultTables
     * modelName是选中的模型的名字
     */
    getResultTables(val, modelName, modelUuid, runStatus, resultSpiltObjects) {
      debugger
      if (runStatus == 3) {
        var assistTables = [];
        var mainTable = null;
        for (var i = 0; i < val.length; i++) {
          if (val[i].tableType == 1) {
            mainTable = val[i];
          } else {
            assistTables.push(val[i]);
          }
        }
        // 触发父类方法addTab在index.vue界面，同时穿过三个参数assistTables：辅表（运行结果表）数组  mainTable：主表（运行结果表对象）
        // modelName：模型的名称，用来给新页签赋值title属性用
        this.$emit(
          "addtab",
          assistTables,
          mainTable,
          modelName,
          modelUuid,
          resultSpiltObjects,
          this.projectUuid
        );
      } else {
        this.$message({
          type: "info",
          message: "该运行结果不是成功状态",
        });
      }
    },
    /**
     格式化时间字符串
     * @param row 行数据
     * @param column 列数据
     * @returns {string} 返回格式化后的字符串
     */
    dateFormatter1(row, column) {
      const datetime = row.runEndTime;
      if (datetime) {
        var dateMat = new Date(datetime);
        var year = dateMat.getFullYear();
        var month = dateMat.getMonth() + 1;
        var day = dateMat.getDate();
        var hh = dateMat.getHours();
        var mm = dateMat.getMinutes();
        var ss = dateMat.getSeconds();
        if (hh < 10) {
          hh = "0" + hh;
        }
        if (mm < 10) {
          mm = "0" + mm;
        }
        if (ss < 10) {
          ss = "0" + ss;
        }
        var timeFormat =
          year + "-" + month + "-" + day + " " + hh + ":" + mm + ":" + ss;
        return timeFormat;
      }
      return "";
    },
    dateFormatter2(row) {
      const datetime = row.runTask.timingExecute;
      if (datetime) {
        var dateMat = new Date(datetime);
        var year = dateMat.getFullYear();
        var month = dateMat.getMonth() + 1;
        var day = dateMat.getDate();
        var hh = dateMat.getHours();
        var mm = dateMat.getMinutes();
        var ss = dateMat.getSeconds();
        if (hh < 10) {
          hh = "0" + hh;
        }
        if (mm < 10) {
          mm = "0" + mm;
        }
        if (ss < 10) {
          ss = "0" + ss;
        }
        var timeFormat =
          year + "-" + month + "-" + day + " " + hh + ":" + mm + ":" + ss;
        return timeFormat;
      } else {
        return "无";
      }
    },
    /**
     * 格式化执行信息，取出执行信息中的sql
     */
    settingInfoSqlFormatter(row, column) {
      if (row.settingInfo == null) {
        return "";
      } else {
        var sql = JSON.parse(row.settingInfo).sql;
        if(!sql){
          return ""
        }
        sql = sql.substring(0, 10);
        sql = sql + "...";
        return sql;
      }
    },
    /**
     * 格式化执行信息，取出执行信息中的paramArr
     */
    settingInfoParamsArrFormatter(row, column) {
      if (row.settingInfo == null) {
        return "无";
      } else {
        var paramShowStr = "";
        var params = JSON.parse(row.settingInfo).paramsArr;
        if (params == undefined || params.length == 0) {
          return "无";
        } else {
          for (var i = 0; i < params.length; i++) {
            paramShowStr +=
              params[i].name + " : " + params[i].paramValue + "\r\n";
          }
          // var paramsArr = JSON.stringify(JSON.parse(row.settingInfo).paramsArr);
          return paramShowStr;
        }
      }
    },
    /**
     * 查询列表方法
     */
    getLikeList(query) {
      this.listLoading = true;
      var model = {};
      var runTask = {};
      if (query) {
        if (query.modelName == null || query.modelName == "") {
          model = null;
        } else {
          model = { modelName: query.modelName };
        }
        if (query.runUserName == null || query.runUserName == "") {
          runTask = null;
        } else {
          runTask = { runUserName: query.runUserName };
        }
        if (this.projectUuid != "") {
          resultRelProject = { resultRelProjectUuid: this.projectUuid };
        }
        query.resultRelProject = resultRelProject;
        query.model = model;
        query.runTask = runTask;
        this.pageQuery.condition = query;
      } else {
        var runTaskRel = {};
        var resultRelProject = {};
        if (this.projectUuid != "") {
          resultRelProject = { resultRelProjectUuid: this.projectUuid };
        }
        runTaskRel.resultRelProject = resultRelProject;
        this.pageQuery.condition = runTaskRel;
      }
      selectLikePageVoHandle(this.pageQuery).then((resp) => {
        this.total = resp.data.total;
        this.list = resp.data.records;
        this.listLoading = false;
      });
    },
    /**
     * 当多选框改变时触发
     */
    handleSelectionChange(val) {
      if (val.length <= 0) {
        this.buttonIson.AssociatedBtn = true;
        this.buttonIson.DisassociateBtn = false;
        this.buttonIson.deleteBtn = true;
        this.buttonIson.resultSplitBtn = true;
        this.buttonIson.resultShareBtn = true;
        this.buttonIson.exportBtn = false;
      } else if (val.length == 1) {
        this.buttonIson.AssociatedBtn = false;
        this.buttonIson.DisassociateBtn = false;
        this.buttonIson.deleteBtn = false;
        this.buttonIson.resultSplitBtn = true;
        this.buttonIson.resultShareBtn = false;
        this.buttonIson.exportBtn = false;
      } else if (val.length > 1) {
        this.buttonIson.AssociatedBtn = false;
        this.buttonIson.DisassociateBtn = false;
        this.buttonIson.deleteBtn = false;
        this.buttonIson.resultSplitBtn = false;
        this.buttonIson.resultShareBtn = false;
        this.buttonIson.exportBtn = false;
      }
      this.share.splice(0, this.share.length);
      this.notShare.splice(0, this.notShare.length);
      // 把共享过来的运行结果放进share数组，自己的运行结果放进notShare数组
      for (var i = 0; i < val.length; i++) {
        if (val[i].runResultShare.runResultShareUuid != null) {
          this.share.push(val[i]);
        } else {
          this.notShare.push(val[i]);
        }
      }
      // 把选中的所有数据赋值给selected1，供后续方法使用
      this.selected1 = val;
    },
    handleFilter() {
      this.pageQuery.pageNo = 1;
      this.getLikeList();
    },
    sortChange(data) {
      const { prop, order } = data;
      this.pageQuery.sortBy = order;
      this.pageQuery.sortName = prop;
      this.handleFilter();
    },
     //生成问题
    problem(){
      var selectObj = this.$refs.resultTable.selection;
      if (selectObj.length == 0) {
        this.$message({
          type: "info",
          message: "请选择要生成的模型结果",
        });
        return;
      }else{
        this.handleCreate()
      }
    },
    /**
     * 点击删除按钮触发的事件
     */
    deleteRunTaskRel() {
      var selected = this.selected1;
      var tips = "";
      var resultRelProjectUuids = []
      for (var i = 0; i < selected.length; i++) {
        if (selected[i].resultRelProject.resultRelProjectUuid == null) {
          tips += selected[i].model.modelName + " , ";
        }else{
          resultRelProjectUuids.push(selected[i].resultRelProject.resultRelProjectUuid)
        }
      }
      if (tips != "") {
        tips += "不存在项目关联不能删除";
        this.$message({
          message: tips,
        });
      } else {
        batchDeleteResultRelProject(resultRelProjectUuids).then(resp=>{
          if(resp.data==true){
             this.$notify({
              title: this.$t("提示"),
              message: this.$t("删除成功"),
              type: "success",
              duration: 2000,
              position: "bottom-right",
            });
          }else{
          this.$message({
            type: "error",
            message: "移除关联项目失败!",
          });
          }
        })
        this.getLikeList()
      }
    },
    /**
     * 运行类型格式化
     */
    runTypeFormate(row) {
      var runType = row.runTask.runType;
      if (runType == 2) {
        return "定时运行";
      } else if (runType == 3) {
        return "立即运行";
      }
    },
    /**
     * 结果总条数格式化
     */
    dataCountFormatter(row) {
      var tables = row.runResultTables;
      var dataCount = 0;
      for (var i = 0; i < tables.length; i++) {
        if (tables[i].tableType == 1) {
          dataCount = tables[i].dataCount;
        }
      }
      return dataCount;
    },
    /**
     * 查看sql
     * @param row 查看的sql行
     * @returns {string}
     */
    selectSql(row) {
      if (row.settingInfo == null) {
        return "";
      } else {
        var sql = JSON.parse(row.settingInfo).sql;
        this.sqlInfo = sql;
        this.sqlInfoDialog = true;
      }
    },
    /**
     * 处理结果
     */
    handleResult() {
      var selectObj = this.$refs.resultTable.selection;
      if (selectObj.length == 0) {
        this.$message({
          type: "info",
          message: "请选择要处理的模型结果",
        });
        return;
      }
      this.handleIdeaDialog = true;
    },
    /**
     * 修改模型结果的处理意见
     */
    updateHandleResult() {
      var selectObj = this.$refs.resultTable.selection;
      for (let i = 0; i < selectObj.length; i++) {
        //组织处理意见等对象
        selectObj[i].handleState = this.modelResultHandle.handleState;
        selectObj[i].handleIdea = this.modelResultHandle.handleIdea;
        updateRunTaskRel(selectObj[i]).then((result) => {});
        this.handleIdeaDialog = false;
        //处理完成直接修改
      }
    },
  },
};
</script>

