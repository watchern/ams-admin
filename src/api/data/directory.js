import request from '@/utils/request'

const baseURL = '/data'
const controllerName = 'directory'

export function listByPage(data) {
  return request({
    baseURL: baseURL,
    url: '/bizAttr/listByPage',
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
    url: `/${controllerName}/deleteDirectory/`,
    method: 'delete',
    data
  })
}
