import request from '@/utils/request'

const baseURL = 'etlscheduler'
// 分页
export function findDSPageList(nowpage, pagesize, data) {
  return request({
    baseURL: baseURL,
    // url: '/datasource/pageList/' + nowpage + '/' + pagesize,
    url: `/datasource/pageList/${nowpage}/${pagesize}`,
    method: 'post',
    data
  })
}

// 根据id查找
export function getDSById(uuid) {
  return request({
    baseURL: baseURL,
    url: `/datasource/getByUuid/${uuid}`,
    method: 'get'
  })
}
// 添加对象
export function createDs(data) {
  return request({
    baseURL: baseURL,
    url: '/datasource/insert',
    method: 'post',
    data
  })
}
// 删除对象
export function deleteDs(ids) {
  return request({
    baseURL: baseURL,
    url: `/datasource/delete/${ids}`,
    method: 'delete'
  })
}
// 修改对象
export function updateDs(data) {
  return request({
    baseURL: baseURL,
    url: '/datasource/update',
    method: 'put',
    data
  })
}
// 测试连接
export function testConn(id) {
  return request({
    baseURL: baseURL,
    url: `/datasource/testConnection/${id}`,
    method: 'get'
  })
}
