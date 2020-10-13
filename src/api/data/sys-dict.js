import request from '@/utils/request'

const baseURL = '/amsdata'
const controller = 'sysDict';

export function cacheDict() {
  return request({
    baseURL: baseURL,
    url: `/${controller}/cacheAll`,
    method: 'get'
  })
}


