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
