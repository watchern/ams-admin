import { executeParamSql,getSelectTreeData } from '@/api/graphtool/apiJs/graphList'
/**
 * 组织下拉树数据（只用于参数）
 * @param result 待组织的数据（有效列：C_CODE,C_NAME,P_CODE）
 * @return dataArr 可用于xmSelect插件的格式数据数组
 * @author JL
 */
export function organizeSelectTreeData(result) {
    var dataArr = []
    for (var i = 0; i < result.length; i++) { // 先把每一条数据转换成xmSelect的数据格式{"name":xx,"value":xx,"children":[]}
        var obj = {
            'name': result[i].C_NAME,
            'value': result[i].C_CODE,
            'pValue': result[i].P_CODE, // 临时有用
            'children': [],
            'sort': i
        }
        dataArr.push(obj)
    }
    dataArr = matchingPcRelation(dataArr)// 匹配父子关系
    return dataArr
}

/**
 * 组织下拉树数据（只用于参数）根据参数类型加''号
 * @param result 待组织的数据（有效列：C_CODE,C_NAME,P_CODE）
 * @return dataArr 可用于xmSelect插件的格式数据数组
 * @author JL
 */
export function organizeSelectTreeDataByType(result, dataType) {
    var dataArr = []
    for (var i = 0; i < result.length; i++) { // 先把每一条数据转换成xmSelect的数据格式{"name":xx,"value":xx,"children":[]}
        var obj = {
            'name': result[i].C_NAME,
            // 'value': dataType == 'str' ? `'` + result[i].C_CODE + `'` : result[i].C_CODE,
            'value': result[i].C_CODE,
            // 'pValue': dataType == 'str' ? `'` + result[i].P_CODE +`'` : result[i].P_CODE,
            'pValue': result[i].P_CODE,
            'children': [],
            'sort': i
        }
        dataArr.push(obj)
    }
    dataArr = matchingPcRelation(dataArr)// 匹配父子关系
    return dataArr
}


