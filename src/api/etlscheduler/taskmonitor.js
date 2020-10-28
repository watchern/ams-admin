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

// 获取时间范围任务的历时
export function processTakeTime(data) {
  return request({
    baseURL: baseURL,
    url: `/monitor/processTakeTime`,
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
