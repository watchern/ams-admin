import request from '@/utils/request'
const analysisUrl = '/analysis'

/**
 * 获取当前登录人模型分类树
 * @returns {AxiosPromise}
 */
export function findModelFoldeTree() {
  return request({
    baseURL: analysisUrl,
    url: '/modelFolderController/findModelFoldeTree',
    method: 'get'
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
 * 修改模型
 * @param modelId 模型编号
 */
export function updateModel(modelId){
  return request({
    baseURL: analysisUrl,
    url: '/modelController/selectModel',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    params:{modelId:modelId}
  })
}
