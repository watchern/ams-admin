<template>
  <div class="app-container">
    <div id="container">
      <div
        id="leftPart"
        class="col-sm-2 leftCon"
        style="overflow: auto; height: 100vh"
      >
        <div class="panel-group">
          <div class="panel panel-default">
            <div class="panel-heading">
              <h4 class="panel-title">
                <a
                  data-toggle="collapse"
                  data-parent="#accordion"
                  href="#collapse"
                  >数据表</a
                >
              </h4>
            </div>
            <div class="panel-collapse collapse in">
              <div class="panel-body" style="overflow-x: auto">
                <img id="tableSearchImg" @click="tableTreeSearch" />
                <input
                  id="dataSearch"
                  name="dataSearch"
                  type="text"
                  class="form-control"
                  autocomplete="off"
                  placeholder="查询"
                />
                <ul id="dataTree" class="ztree" style="overflow: auto" />
              </div>
            </div>
          </div>
        </div>
        <div class="panel-group">
          <div class="panel panel-default">
            <div class="panel-heading">
              <h4 class="panel-title">
                <a
                  data-toggle="collapse"
                  data-parent="#accordion1"
                  href="#collapse1"
                  >参数</a
                >
              </h4>
            </div>
            <div class="panel-collapse collapse in">
              <div class="panel-body" style="overflow-x: auto">
                <img id="paramSearchImg" @click="paramTreeSearch" />
                <input
                  id="paramSearch"
                  name="paramSearch"
                  type="text"
                  class="form-control"
                  autocomplete="off"
                  placeholder="查询"
                />
                <ul id="paramTree" class="ztree" style="max-height: 400px" />
              </div>
            </div>
          </div>
        </div>
        <div class="panel-group">
          <div class="panel panel-default">
            <div class="panel-heading">
              <h4 class="panel-title">
                <a
                  data-toggle="collapse"
                  data-parent="#accordion2"
                  href="#collapse2"
                  >SQL函数</a
                >
              </h4>
            </div>
            <div class="panel-collapse collapse in">
              <div class="panel-body" style="overflow-x: auto">
                <img id="funSearchImg" @click="functionTreeSearch" />
                <input
                  id="sqlSearch"
                  name="sqlSearch"
                  type="text"
                  class="form-control"
                  autocomplete="off"
                  placeholder="查询"
                />
                <ul id="sqlFunTree" class="ztree" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="rightPart" class="col-sm-10" style="height: 100vh">
        <div
          id="sqlEditorDiv"
          class="col-sm-12"
          style="padding: 0px; height: 50vh"
        >
          <div
            class="row table-view-caption"
            style="margin-left: 30px; height: 40px; padding-top: 8px"
          >
            <button type="button" class="btn btn-primary" @click="test()">
              test</button
            >&nbsp;
            <button type="button" class="btn btn-primary" @click="sqlFormat()">
              格式化</button
            >&nbsp;
            <!-- <button type="button" class="btn btn-primary" onclick="alertVerify()">SQL语法校验</button> -->
            <button type="button" class="btn btn-primary" @click="executeSQL">
              执行</button
            >&nbsp;
            <button
              type="button"
              class="btn btn-primary"
              @click="openSqlDraftList()"
            >
              打开SQL</button
            >&nbsp;
            <div class="btn-group">
              <button
                type="button"
                class="btn btn-primary"
                data-toggle="dropdown"
              >
                保存SQL
                <span class="caret" />
              </button>
              <ul class="dropdown-menu">
                <li>
                  <a
                    href="#"
                    @click="openSaveSqlDialog(1)"
                    ondragstart="return false;"
                    >保存</a
                  >
                </li>
                <li>
                  <a
                    href="#"
                    @click="openSaveSqlDialog(2)"
                    ondragstart="return false;"
                    >另存为</a
                  >
                </li>
              </ul>
            </div>
            <div class="btn-group">
              <button
                type="button"
                class="btn btn-primary"
                data-toggle="dropdown"
              >
                工具箱
                <span class="caret" />
              </button>
              <ul class="dropdown-menu">
                <li>
                  <a
                    href="#"
                    ondragstart="return false;"
                    @click="findAndReplace(2)"
                    >查找</a
                  >
                </li>
                <li>
                  <a
                    href="#"
                    ondragstart="return false;"
                    @click="findAndReplace(1)"
                    >替换</a
                  >
                </li>
                <li>
                  <a
                    href="#"
                    ondragstart="return false;"
                    @click="caseTransformation(1)"
                    >转大写</a
                  >
                </li>
                <li>
                  <a
                    href="#"
                    ondragstart="return false;"
                    @click="caseTransformation(2)"
                    >转小写</a
                  >
                </li>
                <li>
                  <a
                    href="#"
                    ondragstart="return false;"
                    @click="selectSqlNotes()"
                    >注释选中行</a
                  >
                </li>
                <li>
                  <a
                    href="#"
                    ondragstart="return false;"
                    @click="selectSqlCancelNotes()"
                    >取消注释</a
                  >
                </li>
              </ul>
            </div>
            <label id="InfoFlag" style="display: none"
              >SQL必须全部执行后才可保存</label
            >
            <input id="flag" type="hidden" value="false" />
            <input id="flag2" type="hidden" value="false" />
            <input id="outColumn" type="hidden" value="" />
          </div>
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
        <div id="horizontal" />
        <!-- 结果展示和参数输入区域 -->
        <div
          id="bottomPart"
          class="layui-tab col-sm-12"
          lay-filter="result-data"
        >
          <ul class="layui-tab-title" />
          <div
            id="maxOpen"
            style="width: 80px; position: absolute; right: 0; top: 15px"
            onclick="maxOpen()"
          >
            <img id="iconImg" class="iconImg" alt="最大化" />
            <span class="iconText">最大化</span>
          </div>
          <div id="dataShow" v-for="result in resultShow" class="layui-tab-content">
            <childTabs
              ref="childTabsRef"
              :key="result.id"
              :preValue="currentExecuteSQL"
              use-type="sqlEditor"
            ></childTabs>
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
      <div id="tableMenuTwo" class="rightMenu">
        <ul>
          <li onclick="getSelectSql('tableMenuTwo')">生成SELECT语句</li>
        </ul>
      </div>
      <div id="importTableMenu" class="rightMenu">
        <ul>
          <li onclick="getSelectSql('importTableMenu')">生成SELECT语句</li>
          <li onclick="">修改表结构</li>
          <li onclick="">删除</li>
        </ul>
      </div>
      <div id="paramFolderMenu1" class="rightMenu">
        <ul>
          <li onclick="addParam(1)">添加参数</li>
          <li onclick="addFolder(1)">添加分类</li>
          <li onclick="editFolder()">修改分类</li>
          <li onclick="delFolder()">删除分类</li>
        </ul>
      </div>
      <div id="paramMenu" class="rightMenu">
        <ul>
          <li onclick="editParam()">修改参数</li>
          <li onclick="delParam()">删除参数</li>
          <li onclick="selectRelation()">查看参数关联</li>
          <li onclick="viewParam()">查看属性</li>
        </ul>
      </div>
      <div id="paramFolderMenu2" class="rightMenu">
        <ul>
          <li onclick="addParam(2)">添加参数</li>
          <li onclick="addFolder(2)">添加分类</li>
        </ul>
      </div>
      <div id="rootMenu" class="rightMenu">
        <ul>
          <li id="rootDataRefresh" onclick="rootDataRefresh()">刷新</li>
        </ul>
      </div>
      <div id="importDataMenu" class="rightMenu">
        <ul>
          <li id="importData" onclick="importData()">导入数据</li>
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
        :model="sqlDraftForm"
        :rules="sqlDraftFormRules"
        ref="sqlDraftForm"
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
      <sqlDraftList ref="sqlDraftList"></sqlDraftList>
      <div slot="footer" class="dialog-footer">
        <el-button @click="sqlDraftDialog = false">关闭</el-button>
        <el-button type="primary" @click="useSql">使用SQL</el-button>
      </div>
    </el-dialog>
    <el-dialog title="参数渲染" :visible.sync="dialogFormVisible">
      <paramDraw ref="paramDrawRef"></paramDraw>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">关闭</el-button>
        <el-button type="primary" @click="">确定</el-button>
      </div>
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
  selectSqlNotes,
  selectSqlCancelNotes,
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
  startExecuteSql
} from "@/api/analysis/SQLEditor/SQLEditor";
import sqlDraftList from "@/views/analysis/SQLEditor/sqlDraftList";
import { updateDraft } from "@/api/analysis/SQLEditor/SQLDraft";
import childTabs from "@/views/analysis/auditModelResult/childTabs";
import paramDraw from "@/views/analysis/modelParam/paramDraw";
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
export default {
  name: "SQLEditor",
  components: { sqlDraftList, childTabs, paramDraw },
  props: ["sqlEditorParamObj", "sqlValue"],
  watch:{
    dialogFormVisible(value){
      this.$nextTick(function(){
        if(value){
          this.$refs.paramDrawRef.initParamHtmlSS(this.executeData.sql, this.executeData.arr, "请输入参数", null); //前后加遮罩
        }
      })
    }
  },
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
      sqlDraftDialogFormVisible: false,
      sqlDraftDialog: false,
      dialogFormVisible:false,
      formLabelWidth: "120px",
      currentExecuteSQL: [], //当前执行的全部sql,
      webSocket: null,
      resultShow: [],
      isAllExecute: false, //是否全部执行
      modelOriginalTable: [],
      executeData:{}
    };
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
      let webSocketPath =
        "ws://localhost:8086/analysis/websocket?" +
        this.$store.getters.personuuid;
      //WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
      this.webSocket = new WebSocket(webSocketPath); //建立与服务端的连接
      //当服务端打开连接
      this.webSocket.onopen = function (event) {};
      //发送消息
      this.webSocket.onmessage = function (event) {
        let dataObj = JSON.parse(event.data);
        //todo  这块得加判断  判断sql是否全部执行成功，失败则不加1
        currentExecuteProgress++;
        //如果当前执行等于总的执行进度  说明最后的结果集已经拿到 取出最后一个结果集的列做为模型结果列
        if (currentExecuteProgress == dataObj.executeTask.executeSQL.length) {
          isAllExecuteSuccess = true;
          lastResultColumn = dataObj.columnNames;
          //todo 现在暂时还拿不到类型  后续需要改
          //lastResultColumnType = dataObj.columnTypes
        }
        func1(dataObj);
        //console.log(event.data);
      };
      let func2 = function func3(val) {
        this.$refs.childTabsRef[0].loadTableData(val);
      };
      let func1 = func2.bind(this);
      this.webSocket.onclose = function (event) {};

      //通信失败
      this.webSocket.onerror = function (event) {};
    },
    /**
     * 通过WebSocket对象发送消息给服务端
     * 此处没有主动发消息给服务端，如果调用此方法，则会发送消息至socket服务端onMessage()方法上
     */
    sendMsgToServer() {
      let message = "123";
      if (message) {
        this.webSocket.send(
          JSON.stringify({ username: $("#username").text(), msg: message })
        );
      }
    },
    initData() {
      initDragAndDrop();
      initIcon();
      let userId = this.$store.getters.personuuid;
      initTableTree(userId);
      initFunctionTree();
      initVariable();
      initEvent();
      initParamTree();
      initTableTip(userId).then((result) => {
        var relTableMap = {};
        if (result.data != null) {
          for (let i = 0; i < result.data.length; i++) {
            if (result.data[i].type === "table") {
              relTableMap[result.data[i].name] = [];
            }
          }
        }
        initSQLEditor(document.getElementById("sql"), relTableMap);
        if (this.sqlValue != "") {
          //编辑模型的sql  反显数据
          editorSql(this.sqlValue, this.sqlEditorParamObj);
        }
      });
    },
    tableTreeSearch() {
      tableTreeSearch();
    },
    paramTreeSearch() {
      paramTreeSearch();
    },
    functionTreeSearch() {
      functionTreeSearch();
    },
    sqlFormat() {
      sqlFormat();
    },
    findAndReplace(type) {
      findAndReplace(type);
    },
    caseTransformation(type) {
      caseTransformation(type);
    },
    selectSqlNotes() {
      selectSqlNotes();
    },
    selectSqlCancelNotes() {
      selectSqlCancelNotes();
    },
    getSaveInfo() {
      if (!this.isAllExecute) {
        this.$message({ type: "info", message: "全部执行才可以保存!" });
        return;
      }
      //如果当前执行进度与要执行的sql数量相等 则证明数据已经全部拿到，允许保存
      if (currentExecuteProgress != this.currentExecuteSQL.length) {
        this.$message({ type: "info", message: "全部执行成功才可以保存!" });
        return;
      }
      console.log("当前执行总进度:" + currentExecuteProgress);
      console.log("是否全部执行成功:" + isAllExecuteSuccess);
      console.log(this.currentExecuteSQL);
      console.log(lastResultColumn);
      let returnObj = getSaveInfo();
      returnObj.columnNames = lastResultColumn;
      returnObj.columnTypes = lastResultColumnType;
      returnObj.modelOriginalTable = this.modelOriginalTable;
      returnObj.modelType = 1;
      return returnObj;
    },
    getSelectSql(menuId) {
      getSelectSql(menuId);
    },
    openSaveSqlDialog(type) {
      if (type == 1) {
        //如果对象是旧的对象则证明是打开的sql草稿 因此直接保存  否则直接修改
        let sqlObj = getSaveSqlDraftObj(type);
        let sql = sqlObj.draftSql;
        if (sql === "") {
          this.$notify({
            title: "提示",
            message: "请输入sql语句",
            type: "info",
            duration: 2000,
            position: "bottom-right",
          });
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
    saveSqlDialog() {
      let verResult = false;
      this.$refs["sqlDraftForm"].validate((valid) => {
        if (valid) {
          verResult = valid;
        }
      });
      if (verResult) {
        let sqlObj = getSaveSqlDraftObj(1);
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
            //手动销毁数据  多层dialog v-if失效 不知道为啥 没找到解决办法
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
    openSqlDraftList() {
      this.sqlDraftDialog = true;
    },
    useSql() {
      let returnObj = this.$refs.sqlDraftList.getSelectRow();
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
    executeSQL() {
      let result = getSql();
      if (result.sql === "") {
        this.$message({ type: "info", message: "请输入sql!" });
        return;
      }
      this.isAllExecute = result.isAllExecute;
      verifySql().then((result) => {
        if (!result.data.verify) {
          this.$message({ type: "info", message: "SQL不合法，请重新输入" });
          return;
        }
        this.resultShow = []; //清空数据展示对象
        isAllExecuteSuccess = false;
        currentExecuteProgress = 0;
        this.currentExecuteSQL = [];
        lastResultColumn = [];
        let obj = executeSQL()
        if(!obj.isExistParam){
          startExecuteSql(obj).then((result) => {
            console.log(result);
            if (!result.data.isError) {
              this.currentExecuteSQL = result.data.executeSQLList;
              this.modelOriginalTable = result.data.tables;
              this.resultShow.push({ id: 1 });
            } else {
              this.$message({ type: "info", message: "执行失败" });
            }
          });
        }
        else{
          obj.sql = obj.sqls
          this.openParamDraw(obj)
          console.log(obj)
        }
      });
    },
    openParamDraw(data) {
      this.dialogFormVisible = true;
       this.executeData = data
    },
  },
};
function test() {
  return this.$refs.childTabsRef;
}
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
.iconImg {
  width: 20px;
  height: 20px;
  margin-bottom: 4px;
}
.iconText {
  font-size: 14px;
  cursor: pointer;
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
  top: 0;
  left: 16.5%;
  height: 114vh;
  width: 3px;
  overflow: hidden;
  background: #c0c5d4;
  cursor: w-resize;
}
#horizontal {
  position: absolute;
  top: 50%;
  /* width: 100vh; */
  width: 100%;
  height: 3px;
  overflow: hidden;
  background: #c0c5d4;
  cursor: s-resize;
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
</style>
