import request from '@/utils/request'

const baseURL = '/amsdata'
const controllerName = 'sceneGrp'

export function listByPageGrp(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/listByPage`,
    method: 'post',
    data
  })
}

export function saveGrp(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/save`,
    method: 'post',
    data
  })
}

export function updateGrp(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/update`,
    method: 'put',
    data
  })
}

export function delGrp(ids) {
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
