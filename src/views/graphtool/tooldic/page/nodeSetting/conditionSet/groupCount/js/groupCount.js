// 可用于汇总的字段类型
const typeArr = ['INTEGER', 'DECIMAL', 'NUMBER', 'FLOAT', 'REAL', 'DATE', 'TIMESTAMP']
// 穿梭框中加载的字段数据数组集合
const columnData = []
// 分组的穿梭框对象
let groupTransfer
// 所有输出列信息
let columnsInfo = []
// 判断当前节点是否配置过
let isSet = false
let groupCountVue = null// 分组汇总vue对象
let nodeData = null
let columnsInfoPre = []
/**
 * 获取vue实例
 * @param _this vue实例
 */
export const sendVueObj = (_this) => {
    groupCountVue = _this
    nodeData = _this.nodeData
    columnsInfoPre = _this.columnsInfoPre
}

// 初始化分组汇总界面
export function init() {
    layui.use(['transfer', 'layer'], function() {
        const transfer = layui.transfer
        // 定义穿梭框的变量
        isSet = nodeData.isSet
        if (isSet) { // 如果配置过，则反显加载配置信息
            const groupData = nodeData.setting.groupData
            columnsInfo = nodeData.columnsInfo
            // 初始化分组穿梭框和分组字段（不是已分组字段，是可分组字段）输出列列表
            initGroupTransfer(columnsInfo, transfer)
            if (groupData.length > 0) { // 如果之前设置过分组字段
                const groupDataValue = []
                for (let j = 0; j < groupData.length; j++) {
                    groupDataValue.push(groupData[j].value)
                }
                // 加载已分组字段
                groupTransfer = transfer.reload('groupSet', {
                    title: ['待分组字段', '已选分组字段'],
                    value: groupDataValue,
                    showSearch: true
                })
            }
            // 初始化汇总字段的输出列行数据（只初始化汇总字段的）
            for (let i = 0; i < columnsInfo.length; i++) {
                if (columnsInfo[i].isCount) {
                    const sign = columnsInfo[i].sign
                    const countType = columnsInfo[i].countType
                    initOutputColumn(columnsInfo[i], true, sign, countType)
                }
            }
            const countData = nodeData.setting.countData// 获取汇总字段的配置数组
            if (countData.length > 0) { // 如果有汇总字段
                // 更改输出列的复选框未不可修改的状态
                $('#sel_all').icheck('disabled')
                $('.colTr div.ckbox').addClass('disabled')
                // 反显汇总字段的配置
                for (let k = 0; k < countData.length; k++) {
                    if (k === 0) { // 第一个汇总字段不用js生成
                        initCountSelectData(1)
                    } else {
                        addCountTr(k)// 插入一行汇总配置的数据
                    }
                    const chooseColumnXs = xmSelect.get('#searchName' + parseInt(k + 1), true)// 获取当前行中汇总字段名称的单实例
                    const initCountColumnData = JSON.parse(JSON.stringify(columnData))// 复制全局汇总字段的数组变量的值
                    initCountColumnData.unshift({ 'name': '请选择', 'value': '', 'type': '' })
                    for (let n = 0; n < initCountColumnData.length; n++) { // 设置已汇总字段名称值的选中状态，重新渲染当前行的下拉框
                        if (countData[k].columnName === initCountColumnData[n].value) {
                            initCountColumnData[n].selected = true
                            break
                        }
                    }
                    // 重新渲染汇总字段当前行的下拉框
                    chooseColumnXs.update({
                        'data': initCountColumnData
                        // "autoRow" : true
                    })
                    const chooseTypeXs = xmSelect.get('#searchType' + parseInt(k + 1), true)// 获取当前行中汇总方式的单实例
                    // 汇总方式的初始化默认数据数组
                    const initCountTypeData = [
                        { 'name': '请选择', 'value': '' },
                        { 'name': '计数', 'value': 'count' },
                        { 'name': '求和', 'value': 'sum' },
                        { 'name': '最大值', 'value': 'max' },
                        { 'name': '最小值', 'value': 'min' },
                        { 'name': '平均值', 'value': 'ave' }
                    ]
                    for (let n = 0; n < initCountTypeData.length; n++) {
                        if ($.inArray(countData[k].columnType, typeArr) < 0) { // 设置不可汇总字段的数据数组（不能写到这个for循环外面）
                            switch (initCountTypeData[n].value) {
                                case 'sum':
                                case 'max':
                                case 'min':
                                case 'ave':
                                    initCountTypeData[n].disabled = true
                                    break
                            }
                        }
                        if (countData[k].countTypeValue === initCountTypeData[n].value) { // 设置已汇总类型的选中状态
                            initCountTypeData[n].selected = true
                        }
                    }
                    // 重新渲染汇总方式当前行的下拉框
                    chooseTypeXs.update({
                        'data': initCountTypeData
                        // "autoRow" : true
                    })
                }
            } else {
                initCountSelectData(1)
            }
            // 判断书否全选
            checkAll()
        } else {
            const parentIds = nodeData.parentIds // 获取当前节点的前置节点ID数组集合
            columnsInfo = columnsInfoPre // 获取当前节点的前置节点的所有输出列
            initGroupTransfer(columnsInfo, transfer)
            // 初始化汇总设置的下拉框数据
            initCountSelectData(1)
        }
    })
}

