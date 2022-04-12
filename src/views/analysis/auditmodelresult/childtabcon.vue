<template>
  <!-- childTabCon.vue是子页签中内容的通用组件 aggrid -->
  <div class="itxst">
    <el-dialog title="查询条件设置" :visible.sync="dialogVisible" width="50%">
      <myQueryBuilder
        v-if="dialogVisible"
        ref="myquerybuilder"
        :columns="queryData"
        :data="queryJson"
        @queryconditionchangetable="queryConditionChangeTable"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="queryCondition">查 询</el-button>
      </span>
    </el-dialog>
    <el-row v-if="useType != 'graph' && ifopen != 0">
      <!--   v-if="(useType=='sqlEditor'||myFlag) && !chartSwitching"   -->
      <div
        class="el-btn-no-colorz"
        v-if="!chartSwitching && ifopen == 1"
        @click="switchDivStyle('chart')"
      >
        <span> <i class="el-icon-menu"></i> 仅表格 </span>
      </div>
      <div
        class="el-btn-no-colorz"
        v-if="chartSwitching && ifopen == 1"
        @click="switchDivStyle('table')"
      >
        <span> <i class="el-icon-s-data"></i> 配置图表 </span>
      </div>
      <div class="el-btn-no-colorz" v-if="isModelPreview" @click="saveResult()">
        <span>
          <i class="oper-btn save"></i>
        </span>
      </div>
      <div
        v-if="(useType == 'sqlEditor' || myFlag) && !chartSwitching"
        v-for="(item, index) in chartsResource.menuData"
        class="chartChange"
        :key="index"
      >
        <div class="item_div" v-for="(menu, i) in item.sub">
          <div
            :key="i"
            :style="{
              backgroundPosition:
                menu.bgPositionX + 'px ' + menu.bgPositionY + 'px',
              cursor: 'pointer',
            }"
            class="item_img item-bgimg-size"
            @drag="drag"
            @dragend="dragend(menu)"
            draggable="true"
          />
          <!--    @drag="drag" @dragend="dragend(menu)"      -->
        </div>
      </div>
    </el-row>
    <div ref="DragOn" class="drag-on">
      <div v-if="chartSwitching" class="drag-on-table textz">
        <div v-if="myFlag">
          <div
            align="right"
            :style="
              ifopen != 0 ? 'position: absolute;top: -29px;right: 0;' : ''
            "
          >
            <el-dropdown>
              <el-button
                type="primary"
                class="oper-btn allocation btn-width-md"
                :disabled="modelRunResultBtnIson.associatedBtn"
              ></el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="openProjectDialog"
                  >分配项目</el-dropdown-item
                >
                <el-dropdown-item @click.native="removeRelated()"
                  >移除分配项目</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
            <el-button
              :disabled="false"
              type="primary"
              @click="queryConditionSetting"
              class="oper-btn setting-detail btn-width-md"
              style="margin-left: 10px"
            />
            <el-button
              :disabled="false"
              type="primary"
              @click="reSet"
              class="oper-btn reset"
            />
            <el-button
              :disabled="modelRunResultBtnIson.exportBtn"
              type="primary"
              @click="exportExcel"
              class="oper-btn export"
            />
            <!-- addDetailRel('qwer1', '项目11') -->
            <el-button
              :disabled="false"
              type="primary"
              @click="toSubmitYc"
              class="oper-btn tjsh"
              >提交审核</el-button
            >
             <el-button
              :disabled="false"
              type="primary"
              @click="suspectsPutInStorage"
              class="oper-btn tjsh"
              >疑点入库</el-button
            >
          </div>
        </div>
        <ag-grid-vue
          v-if="isSee"
          v-loading="isLoading"
          style="height: calc(100% - 109px)"
          class="table ag-theme-balham"
          :column-defs="columnDefs"
          :row-data="computedRowData"
          rowMultiSelectWithClick="true"
          :enable-col-resize="true"
          :get-row-style="
            useType == 'modelRunResult' && this.modelUuid !== undefined
              ? this.renderTable
              : undefined
          "
          row-selection="multiple"
          @cellClicked="onCellClicked"
          @grid-ready="onGridReady"
          @rowSelected="rowChange"
          :defaultColDef="defaultColDef"
          :sideBar="true"
          :modules="modules"
        />

        <el-card v-if="!isSee" class="box-card" style="height: 100px">
          <div>{{ errorMessage }}</div>
        </el-card>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="pageQuery.pageNo"
          :limit.sync="pageQuery.pageSize"
          @pagination="initData(nowSql)"
        />
        <el-row>
          <el-col :span="22">
            <div v-if="modelResultPageIsSee">
              共
              <span class="paging-z" title="只显示前10000条数据">
                {{ computedRowData.length }} </span
              >条
            </div>
          </el-col>
          <el-col :span="2">
            <el-row v-if="modelResultButtonIsShow" style="display: flex">
              <downloadExcel
                :data="tableData"
                :fields="json_fields"
                :name="excelName"
                class="thechard-z"
                v-if="
                  this.preLength == this.myIndex + 1 &&
                  this.useType !== 'sqlEditor'
                "
              >
                <el-button
                  type="primary"
                  @click="modelResultExport"
                  class="oper-btn export"
                  title="导出"
                ></el-button>
              </downloadExcel>
            </el-row>
          </el-col>
        </el-row>
      </div>
      <grid-layout
        ref="gridlayout"
        :layout.sync="chartConfigs.layout"
        :col-num="12"
        :row-height="30"
        :is-draggable="true"
        :is-resizable="true"
        :responsive="true"
        :vertical-compact="true"
        :use-css-transforms="true"
        v-if="!chartSwitching"
      >
        <grid-item
          :key="chartConfigs.layout[0].i"
          :x="chartConfigs.layout[0].x"
          :y="chartConfigs.layout[0].y"
          :w="chartConfigs.layout[0].w"
          :h="chartConfigs.layout[0].h"
          :i="chartConfigs.layout[0].i"
          drag-allow-from=".drag-on-table"
          drag-ignore-from=".ag-theme-balham"
        >
          <!--  此下为表格  -->
          <div class="drag-on-table textz">
            <div
              :span="2"
              style="right: 50px; top: -44px; position: absolute; z-index: 1"
            >
              <el-row v-if="modelResultButtonIsShow" style="display: flex">
                <downloadExcel
                  :data="tableData"
                  :fields="json_fields"
                  :name="excelName"
                  class="thechard-z"
                  v-if="
                    this.preLength == this.myIndex + 1 &&
                    this.useType !== 'sqlEditor'
                  "
                >
                  <el-button
                    type="primary"
                    @click="modelResultExport"
                    class="oper-btn export"
                    title="导出"
                  ></el-button>
                </downloadExcel>
              </el-row>
            </div>
            <div v-if="myFlag">
              <el-row>
                <div
                  align="right"
                  :style="
                    ifopen != 0 ? 'position: absolute;top: -29px;right: 0;' : ''
                  "
                >
                  <el-col :span="14">
                    <el-input
                      :readonly="true"
                      value="设置查询条件后此处显示条件内容"
                      v-if="typeof nowSql == 'undefined'"
                    ></el-input>
                    <el-input
                      :readonly="true"
                      :value="nowSql"
                      v-if="typeof nowSql == 'undefined'"
                    ></el-input>
                  </el-col>
                  <el-col :span="10">
                    <el-dropdown>
                      <el-button
                        type="primary"
                        class="oper-btn allocation btn-width-md"
                        :disabled="modelRunResultBtnIson.associatedBtn"
                      />
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item @click.native="openProjectDialog"
                          >分配项目</el-dropdown-item
                        >
                        <el-dropdown-item @click.native="removeRelated()"
                          >移除分配项目</el-dropdown-item
                        >
                      </el-dropdown-menu>
                    </el-dropdown>
                    <el-button
                      type="primary"
                      @click="modelResultOpenDialog()"
                      class="oper-btn resultShare btn-width-md"
                      :disabled="modelRunResultBtnIson.resultShare"
                      style="margin-left: 10px"
                    />
                    <el-button
                      :disabled="false"
                      type="primary"
                      @click="queryConditionSetting"
                      class="oper-btn setting-detail btn-width-md"
                      style="margin-left: 10px; margin-top: 5px"
                    ></el-button>
                    <el-button
                      :disabled="false"
                      type="primary"
                      @click="reSet"
                      class="oper-btn reset"
                    ></el-button>
                    <el-button
                      :disabled="modelRunResultBtnIson.exportBtn"
                      type="primary"
                      @click="exportExcel"
                      class="oper-btn export"
                    ></el-button>
                    <!-- addDetailRel('qwer1', '项目11') -->
                    <el-button
                      :disabled="false"
                      type="primary"
                      @click="toSubmitYc"
                      class="oper-btn tjsh"
                      >提交审核</el-button
                    >
                    <el-button
                      :disabled="false"
                      type="primary"
                      @click="suspectsPutInStorage"
                      class="oper-btn tjsh"
                      >疑点入库</el-button
                    >
                  </el-col>
                </div>
              </el-row>
            </div>
            <!-- useType == 'modelRunResult' && this.modelUuid !== undefined
                  ? this.renderTable
                  : undefined -->
            <ag-grid-vue
              v-if="isSee"
              v-loading="isLoading"
              style="height: calc(100% - 109px)"
              class="table ag-theme-balham"
              :column-defs="computedColumnDefs"
              :rowData="computedRowData"
              rowMultiSelectWithClick="true"
              :enable-col-resize="true"
              :get-row-style="this.renderTableView"
              row-selection="multiple"
              @cellClicked="onCellClicked"
              @grid-ready="onGridReady"
              @rowSelected="rowChange"
              :default-col-def="defaultColDef"
              :sideBar="true"
              :modules="modules"
              :locale-text="localeText"
              :frameworkComponents="frc"
              :context="componentParent"
            />
            <!-- :sideBar="true"
            :modules="modules"-->
            <el-card v-if="!isSee" class="box-card" style="height: 100px">
              <div>{{ errorMessage }}</div>
            </el-card>
            <pagination
              v-show="total > 0"
              :total="total"
              :page.sync="pageQuery.pageNo"
              :limit.sync="pageQuery.pageSize"
              @pagination="initData(nowSql)"
            />
            <el-row>
              <el-col :span="24">
                <div v-if="modelResultPageIsSee">
                  共
                  <span class="paging-z" title="只显示前10000条数据">
                    {{ computedRowData.length }} </span
                  >条
                </div>
              </el-col>
            </el-row>
          </div>
        </grid-item>
        <grid-item
          v-for="(item, index) in chartConfigs.chart"
          :key="chartConfigs.layout[index + 1].i"
          v-if="chartConfigs.chart.length > 0"
          :x="chartConfigs.layout[index + 1].x"
          :y="chartConfigs.layout[index + 1].y"
          :w="chartConfigs.layout[index + 1].w"
          :h="chartConfigs.layout[index + 1].h"
          :i="chartConfigs.layout[index + 1].i"
        >
          <!--  此下为图表  -->
          <div
            :key="thechartdead"
            style="height: 100%; width: 100%; overflow: auto"
          >
            <div v-if="afterResult" style="height: 350px">
              <div>
                <img
                  src="./imgs/change.png"
                  v-if="useType == 'sqlEditor' || myFlag"
                  type="primary"
                  @click="openEditChartDialog(index)"
                  class="change-pos"
                  title="修改图表"
                />
                <img
                  src="./imgs/deletein.png"
                  v-if="useType == 'sqlEditor' || myFlag"
                  type="primary"
                  @click="deleteChart(index)"
                  class="delete-pos"
                  title="删除图表"
                />
              </div>
              <mtEditor
                v-loading="chartLoading"
                :key="index"
                ref="chart1"
                :data="result"
                :chart-config="item"
                :preview="true"
              ></mtEditor>
            </div>
          </div>
        </grid-item>
      </grid-layout>
    </div>
    <el-dialog
      v-if="modelDetailModelResultDialogIsShow"
      title="模型详细结果"
      :visible.sync="modelDetailModelResultDialogIsShow"
      width="80%"
      :fullscreen="true"
    >
      <childtabscopy
        ref="childTabsRef"
        :pre-value="currentExecuteSQL"
        use-type="sqlEditor"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="modelDetailModelResultDialogIsShow = false"
          >取 消</el-button
        >
        <el-button
          type="primary"
          @click="modelDetailModelResultDialogIsShow = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <el-dialog
      title="提示"
      :visible.sync="chartShowIsSee"
      width="90%"
      :fullscreen="true"
      :append-to-body="true"
    >
      <div v-if="chartShowIsSee">
        <mtEditor
          ref="chart"
          :data="result"
          :chart-config="nowChartJson"
          :key="chartPreview"
        ></mtEditor>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="chartShowIsSee = false">取 消</el-button>
        <el-button
          v-if="
            useType == 'sqlEditor' || useType == 'modelRunResult' ? true : false
          "
          type="primary"
          @click="updateChart"
          >保 存</el-button
        >
      </span>
    </el-dialog>
    <el-dialog
      title="请选择项目"
      :visible.sync="projectDialogIsSee"
      width="40%"
    >
      <userProject v-if="projectDialogIsSee" ref="userproject"></userProject>
      <span slot="footer" class="dialog-footer">
        <el-button @click="projectDialogIsSee = false">取 消</el-button>
        <el-button type="primary" @click="determineProject">确 定</el-button>
      </span>
    </el-dialog>
    <div
      class="globalDropDownBox"
      @mouseover="StopTime"
      @mouseleave="openModelDetailOld"
      v-show="globalDropDownBox"
      :style="{ top: globalDropTop, left: globalDropLeft }"
    >
      <li
        class="globalDDBli"
        v-for="item in modelDetailRelation"
        @click="modelDetailCetermine(item.relationObjectUuid)"
      >
        {{ item.modelDetailName }}
      </li>
    </div>
    <el-dialog
      title="提交审核"
      v-if="dialogVisibleSubmit"
      :visible.sync="dialogVisibleSubmit"
      :close-on-click-modal="false"
      width="80%"
    >
      <div>
        <flowItem2
          ref="flowItem2"
          :flowSet="flowSet"
          :flowItem="flowItem"
          :flow-param="flowParam"
          :columnDefs="columnDefs"
          :submitData="submitData"
          @closeModal="closeFlowItem"
          @delectData="delectData"
        ></flowItem2>
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
          @click="dialogVisibleSubmit = false"
          >关闭</el-button
        >
      </span>
    </el-dialog>
    <el-dialog
      title="请选择要分享的人员"
      :visible.sync="resultShareDialogIsSee"
      width="50%"
    >
      <personTree ref="orgPeopleTree"></personTree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resultShareDialogIsSee = false">取 消</el-button>
        <el-button type="primary" @click="modelResultShare">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="疑点入库" :visible.sync="suspectsVisible" width="80%">
      <div class="suspectstop">
        <div class="suspectsleft">
          <h3>疑点库主体信息</h3>
          <el-table
            ref="mainTable"
            :data="suspectsMainData"
            highlight-current-row
            @current-change="mainCurrentChange"
            style="width: 100%"
          >
            <el-table-column
              prop="name"
              label="字段名称"
              column-key="name"
              :filters="suspectsFilterlist1"
              :filter-method="suspectsfilterHandler1"
            >
            </el-table-column>
            <el-table-column
              prop="describe"
              label="描述"
              column-key="describe"
              :filters="suspectsFilterlist2"
              :filter-method="suspectsfilterHandler2"
            >
            </el-table-column>
            <el-table-column
              prop="dataType"
              label="数据类型"
              column-key="dataType"
              :filters="suspectsFilterlist3"
              :filter-method="suspectsfilterHandler3"
            >
            </el-table-column>
          </el-table>
        </div>
        <div class="suspectsright">
          <h3>疑点信息</h3>
          <el-table
            ref="secondaryTable"
            :data="suspectssecondaryData"
            style="width: 100%"
          >
            <el-table-column
              prop="columnName"
              label="字段名称"
              column-key="name"
              :filters="suspectsFilterlist4"
              :filter-method="suspectsfilterHandler4"
            >
            </el-table-column>
            <el-table-column
              prop="describe"
              label="描述"
              column-key="describe"
              :filters="suspectsFilterlist5"
              :filter-method="suspectsfilterHandler5"
            >
            </el-table-column>
            <el-table-column
              prop="columnType"
              label="数据类型"
              column-key="type"
              :filters="suspectsFilterlist6"
              :filter-method="suspectsfilterHandler6"
            >
            </el-table-column>
            <el-table-column label="">
              <template slot-scope="scope">
                <el-button
                  @click.native.prevent="
                    addRelevanceRow(scope.$index, scope.row)
                  "
                  size="mini"
                >
                 <span style="font-size:18px;"> + </span>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="suspectsmiddle">
        <div class="redprompt">*注：疑点信息中的字段与疑点库主体进行匹配</div>
        <div style="float: right">
          <el-button size="mini" type="primary" @click="autoMatch()"
            >按字段名自动匹配</el-button
          >
          <el-button size="mini" type="primary" @click="matchReset()"
            >重置</el-button
          >
        </div>
      </div>
      <div class="suspectsbottom">
        <el-table
          ref="mixTable"
          :data="suspectsRelevanceData"
          style="width: 100%"
        >
          <el-table-column prop="mastName" label="字段名称"> </el-table-column>
          <el-table-column prop="mainDescribe" label="描述"> </el-table-column>
          <el-table-column prop="mastDateType" label="数据类型"> </el-table-column>
          <el-table-column prop="slaveName" label="字段名称">
          </el-table-column>
          <el-table-column prop="secondaryDescribe" label="描述">
          </el-table-column>
          <el-table-column prop="slaveDateType" label="数据类型">
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="120">
            <template slot-scope="scope">
              <el-button
                @click.native.prevent="
                  deleteRelevanceRow(scope.$index, suspectsRelevanceData)
                "
                type="text"
                size="small"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="suspectsform">
        <el-form ref="suspectsform" :model="suspectsform">
          <el-form-item label="选择项目：">
            <el-select v-model="suspectsform.project" placeholder="请选择项目">
              <el-option
                v-for="(item, i) in projectlist"
                :key="'project' + i"
                :label="item.name"
                :value="item"
              ></el-option>
            </el-select>
          </el-form-item>
