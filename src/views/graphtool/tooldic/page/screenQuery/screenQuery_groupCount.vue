<template>
    <div style="height: 600px;overflow-y: auto;">
        <el-collapse v-model="activeCollapseNames" accordion>
            <el-collapse-item title="分组设置" name="groupSet">
                <el-transfer filterable filter-placeholder="请输入搜索内容" v-model="columnDataValue" :data="columnData" :titles="['可选字段', '分组字段']" style="padding-left: 90px;"></el-transfer>
            </el-collapse-item>
            <el-collapse-item title="汇总设置" name="countSet">
                <el-table :data="items" height="450" style="width: 770px;margin-left: 90px;">
                    <el-table-column label="待汇总字段" width="350" header-align="center">
                        <template slot-scope="scope">
                            <div :id="`searchName${(scope.row.id)}`" class="xm-select-demo"></div>
                        </template>
                    </el-table-column>
                    <el-table-column label="汇总方式" width="240" header-align="center">
                        <template slot-scope="scope">
                            <div :id="`searchType${(scope.row.id)}`" class="xm-select-demo"></div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="180" align="center">
                        <template slot-scope="scope">
                            <el-button v-if="scope.$index === 0" type="primary" class="oper-btn add" @click="addCountTr" title="添加行" style="line-height: normal;"/>
                            <el-button v-if="scope.$index !== 0" type="primary" class="oper-btn delete" title="删除行" @click="delCountTr(scope.$index)" style="line-height: normal;"/>
                        </template>
                    </el-table-column>
                </el-table>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script>
    export default {
        name: "screenQueryGroupCount",
        data() {
            return {
                activeCollapseNames:['groupSet'],
                items: [], //存放霍总配置的行号
                countTrNum: 1,
                columnData:[],//穿梭框中加载的字段数据数组集合
                columnDataValue:[],//穿梭框中已选择的字段数据数组集合
                allColumnArr:[],//最终输出列名称集合
                countColumnStrArr:[],//汇总设置输出列名称集合（拼接好了汇总类型的串）
                countColumnArr:[],//设置汇总字段的名称集合
                countData:[],//存储汇总设置配置
                typeArr:["INTEGER","DECIMAL","NUMBER","FLOAT","REAL","DATE","TIMESTAMP"], //可用于统计的字段类型

            }
        },
        props:['columnInfoArr','setting'],
        mounted() {
            this.init()
        },
        methods: {
            init(){
                if(typeof this.setting !== "undefined" && (this.setting.groupData.length !== 0 || this.setting.countData.length !== 0)){
                    //初始化分组穿梭框和分组字段（不是已分组字段，是可分组字段）输出列列表
                    this.initGroupTransfer();
                    this.columnDataValue = this.setting.groupData;
                    let curCountData = this.setting.countData;//获取汇总字段的配置数组
                    if(curCountData.length > 0){//如果有汇总字段
                        //反显汇总字段的配置
                        for (let j=0; j<curCountData.length; j++) {
                            this.items.push({ 'id': j})
                        }
                        this.$nextTick(() => {
                            for (let m = 0; m < curCountData.length; m++) {
                                this.initCountSelectData(m)
                                this.countTrNum = m + 1
                                let chooseColumnXs = xmSelect.get(`#searchName${m}` , true)// 获取当前行中汇总字段名称的单实例
                                let initCountColumnData = JSON.parse(JSON.stringify(this.columnData))// 复制全局汇总字段的数组变量的值
                                initCountColumnData.unshift({ 'name': '请选择', 'value': '', 'type': '' })
                                for (let n = 0; n < initCountColumnData.length; n++) { // 设置已汇总字段名称值的选中状态，重新渲染当前行的下拉框
                                    if(curCountData[m].columnName === initCountColumnData[n].value){
                                        initCountColumnData[n].selected = true;
                                        break;
                                    }
                                }
                                // 重新渲染汇总字段当前行的下拉框
                                chooseColumnXs.update({
                                    'data': initCountColumnData
                                })
                                let chooseTypeXs = xmSelect.get(`#searchType${m}`, true)// 获取当前行中汇总方式的单实例
                                // 汇总方式的初始化默认数据数组
                                let initCountTypeData = [
                                    { 'name': '请选择', 'value': '' },
                                    { 'name': '计数', 'value': 'count' },
                                    { 'name': '求和', 'value': 'sum' },
                                    { 'name': '最大值', 'value': 'max' },
                                    { 'name': '最小值', 'value': 'min' },
                                    { 'name': '平均值', 'value': 'ave' }
                                ]
                                initCountTypeData.forEach( item => {
                                    if ($.inArray(curCountData[m].columnType, this.typeArr) < 0) { // 设置不可汇总字段的数据数组（不能写到这个for循环外面）
                                        switch (item.value) {
                                            case 'sum':
                                            case 'max':
                                            case 'min':
                                            case 'ave':
                                                item.disabled = true
                                                break
                                        }
                                    }
                                    if (curCountData[m].countTypeValue === item.value) { // 设置已汇总类型的选中状态
                                        item.selected = true
                                    }
                                })
                                // 重新渲染汇总方式当前行的下拉框
                                chooseTypeXs.update({
                                    'data': initCountTypeData
                                })
                                this.items[m].chooseColumnXs = chooseColumnXs
                                this.items[m].chooseTypeXs = chooseTypeXs
                            }
                        })
                    }else{
                        this.countTrNum = 0
                        this.addCountTr()
                    }
                }else{
                    this.initGroupTransfer()
                    this.countTrNum = 0
                    this.addCountTr()
                }
            },
            /**
             * 初始化分组穿梭框
             */
            initGroupTransfer(){
                //循环输出列信息，组织穿梭框所使用的字段数据数组集合
                Array.from(this.columnInfoArr, item => {
                    /**
                     * item..isCount
                     * @description 第一种是undefined（这种情况是第一次配置该节点）
                     * @description 第二种是false（这种情况是该节点已经配置过一次，为false的字段信息是可用于分组的字段，同时也是前置节点的所有输出字段）
                     */
                    if (!item.isCount) {
                        this.allColumnArr.push(item.newColumnName)//读取其输出列名称
                        /**
                         * @type {{name: *, value: *, title: *, type: string}}
                         * @description name与value属性是为了满足xmSelect插件的数据格式
                         * @description pinyin、label、key属性是transfer插件的数据格式
                         * @description type是处理数据时需要用到的额外属性
                         */
                        this.columnData.push({'name': item.newColumnName, 'value': item.newColumnName, 'pinyin': item.newColumnName, 'label': item.newColumnName, 'key': item.newColumnName, 'type': item.columnType})
                    }
                })
            },
            /**
             * 初始化统计设置的下拉框数据
             * @trNum 当前行号
             */
            initCountSelectData(trNum){
                let $this = this
                //复制数组，添加请选择
                let dataArr = this.columnData.slice()
                dataArr.unshift({"name":"请选择","value":"","type":"","selected":true})
                //统计方式的初始化默认数据数组
                let countTypeDefaultData = [
                    {"name":"请选择","value":"","selected":true},
                    {"name":"计数","value":"count"},
                    {"name":"求和","value":"sum"},
                    {"name":"最大值","value":"max"},
                    {"name":"最小值","value":"min"},
                    {"name":"平均值","value":"avg"}
                ];
                //不可统计字段的数据数组
                let disableCountData = [
                    {"name":"请选择","value":"","selected":true},
                    {"name":"计数","value":"count"},
                    {"name":"求和","value":"sum","disabled":true},
                    {"name":"最大值","value":"max","disabled":true},
                    {"name":"最小值","value":"min","disabled":true},
                    {"name":"平均值","value":"avg","disabled":true}
                ];
                let chooseColumnXs = xmSelect.render({
                    el: '#searchName' + trNum,
                    radio: true,
                    clickClose: true,
                    filterable: true,
                    filterMethod: function(val, item){
                        //把value相同的搜索出来或把名称中包含的搜索出来
                        if(val === item.value || (item.name && item.name.indexOf(val) > -1)){
                            return true
                        }
                        return false
                    },
                    on: function(data){
                        //此次选择变化的数据（数组），因radio=true,所以直接取第一个对象
                        let change = data.change[0];
                        //此次操作是选中还是取消选中
                        let isAdd = data.isAdd;
                        let value = change.value;//获取当前汇总字段的值
                        if(isAdd){//如果是选中，需删除旧标识创建的输出列的行数据
                            if(value === ""){//选中“请选择”
                                chooseTypeXs.update({
                                    data: countTypeDefaultData,
                                    // autoRow: true,
                                });
                            }else{//选中其他字段
                                let columnType = change.type; //当前所选中字段的数据类型
                                if($.inArray(columnType.toUpperCase(),$this.typeArr) < 0){  //数值或日期类型
                                    chooseTypeXs.update({
                                        data: disableCountData,
                                    });
                                }else{
                                    chooseTypeXs.update({
                                        data: countTypeDefaultData,
                                    });
                                }
                            }
                        }
                    },
                    data: dataArr
                });
                let chooseTypeXs = xmSelect.render({
                    el: '#searchType' + trNum,
                    radio: true,
                    clickClose: true,
                    filterMethod: function(val, item){
                        //把value相同的搜索出来或把名称中包含的搜索出来
                        if(val === item.value || (item.name && item.name.indexOf(val) > -1)){
                            return true;
                        }
                        return false;
                    },
                    data: countTypeDefaultData,
                });
            },
            addCountTr() {
                this.items.push({ 'id': this.countTrNum})
                this.$nextTick(() => {
                    this.initCountSelectData(this.countTrNum)
                    let chooseColumnXs = xmSelect.get(`#searchName${this.countTrNum}`, true)
                    let chooseTypeXs = xmSelect.get(`#searchType${this.countTrNum}`, true)
                    let itemObj = this.items.find( item => item.id === this.countTrNum)
                    if(typeof itemObj !== "undefined"){
                        itemObj.chooseColumnXs = chooseColumnXs
                        itemObj.chooseTypeXs = chooseTypeXs
                    }
                    this.countTrNum = this.countTrNum + 1
                })
            },
            delCountTr(index) {
                this.items.splice(index, 1)
            },
            //保存节点信息
            saveSetting() {
                let whereObj = {
                    "whereStr": "",
                    "hasWhere": false,
                    "columnArr": this.allColumnArr,
                    "colArr": this.countColumnArr,
                    "setting": {
                        "countData": this.countData,
                        "groupData": []
                    }
                }
                whereObj.setting.groupData = this.columnDataValue
                let newColumnArr = []
                if(this.countColumnStrArr.length !== 0){//设置统计字段
                    if(this.columnDataValue.length === 0) {//未设置分组字段
                        whereObj.columnArr = this.countColumnStrArr
                    }else{//设置分组字段
                        Array.from(this.columnDataValue, item => newColumnArr.push(item))
                        whereObj.whereStr = " GROUP BY " + newColumnArr.join(",")
                        whereObj.columnArr = newColumnArr.concat(this.countColumnStrArr)
                        whereObj.colArr = newColumnArr.concat(this.countColumnArr)
                    }
                }else{
                    if(this.columnDataValue.length !== 0) {//设置分组字段
                        Array.from(this.columnDataValue, item => newColumnArr.push(item))
                        whereObj.whereStr = " ORDER BY " + newColumnArr.join(",")
                    }
                }
                return whereObj
            },
            //节点输入项的校验(或空配置校验)
            verifySetting() {
                //获取已统计字段数量
                let countNum = 0
                //已统计字段信息
                let countColumnArrInfo = []
                let countSetIsRepeat = false
                this.countColumnArr = []
                this.countData = []
                this.countColumnStrArr = []
                for(let i=0; i<this.items.length; i++){
                    let columnValue = this.items[i].chooseColumnXs.getValue();//获取选中的统计字段名称
                    let typeValue = this.items[i].chooseTypeXs.getValue();//获取选中的统计方式
                    if(columnValue.length > 0 && typeValue.length > 0){//如果都有选中的值
                        if(columnValue[0].value !== "" && typeValue[0].value !== ""){//如果选中的值都不为“请选择”
                            countNum++
                            let repeatSign = columnValue[0].value + "_" + typeValue[0].value
                            if(countColumnArrInfo.indexOf(repeatSign) > -1){
                                countSetIsRepeat = true
                                break
                            }else{
                                this.countColumnStrArr.push(`${typeValue[0].value}(${columnValue[0].name}) as ${columnValue[0].name}_${typeValue[0].name}`)
                                this.countColumnArr.push(`${columnValue[0].name}_${typeValue[0].name}`)
                                this.countData.push({"columnName":columnValue[0].name,"columnType":columnValue[0].type,"countTypeValue":typeValue[0].value})
                                countColumnArrInfo.push(repeatSign)
                            }
                        }
                    }
                }
                if(this.columnDataValue.length === 0 && countNum === 0){
                    this.$message({'type':'warning','message':'未设置分组或统计的字段'})
                    return false;
                }
                if(countSetIsRepeat){
                    this.$message({'type':'warning','message':'汇总的字段重复配置，请检查'})
                    return false;
                }
                return true;
            }
        }
    }
</script>
<style scoped>
    >>> .el-table .cell {
        padding: 0;
        display: inline;
    }
    >>> .el-collapse-item__content{
        padding: 5px 0;
    }
    >>> .el-collapse-item__wrap{
        border-bottom: unset;
    }
    >>> .el-transfer-panel{
        width: 300px;
    }
</style>