/**
 * 初始化分组穿梭框
 * @param columnsInfo 输出列信息的数组
 */
function initGroupTransfer(columnsInfo, transfer) {
    // 循环输出列信息，组织穿梭框所使用的字段数据数组集合
    for (let i = 0; i < columnsInfo.length; i++) {
        // columnsInfo[i].isCount：第一种是undefined（这种情况是第一次配置该节点）
        // 第二种是false（这种情况是该节点已经配置过一次，为false的字段信息是可用于分组的字段，同时也是前置节点的所有输出字段）
        if (!columnsInfo[i].isCount) {
            // 初始化输出列信息
            initOutputColumn(columnsInfo[i], false, null, null)
            /**
             * @type {{name: *, value: *, title: *, type: string}}
             * @description name与value属性是为了满足xmSelect插件的数据格式
             * @description value与title属性是为了满足transfer插件的数据格式
             * @description type是处理数据时需要用到的额外属性
             */
            let name = columnsInfo[i].newColumnName// 读取其输出列名称
            if (isSet) { // 如果配置过了，读取其字段名称
                name = columnsInfo[i].columnName
            }
            const obj = { 'name': name, 'value': name, 'title': name, 'type': columnsInfo[i].columnType }
            columnData.push(obj)
        }
    }
    // 加载分组穿梭框
    groupTransfer = transfer.render({
        elem: '#group',
        data: columnData,
        height: 340,
        width: 340,
        title: ['待分组字段', '已选分组字段'],
        showSearch: true,
        id: 'groupSet',
        onchange: function(data, index) {
            if ($('#sel_all').prop('disabled')) { // 如果复选框为禁用状态，当增加或移除分组字段时，实时变更输出列信息
                for (let i = 0; i < data.length; i++) {
                    $('.colTr').each(function() {
                        if ($(this).find('td:eq(1)').html() == data[i].value) { // 匹配当前分组字段的输出列的行
                            if (index === 0) { // 增加，选中该分组字段的输出列
                                $(this).find('div.ckbox').addClass('checked')
                            } else { // 移除，取消选中该分组字段的输出列
                                $(this).find('div.ckbox').removeClass('checked')
                            }
                            return false
                        }
                    })
                }
                // 检查是否全部选择
                checkAll()
            }
        }
    })
}

/**
 *初始化输出列信息
 * @param columnInfo 字段信息
 * @param isCountTr 是否是汇总字段的行
 * @param sign 唯一标识
 * @param countType 汇总方式对象{"name":*,"value":*}
 */
