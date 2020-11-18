import request from '@/utils/request'
const analysisUrl = '/analysis'

export function findWarningTree() {
    return request({
      baseURL: analysisUrl,
      url: '/auditWarning/findWarningTree',
      method: 'get'
    })
  }