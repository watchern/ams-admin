import request from '@/utils/request'
const baseUrl = '/data'

export function insertPersonalSpaceManage(data) {
    return request({
        baseURL: baseUrl,
        url: '/personalSpaceManage/insertPersonalSpaceManage',
        method: 'post',
        data
    })
}

// export function deletePersonalSpace(data) {
//     return request({
//         baseURL: baseUrl,
//         url: '/personalSpace/deletePersonalSpace',
//         method: 'post',
//         data
//     })
// }
//
// export function queryAllPersonalSpace(data) {
//     return request({
//         baseURL: baseUrl,
//         url: '/personalSpace/queryAllPersonalSpace',
//         method: 'post',
//         data
//     })
// }
//
// export function exportAllPersonalSpace() {
//     const url = baseUrl + '/personalSpace/exportAllPersonalSpace'
//     window.location.href = url
// }
//
// export function setPersonalSpaceSession(data) {
//     return request({
//         baseURL: baseUrl,
//         url: '/personalSpace/setPersonalSpaceSession',
//         method: 'post',
//         // params 以formData格式传递  后台用RequestParam
//         // 直接加data以json格式传递  后台用RequestBody
//         data
//     })
// }






