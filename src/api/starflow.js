import request from '@/utils/request'

export function auditDataList(data) {
  return request({
    url: '/applyMes/sf/apply/auditDataList',
    method: 'get',
    params: data
  })
}

export function updateToAccepted(data) {
  return request({
    // url: '/starflow/applyMes/sf/apply/updateToAccepted',
    url: '/applyMes/sf/apply/updateToAccepted',
    method: 'post',
    data
  })
}

export function submitToPerson(data) {
  return request({
    url: '/applyMes/sf/apply/submitToPerson',
    method: 'post',
    data
  })
}

export function selectPerson4Data(data) {
  return request({
    url: '/applyMes/sf/apply/selectPerson4Data',
    method: 'post',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/vue-element-admin/role/${id}`,
    method: 'delete'
  })
}

//根据审批单id去查询流程进度
export function viewProcessWithApplyUuid(data) {
  return request({
    url: '/applyMes/sf/apply/viewProcessWithApplyUuid',
    method: 'get',
    params: data
  })
}
//根据业务id去查询流程进度
export function viewProcessWithAppDataUuid(data) {
  return request({
    url: '/applyMes/sf/apply/viewProcessWithAppDataUuid',
    method: 'get',
    params: data
  })
}

export function selectInitDetail(data,url) {
  return request({
    url: url,
    method: 'post',
    data
  })
}
