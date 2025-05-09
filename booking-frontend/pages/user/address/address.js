Page({
  data: {
    addresses: [],
    isLoading: true
  },

  onLoad() {
    this.fetchAddresses()
  },
  
  onShow() {
    this.fetchAddresses()
  },
  
  // 从服务器获取地址数据
  fetchAddresses() {
    this.setData({ isLoading: true })
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.userNum) {
      this.setData({ 
        addresses: [],
        isLoading: false
      })
      return
    }
    
    wx.request({
      url: 'http://localhost:8080/api/address/list',
      method: 'GET',
      data: {
        userNum: userInfo.userNum
      },
      success: res => {
        console.log('获取地址列表响应:', res.data)
        if (res.data.code === 200) {
          this.setData({
            addresses: res.data.data || []
          })
        } else {
          wx.showToast({
            title: res.data.msg || '获取地址失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('获取地址列表失败:', err)
        wx.showToast({
          title: '网络错误，请稍后再试',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ isLoading: false })
      }
    })
  },
  
  // 新增地址
  addAddress() {
    wx.navigateTo({
      url: '/pages/user/address/edit/edit'
    })
  },
  
  // 编辑地址
  editAddress(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/user/address/edit/edit?id=${id}`
    })
  },
  
  // 删除地址
  deleteAddress(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定要删除该地址吗？',
      success: (res) => {
        if (res.confirm) {
          const userInfo = wx.getStorageSync('userInfo')
          if (!userInfo || !userInfo.userNum) {
            wx.showToast({
              title: '请先登录',
              icon: 'none'
            })
            return
          }
          
          wx.showLoading({ title: '删除中...' })
          
          // 调用服务器接口删除地址
          wx.request({
            url: 'http://localhost:8080/api/address/delete',
            method: 'POST',
            data: {
              addressId: id,
              userNum: userInfo.userNum
            },
            success: res => {
              if (res.data.code === 200) {
                // 删除成功后重新获取地址列表
                this.fetchAddresses()
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
              } else {
                wx.showToast({
                  title: res.data.msg || '删除失败',
                  icon: 'none'
                })
              }
            },
            fail: err => {
              console.error('删除地址失败:', err)
              wx.showToast({
                title: '网络错误，请稍后再试',
                icon: 'none'
              })
            },
            complete: () => {
              wx.hideLoading()
            }
          })
        }
      }
    })
  },
  
  // 设为默认地址
  setDefault(e) {
    const id = e.currentTarget.dataset.id
    const addresses = this.data.addresses.map(address => {
      return {
        ...address,
        isDefault: address.id === id
      }
    })
    
    this.setData({ addresses })
    // 保存到本地存储
    wx.setStorageSync('addressList', addresses)
    wx.showToast({
      title: '设置成功',
      icon: 'success'
    })
  }
}) 