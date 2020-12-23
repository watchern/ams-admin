import request from '@/utils/request'
const baseURL = '/base'

/**
 * 获取系统异常日志
 * @param data 查询条件
 * @returns {返回查询后的数据}
 */
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

/**
 * 获取系统操作日志
 * @param data 查询条件
 * @returns {返回查询后的数据}
 */
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

/**
 * 获取系统提醒
 * @param data 查询条件
 * @returns {返回查询后的数据}
 */
export function listByPageRemind(data) {
  return request({
    baseURL: baseURL,
    url: '/remindController/listByPage',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}

export function updateRemind(data) {
  return request({
    baseURL: baseURL,
    url: '/remindController/update',
    method: 'put',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    params: data
  })
}

// /**
//  * 获取单个系统异常信息
//  * @param {*} data
//  */
// export function getReadErrorLog(id) {
//   return request({
//     baseURL: baseURL,
//     url: `/logSysErrorController/getErrorLog/${id}`,
//     method: 'get',
//   })
// }

export function getUnReadRemind(data) {
  return request({
    baseURL: baseURL,
    url: '/remindController/getUnReadRemind',
    method: 'get',
    params: data
  })
}

export function getRemindByDescTime(data) {
  return request({
    baseURL: baseURL,
    url: '/remindController/getRemindByDescTime/5',
    method: 'get',
    params: data
  })
}


export function updateReminds(ids) {
  return request({
    baseURL: baseURL,
    url: `/remindController/updateReminds/${ids}`,
    method: 'put',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
  })
}