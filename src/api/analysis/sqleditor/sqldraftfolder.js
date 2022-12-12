import request from '@/utils/request'
const analysisUrl = '/analysis'

/**
 * 新增SQL草稿文件夹
 * @param data
 * @returns {AxiosPromise}
 */
export function addDraftFolder(data) {
    return request({
        baseURL: analysisUrl,
        url: '/sqlDraftFolder/save',
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
        baseURL: analysisUrl,
        url: `/sqlDraftFolder/getById/${id}`,
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
        baseURL: analysisUrl,
        url: '/sqlDraftFolder/update',
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
        baseURL: analysisUrl,
        url: '/sqlDraftFolder/delete',
        method: 'post',
        params: {id: data}
        // params 以formData格式传递  后台用RequestParam
        // 直接加data以json格式传递  后台用RequestBody
    })
}
