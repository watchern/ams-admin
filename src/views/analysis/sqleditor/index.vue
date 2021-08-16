<template>
    <div class="app-container" ref="sqlEditorDiv">
        <div id="container" v-loading="executeLoading" :element-loading-text="loadText">
            <div id="sidebar">
                <div class="unfold-shuju add-sidiv"><img :src="shuju"><span>数据表</span></div>
                <div class="unfold-canshu" v-if="callType!='graphModel'"><img :src="canshu"><span>参数</span></div>
                <div class="unfold-sql"><img :src="sql"><span>函数</span></div>
            </div>
            <div id="leftPart" class="left-part">
                <div class="left-dataTree">
                    <el-input id="dataSearch" style="margin-top:5px" v-model="tableSearchInput" placeholder="输入关键字进行过滤" @change="tableTreeSearch" suffix-icon="el-icon-search"/>
                    <ul id="dataTree" class="ztree" style="margin-top:5px"/>
                </div>
                <div class="left-paramTree">
                    <el-input id="paramSearch" style="margin-top:5px" v-model="paramSearchInput" placeholder="输入关键字进行过滤" @change="paramTreeSearch" suffix-icon="el-icon-search"/>
                    <ul id="paramTree" class="ztree" style="margin-top:5px"/>
                </div>
                <div class="left-sqlFunTree">
                    <el-input id="sqlSearch" style="margin-top:5px" v-model="functionInput" placeholder="输入关键字进行过滤" @change="functionTreeSearch" suffix-icon="el-icon-search"/>
                    <ul id="sqlFunTree" class="ztree" style="margin-top:5px"/>
                </div>
            </div>
            <div id="rightPart" style="height: 100%">
                <div id="sqlEditorDiv" class="sql-editor-div">
                    <el-row type="flex" class="row-bg">
                        <el-col>
                            <el-button
                                type="primary"
                                size="small"
                                class="oper-btn format"
                                @click="sqlFormat"
                                style="margin-left:18px"
                            />
                            <el-button
                                type="primary"
                                size="small"
                                class="oper-btn start"
                                @click="executeSQL"
                            />
                            <el-button
                                type="primary"
                                size="small"
                                class="oper-btn opensql btn-width-md"
                                @click="openSqlDraftList"
                            />
                            <el-button
                                type="primary"
                                size="small"
                                class="oper-btn sqlcheck"
                                @click="getColumnSqlInfo"
                            />
                            <el-dropdown style="margin-left:10px">
                                <el-button
                                    type="primary"
                                    size="small"
                                    class="oper-btn save"
                                />
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item
                                        @click.native="openSaveSqlDialog(1)"
                                    >SQL保存</el-dropdown-item>
                                    <el-dropdown-item
                                        @click.native="openSaveSqlDialog(2)"
                                    >SQL另存为</el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                            <el-dropdown type="primary" style="margin-left:10px">
                                <el-button
                                    type="primary"
                                    size="small"
                                    class="oper-btn maintain"
                                />
                                <el-dropdown-menu slot="dropdown">
                                    <!-- <el-dropdown-item
                                        @click.native="findAndReplace(2)"
                                    >查找</el-dropdown-item>
                                    <el-dropdown-item
                                        @click.native="findAndReplace(1)"
                                    >替换</el-dropdown-item> -->
                                    <el-dropdown-item
                                        @click.native="caseTransformation(1)"
                                    >转大写</el-dropdown-item>
                                    <el-dropdown-item
                                        @click.native="caseTransformation(2)"
                                    >转小写</el-dropdown-item>
                                    <el-dropdown-item
                                        @click.native="selectSqlNotes()"
                                    >注释选中行</el-dropdown-item>
                                    <el-dropdown-item
                                        @click.native="selectSqlCancelNotes()"
                                    >取消注释</el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                            <label style="margin-right: -43px;color:#9B4C4C;margin-left: 10px;margin-left: 15px;cursor: pointer;" @click="modelResultSavePathDialog = true">{{ path }} <i class="el-icon-edit" style="font-size:16px;"></i></label>
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
                    <textarea ref="sql" style="width: 100%;height: 320px;"/>
                </div>
                <div id="horizontal" />

                <!-- 结果展示和参数输入区域 -->
                <div id="bottomPart" lay-filter="result-data">
                    <div id="maxOpen" class="max-size">
                        <div id="iconImg" class="iconImg" alt="最大化" @click="maxOpen" />
                        <div id="iconImg-huifu" class="iconImg" @click="maxOpen" />
                        <!-- <div id="iconImg-save" class="iconImg" @click="outTable"></div>
                        <div id="iconImg-table" class="iconImg"></div> -->
                    </div>
                    <div v-for="result in resultShow" id="dataShow" class="data-show" v-if="isExecuteError">
                        <childTabs
                            ref="childTabsRef"
                            :key="result.id"
                            :pre-value="currentExecuteSQL"
                            use-type="sqlEditor"
                            style="width: 100%;"
                            :chartModelUuid='modelUuid'
                            :modelId='modelUuid'
                            id="childTabs1"
                        />
                    </div>
                  <div v-if="!isExecuteError" class="data-show">
                    <el-tabs type="border-card" style="height:30px">
                      <el-tab-pane label='错误信息'>
                        <el-card class="box-card" style="height: 100px" align="center">
                          <div style='font-weight:lighter ;font-size:15px'>{{ errorMessage }}</div>
                        </el-card>
                      </el-tab-pane>
                    </el-tabs>
                  </div>
                </div>
            </div>
            <div id="vertical"> <i class="el-icon-d-caret skin-textColor"/> </div>
            <input
                id="personId"
                type="hidden"
                value="<%=LoginUserInfo.getLoginUserId()%>"
            >
            <div id="tableMenu" class="rightMenu">
                <ul>
                    <li @click="getSelectSql('tableMenu')">生成SELECT语句</li>
                    <li @click="selectTableRelInfo('tableMenu')">查看表关联信息</li>
                  <!--<li onclick="">查看表信息</li>-->
                </ul>
            </div>
        </div>
        <form id="countForm" class="form-horizontal" style="display: none">
            <div class="form-group">
                <label class=" control-label">视图SQL:</label>
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
            v-if="dialogFormVisible"
            title="请输入参数"
            :visible.sync="dialogFormVisible"
            :append-to-body="true"
        >
