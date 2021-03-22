import request from '@/utils/request'

const baseURL = '/data'
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


export function saveAsStandard() {
  return request({
    baseURL: baseURL,
    url: `/${controller}/saveAsStandard/${ids}`,
    method: 'get'
  })
}

export function compareWithStandard() {
  return request({
    baseURL: baseURL,
    url: `/${controller}/compareWithStandard/${ids}`,
    method: 'get'
  })
}

