import request from '@/utils/request'

const baseURL = 'etlscheduler'
// 分页
export function listByPage(data) {
  return request({
    baseURL: baseURL,
    url: `/schedules/pageList`,
    method: 'post',
    data
  })
}

// 根据id查找
export function getById(id) {
  return request({
    baseURL: baseURL,
    url: `/schedules/getById/${id}`,
    method: 'get'
  })
}
// 添加对象
export function save(data) {
  return request({
    baseURL: baseURL,
    url: '/schedules/save',
    method: 'post',
    data
  })
}
// 删除对象
export function del(ids) {
  return request({
    baseURL: baseURL,
    url: `/schedules/delete/${ids}`,
    method: 'delete'
  })
}
// 修改对象
export function update(data) {
  return request({
    baseURL: baseURL,
    url: '/schedules/update',
    method: 'put',
    data
  })
}
// 查询流程名称
export function findByprocessDef(data) {
  return request({
    baseURL: baseURL,
    url: '/processDefinition/pageList',
    method: 'post',
    data
  })
}

// 启用或停用
export function updateEnableState(id) {
  return request({
    baseURL: baseURL,
    url: `/schedules/enableState/${id}`,
    method: 'put'
  })
}
