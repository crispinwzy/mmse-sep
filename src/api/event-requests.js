import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/sep/event-requests',
    method: 'get',
    params: query
  })
}

export function fetchEventRequest(id) {
  return request({
    url: '/sep/event-requests/detail',
    method: 'get',
    params: { id }
  })
}

export function createEventRequest(data) {
  return request({
    url: '/sep/event-requests/create',
    method: 'post',
    data
  })
}

export function updateEventRequest(data) {
  return request({
    url: '/sep/event-requests/update',
    method: 'post',
    data
  })
}
