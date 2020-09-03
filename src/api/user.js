import request from '@/utils/request'

const baseURL = '/r1'
export function login(data) {
  return request({
    baseURL: baseURL,
    url: '/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    baseURL: baseURL,
    url: '/userInfo',
    method: 'get',
    params: { token }
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
