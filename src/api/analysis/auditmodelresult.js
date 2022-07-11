import request from '@/utils/request'
const analysisUrl = '/analysis'

/**
 * 查询模型运行结果列表
 * @param  data 传入的模糊查询条件
 */
export function getRunTaskRelByPage(data, resultSpiltObjects) {
  var map = {
    basePageParam: data
  }
  return request({
    baseURL: analysisUrl,
    url: '/RunTaskRelController/getLikeRunTaskRelByPage',
    method: 'post',
    data: {
      basePageParam: data,
      orgNameColumnList: resultSpiltObjects.orgNameColumnList,
      orgNameValues: resultSpiltObjects.orgNameValues,
      orgUuidColumnList:resultSpiltObjects.orgUuidColumnList,
      orgUuidValues:resultSpiltObjects.orgUuidValues,
      resultSpiltedRunResultRel: resultSpiltObjects.resultSpiltedRunResultRel
    }
  })
}

/**
 * 批量删除选中的模型运行结果
 * @param  data 要删除的模型运行结果的uuid数组
 */
export function batchDeleteRunTaskRel(data) {
  return request({
    baseURL: analysisUrl,
    url: '/RunTaskRelController/deleteRunTaskRelFalse/' + data,
    method: 'delete'

  })
}

/**
 * 关联项目
 * @param data 要添加的分类对象
 * @returns {AxiosPromise}
 */
export function ResultRelProject(data) {
  return request({
    baseURL: analysisUrl,
    url: '/ResultRelProjectController/addResultRelProject',
    method: 'post',
    data
  })
}

/**
 * 关联项目
 * @param data 要添加的分类对象
 * @returns {AxiosPromise}
 */
export function getAllRunTaskRel() {
  return request({
    baseURL: analysisUrl,
    url: '/RunTaskRelController/getAllRunTaskRel',
    method: 'post'
  })
}

/**
 * 关联项目
 * @param data 要添加的分类对象
 * @returns {AxiosPromise}
 */
export function addCoverResultRelProject(data) {
  return request({
    baseURL: analysisUrl,
    url: '/ResultRelProjectController/addCoverResultRelProject',
    method: 'post',
    data
  })
}

/**
 * 关联项目
 * @param data 要添加的分类对象
 * @returns {AxiosPromise}
 */
export function selectOnlyUuidByStatus(data) {
  return request({
    baseURL: '/ams-clue',
    url: '/applyBusData/selectOnlyUuidByStatus',
    method: 'post',
    data
  })
}

/**
 * 移除项目关联
 * @param  data 运行结果与项目关联表主键
 */
export function rmResultRelProjectlr(data) {
  return request({
    baseURL: analysisUrl,
    url: '/ResultRelProjectController/deleteResultRelProject/' + data,
    method: 'delete'
  })
}

/**
 * 获取所有状态开启的项目
 */
export function getProjects() {
  return request({
    baseURL: analysisUrl,
    url: '/prjProjectController/getAllPrj',
    method: 'get',
  })
}

/**
 * 根据结果明细的onlyUuid查询项目关联表
 */
export function getByResultDetailIds(data) {
  return request({
    baseURL: analysisUrl,
    url: '/ResultDetailProjectRelController/getResultRelProject',
    method: 'post',
    data
  })
}

/**
 * 根据结果明细的onlyUuid查询项目关联表
 */
export function getByRunTashRelUuid(RunTaskRelUuid) {
  return request({
    baseURL: analysisUrl,
    url: '/ResultRelProjectController/getResultRelProject',
    method: 'get',
    params:{RunTaskRelUuid:RunTaskRelUuid}
  })
}



/**
 * 添加结果共享
 * @param data 运行结果共享对象
 */
export function insertRunResultShare(runTaskRelUuids,runTaskRelCreateUuids,personUuid,personName) {
  return request({
    baseURL: analysisUrl,
    url: '/RunResultShareController/addRunResultShare',
    method: 'post',
    data:{runTaskRelUuids,runTaskRelCreateUuids,personUuid,personName}
  })
}
/**
 * 删除结果共享表
 */
export function deleteRunResultShare(data) {
  return request({
    baseURL: analysisUrl,
    url: '/RunResultShareController/deleteRunResultShare/' + data,
    method: 'delete'
  })
}

/**
 * 删除结果共享表
 */
export function deleteRunResultShareByRunTaskRelUuid(data) {
  return request({
    baseURL: analysisUrl,
    url: '/RunResultShareController/deleteRunResultShareByRunTaskRelUuid/' + data,
    method: 'delete'
  })
}

/**
 * 根据运行结果表查询真实表
 * @param {*} data pageQuery对象
 */
export function selectTable(data, filterSql,resultSpiltObjects) {
  var map = {
    basePageParam: data,
    filterSql: filterSql,
    orgNameColumnList: resultSpiltObjects.orgNameColumnList,
    orgNameValues: resultSpiltObjects.orgNameValues,
    orgUuidColumnList:resultSpiltObjects.orgUuidColumnList,
    orgUuidValues:resultSpiltObjects.orgUuidValues,
    resultSpiltedRunResultRel: resultSpiltObjects.resultSpiltedRunResultRel
  }
  return request({
    baseURL: analysisUrl,
    url: '/RunResultTableController/selectTable',
    method: 'post',
    data: map
  })
}