/**
 * 递归匹配父子关系（只用于参数）
 * @param dataArr 可用于xmSelect插件的格式数据数组
 * @return dataArr
 * @author JL
 */
 export function matchingPcRelation(dataArr, rootValue, unSort) {
//     var newDataArr = []
//     var c_code_arr = []// 用来记录执行本次方法的最末级节点集合
//     var hasUsed = false// 此方法是否有效，默认无效
//     for (var i = 0; i < dataArr.length; i++) { // 第一层循环
//         var firstVal = dataArr[i]// 第一层的对象
//         var C_CODE = firstVal.value// 拿到当前值的编码
//         var C_NAME = firstVal.name// 拿到当前值的显示值
//         var P_CODE = firstVal.pValue// 拿到当前值的父编码
//         var sort = firstVal.sort// 拿到当前值的排序号
//         var children = firstVal.children// 拿到当前值的子集
//         var cNum = 0
//         var isBreak = false
//         for (var j = 0; j < dataArr.length; j++) { // 第二层循环
//             var secondVal = dataArr[j]// 第二层的对象
//             var value = secondVal.value// 拿到当前值的编码
//             var pValue = secondVal.pValue// 拿到当前值的父编码
//             if (P_CODE === value && C_CODE !== value && !isBreak) { // 如果firstVal的父编码等于secondVal子编码的值，则说明firstVal不是根节点
//                 var obj = {
//                     'name': C_NAME,
//                     'value': C_CODE,
//                     'pValue': P_CODE, // 临时有用
//                     'children': children.length > 0 ? children : null,
//                     'sort': sort
//                 }
//                 var ifExsit = false
//                 for (var k = 0; k < secondVal.children.length; k++) {
//                     if (obj.value === secondVal.children[k].value && obj.pValue === secondVal.children[k].pValue) {
//                         ifExsit = true
//                         break
//                     }
//                 }
//                 if (!ifExsit) { // 如果不存在,则将firstVal（子节点）加入到secondVal（父节点）的children中
//                     if (secondVal.children.length === 0) {
//                         secondVal.children.push(obj)
//                     } else {
//                         var sortInd = -1
//                         for (var n = 0; n < secondVal.children.length; n++) {
//                             if (secondVal.children[n].sort > sort) {
//                                 sortInd = n
//                                 break
//                             }
//                         }
//                         if (sortInd === -1) { // 如果当前对象（obj）比children中所有对象的排序值都大，则直接将obj添加至最后一个位置
//                             secondVal.children.push(obj)
//                         } else { // 只要children中的对象存在排序值比obj排序值大的，则将obj插入相应位置
//                             secondVal.children.splice(n, 0, obj)
//                         }
//                     }
//                 }
//                 hasUsed = true
//                 isBreak = true
//             }
//             if (C_CODE !== pValue) { // 本身不作为任何节点的父节点
//                 cNum++
//             }
//         }
//         if (cNum === dataArr.length) {
//             c_code_arr.push(firstVal)// 记录本次循环最末级节点的编码数组
//         }
//     }
//     if (hasUsed) {
//         // 寻找执行本次方法的最末级节点集合
//         for (var c = 0; c < dataArr.length; c++) {
//             var num = 0
//             for (var t = 0; t < c_code_arr.length; t++) {
//                 if (dataArr[c].value !== c_code_arr[t].value) {
//                     num++
//                 }
//             }
//             if (num === c_code_arr.length) { // 如果当前编码与已记录的子节点的编码数组中每个对象的编码都不相等
//                 newDataArr.push(dataArr[c])// 找出不是子节点的对象
//             }
//         }
//         if (newDataArr.length > 0) {
//             dataArr = matchingPcRelation(newDataArr)
//         }
//     }
//     return dataArr



    // 通过pValue等于value 递归遍历数据为父子结构
    // 每层数据通过sort排序
    // unSort 为false的时候需要根据sort字段排序
    // var arr = [];
    // dataArr.forEach(item => {
    //     if (item.pValue == rootValue) {
    //         const children = matchingPcRelation(dataArr, item.value)
    //         if (!unSort) {
    //             children.sort((a, b) => {
    //                 return a.sort - b.sort
    //             })
    //         }
    //         if (children.length && children.length>0) {
    //             item.children = children
    //         } else {
    //             delete item.children;
    //         }
    //         arr.push(item)
    //         if (!unSort) {
    //             arr.sort((a, b) => {
    //                 return a.sort - b.sort
    //             })
    //         }
           
    //     }
    // })
    // return arr;
    var  result = [];
	if (!Array.isArray(dataArr)) {
		return result
	}
	dataArr.forEach(function (item){
		delete item.children;
	});
	var map = {};
	dataArr.forEach(function (item) {
		map[item.value] = item;
	});
	dataArr.forEach(function (item){
		var parent = map[item.pValue];
		if (parent) {
			(parent.children || (parent.children = [])).push(item);
		} else {
			result.push(item);
		}
	});
	return result;
}

/**
 * 递归获取当前选中的节点数据和其子孙节点数据
 * @param checkData 当前节点数据
 * @param dataArr 待返回的所有节点数据
 * @description 只适用于xmSelect下拉树（实现非严格父子结构下的全选功能）
 * @author JL
 */
export function getChildrenData(checkData, dataArr) {
    if (checkData.children && checkData.children.length > 0) { // 若当前节点有子节点
        var childrenArr = []// 存放有孙子节点的当前节点
        for (var i = 0; i < checkData.children.length; i++) {
            dataArr.push(checkData.children[i])// 将当前节点的子节点存放到待返回节点数组中
            if (checkData.children[i].children && checkData.children[i].children.length > 0) { // 如果当前节点有孙子节点
                childrenArr.push(checkData.children[i])// 记录
            }
        }
        for (var j = 0; j < childrenArr.length; j++) {
            dataArr = getChildrenData(childrenArr[j], dataArr)
        }
    }
    return dataArr
}

