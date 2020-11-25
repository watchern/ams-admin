<template>
    <div style="width: 98%;margin: 4px 1%">
        <div style="color: red;">
            <p>注：（1）如果修改了【输出字段名称】且存在已配置过或执行过的后续节点，则后续节点关于该字段的配置信息会失效</p>
            <p style="text-indent: 2em">（2）如果继续使用后续节点，则需重新配置和执行相关节点</p>
            <p style="text-indent: 2em">（3）如果修改了【输出字段名称】后并执行了当前节点，则后续节点的执行结果会发生变化</p>
            <p style="text-indent: 2em">（4）支持通过拖拽更改输出字段的顺序，同时在结果集中同步展示</p>
        </div>
        <table id="column_config" class="table table-bordered">
            <thead>
            <tr>
                <th width="30%" style="text-align: center">上一节点名称</th>
                <th width="25%" style="text-align: center">字段名称</th>
                <th width="30%" style="text-align: center">输出字段名称</th>
                <th id="sel_all_th" width="15%" style="text-align: center">是否为输出字段
                    <el-checkbox v-model="checkAll" @change="handleCheckAllChange" :disabled="isAllDisabled"></el-checkbox>
                    <!--<input id="sel_all" type="checkbox" @click="selAll" style="width: 20px;height: 20px;"/>-->
                </th>
            </tr>
            </thead>
            <tbody>
                <tr v-for="(item,index) in items" class="colTr" :nodeId="item.nodeId" :nullNodeId="item.nullNodeId" :newColumnName="item.curColumnName" :columnInfo="item.columnInfo">
                    <td>{{ item.rtn }}</td>
                    <td>{{ item.curColumnName }}</td>
                    <td>
                        <input v-model="item.disColumnName" type="text" class="newColumn form-control sea_text"/>
                    </td>
                    <td class="text-center">
                        <el-checkbox type="checkbox" v-model="item.checked" :name="item.attrColumnName" :key="item.id" class="outputColumn" @blur="vilidata_simple(index)" @change="checkBoxChange(index)"></el-checkbox>
                        <!--<el-checkbox v-if="item.checked" type="checkbox" v-model="checkOp_ck" :name="item.attrColumnName" class="outputColumn" @blur="vilidata_simple" @change="allchk" style="width: 20px;height: 20px;"></el-checkbox>-->
                        <!--<el-checkbox v-if="!item.checked" type="checkbox" v-model="checkOp" :name="item.attrColumnName" class="outputColumn" @blur="vilidata_simple" @change="allchk" style="width: 20px;height: 20px;"></el-checkbox>-->
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    var nodeData, nodeInfo, columnsInfoPre
    export default {
        name: 'OutputColumnSetting',
        data() {
            return {
                re_columnsInfo: '',
                items: [],
                isIndeterminate:true,
                checkAll:false,
                isAllDisabled:false,
                isDisabled:false
            }
        },
        mounted() {
            this.init()
            window.outputVerify = this.outputVerify
        },
        methods: {
            init() {
                // vueObj = this
                let graph = this.$parent.graph
                nodeData = graph.nodeData[graph.curCell.id]
                nodeInfo = nodeData.nodeInfo
                columnsInfoPre = this.$parent.columnsInfoPre
                this.initConfig()
            },
            check_old_column() { // 重构字段组，优化查询
                var object = {}
                $(nodeData.columnsInfo).each(function(index) {
                    object[this.columnName] = this
                })
                return object
            },
            initConfig() { // 初始化字段列表
                this.re_columnsInfo = this.check_old_column()
                this.createTrFacture()
                var num = 0
                for(let i=0; i<this.items.length; i++){
                    if(!this.items[i].checked){
                        this.checkAll = false
                        num++
                        break
                    }
                }
                if (num === 0) {
                    this.checkAll = true
                }
                if (nodeInfo.optType === 'groupCount' || nodeInfo.optType === 'delRepeat' || nodeInfo.optType === 'union') {				// 分组汇总和数据去重节点的输出字段单独处理，置为不可编辑
                    this.isAllDisabled = true
                    this.isDisabled = true

                }
            },
            re_checkbox(data, hasMoreTable) {
                var num = 0
                for(let i=0; i<this.items.length; i++){
                    this.items[i].checked = false
                }
                for(let j=0; j<this.items.length; j++){
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
                    if(this.checkAll){
                        this.checkAll = false
                    }
                }
            },
            createTrFacture() {
                let isSet = nodeData.isSet// 判断当前节点是否已经设置
                let columnsInfoArray = isSet ? nodeData.columnsInfo : columnsInfoPre
                for (let column = 0; column < columnsInfoArray.length; column++) {
                    let isHide = false
                    if (isSet) {
                        let num = 0
                        for (let j = 0; j < columnsInfoPre.length; j++) {
                            if (columnsInfoArray[column].columnName === columnsInfoPre[j].newColumnName) {
                                isHide = false
                                break
                            } else {
                                num++
                            }
                        }
                        if (num === columnsInfoArray.length) {
                            isHide = true
                        }
                    }
                    let oldSetColumn = this.find_self_column(curColumnName, columnsInfoPre[column].nodeId)
                    let curColumnName = isSet ? columnsInfoArray[column].columnName : columnsInfoArray[column].newColumnName
                    let nodeId = columnsInfoPre[column].nodeId
                    let nullNodeId = columnsInfoPre[column].nullNodeId
                    let columnInfo = JSON.stringify(columnsInfoPre[column])
                    let rtn = columnsInfoPre[column].rtn
                    let checked = false
                    let id = column
                    let disColumnName = ''
                    let attrColumnName = ''
                    if(isSet && oldSetColumn.flag){
                        disColumnName = oldSetColumn.newColumnName
                        attrColumnName = oldSetColumn.columnName
                        if(oldSetColumn.checked && !isHide){
                            checked = true
                        }
                    }else{
                        disColumnName = curColumnName
                        attrColumnName = curColumnName
                    }
                    this.items.push({ id, curColumnName, nodeId, nullNodeId, columnInfo, rtn, disColumnName, attrColumnName, checked })
                }
                $('#column_config tbody').sortable().disableSelection()
            },
            get_column() { // 这里保存的是上级节点所有的字段，包括输出字段，（意义：不输出的字段不代表不是该节点的字段，在获取上级节点字段应该进一步筛选师傅是输出字段）
                var this_columnInfos = []
                for(let j=0; j<this.items.length; j++) {
                    var checked = this.items[j].checked
                    var this_column = JSON.parse(this.items[j].columnInfo)
                    var old_colum_name = this.items[j].curColumnName// 之前的newColumnName
                    var re_is_filter_comumn = []
                    $(this.$parent.is_filter_column).each(function () {
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
                    this_column.newColumnName = this.items[j].disColumnName
                    this_column.columnName = old_colum_name
                    this_column.rtn = this.items[j].rtn
                    this_column.nodeId = this.items[j].nodeId
                    this_columnInfos.push(this_column)
                }
                nodeData.columnsInfo = this_columnInfos
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
            handleCheckAllChange(checked){
                for(let i=0; i<this.items.length; i++){
                    this.items[i].checked = checked
                }
            },
            checkBoxChange(index) {
                var chk = 0
                for(let i=0; i<this.items.length; i++){
                    if(this.items[i].checked){
                        chk++
                    }
                }
                if (this.items.length === chk) { // 全选
                    this.checkAll = true
                } else { // 不全选
                    this.checkAll = false
                }
            },
            vilidata_simple(index) {
                let vili_column = []
                let verify = true
                if(typeof index !== "undefined"){//失焦时校验输出列是否重复
                    let curDisColumnName = this.items[index].disColumnName
                    for(let i=0; i<this.items.length; i++){
                        if(index !== i && this.items[i].checked){
                            if(curDisColumnName === this.items[i].disColumnName){
                                verify = false
                                break
                            }
                        }
                    }
                }else{//保存配置时校验输出列是否重复
                    for(let i=0; i<this.items.length; i++){
                        if(this.items[i].checked){
                            if($.inArray(this.items[i].disColumnName, vili_column) > -1){
                                verify = false
                            }else{
                                vili_column.push(this.items[i].disColumnName)
                            }
                        }
                    }
                }
                if (!verify) {
                    alertMsg('提示', '输出字段重复！请返回修改！', 'info')
                }
                return verify
            },
            outputVerify() {
                var verify = this.vilidata_simple()
                if (verify) {
                    var num = 0
                    for(let i=0; i<this.items.length; i++){
                        if(this.items[i].checked){
                            num++
                        }
                    }
                    if (num !== 0) {
                        verify = true
                    } else {
                        verify = false
                        alertMsg('提示', '请选择输出字段', 'info')
                    }
                }
                return verify
            }
        }
    }

    /**
     * 总体保存
     */
    function save() {
        vueObj.get_column()
        basicObj.save_base()
        saveSetting()
        nodeData.isSet = true
    }

</script>

<style scoped type="text/css">
    td>.form-group{
        margin-bottom: 0;
    }
    .table > tbody > tr > td{
        font-size: 13px;
        color: #4B4B4B;
    }
</style>
