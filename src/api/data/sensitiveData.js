import request from '@/utils/request'

const baseURL = '/data'
const sensitiveName = 'sensitive'

export function getList(data) {
  return request({
    baseURL: baseURL,
    url: `/${sensitiveName}/list`,
    method: 'post',
    data
  })
}

export function save(data) {
  return request({
    baseURL: baseURL,
    url: `/${sensitiveName}/save`,
    method: 'post',
    data
  })
}

export function updateSensitive(data) {
  return request({
    baseURL: baseURL,
    url: `/${sensitiveName}/update`,
    method: 'put',
    data
  })
}

export function deleteSensitive(ids) {
  return request({
    baseURL: baseURL,
    url: `/${sensitiveName}/delete/${ids}`,
    method: 'delete'
  })
}

export function getById(id) {
  return request({
    baseURL: baseURL,
    url: `/${sensitiveName}/getById/${id}`,
    method: 'get'
  })
}
