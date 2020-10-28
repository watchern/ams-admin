import request from '@/utils/request'

const baseURL = 'etlscheduler'
// 分页
export function listByPage(data) {
  return request({
    baseURL: baseURL,
    url: `/dataFile/pageList`,
    method: 'post',
    data
  })
}

//  根据id查找
// export function getById(id) {
//   return request({
//     baseURL: baseURL,
//     url: `/dataFile/getById/${id}`,
//     method: 'get'
//   })
// }
//  添加对象
// export function save(data) {
//   return request({
//     baseURL: baseURL,
//     url: '/dataFile/save',
//     method: 'post',
//     data
//   })
// }
//  删除对象
// export function del(ids) {
//   return request({
//     baseURL: baseURL,
//     url: `/dataFile/delete/${ids}`,
//     method: 'delete'
//   })
// }
//  修改对象
// export function update(data) {
//   return request({
//     baseURL: baseURL,
//     url: '/dataFile/update',
//     method: 'put',
//     data
//   })
// }