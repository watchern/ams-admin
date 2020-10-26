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

// 根据id查找调度详情
export function getByScheduleId(id) {
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

// 启用
export function startScheduleStatus(ids) {
  return request({
    baseURL: baseURL,
    url: `/schedules/start/${ids}`,
    method: 'put'
  })
}

// 停用
export function stopScheduleStatus(ids) {
  return request({
    baseURL: baseURL,
    url: `/schedules/stop/${ids}`,
    method: 'put'
  })
}

// 查询参数
export function getParamsByProcessId(id) {
  return request({
    baseURL: baseURL,
    url: `/schedules/getParamsByProcessId/${id}`,
    method: 'get'
  })
}

// 查询调度任务名称
export function getScheduleList() {
  return request({
    baseURL: baseURL,
    url: `/schedules/list`,
    method: 'get'
  })
}

// 查询所有任务环节
export function getTaskLink(id) {
  return request({
    baseURL: baseURL,
    url: `/schedules/findTasks/${id}`,
    method: 'get'
  })
}

// 复制对象
export function copy(id) {
  return request({
    baseURL: baseURL,
    url: `/schedules/copy/${id}`,
    method: 'get'
  })
}
// 根据流程模糊查询
export function queryProcessLike() {
  return request({
    baseURL: baseURL,
    url: `/schedules/findProcessBySchedulId`,
    method: 'get'
  })
}