function initOutputColumn(columnInfo, isCountTr, sign, countType) {
    let html = ''
    const columnName = isSet ? columnInfo.columnName : columnInfo.newColumnName// 字段名称
    let outputColumnName = columnInfo.newColumnName// 输出字段名称
    if (isCountTr) { // 如果汇总配置列的行，则附加唯一标识
        html = "<tr class='colTr' nodeId='" + columnInfo.nodeId + "' columnInfo='" + JSON.stringify(columnInfo) + "' id='count" + sign + "' data-sign='" + sign + "' data-countType='" + JSON.stringify(countType) + "'>"
        if (!outputColumnName.endWith('_' + countType.name)) { // 判断结尾是否加过提示串，加过就不需要加第二次了
            outputColumnName = columnName + '_' + countType.name
        }
    } else {
        html = "<tr class='colTr' nodeId='" + columnInfo.nodeId + "' columnInfo='" + JSON.stringify(columnInfo) + "'>"
    }
    html += '<td>' + columnInfo.rtn + '</td>'
    // 设置过就读取本节点的字段名称，否则就读取上级节点的输出字段名称
    html += '<td>' + columnName + '</td>'
    html += "<td><input type='text' class='newColumn form-control' value='" + outputColumnName + "'/></td>"
    html += "<td align='center'>"
    if (columnInfo.checked) { // 初始化时字段信息的对象中没有“checked”属性，走else，反显时“checked”属性值为true/false
        html += "<div onclick='groupCount.clickCk(this)' class='ckbox icheckbox_square-purple icheck-item icheck[wl980] checked'>"
    } else {
        html += "<div onclick='groupCount.clickCk(this)' class='ckbox icheckbox_square-purple icheck-item icheck[wl980]'>"
    }
    html += "<input type='checkbox' class='form-control icheck-input icheck[ouzsq]'/></div></td></tr>"
    $('#column_config>tbody').append(html).sortable().disableSelection()
}

/**
 * 初始化汇总设置的下拉框数据
 * @trNum 当前行号
 */
