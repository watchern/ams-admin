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

// 根据用户ID判断是否是管理员用户
export function isAdmin() {
  return request({
    baseURL: baseURL,
    url: '/sysRole/isAdmin',
    method: 'get'
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
// 获取系统管理员
export function getSystemRole(name) {
  return request({
    baseURL: baseURL,
    url: `/sysRole/getByName/${name}`,
    method: 'get'
  })
}
// 获取用户IP
export function getPersonIp() {
  return request({
    baseURL: baseURL,
    url: `/personController/getPersonIp`,
    method: 'get'
  })
}