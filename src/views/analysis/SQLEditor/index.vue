<template>
  <div class="app-container">
    <div id="container">
      <div id="leftPart" class="col-sm-2 leftCon" style="overflow:auto;height:100vh;">
        <div id="accordion" class="panel-group">
          <div class="panel panel-default">
            <div class="panel-heading">
              <h4 class="panel-title">
                <a data-toggle="collapse" data-parent="#accordion" href="#collapse">数据表</a>
              </h4>
            </div>
            <div id="collapse" class="panel-collapse collapse in">
              <div class="panel-body" style="overflow-x: auto;">
                <img id="tableSearchImg" @click="tableTreeSearch">
                <input id="dataSearch" name="dataSearch" type="text" class="form-control" autocomplete="off" placeholder="查询">
                <ul id="dataTree" class="ztree" style="overflow: auto;" />
              </div>
            </div>
          </div>
        </div>
        <div id="accordion1" class="panel-group">
          <div class="panel panel-default">
            <div class="panel-heading">
              <h4 class="panel-title">
                <a data-toggle="collapse" data-parent="#accordion1" href="#collapse1">参数</a>
              </h4>
            </div>
            <div id="collapse1" class="panel-collapse collapse in">
              <div class="panel-body" style="overflow-x: auto;">
                <img id="paramSearchImg" @click="paramTreeSearch">
                <input id="paramSearch" name="paramSearch" type="text" class="form-control" autocomplete="off" placeholder="查询">
                <ul id="paramTree" class="ztree" style="max-height:400px;" />
              </div>
            </div>
          </div>
        </div>
        <div id="accordion2" class="panel-group">
          <div class="panel panel-default">
            <div class="panel-heading">
              <h4 class="panel-title">
                <a data-toggle="collapse" data-parent="#accordion2" href="#collapse2">SQL函数</a>
              </h4>
            </div>
            <div id="collapse2" class="panel-collapse collapse in">
              <div class="panel-body" style="overflow-x: auto;">
                <img id="funSearchImg" @click="functionTreeSearch">
                <input id="sqlSearch" name="sqlSearch" type="text" class="form-control" autocomplete="off" placeholder="查询">
                <ul id="sqlFunTree" class="ztree" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="rightPart" class="col-sm-10" style="height:100vh;">
        <div id="sqlEditorDiv" class="col-sm-12" style="padding:0px;height:50vh;">
          <div class="row table-view-caption" style="margin-left: 30px;height:40px;padding-top:8px;">
            <button type="button" class="btn btn-primary" @click="sqlFormat()">格式化</button>&nbsp;
            <!-- <button type="button" class="btn btn-primary" onclick="alertVerify()">SQL语法校验</button> -->
            <button type="button" class="btn btn-primary" onclick="sqlEditor.ecexuteSql()">执行</button>&nbsp;
            <button type="button" class="btn btn-primary" onclick="sqlEditor.selectSqlDraft()">打开SQL</button>&nbsp;
            <div class="btn-group">
              <button type="button" class="btn btn-primary" data-toggle="dropdown">
                保存SQL
                <span class="caret" />
              </button>
              <ul class="dropdown-menu">
                <li>
                  <a href="#" onclick="sqlEditor.saveSqlDraft(1)" ondragstart="return false;">保存</a>
                </li>
                <li>
                  <a href="#" onclick="sqlEditor.saveSqlDraft(2)" ondragstart="return false;">另存为</a>
                </li>
              </ul>
            </div>
            <div class="btn-group">
              <button type="button" class="btn btn-primary" data-toggle="dropdown">
                工具箱
                <span class="caret" />
              </button>
              <ul class="dropdown-menu">
                <li>
                  <a href="#" ondragstart="return false;" @click="findAndReplace(2)">查找</a>
                </li>
                <li>
                  <a href="#" ondragstart="return false;" @click="findAndReplace(1)">替换</a>
                </li>
                <li>
                  <a href="#" ondragstart="return false;" @click="caseTransformation(1)">转大写</a>
                </li>
                <li>
                  <a href="#" ondragstart="return false;" @click="caseTransformation(2)">转小写</a>
                </li>
                <li>
                  <a href="#" ondragstart="return false;" @click="selectSqlNotes()">注释选中行</a>
                </li>
                <li>
                  <a href="#" ondragstart="return false;" @click="selectSqlCancelNotes()">取消注释</a>
                </li>
              </ul>
            </div>
            <label id="InfoFlag" style="display:none;">SQL必须全部执行后才可保存</label>
            <input id="flag" type="hidden" value="false">
            <input id="flag2" type="hidden" value="false">
            <input id="outColumn" type="hidden" value="">
          </div>
          <div id="sqlDraft" class="row" style="display: none;margin-left: 30px;height:30px;line-height: 30px;font-weight: bold;" />
          <textarea id="sql" />
        </div>
        <div id="horizontal" />
        <!-- 结果展示和参数输入区域 -->
        <div id="bottomPart" class="layui-tab col-sm-12" lay-filter="result-data">
          <ul class="layui-tab-title" />
          <div id="maxOpen" style="width:80px;position: absolute;right: 0;top: 15px;display: none;" onclick="maxOpen()">
            <img id="iconImg" class="iconImg" alt="最大化">
            <span class="iconText">最大化</span>
          </div>
          <div id="dataShow" class="layui-tab-content" />
        </div>
      </div>
      <div id="vertical" />
      <input id="personId" type="hidden" value="<%=LoginUserInfo.getLoginUserId()%>">
      <div id="tableMenu" class="rightMenu">
        <ul>
          <li onclick="sqlEditor.getSelectSql('tableMenu')">生成SELECT语句</li>
          <li onclick="sqlEditor.viewTableDetail()">查看表信息</li>
          <li onclick="sqlEditor.viewTableRelation()">查看表关联信息</li>
        </ul>
      </div>
      <div id="tableMenuTwo" class="rightMenu">
        <ul>
          <li onclick="sqlEditor.getSelectSql('tableMenuTwo')">生成SELECT语句</li>
        </ul>
      </div>
      <div id="importTableMenu" class="rightMenu">
        <ul>
          <li onclick="sqlEditor.getSelectSql('importTableMenu')">生成SELECT语句</li>
          <li onclick="sqlEditor.editTable()">修改表结构</li>
          <li onclick="sqlEditor.deleteTable()">删除</li>
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
    <form id="countForm" class="form-horizontal" style="display:none">
      <div class="form-group col-sm-12">
        <label class="col-sm-3 control-label">视图sql:</label>
        <div class="col-sm-7">
          <textarea id="viewSql" name="viewSql" type="text" class="form-control" style="height:400px" readonly />
        </div>
      </div>
    </form>
    <div id="tableNameDiv" style="display:none"class="col-sm-12">
      <div class="col-sm-10" style="margin:20px">
        <label id="saveTips" class="col-sm-10 control-label" style="color:red" />
        <input id="tableName" name="tableName" type="text" class="form-control">
      </div>
    </div>
  </div>
