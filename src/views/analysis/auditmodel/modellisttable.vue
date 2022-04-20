<template>
  <div class="tree-list-container all">
    <el-tabs
      @tab-click="handleClick"
      v-model="editableTabsValue"
      closable
      @tab-remove="removeTab"
      style="height: 100%"
    >
      <el-tab-pane label="模型列表" name="modelList" style="height: 100%">
        <div class="filter-container">
          <QueryField
            ref="queryfield"
            :form-data="queryFields"
            @submit="getList"
          />
        </div>
        <el-row v-if="power != 'warning'" type="flex" class="row-bg">
          <el-col align="right">
            <!-- <el-button
              type="primary"
              :disabled="btnState.previewBtn"
              class="oper-btn preview"
              @click="previewModel"
              v-if="ifBtnShow.runBtn"
            /> -->
            <el-button
              type="primary"
              :disabled="btnState.previewBtn"
              class="oper-btn start"
              @click="previewModel"
              v-if="ifBtnShow.runBtn"
            />
            <!--            <el-button type="primary" :disabled="btnState.addBtnState" class="oper-btn add" @click="addModel" />-->
            <el-dropdown style="margin-right: 10px" v-if="ifBtnShow.addBtnState">
              <el-button
                type="primary"
                :disabled="btnState.addBtnState "
                @mouseover="mouseOver"
                @mouseleave="mouseLeave"
                class="oper-btn add"
              />
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="state in modelTypeData"
                  :key="state.codeValue"
                  @click.native="selectModelTypeDetermine(state.codeValue)"
                  >{{ state.codeName }}</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
            <el-button
              type="primary"
                    :disabled="btnState.copyBtnState "
                    v-if="ifBtnShow.copyBtnState"
                    class="oper-btn copy"
                    @click="copyModel"
            />

            <el-button
              type="primary"
              :disabled="btnState.editBtnState "
              v-if="ifBtnShow.editBtnState"
              class="oper-btn edit"
              @click="updateModel"
            />
            <!--            <el-button type="primary" :disabled="btnState.editBtnState" class="oper-btn edit" @click="updateModel1" />-->
            <el-button
              type="primary"
              :disabled="btnState.deleteBtnState"
              v-if="ifBtnShow.deleteBtnState"
              class="oper-btn delete"
              @click="deleteModel"
            />
            <el-dropdown placement="bottom" trigger="click" class="el-dropdown" v-if="ifBtnShow.otherBtn.all">
              <el-button
                type="primary"
                :disabled="btnState.otherBtn "
                class="oper-btn more"
              />
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="exportModel" v-if="ifBtnShow.otherBtn.exportBtnState"
                  >导出</el-dropdown-item
                >
                <el-dropdown-item @click.native="modelFolderTreeDialog = true" v-if="ifBtnShow.otherBtn.importBtnState"
                  >导入</el-dropdown-item
                >
                <el-dropdown-item @click.native="shareModelDialog" v-if="ifBtnShow.otherBtn.shareBtnState"
                  >共享</el-dropdown-item
                >
                <el-dropdown-item @click.native="cancelShareModelDialog" v-if="ifBtnShow.otherBtn.cancelShareBtnState"
                  >取消共享</el-dropdown-item
                >
                <el-dropdown-item @click.native="publicModelFun('publicModel')" v-if="ifBtnShow.otherBtn.publicBtnState"
                  >发布</el-dropdown-item
                >
                <el-dropdown-item @click.native="cancelPublicModel()" v-if="ifBtnShow.otherBtn.cancelPublicBtnState"
                  >模型下线</el-dropdown-item
                >
                <el-dropdown-item @click.native="moveModel()" v-if="ifBtnShow.otherBtn.moveBtnState"
                  >移动</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </el-col>
        </el-row>
<!--        复制模型弹窗-->
        <el-dialog
                :visible.sync="copyTreeVisible"
                width="600px"
                :close-on-click-modal="false"
                title="复制"
        >
          <ModelFolderTree ref="modelFolderTree" :power="power"  :spaceFolderName="spaceFolderName" :spaceFolderId="dataUserId" :publicModel="publicModel" :selectFolder="selectFolder"/>
          <span slot="footer">
        <el-button @click="copyTreeVisible = false">取消</el-button>
        <el-button type="primary" @click="copyPathSave()">保存</el-button>
      </span>
        </el-dialog>