function initCountSelectData(trNum) {
    // 复制数组，添加请选择
    const dataArr = columnData.slice()
    dataArr.unshift({ 'name': '请选择', 'value': '', 'type': '', 'selected': true })
    // 汇总方式的初始化默认数据数组
    const countTypeDefaultData = [
        { 'name': '请选择', 'value': '', 'selected': true },
        { 'name': '计数', 'value': 'count' },
        { 'name': '求和', 'value': 'sum' },
        { 'name': '最大值', 'value': 'max' },
        { 'name': '最小值', 'value': 'min' },
        { 'name': '平均值', 'value': 'ave' }
    ]
    // 不可汇总字段的数据数组
    const disableCountData = [
        { 'name': '请选择', 'value': '', 'selected': true },
        { 'name': '计数', 'value': 'count' },
        { 'name': '求和', 'value': 'sum', 'disabled': true },
        { 'name': '最大值', 'value': 'max', 'disabled': true },
        { 'name': '最小值', 'value': 'min', 'disabled': true },
        { 'name': '平均值', 'value': 'ave', 'disabled': true }
    ]
    console.log($('#searchName' + trNum)[0])
    const chooseColumnXs = xmSelect.render({
        el: '#searchName' + trNum,
        radio: true,
        clickClose: true,
        filterable: true,
        filterMethod: function(val, item, index, prop) {
            if (val === item.value) { // 把value相同的搜索出来
                return true
            }
            if (item.name && item.name.indexOf(val) > -1) { // 名称中包含的搜索出来
                return true
            }
            return false// 不知道的就不管了
        },
        on: function(data) {
            // 此次选择变化的数据（数组），因radio=true,所以直接取第一个对象
            const change = data.change[0]
            // 此次操作是选中还是取消选中
            const isAdd = data.isAdd
            const value = change.value// 获取当前汇总字段的值
            let sign = ''// 汇总字段的标识
            const typeValue = chooseTypeXs.getValue()// 获取当前汇总方式的值
            if (isAdd) { // 如果是选中，需删除旧标识创建的输出列的行数据
                const oldColumnValue = chooseColumnXs.getValue()// 获取改变汇总字段之前的值
                if (oldColumnValue.length > 0 && typeValue.length > 0) {
                    sign = oldColumnValue[0].value + '_' + typeValue[0].value// 拼接需删除的标识
                    if (sign !== '_' && $('#count' + sign)[0]) { // 如果两个下拉框选中的都不是“请选择”并且输出列的行已存在
                        $('#count' + sign).remove()// 删除该数据行
                        refreshOutputColumn()
                    }
                }
                if (value === '') { // 选中“请选择”
                    chooseTypeXs.update({
                        data: countTypeDefaultData
                        // autoRow: true,
                    })
                } else { // 选中其他字段
                    const columnType = change.type // 当前所选中字段的数据类型
                    if ($.inArray(columnType.toUpperCase(), typeArr) < 0) { // 数值或日期类型
                        chooseTypeXs.update({
                            data: disableCountData
                            // autoRow: true,
                        })
                    } else {
                        chooseTypeXs.update({
                            data: countTypeDefaultData
                            // autoRow: true,
                        })
                    }
                }
            } else { // 如果是取消选中
                if (typeValue.length > 0) {
                    sign = value + '_' + typeValue[0].value
                    if (sign !== '_' && $('#count' + sign)[0]) { // 如果两个下拉框选中的都不是“请选择”并且输出列的行已存在
                        $('#count' + sign).remove()// 删除该数据行
                        refreshOutputColumn()
                    }
                }
            }
        },
        data: dataArr
    })
    const chooseTypeXs = xmSelect.render({
        el: '#searchType' + trNum,
        radio: true,
        clickClose: true,
        filterMethod: function(val, item, index, prop) {
            if (val === item.value) { // 把value相同的搜索出来
                return true
            }
            if (item.name && item.name.indexOf(val) > -1) { // 名称中包含的搜索出来
                return true
            }
            return false// 不知道的就不管了
        },
        data: countTypeDefaultData,
        on: function(data) {
            // 此次选择变化的数据（数组），因radio=true,所以直接取第一个对象
            const change = data.change[0]
            // 此次操作是选中还是取消选中
            const isAdd = data.isAdd
            const value = change.value// 获取改变汇总方式之后的值
            const countType = { 'name': change.name, 'value': value }
            const columnValue = chooseColumnXs.getValue()// 获取当前汇总的列
            let sign = ''// 汇总字段的标识
            if (isAdd) { // 如果是选中，需删除旧标识创建的输出列的行数据
                const oldTypeValue = chooseTypeXs.getValue()// 获取之前汇总方式的值
                if (columnValue.length > 0 && columnValue[0].value !== '') {
                    if (oldTypeValue.length > 0) { // 之前有选中的，直接改变选中值
                        sign = columnValue[0].value + '_' + oldTypeValue[0].value// 拼接需删除的标识
                        if ($('#count' + sign)[0]) { // 先删除数据输出列的数据
                            $('#count' + sign).remove()
                            refreshOutputColumn()
                        }
                        if (value !== '') { // 如果选中的不是“请选择”
                            sign = columnValue[0].value + '_' + value// 拼接新的标识
                            if ($('#count' + sign)[0]) { // 若该汇总配置已在输出列列表中存在，则给重复设置的提示
                                alertMsg('提示', '字段【' + columnValue[0].value + '】已存在【' + countType.name + '】设置', 'info')
                                chooseColumnXs.update({
                                    data: dataArr
                                    // autoRow: true,
                                })
                            } else { // 若不存在，则添加输出列的行
                                // 在所有输出列中匹配当前选中的汇总列
                                for (let i = 0; i < columnsInfo.length; i++) {
                                    if (columnsInfo[i].columnName === columnValue[0].value) {
                                        // 追加一行输出列配置
                                        initOutputColumn(columnsInfo[i], true, sign, countType)
                                        refreshOutputColumn()
                                        break
                                    }
                                }
                            }
                        }
                    } else { // 之前没有选中的值，直接选中
                        if (value === '') { // 如果选择的是“请选择”，则不做任何处理
                            return
                        }
                        sign = columnValue[0].value + '_' + value// 拼接新的标识
                        if ($('#count' + sign)[0]) { // 若该汇总配置已在输出列列表中存在，则给重复设置的提示
                            alertMsg('提示', '字段【' + columnValue[0].value + '】已存在【' + countType.name + '】设置', 'info')
                            chooseColumnXs.update({
                                data: dataArr
                                // autoRow: true,
                            })
                        } else { // 若不存在，则添加输出列的行
                            // 在所有输出列中匹配当前选中的汇总列
                            for (let i = 0; i < columnsInfo.length; i++) {
                                if (columnsInfo[i].columnName === columnValue[0].value) {
                                    // 追加一行输出列配置
                                    initOutputColumn(columnsInfo[i], true, sign, countType)
                                    refreshOutputColumn()
                                    break
                                }
                            }
                        }
                    }
                }
            } else { // 如果是取消选中
                if (columnValue.length > 0 && columnValue[0].value !== '') { // 如果当前汇总字段有选中字段且选择的不是“请选择”
                    sign = columnValue[0].value + '_' + value// 拼接字段的唯一标识
                    if ($('#count' + sign)[0]) {
                        $('#count' + sign).remove()
                        refreshOutputColumn()
                    }
                }
            }
        }
    })
}

