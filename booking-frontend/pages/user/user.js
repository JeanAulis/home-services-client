Page({
  data: {
    userInfo: {},
    isLogin: false
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        isLogin: true
      })
    } else {
      this.setData({
        userInfo: {},
        isLogin: false
      })
    }
  },

  // 跳转到登录页
  goLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 跳转到个人资料
  goProfile() {
    if (!this.data.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        this.goLogin()
      }, 1000)
      return
    }
    wx.navigateTo({
      url: '/pages/user/profile/profile'
    })
  },

  // 跳转到积分页面
  goPoints() {
    if (!this.data.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        this.goLogin()
      }, 1000)
      return
    }
    wx.navigateTo({
      url: '/pages/user/points/points'
    })
  },

  // 跳转到优惠券页面
  goCoupons() {
    if (!this.data.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        this.goLogin()
      }, 1000)
      return
    }
    wx.navigateTo({
      url: '/pages/user/coupons/coupons'
    })
  },

  // 跳转到收藏页面
  goCollection() {
    if (!this.data.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        this.goLogin()
      }, 1000)
      return
    }
    wx.navigateTo({
      url: '/pages/user/collection/collection'
    })
  },

  // 跳转到地址管理
  goAddress() {
    if (!this.data.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        this.goLogin()
      }, 1000)
      return
    }
    wx.navigateTo({
      url: '/pages/user/address/address'
    })
  },

  // 跳转到设置页面
  goSetting() {
    if (!this.data.isLogin) {
      this.goLogin()
      return
    }
    wx.navigateTo({
      url: '/pages/user/setting/setting'
    })
  },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的用户信息
          wx.removeStorageSync('userInfo')
          // 刷新当前页面状态
          this.setData({
            userInfo: {},
            isLogin: false
          })
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  }
}) 