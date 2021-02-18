import request from '@/utils/request'
const analysisUrl = '/analysis'

/**
 * 获取当前登录人阈值分类树
 * @param isShowThresholdValue 是否加载阈值
 * @returns {AxiosPromise}
 */
export function findThresholdValueFolderTree(isShowThresholdValue) {
  return request({
    baseURL: analysisUrl,
    url: '/thresholdValueFolder/getThresholdValueFolderTree',
    method: 'get',
    params: { isShowThresholdValue: isShowThresholdValue }
  })
}

/**
 * 添加阈值文件夹
 * @param thresholdValueFolder 阈值文件夹对象
 * @returns {*}
 */
export function addThresholdValueFolder(data){
  return request({
    baseURL: analysisUrl,
    url: '/thresholdValueFolder/save',
    method: 'post',
    data
  })
}

/**
 * 修改阈值文件夹
 * @param thresholdValueFolder 阈值文件夹对象
 * @returns {*}
 */
export function updateThresholdValueFolder(data){
  return request({
    baseURL: analysisUrl,
    url: '/thresholdValueFolder/update',
    method: 'put',
    data
  })
}

/**
 * 删除阈值文件夹
 * @param thresholdValueFolder 阈值文件夹对象
 * @returns {*}
 */
export function deleteThresholdValueData(ids){
  return request({
    baseURL: analysisUrl,
    url: '/thresholdValueFolder/delete/' + ids,
    method: 'delete',
  })
}

/**
 * 查找阈值列表
 * @param data
 * @returns {AxiosPromise}
 */
export function findThresholdValueList(data){
  return request({
    baseURL: analysisUrl,
    url: '/thresholdValue/pageList',
    method: 'post',
    data
  })
}

/**
 * 添加阈值
 * @param data 数据
 * @returns {AxiosPromise}
 */
export function addThresholdValue(data){
  return request({
    baseURL: analysisUrl,
    url: '/thresholdValue/addThresholdValue',
    method: 'post',
    data
  })
}

/**
 * 修改阈值
 * @param data 数据
 * @returns {AxiosPromise}
 */
export function updateThresholdValue(data){
  return request({
    baseURL: analysisUrl,
    url: '/thresholdValue/updateThresholdValue',
    method: 'put',
    data
  })
}


/**
 * 根据阈值编号查找阈值
 * @param id
 */
export function findThresholdValueById(id){
  return request({
    baseURL: analysisUrl,
    url: '/thresholdValue/getById/' + id,
    method: 'get',
  })
}

/**
 * 根据阈值编号查找阈值
 * @param data 要删除的阈值对象
 */
export function batchThresholdValueDel(data){
  return request({
    baseURL: analysisUrl,
    url: '/thresholdValue/batchThresholdValueDel',
    method: 'delete',
    data
  })
}

/**
 * 处理数据展现颜色  阈值为单值的时候
 * @param data 要处理的数据
 * @param thresholdValueRel 过滤条件对象
 * @returns {{"background-color": (string), color: (string)}}
 */
