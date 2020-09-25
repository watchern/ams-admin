import request from '@/utils/request'

const baseURL = 'etlscheduler'
// 分页
export function listByPage(data) {
  return request({
    baseURL: baseURL,
    url: `/processDefinition/pageList`,
    method: 'post',
    data
  })
}

// 根据流程id查找
export function getById(id) {
  return request({
    baseURL: baseURL,
    url: `/processDefinition/getById/${id}`,
    method: 'get'
  })
}
// 添加对象
export function save(data) {
  return request({
    baseURL: baseURL,
    url: '/processDefinition/save',
    method: 'post',
    data
  })
}
// 删除对象
export function del(ids) {
  return request({
    baseURL: baseURL,
    url: `/processDefinition/delete/${ids}`,
    method: 'delete'
  })
}
// 修改对象
export function update(data) {
  return request({
    baseURL: baseURL,
    url: '/processDefinition/update',
    method: 'put',
    data
  })
}

// 数据源列表获取
export function datasourceList(data) {
  return request({
    baseURL: baseURL,
    url: '/datasources/list',
    method: 'post',
    data
  })
}
