import request from '@/utils/request'
const baseURL = 'etlscheduler'

// 获取master Server列表
export function monitorList() {
  return request({
    baseURL: baseURL,
    url: `/monitor/master/list`,
    method: 'get'
  })
}

// 获取worker Server列表
export function workerList() {
  return request({
    baseURL: baseURL,
    url: `/monitor/worker/list`,
    method: 'get'
  })
}

// 获取zookeeperList列表
export function zookeeperList() {
  return request({
    baseURL: baseURL,
    url: `/monitor/zookeeper/list`,
    method: 'get'
  })
}

// 获取database列表
export function getDatabase() {
  return request({
    baseURL: baseURL,
    url: `/monitor/database`,
    method: 'get'
  })
}
