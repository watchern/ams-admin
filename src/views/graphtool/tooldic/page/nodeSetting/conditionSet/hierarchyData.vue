<template>
    <div style="padding-top: 20px;">
        <el-row>
            <div class="containerDiv">
                <div class="form-group col-sm-3">
                    <p style="color:red;height:30px;line-height: 30px;">注：每次分层区间数不能超过五个</p>
                </div>
                <div class="form-group col-sm-4">
                    <label class="col-sm-4 control-label" style="text-align: right;">分层字段：</label>
                    <div class="col-sm-8">
                        <select id="hierarchy_column" name="status" class="selectpicker" data-live-search="true" @change="empty_set"></select>
                    </div>
                </div>
                <div class="form-group col-sm-5">
                    <span id="range" style="height:30px;line-height: 30px;padding-left: 20px;"></span>
                </div>
            </div>
        </el-row>
        <el-row>
            <div class="containerDiv">
                <table class="table table-bordered">
                    <thead>
                    <tr>
                        <th colspan="5" style="text-align: center;">分层区间列表
                            <button type="button" class="btn" @click="addRows" style="float: right;color: #000;">增加区间</button>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(item,index) in items" :key="item.id">
                        <td align="right" width="100px">区间</td>
                        <td><input v-model="item.c_col_1" type="number" min="1" class="col-1 form-control"/></td>
                        <td align="center" width="100px">至</td>
                        <td><input v-model="item.c_col_2" type="number" min="1" class="col-2 form-control"/></td>
                        <td width="100px"><img v-if="index > 0" style="width:25px;cursor:pointer;" src="../../../images/delred.png" @click="clickDel(index)"></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </el-row>
    </div>
</template>

