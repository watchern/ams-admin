import request from '@/utils/request'

const baseURL = '/amsdata'

/* 元数据操作*/
const controller1 = 'warehouse'
export function listUnCached(level, pid) {
  return request({
    baseURL: baseURL,
    url: `/${controller1}/listUnCached`,
    method: 'get',
    params: {
      level: level,
      pid: pid
    }
  })
}
export function getDataTreeNode(pid) {
  return request({
    baseURL: baseURL,
    url: `/${controller1}/getDataTreeNode/${pid}`,
    method: 'get'
  })
}

/* 缓存数据操作*/
const controller2 = 'tableMeta'
export function saveTable(data) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/save`,
    method: 'post',
    data
  })
}
export function updateTable(data) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/update`,
    method: 'put',
    data
  })
}
export function delTable(ids) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/delete/${ids}`,
    method: 'delete'
  })
}
export function getResELTree(data) {
  if(!data) data = {dataUserId: '', sceneCode: ''};
  return request({
    baseURL: baseURL,
    url: `/${controller2}/getResELTree`,
    method: 'get',
    params: data
  })
}

/* 角色表操作*/
const controller3 = 'roleTable'
export function getResByRole(roleUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controller3}/getResByRole/${roleUuid}`,
    method: 'get'
  })
}
export function getRoleCols(roleUuid, tableUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controller3}/getRoleCols?roleUuid=${roleUuid}&tableMetaUuid=${tableUuid}`,
    method: 'get'
  })
}
export function saveRoleTable(roleUuid, rfolders, rtables, rcols) {
  return request({
    baseURL: baseURL,
    url: `/${controller3}/save`,
    method: 'post',
    data: {
      roleUuid: roleUuid,
      rfolders: rfolders,
      rtables: rtables,
      rcols: rcols
    }
  })
}

export function getAccessType() {
  return request({
    baseURL: baseURL,
    url: `/${controller3}/getAccessType`,
    method: 'get'
  })
}


