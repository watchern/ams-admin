import request from '@/utils/request'
const baseURL = '/base'

export function listByPageErrorLog(data) {
  return request({
    baseURL: baseURL,
    url: '/logSysErrorController/listByPage',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}

export function listByPageOperationLog(data) {
  return request({
    baseURL: baseURL,
    url: '/logSysActiController/listByPage',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}
