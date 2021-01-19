<template>
    <div style="height: 600px;">
        <ul ref="myTab" class="nav nav-tabs">
            <li>
                <a href="#basic" data-toggle="tab">基本信息</a>
            </li>
            <li class="active">
                <a href="#filter_jsp" data-toggle="tab">条件设置</a>
            </li>
            <li>
                <a href="#column" data-toggle="tab">输出字段设置</a>
            </li>
        </ul>
        <div id="myTabContent" class="tab-content">
            <div id="basic" class="tab-pane fade">
                <Basic ref="basicVueRef" />
            </div>
            <div id="filter_jsp" class="tab-pane fade in active">
                <div id="col10" class="col-sm-12" style="position: relative;background-color: #fff">
                    <div id="myDiagramDiv" ref="myDiagramDiv" class="col-sm-9" style="width:calc(100% - 245px);border: solid 1px #F3F3F3;height:600px;" @mouseover="myDiagramMousemove"></div>
                    <img v-if="showRight" width="15" height="15" title="画布放大" src="../images/fangda.png" style="z-index:9999;position: relative;top: 10px;right:30px;" @click="amplify">
                    <img v-if="!showRight" width="15" height="15" title="画布缩小" src="../images/fangda.png" style="z-index:9999;position: relative;right: 0;top: 10px;" @click="reduce">
                    <div v-if="showRight" style="width: 245px;float: right;">
                        <div style="padding: 0px 4px; height: 120px;">
                            <div class="tstext"><span style="font-weight: 800">表连接</span>（显示多个表间的关联关系）</div>
                            <div id="form" style="background: #F7F7F7;border: 1px solid #F3F3F3;height:90%;overflow-y:auto">
                                <div v-if="showTableJoin">
                                    <div class="col-sm-12">
                                        <input id="MainTable" v-model="mainTableName" name="MainTable" type="text" class="form-control" disabled="disabled">
                                    </div>
                                    <div class="form-group">
                                        <label class="col-sm-6 control-label">关联关系：</label>
                                        <div class="col-sm-6">
                                            <el-select v-model="joinType" @change="changeType">
                                                <el-option v-for="joinTypeObj in joinTypeArr" :key="joinTypeObj.value" :value="joinTypeObj.value" :label="joinTypeObj.name">{{ joinTypeObj.name }}</el-option>
                                            </el-select>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-sm-12">
                                            <input v-model="slaverTableName" type="text" class="form-control" disabled="disabled">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="margin-top:15px;height: 300px;overflow-y: auto;">
                            <div class="tstext"><span style="font-weight: 800">名词解释</span></div>
                            <div v-show="showDescription" style="background: #F7F7F7;overflow-y:auto;height:90%;padding:5px;">
                                <p ref="descriptionP" style="text-indent: 2em;">左连接：选取关联字段将两张表进行关联，左表的所有数据均显示，右表的数据只显示关联字段值相等的数据，若右表关联结果无数据则补空显示（例：详见右上角【帮助】）</p>
                                <p ref="descriptionP" style="text-indent: 2em;">右连接：选取关联字段将两张表进行关联，右表的所有数据均显示，左表的数据只显示关联字段值相等的数据，若左表关联结果无数据则补空显示（例：详见右上角【帮助】）</p>
                                <p ref="descriptionP" style="text-indent: 2em;">内连接：选取关联字段将两张表进行关联，仅显示两张表中关联字段值相等的数据（例：详见右上角【帮助】）</p>
                                <p ref="descriptionP" style="text-indent: 2em;">外连接：选取关联字段将两张表进行关联，显示出左表和右表关联后的所有数据，但去除重复数据，两表中若无关联数据则补空显示（例：详见右上角【帮助】）</p>
                            </div>
                        </div>
                        <div style="height: 140px;">
                            <div class="tstext"><span style="font-weight: 800">连接条件</span>（只显示左侧选中线的连接条件）</div>
                            <div class="col-sm-12" style="background: #F7F7F7;overflow:auto;height: 110px;">
                                <div v-if="showJoinArea" class="form-group">
                                    <div class="col-sm-12">
                                        <input v-model="mainPort" type="text" class="form-control" disabled="disabled">
                                    </div>
                                </div>
                                <div v-if="showJoinArea" class="form-group">
                                    <div class="col-sm-8">
                                        <el-select v-model="comper" @change="changeCopare">
                                            <el-option v-for="obj in comperArr" :key="obj.value" :value="obj.value" :label="obj.name">{{ obj.name }}</el-option>
                                        </el-select>
                                    </div>
                                </div>
                                <div v-if="showJoinArea" class="form-group">
                                    <div class="col-sm-12">
                                        <input v-model="toPort" type="text" class="form-control" disabled="disabled">
                                        <input v-model="from" type="hidden" class="form-control">
                                        <input v-model="to" type="hidden" class="form-control">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="sql" class="col-sm-12" style="display:none;background: #F7F7F7;height: 40%;overflow:auto"></div>
            </div>
            <div id="column" class="tab-pane fade">
                <div style="width: 98%;margin: 4px 1%">
                    <el-row style="padding: 10px 0;">
                        <el-col align="right">
                            <el-button type="primary" class="oper-btn customfield" @click="customizeColumn('1')" title="自定义字段" style="line-height: normal;"/>
                            <el-button type="primary" title="说明" class="oper-btn help" @click="helpDialogVisible = true" style="line-height: normal;"/>
                        </el-col>
                    </el-row>
                    <div ref="outPutTable" style="height: 520px;overflow-y: auto;">
                        <table id="column_config" class="table table-bordered">
                            <thead>
                            <tr>
                                <th width="5%" style="text-align: center">编号</th>
                                <th width="27%" style="text-align: center">上一节点名称</th>
                                <th width="24%" style="text-align: center">字段名称</th>
                                <th width="24%" style="text-align: center">输出字段名称</th>
                                <th width="10%" style="text-align: center">输出字段
                                    <el-checkbox v-model="checkAll" @change="handleCheckAllChange" style="float: right;"/>
                                </th>
                                <th width="10%" style="text-align: center">操作</th>
                            </tr>
                            </thead>
                            <tbody ref="outPutTbody">
                            <tr v-for="(item,index) in items" class="colTr" :data-index="index">
                                <td class="text-center">{{ index+1 }}</td>
                                <td v-if="item.isRtnTip">
                                    <el-tooltip class="item" effect="dark" :content="item.rtn" placement="top">
                                        <span>{{ item.rtnTip }}</span>
                                    </el-tooltip>
                                </td>
                                <td v-if="!item.isRtnTip">{{ item.rtn }}</td>
                                <td v-if="item.isColumnNameTip">
                                    <el-tooltip class="item" effect="dark" :content="item.columnName" placement="top">
                                        <span>{{ item.columnNameTip }}</span>
                                    </el-tooltip>
                                </td>
                                <td v-if="!item.isColumnNameTip">{{ item.columnName }}</td>
                                <td>
                                    <el-input v-model="item.disColumnName" class="newColumn"></el-input>
                                </td>
                                <td class="text-center">
                                    <el-checkbox :key="item.id" v-model="item.checked" @change="checkBoxChange(index)" />
                                </td>
                                <td class="text-center">
                                    <el-button type="primary" class="oper-btn setting" @click="customizeColumn('2',item)" title="设置" style="line-height: normal;"/>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <el-dialog :visible.sync="helpDialogVisible" :append-to-body="true" title="说明" width="400px">
                        <div style="height: 260px;padding: 10px;">
                            <p style="text-indent: 2em">（1）如果修改了【输出字段名称】且存在已配置过或执行过的后续节点，则后续节点关于该字段的配置信息会失效</p>
                            <p style="text-indent: 2em">（2）如果继续使用后续节点，则需重新配置和执行相关节点</p>
                            <p style="text-indent: 2em">（3）如果修改了【输出字段名称】后并执行了当前节点，则后续节点的执行结果会发生变化</p>
                            <p style="text-indent: 2em">（4）支持通过拖拽更改输出字段的顺序，同时在结果集中同步展示</p>
                        </div>
                    </el-dialog>
                    <el-dialog v-if="customizeColumnDialogVisible" :visible.sync="customizeColumnDialogVisible" :title="customizeColumnTitle" :close-on-press-escape="false" :close-on-click-modal="false" :append-to-body="true" width="1000px">
                        <CustomizeColumn ref="customizeColumn" :columnInfoArr="columnsInfoPre" :cur-column-info="curColumnInfo" node-type="relation" :node-data-array="curNodeDataArray"/>
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
    import CustomizeColumn from '@/views/graphtool/tooldic/page/nodeSetting/customizeColumn'
    require('@/views/graphtool/tooldic/page/nodeSetting/conditionSet/relation/js/go.js')
    import Basic from '@/views/graphtool/tooldic/page/nodeSetting/basic.vue'
    import * as relationJs from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/relation/js/relation'
    export default {
        name: 'RelationSetting',
        components: { Basic, CustomizeColumn },
        props: ['graph'],
        data() {
            return {
                join:[],
                myDiagram:null,
                layeX: -1,
                layeY: -1,
                joinShow: false,
                mainTableName: '',
                slaverTableName: '',
                items: [],
                checkAll: false,
                toPort: '',
                from: '',
                to: '',
                showJoinArea: false, // 是否显示数据表关联条件
                comper: '=',
                comperArr: [{ value: '=', name: '等于' },
                    { value: '!=', name: '不等于' },
                    { value: '>', name: '大于' },
                    { value: '>=', name: '大于等于' },
                    { value: '<', name: '小于' },
                    { value: '<=', name: '小于等于' }],
                mainPort: '',
                showDescription: true,
                showRight: true,
                showTableJoin: false,
                joinType: 'INNER JOIN',
                joinTypeArr: [{ value: 'LEFT JOIN', name: '左连接' },
                    { value: 'RIGHT JOIN', name: '右连接' },
                    { value: 'INNER JOIN', name: '内连接' },
                    { value: 'FULL JOIN', name: '外连接' }],
                columnsInfoPre: [], // 前置节点的输出列信息集合（只用于有且只有一个前置节点的节点）
                curColumnInfo:null,
                helpDialogVisible:false,
                customizeColumnDialogVisible:false,
                customizeColumnTitle:'',
                customizeColumnType:'',
                curNodeDataArray:[]
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            init() {
                relationJs.sendVueObj(this)
                relationJs.init()
                $(this.$refs.outputTbody).sortable().disableSelection()
            },
            myDiagramMousemove(event) {
                this.layeX = event.layerX
                this.layeY = event.layerY
            },
            saveNodeInfo() {
                return relationJs.saveNodeInfo()
            },
            changeType(val) {
                this.joinType = val
                relationJs.changeType()
            },
            amplify() {
                relationJs.amplify()
            },
            reduce() {
                relationJs.reduce()
            },
            changeCopare(val) {
                this.comper = val
                relationJs.changeCopare(val)
            },
            handleCheckAllChange(checked) {
                Array.from(this.items, (n) => n.checked = checked)
            },
            checkBoxChange(index) {
                var chk = 0
                for (let i = 0; i < this.items.length; i++) {
                    if (this.items[i].checked) {
                        chk++
                    }
                }
                if (this.items.length === chk) { // 全选
                    this.checkAll = true
                } else { // 不全选
                    this.checkAll = false
                }
            },
            vilidata_simple() {
                const checkedIndex = this.items.findIndex(n => n.checked === true)
                if (checkedIndex < 0) {
                    this.$message({ type: 'warning', message: '请选择输出字段' })
                    return false
                }
                const vili_column = []
                let verify = true
                let message = ''
                for (let i = 0; i < this.items.length; i++) {
                    if (this.items[i].checked) {
                        const disColumnName = this.items[i].disColumnName
                        if($.trim(disColumnName) === ""){
                            verify = false
                            message = `第${i + 1}行的输出字段的内容不能为空值，请修改`
                            break;
                        }
                        if(getStrBytes(disColumnName) > 30){
                            verify = false
                            message = `第${i + 1}行的输出字段超过30个字符的长度限制，请修改`
                            break;
                        }
                        if(!verifyReg(disColumnName)){
                            verify = false
                            message = `第${i + 1}行的输出字段中含有特殊字符或以数字开头，请修改`
                            break;
                        }
                        const curIndex = vili_column.findIndex(item => item.disColumnName === disColumnName)
                        if (curIndex > -1 && vili_column[curIndex].checked) {
                            verify = false
                            message = `第${curIndex + 1}行与第${i + 1}行的输出字段重复，请修改`
                            break;
                        }
                        vili_column.push({"checked":this.items[i].checked,"disColumnName":this.items[i].disColumnName})
                    }
                }
                if (!verify) {
                    this.$message({ type: 'warning', message: message })
                }
                return verify
            },
            inputVerify() {
                let diaGramJson = JSON.parse(this.myDiagram.model.toJson())				// 获取图表的json串
                let linkDataArray = diaGramJson.linkDataArray
                if (linkDataArray.length === 0) {
                    this.$message({ type: 'warning', message: '未设置表间的连接条件' })
                    return false
                }
                if (!this.vilidata_simple()) {
                    return false
                }
                return true		// 只是为了全局校验，此节点配置不用单独校验
            },
            /**
             * 自定义列/设置
             * @param type 打开方式（1、自定义字段，2、设置）
             * @param curColumnInfo 当前字段的信息
             */
            customizeColumn(type,curColumnInfo){
                this.customizeColumnType = type
                let diaGramJson = JSON.parse(this.myDiagram.model.toJson())				// 获取图表的json串
                this.curNodeDataArray = diaGramJson.nodeDataArray		// 获取节点（图）的数组数据
                if(type === "1"){//自定义字段
                    this.customizeColumnTitle = '自定义字段'
                    this.curColumnInfo = null
                }else{//修改设置
                    this.customizeColumnTitle = '修改设置'
                    this.curColumnInfo = curColumnInfo
                }
                this.customizeColumnDialogVisible = true
            },
            customizeColumnBack(){
                let returnObj = this.$refs.customizeColumn.saveInfo()
                if(!returnObj.isError){
                    const columnName = returnObj.columnInfo.columnName
                    let columnNameTip = columnName
                    let isColumnNameTip = false
                    if(getStrBytes(columnName) > 20){
                        isColumnNameTip = true
                        columnNameTip = `${columnName.substring(0,20)}...`
                    }
                    let resourceTableName = ''
                    let columnInfo = returnObj.columnInfo
                    let rtn = ''
                    let isRtnTip = false
                    let rtnTip = rtn
                    let checked = true
                    let id = null
                    let disColumnName = returnObj.columnInfo.newColumnName
                    if(this.customizeColumnType === "1"){//自定义字段
                        id = this.items.length + 1
                        rtn = '自定义字段'
                        this.items.push({ id, columnName, columnNameTip, isColumnNameTip, columnInfo, rtn, isRtnTip, rtnTip, disColumnName, checked, resourceTableName })
                    }else{//修改设置
                        id = this.curColumnInfo.id
                        rtn = this.curColumnInfo.rtn
                        resourceTableName = this.curColumnInfo.resourceTableName
                        if(getStrBytes(rtn) > 26){
                            isRtnTip = true
                            rtnTip = `${rtn.substring(0,26)}...`
                        }
                        let index = this.items.findIndex( item => item.id === id)
                        if(index > -1){
                            this.items[index] = {id, columnName, columnNameTip, isColumnNameTip, columnInfo, rtn, isRtnTip, rtnTip, disColumnName, checked, resourceTableName}
                        }
                    }
                    this.customizeColumnDialogVisible = false
                }
            }
        }
    }
</script>
<!--引入公共CSS样式-->
<style scoped src="@/components/ams-bootstrap/css/bootstrap.css"></style>
<style scoped src="@/components/ams-basic/css/common.css"></style>
<style scoped type="text/css">
    .tstext{
        padding-left: 5px;
    }
    .table > thead > tr > th {
        background-color: #5886B2;
        color: #ECF0F5;
        padding: 3px;
        vertical-align:middle;
    }
    .table > tbody > tr > td{
        font-size: 13px;
        color: #4B4B4B;
        line-height: 36px;
        padding: 1px;
        vertical-align:middle;
    }
</style>
