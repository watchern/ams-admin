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
