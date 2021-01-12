<template>
    <div style="height:600px;padding-left:50px;">
        <p style="height:30px;line-height: 30px;color: red;">注：已排序字段列表中，可通过拖动行改变字段的显示顺序</p>
        <div id="toSortListScreen" ref="toSortListScreen" class="demo-transfer twotransfer" style="width: 400px;float: left;margin-top:10px;" />
        <div style="float: left;width: 450px; height: 500px;margin-top:10px;background-color: #fff;border:1px solid #E6E6E6;overflow-y: auto">
            <table id="col_table_col" class="table_auto">
                <thead>
                <tr>
                    <td width="80px">
                        <el-checkbox v-model="selectAll" @change="handleCheckAllChange" />
                    </td>
                    <td width="200px" align="center">已选择排序字段</td>
                    <td width="200px">排序方式</td>
                </tr>
                </thead>
                <tbody ref="colTableColTbody">
                <tr v-for="(sortObj,index) in sortColumnArr" :id="sortObj.value">
                    <td>
                        <el-checkbox :key="sortObj.value" v-model="sortObj.checked" @change="checkBoxChange(index)" />
                    </td>
                    <td align="left">{{ sortObj.title }}</td>
                    <td>
                        <el-radio v-model="sortObj.sortType" label="ASC">升序</el-radio>
                        <el-radio v-model="sortObj.sortType" label="DESC">降序</el-radio>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    export default {
        name: "screenQuerySort",
        data() {
            return {
                selectAll: false,//是否全选
                sortColumnArr: [],//已设置排序字段集合
                allColumnArr:[],//所有可排序字段集合
                columnData: [],//所有可排序字段信息
                sort_transfer: null,//排序穿梭框对象
            }
        },
        props:['columnInfoArr','setting'],
        mounted() {
            this.initSetting()
        },
        methods: {
            initSetting(){
                let $this = this
                layui.use('transfer', function() {
                    const transfer = layui.transfer
                    Array.from($this.columnInfoArr, item => {
                        $this.allColumnArr.push(item.newColumnName);
                        $this.columnData.push({ 'value': item.newColumnName, 'title': item.newColumnName })
                    })
                    // 显示搜索框
                    const height = 500
                    $this.sort_transfer = transfer.render({
                        elem: '#toSortListScreen',
                        data: $this.columnData,
                        title: ['待选择排序字段', ''],
                        showSearch: true,
                        id: 'toSortListScreenKey',
                        height: height,
                        width: 300,
                        onchange: function(data, index) {
                            if (index) {
                                $this.ceil_tr(data)
                            } else {
                                $this.add_tr(data)
                            }
                        }
                    })
                    //初始化已排序设置
                    if($this.setting.length > 0){
                        let reload_value = []
                        Array.from($this.setting, item => {
                            reload_value.push(item.column)
                            const value = item.column
                            const title = item.column
                            const checked = false
                            const sortType = item.sortType
                            $this.sortColumnArr.push({ value, title, checked, sortType })
                        })
                        transfer.reload('toSortListScreenKey', {
                            title: ['待选择排序字段', ''],
                            value: reload_value,
                            showSearch: true
                        })
                    }
                    $($this.$refs.toSortListScreen).find(".layui-transfer-box[data-index='1']").hide()
                    $('ul.layui-transfer-data').css('height', height - 93)
                })
                $(this.$refs.colTableColTbody).sortable().disableSelection()
            },
            add_tr(data) {
                const $this = this
                $(data).each(function(index) {
                    const value = this.value
                    const title = this.title
                    const checked = false
                    const sortType = 'ASC'
                    $this.sortColumnArr.push({ value, title, checked, sortType })
                })
            },
            ceil_tr(data) {
                const value = []
                const newSortColumnArr = []
                $(data).each(function(index) {
                    this.checked = false
                    value.push(this.value)
                })
                for (let i = 0; i < this.sortColumnArr.length; i++) {
                    if (!value.includes(this.sortColumnArr[i].value)) {
                        newSortColumnArr.push(this.sortColumnArr[i])
                    }
                }
                this.sortColumnArr = newSortColumnArr
                if (this.selectAll) {
                    this.selectAll = false
                }
                this.reloadTransfer()
            },
            handleCheckAllChange(checked) {
                Array.from(this.sortColumnArr, (n) => n.checked = checked)
                const column = this.sort_transfer.getData()
                const value = []
                $(column).each(function(index) {
                    this.checked = checked
                    value.push(this.value)
                })
                this.reloadTransfer(value)
            },
            checkBoxChange(index) {
                const data = this.sort_transfer.getData()
                const value = []
                let count = 0
                for (var i = 0; i < data.length; i++) {
                    if (this.sortColumnArr[index].value === data[i].value) { // 判断字段选中的值为对勾值
                        data[i].checked = this.sortColumnArr[index].checked
                    }
                    if (data[i].checked) {
                        count++
                    }
                    value.push(data[i].value)
                }
                if (data.length === count) {
                    this.selectAll = true
                }
                this.reloadTransfer(value)
            },
            saveSetting() {
                let whereObj = {
                    "whereStr" : "",
                    "hasWhere" : true,
                    "columnArr" : this.allColumnArr,
                    "setting":[]
                };
                Array.from(this.sortColumnArr, item => {
                    if(whereObj.whereStr === ""){
                        whereObj.whereStr = item.value + " " + item.sortType;
                    }else{
                        whereObj.whereStr += "," + item.value + " " + item.sortType;
                    }
                    whereObj.setting.push({ 'column': item.value, 'sortType': item.sortType });
                })
                if(whereObj.whereStr !== ""){
                    whereObj.whereStr = " ORDER BY " + whereObj.whereStr;
                }
                return whereObj;
            },
            verifySetting() {
                if (this.sortColumnArr.length === 0) {
                    this.$message({ type: 'warning', message: '未选择排序字段' })
                    return false
                }
                return true
            },
            reloadTransfer(value) {
                if (typeof value !== 'undefined') {
                    this.sort_transfer.reload({
                        value: value
                    })
                } else {
                    this.sort_transfer.reload({})
                }
                $(this.$refs.toSortListScreen).find(".layui-transfer-box[data-index='1']").hide()
            }
        }
    }
</script>
<style scoped type="text/css">
    .table_auto {
        margin:0 auto;
        float: left;
        width: 100%;
        text-align: center;
    }
    .table_auto>thead>tr,.table_auto>tbody>tr{
        height:38px;
        line-height: 38px;
        border-bottom: solid 1px #e6e6e6;
    }
    .table_auto>thead>tr>td>div,.table_auto>tbody>tr>td>div{
        width:17px;
        height:17px;
        border:1px solid #E6E6E6;
    }
    .table_auto>tbody>tr>td{
        cursor:pointer;
    }
    .table_auto>thead>tr>td{
        background-color: #5886B2;
        color:#fff;
        border:1px solid #ddd;
    }
</style>