/**
 * 输出列行内复选框的选中事件
 * @param obj 当前选中的对象
 */
function clickCk(obj) {
    if ($(obj).hasClass('checked')) {
        $(obj).removeClass('checked')
        if ($('#sel_all').prop('checked')) {
            $('#sel_all').icheck('unchecked')
        }
    } else {
        $(obj).addClass('checked')
        const trNum = $('.ckbox').length; let ckNum = 0
        $('.ckbox').each(function(i, v) {
            if ($(this).hasClass('checked')) {
                ckNum++
            }
        })
        if (trNum === ckNum) {
            $('#sel_all').icheck('checked')
        }
    }
}

/**
 * 刷新输出输出列信息
 */
function refreshOutputColumn() {
    let countNum = 0// 记录设置汇总字段的数量
    let groupNum = 0// 记录设置分组字段的数量
    $('.colTr').each(function(i, v) {
        $(this).find('div.ckbox').removeClass('checked')// 先移除每个复选框的选中状态
        if ($(this).attr('id')) { // 如果是汇总字段，则设置其为输出列（选中）
            countNum++
            $(this).find('div.ckbox').addClass('checked')
        }
    })
    if (countNum > 0) { // 如果设置了汇总字段，则需设置输出列的复选框为disabled
        $('#sel_all').icheck('disabled')
        $('.colTr div.ckbox').addClass('disabled')
        // 循环遍历分组字段，自动勾选已分组字段为输出字段
        const groupData = groupTransfer.getData()
        groupNum = groupData.length
        for (let j = 0; j < groupData.length; j++) {
            // 遍历所有输出列的行
            $('.colTr').each(function(i, v) {
                // 获取当前行的列名称
                const columnName = $(this).find('td:eq(1)').html()
                if (groupData[j].value === columnName) {
                    $(this).find('div.ckbox').addClass('checked')
                }
            })
        }
    } else {
        $('#sel_all').icheck('enabled')
        $('.colTr div.ckbox').removeClass('disabled')
    }
    const allNum = $('.colTr div.ckbox').length// 记录已选中的输出列数量
    if ((groupNum + countNum) === allNum) {
        $('#sel_all').icheck('checked') // 设置全选
    } else {
        if ($('#sel_all').prop('checked')) {
            $('#sel_all').icheck('unchecked') // 去掉全选
        }
    }
}

/**
 * 添加汇总表格的行
 */
export function addCountTr() {
    groupCountVue.items.push({ 'id': groupCountVue.countTrNum + 1 })
    groupCountVue.$nextTick(() => {
        initCountSelectData(groupCountVue.countTrNum + 1)
        groupCountVue.countTrNum = groupCountVue.countTrNum + 1
    })
}

/**
 * 删除汇总表格的汗
 * @param index 删除行的当前下标
 * @param obj 删除图标的dom对象
 */
export function delCountTr(index, obj) {
    const searchNameId = $(obj).parent().parent().find('.searchName:eq(0)').attr('id')
    const searchTypeId = $(obj).parent().parent().find('.searchType:eq(0)').attr('id')
    // 删除对应输出列表格的行，start
    const chooseColumnXs = xmSelect.get('#' + searchNameId, true)// 获取当前行中汇总字段名称的单实例
    const chooseTypeXs = xmSelect.get('#' + searchTypeId, true)// 获取当前行中汇总方式的单实例
    const columnValue = chooseColumnXs.getValue()// 获取选中的汇总字段名称
    const typeValue = chooseTypeXs.getValue()// 获取选中的汇总方式
    console.log(columnValue)
    console.log(typeValue)
    if (columnValue.length > 0 && typeValue.length > 0) { // 如果都有选中的值
        const sign = columnValue[0].value + '_' + typeValue[0].value// 拼接字段的唯一标识
        if ($('#count' + sign)[0]) {
            $('#count' + sign).remove()
            refreshOutputColumn()
        }
    }
    // 删除对应输出列表格的行，end
    groupCountVue.items.splice(index, 1)
    groupCountVue.$nextTick(() => {

    })
}

