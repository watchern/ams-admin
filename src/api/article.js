import request from '@/utils/request'


const baseURL = '/vue-element-admin'
export function fetchList(query) {
  return request({
    baseURL: baseURL,
    url: '/article/list',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    baseURL: baseURL,
    url: '/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    baseURL: baseURL,
    url: '/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    baseURL: baseURL,
    url: '/article/create',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    baseURL: baseURL,
    url: '/article/update',
    method: 'post',
    data
  })
}
