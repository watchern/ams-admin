import request from '@/utils/request'
const baseURL = '/base'

/**
 * 根据菜单id查询单个
 * @param data 查询条件
 * @returns {返回查询后的数据}
 */
export function getByMenuId(id) {
    return request({
      baseURL: baseURL,
      url: `/helpDocument/getByMenuId/${id}`,
      method: 'get',
      // params 以formData格式传递  后台用RequestParam
      // 直接加data以json格式传递  后台用RequestBody
    })
}

/**
 * 保存
 * @param data 
 * @returns {返回查询后的数据}
 * 
 */
export function saveHelpDocument(data) {
  return request({
    baseURL: baseURL,
    url: 'helpDocument/save',
    method: 'Post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}

/**
 * 修改
 * @param data 
 * @returns {返回查询后的数据}
 */
export function updateHelpDocument(data) {
  return request({
    baseURL: baseURL,
    url: 'helpDocument/update',
    method: 'Put',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}

/**
 * 根据菜单path查询单个
 * @param data 查询条件
 * @returns {返回查询后的数据}
 */
export function getHelpByMenuPath(data) {
  return request({
    baseURL: baseURL,
    url: '/helpDocument/getByMenuPath',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}
