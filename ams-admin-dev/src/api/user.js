import request from '@/utils/request'

const baseURL = '/base'
export function login(data) {
  return request({
    baseURL: baseURL,
    url: '/login',
    method: 'post',
    data
  })
}
export function repass(data) {
  return request({
    baseURL: baseURL,
    url: '/updatePassword',
    method: 'post',
    data
  })
}
export function getInfo() {
  return request({
    baseURL: baseURL,
    url: '/userInfo',
    method: 'get',
    params: { }
  })
}
export function getUserRes() {
  return request({
    baseURL: baseURL,
    url: '/menu/index',
    method: 'post'
  })
}
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}
