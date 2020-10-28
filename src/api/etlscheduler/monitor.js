import request from '@/utils/request'
const baseURL = 'etlscheduler'

export function monitorList() {
  return request({
    baseURL: baseURL,
    url: `/monitor/master/list`,
    method: 'get'
  })
}

export function workerList() {
  return request({
    baseURL: baseURL,
    url: `/monitor/worker/list`,
    method: 'get'
  })
}

export function zookeeperList() {
  return request({
    baseURL: baseURL,
    url: `/monitor/zookeeper/list`,
    method: 'get'
  })
}

export function getDatabase() {
  return request({
    baseURL: baseURL,
    url: `/monitor/database`,
    method: 'get'
  })
}