import request from '@/utils/request'
const baseURL = 'etlscheduler'

// 获取resourcesList
export function resourcesList(data) {
  return request({
    baseURL: baseURL,
    url: `/resources/list`,
    method: 'post',
    data
  })
}

// 获取id
export function resourceId(data) {
  return request({
    baseURL: baseURL,
    url: `/resources/queryResource`,
    method: 'post',
    data
  })
}
