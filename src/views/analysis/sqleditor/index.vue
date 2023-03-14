<template>
  <div class="app-container" ref="sqlEditorDiv">
    <div
      id="container"
      v-loading="executeLoading"
      :element-loading-text="loadText"
    >
      <div id="sidebar">
        <div class="unfold-shuju add-sidiv">
          <img :src="shuju" /><span>数据表</span>
        </div>
        <div class="unfold-canshu" v-if="callType != 'graphModel'">
          <img :src="canshu" /><span>参数</span>
        </div>
        <div class="unfold-sql"><img :src="sql" /><span>函数</span></div>
        <!-- <div class="unfold-draft"><img :src="draft" /><span>SQL草稿</span></div> -->
        <!-- <div class="unfold-bj">
          <img :src="sql" /><span>标记</span>
        </div> -->
      </div>
      <div id="leftPart" class="left-part">
        <div class="left-dataTree">
          <!-- 替换成新的资源树 -->
          <!-- <el-input id="dataSearch"
                    style="margin-top: 5px"
                    v-model="tableSearchInput"
                    placeholder="输入关键字进行过滤"
                    @change="tableTreeSearch"
                    suffix-icon="el-icon-search" />
          <ul id="dataTree"
              class="ztree"
              style="margin-top: 5px" /> -->
          <LeftTrees
            ref="tree_left"
            @nodeContextmenuSQLEditor="nodeContextmenuSQLEditor"
          ></LeftTrees>
        </div>
        <div class="left-paramTree">
          <el-input
            id="paramSearch"
            style="margin-top: 5px"
            v-model="paramSearchInput"
            placeholder="输入关键字进行过滤"
            @input="paramTreeSearch"
          />
          <div style="margin: 5px">
            <el-tooltip
              class="item"
              effect="dark"
              content="刷新"
              placement="top"
            >
              <el-button
                type="primary"
                size="mini"
                @click="refshParamList()"
                style="float: right"
                icon="el-icon-refresh"
              />
            </el-tooltip>
          </div>
          <ul id="paramTree" class="ztree" style="margin-top: 5px" />
        </div>
        <div class="left-sqlFunTree">
          <el-input
            id="sqlSearch"
            style="margin-top: 5px"
            v-model="functionInput"
            placeholder="输入关键字进行过滤"
            @input="functionTreeSearch"
          />
          <ul id="sqlFunTree" class="ztree" style="margin-top: 5px" />
        </div>
        <!--        SQL草稿树-->
        <div class="left-draftTree">
          <el-input
            id="draftSearch"
            style="margin-top: 5px"
            v-model="draftInput"
            placeholder="输入关键字进行过滤"
            @change="draftTreeSearch"
            suffix-icon="el-icon-search"
          />
          <ul id="draftTree" class="ztree" style="margin-top: 5px" />
        </div>
        <div class="left-bjTree">
          <ul
            id="bjTree"
            class="ztree"
            style="margin-top: 5px; padding: 20px 0 0 30px"
          />
        </div>
      </div>
      <div id="rightPart" style="height: 100%">
        <div id="sqlEditorDiv" class="sql-editor-div">
          <el-row type="flex" class="row-bg">
            <el-col style="display: flex">
              <!-- <span>数据量：</span> -->
              <el-tooltip
                class="item"
                effect="dark"
                content="格式化"
                placement="top"
              >
                <el-button
                  type="primary"
                  size="small"
                  class="oper-btn format"
                  @click="sqlFormat"
                  style="margin-left: 18px"
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="执行"
                placement="top"
              >
                <el-button
                  type="primary"
                  size="small"
                  class="oper-btn start"
                  @click="executeSQL"
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="打开sql草稿"
                placement="top"
              >
                <el-button
                  type="primary"
                  size="small"
                  class="oper-btn"
                  @click="openSqlDraftList"
                  style="width: 120px"
                  ><i class="el-icon-document-copy"></i
                ></el-button>
              </el-tooltip>
              <!-- <el-button type="primary"
                         size="small"
                         class="oper-btn"
                         @click="assistSqlEditor"
                         style="width: 120px">辅助SQL编辑器</el-button> -->
              <el-tooltip
                class="item"
                effect="dark"
                content="打开新SQL编辑器"
                placement="top"
              >
                <el-button
                  type="primary"
                  size="small"
                  class="oper-btn"
                  @click="openNewEditor"
                >
                  <i class="el-icon-s-open"></i
                ></el-button>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="校验"
                placement="top"
              >
                <el-button
                  type="primary"
                  size="small"
                  class="oper-btn sqlcheck"
                  @click="getColumnSqlInfo"
                />
              </el-tooltip>
              <el-dropdown style="margin-left: 10px">
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="草稿"
                  placement="top"
                >
                  <el-button
                    type="primary"
                    size="small"
                    class="oper-btn draft"
                  />
                </el-tooltip>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="openSaveSqlDialog(1)"
                    >SQL保存</el-dropdown-item
                  >
                  <el-dropdown-item @click.native="openSaveSqlDialog(2)"
                    >SQL另存为</el-dropdown-item
                  >
                </el-dropdown-menu>
              </el-dropdown>
              <el-dropdown type="primary" style="margin-left: 10px">
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="工具"
                  placement="top"
                >
                  <el-button
                    type="primary"
                    size="small"
                    class="oper-btn maintain"
                  />
                </el-tooltip>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="findAndReplace(2)"
                    >查找
                  </el-dropdown-item>
                  <el-dropdown-item @click.native="findAndReplace(1)"
                    >替换
                  </el-dropdown-item>

                  <el-dropdown-item @click.native="changeSize(2)"
                    >字体缩小
                  </el-dropdown-item>
                  <el-dropdown-item @click.native="changeSize(1)"
                    >字体放大
                  </el-dropdown-item>
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
                  <!-- <el-dropdown-item @click.native="bjSqlNotes()"
                    >标记</el-dropdown-item
                  > -->
                </el-dropdown-menu>
              </el-dropdown>
              <div class="pointOutBox">
                <img
                  src="../../../assets/img/pointOut.png"
                  style="margin-left: 15px"
                  alt=""
                  @click="open"
                />
                <div class="pointOutTitle" v-if="pointOutFlag">
                  <pre
                    style="
                      color: red;
                      background-color: white;
                      font-size: 16px;
                      padding: 10px;
                    "
                    >{{ remindMessage }}</pre
                  >
                </div>
              </div>

              <!-- <label style="
                  margin-right: -43px;
                  color: #9b4c4c;
                  margin-left: 10px;
                  margin-left: 15px;
                  cursor: pointer;
                "
                     @click="modelResultSavePathDialog = true">{{ path }} <i class="el-icon-edit"
                   style="font-size: 16px"></i></label> -->
              <!-- 切换数据源下拉框 -->
              <!-- <div class="chooseDataSource"
                   v-if="typeof callType == 'undefined'">
                数据源：
                <el-select v-model="dataSource"
                           style="width: 120px">
                  <el-option v-for=" item in dataSourceList"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value" />
                </el-select>
              </div> -->

              <el-tooltip
                class="item"
                effect="dark"
                content="缓冲大小"
                placement="top"
              >
                <div class="inline-block hc-div">
