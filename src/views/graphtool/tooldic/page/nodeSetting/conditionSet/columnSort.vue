<template>
    <div>
        <div style="width: 100%;height:auto;padding-left: 23%;">
            <p style="height:30px;line-height: 30px;color: red;">注：已排序字段列表中，可通过拖动行改变字段的显示顺序</p>
            <div id="group2" class="demo-transfer twotransfer" style="width: 400px;float: left;margin-top:10px;"></div>
            <div style="float: left;width: 350px; height: 500px;margin-top:10px;background-color: #fff;border:1px solid #E6E6E6;overflow-y: auto">
                <table id="col_table_col" class="table_auto">
                    <thead>
                    <tr>
                        <td width="80px"><input id="all" type="checkbox"/></td>
                        <td width="200px" align="center">已选择排序字段</td>
                        <td width="150px">排序方式</td>
                    </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
        <div id="select_div" style="display: none">
            <select style="display: block;text-align: center;width: 100%">
                <option value="ASC">升序</option>
                <option value="DESC">降序</option>
            </select>
        </div>
    </div>
</template>

<script>
    var columnData = []; var group_transfer; var nodeData
    export default {
        name: 'ColumnSortSet',
        mounted() {
            this.init()
        },
        methods: {
            init() {
                let graph = this.$parent.graph
                nodeData = graph.nodeData[graph.curCell.id]
                let columnsInfoPre = this.$parent.columnsInfoPre
                layui.use('transfer', function() {
                    let transfer = layui.transfer
                    let isSet = nodeData.isSet				// 该节点是否配置
                    let reload_value = []
                    if (isSet) {				// 配置过,字段信息来自本身节点
                        var setting = nodeData.setting			// 该节点的个性化配置信息
                        columnData = setting.leftData
                        var rightData = setting.rightData
                        if (rightData.length > 0) {
                            var html = ''
                            for (var j = 0; j < rightData.length; j++) {
                                reload_value.push(rightData[j].column)
                                var sortType = rightData[j].sortType
                                $('#select_div>select>option').each(function(i, v) {
                                    if ($(this).attr('selected') && $(this).val() != sortType) {
                                        $(this).removeAttr('selected')
                                    } else if ($(this).val() == sortType && !$(this).attr('selected')) {
                                        $(this).attr('selected', 'selected')
                                    }
                                })
                                var selecthtml = $('#select_div').html()
                                html += '<tr id=' + rightData[j].column + '>'
                                html += "<td><div class='icheckbox_square-purple icheck-item icheck[52se4] div_input'><input value='" + rightData[j].column + "' type='checkbox' class='icheck-input icheck[52se4]'/></div></td>"
                                html += "<td align='left'>" + rightData[j].column + '</td>'
                                html += '<td>' + selecthtml + '</td>'
                                // html += "<td><img onclick='moveUp(this)' title='向上移动' src='<c:url value='/page/analysis/graphModel/images/top.png'/>'/><img onclick='moveDown(this)' title='向下移动' src='<c:url  value='/page/analysis/graphModel/images/xiayi.png'/>'/></td>";
                                html += '</tr>'
                            }
                            $('#col_table_col>tbody').append(html).sortable().disableSelection()
                            regiter()// 注册事件
                        }
                    } else {					// 未配置过,字段信息来自父节点
                        var parentIds = nodeData.parentIds
                        var columnsInfo = columnsInfoPre
                        for (var i = 0; i < columnsInfo.length; i++) {
                            var obj = { 'value': columnsInfo[i].newColumnName, 'title': columnsInfo[i].newColumnName }
                            columnData.push(obj)
                        }
                    }

                    /**
                     * table
                     * add_tr
                     * @param data
                     * @param index
                     */
                    function $add_tr(data) {
                        var html = ''
                        var selecthtml = $('#select_div').html()
                        $(data).each(function(index) {
                            html += '<tr id=' + this.value + '>'
                            html += "<td><div class='icheckbox_square-purple icheck-item icheck[52se4] div_input'><input value='" + this.value + "' type='checkbox' class='icheck-input icheck[52se4]'/></div></td>"
                            html += "<td align='left'>" + this.title + '</td>'
                            html += '<td>' + selecthtml + '</td>'
                            // html += "<td><img onclick='moveUp(this)' title='向上移动' src='<c:url value='/page/analysis/graphModel/images/top.png'/>'/><img onclick='moveDown(this)' title='向下移动' src='<c:url  value='/page/analysis/graphModel/images/xiayi.png'/>'/></td>";
                            html += '</tr>'
                        })
                        $('#col_table_col>tbody').append(html).sortable().disableSelection()
                        $('#all').parent().removeClass('checked')
                        regiter()// 注册事件
                    }
                    /**
                     * table
                     * add_tr
                     * @param data
                     * @param index
                     */
                    function $ceil_tr(data) {
                        var value = []
                        $(data).each(function(index) {
                            value.push(this.value)
                            this.checked = false
                        })
                        $('#col_table_col>tbody :checkbox').each(function(index) {
                            if ($.inArray(this.value, value) != -1) {
                                $(this).parent().parent().parent().remove()
                            }
                        })
                        if ($('.div_input').length == 0 && $('#all').parent().hasClass('checked')) {
                            $('#all').parent().removeClass('checked')
                        }
                    }
                    // 显示搜索框
                    var height = 500
                    group_transfer = transfer.render({
                        elem: '#group2',
                        data: columnData,
                        title: ['待选择排序字段', ''],
                        showSearch: true,
                        id: 'group2key',
                        height: height,
                        width: 300,
                        onchange: function(data, index) {
                            if (index) {
                                $ceil_tr(data)
                            } else {
                                $add_tr(data)
                            }
                        }
                    })
                    if (isSet) {
                        transfer.reload('group2key', {
                            title: ['待选择排序字段', ''],
                            value: reload_value,
                            showSearch: true
                        })
                    }
                    $('#group2').find(".layui-transfer-box[data-index='1']").hide()
                    $('ul.layui-transfer-data').css('height', height - 93)
                })
            }
        }
    }

    /**
     * clickMove
     * 上移
     * 移动表格
     * */
    function moveUp(obj) {
        var current = $(obj).parent().parent() // 获取当前<tr>
        var prev = current.prev() // 获取当前<tr>前一个元素
        if (prev.index() >= 0) {
            current.insertBefore(prev) // 插入到当前<tr>前一个元素前
        }
    }
    /**
     * clickMove
     * 下移
     * 移动表格
     * */
    function moveDown(obj) {
        var current = $(obj).parent().parent() // 获取当前<tr>
        var next = current.next() // 获取当前<tr>后面一个元素
        if (next) {
            current.insertAfter(next) // 插入到当前<tr>后面一个元素后面
        }
    }
    /**
     * 全选
     * 自己封装
     */
    $('#all').click(function(obj) {
        if ($('.div_input').length == 0) {
            return false
        }
        var checked = this.checked
        if (this.checked) {
            $('.div_input').addClass('checked')
        } else {
            $('.div_input').removeClass('checked')
        }
        var column = group_transfer.getData()
        var value = []
        $(column).each(function(index) {
            this.checked = checked
            value.push(this.value)
        })

        group_transfer.reload({
            value: value
        })
        $('#group2').find(".layui-transfer-box[data-index='1']").hide()
    })
    /**
     * 注册事件
     * */
    function regiter() {
        $('.div_input').click(function() {
            var $this = $(this)
            allchkSort()// 判断是否全选
            var supersValue = $this.find('input').val()
            var checked = $this.hasClass('checked')
            if (supersValue == undefined || supersValue == '' || supersValue == 'on') {
                $('#group2').find(".layui-transfer-box[data-index='1']").hide()
                return
            }
            var data = group_transfer.getData()
            var value = []; var count = 0
            for (var i = 0; i < data.length; i++) {
                if (supersValue == data[i].value) { // 判断字段选中的值为对勾值
                    checked ? $this.removeClass('checked') : $this.addClass('checked')
                    data[i].checked = !checked
                }
                if (data[i].checked) {
                    count++
                }
                value.push(data[i].value)
            }
            group_transfer.reload({
                value: value
            })
            if (data.length == count) {
                $('#all').parent().addClass('checked')
            }
            $('#group2').find(".layui-transfer-box[data-index='1']").hide()
        })
    }

    /**
     * 选择框
     */
    function allchkSort() {
        var chknum = $('#col_table_col>tbody :checkbox') == undefined ? 0 : $('#col_table_col>tbody :checkbox').length// 选项总个数
        var chk = 0

        $('#col_table_col>tbody :checkbox').each(function() {
            if ($(this).prop('checked')) {
                chk++
            }
        })
        if (chknum === chk) { // 全选
            $('#all').parent().addClass('checked')
        } else { // 不全选
            $('#all').parent().removeClass('checked')
        }
    }

    // 保存排序的个性化配置信息
    function saveSetting() {
        var rightData = []
        $('#col_table_col>tbody>tr').each(function(i, v) {
            var obj = { 'column': $(this).find('td:eq(1)').html(), 'sortType': $(this).find('select').val() }
            rightData.push(obj)
        })
        nodeData.setting.leftData = columnData
        nodeData.setting.rightData = rightData
    }

    // 页面输入项的校验(或空配置校验)
    function inputVerify() {
        var len = $('#col_table_col>tbody>tr').length
        if (len == 0) {
            alertMsg('提示', '未选择排序字段！', 'info')
            return false
        }
        return true
    }
</script>

<style scoped type="text/css">
    .ssdiv{
        margin-top: 20px;
    }
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
    img {
        cursor:pointer;
        width: 24px;
    }
    .table_auto .icheckbox_square-purple.checked{
        background-position: -51px -4px;
    }
</style>
