import request from '@/utils/request'

const baseURL = '/data'
const controllerName = 'sceneFilter'
export function findOrgUserList(data) {
    return request({
        baseURL: baseURL,
        url: `/${controllerName}/findOrgUserList`,
        method: 'post',
        data
    })
}