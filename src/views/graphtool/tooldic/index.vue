<template>
    <div id="graphToolDiv" ref="graphToolDiv" style="width: 100%;height: 100%;overflow-y: hidden;">
        <div id="geToolbarContainer" class="geToolbarContainer">
            <div class="graphMenu" v-show="openGraphType !== 4" style="width: 320px;">
                <div class="menuTit">
                    <div style="float: left;width: 150px;text-align: right;">文件</div>
                    <div style="float: left;width: 150px;height: 20px;line-height: 10px;text-align: left;padding-left: 5px;cursor: pointer;" @click="showMoreMenu">
                        <el-image :src="require('@/api/graphtool/images/icons/more.png')" title="更多" style="padding-top:7px;"/>
                    </div>
                </div>
                <div class="menuLi">
                    <div class="graphIcon">
                        <div class="graphIconElRow" @click="newGraph">
                            <el-image :src="require('@/api/graphtool/images/icons/new.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">新建</div>
                    </div>
                    <div class="graphIcon">
                        <div class="graphIconElRow" @click="openGraph">
                            <el-image :src="require('@/api/graphtool/images/icons/open.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">打开</div>
                    </div>
                    <div class="graphIcon">
                        <div class="graphIconElRow" @click="saveGraph('saveGraph')">
                            <el-image :src="require('@/api/graphtool/images/icons/save.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">保存</div>
                    </div>
                    <div class="graphIcon">
                        <div class="graphIconElRow" @click="saveGraph('saveAsGraph')">
                            <el-image :src="require('@/api/graphtool/images/icons/saveAs.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">另存为</div>
                    </div>
                    <div class="graphIcon">
                        <div class="graphIconElRow" @click="next">
                            <el-image :src="require('@/api/graphtool/images/icons/next.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">恢复</div>
                    </div>
                    <div class="graphIcon">
                        <div class="graphIconElRow" @click="back">
                            <el-image :src="require('@/api/graphtool/images/icons/back.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">后撤</div>
                    </div>
                </div>
            </div>
            <div class="graphMenu" v-show="openGraphType === 4" style="width: 170px;">
                <div class="menuTit">文件</div>
                <div class="menuLi">
                    <div class="graphIcon">
                        <div class="graphIconElRow" @click="openGraph">
                            <el-image :src="require('@/api/graphtool/images/icons/open.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">打开</div>
                    </div>
                    <div class="graphIcon">
                        <div class="graphIconElRow" @click="next">
                            <el-image :src="require('@/api/graphtool/images/icons/next.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">恢复</div>
                    </div>
                    <div class="graphIcon">
                        <div class="graphIconElRow" @click="back">
                            <el-image :src="require('@/api/graphtool/images/icons/back.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">后撤</div>
                    </div>
                </div>
            </div>
            <div class="graphMenu" style="width: 320px;">
                <div class="menuTit">行数据处理</div>
                <div class="menuLi">
                    <div class="graphIcon">
                        <div id="graphNode_filter" class="graphIconElRow" data-type="filter">
                            <el-image :src="require('@/api/graphtool/images/icons/filter.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">筛选</div>
                    </div>
                    <div class="graphIcon">
                        <div id="graphNode_sort" class="graphIconElRow" data-type="sort">
                            <el-image :src="require('@/api/graphtool/images/icons/sort.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">排序</div>
                    </div>
                    <div class="graphIcon">
                        <div id="graphNode_sample" class="graphIconElRow" data-type="sample">
                            <el-image :src="require('@/api/graphtool/images/icons/sample.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">抽样</div>
                    </div>
                    <div class="graphIcon">
                        <div id="graphNode_delRepeat" class="graphIconElRow" data-type="delRepeat">
                            <el-image :src="require('@/api/graphtool/images/icons/delRepeat.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">去重</div>
                    </div>
                    <div class="graphIcon">
                        <div id="graphNode_layering" class="graphIconElRow" data-type="layering">
                            <el-image :src="require('@/api/graphtool/images/icons/layering.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">分层</div>
                    </div>
                    <div class="graphIcon">
                        <div id="graphNode_groupCount" class="graphIconElRow" data-type="groupCount">
                            <el-image :src="require('@/api/graphtool/images/icons/groupCount.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">分组汇总</div>
                    </div>
                </div>
            </div>
            <div class="graphMenu" style="width: 120px;">
                <div class="menuTit">列数据处理</div>
                <div class="menuLi">
                    <div class="graphIcon">
                        <div id="graphNode_comparison" class="graphIconElRow" data-type="comparison">
                            <el-image :src="require('@/api/graphtool/images/icons/comparison.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">频次分析</div>
                    </div>
                    <div class="graphIcon">
                        <div id="graphNode_change" class="graphIconElRow" data-type="change">
                            <el-image :src="require('@/api/graphtool/images/icons/change.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">转码</div>
                    </div>
                </div>
            </div>
            <div class="graphMenu" style="width: 120px;">
                <div class="menuTit">表间数据处理</div>
                <div class="menuLi">
                    <div class="graphIcon">
                        <div id="graphNode_union" class="graphIconElRow" data-type="union">
                            <el-image :src="require('@/api/graphtool/images/icons/union.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">融合</div>
                    </div>
                    <div class="graphIcon">
                        <div id="graphNode_relation" class="graphIconElRow" data-type="relation">
                            <el-image :src="require('@/api/graphtool/images/icons/relation.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">关联</div>
                    </div>
                </div>
            </div>
            <div class="graphMenu" style="width: 70px;">
                <div class="menuTit">SQL</div>
                <div class="menuLi">
                    <div class="graphIcon">
                        <div id="graphNode_sql" class="graphIconElRow" data-type="sql">
                            <el-image :src="require('@/api/graphtool/images/icons/sql.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">SQL查询</div>
                    </div>
                </div>
            </div>
            <div class="graphMenu" style="width: 70px;">
                <div class="menuTit">参数</div>
                <div class="menuLi">
                    <div class="graphIcon">
                        <div class="graphIconElRow" @click="showParamNodeList">
                            <el-image :src="require('@/api/graphtool/images/icons/param.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">参数</div>
                    </div>
                </div>
            </div>
            <div class="graphMenu" style="width: 70px;">
                <div class="menuTit">运行</div>
                <div class="menuLi">
                    <div class="graphIcon">
                        <div class="graphIconElRow" @click="executeAllNode">
                            <el-image :src="require('@/api/graphtool/images/icons/run.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">全部运行</div>
                    </div>
                </div>
            </div>
            <div class="graphMenu" style="width: 70px;">
                <div class="menuTit">帮助</div>
                <div class="menuLi">
                    <div class="graphIcon">
                        <div class="graphIconElRow" @click="help">
                            <el-image :src="require('@/api/graphtool/images/icons/help.png')" class="graphToolImg"/>
                        </div>
                        <div class="iconText">帮助</div>
                    </div>
                </div>
            </div>
            <span id="toolBarSpan" style="position: absolute;right: 0;bottom: 2px;font-weight: 800;" @click="hideAndShow">【折叠/展开】</span>
        </div>
        <div id="accordion">
            <el-input v-model="searchZtreeContent" placeholder="搜索关键字" class="input-with-select">
                <el-button slot="append" icon="el-icon-search" @click="searchZtree" />
            </el-input>
            <ul id="ztree_datasource" class="ztree" style="width: 100%;" />
        </div>
        <div id="graphContainer" class="graphContainer">
            <div id="geDiagramContainer" class="geDiagramContainer">
                <div id="geBackgroundPage" ref="geBackgroundPage" class="geBackgroundPage" />
            </div>
            <div id="geResultContainer" class="geResultContainer">
                <!--<button id="viewAllData" class="btn btn-primary" onclick="viewAllData()" style="position: absolute;right: 200px;top: 10px;display:none;">预览全部数据</button>-->
                <!--<button id="exportAllData" class="btn btn-primary" onclick="exportAllData()" style="position: absolute;right: 100px;top: 10px;display:none;">全部导出</button>-->
                <!--<div id="maxOpen" style="width:80px;position: absolute;right: 0;top: 15px;display:none;" onclick="maxOpen()">-->
                <!--<img class="iconImgGraph" src="../../../api/graphtool/images/icon/maximize.png" alt="最大化">-->
                <!--<span class="iconText">最大化</span>-->
                <!--</div>-->
                <el-tabs v-model="resultTabActiveName" type="border-card">
                    <el-tab-pane label="数据结果集" name="0">
                        <div id="tableArea">
                            <ChildTabs ref="childTabsRef" use-type="graph" :pre-value="resultTableArr" v-if="showTableResult"/>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="执行信息" name="1">
                        <div id="sysInfoArea"></div>
                    </el-tab-pane>
                    <el-tab-pane label="缩略图" name="2">
                        <div id="outLineArea" ref="outLineArea"></div>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </div>
        <div id="detailContainer" class="panel-group">
            <el-tabs v-model="detailTabActiveName" type="border-card">
                <el-tab-pane label="图形信息" name="0">
                    <el-row>
                        <el-col :span="4">
                            <label style="height: 36px;line-height: 36px;float: right;padding-right: 5px;">名称</label>
                        </el-col>
                        <el-col :span="20">
                            <el-input v-model="graphName_show" placeholder="图形名称" readonly/>
                        </el-col>
                    </el-row>
                    <el-row style="padding-top: 10px;">
                        <el-col :span="4">
                            <label style="height: 36px;line-height: 36px;float: right;padding-right: 5px;">描述</label>
                        </el-col>
                        <el-col :span="20">
                            <el-input type="textarea" resize="none" v-model="description_show" :autosize="{ minRows: 5, maxRows: 5}" placeholder="图形描述"/>
                        </el-col>
                    </el-row>
                </el-tab-pane>
                <el-tab-pane label="说明" name="1">
                    <div id="nodeRemark" v-html="nodeRemarkHtml" @click="viewEgEvent"></div>
                </el-tab-pane>
                <el-tab-pane label="所用资源" name="2">
                    <ul id="resourceZtree" class="ztree" />
                </el-tab-pane>
                <el-tab-pane label="痕迹" name="3">
                    <ul id="historyZtree" class="ztree" />
                </el-tab-pane>
            </el-tabs>
        </div>
        <div id="geHsplit" />
        <div id="geVsplit" />
        <el-dialog :visible.sync="helpDialogVisible" title="帮助">
            <Help />
        </el-dialog>
        <el-dialog v-if="graphListDialogVisible" :visible.sync="graphListDialogVisible" title="选择图形" :close-on-press-escape="false" :close-on-click-modal="false">
            <GraphListExport ref="graphListExport" :open-type="openType" />
            <div slot="footer">
                <el-button @click="graphListDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="getGraphObject">确定</el-button>
            </div>
        </el-dialog>
        <el-dialog :visible.sync="graphFormVisible" :title="graphFormTitle" :close-on-press-escape="false" :close-on-click-modal="false" width="600px">
            <el-form>
                <el-row>
                    <el-col>
                        <el-form-item label="图形名称" prop="graphName">
                            <el-input v-model="graphName" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col>
                        <el-form-item label="图形描述" prop="description">
                            <el-input v-model="description" type="textarea" resize="none" :autosize="{ minRows: 5, maxRows: 5}" placeholder="请输入内容" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer">
                <el-button @click="graphFormVisible = false">取消</el-button>
                <el-button type="primary" @click="getGraphFormInfo">保存</el-button>
            </div>
        </el-dialog>
        <el-dialog v-if="nodeParamListDialogVisible" :visible.sync="nodeParamListDialogVisible" title="参数节点列表" :close-on-press-escape="false" :close-on-click-modal="false" width="600px">
            <el-row style="color: red;line-height: 35px;height: 30px;" v-show="openGraphType === 2 || openGraphType === 3">注：可通过上下拖动行对节点进行排序设置</el-row>
            <el-table :data="nodeParamArr" height="400" fit ref="nodeParamTable" style="width:100%;">
                <el-table-column type="index" label="编号" align="center" width="60" :resizable="false"/>
                <el-table-column prop="nodeName" label="节点名称" header-align="center" :resizable="false"/>
                <el-table-column prop="lineNum" label="结果表序号" width="100" align="center" :resizable="false"/>
                <el-table-column label="操作" width="100" align="center" :resizable="false">
                    <template slot-scope="scope">
                        <el-button type="primary" v-if="!scope.row.hasParamSet" class="oper-btn setting" @click="settingParam(scope.row.nodeId,scope.$index)" title="设置参数" style="line-height: normal;"/>
                        <el-button type="primary" v-if="scope.row.hasParamSet" class="oper-btn setting" @click="settingParam(scope.row.nodeId,scope.$index)" title="修改参数" style="line-height: normal;"/>
                        <el-button type="primary" v-if="scope.row.hasParamSet" class="oper-btn delete" @click="clearSettingParam(scope.row.nodeId,scope.$index)" title="清除参数" style="line-height: normal;"/>
                    </template>
                </el-table-column>
            </el-table>
            <div slot="footer">
                <el-button @click="nodeParamListDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="showParamNodeListCallBack()">保存</el-button>
            </div>
        </el-dialog>
        <el-dialog v-if="nodeParamSettingDialogVisible" :visible.sync="nodeParamSettingDialogVisible" title="设置节点参数" :close-on-press-escape="false" :close-on-click-modal="false" width="1000px">
            <SettingParams ref="settingParams" :graph="graph" :node-id="sp_nodeId" :params-setting="sp_paramsSetting" />
            <div slot="footer" v-if="initNodeSettingVue">
                <el-button @click="nodeParamSettingDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="settingParamsCallBack()">保存</el-button>
            </div>
        </el-dialog>
        <el-dialog
            v-if="nodeSettingDialogVisible"
            :visible.sync="nodeSettingDialogVisible"
            :title="nodeSettingTitle"
            :close-on-press-escape="false"
            :close-on-click-modal="false"
            :before-close="closeNodeSetting"
            :append-to-body="true"
            :destroy-on-close="true"
            width="1000px">
            <NodeSetting v-if="settingType === 'commonSetting'" ref="nodeSetting" :graph="graph" :opt-type="sp_optType" />
            <RelationSetting v-if="settingType === 'relation'" ref="nodeSetting" :graph="graph" />
            <GroupCount v-if="settingType === 'groupCount'" ref="nodeSetting" :graph="graph"/>
            <div v-if="graph.canEditor" slot="footer">
                <el-button @click="nodeSettingDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveNodeSetting()">保存</el-button>
            </div>
        </el-dialog>
        <el-dialog
            v-if="sqlEditorDialogVisible"
            :visible.sync="sqlEditorDialogVisible"
            title="SQL编辑器"
            :close-on-press-escape="false"
            :close-on-click-modal="false"
            :width="sqlEditorWidth" top="20px"
            :modal-append-to-body="false" :style="sqlEditorStyle">
            <SqlEditor ref="sqlEditor" callType="graphModel" :sqlValue="sqlEditorCurSql"/>
            <div v-if="graph.canEditor" slot="footer">
                <el-button @click="sqlEditorDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="sqlNodeEditCallBack()">保存</el-button>
            </div>
        </el-dialog>
        <el-dialog v-if="viewNodeSqlDialogVisible" :visible.sync="viewNodeSqlDialogVisible" title="查看SQL语句" :close-on-press-escape="false" :close-on-click-modal="false" width="600px">
            <div style='height: 400px;padding: 20px;'>{{curNodeExecuteSQL}}</div>
        </el-dialog>
        <el-dialog v-if="nodeReNameDialogVisible" :visible.sync="nodeReNameDialogVisible" title="重命名" :close-on-press-escape="false" :close-on-click-modal="false" width="600px">
            <el-form>
                <el-row>
                    <el-col>
                        <el-form-item :label="reNameObj.name">
                            <el-input v-model="reNameObj.value" v-if="reNameObj.edge" type="number"/>
                            <el-input v-model="reNameObj.value" v-if="!reNameObj.edge"/>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer">
                <el-button @click="nodeReNameDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="reNameCallBack">保存</el-button>
            </div>
        </el-dialog>
        <el-dialog v-if="nodeParamDialogVisible" :visible.sync="nodeParamDialogVisible" title="设置执行参数" :close-on-press-escape="false" :close-on-click-modal="false" width="600px">
            <InputParams ref="inputParams" :nodeData="graph.nodeData" :nodeIdArr="executeNodeIdArr"/>
            <div slot="footer">
                <el-button @click="nodeParamDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="setExecuteParamCallBack">保存</el-button>
            </div>
        </el-dialog>
        <el-dialog :visible.sync="imageDialogVisible" title="图片示例" width="600px">
            <el-image :src="imageSrc" fit="contain" style="max-height:600px;"></el-image>
        </el-dialog>
        <el-dialog v-if="comparisonTableDetailDialogVisible" :visible.sync="comparisonTableDetailDialogVisible" title="频次分析数据详情" :close-on-press-escape="false" :close-on-click-modal="false" width="1000px">
            <AnalysisDetailData ref="analysisDetailData" :dataTableName="comparison_dataTableName" :openType="openType" :columnVal="comparison_columnVal"/>
        </el-dialog>
        <!-- 右键事件 -->
        <div id="rMenu" class="rightMenu">
            <ul>
                <li @click="viewData(true)">预览数据</li>
            </ul>
        </div>
        <div id="moreMenu" class="rightMenu">
            <ul>
                <li @click="importGraph">图形导入</li>
                <li @click="exportGraph">图形导出</li>
            </ul>
        </div>
        <div id="H_S_Menu" class="rightMenu">
            <ul>
                <li @click="hideAndShowToolBar">折叠上方区域</li>
                <li @click="hideAndShowLeftArea">折叠左侧区域</li>
                <li @click="hideAndShowRightArea">折叠右侧区域</li>
            </ul>
        </div>
        <input id="importGraphInp" type="file" name="file" style="display: none;" @change="importGraphSubmit">
    </div>