<!--            <paramDraw v-if="dialogFormVisible" ref="paramDrawRef" :my-id="paramDrawUuid" />-->
            <paramDrawNew v-if="dialogFormVisible" :sql="this.executeData.sql" :arr="this.executeData.arr" ref="paramDrawRefNew"></paramDrawNew>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">关闭</el-button>
                <el-button type="primary" @click="replaceNodeParam">确定</el-button>
            </div>
        </el-dialog>
        <el-dialog title="选择SQL结果保存路径" :visible.sync="modelResultSavePathDialog" width="30%" :append-to-body="true">
            <data-tree :data-user-id="personCode" :scene-code="sceneCode" :tree-type="treeType" style="height: 500px;overflow-y: scroll" @node-click="handleClick" />
            <span slot="footer" class="dialog-footer">
        <el-button @click="modelResultSavePathDialog = false">取 消</el-button>
        <el-button
            type="primary"
            @click="modelResultSavePathDetermine"
        >确 定</el-button>
      </span>
        </el-dialog>
      <el-dialog title="表关联信息" :visible.sync="selectTableRelInfoDialog" width="60%" :append-to-body="true">
        <tablerelation :table-id="selectTableRelInfoTableId" :open-type="openTypeOne"/>
        <div slot="footer" class="dialog-footer">
          <el-button @click="selectTableRelInfoDialog = false">关闭</el-button>
        </div>
      </el-dialog>
    </div>
