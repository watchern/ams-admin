<template>
  <div class="app-container">
    <div id="container" v-loading="executeLoading" :element-loading-text="loadText">
      <div id="sidebar">
        <div class="unfold-shuju add-sidiv"><img :src="shuju"></div>
        <div class="unfold-canshu"><img :src="canshu"></div>
        <div class="unfold-sql"><img :src="sql">
        </div>
      </div>
      <div id="leftPart" class="left-part">
        <ul id="dataTree" class="ztree" />
        <ul id="paramTree" class="ztree" />
        <ul id="sqlFunTree" class="ztree" />
      </div>
      <div id="rightPart" class="col-sm-10" style="height: 90vh">
        <div id="sqlEditorDiv" class="sql-editor-div">
          <el-row type="flex" class="row-bg">
            <el-col>
              <el-button
                type="primary"
                size="small"
                @click="sqlFormat"
                class="oper-btn show-detail"
                title="格式化sql"
              ></el-button>
              <el-button
                type="primary"
                size="small"
                @click="executeSQL"
                class="oper-btn start"
                title="执行"
              ></el-button>
              <el-button
                type="primary"
                size="small"
                @click="openSqlDraftList"
                class="oper-btn folder"
                title="打开sql"
              ></el-button>
              <el-button
                type="primary"
                size="small"
                @click="getColumnSqlInfo"
                class="oper-btn folder"
                title="校验sql"
              >校验sql</el-button>
              <el-dropdown>
                <el-button
                  type="primary"
                  size="small"
                  class="oper-btn save"
                  title="保存"
                ></el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="openSaveSqlDialog(1)"
                    >保存</el-dropdown-item
                  >
                  <el-dropdown-item @click.native="openSaveSqlDialog(2)"
                    >另存为</el-dropdown-item
                  >
                </el-dropdown-menu>
              </el-dropdown>
              <el-dropdown type="primary">
                <el-button
                  type="primary"
                  size="small"
                  class="oper-btn maintain"
                  title="工具箱"
                ></el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="findAndReplace(2)"
                    >查找</el-dropdown-item
                  >
                  <el-dropdown-item @click.native="findAndReplace(1)"
                    >替换</el-dropdown-item
                  >
                  <el-dropdown-item @click.native="caseTransformation(1)"
                    >转大写</el-dropdown-item
                  >
                  <el-dropdown-item @click.native="caseTransformation(2)"
                    >转小写</el-dropdown-item
                  >
                  <el-dropdown-item @click.native="selectSqlNotes()"
                    >注释选中行</el-dropdown-item
                  >
                  <el-dropdown-item @click.native="selectSqlCancelNotes()"
                    >取消注释</el-dropdown-item
                  >
                </el-dropdown-menu>
              </el-dropdown>
              <label style="margin-right: -43px;">{{ path }}</label><a @click="modelResultSavePathDialog = true" style="color: #409eff; margin-left: 50px">编辑</a>
            </el-col>
          </el-row>
          <div
            id="sqlDraft"
            class="row"
            style="
              display: none;
              margin-left: 30px;
              height: 30px;
              line-height: 30px;
              font-weight: bold;
            "
          />
          <textarea id="sql" />
        </div>
        <div id="horizontal"/>

        <!-- 结果展示和参数输入区域 -->
        <div id="bottomPart" lay-filter="result-data">
          <div id="maxOpen" class="max-size" @click="maxOpen" >
            <div id="iconImg" class="iconImg" alt="最大化" />
            <div id="iconImg-huifu" />
          </div>
          <div v-for="result in resultShow" id="dataShow" class="data-show">
            <childTabs
              ref="childTabsRef"
              :key="result.id"
              :pre-value="currentExecuteSQL"
              use-type="sqlEditor"
              style="width: 101.5%"
            />
          </div>
        </div>
      </div>
      <div id="vertical" />
      <input
        id="personId"
        type="hidden"
        value="<%=LoginUserInfo.getLoginUserId()%>"
      />
      <div id="tableMenu" class="rightMenu">
        <ul>
          <li @click="getSelectSql('tableMenu')">生成SELECT语句</li>
          <li onclick="">查看表信息</li>
          <li onclick="">查看表关联信息</li>
        </ul>
      </div>
    </div>
    <form id="countForm" class="form-horizontal" style="display: none">
      <div class="form-group col-sm-12">
        <label class="col-sm-3 control-label">视图sql:</label>
        <div class="col-sm-7">
          <textarea
            id="viewSql"
            name="viewSql"
            type="text"
            class="form-control"
            style="height: 400px"
            readonly
          />
        </div>
      </div>
    </form>
    <div id="tableNameDiv" style="display: none" class="col-sm-12">
      <div class="col-sm-10" style="margin: 20px">
        <label
          id="saveTips"
          class="col-sm-10 control-label"
          style="color: red"
        />
        <input
          id="tableName"
          name="tableName"
          type="text"
          class="form-control"
        />
      </div>
    </div>
    <el-dialog
      v-if="sqlDraftDialogFormVisible"
      title="请填写SQL草稿名称"
      :visible.sync="sqlDraftDialogFormVisible"
      :append-to-body="true"
    >
      <el-form
        ref="sqlDraftForm"
        :model="sqlDraftForm"
        :rules="sqlDraftFormRules"
      >
        <el-form-item
          label="草稿名称"
          :label-width="formLabelWidth"
          prop="draftTitle"
        >
          <el-input v-model="sqlDraftForm.draftTitle" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="sqlDraftDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveSqlDialog()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      v-if="sqlDraftDialog"
      title="SQL草稿列表"
      :visible.sync="sqlDraftDialog"
      :append-to-body="true"
      width="50%"
    >
      <sqlDraftList ref="sqlDraftList" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="sqlDraftDialog = false">关闭</el-button>
        <el-button type="primary" @click="useSql">使用SQL</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="请输入参数"
      v-if="dialogFormVisible"
      :visible.sync="dialogFormVisible"
      :append-to-body="true"
    >
      <paramDraw :myId="paramDrawUuid" ref="paramDrawRef" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">关闭</el-button>
        <el-button type="primary" @click="replaceNodeParam">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="选择模型结果保存路径"
      :visible.sync="modelResultSavePathDialog"
      width="30%"
      :append-to-body="true"
    >
      <data-tree
        :data-user-id="personCode"
        :scene-code="sceneCode"
        :tree-type="treeType"
        @node-click="handleClick"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="modelResultSavePathDialog = false">取 消</el-button>
        <el-button type="primary" @click="modelResultSavePathDetermine"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  initSQLEditor,
  initDragAndDrop,
  initTableTip,
  initIcon,
  initTableTree,
  initFunctionTree,
  initEvent,
  initParamTree,
  tableTreeSearch,
  paramTreeSearch,
  functionTreeSearch,
  sqlFormat,
  findAndReplace,
  caseTransformation,
  getExecuteTask,
  selectSqlNotes,
  selectSqlCancelNotes,
  refreshCodeMirror,
  getSaveInfo,
  getSelectSql,
  getSaveSqlDraftObj,
  saveSqlDraft,
  useSql,
  initVariable,
  getSql,
  executeSQL,
  verifySql,
  editorSql,
  startExecuteSql,
  maxOpenOne,
  getColumnSqlInfo,
  refushTableTree,
  dropTable
} from "@/api/analysis/sqleditor/sqleditor";
import sqlDraftList from "@/views/analysis/sqleditor/sqldraftlist";
import { updateDraft } from "@/api/analysis/sqleditor/sqldraft";
import childTabs from "@/views/analysis/auditmodelresult/childtabs";
import paramDraw from "@/views/analysis/modelparam/paramdraw";
import { replaceNodeParam } from "@/api/analysis/auditparam";
import dataTree from "@/views/data/role-res/data-tree";