/**
 * 根据当前节点递归获取被选中的且需要取消选中的上级节点
 * @param checkData 当前节点数据
 * @param parentCheckedArr 被选中的上级节点数组
 * @param arr 查找的源数组
 * @description 只适用于xmSelect下拉树（实现非严格父子结构下的取消全选功能）
 * @return parentCheckedArr
 * @author JL
 */
export function getParentChecked(checkData, parentCheckedArr, arr) {
    if (arr && arr.length > 0) {
        var obj = {}
        for (var i = 0; i < arr.length; i++) {
            if (checkData.pValue === arr[i].value) {
                obj = arr[i]
                break
            }
        }
        if (Object.keys(obj).length > 0) {
            parentCheckedArr.push(obj)
            parentCheckedArr = getParentChecked(obj, parentCheckedArr, arr)
        }
    }
    return parentCheckedArr
}

/**
 * 根据当前节点递归获取未被选中的且需要被选中的上级节点
 * @param checkData 当前节点数据
 * @param parentUnCheckedArr 未被选中的上级节点数组
 * @param dataArr 查找的源数组
 * @param arr 处于选中状态的节点数组
 * @description 只适用于xmSelect下拉树（实现非严格父子结构下的全选功能）
 * @return parentUnCheckedArr
 * @author JL
 */
export function getParentUnChecked(checkData, parentUnCheckedArr, dataArr, arr) {
    if (dataArr && dataArr.length > 0) {
        var obj = {}
        for (var i = 0; i < dataArr.length; i++) {
            if (checkData.pValue === dataArr[i].value) {
                obj = dataArr[i]
                break
            }
        }
        if (Object.keys(obj).length > 0) {
            var basicChildrenNum = obj.children.length// 当前父节点的孩子节点的数量
            var checkChildrenNum = 0// 记录被选中状态下的当前父节点的孩子节点的数量
            for (var j = 0; j < basicChildrenNum; j++) {
                for (var k = 0; k < arr.length; k++) {
                    if (obj.children[j].value === arr[k].value && obj.children[j].pValue === arr[k].pValue) {
                        checkChildrenNum++
                    }
                }
            }
            if (basicChildrenNum === (checkChildrenNum + 1)) {
                parentUnCheckedArr.push(obj)
                parentUnCheckedArr = getParentUnChecked(obj, parentUnCheckedArr, dataArr, arr)
            }
        }
    }
    return parentUnCheckedArr
}

/**
 * 将下拉树组装好的数据进行拆分，把每个对象的孩子差分出来
 * @param dataArr 需要差分的数组
 * @description 只适用于xmSelect下拉树（拆分的时setting的data）
 * @return preDataArr 拆分后的数据
 * @author JL
 */
export function getSplitDataArr(dataArr) {
    var preDataArr = []
    for (var i = 0; i < dataArr.length; i++) {
        preDataArr.push(dataArr[i])
        if (dataArr[i].children && dataArr[i].children.length > 0) {
            preDataArr = splitDataArr(dataArr[i], preDataArr)
        }
    }
    return preDataArr
}

/**
 * 递归拆分当前节点的子节点
 * @param curSplitData 需拆分的当前节点
 * @param preDataArr 需要差分的数组
 * @description 只适用于xmSelect下拉树
 * @return preDataArr 拆分后的数据
 * @author JL
 */
function splitDataArr(curSplitData, preDataArr) {
    var childrenArr = curSplitData.children
    for (var i = 0; i < childrenArr.length; i++) {
        preDataArr.push(childrenArr[i])
        if (childrenArr[i].children && childrenArr[i].children.length > 0) {
            preDataArr = splitDataArr(childrenArr[i], preDataArr)
        }
    }
    return preDataArr
}

/**
 * 根据参数类型组织参数的HTML元素
 * createParamNodeHtml()方法内部调用的方法
 * @param paramObj 参数对象
 * @param selectNum 下拉列表参数的个数
 * @param selectTreeNum 下拉树参数的个数
 * @param setParamObj 待返回的参数对象
 */
