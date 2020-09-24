import request from '@/utils/request'

const baseURL = '/amsdata'
const controller1 = 'warehouse'
const controller2 = 'tableMeta'

export function listUnCached(level, pid) {
  return request({
    baseURL: baseURL,
    url: `/${controller1}/listUnCached`,
    method: 'get',
    params:{
      level: level,
      pid: pid
    }
  })
}

export function getDataTreeNode(pid) {
  return request({
    baseURL: baseURL,
    url: `/${controller1}/getDataTreeNode/${pid}`,
    method: 'get',
  })
}


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


