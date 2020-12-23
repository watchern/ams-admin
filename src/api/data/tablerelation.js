import request from '@/utils/request'

const baseURL = '/data'
const controllerName = 'tableRelation'

export function listByPage(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/listByPage`,
    method: 'post',
    data
  })
}

export function save(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/save`,
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/update`,
    method: 'put',
    data
  })
}

export function del(ids) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/delete/${ids}`,
    method: 'delete'
  })
}

export function getById(id) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/getById/${id}`,
    method: 'get'
  })
}
