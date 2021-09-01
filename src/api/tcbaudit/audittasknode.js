import request from '@/utils/request'
const tcbURL = 'tcbaudit'
// 根据用户UUID获取所属项目列表
export function getProjectByMemberUUID(memberUUID) {
    return request({
        baseURL: tcbURL,
        url: `/projectMember/getProjectByMemberUUID/${memberUUID}`,
        method: 'get'
    })
}