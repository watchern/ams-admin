import request from '@/utils/request'

const baseURL = '/dev-api'

const Mock = require('mockjs')

const List = []
const count = 100

const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    timestamp: +Mock.Random.date('T'),
    author: '@first',
    reviewer: '@first',
    title: '@title(5, 10)',
    content_short: 'mock data',
    content: baseContent,
    forecast: '@float(0, 100, 2, 2)',
    importance: '@integer(1, 3)',
    'type|1': ['CN', 'US', 'JP', 'EU'],
    'status|1': ['published', 'draft'],
    display_time: '@datetime',
    comment_disabled: true,
    pageviews: '@integer(300, 5000)',
    image_uri,
    platforms: ['a-platform']
  }))
}

export function fetchList(query) {
  debugger
  const { importance, type, title, page = 1, limit = 20, sort } = query
  let mockList = List.filter(item => {
    if (importance && item.importance !== +importance) return false
    if (type && item.type !== type) return false
    if (title && item.title.indexOf(title) < 0) return false
    return true
  })

  if (sort === '-id') {
    mockList = mockList.reverse()
  }

  const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      })
    }, 100)
  })

  /* return request({
    baseURL: baseURL,
    url: '/vue-element-admin/article/list',
    method: 'get',
    params: query
  })*/
}

export function fetchArticle(id) {
  return request({
    baseURL: baseURL,
    url: '/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    baseURL: baseURL,
    url: '/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    baseURL: baseURL,
    url: '/article/create',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    baseURL: baseURL,
    url: '/article/update',
    method: 'post',
    data
  })
}