export function handleDataSingleValue(data,thresholdValueRel){
  //测试数据 可以用来后续修改用  建议不删 否则每次都得重新查数据
/*  thresholdValueRel = JSON.parse("{\"modelThresholdValueUuid\":\"\",\"thresholdValueUuid\":\"40281a8177418a3d0177418a3df30000\"," +
    "\"thresholdValueName\":\"单值\",\"colorInfo\":{\"backgroundColor\":\"#000000\",\"fontColor\":\"#ffffff\"}," +
    "\"modelResultColumnName\":\"合计期初借方余额\",\"operator\":\"endingwith\",\"thresholdValueObject\":\"\"," +
    "\"thresholdValue\":{\"keyword\":null,\"thresholdValueUuid\":\"40281a8177418a3d0177418a3df30000\",\"thresholdValueName\":" +
    "\"单值\",\"thresholdValueType\":1,\"thresholdValueMemo\":\"这是说明\",\"createUserName\":\"测试\",\"createUserUuid\":" +
    "\"2c948a86757909950175790b10b60002\",\"updateUserName\":\"测试\",\"updateUserUuid\":\"2c948a86757909950175790b10b60002\"," +
    "\"createTime\":\"2021-01-27T01:51:54.882+00:00\",\"updateTime\":\"2021-01-27T03:27:47.700+00:00\"," +
    "\"thresholdValueFolderUuid\":\"f3dda50c3b862dc9f51e50e19499861b\",\"thresholdValueFolderName\":\"啊啊啊\",\"filterValue\":\"100\",\"isDeleted\":0," +
    "\"thresholdValueInfoList\":[{\"keyword\":null,\"thresholdValueInfoUuid\":null," +
    "\"thresholdValueUuid\":\"40281a8177418a3d0177418a3df30000\",\"filterConditions\":null,\"filterValue\":null}]}}")
  data = JSON.parse("{\"科目名称\":\"B2B网上支付业务手续费收入\",\"合计期初借方余额\":999718}")*/

  let backgroundColor = thresholdValueRel.colorInfo.backgroundColor;
  let fontColor = thresholdValueRel.colorInfo.fontColor;
  //数据出来的值
  let valueOne = data[thresholdValueRel.modelResultColumnName.toLowerCase()]
  //要判断的值
  let valueTwo = thresholdValueRel.thresholdValue.filterValue
  //运算符
  let operator = thresholdValueRel.operator
  //阈值描述
  let title = thresholdValueRel.thresholdValue.thresholdValueMemo
  if(valueOne == null || valueTwo == null){
    return
  }
  if(operator === ">" && valueOne > valueTwo){
    return {"background-color":backgroundColor,"color":fontColor}
  }
  else if(operator === ">=" && valueOne >= valueTwo){
    return {"background-color":backgroundColor,"color":fontColor}
  }
  else if(operator === "<" && valueOne < valueTwo){
    return {"background-color":backgroundColor,"color":fontColor}
  }
  else if(operator === "<=" && valueOne <= valueTwo){
    return {"background-color":backgroundColor,"color":fontColor}
  }
  else if(operator === "=" && valueOne == valueTwo){
    return {"background-color":backgroundColor,"color":fontColor}
  }
  else if(operator === "like" && valueOne.indexOf(valueTwo) != -1){
    return {"background-color":backgroundColor,"color":fontColor}
  }
  else if(operator === "notlike" && valueOne.indexOf(valueTwo) == -1){
    return {"background-color":backgroundColor,"color":fontColor}
  }
  else if(operator === "startswith"){
    //将值1和值2全部转换为字符串类型，因为如果判断开始是或者结尾是的数据只能是字符串类型
    valueTwo = valueTwo.toString()
    valueOne = valueOne.toString()
    if(valueOne.length >= valueTwo.length && valueOne.substring(0,valueTwo.length) === valueTwo){
      return {"background-color":backgroundColor,"color":fontColor}
    }
  }
  else if(operator === "endingwith"){
    //将值1和值2全部转换为字符串类型，因为如果判断开始是或者结尾是的数据只能是字符串类型
    valueTwo = valueTwo.toString()
    valueOne = valueOne.toString()
    if(valueOne.length >= valueTwo.length && valueOne.substring(valueOne.length - valueTwo.length,valueOne.length) === valueTwo){
      return {"background-color":backgroundColor,"color":fontColor}
    }
  }
}

/**
 * 处理数据颜色  阈值为多值的时候
 * @param params 数据
 * @param thresholdValueRel 阈值关联对象
 */
