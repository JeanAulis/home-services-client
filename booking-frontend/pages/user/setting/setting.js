Page({
  data: {
    isLogin: false,
    cacheSize: '0.00'
  },

  onLoad() {
    this.checkLoginStatus()
    this.getCacheSize()
  },

  onShow() {
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        isLogin: true
      })
    } else {
      this.setData({
        isLogin: false
      })
    }
  },

  // 获取缓存大小（模拟）
  getCacheSize() {
    this.setData({
      cacheSize: (Math.random() * 10).toFixed(2)
    })
  },

  // 前往隐私政策
  goPrivacy() {
    wx.navigateTo({
      url: '/pages/user/privacy/privacy'
    })
  },

  // 前往权限管理
  goPermission() {
    wx.navigateTo({
      url: '/pages/user/permission/permission'
    })
  },

  // 清除缓存
  clearCache() {
    wx.showLoading({
      title: '清除中...',
    })
    
    setTimeout(() => {
      wx.hideLoading()
      this.setData({
        cacheSize: '0.00'
      })
      wx.showToast({
        title: '清除成功',
        icon: 'success'
      })
    }, 1000)
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的用户信息
          wx.removeStorageSync('userInfo')
          
          this.setData({
            isLogin: false
          })
          
          // 跳转到登录页
          wx.reLaunch({
            url: '/pages/login/login'
          })
        }
      }
    })
  }
}) 