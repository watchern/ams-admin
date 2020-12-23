import request from '@/utils/request'

const baseURL = '/data'
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

export function initSceneTree(grpUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/initSceneTree?grpUuid=${grpUuid}`,
    method: 'post'
  })
}

export function getAllScene() {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/getAllScene`,
    method: 'post'
  })
}