/**
 * 导出模型运行结果界面表
 */
export function exportRunTaskRel() {
  return request({
    baseURL: analysisUrl,
    url: '/RunTaskRelController/exportRunTaskRelTable',
    method: 'post',
  })
}

/**
 * 与疑点库映射关系反显
 */
export function findSuspectsRelevanceData(modelId) {
  return request({
    baseURL: analysisUrl,
    url: '/modelFixedDefinition/returnHistoryRelationList',
    method: 'post',
    //data: data
    params: { modelId: modelId }
  })
}

/**
 * 取消执行模型
 * @param {*} id 
 */
 export function pauseRunRelTask(id) {
   return request({
     baseURL: analysisUrl,
     url: `/RunTaskRelController/pauseRunRelTask/${id}`,
     method: 'get'
   })
 }

/**
 * 运行任务重新运行
 */
export function reRunRunTask(data, setDateTime) {
  var map = {
    runTaskRel: data,
    timingExecute: setDateTime
  }
  return request({
    baseURL: analysisUrl,
    url: '/RunTaskController/reRunRunTask',
    method: 'post',
    data: map
  })
}

/**
 * 根据运行结果uuid查询运行结果详细与项目关联表
 * @param data
 */
export function selectByRunResultTableUUid(data) {
  return request({
    baseURL: analysisUrl,
    url: '/ResultDetailProjectRelController/getByRunResultTableUUid/' + data,
    method: 'post'
  })
}

/**
 * 根据运行结果uuids查询运行结果详细与项目关联表
 * @param data
 */
export function selectByRunResultTableUUids(data) {
  return request({
    baseURL: analysisUrl,
    url: '/ResultDetailProjectRelController/getByRunResultTableUUids',
    method: 'post',
    data
  })
}

/**
 * 查询结果拆分后选中要勾选结果中的主表数据，用于项目关联
 * @param {*} data
 */
export function getDataAfterResultSpiltToRelateProject(resultSpiltObjects,projectId,projctName,selectRunTaskRelUuid) {
  var map = {
    orgNameColumnList: resultSpiltObjects.orgNameColumnList,
    orgNameValues: resultSpiltObjects.orgNameValues,
    orgUuidColumnList:resultSpiltObjects.orgUuidColumnList,
    orgUuidValues:resultSpiltObjects.orgUuidValues,
    resultSpiltedRunResultRel: resultSpiltObjects.resultSpiltedRunResultRel,
    projectId:projectId,
    projctName:projctName,
    selectRunTaskRelUuid:selectRunTaskRelUuid
  }
  return request({
    baseURL: analysisUrl,
    url: '/RunResultTableController/getDataAfterResultSpiltToRelateProject',
    method: 'post',
    data:map
  })
}

/**
 * 批量添加关联详细表对象
 * @param {*} data 关联详细表对象数组
 */
export function batchCoverAddResultDetailProjectRel(data) {
  return request({
    baseURL: analysisUrl,
    url: '/ResultDetailProjectRelController/batchCoverAddResultDetailProjectRel',
    method: 'post',
    data
  })
}

/**
 * 批量添加关联详细表对象
 * @param {*} data 关联详细表对象数组
 */
export function batchSaveResultDetailProjectRel(data) {
  return request({
    baseURL: analysisUrl,
    url: '/ResultDetailProjectRelController/batchAddResultDetailProjectRel',
    method: 'post',
    data
  })
}

/**
 * 批量添加人员关联详细表对象
 * @param {*} data 关联详细表对象数组
 */
export function batchSaveResultDetailPersonRel(data) {
  return request({
    baseURL: analysisUrl,
    url: '/ResultDetailProjectRelController/batchAddResultDetailPersonRel',
    method: 'post',
    data
  })
}

/**
 * 根据表名查询该表中的主键名称
 * @param {*} data
 */
export function selectPrimaryKeyByTableName() {
  return request({
    baseURL: analysisUrl,
    url: '/ResultDetailProjectRelController/getPrimaryKeyByTableName',
    method: 'post'
  })
}

/**
 * 运行结果详细界面移除关联
 * @param {*} data 运行结果详细与项目关联表主键
 */
export function removeResultDetailProjectRel(data) {
  return request({
    baseURL: analysisUrl,
    url: '/ResultDetailProjectRelController/deleteResultDetailProjectRel/' + data,
    method: 'delete'
  })
}

/**
 * 删除运行任务（假删除）,同时删除该运行任务下的所有运行任务关联
 * @param {*} data 运行任务主键
 */
export function deleteRunTaskFalse(data) {
  return request({
    baseURL: analysisUrl,
    url: '/RunTaskController/deleteRunTaskFalse',
    method: 'delete',
    params: {
      runTaskUuid: data
    }
  })
}

/**
 * 查询条件展示集合
 * @param {*} modelUuid  模型的uuid
 * @param {*} tableName  渲染主表的名字
 */