<!--          <el-form-item label="选择标签：">-->
<!--            <el-select v-model="suspectsform.tag" placeholder="请选择标签">-->
<!--              <el-option-->
<!--                v-for="(item, i) in taglist"-->
<!--                :key="'tag' + i"-->
<!--                :label="item.name"-->
<!--                :value="item.id"-->
<!--              ></el-option>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
          <!--标签树-->
          <el-form-item label="选择标签" prop="auditItemUuid">

            <el-col :span="15">
<!--              <el-input v-model="form.auditItemUuid" class="display" :disabled="true"/>-->
              <el-input v-model="suspectsform.tag" :disabled="true"/>
            </el-col>
            <el-button @click="showAuditItemTree" type="primary">选择</el-button>
          </el-form-item>
          <el-form-item label="选择方式：">
            <el-select v-model="suspectsform.way" placeholder="请选择方式">
              <el-option
                v-for="(item, i) in waylist"
                :key="'way' + i"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="suspectsVisible = false">取 消</el-button>
        <el-button type="primary" @click="getModelDataPush"
          >保 存</el-button
        >
      </span>
    </el-dialog>

    <el-dialog v-if="auditItemTree" :destroy-on-close="true" :close-on-click-modal="false" :append-to-body="true" :visible.sync="auditItemTree"
               title="请选择标签" width="80%">
      <el-tree :data="treedata" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
      <el-footer>
        <el-button @click="auditItemTree=false">取消</el-button>
        <el-button type="primary" @click="confirmtag">确定</el-button>
      </el-footer>
    </el-dialog>

  </div>
</template>
<script>
// eslint-disable-next-line no-unused-vars
import personTree from "../../../components/publicpersontree/index";
// import $ from 'jquery'
import { AgCell } from "../../../components/public/new-ag-grid/ag-cell";
// 引入aggrid及样式文件
import { AgGridVue } from "@ag-grid-community/vue";
import { AllModules } from "@ag-grid-enterprise/all-modules";
import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css";

import Pagination from "@/components/Pagination/index";
import JsonExcel from "vue-json-excel";
import childtabscopy from "@/views/analysis/auditmodelresult/childtabscopy";
import userProject from "@/views/base/userproject/index";
//标签树
import AuditItemTree from '@/views/analysis/auditmodel/auditItemtree'
import {
  handleDataSingleValue,
  handleDataManyValue,
} from "@/api/analysis/thresholdvalue";
import {
  selectTable,
  findSuspectsRelevanceData,
  selectByRunResultTableUUid,
  batchSaveResultDetailProjectRel,
  batchSaveResultDetailPersonRel,
  selectPrimaryKeyByTableName,
  removeResultDetailProjectRel,
  selectConditionShow,
  selectModel,
  findParamModelRelByModelUuid,
  replaceParam,
  batchCoverAddResultDetailProjectRel,
  addModelChartSetup,
  getModelChartSetup,
  updateModelChartSetup,
  deleteModelChartSetup,
  sendToOA,
  getByResultDetailIds,
} from "@/api/analysis/auditmodelresult";
import axios from "axios";
import VueAxios from "vue-axios";
import AV from "leancloud-storage";
import myQueryBuilder from "@/views/analysis/auditmodelresult/myquerybuilder";
import { string } from "jszip/lib/support";
import {
  startExecuteSql,
  getExecuteTask,
} from "@/api/analysis/sqleditor/sqleditor";
import { getTransMap } from "@/api/data/transCode.js";
import mtEditor from "ams-datamax";
// import "iview/dist/styles/iview.css";
import { addRunTaskAndRunTaskRel, uuid2 } from "@/api/analysis/auditmodel";
// 引入大屏图标
import chartsResource from "@MAX/data/chartsResource";
// 引入拖拽布局文件
import { GridLayout, GridItem } from "vue-grid-layout";
import { setDataSetToNode } from "ams-datamax/src/components/chartEdit/methods/commonMethods";
// 引入跨组件调用中转js
import chartAudit from "@/api/analysis/chartauditmodel";
let mouseXY = { x: null, y: null };
let DragPos = { x: null, y: null, w: 1, h: 1, i: null };
import { randomString4Len } from "@/api/analysis/common";
import flowItem2 from "ams-clue-vue/src/components/tcFlowWork/submitWork/flowItem2";

