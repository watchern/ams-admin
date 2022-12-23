import request from '@/utils/request'
const analysisUrl = '/analysis'

export function insertPersonalSpace(data) {
    return request({
        baseURL: analysisUrl,
        url: '/personalSpace/insertPersonalSpace',
        method: 'post',
        data
    })
}

export function deletePersonalSpace(data) {
    return request({
        baseURL: analysisUrl,
        url: '/personalSpace/deletePersonalSpace',
        method: 'post',
        data
    })
}

export function queryAllPersonalSpace(data) {
    return request({
        baseURL: analysisUrl,
        url: '/personalSpace/queryAllPersonalSpace',
        method: 'post',
        data
    })
}

export function exportAllPersonalSpace() {
    const url = analysisUrl + '/personalSpace/exportAllPersonalSpace'
    window.location.href = url
}

export function setPersonalSpaceSession(data) {
    return request({
        baseURL: analysisUrl,
        url: '/personalSpace/setPersonalSpaceSession',
        method: 'post',
        // params 以formData格式传递  后台用RequestParam
        // 直接加data以json格式传递  后台用RequestBody
        data
    })
}

export function updatePersonalSpace(data){
    return request ({
        baseURL: analysisUrl,
        url: '/personalSpace/updatePersonalSpace',
        method: 'post',
        data
    })
}

export function batchUpdateForHandle(data){
    return request ({
        baseURL: analysisUrl,
        url: '/personalSpace/batchUpdateForHandle',
        method: 'post',
        data
    })
}

export function batchUpdateForFinishHandle(data){
    return request ({
        baseURL: analysisUrl,
        url: '/personalSpace/batchUpdateForFinishHandle',
        method: 'post',
        data
    })
}

export function queryByPersonalSpaceUuid(data){
    return request ({
        baseURL: analysisUrl,
        url: '/personalSpace/queryByPersonalSpaceUuid',
        method: 'get',
        params: {personalSpaceUuid: data}
    })
}