<!--                  <el-select-->
<!--                      v-model="resultDataMaxCount"-->
<!--                  >-->
<!--                    <el-option-->
<!--                        v-for="item in resultDataMaxCountList"-->
<!--                        :key="item"-->
<!--                        :label="item"-->
<!--                        :value="item"-->
<!--                    />-->
<!--                  </el-select>-->
                  <el-autocomplete
                      ref="hcInput"
                    popper-class="my-autocomplete"
                    v-model="resultDataMaxCount"
                    :fetch-suggestions="querySearch"
                    placeholder="请输入内容">
                  <i
                      class="el-icon-arrow-down el-input__icon"
                      slot="suffix"
                      @click="handleIconClick">
                  </i>
                </el-autocomplete>
                </div>

              </el-tooltip>
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
          <textarea ref="sql" style="width: 100%; height: 320px" />
        </div>
        <div id="horizontal" />

        <!-- 结果展示和参数输入区域 -->
        <div id="bottomPart" lay-filter="result-data">
          <!-- <div id="maxOpen" class="max-size" ref="maxSize">
            <div id="iconImg" class="iconImg" alt="最大化" @click="maxOpen" />
            <div id="iconImg-huifu" class="iconImg" @click="maxOpen" />
          </div> -->
          <!--          && isExecuteErro条件是为了避免显示错误信息的时候还显示该remindMessage-->
          <!-- <div
            v-if="resultShow.length == 0 && isExecuteError"
            style="margin-top: 20px"
          >
            <pre
              style="
                color: red;
                background-color: white;
                font-size: 16px;
                padding: 10px;
              "
              >{{ remindMessage }}</pre
            >
          </div> -->
          <div id="maxOpen" class="max-size" ref="maxSize">
            <div
              id="iconImg"
              class="iconImg"
              alt="最大化"
              @click="maxOpen('big')"
            />
            <div
              id="iconImg-huifu"
              class="iconImg"
              @click="maxOpen('normal')"
            />
          </div>
          <div
            v-for="result in resultShow"
            id="dataShow"
            class="data-show"
            v-if="isExecuteError"
          >
            <childTabs
              :callType="callType"
              ref="childTabsRef"
              :key="result.id"
              :pre-value="currentExecuteSQL"
              :maintableindex="maintableindex"
              use-type="sqlEditor"
              style="width: 100%"
              :chartModelUuid="modelUuid"
              :modelId="modelUuid"
              id="childTabs1"
              :executeSqlViewData="executeSqlViewData"
              :dataSource="dataSource"
              @refreshDataTabTree="refreshDataTabTree"
            />
          </div>
          <div v-if="!isExecuteError" class="data-show">
            <el-tabs type="border-card" style="height: 30px">
              <el-tab-pane label="错误信息">
                <el-card class="box-card" style="height: 100px" align="center">
                  <div style="font-weight: lighter; font-size: 15px">
                    {{ errorMessage }}
                  </div>
                </el-card>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
      <div id="vertical"><i class="el-icon-d-caret skin-textColor" /></div>
      <input
        id="personId"
        type="hidden"
        value="<%=LoginUserInfo.getLoginUserId()%>"
      />
      <div id="tableMenu" class="rightMenu">
        <ul>
          <li @click="getSelectSql('tableMenu')">生成SELECT语句</li>
          <!--          <li @click="selectTableRelInfo('tableMenu')">查看表关联信息</li>-->
          <li @click="selectTableInfo('tableMenu')">查看表信息</li>
        </ul>
      </div>
      <div id="paramfolderMenu" class="rightMenu">
        <ul>
          <li @click="addParamForm()">添加参数</li>
          <li @click="setSelectTreeNode(1)">添加分类</li>
          <li @click="setSelectTreeNode(2)">修改分类</li>
          <li @click="setSelectTreeNode(3)">删除分类</li>
        </ul>
      </div>
      <div id="paramMenu" class="rightMenu">
        <ul>
          <li @click="updateParamForm()">修改参数</li>
          <li @click="deleteParam()">删除参数</li>
          <li @click="selectParamModel()">查看参数关联</li>
          <li @click="updateParamForm('1')">查看属性</li>
        </ul>
      </div>
    </div>
    <form id="countForm" class="form-horizontal" style="display: none">
      <div class="form-group">
        <label class="control-label">视图SQL:</label>
        <div>
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
        <el-button type="primary" @click="choosePath()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      v-if="sqlDraftFolderDialogFormVisible"
      title="请选择SQL草稿保存路径"
      :visible.sync="sqlDraftFolderDialogFormVisible"
      :append-to-body="true"
    >
      <sqlDraftTree
        ref="sqlDraftTree"
        @refreshDraftList="refreshDraftList"
        :isShowDraft="false"
        openType="save"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="sqlDraftFolderDialogFormVisible = false"
          >取 消</el-button
        >
        <el-button type="primary" @click="saveSqlDialog()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      v-if="sqlDraftDialog"
      title="SQL草稿列表"
      :visible.sync="sqlDraftDialog"
      :append-to-body="true"
      width="85%"
    >
      <el-container class="content-box">
        <el-aside class="tree-side">
          <sqlDraftTree
            ref="sqlDraftTree"
            @refreshDraftList="refreshDraftList"
            :isShowDraft="true"
            openType="show"
          />
        </el-aside>
        <div class="list-side" ref="listSide">
          <sqlDraftList
            ref="sqlDraftList"
            @refreshDraftTree="refreshDraftTree"
          />
        </div>
      </el-container>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closesqlDraftList">关闭</el-button>
        <el-button type="primary" @click="useSql">使用SQL</el-button>
      </div>
    </el-dialog>
    <el-dialog
      v-if="dialogFormVisible"
      title="请输入参数"
      :visible.sync="dialogFormVisible"
      :append-to-body="true"
    >
      <!--            <paramDraw v-if="dialogFormVisible" ref="paramDrawRef" :my-id="paramDrawUuid" />-->
      <paramDrawNew
        v-if="dialogFormVisible"
        :sql="this.executeData.sql"
        :arr="this.executeData.arr"
        v-bind:paramDrawUuid.sync="paramDrawUuid"
        ref="paramDrawRefNew"
      ></paramDrawNew>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">关闭</el-button>
        <el-button type="primary" @click="replaceNodeParam">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="选择SQL结果保存路径"
      v-if="modelResultSavePathDialog"
      :visible.sync="modelResultSavePathDialog"
      width="30%"
      :append-to-body="true"
    >
      <dataTree
        :data-user-id="personCode"
        :scene-code="sceneCode"
        :tree-type="treeType"
        style="height: 500px; overflow-y: scroll"
        @node-click="handleClick"
        @handle-check="handleCheck"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelSave">取 消</el-button>
        <el-button type="primary" @click="modelResultSavePathDetermine"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <el-dialog
      title="表关联信息"
      :visible.sync="selectTableRelInfoDialog"
      width="60%"
      :append-to-body="true"
    >
      <tablerelation
        :table-id="selectTableRelInfoTableId"
        :open-type="openTypeOne"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="selectTableRelInfoDialog = false">关闭</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="表信息"
      :visible.sync="selectTableInfoDialog"
      :close-on-click-modal="false"
      width="60%"
      :append-to-body="true"
      class="tableInfo"
    >
      <!-- 基本信息详情 -->
      <Details
        ref="Details_ref"
        :isDisable_input="true"
        :isHide_step="false"
        :is_Edit_list="0"
        :dataSource="tableDetailsDataSource"
        :tableMetaUuid="detailsTableMetaUuid"
      ></Details>
      <div slot="footer" class="dialog-footer">
        <el-button @click="selectTableInfoDialog = false">关闭</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :close-on-click-modal="false"
      v-if="dialogFolderVisible"
      title="请填写分类信息"
      :visible.sync="dialogFolderVisible"
    >
      <el-form :model="folderform" class="detail-form">
        <el-form-item label="分类名称">
          <el-input v-model="folderform.folderName" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFolderVisible = false">取 消</el-button>
        <el-button type="primary" @click="() => enterBtn()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :append-to-body="false"
      :close-on-click-modal="false"
      v-if="addParamDialog"
      :title="textMap[dialogStatus]"
      :visible.sync="addParamDialog"
      class="modelParamsDia"
    >
      <addParam
        :selectTreeNode="selectTreeNode"
        @refshParamList="refshParamList"
        :operationObj="operationObj"
        ref="addParam"
      ></addParam>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addParamDialog = false">取 消</el-button>
        <el-button
          type="primary"
          :disabled="operationObj.isDetail"
          @click="() => saveParam()"
          >确 定</el-button
        >
      </div>
    </el-dialog>
    <el-dialog
      :append-to-body="false"
      :close-on-click-modal="false"
      v-if="ParamModelDialog"
      title="参数关联信息"
      :visible.sync="ParamModelDialog"
    >
      <div>
        <el-form ref="parammodelform" :model="parammodelform">
          <el-form-item label="图形化模型">
            <el-input
              type="textarea"
              v-model="parammodelform.model"
              disabled
            ></el-input>
          </el-form-item>
          <el-form-item label="模型">
            <el-input
              type="textarea"
              v-model="parammodelform.graph"
              disabled
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="ParamModelDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
    <el-dialog
      v-if="assistSqlEditorDialogFormVisible"
      title="辅助SQL编辑器"
      :visible.sync="assistSqlEditorDialogFormVisible"
      :close-on-click-modal="false"
      width="90%"
      top="2vh"
      :append-to-body="true"
    >
      <div class="el-dialog-div">
        <assistSqlEditor ref="assistSqlEditor" />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="assistSqlEditorDialogFormVisible = false"
          >取 消</el-button
        >
        <el-button type="primary" @click="saveSqlDialog()">确 定</el-button>
      </div>
    </el-dialog>
    <el-drawer
      title="提示"
      :visible.sync="drawer"
      :before-close="handleClose"
      size="40%"
    >
      <pre
        style="
          color: red;
          background-color: white;
          font-size: 16px;
          padding: 10px;
        "
        >{{ remindMessage }}</pre
      >
    </el-drawer>
    <div id="paramfolderdatabox"></div>
    <div id="paramdatabox"></div>
  </div>