//引入时间格式化方法
import dayjs from "dayjs";
export default {
  name: "childTabCon",
  // 注册draggable组件
  components: {
    AgGridVue,
    Pagination,
    myQueryBuilder,
    childtabscopy,
    //标签树
    AuditItemTree,
    downloadExcel: JsonExcel,
    mtEditor,
    userProject,
    GridLayout,
    GridItem,
    flowItem2,
    personTree,
  },

  computed: {
    computedRowData() {
      return this.rotateConfig != null ? this.rotateRowData : this.rowData;
    },
    computedColumnDefs() {
      return this.rotateConfig != null
        ? this.rotateColumnDefs
        : this.columnDefs;
    },
  },
  watch: {
    modelDetailModelResultDialogIsShow(value) {
      this.$nextTick(function () {
        if (value) {
          this.initWebSocket();
        }
      });
    },
    nowChartJson() {
      this.chartPreview = !this.chartPreview;
    },
  },
  /**
   * 模型运行结果使用变量：nowtable：表示模型结果表对象   modelUuid：根据modelUUid进行表格渲染，只有主表用渲染  useType=modelRunResult 表示是模型运行结果所用
   * sql编辑器模型结果使用变量：useType=sqlEditor 表示是sql编辑器模型结果所用  prePersonalVal：每一个prePersonalVal对应一个childtabcon组件，后续会触发父组件chidltabs中的loadTableData方法来根据prePersonalVal进行aggrid数据的展现
   */
  props: [
    "nowtable", // {"id":"xxx","name":null,"sql":"SELECT ID FROM WAREHOUSE.RDM_x","type":null,"sqlParam":null,"customParam":null,"resultName":null,"process":0,"state":null}
    "modelUuid",
    "modelTitle",
    "useType",
    "prePersonalVal", // {"id":"xxx","name":null,"sql":"SELECT ID FROM WAREHOUSE.RDM_x","type":null,"sqlParam":null,"customParam":null,"resultName":null,"process":0,"state":null}
    "resultSpiltObjects",
    "modelId",
    "preLength",
    "myIndex",
    "chartModelUuid",
    "settingInfo",
    "isModelPreview",
  ],
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      treedata: [{
        label: '一级 1',
        children: [{
          label: '二级 1-1',
          children: [{
            label: '三级 1-1-1'
          }]
        }]
      }, {
        label: '一级 2',
        children: [{
          label: '二级 2-1',
          children: [{
            label: '三级 2-1-1'
          }]
        }, {
          label: '二级 2-2',
          children: [{
            label: '三级 2-2-1'
          }]
        }]
      },],
      treetagvalue:'',
        modelcolumnlist:[],
      modelresultlist:[],
      //打开疑点入库
      suspectsVisible: false,
      //疑点主表
      suspectsMainData: [],
      suspectsFilterlist1: [
        { value: "字段名1", text: "字段名1" },
        { value: "字段名2", text: "字段名2" },
      ],
      suspectsFilterlist2: [
        { value: "描述1", text: "描述1" },
        { value: "描述2", text: "描述2" },
      ],
      suspectsFilterlist3: [
        { value: "数据类型1", text: "数据类型1" },
        { value: "数据类型2", text: "数据类型2" },
      ],
      suspectsFilterlist4: [
        { value: "字段名1", text: "字段名1" },
        { value: "字段名2", text: "字段名2" },
      ],
      suspectsFilterlist5: [
        { value: "描述1", text: "描述1" },
        { value: "描述2", text: "描述2" },
      ],
      suspectsFilterlist6: [
        { value: "数据类型1", text: "数据类型1" },
        { value: "数据类型2", text: "数据类型2" },
      ],
      //疑点结果表
      suspectssecondaryData: [],
      //关联关系
      suspectsRelevanceData: [],
      //关联相关表单
      suspectsform: {
        project: "",
        tag: "",
        tagid: "",
        way: "",
      },
      //
      projectlist: [],
      taglist: [
        { name: "标签1", id: "标签1" },
        { name: "标签2", id: "标签2" },
        { name: "标签3", id: "标签3" },
      ],
      waylist: [
        { name: "全覆盖", id: "0" },
        { name: "追加", id: "1" },
      ],
      //是否显示标签树
      auditItemTree: false,
      maincurrentRow:null,
      resultShareDialogIsSee: false,
      //工作流相关
      submitData: {
        versionUuid: "tlLuwUhC",
        busTableName: "", //表名
        busDatabaseName: "warehouse", //数据库名
        busDatabaseType: "", //
        status: "1", //预警数据状态
        busdatas: [],
      },
      // 判断是否走工作流
      // yancheng: true,
      flowParam: 0,
      multipleSelection: [],
      applyInfo: {},
      dialogVisibleSubmit: false,
      flowSet: {
        opinionList: false,
        opinion: false,
        nextStep: true,
        isSecond: false,
      },
      flowItem: {
        //动态赋值
        wftype: "clueflow",
        applyUuid: "",
        detailUuids: "",
        applyTitle: "",
        workEffortId: "",
        appDataUuid: "",
        versionUuid: "",
        isSecond: false,
        temp1: "",
      },

      //其他
      chartPreview: true,
      dialogVisible: false,
      // 定义ag-grid列
      columnDefs: [],
      gridOptions: {},
      // aggrid需要显示的数据
      rowData: [],
      rotateRowData: [], //行转列的数据
      rotateColumnDefs: [], //行转列的列头
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
      },
      total: 0,
      imgBaseCode: "",
      myFlag: false, // 用来判断主表界面有按钮，辅表界面没有按钮，为true是主表，为false是辅表
      selectRows: [], //用于存放多选框选中的数据
      detailTable: [], //存放关联详细表
      dataArray: [], // 保存当前表格中的数据
      queryData: [], // 保存列信息，用来传给子组件(queryBuilder组件)
      queryJson: {}, // 用来储存由子组件传过来的 queryBuilder 的 Json数据
      primaryKey: "", // 存放模型运行结果主键
      isLoading: true, //给agrrid加遮罩
      nextValue: [], // 存放模型结果后传进来的值
      modelResultData: [], // 用来存放模型结果数据
      modelResultColumnNames: [], // 用来存放模型结果的列名
      total1: null, // 模型结果前台分页的total属性
      isSee: true, // 当输入sql错误和结果集为0的时候不显示aggrid表格
      errorMessage: "", // 存放模型结果错误消息
      modelResultPageIsSee: false, // 模型结果分页是否可见
      modelResultButtonIsShow: false, // 模型结果按钮是否可见
      modelDetailRelation: [], // 存放模型详细关联表
      modelOutputColumn: [], // 存放模型结果输出列
      modelDetailButtonIsShow: false, // 模型详细关联按钮是否可见
      modelDetailDialogIsShow: false, // 点击模型详细关联按钮后弹出的Dialog是否可见
      options: [], //存放模型详细关联dialog中下拉框的值
      value: "", //模型详细关联dialog中下拉框选中的值
      tableData: [], // 存放导出的数据（sql编辑器模型结果界面）
      excelName: "", // 导出后excle的名称（sql编辑器模型结果界面）
      json_fields: {}, // 导出表的列名（sql编辑器模型结果界面）
      modelDetailModelResultDialogIsShow: false, //点击模型详细dialog确定按钮后执行显示模型详细结果弹窗是否可见
      currentExecuteSQL: [], //模型详细关联dialog中点击确定按钮后根据sql返回的预先加载值，用于判断有几个页签
      webSocket: null, //websocket对象
      dataCoding: {}, //存储返回的数据转码对象
      nowSql: "undefined", //存储当前querybuilder中的sql
      modelRunResultBtnIson: {
        exportBtn: false,
        chartDisplayBtn: false,
        associatedBtn: true,
        resultShare: true,
        disassociateBtn: false,
        modelDetailAssBtn: true,
      },
      modelThresholdValuesTabView: [], // 模型点击运行表格渲染规则
      dynamicSelect: [], //实时存储多选框勾选中的数据
      chartShowIsSee: false,
      result: {}, //给myeditor传的数据
      chartIndex: 0, //修改操作的下标
      nowChartJson: undefined, //存储当前正在显示的图表的json
      allChartJson: [], //存储当前正在显示的图表的json
      modelChartSetups: [], //用于存储添加的多个图标，用于图表返显功能
      chartConfigs: {
        chart: [],
        layout: [{ x: 0, y: 0, w: 12, h: 12, i: "0" }],
      }, //用于存储当前模型的图表config   （myeditor组件的chart-config属性）chartConfigs
      afterResult: false, //等result数据赋值完以后再初始化返显的charts组件
      chartLoading: true, //图表加载的loading
      afterAddChartsWithNoConfigure: false,
      isHaveCharts: false, //判断该模型是否有图表
      projectDialogIsSee: false, //用来控制项目dialog显示
      chartSwitching: false, //控制表格与图表切换
      modelObj: {}, //查询当前模型结果对应的的model对象
      rowIndex: "", //存储点击表格的行数
      globalDropDownBox: false, //移入显示下拉框
      globalDropTop: 0,
      globalDropLeft: 0,
      timeOut: setTimeout,
      chartsResource: chartsResource, // 图标
      opNode: {},
      // 拖拽组件
      dragChart: false,
      dragIndex: 1,
      // 强制刷新
      thechartdead: true,
      // 高度显示
      listContainer: 700,
      // height123: document.getElementById("dataShow"),
      ifopen: 0,
      defaultColDef: {
        resizable: true,
        enableValue: true,
        enableRowGroup: true,
        enablePivot: true,
        sortable: true,
        filter: true,
        floatingFilter: true, //列头过滤器 启动
      },
      sideBar: {
        toolPanels: [
          {
            id: "columns",
            labelDefault: "Columns",
            labelKey: "columns",
            iconKey: "columns",
            toolPanel: "agColumnsToolPanel",
          },
          {
            id: "filters",
            labelDefault: "Filters",
            labelKey: "filters",
            iconKey: "filter",
            toolPanel: "agFiltersToolPanel",
          },
        ],
        position: "right",
        defaultToolPanel: "filters",
      },
      modules: AllModules,
      localeText: {
        // for filter panel
        page: "页",
        more: "更多",
        to: "到",
        /* of: 'daOf', */
        next: "下一页",
        last: "最后",
        first: "第一",
        previous: "以前的",
        loadingOoo: "加载中...",
        // Row:"行",
        rowGroups: "行分组",
        // for set filter
        selectAll: "全部选择",
        searchOoo: "搜索...",
        blanks: "空",
        Column: "列",
        labels: "标签",
        // for number filter and text filter
        filterOoo: "过滤",
        applyFilter: "过滤中...",
        equals: "等于",
        notEqual: "不等于",
        // for number filter
        lessThan: "小于",
        greaterThan: "大于",
        lessThanOrEqual: "小于等于",
        greaterThanOrEqual: "大于等于",
        inRange: "在范围内",
        // for text filter
        contains: "包含",
        notContains: "不包含",
        startsWith: "开始",
        endsWith: "结束",
        // filter conditions
        andCondition: "并且",
        orCondition: "或者",
        numberFilter: "数字筛选器",
        textFilter: "文本筛选器",
        dateFilter: "时间筛选器",
        // the header of the default group column
        // group: '分组',
        // tool panel
        columns: "列",
        filters: "过滤器",
        rowGroupColumns: "行分组",
        rowGroupColumnsEmptyMessage: "拖拽设置行分组",
        valueColumns: "列值",
        pivotMode: "透视模式",
        groups: "行列组",
        values: "值",
        pivots: "列标签",
        valueColumnsEmptyMessage: "拖拽进行聚合",
        pivotColumnsEmptyMessage: "拖拽设置列标签",
        toolPanelButton: "工具按钮",
        // other
        noRowsToShow: "暂时没有要展示的数据",
        // enterprise menu
        pinColumn: "列位置调整",
        valueAggregation: "聚合值",
        autosizeThiscolumn: "自动调整此列大小",
        autosizeAllColumns: "自动调整所有列的大小",
        groupBy: "分组",
        ungroupBy: "取消分组",
        resetColumns: "重置列",
        expandAll: "展开所有",
        collapseAll: "关闭所有",
        toolPanel: "工具",
        export: "导出",
        csvExport: "CSV 导出",
        excelExport: "Excel 导出(.xlsx)",
        excelXmlExport: "Excel 导出(.xml)",
        // enterprise menu pinning
        PinColumn: "固定",
        pinLeft: "居左",
        pinRight: "居右",
        noPin: "默认",
        // enterprise menu aggregation and status bar
        sum: "合计",
        min: "最小值",
        max: "最大值",
        /* none: 'laNone', */
        count: "计数",
        average: "平均值",
        avg: "平均值",
        // standard menu
        copy: "复制",
        copyWithHeaders: "携表头复制",
        ctrlC: "ctrl-C",
        paste: "粘贴",
        ctrlV: "ctrl-V",
      },
      frc: { "ag-cell": AgCell },
      gridApi: null,
      gridColumnApi: null,
      componentParent: null,
      rotateConfig: null,
      rotateConfigs: [
        {
          /*  ,财报结构（趋势）分析 示例  */
          modelIds: [
            "fa2f16c00e335049a0088580362e15db",
            "3acc159b6110564da7698b460eab774f",
          ] /*  通过UUID匹配的的模型进行行列转置 */,
          mainField: "科目名称" /*  转置的主列 */,
          colNamesField: "期间值" /*  以此列值为转置后列头的列 */,
          titleDisplayRules: (thisTitle, colNamesFieldValue) => {
            /*  转置后的显示规则 */
            if (
              thisTitle == "占比" ||
              thisTitle == "环比" ||
              thisTitle == "同比"
            )
              return colNamesFieldValue + thisTitle;
            else if (thisTitle == "期末额") return colNamesFieldValue;
            else return thisTitle;
          },
        },
        {
          /*  ,财报结构（趋势）分析 示例  */
          modelIds: [
            "6f0d96ff5b633543eb59736592c92418",
          ] /*  通过UUID匹配的的模型进行行列转置 */,
          mainField: "指标名称,指标模块,计算公式" /*  转置的主列 */,
          colNamesField: "月份" /*  以此列值为转置后列头的列 */,
          titleDisplayRules: (thisTitle, colNamesFieldValue) => {
            /*  转置后的显示规则 */
            if (thisTitle == "计算值") return colNamesFieldValue;
            else return thisTitle;
          },
        },
      ],
    };
  },
  mounted() {
    if (this.$route.path == "/analysis/editormodelnew") {
      this.ifopen = 1;
    }
    if (this.$route.path == "/analysis/auditmodel") {
      this.ifopen = 2;
    }
    if (this.$route.path == "/analysis/boeauditmodel") {
      this.ifopen = 2;
    }
    this.getRenderTableData();
    this.chartReflexion();
    this.getSuspectsMainData();
    //this.getSuspectssecondaryData();
    this.getProjectlist();
    this.getTaglist();
    document.addEventListener(
      "dragover",
      function (e) {
        mouseXY.x = e.clientX;
        mouseXY.y = e.clientY;
      },
      false
    );
    // let height = document.getElementById("dataShow");
    // this.listContainer = height.offsetHeight;
    chartAudit.$on("chartAuditOn", (e) => {
      this.saveChartsAll();
    });
    this.componentParent = this;

    // let projectStatus = this.$route.query.projectStatus;
    // if ("1" == projectStatus) {
    //   this.yancheng = true;
    // }
  },
  created() {
    let _this = this;
    window.openModelDetailNew = _this.openModelDetailNew;
  },
  methods: {
    confirmtag(){
      this.suspectsform.tag =  this.treetagvalue.label
      this.suspectsform.tagid = this.treetagvalue.id
      this.auditItemTree = false
    },
    handleNodeClick(data) {
      console.log(data);
      this.treetagvalue = data
    },
    //打开疑点入库
    suspectsPutInStorage() {
      this.suspectsVisible = true;
    },
    //筛选
    suspectsfilterHandler1(value, row, column) {
      const property = column["property"];
      return row[property] === value;
    },
    suspectsfilterHandler2(value, row, column) {
      const property = column["property"];
      return row[property] === value;
    },
    suspectsfilterHandler3(value, row, column) {
      const property = column["property"];
      return row[property] === value;
    },
    suspectsfilterHandler4(value, row, column) {
      const property = column["property"];
      return row[property] === value;
    },
    suspectsfilterHandler5(value, row, column) {
      const property = column["property"];
      return row[property] === value;
    },
    suspectsfilterHandler6(value, row, column) {
      const property = column["property"];
      return row[property] === value;
    },
    //选择疑点主体信息
    mainCurrentChange(val){
      this.maincurrentRow = val
    },
    //选择疑点，添加疑点关联
    addRelevanceRow(ind, row) {
      for (let i = 0; i < this.suspectsRelevanceData.length; i++) {
        console.log(this.suspectsRelevanceData[i].mastName)
        console.log(this.maincurrentRow.name)
        if (this.suspectsRelevanceData[i].mastName == this.maincurrentRow.name) {
          this.$message({ message: "该字段疑点映射已存在", type: "warning" });
          return
        }
      }
      if(this.maincurrentRow==null){
        this.$message({ message: "请选择疑点库主体信息", type: "warning" });
        return
      }
      this.suspectsRelevanceData.push({
        mastName:this.maincurrentRow.name,
        mainDescribe:this.maincurrentRow.describe,
        mastDateType:this.maincurrentRow.dataType,
        slaveName:row.columnName,
        secondaryDescribe:row.describe,
        slaveDateType:row.columnType
      })
       this.$refs.mainTable.setCurrentRow();
    },
    //自动匹配
    autoMatch() {
      this.suspectsRelevanceData = [];
      for (let i = 0; i < this.suspectsMainData.length; i++) {
        let main = this.suspectsMainData[i];
        for (let j = 0; j < this.suspectssecondaryData.length; j++) {
          let secondary = this.suspectssecondaryData[j];
          if (secondary.columnName == main.name) {
            this.suspectsRelevanceData.push({
              mastName: main.name,
              mainDescribe: main.describe,
              mastDateType: main.dataType,
              slaveName: secondary.columnName,
              secondaryDescribe: secondary.describe,
              slaveDateType: secondary.columnType,
            });
          }
        }
      }
    },
    //重置
    matchReset() {
      this.suspectsRelevanceData = [];
    },
    //移除一条关联
    deleteRelevanceRow(index, rows) {
      rows.splice(index, 1);
    },
    clickBigTab() {
      let _this = this;
      window.openModelDetailNew = _this.openModelDetailNew;
    },
    switchDivStyle(type) {
      if (type === "table") {
        this.chartSwitching = false;
      } else if (type === "chart") {
        this.chartSwitching = true;
      }
    },
    rowChange() {
      var selectData = this.gridApi.getSelectedRows();
      this.multipleSelection = selectData;
      if (selectData.length == 0) {
        this.modelRunResultBtnIson.exportBtn = false;
        this.modelRunResultBtnIson.chartDisplayBtn = false;
        this.modelRunResultBtnIson.associatedBtn = true;
        this.modelRunResultBtnIson.resultShare = true;
        this.modelRunResultBtnIson.disassociateBtn = false;
        this.modelRunResultBtnIson.modelDetailAssBtn = true;
      } else if (selectData.length == 1) {
        this.modelRunResultBtnIson.exportBtn = false;
        this.modelRunResultBtnIson.chartDisplayBtn = false;
        this.modelRunResultBtnIson.associatedBtn = false;
        this.modelRunResultBtnIson.resultShare = false;
        this.modelRunResultBtnIson.disassociateBtn = false;
        this.modelRunResultBtnIson.modelDetailAssBtn = false;
      } else if (selectData.length > 1) {
        this.modelRunResultBtnIson.exportBtn = false;
        this.modelRunResultBtnIson.chartDisplayBtn = false;
        this.modelRunResultBtnIson.associatedBtn = false;
        this.modelRunResultBtnIson.resultShare = false;
        this.modelRunResultBtnIson.disassociateBtn = false;
        this.modelRunResultBtnIson.modelDetailAssBtn = true;
      }
    },

    getSuspectsMainData() {
      //debugger
      axios({
        method: "post",
        url: "/analysis/modelFixedDefinition/selectModel",
        responseType: "json"
      }).then((res) => {
        debugger
        this.suspectsMainData = res.data.data;
        //console.log(res);
      })
    },
    getProjectlist() {
      axios({
        method: "get",
        url: "/analysis/prjProjectController/getAllPrj",
        responseType: "json"
      }).then((res) => {
        let d = res.data.data;
        d.forEach((item) => {
          this.projectlist.push({
            name: item.prjName,
            value: item.prjProjectUuid
          })
        })
        //console.log(res);
      })
    },
    getTaglist() {
      axios({
        method: "get",
        url: "/analysis/modelFixedDefinition/getAllTag",
        responseType: "json"
      }).then((res) => {
        this.treedata = res.data.data
        console.log(res);
      })
    },
    getModelDataPush() {
      let data =  {
        suspectsRelevanceData: this.suspectsRelevanceData,
        modelId: this.modelId,
        modelTitle : this.modelTitle,
        project:this.suspectsform.project,
        tag:this.suspectsform.tag,
        tagid : this.suspectsform.tagid,
        way:this.suspectsform.way,
        modelcolumnlist:this.modelcolumnlist,
        modelresultlist:this.modelresultlist
      };
      if(this.suspectsform.way==null||this.suspectsform.way==""){
        this.$message({ message: "请选择推送方式", type: "warning" });
        return
      }
      axios({
        method: "post",
        url: "/analysis/modelFixedDefinition/pushModelResult",
        data: data, //传对象
        responseType: "json"
      }).then((res) => {
        if (res.data.code == 0){
          this.$message.success("保存成功!");
        }else{
          this.$message({ message: res.data.msg, type: "warning" });
          return
        }
        console.log(res);
        this.suspectsVisible = false;
      })
    },
    /**
     *显示审计事项树
     */
    showAuditItemTree() {
      this.auditItemTree = true
    },
    /**
     * 获取审计事项
     */
    getAuditItem() {
      let tree = this.$refs.auditItemTreeRef.getTree()
      let currentNode = tree.getCheckedNodes()[0]
      this.form.auditItemUuid = currentNode.id
      this.form.auditItemName = currentNode.label
      this.auditItemTree = false
    },
    /**
     * 导出方法
     */
    exportExcel() {
      // 选中行的ID集合
      const onlyUuids = [];
      // 获取选中的行
      const selectedRows = this.gridApi.getSelectedRows();
      // 获取选中行的id
      selectedRows.forEach((e) => onlyUuids.push(e.onlyuuid));
      axios({
        method: "post",
        url: "/analysis/RunResultTableController/exportRunResultMainTable",
        responseType: "blob",
        data: onlyUuids,
      }).then((res) => {
        const link = document.createElement("a");
        const blob = new Blob([res.data], { type: "application/vnd.ms-excel" });
        link.style.display = "none";
        link.href = URL.createObjectURL(blob);
        //模型运行结果表日期使用当前日期
        link.setAttribute(
          "download",
          this.modelTitle +
            "(" +
            dayjs(new Date()).format("YYYY年MM月DD日hhmmss") +
            ")" +
            ".xls"
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    },
    /**
     * 移除关联方法
     * resultDetailProjectRelId:  resultDetailProjectRel表的主键
     */
    removeRelated() {
      this.getValues();
      var onlyuuids = [];
      for (var i = 0; i < this.selectRows.length; i++) {
        onlyuuids.push(this.selectRows[i].onlyuuid);
      }
      var resultDetailProjectRelIds = onlyuuids.join(",");
      removeResultDetailProjectRel(resultDetailProjectRelIds).then((resp) => {
        if (resp.data == true) {
          this.$message({
            type: "success",
            message: "移除关联项目成功!",
          });
        } else {
          this.$message({
            type: "error",
            message: "移除关联项目失败!",
          });
        }
      });
    },
    openProjectDialog() {
      // 验证是否已经关联项目
      var selectData = this.gridApi.getSelectedRows();
      let paramslist = [];
      for (let i = 0; i < selectData.length; i++) {
        paramslist.push(selectData[i].onlyuuid);
      }
      // 查询该明细是否已经分配项目，如果未分配则打开分配窗口
      getByResultDetailIds(paramslist).then((resp) => {
        if (resp.data.length === 0) {
          // 打开分配窗口
          this.projectDialogIsSee = true;
        } else {
          this.$message({
            message: "模型结果已经关联项目，详细结果就不能再关联",
          });
        }
      });
    },
    /**
     * 选择项目后点击dialog的确定按钮触发
     */
    determineProject() {
      var projects = this.$refs.userproject.getSelectValue();
      if (projects.length === 0) {
        this.$message({
          message: "请选择要关联的项目",
        });
      } else if (projects.length === 1) {
        this.addDetailRel(projects[0].prjProjectUuid, projects[0].prjName);
        this.projectDialogIsSee = false;
      } else {
        this.$message({
          message: "只能关联一个项目",
        });
      }
    },
    /**
     * 关联项目
     */
    addDetailRel(projectId, projctName) {
      this.getValues();
      selectByRunResultTableUUid(this.nowtable.runResultTableUuid).then(
        (resp) => {
          this.detailTable = resp.data;
          var resultDetailProjectRels = [];
          if (resp.data.length == 0) {
            // 根据当前运行结果表查看运行结果详细与项目关联表里有没有值，如果没有值则直接关联
            selectPrimaryKeyByTableName().then((resp) => {
              this.primaryKey = resp.data;
              for (var i = 0; i < this.selectRows.length; i++) {
                var resultDetailProjectRel = {
                  resultDetailProjectRelId: "",
                  runResultTableUuid: this.nowtable.runResultTableUuid,
                  runTaskRelUuid: this.nowtable.runTaskRelUuid,
                  projectId: projectId,
                  resultDetailId:
                    this.selectRows[i][this.primaryKey.toLowerCase()],
                  projectName: projctName,
                };
                resultDetailProjectRels.push(resultDetailProjectRel);
              }
              batchSaveResultDetailProjectRel(resultDetailProjectRels).then(
                (resp) => {
                  if (resp.data == true) {
                    this.$message({
                      type: "success",
                      message: "关联项目成功!",
                    });
                  } else {
                    this.$message({
                      type: "error",
                      message: "关联项目失败!",
                    });
                  }
                }
              );
            });
          } else {
            // 根据当前运行结果表查看运行结果详细与项目关联表里有没有值，如果有值则要判断是否关联过该主键，如果添加过就不能重复关联
            var resultDetailProjectRels = [];
            var related = [];
            selectPrimaryKeyByTableName().then((resp) => {
              this.primaryKey = resp.data;
              for (var i = 0; i < this.selectRows.length; i++) {
                for (var j = 0; j < this.detailTable.length; j++) {
                  if (
                    this.selectRows[i][this.primaryKey.toLowerCase()] ==
                    this.detailTable[j].resultDetailId
                  ) {
                    related.push(
                      this.selectRows[i][this.primaryKey.toLowerCase()]
                    );
                  }
                }
              }
              if (related.length == 0) {
                for (var i = 0; i < this.selectRows.length; i++) {
                  var resultDetailProjectRel = {
                    resultDetailProjectRelId: "",
                    runResultTableUuid: this.nowtable.runResultTableUuid,
                    runTaskRelUuid: this.nowtable.runTaskRelUuid,
                    projectId: projectId,
                    resultDetailId:
                      this.selectRows[i][this.primaryKey.toLowerCase()],
                    projectName: projctName,
                  };
                  resultDetailProjectRels.push(resultDetailProjectRel);
                }
                batchSaveResultDetailProjectRel(resultDetailProjectRels).then(
                  (resp) => {
                    if (resp.data == true) {
                      this.$message({
                        type: "success",
                        message: "关联项目成功!",
                      });
                    } else {
                      this.$message({
                        type: "error",
                        message: "关联项目失败!",
                      });
                    }
                  }
                );
              } else {
                var resultDetailProjectRels1 = [];
                for (var i = 0; i < this.selectRows.length; i++) {
                  var resultDetailProjectRel = {
                    resultDetailProjectRelId: "",
                    runResultTableUuid: this.nowtable.runResultTableUuid,
                    runTaskRelUuid: this.nowtable.runTaskRelUuid,
                    projectId: projectId,
                    resultDetailId:
                      this.selectRows[i][this.primaryKey.toLowerCase()],
                    projectName: projctName,
                  };
                  resultDetailProjectRels1.push(resultDetailProjectRel);
                }
                batchCoverAddResultDetailProjectRel(
                  resultDetailProjectRels1
                ).then((resp) => {
                  if (resp.data == true) {
                    var str = "";
                    for (var i = 0; i < related.length; i++) {
                      if (i != related.length - 1) {
                        str += related[i] + " , ";
                      } else {
                        str += related[i];
                      }
                    }
                    this.$message({
                      type: "success",
                      message:
                        "关联成功！ 其中 " +
                        str +
                        " 为主键的结果以前关联的项目被覆盖",
                    });
                  } else {
                    this.$message({
                      type: "error",
                      message: "关联失败!",
                    });
                  }
                });
              }
            });
          }
        }
      );
    },
    // 获取选中的数据数组
    getValues() {
      // 获取选中的数据
      var selRows = this.gridApi.getSelectedRows();
      if (selRows.length == 0) {
        this.$message({ type: "info", message: "请选择后再进行关联!" });
      }
      this.selectRows = selRows;
    },
    // ag-grid创建完成后执行的事件
    onGridReady(params) {
      // 获取gridApi
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
      // this.gridApi.sizeColumnsToFit();
    },
    //自动宽度
    autoSizeAll(skipHeader) {
      // var allColumnIds = [];
      // this.gridColumnApi.getAllColumns().forEach(function (column) {
      //   allColumnIds.push(column.colId);
      // });
      // this.gridColumnApi.autoSizeColumns(allColumnIds, skipHeader);
    },
    initData(sql, nextValue, modelName) {
      this.result = {};
      if (this.useType == "modelRunResult") {
        this.isLoading = true;
        // 当当前表是主表的时候myFlag赋值为true
        if (this.nowtable.tableType == 1) {
          this.myFlag = true;
        } else {
          this.chartLoading = false;
        }
        var colNames = [];
        var col = [];
        var da = [];
        var renderColumns = []; //存储需要渲染的列名
        var renderObject = {}; //存储key-value格式对象，key为列名  value为这一列对应的模型阈值关联对象
        //2021年2月4日 16:35:28   新增给带详细的模型结果列增加超链接样式
        let modelResultDetailCol = [];
        if (this.modelObj.modelDetailRelation) {
          //循环模型详细关联
          for (let i = 0; i < this.modelObj.modelDetailRelation.length; i++) {
            //获取关联对象
            let modelDetailRelation = this.modelObj.modelDetailRelation[i];
            //循环模型关联详细配置
            for (
              let j = 0;
              j < modelDetailRelation.modelDetailConfig.length;
              j++
            ) {
              let modelDetailConfig = modelDetailRelation.modelDetailConfig[j];
              //确保数据不是undefined或null
              if (modelDetailConfig.resultColumn) {
                //添加到数据 用于下边列处理的时候 作为判断条件
                modelResultDetailCol.push(
                  modelDetailConfig.resultColumn.toUpperCase()
                );
              }
            }
          }
        }
        var modelThresholdValues = [];
        if (this.settingInfo != undefined) {
          modelThresholdValues.push(
            JSON.parse(this.settingInfo).thresholdValueRel
          );
        } else {
          modelThresholdValues = this.modelObj.modelThresholdValues;
        }
        //循环阈值对象  取出阈值对象里面的列名  用于下遍历处理的时候 作为判断条件
        if (this.modelUuid !== undefined) {
          for (var i = 0; i < modelThresholdValues.length; i++) {
            if (
              modelThresholdValues[i].thresholdValue.thresholdValueType == 2
            ) {
              if (
                renderColumns.indexOf(
                  modelThresholdValues[i].modelResultColumnName
                ) == -1
              ) {
                renderColumns.push(
                  modelThresholdValues[i].modelResultColumnName
                );
              }
              if (typeof modelThresholdValues[i].colorInfo === "string") {
                modelThresholdValues[i].colorInfo = JSON.parse(
                  modelThresholdValues[i].colorInfo
                );
              }
              renderObject[modelThresholdValues[i].modelResultColumnName] =
                modelThresholdValues[i];
            }
          }
        }
        this.pageQuery.condition = this.nowtable;
        if (typeof sql !== "string") {
          sql = "undefined";
        }
        findSuspectsRelevanceData(this.modelId).then(
            (resp) => {
              debugger
              let d = resp.data;
              d.forEach((item) => {
                this.suspectsRelevanceData.push({
                  mastName: item.mastName,
                  mastDateType: item.mastDateType,
                  slaveName: item.slaveName,
                  slaveDateType: item.slaveDateType,
                });
              })
        });

        selectTable(this.pageQuery, sql, this.resultSpiltObjects).then(
          (resp) => {
            // var modelThre
            var column = resp.data.records[0].columns;
            this.suspectssecondaryData = resp.data.records[0].columnInfo.columnList;
            console.log(resp.data.records[0].columns);
            var columnToUppercase = [];
            for (var i = 1; i < column.length; i++) {
              columnToUppercase.push(column[i].toUpperCase());
            }
            this.result.column = columnToUppercase;
            this.result.id = this.modelObj.modelUuid;
            this.result.name = this.modelObj.modelName;
            this.modelcolumnlist = resp.data.records[0].columns
            this.modelresultlist = resp.data.records[0].result
            var chartData = [];
            for (var i = 0; i < resp.data.records[0].result.length; i++) {
              var eachChartData = [];
              for (var j = 1; j < column.length; j++) {
                eachChartData.push(resp.data.records[0].result[i][column[j]]);
              }
              chartData.push(eachChartData);
            }
            this.result.data = chartData;
            var columnInfo = resp.data.records[0].columnInfo.columnList;
            var columnType = [];
            for (var i = 1; i < columnInfo.length; i++) {
              //number,varchar,time,float
              var type = "";
              if (
                columnInfo[i].columnType.toUpperCase().indexOf("VARCHAR") != -1
              ) {
                type = "varchar";
              } else if (
                columnInfo[i].columnType.toUpperCase().indexOf("NUMBER") !=
                  -1 ||
                columnInfo[i].columnType.toUpperCase().indexOf("INT") != -1
              ) {
                type = "number";
              } else if (
                columnInfo[i].columnType.toUpperCase().indexOf("TIMESTAMP") !=
                  -1 ||
                columnInfo[i].columnType.toUpperCase().indexOf("DATE") != -1
              ) {
                type = "time";
              } else if (
                columnInfo[i].columnType.toUpperCase().indexOf("FLOAT") != -1
              ) {
                type = "float";
              }
              columnType.push(type);
            }
            this.result.columnType = columnType;
            this.afterResult = true;
            if (resp.data.records[0].result.length == 0) {
              this.isLoading = false;
            }
            this.total = resp.data.total;
            this.dataArray = resp.data.records[0].result;
            var assArr = Object.assign([], resp.data.records[0].result);
            this.doRotating(assArr);
            this.queryData = resp.data.records[0].columnInfo;
            colNames = resp.data.records[0].columns;
            // 生成ag-grid列信息
            if (this.modelUuid != undefined) {
              var onlyFlag = false;
              if (this.settingInfo != undefined) {
                for (var i = 0; i < colNames.length; i++) {
                  var rowColom = {};
                  if (
                    renderColumns.indexOf(colNames[i].toUpperCase()) != -1 ||
                    modelResultDetailCol.indexOf(colNames[i].toUpperCase()) !=
                      -1
                  ) {
                    var thresholdValueRel =
                      renderObject[colNames[i].toUpperCase()];
                    if (onlyFlag == false) {
                      rowColom = {
                        headerName: colNames[i],
                        field: colNames[i],
                        params: { thresholdValueRel, modelResultDetailCol },
                        cellRenderer: "ag-cell",
                        checkboxSelection: true,
                      };
                      onlyFlag = true;
                    } else {
                      rowColom = {
                        headerName: colNames[i],
                        field: colNames[i],
                        params: { thresholdValueRel, modelResultDetailCol },
                        cellRenderer: "ag-cell",
                      };
                    }
                  } else {
                    if (onlyFlag == false) {
                      rowColom = {
                        headerName: colNames[i],
                        field: colNames[i],
                        checkboxSelection: true,
                      };
                      onlyFlag = true;
                    } else {
                      rowColom = {
                        headerName: colNames[i],
                        field: colNames[i],
                      };
                    }
                  }
                  col.push(rowColom);
                }
              } else {
                for (var i = 0; i < colNames.length; i++) {
                  loop: for (
                    var j = 0;
                    j < this.modelOutputColumn.length;
                    j++
                  ) {
                    if (
                      this.modelOutputColumn[j].outputColumnName
                        .replaceAll('"', "")
                        .toLowerCase() == colNames[i]
                    ) {
                      if (this.modelOutputColumn[j].isShow == 1) {
                        var rowColom = {};
                        if (
                          renderColumns.indexOf(colNames[i].toUpperCase()) !=
                            -1 ||
                          modelResultDetailCol.indexOf(
                            colNames[i].toUpperCase()
                          ) != -1
                        ) {
                          var thresholdValueRel =
                            renderObject[colNames[i].toUpperCase()];
                          if (onlyFlag == false) {
                            rowColom = {
                              headerName: this.modelOutputColumn[j].columnAlias,
                              field: colNames[i],
                              params: {
                                thresholdValueRel,
                                modelResultDetailCol,
                              },
                              cellRenderer: "ag-cell",
                              checkboxSelection: true,
                            };
                            onlyFlag = true;
                          } else {
                            rowColom = {
                              headerName: this.modelOutputColumn[j].columnAlias,
                              field: colNames[i],
                              params: {
                                thresholdValueRel,
                                modelResultDetailCol,
                              },
                              cellRenderer: "ag-cell",
                            };
                          }
                        } else {
                          if (onlyFlag == false) {
                            rowColom = {
                              headerName: this.modelOutputColumn[j].columnAlias,
                              field: colNames[i],
                              checkboxSelection: true,
                            };
                            onlyFlag = true;
                          } else {
                            rowColom = {
                              headerName: this.modelOutputColumn[j].columnAlias,
                              field: colNames[i],
                            };
                          }
                        }
                        col.push(rowColom);
                      }
                      break loop;
                    }
                  }
                }
              }
            } else {
              for (var i = 0; i < colNames.length; i++) {
                if (i == 0) {
                  var rowColom = {
                    headerName: colNames[i],
                    field: colNames[i],
                    checkboxSelection: true,
                  };
                } else {
                  var rowColom = {
                    headerName: colNames[i],
                    field: colNames[i],
                  };
                }
                col.push(rowColom);
              }
              this.isLoading = false;
            }
            if (this.modelUuid != undefined) {
              // 生成ag-frid表格数据
              for (var i = 0; i < resp.data.records[0].result.length; i++) {
                da.push(resp.data.records[0].result[i]);
              }
              for (var i = 0; i < da.length; i++) {
                for (var j = 0; j < colNames.length; j++) {
                  for (var k = 0; k < this.modelOutputColumn.length; k++) {
                    if (
                      this.modelOutputColumn[
                        k
                      ].outputColumnName.toLowerCase() == colNames[j]
                    ) {
                      if (this.modelOutputColumn[k].dataCoding != undefined) {
                        var a = da[i][colNames[j]];
                        da[i][colNames[j]] =
                          this.dataCoding[this.modelOutputColumn[k].dataCoding][
                            a
                          ];
                      }
                    }
                  }
                }
              }
            } else {
              // 生成ag-frid表格数据
              for (var i = 0; i < resp.data.records[0].result.length; i++) {
                da.push(resp.data.records[0].result[i]);
              }
            }
          }
        );
        // this.columnDefs = col;
        // this.rowData = da;
        // if (typeof this.gridApi !== "undefined" && this.gridApi !== null) {
        //   this.gridApi.closeToolPanel()
        // }
        let _this = this;
        setTimeout(function () {
          for (let i = 0; i < col.length; i++) {
            var colType0 = _this.result.columnType[i];
            colType0 = colType0 ? "" : colType0.toUpperCase();
            col[i].filter = "agMultiColumnFilter";
            col[i].filterParams = {
              filters: [
                {
                  filter: "agNumberColumnFilter",
                  display: "subMenu",
                },
                {
                  filter: "agTextColumnFilter",
                  display: "subMenu",
                },
                {
                  filter: "agDateColumnFilter",
                  display: "subMenu",
                },
              ],
            };
            // switch (colType0) {
            //   case "NUMBER":
            //   case "INT":
            //   case "INTEGER":
            //   case "FLOAT":
            //   case "DOUBLE":
            //     col[i].filter = "agNumberColumnFilter";
            //     break;
            //   case "DATE":
            //   case "TIMESTAMP":
            //     col[i].filter = "agDateColumnFilter";
            //     break;
            //   default:
            //     col[i].filter = "agTextColumnFilter";
            //     break;
            // }
          }
          _this.columnDefs = col;
          _this.rowData = da;
          if (typeof _this.gridApi !== "undefined" && _this.gridApi !== null) {
            _this.gridApi.closeToolPanel();
          }
        }, 500);
      } else if (this.useType == "sqlEditor") {
        this.getIntoModelResultDetail(nextValue);
      } else if (this.useType == "modelPreview") {
        // this.loading = true;
        this.nextValue = nextValue;
        var col = [];
        var rowData = [];
        var renderColumns = []; //存储需要渲染的列名
        var renderObject = {}; //存储key-value格式对象，key为列名  value为这一列对应的模型阈值关联对象
        var modelThresholdValues = [];
        var modelThresholdValuesTab = []; //阈值信息
        if (this.prePersonalVal.id == this.nextValue.executeSQL.id) {
          //executeSQL.state 0,待执行；1,执行中；2,已完成；3,失败；4,取消；
          if (this.nextValue.executeSQL.state == "2") {
            if (this.nextValue.executeSQL.type == "Select") {
              if (true) {
                this.modelResultButtonIsShow = true;
                this.modelResultPageIsSee = true;
                this.modelResultData = this.nextValue.result;
                this.result.column = this.nextValue.columnNames;
                var columnTypes1 = this.nextValue.columnTypes;
                var columnType = [];
                for (var i = 0; i < columnTypes1.length; i++) {
                  var type = "";
                  if (columnTypes1[i].toUpperCase().indexOf("VARCHAR") != -1) {
                    type = "varchar";
                  } else if (
                    columnTypes1[i].toUpperCase().indexOf("NUMBER") != -1 ||
                    columnTypes1[i].toUpperCase().indexOf("INT") != -1
                  ) {
                    type = "number";
                  } else if (
                    columnTypes1[i].toUpperCase().indexOf("TIMESTAMP") != -1 ||
                    columnTypes1[i].toUpperCase().indexOf("DATE") != -1
                  ) {
                    type = "time";
                  } else if (
                    columnTypes1[i].toUpperCase().indexOf("FLOAT") != -1
                  ) {
                    type = "float";
                  }
                  columnType.push(type);
                }
                var resultData = this.nextValue.result;
                var assResultData = Object.assign([], resultData);
                this.doRotating(assResultData);
                this.result.id = this.nextValue.modelUuid;
                this.result.name = modelName;
                this.result.columnType = columnType;
                var chartData = [];
                for (var i = 0; i < resultData.length; i++) {
                  var eachChartData = [];
                  for (var j = 0; j < this.nextValue.columnNames.length; j++) {
                    eachChartData.push(
                      resultData[i][this.nextValue.columnNames[j]]
                    );
                  }
                  chartData.push(eachChartData);
                }
                this.result.data = chartData;
                // this.rowData = this.modelResultData;
                this.modelResultColumnNames = this.nextValue.columnNames;
                selectModel(this.modelId).then((resp) => {
                  this.modelDetailRelation = resp.data.modelDetailRelation;
                  modelThresholdValuesTab = resp.data.modelThresholdValues;
                  // 表格渲染规则赋值
                  this.modelThresholdValuesTabView =
                    resp.data.modelThresholdValues;
                  //循环阈值对象  取出阈值对象里面的列名  用于下边遍历处理的时候 作为判断条件
                  if (this.preLength == this.myIndex + 1) {
                    for (var i = 0; i < modelThresholdValuesTab.length; i++) {
                      if (
                        modelThresholdValuesTab[i].thresholdValue
                          .thresholdValueType == 2
                      ) {
                        if (
                          renderColumns.indexOf(
                            modelThresholdValuesTab[i].modelResultColumnName
                          ) == -1
                        ) {
                          renderColumns.push(
                            modelThresholdValuesTab[i].modelResultColumnName
                          );
                        }
                        if (
                          typeof modelThresholdValuesTab[i].colorInfo ===
                          "string"
                        ) {
                          modelThresholdValuesTab[i].colorInfo = JSON.parse(
                            modelThresholdValuesTab[i].colorInfo
                          );
                        }
                        renderObject[
                          modelThresholdValuesTab[i].modelResultColumnName
                        ] = modelThresholdValuesTab[i];
                      }
                    }
                  }
                  var modelOutputColumn = resp.data.modelOutputColumn;
                  let modelResultDetailCol = [];
                  if (resp.data.modelDetailRelation) {
                    //循环模型详细关联
                    for (
                      let i = 0;
                      i < resp.data.modelDetailRelation.length;
                      i++
                    ) {
                      //获取关联对象
                      let modelDetailRelation =
                        resp.data.modelDetailRelation[i];
                      //循环模型关联详细配置
                      for (
                        let j = 0;
                        j < modelDetailRelation.modelDetailConfig.length;
                        j++
                      ) {
                        let modelDetailConfig =
                          modelDetailRelation.modelDetailConfig[j];
                        //确保数据不是undefined或null
                        if (modelDetailConfig.resultColumn) {
                          //添加到数据 用于下边列处理的时候 作为判断条件
                          modelResultDetailCol.push(
                            modelDetailConfig.resultColumn.toUpperCase()
                          );
                        }
                      }
                    }
                  }
                  var datacodes = [];
                  for (let i = 0; i < modelOutputColumn.length; i++) {
                    if (modelOutputColumn[i].dataCoding != undefined) {
                      datacodes.push(modelOutputColumn[i].dataCoding);
                    }
                  }
                  for (let j = 0; j < this.nextValue.columnNames.length; j++) {
                    let rowColom = {};
                    for (let n = 0; n < modelOutputColumn.length; n++) {
                      if (
                        // 此处逻辑：类似于oracle数据库字段增加了前后缀的\" 所以替换后再比较
                        modelOutputColumn[n].outputColumnName.replaceAll(
                          '"',
                          ""
                        ) == this.nextValue.columnNames[j]
                      ) {
                        if (modelOutputColumn[n].isShow == 1) {
                          if (
                            renderColumns.indexOf(
                              this.nextValue.columnNames[j].toUpperCase()
                            ) != -1 ||
                            modelResultDetailCol.indexOf(
                              this.nextValue.columnNames[j].toUpperCase()
                            ) != -1
                          ) {
                            var thresholdValueRel =
                              renderObject[
                                this.nextValue.columnNames[j].toUpperCase()
                              ];
                            rowColom = {
                              headerName: modelOutputColumn[n].columnAlias,
                              field: this.nextValue.columnNames[j],
                              params: {
                                thresholdValueRel,
                                modelResultDetailCol,
                              },
                              cellRenderer: "ag-cell",
                            };
                          } else {
                            rowColom = {
                              headerName: modelOutputColumn[n].columnAlias,
                              field: this.nextValue.columnNames[j],
                            };
                          }
                        }
                      }
                    }
                    if (rowColom.field != undefined) {
                      col.push(rowColom);
                    }
                  }
                  if (datacodes.length > 0) {
                    for (var k = 0; k < this.nextValue.result.length; k++) {
                      rowData.push(this.nextValue.result[k]);
                    }
                    getTransMap(datacodes.join(",")).then((resp) => {
                      var dataCoding = resp.data;
                      for (var i = 0; i < resultData.length; i++) {
                        for (
                          var j = 0;
                          j < this.nextValue.columnNames.length;
                          j++
                        ) {
                          for (var k = 0; k < modelOutputColumn.length; k++) {
                            if (
                              modelOutputColumn[k].outputColumnName.replaceAll(
                                '"',
                                ""
                              ) ==
                              this.nextValue.columnNames[j].replaceAll('"', "")
                            ) {
                              if (
                                modelOutputColumn[k].dataCoding != undefined
                              ) {
                                var a =
                                  rowData[i][this.nextValue.columnNames[j]];
                                rowData[i][this.nextValue.columnNames[j]] =
                                  dataCoding[modelOutputColumn[k].dataCoding][
                                    a
                                  ];
                              }
                            }
                          }
                        }
                      }
                      this.rowData = rowData;
                    });
                  } else {
                    for (var k = 0; k < this.nextValue.result.length; k++) {
                      rowData.push(this.nextValue.result[k]);
                    }
                    this.rowData = rowData;
                  }
                  for (let i = 0; i < col.length; i++) {
                    let colType0 = this.result.columnType[i];
                    // colType0 = colType0 ? "": colType0.toUpperCase();
                    // switch (colType0) {
                    //   case "NUMBER":
                    //   case "INT":
                    //   case "INTEGER":
                    //   case "FLOAT":
                    //   case "DOUBLE":
                    //   col[i].filter = 'agNumberColumnFilter'
                    //     break;
                    //   case "DATE":
                    //   case "TIMESTAMP":
                    //     col[i].filter = 'agDateColumnFilter'
                    //     break;
                    //   default:
                    //     col[i].filter = 'agTextColumnFilter'
                    //     break;
                    // }
                    colType0 = colType0 ? "" : colType0.toUpperCase();
                    col[i].filter = "agMultiColumnFilter";
                    col[i].filterParams = {
                      filters: [
                        {
                          filter: "agNumberColumnFilter",
                          display: "subMenu",
                        },
                        {
                          filter: "agTextColumnFilter",
                          display: "subMenu",
                        },
                        {
                          filter: "agDateColumnFilter",
                          display: "subMenu",
                        },
                      ],
                    };
                  }
                  this.columnDefs = col;
                  this.afterResult = true;
                  if (
                    typeof this.gridApi !== "undefined" &&
                    this.gridApi !== null
                  ) {
                    this.gridApi.closeToolPanel();
                  }
                });
              }
            } else {
              this.isSee = false;
              this.modelResultPageIsSee = false;
              this.modelResultButtonIsShow = false;
              this.errorMessage = this.nextValue.executeSQL.msg;
            }
          } else if (this.nextValue.executeSQL.state == "3") {
            this.isSee = false;
            this.modelResultPageIsSee = false;
            this.modelResultButtonIsShow = false;
            this.errorMessage = this.nextValue.executeSQL.msg;
          }
          this.isLoading = false;
        }
      } else if (this.useType == "previewTable") {
        this.getIntoModelResultDetail(nextValue);
      } else if (this.useType == "graph") {
        this.getIntoModelResultDetail(nextValue);
      }
    },
    doRotating(rowData) {
      //旋转
      if (rowData.length == 0) return;
      this.rotateConfigs.forEach((conf) => {
        conf.modelIds.forEach((mId) => {
          if (this.modelId === mId) this.rotateConfig = conf;
        });
      });
      if (this.rotateConfig != null) {
        //  do rotation
        var mainField = this.rotateConfig.mainField;
        var colNamesField = this.rotateConfig.colNamesField;
        console.log(this.rotateConfig);
        var tempMap = {};
        for (let i = 0; i < rowData.length; i++) {
          var rd = rowData[i];
          var key1Arr = [];
          mainField.split(",").forEach((mf) => {
            key1Arr.push(rd[mf]);
          });
          var key1 = key1Arr.join("```");
          var key2 = rd[colNamesField];
          if (!tempMap[key1]) tempMap[key1] = {};
          delete rd[mainField];
          delete rd[colNamesField];
          tempMap[key1][key2] = rd;
        }
        Object.keys(tempMap).forEach((key1) => {
          var rtObj = {};
          mainField.split(",").forEach((mf, idx) => {
            rtObj[mf] = key1.split("```")[idx];
          });
          Object.keys(tempMap[key1]).forEach((key2) => {
            var assObj = tempMap[key1][key2];
            Object.keys(assObj).forEach((ao) => {
              rtObj[this.rotateConfig.titleDisplayRules(ao, key2)] = assObj[ao];
            });
          });
          this.rotateRowData.push(rtObj);
        });
        Object.keys(this.rotateRowData[0]).forEach((k) => {
          this.rotateColumnDefs.push({ field: k, headerName: k, width: 280 });
        });
      }
    },

    /**
     * 显示模型结果详细提取公共代码
     * */
    getIntoModelResultDetail(nextValue) {
      this.afterAddChartsWithNoConfigure = true;
      this.chartLoading = false;
      this.loading = true;
      this.nextValue = nextValue;
      var col = [];
      var rowData = [];
      if ("websocketClose" === this.nextValue.state) {
        this.isSee = false;
        this.modelResultPageIsSee = false;
        this.modelResultButtonIsShow = false;
        this.errorMessage = "WebSocket已断开连接";
        this.isLoading = false;
        return;
      }
      if (this.prePersonalVal.id == this.nextValue.executeSQL.id) {
        if (this.nextValue.executeSQL.state == "2") {
          if (this.nextValue.executeSQL.type == "Select") {
            this.modelResultButtonIsShow = true;
            this.modelResultPageIsSee = true;
            this.modelResultData = this.nextValue.result;
            this.result.column = this.nextValue.columnNames;
            var columnTypes1 = this.nextValue.columnTypes;
            var columnType = [];
            for (var i = 0; i < columnTypes1.length; i++) {
              var type = "";
              if (
                columnTypes1[i].toUpperCase().indexOf("VARCHAR") != -1 ||
                columnTypes1[i].toUpperCase().indexOf("CHAR") != -1
              ) {
                type = "varchar";
              } else if (
                columnTypes1[i].toUpperCase().indexOf("NUMBER") != -1 ||
                columnTypes1[i].toUpperCase().indexOf("INT") != -1
              ) {
                type = "number";
              } else if (
                columnTypes1[i].toUpperCase().indexOf("TIMESTAMP") != -1 ||
                columnTypes1[i].toUpperCase().indexOf("DATE") != -1
              ) {
                type = "time";
              } else if (columnTypes1[i].toUpperCase().indexOf("FLOAT") != -1) {
                type = "float";
              }
              columnType.push(type);
            }
            var resultData = this.nextValue.result;
            this.result.id = uuid2();
            this.result.name = "模型";
            this.result.columnType = columnType;
            var chartData = [];
            for (var i = 0; i < resultData.length; i++) {
              var eachChartData = [];
              for (var j = 0; j < this.nextValue.columnNames.length; j++) {
                eachChartData.push(
                  resultData[i][this.nextValue.columnNames[j]]
                );
              }
              chartData.push(eachChartData);
            }
            this.result.data = chartData;
            this.rowData = this.modelResultData;
            this.modelResultColumnNames = this.nextValue.columnNames;
            if (this.prePersonalVal["agridColumnDatas"] === undefined) {
              for (var j = 0; j < this.nextValue.columnNames.length; j++) {
                var rowColom = {
                  headerName: this.nextValue.columnNames[j],
                  field: this.nextValue.columnNames[j],
                };
                var key = this.nextValue.columnNames[j];
                var value = this.nextValue.result[j];
                col.push(rowColom);
              }
            } else {
              col = this.prePersonalVal["agridColumnDatas"];
            }
            for (var k = 0; k < this.nextValue.result.length; k++) {
              rowData.push(this.nextValue.result[k]);
            }
            for (let i = 0; i < col.length; i++) {
              var colType0 = this.result.columnType[i];
              colType0 = colType0 ? "" : colType0.toUpperCase();
              col[i].filter = "agMultiColumnFilter";
              col[i].filterParams = {
                filters: [
                  {
                    filter: "agNumberColumnFilter",
                    display: "subMenu",
                  },
                  {
                    filter: "agTextColumnFilter",
                    display: "subMenu",
                  },
                  {
                    filter: "agDateColumnFilter",
                    display: "subMenu",
                  },
                ],
              };
            }
            this.columnDefs = col;
            this.afterResult = true;
            if (typeof this.gridApi !== "undefined" && this.gridApi !== null) {
              this.gridApi.closeToolPanel();
            }
          } else {
            this.isSee = false;
            this.modelResultPageIsSee = false;
            this.modelResultButtonIsShow = false;
            this.errorMessage = this.nextValue.executeSQL.msg;
          }
        } else if (this.nextValue.executeSQL.state == "3") {
          this.isSee = false;
          this.modelResultPageIsSee = false;
          this.modelResultButtonIsShow = false;
          this.errorMessage = this.nextValue.executeSQL.msg;
        }
        this.isLoading = false;
      }
    },
    // 点击查询按钮触发事件
    queryCondition() {
      this.$refs.myquerybuilder.selectSql();

      this.dialogVisible = false;
    },
    // 查询完以后，子组件触发父组件的事件
    queryConditionChangeTable(sql, queryJson) {
      this.pageQuery.pageNo = 1;
      this.queryJson = queryJson;
      if (sql == "") {
        sql = "undefined";
      }
      this.nowSql = sql;
      this.initData(sql);
    },
    /**
     * 点击查询条件设置按钮触发
     */
    queryConditionSetting() {
      this.dialogVisible = true;
    },
    /**
     * 重置按钮，将数据还原为最初
     */
    reSet() {
      this.nowSql = "undefined";
      this.initData("undefined");
    },
    /**
     * 渲染表格，将颜色渲染上去
     */
    renderTableView(params) {
      // 规则赋值
      var modelThresholdValues = [];
      if (typeof this.settingInfo != "undefined") {
        modelThresholdValues.push(
          JSON.parse(this.settingInfo).thresholdValueRel
        );
      } else {
        // 模型结果查看
        modelThresholdValues = this.modelObj.modelThresholdValues;
        // 模型直接点击运行
        if (typeof this.modelObj.modelThresholdValues === "undefined")
          modelThresholdValues = this.modelThresholdValuesTabView;
      }
      var thresholdValueRel = {};
      this.isLoading = false;
      for (var i = 0; i < modelThresholdValues.length; i++) {
        thresholdValueRel = modelThresholdValues[i];
        if (
          thresholdValueRel &&
          thresholdValueRel.thresholdValue.thresholdValueType == 1
        ) {
          if (typeof modelThresholdValues[i].colorInfo === "string") {
            let colorInfo = JSON.parse(modelThresholdValues[i].colorInfo);
            modelThresholdValues[i].colorInfo = colorInfo;
          }
          //判断颜色等信息
          return handleDataSingleValue(params.data, thresholdValueRel);
        }
      }
    },
    /**
     * 渲染表格，将颜色渲染上去
     */
    renderTable(params) {
      var modelThresholdValues = [];
      if (this.settingInfo != undefined) {
        modelThresholdValues.push(
          JSON.parse(this.settingInfo).thresholdValueRel
        );
      } else {
        modelThresholdValues = this.modelObj.modelThresholdValues;
      }
      var thresholdValueRel = {};
      this.isLoading = false;
      for (var i = 0; i < modelThresholdValues.length; i++) {
        thresholdValueRel = modelThresholdValues[i];
        if (
          thresholdValueRel &&
          thresholdValueRel.thresholdValue.thresholdValueType == 1
        ) {
          if (typeof modelThresholdValues[i].colorInfo === "string") {
            let colorInfo = JSON.parse(modelThresholdValues[i].colorInfo);
            modelThresholdValues[i].colorInfo = colorInfo;
          }
          //判断颜色等信息
          return handleDataSingleValue(params.data, thresholdValueRel);
        }
      }
    },
    /*changeCellColor(params, thresholdValueRel, modelResultDetailCol) {
      if (thresholdValueRel) {
        let returnValue = handleDataManyValue(params, thresholdValueRel);
        //如果当该列是关联详细列又是阈值展现改变颜色列的时候做特殊处理
        //如果两种都存在则优先判断阈值，如果阈值成立则显示阈值颜色，阈值不成立则显示超链接颜色
        if (returnValue.toString().indexOf("<span") != -1) {
          return returnValue;
        } else {
          let dom = params.value;
          var rowIndex = params.rowIndex;
          if (
            modelResultDetailCol.indexOf(params.column.colId.toUpperCase()) !=
            -1
          ) {
            // dom = "<span onclick='openModelDetailNew()' style='text-decoration:underline;color:blue;cursor:pointer'>" + params.value + "</span>"
            dom =
              "<span onmouseover=\"openModelDetailNew('" +
              rowIndex +
              "')\" style='text-decoration:underline;color:blue;cursor:pointer'>" +
              params.value +
              "</span>";
          }
          return dom;
        }
      } else {
        var rowIndex1 = params.rowIndex;
        if (
          modelResultDetailCol.indexOf(params.column.colId.toUpperCase()) != -1
        ) {
          let dom =
            "<span onmouseover=\"openModelDetailNew('" +
            rowIndex1 +
            "')\" style='text-decoration:underline;color:blue;cursor:pointer'>" +
            params.value +
            "</span>";
          return dom;
        }
        return params.value;
      }
    },*/
    /**
     * 在渲染表格之前拿到渲染表格时需要的数据
     */
    getRenderTableData() {
      if (this.useType == "modelRunResult") {
        if (this.modelUuid != undefined) {
          if (this.settingInfo === undefined) {
            selectPrimaryKeyByTableName().then((res) => {
              this.primaryKey = res.data;
              selectModel(this.modelUuid).then((resp) => {
                this.modelObj = resp.data;
                this.modelDetailRelation = resp.data.modelDetailRelation;
                this.modelOutputColumn = resp.data.modelOutputColumn;
                var datacodes = [];
                for (var i = 0; i < this.modelOutputColumn.length; i++) {
                  if (this.modelOutputColumn[i].dataCoding != undefined) {
                    datacodes.push(this.modelOutputColumn[i].dataCoding);
                  }
                }
                if (datacodes.length > 0) {
                  getTransMap(datacodes.join(",")).then((resp) => {
                    this.dataCoding = resp.data;
                  });
                }
                //调用方法
                this.initData();
                if (this.modelDetailRelation.length > 0) {
                  this.modelDetailButtonIsShow = true;
                }
              });
            });
          } else {
            this.initData();
          }
        } else {
          this.initData();
        }
      }
    },

    modelResultOpenDialog() {
      this.resultShareDialogIsSee = true;
    },
    /**
     * 结果明细分配给人员
     */
    modelResultShare() {
      var selectedNode = this.$refs.orgPeopleTree.getSelectValue();
      this.getValues();
      var resultDetailPersonRels = [];
      selectPrimaryKeyByTableName().then((resp) => {
        this.primaryKey = resp.data;
        for (var i = 0; i < this.selectRows.length; i++) {
          for (var j = 0; j < selectedNode.length; j++) {
            var resultDetailPersonRel = {
              resultDetailProjectRelId: "",
              runResultTableUuid: this.nowtable.runResultTableUuid,
              runTaskRelUuid: this.nowtable.runTaskRelUuid,
              personUuid: selectedNode[j].personuuid,
              resultDetailId: this.selectRows[i][this.primaryKey.toLowerCase()],
              personName: selectedNode[j].cnname,
            };
            resultDetailPersonRels.push(resultDetailPersonRel);
          }
        }
        batchSaveResultDetailPersonRel(resultDetailPersonRels).then((resp) => {
          if (resp.data == true) {
            this.$message({
              type: "success",
              message: "分配人员成功!",
            });
            this.resultShareDialogIsSee = false;
          } else {
            this.$message({
              type: "error",
              message: "分配人员失败!",
            });
          }
        });
      });
    },
    /**
     * 点击详细打开dialog效果
     */
    // openModelDetail() {
    //   var selRows = this.gridApi.getSelectedRows();
    //   if (selRows.length < 1) {
    //     this.$message({ type: "info", message: "请选择后再进行关联!" });
    //   } else if (selRows.length == 1) {
    //     this.options = [];
    //     for (var i = 0; i < this.modelDetailRelation.length; i++) {
    //       var eachOption = {
    //         value: this.modelDetailRelation[i].relationObjectUuid,
    //         label: this.modelDetailRelation[i].modelDetailName,
    //       };
    //       this.options.push(eachOption);
    //     }
    //     this.modelDetailDialogIsShow = true;
    //   } else {
    //     this.$message({ type: "info", message: "不能选中多条!" });
    //   }
    // },
    //单元格点击事件
    onCellClicked(cell) {
      this.rowIndex = cell.rowIndex;
    },
    /**
     * 点击详细打开dialog效果
     */
    // openModelDetailNew(selRows) {
    //   this.options = [];
    //   for (var i = 0; i < this.modelDetailRelation.length; i++) {
    //     var eachOption = {
    //       value: this.modelDetailRelation[i].relationObjectUuid,
    //       label: this.modelDetailRelation[i].modelDetailName,
    //     };
    //     this.options.push(eachOption);
    //   }
    //   this.modelDetailDialogIsShow = true;
    // },
    /**
     * 移入打开下拉框
     */
    openModelDetailNew(param) {
      this.rowIndex = parseInt(param);
      let e = event || window.event;
      this.globalDropDownBox = true;
      this.globalDropLeft = e.clientX + "px";
      this.globalDropTop = e.clientY + "px";
      clearTimeout(this.timeOut); //清除计时器
      this.timeOut = setTimeout(() => {
        this.globalDropDownBox = false;
      }, 1000);
    },
    openModelDetailOld() {
      this.globalDropDownBox = false;
    },
    StopTime() {
      clearTimeout(this.timeOut); //清除计时器
    },
    /**
     * 点击详细dialog的确定按钮后触发
     */
    modelDetailCetermine(value) {
      let replist = [];
      $(".el-tabs__item").each(function (e) {
        let repstr = $(this).attr("id").slice(4, $(this).attr("id").length);
        replist.push(repstr);
      });
      for (let i = 0; i < replist.length; i++) {
        if (value == replist[i]) {
          this.$message("该模型已打开");
          return;
        }
      }
      if (!value) {
        value = this.modelDetailRelation[0].relationObjectUuid;
      }
      var selectRowData = this.gridApi.getSelectedRows();
      var relationType = null;
      var objectName = "";
      var detailConfig = null;
      var detailModel = {};
      for (var i = 0; i < this.modelDetailRelation.length; i++) {
        if (value == this.modelDetailRelation[i].relationObjectUuid) {
          relationType = this.modelDetailRelation[i].relationType;
          objectName = this.modelDetailRelation[i].relationObjectName;
          detailConfig = this.modelDetailRelation[i].modelDetailConfig;
          break;
        }
      }
      if (relationType == 1) {
        var detailValue = [];
        for (var i = 0; i < this.modelDetailRelation.length; i++) {
          if (this.modelDetailRelation[i].relationObjectUuid == value) {
            for (
              var j = 0;
              j < this.modelDetailRelation[i].modelDetailConfig.length;
              j++
            ) {
              var key =
                this.modelDetailRelation[i].modelDetailConfig[j].resultColumn;
              var obj = { moduleParamId: "", paramValue: "" };
              obj.moduleParamId =
                this.modelDetailRelation[i].modelDetailConfig[j].ammParamUuid;
              if (this.modelUuid !== undefined) {
                obj.paramValue = this.rowData[this.rowIndex][key.toLowerCase()];
              } else {
                obj.paramValue = this.rowData[this.rowIndex][key.toUpperCase()];
              }
              detailValue.push(obj);
            }
          }
        }
        findParamModelRelByModelUuid(value).then((resp) => {
          var arr = [];
          for (var i = 0; i < resp.data.length; i++) {
            arr.push(JSON.parse(resp.data[i]));
          }
          selectModel(value).then((resp) => {
            var sql = replaceParam(detailValue, arr, resp.data.sqlValue);
            const obj = { sqls: sql, businessField: "modelresultdetail" };
            detailModel = resp.data;
            getExecuteTask(obj)
              .then((resp) => {
                this.currentExecuteSQL = resp.data.executeSQLList;
                //界面渲染完成之后开始执行sql,将sql送入调度
                startExecuteSql(resp.data).then((result) => {
                  if (this.isModelPreview !== true) {
                    this.$emit(
                      "addBigTabs",
                      undefined,
                      undefined,
                      detailModel.modelName,
                      detailModel.modelUuid,
                      undefined,
                      "modelPreview",
                      this.currentExecuteSQL
                    );
                  } else {
                    this.$emit(
                      "addBigTabsModelPreview",
                      detailModel.modelName,
                      detailModel.modelUuid,
                      this.currentExecuteSQL
                    );
                  }
                });
              })
              .catch((result) => {
                this.$message({ type: "info", message: "执行失败" });
              });
          });
        });
      } else if (relationType == 2) {
        //modelOutputColumn
        var sql = "SELECT * FROM " + objectName + " WHERE ";
        var filterSql = "";
        for (var i = 0; i < detailConfig.length; i++) {
          var eachFilter = detailConfig[i].relFilterValue;
          loop: for (var j = 0; j < this.modelOutputColumn.length; j++) {
            if (
              eachFilter.indexOf(this.modelOutputColumn[j].outputColumnName) >
              -1
            ) {
              eachFilter = eachFilter.replace(
                this.modelOutputColumn[j].outputColumnName,
                this.rowData[this.rowIndex][
                  this.modelOutputColumn[j].outputColumnName.toLowerCase()
                ]
              );
              break loop;
            }
          }
          if (i == detailConfig.length - 1) {
            filterSql += eachFilter;
          } else {
            filterSql += eachFilter + " or ";
          }
        }
        sql = sql + filterSql;
        const obj = { sqls: sql, businessField: "modelresultdetail" };
        getExecuteTask(obj)
          .then((resp) => {
            this.currentExecuteSQL = resp.data.executeSQLList;
            //界面渲染完成之后开始执行sql,将sql送入调度
            startExecuteSql(resp.data).then((result) => {});
          })
          .catch((result) => {
            this.$message({ type: "info", message: "执行失败" });
          });
      }
      this.globalDropDownBox = false;
      this.initWebSocket();
      // this.modelDetailModelResultDialogIsShow = true;
    },
    /**
     * sql编辑器模型结果点击导出后出发的方法
     */
    modelResultExport() {
      this.tableData = this.nextValue.result;
      this.json_fields = {};
      for (var i = 0; i < this.nextValue.columnNames.length; i++) {
        this.json_fields[this.nextValue.columnNames[i]] = {
          field: this.nextValue.columnNames[i],
          callback: (value) => {
            return "&nbsp;" + value;
          },
        };
      }
      this.excelName = "模型结果导出表";
    },
    reSet1() {
      this.isLoading = true;
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
      /*      const webSocketPath =
        "ws://localhost:8086/analysis/websocket?" +
        this.$store.getters.personuuid;*/
      const webSocketPath =
        this.AmsWebsocket.getWSBaseUrl(this.AmsModules.ANALYSIS) +
        this.$store.getters.personuuid +
        "modelresultdetail";
      // WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
      this.webSocket = new WebSocket(webSocketPath); // 建立与服务端的连接
      // 当服务端打开连接
      this.webSocket.onopen = function (event) {};
      // 发送消息
      this.webSocket.onmessage = function (event) {
        const dataObj = JSON.parse(event.data);
        func1(dataObj);
      };
      const func2 = function func3(val) {
        this.$emit("setNextValue", val);
        // this.$refs.childTabsRef.loadTableData(val);
      };
      const func1 = func2.bind(this);
      this.webSocket.onclose = function (event) {};

      // 通信失败
      this.webSocket.onerror = function (event) {};
    },
    /**
     * sql编辑器保存图标
     */
    saveChart() {
      this.isHaveCharts = false;
      this.afterAddChartsWithNoConfigure = false;
      this.chartShowIsSee = false;
      var chartJson = this.$refs.chart.getChartConfig();
      this.chartConfigs.chart.push(chartJson);
      this.nowChartJson = chartJson;
      var modelUuid =
        this.nowtable.runResultTableUuid == undefined
          ? this.chartModelUuid
          : this.nowtable.runTaskRelUuid;
      var modelChartSetup = {
        chartJson: JSON.stringify(chartJson),
        modelUuid: modelUuid,
      };
      this.modelChartSetups.push(modelChartSetup);
      addModelChartSetup(modelChartSetup).then((resp) => {
        if (resp.data) {
          this.$notify({
            title: this.$t("提示"),
            message: this.$t("添加图表成功"),
            type: "success",
            duration: 2000,
            position: "bottom-right",
          });
        }
      });
    },
    /**
     * 修改图表方法
     */
    updateChart() {
      var chartJson = this.$refs.chart.getChartConfig();
      let indexzz = this.chartIndex;
      this.thechartdead = !this.thechartdead;
      if (this.modelChartSetups.length != 0) {
        let layOut = {};
        for (let i = 0; i < this.chartConfigs.layout.length; i++) {
          if (
            this.chartConfigs.layout[i].i ===
            this.chartConfigs.chart[indexzz].id
          ) {
            layOut = {
              x: this.chartConfigs.layout[i].x,
              y: this.chartConfigs.layout[i].y,
              w: this.chartConfigs.layout[i].w,
              h: this.chartConfigs.layout[i].h,
              i: chartJson.id,
            };
            this.chartConfigs.layout.splice(i, 1, layOut);
            break;
          }
        }
        let modelChartSetup = {};
        for (let i = 0; i < this.modelChartSetups.length; i++) {
          let charjson = JSON.parse(this.modelChartSetups[i].chartJson);
          if (charjson.chart.id === undefined || charjson.chart.id === null) {
            if (charjson.id == this.chartConfigs.chart[indexzz].id) {
              modelChartSetup = this.modelChartSetups[i];
              modelChartSetup.chartJson = JSON.stringify({
                chart: chartJson,
                layout: layOut,
              });
              break;
            }
          } else {
            if (charjson.chart.id == this.chartConfigs.chart[indexzz].id) {
              modelChartSetup = this.modelChartSetups[i];
              modelChartSetup.chartJson = JSON.stringify({
                chart: chartJson,
                layout: layOut,
              });
              break;
            }
          }
        }
        if (modelChartSetup.modelUuid === undefined) {
          this.$notify({
            title: this.$t("提示"),
            message: this.$t("修改成功"),
            type: "success",
            duration: 2000,
            position: "bottom-right",
          });
        } else {
          updateModelChartSetup(modelChartSetup).then((resp) => {
            if (resp.data) {
              this.$notify({
                title: this.$t("提示"),
                message: this.$t("修改成功"),
                type: "success",
                duration: 2000,
                position: "bottom-right",
              });
            }
          });
        }
        this.chartConfigs.chart.splice(indexzz, 1, chartJson);
      } else {
        this.$notify({
          title: this.$t("提示"),
          message: this.$t("修改成功"),
          type: "success",
          duration: 2000,
          position: "bottom-right",
        });
        this.chartConfigs.chart.splice(indexzz, 1, chartJson);
      }
      this.chartShowIsSee = false;
    },
    /**
     * 获取参数返显的数据
     */
    chartReflexion() {
      this.chartConfigs = {
        chart: [],
        layout: [{ x: 0, y: 0, w: 12, h: 11, i: "0" }],
      };
      this.modelChartSetups = [];
      if (this.nowtable.runResultTableUuid != undefined) {
        getModelChartSetup(this.nowtable.runTaskRelUuid).then((resp) => {
          //做修改操作
          if (this.myIndex == 0) {
            this.modelChartSetups = resp.data.modelChartSetups;
            for (var i = 0; i < this.modelChartSetups.length; i++) {
              let json = JSON.parse(this.modelChartSetups[i].chartJson);
              if (json.layout === undefined || json.layout === null) {
                this.chartConfigs.chart.push(
                  JSON.parse(this.modelChartSetups[i].chartJson)
                );
                this.chartConfigs.layout.push({
                  x: 0,
                  y: (i + 1) * 6,
                  w: 12,
                  h: 6,
                  i: i + 1 + "",
                });
              } else {
                this.chartConfigs.chart.push(json.chart);
                this.chartConfigs.layout.push(json.layout);
              }
            }
            if (this.chartConfigs.chart.length == 0) {
              this.isHaveCharts = true;
            }
          } else {
            this.chartConfigs = {
              chart: [],
              layout: [{ x: 0, y: 0, w: 12, h: 16, i: "0" }],
            };
          }
          this.chartLoading = false;
        });
      } else {
        if (this.modelUuid != undefined) {
          getModelChartSetup(this.modelUuid).then((resp) => {
            console.log("数据情况1");
            if (this.myIndex == 0) {
              this.modelChartSetups = resp.data.modelChartSetups;
              for (var i = 0; i < this.modelChartSetups.length; i++) {
                let json = JSON.parse(this.modelChartSetups[i].chartJson);
                if (json.layout === undefined || json.layout === null) {
                  this.chartConfigs.chart.push(
                    JSON.parse(this.modelChartSetups[i].chartJson)
                  );
                  this.chartConfigs.layout.push({
                    x: 0,
                    y: (i + 1) * 6,
                    w: 12,
                    h: 6,
                    i: i + 1 + "",
                  });
                } else {
                  this.chartConfigs.chart.push(json.chart);
                  this.chartConfigs.layout.push(json.layout);
                }
              }
              if (this.modelChartSetups.length == 0) {
                this.chartConfigs = {
                  chart: [],
                  layout: [{ x: 0, y: 0, w: 12, h: 16, i: "0" }],
                };
              }
              if (this.chartConfigs.chart.length == 0) {
                this.isHaveCharts = true;
              }
            }
            this.chartLoading = false;
          });
        } else if (this.modelId != undefined) {
          getModelChartSetup(this.modelId).then((resp) => {
            //做修改操作
            console.log("数据情况2");
            if (this.myIndex == 0) {
              this.modelChartSetups = resp.data.modelChartSetups;
              for (var i = 0; i < this.modelChartSetups.length; i++) {
                let json = JSON.parse(this.modelChartSetups[i].chartJson);
                if (json.layout === undefined || json.layout === null) {
                  this.chartConfigs.chart.push(
                    JSON.parse(this.modelChartSetups[i].chartJson)
                  );
                  this.chartConfigs.layout.push({
                    x: 0,
                    y: (i + 1) * 6,
                    w: 12,
                    h: 6,
                    i: i + 1 + "",
                  });
                } else {
                  this.chartConfigs.chart.push(json.chart);
                  this.chartConfigs.layout.push(json.layout);
                }
              }
              if (this.modelChartSetups.length == 0) {
                console.log(this.modelChartSetups.length)
                this.chartConfigs = {
                  chart: [],
                  layout: [{ x: 0, y: 0, w: 16, h: 16, i: "0" }],
                };
              }
              if (this.chartConfigs.chart.length == 0) {
                this.isHaveCharts = true;
              }
            }
            this.chartLoading = false;
          });
        }
      }
    },
    /**
     * 打开添加图标的dialog
     */
    openChartDialog() {
      this.afterAddChartsWithNoConfigure = true;
      this.chartIndex = 0;
      this.chartShowIsSee = true;
    },
    /**
     * 打开修改图表的dialog
     */
    openEditChartDialog(index) {
      this.nowChartJson = this.chartConfigs.chart[index];
      this.chartIndex = index;
      this.chartShowIsSee = true;
    },
    /**
     * 删除图标
     */
    deleteChart(index) {
      let indexzz = this.chartIndex;
      if (this.modelChartSetups.length != 0) {
        var modelChartSetupUuid = {};
        for (var i = 0; i < this.modelChartSetups.length; i++) {
          var charjson = JSON.parse(this.modelChartSetups[i].chartJson);
          if (charjson.chart.id === undefined || charjson.chart.id === null) {
            if (charjson.id == this.chartConfigs.chart[indexzz].id) {
              modelChartSetupUuid = this.modelChartSetups[i].chartSetupUuid;
              break;
            }
          } else {
            if (charjson.chart.id == this.chartConfigs.chart[indexzz].id) {
              modelChartSetupUuid = this.modelChartSetups[i].chartSetupUuid;
              break;
            }
          }
        }
        if (modelChartSetupUuid === undefined) {
          this.$notify({
            title: this.$t("提示"),
            message: this.$t("删除成功"),
            type: "success",
            duration: 2000,
            position: "bottom-right",
          });
        } else {
          deleteModelChartSetup(modelChartSetupUuid).then((resp) => {
            if (resp.data) {
              this.$notify({
                title: this.$t("提示"),
                message: this.$t("删除成功"),
                type: "success",
                duration: 2000,
                position: "bottom-right",
              });
            }
          });
        }
      } else {
        this.$notify({
          title: this.$t("提示"),
          message: this.$t("删除成功"),
          type: "success",
          duration: 2000,
          position: "bottom-right",
        });
      }
      this.chartConfigs.chart.splice(index, 1);
      const iin = this.chartConfigs.layout
        .map((item) => item.i)
        .indexOf(index + 1);
      this.chartConfigs.layout.splice(iin, 1);
      this.dragIndex = this.chartConfigs.layout.findIndex(
        (item) => item.i === "drop"
      );
      this.thechartdead = !this.thechartdead;
      if (this.chartConfigs.chart.length !== 0) {
      } else {
        this.isHaveCharts = true;
      }
    },

    /*
     * 拖拽操作
     * */
    drag: function (e) {
      let parentRect = this.$refs.DragOn.getBoundingClientRect();
      let mouseInGrid = false;
      if (
        mouseXY.x > parentRect.left &&
        mouseXY.x < parentRect.right &&
        mouseXY.y > parentRect.top &&
        mouseXY.y < parentRect.bottom
      ) {
        mouseInGrid = true;
      }
      if (
        mouseInGrid === true &&
        this.chartConfigs.layout.findIndex((item) => item.i === "drop") === -1
      ) {
        this.chartConfigs.layout.push({
          x: (this.chartConfigs.layout.length * 2) % (this.colNum || 12),
          y: this.chartConfigs.layout.length + (this.colNum || 12), // puts it at the bottom
          w: 12,
          h: 6,
          i: "drop",
        });
      }
      this.dragIndex = this.chartConfigs.layout.findIndex(
        (item) => item.i === "drop"
      );
      if (this.dragIndex !== -1) {
        try {
          this.$refs.gridlayout.$children[
            this.chartConfigs.layout.length
          ].$refs.item.style.display = "none";
        } catch {}
        let el = this.$refs.gridlayout.$children[this.dragIndex];
        el.dragging = {
          top: mouseXY.y - parentRect.top,
          left: mouseXY.x - parentRect.left,
        };
        let new_pos = el.calcXY(
          mouseXY.y - parentRect.top,
          mouseXY.x - parentRect.left
        );
        if (mouseInGrid === true) {
          this.$refs.gridlayout.dragEvent(
            "dragstart",
            "drop",
            new_pos.x,
            new_pos.y,
            6,
            12
          );
          DragPos.x = new_pos.x;
          DragPos.y = new_pos.y;
        }
        if (mouseInGrid === false) {
          this.$refs.gridlayout.dragEvent(
            "dragend",
            "drop",
            new_pos.x,
            new_pos.y,
            6,
            12
          );
          this.chartConfigs.layout = this.chartConfigs.layout.filter(
            (obj) => obj.i !== "drop"
          );
        }
      }
    },
    dragend: function (e) {
      let parentRect = this.$refs.DragOn.getBoundingClientRect();
      let mouseInGrid = false;
      if (
        mouseXY.x > parentRect.left &&
        mouseXY.x < parentRect.right &&
        mouseXY.y > parentRect.top &&
        mouseXY.y < parentRect.bottom
      ) {
        mouseInGrid = true;
      }
      if (mouseInGrid === true) {
        let node = {
          id: new Date().valueOf(),
          loading: false,
          dataId: this.result.id,
          dataName: this.result.name,
          name: e.title,
          typeName: e.title,
          type: e.type,
          chart: e.chart,
          img: e.icon,
          background: "#409EFF",
          active: true,
          rename: false,
          // echart datav等的显示配置信息
          initOptions: JSON.parse(
            JSON.stringify(
              this.chartsResource.resources.initOptions[e.type][e.chart]
            )
          ),
          // 右侧表单的配置信息
          configOptions: JSON.parse(
            JSON.stringify(
              this.chartsResource.resources.configOptions[e.type][e.chart]
            )
          ),
        };
        this.chartConfigs.layout = this.chartConfigs.layout.filter(
          (obj) => obj.i !== "drop"
        );
        this.chartConfigs.layout.push({
          x: DragPos.x,
          y: DragPos.y,
          w: 12,
          h: 6,
          i: node.id,
        });
        this.chartConfigs.chart.push(node);
        var modelUuid =
          this.nowtable.runResultTableUuid == undefined
            ? this.chartModelUuid
            : this.nowtable.runTaskRelUuid;
        var modelChartSetup = {
          chartJson: JSON.stringify({
            chart: node,
            layout: {
              x: DragPos.x,
              y: DragPos.y,
              w: 12,
              h: 6,
              i: node.id,
            },
          }),
          modelUuid: modelUuid,
        };
        this.modelChartSetups.push(modelChartSetup);

        addModelChartSetup(modelChartSetup).then((resp) => {
          if (resp.data) {
            this.$notify({
              title: this.$t("提示"),
              message: this.$t("添加图表成功"),
              type: "success",
              duration: 2000,
              position: "bottom-right",
            });
          }
        });
      }
    },
    /**
     * 保存结果，将模型添加到后台立即执行 **注意带参数模型
     */
    saveResult() {
      var msg = "是否保存模型结果?";
      if (process.env["VUE_APP_BASE_PROJECT_TYPE"] == "BOE") {
        msg = "是否将结果发送到作业平台?";
      }
      this.$confirm(msg, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.$emit("saveModelResult");
      });
    },
    saveChartsAll() {
      if (this.modelChartSetups.length != 0) {
        for (let i = 0; i < this.modelChartSetups.length; i++) {
          let modelChartSetupZ = {};
          let json = JSON.parse(this.modelChartSetups[i].chartJson);
          for (let j = 0; j < this.chartConfigs.layout.length; j++) {
            if (this.chartConfigs.layout[j].i === json.layout.i) {
              modelChartSetupZ = {
                chartJson: JSON.stringify({
                  chart: json.chart,
                  layout: this.chartConfigs.layout[j],
                }),
                modelUuid: this.modelChartSetups[i].modelUuid,
                chartSetupUuid: this.modelChartSetups[i].chartSetupUuid,
              };
              updateModelChartSetup(modelChartSetupZ).then((resp) => {
                if (resp.data) {
                  this.$notify({
                    title: this.$t("提示"),
                    message: this.$t("保存图表布局成功"),
                    type: "success",
                    duration: 2000,
                    position: "bottom-right",
                  });
                }
              });
              break;
            }
          }
        }
      }
    },
    // /**
    //  * 工作流  点击提交审核按钮
    //  */
    // toSubmit() {
    //   if (this.multipleSelection.length == 0) {
    //     alert("请至少选中一条数据");
    //     return false;
    //   }
    //   //流程接口调用
    //   this.submitData.busdatas = this.multipleSelection;
    //   for (var i = 0; i < this.submitData.busdatas.length; i++) {
    //     if (this.submitData.busdatas[i].状态 === 1) {
    //       this.$message.info({
    //         duration: 2000,
    //         message: "预警发起的数据不能重复提交！",
    //       });
    //       return false;
    //     } else if (this.submitData.busdatas[i].状态 === 3) {
    //       this.$message.info({
    //         duration: 2000,
    //         message: "已销号的数据不能重复提交！",
    //       });
    //       return false;
    //     }
    //   }
    //   this.submitData.busTableName = this.nowtable.resultTableName; // 表名称
    //   this.submitData.busDatabaseType = "mysql"; //数据库类型
    //   this.flowItem.versionUuid = this.common.randomString4Len(8);
    //   this.flowItem.applyTitle =
    //     this.modelTitle + this.common.getNowFormatDay();
    //   this.applyInfo.versionUuid = this.flowItem.versionUuid;
    //   this.applyInfo.status = "";
    //   this.applyInfo.mstate = "";
    //   this.applyInfo.fstate = "";
    //   this.applyInfo.isUpdate = false; //初始化
    //   this.$store.dispatch("applyInfo/setApplyInfo", this.applyInfo);
    //
    //   console.info(JSON.stringify(this.submitData));
    //   console.info(JSON.stringify(this.columnDefs));
    //   this.dialogVisibleSubmit = true;
    // },
    // saveOpinion() {
    //   var data = {
    //     versionUuid: this.flowItem.versionUuid,
    //     busdatas: this.multipleSelection,
    //     busTableName: this.submitData.busTableName,
    //     busDatabaseName: this.submitData.busDatabaseName,
    //     busDatabaseType: this.submitData.busDatabaseType,
    //   };
    //   this.$axios
    //     .post("/ams-clue/busRelation/toSubmit", data)
    //     .then((response) => {
    //       if (response.data.code == "0") {
    //         this.flowItem.appDataUuid = response.data.data.busRelationUuid;
    //         //修改业务执行状态为0，调用监听，执行更新流程状态操作。
    //         this.$store.dispatch("applyInfo/setMstate", "0");
    //         this.flowParam = 1;
    //       } else {
    //         this.dialogVisibleSubmit = false;
    //         this.common.alertMsg(1, "操作失败！");
    //       }
    //     })
    //     .catch((error) => {
    //       this.dialogVisibleSubmit = false;
    //       this.common.alertMsg(1, "操作失败！");
    //       console.log(error);
    //     });
    // },
    //流程发布失败
    // delectData(val) {
    //   this.dialogVisibleSubmit = val;
    //   var data = {
    //     busRelationUuid: this.flowItem.appDataUuid,
    //   };
    //   this.$axios
    //           .post("/ams-clue/busRelation/delete/rollBackData", data)
    //           .then((response) => {
    //             if (response.data.code == "0") {
    //               this.flowItem.appDataUuid = response.data.data.busRelationUuid;
    //             }
    //           })
    //           .catch((error) => {
    //             this.common.alertMsg(1, "操作失败！");
    //             console.log(error);
    //           });
    //   this.initData();
    // },

    closeFlowItem(val) {
      this.dialogVisibleSubmit = val;
      this.flowParam = 0;
      this.initData();
    },
    toSubmitYc() {
      // alert(JSON.stringify(this.multipleSelection));
      if (this.multipleSelection.length == 0) {
        alert("请至少选中一条数据");
        // this.common.alertMsg(2, "请选中一条数据");
        return false;
      }
      //流程接口调用
      this.submitData.busdatas = this.multipleSelection;
      for (var i = 0; i < this.submitData.busdatas.length; i++) {
        if (this.submitData.busdatas[i].状态 === 1) {
          this.$message.info({
            duration: 2000,
            message: "预警发起的数据不能重复提交！",
          });
          return false;
        } else if (this.submitData.busdatas[i].状态 === 3) {
          this.$message.info({
            duration: 2000,
            message: "已销号的数据不能重复提交！",
          });
          return false;
        }
      }
      this.submitData.busTableName = this.nowtable.resultTableName; // 表名称
      // this.submitData.status = this.initStatus;  //数据状态（0）
      this.submitData.busDatabaseType = "mysql"; //数据库类型
      this.flowItem.versionUuid = this.common.randomString4Len(8);
      this.flowItem.applyTitle =
        this.modelTitle + this.common.getNowFormatDay();
      this.applyInfo.versionUuid = this.flowItem.versionUuid;
      this.applyInfo.status = "";
      this.applyInfo.mstate = "";
      this.applyInfo.fstate = "";
      this.applyInfo.isUpdate = false; //初始化
      this.$store.dispatch("applyInfo/setApplyInfo", this.applyInfo);

      console.info(JSON.stringify(this.submitData));
      console.info(JSON.stringify(this.columnDefs));
      this.dialogVisibleSubmit = true;
    },
    saveOpinion() {
      setTimeout(() => {
        this.$refs["flowItem2"].saveOpinion();
      }, 20);
    },
    //流程发布失败
    delectData(val) {
      this.dialogVisibleSubmit = val;
      var data = {
        busRelationUuid: this.$store.state.applyInfo.applyInfo.appDataUuid,
      };
      this.$axios
        .post("/ams-clue/busRelation/delete/rollBackData", data)
        .then((response) => {
          if (response.data.code == "0") {
            this.flowItem.appDataUuid = response.data.data.busRelationUuid;
          }
        })
        .catch((error) => {
          this.common.alertMsg(1, "操作失败！");
          console.log(error);
        });
      this.initData();
    },
  },
};
</script>
<style scoped>
.redprompt {
  color: red;
}
.suspectstop {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
}
.suspectsleft {
  width: 49%;
  margin-right: 1%;
  height: 220px;
  overflow: auto;
}
.suspectsright {
  width: 49%;
  height: 220px;
  overflow: auto;
}
.suspectsmiddle {
  height: 50px;
}
.suspectsbottom {
  height: 200px;
  overflow: auto;
}
.suspectsform .el-form-item {
  width: 33% !important;
}
.suspectsform .el-form {
  display: flex;
  flex-wrap: wrap;
}
.itxst {
  text-align: left;
  height: 100%;
}
.thechard-z {
  margin-right: 20px;
}
.paging-z {
  font-weight: bold;
  color: rgb(52, 57, 66);
  margin: 0 5px;
  font-size: 16px;
  line-height: 16px;
}
.delete-pos {
  width: 25px;
  position: absolute;
  right: 60px;
  z-index: 20;
}
.change-pos {
  width: 29px;
  position: absolute;
  right: 35px;
  z-index: 20;
}
.chartSwitching {
  width: 24px;
  height: 24px;
  margin: 10px 6px 0px 0px;
  display: block;
  cursor: pointer;
  /*border:1px solid #999;*/
  /*border-radius: 15%;*/
}

.el-btn-no-colorz {
  float: right;
  height: 30px;
  margin: 5px;
  font-size: 14px;
  padding: 2px 5px;
  cursor: pointer;
  text-align: center;
  user-select: none;
  /* background-color: #559ED4; */
}
.el-btn-no-colorz span {
  padding: 4px 0;
  background-color: #559ed4;
  border-radius: 4px;
  color: white;
}
.smallImgs {
  float: right;
  height: 723px;
  padding-left: 5px;
  background: rgb(245, 245, 245);
  position: relative;
  z-index: 10;
  margin: -50px -8px 0px 0px;
}
.globalDropDownBox {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  padding: 10px 0;
  margin: 5px 0;
  background-color: #fff;
  border: 1px solid #e6ebf5;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
@keyframes globalDropDownBox {
  0% {
    height: 0;
  }
  100% {
    height: 30px;
  }
}
.globalDDBli {
  list-style: none;
  line-height: 30px;
  padding: 0 17px;
  font-size: 14px;
  margin: 0;
  color: #606266;
  cursor: pointer;
  outline: none;
  animation: globalDropDownBox 0.3s linear forwards;
}
.globalDDBli:hover {
  background-color: #e8f4ff;
  color: #46a6ff;
}
.chartChange {
  float: left;
}
.item-bgimg-size {
  background-image: url("imgs/chart-type-icons.png");
}
.item_img {
  width: 36px;
  height: 24px;
  background-size: 420px 168px;
}
.item_div {
  width: 38px;
  height: 34px;
  padding: 5px 0px;
  margin: 3px 10px;
  border-radius: 2px;
  border: 1px solid #46a6ff;
  float: left;
}
.drag-on {
  height: calc(100vh - 260px);
}
.vue-grid-layout{
  height: 100% !important;
}
.drag-on-table {
  position: relative;
  height: 100%;
}

.vue-grid-layout {
  background: transparent;
}
.vue-grid-item{
  height: 100% !important;
}
.vue-grid-item:not(.vue-grid-placeholder) {
  background: transparent;
  border: 1px dashed #46a6ff;
}
.vue-grid-item .resizing {
  opacity: 0.9;
}
.vue-grid-item .static {
  background: #cce;
}
.vue-grid-item .textz {
  text-align: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  height: 100%;
  width: 100%;
}
.vue-grid-item .no-drag {
  height: 100%;
  width: 100%;
}
.vue-grid-item .minMax {
  font-size: 12px;
}
.vue-grid-item .add {
  cursor: pointer;
}
.vue-draggable-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  top: 0;
  right: 0;
  padding: 0 8px 8px 0;
  background-origin: content-box;
  background-color: black;
  box-sizing: border-box;
  border-radius: 10px;
  cursor: pointer;
  z-index: 100000;
}
.layoutJSON {
  background: #ddd;
  border: 1px solid black;
  margin-top: 10px;
  padding: 10px;
}
.eventsJSON {
  background: #ddd;
  border: 1px solid black;
  margin-top: 10px;
  padding: 10px;
  height: 100px;
  overflow-y: scroll;
}
>>> .vue-grid-item.vue-grid-placeholder {
  background: #46a6ff !important;
  opacity: 0.2 !important;
}
.tjsh {
  width: 100px !important;
}
</style>

