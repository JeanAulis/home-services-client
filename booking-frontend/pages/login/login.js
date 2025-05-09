Page({
  data: {
    user_num: '',
    user_passwd: '',
    user_name: '',
    user_email: ''
  },
  onInputUserNum(e) {
    this.setData({ user_num: e.detail.value });
  },
  onInputUserPasswd(e) {
    this.setData({ user_passwd: e.detail.value });
  },
  onInputUserName(e) {
    this.setData({ user_name: e.detail.value });
  },
  onInputUserEmail(e) {
    this.setData({ user_email: e.detail.value });
  },
  onLogin() {
    // 验证输入
    if (!this.data.user_num || !this.data.user_passwd) {
      wx.showToast({ 
        title: '请输入完整信息', 
        icon: 'none' 
      });
      return;
    }
    
    wx.request({
      url: 'http://localhost:8080/api/user/login',
      method: 'POST',
      data: {
        userNum: this.data.user_num,
        userName: this.data.user_num,
        userEmail: this.data.user_num,
        userPasswd: this.data.user_passwd
      },
      success: res => {
        if (res.data.code === 200) {
          // 存储用户信息到本地
          wx.setStorageSync('userInfo', res.data.data);
          wx.showToast({ title: '登录成功', icon: 'success' });
          
          // 获取当前页面栈
          const pages = getCurrentPages();
          if (pages.length > 1) {
            // 如果有上一页，则返回上一页
            wx.navigateBack({
              delta: 1
            });
          } else {
            // 如果没有上一页，则跳转到首页
            wx.switchTab({
              url: '/pages/index/index'
            });
          }
        } else {
          wx.showToast({ title: res.data.msg || '登录失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ 
          title: '网络错误，请稍后再试', 
          icon: 'none' 
        });
      }
    });
  },
  goRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  }
})