/**
 * 检查是否全选
 */
function checkAll() {
    let notCheckNum = 0
    $('.colTr').each(function() {
        if (!$(this).find('div.ckbox').hasClass('checked')) {
            notCheckNum++
        }
    })
    if (notCheckNum === 0) { // 全选
        $('#sel_all').icheck('checked')
    } else {
        $('#sel_all').icheck('unchecked')
    }
}

// 分组汇总的配置验证
export function inputVerify() {
    // 获取已分组字段数组
    const groupData = groupTransfer.getData()
    // 获取已汇总字段数量
    let countNum = 0
    $('.countTr').each(function() {
        const trNum = $(this).attr('data-trNum')// 获取行数据中保存的行号（不一定是当前行的行号）
        const chooseColumnXs = xmSelect.get('#searchName' + trNum, true)// 获取当前行中汇总字段名称的单实例
        const chooseTypeXs = xmSelect.get('#searchType' + trNum, true)// 获取当前行中汇总方式的单实例
        const columnValue = chooseColumnXs.getValue()// 获取选中的汇总字段名称
        const typeValue = chooseTypeXs.getValue()// 获取选中的汇总方式
        if (columnValue.length > 0 && typeValue.length > 0) { // 如果都有选中的值
            if (columnValue[0].value !== '' && typeValue[0].value !== '') { // 如果选中的值都不为“请选择”
                countNum++
            }
        }
    })
    if (groupData.length === 0 && countNum === 0) {
        alertMsg('提示', '未设置分组或汇总的字段', 'info')
        return false
    } else {
        return true
    }
}

// 保存节点的配置信息
export function saveNodeInfo() {
    const curColumnsInfo = []// 当前的输出列信息集合
    const countData = []// 汇总字段配置信息
    const newColumnNameArr = []
    let isExsist = false// 是否有相同的输出字段名称
    let checkedNum = 0// 选中输出列的数量
    $('.colTr').each(function() {
        const columnInfo = JSON.parse($(this).attr('columnInfo'))
        const newColumnName = $(this).find('.newColumn').val()
        if ($(this).find('div.ckbox').hasClass('checked')) {
            columnInfo.isOutputColumn = 1
            columnInfo.checked = true
            columnInfo.newColumnName = newColumnName
            checkedNum++
        } else {
            columnInfo.checked = false
            columnInfo.isOutputColumn = 0
        }
        columnInfo.columnName = $(this).find('td:eq(1)').html()
        if ($.inArray(newColumnName, newColumnNameArr) < 0) { // 如果输出列名称数组中不含有当前输出列的名称
            newColumnNameArr.push(newColumnName)
        } else { // 如果有（重复），则将已重复的输出列标注出来（加红线框）
            const index = $.inArray(newColumnName, newColumnNameArr)
            if ($(this).find('div.ckbox').hasClass('checked') && $('.colTr:eq(' + index + ')').find('div.ckbox').hasClass('checked')) {
                isExsist = true
                $('.colTr:eq(' + index + ')').find('div.ckbox').addClass('has-error')
                $(this).find('div.ckbox').addClass('has-error')
                return false
            }
        }
        if ($(this).attr('id')) { // 汇总字段的输出列数据行
            // 组织汇总列的字段配置信息
            const countObj = {}
            columnInfo.isCount = true
            columnInfo.sign = $(this).attr('data-sign')
            columnInfo.countType = JSON.parse($(this).attr('data-countType'))
            countObj.columnName = columnInfo.columnName
            countObj.columnType = columnInfo.columnType
            countObj.countTypeValue = columnInfo.countType.value
            countObj.newColumnName = newColumnName
            countData.push(countObj)
        } else { // 分组字段的输出列数据行
            columnInfo.isCount = false
        }
        curColumnsInfo.push(columnInfo)
    })
    if (checkedNum === 0) {
        alertMsg('提示', '请选择输出字段', 'warning')
        return false
    }
    if (isExsist) {
        alertMsg('提示', '输出字段名称有重复，请修改', 'warning')
        return false
    }
    nodeData.setting.countData = countData
    nodeData.setting.groupData = groupTransfer.getData()// 获取已分组字段数组
    nodeData.columnsInfo = curColumnsInfo
    basicObj.save_base()// 保存基础信息
    nodeData.isSet = true
    return true
}