export async function getSettingParamArr(paramObj, setParamObj, selectNum, selectTreeNum){
    let obj = {
        "selectNum":selectNum,
        "selectTreeNum":selectTreeNum,
        "setParamObj":{...{}, ...setParamObj},
        "isError": false,
        "message": ""
    }
    let dataArr = []// 下拉列表或下拉树的数据的数组
    let paramArr = []// 影响当前参数的主参集合
    let associatedParamIdArr = []// 受当前参数影响的被关联参数ID集合
    let paramSql = paramObj.paramChoice.optionsSql//拉列表或下拉树的SQL语句
    obj.setParamObj.title = paramObj.paramChoice.allowedNull === 0 ? '不可为空' : '可为空'
    obj.setParamObj.dataType = paramObj.dataType // dataType
    let hasSql = false// 下拉列表或下拉树是非SQL方式或者是SQL方式但值为空
    switch (obj.setParamObj.inputType) {
        case 'lineinp':// 下拉列表
            if (!paramSql) {// 备选sql为空的情况下 取静态的option值
                 // 下拉静态列表赋值
                 paramObj.paramChoice.ammParamOptionsList.forEach(r => {
                     if (r.optionsVal && r.optionsName) {
                         // 组织下拉选项数据
                         dataArr.push({
                             'name': r.optionsName,
                             'value': r.optionsVal
                         })
                     }
                 })
                 if (dataArr.length > 0) {
                     obj.setParamObj.data = dataArr
                 }
            } else { // 执行备选sql
                if (paramSql !== '') {
                    hasSql = true// 下拉列表是SQL方式
                    // 初始化默认执行sql
                    // const response = await executeParamSql(paramSql)
                    executeParamSql(paramSql).then(response => {
                        if (response.data == null) {
                            obj.isError = true
                            obj.message = `获取参数【${paramObj.paramName}】的值的失败`
                        } else {
                            if (response.data.isError) {
                                obj.isError = true
                                obj.message = `获取参数【${paramObj.paramName}】的值的失败，原因：${response.data.message}`
                            } else {
                                let e = response.data
                                if (e.paramList && e.paramList.length > 0) {
                                    // 给下拉列表赋值
                                    for (let k = 0; k < e.paramList.length; k++) {
                                        dataArr.push({
                                            'name': e.paramList[k].paramName,
                                            'value': e.paramList[k].paramValue
                                        })
                                    }
                                }
                                if (dataArr.length > 0) {
                                    obj.setParamObj.data = dataArr
                                }
                            }
                        }
                    })
                    
                }
            }
            if(typeof obj.selectNum !== 'undefined' && obj.selectNum != null){
                obj.setParamObj.id = `selectParam${obj.selectNum}`
                obj.selectNum++
            }else{
                obj.setParamObj.id = `selectParam${paramObj.ammParamUuid}`
            }
            obj.setParamObj.dataId = paramObj.ammParamUuid
            obj.setParamObj.dataName = paramObj.paramName
            obj.setParamObj.dataChoiceType = paramObj.paramChoice.choiceType
            if(hasSql){
                obj.setParamObj.dataSql = paramSql
                obj.setParamObj.dataParamArr = paramArr
                obj.setParamObj.dataAssociatedParamIdArr = associatedParamIdArr
            }
            if(typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null){
                // 下拉列表默认值
                obj.setParamObj.dataDefaultVal = paramObj.defaultVal
                // 默认值
                obj.setParamObj.value = obj.setParamObj.dataDefaultVal
            }
            if(typeof paramObj.paramChoice.allowedNull !== 'undefined' && paramObj.paramChoice.allowedNull != null){
                obj.setParamObj.dataAllowedNull = paramObj.paramChoice.allowedNull
            }
            break
        case 'textinp':// 文本框
            if (typeof paramObj.dataLength !== 'undefined' && paramObj.dataLength != null) {
                obj.setParamObj.title += `,参数值的长度为${paramObj.dataLength}`
            }
            obj.setParamObj.dataId = paramObj.ammParamUuid
            obj.setParamObj.dataName = paramObj.paramName
            if(typeof paramObj.paramChoice.allowedNull !== 'undefined' && paramObj.paramChoice.allowedNull != null){
                obj.setParamObj.dataAllowedNull = paramObj.paramChoice.allowedNull
            }
            if(typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null){
                obj.setParamObj.dataDefaultVal = paramObj.defaultVal
            }
            if(typeof paramObj.dataLength !== 'undefined' && paramObj.dataLength != null){
                obj.setParamObj.dataDataLength = paramObj.dataLength
            }
            break
        case 'timeinp':// 时间
            if (paramObj.dataType === 'date') { // 暂时只支持日期，不支持时间段
                obj.setParamObj.dataId = paramObj.ammParamUuid
                obj.setParamObj.dataName = paramObj.paramName
                if(typeof paramObj.paramChoice.allowedNull !== 'undefined' && paramObj.paramChoice.allowedNull != null){
                    obj.setParamObj.dataAllowedNull = paramObj.paramChoice.allowedNull
                }
                if(typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null){
                    obj.setParamObj.dataDefaultVal = paramObj.defaultVal
                }
            }
            break
        case 'treeinp':// 下拉树
            if (paramSql !== '') { // 执行备选SQL
                hasSql = true
                getSelectTreeData(paramSql).then(resp => {
                    if (resp.data == null) {
                        obj.isError = true
                        obj.message = `获取参数【${paramObj.paramName}】的值的失败`
                    } else {
                        if (resp.data.isError) {
                            obj.isError = true
                            obj.message = `获取参数【${paramObj.paramName}】的值的失败，原因：${resp.data.message}`
                        } else {
                            if (resp.data.result && resp.data.result.length > 0) {
                                // dataArr = organizeSelectTreeData(response.data.result)
                                dataArr = organizeSelectTreeData(resp.data.result)
                            } else {
                                dataArr = []
                            }
                            if (dataArr.length > 0) {
                                obj.setParamObj.data = dataArr
                            }
                        }
                    }
                })
            }
            if(typeof obj.selectTreeNum !== 'undefined' && obj.selectTreeNum != null){
                obj.setParamObj.id = `selectTreeParam${obj.selectTreeNum}`
                obj.selectTreeNum++
            }else{
                obj.setParamObj.id = `selectTreeParam${paramObj.ammParamUuid}`
            }
            obj.setParamObj.dataId = paramObj.ammParamUuid
            obj.setParamObj.dataName = paramObj.paramName
            obj.setParamObj.dataChoiceType = paramObj.paramChoice.choiceType
            if(hasSql){
                obj.setParamObj.dataSql = paramSql
                obj.setParamObj.dataParamArr = paramArr
                obj.setParamObj.dataAssociatedParamIdArr = associatedParamIdArr
            }
            if(typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null){
                // 下拉树默认值
                obj.setParamObj.dataDefaultVal = paramObj.defaultVal
                obj.setParamObj.value = obj.setParamObj.dataDefaultVal
            }
            // if(dataArr.length > 0){
            //     obj.setParamObj.data = dataArr
            // }
            if(typeof paramObj.paramChoice.allowedNull !== 'undefined' && paramObj.paramChoice.allowedNull != null){
                obj.setParamObj.dataAllowedNull = paramObj.paramChoice.allowedNull
            }
            break
    }
    return obj
}

