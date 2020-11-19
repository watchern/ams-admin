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
                        <a class="iconText" onclick="newGraph()">&nbsp;新建</a>
                    </div>
                    <div class="icon" style="width:60px !important;">
                        <img class="iconImg" src="../tooldic/images/icon/save.png" alt="保存">
                        <a class="iconText" onclick="saveGraph('saveGraph')">保存</a>
                    </div>
                    <div class="icon" style="width:70px !important;margin-left: 10px;">
                        <img class="iconImg" src="../tooldic/images/icon/next.png" alt="前进">
                        <a class="iconText" onclick="next()">恢复</a>
                    </div>
                    <div class="icon" style="width:70px !important;">
                        <img class="iconImg" src="../tooldic/images/icon/open.png" alt="打开">
                        <a class="iconText" onclick="openGraph()">打开</a>
                    </div>
                    <div class="icon" style="width:70px !important;padding-left:6px;">
                        <img class="iconImg" style="width: 16px;height: 16px;" src="../tooldic/images/icon/saveAs.png" alt="另存为">
                        <a class="iconText" onclick="saveGraph('saveAsGraph')">另存为</a>
                    </div>
                    <div class="icon" style="width:70px !important;">
                        <img class="iconImg" src="../tooldic/images/icon/back.png" alt="后撤">
                        <a class="iconText" onclick="back()">撤销</a>
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
                        <a class="iconText" onclick="help()">帮助</a>
                    </div>
                </div>
            </div>
            <span id="toolBarSpan" onclick="hideAndShow();" style="position: absolute;right: 20px;bottom: 0px;font-weight: 800;">【折叠/展开】</span>
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
                                <a id="dataTableList" data-toggle="collapse" href="#collapse2" />
                            </h4>
                        </div>
                        <div id="collapse2" class="panel-collapse collapse in">
                            <div class="panel-body">
                                <div class="col-sm-12" style="height: 45px;">
                                    <input id="searchZtree" type="search" class="form-control" placeHolder="搜索关键字" autocomplete="off" style="padding-right: 35px;">
                                    <img id="searchImg" src="../tooldic/images/icon/search.png" @click="searchZtree">
                                </div>
                                <ul id="ztree_datasource" class="ztree" style="overflow: auto;height: 100%;" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="graphContainer" class="graphContainer">
            <div id="geDiagramContainer" class="geDiagramContainer">
                <div id="geBackgroundPage" class="geBackgroundPage" />
            </div>
            <div id="geResultContainer" class="geResultContainer">
                <div class="layui-tab">
                    <ul class="layui-tab-title">
                        <li @click="layuiTabClickLi(0)">数据结果集</li>
                        <li @click="layuiTabClickLi(1)">执行信息</li>
                        <li class="layui-this" @click="layuiTabClickLi(2)">缩略图</li>
                    </ul>
                    <input id="hideSql" type="hidden">
                    <button id="viewAllData" class="btn btn-primary" onclick="viewAllData()" style="position: absolute;right: 200px;top: 10px;display:none;">预览全部数据</button>
                    <button id="exportAllData" class="btn btn-primary" onclick="exportAllData()" style="position: absolute;right: 100px;top: 10px;display:none;">全部导出</button>
                    <div id="maxOpen" style="width:80px;position: absolute;right: 0;top: 15px;display:none;" onclick="maxOpen()">
                        <img class="iconImg" src="../tooldic/images/icon/maximize.png" alt="最大化">
                        <span class="iconText">最大化</span>
                    </div>
                    <div class="layui-tab-content">
                        <div class="layui-tab-item"><div id="tableArea" /></div>
                        <div class="layui-tab-item"><div id="sysInfoArea" /></div>
                        <div class="layui-tab-item layui-show"><div id="outLineArea" /></div>
                    </div>
                </div>
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
                            <textarea id="description_show" class="form-control" placeholder="描述" style="resize:none;min-height:100px;max-height:300px;" readonly />
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
        <input id="loginUserId" type="hidden" value="<%=LoginUserInfo.getLoginUserId()%>">
        <input id="loginUserUuid" type="hidden" value="<%=LoginUserInfo.getLoginUserUUID()%>">
        <!-- 右 -->
        <div id="rootMenu" class="rightMenu">
            <ul>
                <li onclick="rootDataRefresh()">刷新</li>
            </ul>
        </div>
        <div id="rMenu" class="rightMenu">
            <ul>
                <li @click="viewData">预览数据</li>
                <li @click="relationTableQuery">关联表查询</li>
                <li @click="editTable_li">修改表结构</li>
                <li @click="dropTable_li">删除表</li>
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
                <li @click="importGraph()">图形导入</li>
                <li @click="exportGraph()">图形导出</li>
                <li @click="importData()">数据导入</li>
                <li @click="createDegreeModel('saveGraph')">生成风险查证模型</li>
                <li @click="createScreenQuery('saveGraph')">生成场景查询</li>
            </ul>
        </div>
        <div id="H_S_Menu" class="rightMenu">
            <ul>
                <li @click="hideAndShowToolBar()">折叠上方区域</li>
                <li @click="hideAndShowLeftArea()">折叠左侧区域</li>
                <li @click="hideAndShowRightArea()">折叠右侧区域</li>
            </ul>
        </div>
        <form id="saveGraph" class="form-horizontal" style="display:none;overflow-x:hidden">
            <input id="graphUuid" name="graphUuid" type="hidden">
            <div class="form-group">
                <label for="graphName" class="col-sm-2 control-label" style="text-align: right;">图形名称</label>
                <div class="col-sm-9">
                    <input id="graphName" name="graphName" type="text" class="form-control" autocomplete="off" placeholder="名称">
                </div>
                <div class="col-sm-1">
                    <span class="badge" style="color: red;">*</span>
                </div>
            </div>
            <div class="form-group">
                <label for="description" class="col-sm-2 control-label" style="text-align: right;">图形描述</label>
                <div class="col-sm-9">
                    <textarea id="description" name="description" class="form-control" placeholder="描述" style="resize:none;min-height:150px;max-height:300px;" />
                </div>
            </div>
        </form>
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
    // 引入后端接口的相关方法
    import { getGraphInfoById, getTableCol } from '@/api/graphtool/graphList'
    import { initTableTip } from '@/api/analysis/sqleditor/sqleditor'
    // 引入前段JS的相关方法
    import * as common from '@/views/graphtool/tooldic/js/common'
    import * as indexJs from '@/views/graphtool/tooldic/js/index'
    import * as validate from '@/views/graphtool/tooldic/js/validate'
    // import * as watermark from '@/views/graphtool/tooldic/js/watermark';
    // export var zTreeObj, resourceZtree, historyZtree;//左侧资源树、右侧所使用资源树、右侧操作痕迹树
    // var initGraphInterval;//用来监听当前graph是否加载完毕
    var oldGraphData = null// 用来接收打开的图形全部节点数据信息的对象
    // var resourceSetting = {},historySetting = {};//所使用资源配置信息对象、操作痕迹配置信息对象
    // var hL = null;//handSonTable表格对象
    // var isSearchExpand = false;//左侧资源树搜索功能的变量
    var graphUuid = getParams().graphUuid// 打开图形的ID
    var canEditor = true// 当前图形化是否可编辑
    var createUserId = ''// 当前图形的创建人ID（只使用于验证普通图形）
    var loginUserUuid = ''// 当前登录人UUID
    var openGraphType = Number(getParams().openGraphType)// 当前所打开的图形类型：1、普通图形，2、个人场景查询，3、公共场景查询，4、模型图形
    var openType = Number(getParams().openType)// 打开方式（当前所有使用数据源环境：1、开发测试环境，2、业务权限环境）
    var openType_graph = 2// 默认打开的当前图形的数据源环境是权限环境
    // var limitTime;//AJAX请求超时时限，默认25分钟
    var hasManagerRole = false// 是否觉有管理员权限（只在开发环境下会用到，用以对左侧资源树的表进行分类）
    // var curModelSql = "";//用来临时存储打开模型图形时的模型SQL语句
    var curModelId = getParams().modelId ? getParams().modelId : ''// 用来临时存储打开模型图形时的模型ID
    // var nodeParamRelArr = [];//用来存储每个节点设置的参数信息
    var ownerEditor, graph, loading
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
                historyZtree: null
            }
        },
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
        },
        methods: {
            init() {
                loginUserUuid = this.$store.getters.personuuid
                const roleArr = this.$store.getters.roles
                const screenManager = 'screenManager'// 场景查询管理员角色
                if (roleArr.includes(screenManager)) {
                    hasManagerRole = true
                }
            },
            initCommon() {
                window.lightHeight = common.lightHeight
                window.getDataSourceTable = common.getDataSourceTable
                window.changeNodeIcon = common.changeNodeIcon
                window.data_filter = common.data_filter
                window.setDataSourceCopyIcon = common.setDataSourceCopyIcon
                window.setNodeOutputTypeIcon = common.setNodeOutputTypeIcon
            },
            initIndex() {
                window.refrashResourceZtree = indexJs.refrashResourceZtree
                window.refrashHistoryZtree = indexJs.refrashHistoryZtree
                window.autoSaveGraph = indexJs.autoSaveGraph
                window.nodeRemark = indexJs.nodeRemark
            },
            initValidateFun() {
                window.edgeVerify = validate.edgeVerify
                window.verifyPreNodes = validate.verifyPreNodes
                window.verifyPreNode = validate.verifyPreNode
                window.settingVerify = validate.settingVerify
                window.executeVerify = validate.executeVerify
                window.verifyExecuting = validate.verifyExecuting
                window.verifyUnionOutputColumn = validate.verifyUnionOutputColumn
            },
            initGraph() {
                if (!mxClient.isBrowserSupported()) {
                    alertMsg('提示', '您的浏览器不支持图形设计。请更换浏览器', 'info')
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
                if (openGraphType === 3) {
                    if (!hasManagerRole) {
                        canEditor = false
                    }
                    // 此请求不需要做ID校验
                    this.loadGraph(graphUuid)
                } else {
                    if (graphUuid && graphUuid !== '') { // 如果ID有值，则加载图形信息
                        this.loadGraph(graphUuid)
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
                loading = $('body').mLoading({ 'text': '正在加载，请稍后……', 'hasCancel': false })// 遮罩层对象
                getGraphInfoById().then(response => {
                    if (response.data == null) {
                        loading.destroy()
                        alertMsg('提示', '加载图形失败', 'error')
                    } else {
                        try {
                            openType_graph = response.data.createType// 打开图形化的方式：1、开发环境（开发库）；2、权限环境（生产库）
                            createUserId = response.data.createUserId
                            oldGraphData = response.data
                            loading.destroy()
                            this.initJsp()
                        } catch (e) {
                            alertMsg('提示', '加载图形失败', 'error')
                            console.info(e)
                            loading.destroy()
                        }
                    }
                })
            },
            initJsp() {
                var $this = this
                // var initTree = this.initTree();
                const initGraphInterval = setInterval(function() {
                    if (graph != null) {
                        clearInterval(initGraphInterval)
                        if (typeof openType !== 'undefined') {
                            $('#dataTableList').html(openType === 1 ? '开发测试库数据' : '业务生产库数据')
                        } else {
                            openType = 2
                            $('#dataTableList').html('业务生产库数据')
                        }
                        graph.openType = openType
                        graph.canEditor = canEditor
                        graph.openGraphType = openGraphType
                        switch (openGraphType) {
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
                        if (openGraphType !== 1) { // 如果当前图形不是普通图形（即场景查询图形和模型图形）
                            if (openType === 1) { // 开发环境下
                                $('#moreMenu>ul>li:gt(1)').hide()// 禁用【数据导入】、【生成场景查询】、【生成风险查证模型】菜单
                            } else { // 权限环境下
                                var ind = 2// 默认禁用【生成场景查询】、【生成风险查证模型】菜单
                                if (canEditor === false) { // 如果不可编辑
                                    ind = 1// 禁用【数据导入】、【生成场景查询】、【生成风险查证模型】菜单
                                }
                                $('#moreMenu>ul>li:gt(' + ind + ')').hide()
                            }
                        } else {
                            if (openType === 1) {
                                $('#moreMenu>ul>li:eq(2)').hide()// 只禁用【数据导入】功能
                            }
                        }
                        loading = $('body').mLoading({ 'text': '正在初始化数据，请稍后……', 'hasCancel': false })
                        // 加载已有的图形化
                        if (oldGraphData && oldGraphData != null) {
                            openCallBack(oldGraphData)
                        }
                        $this.initTree($this)
                        /* 左侧数据表树，end*/
                        // $(".detail-toggle").each(function(index) {
                        //     $(".detail-toggle").eq(index).click(function() {
                        //         if(undefined === $(this).prop("show") || $(this).prop("show")) {
                        //             $(this).parent().next().slideUp();
                        //             $(this).prop("show", false);
                        //             $(this).removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
                        //         } else {
                        //             $(this).parent().next().slideDown();
                        //             $(this).prop("show", true);
                        //             $(this).removeClass("glyphicon-chevron-ups").addClass("glyphicon-chevron-down");
                        //         }
                        //
                        //     });
                        // });

                        // $("ul.layui-tab-title li").click(function(){
                        //     var index = $(this).index();
                        //     if(index === 0){
                        //         $("#exportAllData").show();
                        //         $("#viewAllData").show();
                        //         $("#maxOpen").show();
                        //     }else{
                        //         $("#maxOpen").hide();
                        //         $("#exportAllData").hide();
                        //         $("#viewAllData").hide();
                        //     }
                        // });
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
                    if (graph.canEditor) {
                        delete setting.edit
                        setting.callback.onNodeCreated = function(event, treeId, treeNode) {
                            // 为树节点创建拖动事件
                            if (treeNode.type === 'datasource') {
                                iconDrag(treeNode)
                            }
                        }
                    }
                    // 数据表根节点
                    if (openType === 1) {				// 开发测试环境
                        setting.view.selectedMulti = true// 允许ctrl多选
                        setting.callback.onClick = indexJs.onclick
                        $.post(contextPath + '/graphEditor/getDevelopTable', {}, function(e) {
                            if (e.isError) {
                                loading.destroy()
                                alertMsg('提示', '资源树列表加载出错', 'error')
                            } else {
                                // 统一表和试图的类型为datasource，不需要替换的就执行空方法
                                indexJs.replaceNodeType(e.nodeList)
                                obj.zTreeObj = $.fn.zTree.init($('#ztree_datasource'), setting, e.nodeList)
                                loading.destroy()
                            }
                        }, 'json')
                    } else {						// 业务权限环境
                        const params = { isRightControl: '1', dataUserId: loginUserUuid }
                        initTableTip(params).then(response => {
                            if (response.data == null) {
                                loading.destroy()
                                alertMsg('提示', '资源树列表加载出错', 'error')
                            } else {
                                // 统一表和试图的类型为datasource，不需要替换的就执行空方法
                                indexJs.replaceNodeType(response.data)
                                obj.zTreeObj = $.fn.zTree.init($('#ztree_datasource'), setting, response.data)
                                loading.destroy()
                            }
                        })
                    }
                }
                /* 右侧所使用资源树,start*/
                var resourceRootNode = { 'name': '所用资源', 'displayName': '所用资源', 'level': 0, 'isParent': true, 'open': true, 'type': 'rootNode', 'id': 'resourceRoot', 'pid': null, 'children': [] }
                obj.resourceZtree = $.fn.zTree.init($('#resourceZtree'), indexJs.resourceSetting, resourceRootNode)
                /* 右侧所使用资源树,end*/

                /* 右侧操作痕迹树,start*/
                var historyRootNode = { 'name': '操作痕迹', 'displayName': '操作痕迹', 'level': 0, 'isParent': true, 'open': true, 'type': 'rootNode', 'id': 'historyRoot', 'pid': null, 'children': [] }
                obj.historyZtree = $.fn.zTree.init($('#historyZtree'), indexJs.historySetting, historyRootNode)
                /* 右侧操作痕迹树,end*/
                /* 左侧数据表树，start*/
                loadZtree()
                if (graph.canEditor) {
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
            searchZtree() {
                indexJs.searchZtree()
            },
            viewData() {
                hideRMenu('rMenu')
                var nodes = this.zTreeObj.getSelectedNodes()
                if (nodes.length > 0) {
                    var tableName = strEncryption(nodes[0].name)
                    var type = '1'		// 是否直接在当下数据源下查询表信息，默认是
                    // 业务权限环境：
                    if (openType === 2) {
                        // 如果是业务数据或业务维度目录节点下的表，则需用四期库（全量库）数据源
                        if (nodes[0].idPath.indexOf('bussDataRoot') > -1 || nodes[0].idPath.indexOf('bussRootNode') > -1) {
                            type = '0'
                        } else if (nodes[0].idPath.indexOf('personalNode') > -1) {	// 如果是个人数据节点下的表，则直接用业务权限库数据源
                            type = '1'
                            var flag = true
                            // 先根据当前显示表名称获取真实表名称
                            $.ajax({
                                url: contextPath + '/graphEditor/getRealTableNameByTableName',
                                data: { 'tableName': nodes[0].name },
                                dataType: 'json',
                                type: 'post',
                                async: false,
                                success: function(e) {
                                    if (e.isError) {
                                        alertMsg('提示', obj.message, 'error')
                                        flag = false
                                    } else {
                                        tableName = obj.tableName
                                    }
                                }
                            })
                            if (!flag) {
                                return
                            }
                        }
                    }
                    var callBackFun = function() {
                        viewData(tableName, '', false, type)
                        graph.viewDataType = 1
                        graph.isCurDataSource = type
                    }
                    if (openType === 2) {
                        $.post(contextPath + '/graphEditor/verifyRunningTask', { 'sql': '', 'tableNames': nodes[0].name }, function(e) {
                            if (e.isError) {
                                if (e.data) {
                                    confirmMsg('提示', e.message, 'info', function() {
                                        callBackFun()
                                    }, function() {})
                                } else {
                                    alertMsg('提示', e.message, 'info')
                                }
                            } else {
                                callBackFun()
                            }
                        }, 'json')
                    } else {
                        callBackFun()
                    }
                }
            },
            relationTableQuery() {
                hideRMenu('rMenu')
                var nodes = this.zTreeObj.getSelectedNodes()
                if (nodes.length > 0) {
                    var tableName = strEncryption(nodes[0].name)
                    layer.open({
                        id: 'relationTableQueryDialog',
                        type: 1,
                        title: '关联表查询',
                        content: '<div id="tableArea" class="table-view" style="width:100%;"><table class="table table-striped" id="resultTable"></table></div>',
                        area: ['800px', '400px'],
                        skin: 'layui-layer-lan',
                        resize: false,
                        scrollbar: false,
                        success: function(layero) {
                            var tableGridObj = new TableGrid()
                            var setting = {
                                tableId: 'resultTable',
                                tableUrl: contextPath + '/graphEditor/getRightMenuRelationTable',
                                params: { 'tableName': tableName },
                                rownumbers: true,
                                colModel: [
                                    {
                                        'label': '原表名',
                                        'name': 'SOURCE_TABLE',
                                        'align': 'center'
                                    }, {
                                        'label': '关联表名',
                                        'name': 'TARGET_TABLE',
                                        'align': 'center'
                                    }, {
                                        'label': '原表字段',
                                        'name': 'SOURCE_COLUMN',
                                        'align': 'center'
                                    }, {
                                        'label': '关联表字段',
                                        'name': 'TARGET_COLUMN',
                                        'align': 'center'
                                    }
                                ],
                                scroll: false,
                                height: '100%',
                                width: '100%'
                            }
                            tableGridObj.initGridData(setting)
                        }
                    })
                }
            },
            editTable_li() {
                hideRMenu('rMenu')
                var nodes = this.zTreeObj.getSelectedNodes()
                if (nodes && nodes.length > 0) {
                    var loading = $('body').mLoading({ 'text': '正在初始化数据，请稍后……', 'hasCancel': false })
                    $.post(contextPathAuditAnalysis + '/sqlEditor/getTableColumsInfo', { 'tableName': nodes[0].name }, function(e) {
                        if (e.success) {
                            var realTableName = e.data.realTableName
                            var tableInfo = e.data.tableInfo
                            var html = '<div id="editTableDiv" style="padding: 10px;">' +
                                '<div class="row"><div class="col-sm-12"><div class="form-group"><label class="col-sm-4 control-label" style="text-align: right;width:100px;">数据表名称</label>' +
                                '<div class="col-sm-8"><input type="text" id="importTableName" class="form-control" value="' + nodes[0].name + '"/></div></div></div></div>' +
                                '<table class="table table-striped" id="editTable"></table></div>'
                            layer.open({
                                id: 'editTable_layer',
                                type: 1,
                                title: '修改表结构',
                                content: html,
                                area: ['1000px', '90%'],
                                skin: 'layui-layer-lan',
                                resize: false,
                                scrollbar: false,
                                btn: ['保存', '关闭'],
                                success: function(layero, index) {
                                    var setting = {
                                        tableId: 'editTable',
                                        rownumbers: true, // 序号
                                        multiselect: false, // 多选框
                                        divId: 'editTableDiv',
                                        width: $('#editTableDiv').width() - 20,
                                        height: 'auto',
                                        colNames: ['字段名称（隐藏）', '字段类型（隐藏）', '字段长度（隐藏）', '字段名称', '字段类型', '字段长度'],
                                        colModel: [
                                            { label: '字段名称（隐藏）', name: 'COLUMN_NAME', hidden: true },
                                            { label: '字段类型（隐藏）', name: 'DATA_TYPE', hidden: true },
                                            { label: '字段长度（隐藏）', name: 'DATA_LENGTH', hidden: true },
                                            { label: '字段名称', name: 'EDIT_COLUMN_NAME', align: 'center',
                                                formatter: function(cellvalue, options, rowObject) {
                                                    return "<input class='form-control dataName' type='text' value='" + rowObject.EDIT_COLUMN_NAME + "'/>"
                                                }
                                            },
                                            { label: '字段类型', name: 'EDIT_DATA_TYPE', align: 'center',
                                                formatter: function(cellvalue, options, rowObject) {
                                                    var html = ''
                                                    var type = rowObject.EDIT_DATA_TYPE.toUpperCase()
                                                    switch (type) {
                                                        case 'VARCHAR2':
                                                            html = "<option value='VARCHAR2' selected='selected'>文本</option>" +
                                                                "<option value='DATE'>日期</option><option value='NUMBER'>数值</option>"
                                                            break
                                                        case 'DATE':
                                                            html = "<option value='VARCHAR2'>文本</option>" +
                                                                "<option value='DATE' selected='selected'>日期</option><option value='NUMBER'>数值</option>"
                                                            break
                                                        case 'NUMBER':
                                                            html = "<option value='VARCHAR2'>文本</option>" +
                                                                "<option value='DATE'>日期</option><option value='NUMBER' selected='selected'>数值</option>"
                                                            break
                                                    }
                                                    return "<select class='form-control dataType' data-rowId='" + options.rowId + "'>" + html + '</select>'
                                                }
                                            },
                                            { label: '字段长度', name: 'EDIT_DATA_LENGTH', align: 'left',
                                                formatter: function(cellvalue, options, rowObject) {
                                                    var type = rowObject.EDIT_DATA_TYPE.toUpperCase()
                                                    var html = ''
                                                    if (type === 'VARCHAR2') {
                                                        html = "<input class='form-control dataLength' type='number' value='" + rowObject.EDIT_DATA_LENGTH + "'/>"
                                                    } else {
                                                        html = "<input class='form-control dataLength' type='number' value='" + rowObject.EDIT_DATA_LENGTH + "' readonly='readonly'/>"
                                                    }
                                                    return html
                                                }
                                            }
                                        ]
                                    }
                                    $('#editTable').jqGrid(setting)
                                    for (var i = 0; i < tableInfo.length; i++) {
                                        tableInfo[i]['EDIT_COLUMN_NAME'] = tableInfo[i].COLUMN_NAME
                                        tableInfo[i]['EDIT_DATA_TYPE'] = tableInfo[i].DATA_TYPE
                                        tableInfo[i]['EDIT_DATA_LENGTH'] = tableInfo[i].DATA_LENGTH
                                        $('#editTable').jqGrid('addRowData', i + 1, tableInfo[i])
                                    }
                                    $('.dataType').change(function() {
                                        var value = $(this).val()
                                        $(this).find("option[value!='" + value + "']").removeAttr('selected')
                                        $(this).find("option[value='" + value + "']").attr('selected', 'selected')
                                        var rowId = parseInt($(this).attr('data-rowId'))
                                        var rowData = $('#editTable').getRowData(rowId)
                                        if (value === 'VARCHAR2') {
                                            $('.dataLength:eq(' + parseInt(rowId - 1) + ')').removeAttr('readonly')
                                        } else {
                                            $('.dataLength:eq(' + parseInt(rowId - 1) + ')').attr('readonly', 'readonly')
                                        }
                                        if (value === rowData.DATA_TYPE) {
                                            $('.dataLength:eq(' + parseInt(rowId - 1) + ')').val(rowData.DATA_LENGTH)
                                        } else {
                                            if (value === 'VARCHAR2') {
                                                $('.dataLength:eq(' + parseInt(rowId - 1) + ')').val(1000)
                                            } else {
                                                $('.dataLength:eq(' + parseInt(rowId - 1) + ')').val(rowData.DATA_LENGTH)
                                            }
                                        }
                                    })
                                    loading.destroy()
                                },
                                btn1: function(index, layero) {
                                    var paramData = {
                                        'realTableName': realTableName,
                                        'tableId': nodes[0].id
                                    }
                                    var hasEditor = false// 是否对表信息做了修改
                                    var importTableName = $.trim($('#importTableName').val())
                                    if (importTableName === '') {
                                        alertMsg('提示', '数据表名称不可为空', 'info')
                                        return
                                    }
                                    if (!verifyReg(importTableName)) {
                                        alertMsg('提示', '数据表【' + nodes[0].name + '】名称含有特殊字符，请将特殊字符替换为下划线“_”', 'info')
                                        return
                                    }
                                    if (importTableName !== nodes[0].name) {
                                        paramData.curTableName = importTableName
                                        hasEditor = true
                                    }
                                    // 获取所有行数据
                                    var rowIds = $('#editTable').getDataIDs()
                                    if (rowIds.length > 0) {
                                        var toEditObj = {}// 创建待修改数据表信息的对象
                                        var verify = true; var message = ''
                                        for (var i = 0; i < rowIds.length; i++) {
                                            var rowId = parseInt(rowIds[i])
                                            var curRowData = $('#editTable').getRowData(rowId)// 获取当前行数据
                                            var obj = {}
                                            // 判断字段名称是否被修改过
                                            var oldColumnName = curRowData.COLUMN_NAME
                                            var newColumnName = $.trim($('.dataName:eq(' + parseInt(rowId - 1) + ')').val())
                                            if (newColumnName === '') {
                                                verify = false
                                                message = '第' + parseInt(i + 1) + '行的字段名称不能为空'
                                                break
                                            }
                                            if (!verifyReg(newColumnName)) {
                                                verify = false
                                                message = '字段【' + newColumnName + '】含有特殊字符，请将特殊字符替换为下划线“_”'
                                                break
                                            }
                                            if (oldColumnName !== newColumnName) {
                                                obj.newColumnName = newColumnName
                                                hasEditor = true
                                            }
                                            // 判断字段类型是否被修改过
                                            var oldDataType = curRowData.DATA_TYPE.toUpperCase()
                                            var newDataType = $.trim($('.dataType:eq(' + parseInt(rowId - 1) + ')').val())
                                            obj.oldDataType = curRowData.DATA_TYPE
                                            if (oldDataType !== newDataType) {
                                                obj.newDataType = newDataType
                                                hasEditor = true
                                            }
                                            // 如果当前字段是文本类型时获取字段长度
                                            var oldDataLength = curRowData.DATA_LENGTH
                                            var newDataLength = $.trim($('.dataLength:eq(' + parseInt(rowId - 1) + ')').val())
                                            if (newDataType === 'VARCHAR2') {
                                                if (newDataLength === '' || Number(newDataLength) === 0) {
                                                    verify = false
                                                    message = '第' + parseInt(i + 1) + '行的字段长度不能为空或0'
                                                    break
                                                }
                                                if (oldDataType === newDataType) {
                                                    if (Number(newDataLength) < Number(oldDataLength)) {
                                                        verify = false
                                                        message = '【' + newColumnName + '】字段的长度不能小于原长度'
                                                        break
                                                    }
                                                    if (Number(newDataLength) > 4000) {
                                                        verify = false
                                                        message = '【' + newColumnName + '】字段的长度不能大于4000'
                                                        break
                                                    }
                                                }
                                                if (oldDataLength !== newDataLength) { // 只有文本类型才需要字段长度属性
                                                    obj.newDataLength = newDataLength
                                                    hasEditor = true
                                                }
                                            }
                                            toEditObj[oldColumnName] = obj
                                        }
                                        if (verify) {
                                            paramData.tableInfo = JSON.stringify(toEditObj)
                                        } else {
                                            alertMsg('提示', message, 'info')
                                            return
                                        }
                                    }
                                    if (hasEditor) {
                                        loading = $('#editTable_layer').parent().mLoading({ 'text': '正在修改数据表信息，请稍后……', 'hasCancel': false })
                                        $.post(contextPathAuditAnalysis + '/sqlEditor/editTable', paramData, function(e) {
                                            loading.destroy()
                                            if (e.success) { // 全部修改成功
                                                layer.close(index)
                                                alertMsg('提示', e.msg, 'info')
                                                refreshMySpaceNode()
                                            } else {
                                                if (e.data === true) { // 为true，说明有部分信息修改成功，此时需刷新数据表信息
                                                    layer.close(index)
                                                    refreshMySpaceNode()
                                                    if (paramData.curTableName) {
                                                        nodes[0].name = importTableName
                                                        nodes[0].displayName = importTableName
                                                        this.zTreeObj.updateNode(nodes[0])
                                                    }
                                                    this.zTreeObj.selectNode(nodes[0], false, true)
                                                    editTable()
                                                    alertMsg('提示', e.msg, 'info')
                                                } else {
                                                    alertMsg('提示', e.msg, 'info')
                                                }
                                            }
                                        }, 'json')
                                    } else {
                                        alertMsg('提示', '未对数据表结构信息做任何修改操作', 'info')
                                    }
                                },
                                btn2: function(index) {
                                    layer.close(index)
                                }
                            })
                        } else {
                            loading.destroy()
                            alertMsg('提示', '获取表信息失败', 'info')
                        }
                    }, 'json')
                } else {
                    alertMsg('提示', '请选择数据表', 'info')
                }
            },
            dropTable_li() {
                hideRMenu('rMenu')
                var nodes = this.zTreeObj.getSelectedNodes()
                if (nodes && nodes.length > 0) {
                    confirmMsg('询问', '确定删除选择的数据表吗?', 'warning', function() {
                        var loading = $('body').mLoading({ 'text': '正在删除数据表，请稍后……', 'hasCancel': false })
                        $.ajax({
                            type: 'post',
                            url: contextPathAuditAnalysis + '/personSpaceDirectory/deletePersonSpaceDirectoryByTableId',
                            data: { 'tableIds': [nodes[0].id] },
                            dataType: 'json',
                            success: function(data) {
                                loading.destroy()
                                if (data.isSuccess) {
                                    alertMsg('提示', '删除数据表成功', 'success')
                                    this.zTreeObj.removeNode(nodes[0])
                                } else {
                                    alertMsg('提示', '删除数据表失败', 'error')
                                }
                            },
                            error: function(e) {
                                loading.destroy()
                                alertMsg('提示', '删除数据表请求失败', 'error')
                            }
                        })
                    }, function() {})
                } else {
                    alertMsg('提示', '请选择要删除的数据表', 'warning')
                }
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
            },
            showMoreMenu() { // 处理文件更多菜单
                var event = event || window.event
                showRMenu('moreMenu', 'node', event.clientX, event.clientY)
            },
            /**
             * 刷新【个人数据】节点
             */
            refreshMySpaceNode() {
                var refreshNodeId = 'my_space'
                if (openType === 1) {
                    refreshNodeId = 'my_space_dev'
                }
                var refreshNodes = this.zTreeObj.getNodesByParam('id', refreshNodeId, null)
                if (refreshNodes && refreshNodes.length > 0) {
                    rootDataRefresh(refreshNodes[0])
                }
            }
        }
    }

</script>

<style scoped type="text/css">
    /*@import "css/index.css";*/
</style>