</template>
<script>
import addParam from "@/views/analysis/modelparam/paramManager/addParam";
import { getUuid } from "@/api/analysis/common";
import { uuid2 } from "@/api/analysis/auditmodel";
import tablerelation from "@/views/data/table/tablerelation";
import LeftTrees from "@/components/loginTree/leftTree.vue";
require("@/components/ams-codemirror/addon/edit/matchbrackets");
require("@/components/ams-codemirror/addon/selection/active-line");
require("@/components/ams-codemirror/mode/sql/sql");
require("@/components/ams-codemirror/addon/hint/show-hint");
require("@/components/ams-codemirror/addon/hint/sql-hint");
require("@/components/ams-ztree/js/jquery.ztree.all.min");
require("@/components/ams-ztree/js/jquery.ztree_new.all.min");
require("@/components/ams-ztree/js/jquery.ztree.excheck");
require("@/components/ams-ztree/js/jquery.ztree.exhide");

import "@/components/ams-codemirror/theme/ambiance.css";
import "@/components/ams-codemirror/lib/codemirror.css";

import "@/components/ams-codemirror/addon/hint/show-hint.css";
import "@/components/ams-ztree/css/zTreeStyle/zTreeStyle.css";
import "@/components/ams-codemirror/addon/dialog/dialog.js";
import "@/components/ams-codemirror/addon/dialog/dialog.css";
import "@/components/ams-codemirror/addon/search/searchcursor.js";
import "@/components/ams-codemirror/addon/search/search.js";
import {
  initSQLEditor,
  initDragAndDrop,
  initTableTip,
  initIcon,
  initTableTree,
  initFunctionTree,
  initBJTree,
  initEvent,
  initParamTreeNew,
  initDraftTree,
  draftTreeSearch,
  tableTreeSearch,
  paramTreeSearch,
  functionTreeSearch,
  sqlFormat,
  findAndReplace,
  caseTransformation,
  getExecuteTask,
  selectSqlNotes,
  selectSqlCancelNotes,
  bjSqlNotes,
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
  positionSqlError,
  refushTableTree,
  refushTableTree2,
  dropTable,
  getIsUpdate,
  setIsUpdate,
  getDefaultSqlEditorLocationByPersonUuid,
  saveSqlEditorExecuteDefaultPath,
  sendSqlEditorVue,
  getGraphSaveInfo,
  getZtreeSelectNode,
  hideRMenu,
  sendSettingVue,
  loadResultDataMaxCountList,
} from "@/api/analysis/sqleditor/sqleditor";
import sqlDraftList from "@/views/analysis/sqleditor/sqldraftlist";
import sqlDraftTree from "@/views/analysis/sqleditor/sqldrafttree";
import assistSqlEditor from "@/views/analysis/sqleditor/assistSqlEditor";
import { updateDraft } from "@/api/analysis/sqleditor/sqldraft";
import childTabs from "@/views/analysis/auditmodelresult/childtabs";
import paramDraw from "@/views/analysis/modelparam/paramdraw";
import paramDrawNew from "@/views/analysis/modelparam/paramdrawnew";
import { replaceNodeParam } from "@/api/analysis/auditparam";
import dataTree from "@/views/data/role-res/data-tree";
import {
  findModelParamTreeData,
  addFolder,
  editFolder,
  delFolder,
  listByAmmParam,
} from "@/api/analysis/parammanagerlist";
import { isAdmin } from "@/api/user";
import Details from "@/components/directory/details.vue";
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
let lastSqlIndex = -1;
export default {
  name: "SQLEditor",
  components: {
    sqlDraftTree,
    sqlDraftList,
    childTabs,
    paramDraw,
    dataTree,
    paramDrawNew,
    tablerelation,
    addParam,
    Details,
    LeftTrees,
    assistSqlEditor,
  },
  props: [
    "sqlEditorParamObj",
    "sqlValue",
    "callType",
    "locationUuid",
    "locationName",
    "modelUuid",
    "dataUserId",
    "sceneCode1",
    "callType",
    "modelFolderPath",
    "callType",
  ],
  created() {
    if (this.dataUserId != undefined && this.sceneCode1 != undefined) {
      this.personCode = this.dataUserId;
      this.sceneCode = this.sceneCode1;
    }
    sendSettingVue(this);
    // 校验用户权限
    isAdmin().then((res) => {
      // 是管理员
      if (res.data) {
        this.isManager = true;
      } else {
        // 不是管理员
        this.isManager = false;
      }
    });
    loadResultDataMaxCountList().then((res) => {
      if (res.data.length > 0) {
        this.resultDataMaxCountList =res.data;
        let list=[];
        this.resultDataMaxCountList.forEach((item)=>{
          let v={
            value:item,
            name:item
          }
          list.push(v);
        })
        this.resultDataMaxCountList2=list;
        this.resultDataMaxCount = String(res.data[0]);
      }
    });
  },
  data() {
    return {
      drawer: false,
      pointOutFlag: false,
      // 显示执行sql的弹窗数据（getexecutetask接口传入的第一个参数）
      executeSqlViewData: {},
      remindMessage:
        "注意事项：\n（1）【' ' as xx】字段时,空列必须要空格,\n      例如【select ' ' as a from dual】\n（2）where条件中使用参数时，in(参数)无需加单引号,\n      例如【select a from dual where a in (参数名称)】\n（3）where条件中使用参数时，使用非in(参数)时需加单引号,\n      例如【select a from dual where a =‘参数名称’\n（4）注释：/*注释内容*/写法即可完成，注释里面不要包含系统中的参数\n（5）开发模型时，SQL必须全部执行后才可保存\n（6）编写模型语句时，DROP语句需放在最后\n（7）当前SQL将使用最后一个select语句结果集进行输出结果定义配置\n（8）编写含有参数的SQL条件语句并符合以下条件时，需特殊处理：\n  ① in条件语句，括号内不能出现空格，例：where name in (参数XX)\n  ② 存在于括号内的条件，条件应与括号之间存在空格，\n    例：where ( name='参数X' and type='参数2' ) or type='参数3'",
      resultDataMaxCountList: [200, 500, 1000, 10000, 100000],
      resultDataMaxCountList2: [
          {value:200,name:200},
        {value:500,name:500},
        {value:1000,name:1000},
        {value:10000,name:10000},
        {value:100000,name:100000}],
      resultDataMaxCount: "200",
      dataSource: "Postgre",
      dataSourceList: [
        {
          value: "Hive",
          label: "MRS",
        },
        {
          value: "Postgre",
          label: "DWS",
        },
      ],
      //参数关联dialog
      ParamModelDialog: false,
      //参数关联表单
      parammodelform: {
        model: "",
        graph: "",
      },
      //添加文件夹dialog
      dialogFolderVisible: false,
      // 操作类型 1、添加；2、修改
      addParamDialog: false,
      //实体
      folderform: {
        folderId: null,
        folderName: null,
        parentFolderId: null,
        folderPath: null,
        folderType: "folder",
      },
      // 操作类型 1、添加；2、修改
      operationType: 0,
      //操作类型
      operationObj: {
        //1、添加  2、修改
        operationType: 1,
        //参数编号
        paramUuid: "",
        //是否是查看详情
        isDetail: false,
      },
      pfd: {}, //分类路径对象
      textMap: {
        update: "修改模型参数",
        create: "添加模型参数",
        detail: "模型参数详情",
      },
      dialogStatus: "create",
      selectTreeNode: null,
      savePath: null,
      openTypeOne: "showTable",
      selectTableRelInfoDialog: false,
      selectTableRelInfoTableId: "",
      selectTableInfoDialog: false,
      selectTableInfoTableId: "",
      errorMessage: "",
      isExecuteError: true,
      sqlDraftForm: {
        sqlDraftUuid: "",
        draftTitle: "",
        draftSql: "",
        paramJson: "",
        dataSource: "Postgre",
        parentUuid: "",
        sceneInstUuid: "",
        createUserId: "",
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
      //辅助SQL编辑器
      assistSqlEditorDialogFormVisible: false,
      // SQL草稿dialog
      sqlDraftDialogFormVisible: false,
      // SQL草稿选择保存路径dialog
      sqlDraftFolderDialogFormVisible: false,
      // SQL草稿列表dialog
      sqlDraftDialog: false,
      // 参数dialog
      dialogFormVisible: false,
      // 遮罩层文字
      loadText: "",
      // form宽度
      formLabelWidth: "120px",
      // 参数渲染界面唯一编号
      paramDrawUuid: "",
      // 执行loading
      executeLoading: false,
      // 当前执行的全部sql,
      currentExecuteSQL: [],
      // 长连接
      webSocket: null,
      // 结果显示
      resultShow: [],
      // SQL执行路径对象
      defaultSqlLocation: null,
      // 是否全部执行
      isAllExecute: false,
      // SQL执行所用到的表
      modelOriginalTable: [],
      // sql编辑器执行完create类型的sql后返回的树节点信息，用于拼一个假节点
      createTreeNode: [],
      // 执行回来的数据
      executeData: {},
      // 参数渲染界面loading
      paramDrawLoading: false,
      // 表树搜索值
      tableSearchInput: "",
      // c参数搜索值
      paramSearchInput: "",
      // 函数树搜索值
      functionInput: "",
      // SQL草稿树搜索值
      draftInput: "",
      shuju: require("@/views/analysis/auditmodel/imgs/shuju.png"),
      canshu: require("@/views/analysis/auditmodel/imgs/canshu.png"),
      sql: require("@/views/analysis/auditmodel/imgs/sql.png"),
      draft: require("@/views/analysis/auditmodel/imgs/sql.png"),
      // 结果保存执行路径
      modelResultSavePathDialog: false,
      // 临时执行路径
      tempPath: "",
      // 临时执行露囧编号
      tempId: "",
      nodeType: "",
      path: "选择SQL结果保存路径",
      modelResultSavePathId: "",
      personCode: this.$store.state.user.code,
      sceneCode: "auditor",
      treeType: "save",
      pushUuid: "",
      maintableindex: "",
      personalTitle: "审计人员场景",
      // 是否为管理员身份
      isManager: false,
      tableDetailsDataSource: "", //查看表详细信息时 需要的数据源
      detailsTableMetaUuid: "", //查看表详细信息时 表主键
    };
  },
  watch: {
    dialogFormVisible(value) {
      // this.$nextTick(function() {
      //     if (value) {
      //         this.$refs.paramDrawRef.initParamHtmlSS(
      //             this.executeData.sql,
      //             this.executeData.arr,
      //             '     ',
      //             this.paramDrawUuid,
      //             'sqlEditor'
      //         )
      //     }
      // })
      this.$nextTick(function () {
        if (value) {
          this.$refs.paramDrawRefNew.createParamNodeHtml(this.paramDrawUuid);
        }
      });
    },
    dataSource() {
      // 切换数据源后刷新页面重新获取对应数据源的数据
      this.executeLoading = true;
      this.loadText = "正在重新加载数据表及函数...";
      this.getWebSocket();
      initFunctionTree(this.dataSource);
      initTableTip(this.dataUserId, this.sceneCode1, this.dataSource).then(
        (result) => {
          initTableTree(result, this.dataSource);
          var relTableMap = {};
          var expTableMap = {};
          if (result.data != null) {
            for (let i = 0; i < result.data.length; i++) {
              if (result.data[i].type === "table") {
                relTableMap[result.data[i].enName] = [];
                expTableMap[result.data[i].enName] = result.data[i].extCol;
              }
            }
          }
          this.executeLoading = false;
        }
      );
    },
  },
  mounted() {
    try {
      let graphToolDiv = this.$parent.$parent.$refs.graphToolDiv;
      if (graphToolDiv) {
        this.$refs.sqlEditorDiv.style.height =
          $(graphToolDiv).height() - 120 + "px";
      }
    } catch (e) {}
    sendSqlEditorVue(this);
    this.initData();
    this.initWebSocket();
    // 默认隐藏放大按钮
    this.$refs.maxSize.style.display = "none";
  },
  methods: {
    querySearch(queryString, cb) {
      var restaurants = this.resultDataMaxCountList2;
      var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      return (restaurant) => {
        return queryString?(restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0):'';
      };
    },
    handleIconClick() {
      this.$refs.hcInput.focus();
    },
    //辅助sql编辑器
    assistSqlEditor() {
      this.assistSqlEditorDialogFormVisible = true;
    },
    openNewEditor() {
      window.open(window.location.href);
    },
    choosePath() {
      this.$refs["sqlDraftForm"].validate((valid) => {
        if (valid) {
          this.sqlDraftDialogFormVisible = false;
          this.sqlDraftFolderDialogFormVisible = true;
        }
      });
    },
    refreshDraftList(data) {
      let query = {};
      data.type == "draft"
        ? (query = { sqlDraftUuid: data.id })
        : (query = { parentUuid: data.id, path: data.path });
      this.$refs.sqlDraftList.getList(query);
    },
    refreshDraftTree() {
      this.$refs.sqlDraftTree.refreshTree();
    },
    //刷新数据表树
    refreshDataTabTree() {
      this.executeLoading = true;
      initTableTip(this.dataUserId, this.sceneCode1, this.dataSource).then(
        (result) => {
          initTableTree(result, this.dataSource);
          var relTableMap = {};
          var expTableMap = {};
          if (result.data != null) {
            for (let i = 0; i < result.data.length; i++) {
              if (result.data[i].type === "table") {
                relTableMap[result.data[i].enName] = [];
                expTableMap[result.data[i].enName] = result.data[i].extCol;
              }
            }
          }
          this.executeLoading = false;
        }
      );
    },
    // dataSourceChange(){
    // sessionStorage.setItem("dataSource", this.dataSource));
    // },
    /**
     * 表单确定按钮
     */
    enterBtn() {
      if (this.operationType === 1) {
        this.addModelParamFolder();
      } else {
        this.updateModelParamFolder();
      }
    },
    /**
     * 设置选中的节点
     * @param node 整个节点数据
     * @param data 数据 要设置的节点数据
     * @param operationType 1、添加；2、修改 3、删除
     */
    setSelectTreeNode(operationType) {
      var isShowOperation = true;
      this.pfd = $("#paramfolderdatabox").val();
      this.operationType = operationType;
      this.selectTreeNode = this.pfd;
      if (operationType === 2) {
        if (this.pfd.pid == 0) {
          this.$message({ type: "info", message: "不允许修改根节点" });
          return false;
        }
        this.folderform.folderName = this.selectTreeNode.label;
      }
      if (operationType === 3) {
        isShowOperation = false;
        if (this.pfd.pid == 0) {
          this.$message({ type: "info", message: "不允许删除根节点" });
          return false;
        }
        if (this.pfd.children != undefined) {
          this.$message({ type: "info", message: "存在子节点,不允许删除" });
          return false;
        }
        this.deleteModelParamFolder();
      }
      hideRMenu("paramfolderMenu");
      this.dialogFolderVisible = isShowOperation;
    },
    addModelParamFolder() {
      this.folderform.folderId = getUuid();
      this.folderform.parentFolderId = this.selectTreeNode.id;
      this.folderform.folderSort = 0;
      this.folderform.folderPath = this.pfd.path;
      addFolder(this.folderform).then((result) => {
        if (result.data != null) {
          this.refshParamList();
          this.folderform.folderName = "";
          this.dialogFolderVisible = false;
          this.$message({ type: "success", message: "添加成功" });
        } else {
          this.$message({ type: "error", message: "添加失败" });
        }
      });
    },
    updateModelParamFolder() {
      this.folderform.folderId = this.selectTreeNode.id;
      this.folderform.parentFolderId = null;
      this.folderform.folderPath = null;
      //加入修改方法
      editFolder(this.folderform).then((result) => {
        if (result.data != null) {
          this.refshParamList();
          this.folderform.folderName = "";
          this.dialogFolderVisible = false;
          this.$message({ type: "success", message: "修改成功" });
        } else {
          this.$message({ type: "error", message: "修改失败" });
        }
      });
    },
    deleteModelParamFolder() {
      //加入删除方法
      delFolder(this.selectTreeNode.id, this.selectTreeNode.label).then(
        (result) => {
          if (result.data != null) {
            this.refshParamList();
            hideRMenu("paramfolderMenu");
            this.$message({ type: "success", message: "删除成功" });
          } else {
            this.$message({ type: "error", message: "删除失败" });
          }
        }
      );
    },
    /**
     *添加参数窗体
     */
    addParamForm() {
      this.operationObj.isDetail = false;
      this.pfd = $("#paramfolderdatabox").val();
      this.selectTreeNode = this.pfd;
      if (this.selectTreeNode == null) {
        this.$message({ type: "info", message: "请选择文件夹" });
        return;
      }
      if (this.selectTreeNode.pid == 0) {
        this.$message({ type: "info", message: "不允许创建在根目录下" });
        return;
      }
      this.operationObj.operationType = 1;
      this.operationObj.paramUuid = "";
      this.dialogStatus = "create";
      this.addParamDialog = true;
      hideRMenu("paramfolderMenu");
    },
    /**
     * 修改参数
     * type: 1-查看详情
     */
    updateParamForm(type) {
      this.operationObj.isDetail = false;
      this.pfd = $("#paramfolderdatabox").val();
      this.selectTreeNode = this.pfd;
      var selectObj = $("#paramdatabox").val();
      if (!selectObj) {
        this.$message({ type: "info", message: "最少选择一个参数!" });
        return;
      }
      this.operationObj.operationType = 2;
      this.operationObj.paramUuid = selectObj.id;
      this.dialogStatus = "update";
      if (type === "1") {
        this.operationObj.isDetail = true;
        this.dialogStatus = "detail";
      }
      this.addParamDialog = true;
      hideRMenu("paramMenu");
    },
    deleteParam() {
      let that = this;
      var selectObj = $("#paramdatabox").val();
      if (!selectObj) {
        this.$message({ type: "info", message: "最少选择一个参数!" });
        return;
      }
      this.$confirm(
        "删除该参数可能会影响到使用该参数的模型 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        let ids = [];
        let names = [];
        ids.push(selectObj.id);
        names.push(selectObj.name);
        var url = "/analysis/paramController/deleteParam";
        $.ajax({
          url: url,
          method: "POST",
          cache: false,
          dataType: "json",
          data: { ammParamUuids: ids, ammParamNames: names },
          traditional: true, //默认false
          async: false,
          success: function (data, textStatus, jqXHR) {
            if (data.code == 0) {
              that.refshParamList();
              that.$notify({
                title: "成功",
                message: "删除成功！",
                type: "success",
                duration: 2000,
                position: "bottom-right",
              });
            } else {
              that.$message({
                type: "error",
                message: "删除参数出错,参数错误",
              });
            }
          },
          error: function () {
            that.$message({
              type: "error",
              message: "删除参数出错,请联系管理员",
            });
          },
        });
      });
    },
    /**
     *保存参数对象
     */
    saveParam() {
      this.$refs.addParam.okBtn();
    },
    /**
     * 获取参数关联
     */
    getParamModel() {
      this.$message({ type: "info", message: "暂时先放放" });
    },
    /**
     * 查看参数关联
     */
    selectParamModel() {
      this.ParamModelDialog = true;
      this.getParamModel();
    },

    /**
     * 刷新参数列表
     */
    refshParamList() {
      initParamTreeNew();
      this.addParamDialog = false;
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
      this.pushUuid = uuid2() + Date.parse(new Date());
      /*      const webSocketPath =
                  'ws://localhost:8086/analysis/websocket?' +
                  this.$store.getters.personuuid*/
      var _this = this;
      const webSocketPath =
        this.AmsWebsocket.getWSBaseUrl(this.AmsModules.ANALYSIS) +
        this.$store.getters.personuuid +
        "sqleditor" +
        this.pushUuid;
      // WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
      this.webSocket = new WebSocket(webSocketPath); // 建立与服务端的连接
      // 当服务端打开连接
      this.webSocket.onopen = function (event) {};
      // 发送消息
      this.webSocket.onmessage = function (event) {
        const dataObj = JSON.parse(event.data);
        // console.log(dataObj)
        if (
          dataObj.listenerType === "afterTaskChangeTable" ||
          dataObj.listenerType === "afterTaskCreateView"
        ) {
          const treeNodeInfo = dataObj.addTableMetaList;
          if (treeNodeInfo.length > 0) {
            var treeNodes = [];
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
                label: treeNodeInfo[i].displayTbName,
                enName: treeNodeInfo[i].displayTbName,
                personNode: false,
                pid: treeNodeInfo[i].folderUuid,
                timeColNum: 0,
                type:
                  dataObj.listenerType === "afterTaskChangeTable"
                    ? "table"
                    : "view",
              };
              treeNodes.push(treeNode);
            }
            //加载智能提示
            refushTableTree2(treeNodes, this.dataSource);
            //重新刷新表
            _this.$refs.tree_left.refreshTreeList("", "1");
          }
        }
        if (dataObj.listenerType === "onSQLResult") {
          if (dataObj.executeSQL.state == 2) {
            // 如果最后的列索引与当前执行进度一直，说明最后的结果集已经拿到 取出最后一个结果集的列做为模型结果列
            if (lastSqlIndex == currentExecuteProgress) {
              lastResultColumn = dataObj.columnNames;
              lastResultColumnType = dataObj.columnTypes;
            }
            currentExecuteProgress++;
          }
          // 如果当前执行等于总的执行进度  说明sql已经全部执行成功
          if (currentExecuteProgress == dataObj.executeTask.executeSQL.length) {
            isAllExecuteSuccess = true;
          }
          func1(dataObj);
        }
        if (
          dataObj.listenerType === "afterTaskDropTable" ||
          dataObj.listenerType === "afterTaskDropView"
        ) {
          //删除智能提示 刷新树
          dropTable(dataObj.dropTableNameList);
          _this.$refs.tree_left.refreshTreeList(dataObj.dropTableNameList, "2");
        }
      };
      const func2 = function func3(val) {
        this.$refs.childTabsRef[0].loadTableData(val);
        // 已经全部执行完成，调用父组件方法初始化参数列等信息
        if (isAllExecuteSuccess) {
          setIsUpdate(false);
          this.$emit("getSqlObj");
        }
      };
      const func1 = func2.bind(this);
      this.webSocket.onclose = function (event) {
        console.log("==websocket连接已断开==");
        var closeMsg = {
          executeSQL: {
            id: null,
            state: "websocketClose",
            msg: null,
          },
        };
        this.$refs.childTabsRef[0].loadTableData(closeMsg);
      };

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
      const userId = this.$store.state.user.code;
      initDragAndDrop();
      initIcon();
      initFunctionTree(this.dataSource);
      initBJTree();
      initVariable();
      initEvent();
      initParamTreeNew(this.modelFolderPath);
      initDraftTree();

      //新数据表树
      this.$refs.tree_left.loadLeftTreeTypeFun("1");

      // initSQLEditor(document.getElementById('sql'), relTableMap, expTableMap) // 初始化SQL编辑器
      initSQLEditor(this.$refs.sql, {}, {});
      if (this.sqlValue != "" && this.sqlValue != undefined) {
        // 编辑模型的sql  反显数据
        editorSql(this.sqlValue, this.sqlEditorParamObj);
        this.tempPath = this.locationName;
        this.tempId = this.locationUuid;
        this.path = "当前执行SQL保存路径:" + this.tempPath;
        this.modelResultSavePathId = this.tempId;
      } else {
        // 只要不是编辑从任何地方进来都给一个默认的执行路径
        getDefaultSqlEditorLocationByPersonUuid().then((result) => {
          if (result.data == null) {
            // 证明当前登录人没有任何执行路径记录 直接给一个默认的  从数据模块那面取  暂时没有 因为数据那面让写死  数据组长-张闯
            this.tempPath = "根路径";
            // this.tempPath = ''
            this.tempId = this.$store.getters.datauserid;
            // this.tempId = ''
            this.path = "当前执行SQL保存路径:" + this.tempPath;
            this.modelResultSavePathId = "createTemporaryDataFolder";
          } else {
            // 如果不为空则反显上次选中的
            this.tempPath = result.data.sqlLocationName;
            this.tempId = result.data.sqlLocationId;
            this.path = "当前执行SQL保存路径:" + this.tempPath;
            this.modelResultSavePathId = "createTemporaryDataFolder";
            this.defaultSqlLocation = result.data;
          }
        });
      }
      refreshCodeMirror();

      /* this.executeLoading = true;  旧的数据表树已经废弃
      this.loadText = "正在初始化数据表..."; */
      /* initTableTip(this.dataUserId, this.sceneCode1, this.dataSource).then((result) => {
          initTableTree(result, this.dataSource);
          var relTableMap = {};
          var expTableMap = {};
          if (result.data != null) {
            for (let i = 0; i < result.data.length; i++) {
              if (result.data[i].type === "table") {
                relTableMap[result.data[i].enName] = [];
                expTableMap[result.data[i].enName] = result.data[i].extCol;
              }
            }
          }
          
        })
        .catch(() => {
          this.$message({ type: "error", message: "初始化数据表失败!" });
          this.executeLoading = false;
          this.loadText = "";
        }); */
    },
    /**
     * 数据表树搜索
     */
    tableTreeSearch() {
      tableTreeSearch();
    },
    /**
     * 参数树搜索
     */
    paramTreeSearch() {
      paramTreeSearch();
    },
    /**
     * 函数树搜索
     */
    functionTreeSearch() {
      functionTreeSearch();
    },
    /**
     * SQL草稿树搜索
     */
    draftTreeSearch() {
      draftTreeSearch();
    },
    /**
     * sql格式化
     */
    sqlFormat() {
      sqlFormat(this.$refs.tree_left.query.dataSource);
    },
    /**
     * 查找和替换
     * @param type 1替换 2查找
     */
    findAndReplace(type) {
      findAndReplace(type);
    },
    changeSize(type) {
      var thisEle = $(".CodeMirror").css("font-size");
      var textFontSize = parseFloat(thisEle, 10);
      var unit = thisEle.slice(-2); //获取单位
      if (type === 1) {
        textFontSize += 2;
        $(".CodeMirror").css("font-size", textFontSize + unit);
      }
      if (type === 2) {
        textFontSize -= 2;
        $(".CodeMirror").css("font-size", textFontSize + unit);
      }
    },
    /**
     * 转大小写
     * @param type 1大写2小写
     */
    caseTransformation(type) {
      caseTransformation(type);
    },
    /**
     * 注释选中行
     */
    selectSqlNotes() {
      selectSqlNotes();
    },
    /**
     * 取消注释
     */
    selectSqlCancelNotes() {
      selectSqlCancelNotes();
    },
    /**
     * 标记选中行
     */
    bjSqlNotes() {
      bjSqlNotes();
    },
    /**
     * 获取保存的对象
     * @returns {{arr: *[], flag: (jQuery|string|undefined|*), InfoFlag: jQuery, outColumn: jQuery, flag2: (jQuery|string|undefined), sql: *}}
     */
    getSaveInfo() {
      if (this.callType != "editorModel" && this.callType != "graphModel") {
        return;
      }
      // 大亚湾模型不用运行获取操作参数 start
      // if (!this.isAllExecute) {
      //   return;
      // }
      // 如果当前执行进度与要执行的sql数量相等 则证明数据已经全部拿到，允许保存
      // if (currentExecuteProgress != this.currentExecuteSQL.length) {
      //   return;
      // }
      // end
      if (getIsUpdate()) {
        //大亚湾个性化
        // this.$message({
        //   type: "info",
        //   message: "SQL已经被修改,请重新校验或执行!",
        // });
        // return;
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
      returnObj.locationUuid = this.tempId;
      returnObj.locationName = this.tempPath;
      return returnObj;
    },
    /**
     * 生成select语句
     */
    getSelectSql(menuId) {
      var strLevel =
        this.$refs.tree_left.activeName + this.$refs.tree_left.query.dataSource;
      getSelectSql(menuId, this.$refs.tree_left.query.dataSource, strLevel);
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
          this.$message({ type: "info", message: "请输入SQL语句!" });
          return;
        } else {
          if (!sqlObj.isOld) {
            this.sqlDraftDialogFormVisible = true;
          } else {
            if (sqlObj.sceneInstUuid == null && !this.isManager) {
              this.$message({
                type: "info",
                message: "非管理员无法修改公共文件夹的SQL草稿！",
              });
              return;
            }
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
      const treeNode = this.$refs.sqlDraftTree.selectTreeNode;
      let dataUserId = this.$store.getters.datauserid;
      if (treeNode.id == "0" || treeNode.id == dataUserId) {
        this.$message({ type: "info", message: "不可以保存至根文件夹！" });
        return;
      }
      const rootId = treeNode.path.split("/")[0];
      if (rootId == "0" && !this.isManager) {
        this.$message({
          type: "info",
          message: "非管理员无法保存SQL草稿至公共文件夹！",
        });
        return;
      }

      const sqlObj = getSaveSqlDraftObj(1);
      this.sqlDraftForm.draftSql = sqlObj.draftSql;
      this.sqlDraftForm.paramJson = sqlObj.paramJson;
      this.sqlDraftForm.parentUuid = treeNode.id;
      this.sqlDraftForm.sceneInstUuid =
        rootId == dataUserId ? dataUserId : null;
      this.sqlDraftForm.createUserId = dataUserId;
      saveSqlDraft(this.sqlDraftForm).then((result) => {
        if (result.code == 0) {
          this.$notify({
            title: "提示",
            message: "保存成功",
            type: "success",
            duration: 2000,
            position: "bottom-right",
          });
          this.sqlDraftFolderDialogFormVisible = false;
          // 手动销毁数据  多层dialog v-if失效 不知道为啥 没找到解决办法
          this.sqlDraftForm = {
            sqlDraftUuid: "",
            draftTitle: "",
            draftSql: "",
            paramJson: "",
            dataSource: "Postgre",
            parentUuid: "",
            sceneInstUuid: "",
            createUserId: "",
          };
          //重新刷新SOL草稿树
          initDraftTree();
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
    },
    /**
     *打开sql草稿列表
     */
    openSqlDraftList() {
      this.sqlDraftDialog = true;
    },
    ///关闭SOL草稿列表
    closesqlDraftList() {
      this.sqlDraftDialog = false;
      //重新刷新SOL草稿树
      initDraftTree();
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
          //重新刷新SOL草稿树
          initDraftTree();
        });
      } else {
        return;
      }
    },
    /**
     * 执行sql
     */
    executeSQL() {
      var _this = this;
      this.executeSQL2(function (obj) {
        // // 界面渲染完成之后开始执行sql,将sql送入调度
        // startExecuteSql(result.data)
        //     .then((result) => {
        //       this.executeLoading = false;
        //       this.loadText = "";
        //     })
        //     .catch((result) => {
        //       this.executeLoading = false;
        //     });
        $(".sql-editor-div").css("height", "50%");
        if (!obj.isExistParam) {
          // this.executeLoading = true
          _this.loadText = "正在获取SQL信息...";
          getExecuteTask(
            obj,
            _this.dataUserId,
            _this.sceneCode1,
            _this.$refs.tree_left.query.dataSource,
            _this.$refs.tree_left.activeName
          ).then((result) => {
            //在这如果报错就加一个新页签，如果不报错就显示我的
            if (result.data.isError) {
              _this.isExecuteError = false;
              // _this.errorMessage = result.data.message;
              _this.errorMessage = positionSqlError(result.data.message);
              _this.executeLoading = false;
            } else {
              _this.isExecuteError = true;
              _this.executeLoading = false;
              _this.loadText = "";
              lastSqlIndex = result.data.lastSqlIndex;
              _this.executeLoading = false;
              _this.currentExecuteSQL = result.data.executeSQLList;
              _this.maintableindex = result.data.lastSqlIndex || "";
              if (
                _this.currentExecuteSQL != null &&
                _this.currentExecuteSQL.length > 0 &&
                lastSqlIndex >= 0
              ) {
                for (var i = 0; i < _this.currentExecuteSQL.length; i++) {
                  if (_this.currentExecuteSQL[i].type === null) {
                    // 等于lastSqlIndex 标记主表，否则辅表
                    _this.currentExecuteSQL[i].type =
                      i === lastSqlIndex ? "1" : "2";
                  }
                }
              }
              _this.modelOriginalTable = result.data.tables;
              _this.createTreeNode = result.data.treeNodeInfo;
              _this.resultShow.push({ id: 1 });
              result.data.dataSource = _this.dataSource;
              result.data.resultDataMaxCount = parseInt(
                _this.resultDataMaxCount
              );
              // if (executeflag === true) {
              //   // 界面渲染完成之后开始执行sql,将sql送入调度
              // 显示放大按钮
              _this.$refs.maxSize.style.display = "block";
              startExecuteSql(result.data)
                .then((result) => {
                  _this.executeLoading = false;
                  _this.loadText = "";
                })
                .catch((result) => {
                  _this.executeLoading = false;
                });
              // } else {
              //   setIsUpdate(false);
              //   _this.$emit("getSqlObj");
              // }
            }
          });
        } else {
          _this.openParamDraw(obj);
        }
      });
    },
    /**
     * 执行sql
     */
    executeSQL2(callback) {
      if (this.tempId === "") {
        this.$message({ type: "info", message: "请选择SQL执行保存路径!" });
        this.modelResultSavePathDialog = true;
        return;
      }
      const result = getSql();
      if (result.sql === "") {
        this.$message({ type: "info", message: "请输入SQL!" });
        return;
      }
      this.isAllExecute = result.isAllExecute;
      this.loadText = "正在检验SQL是否符合语法规范...";
      //大亚湾跳过校验
      // verifySql().then((result) => {
      this.executeLoading = false;
      this.loadText = "";
      //大亚湾跳过校验
      // if (!result.data.verify) {
      //   this.$message({
      //     type: "info",
      //     message: "SQL不符合语法规范，请重新输入",
      //   });
      //   return;
      // }
      this.resultShow = []; // 清空数据展示对象
      isAllExecuteSuccess = false;
      currentExecuteProgress = 0;
      this.currentExecuteSQL = [];
      lastResultColumn = [];
      const obj = executeSQL();
      obj.businessField = "sqleditor";
      obj.modelResultSavePathId = this.modelResultSavePathId;
      obj.pushUuid = this.pushUuid;
      obj.modelType = "SQL";
      this.executeSqlViewData = obj.sqls;
      callback(obj);
      // });
    },
    /**
     * 打开参数渲染窗体
     */
    openParamDraw(data) {
      const timestamp = new Date().getTime();
      this.paramDrawUuid = timestamp;
      this.dialogFormVisible = true;
      this.paramDrawLoading = true;
      this.executeData = data;
    },
    /**
     * 获取替换参数后的sql  直接直接
     */
    replaceNodeParam() {
      // var obj = replaceNodeParam(this.paramDrawUuid, 'sqlEditor')
      var obj = this.$refs.paramDrawRefNew.replaceNodeParam(this.paramDrawUuid);
      if (!obj.verify) {
        this.$message({ type: "info", message: obj.message });
        return;
      }
      obj.sqls = obj.sql;
      obj.businessField = "sqleditor";
      obj.pushUuid = this.pushUuid;
      obj.modelType = "SQL";
      this.executeLoading = true;
      // 显示最大化按钮
      $(".max-size").show();
      getExecuteTask(
        obj,
        this.dataUserId,
        this.sceneCode1,
        this.dataSource
      ).then((result) => {
        if (result.data.isError) {
          this.$message({
            type: "error",
            message: result.data.message,
          });
          this.executeLoading = false;
        } else {
          this.executeLoading = false;
          this.loadText = "";
          lastSqlIndex = result.data.lastSqlIndex;
          this.executeLoading = false;
          this.currentExecuteSQL = result.data.executeSQLList;
          this.maintableindex = result.data.lastSqlIndex || "";
          this.modelOriginalTable = result.data.tables;
          this.createTreeNode = result.data.treeNodeInfo;
          this.resultShow.push({ id: 1 });
          // 界面渲染完成之后开始执行sql,将sql送入调度
          result.data.dataSource = this.dataSource;
          result.data.resultDataMaxCount = parseInt(this.resultDataMaxCount);
          startExecuteSql(result.data)
            .then((result) => {
              this.executeLoading = false;
              this.loadText = "";
            })
            .catch((result) => {
              this.executeLoading = false;
            });
        }
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
      this.dialogFormVisible = false;
    },
    maxOpen(type) {
      maxOpenOne();
      // console.log(this.$refs.childTabsRef,1461)
      for (let i in this.$refs.childTabsRef) {
        this.$refs.childTabsRef[i].zoomChangeTable(type);
      }
      // this.$refs.childTabsRef[0].zoomChangeTable(type);
    },
    handleClick(data, node, tree) {
      // this.tempPath = data.label
      // this.tempId = data.id
      // this.nodeType = data.type
      if (data.label == this.personalTitle && data.pid == "ROOT") {
        this.$message({
          type: "info",
          message: this.personalTitle + "跟目录没有操作权限！",
        });
        return;
      }
      if (data.disable) {
        this.$message({
          type: "info",
          message: "该文件夹没有操作权限，请联系系统管理员！",
        });
        return;
      }
    },
    handleCheck(data, check) {
      this.savePath = null;
      if (check) {
        this.savePath = data;
      }
    },
    cancelSave() {
      this.modelResultSavePathDialog = false;
      this.savePath == null;
    },
    modelResultSavePathDetermine() {
      if (this.savePath == null) {
        this.$message({
          type: "info",
          message: "请选择文件夹",
        });
        return;
      } else {
        this.tempPath = this.savePath.label;
        this.tempId = this.savePath.id;
        this.nodeType = this.savePath.type;
      }
      if (this.nodeType == "folder") {
        this.path = "当前执行SQL保存路径:" + this.tempPath;
        this.modelResultSavePathId = this.tempId;
        this.modelResultSavePathDialog = false;
        // 选择完成之后更新数据库
        let data = {};
        if (this.defaultSqlLocation == null) {
          data.sqlLocationId = this.tempId;
          data.sqlLocationName = this.tempPath;
        } else {
          data = this.defaultSqlLocation;
          data.sqlLocationId = this.tempId;
          data.sqlLocationName = this.tempPath;
        }
        saveSqlEditorExecuteDefaultPath(data).then((result) => {});
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
        this.$message({ type: "info", message: "请输入SQL!" });
        return;
      }
      this.isAllExecute = result.isAllExecute;
      this.executeLoading = true;
      this.loadText = "正在校验sql是否符合语法规范...";
      //大亚湾跳过校验
      // verifySql(this.dataSource).then((verSqlResult) => {
      this.executeLoading = false;
      //大亚湾跳过校验
      // if (!verSqlResult.data.verify) {
      //   this.$message({
      //     type: "info",
      //     message: "SQL不符合语法规范，请重新输入",
      //   });
      //   return;
      // }
      this.resultShow = []; // 清空数据展示对象
      $(".max-size").hide();
      isAllExecuteSuccess = false;
      currentExecuteProgress = 0;
      this.currentExecuteSQL = [];
      lastResultColumn = [];
      const data = {
        sql: result.sql,
        dataSource: this.$refs.tree_left.query.dataSource,
        treeType: this.$refs.tree_left.activeName,
      };
      this.executeLoading = true;
      this.loadText = "正在获取SQL列...";
      getColumnSqlInfo(data)
        .then((resp) => {
          console.log(resp.code);
          if (resp.code == 0 || resp.code == 20000) {
            // 修改执行成功状态
            isAllExecuteSuccess = true;
            lastResultColumn = resp.data.columnName;
            lastResultColumnType = resp.data.columnType;
            setIsUpdate(false);
            this.$emit("getSqlObj");
            this.executeLoading = false;
            this.loadText = "";
            this.$message({ type: "success", message: "SQL校验通过" });
          } else {
            this.executeLoading = false;
            this.loadText = "";
            var message = positionSqlError(resp.msg);
            this.$message({ type: "error", message: message });
            // positionSqlError('SQL校验失败,错误信息:TODO : pos 10, line 1, column 7, token LITERAL_ALIAS "id"')
          }
        })
        .catch((result) => {
          this.executeLoading = false;
          this.loadText = "";
        });
      // });
    },
    /**
     * 获取sql编辑器里的slq是否被修改
     * @returns {boolean}
     */
    getSQLIsUpdate() {
      return getIsUpdate();
    },
    /**
     * 接口：获取SQL编辑器节点的信息（图形化工具SQL编辑器节点专属方法                                     ）
     */
    async saveSqlInfo() {
      return await getGraphSaveInfo(this.dataSource);
    },
    /**
     * 接口：获取SQL的验证结果
     */
    // async getVerifySqlResult() {
    //大亚湾跳过校验
    //   return await verifySql();
    // },
    /**
     * 查看表关联信息
     */
    selectTableRelInfo(tableMenu) {
      var nodes = getZtreeSelectNode();
      this.selectTableRelInfoTableId = nodes[0].id;
      this.selectTableRelInfoDialog = true;
      hideRMenu(tableMenu);
    },
    /**
     * 查看表信息
     */
    selectTableInfo(tableMenu) {
      /* var nodes = getZtreeSelectNode();
      this.selectTableInfoTableId = nodes[0].id; */
      this.selectTableInfoDialog = true;

      this.tableDetailsDataSource = this.$refs.tree_left.query.dataSource;

      hideRMenu(tableMenu);
    },
    nodeContextmenuSQLEditor(data) {
      this.detailsTableMetaUuid = data.id;
    },
    open() {
      this.drawer = true;
    },
    handleClose() {
      this.drawer = false;
    },
  },
};
</script>
<style scoped>
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
  /*width: 69.6732%;*/
  width: 81%;
  position: relative;
  padding: 0;
  overflow: hidden;
}

.app-container {
  /* height: 100%!important; */
  position: relative;
}

#container {
  width: 100%;
  height: 100%;
  background: #f4f6f9
    linear-gradient(134deg, #fefeff 0%, #f3f0ff 33%, #ebf5fd 70%, #f6f9ff 100%);
  border-radius: 15px;
  overflow: hidden;
}

.row-bg {
  padding: 8px 0 8px 5px;
  background-color: rgb(224, 230, 237);
}

#sidebar {
  width: 28px;
  height: 100%;
  margin: 0;
  display: inline-block;
  position: absolute;
  top: -2px;
  left: -1px;
  border-radius: 15px 0 0 15px;
  text-align: center;
  z-index: 50;
  background: #f7f7f7;
  border-right: 1px solid rgb(206, 208, 212);
  overflow: hidden;
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

/*#sql {*/
/*width: 100%;*/
/*height: 320px;*/
/*}*/

.table-view {
  overflow-x: auto;
}

#vertical {
  position: absolute;
  left: 18.4%;
  height: 100%;
  width: 8px;
  /* overflow: hidden; */
  cursor: w-resize;
  z-index: 200;
  top: 0;
}
#vertical i {
  position: relative;
  top: 50%;
  left: -8px;
  font-size: 20px;
  transform: rotate(90deg);
}
.el-aside {
  /* margin-bottom: 10px; */
}

