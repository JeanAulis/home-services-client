Page({
  data: {
    permissions: [
      { id: 1, name: '位置信息', desc: '用于获取您的位置以提供就近服务', status: true },
      { id: 2, name: '通讯录', desc: '用于快速添加联系人信息', status: false },
      { id: 3, name: '相机', desc: '用于拍摄或上传图片', status: true },
      { id: 4, name: '相册', desc: '用于选择照片上传', status: true },
      { id: 5, name: '通知', desc: '用于接收订单状态和活动消息', status: true }
    ]
  },

  onLoad() {
    // 可以从系统获取实际权限状态
  },
  
  // 切换权限状态
  togglePermission(e) {
    const index = e.currentTarget.dataset.index;
    const key = `permissions[${index}].status`;
    const newStatus = !this.data.permissions[index].status;
    
    this.setData({
      [key]: newStatus
    });
    
    // 这里可以添加实际的权限申请或撤销逻辑
    wx.showToast({
      title: newStatus ? '已开启权限' : '已关闭权限',
      icon: 'success'
    });
  }
}) 