import request from '@/utils/request'
const baseURL = '/base'
const dataUrl = '/data'

const controllerName = 'loadDownApply'

// 列表查询
export function page_list_data (data) {
    //
    return request({
        baseURL: dataUrl,
        url: `/${controllerName}/pageList`,
        method: 'post',
        // params 以formData格式传递  后台用RequestParam
        // 直接加data以json格式传递  后台用RequestBody
        data
    })
}
//流程查看
export function getById (id) {
    return request({
        baseURL: dataUrl,
        url: `/${controllerName}/getById/${id}`,
        method: 'GET',
    })
}

// 添加
export function save_data (data) {
    return request({
        baseURL: dataUrl,
        url: `/${controllerName}/save`,
        method: 'POST',
        data
    })
}

//编辑
export function update_data (data) {
    return request({
        baseURL: dataUrl,
        url: `/${controllerName}/update`,
        method: 'PUT',
        data
    })
}
// 删除
export function delete_data (ids) {
    return request({
        baseURL: dataUrl,
        url: `/${controllerName}/delete/${ids}`,
        method: 'delete',
    })
}
export function batchUpdateForHandle (data) {
    return request({
        baseURL: dataUrl,
        url: `/${controllerName}/batchUpdateForHandle`,
        method: 'post',
        data
    })
}
export function batchUpdateForFinishHandle (data) {
    return request({
        baseURL: dataUrl,
        url: `/${controllerName}/batchUpdateForFinishHandle`,
        method: 'post',
        data
    })
}
export function showFile (data) {
    return request({
        baseURL: dataUrl,
        url: `/${controllerName}/showFile`,
        method: 'post',
        data
    })
}