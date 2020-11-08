import request from '@/utils/request'
const analysisUrl = '/analysis'
const dataUrl = '/amsdata'


/**
* 查询审计预警列表
* @param data 查询数据
* @return {AxiosPromise}
* @author lvhe
* @date 2020/11/2 20:08
*/
export function findAuditWarningList(data) {
  return request({
    baseURL: analysisUrl,
    url: '/auditWarning/pageList',
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}
