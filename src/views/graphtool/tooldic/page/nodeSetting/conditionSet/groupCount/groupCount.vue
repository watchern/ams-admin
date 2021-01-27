<template>
    <div style="height: 600px;">
        <ul id="myTab" class="nav nav-tabs">
            <li>
                <a href="#basic" data-toggle="tab">基本信息</a>
            </li>
            <li class="active">
                <a href="#filterSet" data-toggle="tab">条件设置</a>
            </li>
            <li>
                <a href="#outputColumn" data-toggle="tab">输出字段设置</a>
            </li>
        </ul>
        <div id="myTabContent" class="tab-content">
            <div id="basic" class="tab-pane fade">
                <Basic ref="basicVueRef"/>
            </div>
            <div id="filterSet" class="tab-pane fade in active">
                <div class="col-sm-12" style="padding: 20px;height: 565px;overflow-y: auto;">
                    <div id="groupAccordion" class="panel-group">
                        <div class="panel panel-default">
                            <div class="panel-heading">
                                <h4 class="panel-title">
                                    <a data-toggle="collapse" data-parent="#groupAccordion" href="#groupCollapse">分组设置</a>
                                </h4>
                            </div>
                            <div id="groupCollapse" class="panel-collapse collapse in">
                                <div class="panel-body">
                                    <div id="group" class="demo-transfer" style="margin-left: 80px;" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="countAccordion" class="panel-group">
                        <div class="panel panel-default">
                            <div class="panel-heading">
                                <h4 class="panel-title">
                                    <a data-toggle="collapse" data-parent="#countAccordion" href="#countCollapse">汇总设置</a>
                                </h4>
                            </div>
                            <div id="countCollapse" class="panel-collapse collapse">
                                <div class="panel-body">
                                    <table id="countTable" class="table table-striped">
                                        <thead>
                                        <tr>
                                            <th width="350px" style="text-align: center">待汇总字段</th>
                                            <th width="200px" style="text-align: center">汇总方式</th>
                                            <th width="200px" style="text-align: center">操作</th>
                                        </tr>
                                        </thead>
                                        <tbody id="row_add">
                                        <tr v-for="(item,index) in items" :key="item.id" ref="countTr">
                                            <td><div :id="`searchName${(item.id)}`" class="xm-select-demo"></div></td>
                                            <td><div :id="`searchType${(item.id)}`" class="xm-select-demo"></div></td>
                                            <td v-if="index === 0" align="center">
                                                <button type="button" class="btn btn-primary" @click="addCountTr">添加行</button>
                                            </td>
                                            <td v-if="index !== 0" align="center">
                                                <button type="button" class="btn btn-primary" @click="delCountTr(index)">删除行</button>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="outputColumn" class="tab-pane fade">
                <div style="width: 98%;margin: 4px 1%">
                    <el-row style="padding: 10px 0;">
                        <el-col align="right">
                            <el-button type="primary" class="oper-btn customfield" @click="customizeColumn('1')" title="自定义字段" style="line-height: normal;"/>
                            <el-button type="primary" title="说明" class="oper-btn help" @click="helpDialogVisible = true" style="line-height: normal;"/>
                        </el-col>
                    </el-row>
                    <el-table :data="columnItems" border style="width: 100%;" height="520" ref="outPutTable">
                        <el-table-column type="index" width="60" align="center" :resizable="false"></el-table-column>
                        <el-table-column label="上一节点名称" width="200" :show-overflow-tooltip="true" prop="rtn" header-align="center" :resizable="false"></el-table-column>
                        <el-table-column label="字段名称" width="260" :show-overflow-tooltip="true" prop="columnName" header-align="center" :resizable="false"></el-table-column>
                        <el-table-column label="输出字段名称" width="240" header-align="center" :resizable="false">
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.newColumnName"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column align="center" width="100" :resizable="false">
                            <template slot="header" slot-scope="scope">
                                输出字段<el-checkbox v-model="checkAll" :disabled="isAllDisabled" @change="handleCheckAllChange" style="padding-left: 5px;"/>
                            </template>
                            <template slot-scope="scope">
                                <el-checkbox v-model="scope.row.checked" :disabled="isDisabled" @change="checkBoxChange" />
                            </template>
                        </el-table-column>
                        <el-table-column align="center" label="操作" width="80" :resizable="false">
                            <template slot-scope="scope">
                                <el-button type="primary" class="oper-btn setting" @click="customizeColumn('2',scope.row)" title="设置" style="line-height: normal;"/>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-dialog :visible.sync="helpDialogVisible" :append-to-body="true" title="说明" width="400px">
                        <div style="height: 260px;padding: 10px;">
                            <p style="text-indent: 2em">（1）如果修改了【输出字段名称】且存在已配置过或执行过的后续节点，则后续节点关于该字段的配置信息会失效</p>
                            <p style="text-indent: 2em">（2）如果继续使用后续节点，则需重新配置和执行相关节点</p>
                            <p style="text-indent: 2em">（3）如果修改了【输出字段名称】后并执行了当前节点，则后续节点的执行结果会发生变化</p>
                            <p style="text-indent: 2em">（4）支持通过拖拽更改输出字段的顺序，同时在结果集中同步展示</p>
                        </div>
                    </el-dialog>
                    <el-dialog v-if="customizeColumnDialogVisible" :visible.sync="customizeColumnDialogVisible" :title="customizeColumnTitle" :close-on-press-escape="false" :close-on-click-modal="false" :append-to-body="true" width="1000px">
                        <CustomizeColumn ref="customizeColumn" :columnInfoArr="columnsInfoPre" :cur-column-info="curColumnInfo" node-type="groupCount"/>
                        <div slot="footer" class="dialog-footer">
                            <el-button @click="customizeColumnDialogVisible = false">取消</el-button>
                            <el-button type="primary" @click="customizeColumnBack()">保存</el-button>
                        </div>
                    </el-dialog>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Basic from '@/views/graphtool/tooldic/page/nodeSetting/basic.vue'
    import CustomizeColumn from '@/views/graphtool/tooldic/page/nodeSetting/customizeColumn.vue'
    import * as groupCountJs from '@/api/graphtool/js/groupCount'
    export default {
        name: 'GroupCountSet',
        components: { Basic, CustomizeColumn },
        data() {
            return {
                items: [], // 存放霍总配置的行号
                nodeData: null,
                columnsInfoPre: [], // 前置节点的输出列信息集合（只用于有且只有一个前置节点的节点）
                countTrNum: 1,
                isAllDisabled:false,
                checkAll:false,
                columnItems:[],
                isDisabled:false,
                columnData:[],// 穿梭框中加载的字段数据数组集合
                columnsInfo:[],// 所有输出列信息
                groupTransfer:null,// 分组的穿梭框对象
                curColumnInfo:null,
                helpDialogVisible:false,
                customizeColumnDialogVisible:false,
                customizeColumnTitle:'',
                customizeColumnType:'',
                ind:0//记录输出字段的唯一标识
            }
        },
        props:['graph'],
        mounted() {
            this.nodeData = this.graph.nodeData[this.graph.curCell.id]
            groupCountJs.sendVueObj(this)
            groupCountJs.init()
        },
        methods: {
            handleCheckAllChange(checked){
                Array.from(this.columnItems, (n) => n.checked = checked)
            },
            checkBoxChange(){
                var chk = 0
                for (let i = 0; i < this.columnItems.length; i++) {
                    if (this.columnItems[i].checked) {
                        chk++
                    }
                }
                if (this.columnItems.length === chk) { // 全选
                    this.checkAll = true
                } else { // 不全选
                    this.checkAll = false
                }
            },
            addCountTr() {
                groupCountJs.addCountTr()
            },
            delCountTr(index, event) {
                groupCountJs.delCountTr(index)
            },
            vilidata_simple() {
                const checkedIndex = this.columnItems.findIndex(n => n.checked === true)
                if (checkedIndex < 0) {
                    this.$message({ type: 'warning', message: '请选择输出字段' })
                    return false
                }
                const vili_column = []
                let verify = true
                let message = ''
                for (let i = 0; i < this.columnItems.length; i++) {
                    if (this.columnItems[i].checked) {
                        const curNewColumnName = this.columnItems[i].newColumnName
                        if($.trim(curNewColumnName) === ""){
                            verify = false
                            message = `第${i + 1}行的输出字段的内容不能为空值，请修改`
                            break;
                        }
                        if(getStrBytes(curNewColumnName) > 30){
                            verify = false
                            message = `第${i + 1}行的输出字段的内容超过30个字符的长度限制，请修改`
                            break;
                        }
                        if(!verifyReg(curNewColumnName)){
                            verify = false
                            message = `第${i + 1}行的输出字段的内容含有特殊字符或以数字开头，请修改`
                            break;
                        }
                        const curIndex = vili_column.findIndex(item => item.newColumnName === curNewColumnName)
                        if (curIndex > -1 && vili_column[curIndex].checked) {
                            verify = false
                            message = `第${curIndex + 1}行与第${i + 1}行的输出字段的内容重复，请修改`
                            break;
                        }
                    }
                    vili_column.push({"checked":this.columnItems[i].checked,"newColumnName":this.columnItems[i].newColumnName})
                }
                if (!verify) {
                    this.$message({ type: 'warning', message: message })
                }
                return verify
            },
            //保存节点信息
            saveNodeInfo() {
                return groupCountJs.saveNodeInfo()
            },
            //节点输入项的校验(或空配置校验)
            inputVerify() {
                return groupCountJs.inputVerify()
            },
            /**
             * 自定义列/设置
             * @param type 打开方式（1、自定义字段，2、设置）
             * @param curColumnInfo 当前字段的信息
             */
            customizeColumn(type,curColumnInfo){
                this.customizeColumnType = type
                if(type === "1"){//自定义字段
                    this.customizeColumnTitle = '自定义字段'
                    this.curColumnInfo = null
                }else{//修改设置
                    if(typeof curColumnInfo.sign !== 'undefined' && curColumnInfo.sign !== ''){
                        this.$message({'type':'warning','message':'汇总字段不可被修改'})
                        return
                    }
                    this.customizeColumnTitle = '修改设置'
                    this.curColumnInfo = curColumnInfo
                }
                this.customizeColumnDialogVisible = true
            },
            customizeColumnBack(){
                let returnObj = this.$refs.customizeColumn.saveInfo()
                if(!returnObj.isError){
                    this.customizeColumnDialogVisible = false
                    const columnName = returnObj.columnInfo.columnName
                    let id = null
                    let nodeId = ''
                    let columnInfo = returnObj.columnInfo
                    let rtn = ''
                    let checked = true
                    let newColumnName = returnObj.columnInfo.newColumnName
                    if(this.customizeColumnType === "1"){//自定义字段
                        id = this.ind
                        nodeId = 'customizeColumn'
                        rtn = '自定义字段'
                        columnInfo.nodeId = nodeId
                        columnInfo.rtn = rtn
                        this.columnItems.push({id, nodeId, columnName, columnInfo, rtn, newColumnName, checked})
                        this.ind++
                    }else{//修改设置
                        id = this.curColumnInfo.id
                        rtn = this.curColumnInfo.rtn
                        nodeId = this.curColumnInfo.nodeId
                        columnInfo.nodeId = nodeId
                        columnInfo.rtn = rtn
                        let index = this.columnItems.findIndex( item => item.id === id)
                        if(index > -1){
                            this.columnItems.splice(index,1)
                            this.columnItems.splice(index,1,{id, nodeId, columnName, columnInfo, rtn, newColumnName, checked})
                        }
                    }
                }
            }
        }
    }
</script>

<style scoped src="@/components/ams-bootstrap/css/bootstrap.css"></style>
<style scoped src="@/api/graphtool/css/common.css"></style>
<style scoped src="@/api/graphtool/css/accordion.css"></style>
<style scoped>
    >>> .el-table .cell {
        padding: 0;
    }
    >>> .el-input__inner {
        margin: 0;
    }
    #countTable{
        margin-left: 80px;
        width: 760px;
    }
    #countTable>thead>tr>th{
        border:1px solid #ddd;
    }
    #countTable>tbody>tr>td{
        border:1px solid #ddd;
    }
    .panel-body{
        padding: 10px 0;
    }
</style>
