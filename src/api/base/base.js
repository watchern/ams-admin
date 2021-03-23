<<<<<<< HEAD
import request from '../../utils/request'
=======
import request from '@/utils/request'
>>>>>>> f50f6d123e4736d2ced8b9459fadb87b9ff7a95d
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

export function updateRemind(id) {
  return request({
    baseURL: baseURL,
    url:`/remindController/update/${id}`,
    method: 'put',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
  })
}

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
<<<<<<< HEAD
}
=======
}
>>>>>>> f50f6d123e4736d2ced8b9459fadb87b9ff7a95d
