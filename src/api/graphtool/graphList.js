import request from '@/utils/request'
const baseURL = '/graphtool'
const dataUrl = '/data'

/**
 * 获取图形树
 */
export function getGraphTrees() {
  return request({
    baseURL: baseURL,
    url: '/graphCt/getGraphTrees',
    method: 'post'
  })
}

/**
 * 点击图形树节点获取图形列表
 */
export function getGrapgListByType(data, param) {
  const obj = {
    baseURL: baseURL,
    url: '/graphCt/pageList',
    method: 'post',
    data// RequestBody类型参数
  }
  if (param) {
    obj.params = param// RequestParam类型参数
  }
  return request(obj)
}

/**
 * 根据图形UUID获取图形信息
 */
export function getGraphInfoById(id) {
  return request({
    baseURL: baseURL,
    url: `/graphCt/getById/${id}`,
    method: 'get'
  })
}

/**
 * 根据图形UUID删除图形
 * @param data 参数1：图形UUID串，以逗号分隔；参数2：图形名称串，以中文顿号分隔
 */
export function deleteGraphInfoById(data) {
  return request({
    baseURL: baseURL,
    url: `/graphCt/delete`,
    method: 'delete',
    params: data
  })
}

/**
 * 分享图形
 * @param data 参数1：图形UUID串，以逗号分隔；参数2：图形名称串，以顿号分隔
 * 参数3：被分享人员UUID串，以逗号分隔；参数4：被分享人员名称串，以顿号分隔
 */
export function shareGraph(data) {
  return request({
    baseURL: baseURL,
    url: `/graphShare/shareGraph`,
    method: 'post',
    params: data
  })
}

/**
 * 取消分享图形
 * @param data 参数1：图形UUID；参数2：图形名称
 * 参数3：被分享人员UUID串，以逗号分隔；参数4：被分享人员名称串，以顿号分隔
 */
export function cancelShareGraph(data) {
  return request({
    baseURL: baseURL,
    url: `/graphShare/cancelShareGraph`,
    method: 'post',
    params: data
  })
}

/**
 * 获取数据表列信息
 * @param tableMetaUuid 数据表ID
 * @returns {AxiosPromise}
 */
export function getTableCol(tableMetaUuid) {
  return request({
    baseURL: dataUrl,
    url: '/tableMeta/getCols',
    method: 'post',
    async: false, // 默认同步
    params: { tableMetaUuid: tableMetaUuid }
  })
}

/**
 * 图形保存
 * @param data 图形对象
 * @returns {AxiosPromise}
 */
export function saveGraphInterface(data) {
  return request({
    baseURL: baseURL,
    url: '/graphCt/save',
    method: 'post',
    data
  })
}

/**
 * 根据图形ID查询执行节点集合
 */
export function getExecuteNodeInfoPost(data) {
    return request({
        baseURL: baseURL,
        url: '/graphExecuteNode/getExecuteNodeInfo',
        method: 'post',
        params:data
    })
}

