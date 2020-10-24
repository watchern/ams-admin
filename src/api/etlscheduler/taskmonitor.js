import request from '@/utils/request'
const baseURL = 'etlscheduler'

export function taskStateCount(data) {
  return request({
    baseURL: baseURL,
    url: `/monitor/task-state-count`,
    method: 'put',
    data
  })
}

export function processStateCount(data) {
  return request({
    baseURL: baseURL,
    url: `/monitor/process-state-count`,
    method: 'put',
    data
  })
}

export function getDataFileList() {
  return request({
    baseURL: baseURL,
    url: `/monitor/getDataFileList`,
    method: 'get'
  })
}

export function processTakeTime(data) {
  return request({
    baseURL: baseURL,
    url: `/monitor/processTakeTime`,
    method: 'put',
    data
  })
}

export function takeTime() {
  return request({
    baseURL: baseURL,
    url: `/monitor/takeTime`,
    method: 'get'
  })
}
