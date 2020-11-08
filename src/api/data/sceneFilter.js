import request from '@/utils/request'

const baseURL = '/amsdata'
const controllerName = 'sceneFilter'

export function listByPageFilter(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/pageList`,
    method: 'post',
    data
  })
}

export function saveFilter(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/save`,
    method: 'post',
    data
  })
}

export function updateFilter(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/update`,
    method: 'put',
    data
  })
}

export function delFilter(ids) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/delete/${ids}`,
    method: 'delete'
  })
}

export function getByIdFilter(id) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/getById/${id}`,
    method: 'get'
  })
}

