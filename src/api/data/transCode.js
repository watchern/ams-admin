import request from '@/utils/request'

const baseURL = '/amsdata'
const controllerName = 'transRule'

export function listByPage(data) {
  return request({
    baseURL: baseURL,
    url: '/transRule/listByPage',
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
  debugger
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

export function selectCodeAll(data) {
  return request({
    baseURL: baseURL,
    url: '/transRule/listByPage',
    method: 'post',
    // 直接加data以json格式传递  后台用RequestBody
    data
  })
}

export function selectById(transId) {
  return request({
    baseURL: baseURL,
    url: `/transRule/selectById/${transId}`,
    method: 'get'
  })
}
