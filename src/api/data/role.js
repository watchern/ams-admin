import request from '@/utils/request'

const baseURL = '/amsdata'
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