export function
handleDataManyValue(params,thresholdValueRel){
  //测试数据 建议不要删 否则后续更改太麻烦 又得设置又得查
/*  thresholdValueRel = JSON.parse("{\"modelThresholdValueUuid\":\"\",\"thresholdValueUuid\":\"40281a8177418a3d0177418aa0e60001\"," +
    "\"thresholdValueName\":\"多值修改\",\"colorInfo\":{\"backgroundColor\":\"#000000\",\"fontColor\":\"#ffffff\"},\"modelResultColumnName\":\"合计期初借方余额\"," +
    "\"operator\":\">\",\"thresholdValueObject\":\"科目名称\",\"thresholdValue\":{\"keyword\":null,\"thresholdValueUuid\":\"40281a8177418a3d0177418aa0e60001\"," +
    "\"thresholdValueName\":\"多值修改\",\"thresholdValueType\":2,\"thresholdValueMemo\":\"2222222\",\"createUserName\":\"测试\"," +
    "\"createUserUuid\":\"2c948a86757909950175790b10b60002\",\"updateUserName\":\"测试\",\"updateUserUuid\":\"2c948a86757909950175790b10b60002\"," +
    "\"createTime\":\"2021-01-27T01:52:20.199+00:00\",\"updateTime\":\"2021-01-28T06:58:19.303+00:00\",\"thresholdValueFolderUuid\":\"9f88c99fc8fe5391b97c20ecd1a58e50\"," +
    "\"thresholdValueFolderName\":\"啊实打实的\",\"filterValue\":null,\"isDeleted\":0,\"thresholdValueInfoList\":[{\"keyword\":null," +
    "\"thresholdValueInfoUuid\":\"10382a3a83106dc9f80f5d5c8f269c22\",\"thresholdValueUuid\":\"40281a8177418a3d0177418aa0e60001\"," +
    "\"filterConditions\":\"B2B网上支付业务手续费收入\",\"filterValue\":\"100\"},{\"keyword\":null,\"thresholdValueInfoUuid\":\"0dce6793f0bdf0f7a5ead808b125684c\"," +
    "\"thresholdValueUuid\":\"40281a8177418a3d0177418aa0e60001\",\"filterConditions\":\"一般销售-%6结息\",\"filterValue\":\"200\"}]}}")
  let data = JSON.parse("{\"科目名称\":\"B2B网上支付业务手续费收入\",\"合计期初借方余额\":999718}")*/
  let data = params.data
  let backgroundColor = thresholdValueRel.colorInfo.backgroundColor;
  let fontColor = thresholdValueRel.colorInfo.fontColor;
  //数据出来的值
  let valueOne = data[thresholdValueRel.modelResultColumnName.toLowerCase()]
  //阈值对象列数据
  let thresholdValueObject = data[thresholdValueRel.thresholdValueObject.toLowerCase()]
  //运算符
  let operator = thresholdValueRel.operator
  //当阈值类型为多值的时候，阈值对象信息
  let thresholdValueInfoList = thresholdValueRel.thresholdValue.thresholdValueInfoList
  //如果检查不符合条件则返回原数值
  let dom = params.value
  //阈值描述
  let title = thresholdValueRel.thresholdValue.thresholdValueMemo
  //let dom = "1"
  if(operator === ">"){
    for(let i = 0; i < thresholdValueRel.thresholdValue.thresholdValueInfoList.length;i++){
      //要判断的值
      let valueTwo = thresholdValueRel.thresholdValue.thresholdValueInfoList[i].filterValue
      valueOne = parseFloat(valueOne)
      valueTwo = parseFloat(valueTwo)
      let thresholdValueObjectValue = thresholdValueRel.thresholdValue.thresholdValueInfoList[i].filterConditions
      if(thresholdValueObject.indexOf(thresholdValueObjectValue) != -1 && valueOne > valueTwo){
        dom = "<span style='color:" + fontColor +  ";background-color:" + backgroundColor + "' title='" + title + "'>" + dom + "</span>"
        break
      }
    }
    return dom
  }
  else if(operator === ">="){
    for(let i = 0; i < thresholdValueRel.thresholdValue.thresholdValueInfoList.length;i++){
      //要判断的值
      let valueTwo = thresholdValueRel.thresholdValue.thresholdValueInfoList[i].filterValue
      valueOne = parseFloat(valueOne)
      valueTwo = parseFloat(valueTwo)
      let thresholdValueObjectValue = thresholdValueRel.thresholdValue.thresholdValueInfoList[i].filterConditions
      if(thresholdValueObject.indexOf(thresholdValueObjectValue) != -1 && valueOne >= valueTwo){
        dom = "<span style='color:" + fontColor +  ";background-color:" + backgroundColor + "' title='" + title + "'>" + dom + "</span>"
        break
      }
    }
    return dom
  }
  else if(operator === "<"){
    for(let i = 0; i < thresholdValueRel.thresholdValue.thresholdValueInfoList.length;i++){
      //要判断的值
      let valueTwo = thresholdValueRel.thresholdValue.thresholdValueInfoList[i].filterValue
      valueOne = parseFloat(valueOne)
      valueTwo = parseFloat(valueTwo)
      let thresholdValueObjectValue = thresholdValueRel.thresholdValue.thresholdValueInfoList[i].filterConditions
      if(thresholdValueObject.indexOf(thresholdValueObjectValue) != -1 && valueOne < valueTwo){
        dom = "<span style='color:" + fontColor +  ";background-color:" + backgroundColor + "' title='" + title + "'>" + dom + "</span>"
        break
      }
    }
    return dom
  }
  else if(operator === "<="){
    for(let i = 0; i < thresholdValueRel.thresholdValue.thresholdValueInfoList.length;i++){
      //要判断的值
      let valueTwo = thresholdValueRel.thresholdValue.thresholdValueInfoList[i].filterValue
      valueOne = parseFloat(valueOne)
      valueTwo = parseFloat(valueTwo)
      let thresholdValueObjectValue = thresholdValueRel.thresholdValue.thresholdValueInfoList[i].filterConditions
      if(thresholdValueObject.indexOf(thresholdValueObjectValue) != -1 && valueOne <= valueTwo){
        dom = "<span style='color:" + fontColor +  ";background-color:" + backgroundColor + "' title='" + title + "'>" + dom + "</span>"
        break
      }
    }
    return dom
  }
  else if(operator === "="){
    for(let i = 0; i < thresholdValueRel.thresholdValue.thresholdValueInfoList.length;i++){
      //要判断的值
      let valueTwo = thresholdValueRel.thresholdValue.thresholdValueInfoList[i].filterValue
/*      valueOne = parseFloat(valueOne)
      valueTwo = parseFloat(valueTwo)*/
      let thresholdValueObjectValue = thresholdValueRel.thresholdValue.thresholdValueInfoList[i].filterConditions
      if(thresholdValueObject.indexOf(thresholdValueObjectValue) != -1 && valueOne == valueTwo){
        dom = "<span style='color:" + fontColor +  ";background-color:" + backgroundColor + "' title='" + title + "'>" + dom + "</span>"
        break
      }
    }
    return dom
  }
  else if(operator === "like"){
    for(let i = 0; i < thresholdValueRel.thresholdValue.thresholdValueInfoList.length;i++){
      //要判断的值
      let valueTwo = thresholdValueRel.thresholdValue.thresholdValueInfoList[i].filterValue
      valueOne = valueOne.toString()
      valueTwo = valueTwo.toString()
      let thresholdValueObjectValue = thresholdValueRel.thresholdValue.thresholdValueInfoList[i].filterConditions
      if(thresholdValueObject.indexOf(thresholdValueObjectValue) != -1 && valueOne.indexOf(valueTwo) != -1){
        dom = "<span style='color:" + fontColor +  ";background-color:" + backgroundColor + "' title='" + title + "'>" + dom + "</span>"
        break
      }
    }
    return dom
  }
  else if(operator === "notlike"){
    for(let i = 0; i < thresholdValueRel.thresholdValue.thresholdValueInfoList.length;i++){
      //要判断的值
      let valueTwo = thresholdValueRel.thresholdValue.thresholdValueInfoList[i].filterValue
      valueOne = valueOne.toString()
      valueTwo = valueTwo.toString()
      let thresholdValueObjectValue = thresholdValueRel.thresholdValue.thresholdValueInfoList[i].filterConditions
      if(thresholdValueObject.indexOf(thresholdValueObjectValue) != -1 && valueOne.indexOf(valueTwo) == -1){
        dom = "<span style='color:" + fontColor +  ";background-color:" + backgroundColor + "' title='" + title + "'>" + dom + "</span>"
        break
      }
    }
    return dom
  }
  else if(operator === "startswith"){
    //将值1和值2全部转换为字符串类型，因为如果判断开始是或者结尾是的数据只能是字符串类型
    for(let i = 0; i < thresholdValueRel.thresholdValue.thresholdValueInfoList.length;i++){
      //要判断的值
      let valueTwo = thresholdValueRel.thresholdValue.thresholdValueInfoList[i].filterValue
      valueTwo = valueTwo.toString()
      valueOne = valueOne.toString()
      let thresholdValueObjectValue = thresholdValueRel.thresholdValue.thresholdValueInfoList[i].filterConditions
      if(thresholdValueObject.indexOf(thresholdValueObjectValue) != -1 && valueOne.length >= valueTwo.length && valueOne.substring(0,valueTwo.length) === valueTwo){
        dom = "<span style='color:" + fontColor +  ";background-color:" + backgroundColor + "' title='" + title + "'>" + dom + "</span>"
        break
      }
    }
    return dom
  }
  else if(operator === "endingwith"){
    //将值1和值2全部转换为字符串类型，因为如果判断开始是或者结尾是的数据只能是字符串类型
    for(let i = 0; i < thresholdValueRel.thresholdValue.thresholdValueInfoList.length;i++){
      //要判断的值
      let valueTwo = thresholdValueRel.thresholdValue.thresholdValueInfoList[i].filterValue
      valueTwo = valueTwo.toString()
      valueOne = valueOne.toString()
      let thresholdValueObjectValue = thresholdValueRel.thresholdValue.thresholdValueInfoList[i].filterConditions
      if(thresholdValueObject.indexOf(thresholdValueObjectValue) != -1 && valueOne.length >= valueTwo.length && valueOne.substring(valueOne.length - valueTwo.length,valueOne.length) === valueTwo){
        dom = "<span style='color:" + fontColor +  ";background-color:" + backgroundColor + "' title='" + title + "'>" + dom + "</span>"
        break
      }
    }
    return dom
  }
}
