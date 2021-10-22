
const tokens = {
  customer_service: {
    token: 'customer-service-token'
  },
  senior_customer_service: {
    token: 'senior-customer-service-token'
  },
  financial_manager: {
    token: 'financial-manager-token'
  },
  service_manager: {
    token: 'service-manager-token'
  },
  production_manager: {
    token: 'production-manager-token'
  },
  hr: {
    token: 'hr-token'
  },
  admin_manager: {
    token: 'admin-manager-token'
  },
  sub_team: {
    token: 'sub_team'
  }
}

const users = {
  'customer-service-token': {
    roles: ['customer_service'],
    introduction: 'I am a customer service',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Customer Service XXX'
  },
  'senior-customer-service-token': {
    roles: ['senior_customer_service'],
    introduction: 'I am a senior customer service',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Senior Customer Service XXX'
  },
  'financial-manager-token': {
    roles: ['financial_manager'],
    introduction: 'I am a financial manager',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Financial Manager XXX'
  },
  'service-manager-token': {
    roles: ['service_manager'],
    introduction: 'I am a service manager',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Service Manager XXX'
  },
  'production-manager-token': {
    roles: ['production_manager'],
    introduction: 'I am a production manager',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Production Manager XXX'
  },
  'hr-token': {
    roles: ['hr'],
    introduction: 'I am a HR',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'HR XXX'
  },
  'admin-manager-token': {
    roles: ['admin_manager'],
    introduction: 'I am a admin manager',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Admin Manager XXX'
  },
  'sub_team': {
    roles: ['sub_team'],
    introduction: 'I am a sub team',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Sub Team XXX'
  }
}

module.exports = [
  // user login
  {
    url: '/sep/user/login',
    type: 'post',
    response: config => {
      const { username } = config.body
      const token = tokens[username]

      // mock error
      if (!token) {
        return {
          code: 60204,
          message: 'Account and password are incorrect.'
        }
      }

      return {
        code: 20000,
        data: token
      }
    }
  },

  // get user info
  {
    url: '/sep/user/info\.*',
    type: 'get',
    response: config => {
      const { token } = config.query
      const info = users[token]

      // mock error
      if (!info) {
        return {
          code: 50008,
          message: 'Login failed, unable to get user details.'
        }
      }

      return {
        code: 20000,
        data: info
      }
    }
  },

  // user logout
  {
    url: '/sep/user/logout',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]
