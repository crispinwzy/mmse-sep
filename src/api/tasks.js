import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/sep/tasks',
    method: 'get',
    params: query
  })
}

export function createTask(data) {
  return request({
    url: '/sep/tasks',
    method: 'post',
    data
  })
}

export function updateTask(data) {
  return request({
    url: '/sep/tasks',
    method: 'put',
    data
  })
}