</template>
<script>
    import {uuid2} from "@/api/analysis/auditmodel";
    import tablerelation from'@/views/data/table/tablerelation'
    require('@/components/ams-codemirror/addon/edit/matchbrackets')
    require('@/components/ams-codemirror/addon/selection/active-line')
    require('@/components/ams-codemirror/mode/sql/sql')
    require('@/components/ams-codemirror/addon/hint/show-hint')
    require('@/components/ams-codemirror/addon/hint/sql-hint')
    require('@/components/ams-ztree/js/jquery.ztree.all.min')
    require('@/components/ams-ztree/js/jquery.ztree_new.all.min')
    require('@/components/ams-ztree/js/jquery.ztree.excheck')
    require('@/components/ams-ztree/js/jquery.ztree.exhide')

    import '@/components/ams-codemirror/theme/ambiance.css'
    import '@/components/ams-codemirror/lib/codemirror.css'

    import '@/components/ams-codemirror/addon/hint/show-hint.css'
    import '@/components/ams-ztree/css/zTreeStyle/zTreeStyle.css'
    import {
        initSQLEditor,
        initDragAndDrop,
        initTableTip,
        initIcon,
        initTableTree,
        initFunctionTree,
        initEvent,
        initParamTreeNew,
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
        dropTable,
        getIsUpdate,
        setIsUpdate,
        getDefaultSqlEditorLocationByPersonUuid,
        saveSqlEditorExecuteDefaultPath,
        sendSqlEditorVue,
        getGraphSaveInfo,
        getZtreeSelectNode,
        hideRMenu
    } from '@/api/analysis/sqleditor/sqleditor'
    import sqlDraftList from '@/views/analysis/sqleditor/sqldraftlist'
    import { updateDraft } from '@/api/analysis/sqleditor/sqldraft'
    import childTabs from '@/views/analysis/auditmodelresult/childtabs'
    import paramDraw from '@/views/analysis/modelparam/paramdraw'
    import paramDrawNew from '@/views/analysis/modelparam/paramdrawnew'
    import { replaceNodeParam } from '@/api/analysis/auditparam'
    import dataTree from '@/views/data/role-res/data-tree'

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
    let lastResultColumnType = []

    /**
     * 数据界面对象
     */
    let childTabsRef

    /**
     * 最后一个select索引
     * @type {number}
     */
    let lastSqlIndex = -1
    export default {
        name: 'SQLEditor',
        components: { sqlDraftList, childTabs, paramDraw, dataTree, paramDrawNew,tablerelation },
        props: ["sqlEditorParamObj", "sqlValue","callType","locationUuid","locationName","modelUuid",'dataUserId','sceneCode1','callType'],
        created(){
            if(this.dataUserId!=undefined && this.sceneCode1!=undefined){
                this.personCode = this.dataUserId
                this.sceneCode = this.sceneCode1
            }
        },
        data() {
            return {
              openTypeOne:"showTable",
              selectTableRelInfoDialog:false,
              selectTableRelInfoTableId:'',
              errorMessage:'',
              isExecuteError:true,
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
                // SQL草稿dialog
                sqlDraftDialogFormVisible: false,
                // SQL草稿列表dialog
                sqlDraftDialog: false,
                // 参数dialog
                dialogFormVisible: false,
                // 遮罩层文字
                loadText: '',
                // form宽度
                formLabelWidth: '120px',
                // 参数渲染界面唯一编号
                paramDrawUuid: '',
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
                tableSearchInput: '',
                // c参数搜索值
                paramSearchInput: '',
                // 函数树搜索值
                functionInput: '',
                shuju: require('@/views/analysis/auditmodel/imgs/shuju.png'),
                canshu: require('@/views/analysis/auditmodel/imgs/canshu.png'),
                sql: require('@/views/analysis/auditmodel/imgs/sql.png'),
                // 结果保存执行路径
                modelResultSavePathDialog: false,
                // 临时执行路径
                tempPath: '',
                // 临时执行露囧编号
                tempId: '',
                nodeType: '',
                path: '选择SQL结果保存路径',
                modelResultSavePathId: '',
                personCode: this.$store.state.user.code,
                sceneCode: 'auditor',
                treeType: 'save',
                pushUuid:''
            }
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
              this.$nextTick(function() {
                if (value) {
                  this.$refs.paramDrawRefNew.createParamNodeHtml(this.paramDrawUuid)
                }
              })
            }
        },
        mounted() {
            try{
                let graphToolDiv = this.$parent.$parent.$refs.graphToolDiv
                if(graphToolDiv){
                    this.$refs.sqlEditorDiv.style.height = $(graphToolDiv).height() - 120 + "px"
                }
            }catch (e) {}
            this.initData()
            this.initWebSocket()
            sendSqlEditorVue(this)
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
              this.pushUuid = uuid2()
                /*      const webSocketPath =
                  'ws://localhost:8086/analysis/websocket?' +
                  this.$store.getters.personuuid*/
                const webSocketPath =
                    this.AmsWebsocket.getWSBaseUrl(this.AmsModules.ANALYSIS) +
                    this.$store.getters.personuuid +
                    'sqleditor'+this.pushUuid
                // WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
                this.webSocket = new WebSocket(webSocketPath) // 建立与服务端的连接
                // 当服务端打开连接
                this.webSocket.onopen = function(event) {}
                // 发送消息
                this.webSocket.onmessage = function(event) {
                    const dataObj = JSON.parse(event.data)
                    if (dataObj.listenerType === 'afterTaskChangeTable' || dataObj.listenerType === 'afterTaskCreateView') {
                        const treeNodeInfo = dataObj.addTableMetaList
                        if (treeNodeInfo.length > 0) {
                            var treeNodes = []
                            for (var i = 0; i < treeNodeInfo.length; i++) {
                                var treeNode = {
                                    chkDisabled: false,
                                    deptColNum: 0,
                                    hidden: false,
                                    icon: '../../images/ico/table_1.png',
                                    id: treeNodeInfo[i].tableMetaUuid,
                                    isExist: 0,
                                    isParent: true,
                                    name: treeNodeInfo[i].displayTbName,
                                    personNode: false,
                                    pid: treeNodeInfo[i].folderUuid,
                                    timeColNum: 0,
                                    type: 'table'
                                }
                                treeNodes.push(treeNode)
                            }
                            refushTableTree(treeNodes)
                        }
                    }
                    if (dataObj.listenerType === 'onSQLResult') {
                        if (dataObj.executeSQL.state == 2) {
                            // 如果最后的列索引与当前执行进度一直，说明最后的结果集已经拿到 取出最后一个结果集的列做为模型结果列
                            if (lastSqlIndex == currentExecuteProgress) {
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
                    if (dataObj.listenerType === 'afterTaskDropTable' || dataObj.listenerType === 'afterTaskDropView') {
                        dropTable(dataObj.dropTableNameList)
                    }
                }
                const func2 = function func3(val) {
                    this.$refs.childTabsRef[0].loadTableData(val)
                    // 已经全部执行完成，调用父组件方法初始化参数列等信息
                    if (isAllExecuteSuccess) {
                        setIsUpdate(false)
                        this.$emit('getSqlObj')
                    }
                }
                const func1 = func2.bind(this)
                this.webSocket.onclose = function(event) {}

                // 通信失败
                this.webSocket.onerror = function(event) {}
            },
            /**
             * 通过WebSocket对象发送消息给服务端
             * 此处没有主动发消息给服务端，如果调用此方法，则会发送消息至socket服务端onMessage()方法上
             */
            sendMsgToServer() {
                const message = ''
                if (message) {
                    this.webSocket.send(
                        JSON.stringify({ username: $('#username').text(), msg: message })
                    )
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
                initParamTreeNew()
                this.executeLoading = true
                this.loadText = '正在初始化数据表...'
                initTableTip(this.dataUserId,this.sceneCode1).then((result) => {
                    initTableTree(result)
                    var relTableMap = {}
                    var expTableMap = {}
                    if (result.data != null) {
                        for (let i = 0; i < result.data.length; i++) {
                            if (result.data[i].type === 'table') {
                                relTableMap[result.data[i].enName] = []
                                expTableMap[result.data[i].enName] = result.data[i].extCol
                            }
                        }
                    }
                    // initSQLEditor(document.getElementById('sql'), relTableMap, expTableMap) // 初始化SQL编辑器
                    initSQLEditor(this.$refs.sql, relTableMap, expTableMap)
                    this.executeLoading = false
                    this.loadText = ''
                    if (this.sqlValue != '' && this.sqlValue != undefined) {
                        // 编辑模型的sql  反显数据
                        editorSql(this.sqlValue, this.sqlEditorParamObj)
                        this.tempPath = this.locationName
                        this.tempId = this.locationUuid
                        this.path = '当前执行SQL保存路径:' + this.tempPath
                        this.modelResultSavePathId = this.tempId
                    } else {
                        // 只要不是编辑从任何地方进来都给一个默认的执行路径
                        getDefaultSqlEditorLocationByPersonUuid().then(result => {
                            if (result.data == null) {
                                // 证明当前登录人没有任何执行路径记录 直接给一个默认的  从数据模块那面取  暂时没有 因为数据那面让写死  数据组长-张闯
                                this.tempPath = '根路径'
                                // this.tempPath = ''
                                this.tempId = this.$store.getters.datauserid;
                                // this.tempId = ''
                                this.path = '当前执行SQL保存路径:' + this.tempPath
                                this.modelResultSavePathId = this.tempId
                            } else {
                                // 如果不为空则反显上次选中的
                                this.tempPath = result.data.sqlLocationName
                                this.tempId = result.data.sqlLocationId
                                this.path = '当前执行SQL保存路径:' + this.tempPath
                                this.modelResultSavePathId = this.tempId
                                this.defaultSqlLocation = result.data
                            }
                        })
                    }
                    refreshCodeMirror()
                }).catch(() => {
                    this.$message({ type: 'error', message: '初始化数据表失败!' })
                    this.executeLoading = false
                    this.loadText = ''
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
                if (this.callType != 'editorModel' && this.callType != 'graphModel') {
                    return
                }
                if (!this.isAllExecute) {
                    return
                }
                // 如果当前执行进度与要执行的sql数量相等 则证明数据已经全部拿到，允许保存
                if (currentExecuteProgress != this.currentExecuteSQL.length) {
                    return
                }
                if (getIsUpdate()) {
                    this.$message({ type: 'info', message: 'SQL已经被修改,请重新校验或执行!' })
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
                returnObj.locationUuid = this.tempId
                returnObj.locationName = this.tempPath
                return returnObj
            },
            /**
             * 生成select语句
             */
            getSelectSql(menuId) {
                getSelectSql(menuId)
            },
            /**
             *打开sql保存草稿窗体
             */
            openSaveSqlDialog(type) {
                if (type == 1) {
                    // 如果对象是旧的对象则证明是打开的sql草稿 因此直接保存  否则直接修改
                    const sqlObj = getSaveSqlDraftObj(type)
                    const sql = sqlObj.draftSql
                    if (sql === '') {
                        this.$message({ type: 'info', message: '请输入SQL语句!' })
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
            /**
             *保存sql草稿
             */
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
            /**
             *打开sql草稿列表
             */
            openSqlDraftList() {
                this.sqlDraftDialog = true
            },
            /**
             * 使用sql
             */
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
            /**
             * 执行sql
             */
            executeSQL() {
                if (this.tempId === '') {
                    this.$message({ type: 'info', message: '请选择SQL执行保存路径!' })
                    this.modelResultSavePathDialog = true
                    return
                }
                const result = getSql()
                if (result.sql === '') {
                    this.$message({ type: 'info', message: '请输入SQL!' })
                    return
                }
                this.isAllExecute = result.isAllExecute
                this.loadText = '正在检验SQL是否符合语法规范...'
                verifySql().then((result) => {
                    this.executeLoading = false
                    this.loadText = ''
                    if (!result.data.verify) {
                        this.$message({ type: 'info', message: 'SQL不符合语法规范，请重新输入' })
                        return
                    }
                    this.resultShow = [] // 清空数据展示对象
                    isAllExecuteSuccess = false
                    currentExecuteProgress = 0
                    this.currentExecuteSQL = []
                    lastResultColumn = []
                    const obj = executeSQL()
                    obj.businessField = 'sqleditor'
                    obj.modelResultSavePathId = this.modelResultSavePathId
                    obj.pushUuid = this.pushUuid
                    if (!obj.isExistParam) {
                        // this.executeLoading = true
                        this.loadText = '正在获取SQL信息...'
                        getExecuteTask(obj,this.dataUserId,this.sceneCode1).then((result) => {    //在这如果报错就加一个新页签，如果不报错就显示我的
                            if(result.data.isError){
                          this.isExecuteError = false
                          this.errorMessage = result.data.message
                            this.executeLoading = false
                            }else{
                              this.isExecuteError = true
                            this.executeLoading = false
                            this.loadText = ''
                            lastSqlIndex = result.data.lastSqlIndex
                            this.executeLoading = false
                            this.currentExecuteSQL = result.data.executeSQLList
                            this.modelOriginalTable = result.data.tables
                            this.createTreeNode = result.data.treeNodeInfo
                            this.resultShow.push({ id: 1 })
                            // 界面渲染完成之后开始执行sql,将sql送入调度
                            startExecuteSql(result.data).then((result) => {
                                this.executeLoading = false
                                this.loadText = ''
                            }).catch((result) => {
                                this.executeLoading = false
                            })
                            }
                        })
                    } else {
                        this.openParamDraw(obj)
                    }
                })
            },
            /**
             * 打开参数渲染窗体
             */
            openParamDraw(data) {
                const timestamp = new Date().getTime()
                this.paramDrawUuid = timestamp
                this.dialogFormVisible = true
                this.paramDrawLoading = true
                this.executeData = data
            },
            /**
             * 获取替换参数后的sql  直接直接
             */
            replaceNodeParam() {
                // var obj = replaceNodeParam(this.paramDrawUuid, 'sqlEditor')
              var obj = this.$refs.paramDrawRefNew.replaceNodeParam(this.paramDrawUuid)
                if (!obj.verify) {
                  this.$message({ type: 'info', message: obj.message })
                  return
                }
                obj.sqls = obj.sql
                obj.businessField = 'sqleditor'
                obj.pushUuid = this.pushUuid
                this.executeLoading = true
                getExecuteTask(obj,this.dataUserId,this.sceneCode1).then((result) => {
                  if(result.data.isError){
                    this.$message({
                      type: "error",
                      message: result.data.message,
                    });
                    this.executeLoading = false
                  }else{
                    this.executeLoading = false
                    this.loadText = ''
                    lastSqlIndex = result.data.lastSqlIndex
                    this.executeLoading = false
                    this.currentExecuteSQL = result.data.executeSQLList
                    this.modelOriginalTable = result.data.tables
                    this.createTreeNode = result.data.treeNodeInfo
                    this.resultShow.push({ id: 1 })
                    // 界面渲染完成之后开始执行sql,将sql送入调度
                    startExecuteSql(result.data).then((result) => {
                      this.executeLoading = false
                      this.loadText = ''
                    }).catch((result) => {
                      this.executeLoading = false
                    })
                  }
                })
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
                this.dialogFormVisible = false
            },
            maxOpen() {
                maxOpenOne()
            },
            handleClick(data, node, tree) {
                this.tempPath = data.label
                this.tempId = data.id
                this.nodeType = data.type
            },
            modelResultSavePathDetermine() {
                if (this.nodeType == 'folder') {
                    this.path = '当前执行SQL保存路径:' + this.tempPath
                    this.modelResultSavePathId = this.tempId
                    this.modelResultSavePathDialog = false
                    // 选择完成之后更新数据库
                    let data = {}
                    if (this.defaultSqlLocation == null) {
                        data.sqlLocationId = this.tempId
                        data.sqlLocationName = this.tempPath
                    } else {
                        data = this.defaultSqlLocation
                        data.sqlLocationId = this.tempId
                        data.sqlLocationName = this.tempPath
                    }
                    saveSqlEditorExecuteDefaultPath(data).then(result => {})
                } else if (this.nodeType == '') {
                    this.$message({
                        message: '请选择路径',
                        type: 'warning'
                    })
                } else {
                    this.$message({
                        message: '只能选择文件夹',
                        type: 'warning'
                    })
                }
            },
            getColumnSqlInfo() {
                const result = getSql()
                if (result.sql === '') {
                    this.$message({ type: 'info', message: '请输入SQL!' })
                    return
                }
                this.isAllExecute = result.isAllExecute
                this.executeLoading = true
                this.loadText = '正在校验sql是否符合语法规范...'
                verifySql().then((verSqlResult) => {
                    this.executeLoading = false
                    if (!verSqlResult.data.verify) {
                        this.$message({ type: 'info', message: 'SQL不符合语法规范，请重新输入' })
                        return
                    }
                    this.resultShow = [] // 清空数据展示对象
                    isAllExecuteSuccess = false
                    currentExecuteProgress = 0
                    this.currentExecuteSQL = []
                    lastResultColumn = []
                    const data = { sql: result.sql }
                    this.executeLoading = true
                    this.loadText = '正在获取SQL列...'
                    getColumnSqlInfo(data).then((resp) => {
                        // 修改执行成功状态
                        isAllExecuteSuccess = true
                        lastResultColumn = resp.data.columnName
                        lastResultColumnType = resp.data.columnType
                        setIsUpdate(false)
                        this.$emit('getSqlObj')
                        this.executeLoading = false
                        this.loadText = ''
                        this.$message({ type: 'success', message: 'SQL校验通过' })
                    }).catch((result) => {
                        this.executeLoading = false
                        this.loadText = ''
                    })
                })
            },
            /**
             * 获取sql编辑器里的slq是否被修改
             * @returns {boolean}
             */
            getSQLIsUpdate() {
                return getIsUpdate()
            },
            /**
             * 接口：获取SQL编辑器节点的信息（图形化工具SQL编辑器节点专属方法                                     ）
             */
            async saveSqlInfo(){
                return await getGraphSaveInfo()
            },
            /**
             * 接口：获取SQL的验证结果
             */
            async getVerifySqlResult(){
                return await verifySql()
            },
            /**
             * 查看表关联信息
             */
            selectTableRelInfo(tableMenu){
              var nodes = getZtreeSelectNode()
              this.selectTableRelInfoTableId = nodes[0].id;
              this.selectTableRelInfoDialog = true
              hideRMenu(tableMenu)
            }
        }
    }
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
        width: 84.82%;
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
    }

    .row-bg{
        padding: 8px 0 8px 5px;
        background-color: rgb(224, 230, 237);
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
        z-index: 50;
        background: #f7f7f7;
        border-right: 1px solid rgb(206,208,212);
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
        left: 15.08%;
        height: 100%;
        width: 8px;
        /* overflow: hidden; */
        cursor: w-resize;
        z-index: 200;
        top:0;
    }
    #vertical i{
      position: relative;
      top: 50%;
      left: -8px;
      font-size: 20px;
      transform:rotate(90deg);
    }
    .el-aside{
        /* margin-bottom: 10px; */
    }

    #horizontal {
        position: absolute;
        top: 37%;
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
        right: 15px;
        top: 29px;
        float: right;
        display: none;
        z-index: 201;
    }

    .sql-editor-div{
        padding: 0px;
        width: 100%;
        height: 37%;
    }

    .data-show{
        width: 100%;
        height: 100%;
        background: #fff;
    }

    .left-part{
        overflow-x: hidden;
        overflow-y: auto;
         width: 14.66666667%;
        /*width: 29.6732%;*/
        float: left;
        height: 100%;
        margin-left: .5%;
        box-shadow: 15px 0 15px 0 #3F444D12;
        position: relative;
        z-index: 20;
    }

    .left-dataTree , .left-paramTree , .left-sqlFunTree{
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
    div.rightMenu ul li{
        cursor:pointer;
        padding: 5px;
    }
    div.rightMenu ul li:hover{
        background: rgb(237, 241, 245);
    }
    >>>.cm-keyword{
      color:#0000C6;
      font-weight: bold;
    }
    >>>.cm-atom {
      color:#0000C6;
      font-weight: bold;
    }
    >>>.el-input {
      width: 95%;
    }
    #dataSearch{
      margin: 5px 0 10px 0;
    }
</style>

