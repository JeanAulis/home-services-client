Page({
  data: {
    permissions: [
      { id: 1, name: '位置信息', desc: '用于获取您的位置以提供就近服务', status: false },
      { id: 2, name: '通讯录', desc: '用于快速添加联系人信息', status: false },
      { id: 3, name: '相机', desc: '用于拍摄或上传图片', status: false },
      { id: 4, name: '相册', desc: '用于选择照片上传', status: false },
      { id: 5, name: '通知', desc: '用于接收订单状态和活动消息', status: false }
    ]
  },

  onLoad() {
    this.checkPermissions()
  },

  // 检查各项权限状态
  checkPermissions() {
    wx.getSetting({
      success: (res) => {
        const authSetting = res.authSetting
        
        // 创建一个新的权限数组，确保所有未明确授权的权限默认为false
        const permissions = this.data.permissions.map(permission => {
          let permissionStatus = false;
          
          switch(permission.id) {
            case 1: // 位置信息
              permissionStatus = authSetting['scope.userLocation'] === true;
              break;
            case 2: // 通讯录
              permissionStatus = authSetting['scope.addressBook'] === true;
              break;
            case 3: // 相机
              permissionStatus = authSetting['scope.camera'] === true;
              break;
            case 4: // 相册
              permissionStatus = authSetting['scope.writePhotosAlbum'] === true;
              break;
            case 5: // 通知
              permissionStatus = authSetting['scope.notifications'] === true;
              break;
          }
          
          return {
            ...permission,
            status: permissionStatus
          };
        });
        
        this.setData({ permissions });
      }
    });
  },
  
  // 切换权限状态
  togglePermission(e) {
    const index = e.currentTarget.dataset.index;
    const permission = this.data.permissions[index];
    
    if (permission.status) {
      // 如果当前是开启状态，则关闭权限
      this.setData({
        [`permissions[${index}].status`]: false
      });
      wx.showToast({
        title: '已关闭权限',
        icon: 'success'
      });
    } else {
      // 如果当前是关闭状态，则申请权限
      switch(permission.id) {
        case 1: // 位置信息
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              this.setData({
                [`permissions[${index}].status`]: true
              });
              wx.showToast({
                title: '已开启位置权限',
                icon: 'success'
              });
            },
            fail: () => {
              this.setData({
                [`permissions[${index}].status`]: false
              });
              wx.showModal({
                title: '提示',
                content: '需要您授权位置信息才能使用此功能',
                showCancel: false
              });
            }
          });
          break;
        case 2: // 通讯录
          wx.authorize({
            scope: 'scope.addressBook',
            success: () => {
              this.setData({
                [`permissions[${index}].status`]: true
              });
              wx.showToast({
                title: '已开启通讯录权限',
                icon: 'success'
              });
            },
            fail: () => {
              this.setData({
                [`permissions[${index}].status`]: false
              });
              wx.showModal({
                title: '提示',
                // content: '需要您授权通讯录才能使用此功能',
                content: '此功能暂未开放！',
                showCancel: false
              });
            }
          });
          break;
        case 3: // 相机
          wx.authorize({
            scope: 'scope.camera',
            success: () => {
              this.setData({
                [`permissions[${index}].status`]: true
              });
              wx.showToast({
                title: '已开启相机权限',
                icon: 'success'
              });
            },
            fail: () => {
              this.setData({
                [`permissions[${index}].status`]: false
              });
              wx.showModal({
                title: '提示',
                content: '需要您授权相机才能使用此功能',
                showCancel: false
              });
            }
          });
          break;
        case 4: // 相册
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              this.setData({
                [`permissions[${index}].status`]: true
              });
              wx.showToast({
                title: '已开启相册权限',
                icon: 'success'
              });
            },
            fail: () => {
              this.setData({
                [`permissions[${index}].status`]: false
              });
              wx.showModal({
                title: '提示',
                content: '需要您授权相册才能使用此功能',
                showCancel: false
              });
            }
          });
          break;
        case 5: // 通知
          wx.authorize({
            scope: 'scope.notifications',
            success: () => {
              this.setData({
                [`permissions[${index}].status`]: true
              });
              wx.showToast({
                title: '已开启通知权限',
                icon: 'success'
              });
            },
            fail: () => {
              this.setData({
                [`permissions[${index}].status`]: false
              });
              wx.showModal({
                title: '提示',
                // content: '需要您授权通知才能使用此功能',
                content: '此功能暂未开放！',
                showCancel: false
              });
            }
          });
          break;
      }
    }
  }
}) 