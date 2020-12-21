import request from '@/utils/request'
const analysisUrl = '/analysis'


/**
 * 模糊查询运行任务关联表分页
 * @param  data 运行任务关联表对象
 */
export function selectLikePageVoHandle(data) {
    return request({
      baseURL: analysisUrl,
      url: '/modelResultHandle/selectLikePageVoHandle',
      method: 'post',
      data:data
    })
  }

  /**
 * 根据运行结果表查询真实表
 * @param {*} data pageQuery对象
 */
export function selectTableHandle(data, filterSql) {
  return request({
    baseURL: analysisUrl,
    url: '/modelResultHandle/selectTableHandle',
    method: 'post',
    data: {basePageParam:data,filterSql:filterSql}
  })
}