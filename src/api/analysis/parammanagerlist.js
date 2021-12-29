import request from "@/utils/request";
const analysisUrl = '/analysis'
/**
 * 获取模型参数树数据
 * @returns {AxiosPromise}
 */
export function findModelParamTreeData() {
  return request({
    baseURL: analysisUrl,
    url: '/ParamFolderController/findModelParamTreeData',
    method: 'get'
  })
}

/**
 * 添加模型参数分类
 * @param data 要添加的数据
 * @returns {AxiosPromise}
 */
export function addFolder(data){
  return request({
    baseURL: analysisUrl,
    url: '/mlcFolder/addFolder',
    method: 'post',
    data
  })
}

/**
 * 修改模型参数分类
 * @param data 要修改的数据
 * @returns {AxiosPromise}
 */
export function editFolder(data){
  return request({
    baseURL: analysisUrl,
    url: '/mlcFolder/editFolder',
    method: 'put',
    data
  })
}

/**
 * 删除模型参数分类
 * @param folderId 分类编号
 * @param folderName 分类名称
 * @returns {AxiosPromise}
 */
export function delFolder(folderId,folderName){
  let data = {folderId:folderId,folderName:folderName}
  return request({
    baseURL: analysisUrl,
    url: '/mlcFolder/delFolder',
    method: 'delete',
    data
  })
}

/**
 * 查找参数列表
 * @param data 要查询的数据对象
 * @returns {AxiosPromise}
 */
export function listByAmmParam(data){
  return request({
    baseURL: analysisUrl,
    url: '/paramController/listByAmmParam',
    method: 'post',
    data
  })
}
