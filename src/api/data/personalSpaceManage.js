import request from '@/utils/request'
const baseUrl = '/data'


// export function isCanCreateTable(data) {
//     return request({
//         baseURL: baseUrl,
//         url: '/personalSpaceManage/isCanCreateTable',
//         method: 'get',
//         params:{
//             needSpaceSize:data
//         }
//     })
// }

export function getCurrentUserPersonSpace() {
    return request({
        baseURL: baseUrl,
        url: '/personalSpaceManage/getCurrentUserPersonSpace',
        method: 'get',
    })
}

export function incrementPersonalSpaceManage(data) {
    return request({
        baseURL: baseUrl,
        url: '/personalSpaceManage/incrementPersonalSpaceManage',
        method: 'post',
        data
    })
}

export function tableListPage (data) {
    return request({
        baseURL: baseUrl,
        url: `/tableMeta/listByPageForPersonSpace`,
        method: 'post',
        data
    })
}

export function deleteTableMeta (data1,data2) {
    var paramURL = '/tableMeta/delete/'+data1+'/'+data2
    console.log(paramURL,"paramURL")
    return request({
        baseURL: baseUrl,
        url: paramURL,
        method: 'delete',
    })
}

export function getListTree () {
    var paramURL = '/tableMeta/getListTree'
    return request({
        baseURL: baseUrl,
        url: paramURL,
        method: 'get',
    })
}

export function saveTableMetaInfo (data) {
    var paramURL = '/tableMeta/saveTableInfo'
    return request({
        baseURL: baseUrl,
        url: paramURL,
        method: 'post',
        data
    })
}

export function dataShare (data) {
    var paramURL = '/personalSpaceManage/dataShare'
    return request({
        baseURL: baseUrl,
        url: paramURL,
        method: 'post',
        data
    })
}

export function isCanDataShare (data) {
    var paramURL = '/personalSpaceManage/isCanDataShare'
    return request({
        baseURL: baseUrl,
        url: paramURL,
        method: 'post',
        data
    })
}









