import request from '@/utils/request'
const baseUrl = '/data'

export function insertPersonalSpace(data) {
    return request({
        baseURL: baseUrl,
        url: '/personalSpace/insertPersonalSpace',
        method: 'post',
        data
    })
}

export function deletePersonalSpace(data) {
    return request({
        baseURL: baseUrl,
        url: '/personalSpace/deletePersonalSpace',
        method: 'post',
        data
    })
}

export function queryAllPersonalSpace(data) {
    return request({
        baseURL: baseUrl,
        url: '/personalSpace/queryAllPersonalSpace',
        method: 'post',
        data
    })
}

export function exportAllPersonalSpace() {
    const url = baseUrl + '/personalSpace/exportAllPersonalSpace'
    window.location.href = url
}

export function setPersonalSpaceSession(data) {
    return request({
        baseURL: baseUrl,
        url: '/personalSpace/setPersonalSpaceSession',
        method: 'post',
        // params 以formData格式传递  后台用RequestParam
        // 直接加data以json格式传递  后台用RequestBody
        data
    })
}

export function updatePersonalSpace(data){
    return request ({
        baseURL: baseUrl,
        url: '/personalSpace/updatePersonalSpace',
        method: 'post',
        data
    })
}

export function batchUpdateForHandle(data){
    return request ({
        baseURL: baseUrl,
        url: '/personalSpace/batchUpdateForHandle',
        method: 'post',
        data
    })
}

export function batchUpdateForFinishHandle(data){
    return request ({
        baseURL: baseUrl,
        url: '/personalSpace/batchUpdateForFinishHandle',
        method: 'post',
        data
    })
}

export function queryByPersonalSpaceUuid(data){
    return request ({
        baseURL: baseUrl,
        url: '/personalSpace/queryByPersonalSpaceUuid',
        method: 'get',
        params: {personalSpaceUuid: data}
    })
}
//退回到申请人时候调用 更新业务状态为草稿
export function batchUpdateForBackApplicationHandle(data){
    return request ({
        baseURL: baseUrl,
        url: '/personalSpace/batchUpdateForBackApplicationHandle',
        method: 'post',
        data
    })
}