/**
 * 当前执行进度
 * @type {number}
 */
let currentExecuteProgress = 0;
/**
 * 最后一个结果集的列
 * @type {*[]}
 */
let lastResultColumn = [];
/**
 * 是否全部执行成功
 * @type {boolean}
 */
let isAllExecuteSuccess = false;

/**
 * 最后模型结果列类型
 * @type {*[]}
 */
let lastResultColumnType = [];

/**
 * 数据界面对象
 */
let childTabsRef;

/**
 * 最后一个select索引
 * @type {number}
 */
let lastSqlIndex = -1
export default {
  name: "SQLEditor",
  components: { sqlDraftList, childTabs, paramDraw, dataTree },
  props: ["sqlEditorParamObj", "sqlValue","callType"],
  data() {
    return {
      sqlDraftForm: {
        sqlDraftUuid: "",
        draftTitle: "",
        draftSql: "",
        paramJson: "",
      },
      sqlDraftFormRules: {
        draftTitle: [
          {
            type: "string",
            required: true,
            message: "请输入草稿名称",
            trigger: "blur",
          },
        ],
      },
      DefaultExpansion: ["1", "2", "3"],
      sqlDraftDialogFormVisible: false,
      sqlDraftDialog: false,
      dialogFormVisible: false,
      //遮罩层文字
      loadText:"",
      formLabelWidth: "120px",
      paramDrawUuid: "",
      executeLoading: false,
      currentExecuteSQL: [], // 当前执行的全部sql,
      webSocket: null,
      resultShow: [],
      isAllExecute: false, // 是否全部执行
      modelOriginalTable: [],
      createTreeNode: [], //sql编辑器执行完create类型的sql后返回的树节点信息，用于拼一个假节点
      executeData: {},
      paramDrawLoading: false,
      tableSearchInput: '',
      paramSearchInput: '',
      functionInput: '',
      shuju:require("@/views/analysis/auditmodel/imgs/shuju.png"),
      canshu:require("@/views/analysis/auditmodel/imgs/canshu.png"),
      sql:require("@/views/analysis/auditmodel/imgs/sql.png"),
      modelResultSavePathDialog: false,
      tempPath:'',
      tempId:'',
      nodeType:'',
      path:'选择模型结果保存路径',
      modelResultSavePathId:'',
      personCode: this.$store.state.user.code,
      sceneCode: "auditor",
      treeType: "save",
    };
  },
  watch: {
    dialogFormVisible(value) {
      this.$nextTick(function () {
        if (value) {
          this.$refs.paramDrawRef.initParamHtmlSS(
            this.executeData.sql,
            this.executeData.arr,
            "     ",
            this.paramDrawUuid
          );
        }
      });
    },
  },
  mounted() {
    this.initData();
    this.initWebSocket();
  },
  methods: {
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
      /*      const webSocketPath =
        'ws://localhost:8086/analysis/websocket?' +
        this.$store.getters.personuuid*/
      const webSocketPath =
        process.env.VUE_APP_ANALYSIS_WEB_SOCKET +
        this.$store.getters.personuuid +
        "sqleditor";
      // WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
      this.webSocket = new WebSocket(webSocketPath); // 建立与服务端的连接
      // 当服务端打开连接
      this.webSocket.onopen = function (event) {};
      // 发送消息
      this.webSocket.onmessage = function (event) {
        const dataObj = JSON.parse(event.data)
        if(dataObj.listenerType === "afterTaskChangeTable" || dataObj.listenerType === "afterTaskCreateView"){
          let treeNodeInfo = dataObj.addTableMetaList
          if (treeNodeInfo.length > 0) {
            var treeNodes = []
            for (var i = 0; i < treeNodeInfo.length; i++) {
              var treeNode = {
                chkDisabled: false,
                deptColNum: 0,
                hidden: false,
                icon: "../../images/ico/table_1.png",
                id: treeNodeInfo[i].tableMetaUuid,
                isExist: 0,
                isParent: true,
                name: treeNodeInfo[i].displayTbName,
                personNode: false,
                pid: treeNodeInfo[i].folderUuid,
                timeColNum: 0,
                type: "table",
              };
              treeNodes.push(treeNode)
            }
            refushTableTree(treeNodes)
          }
        }
        if(dataObj.listenerType === "onSQLResult"){
          if (dataObj.executeSQL.state == 2) {
            //如果最后的列索引与当前执行进度一直，说明最后的结果集已经拿到 取出最后一个结果集的列做为模型结果列
            if(lastSqlIndex == currentExecuteProgress){
              lastResultColumn = dataObj.columnNames
              lastResultColumnType = dataObj.columnTypes
            }
            currentExecuteProgress++
          }
          // 如果当前执行等于总的执行进度  说明sql已经全部执行成功
          if (currentExecuteProgress == dataObj.executeTask.executeSQL.length) {
            isAllExecuteSuccess = true
          }
          func1(dataObj)
        }
        if(dataObj.listenerType === "afterTaskDropTable" || dataObj.listenerType === "afterTaskDropView"){
          dropTable(dataObj.dropTableNameList)
        }
      };
      const func2 = function func3(val) {
        this.$refs.childTabsRef[0].loadTableData(val);
        //已经全部执行完成，调用父组件方法初始化参数列等信息
        if (isAllExecuteSuccess) {
          this.$emit("getSqlObj");
        }
      };
      const func1 = func2.bind(this);
      this.webSocket.onclose = function (event) {};

      // 通信失败
      this.webSocket.onerror = function (event) {};
    },
    /**
     * 通过WebSocket对象发送消息给服务端
     * 此处没有主动发消息给服务端，如果调用此方法，则会发送消息至socket服务端onMessage()方法上
     */
    sendMsgToServer() {
      const message = "";
      if (message) {
        this.webSocket.send(
          JSON.stringify({ username: $("#username").text(), msg: message })
        );
      }
    },
    /**
     * 初始化sql编辑器基础数据
     */
    initData() {
      const userId = this.$store.state.user.code
      initDragAndDrop()
      initIcon()
      initFunctionTree()
      initVariable()
      initEvent()
      initParamTree()
      this.executeLoading = true
      this.loadText = "正在初始化数据表..."
      initTableTip(userId).then((result) => {
        initTableTree(result)
        var relTableMap = {}
        var expTableMap = {}
        if (result.data != null) {
          for (let i = 0; i < result.data.length; i++) {
            if (result.data[i].type === "table") {
              relTableMap[result.data[i].name] = []
              expTableMap[result.data[i].name] = result.data[i].extCol;
            }
          }
        }
        initSQLEditor(document.getElementById('sql'), relTableMap,expTableMap)  //初始化SQL编辑器
        this.executeLoading = false
        this.loadText = ""
        if (this.sqlValue != "") {
          // 编辑模型的sql  反显数据
          editorSql(this.sqlValue, this.sqlEditorParamObj);
        }
        refreshCodeMirror()
      }).catch(() => {
        this.$message({ type: 'error', message: '初始化数据表失败!' })
        this.executeLoading = false
        this.loadText = ""
      })
    },
    /**
     * 数据表树搜索
     */
    tableTreeSearch() {
      tableTreeSearch()
    },
    /**
     * 参数树搜索
     */
    paramTreeSearch() {
      paramTreeSearch()
    },
    /**
     * 函数树搜索
     */
    functionTreeSearch() {
      functionTreeSearch()
    },
    /**
     * sql格式化
     */
    sqlFormat() {
      sqlFormat()
    },
    /**
     * 查找和替换
     * @param type 1替换 2查找
     */
    findAndReplace(type) {
      findAndReplace(type)
    },
    /**
     * 转大小写
     * @param type 1大写2小写
     */
    caseTransformation(type) {
      caseTransformation(type)
    },
    /**
     * 注释选中行
     */
    selectSqlNotes() {
      selectSqlNotes()
    },
    /**
     * 取消注释
     */
    selectSqlCancelNotes() {
      selectSqlCancelNotes()
    },
    /**
     * 获取保存的对象
     * @returns {{arr: *[], flag: (jQuery|string|undefined|*), InfoFlag: jQuery, outColumn: jQuery, flag2: (jQuery|string|undefined), sql: *}}
     */
    getSaveInfo() {
      if(this.callType != "editorModel"){
        return;
      }
      if (!this.isAllExecute) {
        return;
      }
      // 如果当前执行进度与要执行的sql数量相等 则证明数据已经全部拿到，允许保存
      if (currentExecuteProgress != this.currentExecuteSQL.length) {
        return;
      }
      /*      console.log("当前执行总进度:" + currentExecuteProgress);
      console.log("是否全部执行成功:" + isAllExecuteSuccess);
      console.log(this.currentExecuteSQL);
      console.log(lastResultColumn);*/
      const returnObj = getSaveInfo();
      returnObj.columnNames = lastResultColumn;
      returnObj.columnTypes = lastResultColumnType;
      returnObj.modelOriginalTable = this.modelOriginalTable;
      returnObj.modelType = 1;
      return returnObj;
    },
    /**
     * 生成select语句
     */
    getSelectSql(menuId) {
      getSelectSql(menuId);
    },
    /**
     *打开sql保存草稿窗体
     */
    openSaveSqlDialog(type) {
      if (type == 1) {
        // 如果对象是旧的对象则证明是打开的sql草稿 因此直接保存  否则直接修改
        const sqlObj = getSaveSqlDraftObj(type);
        const sql = sqlObj.draftSql;
        if (sql === "") {
          this.$message({ type: "info", message: "请输入sql语句!" });
          return;
        } else {
          if (!sqlObj.isOld) {
            this.sqlDraftDialogFormVisible = true;
          } else {
            updateDraft(sqlObj).then((result) => {
              if (result.code == 0) {
                this.$notify({
                  title: "提示",
                  message: "保存成功",
                  type: "success",
                  duration: 2000,
                  position: "bottom-right",
                });
              } else {
                this.$notify({
                  title: "提示",
                  message: "保存失败",
                  type: "error",
                  duration: 2000,
                  position: "bottom-right",
                });
              }
            });
          }
        }
      } else {
        this.sqlDraftDialogFormVisible = true;
      }
    },
    /**
     *保存sql草稿
     */
    saveSqlDialog() {
      let verResult = false;
      this.$refs["sqlDraftForm"].validate((valid) => {
        if (valid) {
          verResult = valid;
        }
      });
      if (verResult) {
        const sqlObj = getSaveSqlDraftObj(1);
        this.sqlDraftForm.draftSql = sqlObj.draftSql;
        this.sqlDraftForm.paramJson = sqlObj.paramJson;
        saveSqlDraft(this.sqlDraftForm).then((result) => {
          if (result.code == 0) {
            this.$notify({
              title: "提示",
              message: "保存成功",
              type: "success",
              duration: 2000,
              position: "bottom-right",
            });
            this.sqlDraftDialogFormVisible = false;
            // 手动销毁数据  多层dialog v-if失效 不知道为啥 没找到解决办法
            this.sqlDraftForm = {
              sqlDraftUuid: "",
              draftTitle: "",
              draftSql: "",
              paramJson: "",
            };
          } else {
            this.$notify({
              title: "提示",
              message: "保存失败",
              type: "error",
              duration: 2000,
              position: "bottom-right",
            });
          }
        });
      }
    },
    /**
     *打开sql草稿列表
     */
    openSqlDraftList() {
      this.sqlDraftDialog = true;
    },
    /**
     * 使用sql
     */
    useSql() {
      const returnObj = this.$refs.sqlDraftList.getSelectRow();
      if (returnObj.verify) {
        this.$confirm("该操作会清空当前SQL编辑器中的语句,是否继续？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          this.sqlDraftDialog = false;
          useSql(returnObj);
        });
      } else {
        return;
      }
    },
    /**
     * 执行sql
     */
    executeSQL() {
      const result = getSql()
      if (result.sql === "") {
        this.$message({ type: "info", message: "请输入sql!" })
        return
      }
      this.isAllExecute = result.isAllExecute
      this.loadText = "正在检验sql是否符合语法规范..."
      verifySql().then((result) => {
        this.executeLoading = false
        this.loadText = ""
        if (!result.data.verify) {
          this.$message({ type: "info", message: "SQL不符合语法规范，请重新输入" });
          return;
        }
        this.resultShow = [] // 清空数据展示对象
        isAllExecuteSuccess = false
        currentExecuteProgress = 0
        this.currentExecuteSQL = []
        lastResultColumn = []
        const obj = executeSQL()
        obj.businessField = "sqleditor"
        obj.modelResultSavePathId = this.modelResultSavePathId
        if (!obj.isExistParam) {
          this.executeLoading = true
          this.loadText = "正在获取sql信息..."
          getExecuteTask(obj).then((result) => {
            this.executeLoading = false
            this.loadText = ""
            lastSqlIndex = result.data.lastSqlIndex
            this.executeLoading = false
            this.currentExecuteSQL = result.data.executeSQLList
            this.modelOriginalTable = result.data.tables
            this.createTreeNode = result.data.treeNodeInfo
            this.resultShow.push({ id: 1 })
            //界面渲染完成之后开始执行sql,将sql送入调度
            startExecuteSql(result.data).then((result) => {
              this.executeLoading = false;
              this.loadText = ""
            }).catch((result) => {
              this.executeLoading = false;
            });
          }).catch((result) => {
            this.executeLoading = false;
          });
        } else {
          this.openParamDraw(obj);
        }
      });
    },
    /**
     * 打开参数渲染窗体
     */
    openParamDraw(data) {
      let timestamp = new Date().getTime();
      this.paramDrawUuid = timestamp;
      this.dialogFormVisible = true;
      this.paramDrawLoading = true;
      this.executeData = data;
    },
    /**
     * 获取替换参数后的sql  直接直接
     */
    replaceNodeParam() {
      var obj = replaceNodeParam(this.paramDrawUuid);
      if (!obj.verify) {
        this.$message({ type: "info", message: obj.message });
        return;
      }
      obj.sqls = obj.sql;
      obj.businessField = "sqleditor";
      this.executeLoading = true;
      this.dialogFormVisible = false;
      getExecuteTask(obj).then((result) => {
        this.executeLoading = false
        this.loadText = ""
        lastSqlIndex = result.data.lastSqlIndex
        this.executeLoading = false
        this.currentExecuteSQL = result.data.executeSQLList
        this.modelOriginalTable = result.data.tables
        this.createTreeNode = result.data.treeNodeInfo
        this.resultShow.push({ id: 1 })
        //界面渲染完成之后开始执行sql,将sql送入调度
        startExecuteSql(result.data).then((result) => {
          this.executeLoading = false;
          this.loadText = ""
        }).catch((result) => {
          this.executeLoading = false;
        });
      }).catch((result) => {
        this.executeLoading = false;
      });
/*      startExecuteSql(obj).then((result) => {
        if (!result.data.isError) {
          this.currentExecuteSQL = result.data.executeSQLList;
          this.modelOriginalTable = result.data.tables;
          this.resultShow.push({ id: 1 });
          this.dialogFormVisible = false;
        } else {
          this.$message({ type: "info", message: "执行失败" });
        }
      });*/
    },
    maxOpen() {
      maxOpenOne();
    },
    handleClick(data, node, tree) {
      this.tempPath = data.label;
      this.tempId = data.id;
      this.nodeType = data.type;
    },
    modelResultSavePathDetermine() {
      if (this.nodeType == "folder") {
        this.path = "当前执行sql保存路径:" + this.tempPath;
        this.modelResultSavePathId = this.tempId;
        this.modelResultSavePathDialog = false;
      } else if (this.nodeType == "") {
        this.$message({
          message: "请选择路径",
          type: "warning",
        });
      } else {
        this.$message({
          message: "只能选择文件夹",
          type: "warning",
        });
      }
    },
    getColumnSqlInfo() {
      const result = getSql();
      if (result.sql === "") {
        this.$message({ type: "info", message: "请输入sql!" });
        return;
      }
      this.isAllExecute = result.isAllExecute;
      this.executeLoading = true
      this.loadText = "正在校验sql是否符合语法规范..."
      verifySql().then((verSqlResult) => {
        this.executeLoading = false
        if (!verSqlResult.data.verify) {
          this.$message({ type: "info", message: "SQL不符合语法规范，请重新输入" });
          return;
        }
        this.resultShow = []; // 清空数据展示对象
        isAllExecuteSuccess = false;
        currentExecuteProgress = 0;
        this.currentExecuteSQL = [];
        lastResultColumn = [];
        let data = {sql:result.sql}
        this.executeLoading = true
        this.loadText = "正在获取sql列..."
        getColumnSqlInfo(data).then((resp) => {
          //修改执行成功状态
          isAllExecuteSuccess = true;
          lastResultColumn = resp.data.columnName;
          lastResultColumnType = resp.data.columnType;
          this.$emit("getSqlObj");
          this.executeLoading = false
          this.loadText = ""
        }).catch((result) =>{
          this.executeLoading = false
          this.loadText = ""
        });
      });
    },
  },
};
</script>
<style>
#tableSearchImg,
#paramSearchImg,
#funSearchImg {
  width: 20px;
  height: 20px;
  position: relative;
  bottom: -25px;
  right: 10px;
  float: right;
  cursor: pointer;
}
#rightPart {
  width: 81.3333%;
  position: relative;
}