</template>
<script>
    import '@/api/graphtool/css/grapheditor.css'
    import '@/components/ams-loading/css/loading.css'
    import '@/components/ams-ztree/js/jquery.ztree_new.all.min.js'
    import '@/components/ams-ztree/js/jquery.ztree.excheck.min.js'
    import '@/components/ams-ztree/js/jquery.ztree.exhide.min.js'
    require("@/api/graphtool/js/sanitizer.min.js")
    // 引入子组件
    import Help from '@/views/graphtool/tooldic/page/funEventVue/help.vue'
    import GraphListExport from '@/views/graphtool/tooldic/page/funEventVue/graphListExport.vue'
    import ChildTabs from '@/views/analysis/auditmodelresult/childtabs'
    import SettingParams from '@/views/graphtool/tooldic/page/settingParams/settingParams.vue'
    import NodeSetting from '@/views/graphtool/tooldic/page/nodeSetting/nodeSetting.vue'
    import RelationSetting from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/relation/relation.vue'
    import InputParams from '@/views/graphtool/tooldic/page/inputParams/inputParams.vue'
    import GroupCount from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/groupCount/groupCount.vue'
    import SqlEditor from '@/views/analysis/sqleditor/index.vue'
    import AnalysisDetailData from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/analysisDetailData.vue'
    // 引入后端接口的相关方法
    import { removeJcCssfile, addCssFile, addJsFile } from "@/api/analysis/common"
    import { getGraphInfoById, viewNodeData, saveGraphInterface, createScreenQuery } from '@/api/graphtool/apiJs/graphList'
    import { initTableTip } from '@/api/analysis/sqleditor/sqleditor'
    // 引入前段JS的相关方法
    import * as commonJs from '@/api/graphtool/js/common'
    import * as indexJs from '@/api/graphtool/js/index'
    import * as validateJs from '@/api/graphtool/js/validate'
    export default {
        name: 'ToolIndex',
        components: { Help, GraphListExport, ChildTabs, SettingParams, NodeSetting, RelationSetting, InputParams, GroupCount, SqlEditor, AnalysisDetailData },
        props: ['graphUuidParam', 'openGraphTypeParam', 'openTypeParam'],
        data() {
            return {
                graph: null,
                ownerEditor: null,
                zTreeObj: null,
                resourceZtree: null,
                historyZtree: null,
                resourceRootNode: null,
                historyRootNode: null,
                helpDialogVisible: false,
                graphListDialogVisible: false,
                nodeParamListDialogVisible: false,
                nodeParamSettingDialogVisible: false,
                nodeSettingDialogVisible: false,
                oldGraphData: null, // 用来接收打开的图形全部节点数据信息的对象
                openType_graph: 2, // 默认打开的当前图形的数据源环境是权限环境
                createUserId: '', // 当前图形的创建人ID（只使用于验证普通图形）
                loginUserUuid: '', // 当前登录人UUID
                loginUserCode: '', // 当前登录人ID
                canEditor: true, // 当前图形化是否可编辑
                hasManagerRole: false, // 是否觉有管理员权限（只在开发环境下会用到，用以对左侧资源树的表进行分类）
                graphName: '',
                description: '',
                graphName_show:'',
                description_show:'',
                graphUuid: '', // 打开图形的ID
                openGraphType: '', // 当前所打开的图形类型：1、普通图形，2、个人场景查询，3、公共场景查询，4、模型图形
                openType: '', // 打开方式（当前所有使用数据源环境：1、开发测试环境，2、业务权限环境）
                loading: null, // 遮罩层对象
                searchZtreeContent: '',
                webSocket: null,
                resultTableArr: [], // 节点结果集集合
                loadResultNum:0,//已加载结果集的数量
                showTableResult: false,
                executeNodeIdArr: [], // 当前执行批次的节点ID集合
                graphFormVisible: false,
                graphFormTitle: '',
                saveGraphType: 'saveGraph', // 保存、另存为图形
                websocketBatchId: '',
                showGraphListType: '',
                activeTabName: 'outLineArea',
                optTypeArr: ['filter', 'sort', 'sample', 'layering', 'groupCount', 'delRepeat', 'comparison', 'change', 'union', 'relation', 'sql'],
                nodeParamRelArr: [], // 用来存储每个节点设置的参数信息
                nodeParamArr: [], // 存储已设置参数的节点集合
                sp_nodeId: '', // 设置节点参数时传递的参数，节点ID
                sp_paramsSetting: null, // 设置节点参数时传递的参数，节点的参数配置信息
                sp_optType: '', // 配置节点信息时传递的参数，操作节点的类型
                nodeSettingTitle: '', // 配置节点时显示的弹窗标题，当前节点的名称
                settingType: '',// 节点配置所打开的弹窗类型
                initNodeSettingVue:false,//节点参数设置页面是否初始化完成
                viewNodeSqlDialogVisible:false,
                curNodeExecuteSQL:'',//当前节点的SQL语句
                nodeReNameDialogVisible:false,
                reNameObj:{"name":'节点名称',"value":"","edge":false},//重命名节点的名称
                nodeParamDialogVisible:false,
                executeNodeObject:null,//全部执行的节点批次信息
                executeType:'',//当前执行操作的类型（全部执行【all】和普通执行【''】）
                sqlEditorCurSql:'',//SQL编辑器的SQL语句
                sqlEditorDialogVisible:false,
                sqlEditorWidth:'',
                sqlEditorStyle:'',
                curModelSql: '',// 用来临时存储打开模型图形时的模型SQL语句
                isSearchExpand:false,// 左侧资源树搜索功能的变量
                curCell:null,//当前执行节点的对象
                nodeRemarkHtml:'点击操作节点，可查看节点说明信息',
                imageDialogVisible:false,
                imageSrc:'',
                resultTabActiveName:"2",
                detailTabActiveName:'0',
                comparisonTableDetailDialogVisible:false,
                comparison_dataTableName:'',
                comparison_columnVal:''
            }
        },
        created() {
            // 引入公用CSS、JS
            addCssFile('/lib/Ztree/css/zTreeStyle/zTreeStyle.css','zTreeStyle')
            this.init()
        },
        beforeDestroy() {
            //销毁公用CSS、JS
            removeJcCssfile("zTreeStyle.css","css")
            removeJcCssfile("jquery.ztree_new.all.min.js","js")
            removeJcCssfile("jquery.ztree.excheck.min.js","js")
            removeJcCssfile("jquery.ztree.exhide.min.js","js")
        },
        mounted() {
            // 申明common.js的方法为全局方法
            this.initCommon()
            // //申明index.js的方法为全局方法
            this.initIndex()
            // 初始化GRAPH和部分变量
            this.initGraph()
            // 申明validate.js的方法为全局方法
            this.initValidateFun()
            // 初始化websocket
            this.initWebSocKet()
            this.sqlEditorWidth = $(this.$refs.graphToolDiv).width() + "px"
            let sqlEditorHeight = $(this.$refs.graphToolDiv).height() + 18 + "px"
            this.sqlEditorStyle = `margin-left:${$(this.$refs.graphToolDiv).position().left -10}px;height:${sqlEditorHeight}`
        },
        methods: {
            init() {
                if (typeof getParams().graphUuid === 'undefined') {
                    this.graphUuid = this.graphUuidParam
                }else{
                    this.graphUuid = getParams().graphUuid
                }
                if (typeof getParams().openGraphType === 'undefined') {
                    this.openGraphType = Number(this.openGraphTypeParam)
                }else{
                    this.openGraphType = Number(getParams().openGraphType)
                }
                if (typeof getParams().openType === 'undefined') {
                    this.openType = Number(this.openTypeParam)
                }else{
                    this.openType = Number(getParams().openType)
                }
                this.loginUserUuid = this.$store.state.user.id
                this.loginUserCode = this.$store.state.user.code
                const roleArr = this.$store.state.user.roles
                const screenManager = 'screenManager'// 场景查询管理员角色
                if (roleArr && roleArr.includes(screenManager)) {
                    this.hasManagerRole = true
                }
            },
            initCommon() {
                window.lightHeight = commonJs.lightHeight
                window.getDataSourceTable = commonJs.getDataSourceTable
                window.changeNodeIcon = commonJs.changeNodeIcon
                window.data_filter = commonJs.data_filter
                window.setDataSourceCopyIcon = commonJs.setDataSourceCopyIcon
                window.setNodeOutputTypeIcon = commonJs.setNodeOutputTypeIcon
                window.executeNode = commonJs.executeNode
                window.executeToNode = commonJs.executeToNode
                window.cancelExecute = commonJs.cancelExecute
                window.sqlNodeEdit = commonJs.sqlNodeEdit
                window.reName = commonJs.reName
                window.curNodeSQL = commonJs.curNodeSQL
                window.deleteCells = commonJs.deleteCells
                window.previewNodeData = commonJs.previewNodeData
                window.reSetOptProperty = commonJs.reSetOptProperty
                window.changeUndoNodeInfo = commonJs.changeUndoNodeInfo
                window.changeRedoNodeInfo = commonJs.changeRedoNodeInfo
            },
            initIndex() {
                let $this = this
                window.refrashResourceZtree = indexJs.refrashResourceZtree
                window.refrashHistoryZtree = indexJs.refrashHistoryZtree
                window.autoSaveGraph = indexJs.autoSaveGraph
                window.nodeRemark = indexJs.nodeRemark
                window.deleteResourceZtreeNode = indexJs.deleteResourceZtreeNode
                window.undoResourceZtreeNode = indexJs.undoResourceZtreeNode
                window.redoResourceZtreeNode = indexJs.redoResourceZtreeNode
                window.modifyParam = indexJs.modifyParam
                window.showComparisonTableDetail = indexJs.showComparisonTableDetail
                window.alertMsg = function (title,msg,type){
                    $this.$message({ type : type, message : msg})
                }
                window.confirmMsg = function (title, text, type, confirmMethord, cancelMethord) {
                    $this.$confirm(text, title, {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: type,
                        center: true,
                        closeOnClickModal:false,
                        closeOnPressEscape:false
                    }).then(() => {
                        if(typeof cancelMethord === "function"){
                            confirmMethord()
                        }
                    }).catch( () => {
                        if(typeof cancelMethord === "function"){
                            cancelMethord()
                        }
                    })
                }
            },
            initValidateFun() {
                window.edgeVerify = validateJs.edgeVerify
            },
            initGraph() {
                if (!mxClient.isBrowserSupported()) {
                    this.$message.error('您的浏览器不支持图形设计。请更换浏览器')
                    return
                }
                const $this = this
                // 点击操作节点，显示说明信息
                $(this.$refs.graphToolDiv).find('.graphIconElRow').click(function() {
                    const optType = $(this).attr('data-type')
                    if ($.inArray(optType, $this.optTypeArr) > -1) {
                        indexJs.nodeRemark(optType)
                    }
                })
                mxResources.loadDefaultBundle = false
                var bundle = mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) || mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage)
                var defaultXmlUrl = STYLE_PATH + '/default.xml'
                mxUtils.getAll([bundle, defaultXmlUrl], function(xhr) {
                    mxResources.parse(xhr[0].getText())
                    var themes = new Object()
                    themes['default'] = xhr[1].getDocumentElement()
                    $this.ownerEditor = new EditorUi(new Editor(themes))
                    $this.graph = $this.ownerEditor.editor.graph
                    $this.graph.setCellsResizable(false)// 关闭改变节点大小
                    $this.graph.setAllowLoops(false)// 不允许连接的源和目标是同一节点
                    $this.graph.setCellsEditable(false)// 关闭编辑节点
                    // 图形化模型 数据对象
                    $this.graph.nodeData = {}
                    $this.graph.historyNodeInfo = {}
                    // 用来存放每次操作节点的节点信息（包括剪切、复制、删除、粘贴、撤销、还原操作）
                    $this.graph.oldOptArr = []
                    $this.graph.newOptArr = []
                    $this.graph.edgeArr = {}
                    // 缩略图
                    $this.$refs.outLineArea.style.position = 'absolute'
                    $this.$refs.outLineArea.style.width = '97%'
                    $this.$refs.outLineArea.style.height = '225px'
                    $this.$refs.outLineArea.style.border = '1px solid whiteSmoke'
                    $this.$refs.outLineArea.style.backgroundColor = '#FFFFFF'
                    $this.$refs.outLineArea.style.overflow = 'hidden'
                    new mxOutline($this.graph, $this.$refs.outLineArea)
                    // 设置鼠标经过时的高亮样式
                    new mxCellTracker($this.graph, '#00A8FF')
                    window.ownerEditor = $this.ownerEditor
                    window.graph = $this.graph
                    // 将vue实例传给JS
                    indexJs.sendIndexJs($this)
                    commonJs.sendGraphIndexVue($this)
                }, function() {
                    $this.$refs.graphToolDiv.innerHTML = '<center style="margin-top:10%;">加载资源文件出错</center>'
                })
                if (this.openGraphType === 3) {//当打开公共场景查询图形时
                    if (this.hasManagerRole === false) {//如果没有场景查询管理员权限，则图形不可编辑
                        this.canEditor = false
                    }
                    // 此请求不需要做ID校验
                    this.loadGraph(this.graphUuid)
                } else {
                    if (this.graphUuid && this.graphUuid !== '') { // 如果ID有值，则加载图形信息
                        this.loadGraph(this.graphUuid)
                    } else {
                        this.initJsp()
                    }
                }
            },
            /**
             * 根据图形ID加载图形信息
             * @param graphUuid 图形ID
             */
            loadGraph(graphUuid) {
                this.loading = $(this.$refs.graphToolDiv).mLoading({ 'text': '正在加载，请稍后……', 'hasCancel': false })// 遮罩层对象
                getGraphInfoById(graphUuid).then(response => {
                    if (response.data == null) {
                        this.loading.destroy()
                        this.$message.error('加载图形失败')
                    } else {
                        try {
                            this.openType_graph = response.data.createType// 打开图形化的方式：1、开发环境（开发库）；2、权限环境（生产库）
                            this.createUserId = response.data.createUserId
                            this.oldGraphData = response.data
                            this.loading.destroy()
                            this.initJsp()
                        } catch (e) {
                            this.loading.destroy()
                            this.$message.error('加载图形失败')
                            console.info(e)
                        }
                    }
                })
            },
            initJsp() {
                let $this = this
                const initGraphInterval = setInterval(function() {
                    if ($this.graph != null) {
                        clearInterval(initGraphInterval)
                        $this.graph.openType = $this.openType
                        $this.graph.canEditor = $this.canEditor
                        $this.graph.openGraphType = $this.openGraphType
                        switch ($this.openGraphType) {
                            case 1:
                                $this.graph.graphType = 1// 当前图形是个人图形
                                break
                            case 2:
                            case 3:
                                $this.graph.graphType = 3// 当前图形是场景查询图形（包括公共场景查询和个人场景查询）
                                break
                            case 4:
                                $this.graph.graphType = 4// 当前图形是模型图形
                                break
                        }
                        /* 右侧所使用资源树,start*/
                        $this.resourceRootNode = { 'name': '所用资源', 'displayName': '所用资源', 'level': 0, 'isParent': true, 'open': true, 'type': 'rootNode', 'id': 'resourceRoot', 'pid': null, 'children': [] }
                        $this.resourceZtree = $.fn.zTree.init($('#resourceZtree'), indexJs.resourceSetting, $this.resourceRootNode)
                        /* 右侧所使用资源树,end*/

                        /* 右侧操作痕迹树,start*/
                        $this.historyRootNode = { 'name': '操作痕迹', 'displayName': '操作痕迹', 'level': 0, 'isParent': true, 'open': true, 'type': 'rootNode', 'id': 'historyRoot', 'pid': null, 'children': [] }
                        $this.historyZtree = $.fn.zTree.init($('#historyZtree'), indexJs.historySetting, $this.historyRootNode)
                        /* 右侧操作痕迹树,end*/
                        $this.loading = $('body').mLoading({ 'text': '正在初始化数据，请稍后……', 'hasCancel': false })
                        // 加载已有的图形化
                        if ($this.oldGraphData != null) {
                            indexJs.openCallBack($this.oldGraphData)
                        }
                        $this.initTree($this)
                    }
                }, 1000)
            },
            initTree(obj) {
                var loadZtree = function() {
                    var setting = {
                        data: {
                            key: {
                                checked: 'isChecked',
                                name: 'name',
                                title: 'displayName'
                            },
                            // 设置数据格式
                            simpleData: {
                                enable: true,
                                idKey: 'id',
                                pIdKey: 'pid'
                            }
                        },
                        check: {
                            enable: false,
                            chkStyle: 'radio',
                            radioType: 'all'
                        },
                        view: {
                            selectedMulti: false
                        },
                        edit: {
                            enable: true,
                            showRenameBtn: false,
                            showRemoveBtn: false,
                            drag: { // 禁止拖拽变更树节点
                                autoExpandTrigger: false, // 拖拽时父节点自动展开是否触发 onExpand
                                prev: false,
                                inner: false,
                                next: false
                            }
                        },
                        callback: {
                            onRightClick: indexJs.onRightClick,
                            onExpand: function(event, treeId, treeNode) {
                                if ((!treeNode.children || treeNode.children.length === 0) && (treeNode.type === 'datasource' || treeNode.type === 'table' || treeNode.type === 'view')) {
                                    indexJs.getColumnsByTable(treeNode, false, false)
                                }
                            }
                        }
                    }
                    if (obj.canEditor) {
                        delete setting.edit
                        setting.callback.onNodeCreated = function(event, treeId, treeNode) {
                            // 为树节点创建拖动事件
                            if (treeNode.type === 'datasource') {
                                iconDrag(treeNode)
                            }
                        }
                    }
                    // 数据表根节点
                    if (obj.openType === 1) {				// 开发测试环境
                        setting.view.selectedMulti = true// 允许ctrl多选
                        setting.callback.onClick = indexJs.onclick
                        $.post(contextPath + '/graphEditor/getDevelopTable', {}, function(e) {
                            if (e.isError) {
                                obj.loading.destroy()
                                this.$message.error('资源树列表加载出错')
                            } else {
                                // 统一表和试图的类型为datasource，不需要替换的就执行空方法
                                indexJs.replaceNodeType(e.nodeList)
                                obj.zTreeObj = $.fn.zTree.init($('#ztree_datasource'), setting, e.nodeList)
                                obj.loading.destroy()
                            }
                        }, 'json')
                    } else {						// 业务权限环境
                        initTableTip().then(response => {
                            if (response.data == null) {
                                obj.loading.destroy()
                                this.$message.error('资源树列表加载出错')
                            } else {
                                // 统一表和试图的类型为datasource，不需要替换的就执行空方法
                                indexJs.replaceNodeType(response.data)
                                obj.zTreeObj = $.fn.zTree.init($('#ztree_datasource'), setting, response.data)
                                obj.loading.destroy()
                            }
                        })
                    }
                }
                /* 左侧数据表树，start*/
                loadZtree()
                if (obj.canEditor) {
                    $.each($('.graphIcon'), function() {
                        let typeDom = $(this).find(".graphIconElRow")
                        let textDom = $(this).find(".iconText")
                        let type = typeDom.attr('data-type')
                        if (typeof (type) !== 'undefined') {
                            iconDrag({
                                type: type,
                                shape: 'rhombus',
                                id: `graphNode_${type}`,
                                tId: new UUIDGenerator().id,
                                name: textDom.html()
                            })
                        }
                    })
                }
            },
            initWebSocKet() {
                var $this = this
                const webSocketPath = process.env.VUE_APP_GRAPHTOOL_WEB_SOCKET + this.loginUserUuid + 'GRAPH'
                // WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
                this.webSocket = new WebSocket(webSocketPath) // 建立与服务端的连接
                // 当服务端打开连接
                this.webSocket.onopen = function(event) {

                }
                // 发送消息
                this.webSocket.onmessage = function(event) {
                    const dataObj = JSON.parse(event.data)// 接收到返回结果
                    var executeSQLObj = dataObj.executeSQL
                    if (executeSQLObj.customParam[0] === $this.websocketBatchId) {//匹配结果集
                        $this.loadResultNum++
                        if(executeSQLObj.state === "2"){//执行成功，展示当前操作的结果集
                            $this.resultTabActiveName = '0'
                            if(!$this.showTableResult){
                                $this.showTableResult = true
                            }
                            let index = $this.resultTableArr.findIndex( item => item.id === executeSQLObj.id)
                            if(index > -1) {
                                //如果是数据频次分析节点，则需要特殊处理
                                let nodeId = $this.resultTableArr[index].id//节点的ID或者树节点的ID
                                if( typeof $this.graph.nodeData[nodeId] !== 'undefined'){
                                    let optType = $this.graph.nodeData[nodeId].nodeInfo.optType
                                    if(optType === "newNullNode"){
                                        nodeId = $this.graph.nodeData[nodeId].parentIds[0]
                                        optType = $this.graph.nodeData[nodeId].nodeInfo.optType
                                    }
                                    if(optType === "comparison"){//频次分析节点
                                        //获取当前频次分析节点的详情表名称
                                        const dataTableName = $this.graph.nodeData[nodeId].nodeInfo.dataTableName
                                        let columnDefs = []
                                        Array.from(dataObj.columnNames, item => {
                                            let obj = {}
                                            if(item === '涉及表数量'){//此处列名称是固定的
                                                obj.headerName = item
                                                obj.field = item
                                                obj.cellRenderer = (params) => {
                                                    console.log(params)
                                                    return `<span style="color:red;cursor:pointer;" title="点击查看详情数据" onclick="showComparisonTableDetail(\'${dataTableName}\',\'${params.data["对比内容"]}\')">${params.value}</span>`
                                                }
                                            }else{
                                                obj.headerName = item
                                                obj.field = item
                                            }
                                            columnDefs.push(obj)
                                        })
                                        $this.resultTableArr[index].agridColumnDatas = columnDefs
                                    }
                                }
                                $this.$nextTick(() => {
                                    $this.$refs.childTabsRef.loadTableData(dataObj)
                                })
                            }
                        }else{
                            $('#sysInfoArea').html("<p style='color: red;'>预览结果集失败：" + executeSQLObj.msg + "</p>")
                            $this.resultTabActiveName = '1'
                        }
                        if($this.loadResultNum === $this.resultTableArr.length){
                            $this.loading.destroy()
                        }
                    }
                }

                this.webSocket.onclose = function(event) {

                }

                // 通信失败
                this.webSocket.onerror = function(event) {
                    $this.$message.error('数据请求失败')
                }
            },
            executeAllNode() {
                commonJs.executeAllNode()
            },
            newGraph() {
                this.$store.commit('aceState/setRightFooterTags', {
                    type: 'active',
                    val: {
                        name: '新增图形',
                        path: `/graphtool/tooldic?openGraphType=1&openType=${this.openType}`
                    }
                })
            },
            openGraph() {
                indexJs.openGraph()
            },
            saveGraph(type) {
                this.saveGraphType = type
                var str = type === 'saveGraph' ? '保存' : '另存为'
                if (this.canEditor === false) {
                    this.$message({ type: 'warning', message: `当前图形您没有【${str}】操作的权限` })
                } else {
                    if (Object.keys(this.graph.nodeData).length === 0) {
                        this.$message({ type: 'warning', message: '当前图形无节点数据，不可保存' })
                    } else {
                        this.graphFormVisible = true
                        this.graphFormTitle = `${str}图形`
                    }
                }
            },
            getGraphFormInfo() {
                if ($.trim(this.graphName) === '') {
                    this.$message({ type: 'warning', message: '请输入图形名称' })
                    return
                }
                const encoder = new mxCodec()
                const node = encoder.encode(this.graph.getModel())
                const xml = mxUtils.getPrettyXml(node)
                var data = {
                    'createType': this.openType,
                    'executeStatus': indexJs.getExecuteDetail(),
                    'graphName': this.graphName,
                    'description': this.description,
                    'graphXml': xml,
                    'nodeData': JSON.stringify(graph.nodeData) // 各个节点的配置信息
                }
                if (this.saveGraphType === 'saveGraph') {
                    data.graphUuid = this.graphUuid
                }
                let callBack = function(vueObj,response,msg_success,msg_error){
                    vueObj.graphFormVisible = false
                    if (response.data == null) {
                        vueObj.$message.error(msg_error)
                    } else {
                        vueObj.graphUuid = response.data
                        if (vueObj.saveGraphType === 'saveGraph') {
                            vueObj.graphName_show = vueObj.graphName
                            vueObj.description_show = vueObj.description
                        }
                        vueObj.$notify({
                            title: vueObj.$t('message.title'),
                            message: vueObj.$t(msg_success),
                            type: 'success',
                            duration: 2000,
                            position: 'bottom-right'})
                    }
                }
                if(this.openGraphType === 1){//个人图形
                    data.graphType = 1
                    saveGraphInterface(data).then(response => {
                        callBack(this,response,'图形保存成功','图形保存失败')
                    }).catch( () => {})
                }else{//场景查询图形
                    data.graphType = 3
                    if(this.openGraphType === 2){//个人场景查询图形
                        data.publicType = 0
                    }else{//公共场景查询图形
                        data.publicType = 1
                        data.executeStatus = 3// 未执行
                    }
                    createScreenQuery(data).then( response => {
                        callBack(this,response,'场景查询图形保存成功','场景查询图形保存失败')
                    }).catch( () => {})
                }
            },
            searchZtree() {
                indexJs.searchZtree()
            },
            viewData(isZtree) {
                if (isZtree) {
                    indexJs.hideRMenu('rMenu')
                    const nodes = this.zTreeObj.getSelectedNodes()
                    if (nodes.length > 0) {
                        let $this = this
                        const nodeId = nodes[0].id
                        const nodeName = nodes[0].name
                        const resultTableName = nodes[0].name
                        const isRoleTable = true
                        this.initData()
                        this.$nextTick(() => {
                            $this.websocketBatchId = new UUIDGenerator().id
                            $this.resultTableArr = [{ id: nodeId, name: nodeName, resultTableName: resultTableName, isRoleTable: isRoleTable }]
                            $this.resultTabActiveName = '0'
                            $this.viewData()
                        })
                    }
                } else {
                    this.loading.destroy()
                    this.loading = $('#tableArea').mLoading({ 'text': '数据请求中，请稍后……', 'hasCancel': false, 'hasTime': true })
                    viewNodeData({ nodeObjs: JSON.stringify(this.resultTableArr), openType: this.openType, websocketBatchId: this.websocketBatchId }).then()
                        .catch( error => {
                            this.loading.destroy()
                            $('#sysInfoArea').html("<p style='color: red;'>" + error + "</p>")
                            this.resultTabActiveName = '1'
                        })
                }
            },
            initData(){
                this.loadResultNum = 0
                this.showTableResult = false
                this.resultTableArr = []
            },
            relationTableQuery() {

            },
            showMoreMenu() { // 处理文件更多菜单
                var event = event || window.event
                indexJs.showRMenu('moreMenu', 'node', event.clientX, event.clientY)
            },
            /**
             * 刷新【个人数据】节点
             */
            refreshMySpaceNode() {
                var refreshNodeId = 'my_space'
                if (this.openType === 1) {
                    refreshNodeId = 'my_space_dev'
                }
                var refreshNodes = this.zTreeObj.getNodesByParam('id', refreshNodeId, null)
                if (refreshNodes && refreshNodes.length > 0) {
                    rootDataRefresh(refreshNodes[0])
                }
            },
            hideAndShow() {
                indexJs.hideAndShow()
            },
            hideAndShowToolBar() {
                indexJs.hideAndShowToolBar()
            },
            hideAndShowLeftArea() {
                indexJs.hideAndShowLeftArea()
            },
            hideAndShowRightArea() {
                indexJs.hideAndShowRightArea()
            },
            help() {
                this.helpDialogVisible = true
            },
            next() {
                indexJs.next()
            },
            back() {
                indexJs.back()
            },
            importGraph() {
                indexJs.hideRMenu('moreMenu')
                $('#importGraphInp').click()
            },
            importGraphSubmit(data) {
                indexJs.importGraph(data)
            },
            exportGraph() {
                indexJs.exportGraph()
            },
            getGraphObject() {
                if (this.showGraphListType === 'open') { // 打开方法
                    const returnObj = this.$refs.graphListExport.getChooseGraph()
                    if (returnObj.isError) {
                        this.$message({ type: 'warning', message: returnObj.message })
                    } else {
                        this.graphListDialogVisible = false
                        this.$nextTick(() => {
                            var urlParamStr = ''
                            if (returnObj.graphType === 3) {
                                if (returnObj.publicType === 1) { // 场景查询
                                    urlParamStr = '?graphUuid=' + returnObj.graphUuid + '&openGraphType=3'
                                } else { // 个人场景查询
                                    urlParamStr = '?graphUuid=' + returnObj.graphUuid + '&openGraphType=2'
                                }
                            } else { // 个人图形
                                urlParamStr = '?graphUuid=' + returnObj.graphUuid + '&openGraphType=1'
                            }
                            this.$store.commit('aceState/setRightFooterTags', {
                                type: 'active',
                                val: {
                                    name: '编辑图形',
                                    path: `/graphtool/tooldic${urlParamStr}&openType=${this.openType}`
                                }
                            })
                        })
                    }
                } else { // this.showGraphListType === 'export'，图形导出方法
                    const returnObj = this.$refs.graphListExport.getChooseGraphs()
                    if (returnObj.isError) {
                        this.$message({ type: 'warning', message: returnObj.message })
                    } else {
                        this.graphListDialogVisible = false
                        indexJs.exportGraphBack(returnObj)
                    }
                }
            },
            saveNodeSetting() {
                commonJs.saveNodeSetting()
            },
            closeNodeSetting() {
                this.$refs.nodeSetting.$confirm('即将关闭配置页面，是否更新并保存配置信息?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true,
                    closeOnClickModal:false,
                    closeOnPressEscape:false
                }).then(() => {
                    commonJs.saveNodeSetting()
                }).catch(() => {
                    this.nodeSettingDialogVisible = false
                })
            },
            showParamNodeList() {
                indexJs.showParamNodeList()
            },
            showParamNodeListCallBack() {
                indexJs.showParamNodeListCallBack()
            },
            settingParam(nodeId, index) {
                indexJs.settingParam(nodeId, index)
            },
            settingParamsCallBack() {
                indexJs.settingParamsCallBack()
            },
            clearSettingParam(nodeId, index) {
                indexJs.clearSettingParam(nodeId, index)
            },
            reNameCallBack(){
                commonJs.reNameCallBack()
            },
            async setExecuteParamCallBack(){
                let returnVal = await this.$refs.inputParams.replaceNodeParam()
                if (returnVal.verify) {
                    this.nodeParamDialogVisible = false
                    // 节点的核心执行方法
                    if(this.executeType === 'all'){//全部执行
                        commonJs.executeAllNode_callback(this.executeNodeIdArr, this.executeNodeObject)
                    }else{//其他执行
                        commonJs.executeNode_callback(this.executeNodeIdArr)
                    }
                } else {
                    this.$refs.inputParams.$message({'type':'warning', 'message':returnVal.message})
                }
            },
            sqlNodeEditCallBack(){
                commonJs.sqlNodeEdit_callBack()
            },
            viewEgEvent(event){
                if(event.target.nodeName === "A" && event.target.className === "viewEg"){//数据关联、数据融合节点查看图片
                    let type = event.target.getAttribute("data_type")
                    if(typeof type !== 'undefined'){
                        this.imageSrc = require(`@/api/graphtool/images/${type}.jpg`)
                        this.imageDialogVisible = true
                    }
                }
            },
            /**
             * 接口：获取节点参数信息
             */
            getParamsArr() {
                return indexJs.getParamsArr()
            },
            /**
             * 接口：获取中间、最终结果表的输出列信息
             */
            getResultColumnInfo() {
                return indexJs.getResultColumnInfo()
            },
            /**
             * 接口，用于保存模型时存储图形信息
             */
            async saveModelGraph() {
                return await indexJs.saveModelGraph()
            }
        }
    }

</script>
<!--引入图形化工具专用CSS样式-->
<style scoped src="@/api/graphtool/css/index.css"></style>
