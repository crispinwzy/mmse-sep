import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/sep/financial-requests',
    method: 'get',
    params: query
  })
}

export function create(data) {
  return request({
    url: '/sep/financial-requests',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/sep/financial-requests',
    method: 'put',
    data
  })
}