#horizontal {
  position: absolute;
  top: 70%;
  right: 0;
  /* width: 100vh; */
  width: 100%;
  height: 8px;
  cursor: s-resize;
  z-index: 150;
}

.errorHighlight {
  background-color: #f99999;
}

.successHighlight {
  background-color: transparent !important;
}
>>> .CodeMirror-hints {
  z-index: 999999999;
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
  width: 14px;
  height: 30px;
  position: absolute;
  right: 30px;
  top: 0;
  display: none;
  z-index: 201;
}

.sql-editor-div {
  padding: 0px;
  width: 100%;
  height: 100%;
}

.data-show {
  width: 100%;
  height: 100%;
  background: #fff;
}

.left-part {
  overflow-x: hidden;
  overflow-y: auto;
  /* width: 14.66666667%; */
  width: 18%;
  /*width: 29.6732%;*/
  float: left;
  height: 100%;
  margin-left: 0.5%;
  box-shadow: 15px 0 15px 0 #3f444d12;
  position: relative;
  z-index: 20;
}

.left-dataTree,
.left-paramTree,
.left-sqlFunTree,
.left-draftTree {
  /*width: 85%;*/
  margin-left: 30px;
}
div.rightMenu {
  position: fixed;
  visibility: hidden;
  top: 0;
  padding: 5px;
  background-color: #fff;
  text-align: left;
  width: 150px;
  z-index: 800;
  font-size: 12px;
  border: 1px solid #ccc;
}
div.rightMenu ul li {
  cursor: pointer;
  padding: 5px;
}
div.rightMenu ul li:hover {
  background: rgb(237, 241, 245);
}
>>> .cm-keyword {
  color: #0000c6;
  font-weight: bold;
}
>>> .cm-atom {
  color: #0000c6;
  font-weight: bold;
}
>>> .el-input {
  width: 95%;
}
#dataSearch {
  margin: 5px 0 10px 0;
}