<script>
    import {getMaxMinColumn} from '@/api/graphtool/graphList'
    var nodeData
    export default {
        name: 'HierarchyDataSet',
        data() {
            return {
                pre_str_column: [],
                dict_map: [],
                keyId: 0,
                items: [
                    {
                        id: this.keyId,
                        c_col_1: '',
                        c_col_2: ''
                    }
                ],
                loading: null,
                websocketLayeringId: '',
                loginUserUuid: ''
            }
        },
        mounted() {
            this.init()
            this.initWebSocKet()
            window.inputVerify = this.inputVerify
            window.saveSetting = this.saveSetting
        },
        methods: {
            init() {
                $('.containerDiv').css({ 'width': '1000px', 'margin-left': function() {
                    return ($(document).width() - 900) / 2 + 'px'
                } })
                // this.loginUserUuid = Cookies.get("personuuid")
                this.loginUserUuid = '2c948a86757909950175790b10b60002'
                let graph = this.$parent.graph
                nodeData = graph.nodeData[graph.curCell.id]
                let parentIds = nodeData.parentIds
                let parent_node = graph.nodeData[parentIds[0]]
                let columnsInfoPre = this.$parent.columnsInfoPre
                let typeArr = ['INTEGER', 'DECIMAL', 'NUMBER', 'FLOAT', 'REAL', 'DATE', 'TIMESTAMP']
                if (columnsInfoPre.length !== 0) { // 初始化数据源
                    var html = "<option value=''>请选择</option>"
                    for(let i=0; i<columnsInfoPre.length; i++){
                        if ($.inArray(columnsInfoPre[i].columnType, typeArr) > -1) {
                            html += "<option value='" + columnsInfoPre[i].newColumnName + "'>" + columnsInfoPre[i].newColumnName + '</option>'
                            this.pre_str_column.push(columnsInfoPre[i].newColumnName)
                        }
                    }
                    $('#hierarchy_column').html(html)
                }
                if (this.pre_str_column.length === 0) {
                    this.$message({ type: 'info', message: '上一节点的表或视图暂无可分层的字段' })
                } else {
                    if (parent_node.nodeInfo.resultTableName === '') {
                        this.$message({ type: 'info', message: '请先执行上一节点' })
                    } else {
                        /**
                         * 获得上一节点执行结果的选择字段的最大值和最小值
                         */
                        this.loading = $('body').mLoading({ 'text': '正在加载字段的区间值，请稍后……', 'hasCancel': false })
                        let dataParam = {
                            'tableName': parent_node.nodeInfo.resultTableName,
                            'openType': graph.openType,
                            'exeColumns': this.pre_str_column.join(',')
                        }
                        getMaxMinColumn(dataParam).then( response => {
                            if (response.data == null || response.data.isError) {
                                this.$message.error({ message: response.data.message })
                            }else{
                                this.websocketLayeringId = response.data.websocketLayeringId
                            }
                        })
                    }
                }
                if (nodeData.isSet) {
                    $('#hierarchy_column').selectpicker('val', nodeData.setting.hierarchy_column)// 选择的分层字段
                    this.items = []
                    this.$nextTick( () => {
                        for(let i=0; i<nodeData.setting.hierarchy_map.length; i++){
                            let obj = nodeData.setting.hierarchy_map[i]
                            this.keyId = i
                            this.items.push({
                                id:i,
                                c_col_1: obj.c_col_1,
                                c_col_2: obj.c_col_2
                            })
                        }
                    })
                }
            },
            initWebSocKet(){
                let $this = this
                // const webSocketPath = process.env.VUE_APP_GRAPHTOOL_WEB_SOCKET + this.$store.getters.personuuid;
                const webSocketPath = process.env.VUE_APP_GRAPHTOOL_WEB_SOCKET + this.loginUserUuid + 'GRAPH_LAYERING'
                // WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
                this.webSocket = new WebSocket(webSocketPath) // 建立与服务端的连接
                // 发送消息
                this.webSocket.onmessage = function(event) {
                    let dataObj = JSON.parse(event.data)//接收到返回结果
                    var result = dataObj.result
                    var executeSQLObj = dataObj.executeSQL
                    $this.loading.destroy()
                    if(executeSQLObj.id === $this.websocketLayeringId){//展示当前操作的结果集
                        for(let i=0; i<result.length; i++){
                            for(let j=0; j<$this.pre_str_column.length; j++){
                                let maxKey = `max_${$this.pre_str_column[j]}`
                                let minKey = `min_${$this.pre_str_column[j]}`
                                let obj = {}
                                obj[maxKey] = maxKey
                                obj[minKey] = minKey
                                $this.dict_map.push(obj)
                            }
                        }
                    }
                }
                // 通信失败
                this.webSocket.onerror = function(event) {
                    $this.$message.error('数据请求失败')
                }
            },
            empty_set() {
                this.items = []
                this.keyId = 0
                this.$nextTick( () => {
                    this.items.push({
                        id: this.keyId,
                        c_col_1: '',
                        c_col_2: ''
                    })
                    var sel_column = $('#hierarchy_column').val()
                    if (sel_column === '') {
                        $('#range').text('')
                        return
                    }
                    var max_value = this.dict_map['max_' + sel_column]
                    var min_value = this.dict_map['min_' + sel_column]
                    if (!isNaN(parseInt(min_value)) && !isNaN(parseInt(max_value))) {
                        $('#range').text('【最小值：' + min_value + ' ~ 最大值：' + max_value + '】')
                    } else {
                        $('#range').text('【最小值：空  ~  最大值：空】')
                    }
                })
            },
            /**
             * 添加行
             */
            addRows() {
                if (this.items.length === 5) {
                    return
                }
                this.keyId = this.keyId + 1
                this.items.push({ id: this.keyId, c_col_1: '', c_col_2: '' })
            },
            /**
             * 删除行
             */
            clickDel(index) {
                this.items.splice(index, 1)
            },
            saveSetting() {
                var obj = {
                    hierarchy_column: $('#hierarchy_column').val(),
                    hierarchy_map: []
                }
                for(let i=0; i<this.items.length; i++){
                    let c_col_1 = this.items[i].c_col_1
                    let c_col_2 = this.items[i].c_col_2
                    obj.hierarchy_map.push({ c_col_1,c_col_2 })
                }
                nodeData.setting = obj
            },
            inputVerify() {
                var verify = true
                var hierarchy_column = $('#hierarchy_column').val()
                if (hierarchy_column === '') {
                    this.$message({ type: 'info', message: '未选择分层字段' })
                    return false
                }
                let obj = this.items.find( item => item.c_col_1 === '' || item.c_col_2 === '')
                if(typeof obj !== "undefined"){
                    this.$message({ type: 'info', message: '分层区间的输入值不能为空' })
                    verify = false
                    return false
                }
                return verify
            }
        }
    }

</script>

<style scoped type="text/css">
    form {
        background: #0000;
    }
    .caption-btn-group{
        padding:0;
    }
</style>
