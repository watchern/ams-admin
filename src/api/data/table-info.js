/* eslint-disable no-undef */
import request from '@/utils/request'

const baseURL = '/data'

const controller2 = 'tableMeta'
const BusinessSystem = 'businessSystem'


/* 元数据操作*/
export function listUnCached (requestType, pid, tableName, dataSource) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/listUnCached`,
    method: 'get',
    params: {
      requestType: requestType,
      pid: pid,
      tableName: tableName,
      dataSource: dataSource,
    }
  })
}
// tree end···············
// 目录
// export function getDataTreeNode (pid, dataSource) {
//   return request({
//     baseURL: baseURL,
//     url: `/${controller2}/getDataTreeNode`,
//     method: 'post',
//     // data,
//     params: {
//       pid: pid,//是否显示表
//       dataSource: dataSource,//数据源
//     }
//   })
// }
export function getDataTreeNode (dataSource) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/getPublicDataTree`,
    method: 'post',
    // data,
    params: {
      // pid: pid,//是否显示表
      dataSource: dataSource,//数据源
    }
  })
}


// 系统
export function getBusinessSystemTree (isShowTable, dataSource, onlyShowPublic) {
  return request({
    baseURL: baseURL,
    url: `/${BusinessSystem}/getBusinessSystemTree`,
    method: 'post',
    params: {
      isShowTable: isShowTable,//是否显示表
      dataSource: dataSource,//数据源
      onlyShowPublic: onlyShowPublic,//数据表注册左侧树传参true,数据资源目录左侧树传参false
    }
  })
}
// 主题
export function getThemeTree (isShowTable, dataSource, onlyShowPublic) {
  return request({
    baseURL: baseURL,
    url: `/${BusinessSystem}/getThemeTree`,
    method: 'post',
    params: {
      isShowTable: isShowTable,//是否显示表
      dataSource: dataSource,//数据源
      onlyShowPublic: onlyShowPublic,//数据表注册左侧树传参true,数据资源目录左侧树传参false
    }
  })
}
// 数据分层
export function getLayeredTree (isShowTable, dataSource, onlyShowPublic) {
  return request({
    baseURL: baseURL,
    url: `/${BusinessSystem}/getLayeredTree`,
    method: 'post',
    params: {
      isShowTable: isShowTable,//是否显示表
      dataSource: dataSource,//数据源
      onlyShowPublic: onlyShowPublic,//数据表注册左侧树传参true,数据资源目录左侧树传参false
    }
  })
}



// 列表
export function listByTreePage (data) {
  return request({
    baseURL: baseURL,
    url: `/tableMeta/listByTreePage`,
    method: 'post',
    data
  })
}

// etl获取数据资产信息
export function getEtlInfoByTableId (tableMetaUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/getEtlInfoByTableId`,
    method: 'get',
    params: { tableMetaUuid: tableMetaUuid }
  })
}



// tree end···············


/* 缓存数据操作*/
export function saveTable (data) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/save`,
    method: 'post',
    data
  })
}
/* 批量缓存数据操作*/
export function batchSaveTable (data) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/batchSave`,
    method: 'post',
    data
  })
}
export function saveTableInfo (data) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/saveTableInfo`,
    method: 'post',
    data
  })
}
export function updateTable (data) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/update`,
    method: 'put',
    data
  })
}
export function judgeName (tableName) {
  return request({
    baseURL: baseURL,
    url: `/validateTableName`,
    method: 'get',
    params: { tableName: tableName }
  })
}
export function delTable (ids) {
  var param = ids.split('>')
  return request({
    baseURL: baseURL,
    url: `/${controller2}/delete/${param[0]}/${param[1]}`,
    method: 'delete'
  })
}

export function getResELTree (data) {

  if (!data) data = { dataUserId: '', sceneCode: '' }
  if (!data.type) data.type = 'common'
  return request({
    baseURL: baseURL,
    url: `/${controller2}/getResELTree`,
    method: 'get',
    params: data
  })
}
/**
 * 获取数据表列
 * @param data
 * @returns {AxiosPromise}
 */
export function getTableCol (tableMetaUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/getCols`,
    method: 'post',
    params: { tableMetaUuid: tableMetaUuid, isEnclose: '' }
  })
}

/**
 * 获取数据表信息
 * @param data
 * @returns {AxiosPromise}
 */
export function getTableByCol (colMetaUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/getTableByCol`,
    method: 'post',
    params: { colMetaUuid: colMetaUuid }
  })
}

/**
 * 获取关联列
 * @param data
 * @returns {AxiosPromise}
 */
export function selectRelTable (tableMetaUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/selectRelTable`,
    method: 'post',
    params: { tableMetaUuid: tableMetaUuid }
  })
}

export function saveTableCols (sql) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/saveTableCols`,
    method: 'post',
    params: { sql: sql }
  })
}

export function getTableInfo (tableMetaUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/getTableInfo`,
    method: 'post',
    params: { tableMetaUuid: tableMetaUuid }
  })
}

export function getCreateSql (tableMetaUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/getCreateSql`,
    method: 'post',
    params: { tableMetaUuid: tableMetaUuid }
  })
}

export function getBasicInfo (tableMetaUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/getBasicInfo`,
    method: 'post',
    params: { tableMetaUuid: tableMetaUuid }
  })
}

export function getColsInfo (tableMetaUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/getTableInfo`,
    method: 'post',
    params: { tableMetaUuid: tableMetaUuid }
  })
}

export function selectIndexInfo (tableMetaUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/selectIndexInfo`,
    method: 'post',
    params: { tableMetaUuid: tableMetaUuid }
  })
}

export function getSqlType () {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/getSqlType`,
    method: 'post'
  })
}

/* 角色表操作*/
const controller3 = 'roleTable'
export function getResByRole (roleUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controller3}/getResByRole/${roleUuid}`,
    method: 'get'
  })
}
export function getRoleCols (roleUuid, tableUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controller3}/getRoleCols`,
    method: 'post',
    data: {
      roleUuid: roleUuid,
      tableMetaUuid: tableUuid
    }
  })
}
export function saveRoleTable (roleUuid, rfolders, rtables, rcols) {
  return request({
    baseURL: baseURL,
    url: `/${controller3}/save`,
    method: 'post',
    data: {
      roleUuid: roleUuid,
      rfolders: rfolders,
      rtables: rtables,
      rcols: rcols
    }
  })
}

export function getAccessType () {
  return request({
    baseURL: baseURL,
    url: `/${controller3}/getAccessType`,
    method: 'get'
  })
}



// 删除表单数据
export function delete_data (data) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/delete/${param[0]}/${param[1]}`,
    method: 'delete',
    data
  })
}



// 新增功能=====

// 列信息
export function getColsInfoByTableName (data) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/getColsInfoByTableName`,
    method: 'post',
    data
  })
}

// 同步数据
export function synDataStructure (data) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/synDataStructure`,
    method: 'post',
    data
  })
}

// 修改详情保存
export function updateTableInfo (data) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/updateTableInfo`,
    method: 'post',
    data
  })
}
