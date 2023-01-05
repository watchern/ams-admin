import request from '@/utils/request'
// const baseURL = '/base'
const dataUrl = '/data'

// 列表查询
export function page_list_data (data) {
    return request({
        baseURL: dataUrl,
        url: '/oamDataResource/pageList',
        method: 'post',
        data

    })
}
// 新增
export function addData (data) {
    return request({
        baseURL: dataUrl,
        url: '/oamDataResource/save',
        method: 'post',
        data
    })
}
// 修改保存
export function updateData (data) {
    return request({
        baseURL: dataUrl,
        url: '/oamDataResource/update',
        method: 'put',
        data
    })
}
// 删除
export function deleteData (data) {
    return request({
        baseURL: dataUrl,
        url: '/oamDataResource/delete/' + data.oamUuid,
        method: 'delete'
    })
}
// 详情
export function getById (data) {
    return request({
        baseURL: dataUrl,
        url: '/oamDataResource/getById/' + data.oamUuid,
        method: 'GET',
        data
    })
}

/**
 * 获取获取数据校验规则树
 */
// export function getDraftTree(isShowDraft) {
export function getDraftTree () {
    return request({
        baseURL: dataUrl,
        url: '/oamDataResource/getDraftTree',
        method: 'post',
        // params: {isShowDraft: isShowDraft}
    })
}


