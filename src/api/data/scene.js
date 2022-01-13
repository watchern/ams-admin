import request from '@/utils/request'

const baseURL = '/data'
const controllerName = 'scene'

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

export function initSceneTree(grpUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/initSceneTree?grpUuid=${grpUuid}`,
    method: 'post'
  })
}

export function getAllGropSelect(sceneCode) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/getAllGropSelect?sceneCode=${sceneCode}`,
    method: 'post'
  })
}

export function getAllScene() {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/getAllScene`,
    method: 'get'
  })
}

export function getSceneInst(sceneCode, sceneInst) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/getSceneInst/${sceneCode}/${sceneInst}`,
    method: 'get'
  })
}
/* export function saveSession(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/saveSession`,
    method: 'post',
    data
  })
}*/

/***
 * 获取配置的 EncloseBy
 */
export function getEncloseBy() {
  return request({
    baseURL: baseURL,
    url: '/tableMeta/getEncloseBy',
    method: 'get'
  })
}
