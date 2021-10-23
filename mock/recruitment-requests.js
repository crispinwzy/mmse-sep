const Mock = require('mockjs')

const List = []
const count = 8

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    'contactType|1': ['Full-time', 'Part-time'],
    'requestingDept|1': ['Administration', 'Services', 'Production', 'Financial'],
    experience: '@integer(1,4)',
    jobTitle: '@title(1, 3)',
    jobDesc: '@paragraph(1, 3)',
    'status|1': ['pending', 'approved', 'rejected']
  }))
}

module.exports = [
  {
    url: '/sep/recruitment-requests',
    type: 'get',
    response: config => {
      const { q, page = 1, limit = 20, sort } = config.query

      let mockList = List.filter(item => {
        if (q && !item.jobTitle.includes(q)) return false
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
    url: '/sep/recruitment-requests',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/sep/recruitment-requests',
    type: 'put',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]

