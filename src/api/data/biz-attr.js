import request from '@/utils/request'

const baseURL = '/amsdata'
const controllerName = 'bizAttr'

export function listByPage(data) {
  return request({
    baseURL: baseURL,
    url: '/bizAttr/listByPage',
    method: 'post',
    //params 以formData格式传递  后台用RequestParam
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
