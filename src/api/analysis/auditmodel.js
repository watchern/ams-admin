import request from '@/utils/request'
const analysisUrl = '/analysis'
const dataUrl = '/amsdata'

/**
 * 获取当前登录人模型分类树
 * @returns {AxiosPromise}
 */
export function findModelFolderTree(isShowModel) {
  return request({
    baseURL: analysisUrl,
    url: '/modelFolderController/findModelFolderTree',
    method: 'get',
    params: { isShowModel: isShowModel }
  })
}

/**
 * 查找模型列表
 * @param data 要过滤的数据
 * @returns {AxiosPromise}
 */
export function findModel(data) {
  return request({
    baseURL: analysisUrl,
    url: '/modelController/listByPage',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}

/**
 * 删除模型分类
 * @param data 要删除的分类
 * @returns {AxiosPromise}
 */
export function deleteModelFolder(data) {
  return request({
    baseURL: analysisUrl,
    url: '/modelFolderController/deleteModelFolder',
    method: 'delete',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    params: data
  })
}

/**
 * 添加模型分类
 * @param data 要添加的分类对象
 * @returns {AxiosPromise}
 */
export function addModelFolder(data) {
  return request({
    baseURL: analysisUrl,
    url: '/modelFolderController/addModelFolder',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}

/**
 * 修改模型分类
 * @param data 要修改的分类对象
 * @returns {AxiosPromise}
 */
export function updateModelFolder(data) {
  return request({
    baseURL: analysisUrl,
    url: '/modelFolderController/updateModelFolder',
    method: 'put',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}

/**
 * 保存模型
 * @param data 要保存的对象
 */
export function saveModel(data) {
  return request({
    baseURL: analysisUrl,
    url: '/modelController/saveModel',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}

export function updateModel(data) {
  return request({
    baseURL: analysisUrl,
    url: '/modelController/updateModel',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}
/**
 * 删除模型
 * @param data 要删除的模型
 */
export function deleteModel(data) {
  return request({
    baseURL: analysisUrl,
    url: '/modelController/deleteModel',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}

/**
 * 查找要修改的模型
 * @param modelId 模型编号
 */
export function selectModel(modelId) {
  return request({
    baseURL: analysisUrl,
    url: '/modelController/selectModel',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    params: { modelId: modelId }
  })
}

/**
 * 批量修改模型基本信息
 * @param data 要修改的模型数组
 * @returns {AxiosPromise}
 */
export function updateModelBasicInfo(data) {
  return request({
    baseURL: analysisUrl,
    url: '/modelController/updateModelBasicInfo',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}

export function setModelSession(data) {
  return request({
    baseURL: analysisUrl,
    url: '/modelController/setModelSession',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}

/**
 * 导出模型
 */
export function exportModel() {
  const url = analysisUrl + '/modelController/exportModel'
  window.location.href = url
}

/**
 * 获取业务属性
 * @returns {AxiosPromise}
 */
export function getBusinessAttribute() {
  return request({
    baseURL: dataUrl,
    url: '/bizAttr/list',
    method: 'post'
  })
}

/**
 * 获取数据表列
 * @param data
 * @returns {AxiosPromise}
 */
export function getTableCol(tableMetaUuid) {
  return request({
    baseURL: dataUrl,
    url: '/tableMeta/getCols',
    method: 'post',
    params: { tableMetaUuid: tableMetaUuid }
  })
}

/**
 * 获取审计事项数据
 * @returns {AxiosPromise}
 */
export function getAuditItem() {
  return request({
    baseURL: analysisUrl,
    url: '/modelFolderController/getAuditItemTree',
    method: 'get'
  })
}

/**
 * 共享模型给指定人员
 * @param data 要共享的数据
 * @returns {AxiosPromise}
 */
export function shareModel(data){
  return request({
    baseURL: analysisUrl,
    url: '/modelController/shareModel',
    method: 'post',
    data
  })
}

/**
 * 根据model的id数组查询对应的model集合
 * @param {*} data modelid数组
 */
export function findModelList(data){
  return request({
    baseURL: analysisUrl,
    url: '/modelController/findModelList',
    method: 'post',
    data
  })
}


/**
 * 添加运行任务和运行关联表
 * @param {*} data 运行任务对象
 */
export function addRunTaskAndRunTaskRel(data){
  return request({
    baseURL: analysisUrl,
    url: '/RunTaskController/addRunTaskAndRunTaskRel',
    method: 'post',
    data
  })
}

export function uuid2() {
  var s = []
  var hexDigits = '0123456789abcdef'
  for (var i = 0; i < 32; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23]
  var uuid = s.join('')
  return uuid
}




