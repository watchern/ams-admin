import request from '@/utils/request'

const baseURL = '/data'
const controllerName = 'transRule'

export function listByPage(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/listByPage`,
    method: 'post',
    // 直接加data以json格式传递  后台用RequestBody
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

export function del(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/delete/`,
    method: 'delete',
    data
  })
}

export function getTransMap(ids) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/getTransMap/${ids}`,
    method: 'post'
  })
}

export function selectOne(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/selectOne`,
    method: 'post',
    data
  })
}

export function getTransCodeList() {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/getTransCodeList`,
    method: 'post'
  })
}

export function selectById(transId) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/selectById/${transId}`,
    method: 'get'
  })
}

export function previewSql(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/previewSql`,
    method: 'post',
    data
  })
}
//传入显示表名的sql获取真实表名的sql
export function getTrueSql(sqlContent){
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/getTrueSql`,
    method: 'post',
    params: {
      sqlContent: sqlContent
    }
  })
}

//传入真实表名的sql获取显示表名的sql
export function getShowSql(sqlContent){
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/getShowSql`,
    method: 'post',
    params: {
      sqlContent: sqlContent
    }
  })
}
//获取真实值和转码值
export function getSqlRules(sql){
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/getSqlRules`,
    method: 'post',
    params: {
      sql: sql
    }
  })
}