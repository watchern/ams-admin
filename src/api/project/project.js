import request from '@/utils/request'

const baseURL = '/base'

const amisUrl = '/amis'

/**
 * 获取当前登录人下的所有项目
 */
export function getProjectByLoginUserUuid() {
    return request({
      baseURL: baseURL,
      url: '/userProject/getProjectByLoginUserUuid',
      method: 'get'
    })
}

export function getprojectPage(data) {
  return request({
    baseURL: amisUrl,
    url: '/workBench/projectPage',
    method: 'POST',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}

export function getapplyMesList(data, state) {
  return request({
    baseURL: '/',
    url: state && `${amisUrl}/workBench/applyMesList?state=${state}` || `${amisUrl}/workBench/applyMesList`,
    // url: '/applyMes/sf/apply/auditDataList',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data:data
  })
}