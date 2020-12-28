// 可用于汇总的字段类型
const typeArr = ['INTEGER', 'DECIMAL', 'NUMBER', 'FLOAT', 'REAL', 'DATE', 'TIMESTAMP']
let groupCountVue = null// 分组汇总vue对象
let nodeData = null
/**
 * 获取vue实例
 * @param _this vue实例
 */
export const sendVueObj = (_this) => {
    groupCountVue = _this
    nodeData = _this.nodeData
}

// 初始化分组汇总界面
export function init() {
    layui.use('transfer', function() {
        let transfer = layui.transfer
        // 定义穿梭框的变量
        if (nodeData.isSet) { // 如果配置过，则反显加载配置信息
            let groupData = nodeData.setting.groupData
            groupCountVue.columnsInfo = nodeData.columnsInfo
            // 初始化分组穿梭框和分组字段（不是已分组字段，是可分组字段）输出列列表
            initGroupTransfer(groupCountVue.columnsInfo, transfer)
            if (groupData.length > 0) { // 如果之前设置过分组字段
                let groupDataValue = []
                for (let j = 0; j < groupData.length; j++) {
                    groupDataValue.push(groupData[j].value)
                }
                // 加载已分组字段
                groupCountVue.groupTransfer = transfer.reload('groupSet', {
                    title: ['待分组字段', '已选分组字段'],
                    value: groupDataValue,
                    showSearch: true
                })
            }
            // 初始化汇总字段的输出列行数据（只初始化汇总字段的）
            for (let i = 0; i < groupCountVue.columnsInfo.length; i++) {
                if (groupCountVue.columnsInfo[i].isCount) {
                    const sign = groupCountVue.columnsInfo[i].sign
                    const countType = groupCountVue.columnsInfo[i].countType
                    initOutputColumn(groupCountVue.columnsInfo[i], true, sign, countType)
                }
            }
            let countData = nodeData.setting.countData// 获取汇总字段的配置数组
            if (countData.length > 0) { // 如果有汇总字段
                // 更改输出列的复选框未不可修改的状态
                groupCountVue.isAllDisabled = true
                groupCountVue.isDisabled = true
                // 反显汇总字段的配置
                for (let k = 0; k < countData.length; k++) {
                    groupCountVue.countTrNum = k
                    // addCountTr()// 插入一行汇总配置的数据
                    groupCountVue.items.push({ 'id': groupCountVue.countTrNum})

                    groupCountVue.$nextTick(() => {
                        initCountSelectData(groupCountVue.countTrNum)
                        groupCountVue.countTrNum = groupCountVue.countTrNum + 1
                        var chooseColumnXs = xmSelect.get(`#searchName${k}` , true)// 获取当前行中汇总字段名称的单实例
                        var initCountColumnData = JSON.parse(JSON.stringify(groupCountVue.columnData))// 复制全局汇总字段的数组变量的值
                        initCountColumnData.unshift({ 'name': '请选择', 'value': '', 'type': '' })
                        for (let n = 0; n < initCountColumnData.length; n++) { // 设置已汇总字段名称值的选中状态，重新渲染当前行的下拉框
                            if(countData[k].columnName === countData[k].countTypeValue + "(" + initCountColumnData[n].value + ")"){
                                initCountColumnData[n].selected = true;
                                break;
                            }
                        }
                        // 重新渲染汇总字段当前行的下拉框
                        chooseColumnXs.update({
                            'data': initCountColumnData
                            // "autoRow" : true
                        })
                        var chooseTypeXs = xmSelect.get(`#searchType${k}`, true)// 获取当前行中汇总方式的单实例
                        // 汇总方式的初始化默认数据数组
                        var initCountTypeData = [
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
                    })
                }
            } else {
                groupCountVue.countTrNum = 0
                addCountTr()
            }
            // 判断书否全选
            checkAll()
        } else {
            groupCountVue.columnsInfo = groupCountVue.columnsInfoPre // 获取当前节点的前置节点的所有输出列
            initGroupTransfer(groupCountVue.columnsInfo, transfer)
            groupCountVue.countTrNum = 0
            addCountTr()
        }
        $(groupCountVue.$refs.outPutTbody).sortable().disableSelection()
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
            if (nodeData.isSet) { // 如果配置过了，读取其字段名称
                name = columnsInfo[i].columnName
            }
            groupCountVue.columnData.push({ 'name': name, 'value': name, 'title': name, 'type': columnsInfo[i].columnType })
        }
    }
    // 加载分组穿梭框
    groupCountVue.groupTransfer = transfer.render({
        elem: '#group',
        data: groupCountVue.columnData,
        height: 340,
        width: 340,
        title: ['待分组字段', '已选分组字段'],
        showSearch: true,
        id: 'groupSet',
        onchange: function(data, index) {
            if(groupCountVue.isAllDisabled){// 如果复选框为禁用状态，当增加或移除分组字段时，实时变更输出列信息
                groupCountVue.isDisabled = false//目的是先解禁，否则checked状态无法动态改变
                for (let i = 0; i < data.length; i++) {
                    let columnItem = groupCountVue.columnItems.find( item => item.columnName === data[i].value)
                    if(typeof columnItem !== "undefined"){
                        if (index === 0) { // 增加，选中该分组字段的输出列
                            columnItem.checked = true
                        } else { // 移除，取消选中该分组字段的输出列
                            columnItem.checked = false
                        }
                    }
                }
                // 检查是否全部选择
                checkAll()
                groupCountVue.isDisabled = true
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
    let columnItem = {
        "nodeId":columnInfo.nodeId,//所属节点ID
        "columnInfo":columnInfo,//所有输出字段信息
        "columnName":nodeData.isSet ? columnInfo.columnName : columnInfo.newColumnName,// 字段名称
        "newColumnName":columnInfo.newColumnName,// 输出字段名称
        "rtn":columnInfo.rtn
    }
    if (isCountTr) { // 如果是汇总配置列的行，则附加唯一标识
        columnItem.sign = sign
        if(countType){
            columnItem.dataCountType = countType
            columnItem.newColumnName = (columnInfo.oldColumnName || columnInfo.columnName) + "_" + countType.name;
        }

    }
    if(countType){
        if(typeof columnInfo.oldColumnName !== "undefined"){
            columnItem.columnName = countType.value + "(" + columnInfo.oldColumnName + ")";
        }else{
            columnItem.columnName = countType.value + "(" + columnInfo.columnName + ")";
        }
    }
    groupCountVue.columnItems.push(columnItem)
}

/**
 * 初始化汇总设置的下拉框数据
 * @trNum 当前行号
 */
function initCountSelectData(trNum) {
    // 复制数组，添加请选择
    let dataArr = groupCountVue.columnData.slice()
    dataArr.unshift({ 'name': '请选择', 'value': '', 'type': '', 'selected': true })
    // 汇总方式的初始化默认数据数组
    let countTypeDefaultData = [
        { 'name': '请选择', 'value': '', 'selected': true },
        { 'name': '计数', 'value': 'count' },
        { 'name': '求和', 'value': 'sum' },
        { 'name': '最大值', 'value': 'max' },
        { 'name': '最小值', 'value': 'min' },
        { 'name': '平均值', 'value': 'ave' }
    ]
    // 不可汇总字段的数据数组
    let disableCountData = [
        { 'name': '请选择', 'value': '', 'selected': true },
        { 'name': '计数', 'value': 'count' },
        { 'name': '求和', 'value': 'sum', 'disabled': true },
        { 'name': '最大值', 'value': 'max', 'disabled': true },
        { 'name': '最小值', 'value': 'min', 'disabled': true },
        { 'name': '平均值', 'value': 'ave', 'disabled': true }
    ]
    let chooseColumnXs = xmSelect.render({
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
                    if(sign !== '_'){ // 如果两个下拉框选中的都不是“请选择”
                        let columnItemInd = groupCountVue.columnItems.findIndex( item => item.sign === sign)
                        if(columnItemInd > -1){//输出列的行已存在
                            groupCountVue.columnItems.splice(columnItemInd,1)// 删除该数据行
                            refreshOutputColumn()
                        }
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
                    if(sign !== '_'){ // 如果两个下拉框选中的都不是“请选择”
                        let columnItemInd = groupCountVue.columnItems.findIndex( item => item.sign === sign)
                        if(columnItemInd > -1){//输出列的行已存在
                            groupCountVue.columnItems.splice(columnItemInd,1)// 删除该数据行
                            refreshOutputColumn()
                        }
                    }
                }
            }
        },
        data: dataArr
    })
    let chooseTypeXs = xmSelect.render({
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
                        let columnItemInd = groupCountVue.columnItems.findIndex( item => item.sign === sign)
                        if(columnItemInd > -1){//输出列的行已存在
                            groupCountVue.columnItems.splice(columnItemInd,1)// 删除该数据行
                            refreshOutputColumn()
                        }
                        if (value !== '') { // 如果选中的不是“请选择”
                            sign = columnValue[0].value + '_' + value// 拼接新的标识
                            let columnItemInd = groupCountVue.columnItems.findIndex( item => item.sign === sign)
                            if(columnItemInd > -1){//若该汇总配置已在输出列列表中存在，则给重复设置的提示
                                groupCountVue.$message({"type":"warning","message":`字段【${columnValue[0].value}】已存在【${countType.name}】设置`})
                                chooseColumnXs.update({
                                    data: dataArr
                                    // autoRow: true,
                                })
                            } else { // 若不存在，则添加输出列的行
                                // 在所有输出列中匹配当前选中的汇总列
                                for (let i = 0; i < groupCountVue.columnsInfo.length; i++) {
                                    if (groupCountVue.columnsInfo[i].columnName === columnValue[0].value) {
                                        // 追加一行输出列配置
                                        initOutputColumn(groupCountVue.columnsInfo[i], true, sign, countType)
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
                        let columnItemInd = groupCountVue.columnItems.findIndex( item => item.sign === sign)
                        if(columnItemInd > -1){//若该汇总配置已在输出列列表中存在，则给重复设置的提示
                            groupCountVue.$message({"type":"warning","message":`字段【${columnValue[0].value}】已存在【${countType.name}】设置`})
                            chooseColumnXs.update({
                                data: dataArr
                                // autoRow: true,
                            })
                        } else { // 若不存在，则添加输出列的行
                            // 在所有输出列中匹配当前选中的汇总列
                            for (let i = 0; i < groupCountVue.columnsInfo.length; i++) {
                                if (groupCountVue.columnsInfo[i].columnName === columnValue[0].value) {
                                    // 追加一行输出列配置
                                    initOutputColumn(groupCountVue.columnsInfo[i], true, sign, countType)
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
                    let columnItemInd = groupCountVue.columnItems.findIndex( item => item.sign === sign)
                    if(columnItemInd > -1){//若该汇总配置已在输出列列表中存在，则给重复设置的提示
                        groupCountVue.columnItems.splice(columnItemInd,1)// 删除该数据行
                        refreshOutputColumn()
                    }
                }
            }
        }
    })
}

/**
 * 刷新输出输出列信息
 */
function refreshOutputColumn() {
    let countNum = 0// 记录设置汇总字段的数量
    let groupNum = 0// 记录设置分组字段的数量
    for(let i=0; i<groupCountVue.columnItems.length; i++){
        groupCountVue.columnItems[i].checked = false// 先移除每个复选框的选中状态
        if(typeof groupCountVue.columnItems[i].sign !== "undefined"){// 如果是汇总字段，则设置其为输出列（选中）
            groupCountVue.columnItems[i].checked = true
            countNum++
        }
    }
    if (countNum > 0) { // 如果设置了汇总字段，则需设置输出列的复选框为disabled
        groupCountVue.isAllDisabled = true
        groupCountVue.isDisabled = true
        // 循环遍历分组字段，自动勾选已分组字段为输出字段
        const groupData = groupCountVue.groupTransfer.getData()
        groupNum = groupData.length
        for (let j = 0; j < groupData.length; j++) {
            // 遍历所有输出列的行
            let columnItem = groupCountVue.columnItems.find( item => item.columnName === groupData[j].value)
            if(typeof columnItem !== "undefined"){
                columnItem.checked = true
            }
        }
    } else {
        groupCountVue.isAllDisabled = false
        groupCountVue.isDisabled = false
    }
    const allNum = groupCountVue.columnItems.length// 记录已选中的输出列数量
    if ((groupNum + countNum) === allNum) {
        groupCountVue.checkAll = true
    } else {
        if(groupCountVue.checkAll){
            groupCountVue.checkAll = false
        }
    }
}

/**
 * 添加汇总表格的行
 */
export function addCountTr() {
    groupCountVue.items.push({ 'id': groupCountVue.countTrNum})
    groupCountVue.$nextTick(() => {
        initCountSelectData(groupCountVue.countTrNum)
        groupCountVue.countTrNum = groupCountVue.countTrNum + 1
    })
}

/**
 * 删除汇总表格的汗
 * @param index 删除行的当前下标
 */
export function delCountTr(index) {
    let item = groupCountVue.items[index]
    // 删除对应输出列表格的行，start
    const chooseColumnXs = xmSelect.get(`#searchName${item.id}`, true)// 获取当前行中汇总字段名称的单实例
    const chooseTypeXs = xmSelect.get(`#searchType${item.id}`, true)// 获取当前行中汇总方式的单实例
    const columnValue = chooseColumnXs.getValue()// 获取选中的汇总字段名称
    const typeValue = chooseTypeXs.getValue()// 获取选中的汇总方式
    if (columnValue.length > 0 && typeValue.length > 0) { // 如果都有选中的值
        const sign = columnValue[0].value + '_' + typeValue[0].value// 拼接字段的唯一标识
        let columnItemInd = groupCountVue.columnItems.findIndex( item => item.sign === sign)
        if(columnItemInd > -1){//若该汇总配置已在输出列列表中存在，则给重复设置的提示
            groupCountVue.columnItems.splice(columnItemInd,1)// 删除该数据行
            refreshOutputColumn()
        }
    }
    // 删除对应输出列表格的行，end
    groupCountVue.items.splice(index, 1)
}

/**
 * 检查是否全选
 */
function checkAll() {
    let checkNum = 0
    for(let i=0; i<groupCountVue.columnItems.length; i++){
        if(groupCountVue.columnItems[i].checked){
            checkNum++
        }
    }
    if(checkNum === groupCountVue.columnItems.length){
        groupCountVue.checkAll = true
    }else{
        groupCountVue.checkAll = false
    }
}

// 分组汇总的配置验证
export function inputVerify() {
    // 获取已分组字段数组
    const groupData = groupCountVue.groupTransfer.getData()
    // 获取已汇总字段数量
    let countNum = 0
    let a = xmSelect.get()
    let b = xmSelect.get(/searchName.*/);
    for(let i=0; i<groupCountVue.items.length; i++){
        let chooseColumnXs = xmSelect.get(`#searchName${groupCountVue.items[i].id}`, true)// 获取当前行中汇总字段名称的单实例
        let chooseTypeXs = xmSelect.get(`#searchType${groupCountVue.items[i].id}`, true)// 获取当前行中汇总方式的单实例
        let columnValue = chooseColumnXs.getValue()// 获取选中的汇总字段名称
        let typeValue = chooseTypeXs.getValue()// 获取选中的汇总方式
        if (columnValue.length > 0 && typeValue.length > 0) { // 如果都有选中的值
            if (columnValue[0].value !== '' && typeValue[0].value !== '') { // 如果选中的值都不为“请选择”
                countNum++
            }
        }
    }
    if (groupData.length === 0 && countNum === 0) {
        groupCountVue.$message.error('未设置分组或汇总的字段')
        return false
    } else {
        return true
    }
}

// 保存节点的配置信息
export function saveNodeInfo() {
    let curColumnsInfo = []// 当前的输出列信息集合
    let countData = []// 汇总字段配置信息
    let newColumnNameArr = []
    let isExsist = false// 是否有相同的输出字段名称
    let checkedNum = 0// 选中输出列的数量
    let exsistMessage = ''
    for(let i=0; i<groupCountVue.columnItems.length; i++){
        let columnInfo = {...{}, ...groupCountVue.columnItems[i].columnInfo}
        const newColumnName = groupCountVue.columnItems[i].newColumnName
        if(groupCountVue.columnItems[i].checked){
            columnInfo.isOutputColumn = 1
            columnInfo.checked = true
            columnInfo.newColumnName = newColumnName
            checkedNum++
        }else{
            columnInfo.checked = false
            columnInfo.isOutputColumn = 0
        }
        columnInfo.oldColumnName = columnInfo.oldColumnName || columnInfo.columnName;//将原字段存储一份
        columnInfo.columnName = groupCountVue.columnItems[i].columnName
        //校验输出列是否重复
        if(groupCountVue.columnItems[i].checked){
            const curIndex = newColumnNameArr.findIndex(item => item === newColumnName)
            if (curIndex > -1) {
                isExsist = true
                exsistMessage = `第${curIndex + 1}行与第${i + 1}行的输出字段重复！请修改`
                break;
            }
            newColumnNameArr.push(newColumnName)
        }
        if (typeof groupCountVue.columnItems[i].sign !== "undefined") { // 汇总字段的输出列数据行
            // 组织汇总列的字段配置信息
            columnInfo.isCount = true
            columnInfo.sign = groupCountVue.columnItems[i].sign
            columnInfo.countType = groupCountVue.columnItems[i].dataCountType
            countData.push({
                "columnName":columnInfo.columnName,
                "columnType":columnInfo.columnType,
                "countTypeValue":groupCountVue.columnItems[i].dataCountType.value,
                "newColumnName":newColumnName
            })
        } else { // 分组字段的输出列数据行
            columnInfo.isCount = false
        }
        curColumnsInfo.push(columnInfo)
    }
    if (checkedNum === 0) {
        groupCountVue.$message({"type":"warning","message":"请选择输出字段"})
        return false
    }
    if (isExsist) {
        groupCountVue.$message({"type":"warning","message":exsistMessage})
        return false
    }
    nodeData.setting.countData = countData
    nodeData.setting.groupData = groupCountVue.groupTransfer.getData()// 获取已分组字段数组
    nodeData.columnsInfo = curColumnsInfo
    nodeData.isSet = true
    groupCountVue.$refs.basicVueRef.save_base()// 保存基础信息


    // $('.colTr').each(function() {
    //     const columnInfo = JSON.parse($(this).attr('columnInfo'))
    //     const newColumnName = $(this).find('.newColumn').val()
    //     if ($(this).find('div.ckbox').hasClass('checked')) {
    //         columnInfo.isOutputColumn = 1
    //         columnInfo.checked = true
    //         columnInfo.newColumnName = newColumnName
    //         checkedNum++
    //     } else {
    //         columnInfo.checked = false
    //         columnInfo.isOutputColumn = 0
    //     }
    //     columnInfo.oldColumnName = columnInfo.oldColumnName || columnInfo.columnName;//将原字段存储一份
    //     columnInfo.columnName = $(this).find('td:eq(1)').html()
    //     if ($.inArray(newColumnName, newColumnNameArr) < 0) { // 如果输出列名称数组中不含有当前输出列的名称
    //         newColumnNameArr.push(newColumnName)
    //     } else { // 如果有（重复），则将已重复的输出列标注出来（加红线框）
    //         const index = $.inArray(newColumnName, newColumnNameArr)
    //         if ($(this).find('div.ckbox').hasClass('checked') && $('.colTr:eq(' + index + ')').find('div.ckbox').hasClass('checked')) {
    //             isExsist = true
    //             $('.colTr:eq(' + index + ')').find('div.ckbox').addClass('has-error')
    //             $(this).find('div.ckbox').addClass('has-error')
    //             return false
    //         }
    //     }
    //     if ($(this).attr('id')) { // 汇总字段的输出列数据行
    //         // 组织汇总列的字段配置信息
    //         const countObj = {}
    //         columnInfo.isCount = true
    //         columnInfo.sign = $(this).attr('data-sign')
    //         columnInfo.countType = JSON.parse($(this).attr('data-countType'))
    //         countObj.columnName = columnInfo.columnName
    //         countObj.columnType = columnInfo.columnType
    //         countObj.countTypeValue = columnInfo.countType.value
    //         countObj.newColumnName = newColumnName
    //         countData.push(countObj)
    //     } else { // 分组字段的输出列数据行
    //         columnInfo.isCount = false
    //     }
    //     curColumnsInfo.push(columnInfo)
    // })
    // if (checkedNum === 0) {
    //     alertMsg('提示', '请选择输出字段', 'warning')
    //     return false
    // }
    // if (isExsist) {
    //     alertMsg('提示', '输出字段名称有重复，请修改', 'warning')
    //     return false
    // }
    // nodeData.setting.countData = countData
    // nodeData.setting.groupData = groupTransfer.getData()// 获取已分组字段数组
    // nodeData.columnsInfo = curColumnsInfo
    // basicObj.save_base()// 保存基础信息
    // nodeData.isSet = true
    return true
}
