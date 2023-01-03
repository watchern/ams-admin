import request from '@/utils/request'
const baseURL = '/base'
const amisUrl = '/amis'
const dataUrl = '/data'

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

