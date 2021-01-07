import request from '@/utils/request'

const baseURL = '/data'
const controllerName = 'directory'

export function copyTable(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/copyTable`,
    method: 'post',
    data
  })
}

export function renameResource(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/renameResource`,
    method: 'post',
    data
  })
}

export function deleteDirectory(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/deleteDirectory`,
    method: 'delete',
    data
  })
}

export function movePath(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/movePath`,
    method: 'post',
    data
  })
}

export function preview(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/preview`,
    method: 'post',
    data
  })
}

export function nextUpload(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/nextUpload`,
    method: 'post',
    data
  })
}

export function importTable(data) {
  return request({
    baseURL: baseURL,
    url: `/${controllerName}/importTable`,
    method: 'post',
    data
  })
}

