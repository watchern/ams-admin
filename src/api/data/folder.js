import request from '@/utils/request'

const baseURL = '/amsdata'
const controller = 'folder'

export function saveFolder(data) {
  return request({
    baseURL: baseURL,
    url: `/${controller}/save`,
    method: 'post',
    data
  })
}

export function updateFolder(data) {
  return request({
    baseURL: baseURL,
    url: `/${controller}/update`,
    method: 'put',
    data
  })
}

export function delFolder(ids) {
  return request({
    baseURL: baseURL,
    url: `/${controller}/delete/${ids}`,
    method: 'delete'
  })
}

