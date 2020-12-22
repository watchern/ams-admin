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

/**
 * 添加处理意见等信息
 * @param  data 关联任务
 */
export function addOrUpdate(data) {
  return request({
    baseURL: analysisUrl,
    url: '/modelResultHandle/addOrUpdate',
    method: 'post',
    data
  })
}

/**
 * 修改运行任务关联
 * @param data 要修改的对象
 * @returns {AxiosPromise}
 */
export function updateRunTaskRel(data){
  return request({
    baseURL: analysisUrl,
    url: '/RunTaskRelController/updateRunTaskRel',
    method: 'put',
    data
  })
}
