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
  let obj = {
    baseURL: baseURL,
    url: '/graphCt/pageList',
    method: 'post',
    data// RequestBody类型参数
  }
  if (typeof param !== "undefined") {
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
    params: data
  })
}

/**
 * 获取可导出的图形列表
 */
export function getExportGrapgListByType(data, param) {
    let obj = {
        baseURL: baseURL,
        url: '/graphCt/exportPageList',
        method: 'post',
        data// RequestBody类型参数
    }
    if (typeof param !== "undefined") {
        obj.params = param// RequestParam类型参数
    }
    return request(obj)
}

/**
 * 导出图形文件
 */
export function exportGraphXml(data){
    return request({
        baseURL: baseURL,
        url: '/graphCt/exportGraphXml',
        method: 'post',
        params:data
    })
}

/**
 * 导入图形XML文件
 */
export function importGraphXml(formData) {
    return request({
        baseURL: baseURL,
        url: '/graphCt/importGraphXml',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 删除图形执行缓冲表的数据
 */
export function deleteExecuteNodes(ids) {
    return request({
        baseURL: baseURL,
        url: `/graphExecuteNode/delete/${ids}`,
        method: 'get',
    })
}


/**
 * 检测当前节点中结果表之前是否被创建过，若创建过则给删除标志为true
 */
export function checkTableName(data) {
    return request({
        baseURL: baseURL,
        url: '/graphCt/checkTableName',
        method: 'post',
        params:data,
        async: false
    })
}

/**
 * 执行节点
 */
export function executeNodeSql(data) {
    return request({
        baseURL: baseURL,
        url: '/graphCt/executeNodeSql',
        method: 'post',
        data,
    })
}

/**
 * 预览节点结果
 */
export function viewNodeData(data) {
    return request({
        baseURL: baseURL,
        url: '/graphCt/viewNodeData',
        method: 'post',
        data,
    })
}

/**
 * 检测当前数据表的数据量是否大于预设阈值
 */
export function verifyLargeData(data) {
    return request({
        baseURL: baseURL,
        url: '/graphCt/verifyLargeData',
        method: 'post',
        params:data,
    })
}

/**
 * 获取数据表字段的最大值和最小值
 */
export function getMaxMinColumn(data) {
    return request({
        baseURL: baseURL,
        url: '/graphCt/getMaxMinColumn',
        method: 'post',
        params:data,
    })
}


