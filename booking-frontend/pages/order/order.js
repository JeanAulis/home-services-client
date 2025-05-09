Page({
  data: {
    userInfo: {},
    isLogin: false,
    orderList: [],
    loading: true
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
    if (this.data.isLogin) {
      this.getOrderList()
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        isLogin: true
      })
      this.getOrderList()
    } else {
      this.setData({
        userInfo: {},
        isLogin: false,
        orderList: [],
        loading: false
      })
    }
  },

  // 跳转到登录页
  goLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 获取订单列表
  getOrderList() {
    this.setData({ loading: true })
    // 这里应该是调用接口获取订单列表
    wx.request({
      url: 'http://localhost:8080/api/order/list',
      method: 'GET',
      data: {
        userNum: this.data.userInfo.userNum
      },
      success: res => {
        if (res.data.code === 200) {
          this.setData({
            orderList: res.data.data || [],
            loading: false
          })
        } else {
          this.setData({
            orderList: [],
            loading: false
          })
          wx.showToast({
            title: res.data.msg || '获取订单失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        // 模拟数据，后端接口完成后可移除
        const mockOrders = [
          {
            orderId: 'O202306150001',
            orderTime: '2023-06-15 14:30',
            orderStatus: '已完成',
            orderAmount: 99,
            serviceName: '家庭保洁服务'
          },
          {
            orderId: 'O202306100002',
            orderTime: '2023-06-10 09:15',
            orderStatus: '进行中',
            orderAmount: 150,
            serviceName: '管道疏通'
          }
        ]
        
        this.setData({
          orderList: mockOrders,
          loading: false
        })
      }
    })
  },

  // 查看订单详情
  goOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${orderId}`
    })
  }
}) 