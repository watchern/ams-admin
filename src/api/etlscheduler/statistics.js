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
export function datafileStatisticsList(data) {
  return request({
    baseURL: baseURL,
    url: `/statistics/datafileStatisticsList`,
    method: 'post',
    data
  })
}

// 数据表详情
export function datafileStatisticsListBySys(data) {
  return request({
    baseURL: baseURL,
    url: `/statistics/datafileStatisticsListBySys`,
    method: 'post',
    data
  })
}
