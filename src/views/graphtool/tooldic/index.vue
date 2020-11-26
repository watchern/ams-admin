<template>
    <div>
        <div id="geToolbarContainer" class="geToolbarContainer">
            <div class="menu" style="width: 235px !important;padding-left: 20px !important;">
                <div class="menuTit">
                    文件<img id="showMoreMenu" src="../tooldic/images/icon/more.png" title="更多" style="width:10px;height:10px;float: right;margin-top:5px;margin-right: 10px;" @click="showMoreMenu">
                </div>
                <div class="menuLi">
                    <div class="icon" style="width:70px !important;">
                        <img class="iconImg" style="width: 16px;height: 16px;" src="../tooldic/images/icon/new.png" alt="新建">
                        <a class="iconText" @click="newGraph">&nbsp;新建</a>
                    </div>
                    <div class="icon" style="width:60px !important;">
                        <img class="iconImg" src="../tooldic/images/icon/save.png" alt="保存">
                        <a class="iconText" @click="saveGraph('saveGraph')">保存</a>
                    </div>
                    <div class="icon" style="width:70px !important;margin-left: 10px;">
                        <img class="iconImg" src="../tooldic/images/icon/next.png" alt="前进">
                        <a class="iconText" @click="next">恢复</a>
                    </div>
                    <div class="icon" style="width:70px !important;">
                        <img class="iconImg" src="../tooldic/images/icon/open.png" alt="打开">
                        <a class="iconText" @click="openGraph">打开</a>
                    </div>
                    <div class="icon" style="width:70px !important;padding-left:6px;">
                        <img class="iconImg" style="width: 16px;height: 16px;" src="../tooldic/images/icon/saveAs.png" alt="另存为">
                        <a class="iconText" @click="saveGraph('saveAsGraph')">另存为</a>
                    </div>
                    <div class="icon" style="width:70px !important;">
                        <img class="iconImg" src="../tooldic/images/icon/back.png" alt="后撤">
                        <a class="iconText" @click="back">撤销</a>
                    </div>
                </div>
            </div>
            <div class="menu" style="width: 110px !important;">
                <div class="menuTit">运行</div>
                <div class="menuLi">
                    <div class="icon" style="width:100px !important;height: 60px !important;line-height: 60px !important;">
                        <img class="iconImg" src="../tooldic/images/icon/run.png" alt="全部运行">
                        <a class="iconText" onclick="executeAllNode()">全部运行</a>
                    </div>
                </div>
            </div>
            <div class="menu" style="width: 310px !important;">
                <div class="menuTit">行数据处理</div>
                <div class="menuLi">
                    <div id="filter" class="icon" data-type="filter">
                        <img class="iconImg" src="../tooldic/images/icon/filter.png" alt="数据筛选">
                        <a class="iconText">数据筛选</a>
                    </div>
                    <div id="sort" class="icon" data-type="sort">
                        <img class="iconImg" src="../tooldic/images/icon/sort.png" alt="数据排序">
                        <a class="iconText">数据排序</a>
                    </div>
                    <div id="sample" class="icon" data-type="sample">
                        <img class="iconImg" src="../tooldic/images/icon/sample.png" alt="数据抽样">
                        <a class="iconText">数据抽样</a>
                    </div>
                    <div id="layering" class="icon" data-type="layering">
                        <img class="iconImg" src="../tooldic/images/icon/layering.png" alt="数据分层">
                        <a class="iconText">数据分层</a>
                    </div>
                    <div id="groupCount" class="icon" data-type="groupCount">
                        <img class="iconImg" src="../tooldic/images/icon/groupCount.png" alt="分组汇总">
                        <a class="iconText">分组汇总</a>
                    </div>
                    <div id="delRepeat" class="icon" data-type="delRepeat">
                        <img class="iconImg" src="../tooldic/images/icon/delRepeat.png" alt="数据去重">
                        <a class="iconText">数据去重</a>
                    </div>
                </div>
            </div>
            <div class="menu" style="width: 135px !important;">
                <div class="menuTit">列数据处理</div>
                <div class="menuLi">
                    <div id="comparison" class="icon" data-type="comparison" style="width:130px !important;">
                        <img class="iconImg" src="../tooldic/images/icon/comparison.png" alt="数据频次分析">
                        <a class="iconText" style="padding-left: 5px;">数据频次分析</a>
                    </div>
                    <div id="change" class="icon" data-type="change">
                        <img class="iconImg" src="../tooldic/images/icon/change.png" alt="数据转码">
                        <a class="iconText" style="padding-left: 5px;">数据转码</a>
                    </div>
                </div>
            </div>
            <div class="menu" style="width: 110px !important;">
                <div class="menuTit">表间数据处理</div>
                <div class="menuLi">
                    <div id="union" class="icon" data-type="union">
                        <img class="iconImg" src="../tooldic/images/icon/combineSet.png" alt="数据合并">
                        <a class="iconText">数据融合</a>
                    </div>
                    <div id="relation" class="icon" data-type="relation">
                        <img class="iconImg" src="../tooldic/images/icon/relation.png" alt="数据关联">
                        <a class="iconText">数据关联</a>
                    </div>
                </div>
            </div>
            <!--<div class="menu" style="width: 120px !important;">-->
            <!--<div class="menuTit">SQL</div>-->
            <!--<div class="menuLi">-->
            <!--<div class="icon" id="sql" data-type="sql" style="width:110px !important;height: 60px !important;line-height: 60px !important;">-->
            <!--<img class="iconImg" src="../tooldic/images/icon/sql.png" alt="SQL查询器"/>-->
            <!--<a class="iconText">SQL查询器</a>-->
            <!--</div>-->
            <!--</div>-->
            <!--</div>-->
            <!--<div class="menu" style="width: 120px !important;">-->
            <!--<div class="menuTit">图形</div>-->
            <!--<div class="menuLi">-->
            <!--<div class="icon" style="width:110px !important;height: 60px !important;line-height: 60px !important;" id="barChart" data-type="barChart">-->
            <!--<img class="iconImg" src="images/icon/customize.png" alt="自定义"/>-->
            <!--<a class="iconText">自定义图形</a>-->
            <!--</div>-->
            <!--</div>-->
            <!--</div>-->
            <div class="menu" style="width: 90px !important;">
                <div class="menuTit">帮助</div>
                <div class="menuLi" style="">
                    <div id="help" class="icon" data-type="help" style="width:80px !important;height: 60px !important;line-height: 60px !important;">
                        <img class="iconImg" src="../tooldic/images/icon/help.png" alt="帮助">
                        <a class="iconText" @click="help">帮助</a>
                    </div>
                </div>
            </div>
            <span id="toolBarSpan" @click="hideAndShow" style="position: absolute;right: 20px;bottom: 0px;font-weight: 800;">【折叠/展开】</span>
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
                                <a id="dataTableList" data-toggle="collapse" href="#collapse2"></a>
                            </h4>
                        </div>
                        <div id="collapse2" class="panel-collapse collapse in">
                            <div class="panel-body">
                                <div class="col-sm-12" style="height: 45px;">
                                    <input id="searchZtree" type="search" class="form-control" placeHolder="搜索关键字" autocomplete="off" style="padding-right: 35px;">
                                    <img id="searchImg" src="../tooldic/images/icon/search.png" @click="searchZtree">
                                </div>
                                <ul id="ztree_datasource" class="ztree" style="width: 100%;"></ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="graphContainer" class="graphContainer">
            <div id="geDiagramContainer" class="geDiagramContainer">
                <div id="geBackgroundPage" class="geBackgroundPage"></div>
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
                        <!--<img class="iconImg" src="../tooldic/images/icon/maximize.png" alt="最大化">-->
                        <!--<span class="iconText">最大化</span>-->
                    <!--</div>-->
                    <div class="layui-tab-content">
                        <div class="layui-tab-item">
                            <div id="tableArea">
                                <div v-for="result in resultTableArr" id="dataShow" class="data-show">
                                    <ChildTabs ref="childTabsRef" :key="result.nodeId" use-type="graph" :pre-value="preValue" />
                                </div>
                            </div>
                        </div>
                        <div class="layui-tab-item"><div id="sysInfoArea"></div></div>
                        <div class="layui-tab-item layui-show"><div id="outLineArea"></div></div>
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
                    <div class="form-group">
                        <label for="graphName_show" class="col-sm-2 control-label" style="text-align: right;">名称</label>
                        <div class="col-sm-10">
                            <input id="graphName_show" type="text" class="form-control" autocomplete="off" placeholder="名称" readonly>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="description_show" class="col-sm-2 control-label" style="text-align: right;">描述</label>
                        <div class="col-sm-10">
                            <textarea id="description_show" class="form-control" placeholder="描述" style="resize:none;min-height:100px;max-height:300px;" readonly></textarea>
                        </div>
                    </div>
                </div>
                <div id="nodeRemark" role="tabpanel" class="tab-pane">点击操作节点，可查看节点说明信息</div>
                <div id="usedResourceTree" role="tabpanel" class="tab-pane">
                    <ul id="resourceZtree" class="ztree"></ul>
                </div>
                <div id="historyTree" role="tabpanel" class="tab-pane">
                    <ul id="historyZtree" class="ztree"></ul>
                </div>
            </div>
        </div>
        <el-dialog :visible.sync="helpDialogVisible" title="帮助">
            <Help/>
        </el-dialog>
        <el-dialog :visible.sync="graphListDialogVisible" title="图形列表" :close-on-press-escape="pressEscape" :close-on-click-modal="clickModal">
            <GraphListExport ref="graphListExport" :openType="openType"/>
            <div slot="footer">
                <el-button type="primary" @click="getGraphObject">确定</el-button>
                <el-button type="primary" @click="graphListDialogVisible = false">关闭</el-button>
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
                            <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 5}" placeholder="请输入内容" v-model="description"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer">
                <el-button type="primary" @click="getGraphFormInfo">确定</el-button>
                <el-button type="primary" @click="graphFormVisible = false">关闭</el-button>
            </div>
        </el-dialog>
        <!-- 右键事件 -->
        <div id="rootMenu" class="rightMenu">
            <ul>
                <li onclick="rootDataRefresh">刷新</li>
            </ul>
        </div>
        <!--<div id="rMenu" class="rightMenu">-->
            <!--<ul>-->
                <!--<li @click="viewData">预览数据</li>-->
                <!--<li @click="relationTableQuery">关联表查询</li>-->
                <!--<li @click="editTable_li">修改表结构</li>-->
                <!--<li @click="dropTable_li">删除表</li>-->
            <!--</ul>-->
        <!--</div>-->
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
        <input id="importGraphInp" @change="importGraphSubmit" type="file" name="file" style="display: none;"/>

        <form id="chooseFileTypeForm" class="form-horizontal" style="display:none;">
            <label class="col-sm-4 control-label" style="padding: 13px 20px 0 0;">文件格式</label>
            <div class="col-sm-8">
                <ul class="radio">
                    <li>
                        <input id="xls_type" type="radio" value="xls" checked="checked" name="fileType">
                        <label for="xls_type">xls</label>
                    </li>
                </ul>
                <ul class="radio">
                    <li>
                        <input id="xlsx_type" type="radio" value="xlsx" name="fileType">
                        <label for="xlsx_type">xlsx</label>
                    </li>
                </ul>
            </div>
        </form>
    </div>
