import request from '@/utils/request'
const dataUrl = '/data'

/**
 * 新增SQL草稿文件夹
 * @param data
 * @returns {AxiosPromise}
 */
export function addDraftFolder(data) {
    return request({
        baseURL: dataUrl,
        url: '/oamResourceTree/save',
        method: 'post',
        // params 以formData格式传递  后台用RequestParam
        // 直接加data以json格式传递  后台用RequestBody
        data
    })
}

/**
 * 根据id获取SQL草稿文件夹对象
 * @param id
 * @returns {AxiosPromise}
 */
export function getDraftFolderById(id) {
    return request({
        baseURL: dataUrl,
        url: `/oamResourceTree/getById/${id}`,
        method: 'get',
        // params 以formData格式传递  后台用RequestParam
        // 直接加data以json格式传递  后台用RequestBody
    })
}

/**
 * 修改SQL草稿文件夹对象
 * @param data
 * @returns {AxiosPromise}
 */
export function updateDraftFolder(data) {
    return request({
        baseURL: dataUrl,
        url: '/oamResourceTree/update',
        method: 'put',
        data: data
        // params 以formData格式传递  后台用RequestParam
        // 直接加data以json格式传递  后台用RequestBody
    })
}

/**
 * 删除SQL草稿文件夹对象
 * @param data
 * @returns {AxiosPromise}
 */
export function removeDraftFolder(data) {
    return request({
        baseURL: dataUrl,
        url: '/oamResourceTree/delete',
        method: 'post',
        params: {id: data}
        // params 以formData格式传递  后台用RequestParam
        // 直接加data以json格式传递  后台用RequestBody
    })
}