/**
 * 根据影响当前参数的主参所选中的值，过滤当前参数的数据
 * @param dom 遮罩层的dom对象
 * @param idStr 当前下拉框是下拉列表还是下拉树（传它们的部分ID标识）
 * @param paramId 参数的标识（下标或当前参数的ID）
 * @param paramName 当前参数的名称
 * @param sql 当前参数的SQL语句
 * @param choiceType 当前参数时单选还是多选
 * @param paramArr 它受谁影响，即它为被关联参数时，其主参数的集合
 * @param dataArr 原始数据（未过滤之前的数据）
 * @param initDataArr 此次加载的是否是初始化数据
 * @description 下拉框展开时调用 "#selectParam",只适用于图形化工具的参数设置JS
 * @author JL
 */
export function selectShow(dom,idStr, paramId, paramName, sql, choiceType, paramArr, dataArr, initDataArr) {
    var loading = $(dom).mLoading({ 'text': '参数数据请求中，请稍后……', 'hasCancel': false })
    // 找出该参数与被关联参数之间的联系（它影响谁和谁影响它两种）
    try {
        var sqlWhereStr = ''
        let selectXs = null
        // 在当前参数列表中匹配影响当前参数的主参数集合，获取其选中的值拼接where条件
        for (var t = 0; t < paramArr.length; t++) {
            if (paramArr[t].paramId === paramId) {
                selectXs = xmSelect.get(idStr + paramId, true)// 获取当前下拉框的实体对象
                var selectedObjArr = selectXs.getValue()// 获取选中的参数值集合
                if (selectedObjArr && selectedObjArr.length > 0) {
                    var associatedParamCol = paramArr[t].associatedParamCol// 被关联参数值（对应的列名称）
                    var key = paramArr[t].paramValueType === 'realValue' ? 'value' : 'name'// 判断是真实值还是显示值
                    if (choiceType === '1') { // 单选
                        sqlWhereStr += ' and ' + associatedParamCol + "='" + selectedObjArr[0][key] + "'"
                    } else { // 多选
                        var valueStr = ''
                        for (var k = 0; k < selectedObjArr.length; k++) {
                            valueStr += "'" + selectedObjArr[k][key] + "',"
                        }
                        if (valueStr !== '') {
                            valueStr = valueStr.substring(0, valueStr.length - 1)
                        }
                        sqlWhereStr += ' and ' + associatedParamCol + ' in (' + valueStr + ')'
                    }
                }
                break
            }
        }
        selectXs = xmSelect.get(idStr + paramId, true)// 获取当前下拉框的实体对象
        var oldSqlWhereStr = typeof $(idStr + paramId).attr('data-sqlWhereStr') !== 'undefined' ? $(idStr + paramId).attr('data-sqlWhereStr') : ''
        let request = null;
        if (sqlWhereStr !== '') {
            if (oldSqlWhereStr === '' || oldSqlWhereStr !== sqlWhereStr) {
                sql = 'SELECT * FROM (' + sql + ') where 1=1' + sqlWhereStr
                if (idStr === '#selectParam') { // 下拉列表
                    request = executeParamSql(sql)
                } else { // idStr=='#selectTreeParam'   下拉树
                    request = getSelectTreeData(sql)
                }
                request.then( response => {
                    if(response.data.isError){
                        loading.destroy()
                        alertMsg('错误', '获取参数【' + paramName + '】的值的失败，原因：' + response.data.message, 'error')
                    }else{
                        var newDataArr = []
                        if (idStr === '#selectParam') {
                            for (var k = 0; k < response.data.paramList.length; k++) {
                                var paramObj = {
                                    'name': response.data.paramList[k].paramName,
                                    'value': response.data.paramList[k].paramValue
                                }
                                newDataArr.push(paramObj)
                            }
                        } else { // idStr=='#selectTreeParam'
                            newDataArr = organizeSelectTreeData(response.data.result)
                        }
                        selectXs.update({
                            data: newDataArr
                            // autoRow: true,
                        })
                        $(idStr + paramId).attr('data-sqlWhereStr', sqlWhereStr)
                        loading.destroy()
                    }
                })
            } else {
                loading.destroy()
            }
        }
        if (sqlWhereStr === '' && dataArr.length === 0) { // 当影响它的主参没有选择值且本身没数据时（第一次加载全部数据）
            initDataArr = true
            if (idStr === '#selectParam') { // 下拉列表
                request = executeParamSql(sql)
            } else { // idStr=='#selectTreeParam'   下拉树
                request = getSelectTreeData(sql)
            }
            request.then( response => {
                if (response.data.isError) {
                    loading.destroy()
                    alertMsg('错误', '获取参数【' + paramName + '】的值的失败，原因：' + response.data.message, 'error')
                } else {
                    if (idStr === '#selectParam') {
                        for (var k = 0; k < response.data.paramList.length; k++) {
                            var paramObj = {
                                'name': response.data.paramList[k].paramName,
                                'value': response.data.paramList[k].paramValue
                            }
                            dataArr.push(paramObj)
                        }
                    } else { // idStr=='#selectTreeParam'
                        dataArr = organizeSelectTreeData(response.data.result)
                    }
                    selectXs.update({
                        data: dataArr
                        // autoRow: true,
                    })
                    loading.destroy()
                }
            })
        }
        if (sqlWhereStr === '' && dataArr.length !== 0) {
            if (paramArr.length !== 0) { // 本身受其它参数影响
                selectXs.update({
                    data: dataArr
                    // autoRow: true,
                })
            }
            $(idStr + paramId).attr('data-sqlWhereStr')
            loading.destroy()
        }
    } catch (e) {
        loading.destroy()
        alertMsg('错误', '程序执行出错，刷新参数数据失败', 'error')
        console.info(e)
    }
    return initDataArr
}

