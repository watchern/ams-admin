import request from '@/utils/request'
const baseURL = '/base'
const dataUrl = '/data'

// 列表查询
export function page_list_data (data) {
	// 
	return request({
		baseURL: dataUrl,
		url: '/tableRelationQuery/pageList',
		method: 'post',
		data

	})
}
// 详情
export function getById (id) {
	return request({
		baseURL: dataUrl,
		url: '/tableRelationQuery/getById/' + id,
		method: 'POST',
		data
	})
}

// 新增
export function save_data (data) {
	return request({
		baseURL: dataUrl,
		url: '/tableRelationQuery/save',
		method: 'POST',
		data
	})
}
// 修改保存 || 确定认权人
export function update_data (data) {
	return request({
		baseURL: dataUrl,
		url: '/tableRelationQuery/update',
		method: 'post',
		data
	})
}
// 删除
export function delete_data (data) {
	return request({
		baseURL: dataUrl,
		url: '/tableRelationQuery/delete/',
		method: 'post',
		data
	})
}

