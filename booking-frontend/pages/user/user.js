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
    console.log('获取到的userInfo:', userInfo || null)
    if (userInfo) {
      // 确保积分、优惠券、收藏有默认值
      const updatedUserInfo = {
        ...userInfo,
        points: userInfo.points || 100,
        coupons: userInfo.coupons || 1,
        collections: userInfo.collections || 0
      }
      console.log('更新后的userInfo:', updatedUserInfo)
      this.setData({
        userInfo: updatedUserInfo,
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

  // 跳转到个人资料页面，处理 "更多" 按钮的点击
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
    
    // 检查profile页面是否存在并完善
    try {
      wx.navigateTo({
        url: '/pages/user/profile/profile',
        fail: (err) => {
          console.error('导航到个人资料页面失败:', err);
          wx.showToast({
            title: '个人资料页面正在开发中',
            icon: 'none'
          })
        }
      })
    } catch (err) {
      console.error('跳转到个人资料页面出错:', err);
      wx.showToast({
        title: '个人资料页面暂不可用',
        icon: 'none'
      })
    }
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