/**
 * 清空当前参数的被关联参数的值
 * @param idStr 当前下拉框是下拉列表还是下拉树（传它们的部分ID标识）
 * @param ind 参数的标识（下标）
 * @param associatedParamIdArr 当前参数的所有被关联参数ID数组
 * @author JL
 */
export function selectHide(idStr, ind, associatedParamIdArr) {
    var selectXs = xmSelect.get(idStr + ind, true)// 获取当前下拉框的实体对象
    var selectedObj = selectXs.getValue()// 获取选中的参数值
    if (selectedObj && selectedObj.length > 0) {
        selectXs.setValue([])// 清空选中值
    }
}

/**
 * 对参数数组的按照排序值由小到大得顺序进行排序（使用直接选择排序算法进行排序）
 * @param paramAarr 待排序得参数数组
 * @description 只适用于参数
 * @author JL
 */
export function sortParamArr(paramAarr) {
    var index = 0
    for (var i = 1; i < paramAarr.length; i++) { // 第一层是控制循环的次数
        index = 0// 每次进入循环需使用数组的第一个值进行比较
        for (var j = 0; j <= paramAarr.length - i; j++) { // 第二次循环是每次循环需比较的次数
            if (parseInt(paramAarr[j].sortVal) > parseInt(paramAarr[index].sortVal)) {
                index = j
            }
        }
        var tempObj = paramAarr[paramAarr.length - i]// 将此次要交换的值存储到临时变量中（较小的值）
        paramAarr[paramAarr.length - i] = paramAarr[index]// 将较大的值存储到之前存储较小值的位置
        paramAarr[index] = tempObj// 将较小的值存储在原来存储较大值的位置
    }
    return paramAarr
}
/**
 * 拖拽后生成的moduleParamId有顺序的数组根据paramAarr 对sortVal赋值
 * @param paramAarr 待排序得参数数组
 * @param setParamArrIdArr 拖拽后有顺序的moduleParamId 数组
 * @description 只适用于参数
 * @author JL
 */
export function sortParamArrById(paramAarr, setParamArrIdArr) {
    let arrParam = {};
    paramAarr.map((item)=>{
        let index = setParamArrIdArr.indexOf(item.moduleParamId);
        arrParam[index]= item;
    })
    // 根据拖拽后的顺序重新赋值sortVal
    for(let key in arrParam){
        arrParam[key].sortVal = key;
    }
    return Object.values(arrParam)
}

/**
 * 递归获取当前节点的根节点类型
 * @param treeNode
 * @param ztreeObj
 * @return {boolean}
 * @description 加载参数树孙子节点时使用
 * @author JL
 */
export function getRootNodeType(treeNode, ztreeObj) {
    var isPersonalParam = false
    if (treeNode.type === 'personalParam') {
        isPersonalParam = true
    } else {
        var nodes = ztreeObj.getNodesByParam('id', treeNode.pId, null)
        if (nodes.length > 0) {
            if (nodes[0].type !== 'personalParam') {
                isPersonalParam = getRootNodeType(nodes[0], ztreeObj)
            } else {
                isPersonalParam = true
            }
        }
    }
    return isPersonalParam
}
