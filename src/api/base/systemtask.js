import request from '@/utils/request'

const baseURL = '/base'
const controllerName = 'systemTask'

export function querySystemTask(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/querySystemTask`,
    method: 'post'
  })
}

export function cancelExecution(ids) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/cancelExecution/${ids}`,
    method: 'put'
  })
}