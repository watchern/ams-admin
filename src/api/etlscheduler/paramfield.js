import request from '@/utils/request'

const baseURL = 'etlscheduler'
// 分页
export function findPageList(data) {
  return request({
    baseURL: baseURL,
    url: `/paramField/pageList`,
    method: 'post',
    data
  })
}

// 根据id查找
export function getById(uuid) {
  return request({
    baseURL: baseURL,
    url: `/paramField/getById/${uuid}`,
    method: 'get'
  })
}
// 添加对象
export function create(data) {
  return request({
    baseURL: baseURL,
    url: '/paramField/insert',
    method: 'post',
    data
  })
}
// 删除对象
export function deleteById(ids) {
  return request({
    baseURL: baseURL,
    url: `/paramField/delete/${ids}`,
    method: 'delete'
  })
}
// 修改对象
export function update(data) {
  return request({
    baseURL: baseURL,
    url: '/paramField/update',
    method: 'put',
    data
  })
}
