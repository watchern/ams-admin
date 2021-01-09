import request from '@/utils/request'

const baseURL = '/base'


/**
 * 获取当前登录人下的所有项目
 */
export function getProjectByLoginUserUuid() {
    return request({
      baseURL: baseURL,
      url: '/userProjectConroller/getProjectByLoginUserUuid',
      method: 'get'
    })
}