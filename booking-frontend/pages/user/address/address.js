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
  
  // 隐藏页面时确保loading被关闭
  onHide() {
    wx.hideLoading()
  },
  
  // 卸载页面时确保loading被关闭
  onUnload() {
    wx.hideLoading()
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
          // 打印接收到的数据类型和内容
          console.log('地址列表数据类型:', typeof res.data.data)
          console.log('地址列表详细内容:', JSON.stringify(res.data.data))
          
          // 确保每个地址对象都有addressId字段
          let addresses = (res.data.data || []).map(addr => {
            if (!addr.addressId && addr.id) {
              addr.addressId = addr.id; // 如果没有addressId但有id字段，则使用id
            }
            return addr;
          });
          
          // 对地址列表进行排序，默认地址置顶
          addresses = this.sortAddresses(addresses);
          
          this.setData({
            addresses: addresses
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
  
  // 对地址列表排序，默认地址置顶
  sortAddresses(addresses) {
    if (!addresses || !addresses.length) {
      return [];
    }
    
    console.log('排序前地址列表:', addresses);
    
    // 使用稳定排序，将默认地址排在前面
    const sortedAddresses = addresses.sort((a, b) => {
      if ((a.isDefault === true) === (b.isDefault === true)) {
        // 如果默认状态相同，保持原有顺序
        return 0;
      }
      // 默认地址排在前面
      return (a.isDefault === true) ? -1 : 1;
    });
    
    console.log('排序后地址列表:', sortedAddresses);
    return sortedAddresses;
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
    console.log('准备编辑地址，ID:', id)
    wx.navigateTo({
      url: `/pages/user/address/edit/edit?id=${id}`
    })
  },
  
  // 删除地址
  deleteAddress(e) {
    const id = e.currentTarget.dataset.id
    const numericId = parseInt(id) || 0; // 确保ID为数字类型
    
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
          
          // 调用服务器接口删除地址 - 使用表单格式提交参数
          wx.request({
            url: 'http://localhost:8080/api/address/delete',
            method: 'POST',
            data: {
              id: numericId,  // 使用id而不是addressId
              userNum: userInfo.userNum
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: res => {
              console.log('删除地址响应:', res.data)
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
    console.log('设置默认地址ID:', id);
    
    if (!id) {
      wx.showToast({
        title: '地址ID无效',
        icon: 'none'
      });
      return;
    }
    
    const numericId = parseInt(id) || 0; // 确保ID为数字类型
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.userNum) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({ title: '设置中...' })
    
    // 调用服务器接口设置默认地址
    wx.request({
      url: 'http://localhost:8080/api/address/set-default',
      method: 'POST',
      data: {
        id: numericId,
        userNum: userInfo.userNum
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: res => {
        console.log('设置默认地址响应:', res.data)
        if (res.data.code === 200) {
          // 重新获取地址列表并排序
          this.fetchAddresses()
          wx.showToast({
            title: '设置成功',
            icon: 'success'
          })
        } else {
          wx.showToast({
            title: res.data.msg || '设置失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('设置默认地址失败:', err)
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
}) 