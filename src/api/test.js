import request from '@/utils/request'

const baseURL = 'pmrr'
export function listData(data) {
  return request({
    baseURL: baseURL,
    url: '/usrgrp/listData',
    method: 'post',
    data
  })
}

