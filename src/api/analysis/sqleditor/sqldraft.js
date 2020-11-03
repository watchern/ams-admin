import request from '@/utils/request'
const analysisUrl = '/analysis'
/**
 * 查找sql草稿列表
 * @param data 要过滤的数据
 * @returns {AxiosPromise}
 */
export function findSqlDraft(data) {
  return request({
    baseURL: analysisUrl,
    url: '/sqlDraft/pageList',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}

/**
 * 删除SQL草稿
 * @param ids 要删除的id
 * @returns {AxiosPromise}
 */
export function deleteSqlDraft(ids){
  return request({
    baseURL: analysisUrl,
    url: '/sqlDraft/delete',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    params:{ids:ids}
  })
}

/**
 * 修改sql草稿
 * @param data 要修改的对象
 * @returns {AxiosPromise}
 */
export function updateDraft(data){
  return request({
    baseURL: analysisUrl,
    url: '/sqlDraft/update',
    method: 'put',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}
