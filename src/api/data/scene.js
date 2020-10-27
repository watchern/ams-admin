import request from '@/utils/request'

const baseURL = '/amsdata'
const controllerName = 'scene'

export function listByPage(data) {
  return request({
    baseURL: baseURL,
    url: '/scene/listByPage',
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

export function initSceneTree(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/initSceneTree`,
    method: 'post',
    data
  })
}
