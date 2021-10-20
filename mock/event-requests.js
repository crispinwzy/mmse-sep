const Mock = require('mockjs')

const List = []
const count = 18

// const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
// const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    startDate: +Mock.Random.date('T'),
    endDate: +Mock.Random.date('T'),
    client: {
      name: '@first',
      email: '@email',
      phoneNumber: '@integer(111111111, 999999999)'
    },
    eventType: '@string(5, 8)',
    expectedAttendeeNumber: '@integer(10, 500)',
    preferences: {
      decorations: '@boolean',
      parties: '@boolean',
      photos_filming: '@boolean',
      meal: '@boolean',
      drinks: '@boolean'
    },
    expectedBudget: '@integer(10000, 200000)',
    'status|1': ['pending', 'approved_by_SCS', 'approved_by_FM', 'approved', 'rejected']
  }))
}

module.exports = [
  {
    url: '/sep/event-requests',
    type: 'get',
    response: config => {
      const { client, page = 1, limit = 20, sort } = config.query

      let mockList = List.filter(item => {
        if (client && item.client.name !== client) return false
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
    url: '/sep/event-requests/detail',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const event of List) {
        if (event.id === +id) {
          return {
            code: 20000,
            data: event
          }
        }
      }
    }
  },

  {
    url: '/sep/event-requests/create',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/sep/event-requests/update',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]

