import request from '@/utils/request'

const baseURL = 'etlscheduler'
// 分页
export function findPageList(data) {
  return request({
    baseURL: baseURL,
    url: `/datasource/pageList`,
    method: 'post',
    data
  })
}

// 根据id查找
export function getById(uuid) {
  return request({
    baseURL: baseURL,
    url: `/datasource/getById/${uuid}`,
    method: 'get'
  })
}
// 添加对象
export function create(data) {
  return request({
    baseURL: baseURL,
    url: '/datasource/insert',
    method: 'post',
    data
  })
}
// 删除对象
export function deleteById(ids) {
  return request({
    baseURL: baseURL,
    url: `/datasource/delete/${ids}`,
    method: 'delete'
  })
}
// 修改对象
export function update(data) {
  return request({
    baseURL: baseURL,
    url: '/datasource/update',
    method: 'put',
    data
  })
}
// 测试连接
export function testConn(id) {
  return request({
    baseURL: baseURL,
    url: `/datasource/testConnection/${id}`,
    method: 'get'
  })
}

// 校验数据源名称
export function verifyDSName(name) {
  return request({
    baseURL: baseURL,
    url: `/datasource/delete/${name}`,
    method: 'get'
  })
}