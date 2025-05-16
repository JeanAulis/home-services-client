Page({
  data: {
    orderId: '',
    orderDetail: null,
    loading: true,
    statusColorMap: {
      'PENDING': '#FF9800', // 待支付 - 橙色
      'PAID': '#2196F3',    // 已支付 - 蓝色
      'PROCESSING': '#9C27B0', // 处理中 - 紫色
      'COMPLETED': '#4CAF50', // 已完成 - 绿色
      'CANCELLED': '#9E9E9E'  // 已取消 - 灰色
    },
    statusTextMap: {
      'PENDING': '待支付',
      'PAID': '已支付',
      'PROCESSING': '处理中',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消'
    }
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
          // 处理日期时间显示
          const orderData = res.data.data;
          
          // 格式化创建时间
          if (orderData.createdAt) {
            orderData.orderTime = this.formatDateTime(orderData.createdAt);
          }
          
          // 格式化支付时间
          if (orderData.paymentTime) {
            orderData.formattedPaymentTime = this.formatDateTime(orderData.paymentTime);
          }
          
          // 格式化服务时间
          if (orderData.serviceTime) {
            orderData.formattedServiceTime = this.formatDateTime(orderData.serviceTime);
          }
          
          // 获取状态对应的颜色和文本
          orderData.statusColor = this.data.statusColorMap[orderData.orderStatus] || '#1296db';
          orderData.statusText = this.data.statusTextMap[orderData.orderStatus] || orderData.orderStatus;
          
          this.setData({
            orderDetail: orderData,
            loading: false
          });
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
          orderStatus: 'COMPLETED',
          statusText: '已完成',
          statusColor: '#4CAF50',
          orderAmount: 99,
          serviceName: '家庭保洁服务',
          serviceTime: '2023-06-18 09:00-11:00',
          formattedServiceTime: '2023-06-18 09:00-11:00',
          address: '广州市天河区珠江新城冼村路11号保利中环广场',
          contactName: '张先生',
          contactPhone: '13800138000',
          paymentMethod: '微信支付',
          paymentTime: '2023-06-15 14:35',
          formattedPaymentTime: '2023-06-15 14:35',
          remarks: '请带好清洁工具，谢谢'
        }
        
        this.setData({
          orderDetail: mockDetail,
          loading: false
        })
      }
    })
  },
  
  // 格式化日期时间
  formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '';
    
    // 解析日期时间字符串
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return dateTimeStr; // 如果解析失败，返回原字符串
    
    // 格式化为 YYYY-MM-DD HH:MM 格式
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
}) 