<template>
    <div id="graphToolDiv" ref="graphToolDiv" style="width: 100%;height: 100%;">
        <div id="geToolbarContainer" class="geToolbarContainer">
            <div class="graphMenu" style="width: 235px !important;padding-left: 20px !important;">
                <div class="menuTit">
                    文件<img v-show="openGraphType !== 4" id="showMoreMenu" src="../tooldic/images/icon/more.png" title="更多" style="width:10px;height:10px;float: right;margin-top:5px;margin-right: 10px;" @click="showMoreMenu">
                </div>
                <div class="menuLi" v-show="openGraphType !== 4">
                    <div class="graphIcon" style="width:70px !important;">
                        <img class="iconImgGraph" style="width: 16px;height: 16px;" src="../tooldic/images/icon/new.png" alt="新建">
                        <a class="iconText" @click="newGraph">&nbsp;新建</a>
                    </div>
                    <div class="graphIcon" style="width:60px !important;">
                        <img class="iconImgGraph" src="../tooldic/images/icon/save.png" alt="保存">
                        <a class="iconText" @click="saveGraph('saveGraph')">保存</a>
                    </div>
                    <div class="graphIcon" style="width:70px !important;margin-left: 10px;">
                        <img class="iconImgGraph" src="../tooldic/images/icon/next.png" alt="前进">
                        <a class="iconText" @click="next">恢复</a>
                    </div>
                    <div class="graphIcon" style="width:70px !important;">
                        <img class="iconImgGraph" src="../tooldic/images/icon/open.png" alt="打开">
                        <a class="iconText" @click="openGraph">打开</a>
                    </div>
                    <div class="graphIcon" style="width:70px !important;padding-left:6px;">
                        <img class="iconImgGraph" style="width: 16px;height: 16px;" src="../tooldic/images/icon/saveAs.png" alt="另存为">
                        <a class="iconText" @click="saveGraph('saveAsGraph')">另存为</a>
                    </div>
                    <div class="graphIcon" style="width:70px !important;">
                        <img class="iconImgGraph" src="../tooldic/images/icon/back.png" alt="后撤">
                        <a class="iconText" @click="back">撤销</a>
                    </div>
                </div>
                <div class="menuLi" v-show="openGraphType === 4">
                    <div class="graphIcon" style="width:70px !important;height: 60px !important;line-height: 60px !important;">
                        <img class="iconImgGraph" src="../tooldic/images/icon/open.png" alt="打开">
                        <a class="iconText" @click="openGraph">打开</a>
                    </div>
                    <div class="graphIcon" style="width:70px !important;height: 60px !important;line-height: 60px !important;">
                        <img class="iconImgGraph" src="../tooldic/images/icon/next.png" alt="前进">
                        <a class="iconText" @click="next">恢复</a>
                    </div>
                    <div class="graphIcon" style="width:70px !important;height: 60px !important;line-height: 60px !important;">
                        <img class="iconImgGraph" src="../tooldic/images/icon/back.png" alt="后撤">
                        <a class="iconText" @click="back">撤销</a>
                    </div>
                </div>
            </div>
            <div class="graphMenu" style="width: 110px !important;">
                <div class="menuTit">运行</div>
                <div class="menuLi">
                    <div class="graphIcon" style="width:100px !important;height: 60px !important;line-height: 60px !important;">
                        <img class="iconImgGraph" src="../tooldic/images/icon/run.png" alt="全部运行">
                        <a class="iconText" @click="executeAllNode">全部运行</a>
                    </div>
                </div>
            </div>
            <div class="graphMenu" style="width: 310px !important;">
                <div class="menuTit">行数据处理</div>
                <div class="menuLi">
                    <div id="filter" class="graphIcon" data-type="filter">
                        <img class="iconImgGraph" src="../tooldic/images/icon/filter.png" alt="数据筛选">
                        <a class="iconText">数据筛选</a>
                    </div>
                    <div id="sort" class="graphIcon" data-type="sort">
                        <img class="iconImgGraph" src="../tooldic/images/icon/sort.png" alt="数据排序">
                        <a class="iconText">数据排序</a>
                    </div>
                    <div id="sample" class="graphIcon" data-type="sample">
                        <img class="iconImgGraph" src="../tooldic/images/icon/sample.png" alt="数据抽样">
                        <a class="iconText">数据抽样</a>
                    </div>
                    <div id="layering" class="graphIcon" data-type="layering">
                        <img class="iconImgGraph" src="../tooldic/images/icon/layering.png" alt="数据分层">
                        <a class="iconText">数据分层</a>
                    </div>
                    <div id="groupCount" class="graphIcon" data-type="groupCount">
                        <img class="iconImgGraph" src="../tooldic/images/icon/groupCount.png" alt="分组汇总">
                        <a class="iconText">分组汇总</a>
                    </div>
                    <div id="delRepeat" class="graphIcon" data-type="delRepeat">
                        <img class="iconImgGraph" src="../tooldic/images/icon/delRepeat.png" alt="数据去重">
                        <a class="iconText">数据去重</a>
                    </div>
                </div>
            </div>
            <div class="graphMenu" style="width: 135px !important;">
                <div class="menuTit">列数据处理</div>
                <div class="menuLi">
                    <div id="comparison" class="graphIcon" data-type="comparison" style="width:130px !important;">
                        <img class="iconImgGraph" src="../tooldic/images/icon/comparison.png" alt="数据频次分析">
                        <a class="iconText" style="padding-left: 5px;">数据频次分析</a>
                    </div>
                    <div id="change" class="graphIcon" data-type="change">
                        <img class="iconImgGraph" src="../tooldic/images/icon/change.png" alt="数据转码">
                        <a class="iconText" style="padding-left: 5px;">数据转码</a>
                    </div>
                </div>
            </div>
            <div class="graphMenu" style="width: 110px !important;">
                <div class="menuTit">表间数据处理</div>
                <div class="menuLi">
                    <div id="union" class="graphIcon" data-type="union">
                        <img class="iconImgGraph" src="../tooldic/images/icon/combineSet.png" alt="数据合并">
                        <a class="iconText">数据融合</a>
                    </div>
                    <div id="relation" class="graphIcon" data-type="relation">
                        <img class="iconImgGraph" src="../tooldic/images/icon/relation.png" alt="数据关联">
                        <a class="iconText">数据关联</a>
                    </div>
                </div>
            </div>
            <div class="graphMenu" style="width: 120px !important;">
                <div class="menuTit">SQL</div>
                <div class="menuLi">
                    <div class="graphIcon" id="sql" data-type="sql" style="width:110px !important;height: 60px !important;line-height: 60px !important;">
                        <img class="iconImgGraph" src="../tooldic/images/icon/sql.png" alt="SQL查询器"/>
                        <a class="iconText">SQL查询器</a>
                    </div>
                </div>
            </div>
            <div class="graphMenu" style="width: 90px !important;">
                <div class="menuTit">参数</div>
                <div class="menuLi" style="">
                    <div id="nodeParamSet" class="graphIcon" data-type="nodeParamSet" style="width:80px !important;height: 60px !important;line-height: 60px !important;">
                        <img class="iconImgGraph" style="width: 16px;height: 16px;" src="../tooldic/images/icon/param.png" alt="参数">
                        <a class="iconText" @click="showParamNodeList">参数</a>
                    </div>
                </div>
            </div>
            <div class="graphMenu" style="width: 90px !important;">
                <div class="menuTit">帮助</div>
                <div class="menuLi" style="">
                    <div id="help" class="graphIcon" data-type="help" style="width:80px !important;height: 60px !important;line-height: 60px !important;">
                        <img class="iconImgGraph" src="../tooldic/images/icon/help.png" alt="帮助">
                        <a class="iconText" @click="help">帮助</a>
                    </div>
                </div>
            </div>
            <span id="toolBarSpan" style="position: absolute;right: 0;bottom: 2px;font-weight: 800;" @click="hideAndShow">【折叠/展开】</span>
        </div>
        <div id="accordion" class="panel-group">
            <ul class="nav nav-tabs" role="tablist">
                <li role="presentation" class="active">
                    <a href="#source" aria-control="source" role="tab" data-toggle="tab">资源</a>
                </li>
            </ul>
            <div class="tab-content">
                <div id="source" role="tabpanel" class="tab-pane active">
                    <!-- 数据源 -->
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h4 class="panel-title">
                                <a id="dataTableList" data-toggle="collapse" href="#ztree_datasource_collapse" />
                            </h4>
                        </div>
                        <div id="ztree_datasource_collapse" class="panel-collapse collapse in">
                            <div class="panel-body">
                                <div style="height: 45px;line-height:45px;">
                                    <el-input v-model="searchZtreeContent" placeholder="搜索关键字" class="input-with-select">
                                        <el-button slot="append" icon="el-icon-search" @click="searchZtree" />
                                    </el-input>
                                </div>
                                <ul id="ztree_datasource" class="ztree" style="width: 100%;" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="graphContainer" class="graphContainer">
            <div id="geDiagramContainer" class="geDiagramContainer">
                <div id="geBackgroundPage" ref="geBackgroundPage" class="geBackgroundPage" />
            </div>
            <div id="geResultContainer" class="geResultContainer">
                <div class="layui-tab">
                    <ul class="layui-tab-title">
                        <li @click="layuiTabClickLi(0)">数据结果集</li>
                        <li @click="layuiTabClickLi(1)">执行信息</li>
                        <li class="layui-this" @click="layuiTabClickLi(2)">缩略图</li>
                    </ul>
                    <!--<button id="viewAllData" class="btn btn-primary" onclick="viewAllData()" style="position: absolute;right: 200px;top: 10px;display:none;">预览全部数据</button>-->
                    <!--<button id="exportAllData" class="btn btn-primary" onclick="exportAllData()" style="position: absolute;right: 100px;top: 10px;display:none;">全部导出</button>-->
                    <!--<div id="maxOpen" style="width:80px;position: absolute;right: 0;top: 15px;display:none;" onclick="maxOpen()">-->
                    <!--<img class="iconImgGraph" src="../tooldic/images/icon/maximize.png" alt="最大化">-->
                    <!--<span class="iconText">最大化</span>-->
                    <!--</div>-->
                    <div class="layui-tab-content">
                        <div class="layui-tab-item">
                            <div id="tableArea">
                                <!--<div v-for="result in resultTableArr" v-if="showTableResult" class="data-show">-->
                                    <ChildTabs ref="childTabsRef" use-type="graph" :pre-value="resultTableArr" v-if="showTableResult"/>
                                <!--</div>-->
                            </div>
                        </div>
                        <div class="layui-tab-item"><div id="sysInfoArea" /></div>
                        <div class="layui-tab-item layui-show"><div id="outLineArea" ref="outLineArea" /></div>
                    </div>
                </div>
                <!--<el-tabs v-model="activeTabName" @tab-click="layuiTabClickLi">-->
                <!--<el-tab-pane label="数据结果集" name="tableArea">-->
                <!--<div id="tableArea">-->
                <!--<div v-for="result in resultTableArr" id="dataShow" class="data-show">-->
                <!--<ChildTabs ref="childTabsRef" :key="result.nodeId"/>-->
                <!--</div>-->
                <!--</div>-->
                <!--</el-tab-pane>-->
                <!--<el-tab-pane label="执行信息" name="sysInfoArea">-->
                <!--<div id="sysInfoArea"></div>-->
                <!--</el-tab-pane>-->
                <!--<el-tab-pane label="缩略图" name="outLineArea">-->
                <!--<template>-->
                <!--<div id="outLineArea"></div>-->
                <!--</template>-->
                <!--</el-tab-pane>-->
                <!--</el-tabs>-->
            </div>
        </div>
        <div id="detailContainer" class="panel-group">
            <ul class="nav nav-tabs" role="tablist">
                <li role="presentation" class="active">
                    <a href="#graphInfo" aria-control="graphInfo" role="tab" data-toggle="tab">图形信息</a>
                </li>
                <li role="presentation">
                    <a href="#nodeRemark" aria-control="nodeRemark" role="tab" data-toggle="tab">说明</a>
                </li>
                <li role="presentation">
                    <a href="#usedResourceTree" aria-control="usedResourceTree" role="tab" data-toggle="tab">所用资源</a>
                </li>
                <li role="presentation">
                    <a href="#historyTree" aria-control="historyTree" role="tab" data-toggle="tab">痕迹</a>
                </li>
            </ul>
            <div class="tab-content">
                <div id="graphInfo" role="tabpanel" class="tab-pane active">
                    <div style="margin-top: 15px;height: 40px;line-height: 40px;">
                        <label class="col-sm-2 control-label" style="text-align: right;">名称</label>
                        <div class="col-sm-10">
                            <input v-model="graphName_show" type="text" class="form-control" autocomplete="off" placeholder="名称" readonly>
                        </div>
                    </div>
                    <div style="margin-top: 10px;">
                        <label class="col-sm-2 control-label" style="text-align: right;">描述</label>
                        <div class="col-sm-10">
                            <textarea v-model="description_show" class="form-control" placeholder="描述" style="resize:none;min-height:100px;max-height:300px;" readonly />
                        </div>
                    </div>
                </div>
                <div id="nodeRemark" role="tabpanel" class="tab-pane">点击操作节点，可查看节点说明信息</div>
                <div id="usedResourceTree" role="tabpanel" class="tab-pane">
                    <ul id="resourceZtree" class="ztree" />
                </div>
                <div id="historyTree" role="tabpanel" class="tab-pane">
                    <ul id="historyZtree" class="ztree" />
                </div>
            </div>
        </div>
        <div id="geHsplit" />
        <div id="geVsplit" />
        <el-dialog :visible.sync="helpDialogVisible" title="帮助">
            <Help />
        </el-dialog>
        <el-dialog v-if="graphListDialogVisible" :visible.sync="graphListDialogVisible" title="选择图形" :close-on-press-escape="pressEscape" :close-on-click-modal="clickModal">
            <GraphListExport ref="graphListExport" :open-type="openType" />
            <div slot="footer">
                <el-button @click="graphListDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="getGraphObject">确定</el-button>
            </div>
        </el-dialog>
        <el-dialog :visible.sync="graphFormVisible" :title="graphFormTitle" :close-on-press-escape="pressEscape" :close-on-click-modal="clickModal" width="600px">
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
                            <el-input v-model="description" type="textarea" :autosize="{ minRows: 3, maxRows: 5}" placeholder="请输入内容" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer">
                <el-button @click="graphFormVisible = false">取消</el-button>
                <el-button type="primary" @click="getGraphFormInfo">保存</el-button>
            </div>
        </el-dialog>
        <el-dialog v-if="nodeParamListDialogVisible" :visible.sync="nodeParamListDialogVisible" title="参数节点列表" :close-on-press-escape="pressEscape" :close-on-click-modal="clickModal">
            <div  style="height: 400px;overflow-y: auto;">
                <table class="table table-bordered">
                    <thead>
                    <tr>
                        <th style="text-align: center">节点名称</th>
                        <th style="text-align: center">结果表序号</th>
                        <th style="text-align: center">操作</th>
                    </tr>
                    </thead>
                    <tbody ref="nodeParamToby">
                    <tr v-for="(nodeObj,index) in nodeParamArr" ref="paramSetTr" :index="index">
                        <td align="center">{{ nodeObj.nodeName }}</td>
                        <td align="center">{{ nodeObj.lineNum }}</td>
                        <td v-if="nodeObj.hasParamSet" align="center">
                            <button type="button" class="paramSetting btn btn-primary" @click="settingParam(nodeObj.nodeId,index)">修改参数</button>
                            <button id="clearBtn" type="button" class="btn btn-primary" style="margin-left: 10px;" @click="clearSettingParam(nodeObj.nodeId,index)">清除参数</button>
                        </td>
                        <td v-if="!nodeObj.hasParamSet" align="center">
                            <button type="button" class="paramSetting btn btn-primary" @click="settingParam(nodeObj.nodeId,index)">设置参数</button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div slot="footer">
                <el-button @click="nodeParamListDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="showParamNodeListCallBack()">保存</el-button>
            </div>
        </el-dialog>
        <el-dialog v-if="nodeParamSettingDialogVisible" :visible.sync="nodeParamSettingDialogVisible" title="设置节点参数" :close-on-press-escape="pressEscape" :close-on-click-modal="clickModal" width="1000px">
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
            :close-on-press-escape="pressEscape"
            :close-on-click-modal="clickModal"
            :before-close="closeNodeSetting"
            :modal-append-to-body="pressEscape"
            :destroy-on-close="!pressEscape"
            width="1000px"
        >
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
            :close-on-press-escape="pressEscape"
            :close-on-click-modal="clickModal"
            :width="sqlEditorWidth" top="20px"
            :modal-append-to-body="clickModal" :style="sqlEditorStyle">
            <!--width="100%"-->
            <!--:fullscreen="!clickModal"-->
            <SqlEditor ref="sqlEditor" callType="graphModel" :sqlValue="sqlEditorCurSql"/>
            <div v-if="graph.canEditor" slot="footer">
                <el-button @click="sqlEditorDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="sqlNodeEditCallBack()">保存</el-button>
            </div>
        </el-dialog>
        <el-dialog v-if="viewNodeSqlDialogVisible" :visible.sync="viewNodeSqlDialogVisible" title="查看SQL语句" :close-on-press-escape="pressEscape" :close-on-click-modal="clickModal" width="600px">
            <div style='height: 400px;padding: 20px;'>{{curNodeExecuteSQL}}</div>
        </el-dialog>
        <el-dialog v-if="nodeReNameDialogVisible" :visible.sync="nodeReNameDialogVisible" title="重命名" :close-on-press-escape="pressEscape" :close-on-click-modal="clickModal" width="600px">
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
        <el-dialog v-if="nodeParamDialogVisible" :visible.sync="nodeParamDialogVisible" title="设置执行参数" :close-on-press-escape="pressEscape" :close-on-click-modal="clickModal" width="600px">
            <InputParams ref="inputParams" :graph="graph" :nodeIdArr="executeNodeIdArr"/>
            <div slot="footer">
                <el-button @click="nodeParamDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="setExecuteParamCallBack">保存</el-button>
            </div>
        </el-dialog>
        <!-- 右键事件 -->
        <div id="rootMenu" class="rightMenu">
            <ul>
                <li onclick="rootDataRefresh">刷新</li>
            </ul>
        </div>
        <div id="rMenu" class="rightMenu">
            <ul>
                <li @click="viewData(true)">预览数据</li>
                <!--<li @click="relationTableQuery">关联表查询</li>-->
                <!--<li @click="editTable_li">修改表结构</li>-->
                <!--<li @click="dropTable_li">删除表</li>-->
            </ul>
        </div>
        <div id="folderMenu_dev" class="rightMenu">
            <ul>
                <li id="addFolder" @click="addFolder()">新建文件夹</li>
                <li id="eidtFolder" @click="editFolder()">修改文件夹</li>
                <li id="delFolder" @click="delFolder()">删除文件夹</li>
                <li id="moveTo" @click="moveTo('folderMenu_dev')">移动至</li>
                <li id="rootDataRefresh" @click="rootDataRefresh()">刷新</li>
            </ul>
        </div>
        <div id="moreMenu" class="rightMenu">
            <ul>
                <li @click="importGraph">图形导入</li>
                <li @click="exportGraph">图形导出</li>
                <!--<li @click="importData">数据导入</li>-->
                <!--<li @click="createDegreeModel('saveGraph')">生成风险查证模型</li>-->
                <!--<li @click="createScreenQuery('saveGraph')">生成场景查询</li>-->
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
    // 引入后端接口的相关方法
    import { removeJcCssfile, addCssFile, addJsFile } from "@/api/analysis/common"
    import { getGraphInfoById, getTableCol, viewNodeData, saveGraphInterface, createScreenQuery } from '@/api/graphtool/graphList'
    import { initTableTip } from '@/api/analysis/sqleditor/sqleditor'
    // 引入前段JS的相关方法
    import * as commonJs from '@/views/graphtool/tooldic/js/common'
    import * as indexJs from '@/views/graphtool/tooldic/js/index'
    import * as validateJs from '@/views/graphtool/tooldic/js/validate'
    export default {
        name: 'ToolIndex',
        components: { Help, GraphListExport, ChildTabs, SettingParams, NodeSetting, RelationSetting, InputParams, GroupCount, SqlEditor },
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
                pressEscape: false,
                clickModal: false,
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
                graphUuid: this.graphUuidParam, // 打开图形的ID
                openGraphType: this.openGraphTypeParam, // 当前所打开的图形类型：1、普通图形，2、个人场景查询，3、公共场景查询，4、模型图形
                openType: this.openTypeParam, // 打开方式（当前所有使用数据源环境：1、开发测试环境，2、业务权限环境）
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
                isSearchExpand:false// 左侧资源树搜索功能的变量
            }
        },
        created() {
            // 引入公用CSS、JS
            addCssFile('/lib/Ztree/css/zTreeStyle/zTreeStyle.css','zTreeStyle')
            addJsFile('/lib/bootstrap/js/bootstrap.min.js','bootstrap.min')
            addJsFile('/lib/Ztree/js/jquery.ztree_new.all.min.js','jquery.ztree_new.all.min')
            addJsFile('/lib/Ztree/js/jquery.ztree.excheck.min.js','jquery.ztree.excheck.min')
            addJsFile('/lib/Ztree/js/jquery.ztree.exhide.min.js','jquery.ztree.exhide.min')
            this.init()
        },
        beforeDestroy() {
            //销毁公用CSS、JS
            removeJcCssfile("zTreeStyle.css","css")
            removeJcCssfile("bootstrap.min.js","js")
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
                if (typeof this.graphUuid === 'undefined' || this.graphUuid == null) {
                    this.graphUuid = getParams().graphUuid
                }
                if (typeof this.openGraphType === 'undefined' || this.openGraphType == null) {
                    this.openGraphType = getParams().openGraphType ? Number(getParams().openGraphType) : 1
                }
                if (typeof this.openType === 'undefined' || this.openType == null) {
                    this.openType = getParams().openType ? Number(getParams().openType) : 2
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
            },
            initIndex() {
                let $this = this
                window.refrashResourceZtree = indexJs.refrashResourceZtree
                window.refrashHistoryZtree = indexJs.refrashHistoryZtree
                window.autoSaveGraph = indexJs.autoSaveGraph
                window.nodeRemark = indexJs.nodeRemark
                window.deleteResourceZtreeNode = indexJs.deleteResourceZtreeNode
                window.modifyParam = indexJs.modifyParam
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
                    this.$message({ type: 'info', message: '您的浏览器不支持图形设计。请更换浏览器' })
                    return
                }
                const $this = this
                // 点击操作节点，显示说明信息
                $('#graphToolDiv .iconText').click(function(i, v) {
                    const optType = $(this).parent().attr('data-type')
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
                    // var container = document.getElementById('geBackgroundPage')
                    // var outline = document.getElementById('outLineArea')
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
                this.loading = $('body').mLoading({ 'text': '正在加载，请稍后……', 'hasCancel': false })// 遮罩层对象
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
                var $this = this
                const initGraphInterval = setInterval(function() {
                    if ($this.graph != null) {
                        clearInterval(initGraphInterval)
                        if (typeof $this.openType !== 'undefined') {
                            $('#dataTableList').html($this.openType === 1 ? '开发测试库数据' : '业务生产库数据')
                        } else {
                            $this.openType = 2
                            $('#dataTableList').html('业务生产库数据')
                        }
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
                        // 处理文件中的更多菜单
                        // if ($this.openGraphType !== 1) { // 如果当前图形不是普通图形（即场景查询图形和模型图形）
                        //     if ($this.openType === 1) { // 开发环境下
                        //         $('#moreMenu>ul>li:gt(1)').hide()// 禁用【数据导入】、【生成场景查询】、【生成风险查证模型】菜单
                        //     } else { // 权限环境下
                        //         var ind = 2// 默认禁用【生成场景查询】、【生成风险查证模型】菜单
                        //         if ($this.canEditor === false) { // 如果不可编辑
                        //             ind = 1// 禁用【数据导入】、【生成场景查询】、【生成风险查证模型】菜单
                        //         }
                        //         $('#moreMenu>ul>li:gt(' + ind + ')').hide()
                        //     }
                        // } else {
                        //     if ($this.openType === 1) {
                        //         $('#moreMenu>ul>li:eq(2)').hide()// 只禁用【数据导入】功能
                        //     }
                        // }
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
                            },
                            onDrop: typeof onDrop === 'function' ? onDrop : function() {}
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
                        initTableTip(obj.$store.getters.datauserid,obj.$store.getters.scenecode).then(response => {
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
                        var id_type = $(this).attr('data-type')
                        if (typeof (id_type) !== 'undefined') {
                            var name = $(this).find('a').html()
                            var obj = {
                                type: id_type,
                                shape: 'rhombus',
                                id: id_type,
                                tId: new UUIDGenerator().id,
                                name: name
                            }
                            iconDrag(obj)
                        }
                    })
                }
            },
            initWebSocKet() {
                const $this = this
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
                            $this.layuiTabClickLi(0)
                            if(!$this.showTableResult){
                                $this.showTableResult = true
                            }
                            let index = $this.resultTableArr.findIndex( item => item.id === executeSQLObj.id)
                            if(index > -1) {
                                $this.$nextTick(() => {
                                    $this.$refs.childTabsRef.loadTableData(dataObj)
                                })
                            }
                        }else{
                            $('#sysInfoArea').html("<p style='color: red;'>预览结果集失败：" + executeSQLObj.msg + "</p>")
                            $this.layuiTabClickLi(1)
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
                    this.$message({ type: 'info', message: '当前图形您没有【' + str + '】操作的权限' })
                } else {
                    if (Object.keys(this.graph.nodeData).length === 0) {
                        this.$message({ type: 'info', message: '当前图形无节点数据，不可保存' })
                    } else {
                        this.graphFormVisible = true
                        this.graphFormTitle = `${str}图形`
                    }
                }
            },
            getGraphFormInfo() {
                if ($.trim(this.graphName) === '') {
                    this.$message({ type: 'info', message: '请输入图形名称' })
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
                        vueObj.$message.error({ message: msg_error })
                    } else {
                        vueObj.graphUuid = response.data
                        if (vueObj.saveGraphType === 'saveGraph') {
                            vueObj.graphName_show = vueObj.graphName
                            vueObj.description_show = vueObj.description
                        }
                        vueObj.$message({ type: 'info', message: msg_success })
                    }
                }
                if(this.openGraphType === 1){//个人图形
                    data.graphType = 1
                    saveGraphInterface(data).then(response => {
                        callBack(this,response,'图形保存成功','图形保存失败')
                    }).catch( error => {})
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
                    }).catch( error => {})
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
                            $this.layuiTabClickLi(0)
                            $this.viewData()
                        })
                    }
                } else {
                    this.loading.destroy()
                    this.loading = $('#tableArea').mLoading({ 'text': '数据请求中，请稍后……', 'hasCancel': false, 'hasTime': true })
                    viewNodeData({ nodeObjs: JSON.stringify(this.resultTableArr), openType: this.openType, websocketBatchId: this.websocketBatchId }).then()
                        .catch( error => {
                            this.loading.destroy()
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
            layuiTabClickLi(index) {
                if (index === 0) {
                    $('#exportAllData').show()
                    $('#viewAllData').show()
                    $('#maxOpen').show()
                } else {
                    $('#maxOpen').hide()
                    $('#exportAllData').hide()
                    $('#viewAllData').hide()
                }
                $('ul.layui-tab-title>li').removeClass('layui-this')
                $('div.layui-tab-item').removeClass('layui-show')
                $('ul.layui-tab-title>li:eq(' + index + ')').addClass('layui-this')
                $('div.layui-tab-item:eq(' + index + ')').addClass('layui-show')
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
                        this.$message({ type: 'info', message: returnObj.message })
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
                        this.$message({ type: 'info', message: returnObj.message })
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
<style scoped src="@/components/ams-bootstrap/css/bootstrap.css"></style>
<style scoped src="@/components/ams-basic/css/accordion.css"></style>
<style scoped src="@/views/graphtool/tooldic/css/index.css"></style>