</template>
<script>
import { initSQLEditor, initDragAndDrop, initTableTip, initIcon,
  initTableTree, initFunctionTree, initEvent, initParamTree,
  tableTreeSearch, paramTreeSearch, functionTreeSearch, sqlFormat, findAndReplace,
  caseTransformation, selectSqlNotes, selectSqlCancelNotes } from '@/api/analysis/SQLEditor/SQLEditor'
export default {
  name: 'SQLEditor',
  data() {
    return {
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData() {
      initDragAndDrop()
      initIcon()
      initTableTree()
      initFunctionTree()
      initEvent()
      initParamTree()
      initTableTip().then(result => {
        var relTableMap = {}
        if (!result.data.isError) {
          relTableMap = result.data.result
        }
        initSQLEditor(document.getElementById('sql'), relTableMap)
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
    }
  }
}
</script>
<style>
#tableSearchImg,#paramSearchImg,#funSearchImg{
  width:20px;
  height: 20px;
  position: relative;
  bottom: -25px;
  right:10px;
  float: right;
  cursor: pointer;
}
.CodeMirror-hint-table{
  color:#af0000 !important;
  font-size:15pt;
}
.CodeMirror-hint-table:before
{
  content:" ";
  width:30px;
  height:20px;
  background-image: url("/lib/codemirror/img/ic-table.png");
}
.menuDemo {position:absolute; display:none; top:0;text-align: left;padding: 2px;}
.menuDemo ul{
  display: block;
  min-width: 43px;
}
.menuDemo ul li{
  margin: 1px 0;
  padding: 0 5px;
  cursor: pointer;
  list-style: none outside none;
}
.iconImg{
  width: 20px;
  height: 20px;
  margin-bottom: 4px;
}
.iconText{
  font-size: 14px;
  cursor: pointer;
}
#sql{
  width:100%;
  height:320px;
}
.table-view {
  overflow-x: auto;
}
#vertical {
  position: absolute;
  top: 0;
  left: 17.3%;
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
.errorHighlight{
  background-color:#f99999
}
.successHighlight{
  background-color:transparent!important
}
.CodeMirror-hints{z-index:1000}
#dataShow>pre{
  color:red;
  padding: 9.5px;
  margin: 0 0 10px;
  font-size: 16px;
  background: none;
  border: none;
}
</style>
