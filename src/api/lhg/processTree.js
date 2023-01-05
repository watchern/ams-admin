import request from '@/utils/request'
const baseURL = '/base'
const dataUrl = '/data'
const tableRelation = '/tableRelation'

// 列表查询
export function selectTableRelationInfo (data) {
	// console.log(data);
	return request({
		baseURL: '/data',
		url: `/tableRelation/selectTableRelationInfo`,
		method: 'post',
		data

	})
}