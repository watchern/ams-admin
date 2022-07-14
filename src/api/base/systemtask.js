import request from '@/utils/request'

const baseURL = '/base'

export function querySystemTask(data) {
  return request({
    baseURL: baseURL,
    url: `/systemTask/querySystemTask`,
    method: 'post'
  })
}

export function cancelExecution(ids) {
  return request({
    baseURL: baseURL,
    url: `/systemTask/cancelExecution/${ids}`,
    method: 'put'
  })
}