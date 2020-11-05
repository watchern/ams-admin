import request from '@/utils/request'

const baseURL = 'etlscheduler'

// 查询所有
export function getBylist(data) {
  return request({
    baseURL: baseURL,
    url: `/fileManager/getFileTree`,
    method: 'post',
    data
  })
}

// 创建文件夹
export function createDir(data) {
  return request({
    baseURL: baseURL,
    url: `/fileManager/createDir`,
    method: 'put',
    data
  })
}

// 删除文件
export function deleteFile(data) {
  return request({
    baseURL: baseURL,
    url: `/fileManager/deleteFile`,
    method: 'put',
    data
  })
}
