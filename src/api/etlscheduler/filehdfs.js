import request from '@/utils/request'

const baseURL = 'etlscheduler'

// 查询所有
export function getBylist(data) {
  return request({
    baseURL: baseURL,
    url: `/fileHdfs/getFileTree`,
    method: 'post',
    data
  })
}

