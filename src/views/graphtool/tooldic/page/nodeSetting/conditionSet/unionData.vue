<template>
    <div id="div_config">
        <div style="color:red">注：两张表所勾选融合字段的含义和顺序需保持一致，均可通过拖动行改变字段的的显示顺序</div>
        <div id="table_left" class="div_table">
            <div class="_table">
                <div class="_table_th">
                    <div id="table_name_left"></div>
                    <div class="mtDiv">
                        <el-checkbox v-model="leftMainTableChecked" @change="leftMainTableChange">主表</el-checkbox>
                    </div>
                </div>
                <div style="height: 400px;width: 400px;overflow-y: auto;">
                    <table id="col_table_col_left_data" class="table table-striped">
                        <thead>
                        <tr class="tr_th">
                            <th width="50px" style="text-align: center;">
                                <el-checkbox v-model="leftSelectAll" @change="leftSelectAllChange"></el-checkbox>
                            </th>
                            <th>融合字段</th>
                        </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(leftObj,index) in leftTableColArr" :key="leftObj.id" :data-index="index">
                                <td>
                                    <el-checkbox v-model="leftObj.checked" @change="leftColumnChange"></el-checkbox>
                                </td>
                                <td align="left">{{leftObj.colName}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="div_table" style="width: 130px;margin-top: 150px">
            <select id="conn_type" name="conn_type" class="form-control">
                <option value="union">合并</option>
                <option value="intersect">交集</option>
                <option value="exclude">补集</option>
            </select>
        </div>
        <div id="table_right" class="div_table">
            <div class="_table">
                <div class="_table_th">
                    <div id="table_name_right"></div>
                    <div class="mtDiv">
                        <el-checkbox v-model="rightMainTableChecked" @change="rightMainTableChange">主表</el-checkbox>
                    </div>
                </div>
                <div style="height: 400px;width: 400px;overflow-y: auto;">
                    <table id="col_table_col_right_data" class="table table-striped">
                        <thead>
                        <tr>
                            <th width="50px" style="text-align: center;">
                                <el-checkbox v-model="rightSelectAll" @change="rightSelectAllChange"></el-checkbox>
                            </th>
                            <th>融合字段</th>
                        </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(rightObj,index) in rightTableColArr" :key="rightObj.id" :data-index="index">
                                <td>
                                    <el-checkbox v-model="rightObj.checked" @change="rightColumnChange"></el-checkbox>
                                </td>
                                <td align="left">{{rightObj.colName}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    var nodeData
    export default {
        name: 'unionDataSet',
        data(){
            return{
                leftMainTableChecked: true,
                rightMainTableChecked: false,
                leftSelectAll: false,
                rightSelectAll: false,
                leftTableColArr: [],
                rightTableColArr: [],
                leftTableNodeId: '',
                rightTableNodeId: '',
                leftTablePreNodeId: '',
                rightTablePreNodeId: ''
            }
        },
        mounted(){
            this.init();
            window.saveSetting = this.saveSetting
            window.inputVerify = this.inputVerify
        },
        methods:{
            init(){
                let svg_width = (($(document).width() - 930) / 2) + 'px'
                $('#div_config').css({ 'margin-left': svg_width, 'margin-top': '20px' })
                let graph = this.$parent.graph
                nodeData = graph.nodeData[graph.curCell.id]
                let parentIds = nodeData.parentIds
                let isSet = nodeData.isSet
                if (isSet) {
                    var setting = nodeData.setting
                    $('#conn_type').selectpicker('val', setting.conn_type)
                    var left_data = setting.left_data
                    var right_data = setting.right_data
                    var mainType = ''// 默认主表
                    this.leftTableNodeId = left_data.nodeId
                    this.leftTablePreNodeId = left_data.preNodeId
                    $('#table_name_left').html(left_data.nodeName)
                    this.rightTableNodeId = right_data.nodeId
                    this.rightTablePreNodeId = right_data.preNodeId
                    $('#table_name_right').html(right_data.nodeName)
                    if (left_data.mainTable) {
                        mainType = 'left'
                        this.leftMainTableChecked = true
                        this.rightMainTableChecked = false
                    }
                    if (right_data.mainTable) {
                        mainType = 'right'
                        this.leftMainTableChecked = false
                        this.rightMainTableChecked = true
                    }
                    if (left_data.selectAll) {
                        this.leftSelectAll = true
                    }
                    if (right_data.selectAll) {
                        this.rightSelectAll = true
                    }
                    let colArr = [];
                    $(left_data.columnSetArr).each(function(i, v) {
                        let id = v.id
                        let colName = v.name
                        let checked = v.checked
                        colArr.push({id,colName,checked})
                    })
                    if (colArr.length !== 0) {
                        this.leftTableColArr = [...colArr];
                    }
                    colArr = [];
                    $(right_data.columnSetArr).each(function(i, v) {
                        let id = v.id
                        let colName = v.name
                        let checked = v.checked
                        colArr.push({id,colName,checked})
                    })
                    if (colArr.length !== 0) {
                        this.rightTableColArr = [...colArr];
                    }
                    // 反显输出列
                    let data = []
                    if(mainType === "left"){
                        for(let i=0;i <this.leftTableColArr.length; i++){
                            if(this.leftTableColArr[i].checked){
                                data.push({
                                    'nodeId': this.leftTablePreNodeId,
                                    'value': this.leftTableColArr[i].colName,
                                    'nullNodeId': this.leftTableNodeId
                                })
                            }
                        }
                    }else{
                        for(let i=0;i <this.rightTableColArr.length; i++){
                            if(this.rightTableColArr[i].checked){
                                data.push({
                                    'nodeId': this.rightTablePreNodeId,
                                    'value': this.rightTableColArr[i].colName,
                                    'nullNodeId': this.rightTableNodeId
                                })
                            }
                        }
                    }
                    this.$parent.$refs.outputColumnVueRef.$nextTick( () => {
                        this.$parent.$refs.outputColumnVueRef.re_checkbox(data, true)
                    })
                } else {
                    if (parentIds && parentIds.length > 0) {
                        for(let i=0; i<parentIds.length; i++){
                            let per_node = graph.nodeData[parentIds[i]]
                            let columnsInfo = per_node.columnsInfo
                            let tableName = per_node.nodeInfo.nodeName
                            let nodeId = per_node.nodeInfo.nodeId
                            let preNodeId = per_node.nodeInfo.nodeId
                            // 如果前置节点为结果表且该结果表未配置
                            if (per_node && per_node.nodeInfo.optType === 'newNullNode' && !per_node.isSet) {
                                let per_node_parentIds = per_node.parentIds
                                if (per_node_parentIds && per_node_parentIds.length > 0) {
                                    columnsInfo = graph.nodeData[per_node_parentIds[0]].columnsInfo
                                    preNodeId = graph.nodeData[per_node_parentIds[0]].nodeInfo.nodeId
                                    tableName = graph.nodeData[per_node_parentIds[0]].nodeInfo.nodeName + "_" + tableName
                                }
                            }
                            let colArr = [];
                            $(columnsInfo).each(function(ind, val) {
                                if (val.isOutputColumn) {
                                    let id = ind;
                                    let colName = val.newColumnName;
                                    let checked = false
                                    colArr.push({id,colName,checked});
                                }
                            })
                            if (colArr.length !== 0) {
                                if (i === 0) {
                                    this.leftTableNodeId = nodeId
                                    this.leftTablePreNodeId = preNodeId
                                    $('#table_name_left').html(tableName)
                                    this.leftTableColArr = [...colArr]
                                } else {
                                    this.rightTableNodeId = nodeId
                                    this.rightTablePreNodeId = preNodeId
                                    $('#table_name_right').html(tableName)
                                    this.rightTableColArr = [...colArr]
                                }
                            }
                        }
                    }
                }
                $('#col_table_col_left_data>tbody').sortable().disableSelection()
                $('#col_table_col_right_data>tbody').sortable().disableSelection()
            },
            leftColumnChange(checked){
                let chk = 0
                for(let i=0; i<this.leftTableColArr.length; i++){
                    if(this.leftTableColArr[i].checked){
                        chk++
                    }
                }
                if(chk === this.leftTableColArr.length){
                    this.leftSelectAll = true
                }else{
                    if(this.leftSelectAll = true){
                        this.leftSelectAll = false
                    }
                }
                if(this.leftMainTableChecked){
                    // 刷新输出字段信息
                    let data = []
                    for(let i=0;i <this.leftTableColArr.length; i++){
                        if(this.leftTableColArr[i].checked){
                            data.push({
                                'nodeId': this.leftTablePreNodeId,
                                'value': this.leftTableColArr[i].colName,
                                'nullNodeId': this.leftTableNodeId
                            })
                        }
                    }
                    this.$parent.$refs.outputColumnVueRef.re_checkbox(data, true)
                }
            },
            rightColumnChange(checked){
                let chk = 0
                for(let i=0; i<this.rightTableColArr.length; i++){
                    if(this.rightTableColArr[i].checked){
                        chk++
                    }
                }
                if(chk === this.rightTableColArr.length){
                    this.rightSelectAll = true
                }else{
                    if(this.rightSelectAll = true){
                        this.rightSelectAll = false
                    }
                }
                if(this.rightMainTableChecked){
                    // 刷新输出字段信息
                    let data = []
                    for(let i=0;i <this.rightTableColArr.length; i++){
                        if(this.rightTableColArr[i].checked){
                            data.push({
                                'nodeId': this.rightTablePreNodeId,
                                'value': this.rightTableColArr[i].colName,
                                'nullNodeId': this.rightTableNodeId
                            })
                        }
                    }
                    this.$parent.$refs.outputColumnVueRef.re_checkbox(data, true)
                }
            },
            leftMainTableChange(checked){
                let data = []
                if(checked){
                    this.rightMainTableChecked = false
                    for(let i=0;i <this.leftTableColArr.length; i++){
                        if(this.leftTableColArr[i].checked){
                            data.push({
                                'nodeId': this.leftTablePreNodeId,
                                'value': this.leftTableColArr[i].colName,
                                'nullNodeId': this.leftTableNodeId
                            })
                        }
                    }
                }else{
                    this.rightMainTableChecked = true
                    for(let i=0;i <this.rightTableColArr.length; i++){
                        if(this.rightTableColArr[i].checked){
                            data.push({
                                'nodeId': this.rightTablePreNodeId,
                                'value': this.rightTableColArr[i].colName,
                                'nullNodeId': this.rightTableNodeId
                            })
                        }
                    }
                }
                this.$parent.$refs.outputColumnVueRef.re_checkbox(data, true)
            },
            rightMainTableChange(checked){
                let data = []
                if(checked){
                    this.leftMainTableChecked = false
                    for(let i=0;i <this.rightTableColArr.length; i++){
                        if(this.rightTableColArr[i].checked){
                            data.push({
                                'nodeId': this.rightTablePreNodeId,
                                'value': this.rightTableColArr[i].colName,
                                'nullNodeId': this.rightTableNodeId
                            })
                        }
                    }
                }else{
                    this.leftMainTableChecked = true
                    for(let i=0;i <this.leftTableColArr.length; i++){
                        if(this.leftTableColArr[i].checked){
                            data.push({
                                'nodeId': this.leftTablePreNodeId,
                                'value': this.leftTableColArr[i].colName,
                                'nullNodeId': this.leftTableNodeId
                            })
                        }
                    }
                }
                this.$parent.$refs.outputColumnVueRef.re_checkbox(data, true)
            },
            leftSelectAllChange(checked){
                Array.from(this.leftTableColArr, (n) => n.checked = checked)
                if(this.leftMainTableChecked){
                    if(checked){
                        let data = []
                        for(let i=0;i <this.leftTableColArr.length; i++){
                            if(this.leftTableColArr[i].checked){
                                data.push({
                                    'nodeId': this.leftTablePreNodeId,
                                    'value': this.leftTableColArr[i].colName,
                                    'nullNodeId': this.leftTableNodeId
                                })
                            }
                        }
                        this.$parent.$refs.outputColumnVueRef.re_checkbox(data, true)
                    }else{
                        this.$parent.$refs.outputColumnVueRef.re_checkbox(null, true)
                    }
                }
            },
            rightSelectAllChange(checked){
                Array.from(this.rightTableColArr, (n) => n.checked = checked)
                if(this.rightMainTableChecked){
                    if(checked){
                        let data = []
                        for(let i=0;i <this.rightTableColArr.length; i++){
                            if(this.rightTableColArr[i].checked){
                                data.push({
                                    'nodeId': this.rightTablePreNodeId,
                                    'value': this.rightTableColArr[i].colName,
                                    'nullNodeId': this.rightTableNodeId
                                })
                            }
                        }
                        this.$parent.$refs.outputColumnVueRef.re_checkbox(data, true)
                    }else{
                        this.$parent.$refs.outputColumnVueRef.re_checkbox(null, true)
                    }
                }
            },
            saveSetting() {
                let left_data = {
                    'nodeId': this.leftTableNodeId,
                    'nodeName': $('#table_name_left').html(),
                    'columnSetArr': [],
                    'mainTable': false,
                    'selectAll': this.leftSelectAll,
                    'preNodeId': this.leftTablePreNodeId
                }
                let right_data = {
                    'nodeId': this.rightTableNodeId,
                    'nodeName': $('#table_name_right').html(),
                    'columnSetArr': [],
                    'mainTable': false,
                    'selectAll': this.rightSelectAll,
                    'preNodeId': this.rightTablePreNodeId
                }
                if (this.leftMainTableChecked) {
                    left_data.mainTable = true
                } else {
                    right_data.mainTable = true
                }
                let $this = this
                $("#col_table_col_left_data>tbody>tr").each(function(i,v){
                    let leftIndex = Number($(this).attr("data-index"))
                    let id = i
                    let name = $this.leftTableColArr[leftIndex].colName
                    let checked = $this.leftTableColArr[leftIndex].checked
                    left_data.columnSetArr.push({id, name, checked})
                });
                $("#col_table_col_right_data>tbody>tr").each(function(i,v){
                    let rightIndex = Number($(this).attr("data-index"))
                    let id = i
                    let name = $this.rightTableColArr[rightIndex].colName
                    let checked = $this.rightTableColArr[rightIndex].checked
                    right_data.columnSetArr.push({id, name, checked})
                });
                nodeData.setting.left_data = left_data// 选择的数据（带顺序）
                nodeData.setting.right_data = right_data// 选择的数据（带顺序）
                nodeData.setting.conn_type = $('#conn_type').val()
            },
            inputVerify() {
                let checkedIndex = 0
                let verify = true
                let $this = this
                if($this.leftMainTableChecked){//左表为主表
                    checkedIndex = $this.leftTableColArr.findIndex( n => n.checked === true)
                    $("#col_table_col_left_data>tbody>tr").each(function(i,v){
                        let leftIndex = Number($(this).attr("data-index"))
                        if($this.leftTableColArr[leftIndex].checked){
                            let rightIndex = Number($("#col_table_col_right_data>tbody>tr:eq("+i+")").attr("data-index"))
                            let curRightCol = $this.rightTableColArr[rightIndex]
                            if(typeof curRightCol === 'undefined' || !$this.rightTableColArr[rightIndex].checked){
                                verify = false
                                return false
                            }
                        }
                    });
                }else{//右表为主表
                    checkedIndex = this.rightTableColArr.findIndex( n => n.checked === true)
                    $("#col_table_col_right_data>tbody>tr").each(function(i,v){
                        let rightIndex = Number($(this).attr("data-index"))
                        if($this.rightTableColArr[rightIndex].checked){
                            let leftIndex = Number($("#col_table_col_left_data>tbody>tr:eq("+i+")").attr("data-index"))
                            let curLeftCol = $this.rightTableColArr[leftIndex]
                            if(typeof curLeftCol === 'undefined' || !$this.leftTableColArr[leftIndex].checked){
                                verify = false
                                return false
                            }
                        }
                    });
                }
                if(checkedIndex < 0){
                    this.$message({ type: 'info', message: '请勾选主表的输出字段' })
                    return false
                }
                if(!verify){
                    this.$message({ type: 'info', message: '字段顺序或勾选状态不一致，请修改' })
                }
                return verify
            }
        }
    }
</script>

<style scoped type="text/css">
    #col_table_col_left_data,#col_table_col_right_data {
        margin:0 auto;
        float: left;
        text-align: center;
    }
    #col_table_col_left_data>thead>tr,#col_table_col_left_data>tbody>tr,
    #col_table_col_right_data>thead>tr,#col_table_col_right_data>tbody>tr{
        height:38px;
        line-height: 38px;
    }
    #col_table_col_left_data>thead>tr>th,#col_table_col_right_data>thead>tr>th{
        border:1px solid #ddd;
    }
    #col_table_col_left_data>tbody>tr>td,#col_table_col_right_data>tbody>tr>td{
        border:1px solid #ddd;
    }
    ._table {
        float: left;
        width: 400px;
        height: 440px;
        margin-top:20px;
        background-color: #fff;
        border:1px solid #E6E6E6;
    }
    ._table_th {
        height: 40px;
    }
    #table_name_left,#table_name_right,.mtDiv{
        display:inline-block;
        text-align: center;
    }
    #table_name_left,#table_name_right{
        width:290px;
        padding-top: 10px;
    }
    .mtDiv{
        width: 80px;
        padding-top: 10px;
    }
    .tr_th{
        margin-left: 4px;
        margin-top: 3px;
    }
    .div_table {
        float: left;
        border: 1px solid #fff;
    }
</style>