<!--        复制模型名称输入框-->
        <el-dialog
                :close-on-click-modal="false"
                title="复制"
                :visible.sync="folderFormVisible"
                width="600px">
          <!-- 复制表输入框 -->
          <el-form ref="folderForm" :model="resourceForm">
            <el-form-item label="复制模型名称" prop="displayTbName">
              <el-input
                      v-model="resourceForm.displayTbName"
                      style="width: 100%"
                      class="detail-form"
              />
            </el-form-item>
          </el-form>
          <span slot="footer">
            <el-button size="mini" @click="folderFormVisible = false">取消</el-button>
            <el-button
                    type="primary"
                    @click="copyResourceSave()">保存</el-button>
          </span>
        </el-dialog>
        <el-dialog
          v-if="modelFolderTreeDialog"
          :close-on-click-modal="false"
          :visible.sync="modelFolderTreeDialog"
          title="选择业务分类"
          width="50%"
        >
          <ModelFolderTree ref="modelFolderTree" public-model="editorModel" />
          <div slot="footer">
            <el-button type="primary" @click="setImportFolder">确定</el-button>
            <el-button @click="modelFolderTreeDialog = false">取消</el-button>
          </div>
        </el-dialog>
        <el-dialog
          v-if="modelFolderTreeDialogMove"
          :close-on-click-modal="false"
          :visible.sync="modelFolderTreeDialogMove"
          title="选择业务分类"
          width="50%"
        >
          <ModelFolderTree
            ref="modelFolderTree"
            public-model="editorModel"
            :filter-id="moveFolderId"
          />
          <div slot="footer">
            <el-button type="primary" @click="moveModelConfirm">确定</el-button>
            <el-button @click="modelFolderTreeDialogMove = false"
              >取消</el-button
            >
          </div>
        </el-dialog>
        <el-table
          :key="tableKey"
          ref="modelListTable"
          v-loading="listLoading"
          style="height: calc(100% - 200px); overflow-y: scroll"
          :data="list"
          border
          fit
          highlight-current-row
          @select="modelTableSelectEvent"
          @select-all="modelTableSelectEvent"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="模型名称" width="300px" prop="modelName">
            <template slot-scope="scope">
              <el-link
                type="primary"
                @click="selectModelDetail(scope.row.modelUuid)"
                >{{ scope.row.modelName }}</el-link
              >
            </template>
          </el-table-column>
          <el-table-column label="审计事项" prop="auditItemName" />
          <el-table-column
            label="风险等级"
            prop="riskLevelUuid"
            align="center"
            :formatter="riskLevelFormatter"
          />
          <el-table-column
            label="模型类型"
            prop="modelType"
            align="center"
            :formatter="modelTypeFormatter"
          />
          <el-table-column
            label="模型用途"
            prop="modelUse"
            align="center"
            :formatter="modelUseFormatter"
          />
          <el-table-column
            label="创建时间"
            prop="createTime"
            align="center"
            :formatter="dateFormatter"
          />
          <el-table-column
            label="创建人"
            prop="createUserName"
            align="center"
          />
          <!-- <el-table-column label="平均运行时间" width="150px" prop="runTime" /> -->
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="pageQuery.pageNo"
          :limit.sync="pageQuery.pageSize"
          @pagination="getList"
        />
      </el-tab-pane>
      <el-tab-pane
        v-for="(item, index) in editableTabs"
        :key="item.name"
        :label="item.title"
        :name="item.name"
      >
        <!--增加参数输入组件-->
        <el-collapse v-model="activeNames">
          <el-collapse-item name="2" class="content-y">
            <!--增加结果组件-->
            <el-row>
              <div @click="Toggle1()">
                <el-col :span="24" class="row-all">
                  <childTabs
                    :isRelation="item.isRelation === true ? true : false"
                    @setNextValue="setNextValue"
                    @addTab="addTab"
                    :modelId="item.modelUuid"
                    :is-model-preview="true"
                    :ref="item.name"
                    :key="1"
                    :pre-value="item.executeSQLList"
                    :paramInfo="item.runModelConfig"
                    :maintableindex="item.maintableindex"
                    use-type="modelPreview"
                  />
                </el-col>
              </div>
              <el-col :span="2">
                <el-button
                  v-if="item.isExistParam"
                  type="primary"
                  class="btn-show"
                  @click="loadParamDraw(item.name)"
                >
                  <span class="iconfont iconoper-search" /><span
                    style="font-weight: normal"
                    >查询</span
                  >
                </el-button>
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
    </el-tabs>
    <!-- 大亚湾注掉 -->
    <!-- <modelshoppingcart
      :data-user-id="dataUserId"
      :scene-code="sceneCode"
      v-show="isShowShoppingCart"
      ref="modelShoppingCartRef"
    /> -->
    <el-dialog
      v-if="treeSelectShow"
      :close-on-click-modal="false"
      :visible.sync="treeSelectShow"
      title="发布模型"
      width="50%"
    >
      <ModelFolderTree ref="modelFolderTree" :public-model="publicModelValue" />
      <div slot="footer">
        <el-button type="primary" @click="updatePublicModel">确定</el-button>
        <el-button @click="treeSelectShow = false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      v-if="dialogFormVisible"
      :close-on-click-modal="false"
      title="请输入参数"
      :visible.sync="dialogFormVisible"
      :append-to-body="true"
    >
      <!--      <paramDraw v-if="dialogFormVisible" ref="paramDrawRef" :my-id="paramDrawUuid" />-->
      <paramDrawNew
        v-if="dialogFormVisible"
        :sql="this.currentPreviewModelParamAndSql.sqlValue"
        :arr="this.currentPreviewModelParamAndSql.paramObj"
        ref="paramDrawRefNew"
      ></paramDrawNew>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">关闭</el-button>
        <el-button type="primary" @click="replaceNodeParam">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      v-if="dialogFormVisiblePersonTree"
      :close-on-click-modal="false"
      title="请选择共享人员"
      :visible.sync="dialogFormVisiblePersonTree"
      :append-to-body="true"
    >
      <personTree ref="personTree" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisiblePersonTree = false">关闭</el-button>
        <el-button type="primary" @click="shareModel">确定</el-button>
      </div>
    </el-dialog>
    <el-upload
      style="position: relative; top: -40px; left: 240px; display: none"
      :show-file-list="false"
      :on-success="onSuccess"
      :on-error="onError"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :action="'/analysis/modelController/importModel/' + modelFolderUuid"
      accept=".json"
    >
      <el-button id="importBtn" plain type="primary">导入</el-button>
    </el-upload>
    <el-dialog
      title="请选择模型类型"
      :visible.sync="addModelIsSee"
      :close-on-click-modal="false"
      width="30%"
    >
      <el-select
        v-model="selectModelType"
        placeholder="请选择模型类型"
        style="width: 67%"
      >
        <el-option
          v-for="state in modelTypeData"
          :key="state.codeValue"
          :value="state.codeValue"
          :label="state.codeName"
        />
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addModelIsSee = false">取 消</el-button>
        <el-button type="primary" @click="selectModelTypeDetermine()"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <el-dialog
            title="请选择要取消分享的模型及人员"
            :visible.sync="cancelShareModelList"
            width="30%"
    >
      <el-table
        :data="shareModelList"
        ref="cancelShareModelList"
        border
        fit
        highlight-current-row
      >
        <el-table-column type="selection" width="55" />
        <el-table-column
                label="被分享模型名称"
                align="center"
                prop="modelname"
        />
        <el-table-column
                label="被分享人员名称"
                align="center"
                prop="belongname"
        />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelShareModelList = false">取 消</el-button>
        <el-button type="primary" @click="cancelShareModel()"
        >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  findModel,
  saveModel,
  deleteModel,
  shareModel,
  selectModel,
  updateModel,
  updateModelBasicInfo,
  removeModelShare,
  exportModel,
  setModelSession,
  copyModel,
  cancelShareModel,
  getShareModelList,
} from "@/api/analysis/auditmodel";
import { deleteGraphInfoById } from "@/api/graphtool/apiJs/graphList";
import QueryField from "@/components/public/query-field/index";
import Pagination from "@/components/Pagination/index";
import ModelFolderTree from "@/views/analysis/auditmodel/modelfoldertree";
import EditModel from "@/views/analysis/auditmodel/editmodel";
import { getDictList, getOneDict } from "@/utils/index";
import childTabs from "@/views/analysis/auditmodelresult/childtabs";
import {
  getExecuteTask,
  startExecuteSql,
} from "@/api/analysis/sqleditor/sqleditor";
import crossrangeParam from "@/views/analysis/modelparam/crossrangeparam";
import paramDraw from "@/views/analysis/modelparam/paramdraw";
import paramDrawNew from "@/views/analysis/modelparam/paramdrawnew";
import {getInfo, isAdmin} from '@/api/user'
import modelshoppingcart from "@/views/analysis/auditmodel/modelshoppingcart";
import personTree from "@/components/publicpersontree/index";
import ReviewSubmit from '@/views/flowwork/reviewSubmit.vue';
import { getArrLength } from "@/utils";
export default {
  name: "ModelListTable",
  components: {
    paramDrawNew,
    Pagination,
    QueryField,
    EditModel,
    ModelFolderTree,
    childTabs,
    crossrangeParam,
    paramDraw,
    modelshoppingcart,
    personTree,
  },
  props: ["power", "dataUserId", "sceneCode", "isAuditWarning"],
  data() {
    return {
      // 已经被当前人分享的模型列表弹窗
      cancelShareModelList: false,
      // 已经被当前人分享的模型列表
      shareModelList: [],
      //工作流相关
      flowSet: {
        opinionList: false,
        opinion: false,
        nextStep: true,
        isSecond: false,
      },
      flowItem: {
        //动态赋值
        wftype: "modelpublishflow",
        applyUuid: "",
        detailUuids: "",
        applyTitle: "",
        workEffortId: "",
        appDataUuid: "",
        versionUuid: "",
        isSecond: false,
        temp1: "",
      },
      flowParam: 0,
      // 定义数据列
      columnDefs: [
        {field:"modelName",headerName:"模型名称"},
        {field:"runTime",headerName:"平均运行时间"},
        {field:"auditItemName",headerName:"审计事项"},
        {field:"riskLevelUuid",headerName:"风险等级"},
        {field:"modelType",headerName:"模型类型"},
        {field:"createTime",headerName:"创建时间"},
      ],
      //工作流相关
      submitData: {
          versionUuid: 'tlLuwUhC',
          busTableName: '',  //表名
          busDatabaseName: 'warehouse',  //数据库名
          busDatabaseType: '',  //
          status: '1',  //预警数据状态
          busdatas: [],
          commonModelName:'',
          commonModelUuid:''
      },
      isShow: false,
      tableKey: "errorUuid",
      // list列表
      list: null,
      total: 0,
      // 遮罩
      listLoading: false,
      // 编辑框名称
      editModelTitle: "",
      isShowShoppingCart: false,
      // 发布模型dialog
      treeSelectShow: false,
      // 折叠面板默认展开
      activeNames: ["1", "2"],
      // 编辑模型dialog
      editModelShow: false,
      // 发布模型
      publicModelValue: "publicModel",
      // 选中树节点
      selectTreeNode: null,
      // 编辑模型遮罩
      editorModelLoading: false,
      // 是否修改
      isUpdate: false,
      // 页签默认值
      editableTabsValue: "modelList",
      nowTabModelUuid: "",
      // 页签数组
      editableTabs: [],
      // 已经正在预览的模型
      modelPreview: [],
      //记录每次生成参数渲染界面的唯一编号
      paramDrawUuid: "",
      // 记录模型是否首次运行  如果非首次运行则不重复加载参数
      modelRunTaskList: {},
      // 参数输入界面
      dialogFormVisible: false,
      // 按钮状态 （禁用:true）
      btnState: {
        addBtnState: true,
        editBtnState: true,
        copyBtnState: true,
        deleteBtnState: true,
        previewBtn: true,
        // 更多中的导入按钮 点击后会选择位置，所以不用禁用
        otherBtn: false,
      },
      ifmanger:0,//是否是管理员
      // 当前预览模型参数和sql
      currentPreviewModelParamAndSql: {},
      queryFields: [
        { label: "模型名称", name: "modelName", type: "fuzzyText", value: "" },
        {
          label: "审计事项",
          name: "auditItemName",
          type: "fuzzyText",
          value: "",
        },
        {
          label: "风险等级",
          name: "riskLevelUuid",
          type: "select",
          data: [
            { name: "高", value: "002002001" },
            { name: "中", value: "002002002" },
            { name: "低", value: "002002003" },
          ],
          default: "-1",
        },
      ],
      // 是否编辑模型对象
      operationObj: {},
      formStyle: {
        width: "700px",
        height: "400px",
      },
      temp: {
        modelUuid: "",
        modelName: "",
        modelFolderUuid: "",
        modelFolderPath: "",
        auditItemUuid: "",
        riskLevelUuid: "",
        auditIdeas: "",
        paramConditions: "",
        sqlValue: "",
        modelType: "",
      },
      pageQuery: {
        condition: {},
        pageNo: 1,
        pageSize: 20,
        sortBy:"desc",
        sortName:"modelName"
      },
      tabIndex: 0, //语句记录页签个数
      // 人员选择
      dialogFormVisiblePersonTree: false,
      modelId: "",
      //当前界面运行的所有模型的配置 包含sql以及参数
      currentRunModelAllConfig: {},
      //当前模型是否运行过
      currentModelIsRun: false,
      flag: "notModelPreview", //渲染参数面试判断是不是模型预览调用的，如果是就取第一次输入的值，如果不是就取默认值
      addModelIsSee: false, //点击添加模型按钮的时候触发选择模型类型dialog
      selectModelType: "", //选择的模型类型
      modelTypeData: [], //模型类型
      modelFolderTreeDialog: false,
      modelFolderTreeDialogMove: false,
      moveFolderId: "",
      modelFolderUuid: "",
      modelFolderName: "",
      relationNextValue: {},
      ifcancel:0,
      copyTreeVisible:false,
      copySelect: [],
      treeType: "save",// common:正常的权限树   save:用于保存数据的文件夹树
      currentSceneUuid: "auditor",
      folderFormVisible: false,
      resourceForm: {
        displayTbName:null,
      },
      spaceFolderName: "个人模型",
      publicModel: "copyModel",
      selectFolder: "gonggong",
      // 是否是刚加载完页面的状态（对应点击树后状态）
      ifDefault: true,
      // 点击文件夹时是否显示按钮
      ifBtnShow: {
        addBtnState: true,
        editBtnState: true,
        copyBtnState: true,
        deleteBtnState: true,
        previewBtn: true,
        runBtn: true,
        otherBtn: {
          all: true,
          exportBtnState: true,
          importBtnState: true,
          shareBtnState: true,
          cancelShareBtnState: true,
          publicBtnState: true,
          cancelPublicBtnState: true,
          moveBtnState: true,
        },
      },
    };
  },
  computed: {},
  watch: {
    dialogFormVisible(value) {
      // this.$nextTick(function() {
      //   if (value) {
      //     this.$refs.paramDrawRef.initParamHtmlSS(
      //       this.currentPreviewModelParamAndSql.sqlValue,
      //       this.currentPreviewModelParamAndSql.paramObj,
      //       '请输入参数',
      //       this.paramDrawUuid,
      //       "sqlEditor")
      //   }
      // })
      this.$nextTick(function () {
        if (value) {
          this.$refs.paramDrawRefNew.createParamNodeHtml(
            this.paramDrawUuid,
            "",
            this.flag
          );
        }
      });
    },
    editableTabs() {},
  },
  created() {
    // 校验用户权限
    isAdmin().then((res) => {
      // 如果是管理员则放开按钮权限
      if (res.data) {
        this.ifmanger = 1
      } else {
        // 禁用按钮权限
        this.ifmanger = 0
      }
    })
    this.getList()
  },
  mounted() {
    this.initWebSocket();
    this.initData();
  },
  methods: {
    startrun(){
      //大亚湾注掉
      // this.$refs.modelShoppingCartRef.runImmediately()
    },
    setImportFolder() {
      let selectNode = this.$refs.modelFolderTree.getSelectNode();
      if (selectNode.id == undefined) {
        this.$message({ type: "info", message: "请选择业务分类" });
        return;
      }
      if (
        selectNode.pid == 0 ||
        selectNode.pid == null ||
        selectNode.pid == undefined
      ) {
        this.$message({ type: "info", message: "不允许建立在根目录" });
        return;
      } else {
        this.modelFolderUuid = selectNode.id;
        this.modelFolderName = selectNode.label;
        this.modelFolderTreeDialog = false;
        this.importData();
      }
    },
    mouseOver() {},
    mouseLeave() {},
    initData() {
      // 初始化审计事项
      this.modelTypeData = getDictList("002003");
    },
    Toggle: function () {
      this.isShow = !this.isShow;
    },
    Toggle1: function () {
      this.isShow = false;
    },
    /**
     *初始化webSocket
     */
    initWebSocket() {
      this.webSocket = this.getWebSocket();
    },
    /**
     *
     * 使用说明：
     * 1、WebSocket客户端通过回调函数来接收服务端消息。例如：webSocket.onmessage
     * 2、WebSocket客户端通过send方法来发送消息给服务端。例如：webSocket.send();
     */
    getWebSocket() {
      const webSocketPath = this.AmsWebsocket.getWSBaseUrl(this.AmsModules.ANALYSIS) + this.$store.getters.personuuid + 'modellisttable'
      // WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
      this.webSocket = new WebSocket(webSocketPath); // 建立与服务端的连接
      // 当服务端打开连接
      this.webSocket.onopen = function (event) {};
      // 发送消息
      this.webSocket.onmessage = function (event) {
        const dataObj = JSON.parse(event.data);
        if (dataObj.listenerType === "onSQLResult") {
          func1(event);
        }
      };
      const func2 = function func3(val) {
        const dataObj = JSON.parse(val.data);
        /*        if(this.currentPreviewModelParamAndSql.paramObj != undefined){
          this.$refs.[dataObj.modelUuid + 'param'][0].
          initParamHtmlSS(this.currentPreviewModelParamAndSql.sqlValue, this.currentPreviewModelParamAndSql.paramObj, '请输入参数', dataObj.modelUuid)
        }*/
        var selectObj = this.$refs.modelListTable.selection;
        this.$refs[dataObj.modelUuid][0].loadTableData(
          dataObj,
          selectObj[0].modelName
        );
      };
      const func1 = func2.bind(this);
      this.webSocket.onclose = function (event) {};
      // 通信失败
      this.webSocket.onerror = function (event) {};
    },
    /**
     * 格式化时间字符串
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的时间字符串}
     */
    dateFormatter(row, column) {
      const datetime = row.createTime;
      if (datetime) {
        let dateMat = new Date(datetime);
        let year = dateMat.getFullYear();
        let month = dateMat.getMonth() + 1;
        let day = dateMat.getDate();
        let hours = dateMat.getHours();
        let minutes = dateMat.getMinutes();
        let second = dateMat.getSeconds();
        if (month.toString().length == 1) {
          month = "0" + month;
        }
        if (day.toString().length == 1) {
          day = "0" + day;
        }
        if (hours.toString().length == 1) {
          hours = "0" + hours;
        }
        if (minutes.toString().length == 1) {
          minutes = "0" + minutes;
        }
        if (second.toString().length == 1) {
          second = "0" + second;
        }
        var d =
          year +
          "-" +
          month +
          "-" +
          day +
          " " +
          hours +
          ":" +
          minutes +
          ":" +
          second;
        return d;
      }
    },
    /**
     * 格式化模型类型
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的字符串}
     */
    modelTypeFormatter(row, column) {
      const modelType = row.modelType;
      const dicObj = getOneDict(modelType);
      let value = "";
      if (dicObj.length == 0) {
        return "";
      }
      value = dicObj[0].codeName;
      return value;
    },
    /**
     * 格式化模型用途
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的字符串}
     */
    modelUseFormatter(row) {
      if (row.modelUse == 2) {
        return "审计预警";
      }
      return "审计查询";
    },
    /**
     * 格式化风险等级
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的字符串}
     */
    riskLevelFormatter(row, column) {
      const riskLevel = row.riskLevelUuid;
      let value = "";
      const dicObj = getOneDict(riskLevel);
      if (dicObj.length == 0) {
        return "";
      }
      value = dicObj[0].codeName;
      return value;
    },
    /**
     * 获取模型列表
     * @param query 查询条件
     */
    getList(query) {
      var path = null;
      // 点击文件夹时读取modelFolderPath
      if(query != null && typeof query !== "undefined" && typeof query.modelFolderPath !== "undefined") {
        path = query.modelFolderPath == null ? '' :query.modelFolderPath.split('/')[0];
      }
      // 点击模型时读取pid
      if(query != null && typeof query !== "undefined" && typeof query.pid !== "undefined") {
        path = query.pid == null ? '' :query.pid;
      }
        switch(path) {
          case 'xiaxian':
            // 只显示删除
            this.ifBtnShow = {
              addBtnState: false,
              editBtnState: false,
              copyBtnState: false,
              deleteBtnState: true,
              previewBtn: false,
              runBtn: false,
              otherBtn: {
                all: false,
                exportBtnState: false,
                importBtnState: false,
                shareBtnState: false,
                cancelShareBtnState: false,
                publicBtnState: false,
                cancelPublicBtnState: false,
                moveBtnState: false,
              },
            };
            break;
            case 'gongxiang' :
              // 显示运行按钮
              this.ifBtnShow = {
                addBtnState: false,
                editBtnState: false,
                copyBtnState: false,
                deleteBtnState: false,
                previewBtn: false,
                runBtn: true,
                otherBtn: {
                  all: false,
                  exportBtnState: false,
                  importBtnState: false,
                  shareBtnState: false,
                  cancelShareBtnState: false,
                  publicBtnState: false,
                  cancelPublicBtnState: false,
                  moveBtnState: false,
                },
              };
              break;
          case 'gonggong' :
            // 管理员有所有权限，非管理员 只能运行
                  // 非管理员
              if(this.ifmanger == 0){
                this.ifBtnShow = {
                  addBtnState: false,
                  editBtnState: false,
                  copyBtnState: false,
                  deleteBtnState: false,
                  previewBtn: false,
                  runBtn: true,
                  otherBtn: {
                    all: false,
                    exportBtnState: false,
                    importBtnState: false,
                    shareBtnState: false,
                    cancelShareBtnState: false,
                    publicBtnState: false,
                    cancelPublicBtnState: false,
                    moveBtnState: false,
                  },
                }
              }else{
                // 管理员 不能发布
                this.ifBtnShow = {
                  addBtnState: true,
                  editBtnState: true,
                  copyBtnState: true,
                  deleteBtnState: true,
                  previewBtn: true,
                  runBtn: true,
                  otherBtn: {
                    all: true,
                    exportBtnState: true,
                    importBtnState: true,
                    shareBtnState: false,
                    cancelShareBtnState: false,
                    publicBtnState: false,
                    cancelPublicBtnState: true,
                    moveBtnState: true,
                  },
                }
              }
            break;
          case this.$store.getters.datauserid:
            //个人模型 下线按钮不显示
                this.ifBtnShow = {
                  addBtnState: true,
                  editBtnState: true,
                  copyBtnState: true,
                  deleteBtnState: true,
                  previewBtn: true,
                  runBtn: true,
                  otherBtn: {
                    all: true,
                    exportBtnState: true,
                    importBtnState: true,
                    shareBtnState: true,
                cancelShareBtnState: true,
                    publicBtnState: true,
                cancelPublicBtnState: false,
                    moveBtnState: true,
                  },
                }
            break;
      }
      this.listLoading = true;
      if (query) {
        if(this.isAuditWarning) { query.modelUse = 2}
        // 添加选中左侧树的条件
        if((this.selectTreeNode !== null) && (query.modelFolderUuid === undefined || query.modelFolderUuid === null  || query.modelFolderUuid.length === 0)){
          query.modelFolderUuid = this.selectTreeNode.id
        }
        this.pageQuery.condition = query;
      } else {
        var condition = {};
        if(this.isAuditWarning) {
          condition.modelUse = 2
        }
        // 添加选中左侧树的条件
        if((this.selectTreeNode !== null && this.selectTreeNode.length >0) && (query.modelFolderUuid === undefined || query.modelFolderUuid === null  || query.modelFolderUuid.length === 0)){
          condition.modelFolderUuid = this.selectTreeNode.id
        }
        this.pageQuery.condition = condition;
      }
      
      findModel(this.pageQuery).then((resp) => {
        this.total = resp.data.total;
        this.list = resp.data.records;
        this.listLoading = false;
        if(query != null && typeof query !== "undefined" && typeof query.modelUuid !== "undefined"){
          // this.$refs.modelListTable.selection
          let _this = this
          setTimeout(function(){
            _this.$refs.modelListTable.selection.push(resp.data.records[0])
            _this.modelTableSelectEvent()
          },200)
        }
      });
    },
    /**
     * 设置选中的树节点
     * @param data 树节点
     */
    setSelectTreeNode(data) {
      this.selectTreeNode = data;
      this.editableTabsValue = "modelList"
      // 点击左侧树的文件夹后解除对新增按钮的禁用（因未选择左侧树时不能新增）
      this.btnState.addBtnState = false;
      // 点击左侧树后，就不是页面刚加载完的状态了
      this.ifDefault = false;
      //点击左侧树后清空右侧查询框数据
      this.$refs.queryfield.clearAll();
      getInfo()
    },
    /**
     * 保存模型
     */
    save() {
      var modelObj = this.$refs.editModel.getModelObj();
      if (modelObj == null) {
        return;
      }
      this.editorModelLoading = true;
      if (!this.isUpdate) {
        saveModel(modelObj).then((result) => {
          if (result.code === 0) {
            this.getList(this.query); // 刷新列表
            this.$emit("refreshTree");
            this.editorModelLoading = false;
            this.editModelShow = false;
            // this.$refs.editModel.clear();
          } else {
            this.$message({ type: "error", message: "新增模型失败!" });
            this.editorModelLoading = false;
          }
        });
      } else {
        updateModel(modelObj).then((result) => {
          if (result.code === 0) {
            this.getList(this.query); // 刷新列表
            this.$emit("refreshTree");
            this.editorModelLoading = false;
            this.editModelShow = false;
            // this.$refs.editModel.clear();
          } else {
            this.$message({ type: "error", message: "修改模型失败!" });
            this.editorModelLoading = false;
          }
        });
      }
    },
    /**
     * 重置查询
     */
    resetQuery() {
      this.query = {
        condition: {
          opIp: "",
          moduleName: "",
          opOperate: "",
          opInfo: "",
          endTime: "",
          opTime: "",
          opUserName: "",
        },
      };
    },
    /**
     * 隐藏编辑模型界面
     */
    changeTreeData(obj){
      this.submitData.commonModelName = obj.treeUrlname
      this.submitData.commonModelUuid = obj.treeUrlid
    },
    modelTableSelectEvent(selection, row) {
      var selectObj = this.$refs.modelListTable.selection;
      if (selectObj.length == 1) {
        // 选中模型数为1时，默认拥有全部按钮权限
          this.btnState = {
            addBtnState: false,
          editBtnState: false,
          copyBtnState: false,
          deleteBtnState: false,
            previewBtn: false,
          otherBtn: false
          }

        if (this.isAuditWarning != true) {
          this.isShowShoppingCart = true;
          //大亚湾注掉
          // this.$refs.modelShoppingCartRef.setMemo(selectObj);
        }
        // 因长度为1 直接使用selectObj[0] 不遍历
        var modelFolderPath = selectObj[0].modelFolderPath;
        var folderUuid = modelFolderPath == null ? '' :modelFolderPath.split('/')[0];
        // 共享模型没有任何权限 ， 下线模型只有删除权限
        switch(folderUuid){
          case 'gongxiang':
            this.btnState = {
              addBtnState: true,
              editBtnState: true,
              copyBtnState: true,
              deleteBtnState: true,
              previewBtn: true,
              otherBtn: true
            }
            break;
          case 'xiaxian':
            this.btnState = {
              addBtnState: true,
              editBtnState: true,
              copyBtnState: true,
              deleteBtnState: false,
              previewBtn: true,
              otherBtn: true
            }
            break;
          case 'gonggong':
            if(this.ifmanger == 0){
              // 是管理员 全部按钮都有权限 （ 默认全是false，此处不用再设置 ）
              // 不是管理员 只能运行
              this.btnState = {
                addBtnState: true,
                editBtnState: true,
                copyBtnState: true,
                deleteBtnState: true,
                previewBtn: true,
                otherBtn: true
              }
            }
          break;
        }
      } else if (selectObj.length > 1) {
        // 选多条最大权限是选中模型均在个人空间 (运行、新增、导出（更多）、删除)
        this.btnState ={
          addBtnState: false,
          editBtnState: true,
          copyBtnState: true,
          deleteBtnState: false,
          previewBtn: false,
          otherBtn: false,
        };
        if (this.isAuditWarning != true) {
          this.isShowShoppingCart = true;
          //大亚湾注掉
          // this.$refs.modelShoppingCartRef.setMemo(selectObj);
        }
        // 遍历判断 以最小权限的模型为参考
        for (var i = 0; i < selectObj.length; i++) {
          var modelFolderPath1 = selectObj[i].modelFolderPath;
          var folderUuid1 = modelFolderPath1 == null ? '' : modelFolderPath1.split('/')[0];
          // 只禁用不放开，就会以最小权限的模型为主，而不会以最后一个选项为主
          switch (folderUuid1) {
            case 'gonggong':
              // 如果是管理员 不处理，直接使用默认选中多条的权限
              // 如果不是管理员 公共模型只有运行权限（除了运行按钮，其他全禁用）
              if (this.ifmanger == 0) {
                this.btnState.addBtnState = true;
        this.btnState.deleteBtnState = true;
                this.btnState.otherBtn = true;
              }
              break;
            case 'gongxiang':
              // 共享模型没有任何按钮权限，只能点击模型名称查看
              this.btnState.addBtnState = true;
              this.btnState.deleteBtnState = true;
        this.btnState.previewBtn = true;
              this.btnState.otherBtn = true;
              break;
            case 'xiaxian':
              this.btnState.addBtnState = true;
              // 因为下线模型可被删除，但默认是不禁用，此处就不用给下线模型的删除按钮权限设置为false
              this.btnState.previewBtn = true;
              this.btnState.otherBtn = true;
              break;
          }
        }
      } else if (selectObj.length == 0) {
        // 恢复默认状态
        this.btnState={
          addBtnState: true,
          editBtnState: true,
          copyBtnState: true,
          deleteBtnState: true,
          previewBtn: true,
          // 更多中的导入按钮 点击后会选择位置，所以不用禁用
          otherBtn: false,
        };
        this.isShowShoppingCart = false;
      }

      // 如果是页面刚加载完的状态（未选中左侧树），没有新增权限 无论选择了多少条数据
      if(this.ifDefault){
        this.btnState.addBtnState = true;
      }
    },
    /**
     * 添加模型
     */
    addModel() {
      this.isUpdate = false;
      let operationObj = { operationType: 1, folderId: "", folderName: "" };
      if (this.selectTreeNode != null) {
        if (this.selectTreeNode.pid == 0 || this.selectTreeNode.pid == null) {
          this.$message({ type: "info", message: "不允许建立在根目录" });
          return;
        }
        operationObj = {
          operationType: 1,
          folderId: this.selectTreeNode.id,
          folderName: this.selectTreeNode.label,
          folderPath: this.selectTreeNode.path,
        };
      }
      sessionStorage.setItem("operationObj", JSON.stringify(operationObj));
      this.$store.commit("aceState/setRightFooterTags", {
        type: "active",
        val: {
          name: "新增模型",
          path:
            "/analysis/editorModel?dataUserId=" +
            this.dataUserId +
            "&sceneCode=" +
            this.sceneCode,
        },
      });
    },
    selectModelTypeDetermine(selectModelType) {
      this.addModelIsSee = false;
      let operationObj = {
        operationType: 1,
        folderId: "",
        folderName: "",
        modelType: selectModelType,
      };
      if (this.selectTreeNode != null) {
        if (this.selectTreeNode.pid == 0 || this.selectTreeNode.pid == null) {
          this.$message({ type: "info", message: "不允许建立在根目录" });
          return;
        }
        operationObj = {
          operationType: 1,
          folderId: this.selectTreeNode.id,
          folderName: this.selectTreeNode.label,
          folderPath: this.selectTreeNode.path,
          modelType: selectModelType,
        };
      }
      sessionStorage.setItem("operationObj", JSON.stringify(operationObj));
      this.$router.push({
        path:  `/analysis/editormodelnew?dataUserId=${this.dataUserId}&sceneCode=${this.sceneCode}`
      });
      // this.$store.commit("aceState/setRightFooterTags", {
      //   type: "active",
      //   val: {
      //     name: "新增模型",
      //     path:
      //       "/analysis/editormodelnew?dataUserId=" + this.dataUserId + "&sceneCode=" + this.sceneCode,
      //   },
      // });
    },
    copyModel(){
      var selectObj = this.$refs.modelListTable.selection;
      this.selectFolder = selectObj[0].modelFolderPath.split('/')[0] ;
      if (selectObj.length == 0) {
        this.$message({ type: "info", message: "最少选择一个模型!" });
        return;
      }
      if (selectObj.length > 1) {
        this.$message({ type: "info", message: "只能选择一个模型!" });
        return;
      }
      var copyObj = selectObj.filter((obj) => {
        return obj.type === "folder";
      });
      var objTotal = getArrLength(copyObj);
      if (objTotal > 0) {
        this.$message({
          type: "info",
          message: "复制失败!复制文件夹操作不允许",
        });
        return;
      }
      this.copyTreeVisible = true;

    },
    copyPathSave() {
      let selectObj = JSON.parse(JSON.stringify(this.$refs.modelListTable.selection[0]));
      let folderObj = this.$refs.modelFolderTree.selectTreeNode;
      if (folderObj.length == 0) {
        this.$message({ type: "info", message: "最少选择一个文件夹!" });
        return;
      }
      if (folderObj.length > 1) {
        this.$message({ type: "info", message: "只能选择一个文件夹!" });
        return;
      }
      this.resourceForm.displayTbName = selectObj.modelName+"_副本";
      this.copyTreeVisible = false;
      this.folderFormVisible = true;
    },
    copyResourceSave(){
      var modelNewName = this.resourceForm.displayTbName;
      if(modelNewName.trim().length == 0){
        this.$message({ type: "info", message: "请输入模型名称" });
        return;
      }
      let selectObj = JSON.parse(JSON.stringify(this.$refs.modelListTable.selection[0]));
      let folderObj = this.$refs.modelFolderTree.selectTreeNode;
      selectObj.modelFolderUuid = folderObj.id;
      selectObj.modelName = modelNewName;
      copyModel(selectObj).then(res =>{
        if(res.code == 0){
          this.getList(this.query);
          this.$emit("refreshTree");
          this.$notify({
            title: "提示",
            message: "复制成功",
            type: "success",
            duration: 2000,
            position: "bottom-right",
          });
          this.folderFormVisible = false;
        } else {
          this.$message({ type: "error", message: res.msg });
        }
      });
    },
    updateModel() {
      console.log(this.$refs.modelListTable.selection)
      this.isUpdate = true;
      var selectObj = this.$refs.modelListTable.selection;
      if (selectObj.length == 0) {
        this.$message({ type: "info", message: "最少选择一个模型!" });
        return;
      }
      if (selectObj.length > 1) {
        this.$message({ type: "info", message: "只能选择一个模型!" });
        return;
      }
      this.editModelTitle = "修改模型";
      this.$emit("loadingSet", true, "正在获取模型信息...");
      selectModel(selectObj[0].modelUuid).then((result) => {
        this.$emit("loadingSet", false, "");
        if (result.code == 0) {
          var operationObj = {
            operationType: 2,
            model: result.data,
            folderId: "",
            folderName: "",
            folderPath: selectObj[0].modelFolderPath,
          };
          sessionStorage.setItem("operationObj", JSON.stringify(operationObj));
          this.$router.push({
            path:  `/analysis/editormodelnew?dataUserId=${this.dataUserId}&sceneCode=${this.sceneCode}`
          });
          // this.$store.commit("aceState/setRightFooterTags", {
          //   type: "active",
          //   val: {
          //     name: "修改模型",
          //     path:
          //       "/analysis/editormodelnew?dataUserId=" +
          //       this.dataUserId +
          //       "&sceneCode=" +
          //       this.sceneCode,
          //   },
          // });
        } else {
          this.$message({ type: "error", message: "修改失败" });
        }
      });
    },
    updateModel1() {
      this.isUpdate = true;
      var selectObj = this.$refs.modelListTable.selection;
      if (selectObj.length == 0) {
        this.$message({ type: "info", message: "最少选择一个模型!" });
        return;
      }
      if (selectObj.length > 1) {
        this.$message({ type: "info", message: "只能选择一个模型!" });
        return;
      }
      this.editModelTitle = "修改模型";
      this.$emit("loadingSet", true, "正在获取模型信息...");
      selectModel(selectObj[0].modelUuid).then((result) => {
        this.$emit("loadingSet", false, "");
        if (result.code == 0) {
          var operationObj = {
            operationType: 2,
            model: result.data,
            folderId: "",
            folderName: "",
          };
          sessionStorage.setItem("operationObj", JSON.stringify(operationObj));
          this.$store.commit("aceState/setRightFooterTags", {
            type: "active",
            val: {
              name: "修改模型",
              path:
                "/analysis/editormodelnew?dataUserId=" +
                this.dataUserId +
                "&sceneCode=" +
                this.sceneCode,
            },
          });
        } else {
          this.$message({ type: "error", message: "修改失败" });
        }
      });
    },
    /**
     * 删除模型
     */
    deleteModel() {
      var selectObj = this.$refs.modelListTable.selection;
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: "info", message: "请先选择要删除的模型!" });
        return;
      }
      this.$confirm("此操作将永久删除该模型, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        deleteModel(selectObj).then((result) => {
          if (result.code == 0) {
            //删除成功  同时删除图形化模型
            if (result.data != null) {
              for (let i = 0; i < result.data.length; i++) {
                //如果包含图形化模型则同时删除图形化模型
                if (result.data[i].graphUuid !== null && result.data[i].graphUuid !== "") {
                  deleteGraphInfoById(result.data[i].graphUuid);
                }
              }
            }
            this.getList(this.query);
            this.$emit("refreshTree");
            this.$notify({
              title: "提示",
              message: "删除成功",
              type: "success",
              duration: 2000,
              position: "bottom-right",
            });
            let modelUuidList =[];
            // 将选中模型的分享数据也全部删除
            for (let i = 0; i < selectObj.length; i++) {
              modelUuidList.push(selectObj[i].modelUuid);
            }
            removeModelShare(modelUuidList);
          } else {
            this.$message({ type: "error", message: "删除失败" });
          }
        });
      });
    },
    /**
     * 发布模型
     */
    publicModelFun(value) {
      if (
        this.selectTreeNode == null ||
        this.selectTreeNode.path.indexOf("gonggong") != -1
      ) {
        this.$message({ type: "info", message: "只能发布非公共模型下的模型" });
        return;
      }
      this.publicModelValue = value;
      var selectObj = this.$refs.modelListTable.selection;
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: "info", message: "请先选择要发布的模型!" });
        return;
      }
      this.treeSelectShow = true;
      this.submitData.busdatas = this.$refs.modelListTable.selection
    },
    /*
    * 移动模型
    * */
    moveModel() {
      var selectObj = this.$refs.modelListTable.selection;
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: "info", message: "请先选择要移动的模型!" });
        return;
      }
      let rootId = this.$parent.$parent.getRootFolderUuid(selectObj[0].modelFolderUuid)
      if(!rootId) {
        this.$message({ type: "warn", message: `找不到${selectObj[0].modelName}的分类` });
        return;
      }
      let error;
      selectObj.forEach(obj => {
        if(this.$parent.$parent.getRootFolderUuid(obj.modelFolderUuid) !== rootId) {
          this.$message({ type: "warn", message: "请选择同一分类下的模型!" });
          error = true;
        }
      })
      if(error) return;
      this.moveFolderId = rootId;
      this.modelFolderTreeDialogMove = true;
    },
    /*
    * 移动模型
    * */
    moveModelConfirm() {
      this.$confirm("是否确定将选中的模型移动?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        const selectNode = this.$refs.modelFolderTree.getSelectNode();
        var selectObj = this.$refs.modelListTable.selection;
        for (let i = 0; i < selectObj.length; i++) {
          selectObj[i].modelFolderUuid = selectNode.id;
        }
        updateModelBasicInfo(selectObj).then((result) => {
          if (result.code == 0) {
            this.treeSelectShow = false;
            this.$notify({
              title: "提示",
              message: "移动成功",
              type: "success",
              duration: 2000,
              position: "bottom-right",
            });
            this.getList(this.query); // 刷新列表
            this.$emit("refreshTree");
            // 刷新树和列表
            this.modelFolderTreeDialogMove = false
          } else {
            this.$message({ type: "error", message: "移动失败" });
          }
        });
      });
    },
    /**
     *撤销发布
     */
    cancelPublicModel() {
      if (
        this.selectTreeNode == null ||
        this.selectTreeNode.path.indexOf("gonggong") == -1
      ) {
        this.$message({ type: "info", message: "只能下线公共模型下的模型" });
        return;
      }
      var selectObj = this.$refs.modelListTable.selection;
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: "info", message: "请先选择要下线的模型!" });
        return;
      }
      this.$confirm("是否确定将选中的模型下线?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          for (let i = 0; i < selectObj.length; i++) {
            selectObj[i].modelFolderUuid = "xiaxian";
          }
          this.updateModelBasicInfo(selectObj, "下线");
        })
        .catch(() => {});
    },
    /**
     * 修改要发布的模型
     */
    updatePublicModel() {
      this.$confirm("是否确定将选中的模型发布到公共模型下?选中模型将被自动取消所有共享", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        const selectNode = this.$refs.modelFolderTree.getSelectNode();
        var selectObj = this.$refs.modelListTable.selection;
        for (let i = 0; i < selectObj.length; i++) {
          selectObj[i].modelFolderUuid = selectNode.id;
        }
        this.updateModelBasicInfo(selectObj, "发布");
      });
    },
    /**
     * 修改模型基本信息
     * @param selectObj 要修改的数组对象
     * @param tips 提示信息
     */
    updateModelBasicInfo(selectObj, tips) {
      updateModelBasicInfo(selectObj).then((result) => {
        if (result.code == 0) {
          this.treeSelectShow = false;
          this.$notify({
            title: "提示",
            message: tips + "成功",
            type: "success",
            duration: 2000,
            position: "bottom-right",
          });
          this.getList(this.query); // 刷新列表
          this.$emit("refreshTree");
          if(tips == "发布"){
            let modelUuidList =[];
            // 如果是发布操作，就将该模型的分享数据全部删除
            for (let i = 0; i < selectObj.length; i++) {
              modelUuidList.push(selectObj[i].modelUuid);
            }
            removeModelShare(modelUuidList).then((res) => {
              if (res.code == 0) {
                this.treeSelectShow = false;
                this.$notify({
                  title: "提示",
                  message: "选中的模型取消所有共享成功",
                  type: "success",
                  duration: 2000,
                  position: "bottom-right",
                });
              }else{
                this.$message({ type: "error", message: "选中的模型取消所有共享失败，请联系管理员" });
              }
            });
          }

        } else {
          this.$message({ type: "error", message: tips + "失败" });
        }
      });
    },
    /**
     * 导出模型
     */
    exportModel() {
      var selectObj = this.$refs.modelListTable.selection;
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: "info", message: "请先选择要导出的模型!" });
        return;
      }
      const modelIds = [];
      for (let i = 0; i < selectObj.length; i++) {
        modelIds.push(selectObj[i].modelUuid);
      }
      setModelSession(modelIds).then((result) => {
        exportModel();
      });
    },
    importData() {
      $("#importBtn").click();
    },
    handleRemove(file, fileList) {},
    /**
     * 上传之前回调函数
     */
    beforeUpload(file) {
      this.uploaDialog = true;
    },
    /**
     * 上传失败回调函数
     */
    onError(err, file, fileList) {
      this.$message({
        message: "上传失败",
        type: "error",
      });
    },
    /**
     * 上传成功回调函数
     */
    onSuccess(response, file, fileList) {
      this.$emit("refreshTree");
      this.$message({
        message: "上传" + response.msg,
        type: "success",
      });
      file = [];
      fileList = [];
    },
    /**
     *打开人员选择
     */
    shareModelDialog() {
      var selectObj = this.$refs.modelListTable.selection;
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: "info", message: "请先选择要共享的模型!" });
        return;
      }
      this.dialogFormVisiblePersonTree = true;
      // 弹出人员选择窗体
    },
    /**
     *取消模型分享弹窗
     */
    cancelShareModelDialog() {
      var selectObj = this.$refs.modelListTable.selection;
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: "info", message: "请先选择要取消共享的模型!" });
        return;
      }
      getShareModelList(this.$refs.modelListTable.selection).then((res) =>{
        this.shareModelList = res.data;
      });
      this.cancelShareModelList = true;
    },
    cancelShareModel(){
      var cancelShareModelList = this.$refs.cancelShareModelList.selection;
      this.$confirm('确定取消该模型分享?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        cancelShareModel(cancelShareModelList).then((res) => {
          if(res.data){
            this.$notify({
              title: '成功',
              message: '取消分享成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          this.cancelShareModelList = false;
          }else{
            this.$message({ type: "error", message: "取消分享失败" });
          }
        })
      })
    },
    /**
     *共享模型
     */
    shareModel() {
      // 获取选中的人员
      // 循环组织对象添加数据
      var userId = this.$store.getters.personuuid;
      var selectObj = this.$refs.modelListTable.selection;
      const modelShareRelList = [];
      let verResult = true;
      const persons = this.$refs.personTree.getSelectValue();
      for (let i = 0; i < selectObj.length; i++) {
        for (let j = 0; j < persons.length; j++) {
          if (persons[j].personuuid === userId) {
            verResult = false;
            break;
          }
          const obj = {
            modelUuid: selectObj[i].modelUuid,
            belongUuid: persons[j].personuuid,
            belongName: persons[j].cnname,
          };
          modelShareRelList.push(obj);
        }
      }
      /*      if(!verResult){
        this.$message({ type: 'info', message: '不能共享给自己!' })
        return
      }*/
      shareModel(modelShareRelList).then((result) => {
        if (result.code == 0) {
          this.$notify({
            title: "提示",
            message: "共享成功",
            type: "success",
            duration: 2000,
            position: "bottom-right",
          });
          this.dialogFormVisiblePersonTree = false;
        } else {
          this.$message({ type: "error", message: "共享模型失败!" });
        }
      });
    },
    previewModel() {
      this.flag = "notModelPreview";
      this.currentModelIsRun = false;
      var selectObj = this.$refs.modelListTable.selection;
      this.modelId = selectObj[0].modelUuid;
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: "info", message: "请先选择要预览的模型!" });
        return;
      }
      if (selectObj.length > 1) {
        this.$message({ type: "info", message: "只能运行一个模型!" });
        return;
      }
      if (this.modelPreview.indexOf(selectObj[0].modelUuid) != -1) {
        this.$message({
          type: "info",
          message: "该模型已经运行完成，请勿重复运行",
        });
        this.editableTabsValue = selectObj[0].modelUuid;
        return;
      }
      this.$emit("loadingSet", true, "正在读取模型信息...");
      // 获取模型信息，判断是否存在参数，如果存在参数则弹出输入参数界面，否则直接送入后台执行
      selectModel(selectObj[0].modelUuid).then((result) => {
        this.$emit("loadingSet", false, "");
        if (result.code == 0) {
          if (result.data.parammModelRel.length == 0) {
            let obj = null;
            //没有参数，判断是图形化还是sql编辑器模型
            if (result.data.graphUuid != null && result.data.graphUuid != "") {
              //调用图形化接口找到sql
              obj = {
                sqls: result.data.modelSql,
                modelUuid: selectObj[0].modelUuid,
                businessField: "modellisttable",
              };
              this.executeSql(obj, selectObj, false);
            } else {
              obj = {
                sqls: result.data.sqlValue,
                modelUuid: selectObj[0].modelUuid,
                businessField: "modellisttable",
              };
              this.executeSql(obj, selectObj, false);
            }
          } else {
            const paramObj = [];
            for (let i = 0; i < result.data.parammModelRel.length; i++) {
              if (result.data.parammModelRel[i].paramValue === "") {
                continue;
              }
              paramObj.push(
                JSON.parse(result.data.parammModelRel[i].paramValue)
              );
            }
            this.currentPreviewModelParamAndSql.sqlValue = result.data.sqlValue;
            this.currentPreviewModelParamAndSql.paramObj = paramObj;
            this.currentPreviewModelParamAndSql.modelUuid =
              selectObj[0].modelUuid;
            // 展现参数输入界面
            const timestamp = new Date().getTime();
            this.paramDrawUuid = timestamp;
            this.dialogFormVisible = true;
          }
        } else {
          this.$message({ type: "error", message: "获取模型信息失败" });
        }
      });
    },
    /**
     *执行sql
     * @param obj 执行对象  包含sql、模型编号、业务编号
     * @param selectObj 界面选中元素
     * @param isExistParam 是否存在参数
     */
    canceltab(){
      this.ifcancel = 1
    },
    executeSql(obj, selectObj, isExistParam) {
      this.$emit(
        "loadingSet",
        true,
        "正在运行模型'" + selectObj[0].modelName + "',请稍候"
      );
      getExecuteTask(obj, this.dataUserId, this.sceneCode).then((result) => {
        if(this.ifcancel==0){
        if (result.data.isError) {
          this.$message({
            type: "error",
            message: result.data.message,
          });
          this.$emit("loadingSet", false, "");
        } else {
          this.$emit("loadingSet", false, "");
          this.modelRunTaskList[obj.modelUuid] = result.data.executeSQLList;
          if (isExistParam) {
            selectObj[0].runModelConfig = obj.runModelConfig;
          }
          this.addTab(selectObj[0], isExistParam, result.data.executeSQLList,false,result.data.lastSqlIndex);
          //界面渲染完成之后开始执行sql,将sql送入调度
          startExecuteSql(result.data)
            .then((result) => {
              this.executeLoading = false;
              this.loadText = "";
            })
            .catch((result) => {
              this.executeLoading = false;
            });
        }
        }else{
          this.ifcancel = 0
        }

      });
    },
    /**
     * 添加页签
     * @param modelObj 模型对象
     * @param isExistParam 参数对象
     * @param executeSQLList 执行sql列表
     */
    addTab(modelObj, isExistParam, executeSQLList, isRelation,maintableindex) {
      let obj = {
        title: modelObj.modelName + "结果",
        name: this.modelId != modelObj.modelUuid ? ++this.tabIndex +'' + modelObj.modelUuid : modelObj.modelUuid,
        isExistParam: isExistParam,
        executeSQLList: executeSQLList,
        isRelation: isRelation,
        maintableindex:maintableindex||''
      };
      if (isExistParam) {
        obj.runModelConfig = modelObj.runModelConfig;
      } else {
        obj.runModelConfig = {sql: modelObj.sqlValue};
      }
      // 关联项目id使用
      obj.modelUuid = modelObj.modelUuid;
      this.editableTabs.push(obj);
      // this.nowTabModelUuid = modelObj.modelUuid;
      // this.editableTabsValue = modelObj.modelUuid;
      // this.modelPreview.push(modelObj.modelUuid);
      this.nowTabModelUuid = obj.name;
      this.editableTabsValue = obj.name;
      this.modelPreview.push(obj.name);
    },
    handleClick(tab, event) {
      if (tab.name !== "模型列表") {
        tab.$children[0].$children[0].$children[0].$children[0].$children[0].clickBigTab();
      }
    },
    setNextValue(val) {
      this.$refs[this.nowTabModelUuid][0].loadTableData(val, "");
    },
    /**
     * 移除页签
     * @param targetName
     */
    removeTab(targetName) {
      const tabs = this.editableTabs;
      let activeName = this.editableTabsValue;
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
              activeName = nextTab.name;
            }
          }
        });
      }
      // 移除已经运行的参数列表
      this.modelPreview.splice(this.modelPreview.indexOf(targetName), 1);
      this.editableTabsValue = activeName;
      this.editableTabs = tabs.filter((tab) => tab.name !== targetName);
      if (this.editableTabs.length == 0) {
        this.editableTabsValue = "modelList";
      }
    },
    /**
     * 获取替换参数后的sql并执行sql
     */
    replaceNodeParam() {
      if (!this.currentModelIsRun) {
        var obj = this.$refs.paramDrawRefNew.replaceNodeParam(
          this.paramDrawUuid
        );
        var selectObj = this.$refs.modelListTable.selection;
        if (!obj.verify) {
          this.$message({ type: "info", message: obj.message });
          return;
        }
        obj.sqls = obj.sql;
        obj.modelUuid = selectObj[0].modelUuid;
        obj.businessField = "modellisttable";
        // 合并参数 将输入的值替换到当前界面
        this.currentPreviewModelParamAndSql.paramObj = obj.paramsArr;
        this.dialogFormVisible = false;
        let runModelConfig = {
          sqlValue: this.currentPreviewModelParamAndSql.sqlValue,
          paramObj: obj.paramsArr,
        };
        this.currentRunModelAllConfig[selectObj[0].modelUuid] = runModelConfig;
        let recplaceed = {
          sql: obj.sqls,
          paramsArr: obj.paramsArr,
        };
        obj.runModelConfig = recplaceed;
        this.executeSql(obj, selectObj, true);
      } else {
        this.queryModel(this.paramDrawUuid);
      }
    },
    /**
     * 参数界面点击查询按钮
     * @param modelUuid 模型编号
     */
    queryModel(modelUuid) {
      // var obj = replaceNodeParam(this.paramDrawUuid)
      var obj = this.$refs.paramDrawRefNew.replaceNodeParam(this.paramDrawUuid);
      if (!obj.verify) {
        this.$message({ type: "info", message: obj.message });
        return;
      }
      obj.sqls = obj.sql;
      obj.modelUuid = modelUuid;
      obj.executeSQLList = this.modelRunTaskList[obj.modelUuid];
      obj.businessField = "modellisttable";
      // 重置数据展现界面数据
      this.$refs[modelUuid][0].reSetTable();
      let paramInfo = {
        sql: obj.sqls,
        paramsArr: obj.paramsArr,
      };
      this.$refs[modelUuid][0].loadNewParamInfo(paramInfo);
      //设置新的参数信息
      let runModelConfig = {
        sqlValue: this.currentRunModelAllConfig[modelUuid].sqlValue,
        paramObj: obj.paramsArr,
      };
      this.currentRunModelAllConfig[modelUuid] = runModelConfig;
      this.dialogFormVisible = false;
      this.$emit("loadingSet", true, "正在执行...");
      getExecuteTask(obj, this.dataUserId, this.sceneCode).then((result) => {

        if(this.ifcancel==0){
        if (result.data.isError) {
          this.$message({
            type: "error",
            message: result.data.message,
          });
          this.$emit("loadingSet", false, "");
        } else {
          this.$emit("loadingSet", false, "");
          //界面渲染完成之后开始执行sql,将sql送入调度
          startExecuteSql(result.data).then((result) => {});
        }
        }else{
          this.ifcancel = 0
        }
      });
    },
    /**
     * 获取模型列表选中的数据
     */
    getModelListCheckData() {
      return this.$refs.modelListTable.selection;
    },
    /**
     * 查看模型
     * @param modelUuid 模型编号
     */
    selectModelDetail(modelUuid) {
      this.isUpdate = true;
      this.$emit("loadingSet", true, "正在获取模型信息...");
      selectModel(modelUuid).then((result) => {
        this.$emit("loadingSet", false, "");
        if (result.code == 0) {
          this.editModelTitle = result.data.modelName + "详细";
          var operationObj = {
            operationType: 3,
            model: result.data,
            folderId: "",
            folderName: "",
            formName: result.data.modelName + "详细",
          };
          sessionStorage.setItem("operationObj", JSON.stringify(operationObj));
          this.$router.push(`/analysis/editormodelnew`)
          // this.$store.commit("aceState/setRightFooterTags", {
          //   type: "active",
          //   val: {
          //     name: result.data.modelName + "详细",
          //     path: "/analysis/editormodelnew",
          //   },
          // });
        } else {
          this.$message({ type: "error", message: "查看模型详细失败" });
        }
      });
    },
    loadParamDraw(modelUuid) {
      this.currentModelIsRun = true;
      this.paramDrawUuid = modelUuid;
      this.currentPreviewModelParamAndSql.sqlValue = this.currentRunModelAllConfig[
        modelUuid
      ].sqlValue;
      this.currentPreviewModelParamAndSql.paramObj = this.currentRunModelAllConfig[
        modelUuid
      ].paramObj;
      this.flag = "modelPreview";
      this.dialogFormVisible = true;
    },
  },
};
</script>

<style scoped>
.el-dropdown {
  margin-left: 10px;
}

.panel-font-size {
  font-size: 25px;
}

.item-y {
  position: fixed;
  top: 15%;
  left: 45%;
  background: #ffffff;
  box-shadow: 0 0 9px 0 rgba(0, 0, 0, 0.15);
  border-radius: 13.5px;
  border-radius: 13px;
  width: 800px;
  /* height: 130px; */
  z-index: 10;
}
.content-y {
  margin: -52px 0 0 0;
  height: 650px;
  width: 100%;
}
.btn-show {
  position: absolute;
  top: 39px;
  right: 153px;
  z-index: 3;
  padding: 3px 8px 4px 8px !important;
}
.btn-show1 {
  position: absolute;
  top: 135px;
  right: 330px;
  z-index: 3;
  width: 203px;
  height: 44px;
  border-radius: 21.6px;
  font-size: 14.4px;
}
.icon-search {
  position: absolute;
  top: 150px;
  right: 385px;
  z-index: 4;
  font-size: 14.4px;
  color: #c8ff8c;
}
.row-all {
  /* height: 650px; */
}
.table {
  height: 450px !important;
}
>>> .el-tabs__content {
  overflow: visible;
  height: 100%;
}
</style>
