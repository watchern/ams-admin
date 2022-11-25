import request from '@/utils/request'
const baseURL = '/base'
const amisUrl = '/amis'
const dataUrl = '/data'

const controller2 = 'tableMeta'






// 列表查询
export function page_list_data (data) {
	// console.log(data);
	return request({
		baseURL: dataUrl,
		url: '/businessSystem/pageList',
		method: 'post',
		data

	})
}
// 详情
export function getById (data) {
	return request({
		baseURL: dataUrl,
		url: '/businessSystem/getById/' + data.businessSystemUuid,
		method: 'GET',
		data
	})
}


// 新增
export function save_data (data) {
	// console.log(data);
	return request({
		baseURL: dataUrl,
		url: '/businessSystem/save',
		method: 'POST',
		data
	})
}
// 修改保存
export function update_data (data) {
	return request({
		baseURL: dataUrl,
		url: '/businessSystem/update',
		method: 'PUT',
		data
	})
}
// 删除
export function delete_data (data) {
	let ids = data.businessSystemUuid
	return request({
		baseURL: dataUrl,
		url: '/businessSystem/delete/' + ids,
		method: 'delete',
		data
	})
}


// 点击注册资产下一步
export function getListTree () {
	return request({
		baseURL: baseURL,
		url: `/${controller2}/getListTree`,
		method: 'get',
	})
}


/* 保存接口*/
export function batchSaveTable_save (data) {
	return request({
		baseURL: baseURL,
		url: `/${controller2}/batchSave`,
		method: 'post',
		data
	})
}

/* 校验文件名是否存在*/
export function checkFileName (data) {
	return request({
		baseURL: dataUrl,
		url: '/tableRelationQuery/checkFileName?fileName=' + data,
		method: 'get',
		data
	})
}
