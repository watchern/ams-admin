import request from '@/utils/request'

const baseURL = '/data'
const controllerName = 'permissionsQuery'
export function getById(id) {
    return request({
        baseURL: baseURL,
        url: `/${controllerName}/getById`,
        method: 'get'
    })
}