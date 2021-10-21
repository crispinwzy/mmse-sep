const Mock = require('mockjs')

const List = []
const count = 25

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    eventId: '@integer(1, 200)',
    subject: '@sentence(4, 9)',
    description: '@sentence(6, 25)',
    assignTo: '@first',
    'priority|1': ['High', 'Medium'],
    sender: 'Jack',
    'status|1': ['pending', 'in_progress', 'done'],
    commentFromAssignee: '@sentence(6, 25)'
  }))
}

module.exports = [
  {
    url: '/sep/tasks',
    type: 'get',
    response: config => {
      const { q, page = 1, limit = 20, sort } = config.query

      let mockList = List.filter(item => {
        if (q && !item.subject.includes(q)) return false
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
    url: '/sep/tasks',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/sep/tasks',
    type: 'put',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]