.app-container {
  /* height: 100%!important; */
  position: relative;
}

#container {
  width: 100%;
  height: 100%;
}

#sidebar{
  width: 30px;
  height: 100%;
  margin: 0;
  display: inline-block;
  position: absolute;
  top: -2px;left: -1px;
  border-radius: 50px 0 0 50px;
  text-align: center;
  z-index: 20;
  background: #f7f7f7;
  border-right: 1px solid #5E6572;
}

.CodeMirror-hint-table {
  color: #af0000 !important;
  font-size: 15pt;
}

.CodeMirror-hint-table:before {
  content: " ";
  width: 30px;
  height: 20px;
  background-image: url("/lib/codemirror/img/ic-table.png");
}

.menuDemo {
  position: absolute;
  display: none;
  top: 0;
  text-align: left;
  padding: 2px;
}

.menuDemo ul {
  display: block;
  min-width: 43px;
}

.menuDemo ul li {
  margin: 1px 0;
  padding: 0 5px;
  cursor: pointer;
  list-style: none outside none;
}



#sql {
  width: 100%;
  height: 320px;
}

.table-view {
  overflow-x: auto;
}

#vertical {
  position: absolute;
  left: 15.2%;
  height: 100%;
  width: 3px;
  overflow: hidden;
  background: #c0c5d4;
  cursor: w-resize;
  z-index: 20;
}
.el-aside{
  /* margin-bottom: 10px; */
}

#horizontal {
  position: absolute;
  top: 37%;
  right: 0;
  /* width: 100vh; */
  width: 97.5%;
  height: 3px;
  overflow: hidden;
  background: #c0c5d4;
  cursor: s-resize;
  z-index: 50;
}

.errorHighlight {
  background-color: #f99999;
}

.successHighlight {
  background-color: transparent !important;
}

.CodeMirror-hints {
  z-index: 1000;
}

#dataShow > pre {
  color: red;
  padding: 9.5px;
  margin: 0 0 10px;
  font-size: 16px;
  background: none;
  border: none;
}

.layui-tab {
  margin: 10px 0;
  text-align: left !important;
  width: 100%;
}

.max-size {
  width: 80px;
  position: relative;
  right: 0;
  top: 1%;
  float: right;
  display: none;
  z-index: 201;
}

.sql-editor-div{
  padding: 0px;
  width: 100%;
  height: 40%;
}

.data-show{
  margin-top: 45px;
  width: 98.7%;
  height: 100%;
}

.left-part{
  overflow-x: hidden;
  overflow-y: auto;
  width: 14.66666667%;
  float: left;
  height: 100%;
  margin-left: .5%;
}
</style>


