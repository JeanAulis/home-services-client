Page({
  data: {
    orderId: '',
    orderDetail: null,
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        orderId: options.id
      })
      this.getOrderDetail(options.id)
    }
  },

  // 获取订单详情
  getOrderDetail(orderId) {
    this.setData({ loading: true })
    
    wx.request({
      url: `http://localhost:8080/api/order/detail`,
      method: 'GET',
      data: {
        orderId: orderId
      },
      success: res => {
        if (res.data.code === 200) {
          this.setData({
            orderDetail: res.data.data,
            loading: false
          })
        } else {
          wx.showToast({
            title: res.data.msg || '获取订单详情失败',
            icon: 'none'
          })
          this.setData({ loading: false })
        }
      },
      fail: () => {
        // 模拟数据
        const mockDetail = {
          orderId: orderId,
          orderTime: '2023-06-15 14:30',
          orderStatus: '已完成',
          orderAmount: 99,
          serviceName: '家庭保洁服务',
          serviceTime: '2023-06-18 09:00-11:00',
          address: '广州市天河区珠江新城冼村路11号保利中环广场',
          contactName: '张先生',
          contactPhone: '13800138000',
          paymentMethod: '微信支付',
          paymentTime: '2023-06-15 14:35',
          remarks: '请带好清洁工具，谢谢'
        }
        
        this.setData({
          orderDetail: mockDetail,
          loading: false
        })
      }
    })
  }
}) 