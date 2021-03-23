<<<<<<< HEAD
import request from '../../utils/request'
=======
import request from '@/utils/request'
>>>>>>> f50f6d123e4736d2ced8b9459fadb87b9ff7a95d
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
<<<<<<< HEAD
 * @param data
 * @returns {返回查询后的数据}
 *
=======
 * @param data 
 * @returns {返回查询后的数据}
 * 
>>>>>>> f50f6d123e4736d2ced8b9459fadb87b9ff7a95d
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
<<<<<<< HEAD
 * @param data
=======
 * @param data 
>>>>>>> f50f6d123e4736d2ced8b9459fadb87b9ff7a95d
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