.modelParamsDia >>> .el-dialog {
  min-width: 850px;
}
.tableInfo >>> .el-dialog {
  margin-top: 5vh !important;
}
>>> .errorHighlight {
  background: rgba(244, 38, 12, 0.5);
  color: #fff;
}
.chooseDataSource {
  left: 55px;
  display: inline-block;
  position: relative;
}
.content-box {
  position: relative;
  overflow-y: hidden;
}
.list-side {
  margin-left: 10px;
}
.el-dialog-div {
  height: 80vh;
  overflow-x: hidden;
}
.pointOutBox {
  position: absolute;
  right: 10px;
  display: inline-block;
  margin-top: 10px;
}
.pointOutTitle {
  position: absolute;
  right: 0;
  width: 900px;
  height: 250px;
  z-index: 20;
  overflow: auto;
}
::v-deep .oper-btn span {
  display: inline-block !important;
}
::v-deep .CodeMirror-scroll {
  padding-top: 15px !important;
}
.hc-div{
  font-weight: bolder;
  width: 100px;
  margin-left: 10px;
  /*position: relative;*/
}
::v-deep .hc-input{
  /*width: calc(100% - 30px)!important;*/
  border: none!important;
  /*position: absolute;*/
  /*top:0;*/
  /*left:0;*/
}
</style>
