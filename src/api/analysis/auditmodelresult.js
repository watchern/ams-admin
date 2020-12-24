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
 * 添加结果共享
 * @param data 运行结果共享对象
 */
export function insertRunResultShare(runTaskRelUuids,personUuids,personNames) {
  return request({
    baseURL: analysisUrl,
    url: '/RunResultShareController/addRunResultShare',
    method: 'post',
    data:{runTaskRelUuids,personUuids,personNames}
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
  for (var j = 0; j < filterArr.length; j++) { // 遍历所有母参数信息
    var moduleParamId = filterArr[j].moduleParamId
    for (var k = 0; k < arr.length; k++) { // 遍历当前节点绑定的参数
      if (arr[k].copyParamId === moduleParamId) {
        if (typeof filterArr[j].paramValue != undefined) {
          replaceSql = replaceSql.replace(arr[k].id, filterArr[j].paramValue) // 将参数SQL中的参数ID替换为输入得值
        }
      }
    }
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
/*BOE 发送模型结果到作业平台 */
export function sendToOA(taskRelUuid) {
  return request({
    baseURL: analysisUrl,
    url: '/ResultRelProjectController/sendToOA',
    method: 'get',
    params:{taskRelUuid: taskRelUuid}
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