</template>

<script>
    import Cookies from 'js-cookie'
    import Help from '@/views/graphtool/tooldic/page/funEventVue/help.vue'
    import GraphListExport from '@/views/graphtool/tooldic/page/funEventVue/graphListExport.vue'
    import ChildTabs from '@/views/analysis/auditmodelresult/childtabs'
    // 引入后端接口的相关方法
    import { getGraphInfoById, getTableCol,viewNodeData,saveGraphInterface } from '@/api/graphtool/graphList'
    import { initTableTip } from '@/api/analysis/sqleditor/sqleditor'
    // 引入前段JS的相关方法
    import * as commonJs from '@/views/graphtool/tooldic/js/common'
    import * as indexJs from '@/views/graphtool/tooldic/js/index'
    import * as validateJs from '@/views/graphtool/tooldic/js/validate'
    var ownerEditor, graph
    // 点击操作节点，显示说明信息
    $('.iconText').click(function(i, v) {
        var optType = $(this).parent().attr('data-type')
        var optTypeArr = ['filter', 'sort', 'sample', 'layering', 'groupCount', 'delRepeat', 'comparison', 'change', 'union', 'relation', 'sql', 'barChart']
        if ($.inArray(optType, optTypeArr) > -1) {
            indexJs.nodeRemark(optType)
        }
    })
    export default {
        name: 'ToolIndex',
        data() {
            return {
                zTreeObj: null,
                resourceZtree: null,
                historyZtree: null,
                resourceRootNode:null,
                historyRootNode:null,
                helpDialogVisible:false,
                graphListDialogVisible:false,
                pressEscape:false,
                clickModal:false,
                oldGraphData:null,// 用来接收打开的图形全部节点数据信息的对象
                openType_graph:2,// 默认打开的当前图形的数据源环境是权限环境
                createUserId:'',// 当前图形的创建人ID（只使用于验证普通图形）
                loginUserUuid:'',// 当前登录人UUID
                canEditor: true,// 当前图形化是否可编辑
                hasManagerRole: false,// 是否觉有管理员权限（只在开发环境下会用到，用以对左侧资源树的表进行分类）
                graphUuid:getParams().graphUuid,// 打开图形的ID
                graphName:'',
                description:'',
                openGraphType: Number(getParams().openGraphType),// 当前所打开的图形类型：1、普通图形，2、个人场景查询，3、公共场景查询，4、模型图形
                openType: Number(getParams().openType),// 打开方式（当前所有使用数据源环境：1、开发测试环境，2、业务权限环境）
                loading:null,//遮罩层对象
                webSocket:null,
                executeType:1,//节点执行的类型（1、执行本节点、2、执行到本节点、3、全部执行）
                resultTableArr:[],//节点结果集集合
                executeId:'',//当前执行批次ID
                executeNodeIdArr:[],//当前执行批次的节点ID集合
                graphFormVisible:false,
                graphFormTitle:'',
                saveGraphType:'saveGraph',//保存、另存为图形
                websocketBatchId:'',
                showGraphListType:'',
                activeTabName:'outLineArea',
                preValue:[]//结果集页签数组
            }
        },
        components:{ Help, GraphListExport,ChildTabs },
        created() {
            this.init()
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
            // 将vue实例传给JS
            indexJs.sendIndexJs(this)
            commonJs.sendGraphIndexVue(this)
            //初始化websocket
            this.initWebSocKet()

        },
        methods: {
            init() {
                // console.log(Cookies.get("personuuid"))
                this.loginUserUuid = Cookies.get("personuuid")
                // this.loginUserUuid = '2c948a86757909950175790b10b60002'
                let roleArr = this.$store.getters.roles
                let screenManager = 'screenManager'// 场景查询管理员角色
                if (roleArr.includes(screenManager)) {
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
                window.cancelExecute = commonJs.cancelExecute
                window.reName = commonJs.reName
                window.curNodeSQL = commonJs.curNodeSQL
                window.deleteCells = commonJs.deleteCells
            },
            initIndex() {
                window.refrashResourceZtree = indexJs.refrashResourceZtree
                window.refrashHistoryZtree = indexJs.refrashHistoryZtree
                window.autoSaveGraph = indexJs.autoSaveGraph
                window.nodeRemark = indexJs.nodeRemark
                window.deleteResourceZtreeNode = indexJs.deleteResourceZtreeNode
            },
            initValidateFun() {
                window.edgeVerify = validateJs.edgeVerify
            },
            initGraph() {
                if (!mxClient.isBrowserSupported()) {
                    this.$message({ type: 'info', message: '您的浏览器不支持图形设计。请更换浏览器' })
                    return
                }
                mxResources.loadDefaultBundle = false
                var bundle = mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) || mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage)
                var defaultXmlUrl = STYLE_PATH + '/default.xml'
                mxUtils.getAll([bundle, defaultXmlUrl], function(xhr) {
                    mxResources.parse(xhr[0].getText())
                    var themes = new Object()
                    themes['default'] = xhr[1].getDocumentElement()
                    ownerEditor = new EditorUi(new Editor(themes))
                    graph = ownerEditor.editor.graph
                    graph.setCellsResizable(false)// 关闭改变节点大小
                    graph.setAllowLoops(false)// 不允许连接的源和目标是同一节点
                    graph.setCellsEditable(false)// 关闭编辑节点
                    // 图形化模型 数据对象
                    graph.nodeData = {}
                    graph.historyNodeInfo = {}
                    // 用来存放每次操作节点的节点信息（包括剪切、复制、删除、粘贴、撤销、还原操作）
                    graph.oldOptArr = []
                    graph.newOptArr = []
                    graph.edgeArr = {}
                    // 缩略图
                    var container = document.getElementById('geBackgroundPage')
                    var outline = document.getElementById('outLineArea')
                    outline.style.position = 'absolute'
                    outline.style.width = '97%'
                    outline.style.height = '135px'
                    outline.style.border = '1px solid whiteSmoke'
                    outline.style.backgroundColor = '#FFFFFF'
                    outline.style.overflow = 'hidden'
                    new mxOutline(graph, outline)
                    // 设置鼠标经过时的高亮样式
                    new mxCellTracker(graph, '#00A8FF')
                    window.ownerEditor = ownerEditor
                    window.graph = graph
                }, function() {
                    document.body.innerHTML = '<center style="margin-top:10%;">加载资源文件出错</center>'
                })
                if (this.openGraphType === 3) {
                    if (this.hasManagerRole === false) {
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
                let initGraphInterval = setInterval(function() {
                    if (graph != null) {
                        clearInterval(initGraphInterval)
                        if (typeof $this.openType !== 'undefined') {
                            $('#dataTableList').html($this.openType === 1 ? '开发测试库数据' : '业务生产库数据')
                        } else {
                            $this.openType = 2
                            $('#dataTableList').html('业务生产库数据')
                        }
                        graph.openType = $this.openType
                        graph.canEditor = $this.canEditor
                        graph.openGraphType = $this.openGraphType
                        switch ($this.openGraphType) {
                            case 1:
                                graph.graphType = 1// 当前图形是个人图形
                                break
                            case 2:
                            case 3:
                                graph.graphType = 3// 当前图形是场景查询图形（包括公共场景查询和个人场景查询）
                                break
                            case 4:
                                graph.graphType = 4// 当前图形是模型图形
                                break
                        }
                        // 处理文件中的更多菜单
                        if ($this.openGraphType !== 1) { // 如果当前图形不是普通图形（即场景查询图形和模型图形）
                            if ($this.openType === 1) { // 开发环境下
                                $('#moreMenu>ul>li:gt(1)').hide()// 禁用【数据导入】、【生成场景查询】、【生成风险查证模型】菜单
                            } else { // 权限环境下
                                var ind = 2// 默认禁用【生成场景查询】、【生成风险查证模型】菜单
                                if ($this.canEditor === false) { // 如果不可编辑
                                    ind = 1// 禁用【数据导入】、【生成场景查询】、【生成风险查证模型】菜单
                                }
                                $('#moreMenu>ul>li:gt(' + ind + ')').hide()
                            }
                        } else {
                            if ($this.openType === 1) {
                                $('#moreMenu>ul>li:eq(2)').hide()// 只禁用【数据导入】功能
                            }
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
                        initTableTip(obj.loginUserUuid).then(response => {
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
                    $.each($('.icon'), function() {
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
            initWebSocKet(){
                let $this = this
                // const webSocketPath = process.env.VUE_APP_GRAPHTOOL_WEB_SOCKET + this.$store.getters.personuuid;
                const webSocketPath = process.env.VUE_APP_GRAPHTOOL_WEB_SOCKET + this.loginUserUuid + 'GRAPH'
                console.log('webSocketPath'+webSocketPath)
                // WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
                this.webSocket = new WebSocket(webSocketPath) // 建立与服务端的连接
                // 当服务端打开连接
                this.webSocket.onopen = function(event) {

                }
                // 发送消息
                this.webSocket.onmessage = function(event) {
                    let dataObj = JSON.parse(event.data)//接收到返回结果
                    var executeTaskObj = dataObj.executeTask
                    var executeSQLObj = dataObj.executeSQL
                    if(executeTaskObj.resultType === 'NotSelect'){//只执行组装的SQL
                        let cueNodeId = executeSQLObj.id;
                        let nodeInfo = JSON.parse(executeSQLObj.customParam[1])
                        let isEnd = executeSQLObj.customParam[2]
                        if(executeSQLObj.state === "2"){//执行成功
                            nodeInfo.nodeExcuteStatus = 3
                            delete nodeInfo.createSql;
                            delete nodeInfo.dropTableViewSql;
                            $('#sysInfoArea').append("<p style='color:#0DD140'>节点【"+executeSQLObj.name+"】执行成功！</p>")
                            for(let k=0; k<$this.executeNodeIdArr.length; k++){//找出当前节点的下一个节点即结果表节点
                                if($this.executeNodeIdArr[k] === cueNodeId){
                                    let nextNodeId = $this.executeNodeIdArr[k+1]
                                    if(typeof nextNodeId !== "undefined"){
                                        graph.nodeData[nextNodeId].nodeInfo.nodeExcuteStatus = 3
                                        break
                                    }
                                }
                            }
                        }
                        if(executeSQLObj.state === "3"){//执行失败
                            $this.loading.destroy()
                            nodeInfo.nodeExcuteStatus = 4
                            delete nodeInfo.resultTableName;
                            delete nodeInfo.createSql;
                            delete nodeInfo.dropTableViewSql;
                            $('#sysInfoArea').append("<p style='color:red'>节点【"+executeSQLObj.name+"】执行失败！\n错误信息："+ executeSQLObj.msg +"</p>");
                            $this.layuiTabClickLi(1)
                        }
                        let curNodeInfo = graph.nodeData[cueNodeId].nodeInfo
                        graph.nodeData[cueNodeId].nodeInfo = {...curNodeInfo, ...nodeInfo}
                        // 循环所有节点变更执行状态有变化的节点执行状态信息
                        commonJs.nodeCallBack($this.executeNodeIdArr, null, $this.executeId)
                        if($this.executeType === 3){//全部执行，显示标记为中间结果表或最终结果表的结果集

                        }else{//执行本节点和执行到本节点，只显示当前节点的结果集
                            if(isEnd){
                                let nodeId = cueNodeId
                                let nodeName = executeSQLObj.name
                                let resultTableName = nodeInfo.resultTableName
                                $this.resultTableArr.push({nodeId,nodeName,resultTableName})
                                $this.preValue.push({id:nodeId,name:nodeName})
                            }
                        }
                        console.log($this.resultTableArr)
                        if(isEnd && executeSQLObj.state === "2"){
                            console.log('viewData')
                            // 记录执行操作
                            indexJs.refrashHistoryZtree('【' + executeSQLObj.name + '】节点执行完毕')
                            // 自动保存图形化
                            indexJs.autoSaveGraph()
                            $this.layuiTabClickLi(0)
                            $this.loading.destroy()
                            $this.loading = $('#tableArea').mLoading({ 'text': '数据请求中，请稍后……', 'hasCancel': false,'hasTime':true })
                            //预览数据
                            $this.viewData()
                        }
                    }
                    if(executeTaskObj.resultType === 'select'){//展示节点结果集数据
                        $this.loading.destroy()
                        if(executeSQLObj.customParam[0] === $this.websocketBatchId){//展示当前操作的结果集
                            console.log($this.$refs.childTabsRef)
                            console.log($this.$refs.childTabsRef.length)
                            $this.$nextTick( () => {
                                $this.$refs.childTabsRef[0].loadTableData(dataObj)
                            })
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
            newGraph(){
                // this.$confirm('新建图形将在当前页打开，是否继续?', '提示', {
                //     confirmButtonText: '确定',
                //     cancelButtonText: '取消',
                //     type: 'info',
                //     center: true
                // }).then(() => {
                    // let url = `/graphtool/tooldic?openGraphType=1&openType=${this.openType}`
                    // this.$router.replace({path: url});
                    window.open(`/#/graphtool/tooldic?openGraphType=1&openType=${this.openType}`, '_blank')
                    // const {href} = this.$router.resolve({
                    //     path: url,
                    // });
                    // window.open(href,'_blank');
                // }).catch(() => {
                //     this.$message({ type: 'info', message: '已取消' })
                // })
            },
            openGraph(){
                indexJs.openGraph()
            },
            saveGraph(type){
                this.saveGraphType = type
                var str = type === 'saveGraph' ? '保存' : '另存为'
                if (this.canEditor === false) {
                    this.$message({ type: 'info', message: '当前图形您没有【' + str + '】操作的权限' })
                }else{
                    if (Object.keys(graph.nodeData).length === 0) {
                        this.$message({ type: 'info', message: '当前图形无节点数据，不可保存' })
                    }else{
                        this.graphFormVisible = true
                        this.graphFormTitle = `图形${str}`
                    }
                }
            },
            getGraphFormInfo(){
                if($.trim(this.graphName) === ''){
                    this.$message({ type: 'info', message: '请输入图形名称' })
                    return
                }
                let encoder = new mxCodec()
                let node = encoder.encode(graph.getModel())
                let xml = mxUtils.getPrettyXml(node)
                var data = {
                    'createType': this.openType,
                    'executeStatus': indexJs.getExecuteDetail(),
                    'graphName': this.graphName,
                    'description': this.description,
                    'graphXml': xml,
                    'graphType': 1, // 个人图形
                    'nodeData': JSON.stringify(graph.nodeData) // 各个节点的配置信息
                }
                if (this.saveGraphType === 'saveGraph') {
                    data.graphUuid = this.graphUuid
                }
                saveGraphInterface(data).then(response => {
                    this.graphFormVisible = false
                    if (response.data == null) {
                        this.$message({ type: 'info', message: '图形保存失败' })
                    } else {
                        this.graphUuid = response.data
                        if (this.saveGraphType === 'saveGraph') {
                            $('#graphName_show').val(this.graphName)
                            $('#description_show').val(this.description)
                        }
                        this.$message({ type: 'info', message: '图形保存成功' })
                    }
                })
            },
            searchZtree() {
                indexJs.searchZtree()
            },
            viewData() {
                viewNodeData({nodeObjs:JSON.stringify(this.resultTableArr),openType:this.openType,websocketBatchId:this.websocketBatchId}).then()
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
                $("ul.layui-tab-title>li").removeClass("layui-this")
                $("div.layui-tab-item").removeClass("layui-show")
                $("ul.layui-tab-title>li:eq("+index+")").addClass("layui-this")
                $("div.layui-tab-item:eq("+index+")").addClass("layui-show")
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
            hideAndShow(){
                indexJs.hideAndShow()
            },
            hideAndShowToolBar(){
                indexJs.hideAndShowToolBar()
            },
            hideAndShowLeftArea(){
                indexJs.hideAndShowLeftArea()
            },
            hideAndShowRightArea(){
                indexJs.hideAndShowRightArea()
            },
            help(){
                this.helpDialogVisible = true
            },
            next(){
                indexJs.next()
            },
            back(){
                indexJs.back()
            },
            importGraph(){
                indexJs.hideRMenu('moreMenu')
                $('#importGraphInp').click()
            },
            importGraphSubmit(data){
                indexJs.importGraph(data);
            },
            exportGraph(){
                indexJs.exportGraph()
            },
            getGraphObject(){
                if(this.showGraphListType === 'open'){//打开方法
                    let returnObj = this.$refs.graphListExport.getChooseGraph();
                    if(returnObj.isError){
                        this.$message({ type: 'info', message: returnObj.message })
                    }else{
                        this.graphListDialogVisible = false
                        this.$nextTick( () => {
                            // this.$confirm('图形将在当前页打开，是否继续?', '提示', {
                            //     confirmButtonText: '确定',
                            //     cancelButtonText: '取消',
                            //     type: 'info',
                            //     center: true
                            // }).then(() => {
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
                            window.open(`/#/graphtool/tooldic${urlParamStr}&openType=${this.openType}`, '_blank')
                            // }).catch(() => {
                            //     this.$message({ type: 'info', message: '已取消' })
                            // })
                        })
                    }
                }else{//this.showGraphListType === 'export'，图形导出方法
                    let returnObj = this.$refs.graphListExport.getChooseGraphs();
                    if(returnObj.isError){
                        this.$message({ type: 'info', message: returnObj.message })
                    }else{
                        this.graphListDialogVisible = false
                        indexJs.exportGraphBack(returnObj);
                    }
                }
            }
        }
    }

</script>

<style scoped src="@/views/graphtool/tooldic/css/index.css"></style>
