/* eslint-disable no-undef */
import request from '@/utils/request'

const baseURL = '/data'
const baseURL2 = '/nlp'

const controller2 = 'tableMeta'
const BusinessSystem = 'businessSystem'


/* 元数据操作*/
export function listUnCached (requestType, pid, tableName, schemaName, dataSource) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/listUnCached`,
    method: 'get',
    params: {
      requestType: requestType,
      pid: pid,
      tableName: tableName,
      schemaName: schemaName,
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
export function getBusinessSystemTree (isShowTable, dataSource, onlyShowPublic,loadLeftTreeType) {
  return request({
    baseURL: baseURL,
    url: `/${BusinessSystem}/getBusinessSystemTree`,
    method: 'post',
    params: {
      isShowTable: isShowTable,//是否显示表
      dataSource: dataSource,//数据源
      onlyShowPublic: onlyShowPublic,//数据表注册左侧树传参true,数据资源目录左侧树传参false
      loadLeftTreeType: loadLeftTreeType,// 区分不同模块，sql编辑器需要获取用户权限范围内表
    }
  })
}
// 主题
export function getThemeTree (isShowTable, dataSource, onlyShowPublic,loadLeftTreeType) {
  return request({
    baseURL: baseURL,
    url: `/${BusinessSystem}/getThemeTree`,
    method: 'post',
    params: {
      isShowTable: isShowTable,//是否显示表
      dataSource: dataSource,//数据源
      onlyShowPublic: onlyShowPublic,//数据表注册左侧树传参true,数据资源目录左侧树传参false
      loadLeftTreeType: loadLeftTreeType,// 区分不同模块，sql编辑器需要获取用户权限范围内表
    }
  })
}
// 数据分层
export function getLayeredTree (isShowTable, dataSource, onlyShowPublic,loadLeftTreeType) {
  return request({
    baseURL: baseURL,
    url: `/${BusinessSystem}/getLayeredTree`,
    method: 'post',
    params: {
      isShowTable: isShowTable,//是否显示表
      dataSource: dataSource,//数据源
      onlyShowPublic: onlyShowPublic,//数据表注册左侧树传参true,数据资源目录左侧树传参false
      loadLeftTreeType: loadLeftTreeType,// 区分不同模块，sql编辑器需要获取用户权限范围内表
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

export function getResByRole2 (roleUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controller3}/getResByRole2/${roleUuid}`,
    method: 'get'
  })
}

export function getRoleCols (roleUuid, tableUuid, businessType) {
  return request({
    baseURL: baseURL,
    url: `/${controller3}/getRoleCols`,
    method: 'post',
    data: {
      roleUuid: roleUuid,
      tableMetaUuid: tableUuid,
      businessType: businessType
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

export function saveRoleTable2 (roleUuid, treeNodeSelectedObj) {
  return request({
    baseURL: baseURL,
    url: `/${controller3}/save2`,
    method: 'post',
    data: {
      roleUuid: roleUuid,
      treeNodeSelectedObj: treeNodeSelectedObj
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
export function createSql (data) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/createSql`,
    method: 'post',
    data
  })
}

export function getTableZipperList (tableMetaUuid) {
  return request({
    baseURL: baseURL,
    url: '/tableZipper/selectZipperList',
    method: 'post',
    params: { tableMetaUuid: tableMetaUuid }
  })
}

// 选择从表字段数据
export function cong_table_list_data (tableMetaUuid) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/getColsInfo`,
    method: 'post',
    params: { tableMetaUuid: tableMetaUuid }
  })
}

// 查询模式名
export function listSchemas (dataSource) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/listSchemas`,
    method: 'get',
    params: { dataSource: dataSource }
  })
}

// 获取标签分类树
export function getLabelTree () {
  return request({
    baseURL: baseURL2,
    url: `/nlp/nlpLabelLibrary/findLabelTree`,
    method: 'get',
  })
}

// 获取标签列表（分页）
export function getLabelList(labelLibraryId, pageNo, pageSize, labelName) {
  return request({
    baseURL: baseURL2,
    url: `/nlp/nlpLabelLibrary/findLabelList`,
    params: { labelLibraryId: labelLibraryId, pageNo: pageNo, pageSize: pageSize,labelLibraryName: labelName},
    method: 'get',
  })
}

// 下载数据资源模版
export function downTemplateDictionary() {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/exportTableFile`,
    responseType: "blob",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded", // 请求的数据类型为form data格式
    },
    method: 'post',
  })
}

// 下载汉化信息模版
export function downTemplateCN(data) {
  return request({
    baseURL: baseURL,
    url: `/${controller2}/exportFile`,
    responseType: "blob",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded", // 请求的数据类型为form data格式
    },
    method: 'post',
    data
  })
}

// 下载表关系模版
export function downTemplateTable() {
  return request({
    baseURL: baseURL,
    url: `/tableRelation/exportFile`,
    responseType: "blob",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded", // 请求的数据类型为form data格式
    },
    method: 'post',
  })
}

export function moveFolder4Authority(tableMetaUuid, tableDataSource) {
  return request({
    baseURL: baseURL,
    url: `/roleTable/moveFolder4Authority`,
    params: {tableMetaUuid: tableMetaUuid, tableDataSource: tableDataSource},
    method: 'get',
  })
}

export function delByTableMetaUuid(tableMetaUuid, tableDataSource) {
  return request({
    baseURL: baseURL,
    url: `/roleTable/delByTableMetaUuid`,
    params: {tableMetaUuid: tableMetaUuid, tableDataSource: tableDataSource},
    method: 'get',
  })
}

export function getPersonLiableByTableMetaUuid(data){
  return request({
    baseURL: baseURL,
    url: `/personLiable/getPersonLiableByTableMetaUuid`,
    method: 'post',
    data
  })
}

//获取血缘关系图数据
export function getDataConsanguinity(sql) {
  return request({
    baseURL: baseURL,
    url: `/tableMeta/transferToJson`,
    params: {
      content: sql
    },
    method: 'get',
  })
}