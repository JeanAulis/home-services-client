Page({
  data: {
    addressId: null,
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detailAddress: '',
    region: ['广东省', '广州市', '天河区'],
    isEdit: false,
    isSubmitting: false
  },

  onLoad(options) {
    if (options.id) {
      // 编辑现有地址
      this.setData({
        addressId: options.id,
        isEdit: true
      })
      this.fetchAddressDetail(options.id)
    }
  },
  
  // 获取地址详情
  fetchAddressDetail(addressId) {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.userNum) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
      return
    }
    
    wx.showLoading({ title: '加载中...' })
    
    wx.request({
      url: 'http://localhost:8080/api/address/detail',
      method: 'GET',
      data: {
        addressId: addressId,
        userNum: userInfo.userNum
      },
      success: res => {
        if (res.data.code === 200) {
          const address = res.data.data
          this.setData({
            name: address.name,
            phone: address.phone,
            province: address.province,
            city: address.city,
            district: address.district,
            detailAddress: address.detailAddress,
            region: [address.province, address.city, address.district]
          })
        } else {
          wx.showToast({
            title: res.data.msg || '获取地址详情失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('获取地址详情失败:', err)
        wx.showToast({
          title: '网络错误，请稍后再试',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  
  // 输入框事件处理
  onNameInput(e) {
    this.setData({ name: e.detail.value })
  },
  
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },
  
  onDetailAddressInput(e) {
    this.setData({ detailAddress: e.detail.value })
  },
  
  // 地区选择器事件
  onRegionChange(e) {
    this.setData({
      region: e.detail.value,
      province: e.detail.value[0],
      city: e.detail.value[1],
      district: e.detail.value[2]
    })
  },
  
  // 保存地址
  saveAddress() {
    // 表单验证
    if (!this.data.name) {
      wx.showToast({ title: '请输入收货人姓名', icon: 'none' })
      return
    }
    
    if (!this.data.phone) {
      wx.showToast({ title: '请输入联系电话', icon: 'none' })
      return
    }
    
    // 简单的手机号验证
    const phoneReg = /^1\d{10}$/
    if (!phoneReg.test(this.data.phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' })
      return
    }
    
    if (!this.data.province || !this.data.city || !this.data.district) {
      wx.showToast({ title: '请选择所在地区', icon: 'none' })
      return
    }
    
    if (!this.data.detailAddress) {
      wx.showToast({ title: '请输入详细地址', icon: 'none' })
      return
    }
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.userNum) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    this.setData({ isSubmitting: true })
    wx.showLoading({ title: '保存中...' })
    
    // 构建请求数据
    const addressData = {
      userNum: userInfo.userNum,
      name: this.data.name,
      phone: this.data.phone,
      province: this.data.province,
      city: this.data.city,
      district: this.data.district,
      detailAddress: this.data.detailAddress
    }
    
    // 如果是编辑模式，添加地址ID
    if (this.data.isEdit && this.data.addressId) {
      addressData.addressId = this.data.addressId
    }
    
    // 发送请求
    wx.request({
      url: this.data.isEdit ? 
        'http://localhost:8080/api/address/update' : 
        'http://localhost:8080/api/address/add',
      method: 'POST',
      data: addressData,
      success: res => {
        if (res.data.code === 200) {
          wx.showToast({
            title: this.data.isEdit ? '更新成功' : '添加成功',
            icon: 'success'
          })
          // 返回上一页
          setTimeout(() => {
            wx.navigateBack()
          }, 1000)
        } else {
          wx.showToast({
            title: res.data.msg || (this.data.isEdit ? '更新失败' : '添加失败'),
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('保存地址失败:', err)
        wx.showToast({
          title: '网络错误，请稍后再试',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ isSubmitting: false })
        wx.hideLoading()
      }
    })
  }
}) 