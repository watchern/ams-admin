<template>
    <div ref="screenMainContain" class="tree-list-container" v-loading="screenListLoading" element-loading-text="数据加载中">
        <el-row>
            <el-col>
                <el-page-header @back="toScreenList" :content="curScreenGraphName"></el-page-header>
            </el-col>
        </el-row>
        <el-row>
            <el-tabs v-model="tabsName" :closable="tabClosable"  @tab-click="clickTab">
                <el-tab-pane v-for="item in tabArr" :key="item.id" :name="item.name">
                    <span slot="label">{{item.title}}
                        <el-tooltip content="选择区间" placement="bottom" v-if="item.optType === 'layering'">
                            <i class="el-icon-s-tools" title="选择区间" @click="showLayingDialog(item.name)"></i>
                        </el-tooltip>
                    </span>
                    <ScreenQueryOne v-show="item.isShow" ref="screenQueryOne" :screenParam="item.screenParam"/>
                </el-tab-pane>
            </el-tabs>
        </el-row>
        <el-dialog v-if="layeringDialogVisible" :visible.sync="layeringDialogVisible" title="选择分层区间" :close-on-press-escape="pressEscape" :close-on-click-modal="clickModal" width="600px">
            <div style="padding: 10px;height: 400px;">
                <el-row>
                    <el-col :span="4" style="text-align: right;">
                        <label style="line-height: 36px;padding-right: 10px;">分层区间</label>
                    </el-col>
                    <el-col :span="20">
                        <el-select v-model="curRangeIndex" @change="changeRange" style="width: 100%;">
                            <el-option v-for="layeringRange in layeringRangeArr" :key="layeringRange.index" :label="layeringRange.name" :value="layeringRange.index"></el-option>
                        </el-select>
                    </el-col>
                </el-row>
                <el-row style="margin-top: 10px;">
                    <el-col :span="4" style="text-align: right;">
                        <label style="line-height: 36px;padding-right: 10px;">SQL语句</label>
                    </el-col>
                    <el-col :span="20">
                        <el-input type="textarea" :rows="15" v-model="sqlValue" disabled></el-input>
                    </el-col>
                </el-row>
            </div>
            <div slot="footer">
                <el-button @click="layeringDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="layerNodeCallBack">保存</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import ScreenQueryOne from '@/views/graphtool/tooldic/page/screenQuery/screenQueryOne.vue'
    export default {
        name: "screenQueryIndex",
        components:{ScreenQueryOne},
        data(){
            return{
                screenListLoading: false,
                curScreenGraphName:'',
                tabsName:'tab0',//默认打开第一个页签
                tabArr:[],
                tabClosable:false,
                curTabsName:'',
                curNodeData:null,
                layeringDialogVisible:false,
                pressEscape:false,
                clickModal:false,
                layeringRangeArr:[],
                curRangeIndex:'',
                sqlValue:'',
                webSocketUuid:''
            }
        },
        props:['screenParam'],
        mounted(){
            this.curScreenGraphName = `当前场景查询名称：${this.screenParam.graphName}`
            this.init()
            this.initWebsocket()
        },
        methods:{
            init(){
                for(let i=0; i<this.screenParam.screenQueryNodeArr.length; i++){
                    //新增一个Tab项
                    let nodeData = JSON.parse(this.screenParam.screenQueryNodeArr[i].extMap.nodeData)
                    let isShow = false
                    if(i === 0){
                        isShow = true
                        this.curNodeData = nodeData
                    }
                    this.tabArr.push({
                        title: this.screenParam.screenQueryNodeArr[i].label,
                        id: this.screenParam.screenQueryNodeArr[i].id,
                        name: `tab${i}`,
                        optType: nodeData.nodeInfo.optType,
                        isShow: isShow,
                        screenParam:{
                            "graphUuid":this.screenParam.graphUuid,
                            "graphName":this.screenParam.graphName,
                            "nodeData":nodeData,
                            "publicType":this.screenParam.publicType,
                            "treeNodeData":this.screenParam.treeNodeData,
                        }
                    });
                }
            },
            initWebsocket(){
                let $this = this
                let loginUserUuid = this.$store.state.user.id

              const webSocketPath = 'ws://' + window.location.host + ':' +window.location.port + '/websocket?' + loginUserUuid + 'ScreenQuery'
                // const webSocketPath = `${process.env.VUE_APP_GRAPHTOOL_WEB_SOCKET}${loginUserUuid}ScreenQuery`
                // WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
                this.webSocket = new WebSocket(webSocketPath) // 建立与服务端的连接
                // 发送消息
                this.webSocket.onmessage = function(event) {
                    const dataObj = JSON.parse(event.data)// 接收到返回结果
                    var executeSQLObj = dataObj.executeSQL
                    if (executeSQLObj.customParam[0] === $this.webSocketUuid) {//匹配结果集
                        let tabInd = $this.tabArr.findIndex( item => item.isShow === true)
                        if(tabInd > -1){
                            $this.screenListLoading = false
                            if(executeSQLObj.state === "2"){//执行成功，展示当前操作的结果集
                                if($this.$refs.screenQueryOne[tabInd].queryFilter){
                                    $this.$refs.screenQueryOne[tabInd].activeName = '2'
                                }
                                $this.$refs.screenQueryOne[tabInd].showTableResult = true
                                $this.$refs.screenQueryOne[tabInd].$nextTick(() => {
                                    $this.$refs.screenQueryOne[tabInd].$refs.resultTable.initData(null,dataObj)
                                    $this.$refs.screenQueryOne[tabInd].isQuery = true
                                })
                            }else{
                                $this.$refs.screenQueryOne[tabInd].$message.error(`查询结果集失败：${executeSQLObj.msg}`)
                            }
                        }
                    }
                }
                // 通信失败
                this.webSocket.onerror = function(event) {
                    $this.$message.error('数据请求失败')
                }
            },
            clickTab(){
                if(this.tabsName !== this.curTabsName){
                    let tab = this.tabArr.find( item => item.name === this.tabsName)
                    if(typeof tab !== "undefined"){
                        this.curTabsName = this.tabsName
                        this.curNodeData = tab.screenParam.nodeData
                        Array.from(this.tabArr, item => item.isShow = false)
                        tab.isShow = true;
                    }
                }
            },
            changeRange(index){
                this.sqlValue = this.curNodeData.nodeInfo.nodeSqlArr[index]
            },
            showLayingDialog(curTabsName){
                if(curTabsName !== this.curTabsName){
                    this.curTabsName = curTabsName
                    this.clickTab()
                }else{
                    this.layeringDialogVisible = true
                    this.$nextTick( () => {
                        let areaArr = this.curNodeData.nodeInfo.areaArr
                        this.layeringRangeArr = []
                        for(let j=0; j<areaArr.length; j++) {
                            this.layeringRangeArr.push({
                                "index":j,
                                "name":areaArr[j]
                            })
                        }
                        this.curRangeIndex = 0
                        this.sqlValue = this.curNodeData.nodeInfo.nodeSqlArr[0]
                    })
                }
            },
            layerNodeCallBack(){
                let tab = this.tabArr.find( item => item.name === this.tabsName)
                if(typeof tab !== "undefined"){
                    tab.screenParam.layering_index = this.curRangeIndex
                }
                this.layeringDialogVisible = false
                this.$refs.screenQueryOne.init()
            },
            toScreenList(){
                this.$parent.$parent.rightType = "graphList"
            },
        }
    }
</script>
<style scoped type="text/css">
    >>> .el-tabs__header{
        margin: 0 0 5px;
    }
</style>