export function selectConditionShow(modelUuid, tableName) {
  var map = {
    modelUuid: modelUuid,
    tableName: tableName
  }
  return request({
    baseURL: analysisUrl,
    url: '/RunResultTableController/getConditionShow',
    method: 'post',
    data: map
  })
}

/**
 * 根据modelUuid查询对应的model
 *@param {*} data:要查询model 的 modeluuid
 */
export function selectModel(modelId) {
  return request({
    baseURL: analysisUrl,
    url: '/modelController/selectModel',
    method: 'post',
    params: {
      modelId: modelId
    }
  })
}

/**
 * 根据模型UUid查询模型与参数关联表的PARAM_VALUE属性
 * @param {*} data  modeluuid
 */
export function findParamModelRelByModelUuid(data) {
  return request({
    baseURL: analysisUrl,
    url: '/paramController/findParamModelRelByModelUuid',
    method: 'post',
    params: {
      modelId: data
    }
  })
}

/**
 * 模型运行结果点击关联之后获得sql方法
 * @param {*} filterArr  选择的模型运行结果中条目Json对象
 * @param {*} arr 替换之前sql中参数的Json对象
 * @param {*} replaceSql 要替换的sql
 */
export function replaceParam(filterArr, arr, replaceSql) {
  // 根据重复的参数判断moduleParamId相等则赋值
  for (var j = 0; j < arr.length; j++) { // 遍历所有母参数信息
    for (var k = 0; k < filterArr.length; k++) { // 遍历当前节点绑定的参数
      var moduleParamId = filterArr[k].moduleParamId
      if (arr[j].moduleParamId === moduleParamId) {
        if (typeof filterArr[k].paramValue != undefined) {
          var re = new RegExp(arr[j].id,"g");
          replaceSql = replaceSql.replace(re,filterArr[k].paramValue)
          // replaceSql = replaceSql.replaceAll(arr[k].id, filterArr[j].paramValue) // 将参数SQL中的参数ID替换为输入得值
        }
      }
    }
  }
  for (var n = 0; n < arr.length; n++) { // 再次遍历被关联模型的参数
    var re = new RegExp(arr[n].id,"g");
    replaceSql = replaceSql.replace(re, "")
    // replaceSql = replaceSql.replaceAll(arr[n].id, "") // 如果参数没被替换，证明没有被关联，赋空值
  }
  return replaceSql
}

/**
 *
 * @param {*} data
 */
export function getResultSplitSelectData(data) {
  return request({
    baseURL: analysisUrl,
    url: '/RunTaskRelController/getResultSplitSelectData',
    method: 'post',
    data
  })
}

/**
 * 添加模型图表配置
 * @param {*} data 图表配置对象
 */
export function addModelChartSetup(data) {
  return request({
    baseURL: analysisUrl,
    url: '/modelChartSetupController/addModelChartSetup',
    method: 'post',
    data
  })
}

/**
 * 根据模型获取模型图表配置
 * @param modelUuid  模型编号
 */
export function getModelChartSetup(modelUuid) {
  return request({
    baseURL: analysisUrl,
    url: '/modelChartSetupController/getModelChartSetup',
    method: 'get',
    params:{modelUuid:modelUuid}
  })
}

/**
 * 修改模型图表配置
 * @param {*} data 图表配置对象
 */
export function updateModelChartSetup(data) {
  return request({
    baseURL: analysisUrl,
    url: '/modelChartSetupController/updateModelChartSetup',
    method: 'put',
    data
  })
}
/**
 * 批量修改模型图表配置
 * @param {*} data 图表配置对象
 */
 export function overallUpdateModelChartSetup(data) {
  return request({
    baseURL: analysisUrl,
    url: '/modelChartSetupController/overallUpdateModelChartSetup',
    method: 'post',
    data
  })
}


/**
 * 批量删除删除运行结果与项目关联表
 * @param {*} data  运行结果与项目关联主键数组
 */
export function batchDeleteResultRelProject(data) {
  return request({
    baseURL: analysisUrl,
    url: '/ResultRelProjectController/batchDeleteResultRelProject',
    method: 'delete',
    data
  })
}

/**
 * 删除图标功能
 * @param {*} data 图标对象UUid
 */
export function deleteModelChartSetup(data) {
  return request({
    baseURL: analysisUrl,
    url: '/modelChartSetupController/deleteModelChartSetup',
    method: 'delete',
    data
  })
}

/*BOE 发送模型结果到作业平台 */
export function sendToOA(taskRelUuid, dataUserId, dataUserName) {
  return request({
    baseURL: analysisUrl,
    url: '/AnalysisResultController/sendToOA',
    method: 'get',
    params:{taskRelUuid: taskRelUuid, dataUserId: dataUserId, dataUserName: dataUserName}
  })
}

/**
 * 校验模型结果明细提交审批权限
 * @param {*} data 模型结果id模型结果明细id人员信息
 */
export function verificationApprovalAuthority(runTaskRelUuid,onlyUuids,personUuid,personName) {
  return request({
    baseURL: analysisUrl,
    url: '/RunResultShareController/verificationApprovalAuthority',
    method: 'post',
    data:{runTaskRelUuid,onlyUuids,personUuid,personName}
  })
}

