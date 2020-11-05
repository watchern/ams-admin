import request from '@/utils/request'
const baseURL = 'etlscheduler'

// 分页获取资源消耗列表
export function resourceStatisticsList(data) {
  return request({
    baseURL: baseURL,
    url: `/statistics/resourceStatisticsList`,
    method: 'post',
    data
  })
}

// 上游系统文件统计
export function datafileStatisticsList() {
  return request({
    baseURL: baseURL,
    url: `/statistics/datafileStatisticsList`,
    method: 'post',
  })
}
