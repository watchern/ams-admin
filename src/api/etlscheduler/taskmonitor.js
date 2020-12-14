import request from '@/utils/request'
const baseURL = 'etlscheduler'

// 任务实例监控
export function taskStateCount(data) {
  return request({
    baseURL: baseURL,
    url: `/monitor/task-state-count`,
    method: 'put',
    data
  })
}

// 流程实例监控
export function processStateCount(data) {
  return request({
    baseURL: baseURL,
    url: `/monitor/process-state-count`,
    method: 'put',
    data
  })
}

// 获取上游文件推送情况
export function getDataFileList() {
  return request({
    baseURL: baseURL,
    url: `/monitor/getDataFileList`,
    method: 'get'
  })
}

// 根据起始时间获取任务的耗时,历时，任务总数
export function taskMonitor(data) {
  return request({
    baseURL: baseURL,
    url: `/monitor/taskMonitor`,
    method: 'put',
    data
  })
}

// 获取任务总历时
export function takeTime() {
  return request({
    baseURL: baseURL,
    url: `/monitor/takeTime`,
    method: 'get'
  })
}
