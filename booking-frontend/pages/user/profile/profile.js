Page({
  data: {
    userInfo: {}
  },
  
  onLoad(options) {
    this.getUserInfo();
  },
  
  onShow() {
    this.getUserInfo();
  },
  
  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
  }
}) 