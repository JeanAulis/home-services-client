Page({
  data: {
    addressId: null,
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    region: ['广东省', '广州市', '天河区'],
    isDefault: false,
    isEdit: false,
    isSubmitting: false
  },

  onLoad(options) {
    console.log('编辑地址页面接收到的参数:', options);
    
    if (options.id) {
      // 编辑现有地址
      this.setData({
        addressId: options.id,
        isEdit: true
      })
      this.fetchAddressDetail(options.id)
    } else {
      console.log('新增地址模式');
    }
  },
  
  // 隐藏页面时确保loading被关闭
  onHide() {
    wx.hideLoading()
  },
  
  // 卸载页面时确保loading被关闭
  onUnload() {
    wx.hideLoading()
  },
  
  // 获取地址详情
  fetchAddressDetail(addressId) {
    console.log('开始获取地址详情, ID:', addressId);
    
    if (!addressId) {
      wx.showToast({
        title: '地址ID无效',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack()
      }, 1000);
      return;
    }
    
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
      url: 'http://localhost:8080/api/address/get',
      method: 'GET',
      data: {
        id: parseInt(addressId),
        userNum: userInfo.userNum
      },
      success: res => {
        if (res.data.code === 200) {
          const address = res.data.data
          console.log('获取到的地址详情:', address)
          this.setData({
            addressId: address.id,
            name: address.receiverName || address.name || '', // 兼容两种可能的字段名
            phone: address.phone || '',
            province: address.province || '',
            city: address.city || '',
            district: address.district || '',
            detail: address.detail || '',
            isDefault: address.isDefault || false,
            region: [
              address.province || '广东省', 
              address.city || '广州市', 
              address.district || '天河区'
            ]
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
    this.setData({ detail: e.detail.value })
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
  
  // 默认地址开关事件
  onDefaultChange(e) {
    this.setData({
      isDefault: e.detail.value
    })
  },
  
  // 保存地址
  saveAddress() {
    // 防止重复提交
    if (this.data.isSubmitting) {
      return
    }
    
    // 设置提交状态，防止重复点击
    this.setData({ isSubmitting: true })
    
    // 表单验证
    if (!this.data.name) {
      wx.showToast({ title: '请输入收货人姓名', icon: 'none' })
      this.setData({ isSubmitting: false })
      return
    }
    
    if (!this.data.phone) {
      wx.showToast({ title: '请输入联系电话', icon: 'none' })
      this.setData({ isSubmitting: false })
      return
    }
    
    // 简单的手机号验证
    const phoneReg = /^1\d{10}$/
    if (!phoneReg.test(this.data.phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' })
      this.setData({ isSubmitting: false })
      return
    }
    
    if (!this.data.province || !this.data.city || !this.data.district) {
      wx.showToast({ title: '请选择所在地区', icon: 'none' })
      this.setData({ isSubmitting: false })
      return
    }
    
    if (!this.data.detail) {
      wx.showToast({ title: '请输入详细地址', icon: 'none' })
      this.setData({ isSubmitting: false })
      return
    }
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.userNum) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      this.setData({ isSubmitting: false })
      return
    }
    
    // 显示loading
    wx.showLoading({ title: '保存中...' })
    
    try {
      // 构建请求数据
      const addressData = {
        userNum: userInfo.userNum,
        receiverName: this.data.name,
        phone: this.data.phone,
        province: this.data.province,
        city: this.data.city,
        district: this.data.district,
        detail: this.data.detail.trim(),
        isDefault: this.data.isDefault
      }
      
      // 调试输出
      console.log('准备提交的地址数据:', addressData)
      
      // 如果是编辑模式，添加地址ID
      if (this.data.isEdit && this.data.addressId) {
        addressData.id = parseInt(this.data.addressId) || 0;
        console.log('编辑模式，添加id:', addressData.id);
      }
      
      // 发送请求
      wx.request({
        url: this.data.isEdit ? 
          'http://localhost:8080/api/address/update' : 
          'http://localhost:8080/api/address/add',
        method: 'POST',
        data: addressData,
        header: {
          'content-type': 'application/json' // 确保发送JSON格式数据
        },
        success: res => {
          console.log('地址保存响应:', res.data) // 添加调试信息
          if (res.data.code === 200) {
            // 隐藏loading
            wx.hideLoading()
            
            wx.showToast({
              title: this.data.isEdit ? '更新成功' : '添加成功',
              icon: 'success'
            })
            // 返回上一页
            setTimeout(() => {
              wx.navigateBack()
            }, 1000)
          } else {
            // 隐藏loading
            wx.hideLoading()
            
            wx.showToast({
              title: res.data.msg || (this.data.isEdit ? '更新失败' : '添加失败'),
              icon: 'none'
            })
          }
        },
        fail: err => {
          // 隐藏loading
          wx.hideLoading()
          
          console.error('保存地址失败:', err)
          wx.showToast({
            title: '网络错误，请稍后再试',
            icon: 'none'
          })
        },
        complete: () => {
          // 不管成功还是失败，都重置提交状态
          this.setData({ isSubmitting: false })
        }
      })
    } catch (error) {
      // 确保出现异常时也关闭loading并重置状态
      wx.hideLoading()
      this.setData({ isSubmitting: false })
      
      console.error('保存地址出现异常:', error)
      wx.showToast({
        title: '系统错误，请稍后再试',
        icon: 'none'
      })
    }
  }
}) 