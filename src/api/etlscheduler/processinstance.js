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
export function skipTask(data) {
  return request({
    baseURL: baseURL,
    url: '/processInstance/skipTask',
    method: 'put',
    data
  })
}

// 修改流程状态
export function execute(ids, executeType) {
  return request({
    baseURL: baseURL,
    url: `/processInstance/execute/${ids}/${executeType}`,
    method: 'post'
  })
}

// 查询所有任务环节
export function getTaskLink(id) {
  return request({
    baseURL: baseURL,
    url: `/processInstance/findTasks/${id}`,
    method: 'get'
  })
}

// 根据流程实例查询任务环节日志
export function findTaskLogs(id) {
  return request({
    baseURL: baseURL,
    url: `/processInstance/findTaskLogs/${id}`,
    method: 'get'
  })
}

// 根据流程实例查询非任务环节日志
export function findPrepLogs(id) {
  return request({
    baseURL: baseURL,
    url: `/processInstance/findPrepLogs/${id}`,
    method: 'get'
  })
}

// 查询任务实例
export function findTaskInstanceById(id) {
  return request({
    baseURL: baseURL,
    url: `/processInstance/findTaskInstanceById/${id}`,
    method: 'get'
  })
}
