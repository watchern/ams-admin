import request from '@/utils/request'

const baseURL = '/data'
const controllerName = 'tableMeta'
const tableRelation = 'tableRelation'

export function listByPage (data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/listByPage`,
    method: 'post',
    data
  })
}
// 详情
export function getBasicInfo (tableMetaUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/getTableInfo`,
    method: 'post',
    params: { tableMetaUuid: tableMetaUuid }
  })
}

export function exportFile () {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/exportFile`,
    method: 'post'
  })
}

export function del (ids) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/delete/${ids}`,
    method: 'delete'
  })
}
// 数据资源（简约）模版
export function import_dictionary (data) {
  return request({
    baseURL: baseURL,
    url: `/tableMeta/importTableInfo`,
    method: 'post',
    data
  })
}

// 数据资源（复杂）模版
export function import_dictionary_temp (data) {
  return request({
    baseURL: baseURL,
    url: `/tableMeta/importTableInfoForMore`,
    method: 'post',
    data
  })
}

// 汉化
export function importTable (data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/importDicTable`,
    method: 'post',
    data
  })
}
// 表关系
export function importTable_table (data) {
  return request({
    baseURL: baseURL,
    url: `/${tableRelation}/importDicTable`,
    method: 'post',
    data
  })
}
// 表关系保存
export function relationship_save (data) {
  return request({
    baseURL: baseURL,
    url: `/${tableRelation}/save`,
    method: 'post',
    data
  })
}

// 表关联关系列表
export function getById (id) {
  return request({
    baseURL: baseURL,
    url: `/${tableRelation}/getById`,
    method: 'get',
    params: { id: id }
  })
}



