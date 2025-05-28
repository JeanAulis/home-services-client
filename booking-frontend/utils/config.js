// API配置文件
const config = {
  // 后端API基础URL - 根据后端密码迁移升级，端口从8080改为8024
  baseUrl: 'http://14.103.141.73:8024',
  
  // API接口路径
  api: {
    // 用户相关接口
    user: {
      login: '/api/user/login',
      register: '/api/user/register'
    },
    // 订单相关接口
    order: {
      list: '/api/order/list',
      detail: '/api/order/detail'
    },
    // 地址相关接口
    address: {
      list: '/api/address/list',
      add: '/api/address/add',
      update: '/api/address/update',
      delete: '/api/address/delete',
      setDefault: '/api/address/set-default',
      get: '/api/address/get'
    }
  }
}

// 获取完整的API URL
const getApiUrl = (path) => {
  return config.baseUrl + path
}

module.exports = {
  config,
  getApiUrl
}