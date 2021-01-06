import request from '@/utils/request'

const baseURL = '/data'
const controllerName = 'calFormula'

export function listByPage(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/pageList`,
    method: 'post',
    // params 以formData格式传递  后台用RequestParam
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

export function del(ids) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/delete/${ids}`,
    method: 'delete'
  })
}

export function wideTableSQL() {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/wideTableSQL`,
    method: 'get'
  })
}

export function generateIndexSQL() {
  return request({
    baseURL: '/analysis',
    url: '/modelController/generateIndexSQL',
    method: 'get'
  })
}
