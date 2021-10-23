const Mock = require('mockjs')

const List = []
const count = 8

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    'requestingDept|1': ['Administration', 'Services', 'Production', 'Financial'],
    eventId: '@integer(1, 20)',
    requiredAmount: '@integer(1000, 20000)',
    reason: '@paragraph(1, 3)',
    'status|1': ['pending', 'approved', 'rejected']
  }))
}

module.exports = [
  {
    url: '/sep/financial-requests',
    type: 'get',
    response: config => {
      const { q, page = 1, limit = 20, sort } = config.query

      let mockList = List.filter(item => {
        console.log(typeof item.eventId)
        if (q && !item.reason.includes(q)) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },

  {
    url: '/sep/financial-requests',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/sep/financial-requests',
    type: 'put',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]

