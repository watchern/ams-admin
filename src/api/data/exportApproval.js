import request from '@/utils/request'

const baseURL = '/data'
const controllerName = 'exportRequest'
export function listByPage(data) {
    return request({
        baseURL: baseURL,
        url: `/${controllerName}/listByPage`,
        method: 'post',
        data
    })
}