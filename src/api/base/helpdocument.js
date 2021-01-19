import request from '@/utils/request'
const baseURL = '/base'

/**
 * 获取系统帮助文档列表
 * @param data 查询条件
 * @returns {返回查询后的数据}
 */
export function listByPageHelpDocument(data) {
    return request({
      baseURL: baseURL,
      url: '/helpDocument/findPageList',
      method: 'post',
      // params 以formData格式传递  后台用RequestParam
      // 直接加data以json格式传递  后台用RequestBody
      data
    })
  }