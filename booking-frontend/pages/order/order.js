// pages/order/order.js
// 导入工具类
const app = getApp()

const { getApiUrl, config } = require('../../utils/config')

Page({
  data: {
    statusTabs: [
      {id: '', name: '全部订单'},
      {id: 'PENDING', name: '待支付'},
      {id: 'PAID', name: '已支付'},
      {id: 'PROCESSING', name: '进行中'},
      {id: 'COMPLETED', name: '已完成'}
    ],
    currentTab: '', // 默认显示全部订单
    orderList: [],
    originalOrderList: [], // 保存原始订单数据，用于搜索和筛选
    loading: true,
    isLogin: false,
    userInfo: null
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus();
  },
  
  onShow() {
    // 每次页面显示时重新获取订单列表
    if (this.data.isLogin) {
      this.getOrderList();
    }
  },
  
  // 处理导航栏搜索
  handleNavSearch(e) {
    console.log("导航栏搜索输入:", e.detail.value);
    // 在这里处理搜索逻辑
    this.onSearchOrder(e);
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    console.log("获取到的用户信息：", userInfo)
    
    if (userInfo && userInfo.userInfo && userInfo.userInfo.userNum) {
      // 直接从userInfo中获取userNum
      this.setData({
        userInfo: userInfo.userInfo,
        isLogin: true
      })
      this.getOrderList()
    } else if (userInfo && userInfo.userNum) {
      // 兼容直接将userNum存储在userInfo中的情况
      this.setData({
        userInfo: userInfo,
        isLogin: true
      })
      this.getOrderList()
    } else {
      // 如果没有找到userNum，尝试从localStorage获取
      const userNum = wx.getStorageSync('userNum')
      if (userNum) {
        const userInfoObj = userInfo || {}
        userInfoObj.userNum = userNum
        this.setData({
          userInfo: userInfoObj,
          isLogin: true
        })
        this.getOrderList()
      } else {
        // 真的没找到userNum，显示未登录状态
        console.log("没有找到用户账号，显示未登录状态")
        this.setData({
          userInfo: {},
          isLogin: false,
          orderList: [],
          originalOrderList: [],
          loading: false
        })
      }
    }
  },

  // 跳转到登录页
  goLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 跳转首页下单
  goOrder() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 获取订单列表
  getOrderList() {
    this.setData({ loading: true })
    
    // 检查userNum是否存在
    const userNum = this.data.userInfo.userNum
    console.log("当前用户账号:", userNum)
    
    if (!userNum) {
      console.log("用户账号不存在，无法获取订单")
      wx.showToast({
        title: '登录信息异常，请重新登录',
        icon: 'none'
      })
      this.setData({
        orderList: [],
        originalOrderList: [],
        loading: false
      })
      return
    }
    
    wx.request({
      url: getApiUrl(config.api.order.list),
      method: 'GET',
      data: {
        userNum: userNum
      },
      success: res => {
        console.log("订单接口返回数据:", res.data)
        
        if (res.data.code === 200) {
          const orders = res.data.data || []
          
          const formattedOrders = orders.map(order => {
            return {
              orderId: order.orderId,
              orderTime: order.createdAt ? new Date(order.createdAt).toLocaleString() : '未知时间',
              orderStatus: this.formatOrderStatus(order.orderStatus),
              orderAmount: order.orderAmount,
              serviceName: order.serviceName
            }
          })
          
          console.log("格式化后的订单数据:", formattedOrders)
          
          this.setData({
            orderList: formattedOrders,
            originalOrderList: formattedOrders, // 保存原始数据
            loading: false
          })
        } else {
          this.setData({
            orderList: [],
            originalOrderList: [],
            loading: false
          })
          wx.showToast({
            title: res.data.msg || '获取订单失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error("获取订单失败:", err)
        
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
          originalOrderList: mockOrders, // 保存原始数据
          loading: false
        })
      }
    })
  },

  // 添加状态格式化方法
  formatOrderStatus(status) {
    const statusMap = {
      'PENDING': '待支付',
      'PAID': '已支付',
      'PROCESSING': '进行中',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消'
    }
    return statusMap[status] || status
  },

  // 查看订单详情
  goOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${orderId}`
    })
  },

  // 搜索订单
  onSearchOrder(e) {
    const keyword = e.detail.value;
    console.log('搜索订单:', keyword);
    
    if (!keyword) {
      // 如果搜索词为空，显示所有订单
      this.setData({
        orderList: this.data.originalOrderList
      });
      return;
    }
    
    // 搜索订单号、服务名称或状态
    const filteredOrders = this.data.originalOrderList.filter(order => {
      return order.orderId.toLowerCase().includes(keyword.toLowerCase()) || 
             order.serviceName.toLowerCase().includes(keyword.toLowerCase()) ||
             order.orderStatus.includes(keyword);
    });
    
    this.setData({
      orderList: filteredOrders
    });
    
    // 提示搜索结果
    wx.showToast({
      title: `找到 ${filteredOrders.length} 个订单`,
      icon: 'none'
    });
  }
})