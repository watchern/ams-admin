import request from '@/utils/request'

const baseURL = '/data'
const controllerName = 'role'

export function listByPage(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/pageList`,
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

// 根据id查找
export function getById(id) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/getById/${id}`,
    method: 'get'
  })
}

/* 维护角色下的filter*/
export function getSceneFilter(roleUuid, sceneCode) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/getSceneFilter?roleUuid=${roleUuid}&sceneCode=${sceneCode}`,
    method: 'get'
  })
}
export function changeRoleFilter(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/changeRoleFilter`,
    data: data,
    method: 'post'
  })
}

const controllerName1 = 'roleGrp'
export function saveRoleGrp(roleUuid, roleGrps) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName1}/save`,
    method: 'post',
    data: {
      roleUuid: roleUuid,
      roleGrps: roleGrps
    }
  })
}
export function getRoleGrp(roleUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName1}/list?roleUuid=${roleUuid}`,
    method: 'get'
  })
}

