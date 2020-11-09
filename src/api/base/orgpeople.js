import request from '@/utils/request'
const baseURL = '/base'

/**
 * 获取组织树
 */
export function findOrgTree() {
  return request({
    baseURL: baseURL,
    url: '/orgController/findOrgTree',
    method: 'get'
  })
}


/**
 * 根据组织uuid获取该组织下的所有人员
 */
export function findPeopleByOrgId(OrgUuid) {
  return request({
    baseURL: baseURL,
    url: '/personController/findPeopleByOrgId',
    method: 'get',
    params:{OrgUuid:OrgUuid}
  })
}
