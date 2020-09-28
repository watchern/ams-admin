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

// 项目名获取流程
export function getProcList(projectName) {
  return request({
    baseURL: baseURL,
    url: `/processDefinition/${projectName}/list`,
    method: 'get'
  })
}

// 根据包名查找包里所有的类
export function findClassesByPackage() {
  return request({
    baseURL: baseURL,
    url: '/processDefinition/findClassesByPackage',
    method: 'get'
  })
}

// 根据类名和方法名查找方法里所有的参数
export function findParams(className) {
  return request({
    baseURL: baseURL,
    url: `/processDefinition/getParams/${className}`,
    method: 'get'
  })
}
