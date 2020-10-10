import request from '@/utils/request'

const baseURL = 'etlscheduler'
// 分页
export function listByPage(data) {
  return request({
    baseURL: baseURL,
    url: `/processInstance/pageList`,
    method: 'post',
    data
  })
}

// 根据id查找
export function getById(id) {
  return request({
    baseURL: baseURL,
    url: `/processInstance/getById/${id}`,
    method: 'get'
  })
}
// 添加对象
export function save(data) {
  return request({
    baseURL: baseURL,
    url: '/processInstance/save',
    method: 'post',
    data
  })
}
// 删除对象
export function del(ids) {
  return request({
    baseURL: baseURL,
    url: `/processInstance/delete/${ids}`,
    method: 'delete'
  })
}
// 修改对象
export function update(data) {
  return request({
    baseURL: baseURL,
    url: '/processInstance/update',
    method: 'put',
    data
  })
}

// 跳过环节
export function skiptask(data) {
  return request({
    baseURL: baseURL,
    url: '/processInstance/skiptask',
    method: 'put',
    data
  })
}

// 暂停流程
export function stopInstance(ids) {
  return request({
    baseURL: baseURL,
    url: `/processInstance/stopInstance/${ids}`,
    method: 'get'
  })
}

// 启用流程
export function startInstance(ids) {
  return request({
    baseURL: baseURL,
    url: `/processInstance/startInstance/${ids}`,
    method: 'get'
  })
}
