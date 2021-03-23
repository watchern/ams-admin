<<<<<<< HEAD
import request from '../utils/request'
=======
import request from '@/utils/request'
>>>>>>> f50f6d123e4736d2ced8b9459fadb87b9ff7a95d

const baseURL = '/base'
export function login(data) {
  return request({
    baseURL: baseURL,
    url: '/login',
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
