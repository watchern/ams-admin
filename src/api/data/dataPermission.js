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

const controllerName2 = 'operatePermissionApply'

export function queryAllOperatePermissionApply(data) {
    return request({
        baseURL: baseURL,
        url: `/${controllerName2}/queryAllOperatePermissionApply`,
        method: 'post',
        data
    })
}


export function insertOperatePermissionApply(data) {
    return request({
        baseURL: baseURL,
        url: `/${controllerName2}/insertOperatePermissionApply`,
        method: 'post',
        data
    })
}

export function deleteOperatePermissionApply(data) {
    return request({
        baseURL: baseURL,
        url: `/${controllerName2}/deleteOperatePermissionApply`,
        method: 'post',
        data
    })
}

export function getDefaultPersonId(data) {
    return request({
        baseURL: baseURL,
        url: `/${controllerName2}/getDefaultPersonId`,
        method: 'get',
        params: {operatePermissionApplyUuid: data}
    })
}

export function updateForHandle(data) {
    return request({
        baseURL: baseURL,
        url: `/${controllerName2}/updateForHandle`,
        method: 'post',
        data
    })
}

export function updateForFinishHandle(data) {
    return request({
        baseURL: baseURL,
        url: `/${controllerName2}/updateForFinishHandle`,
        method: 'post',
        data
    })
}

export function updateForBackApplicationHandle(data) {
    return request({
        baseURL: baseURL,
        url: `/${controllerName2}/updateForBackApplicationHandle`,
        method: 'post',
        data
    })
}

export function queryByOperatePermissionApplyUuid(data) {
    return request({
        baseURL: baseURL,
        url: `/${controllerName2}/queryByOperatePermissionApplyUuid`,
        method: 'get',
        params: data
    })
}

export function getDataSetAndUsersByApplyUuid(data) {
    return request({
        baseURL: baseURL,
        url: `/${controllerName2}/getDataSetAndUsersByApplyUuid`,
        method: 'get',
        params: {operatePermissionApplyUuid: data}
    })
}

export function updateOperatePermissionApply(data){
    return request({
        baseURL: baseURL,
        url: `/${controllerName2}/updateOperatePermissionApply`,
        method: 'post',
        data
    })
}