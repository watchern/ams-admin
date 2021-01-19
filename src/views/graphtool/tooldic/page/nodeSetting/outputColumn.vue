<template>
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
                        <el-checkbox v-model="checkAll" :disabled="isAllDisabled" @change="handleCheckAllChange" style="float: right;"/>
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
                    <td v-if="item.isCurColumnNameTip">
                        <el-tooltip class="item" effect="dark" :content="item.curColumnName" placement="top">
                            <span>{{ item.curColumnNameTip }}</span>
                        </el-tooltip>
                    </td>
                    <td v-if="!item.isCurColumnNameTip">{{ item.curColumnName }}</td>
                    <td>
                        <el-input v-model="item.disColumnName" class="newColumn"></el-input>
                    </td>
                    <td class="text-center">
                        <el-checkbox :key="item.id" v-model="item.checked" :disabled="isDisabled" @change="checkBoxChange(index)" />
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
            <CustomizeColumn ref="customizeColumn" :columnInfoArr="columnsInfoPre" :cur-column-info="curColumnInfo" node-type="common"/>
            <div slot="footer" class="dialog-footer">
                <el-button @click="customizeColumnDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="customizeColumnBack()">保存</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import CustomizeColumn from '@/views/graphtool/tooldic/page/nodeSetting/customizeColumn'
    export default {
        name: 'OutputColumnSetting',
        components:{ CustomizeColumn },
        data() {
            return {
                nodeData: null,
                columnsInfoPre: this.$parent.columnsInfoPre,
                re_columnsInfo: '',
                items: [],
                isIndeterminate: true,
                checkAll: false,
                isAllDisabled: false,
                isDisabled: false,
                helpDialogVisible:false,
                customizeColumnDialogVisible:false,
                curColumnInfo:null,
                customizeColumnType:'',
                customizeColumnTitle:''
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            init() {
                const graph = this.$parent.graph
                this.nodeData = graph.nodeData[graph.curCell.id]
                this.initConfig()
            },
            check_old_column() { // 重构字段组，优化查询
                const object = {}
                $(this.nodeData.columnsInfo).each(function(index) {
                    object[this.columnName] = this
                })
                return object
            },
            initConfig() { // 初始化字段列表
                this.re_columnsInfo = this.check_old_column()
                this.createTrFacture()
                var num = 0
                for (let i = 0; i < this.items.length; i++) {
                    if (!this.items[i].checked) {
                        this.checkAll = false
                        num++
                        break
                    }
                }
                if (num === 0) {
                    this.checkAll = true
                }
                if (this.nodeData.nodeInfo.optType === 'delRepeat' || this.nodeData.nodeInfo.optType === 'union') {				// 分组汇总和数据去重节点的输出字段单独处理，置为不可编辑
                    this.isAllDisabled = true
                    this.isDisabled = true
                }
            },
            re_checkbox(data, hasMoreTable) {
                var num = 0
                for (let i = 0; i < this.items.length; i++) {
                    this.items[i].checked = false
                }
                for (let j = 0; j < this.items.length; j++) {
                    var nodeId = this.items[j].nodeId
                    var nullNodeId = this.items[j].nullNodeId
                    if (data && data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].value === this.items[j].curColumnName) {
                                if (data[i].nodeId === nodeId && hasMoreTable && data[i].nullNodeId === nullNodeId) {
                                    this.items[j].checked = true
                                    num++
                                    break
                                }
                                if (!hasMoreTable) {
                                    this.items[j].checked = true
                                    num++
                                    break
                                }
                            }
                        }
                    }
                }
                if (num === this.items.length) {
                    this.checkAll = true
                } else {
                    if (this.checkAll) {
                        this.checkAll = false
                    }
                }
            },
            createTrFacture() {
                const isSet = this.nodeData.isSet// 判断当前节点是否已经设置
                const columnsInfoArray = isSet ? this.nodeData.columnsInfo : this.columnsInfoPre
                for (let column = 0; column < columnsInfoArray.length; column++) {
                    const curColumnName = isSet ? columnsInfoArray[column].columnName : columnsInfoArray[column].newColumnName
                    let curColumnNameTip = curColumnName
                    let isCurColumnNameTip = false
                    if(getStrBytes(curColumnName) > 20){
                        isCurColumnNameTip = true
                        curColumnNameTip = `${curColumnName.substring(0,20)}...`
                    }
                    let nodeId = ''
                    let nullNodeId = ''
                    let resourceTableName = ''
                    let columnInfo = ''
                    let rtn = ''
                    let isRtnTip = false
                    let rtnTip = rtn
                    let checked = false
                    const id = column
                    let disColumnName = ''
                    let isHide = false
                    if (isSet) {
                        nodeId = columnsInfoArray[column].nodeId
                        nullNodeId = columnsInfoArray[column].nullNodeId
                        columnInfo = columnsInfoArray[column]
                        rtn = columnsInfoArray[column].rtn
                        resourceTableName = columnsInfoArray[column].resourceTableName
                        let num = 0
                        for (let j = 0; j < this.columnsInfoPre.length; j++) {
                            if (columnsInfoArray[column].columnName === this.columnsInfoPre[j].newColumnName) {
                                isHide = false
                                break
                            } else {
                                num++
                            }
                        }
                        if (num === columnsInfoArray.length) {
                            isHide = true
                        }
                        if(columnsInfoArray[column].nodeId === "customizeColumn"){
                            if(columnsInfoArray[column].isOutputColumn === 1){
                                checked = true
                            }
                            disColumnName = columnsInfoArray[column].newColumnName
                        }else{
                            let oldSetColumnInfo = this.columnsInfoPre.find(n => n.newColumnName === curColumnName)
                            if(typeof oldSetColumnInfo !== "undefined"){
                                const oldSetColumn = this.find_self_column(curColumnName, oldSetColumnInfo.nodeId)
                                if(oldSetColumn.flag){
                                    disColumnName = oldSetColumn.newColumnName
                                    if (oldSetColumn.checked && !isHide) {
                                        checked = true
                                    }
                                }else{
                                    disColumnName = curColumnName
                                }
                            }
                        }
                    }else{
                        disColumnName = curColumnName
                        nodeId = this.columnsInfoPre[column].nodeId
                        nullNodeId = this.columnsInfoPre[column].nullNodeId
                        columnInfo = this.columnsInfoPre[column]
                        rtn = this.columnsInfoPre[column].rtn
                        resourceTableName = this.columnsInfoPre[column].resourceTableName
                    }
                    if(getStrBytes(rtn) > 26){
                        isRtnTip = true
                        rtnTip = `${rtn.substring(0,26)}...`
                    }
                    this.items.push({ id, curColumnName, curColumnNameTip, isCurColumnNameTip, nodeId, nullNodeId, columnInfo, rtn, isRtnTip, rtnTip, disColumnName, checked, resourceTableName})
                }
                $(this.$refs.outPutTbody).sortable().disableSelection()
            },
            get_column() { // 这里保存的是上级节点所有的字段，包括输出字段，（意义：不输出的字段不代表不是该节点的字段，在获取上级节点字段应该进一步筛选师傅是输出字段）
                let $this = this
                const this_columnInfos = []
                let trDom = $(this.$refs.outPutTbody).find(".colTr")
                if(typeof trDom !== 'undefined' && trDom.length > 0){
                    $.each(trDom,function () {
                        const index = this.getAttribute('data-index')
                        var checked = $this.items[index].checked
                        var this_column = $this.items[index].columnInfo
                        var old_colum_name = $this.items[index].curColumnName// 之前的newColumnName
                        var re_is_filter_comumn = []
                        $($this.$parent.is_filter_column).each(function () {
                            re_is_filter_comumn.push(this.value)
                        })
                        if (re_is_filter_comumn.length === 0 || $.inArray(old_colum_name, re_is_filter_comumn) > -1) { // 没有做配置、没有类似去重此功能需求或者配置并且在对勾显示字段的
                            if (checked) {
                                this_column.isOutputColumn = 1// is output column
                            } else {
                                this_column.isOutputColumn = 0
                            }
                        } else {
                            this_column.isOutputColumn = 0
                        }
                        this_column.newColumnName = $this.items[index].disColumnName
                        this_column.columnName = old_colum_name
                        this_column.rtn = $this.items[index].rtn
                        this_column.nodeId = $this.items[index].nodeId
                        this_columnInfos.push(this_column)
                    })
                }
                this.nodeData.columnsInfo = this_columnInfos
            },
            find_self_column(columnName, nodeId) { // 是否设置并且含有当前字段
                var obj = {
                    flag: false,
                    columnName: columnName,
                    newColumnName: columnName,
                    checked: false
                }
                var oldset = this.re_columnsInfo
                // 通过当前节点下的字段名称进行匹配，防止不同节点含有相同字段名称所导致的共用一个输出字段值con's
                if (typeof oldset[columnName] !== 'undefined') {
                    obj.flag = true
                    obj.columnName = columnName
                    obj.newColumnName = oldset[columnName].newColumnName
                    obj.checked = oldset[columnName].isOutputColumn !== 0
                }
                return obj
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
                    }
                    vili_column.push({"checked":this.items[i].checked,"disColumnName":this.items[i].disColumnName})
                }
                if (!verify) {
                    this.$message({ type: 'warning', message: message })
                }
                return verify
            },
            outputVerify() {
                return this.vilidata_simple()
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
                    this.customizeColumnTitle = '修改设置'
                    this.curColumnInfo = curColumnInfo
                }
                this.customizeColumnDialogVisible = true
            },
            customizeColumnBack(){
                let returnObj = this.$refs.customizeColumn.saveInfo()
                if(!returnObj.isError){
                    const curColumnName = returnObj.columnInfo.columnName
                    let curColumnNameTip = curColumnName
                    let isCurColumnNameTip = false
                    if(getStrBytes(curColumnName) > 20){
                        isCurColumnNameTip = true
                        curColumnNameTip = `${curColumnName.substring(0,20)}...`
                    }
                    let nodeId = ''
                    let nullNodeId = ''
                    let resourceTableName = ''
                    let columnInfo = returnObj.columnInfo
                    let rtn = ''
                    let isRtnTip = false
                    let rtnTip = rtn
                    let checked = true
                    let id = null
                    let disColumnName = returnObj.columnInfo.newColumnName
                    if(this.customizeColumnType === "1"){//自定义字段
                        nodeId = 'customizeColumn'
                        nullNodeId = 'customizeColumn'
                        resourceTableName = 'customizeColumnTempTable'
                        id = this.items.length + 1
                        rtn = '自定义字段'
                        this.items.push({ id, curColumnName, curColumnNameTip, isCurColumnNameTip, nodeId, nullNodeId, columnInfo, rtn, isRtnTip, rtnTip, disColumnName, checked, resourceTableName})
                    }else{//修改设置
                        id = this.curColumnInfo.id
                        nodeId = this.curColumnInfo.nodeId
                        nullNodeId = this.curColumnInfo.nullNodeId
                        rtn = this.curColumnInfo.rtn
                        resourceTableName = this.curColumnInfo.resourceTableName
                        if(getStrBytes(rtn) > 26){
                            isRtnTip = true
                            rtnTip = `${rtn.substring(0,26)}...`
                        }
                        let index = this.items.findIndex( item => item.id === this.curColumnInfo.id)
                        if(index > -1){
                            this.items[index] = {id, curColumnName, curColumnNameTip, isCurColumnNameTip, nodeId, nullNodeId, columnInfo, rtn, isRtnTip, rtnTip, disColumnName, checked, resourceTableName}
                        }
                    }
                    this.customizeColumnDialogVisible = false
                }
            }
        }
    }
</script>
<style scoped src="@/components/ams-bootstrap/css/bootstrap.css"></style>
<style scoped src="@/components/ams-basic/css/common.css"></style>
<style scoped type="text/css">
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
