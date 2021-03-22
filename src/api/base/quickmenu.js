import request from '@/utils/request'
const baseURL = '/base'

/**
 * 获取快捷菜单列表
 * @author liukunlong 2020/1/18 13:50
 */
export function getQuickMenuList() {
  return request({
    baseURL: baseURL,
    url: '/quickMenu/getList',
    method: 'get'
  })
}

/**
 * 批量增加快捷菜单
 * @author liukunlong 2020/1/18 13:55
 */
export function saveQuickMenuList(data) {
  return request({
    baseURL: baseURL,
    url: '/quickMenu/saveList',
    method: 'post',
    data
  })
}
