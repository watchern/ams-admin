import request from '@/utils/request'

const baseURL = '/data'
const controllerName = 'tableMeta'

export function listByPage(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/listByPage`,
    method: 'post',
    data
  })
}

export function selectOne(tableMetaUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/getTableInfo`,
    method: 'post',
    params: { tableMetaUuid: tableMetaUuid }
  })
}

export function exportFile() {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/exportFile`,
    method: 'post'
  })
}

export function del(ids) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/delete/${ids}`,
    method: 'delete'
  })
}

export function importTable(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/importDicTable`,
    method: 'post',
    data
  })
}