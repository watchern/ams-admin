<template>
    <div style="height: 600px;overflow-y: auto;" v-loading="comparisonLoading" :element-loading-text="loadText">
        <el-tabs v-model="detailTableName" :closable="false" @tab-click="clickTab">
            <el-tab-pane v-for="obj in tableArr" :label="obj.name" :name="obj.index" :key="obj.id">
                <el-row>
                    <span>分析字段：</span><em style="color:red">{{obj.columnName}}</em>
                </el-row>
                <el-row>
                    <ChildTabCons ref="childTabCons" :nowtable="obj.resultTable" :prePersonalVal="obj.resultTable" use-type="graph" preLength="1" myIndex="1"/>
                </el-row>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
    import ChildTabCons from "@/views/analysis/auditmodelresult/childtabcon";
    import { getAnalysisTableInfo, getAnalysisDataDetail } from '@/api/graphtool/apiJs/graphList'
    export default {
        name: 'AnalysisDetailData',
        components:{ ChildTabCons },
        data(){
            return {
                detailTableName:'0',
                tableArr:[],
                comparisonLoading:false,
                loadText:'页面加载中，请稍后……'
            }
        },
        props:['dataTableName','openType','columnVal'],
        mounted() {
            this.initWebsocket()
            this.initData()
        },
        methods:{
            initData(){
                let paramData = {
                    'dataTableName': this.dataTableName,
                    'columnVal': this.columnVal,
                    'openType': this.openType
                }
                this.comparisonLoading = true
                getAnalysisTableInfo(paramData).then( response => {
                    try{
                        // 判断总体结果是否出错
                        if (response.data.isError) {
                            this.comparisonLoading = false
                            this.$message.error(`获取数据表详细数据出错：${response.data.message}`)
                        } else {
                            for(let i=0; i<response.data.resList.length; i++){
                                const item = response.data.resList[i]
                                this.tableArr.push({
                                    "id" : item.id,
                                    "index" : `${i}`,
                                    "name" : item.nodeName,
                                    "tableName" : item.tableName,
                                    "columnName" : item.columnName,
                                    "resultTable" : {
                                        "id" : item.id,
                                        "name" : item.nodeName,
                                    },
                                    "loadData" : false//是否已加载数据
                                })
                            }
                            this.$nextTick( () => {
                                const param = {
                                    'id' : this.tableArr[0].id,
                                    'detailTableName' : this.tableArr[0].tableName,
                                    'columnName' : this.tableArr[0].columnName,
                                    'columnVal': this.columnVal,
                                    'openType': this.openType
                                }
                                this.loadTableData(param)
                            })
                        }
                    }catch (e) {
                        this.comparisonLoading = false
                        this.$message.error('页面加载出错')
                    }
                }).catch( () => {
                    this.comparisonLoading = false
                })
            },
            loadTableData(data){
                if(!this.comparisonLoading){
                    this.comparisonLoading = true
                }
                this.loadText = '数据请求中，请稍后……'
                getAnalysisDataDetail(data).then( response => {}).catch( () => {
                    this.comparisonLoading = false
                })
            },
            clickTab(){
                //切换页签且
                if(!this.tableArr[Number(this.detailTableName)].loadData){
                    const paramData = {
                        'id' : this.tableArr[Number(this.detailTableName)].id,
                        'detailTableName': this.tableArr[Number(this.detailTableName)].tableName,
                        'columnName' : this.tableArr[Number(this.detailTableName)].columnName,
                        'columnVal': this.columnVal,
                        'openType': this.openType
                    }
                    this.loadTableData(paramData)
                }
            },
            initWebsocket(){
                let $this = this
                // const webSocketPath = 'ws://' + window.location.host+ '/websocket?' + this.$store.state.user.id + 'graph_comparison'
                const webSocketPath = `${this.AmsWebsocket.getWSBaseUrl(this.AmsModules.GRAPHTOOL)}${this.$store.state.user.id}graph_comparison`
                // WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
                this.webSocket = new WebSocket(webSocketPath) // 建立与服务端的连接
                // 发送消息
                this.webSocket.onmessage = function(event) {
                    const dataObj = JSON.parse(event.data)// 接收到返回结果
                    const executeSQLObj = dataObj.executeSQL
                    let tabObj = $this.tableArr[Number($this.detailTableName)]
                    if (executeSQLObj.id === tabObj.id) {//匹配结果集
                        $this.comparisonLoading = false
                        if(executeSQLObj.state === "2"){//执行成功，展示当前操作的结果集
                            tabObj.loadData = true
                            $this.$refs.childTabCons[Number($this.detailTableName)].initData(null,dataObj,null)
                        }else{
                            $this.$message.error(`数据请求失败：${executeSQLObj.msg}`)
                        }
                    }
                }
                // 通信失败
                this.webSocket.onerror = function(event) {
                    $this.$message.error('数据请求失败')
                }
            },
        }
    }
</script>
