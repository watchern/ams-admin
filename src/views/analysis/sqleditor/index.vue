<template>
  <div class="app-container">
    <div id="container" v-loading="executeLoading">
      <el-collapse v-model="DefaultExpansion">
        <div id="leftPart" class="left-part">
          <el-collapse-item title="数据表" name="1">
            <el-input id="dataSearch" v-model="tableSearchInput" name="dataSearch" type="text" autocomplete="off"
                      placeholder="查询">
              <el-button slot="append" icon="el-icon-search" @click="tableTreeSearch"></el-button>
            </el-input>
            <ul id="dataTree" class="ztree" style="overflow: auto"/>
          </el-collapse-item>
          <el-collapse-item title="参数" name="2">
            <el-input id="paramSearch" name="paramSearch" type="text" v-model="paramSearchInput" autocomplete="off"
                      placeholder="查询">
              <el-button slot="append" icon="el-icon-search" @click="paramTreeSearch"></el-button>
            </el-input>
            <ul id="paramTree" class="ztree" style="max-height: 400px"/>
          </el-collapse-item>
          <el-collapse-item title="SQL函数" name="3">
            <el-input id="sqlSearch" name="sqlSearch" type="text" v-model="functionInput" autocomplete="off"
                      placeholder="查询">
              <el-button slot="append" icon="el-icon-search" @click="functionTreeSearch"></el-button>
            </el-input>
            <ul id="sqlFunTree" class="ztree"/>
          </el-collapse-item>
        </div>
      </el-collapse>
      <div id="rightPart" class="col-sm-10" style="height: 100vh">
        <div id="sqlEditorDiv" class="sql-editor-div">
          <div class="row table-view-caption" style="margin-left: 30px; height: 40px; padding-top: 8px">
            <el-button type="primary" size="small" @click="sqlFormat">格式化</el-button>
            <el-button type="primary" size="small" @click="executeSQL">执行</el-button>
            <el-button type="primary" size="small" @click="openSqlDraftList">打开SQL</el-button>
            <el-dropdown>
              <el-button type="primary" size="small">保存<i class="el-icon-arrow-down el-icon--right"></i></el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="openSaveSqlDialog(1)">保存</el-dropdown-item>
                <el-dropdown-item @click.native="openSaveSqlDialog(2)">另存为</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-dropdown type="primary">
              <el-button type="primary" size="small">工具箱<i class="el-icon-arrow-down el-icon--right"></i></el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="findAndReplace(2)">查找</el-dropdown-item>
                <el-dropdown-item @click.native="findAndReplace(1)">替换</el-dropdown-item>
                <el-dropdown-item @click.native="caseTransformation(1)">转大写</el-dropdown-item>
                <el-dropdown-item @click.native="caseTransformation(2)">转小写</el-dropdown-item>
                <el-dropdown-item @click.native="selectSqlNotes()">注释选中行</el-dropdown-item>
                <el-dropdown-item @click.native="selectSqlCancelNotes()">取消注释</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <label
              id="InfoFlag"
              style="display: none"
            >SQL必须全部执行后才可保存</label>
            <input id="flag" type="hidden" value="false">
            <input id="flag2" type="hidden" value="false">
            <input id="outColumn" type="hidden" value="">
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
          <textarea id="sql"/>
        </div>
        <div id="horizontal"/>
        <div id="maxOpen" class="max-size" @click="maxOpenBtn">
          <img id="iconImg" class="iconImg" alt="最大化">
          <span class="iconText">最大化</span>
        </div>
        <!-- 结果展示和参数输入区域 -->
        <div id="bottomPart" lay-filter="result-data">
          <div v-for="result in resultShow" id="dataShow" class="data-show">
            <childTabs ref="childTabsRef" :key="result.id" :pre-value="currentExecuteSQL" use-type="sqlEditor" style="width: 101.5%"/>
          </div>
        </div>
      </div>
      <div id="vertical"/>
      <input id="personId" type="hidden" value="<%=LoginUserInfo.getLoginUserId()%>">
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
        >
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
          <el-input v-model="sqlDraftForm.draftTitle" autocomplete="off"/>
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
      <sqlDraftList ref="sqlDraftList"/>
      <div slot="footer" class="dialog-footer">
        <el-button @click="sqlDraftDialog = false">关闭</el-button>
        <el-button type="primary" @click="useSql">使用SQL</el-button>
      </div>
    </el-dialog>
    <el-dialog title="请输入参数" v-if="dialogFormVisible" :visible.sync="dialogFormVisible" :append-to-body="true">
      <paramDraw ref="paramDrawRef"/>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">关闭</el-button>
        <el-button type="primary" @click="replaceNodeParam">确定</el-button>
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
} from '@/api/analysis/sqleditor/sqleditor'
import sqlDraftList from '@/views/analysis/sqleditor/sqldraftlist'
import { updateDraft } from '@/api/analysis/sqleditor/sqldraft'
import childTabs from '@/views/analysis/auditmodelresult/childtabs'
import paramDraw from '@/views/analysis/modelparam/paramdraw'
import { replaceNodeParam } from '@/api/analysis/auditparam'

