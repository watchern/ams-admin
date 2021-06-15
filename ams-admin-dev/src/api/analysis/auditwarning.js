import request from '@/utils/request'
import $ from "jquery";
import {Loading} from "element-ui";
const analysisUrl = '/analysis'
const dataUrl = '/amsdata'
const indicatorUrl = '/indicator'

/**
* 查询审计预警列表
* @param data 查询数据
* @return {AxiosPromise}
* @author lvhe
* @date 2020/11/2 20:08
*/
export function findAuditWarningList(data) {
  return request({
    baseURL: analysisUrl,
    url: '/auditWarning/pageList',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}
/**
* 根据模型uuid数组查询带参数信息的模型的模型list
* @param data 模型uuid数据
* @return {AxiosPromise}
* @author lvhe
* @date 2020/11/5 19:34
*/
export function findModelsWithParam(data) {
  return request({
    baseURL: analysisUrl,
    url: '/modelController/findModelList',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}
/**
* 新增审计预警
* @param data 审计预警
* @return {AxiosPromise}
* @author lvhe
* @date 2020/11/7 13:48
*/
export function addWarning(data) {
  return request({
    baseURL: analysisUrl,
    url: '/auditWarning/add',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}

/**
* 根据审计预警主键查询审计预警
* @param id 审计预警主键
* @return {AxiosPromise}
* @author lvhe
* @date 2020/11/9 14:05
*/
export function getWarningById(id) {
  return request({
    baseURL: analysisUrl,
    url: `/auditWarning/getById/${id}`,
    method: 'get'
  })
}
/**
* 删除审计预警
* @param data 审计预警集合json
* @return
* @author lvhe
* @date 2020/11/9 14:11
*/
export function deleteAuditWarning(data) {
  return request({
    baseURL: analysisUrl,
    url: `/auditWarning/delete`,
    method: 'post',
    data
  })
}

/**
 * 修改审计预警
 * @param data 审计预警
 * @return {AxiosPromise}
 * @author lvhe
 * @date 2020/11/9 15:27
 */
export function updateWarning(data) {
  return request({
    baseURL: analysisUrl,
    url: '/auditWarning/update',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}

/**
 * 停止审计预警
 * @param id 审计预警主键
 * @return {AxiosPromise}
 * @author lvhe
 * @date 2020/11/19 16:27
 */
export function stopById(id) {
  return request({
    baseURL: analysisUrl,
    url: `/auditWarning/stopById/${id}`,
    method: 'get'
  })
}

/**
 * 启动审计预警
 * @param id 审计预警主键
 * @return {AxiosPromise}
 * @author lvhe
 * @date 2020/11/19 16:27
 */
export function startById(id) {
  return request({
    baseURL: analysisUrl,
    url: `/auditWarning/startById/${id}`,
    method: 'get'
  })
}

/**
 * 根据id获取常用分析列表
 * @param data 常用分析id
 * @return {AxiosPromise}
 * @author ZhangSiWeiG
 * @date 2020/11/19 16:27
 */
export function getCommonlyAnalysisListByIds(data) {
  return request({
    baseURL: indicatorUrl,
    url: '/InOftenindicators/getCommonlyAnalysisListByIds/',
    method: 'post',
    data
  })
}

/**
 * 调用后台的并列分析查询
 * @param objInList 指标列表
 * @param objDimList 维度列表
 */
export function bingLieQuery(objInList, objDimList) {
  let resultObj;
  var indicatrixObj = null;
  let filterShow = [];
  for(let i = 0;i < objInList.length;i++){
    if (objInList[i] == null) {
      return;
    }
    indicatrixObj = objInList[i];
  }
  let data = {dimList:objDimList,inMeasure:indicatrixObj}
  let url = indicatorUrl + "/indicatrixAnalysis/getInDataSql"
  $.ajax({
    type: "post",
    url: url,
    data: {param:JSON.stringify(data)},
    async: false,
    success: function (res) {
      resultObj = res
    },
    error: function (res) {

    }
  });
  return resultObj
}
/**
 * 调用后台的叠加查询
 * @param objInList 指标列表
 * @param objDimList 维度列表
 */
export function supQuery(objInList, objDimList) {
  let resultObj;
  let newInList = [];
  let filterShow = [];
  //取出每个分析区的第一个指标并删除，用该指标与其他指标进行组织sql
  for(let i = 0;i < objInList.length;i++){
    if (objInList[i] == null) {
      return;
    }
    newInList.push(objInList[i]);
  }
  let data = {inMeasures: newInList, listDims: objDimList}
  let url = indicatorUrl + "/indicatrixAnalysis/getSupAnalysisSql"
  $.ajax({
    type: "post",
    url: url,
    data: {param:JSON.stringify(data)},
    async: false,
    success: function (res) {
      resultObj = res
    },
    error: function (res) {

    }
  });

  return resultObj
}
