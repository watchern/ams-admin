import request from '@/utils/request'

const baseURL = '/vue-element-admin'
export function searchUser(name) {
  return request({
    baseURL: baseURL,
    url: '/search/user',
    method: 'get',
    params: { name }
  })
}

export function transactionList(query) {
  return request({
    baseURL: baseURL,
    url: '/transaction/list',
    method: 'get',
    params: query
  })
}
