import request from '@/utils/request'

const baseURL = '/data'
const controllerName = 'tableRelation'

export function listByPage (data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/selectPage`,
    method: 'post',
    data
  })
}

export function save (data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/save`,
    method: 'post',
    data
  })
}

export function saveTableRelation (data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/saveTableRelation`,
    method: 'post',
    data
  })
}

export function update (data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/update`,
    method: 'put',
    data
  })
}

export function del (ids) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/delete/${ids}`,
    method: 'delete'
  })
}

export function delByTableId (id) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/delByTableId`,
    method: 'get',
    params: { id: id }
  })
}

export function getById (id) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/getById`,
    method: 'get',
    params: { id: id }
  })
}
// 关联关系保存
export function save_data_query (data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/save`,
    method: 'post',
    data
  })
}