/**
 * 当前执行进度
 * @type {number}
 */
let currentExecuteProgress = 0
/**
 * 最后一个结果集的列
 * @type {*[]}
 */
let lastResultColumn = []
/**
 * 是否全部执行成功
 * @type {boolean}
 */
let isAllExecuteSuccess = false

/**
 * 最后模型结果列类型
 * @type {*[]}
 */
const lastResultColumnType = []

/**
 * 数据界面对象
 */
let childTabsRef
export default {
  name: 'SQLEditor',
  components: { sqlDraftList, childTabs, paramDraw },
  props: ['sqlEditorParamObj', 'sqlValue'],
  data() {
    return {
      sqlDraftForm: {
        sqlDraftUuid: '',
        draftTitle: '',
        draftSql: '',
        paramJson: ''
      },
      sqlDraftFormRules: {
        draftTitle: [
          {
            type: 'string',
            required: true,
            message: '请输入草稿名称',
            trigger: 'blur'
          }
        ]
      },
      DefaultExpansion: ['1', '2', '3'],
      sqlDraftDialogFormVisible: false,
      sqlDraftDialog: false,
      dialogFormVisible: false,
      formLabelWidth: '120px',
      executeLoading: false,
      currentExecuteSQL: [], // 当前执行的全部sql,
      webSocket: null,
      resultShow: [],
      isAllExecute: false, // 是否全部执行
      modelOriginalTable: [],
      executeData: {},
      paramDrawLoading: false,
      tableSearchInput: '',
      paramSearchInput: '',
      functionInput: ''
    }
  },
  watch: {
    dialogFormVisible(value) {
      this.$nextTick(function() {
        if (value) {
          this.$refs.paramDrawRef.initParamHtmlSS(this.executeData.sql, this.executeData.arr, '请输入参数', null)
        }
      })
    }
  },
  mounted() {
    this.initData()
    this.initWebSocket()
  },
  methods: {
    /**
     *初始化webSocket
     */
    initWebSocket() {
      this.webSocket = this.getWebSocket()
    },
    /**
     *
     * 使用说明：
     * 1、WebSocket客户端通过回调函数来接收服务端消息。例如：webSocket.onmessage
     * 2、WebSocket客户端通过send方法来发送消息给服务端。例如：webSocket.send();
     */
    getWebSocket() {
      const webSocketPath =
        'ws://localhost:8086/analysis/websocket?' +
        this.$store.getters.personuuid
      // WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
      this.webSocket = new WebSocket(webSocketPath) // 建立与服务端的连接
      // 当服务端打开连接
      this.webSocket.onopen = function(event) {
      }
      // 发送消息
      this.webSocket.onmessage = function(event) {
        const dataObj = JSON.parse(event.data)
        if(dataObj.result != null){
          currentExecuteProgress++
        }
        // 如果当前执行等于总的执行进度  说明最后的结果集已经拿到 取出最后一个结果集的列做为模型结果列
        if (currentExecuteProgress == dataObj.executeTask.executeSQL.length) {
          isAllExecuteSuccess = true
          lastResultColumn = dataObj.columnNames
          // todo 现在暂时还拿不到类型  后续需要改
          // lastResultColumnType = dataObj.columnTypes
        }
        func1(dataObj)
      }
      const func2 = function func3(val) {
        this.$refs.childTabsRef[0].loadTableData(val)
        //已经全部执行完成，调用父组件方法初始化参数列等信息
        if(isAllExecuteSuccess){
          this.$emit('getSqlObj');
        }
      }
      const func1 = func2.bind(this)
      this.webSocket.onclose = function(event) {
      }

      // 通信失败
      this.webSocket.onerror = function(event) {
      }
    },
    /**
     * 通过WebSocket对象发送消息给服务端
     * 此处没有主动发消息给服务端，如果调用此方法，则会发送消息至socket服务端onMessage()方法上
     */
    sendMsgToServer() {
      const message = '123'
      if (message) {
        this.webSocket.send(
          JSON.stringify({ username: $('#username').text(), msg: message })
        )
      }
    },
    initData() {
      initDragAndDrop()
      initIcon()
      const userId = this.$store.getters.personuuid
      initTableTree(userId)
      initFunctionTree()
      initVariable()
      initEvent()
      initParamTree()
      initTableTip(userId).then((result) => {
        var relTableMap = {}
        if (result.data != null) {
          for (let i = 0; i < result.data.length; i++) {
            if (result.data[i].type === 'table') {
              relTableMap[result.data[i].name] = []
            }
          }
        }
        initSQLEditor(document.getElementById('sql'), relTableMap)
        if (this.sqlValue != '') {
          // 编辑模型的sql  反显数据
          editorSql(this.sqlValue, this.sqlEditorParamObj)
        }
      })
    },
    tableTreeSearch() {
      tableTreeSearch()
    },
    paramTreeSearch() {
      paramTreeSearch()
    },
    functionTreeSearch() {
      functionTreeSearch()
    },
    sqlFormat() {
      sqlFormat()
    },
    findAndReplace(type) {
      findAndReplace(type)
    },
    caseTransformation(type) {
      caseTransformation(type)
    },
    selectSqlNotes() {
      selectSqlNotes()
    },
    selectSqlCancelNotes() {
      selectSqlCancelNotes()
    },
    getSaveInfo() {
      if (!this.isAllExecute) {
        this.$message({ type: 'info', message: '全部执行才可以保存!' })
        return
      }
      // 如果当前执行进度与要执行的sql数量相等 则证明数据已经全部拿到，允许保存
      if (currentExecuteProgress != this.currentExecuteSQL.length) {
        this.$message({ type: 'info', message: '全部执行成功才可以保存!' })
        return
      }
      /*      console.log("当前执行总进度:" + currentExecuteProgress);
      console.log("是否全部执行成功:" + isAllExecuteSuccess);
      console.log(this.currentExecuteSQL);
      console.log(lastResultColumn);*/
      const returnObj = getSaveInfo()
      returnObj.columnNames = lastResultColumn
      returnObj.columnTypes = lastResultColumnType
      returnObj.modelOriginalTable = this.modelOriginalTable
      returnObj.modelType = 1
      return returnObj
    },
    getSelectSql(menuId) {
      getSelectSql(menuId)
    },
    openSaveSqlDialog(type) {
      if (type == 1) {
        // 如果对象是旧的对象则证明是打开的sql草稿 因此直接保存  否则直接修改
        const sqlObj = getSaveSqlDraftObj(type)
        const sql = sqlObj.draftSql
        if (sql === '') {
          this.$notify({
            title: '提示',
            message: '请输入sql语句',
            type: 'info',
            duration: 2000,
            position: 'bottom-right'
          })
          return
        } else {
          if (!sqlObj.isOld) {
            this.sqlDraftDialogFormVisible = true
          } else {
            updateDraft(sqlObj).then((result) => {
              if (result.code == 0) {
                this.$notify({
                  title: '提示',
                  message: '保存成功',
                  type: 'success',
                  duration: 2000,
                  position: 'bottom-right'
                })
              } else {
                this.$notify({
                  title: '提示',
                  message: '保存失败',
                  type: 'error',
                  duration: 2000,
                  position: 'bottom-right'
                })
              }
            })
          }
        }
      } else {
        this.sqlDraftDialogFormVisible = true
      }
    },
    saveSqlDialog() {
      let verResult = false
      this.$refs['sqlDraftForm'].validate((valid) => {
        if (valid) {
          verResult = valid
        }
      })
      if (verResult) {
        const sqlObj = getSaveSqlDraftObj(1)
        this.sqlDraftForm.draftSql = sqlObj.draftSql
        this.sqlDraftForm.paramJson = sqlObj.paramJson
        saveSqlDraft(this.sqlDraftForm).then((result) => {
          if (result.code == 0) {
            this.$notify({
              title: '提示',
              message: '保存成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
            this.sqlDraftDialogFormVisible = false
            // 手动销毁数据  多层dialog v-if失效 不知道为啥 没找到解决办法
            this.sqlDraftForm = {
              sqlDraftUuid: '',
              draftTitle: '',
              draftSql: '',
              paramJson: ''
            }
          } else {
            this.$notify({
              title: '提示',
              message: '保存失败',
              type: 'error',
              duration: 2000,
              position: 'bottom-right'
            })
          }
        })
      }
    },
    openSqlDraftList() {
      this.sqlDraftDialog = true
    },
    useSql() {
      const returnObj = this.$refs.sqlDraftList.getSelectRow()
      if (returnObj.verify) {
        this.$confirm('该操作会清空当前SQL编辑器中的语句,是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.sqlDraftDialog = false
          useSql(returnObj)
        })
      } else {
        return
      }
    },
    executeSQL() {
      const result = getSql()
      if (result.sql === '') {
        this.$message({ type: 'info', message: '请输入sql!' })
        return
      }
      this.isAllExecute = result.isAllExecute
      verifySql().then((result) => {
        if (!result.data.verify) {
          this.$message({ type: 'info', message: 'SQL不合法，请重新输入' })
          return
        }
        this.resultShow = [] // 清空数据展示对象
        isAllExecuteSuccess = false
        currentExecuteProgress = 0
        this.currentExecuteSQL = []
        lastResultColumn = []
        const obj = executeSQL()
        if (!obj.isExistParam) {
          this.executeLoading = true
          startExecuteSql(obj).then((result) => {
            this.executeLoading = false
            if (!result.data.isError) {
              this.currentExecuteSQL = result.data.executeSQLList
              this.modelOriginalTable = result.data.tables
              this.resultShow.push({ id: 1 })
            } else {
              this.$message({ type: 'info', message: '执行失败' })
            }
          })
        } else {
          this.openParamDraw(obj)
        }
      })
    },
    openParamDraw(data) {
      this.dialogFormVisible = true
      this.paramDrawLoading = true
      this.executeData = data
    },
    /**
     * 获取替换参数后的sql  直接直接
     */
    replaceNodeParam() {
      var obj = replaceNodeParam()
      if (!obj.verify) {
        this.$message({ type: 'info', message: obj.message })
        return
      }
      obj.sqls = obj.sql
      startExecuteSql(obj).then((result) => {
        if (!result.data.isError) {
          this.currentExecuteSQL = result.data.executeSQLList
          this.modelOriginalTable = result.data.tables
          this.resultShow.push({ id: 1 })
          this.dialogFormVisible = false
        } else {
          this.$message({ type: 'info', message: '执行失败' })
        }
      })
    },
    maxOpenBtn(){
      alert(123)
    }
  }
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
  top: 20;
  left: 31.8%;
  height: 94vh;
  width: 3px;
  overflow: hidden;
  background: #c0c5d4;
  cursor: w-resize;
  display: none;
}

#horizontal {
  position: absolute;
  top: 36%;
  /* width: 100vh; */
  width: 97.5%;
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

.layui-tab{
  margin:10px 0;
  text-align:left!important;
  width:100%;
}

.max-size{
  width: 80px;
  position: relative;
  right: 0;
  top: 2%;
  float: right;
}

.sql-editor-div{
  padding: 0px;
  width: 100%;
  height: 37%;
}

.data-show{
  margin-top: 4%;
  width: 98.7%;
}

.left-part{
  overflow: auto;
  width: 16.66666667%;
  float: left;
  height: 89vh;
}
</style>
